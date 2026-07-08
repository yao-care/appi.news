---
title: "三大廠把產能全讓給 HBM，DDR2、DDR3 反而缺到漲 6 成：記憶體漲價開始咬手機與 PC"
slug: "hbm-squeezes-legacy-dram-prices"
description: "記憶體這波漲價不是缺料，是三星、SK 海力士、美光主動把晶圓挪去做 AI 用的 HBM，老規格被放生。連 2003 年就在賣的 DDR2 第二季合約價都漲 55～60%，成本已經咬進手機與 PC。台灣一邊的記憶體廠拿到定價權、一邊的系統廠吞成本，是雙面刃。"
excerpt: "為什麼最舊的 DDR2、DDR3 反而漲最凶？因為三大廠把有限產能讓給高毛利的 HBM，老規格沒人要生產，缺口一路往下傳。這是配置決定的漲價，不是產能做不出來。"
publishDate: "2026-07-31T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["記憶體漲價", "HBM", "DDR3", "DRAM 缺貨", "台灣供應鏈"]
coverImage: "covers/hbm-squeezes-legacy-dram-prices.webp"
coverAlt: "電腦記憶體模組與晶片，象徵三大廠把產能讓給 HBM 後老規格 DRAM 缺貨漲價"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "這波漲價的根不是缺料，是三星、SK 海力士、美光把有限的晶圓產能優先讓給毛利高的 HBM 與伺服器記憶體，老規格 DDR2、DDR3、DDR4 被主動放生。DDR2 光第二季合約價就漲 55～60%。"
  - "缺貨會往下傳：DDR5、DDR4 貴又難買，工程師把設計改回 DDR3，本來用 DDR3 的再降到 DDR2，需求整批往舊世代擠，最舊的規格反而承受最猛漲幅。帳單已經咬進手機與 PC 成本。"
  - "對台灣是雙面刃：南亞科、華邦、力積電這些守成熟製程的廠拿到罕見定價權，南亞科總座直說各產品線毛利都贏 HBM；但同一時間廣達、華碩這些系統廠要吞下墊高的記憶體成本。"
references:
  - title: "Consumer DRAM Shortages Extend to DDR2 Products with Contract Prices Expected to Continue Rising in 3Q26"
    url: "https://www.trendforce.com/presscenter/news/20260622-13112.html"
    publisher: "TrendForce"
  - title: "Memory Giants' HBM Focus Could Limit DRAM Growth Through 2026; Taiwan Firms Boost DDR4"
    url: "https://www.trendforce.com/news/2025/10/17/news-memory-giants-hbm-focus-could-limit-dram-growth-through-2026-taiwan-firms-boost-ddr4/"
    publisher: "TrendForce"
  - title: "DDR4 Shortage Reportedly Limits Nanya Tech's DDR5 Shift; GM Says DRAM Margins Across All Segments Top HBM"
    url: "https://www.trendforce.com/news/2026/05/21/news-ddr4-shortage-reportedly-limits-nanya-techs-ddr5-shift-gm-says-dram-margins-across-all-segments-top-hbm/"
    publisher: "TrendForce"
  - title: "Global Memory Shortage Crisis: Market Analysis and the Potential Impact on the Smartphone and PC Markets in 2026"
    url: "https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/"
    publisher: "IDC"
  - title: "Supply Chain Brief: Memory Market Conditions in 2026"
    url: "https://www.versalogic.com/blog/supply-chain-brief-memory-market-conditions-in-2026/"
    publisher: "VersaLogic"
  - title: "2025–present global memory supply shortage"
    url: "https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage"
    publisher: "Wikipedia"
originalContribution: "本文把『最舊的規格反而漲最凶』這個反直覺現象拆成一條因果鏈：三大廠產能配置（挪給 HBM）→ 老規格被放生 → DDR4 換 DDR3、DDR3 換 DDR2 的降級瀑布 → 需求往最小產能的世代擠。並以此框架交叉 TrendForce、IDC、VersaLogic 的第一手數據，評估這波對台灣『記憶體廠得利、系統廠受害』的雙面刃結構。"
---

