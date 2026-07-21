---
title: 台灣醫療大數據，十年磨一劍，成敗在此一役
slug: taiwan-health-data-why-now
description: 台灣整合健康資料試了十年，政府推了十年、新創一家家撞牆。這一次，台灣健康網路平台把資本、供給端和商業誘因都補齊了，十年磨一劍，終於有機會成局。剩下最關鍵的一關，是信任怎麼設計。
publishDate: 2026-07-20T13:00:00.000Z
category: health
subcategory: health-policy
tags:
  - 台灣健康網路平台
  - 醫療大數據
  - 電子病歷交換
  - 台生科
  - 智抗糖
author: lightman
coverImage: covers/taiwan-health-data-why-now.webp
coverAlt: 多家規模不一的公司試圖打通醫院之間的資料高牆，象徵台灣醫療大數據整合十年磨一劍的歷程
status: published
sourceType: author
contentType: analysis
disclaimerType: general
column: ai-healthcare
topics:
  - ai-medical-regulation
highlights:
  - 台灣不是沒試過，政府的全國電子病歷交換推了十年，卡在醫院分享病歷沒有經濟誘因
  - 資本對照懸殊：台生科資本額 1 億、智抗糖 C 輪累計募資 6.6 億，台灣健康網路平台初期資本額 10 億、規劃增資到 18 億並有五家上市科技廠背書
  - 國際上四個前車之鑑正好指出會卡在哪：授權不透明、AI 撐不住臨床、公司出事資料被賣、制度沒先備齊
  - 它的結構優勢補得起錢與供給端的問題，剩下最關鍵的一關是信任，而讓它站起來的商業誘因也正是最要顧好的地方
readingTime: 11
originalContribution: 盤點台灣健康資料整合的十年戰史與民間新創嘗試，列出各家資本額與募資額做規模對照，並將國際失敗案例依失敗模式分類，析論台灣健康網路平台的結構優勢與其內生的信任風險。
references:
  - title: 醫療資料交換新出路：10 年電子病歷交換的痛點，靠區塊鏈創新授權找出新解法（iThome）
    url: https://www.ithome.com.tw/news/133599
  - title: 電子病歷推動簡介（衛生福利部資訊處）
    url: https://dep.mohw.gov.tw/DOIM/cp-922-1247-114.html
  - title: 資本額輸 18 倍也不怕 台生科憑什麼搶佔醫療數據商機？（天下雜誌）
    url: https://www.cw.com.tw/article/5139863
  - title: 智抗糖完成 6.6 億元 C 輪募資，緯創資通、和碩等台廠加入投資人行列（Meet 創業小聚）
    url: https://meet.bnext.com.tw/articles/view/52123
  - title: 台灣健康網路平台今啟航，打破資料孤島建立 AI 主權（GeneOnline News）
    url: https://geneonline.news/twhealthnexus-start-2026/
  - title: 生醫數據國家隊成軍 楊泮池出任董座 緯創、可成、台達電都是股東（經濟日報）
    url: https://money.udn.com/money/story/5612/9202860
  - title: What actually happened with care.data?（medConfidential）
    url: https://medconfidential.org/whats-the-story/care-data-2013-2016/
  - title: How IBM's Watson went from the future of health care to sold off for parts（Slate）
    url: https://slate.com/technology/2022/01/ibm-watson-health-failure-artificial-intelligence.html
  - title: 23andMe is filing for bankruptcy. Here's what it means for your genetic data（NPR）
    url: https://www.npr.org/2025/03/24/nx-s1-5338622/23andme-bankruptcy-genetic-data-privacy
  - title: 健保資料庫侵犯資訊隱私權 憲法法庭判健保法部分違憲（聯合新聞網）
    url: https://udn.com/news/story/10025/6532707
draft: false
coverImageCredit: ""
---

台灣醫療大數據等了十年，這一次真的有機會成局。它靠的不是「有政府就會成」，因為政府自己的全國電子病歷交換也推了十年都沒解。台灣健康網路平台有三個實打實的結構優勢，這三項補得起「供給端打不開、錢燒不起」，剩下最關鍵的一關是「信任」，而讓它站起來的商業誘因，也正是最需要顧好的地方。

<img src="/images/taiwan-health-data-why-now-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="規模不一的公司站在醫院資料高牆前，象徵整合的難題">

## 台灣早就有人試過，連政府自己都試了十年

要判斷這一局會不會成，先看前面有多少人試過、又卡在哪。台灣整合健康資料這件事，不是沒試過，是試了很久。

