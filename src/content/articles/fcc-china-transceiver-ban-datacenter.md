---
title: "FCC為何禁中國光收發器？AI資料中心關鍵零件解析"
slug: "fcc-china-transceiver-ban-datacenter"
description: "FCC為何要禁中國製光收發器？路透社報導，川普政府正透過FCC草擬禁令，防範中國硬體植入AI資料中心引發資安風險。光收發器是資料中心內部透過光纖高速傳輸資料的關鍵零件，中國企業掌握全球供應量約三分之二，首當其衝的是中際旭創、恐轉單的是美國雲端業者。"
updatedDate: "2026-08-22"
excerpt: "路透社報導，川普政府正透過FCC草擬禁令，擬禁止中國光收發器進口以保護AI資料中心。中際旭創等中國供應商首當其衝，美國雲端業者恐轉單推升成本；中國駐美使館警告將視情況反制。"
publishDate: "2026-08-06T17:03:21.286Z"
category: "international"
subcategory: "global-trends"
tags:
  - "美國"
  - "中國"
  - "AI基礎建設"
  - "供應鏈"
  - "貿易政策"
  - "地緣政治"
highlights:
  - "路透社引述4名知情人士報導，川普政府正透過FCC草擬禁令，擬禁止進口新型中國製光收發器（AI資料中心內部光纖傳輸的關鍵零件），官員希望今年內公布並生效"
  - "官方理由是防範中國企業竊取資料、安裝惡意軟體或癱瘓訓練與運行AI模型的美國資料中心服務，白宮與FCC均未回應置評請求"
  - "全球最大光收發器供應商之一中際旭創（Zhongji Innolight）首當其衝，該公司今年6月已被列入美國國防部認定的中國軍方相關企業清單"
  - "中國駐美使館回應要求美方「停止抹黑中國企業並以制裁威脅」，並表示「將採取一切必要措施反制」任何損害中方利益的行動"
risksAndLimits:
  - "本文主要事實引自路透社匿名引述4名知情人士的報導，措施尚未定案，FCC仍可能修改或擱置整項提案"
  - "受影響公司如中際旭創、Eoptolink、AWS、Coherent均未回應置評請求，官方版本細節尚待正式公布後確認"
  - "中國反制清單（無人機出口逐案審查、封殺Compliance Testing LLC等）是否直接對應本項收發器禁令，原始報導未明確連結兩者因果"
  - "禁令若定案，短期恐推高美國資料中心零組件成本，替代供應商產能能否即時填補缺口，目前尚無定論"
references:
  - title: "US weighs ban on Chinese data center equipment imports"
    url: "http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports"
    publisher: "Asia Bulletin（轉載路透社）"
  - title: "US mulling ban on key Chinese networking tech in data center component crackdown"
    url: "https://www.tomshardware.com/tech-industry/data-centers/us-mulling-ban-on-key-chinese-networking-tech-in-data-center-component-crackdown-white-house-wants-to-impose-restrictions-in-2026-china-says-it-will-respond-if-necessary"
    publisher: "Tom's Hardware"
  - title: "With FCC ban on new Chinese-made optical transceivers for DCs likely, it may be time to stock up"
    url: "https://www.networkworld.com/article/4205228/with-fcc-ban-on-new-chinese-made-optical-transceivers-for-dcs-likely-it-may-be-time-to-stock-up.html"
    publisher: "Network World"
  - title: "The US wants Chinese optics out of its AI data centres. Amazon and Microsoft pay first."
    url: "https://thenextweb.com/news/fcc-optical-transceiver-ban-china-us-hyperscalers"
    publisher: "The Next Web"
  - title: "U.S., China: FCC Drafting Ban on Chinese Data Center Technology"
    url: "https://worldview.stratfor.com/situation-report/us-china-fcc-drafting-ban-chinese-data-center-technology"
    publisher: "Stratfor Worldview（RANE）"
  - title: "FCC Transceiver Ban Would Cut 60% of AI Data Center Supply; Western Replacements Need Chinese Indium"
    url: "https://www.techtimes.com/articles/323104/20260805/fcc-transceiver-ban-would-cut-60-ai-data-center-supply-western-replacements-need-chinese-indium.htm"
    publisher: "Tech Times"
