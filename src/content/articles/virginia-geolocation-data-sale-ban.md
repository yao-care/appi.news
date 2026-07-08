---
title: "維吉尼亞封殺『賣定位資料』：精準地理位置正式禁止交易，但留了一道門"
slug: "virginia-geolocation-data-sale-ban"
description: "維吉尼亞州 SB338 於 2026 年 7 月 1 日生效，把精準地理位置資料從『可經同意販售』改成『一律禁售』，成為繼馬里蘭、奧勒岡後第三個這麼做的州。但它的『銷售』只定義為金錢對價，留下以資料換資料的漏洞。台灣個資法該從這條新聞讀出什麼。"
excerpt: "為什麼一條看似嚴格的禁令，資料掮客可能還是繞得過去？答案藏在『銷售』兩個字怎麼定義。維州只禁金錢對價，不含以物易物，這是解對題還是解半題。"
publishDate: "2026-07-25T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["地理位置隱私", "資料掮客", "個資保護", "維吉尼亞 SB338", "台灣個資法"]
coverImage: "covers/virginia-geolocation-data-sale-ban.webp"
coverAlt: "手機地圖定位圖釘，象徵精準地理位置資料的隱私與交易管制"
coverImageCredit: "Photo by Theo Decker on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "維吉尼亞 SB338 於 2026/7/1 生效，把精準地理位置資料（半徑 1,750 英尺內能定位到人的資料）從『可經消費者同意販售』改成『一律禁售』，成為繼馬里蘭、奧勒岡後第三個這麼做的州。"
  - "維州的『銷售』只涵蓋『金錢對價』的交換，不像馬里蘭、奧勒岡把『其他有價對價』一併算進去；這代表用資料換資料、換服務的以物易物模式，理論上還走得通，禁令留了一道門。"
  - "定位資料的殺傷力不在座標本身，而在能反推你去過哪：生殖醫療診所、教會、示威現場。台灣個資法把定位當一般個資、沒有『禁售』這一格，這才是該補的洞。"
references:
  - title: "Virginia Becomes Third State to Ban Sale of Consumers' Precise Geolocation Data"
    url: "https://www.troutmanprivacy.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/"
    publisher: "Troutman Pepper Locke（Privacy + Cyber + AI）"
  - title: "Virginia Expands VCDPA with Ban on Sale of Precise Consumer Geolocation Data"
    url: "https://newmedialaw.proskauer.com/2026/04/15/virginia-expands-vcdpa-with-ban-on-sale-of-precise-consumer-geolocation-data/"
    publisher: "Proskauer New Media and Technology Law Blog"
  - title: "Virginia enacts ban on precise geolocation data sales as momentum for similar prohibitions builds"
    url: "https://therecord.media/virginia-enacts-ban-on-precise-geolocation-data"
    publisher: "The Record（Recorded Future News）"
  - title: "Virginia Governor signs landmark location privacy bill into law"
    url: "https://advocacy.consumerreports.org/press_release/virginia-governor-signs-landmark-location-privacy-bill-into-law/"
    publisher: "Consumer Reports Advocacy"
  - title: "Virginia Becomes Third State to Ban Sale of Consumers' Precise Geolocation Data"
    url: "https://www.regulatoryoversight.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/"
    publisher: "Troutman Regulatory Oversight"
originalContribution: "本文把 SB338 的重點從『第三個禁售的州』移到『銷售』兩字的定義差異：逐項比對維州『僅金錢對價』與馬里蘭、奧勒岡『含其他有價對價』的落差，指出以物易物漏洞，並以『解對題 vs 解半題』的框架對照台灣個資法把定位視為一般個資、缺『禁售』分級的結構缺口。"
---

