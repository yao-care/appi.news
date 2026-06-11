#!/usr/bin/env python3
"""
將內文既有的「重點摘要 / 本文重點」清單抽取到 frontmatter 的 highlights[]，
使其顯示於文章開頭的「本文重點」區（利於讀者與 AI 摘要），並移除內文重複區塊。

只在「標題後緊接 <ul>/<ol> 清單」時抽取（作者原文，非生成）；抽不到就保持原樣。
在 clean-bodies.py 之後執行。可重複執行。
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ART_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "articles"
FM_RE = re.compile(r"^(---\n)(.*?)(\n---\n)(.*)$", re.DOTALL)

# 重點摘要標題 + 緊接的清單（heading 在 clean-bodies 後已無 <strong>）
BLOCK_RE = re.compile(
    r"(?:\s*<hr\s*/?>\s*)?"
    r"<(h[234])>\s*(?:重點摘要|本文重點|重點整理|懶人包重點|快速結論|核心重點)\s*</\1>\s*"
    r"<(ul|ol)>(.*?)</\2>"
    r"(?:\s*<hr\s*/?>\s*)?",
    re.DOTALL,
)
LI_RE = re.compile(r"<li>(.*?)</li>", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")


def li_to_text(li: str) -> str:
    t = TAG_RE.sub("", li)
    t = re.sub(r"\s+", " ", t).strip()
    return t.replace('"', "＂")  # 避免破壞 YAML 雙引號


def has_highlights(fm: str) -> bool:
    return re.search(r"^highlights:", fm, re.MULTILINE) is not None


def main() -> int:
    n = 0
    for path in sorted(ART_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        if not m:
            continue
        open_, fm, close, body = m.groups()
        if has_highlights(fm):
            continue  # 已有就不覆寫
        bm = BLOCK_RE.search(body)
        if not bm:
            continue
        items = [li_to_text(x) for x in LI_RE.findall(bm.group(3))]
        items = [x for x in items if 4 <= len(x) <= 120]
        if not (2 <= len(items) <= 8):
            continue
        # 從內文移除重複區塊
        new_body = body[: bm.start()] + "\n\n" + body[bm.end():]
        new_body = re.sub(r"\n{3,}", "\n\n", new_body)
        # 去除因移除頂部摘要而留下的開頭孤立 <hr>
        new_body = re.sub(r"^\s*(?:<hr\s*/?>\s*)+", "", new_body).strip() + "\n"
        # 寫入 frontmatter（接在 tags 之後，否則結尾）
        block = "highlights:\n" + "".join(f'  - "{x}"\n' for x in items)
        if re.search(r"^tags:.*$", fm, re.MULTILINE):
            new_fm = re.sub(r"^(tags:.*)$", r"\1\n" + block.rstrip(), fm,
                            count=1, flags=re.MULTILINE)
        else:
            new_fm = fm.rstrip() + "\n" + block.rstrip()
        path.write_text(open_ + new_fm + close + new_body, encoding="utf-8")
        n += 1
    print(f"extract-highlights: {n} articles got highlights[] from inline 重點摘要")
    return 0


if __name__ == "__main__":
    sys.exit(main())
