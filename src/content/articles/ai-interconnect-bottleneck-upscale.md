---
title: "算力瓶頸正從晶片移到「互連」：Upscale AI 募 1.9 億，Nvidia 與 Salesforce 入列"
slug: "ai-interconnect-bottleneck-upscale"
description: "做 AI 資料中心網路交換機的 Upscale AI 於 6/22 拿到 1.9 億美元、估值衝上 20 億，Nvidia 與 Salesforce Ventures 入列。訓練大模型時 GPU 有一半時間在等網路送資料，稀缺點正從運算移到互連；台灣的機會不在多接雲端 GPU 代工，而在光通訊與共封裝光學這一段。"
excerpt: "為什麼 Nvidia 這個賣 GPU 的龍頭，要投資一家幫別人把 GPU 連起來的公司？因為 H100 訓練上兆參數模型時利用率只有 35-40%，最貴的晶片有一半時間在等網路。瓶頸換位了。"
publishDate: "2026-08-07T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["AI 互連", "資料中心網路", "Upscale AI", "共封裝光學", "台灣供應鏈"]
coverImage: "covers/ai-interconnect-bottleneck-upscale.webp"
coverAlt: "AI 資料中心裡連接 GPU 的高速網路互連示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "做 AI 資料中心網路交換機的 Upscale AI 於 6/22 拿到 1.9 億美元、估值 20 億，18 個月共募約 5 億；Nvidia 與 Salesforce Ventures 都入列，這是市場在把錢從『運算』搬向『互連』。"
  - "問題根本不在晶片不夠快：用 H100 訓練上兆參數模型時模型浮點運算利用率只有 35-40%，最貴的晶片有一半以上時間在等網路送資料，補算力是解錯題。"
  - "台灣的卡位點不在多接雲端 GPU 代工，而在互連這一段的光通訊與共封裝光學（CPO）；Nvidia 的 Spectrum-X CPO 交換機用的正是台積電 COUPE 矽光子平台。"
references:
  - title: "Upscale AI raises $190M from Nvidia, Salesforce Ventures for AI networking infrastructure, hits $2B valuation"
    url: "https://techstartups.com/2026/06/22/upscale-ai-raises-190m-from-nvidia-salesforce-ventures-for-ai-networking-infrastructure-hits-2b-valuation/"
    publisher: "Tech Startups"
  - title: "The Switch Is the Bottleneck: Why AI Infrastructure Has a Network Problem"
    url: "https://www.datacenterknowledge.com/switches-routers/the-switch-is-the-bottleneck-why-ai-infrastructure-has-a-network-problem"
    publisher: "Data Center Knowledge"
  - title: "Upscale AI Raises $190 Million as Nvidia Joins the Round"
    url: "https://www.artofthestart.com/upscale-ai-raises-190-million-nvidia/"
    publisher: "Art of the Start"
  - title: "Nvidia ships TSMC-backed CPO switches to tackle AI data center bottlenecks"
    url: "https://focustaiwan.tw/business/202606030020"
    publisher: "Focus Taiwan"
  - title: "AI Data Centers Are Shifting the Bottleneck from Chips to Critical Components"
    url: "https://www.capitalsight.net/2026/06/ai-data-centers-are-shifting-bottleneck.html"
    publisher: "Capital Sight"
originalContribution: "本文以「稀缺點在整個算力堆疊裡換位」為分析框架，串起 Upscale AI 募資名單（Nvidia＋Salesforce Ventures 進場網路層）、H100 訓練 35-40% 利用率的閒置數據，與 Nvidia／台積電 CPO 交換機的供應鏈事實，並延續本站對記憶體、電力瓶頸的追蹤，指出台灣真正的卡位點在光通訊與共封裝光學而非雲端 GPU 代工。"
---

