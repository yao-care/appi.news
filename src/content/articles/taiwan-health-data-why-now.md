---
title: 台灣醫療大數據，十年磨一劍，成敗在此一役
slug: taiwan-health-data-why-now
description: 台灣整合健康資料試了十年，政府推了十年、多家新創相繼遇阻。這一次，台灣健康網路平台把資本、供給端和商業誘因都補齊了，十年磨一劍，終於有機會成局。剩下最關鍵的一關，是信任怎麼設計。
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
  - 國際四個前車之鑑正好指出會卡在哪：授權不透明、AI 撐不住臨床、公司出事資料被賣、制度沒先備齊
  - 平台的結構優勢補得起錢與供給端的問題，剩下最關鍵的一關是信任，而支撐它的商業誘因也正是最需要顧好的地方
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

台灣醫療大數據整合等了十年，這一次出現了成局的機會。關鍵不在於是否有政府主導，因為政府自己推動的全國電子病歷交換同樣走了十年仍未解決。台灣健康網路平台具備三項結構優勢，補上了過去供給端打不開、資金撐不起的缺口，剩下最關鍵的一關是信任，而支撐平台運作的商業誘因，也正是最需要謹慎處理的地方。

<img src="/images/taiwan-health-data-why-now-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="規模不一的公司站在醫院資料高牆前，象徵整合的難題">

## 十年整合史：政府與民間都試過

台灣整合健康資料並非沒有先例，而是嘗試了很久。

