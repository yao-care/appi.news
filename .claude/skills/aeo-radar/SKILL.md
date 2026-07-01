---
name: aeo-radar
description: APPI News 的 AEO/GEO 能見度探針。拿固定量表（7 分類非品牌題）逐題問 AI 引擎，量「appi.news 有沒有被引用、輸給哪些競品」，記回 geo-citation 帳本並發 dev 台摘要，供每日大腦層修正選題/格式策略。供 cron headless 呼叫（零 API 金鑰，用跑它的 Claude 自己的 web search 當引擎）。
---

# AEO/GEO 能見度探針（aeo-radar）

你是 APPI News 的**AI 引用能見度探針**。目的是回答一個問題:**當真人拿我們守備範圍的問題去問 AI,appi.news 會不會被端出來?輸給誰?** 全程繁體中文 + 台灣用語。

這量的是 **GEO/AEO(本站被 AI 引擎引用)**,與 GA 的「AI 轉介點擊(真人從 AI 答案點連結進站)」是兩回事,務必分清。閉環的帳本/趨勢引擎是 `scripts/geo-citation-audit.mjs`,本 skill 是它缺的「拿去問、記回來」執行者。

## 引擎與誠實邊界（先讀,別過度解讀數字）

- **引擎 = 跑本 skill 的這個 Claude 的 web search**(headless 走 claude-appi Sonnet)。engine 標籤一律填 `claude-websearch`。這是**零金鑰**做法;Claude 不是台灣最大的 AI 表面,只是一個乾淨、可持續跑的代表引擎。
- **retrieval ≠ 最終引用**:我們看的是「查得到、會被拿來當來源的連結」。連浮不出來就一定不會被引用,所以「沒浮出」是真訊號;但「浮出」不保證某個產品端一定引用。
- **WebSearch 偏美國區**:台灣站/來源可能被低估。查詢時盡量帶台灣語境(「台灣」「台股」等),但無法完全校正,判讀時記得這條。
- **站還年輕**:初期大機率到處 0 被引用,這本身就是決策訊號(見結尾)。

## 步驟 1:取固定量表

跑 `node scripts/geo-citation-audit.mjs questions curated`,得到 21 題(7 分類各 3,每題帶 `category`)。**用這份固定題庫,不要自己改題**——趨勢要可比較,題一變趨勢就斷。

## 步驟 2:逐題問引擎、蒐集引用連結

對每一題:

1. 用 **WebSearch**(必要時 WebFetch 補查)實際查這題,語境當作台灣讀者在問。
2. 像答案引擎那樣,挑出**你回答這題時真的會引用的來源連結**,依「顯著度/可信度」排序,取前 **5~8 條**。放原始 URL,不要改寫。
3. 記下這題的 `category`(來自步驟 1)與 `engine: "claude-websearch"`。

**只誠實列你真的會引用的來源**;查不到夠格來源就少列或留空,不要硬湊。

## 步驟 3:組 round.json 並記帳

寫 `/tmp/geo-round.json`(**item 只給 `citedUrls`+`category`,本站/競品的判定交給 record 自動算**,別自評 cited):

```jsonc
{
  "date": "<YYYY-MM-DD 台北>",
  "items": [
    { "question": "什麼是轉型金融?跟綠色金融差在哪?", "category": "finance",
      "engine": "claude-websearch",
      "citedUrls": ["https://pwc.tw/...", "https://cnyes.com/...", "https://appi.news/articles/..."] },
    { "question": "...", "category": "health", "engine": "claude-websearch", "citedUrls": ["..."] }
  ]
}
```

跑 `node scripts/geo-citation-audit.mjs record /tmp/geo-round.json` 寫進帳本(自動判本站被引用與命中的競品 domain)。
再跑 `node scripts/geo-citation-audit.mjs recent 30` 取趨勢摘要(含 `citedRate` / `byCategory` / `competitorShare`)。

## 步驟 4:發 dev 台摘要(給人 + 給大腦層)

把這輪重點組成一段 markdown,pipe 給 dev 頻道:

```bash
printf '%s' "$SUMMARY" | node scripts/cron-report.mjs --dev --stdin
```

摘要包含:
- 標題 `🔭 AEO 能見度探針 <日期>(claude-websearch,21 題)`
- **本站被引用:X / 21**;若 >0,列出被引用的題與連結(這是可對外談權威的素材,要凸顯)。
- **哪些 beat 完全隱形**(`byCategory` 裡 cited=0 的分類)、哪個 beat 有機會(有競品是媒體、且我們接近的)。
- **競品份額前幾名**(`competitorShare`):誰在這些題上被 AI 當權威,特別標出**商周 / 哈佛商業評論**有沒有上榜。
- 一句**這輪的行動指向**(例:「健康題康健穩定被引用、我們還沒擠進 → 健康線值得補一篇對準『中醫 AI』的深度稿」)。
- 結尾附誠實邊界一句(引擎=Claude web search、US 區偏差)。

## 收尾:這份數據要驅動什麼

本 skill 的產出**餵每日大腦層**(`brain-checkup.mjs` 會讀 `recent` 摘要)。判讀主軸:

- **全面 0 被引用** → AEO 現在不是槓桿,結論是「先衝收錄 + 在選定 beat 把權威內容/GEO 格式做起來」,別急著追這個數字。
- **某 beat 開始被引用** → 去看被引用那幾篇的共同點(結構、一手來源、結論前置),回饋成寫法準則,並在該 beat 加碼。
- **競品(尤其商周/HBR)在某主題穩定上榜、我們沒有** → 那是明確的「該攻的權威缺口」,轉成選題方向。

失敗(工具受限/查不到)→ 這輪降級略過,不擋其他自動線,並回報一則 dev 台說明。
