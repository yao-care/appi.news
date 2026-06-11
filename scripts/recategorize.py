#!/usr/bin/env python3
"""
一次性內容校正：修正 WordPress 遷移造成的分類/子分類/標籤錯置。

背景：遷移時把幾乎所有文章塞進 health/preventive、標籤填入垃圾值 "gcm"。
本腳本依「標題與內容」重新指派最精準的 category + subcategory，並清掉垃圾標籤。

對應分類體系見 src/config/categories.ts（此處 mapping 必須與其 slug 一致）。
可重複執行（idempotent）。
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ART_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "articles"

# wp-id -> (category, subcategory)
MAP: dict[str, tuple[str, str]] = {
    "wp-6":   ("sports",    "events"),
    "wp-26":  ("sports",    "events"),
    "wp-29":  ("focus",     "today"),
    "wp-32":  ("health",    "tcm"),
    "wp-35":  ("lifestyle", "consumer"),
    "wp-63":  ("finance",   "industry"),
    "wp-66":  ("health",    "tcm"),
    "wp-97":  ("tech",      "startup"),
    "wp-125": ("health",    "nutrition"),
    "wp-134": ("health",    "preventive"),
    "wp-143": ("health",    "medical"),
    "wp-146": ("health",    "preventive"),
    "wp-154": ("tech",      "ai"),
    "wp-181": ("lifestyle", "culture"),
    "wp-183": ("finance",   "business-model"),
    "wp-185": ("sports",    "sports-science"),
    "wp-187": ("finance",   "business-model"),
    "wp-188": ("tech",      "ai"),
    "wp-190": ("tech",      "ai"),
    "wp-192": ("tech",      "ai"),
    "wp-194": ("tech",      "ai"),
    "wp-196": ("tech",      "ai"),
    "wp-198": ("lifestyle", "culture"),
    "wp-202": ("tech",      "ai"),
    "wp-206": ("tech",      "ai"),
    "wp-208": ("tech",      "ai"),
    "wp-210": ("tech",      "ai"),
    "wp-212": ("finance",   "business-model"),
    "wp-213": ("tech",      "ai"),
    "wp-215": ("tech",      "ai"),
    "wp-217": ("tech",      "ai"),
    "wp-219": ("tech",      "ai"),
    "wp-247": ("health",    "supplement-compliance"),
    "wp-249": ("health",    "tcm"),
    "wp-256": ("health",    "preventive"),
    "wp-260": ("health",    "tcm"),
    "wp-264": ("health",    "tcm"),
    "wp-268": ("health",    "nutrition"),
    "wp-273": ("health",    "nutrition"),
    "wp-278": ("tech",      "ai"),
    "wp-280": ("tech",      "ai"),
    "wp-282": ("tech",      "ai"),
    "wp-284": ("health",    "medical"),
    "wp-289": ("health",    "preventive"),
    "wp-293": ("health",    "preventive"),
    "wp-294": ("society",   "public-issues"),
    "wp-295": ("health",    "preventive"),
    "wp-296": ("health",    "nutrition"),
    "wp-297": ("health",    "nutrition"),
    "wp-298": ("health",    "nutrition"),
    "wp-299": ("health",    "nutrition"),
    "wp-300": ("health",    "nutrition"),
    "wp-301": ("health",    "nutrition"),
    "wp-302": ("health",    "preventive"),
    "wp-303": ("health",    "medical"),
    "wp-304": ("health",    "preventive"),
    "wp-305": ("health",    "medical"),
    "wp-306": ("health",    "preventive"),
    "wp-307": ("health",    "medical"),
    "wp-310": ("lifestyle", "consumer"),
    "wp-315": ("health",    "medical"),
    "wp-321": ("tech",      "ai"),
    "wp-329": ("health",    "preventive"),
    "wp-335": ("health",    "tcm"),
    "wp-340": ("health",    "nutrition"),
    "wp-342": ("health",    "medical"),
    "wp-344": ("sports",    "sports-health"),
    "wp-346": ("health",    "tcm"),
    "wp-348": ("health",    "medical"),
    "wp-354": ("health",    "tcm"),
    "wp-371": ("health",    "preventive"),
    "wp-372": ("health",    "preventive"),
    "wp-377": ("health",    "nutrition"),
    "wp-383": ("health",    "preventive"),
    "wp-384": ("health",    "medical"),
    "wp-386": ("health",    "nutrition"),
    "wp-391": ("tech",      "security"),
    "wp-393": ("health",    "medical"),
    "wp-401": ("health",    "medical"),
    "wp-407": ("focus",     "trends"),
    "wp-410": ("health",    "nutrition"),
    "wp-414": ("health",    "preventive"),
    "wp-415": ("lifestyle", "consumer"),
    "wp-420": ("health",    "tcm"),
    "wp-426": ("health",    "medical"),
    "wp-428": ("health",    "medical"),
    "wp-430": ("health",    "medical"),
    "wp-432": ("health",    "medical"),
    "wp-434": ("health",    "medical"),
    "wp-436": ("health",    "medical"),
    "wp-438": ("health",    "medical"),
    "wp-442": ("health",    "medical"),
    "wp-443": ("health",    "nutrition"),
    "wp-476": ("health",    "nutrition"),
    "wp-482": ("health",    "tcm"),
    "wp-484": ("health",    "tcm"),
    "wp-487": ("health",    "medical"),
    "wp-495": ("health",    "nutrition"),
    "wp-500": ("health",    "medical"),
    "wp-505": ("tech",      "ai"),
    "wp-513": ("health",    "nutrition"),
    "wp-544": ("health",    "medical"),
    "wp-546": ("health",    "medical"),
    "wp-548": ("health",    "medical"),
    "wp-551": ("health",    "nutrition"),
    "wp-553": ("health",    "nutrition"),
    "wp-555": ("health",    "preventive"),
    "wp-557": ("health",    "preventive"),
    "wp-559": ("health",    "medical"),
    "wp-561": ("health",    "medical"),
    "wp-563": ("health",    "nutrition"),
    "wp-565": ("health",    "medical"),
    "wp-567": ("health",    "medical"),
    "wp-569": ("health",    "medtech"),
    "wp-571": ("health",    "medtech"),
    "wp-572": ("tech",      "ai"),
    "wp-574": ("tech",      "ai"),
    "wp-577": ("tech",      "ai"),
    "wp-580": ("health",    "medical"),
    "wp-582": ("tech",      "security"),
    "wp-584": ("health",    "medical"),
    "wp-588": ("health",    "medical"),
    "wp-590": ("health",    "preventive"),
    "wp-593": ("health",    "preventive"),
    "wp-595": ("health",    "supplement-compliance"),
    "wp-597": ("tech",      "ai"),
    "wp-599": ("health",    "medical"),
    "wp-601": ("health",    "medical"),
    "wp-603": ("health",    "nutrition"),
    "wp-611": ("health",    "tcm"),
    "wp-616": ("health",    "medtech"),
    "wp-617": ("lifestyle", "culture"),
}

# 子分類 slug -> 中文名（用於空標籤時補一個有意義的標籤）
SUB_ZH = {
    "today": "今日焦點", "trends": "重大趨勢", "analysis": "專題分析",
    "medical": "醫療", "preventive": "預防醫學", "tcm": "中醫", "nutrition": "營養",
    "medtech": "醫療科技", "health-policy": "健康政策", "supplement-compliance": "保健食品",
    "ai": "AI", "digital-tools": "數位工具", "security": "資安", "startup": "新創",
    "industry": "產業", "investing": "投資", "business-model": "商業模式", "market": "市場觀察",
    "public-issues": "公共議題", "policy": "政策",
    "events": "賽事", "sports-science": "運動科學", "sports-health": "運動健康",
    "consumer": "消費", "culture": "文化",
}

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def set_field(fm: str, key: str, value: str) -> str:
    """設定或新增 frontmatter 欄位（字串值，加引號）。"""
    line = f'{key}: "{value}"'
    pat = re.compile(rf"^{key}:.*$", re.MULTILINE)
    if pat.search(fm):
        return pat.sub(line, fm, count=1)
    # 沒有就接在 category 後面（或結尾）
    if re.search(r"^category:.*$", fm, re.MULTILINE):
        return re.sub(r"^(category:.*)$", r"\1\n" + line, fm, count=1, flags=re.MULTILINE)
    return fm.rstrip() + "\n" + line


def clean_tags(fm: str, sub: str) -> str:
    """移除垃圾標籤 'gcm'；若清空則補子分類中文名。"""
    m = re.search(r"^tags:\s*(\[.*?\])\s*$", fm, re.MULTILINE)
    if not m:
        return fm
    raw = m.group(1)
    items = re.findall(r'"([^"]*)"', raw)
    items = [t for t in items if t.strip().lower() != "gcm" and t.strip()]
    if not items:
        zh = SUB_ZH.get(sub)
        items = [zh] if zh else []
    new = "[" + ", ".join(f'"{t}"' for t in items) + "]"
    return re.sub(r"^tags:.*$", f"tags: {new}", fm, count=1, flags=re.MULTILINE)


def main() -> int:
    changed = 0
    missing = []
    for path in sorted(ART_DIR.glob("*.md")):
        wp_id = path.stem
        if wp_id not in MAP:
            missing.append(wp_id)
            continue
        cat, sub = MAP[wp_id]
        text = path.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        if not m:
            print(f"!! no frontmatter: {path.name}")
            continue
        fm = m.group(1)
        fm = set_field(fm, "category", cat)
        fm = set_field(fm, "subcategory", sub)
        fm = clean_tags(fm, sub)
        new_text = f"---\n{fm}\n---\n" + text[m.end():]
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            changed += 1
    print(f"recategorize: {changed} files updated, {len(missing)} unmapped")
    if missing:
        print("  unmapped:", ", ".join(missing))
    return 0


if __name__ == "__main__":
    sys.exit(main())