author: "appi-editorial"
reviewedBy:
  - "luo-yang"
factCheckedBy:
  - "appi-editorial"
status: "published"
sourceType: "wire"
contentType: "news"
disclaimerType: "general"
disclosure: "本篇由 APPI News 編輯部以 AI 工具編譯路透社（經 Asia Bulletin 轉載）與多家國際科技媒體公開報導而成，已逐條附上原文出處供查證；編輯部不持立場。"
coverImage: "covers/fcc-china-transceiver-ban-datacenter-cover.webp"
coverAlt: "資料中心伺服器機房示意畫面"
coverImageCredit: "攝影：Taylor Vick，Unsplash"
originalContribution: "本文以路透社（經 Asia Bulletin 轉載）獨家報導為主軸，交叉查證 Tom's Hardware、Network World、The Next Web、Stratfor Worldview 與 Tech Times 對同一事件的報導，補上光收發器的技術脈絡、中國供應商市佔數字、中國商務部同日反制清單，供台灣讀者理解這起美中AI供應鏈角力事件的完整脈絡。"
---

FCC為何要禁中國製光收發器？[路透社報導](http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports)引述4名知情人士指出，川普政府正透過聯邦通訊委員會（FCC）草擬禁令，擬禁止進口新型中國製光收發器，理由是防範中國企業藉此竊取資料、植入惡意軟體或癱瘓訓練與運行AI模型的美國資料中心服務，官員希望今年內公布並生效。光收發器是AI資料中心內部負責透過光纖高速傳輸資料的核心零件，中國企業掌握全球供應量約三分之二，如今美國政府正醞釀對它下手。這項提案尚未定案，消息人士也強調FCC仍可能修改或擱置整項措施。

## 光收發器是什麼？為什麼AI資料中心離不開它

