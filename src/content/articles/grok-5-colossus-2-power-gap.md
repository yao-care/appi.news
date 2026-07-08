---
title: "Grok 5 又跳票：Colossus 2 號稱衝 1.5GW，衛星影像只看到三分之一"
slug: "grok-5-colossus-2-power-gap"
description: "Grok 5 從 2025 年底一路滑到 Q2 又落空，至今仍在 Colossus 2 上訓練。xAI 對外喊「已達 1GW、四月升 1.5GW」，但 Tom's Hardware 衛星影像估只約 350MW 散熱、SemiAnalysis 估實際約 200MW 運轉、1.1GW 要到 2027。跳票和進度講的是同一件事：模型在等一批還沒到位的電。"
excerpt: "Grok 5 一延再延，真正卡住它的不是模型，是電。對照 xAI 的兆瓦宣稱與衛星影像、第三方現地估計，帳面 GW 和現地 MW 差了一整個時間軸。"
publishDate: "2026-08-11T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["Grok 5", "xAI", "Colossus 2", "AI 資料中心", "算力電力"]
coverImage: "covers/grok-5-colossus-2-power-gap.webp"
coverAlt: "象徵 Grok 5 訓練所需龐大算力的資料中心伺服器機房"
coverImageCredit: "Photo by panumas nikhomkhai on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Grok 5 從 2025 年底一路滑到 Q2 2026 又落空，至今仍在 Colossus 2 上訓練；Polymarket 對「6 月底前發布」只押到約三成，事後也沒兌現，API 全開被看衰滑進 Q3。"
  - "Colossus 2 對外喊「已達 1GW、四月升 1.5GW」，但 Tom's Hardware 依衛星影像估只有約 350MW 散熱、SemiAnalysis 估實際約 200MW 運轉、1.1GW 要到 2027，宣稱與現地兆瓦數對不起來。"
  - "Grok 5 遲到跟 Colossus 2 進度是同一件事：前沿模型的瓶頸已從演算法換成電力、散熱與土地；對台灣而言真正的領先指標是實際上線兆瓦，不是頭條 GW 口號。"
references:
  - title: "xAI launches world-first gigawatt-scale AI training cluster for Grok"
    url: "https://interestingengineering.com/ai-robotics/elon-musk-xai-gigawatt-scale-ai-training-cluster"
    publisher: "Interesting Engineering"
  - title: "Elon Musk's xAI Colossus 2 is nowhere near 1 gigawatt capacity, satellite imagery suggests"
    url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/elon-musks-xai-colossus-2-is-nowhere-near-1-gigawatt-capacity-satellite-imagery-suggests-despite-claims-site-only-has-350-megawatts-of-cooling-capacity"
    publisher: "Tom's Hardware"
  - title: "xAI's Colossus 2 - First Gigawatt Datacenter In The World"
    url: "https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter"
    publisher: "SemiAnalysis"
  - title: "xAI Colossus Hits 2 GW: 555,000 GPUs, $18B, Largest AI Site"
    url: "https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026"
    publisher: "Introl"
  - title: "Grok 5: Release Date & All We Know So Far"
    url: "https://felloai.com/all-we-know-so-far-about-grok-5/"
    publisher: "Fello AI"
originalContribution: "本文把『Grok 5 跳票』與『Colossus 2 電力進度』併為同一條供給鏈事件，逐一對照 xAI 官方兆瓦宣稱與 Tom's Hardware 衛星影像、SemiAnalysis 現地建置估計的落差，提出『延遲是電力／散熱瓶頸而非模型瓶頸』的分析框架，並據此給台灣讀者一組可操作的領先指標：實際運轉兆瓦、渦輪機到位與散熱建置。"
---

Grok 5 又延了，而且這次延的理由不在模型本身。xAI 把 Grok 5 卡在 Colossus 2 要先長到夠大的算力上，但它對外喊的「已達 1GW、四月升 1.5GW」，跟第三方看到的現地兆瓦數對不起來。所以「Grok 5 遲遲不出」和「Colossus 2 還在燒電訓練」講的是同一件事：模型在等一批還沒真正到位的電。

<img src="/images/grok-5-colossus-2-power-gap-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="象徵 Grok 5 開發進度與人工智慧模型訓練的示意">

