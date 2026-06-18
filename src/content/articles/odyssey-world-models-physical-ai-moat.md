---
title: "創投把錢從聊天機器人搬到『世界模型』：Odyssey 募 3.1 億，實體 AI 的護城河在哪"
slug: "odyssey-world-models-physical-ai-moat"
description: "Odyssey 6/17 拿到 3.1 億美元 B 輪，投資人含 Amazon、AMD Ventures、GV、EQT。資金正從消費級對話應用，移到能驅動機器人、模擬與感知的世界模型底層；台灣以硬體與機器人供應鏈見長，該看懂這波實體 AI 基礎層要的是什麼。"
excerpt: "為什麼 Amazon 和 AMD 投的不是下一個 ChatGPT？答案可能是：聊天模型正在商品化，而世界模型要真實世界資料、感測器、機器人、模擬環境，護城河更深。"
publishDate: "2026-07-02T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["世界模型", "實體 AI", "Odyssey 募資", "AI 基礎建設", "台灣供應鏈"]
coverImage: "covers/odyssey-world-models-physical-ai-moat.webp"
coverAlt: "象徵創投資金從聊天機器人轉向世界模型與實體 AI 基礎層的抽象示意"
coverImageCredit: "Photo by Conny Schneider on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Odyssey 6/17 拿到 3.1 億美元 B 輪、投後估值 14.5 億美元，投資人含 Amazon、AMD Ventures、GV、EQT 與 In-Q-Tel；這份名單裡沒有一個是衝著下一個 ChatGPT 來的。"
  - "世界模型跟聊天 LLM 學的東西不同：前者建一個能預測物理世界的內部模型、餵給機器人與模擬，護城河在真實世界資料、感測器、機器人與模擬環境，比已在商品化的聊天模型更深。"
  - "台灣在實體 AI 這層的卡位點是感測、機構件、邊緣運算這些會碰到真實世界的零組件，而不是只守在雲端 GPU 代工那一格等單。"
references:
  - title: "Odyssey raises $310 million at $1.45 billion valuation to build AI that simulates the real world"
    url: "https://techstartups.com/2026/06/17/odyssey-raises-310-million-at-1-45-billion-valuation-to-build-ai-that-simulates-the-real-world/"
    publisher: "Tech Startups"
  - title: "World model maker Odyssey nabs $1.45B valuation backed by Amazon and other big names"
    url: "https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/"
    publisher: "TechCrunch"
  - title: "Odyssey AI raises $310M, bets on Amazon over Nvidia"
    url: "https://thenextweb.com/news/odyssey-ai-310-million-amazon-amd-nvidia"
    publisher: "The Next Web"
  - title: "Billion-Dollar AI Rounds Push April To Third-Highest Startup Funding Month In A Year"
    url: "https://news.crunchbase.com/venture/global-startup-funding-april-2026-anthropic-jeff-bezos-project-prometheus-biggest-deals/"
    publisher: "Crunchbase News"
  - title: "Q1 2026 Shatters Venture Funding Records As AI Boom Pushes Startup Investment To $300B"
    url: "https://news.crunchbase.com/venture/record-breaking-funding-ai-global-q1-2026/"
    publisher: "Crunchbase News"
---

創投圈這半年有個轉向，不在新聞標題裡，在出資名單裡。

