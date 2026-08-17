---
title: "升級RTX 5090得先換哪些硬體？電源、主機板與機殼相容性整理"
slug: "rtx-5090-upgrade-hardware-checklist"
description: "升級RTX 5090前要先確認電源瓦數與12V-2x6接頭、主機板PCIe插槽版本、機殼可容納的顯卡長度與插槽厚度三大件。整理NVIDIA官方規格、接頭安裝安全守則與客製卡尺寸落差，附常見問題解答。"
excerpt: "電源、主機板、機殼三個環節任一個沒對到，RTX 5090就裝不進去或點不亮。整理升級前該查的規格清單。"
publishDate: "2026-08-17T02:24:22.018Z"
category: "tech"
subcategory: "digital-tools"
tags:
  - "半導體"
  - "消費趨勢"
  - "供應鏈"
author: "appi-editorial"
status: "published"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
coverImage: "covers/rtx-5090-upgrade-hardware-checklist.webp"
coverAlt: "電腦機殼內安裝好的高階顯卡特寫（示意圖）"
coverImageCredit: "Photo by Vladimir Srajber on Pexels"
highlights:
  - "NVIDIA官方公版RTX 5090建議系統電源達1000瓦，顯卡本身總功耗575瓦，供電接頭最高可承載600瓦的12V-2x6規格。"
  - "公版顯卡長304毫米、高137毫米、厚兩槽，但客製卡如ASUS ROG Astral長達357.6毫米、厚度3.8槽，比公版大上一圈。"
  - "RTX 5090向下相容PCIe 4.0與3.0主機板，實測切到PCIe 4.0模式的遊戲效能損失僅0.3%到2.1%，影響幅度很小。"
  - "12V-2x6接頭近期多次傳出過熱案例，安裝時須確保插到底發出卡榫聲、接頭前35毫米內不可硬凹折，並避免使用轉接鏈。"
risksAndLimits:
  - "本文電源與尺寸數據以NVIDIA公版FE為主，各廠客製卡長度、厚度、建議瓦數皆不同，需以購買型號官方頁為準。"
  - "接頭安裝安全建議整理自維修社群與零組件廠商實測經驗，非NVIDIA逐字技術文件。"
  - "PCIe 4.0與5.0效能落差數據來自特定測試平台與遊戲組合，不同顯卡與解析度組合結果會有差異。"
  - "各主機板廠牌PCIe插槽版本與可用通道數因型號而異，安裝前務必對照主機板手冊確認。"
references:
  - title: "GeForce RTX 5090 Graphics Cards"
    url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/"
    publisher: "NVIDIA（官方）"
    note: "官方公版規格：Required System Power 1000W、Total Graphics Power 575W、12V-2x6接頭選項、卡身304mm×137mm雙槽"
  - title: "What power cable does the NVIDIA GeForce RTX 5090 use?"
    url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/what-power-cable-does-the-nvidia-geforce-rtx-5090-use/"
    publisher: "CORSAIR"
    note: "說明12V-2x6接頭沿革（由12VHPWR更新而來）與PSU須具備ATX 3.0以上認證、原廠12V-2x6線材"
  - title: "RTX 5090 12VHPWR Safety Guide"
    url: "https://bottleneckpc.com/blog/rtx-5090-connector-melting-safe-psu-guide"
    publisher: "BottleneckPC"
    note: "接頭安裝安全守則：接頭前35毫米內禁止硬凹折、插到底無外露金屬、避免轉接鏈"
  - title: "ROG Astral GeForce RTX 5090 32GB GDDR7 OC Edition 規格頁"
    url: "https://rog.asus.com/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5090-o32g-gaming/spec/"
    publisher: "ASUS ROG（官方）"
    note: "客製卡實際尺寸：長357.6mm、寬149.3mm、厚76mm（3.8槽），建議電源1000W"
  - title: "RTX 5090 FE PCIe 5.0 Compatibility Issues: Complete Fix Guide"
    url: "https://www.ofzenandcomputing.com/rtx-5090-fe-pcie-5-0-compatibility-issues-reported-owners-find-workaround-force-pcie-4-0-mode/"
    publisher: "Of Zen and Computing"
    note: "PCIe 4.0向下相容效能損失實測（0.3%~2.1%）與早期PCIe 5.0模式黑屏問題的BIOS解法比例"
---

升級RTX 5090前，電源供應器的瓦數與接頭規格、主機板的PCIe插槽版本、機殼可容納的顯卡長度與插槽厚度，這三大件都要先確認清楚，缺一不可。任何一項沒對到，輕則顯卡裝不進機殼，重則系統點不亮甚至燒接頭。

## 電源供應器：瓦數與接頭都要先過關

[NVIDIA官方規格頁](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)寫明公版RTX 5090的建議系統電源是1000瓦，顯卡本身總功耗（TGP）575瓦，供電走的是最高可承載600瓦的12V-2x6接頭，或是隨附的四條PCIe 8-pin轉接線。想確認自己的電源供應器夠不夠力，可以先參考[顯卡與記憶體同步漲價這篇](/articles/gpu-memory-price-surge-2026/)整理的近期零組件行情，抓一下升級整台平台的預算。

