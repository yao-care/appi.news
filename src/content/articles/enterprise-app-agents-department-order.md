---
title: "市場不再問『agent 是不是真的』，改問『哪個部門先被 agent 化』：Gartner 估 2026 年底 40% 企業 app 內建 agent"
slug: "enterprise-app-agents-department-order"
description: "Gartner 估 2026 年底 40% 企業應用內建任務型 agent，2025 年還不到 5%。市場焦點已從『agent 是不是真的』轉向『哪個部門先被 agent 化』；先被 agent 化的是客服到財務這條接單、查料、跑流程的線，真正的落差不是技術，是治理跟不上部署速度。"
excerpt: "Gartner 估 2026 年底 40% 企業 app 內建 agent，市場焦點從『agent 是不是真的』轉向『哪個部門先被 agent 化』；真正的落差不是技術，是治理跟不上部署速度。"
publishDate: "2026-06-29T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["企業 AI agent", "Gartner 預測", "agent 化部門排序", "AI 治理落差", "agent 權限問責"]
coverImage: "covers/enterprise-app-agents-department-order.webp"
coverAlt: "企業軟體內建任務型 AI agent 的趨勢轉折，市場開始排序哪個部門先被 agent 化"
coverImageCredit: "Photo by Luke Chesser on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "市場 2026 年中換了問題：從『agent 是不是真的』變成『哪個部門先被 agent 化』；Gartner 估 2026 年底 40% 企業 app 內建任務型 agent，2025 還不到 5%。"
  - "作者排序先被 agent 化的部門：客服、IT Service Desk、業務支援、人資、法務、財務，邏輯是這些部門本來就在接收請求、查資料、執行流程，本質就是 agent 工作。"
  - "對照 KPMG 全員部署與 Databricks 把 agent 當同事，真正的落差不是技術而是治理跟不上部署速度；每個 agent 都是新的權限與問責對象，先定義情境再開放。"
references:
  - title: "40% of Enterprise Apps Will Embed AI Agents by End of 2026, According to Gartner"
    url: "https://finance.yahoo.com/news/40-enterprise-apps-embed-ai-181310288.html"
    publisher: "Yahoo Finance（引述 Gartner 預測）"
  - title: "AI Agents News | June, 2026"
    url: "https://blog.mean.ceo/ai-agents-news-june-2026/"
    publisher: "blog.mean.ceo"
  - title: "AI Agents Market Size, Share and Growth Report"
    url: "https://www.precedenceresearch.com/ai-agents-market"
    publisher: "Precedence Research"
---