政府投入的時間最久。全國電子病歷交換系統推動了十年，卡點相當具體：[全台醫院各自擁有高達五十幾套不一樣的資訊系統，彼此無法互通，而且醫院把病歷分享給別家，在經濟上並沒有誘因](https://www.ithome.com.tw/news/133599)。技術面後來靠 FHIR 這類標準逐步打通，[電子病歷的推動也持續進行](https://dep.mohw.gov.tw/DOIM/cp-922-1247-114.html)，但「醫院為什麼要分享」的誘因問題，十年來始終沒有真正解決。政府親自推動十年仍卡關，顯示有政府主導並不等於問題會迎刃而解。

<img src="/images/taiwan-health-data-why-now-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="全台醫院各自使用不同資訊系統無法互通的示意">

民間也有過嘗試，遇到的則是另一面牆。智抗糖 Health2Sync 是台灣最大的慢性病照護平台，[2025 年完成 6.6 億元的 C 輪募資，投資人包括緯創、和碩、宏碁與國泰創投](https://meet.bnext.com.tw/articles/view/52123)。這類新創有一道天花板：服務綁在單一疾病，停在病人自己授權得出來的那一層，難以打開醫院的病歷高牆。

## 資本規模對照

把先前的嘗試與這次的組成擺在一起，規模差距相當明顯。華碩與國衛院合資的台生科，[資本額只有 1 億元，天下雜誌以「資本額輸 18 倍也不怕」為標題](https://www.cw.com.tw/article/5139863)。台灣健康網路平台的初期資本額則有 10 億元，[股東為緯創、可成、台達電、義隆電、瑞昱等科技大廠，下一輪國發基金也可望跟投](https://money.udn.com/money/story/5612/9202860)，[並規劃增資到 18 億元](https://www.taiwan-healthcare.org/zh/news-detail?id=0t8q92m6pvlesk3u)。這「18 倍」的差距，反映出此次組成的量體。

| 玩家 | 資金規模 | 路徑 | 卡在哪 / 現況 |
|---|---|---|---|
| 全國電子病歷交換 | 政府計畫預算 | 由上而下 | 醫院沒經濟誘因分享，推十年仍不通 |
| 台生科（華碩＋國衛院） | 資本額 1 億元 | 由下而上 | 分散式收資料，撬醫院病歷仍難 |
| 智抗糖（群健科技） | C 輪累計募資 6.6 億元 | 病人授權層 | 綁單一疾病，撬不開醫院高牆 |
| 台灣健康網路平台 | 初期 10 億、增資目標 18 億 | 上下並進 | 錢與局都補上，考題落在信任 |

（三種金額是三種口徑：台生科的 1 億是資本額，智抗糖的 6.6 億是累計募資，平台的 10 億是初期資本額、18 億是增資目標，三者不宜直接相比。）

<img src="/images/taiwan-health-data-why-now-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="不同規模公司的資本額對照，凸顯這次組成的公司量體最大">

## 四個國際前車之鑑

資本與組成到位，並不保證成功。國際上有幾個前車之鑑，正好說明健康資料平台可能卡在哪些環節，而失敗的原因不只一種。

第一個卡在信任。英國國民保健署的 care.data 計畫試圖把全國家醫科病歷自動匯入單一資料庫，[結果病歷資料被提供給包含保險業者在內的商業公司，民眾未被取得明確同意，退出機制也不清楚，引發全國性的信任危機，2013 年推動、2016 年即廢止](https://medconfidential.org/whats-the-story/care-data-2013-2016/)。後續接棒的方案又遇到相同問題而喊停。

第二個卡在 AI 難以支撐臨床。IBM 的 Watson for Oncology 與知名的 MD Anderson 癌症中心合作，[投入 6,200 萬美元後喊停，原因是無法與醫院的病歷系統同步、資料不足、複雜病歷難以處理，整個 Watson Health 事業於 2022 年以約 10 億美元賤賣給私募基金，遠低於投入金額](https://slate.com/technology/2022/01/ibm-watson-health-failure-artificial-intelligence.html)。

<img src="/images/taiwan-health-data-why-now-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療 AI 系統無法與醫院病歷整合而失敗的示意">

第三個卡在公司發生變故、資料遭到打包。基因檢測公司 23andMe 蒐集了超過 1,500 萬人的基因資料，[2023 年外洩、2025 年進入破產，基因資料在破產程序中成為可出售的資產，爭點在於未重新取得使用者主動同意即轉手，多州檢察長呼籲民眾儘快刪除自己的資料](https://www.npr.org/2025/03/24/nx-s1-5338622/23andme-bankruptcy-genetic-data-privacy)。這類情況直接對應到民眾對於資料是否可能被出售的疑慮。

第四個卡在制度未先備齊，而且案例就發生在台灣。健保資料庫的二次利用一路訴訟到憲法法庭，[2022 年憲判字第 13 號判健保法部分違憲，理由是缺乏獨立監督機制、對個資的處理儲存與外傳沒有明文規範、也沒有退出機制，並要求三年內修法](https://udn.com/news/story/10025/6532707)。這批資料涵蓋的是全體健保納保人。

## 三項結構優勢

對照這四個前車之鑑，更能看出台灣健康網路平台的優勢所在。平台具備三項結構優勢。

第一，平台能同時把供給端拉上桌，又足以支撐長期資金投入。它可以一次找來十多家醫學中心、接上健康存摺的千萬使用者，背後有五家上市科技廠加上國發基金撐起的資產負債表。Watson 投入 6,200 萬美元仍無以為繼，新創更早面臨資金壓力，政府的交換系統屬計畫預算、難以長期當作產品經營。跑道的長短往往影響成敗，而平台在這一點上撐得起。

第二，平台以商業模式補上了政府十年來欠缺的誘因。[緯創負責醫院端、華碩台生科負責民眾端，一個由上而下、一個由下而上](https://news.gbimonthly.com/tw/article/show.php?num=82994)。電子病歷交換卡在醫院缺乏分享的理由，而一個能讓資料變現的商業平台，首次給了醫院參與的實質動機。以商業模式對齊誘因，與以行政命令要求分享，是截然不同的解法。

<img src="/images/taiwan-health-data-why-now-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="用商業誘因把醫院拉上桌參與資料串接的示意">

第三，架構設計不同。care.data 是把全國病歷上傳到單一資料庫集中保管，台灣健康網路平台則主打資料不離院，[搭配去識別化識別碼與區塊鏈動態同意的設計](https://news.gbimonthly.com/tw/article/show.php?num=82994)。這種讓資料留在各院、僅執行聯邦式運算的設計，技術上比 care.data 的集中抽取更站得住腳，前提是確實落實。

## 商業誘因的兩面

這三項優勢補得起的，是供給端打不開與資金難以為繼，也就是新創、Watson、政府交換系統當年卡住的環節。它們都沒有觸及信任，也就是 care.data、23andMe、憲判 13 號卡關的環節。而且體量越大、控制權越集中，資料集中的疑慮就越需要認真回應。這裡的「集中」指的不是資料實體，資料實體採聯邦式、留在醫院，而是控制權與受益權集中在少數幾家手上。Google 資源近乎無限，Google Health 最終仍卡在信任。

進一步看，讓平台得以避開「醫院不肯分享」的那個商業誘因，同時也是讓平台必須謹慎處理「資料被當成資產、二次利用被放寬」的同一個誘因。補上一個問題的機制，也可能帶出另一個問題，23andMe 正是循此路徑發展。

<img src="/images/taiwan-health-data-why-now-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="同一個商業誘因既是助力也是風險的雙面示意">

因此成局與否，不取決於有沒有政府，也不取決於公司規模大小。政府十年的經驗顯示有政府並不足夠，Google 的案例顯示有資金也不足夠。真正的關鍵在於信任如何設計：主動同意、清楚退出、獨立監理、二次利用有界。這也正是[資料供給者手上真正的籌碼](/articles/taiwan-health-data-platform-join/)。至於信任如何一步步做進系統，另有[一篇文章](/articles/medical-ai-compliance-lessons/)整理了開發醫療 AI 合規工具過程中遇到的實務課題。

<h2>常見問題</h2>

<p><strong>台灣以前沒有整合過健康資料嗎？為什麼說這次才湊得起來？</strong><br>有，政府的全國電子病歷交換推了十年，<a href="https://www.ithome.com.tw/news/133599">卡在全台醫院五十幾套系統互不相通、醫院分享病歷沒有經濟誘因</a>。台灣健康網路平台不同的地方是用商業模式給了醫院參與的誘因，加上足夠的資本撐長期跑道，補上了過去缺的兩塊。</p>

<p><strong>政府有份、五家上市大廠背書，是不是就比較可信？</strong><br>信任的依據是動機不是背景。政府自己推十年沒解，證明有政府不是保證；<a href="https://slate.com/technology/2022/01/ibm-watson-health-failure-artificial-intelligence.html">連 IBM 投入巨資的 Watson 醫療事業，最後也因為做不到臨床落地而賤賣收場</a>。體量越大、越能讓資料變現，資料被當成資產的壓力反而越大，所以要盯的是退出與二次利用的界線，不是股東名單。</p>

<p><strong>台灣健康網路平台會不會像 23andMe 那樣，公司出事資料就被賣？</strong><br>這正是最需要留意的風險。<a href="https://www.npr.org/2025/03/24/nx-s1-5338622/23andme-bankruptcy-genetic-data-privacy">23andMe 破產後，1,500 萬人的基因資料在破產程序中變成可出售資產</a>。要防範這種情況，依靠的不是公司承諾，而是事前以制度和契約鎖定二次利用界線、破產時資料如何處置，以及使用者的退出權。</p>

---

本文為資訊整理與觀點分析，不構成投資建議。文中公司資本額與募資數字以各引用來源公開資訊為準。