算力的稀缺點正在換位。過去兩年大家搶的是更強的晶片，現在真正卡住 AI 訓練的，是晶片跟晶片之間那條把資料搬過去的線。6 月 22 日，做 AI 資料中心網路交換機的新創 Upscale AI [拿到 1.9 億美元、估值衝上 20 億美元](https://techstartups.com/2026/06/22/upscale-ai-raises-190m-from-nvidia-salesforce-ventures-for-ai-networking-infrastructure-hits-2b-valuation/)，領投是 Premji Invest，跟投名單裡有 Salesforce Ventures、Temasek，還有 Nvidia。這是市場在用真金白銀說一句話：瓶頸已經從運算，移到互連。

<img src="/images/ai-interconnect-bottleneck-upscale-s1.webp" width="960" height="509" loading="lazy" decoding="async" alt="創投資金流向 AI 網路基礎建設的抽象示意">

先看這家公司在做什麼。Upscale AI 成立不到一年半，做的是資料中心裡的網路交換機，晶片、系統跟軟體整包做，任務只有一個：讓 GPU 之間的資料[搬得又快又穩，讓那些貴到不行的晶片少花時間互相枯等](https://techstartups.com/2026/06/22/upscale-ai-raises-190m-from-nvidia-salesforce-ventures-for-ai-networking-infrastructure-hits-2b-valuation/)。兩位創辦人 Barun Kar 與 Rajiv Khemani 講得直接：AI 基礎建設正在以叢集規模重新定義，而網路是其中最關鍵的瓶頸之一。一家只做「連線」的公司估到 20 億、18 個月吸走約 5 億美元，這個估值本身就是訊號。

<img src="/images/ai-interconnect-bottleneck-upscale-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="貴重的處理器晶片在等待資料，象徵通訊頻寬成為瓶頸">

為什麼是互連，不是晶片？因為問題根本不在晶片不夠快。資料中心媒體 Data Center Knowledge 引用的數字很刺眼：用 H100 訓練上兆參數模型時，[模型浮點運算利用率（MFU）只有 35% 到 40%](https://www.datacenterknowledge.com/switches-routers/the-switch-is-the-bottleneck-why-ai-infrastructure-has-a-network-problem)，換句話說，全世界最貴的晶片有一半以上的時間在發呆，等資料從網路那頭送過來。你把晶片換更快的，這段等待不會消失，只會更明顯。這就是我一直在講的「解對題」：如果 GPU 的算力有一半浪費在等網路，那該補的是網路，不是再堆更多算力。把錢砸在更強的晶片上，是在解錯題。

<img src="/images/ai-interconnect-bottleneck-upscale-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="連接 GPU 叢集的網路交換機與纜線，象徵互連層">

更耐人尋味的是 Nvidia。它是賣 GPU 的龍頭，為什麼要投一家幫別人把 GPU 連起來的公司？因為互連做得越好，它的晶片就越值錢。Upscale 的 scale-out 交換機[本來就用 Nvidia 的 Spectrum-X 晶片](https://www.artofthestart.com/upscale-ai-raises-190-million-nvidia/)，投它等於把觸角伸進包在自家 GPU 外圍的網路層。這裡有個張力值得看懂：Upscale 打的是「開放標準」，用 UALink（讓 GPU 直接讀彼此記憶體的標準）跟 AI 專用的以太網，賣點就是不綁單一廠商的封閉架構，這其實跟 Nvidia 自家 NVLink 的私有生態隱隱對著幹。要踩個剎車：這筆錢是財務卡位還是真心押注開放標準，現在說不準。但方向很清楚，連 GPU 龍頭都在網路層下注。

<img src="/images/ai-interconnect-bottleneck-upscale-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="光纖與矽光子，象徵台灣光通訊與共封裝光學供應鏈">

台灣該從這條新聞讀出什麼？這裡有個最容易看歪的地方：以為「AI 網路變重要」就等於「多接一點雲端 GPU 代工的單」。不是。互連這一層越往高速走，越是台灣光通訊供應鏈的主場。銅線在速率拉高後會撞上距離與功耗的牆，業界正把資料傳輸從銅換成光，[這個從可插拔光模組轉向共封裝光學（CPO）的架構轉變，會把價值重新分配到整條供應鏈](https://www.capitalsight.net/2026/06/ai-data-centers-are-shifting-bottleneck.html)。而 CPO 這一段，[Nvidia 出貨的 Spectrum-X CPO 交換機用的正是台積電的 COUPE 矽光子封裝平台，單台吞吐量上看每秒 400 兆位元](https://focustaiwan.tw/business/202606030020)。光收發模組、矽光子、交換機代工，這幾段台灣本來就有底子。真正的卡位點，是去吃這些「互連專用」的光學與封裝零組件，而不是只守在雲端大晶片代工那一格。

<img src="/images/ai-interconnect-bottleneck-upscale-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="分層的技術堆疊，象徵瓶頸在晶片、記憶體、電力與互連之間移動">

把鏡頭拉遠。瓶頸不會消失，它只是在整個堆疊裡換位置。前陣子大家在吵[高頻寬記憶體供不應求](/articles/hbm4-memory-bottleneck/)，再前面是[資料中心的電力與電網卡住擴張](/articles/ai-datacenter-power-grid-bottleneck/)，現在輪到互連。每次瓶頸換位，錢就往新的稀缺點流。Upscale 這輪募資，是這條規律最新的一格。對台灣來說，重點不是記住 1.9 億這個數字，而是看懂下一個被搶的稀缺點，你的供應鏈站在哪一格。

<h2>常見問題</h2>

<p><strong>為什麼說 AI 的瓶頸從晶片變成互連？</strong><br>訓練大模型時，GPU 常常有一半以上時間在等資料經網路送達，H100 訓練上兆參數模型的<a href="https://www.datacenterknowledge.com/switches-routers/the-switch-is-the-bottleneck-why-ai-infrastructure-has-a-network-problem">模型浮點運算利用率只有 35% 到 40%</a>。晶片再快也解不了這段等待，真正卡住效能的是 GPU 之間的網路頻寬，也就是互連。</p>

<p><strong>Upscale AI 是做什麼的，為什麼估到 20 億美元？</strong><br>它做 AI 資料中心的網路交換機，把 GPU、記憶體、儲存高速連起來，讓昂貴晶片少枯等。6 月<a href="https://techstartups.com/2026/06/22/upscale-ai-raises-190m-from-nvidia-salesforce-ventures-for-ai-networking-infrastructure-hits-2b-valuation/">拿到 1.9 億美元、估值 20 億</a>，18 個月共募約 5 億，Nvidia 與 Salesforce Ventures 都入列。市場願意給這種估值，反映的是互連已成 AI 算力的稀缺點。</p>

<p><strong>Nvidia 賣 GPU，為什麼投資做網路的公司？</strong><br>因為互連越好，它的 GPU 越值錢。Upscale 的交換機<a href="https://www.artofthestart.com/upscale-ai-raises-190-million-nvidia/">用 Nvidia 的 Spectrum-X 晶片</a>，投資等於把觸角延伸進圍繞自家 GPU 的網路層。這也讓「連 GPU 龍頭都在網路層下注」這件事更值得留意。</p>

<p><strong>台灣在這一波互連商機的位置在哪？</strong><br>在光通訊與封裝這一段。高速互連正從銅線走向共封裝光學（CPO），Nvidia 的 Spectrum-X CPO 交換機就<a href="https://focustaiwan.tw/business/202606030020">用台積電 COUPE 矽光子平台、單台吞吐上看每秒 400 兆位元</a>。光收發模組、矽光子、交換機代工是台灣的強項，比單純雲端 GPU 代工卡位更深。</p>
