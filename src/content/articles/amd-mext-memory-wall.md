---
title: "AMD併購Mext：AI加速器戰場轉向記憶體牆"
slug: "amd-mext-memory-wall"
description: "AMD 六月中旬併購記憶體最佳化軟體公司 MEXT，用 AI 預測式分層把快閃記憶體當 DRAM 用。這筆沒公布金額的小案子，訊號比金額重要：AI 晶片的競爭正從堆算力，轉到餵不餵得動晶片的記憶體牆。台灣站在這條記憶體軍備賽上，該看懂容量與頻寬是兩個不同的問題。"
excerpt: "為什麼 AMD 不是再買一家算力公司，而是買記憶體軟體？因為堆更多 FLOPS 正在解錯題。晶片再快，資料餵不進去就是空轉，而餵資料這件事，卡在記憶體牆。"
publishDate: "2026-07-13T08:00:00+08:00"
updatedDate: 2026-08-22
category: "tech"
subcategory: "semiconductor"
tags:
  - "半導體"
  - "AI基礎建設"
  - "供應鏈"
coverImage: "covers/amd-mext-memory-wall.webp"
coverAlt: "資料中心記憶體晶片與電路示意，象徵 AI 加速器競爭從算力轉向記憶體牆"
coverImageCredit: "Photo by Steve A Johnson on Pexels"
author: "appi-editorial"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "AMD 六月中旬併購記憶體最佳化新創 MEXT，未公布金額；MEXT 的預測式記憶體引擎用 AI 預測資料存取，把便宜的快閃記憶體當高速 DRAM 的延伸，減少資料中心對昂貴 DRAM 的依賴。"
  - "這筆小案子的訊號在於：AI 加速器的競爭正從堆算力，轉到記憶體牆。算力兩年成長三倍、記憶體頻寬只增一點六倍，晶片再快也常卡在等資料，錢再砸在 FLOPS 上是解錯題。"
  - "但要踩剎車：MEXT 解的是容量與成本，不是頻寬。分析師直言軟體分層取代不了對延遲敏感的 DRAM，破不了頻寬牆；HBM 仍是主戰場，台灣的卡位點在成熟製程 DRAM 與 CoWoS 封裝。"
risksAndLimits:
  - "MEXT 交易未公布金額，實際財務效益與整合進度目前無法查證"
  - "文中記憶體漲價與廠商營收數字為 2026 年第一季資訊，後續走勢可能變動"
  - "預測式分層對延遲敏感應用的實際表現，內文僅引分析師觀點，未見獨立測試數據"
references:
  - title: "AMD acquires MEXT to add predictive memory optimization to its AI stack"
    url: "https://www.networkworld.com/article/4186201/amd-acquires-mext-to-add-predictive-memory-optimization-to-its-ai-stack.html"
    publisher: "Network World"
  - title: "AMD's MEXT Acquisition Is More Important Than Markets Realize. Here's How It Solves the Memory Bottleneck."
    url: "https://www.barchart.com/story/news/2634524/amds-mext-acquisition-is-more-important-than-markets-realize-heres-how-it-solves-the-memory-bottleneck"
    publisher: "Barchart"
  - title: "AMD (AMD) Buys MEXT To Tackle AI Data Center Memory Bottlenecks"
    url: "https://finance.yahoo.com/technology/ai/articles/amd-amd-buys-mext-tackle-190622796.html"
    publisher: "Yahoo Finance"
  - title: "Memory Wall Bottleneck: AI Compute Sparks Memory Supercycle"
    url: "https://www.trendforce.com/insights/memory-wall"
    publisher: "TrendForce"
  - title: "Rapid Contract Price Surge Drives 1Q26 DRAM Industry Up 81% QoQ, Says TrendForce"
    url: "https://www.trendforce.com/presscenter/news/20260601-13070.html"
    publisher: "TrendForce"
originalContribution: "本文把 AMD 併購 MEXT 放進『記憶體牆』的座標裡，拆開多數報導混談的『容量瓶頸』與『頻寬瓶頸』兩個不同問題，指出 MEXT 只攻前者、破不了後者，並交叉 TrendForce 的算力與頻寬成長落差、以及 Q1 2026 DRAM 漲價與南亞、華邦、力積電的實際數字，評估台灣在成熟製程 DRAM 與 CoWoS 封裝這兩段的卡位點。"
topics: ["taiwan-semiconductor-supply-chain"]
---

