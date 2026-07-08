---
title: "Qualcomm 傳 80 至 100 億美元收購 Tenstorrent：Jim Keller 的 RISC-V AI 晶片，台廠 fabless 怎麼讀"
slug: "qualcomm-tenstorrent-riscv-fabless"
description: "The Information 報導 Qualcomm 洽談以 80 至 100 億美元收購 Jim Keller 的 RISC-V AI 晶片新創 Tenstorrent，一年內估值翻了兩三倍。Qualcomm 買的不是一顆更快的晶片，是一條繞過 Nvidia 的路；台廠 fabless 該讀的不是『Arm 要完』，而是價值往哪一層搬。"
excerpt: "Qualcomm 缺一個可信的資料中心產品、缺自己控得住的指令集、缺 Jim Keller。Tenstorrent 一次補齊三樣。真正的問題不是 RISC-V AI 晶片好不好，是這筆錢在解哪一類題。"
publishDate: "2026-07-29T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["Qualcomm", "Tenstorrent", "RISC-V", "Jim Keller", "台廠 fabless", "AI 晶片"]
coverImage: "covers/qualcomm-tenstorrent-riscv-fabless.webp"
coverAlt: "象徵 Qualcomm 傳收購 RISC-V AI 晶片新創 Tenstorrent 的半導體示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "The Information 報導 Qualcomm 洽談以 80 至 100 億美元收購 Tenstorrent，比它 2025 年募資時的 32 億美元估值翻了兩三倍；這是一筆對 Nvidia 主導權投的反對票。"
  - "解對題的看法：Qualcomm 缺的不是一顆更快的 AI 晶片，是一套自己控得住的指令集、一個可信的資料中心故事、還有 Jim Keller；Tenstorrent 用 RISC-V 一次補齊，這才是 80 億美元買的東西。"
  - "台廠 fabless 別把這則新聞讀成『Arm 要完、RISC-V 贏了』；該讀的是價值往指令集與軟體棧那層搬，台灣的 RISC-V 卡位點是晶睿（Andes）這種 IP 供應商，不是又一顆代工晶片。"
references:
  - title: "Qualcomm in Talks to Acquire AI Chip Startup Tenstorrent for Up to $10 Billion, Reuters Reports"
    url: "https://finance.yahoo.com/technology/ai/articles/qualcomm-talks-acquire-ai-chip-230401789.html"
    publisher: "Yahoo Finance / Reuters"
  - title: "Qualcomm considers acquiring AI chip firm Tenstorrent"
    url: "https://www.datacenterdynamics.com/en/news/qualcomm-considers-acquiring-ai-chip-firm-tenstorrent/"
    publisher: "Data Center Dynamics"
  - title: "Qualcomm mulls taking over Jim Keller's Tenstorrent, report claims deal would value the company at between $8 billion and $10 billion"
    url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/qualcomm-mulls-taking-over-jim-kellers-tenstorrent-report-claims-deal-for-ai-chipmaker-would-value-the-company-at-between-usd8-billion-and-usd10-billion"
    publisher: "Tom's Hardware"
  - title: "Andes Technology"
    url: "https://en.wikipedia.org/wiki/Andes_Technology"
    publisher: "Wikipedia"
  - title: "10xEngineers and Andes Enable High-Performance AI Compilation for RISC-V AX46MPV Cores"
    url: "https://www.edge-ai-vision.com/2026/02/10xengineers-and-andes-enable-high-performance-ai-compilation-for-risc-v-ax46mpv-cores/"
    publisher: "Edge AI and Vision Alliance"
originalContribution: "本文以『解對題 vs 解錯題』框架拆 Qualcomm 收購動機，指出它買的是指令集主導權、資料中心切入點與 Jim Keller 三合一，而非單顆晶片；並把台廠 fabless 的解讀從『Arm vs RISC-V 誰贏』導向『價值往指令集與軟體棧那層搬』，以台灣唯一的 RISC-V founding Premier 會員晶睿（Andes）為在地錨點，給出分層判斷。"
---