6 月 17 日，做「世界模型」的新創 Odyssey 宣布[拿到 3.1 億美元 B 輪、投後估值 14.5 億美元](https://techstartups.com/2026/06/17/odyssey-raises-310-million-at-1-45-billion-valuation-to-build-ai-that-simulates-the-real-world/)，正式變成獨角獸。重點不是金額。重點是誰掏的錢：領投的是 Natural Capital，跟投名單裡有 Amazon、AMD Ventures、Google 旗下的 GV、私募巨頭 EQT，連美國情報體系的創投 In-Q-Tel 都在。

<img src="/images/odyssey-world-models-physical-ai-moat-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="創投熱錢從消費級對話應用流向底層基礎建設的資金流向示意">

這份名單裡，沒有一個是衝著「下一個 ChatGPT」來的。

先把名詞講清楚。我們熟悉的聊天機器人，背後是大型語言模型（LLM），它學的是「文字接下來最可能接什麼字」。世界模型（world model）學的是另一件事：[這個世界接下來會怎麼動](https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/)。一顆球丟出去會怎麼掉、機械手臂抓這個角度會不會打滑、車子轉這個彎路面摩擦力夠不夠，它要在內部建一個能預測物理變化的模型，再把這套能力餵給機器人、模擬器和遊戲。Odyssey 兩位創辦人，一個出身自駕車公司 Voyage 與 Cruise、一個來自自駕新創 Wayve，他們蒐集資料的方式也很實體：派人背著相機到真實世界走一圈，像錄 Google 地圖那樣把世界錄下來。這跟爬網路文字來訓練聊天模型，是完全不同的工。

<img src="/images/odyssey-world-models-physical-ai-moat-s2.webp" width="960" height="474" loading="lazy" decoding="async" alt="世界模型在內部建立可預測物理變化的模擬環境示意">

所以回到那個問題：為什麼 Amazon 和 AMD 投的不是下一個 ChatGPT？

我的答案是：聊天模型正在商品化（commoditization）。開源模型一個月追上一個，價格一路往下殺，聊天這件事誰都做得出八成像的東西，護城河很淺。世界模型不一樣，它要的料沒辦法用錢一次買齊：真實世界的資料、感測器、機器人、模擬環境。這幾樣每一樣都得花時間長出來，缺一個模型就跑不準。護城河更深，深在它卡在實體世界這一邊，不是卡在演算法那一邊。

<img src="/images/odyssey-world-models-physical-ai-moat-s3.webp" width="960" height="636" loading="lazy" decoding="async" alt="世界模型需要真實世界資料、感測器與機器人，象徵更深的護城河">

看硬體就更清楚這份名單的意思。Odyssey 四個月前的 A 輪，[Nvidia 的創投部門還在裡面，這輪卻不見了](https://thenextweb.com/news/odyssey-ai-310-million-amazon-amd-nvidia)，換成 Amazon 跟 AMD Ventures；而且 Odyssey 把 AWS 設為優先雲端、要用 Amazon 自研的 Trainium 晶片，那是 Amazon 對 Nvidia 算力壟斷端出的自家答案。一家賭世界模型的公司，配上一組想繞過 Nvidia 的金主，這輪募資讀起來就像對市場龍頭投下的一張反對票。當然要踩個剎車：優先不等於獨家，到底是真的看好 Amazon 的晶片、還是市場太搶只是拿到比較好的條件，現在說不準。但方向很明確，他們賭的護城河在資料、模擬算力跟硬體整合綁在一起，不在單一模型多聰明。

<img src="/images/odyssey-world-models-physical-ai-moat-s4.webp" width="960" height="800" loading="lazy" decoding="async" alt="AI 晶片與資料中心，象徵護城河在硬體整合而非單一模型">

那台灣該從這條新聞讀出什麼？

這波資金不是個案。[Crunchbase 的統計](https://news.crunchbase.com/venture/global-startup-funding-april-2026-anthropic-jeff-bezos-project-prometheus-biggest-deals/)顯示，今年四月，光是機器人、航太、無人機、自駕這類「實體 AI」就吸走約 53 億美元。錢正在從雲端那一層，往會動、會感測、要碰到真實世界的那一層流。我之前寫[資金灌進 AI 基建層](/articles/supabase-500m-ai-infrastructure-layer/)、寫[DeepSeek 那輪戰略資本進場](/articles/deepseek-capital-taiwan-supply-chain/)，講的都是同一條線：熱錢不再只追更大的模型，而是追整條讓 AI 跑起來的底層。實體 AI 是這條底層裡最靠近硬體的一段。

<img src="/images/odyssey-world-models-physical-ai-moat-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="電子製造、電路板與感測器，象徵台灣在實體 AI 供應鏈的卡位點">

台灣最強的就是硬體。但這裡有個容易看歪的地方：以為這波等於「多接一點雲端 GPU 代工的單」。實體 AI 要的不只是雲端那顆大晶片。世界模型要餵資料，靠的是感測器；機器人要動，靠的是機構件、致動器、精密機械；模型要即時反應，靠的是塞在裝置裡的邊緣運算晶片。這幾段台灣本來就有底子，[政府的 AI 新十大建設也把智慧機器人列進關鍵技術](/articles/ai-new-infrastructure-compute-trusted-industries/)。真正的卡位點，是去吃這些「實體 AI 專用」的感測、機構與邊緣零組件，而不是只守在雲端 GPU 代工那一格等單。

<img src="/images/odyssey-world-models-physical-ai-moat-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="機器人與工業自動化，象徵實體 AI 基礎層的長線賭注">

把錢從聊天機器人搬到世界模型，是創投在用真金白銀說一句話：消費級對話應用的故事講得差不多了，下一輪的價值在能驅動機器人、模擬與感知的底層。這個轉向會不會成真還要看技術，Odyssey 自己也只說想做到世界模型的「GPT-3 時刻」，離成熟還早。但台灣站在實體 AI 這條供應鏈上，現在就該看懂這層要的是什麼料。能不能接住這波，不會是因為誰的模型比較聰明，而是[有沒有把自己在這條鏈上的位置定義清楚、把該長的能力先長出來](/articles/llm-healthcare-promise-limits/)。看懂名單，比記住 3.1 億這個數字重要。

## 常見問題

**世界模型跟 ChatGPT 那種聊天 AI 差在哪？**

聊天模型學的是文字怎麼接，世界模型學的是世界怎麼動。前者吐文字，後者建一個能預測物理變化的內部模型，拿去驅動機器人、模擬器跟遊戲。兩者底層的料也不一樣：聊天模型吃網路文字，世界模型要真實世界的影像、感測資料跟物理。

**為什麼是 Amazon、AMD 領投，不是做聊天 AI 的公司？**

因為聊天模型在商品化，護城河變淺；世界模型卡在實體世界這一邊，要資料、感測器、機器人、模擬環境，這些堆起來的護城河更深，也更需要雲端算力跟自研晶片來綁。Amazon 給雲端跟 Trainium 晶片、AMD 給算力硬體，他們投的是這層基礎建設，不是又一個對話介面。

**台灣在實體 AI 這層的機會在哪？**

在感測器、機構件與精密機械、邊緣運算晶片這些會碰到真實世界的零組件，而不是只做雲端 GPU 代工。世界模型要餵資料、機器人要會動、裝置要即時反應，靠的都是這幾段，台灣本來就有底子。
