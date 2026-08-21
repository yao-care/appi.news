---
title: "ABF載板是什麼？味之素傳大砍中國供貨30%，台廠受惠鏈一次看懂"
slug: "abf-substrate-supply-chain"
description: "ABF載板是高階CPU、GPU與ASIC封裝的多層基板。本文拆解ABF薄膜的絕緣與微細線路功能、味之素供應集中原因，並整理中國部分客戶可能減供約30%後，晶化科技、南亞電路板與景碩等台廠應觀察的環節。"
excerpt: "ABF是夾在載板銅線路層之間的薄膜絕緣材料，直接影響高階晶片能否完成封裝。味之素減供約30%的消息尚未獲官方證實，但已讓AI伺服器供應鏈重新檢視材料與載板的替代來源。"
publishDate: "2026-08-21T18:05:35.025Z"
category: "tech"
subcategory: "semiconductor"
tags:
  - "半導體"
  - "先進封裝"
  - "供應鏈"
  - "AI基礎建設"
  - "日本"
coverImage: "covers/sk-hynix-packaging-hbm-tsmc.webp"
coverAlt: "高階處理器與記憶體模組的近距離畫面，象徵ABF載板所處的晶片封裝供應鏈"
coverImageCredit: "Photo by Marta Branco on Pexels"
author: "appi-editorial"
status: "published"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "ABF是高階半導體封裝中的層間絕緣薄膜，協助多層銅線路維持細線寬、低熱膨脹與穩定訊號傳輸。"
  - "味之素對部分中國客戶可能減供約30%的消息，來自產業媒體引述，截至2026年8月20日仍未獲味之素證實。"
  - "台灣供應鏈可分材料替代、ABF載板製造與高階伺服器應用三段觀察，客戶認證與高層數產能是能否接單的實際門檻。"
risksAndLimits:
  - "30%減供消息僅獲媒體引述，味之素截至8月20日未證實幅度"
  - "台廠能否接單取決於材料驗證、客戶認證與高層數產能"
  - "ABF市占數據多是味之素自述，涵蓋範圍以主要電腦用市場為主"
  - "晶化科技目前為驗證與小量出貨，量產規模仍未公開"
references:
  - title: "Our Technologies: Electronic Materials and ABF"
    url: "https://www.ajinomoto.com/innovation/rd-organizations-and-facilities/bioscience_chemicals/technology"
    publisher: "Ajinomoto Group"
  - title: "Ajinomoto Build-up Film ABF product information"
    url: "https://www.aft-website.com/en/products/insulating_film-abf/"
    publisher: "Ajinomoto Fine-Techno"
  - title: "Ajinomoto Co. Starts Operation to Strengthen Its Electronic Materials Business"
    url: "https://www.ajinomoto.co.jp/company/en/presscenter/press/detail/g2016_04_13.html"
    publisher: "Ajinomoto Co."
  - title: "ABF 增層膜供應吃緊掀搶料潮 中美晶迎轉單"
    url: "https://money.udn.com/money/amp/story/11074/9704378"
    publisher: "經濟日報"
  - title: "覆晶球閘陣列封裝載板產品介紹"
    url: "https://www.kinsus.com.tw/zh-TW/Product/product/Detail/tw_FCBGA"
    publisher: "景碩科技"
  - title: "ABF Substrate Technology Roadmap"
    url: "https://www.nanyapcb.com.tw/nypcb/chinese/Technology/ABFSRoadmap"
    publisher: "南亞電路板"
  - title: "景碩：今年業績看2位數成長 ABF載板需求強續擴產"
    url: "https://www.cna.com.tw/news/afe/202603120281.aspx"
    publisher: "中央社"
topics: ["taiwan-semiconductor-supply-chain", "ai-compute-infrastructure"]
---

