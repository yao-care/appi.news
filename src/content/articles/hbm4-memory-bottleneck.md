---
title: "HBM4 過三大廠認證、黃仁勳親赴南韓：AI 的瓶頸正從算力換成記憶體"
slug: "hbm4-memory-bottleneck"
description: "2026 年 6 月 5 日黃仁勳在首爾宣布三星、SK 海力士、美光全數通過 HBM4 認證，供應下一代 Vera Rubin 平台，還當場要 SK 海力士加開產能。一家 GPU 龍頭為記憶體親自跑一趟南韓，說明卡住 AI 的已經不是算力，而是記憶體與封裝這一段；台灣要卡的是 base die 代工與先進封裝，不是多接幾張 GPU 代工單。"
excerpt: "為什麼輝達執行長會為了記憶體親自飛一趟南韓？因為 Rubin 每顆 GPU 要塞 288GB HBM4、22TB/s 頻寬，餵不飽晶片再快也是空轉。瓶頸換位了。"
publishDate: "2026-07-30T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["HBM4", "記憶體牆", "輝達 Rubin", "先進封裝", "台灣供應鏈"]
coverImage: "covers/hbm4-memory-bottleneck.webp"
coverAlt: "堆疊的高頻寬記憶體晶片特寫，象徵 HBM4 成為 AI 的新瓶頸"
coverImageCredit: "Photo by Sergei Starostin on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "2026 年 6 月 5 日，黃仁勳在首爾宣布三星、SK 海力士、美光全數通過 HBM4 認證，供應下一代 Vera Rubin 平台，還當場要 SK 海力士加開產能；一家 GPU 龍頭為記憶體親自跑一趟南韓，等於宣告瓶頸換了位置。"
  - "Rubin 每顆 GPU 配 288GB HBM4、22TB/s 頻寬，約是 Blackwell 的 2.8 倍；但受 HBM4 認證與封裝卡關，TrendForce 估 Rubin 2026 年只佔輝達高階出貨約 22%，Blackwell 反而扛下七成以上。"
  - "HBM4 把記憶體底層（base die）搬上 4/5nm 邏輯製程、介面從 1024 拉到 2048-bit，等於把記憶體拉進晶圓代工與先進封裝的地盤；台灣真正的卡位點在 base die 代工與 CoWoS 封裝，不是多接幾張 GPU 代工單。"
references:
  - title: "Nvidia certifies Samsung, SK Hynix and Micron for Vera Rubin HBM4 supply"
    url: "https://finance.yahoo.com/sectors/technology/articles/nvidia-certifies-samsung-sk-hynix-133001560.html"
    publisher: "Yahoo Finance / Reuters"
  - title: "Inside the NVIDIA Vera Rubin Platform: Six New Chips, One AI Supercomputer"
    url: "https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/"
    publisher: "NVIDIA Technical Blog"
  - title: "Memory Wall Bottleneck: AI Compute Sparks Memory Supercycle"
    url: "https://www.trendforce.com/insights/memory-wall"
    publisher: "TrendForce"
  - title: "NVIDIA’s Rubin AI Chip Ramp Hits Fresh Snag as HBM4 Memory Crunch Clouds 2026"
    url: "https://ts2.tech/en/nvidias-rubin-ai-chip-ramp-hits-fresh-snag-as-hbm4-memory-crunch-clouds-2026/"
    publisher: "TS2 Space"
  - title: "HBM4 Standard Finalized: Merging Memory and Logic for AI"
    url: "https://markets.financialcontent.com/wral/article/tokenring-2026-2-2-hbm4-standard-finalized-merging-memory-and-logic-for-ai"
    publisher: "Financial Content"
originalContribution: "本文把『HBM4 三大廠全數過認證』這則供應鏈新聞，接上『記憶體牆』與 Rubin 出貨受制的數據，提出『AI 瓶頸正從算力換成記憶體與封裝』的分析框架，並依 HBM4 base die 改走邏輯製程這項結構變化，定位台灣在 base die 代工與先進封裝的實際切入點，而非多接幾張 GPU 代工單。"
---

