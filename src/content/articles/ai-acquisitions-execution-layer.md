---
title: "企業 AI 併購潮從『會建議』買到『會動手』：四樁交易把執行層搶進口袋"
slug: "ai-acquisitions-execution-layer"
description: "五月中到六月初，Asana 買 StackAI、Coupa 買 Rossum、Salesforce 簽下 Contentful、Vertice 併 Vendr，一個月四樁交易。買家搶的不是更聰明的模型，是讓 AI 的決定變成企業動作的那一層。台灣企業導入方與軟體廠都該看懂這波在買什麼。"
excerpt: "為什麼這波企業併購買的不是更聰明的 AI，而是會替你動手的 AI？因為會給建議的 AI 正在商品化，護城河退到『誰擁有 AI 動作落地的那一層』。"
publishDate: "2026-07-21T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["企業 AI 併購", "agentic AI", "AI 執行層", "企業軟體", "台灣 SaaS"]
coverImage: "covers/ai-acquisitions-execution-layer.webp"
coverAlt: "象徵企業軟體併購把 AI 執行層搶進口袋的商務交易示意"
coverImageCredit: "Photo by Kampus Production on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "五月中到六月初一個月內四樁交易：Asana 以 7500 萬美元買 StackAI、Coupa 併 Rossum、Salesforce 簽下 Contentful、Vertice 收 Vendr，買的都是讓 AI 動作落地的執行層，不是更聰明的模型。"
  - "會給建議的 AI 正在商品化，護城河退到垂直流程的資料與執行權：Rossum 的文件語料、Vendr 的 25 萬份談判合約、Contentful 的內容架構、StackAI 的跨系統連結，每一樣都是錢一次買不齊、要時間長出來的料。"
  - "AI 從會建議變成會動手，責任歸屬也一起搬進來；台灣企業導入時別被 demo 迷惑，該問誰擁有執行層與治理，軟體廠的機會在有專屬 domain 資料的垂直場景，不是包一層 LLM API。"
references:
  - title: "Asana acquires no-code agent-builder StackAI"
    url: "https://techcrunch.com/2026/05/28/asana-acquires-no-code-agent-builder-stack-ai/"
    publisher: "TechCrunch"
  - title: "Coupa Acquires Rossum to Accelerate End-to-End Autonomous Spend Management"
    url: "https://rossum.ai/company/newsroom/press-release-coupa-acquires-rossum/"
    publisher: "Rossum"
  - title: "Salesforce acquires Contentful to add a content layer to Agentforce"
    url: "https://thenextweb.com/news/salesforce-acquires-contentful-headless-cms-agentforce"
    publisher: "The Next Web"
  - title: "Vertice acquires Vendr to create the world's largest procurement intelligence dataset and lead autonomous AI negotiation"
    url: "https://www.prnewswire.com/news-releases/vertice-acquires-vendr-to-create-the-worlds-largest-procurement-intelligence-dataset-and-lead-autonomous-ai-negotiation-302786407.html"
    publisher: "PR Newswire"
  - title: "Recent Acquisitions Announcements Show Enterprise Software Vendors Are Buying the AI Execution Layer"
    url: "https://erp.today/enterprise-software-ai-acquisitions-execution-layer"
    publisher: "ERP Today"
  - title: "Agentic AI M&A: what is happening now?"
    url: "https://newmarketpitch.com/blogs/news/agentic-ai-ma-tracker"
    publisher: "New Market Pitch"
originalContribution: "本文把五月中到六月初四樁分散在不同新聞裡的企業軟體併購（Asana/StackAI、Coupa/Rossum、Salesforce/Contentful、Vertice/Vendr）串成同一條線，以『會建議 vs 會動手、護城河退到執行層與專屬資料』為分析框架，交叉 agentic AI 併購總量數據，並延伸為台灣企業導入方與軟體廠各自的判斷準則。"
---

企業 AI 的併購邏輯，這一個月換了主詞。買家不再搶「會給你建議」的 AI，改搶「會替你動手」的 AI。從五月中到六月初，Asana、Coupa、Salesforce、Vertice 四家在一個月內連環出手，買的都不是更聰明的模型，而是讓 AI 的決定能真的落成動作的那一層。真正的戰場不是誰的模型比較聰明，是誰握住「AI 的判斷變成企業動作」的那個交會點。

