---
title: "AI 機櫃電力密度怎麼規畫？設施清單"
slug: "ai-datacenter-power-density-planning-guide"
coverImage: "covers/ai-datacenter-power-density-planning-guide.webp"
coverAlt: "資料中心工程師檢查高密度伺服器機櫃的供電與液冷管線"
description: "AI伺服器進場前，機房要先核對每櫃功率、配電餘裕、散熱方式、網路、樓板載重與故障域。本文用容量表與驗收順序，避免設備到貨後才發現電力或冷卻不足。"
publishDate: 2026-08-10
category: "tech"
subcategory: "industry-tech"
tags: ["AI基礎建設", "電網", "能源政策", "數位轉型"]
author: "appi-editorial"
reviewedBy: ["lightman"]
factCheckedBy: ["appi-editorial"]
status: "published"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
topics: ["ai-compute-infrastructure"]
readingTime: 7
risksAndLimits:
  - "配電、消防、冷卻與結構設計應由合格專業人員依設備規格及當地法規完成"
  - "本文是規畫清單，不能代替現場負載測試、單線圖審查與設備廠商驗收"
references:
  - title: "NVIDIA Inference Reference Architecture"
    url: "https://docs.nvidia.com/ncx/ncp-inference-ra/"
    publisher: "NVIDIA"
  - title: "能源開發及使用評估準則修正草案預告"
    url: "https://www.moeaea.gov.tw/ECW/populace/news/News.aspx?kind=1&menu_id=41&news_id=34504"
    publisher: "經濟部能源署"
---

AI 機櫃規畫要從「實際最大功率」往上推配電與散熱，不能拿傳統伺服器的平均值直接乘櫃數。先取得伺服器、交換器與儲存設備的規格及預計配置，再核對供電路徑、冷卻、樓板、網路與故障域。台灣 5MW 以上資料中心的政策要求可看[資料中心產業效益與能源審查](/articles/taiwan-data-center-industrial-benefit-review/)。

## 先建立每櫃容量表

列出每台設備的額定功率、典型功率、數量、電源規格、重量、進出風方向與網路埠。分別加總 IT 最大負載與預估常態負載，並標示未來擴充容量。供應商報價單上的整機名稱不足以完成這一步，電源供應器數量與冗餘模式也要確認。

AI 訓練與大型推論可能需要多節點高速互連。[NVIDIA 推論參考架構](https://docs.nvidia.com/ncx/ncp-inference-ra/)要求設計者同時考慮機櫃、網路軌、GPU 互連與故障域。設備分散後若跨越過多交換層，算力仍可能被網路拖慢。

## 配電要檢查到哪一層

從台電或自備電源、變壓器、UPS、配電盤、母線、PDU 一路走到伺服器插座，逐層記錄額定容量、可用容量與冗餘模式。A、B 兩路電源若最後共用同一個上游設備，表面雙路仍有單點故障。

容量設計還要預留維修與故障時的負載轉移。驗收時用真實或等效負載測試，確認斷一路電、切換 UPS 及啟動發電機時，設備與冷卻沒有一起掉線。

## 散熱、供水與樓板一起看

高密度機櫃可能需要液冷或後門熱交換器，選擇前應核對供回水溫度、流量、水質、漏水偵測、維修空間與備援。液冷仍會把部分熱量留給空氣系統，不能把原有空調全部忽略。

機櫃重量包含伺服器、配電、冷卻與線材，地板承載與搬運路徑都要由專業人員確認。水資源受限的場址也應把耗水與冷卻方案一起評估，可延伸閱讀[用水大戶耗水費試算清單](/articles/water-consumption-fee-calculation-checklist/)。

## 上線前驗收順序

- 確認設備清單、韌體與最終機櫃位置。
- 測試 A、B 路供電與上游故障切換。
- 以預計負載驗證溫度、流量與熱點。
- 測試高速網路、儲存與跨節點效能。
- 模擬單櫃、單列及單一交換器故障。
- 建立功率、溫度、漏水與網路告警門檻。
- 保存單線圖、管線圖、變更紀錄與復原步驟。

算力設備本身仍需按工作負載選擇，可搭配[AI 加速器工作負載評估清單](/articles/ai-accelerator-workload-selection-checklist/)避免設施與設備各自最佳化、最後卻無法配合。

## 常見問題

### 每櫃功率看額定值還是平均值？

配電安全與容量要考慮可達最大負載，營運成本可另用實測平均值估算，兩個數字不能混用。

### 有雙電源供應器就是完整備援嗎？

不一定。兩路電源必須一路追到上游，若共用同一 UPS、盤體或變壓器，仍可能有單點故障。

### 液冷後還需要空調嗎？

通常仍需要處理未被液冷帶走的熱量與其他設備負載，實際比例依系統設計而定。

### 設備到貨後再測機房可以嗎？

風險很高。功率、冷卻、重量與搬運限制應在採購與機房設計階段核對，上線前再做整合驗收。
