---
title: "Palo Alto 推 Prisma AIRS 3.0 主打 agent 全生命週期防護：資安開始把 agent 當獨立資產在管"
slug: "prisma-airs-agent-security-lifecycle"
description: "Palo Alto Networks 3/23 推出 Prisma AIRS 3.0，把防護範圍從『AI 說了什麼』延伸到『AI 做了什麼』，涵蓋 agent 的盤點、風險評估、紅隊演練到執行期防護。真正的訊號是資安界開始把 AI agent 當成要給身分、要追責的獨立資產在管。"
excerpt: "為什麼一套 agent 資安平台值得台灣企業看懂？因為它把問題重新定義了：風險不在 agent 講錯話，而在它拿著權限去認證、呼叫工具、存取資料。這是身分與授權問題，不是內容過濾問題。"
publishDate: "2026-07-31T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["AI agent 資安", "Prisma AIRS", "Palo Alto Networks", "非人身分", "agent 治理"]
coverImage: "covers/prisma-airs-agent-security-lifecycle.webp"
coverAlt: "象徵把 AI agent 當獨立資產納入資安防護的抽象數位安全示意"
coverImageCredit: "Photo by Pixabay on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Prisma AIRS 3.0（3/23 發布）把防護從『AI 說了什麼』延伸到『AI 做了什麼』，覆蓋 agent 的盤點、風險評估、AI 紅隊演練到執行期防護，還替每個 agent 指派可追責的治理身分。"
  - "這則發布真正的訊號是分類轉向：資安界開始把 AI agent 當成一個要盤點、要給權限、要追責的獨立資產在管，而不是某個 app 底下的一個功能。"
  - "買平台解不了根因。Okta 調查顯示只有 34% 的組織對 agent 套用和員工同一套資安控管；台灣企業要做的第一步不是選廠牌，是給每個 agent 最小權限與稽核軌跡。"
references:
  - title: "Securing the AI Enterprise: Introducing Prisma AIRS 3.0"
    url: "https://www.paloaltonetworks.com/blog/2026/03/prisma-airs-3-0-autonomous-ai/"
    publisher: "Palo Alto Networks Blog"
  - title: "Palo Alto Networks Secures Agentic AI with Prisma AIRS 3.0"
    url: "https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-0"
    publisher: "Palo Alto Networks"
  - title: "Palo Alto Networks' Prisma AIRS 3.0 closes visibility gaps in autonomous AI systems"
    url: "https://www.helpnetsecurity.com/2026/03/24/palo-alto-networks-prisma-airs-3-0-closes-visibility-gaps-in-autonomous-ai-systems/"
    publisher: "Help Net Security"
  - title: "Palo Alto Networks Secures Agentic AI with Prisma AIRS 3.0 (PANW Stock News)"
    url: "https://www.stocktitan.net/news/PANW/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-em8tyohmpfld.html"
    publisher: "StockTitan"
  - title: "AI Agents at Work 2026: Securing the agentic enterprise"
    url: "https://www.okta.com/newsroom/articles/ai-agents-at-work-2026-agentic-enterprise-security/"
    publisher: "Okta"
originalContribution: "本文以『解對題 vs 解錯題』框架重讀 Prisma AIRS 3.0：不把它當功能清單看，而是指出它把 agent 資安問題從內容過濾（AI 說了什麼）重新定義為身分與授權（AI 做了什麼），並交叉 Okta 治理落差數據，論證買平台解不了根因，最後給台灣企業可在明天早上執行的最小權限與盤點步驟。"
---

