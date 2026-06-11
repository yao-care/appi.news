#!/usr/bin/env python3
"""
修復遷移時把 JSON-LD 灌進 description / excerpt 的文章。

僅處理「description 內含 schema.org / @context / 以 { 起頭」的問題文章；
以該文章自身的第一段實質內文作為描述（非捏造），截至句末、約 150 字內。
可重複執行。
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ART_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "articles"
FM_RE = re.compile(r"^(---\n)(.*?)(\n---\n)(.*)$", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
NAV_RE = re.compile(r"(立即閱讀|查看比較|看常見問題|目錄|點此|按鈕|↓|閱讀重點|跳至)")
BROKEN_RE = re.compile(r'^description:\s*"\s*\{|@context|schema\.org|"@type"', re.MULTILINE)


def para_text(p: str) -> str:
    t = TAG_RE.sub("", p)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def derive(body: str) -> str | None:
    paras = re.findall(r"<p>(.*?)</p>", body, re.DOTALL)
    buf = ""
    for raw in paras:
        t = para_text(raw)
        if len(t) < 12 or NAV_RE.search(t):
            continue
        if re.search(r'"@type"|"@context"|@type＂|schema\.org', t) or t.lstrip().startswith("{"):
            continue  # 跳過遷移誤植的 JSON-LD 段落
        buf = (buf + " " + t).strip() if buf else t
        if len(buf) >= 60:
            break
    if not buf:
        return None
    if len(buf) <= 155:
        return buf
    # 截至 155 字內最後一個句末標點
    cut = buf[:155]
    m = list(re.finditer(r"[。！？]", cut))
    return (cut[: m[-1].end()] if m else cut.rstrip() + "…")


def set_field(fm: str, key: str, value: str) -> str:
    safe = value.replace('"', "＂")
    line = f'{key}: "{safe}"'
    pat = re.compile(rf'^{key}:.*$', re.MULTILINE)
    return pat.sub(line, fm, count=1) if pat.search(fm) else fm


def main() -> int:
    n = 0
    skipped = []
    for path in sorted(ART_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        if not m:
            continue
        open_, fm, close, body = m.groups()
        dm = re.search(r'^description:\s*"(.*)"\s*$', fm, re.MULTILINE)
        if not dm or not re.search(r'^\s*\{|@context|schema\.org|"@type"', dm.group(1)):
            continue
        desc = derive(body)
        if not desc:
            skipped.append(path.stem)
            continue
        fm = set_field(fm, "description", desc)
        if re.search(r"^excerpt:", fm, re.MULTILINE):
            fm = set_field(fm, "excerpt", desc)
        path.write_text(open_ + fm + close + body, encoding="utf-8")
        n += 1
    print(f"fix-descriptions: {n} 篇描述已修復", f"(無法自動推導: {skipped})" if skipped else "")
    return 0


if __name__ == "__main__":
    sys.exit(main())
