---
title: "雲端大廠開始自己鎖電：微軟簽 20 年德州電力長約餵 AI 資料中心"
slug: "hyperscalers-lock-power-ai-datacenters"
description: "微軟 6/22 與雪佛龍簽 20 年電力購買協議，讓子公司在西德州蓋一座 2.67GW 天然氣電廠、直接接在資料中心旁供電。限制 AI 的已經不是晶片，是電；雲端大廠正在變成能源公司，台灣撞到同一堵牆但手上的工具不一樣。"
excerpt: "微軟明明喊 2030 碳負排放，為什麼還簽 20 年天然氣長約？因為他們現在要解的題不是最乾淨或最便宜的電，而是在期限內拿得到、可調度、不會斷的電。"
publishDate: "2026-07-17T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["AI 資料中心用電", "微軟", "電力長約 PPA", "台灣電網", "重電供應鏈"]
coverImage: "covers/hyperscalers-lock-power-ai-datacenters.webp"
coverAlt: "資料中心與併置電廠，象徵雲端大廠簽長約鎖定專屬電力供應"
coverImageCredit: "Photo by Taylor Vick on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "微軟 6/22 與雪佛龍簽 20 年電力購買協議，讓子公司 Energy Forge One 在西德州蓋一座約 2.67GW 天然氣電廠（Project Kilby），2028 年首度供電、專供微軟資料中心。"
  - "關鍵是 behind-the-meter：電廠直接接在資料中心旁、獨立於公用電網運作，繞過動輒好幾年的併網排隊；限制 AI 的瓶頸已從晶片移到穩定的電。"
  - "台灣撞到同一堵牆但手上工具不同：不可能每座資料中心旁自蓋天然氣電廠，真正的卡位點在重電設備、機房自建電源與儲能這條輸配電鏈，而非只守雲端 GPU 代工。"
references:
  - title: "Chevron signs 20-year Microsoft power deal for West Texas AI project"
    url: "https://worldoil.com/news/2026/6/22/chevron-signs-20-year-microsoft-power-deal-for-west-texas-ai-project/"
    publisher: "World Oil"
  - title: "Microsoft Expands Global Data Center Capacity with 2 GW Data Center and Co-Located Power Facility in West Texas"
    url: "https://www.orrick.com/en/News/2026/07/Microsoft-Expands-Global-Data-Center-Capacity-with-2-GW-Data-Center-and-Co-Located-Power-Facility"
    publisher: "Orrick"
  - title: "Chevron–Microsoft 20-Year Power Deal for West Texas AI Data Center"
    url: "https://www.datamintelligence.com/news/chevron-microsoft-20-year-ai-data-center-power-deal-west-texas"
    publisher: "DataM Intelligence"
  - title: "Nuclear power for AI: inside the data center energy deals"
    url: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025"
    publisher: "Introl"
  - title: "台電估 2030 年新增用電 500 萬瓩，核三再運轉預計月底送審"
    url: "https://technews.tw/2026/03/02/ai-electricity-taiwan-two-times/"
    publisher: "科技新報 TechNews"
  - title: "【實際用電規模盤點】台灣資料中心用電壓力大？全球 AI 熱潮下的區域電網新挑戰"
    url: "https://www.twreporter.org/a/data-center-electricity-demand"
    publisher: "報導者 The Reporter"
originalContribution: "本文把微軟-雪佛龍這紙個案，放進『AI 瓶頸從算力硬體下沉到穩定電力』的框架來讀，用『解對題 vs 解錯題』拆解微軟碳負排放承諾與 20 年天然氣長約的表面矛盾，並交叉台電 2030 用電預估與資料中心區域供電瓶頸，指出台灣的卡位點在重電、自建電源與儲能，而非雲端 GPU 代工。"
---

限制 AI 的東西，已經不是晶片，是電。而且雲端大廠已經想通這件事，開始自己蓋電廠、簽 20 年長約、把電廠直接接在資料中心旁邊，繞過公用電網。6 月 22 日微軟跟能源公司雪佛龍（Chevron）簽的這紙合約，是這個轉向到目前為止最清楚的訊號。

