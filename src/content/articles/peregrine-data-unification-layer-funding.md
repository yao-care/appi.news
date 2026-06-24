---
title: "政府與企業「資料統一層」變吸金題：Peregrine 募 2.5 億美元、估值 15 個月衝到 68 億"
slug: "peregrine-data-unification-layer-funding"
description: "Peregrine 完成 2.5 億美元 D 輪、估值從 2025 年 3 月的 25 億跳到 68 億美元，15 個月翻近三倍。這輪的錢往『把資料整理乾淨、打通孤島』搬，而不是往更炫的模型搬，因為 agent 要先有乾淨統一的資料才動得了。"
excerpt: "Peregrine 募 2.5 億美元、估值 68 億，投資人賭的是把企業髒資料清乾淨、打通孤島的營運軟體。台灣企業導入 agent 前，資料前置工程該怎麼排序，這篇給一條判讀線。"
publishDate: "2026-07-13T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags:
  - "Peregrine 募資"
  - "資料統一層"
  - "AI 基建層"
  - "AI 新創估值"
  - "資料孤島整合"
author: "lightman"
coverImage: "covers/peregrine-data-unification-layer-funding.webp"
coverAlt: "抽象資料節點互相串連的示意，象徵資本從 AI 模型流向把分散資料統一的基建層"
coverImageCredit: "Photo by jonakoh _ on Unsplash"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Peregrine 完成 2.5 億美元 D 輪募資、估值 68 億美元，對照 2025 年 3 月 D 輪前的 25 億，15 個月翻近三倍。"
  - "投資人這輪賭的不是更大的模型，是把分散在各系統的營運資料統一、打通孤島的營運軟體，創辦團隊出身 Palantir。"
  - "資料統一是 AI 落地前的基建題：agent 要先有乾淨、權限分明的統一資料才動得了，落地設計比模型強弱更關鍵。"
references:
  - title: "Peregrine Technologies Raises $250 Million Series D at $6.8 Billion Valuation"
    url: "https://www.prnewswire.com/news-releases/peregrine-technologies-raises-250-million-series-d-at-6-8-billion-valuation-302808115.html"
    publisher: "PR Newswire / Peregrine"
  - title: "Exclusive: The AI company powering public safety operations for the 2026 World Cup just raised $250 million"
    url: "https://fortune.com/2026/06/22/exclusive-peregrine-nick-noone-ai-public-safety-palantir-2026-world-cup-just-sequoia-capital/"
    publisher: "Fortune"
  - title: "Law Enforcement Startup Peregrine Hits $2.5B Valuation Mark"
    url: "https://news.crunchbase.com/venture/law-enforcement-startup-peregrine-unicorn-sequoia/"
    publisher: "Crunchbase News"
  - title: "Venture Capital & Startup Funding Roundup, June 23, 2026"
    url: "https://techstartups.com/2026/06/23/venture-capital-startup-funding-roundup-june-23-2026/"
    publisher: "Tech Startups"
---

