---
title: "「GPU 泡沫」被攤開來算：AI 資本支出燒近 7,000 億美元，真實營收只有零頭"
slug: "ai-capex-revenue-gap"
description: "五大雲端業者 2026 年 AI 資本支出逼近 7,000 億美元，直接綁在 AI 基建的約 4,500 億；但純 AI 公司整年營收合計不到 350 億，連投資額的零頭都稱不上。這道缺口是不是泡沫，關鍵不在總量，而在哪一段支出對得上真實需求。台灣要看懂自己卡在哪一段。"
excerpt: "問題不是「AI 有沒有泡沫」，而是「哪一段的錢對得上真實需求」。台積電 CoWoS 產能滿載到 2026，是這波燒錢裡少數落到真實訂單的一段，但能見度只到訂單簿的盡頭。"
publishDate: "2026-07-25T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["AI 資本支出", "GPU 泡沫", "AI 營收缺口", "台積電", "資料中心"]
coverImage: "covers/ai-capex-revenue-gap.webp"
coverAlt: "象徵 AI 資料中心龐大資本支出與真實營收落差的抽象示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "2026 年五大雲端業者資本支出估 6,600 至 6,900 億美元，其中約 4,500 億直接綁在 AI 基建；但 OpenAI、Anthropic 等純 AI 公司整年營收合計預估不到 350 億美元，OpenAI 的 200 億 ARR 只佔投資總額約 3%。"
  - "Sequoia 的 David Cahn 早在 2024 年就用 Nvidia 營收推出「6,000 億美元問題」：要撐起這規模的算力投資，AI 生態每年得生出約 6,000 億營收，這道缺口至今沒補上，還在擴大。"
  - "台灣卡的是這波燒錢裡最靠近真實訂單的一段：台積電 CoWoS 先進封裝滿載到 2026、AI 加速器營收看到 2029 年五成以上年增，但能見度只到訂單簿盡頭，雲端資本支出一旦轉彎，客製產能最先感受到。"
references:
  - title: "AI's $600B Question"
    url: "https://sequoiacap.com/article/ais-600b-question/"
    publisher: "Sequoia Capital"
  - title: "AI Spending Is Surging Faster Than Revenue And Markets Are Repricing"
    url: "https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening---and-markets-are-starting-to-notice/"
    publisher: "Forbes"
  - title: "AI Capex 2026: The $690B Infrastructure Sprint"
    url: "https://futurumgroup.com/insights/ai-capex-2026-the-690b-infrastructure-sprint/"
    publisher: "Futurum Group"
  - title: "TSMC reports 30% revenue growth amid AI chip demand surge"
    url: "https://cryptobriefing.com/tsmc-revenue-growth-ai-chip-demand/"
    publisher: "Crypto Briefing"
  - title: "From TSMC's Earnings to the U.S.–Taiwan Tariff Deal"
    url: "https://tspasemiconductor.substack.com/p/from-tsmcs-earnings-to-the-ustaiwan"
    publisher: "TSPA Semiconductor"
originalContribution: "本文把兩組公開數字並排對算：一邊是 Futurum 統計的 2026 年五大雲端資本支出與純 AI 公司營收，一邊是 Sequoia 的『6,000 億美元問題』推算式，指出『泡沫』的關鍵不在總量而在哪一段支出對得上真實需求，再據此定位台積電 CoWoS 這段『落到真實訂單』的產能在整條缺口裡的位置與風險。"
---

先把結論講在前面。這道「GPU 泡沫」不是有沒有的問題，是分段的問題。2026 年五大雲端業者的資本支出估在 6,600 到 6,900 億美元，扣掉自用倉儲那些，直接砸在 AI 基建的約 4,500 億；同一年，市面上叫得出名字的純 AI 公司，營收合計預估連 350 億都不到。錢進去的和真實賣出去的，差了一個數量級。但把整件事講成「泡沫要破了」，其實是問錯題。真正該問的是：這 4,500 億裡，哪一段對得上真實需求，哪一段是賭一個還沒到的未來。台灣的位置，就藏在這個分段裡。

<img src="/covers/ai-capex-revenue-gap.webp" width="1200" height="800" loading="lazy" decoding="async" alt="AI 資料中心龐大資本支出與真實營收落差的抽象示意">

## 先把兩組數字攤開來對