AMD 買了一家做記憶體軟體的小公司，沒公布金額，新聞熱度也不高。但這筆案子讀起來，是 AI 加速器競爭的一個轉向：從比誰的晶片算力大，轉到比誰餵得動晶片。晶片再快，資料搬不進去就是空轉，而搬資料這件事，卡在一道叫「記憶體牆」的牆上。AMD 這一步是承認，再把錢砸在算力上，愈來愈是解錯題。

先講發生什麼事。AMD 在六月中旬宣布[併購一家叫 MEXT 的記憶體最佳化新創](https://finance.yahoo.com/technology/ai/articles/amd-amd-buys-mext-tackle-190622796.html)，未揭露金額，技術會併進它的資料中心產品線，包含 Instinct GPU、EPYC CPU 與 Helios 機櫃平台。MEXT 做的不是硬體，是一套軟體。它的[預測式記憶體引擎會分析資料存取模式，用 AI 預測接下來要用到哪塊資料](https://www.barchart.com/story/news/2634524/amds-mext-acquisition-is-more-important-than-markets-realize-heres-how-it-solves-the-memory-bottleneck)，趕在處理器伸手要之前，先把它從慢的快閃記憶體搬回快的 DRAM。講白一點，就是把便宜的 flash 當成昂貴 DRAM 的延伸來用，讓伺服器不必一直加買 DRAM，就能撐更大的記憶體需求。

<img src="/images/amd-mext-memory-wall-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="伺服器記憶體模組與儲存硬體特寫，象徵預測式分層把快閃記憶體當 DRAM 延伸">

為什麼是現在買、買這個？因為記憶體變貴到誇張。[Gartner 的數字是，記憶體價格從 2025 年第三季起漲了近四倍](https://www.networkworld.com/article/4186201/amd-acquires-mext-to-add-predictive-memory-optimization-to-its-ai-stack.html)，並預估到 2026 年底 DRAM 加 SSD 的合計價格還要再漲一倍多。這不是一般缺貨。[TrendForce 統計，2026 年第一季 DRAM 產業營收季增 81%、衝到 970 億美元，標準型 DRAM 合約價一季就漲了 93% 到 98%](https://www.trendforce.com/presscenter/news/20260601-13070.html)。當一顆料的成本在幾個月內翻倍，任何能少用一點這顆料的軟體，價值都被放大。AMD 買 MEXT，買的就是在漲價潮裡幫客戶少加 DRAM 的能力。這波記憶體漲價潮的全貌，可參考[顯卡與記憶體同步齊漲，電腦為何變貴](/articles/gpu-memory-price-surge-2026/)。

<img src="/images/amd-mext-memory-wall-s2.webp" width="960" height="1280" loading="lazy" decoding="async" alt="資料中心伺服器機櫃排列，象徵記憶體頻寬跟不上算力成長的瓶頸">

但這裡要先踩一個剎車，因為多數報導把兩件不一樣的事混在一起講。記憶體其實有兩個瓶頸：一個是容量與成本（記憶體不夠大、DRAM 太貴），一個是頻寬（資料搬進搬出的速度不夠快）。真正被叫做「記憶體牆」的是後者。[TrendForce 的分析講得很清楚：AI 晶片算力兩年成長了三倍，記憶體頻寬只增加一點六倍，於是愈來愈多運算卡住的不是算力，是等資料到位](https://www.trendforce.com/insights/memory-wall)。這才是那道牆。MEXT 攻的是前一個問題，容量與成本；它讓 flash 分擔 DRAM 的活，減少要買的 DRAM 量。它並沒有、也不宣稱能把資料搬得更快去打破頻寬牆。

<img src="/images/amd-mext-memory-wall-s3.webp" width="960" height="720" loading="lazy" decoding="async" alt="DRAM 記憶體模組特寫，象徵容量成本與頻寬是兩個不同的記憶體問題">

分清楚這兩層，才不會把 MEXT 讀成銀彈。[分析師的看法也是這個方向：TechInsights 的 Manish Rawat 指出，記憶體最佳化能提升資料中心效率、壓低總持有成本（TCO），但對延遲敏感的應用，它取代不了 DRAM](https://www.networkworld.com/article/4186201/amd-acquires-mext-to-add-predictive-memory-optimization-to-its-ai-stack.html)。預測再準，也有預測失手的時候，那一下要去 flash 拿資料的延遲，對推論這種對時間很敏感的工作就是傷。所以正確的讀法是：MEXT 讓 AMD 的加速器在同樣的 HBM 之外，多榨出一層便宜的可用容量、把 TCO 壓下來，這是實打實的好處；但頻寬那道牆，還是得靠 HBM 這類高頻寬記憶體去硬扛。

<img src="/images/amd-mext-memory-wall-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 加速器晶片與處理器特寫，象徵 AMD 用軟硬整合堆疊對抗對手">

那 AMD 為什麼是買軟體，不是再蓋一條算力晶片產線？因為這場仗的形狀變了。過去比的是單顆晶片的規格，現在比的是整個堆疊：硬體加上把硬體榨到極致的軟體。Nvidia 的護城河從來不只是 GPU，是 CUDA 那一整套軟體生態把客戶黏住。AMD 補記憶體軟體這一塊，是在補自己堆疊的完整度，讓 Instinct 系列不只賣一顆晶片，還賣一套「同樣的 HBM 能撐更多工作、TCO 更低」的方案。這跟我先前寫[台積電 CoWoS 產能被 Nvidia 訂走逾七成](/articles/tsmc-cowos-nvidia-capacity-booking/)是同一條線的兩端：一端是把更多 HBM 疊上去的封裝軍備，一端是想辦法用同樣的記憶體做更多事的軟體軍備。兩邊都在圍著記憶體打。

<img src="/images/amd-mext-memory-wall-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓廠生產線，象徵台灣在記憶體軍備賽的成熟製程 DRAM 與封裝位置">

那台灣該從這條新聞讀出什麼。記憶體軍備賽對台灣是兩面刃，得分兩段看。頻寬那一段，主戰場是 HBM，台灣的位置在封裝，靠台積電的 CoWoS 把 HBM 疊到 GPU 旁邊，[AI 晶片需求短期看不到緩和](/articles/tsmc-wei-ai-demand-high-na-euv/)，這段的訂單很滿。容量那一段，是標準型與成熟製程 DRAM，這波漲價[南亞、華邦、力積電都吃到了，南亞第一季營收季增 60%、華邦季增 91%](https://www.trendforce.com/presscenter/news/20260601-13070.html)，因為三大原廠把產能都調去做 HBM 與高階伺服器 DRAM，成熟製程反而缺貨漲價。這裡有個要盯的變數：如果 MEXT 這類軟體真的讓每台伺服器少用一點 DRAM，長線會不會稀釋標準型 DRAM 的需求？短期不會，需求還在爆；但台灣做記憶體與封裝的廠，該把自己定位在哪一段、賭的是量還是價，得想清楚，不能只當這波是「反正 AI 缺料我就漲」。

把一家沒公布金額的小軟體公司買下來，AMD 是在用行動說一句話：AI 加速器的下一場仗不在算力那一格，在記憶體。這個判斷方向我認為讀對了地圖。但 MEXT 只是這場仗裡的一件工具，它解容量、壓成本，破不了頻寬牆。台灣站在這條鏈上，看懂容量跟頻寬是兩個不同的問題、自己在哪一段有真本事，比記住「AMD 又併了一家公司」重要。

<h2>常見問題</h2>

<p><strong>什麼是記憶體牆？跟記憶體不夠大是同一件事嗎？</strong><br>不是同一件事。記憶體牆講的是頻寬跟不上算力，也就是資料搬進搬出晶片的速度太慢，晶片常在等資料。TrendForce 的數字是 AI 晶片算力兩年成長三倍，記憶體頻寬只增一點六倍。「記憶體不夠大」是容量問題，「搬不夠快」是頻寬問題，MEXT 解的是前者，記憶體牆指的是後者。</p>

<p><strong>MEXT 的技術到底在做什麼？</strong><br>它是一套軟體，用 AI 預測接下來會用到哪塊資料，趕在處理器要之前先把它從慢的快閃記憶體搬回快的 DRAM。效果是讓便宜的 flash 分擔一部分昂貴 DRAM 的工作，資料中心不必一直加買 DRAM 就能撐更大的記憶體需求，藉此壓低總持有成本。</p>

<p><strong>AMD 買了 MEXT，就能不用 HBM 了嗎？</strong><br>不行。MEXT 解的是容量與成本，取代不了 HBM 這種高頻寬記憶體。分析師也指出，對延遲敏感的應用，軟體分層取代不了 DRAM。HBM 仍是 AI 加速器頻寬的主力，MEXT 是在 HBM 之外多榨出一層便宜可用的容量，兩者是互補不是替代。</p>

<p><strong>這對台灣記憶體與半導體廠是好是壞？</strong><br>短期偏好。HBM 帶動台積電 CoWoS 封裝訂單；成熟製程 DRAM 因原廠產能都調去做 HBM 而缺貨漲價，南亞、華邦、力積電第一季營收都明顯成長。要留意的長線變數是，MEXT 這類軟體若讓每台伺服器少用 DRAM，未來可能稀釋標準型 DRAM 的需求，廠商該想清楚自己賭的是量還是價。</p>
