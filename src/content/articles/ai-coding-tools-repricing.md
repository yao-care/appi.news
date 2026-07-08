---
title: "一個月內又改名又改計價：Windsurf 變 Devin Desktop，Cursor 與 Copilot 同步轉用量收費"
slug: "ai-coding-tools-repricing"
description: "2026 年 6 月，Windsurf 被 Cognition 收進 Devin 品牌改名 Devin Desktop，Cursor 改 Teams 計價、Copilot 全面轉用量計費。三件事撞在同一個月不是巧合，是 coding 工具在把上游 token 的真實成本傳導回你身上。團隊該重新看的不是月費，是可攜性與鎖定風險。"
excerpt: "為什麼你天天在用的三款 coding 工具，會在一個月內一起改名、改計價？因為吃到飽月費本來就是補貼，補貼正在收。真正要決定的不是哪家便宜，而是你有沒有隨時走人的能力。"
publishDate: "2026-07-19T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["AI coding 工具", "Devin Desktop", "Cursor", "GitHub Copilot", "用量計價"]
coverImage: "covers/ai-coding-tools-repricing.webp"
coverAlt: "程式開發者的編輯器畫面，象徵 AI coding 工具一個月內接連改名與改計價"
coverImageCredit: "Photo by Ilya Pavlov on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "2026 年 6 月一個月內，Windsurf 被 Cognition 改名 Devin Desktop、Cursor 改 Teams 計價、GitHub Copilot 全面轉用量計費，三件事撞在同一段時間不是巧合。"
  - "這些工具不訓練模型，多半轉賣上游模型的 token；吃到飽月費是搶市場的補貼，現在補貼在收，看到的不是漲價名目，是把真實成本傳導回買方。"
  - "團隊真正要決定的不是這個月哪家最便宜，而是把 AI coding 工具當變動成本編預算，並優先選支援開放協定（ACP、MCP）、能換模型與編輯器的組合，壓低被單一廠商綁住的風險。"
references:
  - title: "Windsurf is now Devin Desktop"
    url: "https://devin.ai/blog/windsurf-is-now-devin-desktop/"
    publisher: "Cognition / Devin"
  - title: "Improvements to Teams Pricing"
    url: "https://cursor.com/blog/teams-pricing-june-2026"
    publisher: "Cursor"
  - title: "GitHub Copilot is moving to usage-based billing"
    url: "https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/"
    publisher: "The GitHub Blog"
  - title: "All GitHub Copilot plans are now on usage-based billing [FAQ]"
    url: "https://github.com/orgs/community/discussions/197089"
    publisher: "GitHub Community"
originalContribution: "本文把 2026 年 6 月三起看似無關的 coding 工具事件（Windsurf 改名 Devin Desktop、Cursor 改 Teams 計價、Copilot 轉用量計費）並置比對，指出共同根因是『轉賣上游 token 的補貼在收』，並以『你不控制工具的成本基礎，所以該決策的是可攜性而非月費』為框架，給台灣開發團隊三步可執行的因應。"
---

一個月內，三款你天天在用的 coding 工具一起動了：Windsurf 改名叫 Devin Desktop，Cursor 改了 Teams 計價，GitHub Copilot 全面轉成用量計費。這不是三家各自巧合，是同一件事在發生：這些工具轉賣的是上游模型的 token，過去那種吃到飽月費本來就是搶市場的補貼，現在補貼在收。對團隊來說，真正要決定的不是「這個月哪家最便宜」，而是先認清一件事，你根本不控制這些工具的成本基礎。

<img src="/covers/ai-coding-tools-repricing.webp" width="1200" height="801" loading="lazy" decoding="async" alt="程式開發者的編輯器畫面，象徵 AI coding 工具一個月內接連改名與改計價">