AI 的下一個瓶頸不是算力，是記憶體。2026 年 6 月 5 日，輝達執行長黃仁勳親自飛到首爾，[宣布三星、SK 海力士、美光三家都通過認證](https://finance.yahoo.com/sectors/technology/articles/nvidia-certifies-samsung-sk-hynix-133001560.html)，可以供應下一代 Vera Rubin 平台要用的 HBM4 高頻寬記憶體。一家 GPU 龍頭的執行長，會為了記憶體供給親自跑一趟南韓、還當場開口要 SK 海力士加開產能，這件事本身就是重點：卡住 AI 往前跑的，已經不是繪圖晶片夠不夠快，而是餵給晶片的記憶體夠不夠、來不來得及。

<img src="/images/hbm4-memory-bottleneck-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="運算晶片與記憶體特寫，象徵 AI 效能瓶頸從算力轉向記憶體">

## 黃仁勳親自到首爾，是去把記憶體鎖好

先看這則新聞的分量。同一天，黃仁勳除了宣布三家過認證，還[公開要 SK 海力士增產，說全球半導體供給依然吃緊](https://finance.yahoo.com/sectors/technology/articles/nvidia-certifies-samsung-sk-hynix-133001560.html)。分配上，供應鏈分析師估 SK 海力士拿下 HBM4 約六到七成、三星兩到三成、美光補齊剩下的一小塊。

過去 GPU 龍頭談供應鏈，講的多半是台積電的先進製程和 CoWoS 封裝。這次不一樣，龍頭親自出面談的是記憶體。理由很直接：Rubin 這代平台的效能瓶頸，卡在 HBM4 供不供得上。認證這關全部放行、三家一起量產，對輝達的意義不是「多一個選擇」，而是「把下一代平台最容易缺料的那一段，先鎖進三家的產能裡」。這是龍頭在替自己排隊。

<img src="/images/hbm4-memory-bottleneck-s2.webp" width="960" height="720" loading="lazy" decoding="async" alt="半導體晶圓製造場景，象徵南韓記憶體大廠的 HBM4 產能">

## 瓶頸為什麼從算力換到記憶體

這裡要先把問題層次分清楚。很多人談 AI 缺貨，第一個反應是「GPU 不夠」。這個方向沒錯，但只停在這一步就會解錯題。真正的結構性問題是：算力衝得太快，記憶體餵不上。

[TrendForce 的分析](https://www.trendforce.com/insights/memory-wall)把這個困境講得很清楚：AI 模型需要的運算力兩年成長約三倍，但記憶體頻寬和晶片間互連頻寬的成長遠遠追不上，結果是大多數運算被記憶體存取和資料搬運卡住，而不是被原始算力卡住。這就是所謂的「記憶體牆」。晶片再快，資料進不來、出不去，也只是空轉。這也是為什麼同一份報告估 2026 年 HBM 的需求還會年增超過七成，錢正在往記憶體這一段擠。

換句話說，這一輪的軍備競賽已經從「誰的 FLOPs 比較高」，變成「誰餵得飽自己的晶片」。HBM4 就是這一仗的主戰場。

<img src="/images/hbm4-memory-bottleneck-s3.webp" width="960" height="638" loading="lazy" decoding="async" alt="電路板上的資料流動示意，象徵記憶體頻寬跟不上算力的瓶頸">

## Rubin 的規格就是證據

想知道瓶頸有多真，看 Rubin 的規格表就懂。輝達自己的技術部落格寫得很白：[每顆 Rubin GPU 最高配 288GB HBM4、聚合頻寬達 22TB/s](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/)，記憶體頻寬約是 Blackwell（HBM3e、8TB/s）的 2.8 倍。這一代的效能升級，很大一塊是靠記憶體堆出來的，不是只靠運算核心。

但堆得上去是一回事，供得上是另一回事。TrendForce 就[點名 Rubin 的量產可能因為 HBM4 認證、散熱與網路架構等關卡而延後](https://ts2.tech/en/nvidias-rubin-ai-chip-ramp-hits-fresh-snag-as-hbm4-memory-crunch-clouds-2026/)：估 2026 年輝達高階 GPU 出貨仍會由 Blackwell 扛下七成以上，Rubin 佔比反而從先前預期的 29% 下修到 22%。連龍頭的旗艦平台，都被記憶體與封裝這關拖住節奏。這件事我在[AMD 買下記憶體新創、把仗打到記憶體牆](/articles/amd-mext-memory-wall/)那篇談過同一條線：下一場競爭的軸心，已經從算力移到記憶體。

<img src="/images/hbm4-memory-bottleneck-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 加速器硬體示意，象徵 Rubin GPU 配置大量 HBM4 記憶體">

## HBM4 把記憶體拉進了邏輯製程的地盤

真正值得台灣注意的，是 HBM4 這一代的一個結構性轉變，藏在規格裡不太上新聞。

[定稿的 HBM4 標準把記憶體底層那顆邏輯晶片（base die）換了做法](https://markets.financialcontent.com/wral/article/tokenring-2026-2-2-hbm4-standard-finalized-merging-memory-and-logic-for-ai)：以前這顆用成熟的 DRAM 製程做，現在三星、SK 海力士改用 4nm、5nm 這種邏輯製程來做。同時，堆疊的實體介面從 1024-bit 加倍到 2048-bit、獨立通道從 16 條增到 32 條，讓單顆堆疊的頻寬突破 2TB/s。這顆 base die 走上邏輯製程之後，還能把記憶體控制器、甚至基本的運算搬進記憶體堆疊裡（記憶體內運算，PIM），估計可以替訓練叢集省下兩到三成的耗電。

這句話翻成白話：記憶體正在往晶圓代工廠的方向長。base die 一旦要用邏輯製程做，這一段就不再只是記憶體廠的事，而是進了台積電這種先進邏輯代工的地盤。SK 海力士也已經[綁上台積電來做 HBM4 的邏輯底層](/articles/sk-hynix-packaging-hbm-tsmc/)。記憶體與邏輯的界線，在 HBM4 這一代開始糊掉。

<img src="/images/hbm4-memory-bottleneck-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="晶圓微影製程示意，象徵 HBM4 base die 改走邏輯製程">

## 台灣該從這裡讀出什麼

台灣最強的是硬體，但這波很容易看歪成「AI 缺記憶體，跟台灣沒關係，那是韓國廠的事」。這個判斷漏掉了兩段。

第一段是 base die。HBM4 的邏輯底層走上先進製程，這一段的代工正好是台積電的本行；記憶體堆疊要黏上 GPU，靠的是 CoWoS 這類先進封裝，而這正是 2026 年整條 AI 供應鏈真正被卡住的瓶頸，產能早就被輝達、超微和雲端大廠訂滿。換句話說，記憶體這一仗打到最後，有一大段會落在台灣手上，只是它不叫「記憶體」，叫 base die 代工和先進封裝。這也是[南韓一邊砸錢擴 HBM 產能、重點卻擺在封裝](/articles/korea-hbm-packaging-national-bet/)的原因。

第二段是別把卡位點想成「多接幾張 GPU 代工單」。真正的機會在那些會碰到記憶體與封裝的環節：base die 的邏輯代工、CoWoS 的產能與良率、堆疊測試、還有把這些整合起來的能力。守在雲端 GPU 代工那一格等單，接到的是量；卡進 base die 與封裝這一段，卡的是別人繞不過去的位置。

<img src="/images/hbm4-memory-bottleneck-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="精密電子製造與先進封裝，象徵台灣在 HBM4 供應鏈的 base die 與封裝卡位點">



把記憶體從配角推上主戰場，是這一輪 AI 硬體最真實的轉向。黃仁勳親自到首爾，不是去談模型多聰明，是去確認自己餵不餵得飽下一代晶片。台灣站在這條供應鏈上，該問的不是「還能接多少單」，而是「HBM4 這代把價值搬到哪一段，我卡進去了沒有」。看懂瓶頸換了位置，比記住 288GB 這個數字重要。

<h2>常見問題</h2>

<p><strong>HBM4 是什麼？跟一般電腦的記憶體差在哪？</strong><br>HBM 是高頻寬記憶體，把多顆記憶體晶片垂直堆疊、貼在運算晶片旁邊，換到極高的資料傳輸頻寬，專門餵 AI 加速器。HBM4 是第六代，[介面從 1024-bit 加倍到 2048-bit、單顆堆疊頻寬突破 2TB/s](https://markets.financialcontent.com/wral/article/tokenring-2026-2-2-hbm4-standard-finalized-merging-memory-and-logic-for-ai)，遠高於一般電腦用的 DDR 記憶體。它不是拿來開文書軟體的，是拿來讓 GPU 不缺料的。</p>

<p><strong>為什麼說 AI 的瓶頸從算力換成記憶體？</strong><br>因為算力衝得比記憶體快太多。[TrendForce 指出 AI 需要的運算力兩年成長約三倍，記憶體與互連頻寬卻遠遠追不上](https://www.trendforce.com/insights/memory-wall)，結果多數運算是被資料搬不進搬不出卡住，而不是被算力卡住。晶片再快，餵不飽也是空轉，這就是「記憶體牆」。</p>

<p><strong>HBM4 三大廠都過認證，對輝達 Rubin 出貨代表什麼？</strong><br>代表輝達把最容易缺料的一段先鎖進三家產能。但供得上仍有變數，[TrendForce 估 Rubin 2026 年因 HBM4 認證與封裝等關卡，只佔輝達高階 GPU 出貨約 22%，由 Blackwell 扛下七成以上](https://ts2.tech/en/nvidias-rubin-ai-chip-ramp-hits-fresh-snag-as-hbm4-memory-crunch-clouds-2026/)。認證放行是解一半，量能爬坡是另一半。</p>

<p><strong>台灣在 HBM4 這一波的機會在哪？</strong><br>在 base die 的邏輯代工和先進封裝。HBM4 的記憶體底層[改用 4/5nm 邏輯製程來做](https://markets.financialcontent.com/wral/article/tokenring-2026-2-2-hbm4-standard-finalized-merging-memory-and-logic-for-ai)，正好是台積電的本行；記憶體堆疊黏上 GPU 靠的是 CoWoS 封裝，也是台廠強項。卡位點不是多接雲端 GPU 代工單，而是卡進這些別人繞不過去的環節。</p>