光收發器是一種安裝在伺服器與交換器連接埠上的小型模組，負責把電子訊號轉換成光脈衝、再透過光纖電纜高速傳輸資料，是資料中心機房內伺服器彼此溝通的關鍵通道。[Network World報導](https://www.networkworld.com/article/4205228/with-fcc-ban-on-new-chinese-made-optical-transceivers-for-dcs-likely-it-may-be-time-to-stock-up.html)指出，隨著AI模型訓練需要成千上萬顆晶片同步運算，資料在伺服器之間搬移的速度直接影響訓練效率，光收發器因此成為AI資料中心擴建潮中需求量暴增的零件之一。[The Next Web報導](https://thenextweb.com/news/fcc-optical-transceiver-ban-china-us-hyperscalers)引述業界估算，中國企業目前掌握全球光收發器供應量約三分之二，是這波AI基礎建設熱潮背後相當隱形、卻幾乎無所不在的零件供應方。

延伸閱讀：[川普對60國課10%至12.5%新關稅　印度稅率因加強反強迫勞動下修、巴西智利揚言反制](/articles/trump-new-tariffs-60-countries/)

<figure>
<img src="/images/fcc-china-transceiver-ban-datacenter-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="光纖網路線與交換器設備示意畫面">
<figcaption>光收發器負責把電子訊號轉為光脈衝、透過光纖電纜在資料中心內部高速傳輸資料。（示意圖，攝影：Scott Rodgerson，Unsplash）</figcaption>
</figure>

## FCC草案內容：禁新型號進口，官員盼年內生效

[路透社報導](http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports)指出，這項此前未被報導的提案，是川普政府持續限制中國科技深植美國關鍵產業供應鏈的最新一步，目的是趁中國硬體尚未大規模嵌入美國AI基礎建設前先行防範，避免重演2019年對華為設備下達禁令後，電信業者得耗費數年才能全面汰換既有設備的高成本經驗。據其中3名消息人士描述，FCC草案傾向禁止「新型號」中國製收發器進口，同時讓多數非中國供應商豁免於限制之外。白宮與FCC均未回應路透社的置評請求。

## 中國駐美使館：停止抹黑，必要時將反制

面對禁令消息，[路透社報導](http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports)引述中國駐美使館聲明，要求美方「聽取兩國商界客觀理性的聲音」，並「停止抹黑中國企業、以制裁相威脅」。使館並警告，「中方將採取一切必要措施，反制任何對其利益造成實質損害的行動」。[Stratfor Worldview分析](https://worldview.stratfor.com/situation-report/us-china-fcc-drafting-ban-chinese-data-center-technology)指出，這起草案被視為美中科技與供應鏈脫鉤趨勢中的最新一環，涉及AI關鍵基礎建設的管制範疇；同一股脫鉤壓力也出現在記憶體供應鏈（[蘋果為何測試中國長鑫存儲記憶體晶片](/articles/apple-cxmt-memory-supply-chain/)）。

## 誰會受衝擊：中際旭創首當其衝，美國雲端業者恐轉單

[路透社報導](http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports)指出，若禁令成真，全球最大光收發器供應商之一中際旭創（Zhongji Innolight）將首當其衝，該公司今年6月已被美國國防部列入認定與中國軍方有關聯的企業清單，目前尚未回應置評請求。[Tech Times報導](https://www.techtimes.com/articles/323104/20260805/fcc-transceiver-ban-would-cut-60-ai-data-center-supply-western-replacements-need-chinese-indium.htm)與[The Next Web報導](https://thenextweb.com/news/fcc-optical-transceiver-ban-china-us-hyperscalers)皆引述市場資料指出，中際旭創與另一家中國廠商Eoptolink合計掌握全球800G以上高階光收發器模組逾6成市占，兩家公司股價在消息傳出後同步重挫。路透社報導同時指出，美國雲端業者如Amazon Web Services恐須被迫轉單至Coherent、Lumentum等其他供應商，推升採購成本；AWS、Coherent與Lumentum同樣未回應置評請求。

## 不是頭一次：FCC已對中國無人機、路由器、機器人下過類似禁令

[路透社報導](http://www.asiabulletin.com/news/279222505/us-weighs-ban-on-chinese-data-center-equipment-imports)指出，FCC先前已對中國製無人機與路由器透過「受管制清單」（Covered List）祭出類似禁令，上週也才對中國製電力變流器與機器人追加限制。這項光收發器提案若定案，將是FCC延續同一套管制邏輯，把範圍進一步擴大到AI資料中心的核心零件供應鏈。[Tom's Hardware報導](https://www.tomshardware.com/tech-industry/data-centers/us-mulling-ban-on-key-chinese-networking-tech-in-data-center-component-crackdown-white-house-wants-to-impose-restrictions-in-2026-china-says-it-will-respond-if-necessary)引述業界分析師意見指出，中國廠商產品已深度嵌入全球供應鏈，籠統禁令能否真正阻絕資安風險、還是徒增美系業者成本，業界看法分歧；由於提案細節仍未正式公布，最終管制範圍與生效時間仍有變數。

## 常見問題

### 光收發器是什麼？
光收發器是安裝在伺服器與交換器連接埠上的小型模組，負責把電子訊號轉換成光脈衝，透過光纖電纜在資料中心內部高速傳輸資料，是AI模型訓練時伺服器彼此溝通的關鍵零件。

### 美國為何要禁止進口中國製光收發器？
官員擔心中國企業藉這項零件竊取資料、植入惡意軟體，或癱瘓訓練與運行AI模型的美國資料中心服務，因此透過FCC草擬禁令，盼今年內公布並生效。

### 這項禁令現在定案了嗎？
還沒。消息人士強調FCC草案尚未定案，仍可能修改或擱置，草案傾向只禁新型號中國製收發器進口，並讓多數非中國供應商豁免於限制之外。

### 禁令若成真，哪些企業會受衝擊？
全球最大光收發器供應商之一中際旭創首當其衝，其與中國廠商Eoptolink合計掌握全球高階光收發器逾6成市占；AWS等美國雲端業者恐須轉單Coherent、Lumentum，推升採購成本。

### 這是FCC第一次對中國科技產品下類似禁令嗎？
並非首次。FCC先前已透過受管制清單對中國製無人機與路由器下過禁令，上週也才對中國製電力變流器與機器人追加限制，這次是同一套管制邏輯的延伸。
