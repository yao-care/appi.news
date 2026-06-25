---
title: "世界模型新星 Odyssey 募 3.1 億美元、估值衝 14.5 億：AI 從生成像素走向模擬可互動環境"
slug: "odyssey-world-model-interactive-simulation"
description: "Odyssey 6/17 募 3.1 億美元、估值衝 14.5 億，Crunchbase 當週十大募資領銜。世界模型跟生成影片差在物理對不對，落地點在機器人、遊戲與模擬訓練，但離真正產品還有 sim-to-real 這道坎要過。"
excerpt: "AI 從『畫面看起來像真的』走向『物理是對的』。世界模型逼 AI 去學世界怎麼動，這比把網路文字背更熟，離真的幫上實體世界近得多，但現在還在 GPT-3 階段。"
publishDate: "2026-07-20T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags: ["世界模型", "Odyssey 募資", "生成影片", "實體 AI", "模擬訓練"]
coverImage: "covers/odyssey-world-model-interactive-simulation.webp"
coverAlt: "象徵世界模型把真實環境變成可互動模擬空間的抽象示意"
coverImageCredit: "Photo by and machines on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Odyssey 6/17 拿到 3.1 億美元 B 輪、估值衝上 14.5 億美元，由 Natural Capital 領投，是 Crunchbase 當週十大募資的第一名；訊號是資本把『可互動模擬』當成生成影片之後的下一格。"
  - "世界模型跟生成影片差在物理對不對、不是畫面像不像。李飛飛把世界模型拆成 renderer、simulator、planner 三層，只會吐像素的那層根本不算真正的世界模型。"
  - "能落地的地方是機器人（產合成訓練資料）、遊戲與模擬訓練；但 Odyssey 自承還在『GPT-3 時刻』，最大障礙是 sim-to-real gap，離量產可靠的產品還有一段路。"
references:
  - title: "World model maker Odyssey nabs $1.45B valuation backed by Amazon and other big names"
    url: "https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/"
    publisher: "TechCrunch"
  - title: "The Week's 10 Biggest Funding Rounds: World-Model Startup Odyssey Leads With $310M"
    url: "https://news.crunchbase.com/venture/biggest-funding-rounds-cybersecurity-defense-startup-ai-odyssey-leads/"
    publisher: "Crunchbase News"
  - title: "A Functional Taxonomy of World Models"
    url: "https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models"
    publisher: "Dr. Fei-Fei Li (Substack)"
  - title: "Fei-Fei Li explains world models' roles in robotics and gaming"
    url: "https://cryptobriefing.com/fei-fei-li-world-models-robotics-gaming/"
    publisher: "Crypto Briefing"
  - title: "Our $310 Million Fundraise to Accelerate World Simulation"
    url: "https://odyssey.ml/our-series-b"
    publisher: "Odyssey"
---

