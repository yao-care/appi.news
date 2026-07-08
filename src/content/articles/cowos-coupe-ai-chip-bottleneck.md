---
title: "AI 晶片的瓶頸正從製程移到封裝：台積電 5.5 倍光罩 CoWoS 良率破 98%、光子引擎 COUPE 上場"
slug: "cowos-coupe-ai-chip-bottleneck"
description: "限制 AI 算力往上疊的關卡已經不在電晶體那一格。台積電 2026 兩個數字標出這條線：世界最大的 5.5 倍光罩 CoWoS 良率破 98% 進量產，把光引擎搬進封裝的 COUPE 今年上線。瓶頸正從製程移到封裝、再移到晶片間搬資料的頻寬。"
excerpt: "追問『下一站幾奈米』已經問錯題。AI 硬體現在卡的不是電晶體，是怎麼把多顆晶片黏成一顆、以及晶片之間怎麼把資料搬得夠快。"
publishDate: "2026-08-06T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["台積電", "CoWoS", "先進封裝", "矽光子", "COUPE", "AI 晶片"]
coverImage: "covers/cowos-coupe-ai-chip-bottleneck.webp"
coverAlt: "半導體先進封裝的晶片與電路特寫，象徵 AI 晶片瓶頸從製程移到封裝"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "台積電世界最大的 5.5 倍光罩 CoWoS 封裝良率已破 98%、2026 量產；瓶頸的量尺從『幾奈米』換成『幾倍光罩』，代表 AI 晶片的關卡已從製程移到封裝。"
  - "下一道牆是晶片間搬資料：COUPE 光子引擎把光引擎疊進封裝，官方稱功耗效率提升 5～10 倍、延遲降低 10～20 倍，2026 隨 CoWoS 一起進共封裝光學（CPO）。"
  - "台灣的護城河正從電晶體延伸到封裝與光子整合這一段；但別把這波讀成『多接幾張雲端 GPU 的單』，真正卡位點在中介層、光學元件與封裝產能。"
references:
  - title: "TSMC touts advanced packaging, 2nm progress at tech symposium"
    url: "https://focustaiwan.tw/sci-tech/202605140021"
    publisher: "Focus Taiwan"
  - title: "TSMC Sees AI Wafer Demand Rising 11x From 2022–2026, Targets CoWoS With 24 HBM Stacks in 2029"
    url: "https://www.trendforce.com/news/2026/05/14/news-tsmc-sees-ai-wafer-demand-rising-11x-from-2022-2026-targets-cowos-with-24-hbm-stacks-in-2029/"
    publisher: "TrendForce"
  - title: "TSMC Celebrates 30th North America Technology Symposium with Innovations Powering AI with Silicon Leadership"
    url: "https://pr.tsmc.com/english/news/3136"
    publisher: "TSMC"
  - title: "Silicon Photonics Race Intensifies as TSMC Targets 2026 COUPE Production, Samsung Eyes 2029 CPO Turnkey"
    url: "https://www.trendforce.com/news/2026/04/01/news-silicon-photonics-race-intensifies-as-tsmc-targets-2026-coupe-production-samsung-eyes-2029-cpo-turnkey/"
    publisher: "TrendForce"
originalContribution: "本文把台積電 2026 技術論壇的兩條主線（5.5 倍光罩 CoWoS 良率破 98%、COUPE 光子引擎量產）合併成一個框架：AI 晶片的供給瓶頸正沿『製程 → 封裝 → 互連頻寬』逐段位移，並據此重新定義台灣供應鏈的卡位點在中介層、光學元件與封裝產能，而非雲端 GPU 訂單量。"
---

