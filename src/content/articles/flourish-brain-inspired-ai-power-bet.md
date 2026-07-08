---
title: "主流靠堆算力與電力，Flourish 押『20 瓦』這條岔路：募 5 億美元、貝佐斯領投"
slug: "flourish-brain-inspired-ai-power-bet"
description: "Flourish 六月初募到 5 億美元、估值 25 億，貝佐斯領投。主流拆 AI 缺電牆的方法是蓋電廠、堆晶片；Flourish 賭根因在演算法架構，要讓 AI 像人腦一樣用 20 到 50 瓦跑。這是一場解對題與解錯題的分歧下注，但仿腦運算翻車史很長，25 億估值配零產品要冷讀。"
excerpt: "AI 缺電到底是『電不夠』還是『架構太笨』？主流砸錢蓋電廠，Flourish 拿貝佐斯的 5 億美元賭後者。這篇拆解這場下注賭的是哪一題，以及為什麼台灣該把它當長線訊號、而不是明天的答案。"
publishDate: "2026-07-24T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["仿腦運算", "神經形態運算", "Flourish 募資", "AI 耗電", "貝佐斯投資"]
coverImage: "covers/flourish-brain-inspired-ai-power-bet.webp"
coverAlt: "人腦與電腦晶片並置，象徵仿腦低功耗 AI 與主流高耗電運算的路線分歧"
coverImageCredit: "Photo by Yogendra  Singh on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Flourish 六月初募到 5 億美元、估值 25 億，貝佐斯先投約 5000 萬、後來幾乎加碼一倍到近 1 億，GV、Lux Capital、Catalio 跟投；公司目前沒有商用產品、沒有營收。"
  - "主流拆 AI 缺電牆的方法是補供給：蓋電廠、簽電力長約、堆更多晶片。Flourish 賭的是另一題，認為根因在演算法架構太耗能，目標是讓 AI 像人腦一樣用 20 到 50 瓦跑，而一張 H100 滿載就要 700 瓦以上。"
  - "仿腦運算翻車史很長，Intel 的 Loihi、IBM 的 TrueNorth 都沒能取代 GPU；學界指出真正卡關的常是軟體生態不是硬體。台灣整套 AI 硬體榮景押在『更多晶片更多瓦』這一邊，該把低功耗當長線訊號讀，別當明天就到的答案。"
references:
  - title: "AI startup Flourish reportedly raises $500M round backed by Jeff Bezos"
    url: "https://siliconangle.com/2026/06/04/ai-startup-flourish-reportedly-raises-500m-round-backed-jeff-bezos/"
    publisher: "SiliconANGLE"
  - title: "Flourish: $500 Million At $2.5 Billion Valuation Raised To Reinvent AI By Decoding The Brain's Core Algorithm"
    url: "https://pulse2.com/flourish-500-million-at-2-5-billion-valuation-raised-to-reinvent-ai-by-decoding-the-brains-core-algorithm/"
    publisher: "Pulse 2.0"
  - title: "A $500M Bet That a 20-Watt Brain Can Catch a 900-Watt GPU"
    url: "https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/"
    publisher: "Pebblous"
  - title: "Global energy demands within the AI regulatory landscape"
    url: "https://www.brookings.edu/articles/global-energy-demands-within-the-ai-regulatory-landscape/"
    publisher: "Brookings"
  - title: "The road to commercial success for neuromorphic technologies"
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12000578/"
    publisher: "Nature Communications (PMC)"
originalContribution: "本文把 Flourish 這輪募資放進『解對題 vs 解錯題』框架，指出主流是在補電力供給、Flourish 是在賭架構根因，兩者賭的其實是不同問題；再交叉 Loihi／TrueNorth 翻車史與神經形態運算學界對『瓶頸在軟體生態非硬體』的判讀，評估台灣硬體供應鏈把此事當長線訊號而非近期答案的定位。"
---