ABF載板是高階晶片封裝用的多層基板，ABF則是夾在銅線路層之間的薄膜絕緣材料。[味之素對部分中國客戶可能減供約30%的消息](https://money.udn.com/money/amp/story/11074/9704378)截至2026年8月20日仍未獲證實；若供貨調整成真，會先碰到材料與高階FC-BGA載板的分配，再傳到AI晶片與伺服器交期。

想先理解封裝產能與AI晶片交付的關係，可閱讀[台積電CoWoS與NVIDIA產能預訂的供應鏈整理](/articles/tsmc-cowos-nvidia-capacity-booking/)。CoWoS是封裝工序，ABF是載板材料，兩者位在不同環節。

<img src="/images/ai-asic-vs-gpu-explained-s3.webp" width="960" height="721" loading="lazy" decoding="async" alt="晶片與晶圓表面的近距離畫面，象徵高階晶片封裝材料與微細線路" title="ABF薄膜讓載板能承接高階晶片的微細多層配線（示意圖）">

## ABF載板做什麼用？

ABF全名是 Ajinomoto Build-up Film，位於載板內部，負責層間絕緣。載板廠把ABF與銅線路逐層堆疊，再形成微細孔洞與配線，讓晶片和主機板完成高速連接。[味之素官方說明](https://www.aft-website.com/en/products/insulating_film-abf/)列出的功能包括細線路形成、雷射加工與多層堆疊。

高階CPU、GPU、ASIC與FPGA需要大量輸入輸出接點，[景碩的FCBGA產品](https://www.kinsus.com.tw/zh-TW/Product/product/Detail/tw_FCBGA)便以微處理器、圖像處理器、特化功能IC與FPGA為應用。AI加速器尺寸與訊號密度上升，也會拉高大尺寸、高層數載板需求。

<img src="/images/gpu-memory-price-surge-2026-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板上的處理器晶片特寫，周圍可見密集電子元件" title="高階處理器需要載板完成晶片與系統之間的訊號連接（示意圖）">

## 為什麼供應高度集中？

味之素在1998年推出ABF，使用樹脂配方、填料分散與薄膜製程技術。[公司資料](https://www.ajinomoto.co.jp/company/en/presscenter/press/detail/g2016_04_13.html)指出，ABF能在銅線路之間阻隔電流，並配合更細導線設計。材料要同時顧到絕緣性、熱膨脹、平整度與量產良率，客戶導入後還需完成驗證。

[味之素官方目前表示](https://www.ajinomoto.com/innovation/rd-organizations-and-facilities/bioscience_chemicals/technology)，ABF在全球多數電腦的層間絕緣膜市場占比接近100%。這項占比是公司自述，涵蓋範圍以主要電腦用市場為主。供應高度集中時，產能分配就會直接影響載板廠接單。

<img src="/images/ai-new-infrastructure-compute-trusted-industries-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程師檢查晶片與電路板，背景呈現人工智慧運算與通訊設備" title="ABF供應集中會把材料配置問題傳到AI晶片與資料中心產線（示意圖）">

## 減供約30%會怎麼傳導？

[經濟日報報導](https://money.udn.com/money/amp/story/11074/9704378)，味之素因產能接近滿載而採選擇性出貨，部分中國客戶可能收到約30%減供通知，但幅度尚未獲味之素證實。可確認的訊號是供應吃緊，30%仍是待查證的市場消息。

供應鏈可分三段：材料替代，中美晶旗下晶化科技已完成多家客戶驗證並小量出貨；載板製造，[南亞電路板路線圖](https://www.nanyapcb.com.tw/nypcb/chinese/Technology/ABFSRoadmap)列出2026年最高24層、2027年上半年超過24層；高階應用，[景碩持續擴充ABF載板產能](https://www.cna.com.tw/news/afe/202603120281.aspx)，需求來自高階AI伺服器晶片。

材料認證、產品良率與高層數產能，會決定台廠能否承接轉單。供貨傳聞不能直接換算成營收或股價結果。

<img src="/images/abf-substrate-supply-chain/flow.svg" width="960" height="600" loading="lazy" decoding="async" alt="ABF材料從味之素到台灣載板廠，再進入AI晶片與伺服器供應鏈的流程圖" title="ABF材料到AI伺服器的供應鏈傳導（資料整理圖）">

## 台廠受惠鏈看哪裡？

| 環節 | 可查證角色 | 觀察條件 |
|---|---|---|
| 材料替代 | 晶化科技已驗證並小量出貨 | 配方、良率、導入速度 |
| ABF載板 | 南亞電路板、景碩 | 高層數、大尺寸、產能 |
| 下游需求 | AI伺服器、CPU、GPU、ASIC | 出貨、良率、交期 |

這份名單用來辨認供應鏈位置。若味之素調整供貨，受惠規模仍取決於認證、產能與客戶拉貨；想看ASIC與GPU分工，可延伸閱讀[ASIC與GPU的架構差異及台灣供應鏈位置](/articles/ai-asic-vs-gpu-explained/)。

<img src="/images/tsmc-system-era-sellers-market-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體工程師在實驗室檢查晶圓與晶片，背景可見封裝與製造設備" title="材料、載板與封裝能力共同決定AI晶片能否完成交付（示意圖）">

<h2>常見問題</h2>

<p><strong>ABF載板和ABF薄膜一樣嗎？</strong><br>不一樣。<a href="https://www.aft-website.com/en/products/insulating_film-abf/">ABF薄膜</a>是載板內部的層間絕緣材料，ABF載板則整合ABF、銅線路與多層製程，連接晶片與主機板。</p>

<p><strong>味之素減少中國供貨30%確定了嗎？</strong><br>截至8月20日，<a href="https://money.udn.com/money/amp/story/11074/9704378">經濟日報報導</a>部分客戶可能收到約30%減供通知，但味之素尚未證實幅度。供應吃緊已有報導，實際減供對象仍待公開說明。</p>

<p><strong>哪些台廠可能受惠？</strong><br>可先看材料替代的晶化科技，以及<a href="https://www.nanyapcb.com.tw/nypcb/chinese/Technology/ABFSRoadmap">南亞電路板</a>、<a href="https://www.kinsus.com.tw/zh-TW/Product/product/Detail/tw_FCBGA">景碩</a>的ABF或FCBGA載板布局。能否接單仍取決於材料認證、產品良率、層數能力與客戶拉貨。</p>
