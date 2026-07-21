---
title: "GPT-5 Pro 解開卡三年的 T 細胞之謎，還預測了一場沒看過的實驗：該讀懂的不是 AI 會做科學了"
slug: "gpt5-immunology-hypothesis-engine"
description: "免疫學家 Derya Unutmaz 把卡三年的 T 細胞資料集丟給 GPT-5 Pro，模型提出一套機制假說，還準確預測了一場未公開的殺傷實驗結果。真正該讀懂的是它在哪裡、為什麼有效：它是假說引擎，不是真相神諭。台灣有臨床資料，該想清楚稀缺的是什麼。"
excerpt: "GPT-5 Pro 幫免疫學家解開卡三年的 T 細胞謎題，還預測了沒公開過的實驗結果。但把這件事讀成『AI 會做科學了』，就解錯題了。"
publishDate: "2026-07-18T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["GPT-5", "醫療 AI", "免疫學", "科學研究自動化", "假說生成"]
coverImage: "covers/gpt5-immunology-hypothesis-engine.webp"
coverAlt: "象徵 AI 協助免疫學家分析 T 細胞資料、生成研究假說的抽象示意"
coverImageCredit: "Photo by turek on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Jackson Laboratory 免疫學家 Derya Unutmaz 把一份卡了三年（2022 起）的 T 細胞資料集交給 GPT-5 Pro，模型提出的機制假說：2-去氧葡萄糖不是造成能量不足，而是干擾 N-連結糖基化、削弱 IL-2 訊號，解除對 Th17 分化的抑制，且關鍵族群是記憶 T 細胞而非初始 T 細胞。"
  - "最硬的訊號是 GPT-5 準確預測了一場沒被公開的 CAR-T 殺傷實驗結果；但論文作者自己註明，一個相近故事先前放過 bioRxiv 預印本，不能完全排除訓練資料看過，這條界線要誠實劃清。"
  - "會有效的原因不是模型多聰明，而是三個條件缺一不可：領域專家手上有乾淨真實的資料集、專家能判斷生物學上合不合理、有 held-out 實驗當試金石。台灣有臨床資料，稀缺的是這條驗證迴路，不是 GPT-5 的 API。"
references:
  - title: "Early science acceleration experiments with GPT-5（含 Unutmaz 免疫學案例，Unutmaz 為共同作者）"
    url: "https://arxiv.org/abs/2511.16072"
    publisher: "arXiv"
  - title: "Early science acceleration experiments with GPT-5（HTML 全文，免疫學案例的機制與 CAR-T 預測細節）"
    url: "https://arxiv.org/html/2511.16072v1"
    publisher: "arXiv"
  - title: "GPT-5 Pro helps Derya Unutmaz crack a three-year T-cell mystery"
    url: "https://aiweekly.co/alerts/gpt-5-pro-helps-derya-unutmaz-crack-a-three-year-t-cell-mystery"
    publisher: "AI Weekly"
  - title: "Derya Unutmaz uses GPT-5 Pro to crack a T cell mystery that stumped his lab since 2022"
    url: "https://cryptobriefing.com/gpt5-pro-t-cell-immunology-discovery/"
    publisher: "Crypto Briefing"
  - title: "GPT-5 Pro Solves Immunological Puzzle"
    url: "https://www.startuphub.ai/ai-news/artificial-intelligence/2026/gpt-5-pro-solves-immunological-puzzle"
    publisher: "StartupHub.ai"
originalContribution: "本文以『假說引擎 vs 真相神諭』為分析框架，逐一拆解這則新聞真正的訊號（held-out 實驗預測）與被過度解讀的部分（相近故事曾入 bioRxiv 預印本的訓練資料疑慮），並用『可信度靠流程不是模型大小』重讀有效的三個結構性條件，延伸評估台灣臨床資料在這條驗證迴路上的真實卡位點。"
column: "ai-healthcare"
topics: ["medical-ai-frontline"]
---

GPT-5 Pro 幫一位免疫學家解開了卡三年的 T 細胞謎題，還準確預測了一場沒被公開過的實驗結果。這件事是真的，也確實漂亮。但真正該讀懂的不是「AI 會做科學了」，而是它在哪裡、為什麼有效：它是一台假說引擎，不是一座真相神諭。把它讀成後者，就對不上這件事的份量，也會在自己的研究現場解錯題。

