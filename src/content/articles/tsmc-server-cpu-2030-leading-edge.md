---
title: "AI 之外的另一條長線：瑞銀估 2030 年伺服器 CPU 衝 7,000 萬顆，回頭吃台積電先進產能"
slug: "tsmc-server-cpu-2030-leading-edge"
description: "市場盯著 GPU，但伺服器 CPU 的換機潮與晶片變大同樣在拉先進製程需求。瑞銀估到 2030 年伺服器 CPU 出貨衝 6,300 萬至 7,000 萬顆、每月得多吃 20 萬片前沿晶圓，是台積電被低估的一條成長軸。"
excerpt: "瑞銀估全球伺服器 CPU 出貨從 2025 年 2,300 萬顆增至 2030 年 6,300 萬至 7,000 萬顆、CAGR 30%，光這一項每月就要 20 萬片前沿晶圓。盯 GPU 的人很多，盯這條的人少；報告當天台積電收 2,310 元創高。"
publishDate: "2026-07-17T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["伺服器 CPU", "台積電先進製程", "瑞銀證券報告", "AI 算力供應鏈", "Arm 伺服器晶片"]
coverImage: "covers/tsmc-server-cpu-2030-leading-edge.webp"
coverAlt: "半導體晶圓與處理器晶片特寫，象徵伺服器 CPU 拉動台積電先進製程產能"
coverImageCredit: "Photo by Laura Ockel on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "financial"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出；文中投資相關內容僅為觀點分析，非投資建議。"
highlights:
  - "瑞銀證券最新報告估，全球伺服器 CPU 出貨量從 2025 年的 2,300 萬顆增加到 2030 年的 6,300 萬至 7,000 萬顆、年複合成長率 30%，光伺服器 CPU 到 2030 年每月就要多吃約 20 萬片前沿晶圓。"
  - "兩股力量同時在拉先進製程：雲端把 x86 主機 CPU 換成自研 Arm 晶片（如 AWS Graviton5 用台積電 3nm），加上 AMD EPYC『Venice』做到 256 核的 2nm 處理器，晶片變大、出貨變多，吃掉的晶圓面積是相乘的。"
  - "瑞銀估 2030 年光來自 Arm 與 AMD 的需求就能替台積電帶來約 441 億美元營收、約占整體 11%，目標價上看 3,000 元；報告當天台積電收 2,310 元、創收盤新高。"
references:
  - title: "台積電飆到2310元還太便宜？外資喊3000、聯發科目標價震撼全市場"
    url: "https://www.businessweekly.com.tw/business/blog/3021485"
    publisher: "商周／經濟日報"
    note: "瑞銀報告：伺服器 CPU 出貨 2025 年 2,300 萬顆增至 2030 年 6,300 萬至 7,000 萬顆、CAGR 30%；2030 年每月需 20 萬片前沿晶圓；台積電 25 日收 2,310 元創收盤新高、目標價 3,000 元"
  - title: "外資分別上調台積電、聯發科目標價至 3000 元、5922 元，雙創歷史新高"
    url: "https://statementdog.com/news/16576"
    publisher: "財報狗"
    note: "瑞銀估 2030 年 Arm 與 AMD 需求替台積電帶來 441 億美元營收、約占 11%；EPS 自今年 98.86 元成長至 2030 年 243.45 元；目標價 3,000 元"
  - title: "AMD begins production ramp of 256-core EPYC Venice — first 2nm HPC chip claims 70% performance leap"
    url: "https://www.tomshardware.com/tech-industry/semiconductors/amd-begins-production-ramp-of-256-core-epyc-venice-on-tsmcs-2nm-node"
    publisher: "Tom's Hardware"
    note: "AMD EPYC Venice 256 核、業界首顆量產的 2nm 高效能運算處理器、效能較上一代提升約 70%、台積電 2nm 製造"
  - title: "How Arm is redefining compute through the converged AI data center"
    url: "https://newsroom.arm.com/blog/arm-converged-ai-data-center-aws-graviton5"
    publisher: "Arm Newsroom"
    note: "2025 年出貨給頂級雲端業者的運算近一半為 Arm 架構；AWS Graviton 連三年占 AWS 新增 CPU 產能一半以上、前 1,000 大 EC2 客戶 98% 在用"
  - title: "Amazon keeps pressure on Intel, AMD with 192-core Graviton5"
    url: "https://www.theregister.com/2025/12/04/amazon_graviton_5/"
    publisher: "The Register"
    note: "AWS Graviton5 採 192 核 Arm Neoverse V3、由台積電 3nm 製造"
  - title: "NVIDIA GB200 NVL72"
    url: "https://www.nvidia.com/en-us/data-center/gb200-nvl72/"
    publisher: "NVIDIA"
    note: "GB200 NVL72 一櫃連接 36 顆 Grace CPU 與 72 顆 Blackwell GPU"
---