把分散在各系統的營運資料先統一、讓組織能即時調度，正在變成 AI 真正落地前的基礎建設題。資料分析公司 Peregrine 六月底[完成 2.5 億美元 D 輪募資](https://www.prnewswire.com/news-releases/peregrine-technologies-raises-250-million-series-d-at-6-8-billion-valuation-302808115.html)，估值從 [2025 年 3 月的 25 億美元](https://news.crunchbase.com/venture/law-enforcement-startup-peregrine-unicorn-sequoia/)跳到 68 億美元，15 個月翻了將近三倍。這輪的錢說明一件事：資本開始往「把資料整理乾淨、打通孤島」搬，而不是往更炫的模型搬。

<img src="/images/peregrine-data-unification-layer-funding-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="互相串連的資料節點與儀表板，象徵把分散資料統一後能即時調度">

## 先看這筆錢投在哪

Peregrine 這輪 D 輪由 Fifth Down Capital、紅杉（Sequoia）、OG Venture Partners、Goldcrest Capital、XYZ Ventures、Godfrey Capital 等既有投資人加碼，[官方公告寫得很清楚](https://www.prnewswire.com/news-releases/peregrine-technologies-raises-250-million-series-d-at-6-8-billion-valuation-302808115.html)：產品是把斷裂、分散在不同系統裡的資料，整合成一個權限分明、可即時查詢的營運視圖。對照 2025 年 3 月那輪由[紅杉領投、1.9 億美元、估值 25 億的 C 輪](https://news.crunchbase.com/venture/law-enforcement-startup-peregrine-unicorn-sequoia/)，估值在 15 個月內衝到近三倍。它服務的對象從州與地方政府，一路擴到聯邦、企業與國際市場，目前撐起[北美 400 多個機構、覆蓋逾 1.25 億人](https://www.prnewswire.com/news-releases/peregrine-technologies-raises-250-million-series-d-at-6-8-billion-valuation-302808115.html)，連 2026 世界盃 11 個主辦城市裡有 8 個的安全協調都跑在它上面。

<img src="/images/peregrine-data-unification-layer-funding-s2.webp" width="960" height="768" loading="lazy" decoding="async" alt="向上攀升的成長曲線，象徵創投資金湧入與估值快速翻倍">

## 投資人賭的不是模型，是把髒資料清乾淨

這題的重點不在 Peregrine 用了哪個模型，而在它做的事。創辦人 Nick Noone 出身 [Palantir 的特種作戰業務](https://fortune.com/2026/06/22/exclusive-peregrine-nick-noone-ai-public-safety-palantir-2026-world-cup-just-sequoia-capital/)，整間公司被外界形容帶著「Palantir 的基因」。它的定位被 Fortune 寫成「一座城市自己機構記憶的搜尋引擎」：把警務紀錄、911 通報、許可資料庫、感測器訊號這些既有資料串起來、即時可查，但[不蒐集、也不擁有任何一筆資料](https://fortune.com/2026/06/22/exclusive-peregrine-nick-noone-ai-public-safety-palantir-2026-world-cup-just-sequoia-capital/)，靠角色權限控管存取。換句話說，它賣的是把孤島打通的營運層，不是又一個會講話的模型。

這不是單一個案。整理這筆交易的 [Tech Startups 創投週報](https://techstartups.com/2026/06/23/venture-capital-startup-funding-roundup-june-23-2026/)直接點出，這一週的錢正集中流向「掌握決策流程與營運基建」的公司，而不是泛泛的「AI for X」。同一份週報裡，Peregrine 被描述成幫政府與複雜組織「在一個權限感知的營運系統裡統一孤島資料」。資本的判斷很白話：模型大家都接得到，能把一個組織的資料現場整理乾淨、還守得住權限的，才是稀缺的東西。

<img src="/images/peregrine-data-unification-layer-funding-s3.webp" width="960" height="540" loading="lazy" decoding="async" alt="分散的資料孤島被整合串連，象徵打通孤島的企業營運軟體">

## 為什麼這是「AI 落地前」的題

我十分認同這條判讀線。原因很簡單：agent 要先有乾淨、統一、權限分明的資料才動得了，沒有這層底，再強的模型在企業裡也只是空轉。這跟我先前看 Databricks 把 agent 講成「同事」時的觀察是同一件事，當時 [Databricks 執行長那句「AI 說不出毛利為何變動，不是 AI 問題，是脈絡問題」](/articles/databricks-genie-one-agent-governance/)，講的就是資料脈絡缺位。脈絡從哪來？從把分散資料統一、補上權限與來源的那一層來。

放在更大的資金流裡看也對得上。先前 [Supabase 一輪募 5 億美元、估值衝上 105 億](/articles/supabase-500m-ai-infrastructure-layer/)，錢就已經從模型移到讓人快速做 AI 應用的基建層。Peregrine 這輪是同一個方向再往源頭走一步：基建層之下，是資料本身整不整得乾淨。我長期的立場沒變，可信度靠落地流程，不靠模型聰明；現在資本用真金白銀把這句話標了價。

<img src="/images/peregrine-data-unification-layer-funding-s4.webp" width="960" height="539" loading="lazy" decoding="async" alt="排列整齊的伺服器機房，象徵 agent 動起來前需要的乾淨統一資料底層">

## 台灣企業導入 agent 前，先排這三件事

如果你正在評估把 agent 放進公司，順序別倒過來。不要先挑模型、先挑工具，先把資料前置工程排好。給一條可以明天就動手的判讀線：

第一，先盤孤島。把要餵給 agent 的資料散在哪幾個系統、格式對不對得上、有沒有重複與矛盾，列出來。資料不通，agent 給的答案就是把錯誤放大。第二，權限先於串接。每一張表「誰能讀、用誰的身分讀」要在打通之前定義清楚，Peregrine 值錢的地方正是它把權限與稽核做在統一層裡，而不是事後補。第三，先定義情境再決定開放範圍。哪個流程值得讓 agent 動、碰得到哪些資料，講清楚再開，別因為估值高、聲量大就跟著押。資料前置這段工，做的當下不性感，但它決定了後面所有 agent 能不能真的落地。

<img src="/images/peregrine-data-unification-layer-funding-s5.webp" width="960" height="650" loading="lazy" decoding="async" alt="桌上的策略路線圖與檢查清單，象徵導入 agent 前的資料前置工程排序">

<h2>常見問題</h2>

<p><strong>Peregrine 到底是做什麼的，為什麼估值這麼高？</strong><br>它做的是「資料統一層」：把政府或企業分散在各系統的資料（警務紀錄、911 通報、許可資料庫等）整合成一個權限分明、可即時查詢的營運視圖，但<a href="https://fortune.com/2026/06/22/exclusive-peregrine-nick-noone-ai-public-safety-palantir-2026-world-cup-just-sequoia-capital/">不蒐集也不擁有那些資料</a>。它六月底完成 <a href="https://www.prnewswire.com/news-releases/peregrine-technologies-raises-250-million-series-d-at-6-8-billion-valuation-302808115.html">2.5 億美元 D 輪、估值 68 億美元</a>，因為能把資料整乾淨、又守得住權限的公司，比又一個模型稀缺。</p>

<p><strong>什麼是「資料統一層」？為什麼說它是 AI 落地前的基建？</strong><br>資料統一層是把分散、格式不一、彼此矛盾的營運資料整合成單一可信來源的那一層。它是 AI 落地前的基建，因為 agent 要先有乾淨、權限分明的統一資料才動得了；資料不通，模型再強也只是把錯誤放大。這也是為什麼<a href="https://techstartups.com/2026/06/23/venture-capital-startup-funding-roundup-june-23-2026/">這一輪創投的錢正集中流向掌握決策流程與營運基建的公司</a>，而非泛泛的「AI for X」。</p>

<p><strong>台灣企業導入 agent 前，第一步該做什麼？</strong><br>先盤資料孤島，不要先挑模型或工具。把要餵給 agent 的資料散在哪些系統、格式對不對得上、有沒有重複與矛盾列出來，接著定義每張表「誰能讀、用誰的身分讀」，最後才依情境決定哪個流程值得讓 agent 動、碰得到哪些資料。順序倒過來是選型最常見的失敗模式。</p>