做仿腦 AI 的新創 Flourish，六月初宣布[募到 5 億美元、估值 25 億，由貝佐斯領投](https://siliconangle.com/2026/06/04/ai-startup-flourish-reportedly-raises-500m-round-backed-jeff-bezos/)。這條新聞真正的看點不是金額，是它賭的題目。AI 這兩年撞上一道缺電的牆，主流的拆法是補供給：蓋更多電廠、簽更長的電力長約、堆更多晶片，把不夠的瓦數補上。Flourish 賭的是另一題，它認為 AI 這麼耗電的根因在演算法架構本身太笨，不在瓦數不夠。這是一場「解對題 vs 解錯題」的分歧下注。但先踩個剎車：這條仿腦岔路歷史上翻過好幾次車，25 億估值配上零產品，別把它當成已經成真的答案。

<img src="/covers/flourish-brain-inspired-ai-power-bet.webp" width="1200" height="900" loading="lazy" decoding="async" alt="人腦與電腦晶片並置，象徵仿腦低功耗運算與主流高耗電路線的分歧">

先看這輪錢是誰掏的。貝佐斯[一開始承諾約 5000 萬美元，後來在其他大咖進場後幾乎加碼一倍，貼到近 1 億](https://siliconangle.com/2026/06/04/ai-startup-flourish-reportedly-raises-500m-round-backed-jeff-bezos/)，等於一個人吃下這輪約五分之一；跟投的還有 Alphabet 旗下的 GV、Lux Capital 與 Catalio。兩位創辦人來歷也不小：Thomas Reardon 當年在微軟主導做出 Internet Explorer，後來創辦腦機介面公司 CTRL-labs、2019 年被 Meta 收購；Rob Williams 是 Amazon 出身的資深主管。這種名單通常代表一件事：他們買的不是產品，是一個假設。因為[到這輪募資為止，Flourish 沒有商用產品、沒有營收](https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/)。

<img src="/images/flourish-brain-inspired-ai-power-bet-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="創投出資與投資人名單，象徵一輪押在假設而非產品的募資">

要看懂 Flourish 賭什麼，得先看主流在解哪一題。AI 缺電是真的：[Brookings 引國際能源總署（IEA）的數字，2024 年全球資料中心用掉約 415 太瓦時（TWh）電，約占全球用電 1.5%，而且以每年 12% 的速度在漲，到 2030 年上看 945 TWh，光美國就吃掉全球資料中心用電的 45%](https://www.brookings.edu/articles/global-energy-demands-within-the-ai-regulatory-landscape/)。面對這條曲線，業界的答案幾乎清一色是「補供給」：自己蓋電廠、鎖長約、押自研晶片。台灣也在同一條線上，[經濟部把十年用電預估上修到年均成長 2.5%，AI 與半導體被點名是最大推力](/articles/taiwan-power-demand-forecast-2035/)。這套解法的隱含前提是：問題出在電不夠，把電補上就好。

<img src="/images/flourish-brain-inspired-ai-power-bet-s2.webp" width="960" height="643" loading="lazy" decoding="async" alt="資料中心成排伺服器與供電設施，象徵主流用補供給的方式拆 AI 缺電牆">

Flourish 不接受這個前提。它反過來問：如果同樣的智慧，人腦用 20 瓦就跑得動，那 AI 動輒吃掉一整櫃機架的電，會不會不是電不夠，而是我們把架構做錯了？[人腦大約用 20 瓦跑推理、感知與學習，一張 Nvidia H100 滿載就要 700 瓦以上，中間差了約 30 倍](https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/)。Flourish 的做法是拿電子顯微鏡去研究大腦皮質的「皮質柱」（cortical column，被認為是資訊處理的基本運算單元），想從連結體學（connectomics）裡挖出大腦省電的「核心演算法」，再刻進晶片，[目標是讓它的 Cortex AI 系統用不到 50 瓦跑](https://pulse2.com/flourish-500-million-at-2-5-billion-valuation-raised-to-reinvent-ai-by-decoding-the-brains-core-algorithm/)。用我常講的框架說，主流在解「怎麼餵飽這個耗電怪獸」，Flourish 在解「這個怪獸該不該這麼耗電」，這是兩個根因不同的題目。如果耗電的根源真在架構，那再多電也只是治標。

<img src="/images/flourish-brain-inspired-ai-power-bet-s3.webp" width="960" height="540" loading="lazy" decoding="async" alt="抽象神經元與突觸網路，象徵大腦以極低功耗運算的核心演算法">

問題是，「架構才是根因」這個判斷，成立的條件現在一個都還沒兌現。仿腦運算不是新概念，[Intel 的 Loihi、IBM 的 TrueNorth 都試過，沒有一個能取代 GPU 這套典範](https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/)。更麻煩的是 Flourish 賭注的最底層假設本身就沒被證實：大腦到底存不存在一套統一的「核心演算法」，是神經科學吵了幾十年還沒答案的題目，而公司給的五年突破時程也只是承諾、不是保證。這裡還有一個常被忽略的關卡。[神經形態運算的學界回顧指出，這類技術一直商用不起來，卡的往往不是硬體效能，而是軟體生態：過去要把一個應用部署到仿腦晶片上，得花上『一個以上博士等級的工夫』，缺的是通用的程式設計模型](https://pmc.ncbi.nlm.nih.gov/articles/PMC12000578/)。硬體再省電，沒有讓一般工程師寫得動的工具鏈，一樣落不了地。25 億估值買到的，目前是一個很誘人的假設，不是一項已經驗證的技術。

<img src="/images/flourish-brain-inspired-ai-power-bet-s4.webp" width="960" height="540" loading="lazy" decoding="async" alt="實驗室顯微鏡與研究場景，象徵仿腦運算長年未兌現的商用化挑戰">

那台灣該怎麼讀這條新聞。台灣這波 AI 硬體榮景，幾乎整套押在「更多晶片、更多瓦」這一邊：先進製程、GPU 供應鏈、資料中心散熱與供電，賺的都是耗電怪獸胃口變大的錢。Flourish 這條岔路如果哪天真的走通，低功耗、能塞進裝置裡的邊緣運算會被重新定價，那對台灣是威脅也是機會，威脅在雲端那顆大晶片的故事會被稀釋，機會在感測、邊緣推論、超低功耗晶片這幾段台灣本來就有底子。但關鍵是別把長線訊號當成近期答案：這門技術以 2025 年估算全球商用營收才約 5000 萬美元的規模，離撼動 GPU 還很遠。務實的做法是把它當成一個要持續追蹤的方向，先看懂低功耗運算要的料是什麼、把該長的能力先放進雷達，而不是明天就轉頭。看懂它賭的是哪一題，比記住 5 億這個數字重要。

<img src="/images/flourish-brain-inspired-ai-power-bet-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶片與電路板特寫，象徵台灣在低功耗與邊緣運算供應鏈的卡位點">

<h2>常見問題</h2>

<p><strong>Flourish 到底在做什麼，跟 ChatGPT 那種 AI 一樣嗎？</strong><br>不一樣。ChatGPT 走的是靠堆算力與資料把模型做大的主流路線，Flourish 想從大腦省電的原理反推出一套新架構，目標是用[不到 50 瓦](https://pulse2.com/flourish-500-million-at-2-5-billion-valuation-raised-to-reinvent-ai-by-decoding-the-brains-core-algorithm/)跑出接近人腦的運算，走的是仿腦、低功耗這條岔路。它到這輪募資為止還沒有商用產品。</p>

<p><strong>人腦真的比 AI 晶片省那麼多電嗎？</strong><br>是。人腦大約用 20 瓦就能做推理、感知與學習，而[一張 Nvidia H100 繪圖晶片滿載就要 700 瓦以上，兩者差約 30 倍](https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/)。Flourish 的賭注就是這道差距代表 AI 的架構還有很大的省電空間。</p>

<p><strong>貝佐斯投了多少，還有誰跟投？</strong><br>貝佐斯[一開始約 5000 萬美元，後來幾乎加碼一倍到近 1 億](https://siliconangle.com/2026/06/04/ai-startup-flourish-reportedly-raises-500m-round-backed-jeff-bezos/)，約占這輪 5 億美元的五分之一；跟投的還有 Alphabet 旗下的 GV、Lux Capital 與 Catalio，公司投後估值 25 億美元。</p>

<p><strong>仿腦運算這次會成功嗎？</strong><br>沒人能保證。[Intel 的 Loihi、IBM 的 TrueNorth 過去都試過仿腦晶片、都沒能取代 GPU](https://blog.pebblous.ai/blog/flourish-brain-inspired-ai-500m/en/)，而大腦是否真有一套統一的「核心演算法」，神經科學至今沒有定論。[學界也指出這類技術常卡在軟體生態而非硬體](https://pmc.ncbi.nlm.nih.gov/articles/PMC12000578/)，所以現階段合理的態度是持續追蹤，而不是當成已經成真的答案。</p>
