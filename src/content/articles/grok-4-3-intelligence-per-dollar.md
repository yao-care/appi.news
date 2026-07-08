---
title: "xAI 推 Grok 4.3：前沿模型開始拚『每塊錢買多少智慧』，效率前緣成新戰場"
slug: "grok-4-3-intelligence-per-dollar"
description: "Grok 4.3 智慧指數 53、輸入 $1.25／輸出 $2.50（每百萬 token），跑完整套指數成本 395 美元、比前一代低約兩成。它賭的不是最聰明，是每塊錢買多少智慧。前沿模型的競爭軸線正從跑分轉向效率前緣，台灣導入 AI 的公司該問的問題也跟著換。"
excerpt: "為什麼 xAI 不去搶智慧榜首，改砍價格？因為推理能力正在商品化，八分的智慧差多數工作量看不見，十倍的輸出成本差看得見。前緣要當路由地圖讀，不是排行榜。"
publishDate: "2026-08-09T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["Grok 4.3", "xAI", "模型選型", "效率前緣", "推論成本"]
coverImage: "covers/grok-4-3-intelligence-per-dollar.webp"
coverAlt: "象徵 AI 前沿模型競爭軸線從跑分轉向每塊錢買多少智慧的效率前緣示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Grok 4.3 智慧指數拿 53、輸入 $1.25／輸出 $2.50（每百萬 token），跑完整套 Artificial Analysis 智慧指數成本 395 美元、比前一代低約兩成；它賭的不是當最聰明的模型，是每塊錢買多少智慧。"
  - "前沿競爭軸線正從『誰跑分高』轉向『效率前緣』（cost-per-intelligence）：前緣上同時站著旗艦與便宜模型，該當路由地圖讀，不是排行榜。"
  - "台灣多數導入 AI 的是中小企業與開發團隊，追榜首模型常是解錯題；先定義工作量、把八成不需頂級推理的流量路由到便宜模型，才撐得住上線後的成本。"
references:
  - title: "xAI launches Grok 4.3 with improved agentic performance and lower pricing"
    url: "https://artificialanalysis.ai/articles/xai-launches-grok-4-3-with-improved-agentic-performance-and-lower-pricing"
    publisher: "Artificial Analysis"
  - title: "Grok 4.3 (high) - Intelligence, Performance & Price Analysis"
    url: "https://artificialanalysis.ai/models/grok-4-3"
    publisher: "Artificial Analysis"
  - title: "AI Model Efficient Frontier Q2 2026: Performance vs Price"
    url: "https://www.digitalapplied.com/blog/ai-model-performance-vs-price-efficient-frontier-q2"
    publisher: "Digital Applied"
  - title: "Grok 4.3: xAI Trades the Crown for the Price Tag"
    url: "https://www.frankx.ai/blog/grok-4-3-analysis-2026"
    publisher: "FrankX"
originalContribution: "把 Grok 4.3 的定價與跑分數字放進『效率前緣／每塊錢買多少智慧』的分析框架，用『解對題 vs 解錯題』拆穿『導入 AI 就選最強模型』的常見誤區，落到台灣中小企業與開發團隊的模型路由決策。"
---

Grok 4.3 沒在搶「最聰明」，它搶的是「每塊錢買多少智慧」。這代表前沿模型的競爭軸線正在換：從比誰跑分高，轉向比誰在「效率前緣」（cost-per-intelligence，每一塊錢換到的智慧）上站得穩。對台灣要導入 AI 的公司，該問的問題也跟著變，不是「用哪個最強的模型」，而是「這個工作量，用多便宜就正確的模型能做完」。

