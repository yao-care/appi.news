---
title: "Nvidia 挑戰者 Etched 出關：台積電試產成功、10 億美元訂單背後賭的是什麼"
slug: "etched-sohu-transformer-asic-bet"
description: "AI 晶片新創 Etched 6/30 走出隱身模式，用台積電 N4P 做出的 transformer 專用晶片 Sohu 首次流片就成功，手上握有超過 10 億美元訂單、估值衝到 50 億美元。但它真正賭的不是算力，是 transformer 這個架構會繼續當主流夠久；台灣在這條鏈上兩頭都沾，該看懂它壓的是什麼。"
excerpt: "為什麼一顆只會跑 transformer、其他什麼都做不了的晶片，能拿到 10 億美元訂單？因為它賭的是架構穩定性，不是算力。而這個賭注最大的破口，是主流模型正在往它接不住的方向走。"
publishDate: "2026-07-30T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags: ["Etched", "AI 晶片", "台積電", "Nvidia", "AI 推論"]
coverImage: "covers/etched-sohu-transformer-asic-bet.webp"
coverAlt: "半導體晶片特寫，象徵 Etched 用台積電製程做出的 transformer 專用推論晶片"
coverImageCredit: "Photo by Jakub Pabis on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Etched 6/30 走出隱身模式，用台積電 N4P 製程做出 transformer 專用晶片 Sohu、A0 首次流片就成功，手上握有超過 10 億美元簽約訂單，最新估值衝到 50 億美元。"
  - "Sohu 把注意力運算硬刻進電路、放棄通用性換效能，賭的是「transformer 架構會繼續當主流夠久」；一旦主流轉向 MoE 這類架構，這顆晶片就跟不上。"
  - "台灣在這條挑戰 Nvidia 的鏈上兩頭都沾：台積電是代工廠、旗下創投 VentureTech Alliance 是金主；但代工是架構中立的生意，Etched 卻是把身家壓在單一架構上，兩者賭的不是同一件事。"
references:
  - title: "Etched hits $5B valuation after booking $1B in AI chip sales"
    url: "https://cryptobriefing.com/etched-5b-valuation-ai-chip-sales/"
    publisher: "Crypto Briefing"
  - title: "Etched unveils Sohu chip and first inference system, plans summer shipments"
    url: "https://cryptobriefing.com/etched-sohu-chip-inference-system/"
    publisher: "Crypto Briefing"
  - title: "Nvidia rival Etched raises $800M with backing from Jane Street and a TSMC-linked fund"
    url: "https://thenextweb.com/news/etched-800-million-jane-street-tsmc-inference-chip"
    publisher: "The Next Web"
  - title: "Etched AI Sohu vs NVIDIA: Transformer ASIC vs General-Purpose GPU for LLM Inference (2026)"
    url: "https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/"
    publisher: "Spheron"
originalContribution: "本文把 Etched 出關這則募資新聞，從『10 億訂單／挑戰 Nvidia』的熱度框架，拆回它真正的賭注：transformer 專用 ASIC 賭的是架構穩定性而非算力，並用批次大小、MoE 主流化與 CUDA 生態三個變因評估這賭注的破口，再區分台積電代工（架構中立）與 VentureTech Alliance 出資（押注 Etched）兩種台灣角色的差別。"
---

Etched 這則新聞的重點，不是 10 億美元訂單，也不是又一個 Nvidia 挑戰者。重點是它賭的東西比做一顆更快的晶片難得多：它賭 transformer 這個架構會繼續當主流夠久，久到值得把彈性整個丟掉。這是一個關於「解對題還是解錯題」的賭注，不是一個關於算力的賭注。看懂它壓什麼，比記住那個訂單數字重要。