12V-2x6接頭是舊版12VHPWR的更新版本，[CORSAIR的技術說明](https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/what-power-cable-does-the-nvidia-geforce-rtx-5090-use/)指出更新的主因是舊接頭曾傳出過熱問題，換裝時電源供應器須具備ATX 3.0以上認證，並使用原廠附的12V-2x6或相容線材，不要用第三方轉接頭硬接。

<img src="/images/rtx-5090-upgrade-hardware-checklist-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="電腦電源供應器模組化線材特寫（示意圖）">

接頭本身這一年多次傳出過熱熔毀的案例，[BottleneckPC的安裝安全整理](https://bottleneckpc.com/blog/rtx-5090-connector-melting-safe-psu-guide)給出三個具體守則：接頭要插到發出卡榫的「咔」聲，確認插頭與插座之間看不到外露金屬；接頭前35毫米內不可有側向硬凹折，避免電線張力鬆動接點；盡量用電源供應器原廠附的那條線，不要疊加「PSU線材→延長線→轉接頭」這種多層轉接鏈，接點越多、電阻風險越高。

## 主機板：PCIe插槽版本與供電迴路要對

RTX 5090走PCIe 5.0規格，但不代表舊主機板裝不了。[Of Zen and Computing的實測整理](https://www.ofzenandcomputing.com/rtx-5090-fe-pcie-5-0-compatibility-issues-reported-owners-find-workaround-force-pcie-4-0-mode/)顯示，把主機板BIOS設定切到PCIe 4.0模式後，遊戲效能損失只有0.3%到2.1%之間，幾乎感覺不出來，所以PCIe 4.0甚至3.0的主機板都能正常搭配使用。

<img src="/images/rtx-5090-upgrade-hardware-checklist-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="現代電腦主機板與PCIe插槽特寫（示意圖）">

同一份整理也提到，早期公版RTX 5090在PCIe 5.0模式下，曾有一部分使用者回報開機黑屏，把BIOS強制切回PCIe 4.0模式後，多數案例都能解決。裝上去點不亮時，先進BIOS檢查PCIe插槽的世代設定，會比急著懷疑顯卡故障來得快。另外也要留意主機板手冊上標示的插槽供電迴路與可用通道數，部分主機板的第二條PCIe插槽會與M.2插槽共用頻寬，接了RTX 5090之後可能連帶影響其他裝置的速度。

## 機殼：長度與插槽厚度別看漏

尺寸落差是最容易被忽略的一關。NVIDIA公版RTX 5090長304毫米、高137毫米，厚度是標準雙槽。但市售客製卡普遍比公版大上一圈，以[ASUS ROG Astral的官方規格頁](https://rog.asus.com/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5090-o32g-gaming/spec/)為例，長度達357.6毫米、寬149.3毫米、厚度76毫米（相當於3.8個插槽），建議電源同樣是1000瓦。

<img src="/images/rtx-5090-upgrade-hardware-checklist-s3.webp" width="960" height="720" loading="lazy" decoding="async" alt="電腦機殼內部空間特寫（示意圖）">

下手前先量兩個數字：機殼規格表上標示的「顯卡最大支援長度」，以及顯卡插槽位置到機殼前置風扇或硬碟架之間的實際淨空。客製卡動輒3到4槽厚，裝上去可能會直接蓋住主機板上第二條PCIe插槽，也可能壓縮到旁邊的走線空間，安裝前先對照機殼與主機板的官方規格表，會比拆開來裝到一半才發現裝不下省事。想同步了解其他零組件漲價對整體升級預算的影響，也可以參考[KTC、AOC調漲螢幕價格的這篇整理](/articles/ktc-aoc-monitor-price-hike/)。

<h2>常見問題</h2>

<p><strong>舊電源供應器可以用轉接頭接RTX 5090嗎？</strong><br>官方與維修社群都不建議這樣做。應使用電源供應器原廠附的12V-2x6或相容線材，避免疊加多層轉接頭，安裝時務必插到底、聽到卡榫聲，詳見<a href="https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/what-power-cable-does-the-nvidia-geforce-rtx-5090-use/">CORSAIR的接頭說明</a>與<a href="https://bottleneckpc.com/blog/rtx-5090-connector-melting-safe-psu-guide">BottleneckPC的安裝安全守則</a>。</p>

<p><strong>RTX 5090裝在PCIe 4.0主機板上效能會差很多嗎？</strong><br>不會。實測顯示切到PCIe 4.0模式後，遊戲效能損失僅介於0.3%到2.1%之間，幅度很小，<a href="https://www.ofzenandcomputing.com/rtx-5090-fe-pcie-5-0-compatibility-issues-reported-owners-find-workaround-force-pcie-4-0-mode/">相關實測數據</a>也顯示PCIe 3.0主機板同樣能正常使用。</p>

<p><strong>機殼標示的「支援顯卡長度」要怎麼查？</strong><br>多數機殼廠商會在官方規格表列出「Max GPU Length」（顯卡最大支援長度）的毫米數，購買前先比對顯卡官方頁的長度數字，客製卡動輒357毫米以上，比公版的304毫米長不少，同時也要確認插槽厚度是否會擋到其他插槽或風扇空間。</p>