<p>市場習慣把 AI 的成長想成 GPU 一條線，但伺服器 CPU 的換機潮與晶片變大，同樣在把台積電的先進製程產能往上拉。瑞銀證券最新報告估，全球伺服器 CPU 出貨量會從 <a href="https://www.businessweekly.com.tw/business/blog/3021485" target="_blank" rel="noopener">2025 年的 2,300 萬顆，增加到 2030 年的 6,300 萬至 7,000 萬顆，年複合成長率 30%；光是伺服器 CPU，到 2030 年每月就要多吃約 20 萬片前沿晶圓</a>。這是被低估的一條成長軸：盯 GPU 的人很多，盯這條的人少。發報告當天，台積電收在 2,310 元、創收盤新高。</p>

<img src="/images/tsmc-server-cpu-2030-leading-edge-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="主機板上的伺服器 CPU 處理器特寫，象徵伺服器 CPU 的換機需求">

<h2>誰在換伺服器 CPU，為什麼換到台積電</h2>

<p>先講誰在換。最大一批是雲端業者，他們正在把資料中心裡的 x86 主機 CPU，換成自己設計的 Arm 晶片。Arm 官方說 <a href="https://newsroom.arm.com/blog/arm-converged-ai-data-center-aws-graviton5" target="_blank" rel="noopener">2025 年出貨給頂級雲端業者的運算有近一半是 Arm 架構，三季過後進度沒掉；其中 AWS 的 Graviton 連三年吃下 AWS 新增 CPU 產能的一半以上，前 1,000 大 EC2 客戶有 98% 在用</a>。這些自研晶片不是隨便找誰做，AWS 最新的 <a href="https://www.theregister.com/2025/12/04/amazon_graviton_5/" target="_blank" rel="noopener">Graviton5 是 192 核、用台積電 3nm 投片</a>，Google 的 Axion、微軟的 Cobalt 也走同一條路。雲端把 CPU 從 x86 換成自研 Arm，需求沒有離開台積電，反而更集中到它的先進製程。</p>

<p>還有一層常被漏掉：GPU 狂潮本身就帶著 CPU 需求。輝達的 <a href="https://www.nvidia.com/en-us/data-center/gb200-nvl72/" target="_blank" rel="noopener">GB200 NVL72 一櫃就搭 36 顆 Grace CPU 配 72 顆 Blackwell GPU</a>，這些 Grace 也是 Arm 架構、一樣在台積電投片。買越多 GPU，連帶要買越多主機 CPU，兩條需求其實是綁在一起長的。</p>

<img src="/images/tsmc-server-cpu-2030-leading-edge-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="雲端資料中心的伺服器機櫃，象徵雲端業者換用自研 Arm 主機 CPU">

<h2>晶片為什麼越做越大</h2>

<p>第二件事是晶片本身在長大。伺服器 CPU 的核心數一路往上堆：AMD 下一代 EPYC「Venice」<a href="https://www.tomshardware.com/tech-industry/semiconductors/amd-begins-production-ramp-of-256-core-epyc-venice-on-tsmcs-2nm-node" target="_blank" rel="noopener">直接做到 256 核，是業界第一顆進入量產的 2nm 高效能運算處理器，效能較上一代提升約 70%</a>。核心多、快取大、記憶體通道寬，晶片面積就跟著膨脹，加上製程往 3nm、2nm 推進，光罩成本與設計複雜度也一起墊高。一顆更大的晶片，乘上更多的出貨量，吃掉的前沿晶圓面積是相乘的，不是相加的。這正是瑞銀那個「每月 20 萬片」算得出來的底層原因。</p>

<img src="/images/tsmc-server-cpu-2030-leading-edge-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="多核處理器晶片與接腳特寫，象徵伺服器 CPU 核心數攀升、晶片面積膨脹">

<h2>對台積電月產能的排擠效應</h2>

<p>把這兩股力量加起來，對台積電的意義很具體：到 2030 年，<a href="https://www.businessweekly.com.tw/business/blog/3021485" target="_blank" rel="noopener">光伺服器 CPU 每月就要約 20 萬片前沿晶圓</a>，而這是疊在 GPU 與各家自研 ASIC 已經在搶的同一批先進製程產能之上。瑞銀估，<a href="https://statementdog.com/news/16576" target="_blank" rel="noopener">到 2030 年單是來自 Arm 與 AMD 的需求，就能替台積電帶來約 441 億美元營收、約占整體 11%，並把目標價上看 3,000 元、2030 年 EPS 從今年的 98.86 元拉到 243.45 元</a>。GPU 的故事大家講到爛了，這條伺服器 CPU 的線，是同一座晶圓廠裡的第二條需求曲線。</p>

<p>讀供應鏈別只看誰家模型強，要看需求最後連動到哪一段製程與封裝，這個三問框架我在<a href="/articles/deepseek-capital-taiwan-supply-chain/" target="_blank" rel="noopener">談中國 AI 資本與台廠供應鏈那篇</a>講過：誰在買單、買什麼、連動到哪。當伺服器 CPU、GPU、<a href="/articles/openai-jalapeno-inference-chip/" target="_blank" rel="noopener">像 OpenAI Jalapeño 那種自研推論 ASIC</a> 全擠進同一批前沿晶圓，先進製程產能就成了要排隊分配的稀缺資源，這跟我把<a href="/articles/anthropic-ipo-compute-supply-chain-signal/" target="_blank" rel="noopener">封裝與算力配額講成新資本市場那篇</a>是同一回事。</p>

