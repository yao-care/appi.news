#!/usr/bin/env python3
"""
一次性內文清理：移除 WordPress 遷移殘留的「文末樣板」並修正標題語意。

移除項目（皆與站內元件重複，且含指向舊網域的失效連結）：
  - 「分享這篇文章」+ Facebook / LINE / X 分享連結（已由 ShareButtons 元件提供）
  - 「用 AI 聊這篇文章」+ ChatGPT / Claude / Gemini 連結（連結指向失效舊網址）
  - 內文免責聲明（已由 DisclaimerBox 元件提供）
  - 「最後審閱：…｜審閱者：…」內部維護字樣
  - 重複的作者簡介區塊（已由 AuthorBioBox 元件提供）

保留項目：
  - 參考文獻 / 參考資料區塊（真實學術引用）—— 若位於被裁切的文末區，會被搬回正文末端保留。

標題修正：
  - 去除 <h2>/<h3>/<h4> 內多餘的 <strong>（標題本身已是粗體），並合併被切斷的 <strong>。

可重複執行（idempotent）。
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ART_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "articles"

FM_RE = re.compile(r"^(---\n.*?\n---\n)(.*)$", re.DOTALL)

# 參考文獻區塊「標題」位置（涵蓋 <p>/<h2-4>、含/不含 <strong>、後接「：（依註號統整）」等）。
# 要求 參考 後緊接 文獻/資料/來源，避免誤判「參考 JiaJiaGo 的數據…」這類句子。
REFS_RE = re.compile(r"(?:<p>|<h[234]>)\s*(?:<strong>)?\s*參考(?:文獻|資料|來源)")

# 文末樣板的「起點」標記（出現其一即視為文末區開始）。涵蓋 <p>、<strong>、裸文字三種遷移格式。
TAIL_MARKERS = [
    r"<h[234]>\s*CΛ\s*/\s*Lightman\s*</h[234]>",
    r"<h[234]>\s*羅揚｜",
    r"<h[234]>[^<]*草本上膳醫廚",
    r"<h[234]>[^<]*黃子彥[^<]*</h[234]>",
    r"(?:<h[234]>\s*|<p>\s*|^)\s*作者與編輯資訊",
    r"<h[234]>[^<]*關於作者[^<]*</h[234]>",
    r"(?:<em>|<h[234]>)\s*記者\s",
    r"(?:<p>\s*)?<strong>\s*本文作者",
    r"<p>\s*本文作者",
    r"(?:<p>\s*)?<strong>\s*總編輯",
    r"<p>\s*編輯：<a",
    r"<h[234]>\s*聯繫我們",
    r"<p>\s*最後審閱",
    r"<p>\s*分享這篇文章\s*</p>",
    r"<p>\s*用 AI 聊",
    r"(?:<p>\s*(?:<strong>)?|<strong>)\s*免責聲明",
]
TAIL_RE = re.compile("|".join(TAIL_MARKERS), re.MULTILINE)

# 殘留的裸分享 / AI 連結（保險用，全文清除）
BARE_LINK_RE = re.compile(
    r'\n?<a\s+href="https?://[^"]*'
    r'(?:facebook\.com/sharer|social-plugins\.line\.me|twitter\.com/intent|'
    r'chat\.openai\.com|claude\.ai/new|gemini\.google\.com)'
    r'[^"]*"[^>]*>.*?</a>',
    re.DOTALL,
)

# 標題內的 <strong> / </strong>
HEAD_RE = re.compile(r"(<h[234]>)(.*?)(</h[234]>)", re.DOTALL)


def clean_headings(body: str) -> str:
    def repl(m: re.Match) -> str:
        inner = m.group(2).replace("<strong>", "").replace("</strong>", "")
        return m.group(1) + inner + m.group(3)
    return HEAD_RE.sub(repl, body)


def strip_tail(body: str) -> str:
    # 參考文獻一律是文章最後一節，故以其標題位置為界：refs 之後（含）全部保留。
    refs_m = REFS_RE.search(body)
    refs_pos = refs_m.start() if refs_m else None

    cut_m = TAIL_RE.search(body)
    if cut_m:
        cut = cut_m.start()
        if refs_pos is not None and refs_pos > cut:
            # 參考文獻被夾在文末樣板裡 → 保留 refs 到結尾，砍掉樣板
            body = body[:cut].rstrip() + "\n\n" + body[refs_pos:]
        else:
            # 參考文獻在樣板之前（或沒有）→ 直接砍掉樣板到結尾
            body = body[:cut]

    # 保險：清掉任何殘留裸分享/AI 連結
    body = BARE_LINK_RE.sub("", body)

    # 去尾端孤立 <hr> 與多餘空白
    body = re.sub(r"(?:\s*<hr\s*/?>\s*)+$", "\n", body)
    body = body.rstrip() + "\n"
    return body


def has_refs(body: str) -> bool:
    return REFS_RE.search(body) is not None


def main() -> int:
    n_tail = n_head = 0
    no_refs = []
    for path in sorted(ART_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        m = FM_RE.match(text)
        if not m:
            continue
        fm, body = m.group(1), m.group(2)

        new_body = clean_headings(body)
        if new_body != body:
            n_head += 1
        before = new_body
        new_body = strip_tail(new_body)
        if new_body != before:
            n_tail += 1

        if not has_refs(new_body):
            no_refs.append(path.stem)

        new_text = fm + new_body
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
    print(f"clean-bodies: headings cleaned in {n_head}, tail trimmed in {n_tail}")
    print(f"articles WITHOUT references (待補來源清單): {len(no_refs)}")
    (ART_DIR.parent.parent.parent / "docs" / "content-todo-no-references.txt").write_text(
        "\n".join(no_refs) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