這波記憶體漲價不是景氣循環，是三星、SK 海力士、美光三家廠主動把晶圓產能挪去做 AI 用的 HBM、把老規格丟在一邊的結果。最反直覺的是，越舊的規格漲得越凶：連 2003 年就在賣、業界最老還在量產的 DDR2，光今年第二季合約價就[漲了 55% 到 60%，第三季預估再漲 35% 到 40%](https://www.trendforce.com/presscenter/news/20260622-13112.html)；DDR3 一樣缺到廠商接單接不下來。漲價不再只是玩家換 RAM 的事，成本已經開始咬進手機和 PC。

<img src="/images/hbm-squeezes-legacy-dram-prices-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="各種電腦記憶體模組，DDR2、DDR3 等老規格因產能被排擠而缺貨漲價">

先把因果講清楚。HBM（高頻寬記憶體）是 AI 加速器要的那種堆疊記憶體，同樣容量，它吃掉的晶圓面積比一般 DRAM 多很多。三家大廠把先進製程的產能優先塞給 HBM 和伺服器用的 DDR5，到 2025 年 9 月，[三星已把 1c 製程的 DRAM 產能拉到每月 6 萬片、專供 HBM4](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage)。產能是有限的，[每一片挪去做 HBM 的晶圓，就是一片不做給消費裝置的晶圓](https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/)。老規格擠在最後面，供給越縮越緊。工業電腦供應商 VersaLogic 六月的供應鏈簡報就寫得很白：[DDR3 「持續受限、越來越難接單」，DDR4 交期拉到 30 週以上、比基準價漲到 700%](https://www.versalogic.com/blog/supply-chain-brief-memory-market-conditions-in-2026/)。

<img src="/images/hbm-squeezes-legacy-dram-prices-s1.webp" width="960" height="639" loading="lazy" decoding="async" alt="資料中心伺服器機櫃，象徵晶圓產能被 AI 用的 HBM 與伺服器記憶體吸走">

這裡要踩一個剎車。很多人把它讀成「製程做不出來的缺貨」，這是誤讀。DRAM 廠不是不會做 DDR3，是不想做，因為 HBM 的毛利高太多。這是一個產能配置的決定，不是技術瓶頸。誘因結構決定了料往哪流：雲端巨頭直接開[「有多少收多少」的無上限訂單](https://www.versalogic.com/blog/supply-chain-brief-memory-market-conditions-in-2026/)，廠商當然把產能先給出價最高、毛利最肥的那一邊。所以問題的根不在「產能不夠」，在「產能被高毛利產品吸走、低毛利的老規格被主動放生」。分清楚這兩件事才知道這波什麼時候會鬆：要等 HBM 供需平衡，廠商才有餘裕回頭補老規格，而各家對缺貨何時結束的估計，[從美光的 2027 一路拉到 SK 海力士的 2030](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage)。

<img src="/images/hbm-squeezes-legacy-dram-prices-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體廠產線，記憶體缺貨的根是產能配置決定而非製程做不出來">

缺貨還會往下傳，這是老規格跟著遭殃的關鍵。當 DDR5、DDR4 都貴又難買，工程師把新設計改回用 DDR3；本來用 DDR3 的產品，再往下[改用 DDR2](https://www.trendforce.com/presscenter/news/20260622-13112.html)。需求整批往舊世代擠，但舊世代的產能更小、還在收，連華邦都在[逐步減少 DDR2 產能、把料挪去做毛利更好的 DDR3、DDR4](https://www.trendforce.com/presscenter/news/20260622-13112.html)。需求往上衝、供給往下砍，最舊的規格自然承受最猛的漲幅。這就是為什麼二十年前的記憶體，今天會缺到漲六成。

<img src="/images/hbm-squeezes-legacy-dram-prices-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板上的記憶體與晶片，象徵產品被迫改用更舊世代記憶體的降級瀑布">

帳單已經送到消費端。IDC 的分析指出，[記憶體占中階手機物料成本的 15% 到 20%、旗艦機 10% 到 15%](https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/)，這波漲價把手機平均售價推升 3% 到 8%、PC 推升 4% 到 8%，樂觀情境下手機市場萎縮 2.9%、PC 4.9%，悲觀情境更難看。Gartner 進一步估 2026 年全球 [PC 出貨衰退 10% 到 11%、手機 8% 到 9%](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage)，壓力最大的是低階市場，五百美元以下的入門筆電被點名再過兩年可能做不下去。對台灣來說，受傷的不只是買 RAM 的人，是整條吃記憶體的裝置供應鏈；其中[工業與嵌入式產品最卡](https://www.versalogic.com/blog/supply-chain-brief-memory-market-conditions-in-2026/)，因為它們用的正是最老的規格、又最沒有議價的量。

<img src="/images/hbm-squeezes-legacy-dram-prices-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="筆電與電腦硬體，記憶體漲價墊高手機與 PC 售價">

但台灣不是只有受害的一面。三家大廠退出老規格，留下的空缺剛好是台灣記憶體廠的地盤：[南亞科、華邦這些做成熟製程 DRAM 的公司，變成 DDR4 這類老規格的主要供應者](https://www.trendforce.com/news/2025/10/17/news-memory-giants-hbm-focus-could-limit-dram-growth-through-2026-taiwan-firms-boost-ddr4/)。這是難得的定價權，南亞科總經理李培瑛在法說會直說，[目前各產品線的 DRAM 毛利都贏過 HBM](https://www.trendforce.com/news/2026/05/21/news-ddr4-shortage-reportedly-limits-nanya-techs-ddr5-shift-gm-says-dram-margins-across-all-segments-top-hbm/)，公司 2025 年合併營收因此年增 95%。雙面刃在於：台灣同時是全球最大的裝置代工基地，記憶體漲價墊高的是廣達、和碩、華碩這些系統廠的成本。一邊的記憶體廠賺到笑，一邊的系統廠默默吞成本，這波對台灣不是單純的利多。

<img src="/images/hbm-squeezes-legacy-dram-prices-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓廠，台灣成熟製程記憶體廠成為老規格的主要供應者">

把這條新聞收斂成一句話：記憶體漲價的根，不在缺料，在三大廠把有限產能主動讓給 HBM。所以規格越舊漲得越凶、系統廠成本被墊高，而守著成熟製程的台廠反而拿到定價權。看這波不要只盯著「RAM 又漲了」，要看產能被誰吸走、缺口留給了誰。想等它跌下來抄底的人也要記住：這是配置決定的漲價，在 HBM 需求鬆手之前，別期待它自己回頭。

<h2>常見問題</h2>

<p><strong>為什麼最舊的 DDR2、DDR3 反而漲最凶，新的 DDR5 沒漲那麼多？</strong><br>因為缺貨會往下傳。DDR5、DDR4 貴又難買，工程師就把設計改回 DDR3、DDR3 再降到 DDR2，需求整批往舊世代擠，但舊世代產能最小又還在收。TrendForce 估 [DDR2 第二季合約價漲 55% 到 60%、第三季再漲 35% 到 40%](https://www.trendforce.com/presscenter/news/20260622-13112.html)，漲幅比新規格還猛。</p>

<p><strong>記憶體漲價會讓手機和筆電變貴嗎？</strong><br>會，而且已經在發生。記憶體占中階手機物料成本 [15% 到 20%](https://www.idc.com/resource-center/blog/global-memory-shortage-crisis-market-analysis-and-the-potential-impact-on-the-smartphone-and-pc-markets-in-2026/)，IDC 估這波把手機售價推升 3% 到 8%、PC 推升 4% 到 8%，低階入門機種受衝擊最大。</p>

<p><strong>這波記憶體缺貨什麼時候會結束？</strong><br>沒有共識，因為它是產能配置決定的、不是產能做不出來。各大廠估計[從 2027 到 2030 都有](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage)。關鍵在 HBM 的需求什麼時候鬆手，廠商才有餘裕回頭補老規格，在那之前別期待價格自己回落。</p>

<p><strong>記憶體漲價對台灣是好事還是壞事？</strong><br>兩面都有。南亞科、華邦這些做成熟製程 DRAM 的台廠拿到罕見定價權，[毛利甚至贏過 HBM](https://www.trendforce.com/news/2026/05/21/news-ddr4-shortage-reportedly-limits-nanya-techs-ddr5-shift-gm-says-dram-margins-across-all-segments-top-hbm/)；但台灣也是最大的裝置代工基地，廣達、華碩這些系統廠得吞下墊高的成本，是一把雙面刃。</p>