<img src="/covers/hyperscalers-lock-power-ai-datacenters.webp" width="1200" height="674" loading="lazy" decoding="async" alt="資料中心與併置電廠，象徵雲端大廠簽長約鎖定專屬電力供應">

先看這筆交易本身。雪佛龍旗下子公司 Energy Forge One 要在西德州 Pecos 蓋一座天然氣電廠，代號 Project Kilby，[規模約 2.67 GW，用一紙 20 年電力購買協議（PPA，長期向特定電廠買電的合約）把電專供微軟的資料中心](https://worldoil.com/news/2026/6/22/chevron-signs-20-year-microsoft-power-deal-for-west-texas-ai-project/)。首度供電預計 2028 年，最終投資決定年底前拍板，投資方還有 Engine No. 1，發電機組主力用 GE Vernova 的燃氣渦輪，估計替當地帶來約 100 億美元稅收與 2000 個工作機會。這對微軟來說，[一次就替全球資料中心加了 2 GW 容量，是公司史上最大的單筆擴充之一](https://www.orrick.com/en/News/2026/07/Microsoft-Expands-Global-Data-Center-Capacity-with-2-GW-Data-Center-and-Co-Located-Power-Facility)。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s1.webp" width="960" height="641" loading="lazy" decoding="async" alt="西德州天然氣發電廠的工業管線與機組，象徵專供資料中心的自建電源">

這裡最該畫線的字是 behind-the-meter：電廠直接接在資料中心旁、獨立於公用電網運作，日後才慢慢與區域電網併聯。它不是「向電力公司買電」，是「自己旁邊就有一座電廠」。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s2.webp" width="960" height="539" loading="lazy" decoding="async" alt="AI 資料中心內密集排列的伺服器機櫃，象徵推升用電的算力需求">

追一個因：為什麼要自己蓋電廠、還要繞過電網？因為在美國，新電廠或大用戶要接進電網排隊動輒好幾年，而 AI 資料中心要的是 24 小時不能斷、隨叫隨到可調度的電，這是太陽能、風電這種看天吃飯的來源給不了的。所以天然氣、核能才會一個個被挑上。用一家分析機構的話說，[AI 的成長已經不再受限於算力硬體，而是能不能拿到可靠的電](https://www.datamintelligence.com/news/chevron-microsoft-20-year-ai-data-center-power-deal-west-texas)。這不是微軟一家的動作。過去一年裡，[微軟簽了 20 年、835 百萬瓦的三哩島核電廠重啟合約，Google 向 Kairos 訂了最多 500 百萬瓦的小型模組化反應爐，Amazon 砸超過 200 億美元把 Susquehanna 核電廠園區改成 AI 資料中心，大型科技公司一年內鎖下超過 10 GW 的核電](https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025)。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="高壓輸電鐵塔與電網線路，象徵併網排隊過久促使大廠自建電源繞過電網">

這裡要踩一個剎車。微軟喊 2030 年碳負排放，卻簽一紙 20 年的天然氣長約，看起來矛盾。但如果你看懂他們在解哪一題，就不矛盾了。他們現在要解的，是「在期限內拿到穩定、可調度的電」，不是「拿到最便宜或最乾淨的電」。天然氣會贏，是因為它可調度、蓋得快、料就在旁邊的二疊紀盆地（Permian）。這是很典型的「先定義問題、再選工具」：問題定義成供電確定性，工具就自然指向天然氣或核能，而不是綠電憑證。代價是把一座 2.67 GW 的天然氣電廠鎖進未來 20 年的碳排帳上，他們接受了這個取捨，[官方說法是把對區域電網的衝擊降到最低](https://worldoil.com/news/2026/6/22/chevron-signs-20-year-microsoft-power-deal-for-west-texas-ai-project/)。看懂這個取捨，比爭論它環不環保更重要。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s4.webp" width="960" height="641" loading="lazy" decoding="async" alt="天然氣電廠的煙囪與設施，象徵供電確定性與長期碳排之間的取捨">

那台灣呢？同一堵牆，台灣也撞得到，但手上的工具不一樣。[台電估 2030 年前系統要新增約 500 萬瓩用電，未來十年年均增量是過去的兩倍以上](https://technews.tw/2026/03/02/ai-electricity-taiwan-two-times/)，AI 與半導體是最大推力。但台灣不可能像西德州那樣，在每座資料中心旁邊蓋一座天然氣電廠自己直供，土地、氣源、環評都不允許。而且問題的層次也不同：[報導者的盤點](https://www.twreporter.org/a/data-center-electricity-demand)講得很準，台灣資料中心目前用電占比還不到 1%，真正的壓力不在總量，而在區域供電與變電設施跟不跟得上，加上大型變壓器交期已拉到約兩年半。我之前寫[經濟部上修十年用電預估](/articles/taiwan-power-demand-forecast-2035/)、寫[台電砸 193 億拉 161kV 電纜強韌電網](/articles/taipower-grid-resilience-161kv-cable/)，講的都是同一件事：瓶頸下沉到輸配電這一層。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s5.webp" width="960" height="720" loading="lazy" decoding="async" alt="電力變壓器與變電站設施，象徵台灣資料中心供電瓶頸在區域配電與重電設備">

所以台灣真正該吃的，是重電設備（變壓器、開關、GIS 氣體絕緣開關）、機房自建電源、儲能這些會碰到「電怎麼穩穩送進機櫃」的環節，而不是只守在雲端 GPU 代工那一格。這波把 AI 的競賽從「誰的模型比較聰明、誰的晶片比較多」，移到了「誰先鎖到夠用、夠穩、夠久的電」。微軟、Google、Amazon 實質上都在變成能源公司。看懂大廠為什麼開始自己鎖電，比記住 2.67 GW 這個數字重要。

<img src="/images/hyperscalers-lock-power-ai-datacenters-s6.webp" width="960" height="641" loading="lazy" decoding="async" alt="電力基礎建設的管線與機組，象徵雲端大廠與能源長線綁定">

<h2>常見問題</h2>

<p><strong>什麼是 behind-the-meter 電廠？跟一般向電力公司買電差在哪？</strong><br>Behind-the-meter 指電廠直接蓋在用電端（例如資料中心）旁邊、專供這個用戶，獨立於公用電網運作，之後才慢慢與區域電網併聯。好處是繞過動輒好幾年的併網排隊、供電更可控。<a href="https://www.orrick.com/en/News/2026/07/Microsoft-Expands-Global-Data-Center-Capacity-with-2-GW-Data-Center-and-Co-Located-Power-Facility">微軟這座西德州電廠</a>就是先以 behind-the-meter 的天然氣電廠運作，再談日後併網。</p>

<p><strong>微軟明明喊碳中和，為什麼還簽 20 年天然氣長約？</strong><br>因為他們現在要解的題是供電確定性，不是最乾淨或最便宜的電。天然氣可調度、蓋得快、氣源就在旁邊的<a href="https://worldoil.com/news/2026/6/22/chevron-signs-20-year-microsoft-power-deal-for-west-texas-ai-project/">二疊紀盆地</a>，所以在期限壓力下勝出。代價是把一座 2.67 GW 的天然氣電廠鎖進 20 年碳排，這是取捨不是矛盾。</p>

<p><strong>為什麼 AI 資料中心不直接用綠電就好？</strong><br>AI 算力要的是 24 小時不斷、隨叫隨到可調度的電，太陽能、風電看天吃飯，供電型態對不上。所以大廠這一年才會轉向天然氣與核能，例如<a href="https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025">一年內鎖下超過 10 GW 的核電</a>。綠電仍會用，但很難單獨扛住基載。</p>

<p><strong>台灣的資料中心會不會缺電？</strong><br>短期問題不在用電總量。台灣資料中心目前占全國用電<a href="https://www.twreporter.org/a/data-center-electricity-demand">還不到 1%</a>，真正吃緊的是區域供電與變電設施能不能及時到位，加上大型變壓器交期拉長到約兩年半。台電也估<a href="https://technews.tw/2026/03/02/ai-electricity-taiwan-two-times/">2030 年前系統要新增約 500 萬瓩用電</a>，壓力集中在輸配電這一層。</p>