先把檔期講清楚。Grok 5 原本排在 2025 年底，先滑到第一季，再被官方改口第二季（5 到 6 月），[兩個窗口都過了、模型還在訓練](https://felloai.com/all-we-know-so-far-about-grok-5/)。Polymarket 對「6 月底前公開發布」只押到[大約三分之一的機率](https://felloai.com/all-we-know-so-far-about-grok-5/)，而 6 月底已過、Grok 5 仍未上線，等於市場連這個保守賭注都沒賭中，完整 API 開放更被看衰[滑進第三季](https://felloai.com/all-we-know-so-far-about-grok-5/)。Musk 自己談的是另一個數字：他說 Grok 5 [達到人類等級 AGI 的機率「10% 且還在升」](https://felloai.com/all-we-know-so-far-about-grok-5/)。談願景，比談檔期積極得多。

<img src="/images/grok-5-colossus-2-power-gap-s2.webp" width="867" height="1300" loading="lazy" decoding="async" alt="象徵 Colossus 2 大規模運算與科技基礎建設的示意">

xAI 把延遲的原因指向規模。Grok 5 是一個 [6 兆參數的混合專家（MoE）模型，仍在 Colossus 2 上訓練](https://felloai.com/all-we-know-so-far-about-grok-5/)。Colossus 2 這台機器本身就是重點。Musk 在 [1 月 17 日宣布它上線，號稱「全世界第一座 GW 級訓練叢集」，四月要升到 1.5GW](https://interestingengineering.com/ai-robotics/elon-musk-xai-gigawatt-scale-ai-training-cluster)，合起來的算力[相當於超過一百萬顆 H100](https://interestingengineering.com/ai-robotics/elon-musk-xai-gigawatt-scale-ai-training-cluster)。硬體帳面更嚇人：[整場買了 55.5 萬顆 NVIDIA GPU、約 180 億美元，是全球最大的單一 AI 訓練場址，目標衝到 2GW](https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026)。光是這一座的用電，[就已經超過舊金山的尖峰用電](https://interestingengineering.com/ai-robotics/elon-musk-xai-gigawatt-scale-ai-training-cluster)。

<img src="/images/grok-5-colossus-2-power-gap-s3.webp" width="960" height="1200" loading="lazy" decoding="async" alt="象徵資料中心龐大電力需求的供電設施示意">

但這裡要先踩個剎車。帳面兆瓦和現地兆瓦不是同一回事。Tom's Hardware 依[衛星影像估算，Colossus 2 的散熱能力大約只有 350MW，離宣稱的 1GW 還差了三分之二](https://www.tomshardware.com/tech-industry/artificial-intelligence/elon-musks-xai-colossus-2-is-nowhere-near-1-gigawatt-capacity-satellite-imagery-suggests-despite-claims-site-only-has-350-megawatts-of-cooling-capacity)。半導體產業分析機構 SemiAnalysis 拆得更細：到 2025 年 8 月，現地[大約 200MW 真正在運轉、約 460MW 建置中或已裝機，要到 2027 年第二季才會有約 1.1GW 全面上線](https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter)，而且相當比例的電力是[向 Solaris 租來的渦輪機](https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter)撐著，不是自建電廠。宣稱和現地之間，差的不是一點誤差，是一整個時間軸。

<img src="/images/grok-5-colossus-2-power-gap-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵電力與運算節點連動的網路示意">

把這兩件事擺在一起，Grok 5 為什麼一直跳票就清楚了。瓶頸不在演算法。要訓一個 6 兆參數的模型，你得先讓夠多的 GPU 同時吃到夠穩的電、排掉夠多的熱。電力、散熱、土地、併網許可，任何一段沒到位，訓練就得等。xAI 先把卡擺進機房，不代表那些卡能同時滿載開跑。所以「Grok 5 延到什麼時候」這個問題，答案其實藏在「Colossus 2 的實際兆瓦什麼時候真正拉上去」。這是基礎建設題，不是模型題。把它讀成「xAI 團隊不夠拼」，就看錯了根因。

<img src="/images/grok-5-colossus-2-power-gap-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="象徵台灣硬體供應鏈與數位零組件的示意">

那台灣該從這條新聞讀出什麼？台灣供的是這場軍備競賽的鏟子：GB200 與 GB300 板卡、散熱模組、電源與機櫃。這裡有個容易看歪的地方，就是以為 xAI 喊 1GW、2GW，對應的訂單就會照那個數字一次到位。真正決定拉貨節奏的，是現地實際上線的兆瓦：渦輪機幾時到、散熱幾時裝好、變電站幾時併網。頭條的 GW 數字比較像期貨，現地兆瓦才是現貨。誰能把散熱、供電、機構這幾段的實際交期看準，追著實際運轉的兆瓦走，而不是追著發表會的口號走，才接得住這一波。看懂進度落差，比記住「1.5GW」這個數字重要。

<h2>常見問題</h2>

<p><strong>Grok 5 到底什麼時候會出？</strong><br>目前沒有確定日期。它原訂 2025 年底，已經延到第一季、再延到第二季都落空，至今仍在 Colossus 2 上訓練；Polymarket 對「6 月底前發布」只押到<a href="https://felloai.com/all-we-know-so-far-about-grok-5/">約三分之一的機率</a>且已沒兌現，完整 API 開放被看衰滑進第三季。實務上該盯的是訓練何時完成、算力何時到位，不是某個被反覆推遲的檔期。</p>

<p><strong>Colossus 2 真的已經有 1GW 嗎？</strong><br>官方這樣說，但第三方存疑。Tom's Hardware 依<a href="https://www.tomshardware.com/tech-industry/artificial-intelligence/elon-musks-xai-colossus-2-is-nowhere-near-1-gigawatt-capacity-satellite-imagery-suggests-despite-claims-site-only-has-350-megawatts-of-cooling-capacity">衛星影像估算現地散熱大約只有 350MW</a>，SemiAnalysis 也估<a href="https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter">實際運轉約 200MW、1.1GW 要到 2027 年第二季</a>。帳面兆瓦和真正在跑的兆瓦，是兩回事。</p>

<p><strong>為什麼訓練一個模型要蓋這麼大的電廠？</strong><br>因為前沿模型的瓶頸已經從演算法換成電力與散熱。要讓 <a href="https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026">55.5 萬顆 GPU</a> 同時滿載訓練，需要穩定的大電力和足夠的散熱能力，任何一段供給沒到位，訓練速度就被拖住。這也是 Grok 5 一延再延的根因，它卡的是基礎建設，不是寫程式。</p>

<p><strong>這對台灣的 AI 供應鏈是好消息還是壞消息？</strong><br>方向是好的，但要盯對指標。這波拉的是板卡、散熱、電源與機構件這些會碰到真實世界的零組件。真正決定拉貨節奏的是現地實際上線的兆瓦，不是發表會喊出的 GW 數字；把交期跟著實際運轉兆瓦走，才不會被口號帶著追高殺低。</p>