先看錢進去多少。根據 [Futurum 的統計](https://futurumgroup.com/insights/ai-capex-2026-the-690b-infrastructure-sprint/)，2026 年 Amazon、Microsoft、Alphabet、Meta、Oracle 五家的資本支出合計落在 6,600 到 6,900 億美元，其中 Amazon 一家就編了 2,000 億、Alphabet 拉到 1,750 至 1,850 億。[Forbes 引 CreditSights 的拆解](https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening---and-markets-are-starting-to-notice/)說，這裡面約七成五、也就是差不多 4,500 億，是直接綁在 AI 基建上的：GPU 叢集、自研加速器、資料中心，以及供電和散熱。

再看賣出去多少。Futurum 同一份分析點得很白：OpenAI 的年化營收（ARR）約 200 億美元，「只佔 2026 年雲端資本支出總額的大約 3%」；把 OpenAI、Anthropic、Cohere、Mistral、Perplexity 這些純做 AI 的公司加總，2026 年營收預估也不到 350 億。一邊是逼近 7,000 億的投入，一邊是不到 350 億的純 AI 營收，這不是「快追上了」，是差一個數量級。

<img src="/images/ai-capex-revenue-gap-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="數千億美元資金流入 AI 資料中心的示意">

## Sequoia 那條算式，兩年前就算過一次

這道缺口不是今年才有人發現。Sequoia 的 David Cahn 早在 2024 年 6 月就寫過一篇[〈AI 的 6,000 億美元問題〉](https://sequoiacap.com/article/ais-600b-question/)，算式很直白：拿 Nvidia 的資料中心營收年化數字乘以 2（因為 GPU 大約只佔一座 AI 資料中心總成本的一半，另一半是電力、建物、網路、散熱、備援），再乘以 2（因為雲端業者要留約五成毛利，這筆投資才划算）。算出來，AI 生態每年得生出約 6,000 億美元的營收，才撐得起當時的投資規模。

Cahn 的重點不是精確到某個數字，而是這道缺口的方向。他寫這篇時，前一年還只是「2,000 億問題」，一年後 Nvidia 賣得更兇、基建蓋得更快，缺口反而翻了三倍。他自己下的判斷很冷：AI 會創造巨大價值，但「我們都要一起發財」是一種幻覺，投機性的超建，最後燒掉的通常是投資人的錢。這句話放到 2026 年來看，缺口沒補上，還更大了。

<img src="/images/ai-capex-revenue-gap-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="用 Nvidia 營收推算 AI 投資回收門檻的財務試算示意">

## 這算不算泡沫，別急著下結論

市場已經開始重新定價這件事。[Forbes 那篇](https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening---and-markets-are-starting-to-notice/)引 Allianz 的研究說，AI 資本支出和營收成長的背離率已經跑到約 46%，比 2001 年電信業超建那波的 32% 還高，而那次超建後面接的是好幾年的科技股崩跌。雲端業者現在把營收的四成五到五成七砸進資本支出，2020 年這數字才一到一成五。

但這裡要踩一個剎車，別直接把「背離」讀成「泡沫要破」。Futurum 提醒了一個容易被跳過的點：雲端業者蓋這些機房，主要是給自己的雲端服務和企業客戶用，不是全部賣給那幾家純 AI 新創。所以「純 AI 公司營收不到 350 億」不能直接當成「需求只有 350 億」，Microsoft 自家的 AI 業務年化就已經衝到 [370 億美元、年增 123%](https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening---and-markets-are-starting-to-notice/)。

換句話說，問題不是「AI 整體有沒有泡沫」這種一翻兩瞪眼的問法，而是要分段：這 4,500 億裡，有一段對著真實、已經在付錢的需求（企業雲、既有產品加值），有一段對著還沒兌現的未來（通用 AI 會不會變成人人天天用的東西）。真正的風險，集中在後面那一段賭得太滿。把兩段混在一起喊「泡沫」或「沒泡沫」，都是解錯題。

<img src="/images/ai-capex-revenue-gap-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="市場重新定價 AI 資本支出與營收背離風險的示意">

## 台灣卡在哪一段：最靠近真實訂單的那一段

把上面的分段套到台灣，答案就清楚了。台灣不是站在「賭未來」那一端，是站在「已經有訂單、正在出貨」這一端。[台積電 2026 年營收預估年增超過三成](https://cryptobriefing.com/tsmc-revenue-growth-ai-chip-demand/)，資本支出拉到 520 至 560 億美元創新高，而 AI 客戶最搶的 CoWoS 先進封裝產能，已經滿載預訂到 2026 年，就算全年把月產能衝到九到十三萬片還是不夠賣。[台積電財報也顯示](https://tspasemiconductor.substack.com/p/from-tsmcs-earnings-to-the-ustaiwan)，AI 加速器營收 2025 年已佔晶圓營收的一成七到一成九，公司把這段的長期年複合成長率上修到五成四以上，執行長魏哲家還特別說，美國雲端業者的強勁訂單「驗證了這波 AI 熱潮是真的」。

這段是這波燒錢裡最實在的一段：不是財測、不是估值，是已經簽單、已經卡產能的真金白銀。但也正因為它靠訂單吃飯，風險就藏在能見度的盡頭。CoWoS 是為 AI 客戶客製的產能，能見度目前看到訂單簿的邊界，一旦上游那 4,500 億的資本支出因為缺口壓力轉彎放緩，這種專用產能會比通用製程更早、更直接感受到寒意。台灣在這條鏈上賺得實在，但也綁得緊，訂單能見度到哪、體感的安全區就到哪。

<img src="/images/ai-capex-revenue-gap-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="台積電先進封裝與晶圓製造，象徵台灣卡在最靠近真實訂單的一段">

## 該記住的是框架，不是那個數字

把「GPU 泡沫」攤開來算，會發現吵「有沒有泡沫」本身就是問錯題。近 7,000 億的資本支出裡，有真實需求撐著的一段，也有賭未來賭得太滿的一段，兩段的命運不一樣。看懂這件事的人，不會去賭泡沫哪天破，而是去分清自己手上的生意對著哪一段需求。台灣站在最靠近真實訂單的位置，短期最踏實，但也最該盯著上游那條缺口：它補得起來，這波就是超級週期；它補不起來，第一個回頭修正資本支出的，會沿著訂單簿一路傳到封裝廠。該記住的是這個分段的框架，不是 6,000 億還是 7,000 億這個會一直變的數字。

<img src="/images/ai-capex-revenue-gap-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓廠產線，象徵分清哪一段支出對應真實需求的框架">

<h2>常見問題</h2>

<p><strong>AI 資本支出和真實營收到底差多少？</strong><br>差一個數量級。2026 年五大雲端業者資本支出估 6,600 至 6,900 億美元，其中約 4,500 億直接綁在 AI 基建；但 OpenAI、Anthropic 等純 AI 公司整年營收合計預估不到 350 億美元，OpenAI 自己的 200 億 ARR 只佔投資總額約 3%（<a href="https://futurumgroup.com/insights/ai-capex-2026-the-690b-infrastructure-sprint/">Futurum 統計</a>）。</p>

<p><strong>「AI 的 6,000 億美元問題」是什麼意思？</strong><br>這是 Sequoia 的 David Cahn 在 <a href="https://sequoiacap.com/article/ais-600b-question/">2024 年提出的推算</a>：把 Nvidia 資料中心營收乘以 2（GPU 約佔資料中心總成本一半）再乘以 2（雲端業者要留約五成毛利），得出 AI 生態每年要生出約 6,000 億營收才撐得起投資。這道缺口至今沒補上，還在擴大。</p>

<p><strong>這樣算是 AI 泡沫嗎？會像網路泡沫一樣破？</strong><br>不能一句話下定論。<a href="https://www.forbes.com/sites/jasonkirsch/2026/06/02/the-ai-capex-to-revenue-gap-is-widening---and-markets-are-starting-to-notice/">Allianz 的研究</a>指 AI 資本支出與營收的背離率約 46%，比 2001 年電信泡沫的 32% 還高。但雲端業者蓋機房主要給自家服務和企業客戶用，不是全賣給純 AI 新創，所以風險集中在「賭通用 AI 未來」那一段賭太滿，不是整體都是泡沫。</p>

<p><strong>如果 AI 資本支出放緩，台灣會先受影響嗎？</strong><br>會先感受到，因為台灣卡在最靠近真實訂單的一段。<a href="https://cryptobriefing.com/tsmc-revenue-growth-ai-chip-demand/">台積電 CoWoS 先進封裝滿載預訂到 2026</a>，這是為 AI 客戶客製的專用產能，能見度只到訂單簿盡頭；一旦上游雲端資本支出轉彎，客製產能會比通用製程更早感受到寒意。</p>
