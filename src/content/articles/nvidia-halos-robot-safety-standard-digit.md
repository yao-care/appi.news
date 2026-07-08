---
title: "NVIDIA 把自駕車安全變成標準品「Halos for Robotics」，人形機器人 Digit 第一個採用"
slug: "nvidia-halos-robot-safety-standard-digit"
description: "NVIDIA 6/22 推出 Halos for Robotics，把累積 18,600 工程年的自駕車安全資產做成一套可認證的機器人安全標準品，第一個採用的是 Agility Robotics 的 Digit。重點不在技術炫，在 NVIDIA 看懂人形機器人商業化的瓶頸是功能安全認證，不是靈不靈巧。"
excerpt: "為什麼 NVIDIA 要做這件不性感的安全苦工？因為機器人卡在認證過不了、進不了工廠，它的算力就賣不動；把安全做成標準品，等於掌握整個實體 AI 的信任邊界。"
publishDate: "2026-08-01T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["NVIDIA Halos", "人形機器人", "功能安全", "Agility Digit", "實體 AI", "台灣供應鏈"]
coverImage: "covers/nvidia-halos-robot-safety-standard-digit.webp"
coverAlt: "NVIDIA Halos 把自駕車安全堆疊做成人形機器人的功能安全標準品示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "NVIDIA 6/22 推出 Halos for Robotics，把內部累積超過 18,600 工程年的自駕車安全資產整包搬到人形機器人，第一個採用的是 Agility Robotics 的 Digit。"
  - "這步棋解的不是能力題而是信任題：人形機器人量產卡的是功能安全認證過不了、進不了有真人的工廠，NVIDIA 把送第三方認證前的準備工作也一起打包成標準品。"
  - "台灣已有能率、佳能入股 Agility，上銀、和大、富田、歐特明卡進機器人黃金三角；但門檻正往『符合功能安全、能納進 Halos 認證框架』的認證級零件移動。"
references:
  - title: "NVIDIA Announces Halos for Robotics, the Industry’s First Full-Stack Safety System for Physical AI"
    url: "https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai"
    publisher: "NVIDIA Newsroom"
  - title: "NVIDIA releases Halos, a full-stack safety system for robotics"
    url: "https://www.therobotreport.com/nvidia-releases-halos-a-full-stack-safety-system-for-robotics/"
    publisher: "The Robot Report"
  - title: "NVIDIA Launches NVIDIA Halos, a Full-Stack, Comprehensive Safety System for Autonomous Vehicles"
    url: "https://blogs.nvidia.com/blog/halos-safety-system-autonomous-vehicles/"
    publisher: "NVIDIA Blog"
  - title: "輝達機器人安全系統亮相 能率、佳能轉投資Agility成首家導入"
    url: "https://www.peoplenews.tw/articles/economic-news/39489"
    publisher: "民眾網"
  - title: "人形機器人商業化在即 台廠這4家搶進「黃金三角」供應鏈"
    url: "https://money.udn.com/money/story/5607/9481335"
    publisher: "經濟日報"
originalContribution: "本文以『NVIDIA 把安全從每家機器人商各自重蓋的苦工，變成可認證的標準品層』為分析框架，追問其背後『先降低整個產業進場門檻、再掌握實體 AI 信任邊界』的算盤，並交叉能率／佳能入股 Agility 與上銀／和大／富田／歐特明黃金三角布局，指出台灣零件的真正決勝點正從『規格好、成本低』移到『做得到功能安全認證級』。"
---

NVIDIA 6 月 22 日推出的 [Halos for Robotics](https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai)，做的不是更強的機器人，是把「機器人敢不敢進到有人的工廠」這件事變成一套可認證的標準品。它把 NVIDIA 內部累積超過 18,600 工程年的自駕車安全資產整包搬到人形機器人上，第一個採用的是 Agility Robotics 的 Digit。這則新聞的重點不在技術多炫，在 NVIDIA 看懂了人形機器人商業化的真正瓶頸不是靈不靈巧，是過不過得了功能安全這一關。

<img src="/images/nvidia-halos-robot-safety-standard-digit-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="人形機器人在物流倉庫中與人類工作者一起作業的示意">

先講清楚它解的是哪一題。過去兩年講人形機器人，大家的焦點都在「手夠不夠巧、腳穩不穩、大腦聰不聰明」。這些是能力問題。但要把一台會自己走、自己判斷的機器放進有真人上班的倉庫，卡住量產的往往不是能力，是另一件事：出事誰負責、保險公司敢不敢保、工安法規過不過得了。這是信任問題，跟模型參數多大沒關係。每一家機器人公司都得自己重蓋一套安全驗證，從硬體到軟體到第三方認證，蓋一次要好幾年。NVIDIA 這步棋，是把這段「每家重蓋一次」的苦工，變成可以直接拿來用的標準零件。

<img src="/images/nvidia-halos-robot-safety-standard-digit-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="自駕車以光達與感測器建構安全堆疊的示意">