限制 AI 算力往上疊的關卡，已經不在電晶體那一格了。它先從製程（幾奈米）移到封裝（把多顆晶片黏成一顆），現在正往第三道牆走：晶片之間把資料搬過去的頻寬。台積電在 2026 年技術論壇丟出的兩個數字，把這條線標得很清楚：世界最大的 [5.5 倍光罩 CoWoS 封裝良率已經衝破 98%、進入量產](https://focustaiwan.tw/sci-tech/202605140021)；同時把光引擎疊進封裝的 COUPE 也在今年上線。看懂這兩件事，比追問「下一站幾奈米」更接近 AI 硬體現在真正卡在哪。

<img src="/covers/cowos-coupe-ai-chip-bottleneck.webp" width="1200" height="800" loading="lazy" decoding="async" alt="先進封裝的晶片與電路特寫，象徵 AI 晶片瓶頸從製程移到封裝">

## 先看那兩個數字代表什麼

先把量尺換掉。過去談製程進步，單位是奈米：7 奈米、5 奈米、3 奈米，愈小愈好。現在台積電拿出來講的封裝單位是「光罩倍數」，5.5 倍光罩的意思是這顆封裝的面積等於五顆半的最大單晶片攤在一起。這不是一顆晶片，是一整塊把運算晶片、記憶體黏在一片矽中介層上的拼盤。這塊拼盤的良率能到 98% 以上，是 2026 這批 AI 加速器真正能量產出貨的關鍵。需求端也對得上：台積電估 [AI 加速器晶圓的需求，從 2022 到 2026 會成長 11 倍](https://www.trendforce.com/news/2026/05/14/news-tsmc-sees-ai-wafer-demand-rising-11x-from-2022-2026-targets-cowos-with-24-hbm-stacks-in-2029/)。這麼多算力要塞進機櫃，靠的不是把電晶體再縮小，是把更多晶片拼得更大、拼得良率夠高。

<img src="/images/cowos-coupe-ai-chip-bottleneck-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體矽晶圓製造，象徵 AI 加速器晶圓需求四年成長 11 倍">

## 為什麼瓶頸會從製程搬到封裝

追這件事的根因，要回到一個物理天花板。曝光機一次能印的晶片面積有上限，這個上限叫光罩尺寸（reticle）。單一顆晶片再怎麼設計，做不到比一張光罩更大。但一顆 AI 晶片要的運算單元和記憶體頻寬，早就超過一張光罩塞得下的量。解法不是繼續縮電晶體，是換方向：把好幾顆晶片和多層 HBM 記憶體，黏到同一片更大的中介層上，讓它們像一顆晶片那樣一起工作。CoWoS 做的就是這件事。所以量尺才會從奈米變成光罩倍數。台積電的路線圖也照這個方向走：[2028 年做到 14 倍光罩、整合 20 顆 HBM，2029 年再往上到 24 顆 HBM](https://focustaiwan.tw/sci-tech/202605140021)。製程還在前進，但決定一顆 AI 晶片能有多強的，現在是封裝能拼多大、拼多穩。

<img src="/images/cowos-coupe-ai-chip-bottleneck-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="晶片與處理器裸晶特寫，象徵 CoWoS 把多顆晶片黏在同一片中介層上">

## 下一道牆：資料在晶片之間怎麼搬

拼得夠大之後，下一個卡點浮出來：這麼多晶片黏在一起，彼此之間要搬的資料量爆炸，而傳統的銅線在功耗和距離上撐不住。這就是 COUPE 要解的題。COUPE 是台積電的緊湊型通用光子引擎，[做法是用 SoIC-X 堆疊技術，把電晶片直接疊在光子晶片上](https://pr.tsmc.com/english/news/3136)，讓資料在晶片邊界就轉成光訊號送出去，用光取代一部分銅線。官方給的帳很漂亮：[跟傳統堆疊比，功耗效率提升 5 到 10 倍、延遲降低 10 到 20 倍](https://www.trendforce.com/news/2026/04/01/news-silicon-photonics-race-intensifies-as-tsmc-targets-2026-coupe-production-samsung-eyes-2029-cpo-turnkey/)。時程上，[COUPE 先在 2025 年通過小型可插拔光模組的驗證，2026 年整合進 CoWoS 封裝，做成共封裝光學（CPO）](https://pr.tsmc.com/english/news/3136)，把光連接直接拉進封裝裡；[全球第一顆用 COUPE 的 200Gbps 微環調變器也在 2026 進入量產](https://www.trendforce.com/news/2026/05/14/news-tsmc-sees-ai-wafer-demand-rising-11x-from-2022-2026-targets-cowos-with-24-hbm-stacks-in-2029/)。這一步很關鍵，因為它把互連從封裝外的插拔光模組，往封裝內移了一格。

<img src="/images/cowos-coupe-ai-chip-bottleneck-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="光纖傳輸的光訊號，象徵 COUPE 把光引擎搬進封裝、用光取代銅線">

## 這是解對題，還是解錯題

我一向的習慣是先問：你打算解的到底是哪一類問題。如果一直盯著「下一站幾奈米」，其實是在盯一個已經不是主要瓶頸的地方。製程當然還在推，[台積電的 A16 製程照計畫 2026 下半年量產](https://focustaiwan.tw/sci-tech/202605140021)。但真正決定 2026 這批 AI 晶片能不能出貨、出多少的，是封裝良率和封裝產能。台積電自己也把資源往這邊倒：[CoWoS 與 SoIC 先進封裝產能，預計到 2027 年以每年超過 80% 的速度成長](https://focustaiwan.tw/sci-tech/202605140021)。把問題分層才看得清楚：製程是「單顆晶片能多快」，封裝是「多顆晶片能不能拼成一顆」，光子互連是「拼起來之後資料搬不搬得動」。這三層根因不同，混在一起用「幾奈米」一個指標去看，就會看歪。

<img src="/images/cowos-coupe-ai-chip-bottleneck-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 資料中心的伺服器機櫃，象徵瓶頸沿製程、封裝、互連頻寬逐段位移">

## 台灣該讀出什麼

台灣最容易把這條新聞讀成「台積電封裝很強，會多接單」。這個方向沒錯，但只做到這一步就太淺了。真正的重點是護城河的位置在移動：台積電的競爭優勢，正從電晶體那一格，延伸到封裝和光子整合這一段。一顆 5.5 倍光罩的 CoWoS，要的不只是先進製程，還要中介層、載板、HBM 記憶體，以及 COUPE 這種把光學塞進封裝的整合能力。這裡有個現實要講清楚：記憶體不是台積電做的，HBM 掌握在南韓的三星和 SK 海力士手上，光學元件也有各自的供應鏈。所以台灣的卡位點，是去吃這些會被封裝需求拉動的環節，中介層、載板、光學元件、封裝設備與材料，而不是把眼光只放在雲端那顆大晶片的代工訂單。這波賭的是整條把 AI 晶片拼起來、串起來的底層，不是單一顆晶片的製程領先。看懂瓶頸往哪裡移，比記住 98% 這個數字重要。

<img src="/images/cowos-coupe-ai-chip-bottleneck-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與電子零組件製造，象徵台灣供應鏈在封裝與光學元件的卡位點">

## 常見問題

<p><strong>CoWoS 是什麼？跟幾奈米製程差在哪？</strong><br>製程講的是單一顆晶片內電晶體多小（幾奈米），CoWoS 是先進封裝技術，把好幾顆已經做好的晶片和 HBM 記憶體黏在同一片矽中介層上，讓它們像一顆超大晶片一起工作。AI 晶片的運算量早就超過一張光罩能印的單晶片上限，所以要靠封裝把多顆拼起來。台積電目前量產的是<a href="https://focustaiwan.tw/sci-tech/202605140021">世界最大的 5.5 倍光罩 CoWoS，良率已破 98%</a>。</p>

<p><strong>台積電的 COUPE 光子引擎在解什麼問題？</strong><br>解晶片之間搬資料的頻寬與功耗問題。當很多晶片黏在一起，彼此要傳的資料量太大，傳統銅線在功耗和距離上撐不住。COUPE 把光引擎疊進封裝、用光取代部分銅線，官方稱<a href="https://www.trendforce.com/news/2026/04/01/news-silicon-photonics-race-intensifies-as-tsmc-targets-2026-coupe-production-samsung-eyes-2029-cpo-turnkey/">功耗效率提升 5 到 10 倍、延遲降低 10 到 20 倍</a>，2026 年隨 CoWoS 一起做成共封裝光學。</p>

<p><strong>AI 晶片的供給瓶頸到底卡在哪一段？</strong><br>2026 年的主要瓶頸不是製程，是封裝良率與封裝產能，接下來會再往晶片間的光學互連移動。台積電正把資源往這邊倒，<a href="https://focustaiwan.tw/sci-tech/202605140021">CoWoS 與 SoIC 先進封裝產能預計到 2027 年以每年超過 80% 的速度成長</a>。只盯著「下一站幾奈米」，會錯過真正決定能不能出貨的那一層。</p>

<p><strong>這對台灣供應鏈是機會還是只是接單？</strong><br>是機會，但別讀成單純多接雲端 GPU 代工的單。護城河正從電晶體延伸到封裝與光子整合，被拉動的是中介層、載板、光學元件、封裝設備與材料這些環節。記憶體（HBM）掌握在南韓廠商手上，台灣的卡位點在封裝這條鏈上的其他段，而不是只守在大晶片代工那一格。</p>