先把四樁交易攤開，會看到它們其實在買同一種東西。

Asana 五月二十八日[以 7500 萬美元買下無程式碼 agent 平台 StackAI](https://techcrunch.com/2026/05/28/asana-acquires-no-code-agent-builder-stack-ai/)，要的是「跨系統執行」的能力：讓 agent 能橫跨 Salesforce、Slack、Google 這些系統把複雜流程一路跑完，把 Asana 自己定位成「人與 AI 協作的作業系統」。Coupa 五月十二日[併下 AI 智慧文件處理公司 Rossum](https://rossum.ai/company/newsroom/press-release-coupa-acquires-rossum/)，用它自研的交易型語言模型把發票、單據讀進來，接進採購到付款的全流程，做所謂「自主支出管理」。Salesforce 六月一日[簽約收購無頭內容管理廠 Contentful](https://thenextweb.com/news/salesforce-acquires-contentful-headless-cms-agentforce)，補上 Agentforce 一直缺的「內容層」，讓 agent 能自己組裝、推送個人化內容，不必再走人工發布這一步。同一天，採購平台 Vertice [買下軟體議價公司 Vendr](https://www.prnewswire.com/news-releases/vertice-acquires-vendr-to-create-the-worlds-largest-procurement-intelligence-dataset-and-lead-autonomous-ai-negotiation-302786407.html)，把兩邊資料併成它宣稱全球最大的採購情報庫，超過 750 億美元間接支出、25 萬份談判合約，餵給它的議價 agent「Ana」，讓 AI 直接代替採購團隊去跟供應商殺價。

<img src="/images/ai-acquisitions-execution-layer-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業軟體併購簽約，象徵四家買家一個月內連環出手">

四個標的長得不一樣，做的事一樣：把 AI 從「輸出一段建議」推到「完成一件企業實際要辦的事」。

為什麼現在搶執行層？我的答案是：會給建議的 AI 正在商品化。摘要一份報告、推薦下一步該做什麼，這類能力現在誰都做得出八成像的東西，護城河很淺。真正難複製、也就值得花錢買的，是[讓 AI 的動作跨系統落地的那一層](https://erp.today/enterprise-software-ai-acquisitions-execution-layer)：資料、流程、內容、執行權。這裡要先踩個剎車，別把問題問成「這家公司有沒有很強的 LLM」。該問的是「誰擁有 AI 動作落地的那一層，還有餵它的專屬資料」。Rossum 的文件語料、Vendr 的 25 萬份談判紀錄、Contentful 的結構化內容、StackAI 的跨系統連結，每一樣都是錢沒辦法一次買齊、要時間慢慢長出來的料。這跟我先前寫世界模型那條線是同一件事：聊天在商品化，護城河往流程與資料那一邊退。

<img src="/images/ai-acquisitions-execution-layer-s2.webp" width="868" height="1300" loading="lazy" decoding="async" alt="機械手臂執行任務，象徵 AI 從會建議走到會動手">

這不是四個湊巧撞在一起的個案，是一條結構性的線。

[New Market Pitch 的併購追蹤](https://newmarketpitch.com/blogs/news/agentic-ai-ma-tracker)統計，過去 24 個月有 44 樁 agentic AI 併購，其中近一年就佔 35 樁，前一年只有 9 樁，量能翻了快四倍。更說明問題的是買家會重複出手：Salesforce 兩年內出手三次、UiPath 兩次、Meta 兩次。同一個買家反覆買同一層，通常代表它在照著一張路線圖佈局，不是看到一家有趣的新創臨時起意。金額也不小，光是可查的大單，Salesforce 收購對話 agent 公司 Fin 就花了 36 億美元、ServiceNow 買 Moveworks 花了 28.5 億美元。錢正在往「AI 動作落地的那一層」集中。

<img src="/images/ai-acquisitions-execution-layer-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="併購交易量成長趨勢，象徵 agentic AI 併購的結構性加速">

但會動手，就要有人扛。這是這波併購底下沒被大聲講的那一半。

AI 只給建議的時候，最後拍板的還是人，出錯的責任邊界很清楚。一旦 AI 開始自己跟供應商議價、自己付發票、自己發布內容，責任歸屬就跟著搬進企業內部：agent 議錯價、付錯款、發錯內容，是誰的錯，哪個系統該攔下來？[ERP Today 這篇](https://erp.today/enterprise-software-ai-acquisitions-execution-layer)點得直接，企業架構師接下來得決定 agent 從哪裡發動、動作在哪裡執行、由哪個系統掌管治理。我一直的立場是：值得信任 agent，不是因為它更聰明，而是因為它跑的流程裡有沒有對應的驗證與煞車機制。買下執行層的同時，等於也把責任一起買回家，這件事在興奮的併購新聞稿裡幾乎都被跳過。同樣的邏輯我在談[醫療 LLM 的能與不能](/articles/llm-healthcare-promise-limits/)時就說過：可信度靠的是落地流程的設計，不是模型多大。

<img src="/images/ai-acquisitions-execution-layer-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業治理與合規監控介面，象徵 AI 動手後的責任歸屬問題">

那台灣該從這波讀出什麼？看你站在哪個位置。

如果你是要導入 AI 的企業，這波在提醒你：別被「會給你漂亮建議」的 demo 迷惑。採購前該問的不是模型多強，是這套 agent 的動作在哪裡執行、出錯由誰擋、責任落在誰身上。買到只會建議的工具，你解的是「看起來有在用 AI」這個表面問題，不是真正的流程問題。如果你是做軟體或 SaaS 的廠商，這波更是一記提醒：只包一層 LLM API 的產品最先被商品化沖掉，真正撐得住的護城河，是像 Rossum 的文件、Vendr 的談判資料那種專屬、難複製的垂直流程資料與執行權。台灣強在硬體、弱在企業軟體，但在有真實 domain 資料的垂直場景，例如製造排程、醫療文件、法遵稽核，還有沒被填滿的卡位空間。能不能吃到，不會是因為誰的模型比較聰明，而是有沒有把自己那段流程的資料與執行權先握在手上。

<img src="/images/ai-acquisitions-execution-layer-s5.webp" width="960" height="641" loading="lazy" decoding="async" alt="軟體團隊在辦公室協作，象徵台灣軟體業在垂直場景的卡位點">

一個月四樁交易，是企業軟體業在用真金白銀說一句話：會建議的 AI 已經不稀奇，下一輪的價值在會動手的那一層。看懂它們在買什麼，比記住哪樁花了多少錢重要。

<h2>常見問題</h2>

<p><strong>企業 AI 的「執行層」到底是什麼？</strong><br>指的是讓 AI 的判斷真的變成企業動作的那一層，包含資料、流程、內容與跨系統的執行權。會建議的 AI 只吐出一段文字或一個下一步，執行層則是把「該付這張發票」「該跟這家供應商殺到這個價」實際辦完。這波併購買的就是這一層，例如 Coupa 買 Rossum 是為了[把文件處理接進採購到付款全流程](https://rossum.ai/company/newsroom/press-release-coupa-acquires-rossum/)。</p>

<p><strong>為什麼買家寧可花大錢併購，也不自己做一個 agent？</strong><br>因為值錢的不是 agent 本身，是餵它的專屬資料與跨系統連結，這些錢一次買不齊、要時間長出來。Vertice 併 Vendr 就是為了[25 萬份真實談判合約組成的採購情報庫](https://www.prnewswire.com/news-releases/vertice-acquires-vendr-to-create-the-worlds-largest-procurement-intelligence-dataset-and-lead-autonomous-ai-negotiation-302786407.html)，這種料自己從零累積要好幾年，直接買比較快。</p>

<p><strong>這波併購跟一般說的「AI 泡沫」是同一回事嗎？</strong><br>不完全是。過去 24 個月有 [44 樁 agentic AI 併購、近一年就佔 35 樁](https://newmarketpitch.com/blogs/news/agentic-ai-ma-tracker)，而且 Salesforce、UiPath、Meta 這些買家都重複出手，代表是照路線圖佈局而非一次性炒作。會不會有估值過熱另當別論，但買執行層這個方向本身是實打實的策略選擇。</p>

<p><strong>台灣的軟體公司在這波有機會嗎？</strong><br>有，但機會不在包一層 LLM API 的通用產品，那類最先被商品化沖掉。機會在握有真實 domain 資料的垂直場景，例如製造排程、醫療文件、法遵稽核，把該領域的流程資料與執行權先握在手上，才是難被複製的護城河。</p>