政府自己下場最久。全國電子病歷交換系統推了十年，卡點很具體：[全台醫院各自擁有高達五十幾套不一樣的資訊系統，彼此無法互通，而且醫院把病歷分享給別家，在經濟上並沒有誘因](https://www.ithome.com.tw/news/133599)。技術後來靠 FHIR 這類標準逐步打通了，[電子病歷的推動也一路在做](https://dep.mohw.gov.tw/DOIM/cp-922-1247-114.html)，但那個「醫院為什麼要分享」的誘因問題，十年都沒真正解掉。重點在這：政府親自推了十年還卡著，「有政府撐腰」從來就不是答案。

<img src="/images/taiwan-health-data-why-now-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="全台醫院各自使用不同資訊系統無法互通的示意">

民間這端也試過，而且撞的是另一面牆。智抗糖 Health2Sync 是台灣最大的慢性病照護平台，做得很不錯，[2025 年還完成了 6.6 億元的 C 輪募資，投資人包括緯創、和碩、宏碁與國泰創投](https://meet.bnext.com.tw/articles/view/52123)。但這類新創有個天花板：它綁在單一疾病、停在病人自己授權得出來的那一層，撬不開醫院的病歷高牆。

## 資本對照：試過的人有多小，這次的局有多大

把試過的人和這次的局擺在一起，規模差距一眼看得出來。連華碩和國衛院合資的台生科，[資本額也只有 1 億元，天下雜誌直接用「資本額輸 18 倍也不怕」當標題](https://www.cw.com.tw/article/5139863)。而台灣健康網路平台，初期資本額就有 10 億元，[股東是緯創、可成、台達電、義隆電、瑞昱等科技大廠，下一輪國發基金也可望跟投](https://money.udn.com/money/story/5612/9202860)，[並規劃增資到 18 億元](https://www.taiwan-healthcare.org/zh/news-detail?id=0t8q92m6pvlesk3u)。那個「18 倍」不是巧合，是這個局的量體。

| 玩家 | 資金規模 | 路徑 | 卡在哪 / 現況 |
|---|---|---|---|
| 全國電子病歷交換 | 政府計畫預算 | 由上而下 | 醫院沒經濟誘因分享，推十年仍不通 |
| 台生科（華碩＋國衛院） | 資本額 1 億元 | 由下而上 | 分散式收資料，撬醫院病歷仍難 |
| 智抗糖（群健科技） | C 輪累計募資 6.6 億元 | 病人授權層 | 綁單一疾病，撬不開醫院高牆 |
| 台灣健康網路平台 | 初期 10 億、增資目標 18 億 | 上下並進 | 錢與局都補上，考題落在信任 |

（三種金額是三種口徑：台生科的 1 億是資本額，智抗糖的 6.6 億是累計募資，平台的 10 億是初期資本額、18 億是增資目標，別混為一談。）

<img src="/images/taiwan-health-data-why-now-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="不同規模公司的資本額對照，凸顯這次組成的公司量體最大">

## 四個前車之鑑：別人卡在哪裡

有錢有局，不代表就會成。國際上有幾個前車之鑑，正好把「會卡在哪」講清楚。健康資料平台失敗的原因，不只一種。

第一個，卡在信任。英國國民保健署的 care.data 想把全國家醫科病歷自動匯進單一資料庫，[結果病歷資料被提供給包含保險業者在內的商業公司、民眾又沒有被取得明確同意、退出機制也講不清楚，引爆全國性的信任危機，2013 年推、2016 年就廢止](https://medconfidential.org/whats-the-story/care-data-2013-2016/)。後來的接棒方案又踩同一個坑再喊停。

第二個，卡在 AI 撐不住臨床。IBM 的 Watson for Oncology 跟知名的 MD Anderson 癌症中心合作，[燒掉 6,200 萬美元後喊停，因為無法跟醫院的病歷系統同步、資料不足、複雜病歷處理不了，整個 Watson Health 事業 2022 年以約 10 億美元賤賣給私募基金，遠低於投入](https://slate.com/technology/2022/01/ibm-watson-health-failure-artificial-intelligence.html)。

<img src="/images/taiwan-health-data-why-now-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療 AI 系統無法與醫院病歷整合而失敗的示意">

第三個，卡在公司出事、資料被打包。基因檢測公司 23andMe 蒐集了超過 1,500 萬人的基因資料，[2023 年外洩、2025 年破產，基因資料在破產程序中變成可出售的資產，爭點正是沒有重新取得使用者主動同意就轉手，多州檢察長呼籲民眾趕快刪除自己的資料](https://www.npr.org/2025/03/24/nx-s1-5338622/23andme-bankruptcy-genetic-data-privacy)。這一種，直接命中很多人心裡那句「會不會哪天被賣掉」。

第四個，卡在制度沒先備齊，而且就發生在台灣。健保資料庫的二次利用被告到憲法法庭，[2022 年憲判字第 13 號判健保法部分違憲，理由是缺獨立監督機制、對個資的處理儲存外傳沒有明文、也沒有退出機制，限三年內修法](https://udn.com/news/story/10025/6532707)。這件事的資料，你我也在裡面。

## 台灣健康網路平台憑什麼不一樣

看懂這四個前車之鑑，才看得懂台灣健康網路平台真正的優勢在哪。它有三個實打實的結構優勢。

第一，它能同時把供給端拉上桌，又撐得起長期燒錢。它可以一次把十多家醫學中心找來、接上健康存摺的千萬用戶，背後有五家上市科技廠加國發基金撐起的資產負債表。Watson 燒 6,200 萬美元都撐不住，新創更早斷糧，政府的交換系統是計畫預算、難長期當一個產品養。這條跑道多長，決定生死，而它撐得起。

第二，它用商業模式補上了政府十年缺的那個誘因。[緯創負責醫院端、華碩台生科做民眾端，一個由上而下、一個由下而上](https://news.gbimonthly.com/tw/article/show.php?num=82994)。電子病歷交換卡在醫院沒有分享的理由，一個能讓資料變現的商業平台，第一次給了醫院「參與有好處」的動機。用生意去對齊誘因，跟用行政命令要求分享，是完全不同的解法。

<img src="/images/taiwan-health-data-why-now-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="用商業誘因把醫院拉上桌參與資料串接的示意">

第三，架構真的不一樣。care.data 是把全國病歷上傳到單一資料庫、集中保管，這家主打資料不離院，[配合去識別化識別碼與區塊鏈動態同意的設計](https://news.gbimonthly.com/tw/article/show.php?num=82994)。這種讓資料留在各院、只跑聯邦式運算的設計，技術上比 care.data 的集中抽取站得住，前提是老實做到。

## 最關鍵的一關：讓它站起來的誘因，也是最要顧好的地方

但最關鍵的一句在這裡：這三個優勢補得起的，是「供給端打不開」和「錢燒不起」，也就是新創、Watson、政府交換系統當年卡住的地方。它們一項都沒動到「信任」，也就是 care.data、23andMe、憲判 13 號卡關的地方。而且體量越大、控制權越集中，資料集中的疑慮就越要認真回應。這裡的「集中」講的不是資料實體，資料實體是聯邦式、留在醫院；講的是控制權與受益權集中在少數幾家手上。Google 資源近乎無限，Google Health 最後還是卡在信任。

更深一層是：讓它避開「醫院不肯分享」的那個商業誘因，也正是讓它要顧好「資料被當成資產、二次利用被放寬」的同一個誘因。補起一個問題的東西，也可能帶出另一個問題，23andMe 就是這樣走的。

<img src="/images/taiwan-health-data-why-now-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="同一個商業誘因既是助力也是風險的雙面示意">

所以會不會成，不是看「有沒有政府」，也不是看「公司夠不夠大」。政府自己十年證明有政府不夠，Google 證明有錢不夠。真正的關鍵是信任怎麼設計：主動同意、清楚退出、獨立監理、二次利用有界。這剛好也是[你我這些資料供給者手上真正的籌碼](/articles/taiwan-health-data-platform-join/)。至於信任要怎麼一步一步做進系統，我把自己做醫療 AI 合規工具踩過的坑，寫在[另一篇](/articles/medical-ai-compliance-lessons/)。

<h2>常見問題</h2>

<p><strong>台灣以前沒有整合過健康資料嗎？為什麼說這次才湊得起來？</strong><br>有，政府的全國電子病歷交換推了十年，[卡在全台醫院五十幾套系統互不相通、醫院分享病歷沒有經濟誘因](https://www.ithome.com.tw/news/133599)。台灣健康網路平台不同的地方是用商業模式給了醫院參與的誘因，加上足夠的資本撐長期跑道，補上了過去缺的兩塊。</p>

<p><strong>政府有份、五家上市大廠背書，是不是就比較可信？</strong><br>信任的依據是動機不是背景。政府自己推十年沒解，證明有政府不是保證；[連 IBM 投入巨資的 Watson 醫療事業，最後也因為做不到臨床落地而賤賣收場](https://slate.com/technology/2022/01/ibm-watson-health-failure-artificial-intelligence.html)。體量越大、越能讓資料變現，資料被當成資產的壓力反而越大，所以要盯的是退出與二次利用的界線，不是股東名單。</p>

<p><strong>台灣健康網路平台會不會像 23andMe 那樣，公司出事資料就被賣？</strong><br>這正是最該盯的風險。[23andMe 破產後，1,500 萬人的基因資料在破產程序中變成可出售資產](https://www.npr.org/2025/03/24/nx-s1-5338622/23andme-bankruptcy-genetic-data-privacy)。要防這種事，靠的不是公司承諾，是事前把二次利用界線、破產時資料如何處置、以及你的退出權，用制度和契約先寫死。</p>

---

本文為資訊整理與觀點分析，不構成投資建議。文中公司資本額與募資數字以各引用來源公開資訊為準。