Halos 不是新東西，[NVIDIA 2025 年 3 月的 GTC 就先為自駕車推過一版](https://blogs.nvidia.com/blog/halos-safety-system-autonomous-vehicles/)，把從雲端到車上的安全設計串成一套完整框架。這次是把同一套搬到機器人。內容分三層：硬體是內建安全功能的工業級運算模組 IGX Thor 加上 Holoscan 感測橋接；軟體是負責安全功能的 Halos OS，裡面含一組管外部感知的「由外而內」安全藍圖；最上面是一個 [AI 系統檢測實驗室](https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai)，幫廠商把整合成果準備到能送 TÜV Rheinland、UL Solutions、TÜV SÜD、exida、SGS、CertX 這些第三方去發認證。真正的價值在最後這段。安全能不能被外部機構背書，才是能不能進場的門票，而 NVIDIA 把送審前的準備工作也一起打包了。

<img src="/images/nvidia-halos-robot-safety-standard-digit-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="工業功能安全認證與檢測流程的示意">

Digit 是第一個上車的。要注意讀法：[Agility 是把 IGX Thor 與 Halos Core 這些元件整合進自家原本的安全系統](https://www.therobotreport.com/nvidia-releases-halos-a-full-stack-safety-system-for-robotics/)，接到它自研的人類偵測機制上，不是整台打掉換成 NVIDIA 的。所以「首個採用」是採用元件，不是全盤照抄，這個剎車要先踩。但方向很實在：Digit 現在的客戶是 Amazon、GXO、Schaeffler 跟豐田在加拿大的整車廠，都是真的有人在裡面走動的物流與製造現場。安全這關過不了，這些單就放不了量。Agility 選擇接上 Halos，等於承認自己重蓋一套認證級安全系統不划算，直接站在 NVIDIA 累積的自駕車安全資產上比較快。

<img src="/images/nvidia-halos-robot-safety-standard-digit-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="協作機器人在生產線上與工廠工人近距離作業的示意">

那 NVIDIA 為什麼要做這件看起來很不性感的苦工？追下去就會看到它的算盤。NVIDIA 賣的是算力，機器人是它下一個大市場。但如果每家客戶都卡在安全認證過不了、機器人進不了工廠，那算力也賣不動。把安全做成標準品，是先幫整個產業把最難的那道門檻降下來，門檻一低，跑在 NVIDIA 平台上的機器人才會變多。這裡有個更深的意圖：一旦第三方認證機構、保險公司、工廠採購都習慣用「有沒有過 Halos」來判斷一台機器人安不安全，NVIDIA 就不只是賣晶片，而是掌握了整個實體 AI 的安全標準。標準訂在誰手上，誰就掌握了這個產業的信任邊界。這比多賣幾顆晶片值錢得多。

<img src="/images/nvidia-halos-robot-safety-standard-digit-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="精密減速機與感測模組製造，象徵台灣機器人零件供應鏈">

台灣要從這條新聞讀出什麼？先看一個容易被漏掉的在地連結：Digit 背後就有台灣資金。[能率亞洲與佳能企業投了約一千萬美元進 Agility，成了這家「首個採用 Halos 廠商」的股東](https://www.peoplenews.tw/articles/economic-news/39489)，佳能還在爭取 Digit 視覺模組的開發與生產。往供應鏈看，[上銀、和大、富田、歐特明這四家已經卡進人形機器人的「黃金三角」](https://money.udn.com/money/story/5607/9481335)：關節減速機、多關節馬達、感測與視覺定位。台灣的底子一直都在硬體。但 Halos 這則新聞點出一個正在移動的門檻：以後這些零件要進得了會與人協作的機器人，光是規格好、成本低不夠，還得符合功能安全等級、能被納進 Halos 這種認證框架。入股與接單只是卡位的第一步，真正決勝的是能不能把零件做到「認證級」。誰先把自己的減速機、馬達、感測模組做成過得了功能安全的料，誰才真的在這條鏈上站穩，而不是只在旁邊等單。

<h2>常見問題</h2>

<p><strong>NVIDIA Halos for Robotics 到底是什麼？</strong><br>它是 NVIDIA 在 2026 年 6 月 22 日推出的一套人形機器人與實體 AI 的全堆疊安全系統，從安全運算硬體 IGX Thor、Halos OS 軟體，到協助送第三方認證的檢測實驗室都包在一起。核心是把 NVIDIA 累積超過 18,600 工程年的[自駕車安全設計](https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai)複用到機器人，讓廠商不必每家重蓋一套認證級安全系統。</p>

<p><strong>為什麼是 Agility 的 Digit 第一個採用？</strong><br>因為 Digit 已經進到 Amazon、GXO、Schaeffler 與豐田加拿大廠這些有真人走動的現場，安全認證是它放量的最大關卡。Agility 選擇[把 IGX Thor 與 Halos Core 整合進自家安全系統](https://www.therobotreport.com/nvidia-releases-halos-a-full-stack-safety-system-for-robotics/)，是判斷站在 NVIDIA 的自駕車安全資產上，比自己從頭蓋一套快也划算。</p>

<p><strong>這對台灣供應鏈有什麼影響？</strong><br>台灣已有能率、佳能入股 Agility，以及上銀、和大、富田、歐特明切進[人形機器人的關節、馬達與感測「黃金三角」](https://money.udn.com/money/story/5607/9481335)。但門檻正在往「符合功能安全、能被納進 Halos 認證框架」移動，零件光規格好、成本低不夠，得做到認證級才進得了會與人協作的機器人。</p>

<p><strong>「首個採用」代表 Digit 整台換成 NVIDIA 的系統嗎？</strong><br>不是。Agility 是採用 Halos 的部分元件並接上自家原有的人類偵測機制，不是整台打掉重換。所以這是元件層級的採用，Halos 能不能真的變成產業標準，還要看後續有多少廠商跟進、以及第三方認證是否普遍接受。</p>