先看數字。xAI 四月底發的 Grok 4.3，[在 Artificial Analysis 智慧指數拿到 53 分](https://artificialanalysis.ai/articles/xai-launches-grok-4-3-with-improved-agentic-performance-and-lower-pricing)，但價格砍得很兇：[輸入每百萬 token 收 1.25 美元、輸出 2.5 美元](https://artificialanalysis.ai/models/grok-4-3)，比前一代 Grok 4.20 大約砍掉 37.5% 與 58.3%。跑完整套智慧指數的花費是 [395 美元，比前一代低約兩成](https://artificialanalysis.ai/articles/xai-launches-grok-4-3-with-improved-agentic-performance-and-lower-pricing)。同時 agentic 能力還往上跳，GDPval-AA 的 ELO 從 1179 衝到 1500，多了 321 分。翻成白話：跑分沒退、有些還進步，價格卻大砍。

<img src="/images/grok-4-3-intelligence-per-dollar-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 模型定價與跑分數據儀表板，象徵 Grok 4.3 跑分不降但價格大砍">

重點不是 Grok 這個名字，是它站的位置。這幾年評測圈流行一個概念叫效率前緣（efficient frontier）。[定義很乾脆](https://www.digitalapplied.com/blog/ai-model-performance-vs-price-efficient-frontier-q2)：一組選項裡，你沒辦法在不犧牲另一個維度的前提下，改善任何一個維度。把每個模型的品質對價格畫成散點圖，連起最外緣那條線就是前緣，線上每個點都沒有被別人「完勝」。在這份 Q2 2026 的盤點裡，前緣上同時站著貴的 GPT-5.4 Pro、Gemini 3.1 Pro、Claude Opus 4.6，也站著很便宜的 MiniMax 與 Nemotron，輸入價從每百萬 0.03 美元到 30 美元差了上千倍。Grok 4.3 擠進的，就是這條線的「便宜端」。

<img src="/images/grok-4-3-intelligence-per-dollar-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="品質對價格的散點前緣示意，線上模型互不被完勝">

為什麼軸線會換？因為推理能力正在商品化。有分析講得直接，[Grok 4.3「沒想當房間裡最聰明的模型」](https://www.frankx.ai/blog/grok-4-3-analysis-2026)，它那 53 分落後 Claude Opus 4.8 的 61.4、GPT-5.5 的 60.2、Gemini 3.1 Pro 的約 57。但那八分的智慧差，在多數工作量上你根本看不出來；十倍的輸出成本差，帳單上一眼就看到。能把分類、抽取、摘要、agent 工具迴圈做到八成好的模型愈來愈多，價格一路往下殺。當「夠好」變便宜，比的就不再是誰多聰明。

<img src="/images/grok-4-3-intelligence-per-dollar-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="模型價格一路下滑的趨勢示意，象徵推理能力商品化">

這裡要踩個剎車，把問題分清楚。很多公司導入 AI 的第一反應是「選最強的模型」。這常常是解錯題。你真正要解的，是「這個工作量需要多少智慧才夠」。[digitalapplied 的結論很白](https://www.digitalapplied.com/blog/ai-model-performance-vs-price-efficient-frontier-q2)：一個上線的 AI 系統，最便宜的正確答案幾乎從來不是單一模型，而是一條路由規則（routing rule）；前緣要當「路由地圖」讀，不是排行榜。[FrankX 給的操作也一樣](https://www.frankx.ai/blog/grok-4-3-analysis-2026)：把八成不需要頂級推理的流量，分類、抽取、摘要、agent 迴圈，丟給便宜模型，剩下兩成真正難的才留給旗艦。先定義使用情境、再挑工具，順序不能倒過來。

<img src="/images/grok-4-3-intelligence-per-dollar-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心與伺服器，象徵把不同工作量路由到不同模型">

那台灣的公司該讀出什麼。台灣多數要導入 AI 的是中小企業與開發團隊，不是燒得起旗艦模型當預設的大廠。對他們，追榜首模型是最貴、也最容易踩雷的一條路：帳單被輸出 token 吃掉，換一次模型又要重測一輪。務實的做法是把每個任務先標上「需要多少智慧」，再對照效率前緣挑最便宜的正確解。撐不撐得住上線後的成本，往往不是因為模型多聰明，而是有沒有把路由這件事做對。Grok 4.3 這種站在便宜端、跑分又不算差的模型愈多，這條路就愈走得通。看懂前緣的位置，比記住 53 這個分數重要。

<img src="/images/grok-4-3-intelligence-per-dollar-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="辦公室裡的開發團隊使用筆電，象徵台灣中小企業導入 AI 的模型選型">

<h2>常見問題</h2>

<p><strong>「每塊錢買多少智慧」（cost-per-intelligence）到底是什麼意思？</strong><br>它是把模型的「智慧分數」除以「用它做事的成本」，看同樣一塊錢能換到多少能力。過去大家比的是誰跑分最高，現在多了一條軸線：在一樣的預算下誰做得最好。Grok 4.3 就是靠這條軸線卡位，[跑分 53 但把輸入輸出價格砍到每百萬 1.25 與 2.5 美元](https://artificialanalysis.ai/models/grok-4-3)。</p>

<p><strong>Grok 4.3 是不是目前最聰明的模型？</strong><br>不是，而且它沒打算是。以 Artificial Analysis 智慧指數看，[它的 53 分落後 Claude Opus 4.8、GPT-5.5 與 Gemini 3.1 Pro](https://www.frankx.ai/blog/grok-4-3-analysis-2026)。它主打的是同價位帶裡的性價比，適合大量、不需要頂級推理的工作，不是要跟旗艦拚最難的題目。</p>

<p><strong>公司導入 AI，是不是直接選最強的模型就好？</strong><br>多數情況不是。[實務上最便宜的正確做法通常不是單一模型，而是一條路由規則](https://www.digitalapplied.com/blog/ai-model-performance-vs-price-efficient-frontier-q2)：把八成不吃重的流量（分類、抽取、摘要）交給便宜模型，兩成真正難的才用旗艦。先定義工作量需要多少智慧，再挑工具，順序不能倒。</p>

<p><strong>什麼是「效率前緣」？我怎麼用它挑模型？</strong><br>把各模型的品質對價格畫成圖，最外緣那條線上的模型，都是「在它那個價位上沒有被別人完勝」的選擇。挑模型時先決定任務要多少品質，再沿著前緣找到達標又最便宜的那個點，[把前緣當路由地圖用，而不是照排行榜從上往下選](https://www.digitalapplied.com/blog/ai-model-performance-vs-price-efficient-frontier-q2)。</p>