做世界模型的新創 Odyssey 在 6 月 17 日宣布[拿到 3.1 億美元 B 輪、估值衝上 14.5 億美元](https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/)，由 Natural Capital 領投，並在 [Crunchbase 整理的當週十大募資裡排第一名](https://news.crunchbase.com/venture/biggest-funding-rounds-cybersecurity-defense-startup-ai-odyssey-leads/)。這條新聞真正的訊號不在金額，在資本開始把「能即時模擬、可以走進去互動的環境」當成生成影片之後的下一格。世界模型跟我們熟的聊天機器人、跟會生影片的模型，學的根本是兩件事；它要落地的地方是機器人、遊戲和模擬訓練，但離一個你今天就買得到的產品，還有一段路。

<img src="/images/odyssey-world-model-interactive-simulation-s1.webp" width="960" height="509" loading="lazy" decoding="async" alt="象徵資本流向可互動模擬與世界模型的抽象數據流示意">

先把最容易混的兩件事分開。生成影片的模型，目標是「畫面看起來像真的」；世界模型的目標是「物理是對的」。這個差別不抽象。史丹佛的李飛飛 6 月 3 日發表[一份世界模型的功能分類](https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models)，把它拆成三層：renderer（吐出給人看的像素）、simulator（吐出有幾何、有物理的狀態）、planner（吐出能執行的動作）。她講得很直接，停在 renderer 那一層的系統根本不算世界模型，因為[那種大樓從空拍看很完美，真的走進去、真的拿去蓋，就垮了](https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models)。一段生成影片是排好的一串影格，你沒辦法走進去換個角度看；世界模型要的是你從不同角度逼近同一個架子，架子和上面的東西都還在原位。

<img src="/images/odyssey-world-model-interactive-simulation-s2.webp" width="960" height="960" loading="lazy" decoding="async" alt="3D 網格環境示意，世界模型維持一致的幾何與物理而非固定影格">

這個差別決定了它能落地到哪。最務實的一塊是機器人。機器人最缺的不是演算法，是「練習場」，真實世界試錯太貴、太慢、還會撞壞東西。世界模型能生出[幾何和物理都一致的模擬環境，讓機器人從不同角度逼近同一個物件、反覆練習並產出合成訓練資料](https://cryptobriefing.com/fei-fei-li-world-models-robotics-gaming/)，把真實世界的試錯次數壓下來。Odyssey 自己也把[機器人、遊戲、從文字生出可互動影片](https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/)列成主要用途；官網把名單拉得更長，[機器人、科學、醫療、教育、遊戲、國防都在裡面](https://odyssey.ml/our-series-b)。遊戲跟模擬訓練其實是同一套能力的兩種賣法：一個拿來造可玩的世界，一個拿來造用來訓練人或 AI 的世界。

<img src="/images/odyssey-world-model-interactive-simulation-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="機器人在模擬環境中反覆練習並產生合成訓練資料的示意">

那離真正的產品多遠？比 demo 影片看起來遠。Odyssey 說自己做出[「第一個即時的多模態世界模型」，並形容這個領域正逼近世界模型的「GPT-3 時刻」](https://odyssey.ml/our-series-b)，這句話翻成白話是：還在 GPT-3 階段，不是 ChatGPT 階段。最難的那道坎叫 [sim-to-real gap](https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models)，在模擬器裡跑得漂亮，搬到真實世界常常水土不服，物理差一點、感測器雜訊多一點，整套就抖。所以這輪 3.1 億美元砸的是算力跟延遲，[即時生成一個物理夠準的世界，運算和延遲的要求都很硬](https://odyssey.ml/our-series-b)，這也是為什麼它要綁 AWS、賭 [Amazon 自研的 Trainium 晶片](https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/)。能力的方向很清楚，但要變成你工作流裡天天用的東西，還在路上。

<img src="/images/odyssey-world-model-interactive-simulation-s4.webp" width="960" height="539" loading="lazy" decoding="async" alt="資料中心伺服器示意，即時世界模型需要龐大算力與低延遲">

講真心話，我對這件事是超期待的。期待的點不是又一輪幾億美元的募資，這種新聞每週都有；是 AI 終於有人認真往「理解世界怎麼動」這個方向砸資源，而不是再多一個會聊天、會生圖的模型。會聊天的模型再強，它對「球丟出去會掉下來」這件事其實沒有概念；世界模型逼著 AI 去學物理、學因果，這比把網路文字背得更熟，離「真的能幫上實體世界的忙」近得多。但期待歸期待，剎車還是要踩：現在看得到的多半是研究里程碑跟漂亮 demo，不是量產可靠度。我會盯的不是它的 demo 多炫，是它哪天敢把一個世界模型交給真實機器人天天用、出錯了誰負責、sim-to-real 那道坎收到什麼程度。能力是它的，門檻還是它自己的。

<img src="/images/odyssey-world-model-interactive-simulation-s5.webp" width="960" height="660" loading="lazy" decoding="async" alt="抽象運動與物理示意，世界模型逼 AI 去學世界怎麼動">

這也接回我先前寫過的另一面。同一筆募資，[從投資人名單讀，會看到資本正把錢從聊天機器人搬到實體 AI 的底層](/articles/odyssey-world-models-physical-ai-moat/)：Amazon、AMD Ventures 進場、Nvidia 創投這輪退出，賭的是資料、感測器、模擬環境綁住硬體的護城河。那篇談的是「錢往哪流、台灣供應鏈怎麼接」，這篇談的是「這項技術到底是什麼、能用在哪、離產品多遠」。兩件事拼起來，才是完整的一張圖。

<h2>常見問題</h2>

<p><strong>世界模型和會生影片的 AI 有什麼不一樣？</strong><br>生成影片的模型追求畫面看起來像真的，世界模型追求物理是對的。李飛飛的<a href="https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models">功能分類</a>指出，只會吐像素、不保證幾何與物理一致的系統不算真正的世界模型；世界模型要能讓你從不同角度走進同一個環境，物體還停在原位。</p>

<p><strong>世界模型可以用在哪些產業？</strong><br>最務實的是機器人，用一致的模擬環境<a href="https://cryptobriefing.com/fei-fei-li-world-models-robotics-gaming/">產出合成訓練資料、減少真實世界試錯</a>；其次是遊戲（造可玩的世界）和模擬訓練（造用來訓練人或 AI 的世界）。Odyssey 也把科學、醫療、教育、國防列為潛在應用。</p>

<p><strong>Odyssey 這輪募了多少、誰投的？</strong><br>Odyssey 6 月 17 日宣布 <a href="https://techcrunch.com/2026/06/17/world-model-maker-odyssey-nabs-1-45b-valuation-backed-by-amazon-and-other-big-names/">3.1 億美元 B 輪、估值 14.5 億美元</a>，由 Natural Capital 領投，Amazon、AMD Ventures、GV、EQT、In-Q-Tel 等跟投，是 <a href="https://news.crunchbase.com/venture/biggest-funding-rounds-cybersecurity-defense-startup-ai-odyssey-leads/">Crunchbase 當週十大募資的第一名</a>。</p>

<p><strong>世界模型離真正能用的產品還有多遠？</strong><br>還在早期。Odyssey 自己形容領域正逼近 <a href="https://odyssey.ml/our-series-b">「GPT-3 時刻」</a>，代表是突破的起點而非成熟產品；最大的障礙是 sim-to-real gap，模擬器裡跑得好不等於搬到真實世界一樣準。</p>