<img src="/covers/gpt5-immunology-hypothesis-engine.webp" width="1200" height="900" loading="lazy" decoding="async" alt="象徵 AI 協助免疫學家分析 T 細胞資料、生成研究假說的抽象示意">

先講事件本身。主角是美國 Jackson Laboratory 基因體醫學研究所的免疫學家 Derya Unutmaz。他的實驗室從 [2022 年開始](https://cryptobriefing.com/gpt5-pro-t-cell-immunology-discovery/)累積一份 T 細胞資料，一直解釋不了：把人類 CD4+ T 細胞用 2-去氧葡萄糖（2-DG，一種擋住糖代謝的化合物）處理，之後洗掉、再用 IL-2 活化，這批細胞會持續偏向一種促發炎的 Th17 樣態。現象量得到，機制講不出來，卡了三年。他把這份資料集丟給 [GPT-5 Pro](https://aiweekly.co/alerts/gpt-5-pro-helps-derya-unutmaz-crack-a-three-year-t-cell-mystery)。

<img src="/images/gpt5-immunology-hypothesis-engine-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="研究人員分析卡三年的 T 細胞流式細胞資料集示意">

GPT-5 提的答案，方向跟原本的猜測不一樣。原本大家想的是「能量被砍了，細胞行為就受限」。模型指出：[2-DG 的效果比單純缺葡萄糖強得多，比較像是干擾了 N-連結糖基化](https://arxiv.org/html/2511.16072v1)，而不是能量不足。糖基化受損會讓 IL-2 受體的訊號（IL-2 / STAT5 這條路）變弱，而 IL-2 本來就是壓著 T 細胞不要變成 Th17 的那道剎車，剎車鬆了，Th17 就跑出來。它還多補一刀：真正被影響的是記憶 T 細胞，不是初始（naive）T 細胞，因為初始細胞高度依賴 IL-2 存活、也還沒有 Th17 的染色質預備狀態。這套推理在生物學上說得通，[也對得上該領域幾十年的既有知識](https://www.startuphub.ai/ai-news/artificial-intelligence/2026/gpt-5-pro-solves-immunological-puzzle)。

<img src="/images/gpt5-immunology-hypothesis-engine-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="N-連結糖基化與 IL-2 訊號路徑的分子機制假說示意">

真正硬的訊號，是下一步。Unutmaz 要 GPT-5 預測一場它沒被餵過結果的實驗：一組 CAR-T 殺傷測試。模型給出具體方向，[說 2-DG 前處理後、72 小時累積的殺傷力會更高，尤其在低 E:T 比例下](https://arxiv.org/html/2511.16072v1)，而這跟他手上還沒發表的實驗數據幾乎吻合。這一步比「生成一個聽起來合理的假說」重要得多，因為它把「真的在推理」和「把網路上的資料背出來」分了開來。但這裡要踩一個剎車，而且要誠實地踩：論文作者自己註明，有一個相近的故事（甘露糖回補實驗）先前放過 bioRxiv 預印本，所以不能百分之百排除模型在訓練資料裡見過相關線索。後續那些更細的機制推論看起來對該領域是新的，但「它預測了一場完全沒看過的實驗」這句話，得帶著這個但書講，才不算灌水。

<img src="/images/gpt5-immunology-hypothesis-engine-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="以未公開的 CAR-T 殺傷實驗當試金石驗證 AI 預測示意">

那它為什麼會有效？我的答案是：不是因為模型變聰明了，而是因為這次落地把該有的條件都湊齊了。至少三個，缺一個就跑不出這個結果。一，有一位領域專家，手上握著一份乾淨、真實、標得清楚的資料集；二，這位專家看得懂 AI 吐的東西是「生物學上合理」還是「只是講得順」；三，最後有一場 held-out 實驗當試金石，可以回頭驗。這三件事湊齊，模型才有發揮空間。可信度靠的是這整條流程，不是模型參數量。我之前寫[醫療 AI 合規守門引擎](/articles/medical-ai-compliance-gatekeeper-engine/)時就是這個立場：問題定義、資料供給、角色設計、驗證機制，缺一個就在那裡出問題，換更大的模型救不了。

<img src="/images/gpt5-immunology-hypothesis-engine-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="專家、乾淨資料集與驗證迴路三者缺一不可的研究流程示意">

還要把一件事分清楚：GPT-5 給的是假說，不是被證實的發現。這份成果[目前收在一篇 arXiv 論文裡](https://arxiv.org/abs/2511.16072)，機制還要靠濕實驗一步步驗，也還沒走完正式的同儕審查。「觀察到一個合理的機制」跟「有足夠證據支撐的結論」中間，隔著的不是「再多做幾次分析」，而是一段結構性的距離。把 AI 生成的假說直接當成結論宣佈「三年謎題破解」，是這類新聞最常見的解錯題。這也是我在[談 LLM 到底是不是救贖](/articles/llm-healthcare-promise-limits/)那篇的老話：訊號就說訊號，沒有走完驗證就不要說成定論。GPT-5 這次真正的貢獻，是把一個卡住的研究往前推了一大步，而不是替科學家把結論簽了名。

<img src="/images/gpt5-immunology-hypothesis-engine-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="AI 生成假說與經同儕審查驗證的發現之間存在系統性距離示意">

那台灣該從這條新聞讀出什麼？先別急著問「我們要不要導入 GPT-5」。這個案例真正稀缺的東西，台灣其實不缺第一項：我們有健保資料庫、有 Taiwan Biobank，臨床與生醫資料的厚度在亞洲數一數二。瓶頸從來不是買不買得到模型，而是另外兩件：誰握有乾淨、可用、授權清楚的資料集，能合法餵進來；以及誰有本事判斷 AI 吐的機制是真的合理、還是只是流暢。再加一個更硬的：有沒有能回頭做驗證實驗的濕實驗室平台。真正該投資的是「專家＋資料＋驗證迴路」這條線，不是多開幾個 API 帳號。以為導入 AI 就能自動加速研究，是把工具擺在問題前面，順序倒了。

<img src="/images/gpt5-immunology-hypothesis-engine-s6.webp" width="867" height="1300" loading="lazy" decoding="async" alt="台灣臨床資料與生醫研究在 AI 驗證迴路上的卡位點示意">

看懂這件事的方式，是把它讀成一台好用的假說引擎：它能在乾淨資料上，快速生出一批值得驗的方向，把研究者幾個月的試錯壓縮成幾分鐘的推理。這很有價值。但引擎要有人握方向盤、有路可以開、有終點可以驗，才跑得到地方。GPT-5 這次把 T 細胞的謎題往前推了一步，也順手示範了 AI 在科學裡最務實的位置：不是取代科學家判斷，而是替他們把假說的產能拉高一個量級，最後那一槌，還是敲在懂行的人手上。

## 常見問題

<p><strong>GPT-5 Pro 是自己解開了這個 T 細胞謎題嗎？</strong><br>不完全是。它在免疫學家 Derya Unutmaz 提供的一份真實資料集上，生成了一套機制假說（2-去氧葡萄糖干擾 N-連結糖基化、削弱 IL-2 訊號、解除 Th17 抑制），並<a href="https://arxiv.org/html/2511.16072v1">準確預測了一場未公開的 CAR-T 殺傷實驗結果</a>。但這是假說與預測，不是被完整驗證的定論，機制仍需濕實驗確認、也尚未走完正式同儕審查。</p>

<p><strong>「它預測了一場沒看過的實驗」這句可信嗎？</strong><br>方向可信，但要帶但書。模型確實給出跟未發表數據吻合的預測，這比單純生成假說有力得多。不過<a href="https://arxiv.org/abs/2511.16072">論文作者自己註明</a>，一個相近的故事（甘露糖回補實驗）先前放過 bioRxiv 預印本，無法完全排除訓練資料看過相關線索，所以不宜說成「完全沒接觸過」。</p>

<p><strong>這代表 AI 可以取代科學家做研究了嗎？</strong><br>不代表。這次會成功，靠的是三個條件缺一不可：領域專家握有乾淨的真實資料集、專家能判斷 AI 的答案在生物學上合不合理、以及有 held-out 實驗可以回頭驗證。AI 提高的是假說產能，最後的判斷與驗證仍在人手上。</p>

<p><strong>台灣的生醫研究能複製這種做法嗎？</strong><br>條件比想像中接近。台灣有健保資料庫、Taiwan Biobank 這類厚實的臨床資料，缺的通常不是模型，而是乾淨可用且授權清楚的資料集、能判斷 AI 輸出是否合理的領域專家，以及能做驗證實驗的濕實驗室平台。把資源投在這條驗證迴路，比單純採購 AI 工具更關鍵。</p>