過去一年，關於 AI agent 的討論卡在一個問題：這東西是不是真的能用，還是又一輪炒作。2026 年中，這個問題悄悄換了。[blog.mean.ceo 六月的觀察](https://blog.mean.ceo/ai-agents-news-june-2026/)講得很白，這是市場停止問「AI agent 是不是真的」、開始問「我公司哪個部門先被 agent 化」的月份。撐起這個轉向的不只是氣氛。Gartner 給了一個量化訊號：[到 2026 年底，40% 的企業應用會內建任務型 agent，而 2025 年這個比例還不到 5%](https://finance.yahoo.com/news/40-enterprise-apps-embed-ai-181310288.html)，等於一年內翻了八倍。當採用率從個位數衝到四成，問題自然從「要不要用」變成「先用在哪」。

<img src="/images/enterprise-app-agents-department-order-s1.webp" width="960" height="638" loading="lazy" decoding="async" alt="市場焦點從 agent 是否真實轉向哪個部門先導入的趨勢轉折概念圖">

這個轉折值得寫，是因為它不是單一廠商的行銷話術。AWS、Google Cloud、微軟、GitHub、IBM、Databricks 現在描述 agent 的方式幾乎是同一套詞：有目標、有記憶、會規劃、能用工具、帶部分自主。[當這些彼此競爭的平台開始用同一套語言](https://blog.mean.ceo/ai-agents-news-june-2026/)，那不是巧合，是市場結構成形的訊號。詞彙一旦統一，採用門檻就掉下來。市場規模也跟著走，[AI agent 市場 2026 年估約 115.5 億美元，2025 年是 79.2 億](https://www.precedenceresearch.com/ai-agents-market)，年增四成以上。錢和語言都對齊的時候，agent 內建會變成軟體的預設配備，不是加購選項。

<img src="/images/enterprise-app-agents-department-order-s2.webp" width="960" height="539" loading="lazy" decoding="async" alt="雲端與軟體大廠用同一套語言描述 agent，象徵市場結構成形">

那哪些部門會先被 agent 化？我的排序是這樣：客服、IT Service Desk、業務支援、人資、法務、財務。原因很簡單。這些部門本來就在做三件事：接收請求、查資料、執行流程。這本質上就是 agent 的工作。客服每天接的就是「我的訂單呢」「怎麼退費」，查一下系統、走一段既定流程回覆，這幾乎是 agent 的標準題型，所以排第一。越往後，請求越不規則、判斷的後果越重；法務和財務不是不能 agent 化，是錯一步的代價高，會被排在後面。排序的邏輯不是技術難度，是「這個部門的工作有多像在接單、查料、跑流程」。

<img src="/images/enterprise-app-agents-department-order-s3.webp" width="940" height="627" loading="lazy" decoding="async" alt="客服與服務台本來就在接收請求、查資料、執行流程，最先被 agent 化">

但這裡要踩一個剎車。當 agent 內建變成預設，真正拉開差距的不是技術，是治理跟不跟得上部署速度。看兩個今年的例子就懂。[KPMG 把 Microsoft 365 Copilot 與 Agent 365 鋪給全球超過 27.6 萬名員工](/articles/kpmg-agent-365-workforce-governance/)，[Databricks 直接把 agent 講成能跑重複工作流的「同事」](/articles/databricks-genie-one-agent-governance/)。導入一個 agent，跟讓全公司同時用 agent，是兩種難度。部署可以一聲令下，治理沒辦法。當 27 萬人同時讓 agent 動到正式資料，權限、稽核、責任歸屬要一次到位，這件事比把 agent 裝起來難得多。

<img src="/images/enterprise-app-agents-department-order-s4.webp" width="960" height="675" loading="lazy" decoding="async" alt="部署速度遠快過治理速度的落差概念圖">

把部門排序和治理缺口疊在一起看，問題更清楚。agent 從客服往法務、財務一路往上爬的時候，權限的邊界和問責的歸屬同步變難。客服 agent 查錯訂單，頂多重查一次；財務 agent 自動跑錯一筆對帳、法務 agent 引錯一條條文，責任算誰的？[每一個會自己動作的 agent，都是一個新的權限治理對象](/articles/mcp-de-facto-standard-agent-governance/)，這在寫 MCP 那篇就講過。務實的做法是順序不能倒：[先定義這個 agent 要解的情境、誰用、碰得到哪張表，再決定開放範圍](/articles/what-is-claw-llm-client-tool/)。部署速度和治理速度之間的落差，要靠這種一格一格盤點來補，不是靠模型變聰明。

<img src="/images/enterprise-app-agents-department-order-s5.webp" width="960" height="641" loading="lazy" decoding="async" alt="agent 往高風險部門擴張時權限與問責缺口變大的概念圖">

最後講一件讓我蠻期待的事。當這些部門能力被做成 agent 內建進軟體，未來新創不就可以無痛擁有大型公司的資源了嗎？過去要養一整組客服、IT、法務、財務團隊才撐得起的規模，現在一個小團隊接上內建 agent 的軟體，就有了雛形。真是讓人期待呢。但話說回來，能用上不等於用得好。[可信度從來不是靠模型多聰明撐起來的，是靠落地流程](/articles/llm-healthcare-promise-limits/)。新創拿到的是大公司的工具，不是大公司踩過的坑。誰先把情境、權限、問責這三格盤清楚，誰才真的把這份資源變成自己的。

<img src="/images/enterprise-app-agents-department-order-s6.webp" width="960" height="540" loading="lazy" decoding="async" alt="新創有機會無痛取得大型公司等級部門資源的概念圖">