Qualcomm 想買的不是一顆更快的 AI 晶片，是一條繞過 Nvidia 的路。科技媒體 The Information 6 月報導，Qualcomm 正洽談以 80 至 100 億美元收購 Jim Keller 領軍的 RISC-V AI 晶片新創 Tenstorrent，[路透社跟進但無法獨立查證](https://finance.yahoo.com/technology/ai/articles/qualcomm-talks-acquire-ai-chip-230401789.html)。真正要問的不是「RISC-V 的 AI 晶片行不行」，而是這 80 億美元在解哪一類題。我的答案是：Qualcomm 缺一個自己控得住的指令集、缺一個可信的資料中心產品、缺 Jim Keller，Tenstorrent 一次補齊三樣。看懂這個，比記住金額重要。

<img src="/images/qualcomm-tenstorrent-riscv-fabless-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="百億美元半導體收購案的晶片與電路板示意">

先把數字擺清楚。Tenstorrent 2016 年成立，[2024 年 12 月 D 輪募到 6.93 億美元、估值 26 億美元](https://www.datacenterdynamics.com/en/news/qualcomm-considers-acquiring-ai-chip-firm-tenstorrent/)，2025 年一度洽談以 32 億美元估值再募 8 億。這輪傳出的 [80 至 100 億美元](https://www.tomshardware.com/tech-industry/artificial-intelligence/qualcomm-mulls-taking-over-jim-kellers-tenstorrent-report-claims-deal-for-ai-chipmaker-would-value-the-company-at-between-usd8-billion-and-usd10-billion)，等於一年內估值翻了兩三倍。消息傳出當天，Qualcomm 股價在盤後小跌約 1%。這裡要先踩個剎車：談判還在進行、對價可能是現金加股票、兩家公司都不評論，隨時可能破局。所以下面談的是「Qualcomm 為什麼想買」，不是「這筆交易一定會成」。

<img src="/images/qualcomm-tenstorrent-riscv-fabless-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="RISC-V 開放指令集晶圓與 AI 加速晶片示意">

Tenstorrent 手上有兩樣東西。一樣是人：Jim Keller，[前蘋果晶片設計師，也主導過特斯拉自駕晶片](https://finance.yahoo.com/technology/ai/articles/qualcomm-talks-acquire-ai-chip-230401789.html)，半導體圈的傳奇架構師。另一樣是路線：Tenstorrent 做的是[跑在 RISC-V 開放指令集上、雲端與邊緣都用的 AI 加速器](https://www.datacenterdynamics.com/en/news/qualcomm-considers-acquiring-ai-chip-firm-tenstorrent/)。指令集（instruction set architecture，晶片看得懂的最底層指令規範）是整顆晶片的地基。市面上主流是 Arm 跟 x86，兩者都要授權金、規則別人訂。RISC-V 不一樣，它是開放標準，誰都能用、能改，不欠授權金。Qualcomm 現在手機晶片高度綁 Arm，去年還跟 Arm 打過授權官司。它要往資料中心走，最不想重演的就是「地基掌握在別人手裡」。

<img src="/images/qualcomm-tenstorrent-riscv-fabless-s3.webp" width="960" height="639" loading="lazy" decoding="async" alt="資料中心伺服器機櫃與網路線，象徵 AI 運算基礎設施">

所以這筆錢不是買晶片，是買一個能自己作主的地基，加上一個能把地基蓋成大樓的人。Qualcomm 執行長把資料中心稱作[「新的成長機會、是多元化策略的合理延伸」](https://www.datacenterdynamics.com/en/news/qualcomm-considers-acquiring-ai-chip-firm-tenstorrent/)，這一兩年它接連吃下 Alphawave Semi 跟 Arduino 補邊緣與連結技術，方向一致：分散對手機的依賴、往資料中心卡位。但這裡有個常見誤讀，以為買到 RISC-V 架構就等於能跟 Nvidia 打。不對。Nvidia 真正的護城河不是那顆 GPU，是 CUDA 這套跑了十幾年、開發者離不開的軟體生態。Tenstorrent 給的是硬體與指令集的自由，軟體那一段才是硬仗。開放指令集的世界裡，軟體棧至今還很分散，這是 Qualcomm 買回來之後才要開始打的仗，不是買下來就贏了。

<img src="/images/qualcomm-tenstorrent-riscv-fabless-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體工程師在實驗室檢視晶片，象徵台灣 IC 設計的 RISC-V 卡位">

那台廠 fabless（只做 IC 設計、不自建晶圓廠的公司）該從這則新聞讀出什麼？先講不該讀的：別讀成「Arm 要完、RISC-V 贏了」。這種二選一的框架會讓人看錯重點。該讀的是價值往哪一層搬。當一家買家願意花 80 億美元去買「一個自己控得住的指令集加一個能做軟體的人」，它在告訴市場：接下來的溢價不在多做一顆代工晶片，在誰握有指令集與軟體棧這兩層。台灣在這條線上不是沒有牌。[晶睿（Andes Technology）是新竹的 RISC-V CPU 矽智財（IP）供應商，2005 年成立、掛牌台股 6533](https://en.wikipedia.org/wiki/Andes_Technology)，2016 年加入 RISC-V International、2020 年成為創始 Premier 會員，是台灣少數站在這層地基上的公司。它今年 2 月推出的 [AX46MPV 向量核，就是衝著大型語言模型與 Transformer、同時打邊緣和資料中心](https://www.edge-ai-vision.com/2026/02/10xengineers-and-andes-enable-high-performance-ai-compilation-for-risc-v-ax46mpv-cores/)，還找上 10xEngineers 補一套 RISC-V 優先的 AI 編譯器。這跟 Qualcomm 的算盤是同一個方向：硬體之外，軟體棧要一起長。

<img src="/images/qualcomm-tenstorrent-riscv-fabless-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="主機板特寫，象徵台廠 fabless 面對開放指令集的策略抉擇">

給台廠 fabless 一個能明天早上就對號入座的分層判斷。第一層，你賣的是製造還是設計？純代工的位置最容易被商品化，這波跟你關係最遠。第二層，你握不握有指令集或核心 IP？握有的（像晶睿）站在被溢價的那一層，這則新聞是順風。第三層，你有沒有配套的軟體與工具鏈？只有矽智財沒有軟體棧，客戶還是難搬過來，這是台灣整體最弱、也最該補的一段。我之前寫過[錢從 GPU 換到 ASIC、台灣 IC 設計族群被重估](/articles/asic-over-gpu-taiwan-ic-design/)，也寫過[Arm 押注的台灣新秀衝上市、fabless 入場券怎麼讀](/articles/qbit-arm-taiwan-fabless-ipo/)，講的都是同一件事的不同切面：AI 晶片的價值正在往上游的架構與軟體移。Qualcomm 買 Tenstorrent 只是把這句話寫得更大聲。能不能接住，不會是因為誰的晶片跑得比較快，而是誰先把自己在指令集與軟體那兩層的位置定義清楚、把該長的能力先長出來。

<h2>常見問題</h2>

<p><strong>Qualcomm 收購 Tenstorrent 確定了嗎？</strong><br>還沒。這是 The Information 6 月的報導，路透社跟進但[無法獨立查證](https://finance.yahoo.com/technology/ai/articles/qualcomm-talks-acquire-ai-chip-230401789.html)，兩家公司都不評論，談判仍在進行、對價可能是現金加股票，隨時可能破局。傳出的收購價落在 80 至 100 億美元區間。</p>

<p><strong>RISC-V 是什麼，為什麼 Qualcomm 想要？</strong><br>RISC-V 是一套開放的指令集標準（晶片看得懂的最底層指令規範），誰都能免費使用與修改，不像 Arm、x86 要付授權金、規則由別人訂。Qualcomm 手機晶片高度綁 Arm、去年還打過授權官司，往資料中心走時想要一個自己控得住的地基，[RISC-V 加上 Jim Keller 正好補上這一塊](https://www.datacenterdynamics.com/en/news/qualcomm-considers-acquiring-ai-chip-firm-tenstorrent/)。</p>

<p><strong>買到 RISC-V 晶片就能打贏 Nvidia 嗎？</strong><br>沒那麼快。Nvidia 的護城河主要不在 GPU 本身，在 CUDA 這套開發者離不開的軟體生態。Tenstorrent 給的是硬體與指令集的自由，但開放指令集的軟體棧至今仍分散，這是收購之後才要開打的硬仗，不是買下來就贏。</p>

<p><strong>台廠 fabless 有沒有相關的 RISC-V 標的？</strong><br>有。[晶睿（Andes Technology，台股 6533）是新竹的 RISC-V CPU 矽智財供應商](https://en.wikipedia.org/wiki/Andes_Technology)，2020 年成為 RISC-V International 創始 Premier 會員，今年推出瞄準大型語言模型與 Transformer、[同打邊緣與資料中心的 AX46MPV 向量核](https://www.edge-ai-vision.com/2026/02/10xengineers-and-andes-enable-high-performance-ai-compilation-for-risc-v-ax46mpv-cores/)。它站在指令集這一層，是台灣在這波裡少數的直接關聯者。</p>