先把三件事講清楚。6 月 2 日，Cognition [把 Windsurf 改名成 Devin Desktop](https://devin.ai/blog/windsurf-is-now-devin-desktop/)，原本的本地 agent Cascade 換成用 Rust 從頭重寫的 Devin Local，官方說方案、價格、外掛都不變，只是換個外觀，Cascade 可以用到 7 月 1 日過渡。Cursor 6 月[更新 Teams 計價](https://cursor.com/blog/teams-pricing-june-2026)：標準席位維持月付 40 美元（年付 32 美元），新增一個 Premium 席位月付 120 美元，用量拆成「Composer/Auto」和「第三方 API」兩個池子，新客戶即時生效、續約客戶 7 月 1 日起套用。GitHub Copilot 則在 6 月 1 日[全面轉成用量計費](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)，訂閱底價沒動（Pro 每月 10 美元、Pro+ 39 美元），改用「AI Credits」按 token 扣，程式碼補全仍免費、不吃額度。

<img src="/images/ai-coding-tools-repricing-s1.webp" width="960" height="639" loading="lazy" decoding="async" alt="軟體訂閱方案與筆電程式碼畫面，象徵三款工具同月改名改價">

為什麼會擠在同一個月？追下去，根因不在哪一家特別貪心，而在這些工具的本質。它們自己不訓練大模型，多數是把 Anthropic、OpenAI 的模型包一層介面轉賣。當市場還在搶用戶，吃到飽月費是划算的獲客補貼，反正那時候大家用得也還沒那麼兇。等到 agent 模式普及，每一次自動改程式碼、跑一輪 repository 掃描，背後都真的燒掉一疊 token，補貼就撐不住了。所以你看到的不是「漲價」這個名目，是計價模式從「固定訂閱」被迫轉成「你用掉多少上游算力，就付多少」。

<img src="/images/ai-coding-tools-repricing-s2.webp" width="960" height="1439" loading="lazy" decoding="async" alt="上升的成本與計算機，象徵吃到飽補貼結束、token 成本浮現">

用量計費本身沒有錯，它把誘因對齊了：用得多就付得多，這比一個人吃到飽拖垮所有人合理。但它同時做了一件事，把「變異」丟回買方身上。以前月費可預測，一個月就那個數字；現在帳單跟著用量抖，重度 agent 使用者的支出可能翻上好幾倍。Copilot 的設計就很典型：內含的 AI Credits 用完之後，[你要嘛升級到更高方案拿更多額度，要嘛按量付費繼續跑](https://github.com/orgs/community/discussions/197089)。對個人開發者，這是小錢；對要編年度預算、要跟財務交代的團隊，這是麻煩。這裡要看清楚的是：你買的不再是一個固定成本的工具，是一個變動成本的輸入。

<img src="/images/ai-coding-tools-repricing-s3.webp" width="960" height="721" loading="lazy" decoding="async" alt="計量錶，象徵用量計價把成本變異丟回買方">

改名這件事本身也是訊號，別當成純美化。Windsurf 是先被 Cognition 併掉、再收進 Devin 品牌，這是產業整併。你把整條開發工作流程綁死在單一廠商，那家被併、改名、改計價，你都只能接受，因為換工具的成本已經高到走不了。真正的避險不是挑對某一家，是可攜性。這輪 Devin Desktop 同時推了 Agent Client Protocol（ACP），一個開放協定，讓 agent 能跨編輯器跑。我先前寫[OpenCode 反壓商業 IDE](/articles/opencode-overtakes-commercial-ide/)、寫[MCP 成 AI agent 事實標準](/articles/mcp-de-facto-standard-agent-governance/)，講的都是同一條線：開放協定、跟模型無關的介面，才是把選擇權留在自己手上的方法。工具會改名會漲價，協定不會綁架你。

<img src="/images/ai-coding-tools-repricing-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="相互連接的接頭與線材，象徵開放協定帶來的可攜性與抗鎖定">

那台灣的團隊該怎麼做？這幾款工具是很多本地新創與工程團隊的日常，不是可有可無的玩具。三件事明天早上就能開始。第一，把 AI coding 工具當變動成本編進預算，設用量上限跟告警，別再當成一筆固定月費放著不管。第二，優先選支援開放協定（ACP、MCP）、能換模型、能換編輯器的組合，讓自己隨時有 B 方案，而不是被單一廠商的計價牌卡住。第三，把「這個月誰便宜」從選型的主軸拿掉，改問一個更重要的問題：要把它換掉，我要花多少力氣。這個問題的答案，才決定你在下一次改名改價時是被動接受還是從容切換。

<img src="/images/ai-coding-tools-repricing-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="團隊在白板前規劃，象徵把 AI coding 工具當變動成本編入預算">

這一個月的改名與改價，是 coding 工具市場在替自己重新定價。看懂的人不會忙著比月費，而是先確認一件事：自己有沒有隨時走人的能力。

<h2>常見問題</h2>

<p><strong>Windsurf 改名成 Devin Desktop 之後，我原本的訂閱和外掛還能用嗎？</strong><br>可以。Cognition 表示這是一次 OTA 更新，方案、價格、外掛與其他功能都維持不變，只是換了外觀與品牌。舊的本地 agent Cascade 可以繼續用到 2026 年 7 月 1 日做過渡，之後由用 Rust 重寫的 Devin Local 接手。細節見<a href="https://devin.ai/blog/windsurf-is-now-devin-desktop/">官方公告</a>。</p>

<p><strong>Cursor 和 Copilot 這次是變貴了嗎？</strong><br>訂閱的名目底價大多沒漲，Copilot Pro 仍是每月 10 美元、Pro+ 39 美元，<a href="https://cursor.com/blog/teams-pricing-june-2026">Cursor 標準 Teams 席位</a>仍是月付 40 美元。但兩家都轉成用量計費，重度使用 agent 功能的人，實際支出很可能上升，因為那些功能吃掉的 token 最多。</p>

<p><strong>GitHub Copilot 的 AI Credits 用完會怎樣？</strong><br>額度用完後有兩條路：升級到更高方案拿更多內含額度，或按量付費繼續在原方案使用，系統會依方案設支出上限。程式碼補全與 Next Edit 建議仍免費、不消耗 AI Credits。說明見 <a href="https://github.com/orgs/community/discussions/197089">GitHub 官方社群 FAQ</a>。</p>

<p><strong>面對工具一直改名改價，團隊該怎麼選？</strong><br>別只比這個月的月費。優先挑支援開放協定（如 ACP、MCP）、能換底層模型、能換編輯器的工具，把移轉成本壓低，並把用量成本編進預算、設上限。這樣下一次改名或改計價時，你才有從容切換的餘地，而不是被綁著只能接受。</p>