Prisma AIRS 3.0 這則發布，真正的訊號不是又一套資安產品，而是資安界開始把 AI agent 當成一個要盤點、要給身分、要追責的獨立資產在管，不再是某個 app 底下的一個功能。3 月 23 日，Palo Alto Networks 推出 [Prisma AIRS 3.0](https://www.paloaltonetworks.com/blog/2026/03/prisma-airs-3-0-autonomous-ai/)，把防護範圍從「AI 說了什麼」延伸到「AI 做了什麼」。這個分類上的轉向，比產品本身的任何一條功能都重要。

<img src="/covers/prisma-airs-agent-security-lifecycle.webp" width="1200" height="800" loading="lazy" decoding="async" alt="象徵把 AI agent 當獨立資產納入資安防護的抽象數位安全示意">

先看它實際做了什麼。Palo Alto 把整套東西拆成三段生命週期：先「發現」，跨雲端、SaaS 與端點把散落各處的 agent、模型與連線[盤點出來，包括傳統工具看不到的那些](https://www.stocktitan.net/news/PANW/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-em8tyohmpfld.html)；再「評估」，掃 agent 的架構弱點，用 AI 紅隊演練模擬帶情境的攻擊；最後「防護」，靠一個目前還在限量預覽的 AI Agent Gateway 當控制平面，管 agent 的工具呼叫、模型存取與對外連線。它點名的威脅也不是傳統那幾種，而是[工具濫用、記憶竄改、對抗式指令](https://www.paloaltonetworks.com/blog/2026/03/prisma-airs-3-0-autonomous-ai/)這些 agent 專屬的攻擊面。

<img src="/images/prisma-airs-agent-security-lifecycle-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="集中式控制平面監看與治理各處 AI agent 的示意">

但這裡要先踩一個剎車，把問題層次分清楚，不然很容易看成「又一套加了 AI 標籤的防火牆」。過去一年講 agent 資安，多半在講 prompt injection、講怎麼過濾模型的輸入輸出，也就是盯著「AI 講了什麼」。這個方向沒有錯，但如果只做到這一步，就是在解錯題。真正的風險不在 agent 講了一句不該講的話，而在它拿著一組憑證，去[認證系統、呼叫 API、存取資料、替你把一連串任務做完](https://www.helpnetsecurity.com/2026/03/24/palo-alto-networks-prisma-airs-3-0-closes-visibility-gaps-in-autonomous-ai-systems/)。Help Net Security 的說法很精準：多數企業盯得住 AI 說什麼，卻對 AI 做什麼是全盲的。

<img src="/images/prisma-airs-agent-security-lifecycle-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="工程師檢視程式與系統存取紀錄，象徵關注 agent 實際動作而非話語">

一旦把問題從「內容」搬到「動作」，正確的解法就浮出來了：這是身分與授權問題，不是內容過濾問題。所以 Prisma AIRS 3.0 最關鍵的一步，是替每個 agent [指派一個受治理的身分、綁定精確權限、讓每個動作都可歸戶、可追責](https://www.paloaltonetworks.com/blog/2026/03/prisma-airs-3-0-autonomous-ai/)。這其實是把管人類帳號那一套（你是誰、能碰什麼、做過什麼留下紀錄）搬到 agent 身上。同樣的治理焦慮我在寫 [MCP 成為 agent 事實標準後企業要治理什麼](/articles/mcp-de-facto-standard-agent-governance/)時就談過：當 agent 能自己串工具、跨系統動手，治理的對象就不再是模型，而是這個會動的身分。Palo Alto 這次把它產品化了。

<img src="/images/prisma-airs-agent-security-lifecycle-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="機器人手與人手,象徵把 AI agent 當成要給身分與權限管理的獨立資產">

問題定義對了，不代表買一套平台就解得了。可信度靠的是落地流程，不是靠買到哪個牌子的工具。Okta 一份 2026 年的調查戳破了這層落差：只有 [34% 的組織對它的 agent 勞動力，套用和人類員工同一套資安控管](https://www.okta.com/newsroom/articles/ai-agents-at-work-2026-agentic-enterprise-security/)；換句話說三分之二的公司，讓 agent 用著遠超實際需要的權限在系統裡跑。同一份調查裡，58% 的高階主管坦承過去一年出過 AI 相關的資安事件或險些出事，52% 的員工承認在沒核准的情況下就用起 AI 工具。這些數字說明一件事：agent 資安的根因是組織治理的紀律缺口，不是缺一套產品。盤點沒做、最小權限沒設、稽核軌跡沒留，買再貴的 Gateway 也只是把混亂裝進一個更漂亮的儀表板。

<img src="/images/prisma-airs-agent-security-lifecycle-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業團隊在會議室討論治理政策,象徵 agent 資安的根因是組織紀律">

還得再踩一個剎車：這套東西目前很大一部分還是願景，不是現貨。核心的 AI Agent Gateway [還在限量預覽](https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-0)，端點那一塊的 Agentic Endpoint Security 要等 Palo Alto [併購 Koi Security 案完成後](https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-0)才補得齊。市場的反應也留了餘地：發布當天 [PANW 股價還跌了 4.17%](https://www.stocktitan.net/news/PANW/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-em8tyohmpfld.html)，限量預覽加上功能得靠併購來補，短期內投資人買不太下手。方向是對的，成品還在路上，這兩件事要分開看。

<img src="/images/prisma-airs-agent-security-lifecycle-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="產品藍圖與時程規劃示意,象徵 Prisma AIRS 3.0 仍有部分功能待補">

那台灣企業該從這則新聞讀出什麼？現在很多公司正在急著把 agent 塞進客服、ERP 自動化、內部知識查詢，但心態上還是把它當成「多了一個會辦事的功能」，而不是「多了一個有帳號、有權限、會自己動手的員工」。這個心態差一步，資安就差很多。不必等某家廠商的平台上市才動：可以明天早上就做的，是先把公司裡已經在跑的 agent 盤點出來，找出那些沒人報備就接上生產系統的影子 agent；給每個 agent 一組獨立身分而不是共用一把萬能金鑰，權限收到剛好夠用；把它呼叫了什麼工具、碰了哪些資料留成稽核軌跡。廠牌可以晚點再選，這三件事本來就該做，而且和買不買 Prisma AIRS 無關。

<img src="/images/prisma-airs-agent-security-lifecycle-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="台北城市街景與商業大樓,象徵台灣企業導入 AI agent 的在地場景">

把 agent 當獨立資產在管，這個分類轉向遲早會變成企業資安的預設。Palo Alto 這次是把它寫進產品規格書，讓「agent 要有身分、要盤點、要追責」從概念變成可以採購的品項。但看懂它的意義，不在記住 Prisma AIRS 3.0 這個型號，而在認清一件事：你導入的每一個 agent，都是一個握著權限、會替你動手、也可能替你闖禍的獨立身分。先把這件事當真，工具才接得住。

<h2>常見問題</h2>

<p><strong>Prisma AIRS 3.0 到底解決什麼問題？</strong><br>它把 AI agent 資安從「過濾 AI 說了什麼」延伸到「管住 AI 做了什麼」。功能上分三段：跨雲端、SaaS 與端點[盤點所有 agent](https://www.stocktitan.net/news/PANW/palo-alto-networks-secures-agentic-ai-with-prisma-airs-3-em8tyohmpfld.html)、持續評估風險與做 AI 紅隊演練、再用一個控制平面在執行期管 agent 的工具呼叫與身分。核心是替每個 agent 指派可追責的身分。</p>

<p><strong>為什麼說 agent 資安是身分問題，不是內容過濾問題？</strong><br>因為真正的風險不是 agent 講錯一句話，而是它拿著憑證去認證系統、呼叫 API、存取資料、自己把任務做完。[企業多半盯得住 AI 說什麼，卻對 AI 做什麼是全盲的](https://www.helpnetsecurity.com/2026/03/24/palo-alto-networks-prisma-airs-3-0-closes-visibility-gaps-in-autonomous-ai-systems/)。要管住「做什麼」，靠的是身分、權限與稽核，不是輸出過濾。</p>

<p><strong>買了這類平台，agent 資安就沒問題了嗎？</strong><br>不會。根因是組織治理紀律，不是缺產品。Okta 調查顯示只有 [34% 的組織對 agent 套用和員工同一套資安控管](https://www.okta.com/newsroom/articles/ai-agents-at-work-2026-agentic-enterprise-security/)。盤點沒做、最小權限沒設、稽核沒留，再貴的平台也只是把混亂裝進更漂亮的儀表板。</p>

<p><strong>台灣企業現在可以先做什麼？</strong><br>不必等平台上市。先盤點公司裡已在跑的 agent，揪出沒報備就接上生產系統的影子 agent；給每個 agent 獨立身分而非共用萬能金鑰，權限收到剛好夠用；把它呼叫了什麼工具、碰了哪些資料留成稽核軌跡。這三件事和買哪家產品無關，本來就該做。</p>