6 月 30 日，AI 晶片新創 Etched 正式走出隱身模式（stealth），[攤開一份到現在才公開的成績單](https://cryptobriefing.com/etched-sohu-chip-inference-system/)：用台積電 N4P 製程做出的推論晶片 Sohu、A0 版本第一次流片（tape-out）就成功、[手上已有超過 10 億美元的客戶簽約訂單](https://cryptobriefing.com/etched-5b-valuation-ai-chip-sales/)。公司同時揭露[累計募了 8 億美元、最新一輪估值來到 50 億美元](https://thenextweb.com/news/etched-800-million-jane-street-tsmc-inference-chip)，金主名單裡有 Jane Street、Peter Thiel，還有一個台灣人該多看一眼的名字：VentureTech Alliance，一支[與台積電關係緊密的創投基金](https://thenextweb.com/news/etched-800-million-jane-street-tsmc-inference-chip)。

<img src="/images/etched-sohu-transformer-asic-bet-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體製造與晶片製程，象徵 Etched 用台積電 N4P 試產成功的推論晶片">

先把這顆晶片在做什麼講清楚。Sohu 是一顆 ASIC（專用積體電路），只做一件事：跑 transformer 推論。它[把注意力（attention）運算直接刻成固定功能的電路，而不是像 GPU 那樣用可程式化的指令去算](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)。少了軟體那層轉譯的開銷，效能數字就很嚇人：Etched 說一台八顆晶片的伺服器，跑 Meta 的 Llama 70B [每秒可吐約 50 萬個 token](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)。這就是它敢喊挑戰 Nvidia 的底氣。

<img src="/images/etched-sohu-transformer-asic-bet-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="微晶片電路特寫，象徵把 transformer 注意力運算硬刻進固定功能電路">

但這裡要先踩一個剎車。那個嚇人的數字有前提。50 萬 token／秒是在批次大小（batch size）為 1 的情境下算的，[到了實際生產會用的批次大小，畫面會反過來](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)：一顆 H100 在批次 256 能到約 4.5 萬 token／秒，而 Sohu 在高批次下到底有多快，目前還沒有獨立驗證撐腰。Etched 為什麼敢這樣壓？因為它算的不是尖峰速度，是推論的單位成本。專用電路省下的是能耗和空間，賭的是同樣一筆推論工作，用 Sohu 跑比買一整櫃 GPU 便宜。這個帳能不能算得過去，要等真的機櫃出貨、真的客戶跑真的流量才知道。

<img src="/images/etched-sohu-transformer-asic-bet-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心伺服器機房，象徵 AI 推論效能與單位成本的取捨">

所以回到開頭那句：Etched 賭的是架構穩定性，不是算力。把注意力硬刻進電路，換來速度，代價是徹底失去彈性。Sohu [跑不了任何不對應到 transformer 注意力的運算](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)，這不是紙上談兵的顧慮。現在被下載最多的一批模型走的是 MoE（混合專家）路線，用動態路由決定每個 token 走哪條路，這種演算法[跟固定功能電路對不上](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)。Etched 自己說正在拿 [Llama、DeepSeek、Qwen、Mamba 做驗證](https://cryptobriefing.com/etched-sohu-chip-inference-system/)，但獨立分析直指純 transformer 以外的架構它接不住。還有一道更難翻的牆：Nvidia 的 CUDA 生態經營了十幾年，要搬到 Sohu 等於把整套推論的軟體堆疊拆掉重寫。速度再快，遷移成本這關過不過得去是另一回事。

<img src="/images/etched-sohu-transformer-asic-bet-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="抽象的神經網路示意，象徵 AI 模型架構可能從 transformer 轉向的變動風險">

那台灣該從這條新聞讀出什麼。台灣在這條挑戰 Nvidia 的鏈上，兩頭都沾：台積電是 Sohu 的代工廠、旗下的 VentureTech Alliance 是這輪的金主之一。但這裡有個容易看歪的地方，就是把它讀成「台積電又多接了一張大單」。代工當然是生意，可是要看清楚一件事：台積電的賭注和 Etched 的賭注不是同一個。台積電是架構中立的代工廠，Sohu 贏它做、Nvidia 贏它也做、下一個推翻 transformer 的架構贏它還是做，它賺的是製程領先，不押注哪個演算法會勝出。Etched 剛好相反，它把整間公司壓在單一架構上。台灣真正的位置，是站在那個「誰贏都要來找我做」的中立點上，這比跟著任何一家新創去賭某個架構穩不穩要安全得多。看懂 Etched 賭的是什麼，也就看懂了台灣為什麼不必跟著賭。

<h2>常見問題</h2>

<p><strong>Etched 的 Sohu 晶片和 Nvidia 的 GPU 差在哪？</strong><br>Sohu 是只會跑 transformer 推論的專用晶片（ASIC），把注意力運算[硬刻成固定電路](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)，換到很高的速度但失去彈性；Nvidia 的 GPU 是可程式化的通用晶片，什麼模型都能跑、有成熟的 CUDA 軟體生態。簡單說 Sohu 用「只做一件事」去換效能，GPU 用「什麼都能做」去守住通用性。</p>

<p><strong>10 億美元訂單代表 Etched 已經贏了嗎？</strong><br>不代表。那是[出貨前的簽約訂單](https://cryptobriefing.com/etched-5b-valuation-ai-chip-sales/)，第一批機櫃 2026 年夏天才要交，真正的效能要等客戶跑真實流量才驗證得了。目前公開的高速數字是在批次大小為 1 的條件下量的，[生產環境的高批次表現還沒有獨立驗證](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)。訂單反映的是市場願意先下注，不是結果已定。</p>

<p><strong>Sohu 這種專用晶片最大的風險是什麼？</strong><br>架構會變。Sohu 只能跑 transformer，一旦主流模型轉向它接不住的演算法就跟不上，而現在最紅的一批 MoE 模型[本來就跟固定功能電路對不上](https://www.spheron.network/blog/etched-ai-sohu-vs-nvidia-transformer-asic-inference/)。它賭的是 transformer 會繼續當主流夠久，久到把彈性丟掉還划算。這個前提成不成立，是它整盤棋的關鍵。</p>

<p><strong>台積電和這件事是什麼關係？</strong><br>台積電有兩層角色：一是 Sohu [用它的 N4P 製程代工生產](https://cryptobriefing.com/etched-sohu-chip-inference-system/)，二是[旗下創投 VentureTech Alliance 是 Etched 的投資人之一](https://thenextweb.com/news/etched-800-million-jane-street-tsmc-inference-chip)。但代工是架構中立的生意，誰的晶片它都能做，並不等於台積電押注 Etched 一定會贏。</p>