維吉尼亞州從 2026 年 7 月 1 日起，禁止任何業者販售消費者的精準地理位置資料。這條規定叫 SB338，[在 2026 年 4 月中拿到州長簽署、7 月 1 日生效](https://www.troutmanprivacy.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/)，把定位資料從「經你同意就能賣」改成「一律不准賣」，維州是繼馬里蘭、奧勒岡之後第三個這麼做的州。但真正值得看的不是這個「第三」，是它禁令裡留的一道門。

<img src="/covers/virginia-geolocation-data-sale-ban.webp" width="1200" height="800" loading="lazy" decoding="async" alt="手機地圖定位圖釘，象徵精準地理位置資料的隱私與交易管制">

先講清楚被禁的到底是什麼。維州法律把「精準地理位置資料」定義成[能在半徑 1,750 英尺（約 530 公尺）內直接定位到某個人的資料](https://www.regulatoryoversight.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/)。這不是你在 IP 位置查到的「大概在台北市」那種粗略資訊，而是精確到你站在哪個街區、進了哪棟樓的等級。這種資料每天從你手機裡的天氣、導航、遊戲那些不起眼的 App 流出去，經過一層層資料掮客（data broker）打包轉賣，最後變成公開市場上一份可以買的商品。

<img src="/images/virginia-geolocation-data-sale-ban-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="手機 GPS 定位追蹤，象徵資料掮客把精準位置資料打包轉賣">

這次修法真正的動作，是把管制層級整個往上抬。維州原本的《消費者資料保護法》（VCDPA）把定位歸在「敏感資料」，處理方式是同意制：只要業者取得你的知情同意，還是可以賣。SB338 [直接把同意制這一格拿掉，換成禁售](https://www.regulatoryoversight.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/)。差別在哪？同意制的假設是「你有能力保護自己，看清楚條款再按同意」。但實際情況是，同意藏在幾十頁的隱私政策裡，沒人讀得完，按下去等於棄權。從同意制走到禁售，等於承認了一件事：在這種資訊落差下，靠個人自我保護是解錯題，該從源頭切斷交易。

<img src="/images/virginia-geolocation-data-sale-ban-s2.webp" width="867" height="1300" loading="lazy" decoding="async" alt="州議會與立法文件，象徵定位資料從同意制改為禁售的制度轉向">

方向對，但這裡要踩一個剎車。維州對「銷售」的定義，只算「金錢對價」的交換。[馬里蘭和奧勒岡把「其他有價對價」也一併算進去，維州沒有](https://www.troutmanprivacy.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/)。這個差別看起來很技術，後果卻很實際：如果一家公司不是「收錢賣資料」，而是拿定位資料去換另一家公司的資料、去換廣告投放服務、去換某種商業合作，這種以物易物在維州的字面上就不算「銷售」，理論上還走得通。資料掮客這個行業最擅長的，就是把價值藏在非現金的交換裡。禁令把前門鎖死，側門卻沒關。

<img src="/images/virginia-geolocation-data-sale-ban-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="放大鏡檢視法律文件，象徵禁售條文裡以物易物的定義漏洞">

法律圈也讀到了這個縫。Proskauer 的分析提醒，這條法對「下游」買到定位資料的公司同樣有殺傷力，[建議下游業者重新檢查資料來源、盤點跟供應商的合約條款](https://newmedialaw.proskauer.com/2026/04/15/virginia-expands-vcdpa-with-ban-on-sale-of-precise-consumer-geolocation-data/)，確認手上那批資料的取得路徑合法。換句話說，就算你不是第一手賣資料的人，只要你買進的資料是從違法管道流出來的，一樣會被掃到。這是好的設計，把責任沿著整條供應鏈往下釘，而不是只罰最上游那一手。但責任釘得住的前提，是「銷售」的定義要夠密，否則以物易物那條路一開，整條鏈的追責點就跟著鬆掉。

為什麼定位資料值得動用禁售這種重手段？因為它的殺傷力不在座標本身，在能反推你是誰、去過哪。一份精準定位軌跡，可以看出你固定週日去哪間教會、上個月進過哪間診所、參加過哪場示威。[美國參議員 Wyden 在 2024 年 2 月揭露](https://therecord.media/virginia-enacts-ban-on-precise-geolocation-data)，有反墮胎組織買下手機定位資料，鎖定全美 48 州約 600 間生殖醫療診所的訪客，對他們推送針對性訊息。這不是假設，是已經發生的事。定位資料是少數幾種「你以為只是座標、其實是你整個人」的資料，這也是為什麼各州要把它單獨拉出來管，而不是丟進一般個資裡混著算。

<img src="/images/virginia-geolocation-data-sale-ban-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="地圖上的定位圖釘，象徵定位軌跡能反推診所、教會等敏感場所">

那台灣該從這條新聞讀出什麼？先看我們現在站在哪。台灣《個人資料保護法》把定位資料當「一般個人資料」處理，沒有像美國這些州一樣，把精準定位單獨拉出來設「禁售」這一格。個資法管的是「蒐集、處理、利用要有特定目的與法律依據」，走的還是同意與告知的老路。這正好是維州剛剛承認「不夠用」而跳過去的那一層。美國走在前面示範的，不是「台灣也要抄一條禁售令」，而是提醒我們：把定位當一般個資、靠同意把關，在資料掮客這種商業模式下，可能根本攔不住轉賣。這跟我先前談[歐盟 AI 法對台灣的對齊壓力](/articles/eu-ai-act-gpai-enforcement-taiwan-alignment/)是同一條線，國際法規正在把某幾類高風險資料單獨分級，台灣的框架要跟上，得先承認「哪些資料不能只靠同意」。

<img src="/images/virginia-geolocation-data-sale-ban-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台北城市街景，象徵台灣個資法對定位資料的保護與分級課題">

Consumer Reports 的政策分析師講了一句話蠻到位：[「每個人的敏感定位資料都該被保護，而不是賣給出價最高的人」](https://advocacy.consumerreports.org/press_release/virginia-governor-signs-landmark-location-privacy-bill-into-law/)。維州這步走對了大方向，把源頭的交易切斷，比要求每個人自己讀懂條款務實得多。但「銷售」只鎖金錢對價這道門沒關，讓它從一條乾淨的禁令，變成一條有縫的禁令。對台灣來說，該學的不是條文本身，是背後那個判斷：定位資料的問題根源在「它能被當商品交易」，要解就從交易端下手，而且要把「交易」定義到夠密，別留下以物易物那道門。看懂它留的縫在哪，比記住它是第幾個禁售的州重要。

## 常見問題

<p><strong>維吉尼亞這條禁令從什麼時候開始？我人在台灣會受影響嗎？</strong><br>SB338 在 2026 年 7 月 1 日正式生效，<a href="https://www.troutmanprivacy.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/">禁止業者販售精準地理位置資料</a>。它是美國州法，管的是維州消費者的資料，台灣使用者不在保護範圍內。但你用的很多 App 是跨國營運，這類州法會促使業者調整全球的資料處理做法，間接可能讓做法收斂，不過對台灣沒有直接法律效力。</p>

<p><strong>什麼叫「精準」地理位置資料？跟一般定位有什麼不同？</strong><br>維州法律把它定義為<a href="https://www.regulatoryoversight.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/">能在半徑 1,750 英尺（約 530 公尺）內直接定位到某個人的資料</a>。這比「大概在哪個城市」精細得多，足以看出你進了哪棟樓、去了哪間診所。粗略的區域定位（例如只知道你在某個城市）不在這條禁令的射程內。</p>

<p><strong>既然禁售了，資料掮客為什麼還可能繞得過去？</strong><br>因為維州對「銷售」只定義成「金錢對價」的交換，<a href="https://www.troutmanprivacy.com/2026/04/virginia-becomes-third-state-to-ban-sale-of-consumers-precise-geolocation-data/">不像馬里蘭、奧勒岡把「其他有價對價」也算進去</a>。這代表用資料換資料、換服務、換合作這種不涉及現金的以物易物，在字面上可能不算「銷售」，理論上還走得通。禁令鎖了收錢賣資料的前門，沒關以物易物的側門。</p>

<p><strong>定位資料被賣掉，最壞會發生什麼事？</strong><br>定位軌跡能反推你去過哪些敏感場所。<a href="https://therecord.media/virginia-enacts-ban-on-precise-geolocation-data">美國參議員 Wyden 在 2024 年揭露</a>，有組織買下手機定位資料，鎖定全美約 600 間生殖醫療診所的訪客推送針對性訊息。定位還可能被用於跟蹤、詐騙與身分盜用，這也是各州要單獨管它的原因。</p>

<p><strong>台灣的個資法有管定位資料的販售嗎？</strong><br>台灣《個人資料保護法》把定位當「一般個人資料」，要求蒐集、處理、利用有特定目的與法律依據，走的是同意與告知制，沒有像維州一樣針對精準定位設「禁售」這一格。美國這波修法的參考價值，在於它提醒：把定位當一般個資、只靠同意把關，面對資料掮客的商業模式可能攔不住轉賣。</p>