<img src="/images/tsmc-server-cpu-2030-leading-edge-s4.webp" width="960" height="721" loading="lazy" decoding="async" alt="半導體晶圓與晶圓代工產線示意，象徵伺服器 CPU 排擠台積電先進製程月產能">

<h2>作者觀點：又一條長線，可以買進嗎</h2>

<p>看到這種數字，我第一個念頭很直接：感覺又有一條長線的投資可以買進了。這個直覺我不打算假裝沒有。但照我的老習慣，下注前先解對題，這條長線要成立，得有幾個前提同時撐住。</p>

<p>第一，需求別重複計算。GPU 機櫃裡那些 Grace 主機 CPU，本來就被算進 GPU 的故事，伺服器 CPU 這條線要乾淨地多出來，靠的是企業換機與雲端用自研 Arm 取代 x86 的真實增量，不是把同一顆 CPU 數兩次。第二，產能別被搶光、也別蓋過頭。前沿晶圓就這麼多，伺服器 CPU 得跟 GPU、ASIC 排隊，台積電肯不肯、來不來得及把產能開出來，決定那個 20 萬片是訂單還是願望。第三，先進製程的訂價權要守得住，量增但毛利被稀釋，長線就跑掉了。</p>

<p>這三格我會用同一套三問去盯：誰在買單、買什麼、需求最後落到哪一段製程與封裝。對得上，這條長線就值得放進觀察清單；對不上，它只是另一張漂亮的投影片。台積電收在 2,310 元創高，反映的是市場已經把 GPU 那條線定價進去；伺服器 CPU 這條被低估的線會不會補上，得看上面這幾格有沒有真的填滿。方向其實國家早就定了，政府把半導體與 AI 列為<a href="/articles/ai-new-infrastructure-compute-trusted-industries/" target="_blank" rel="noopener">五大信賴產業、要做晶片台灣隊</a>，但方向定了不等於每一段都吃得到，能不能接住，看的是落地，不是口號。這不是投資建議，是把題目拆給你自己判斷。</p>

<img src="/images/tsmc-server-cpu-2030-leading-edge-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="股市走勢圖與長線投資示意，象徵伺服器 CPU 題材是否為另一條可布局的長線">

<h2>常見問題</h2>

<p><strong>瑞銀為什麼說伺服器 CPU 是被低估的成長軸？</strong><br>因為市場焦點幾乎都在 GPU。瑞銀估<a href="https://www.businessweekly.com.tw/business/blog/3021485" target="_blank" rel="noopener">全球伺服器 CPU 出貨量會從 2025 年的 2,300 萬顆增加到 2030 年的 6,300 萬至 7,000 萬顆、年複合成長率 30%，光這一項到 2030 年每月就要多吃約 20 萬片前沿晶圓</a>。換機潮加上晶片變大，是 GPU 之外另一條拉動台積電先進製程的需求線。</p>

<p><strong>伺服器 CPU 換成 Arm，台積電還吃得到單嗎？</strong><br>吃得到，而且更集中。雲端業者把 x86 換成自研 Arm 晶片，這些晶片多在台積電先進製程投片，例如 <a href="https://www.theregister.com/2025/12/04/amazon_graviton_5/" target="_blank" rel="noopener">AWS Graviton5 是 192 核、用台積電 3nm 製造</a>；Arm 官方也說 <a href="https://newsroom.arm.com/blog/arm-converged-ai-data-center-aws-graviton5" target="_blank" rel="noopener">2025 年頂級雲端業者的運算近一半已是 Arm 架構</a>。架構換了，產能需求沒離開台積電。</p>

<p><strong>為什麼伺服器 CPU 晶片越做越大？</strong><br>核心數一直往上堆。AMD 下一代 EPYC「Venice」<a href="https://www.tomshardware.com/tech-industry/semiconductors/amd-begins-production-ramp-of-256-core-epyc-venice-on-tsmcs-2nm-node" target="_blank" rel="noopener">做到 256 核、是業界首顆量產的 2nm 高效能運算處理器，效能較上一代提升約 70%</a>。核心多、快取與記憶體通道變寬，晶片面積就跟著膨脹，同一片晶圓切出的 CPU 變少，等於吃掉更多前沿產能。</p>

<p><strong>台積電股價 2,310 元創高，跟這份報告有關嗎？</strong><br>有關。<a href="https://www.businessweekly.com.tw/business/blog/3021485" target="_blank" rel="noopener">報告發布當天台積電收在 2,310 元、創收盤新高，瑞銀把目標價上看 3,000 元</a>。但股價反映的多是已被定價的 GPU 動能，伺服器 CPU 這條線會不會兌現仍有變數，投資與否請自行判斷，本文非投資建議。</p>
