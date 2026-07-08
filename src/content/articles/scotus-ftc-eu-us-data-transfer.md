---
title: "美國最高法院一紙判決，炸出 EU-US 資料傳輸協議的地基裂縫"
slug: "scotus-ftc-eu-us-data-transfer"
description: "美國最高法院 6/29 在 Trump v. Slaughter 判 FTC 委員免職限制違憲，拿掉了聯邦貿易委員會的獨立性。歐盟允許資料傳到美國的前提正是『美國有獨立監理機關』，這個前提出現裂縫，整套 EU-US Data Privacy Framework 的法律地基開始鬆動。台灣正在建自己的獨立個資會，這堂課要先看懂。"
excerpt: "歐盟准資料流到美國，靠的是『美國有獨立監理』這個假設。最高法院把 FTC 的獨立性判掉，假設就破了。這不是明天斷線，但地基已經在響。"
publishDate: "2026-07-26T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["資料跨境傳輸", "個人資料保護", "歐盟 GDPR", "獨立監理機關", "個資會"]
coverImage: "covers/scotus-ftc-eu-us-data-transfer.webp"
coverAlt: "象徵歐美之間資料跨境傳輸與法律基礎的抽象科技示意"
coverImageCredit: "Photo by Tara Winstead on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "美國最高法院 6/29 在 Trump v. Slaughter 以 6:3 判 FTC 委員免職限制違憲，推翻 1935 年 Humphrey's Executor 先例，等於把聯邦貿易委員會的『獨立性』拿掉。"
  - "歐盟 2023 年那份准許資料傳到美國的適足性決定，前後 259 次援引『獨立的 FTC』當作監理保證；獨立性被判掉，這份決定賴以成立的前提就出現裂縫。"
  - "真正的裂縫在更深處：連救濟用的資料保護審查法院都是靠總統行政命令 14086 撐起來的，不是法律。台灣正在建自己的獨立個資會，這堂課要先看懂：獨立要寫進制度，不能只是掛個名。"
references:
  - title: "US Supreme Court just blew up EU-US Data Transfers"
    url: "https://noyb.eu/en/us-supreme-court-just-blew-eu-us-data-transfers"
    publisher: "noyb"
  - title: "EU-U.S. Data Privacy Framework at risk following U.S. Supreme Court ruling"
    url: "https://www.activemind.legal/guides/dpf-supreme-court/"
    publisher: "activeMind.legal"
  - title: "U.S. Supreme Court FTC Ruling Prompts Fresh Scrutiny of EU-U.S. Data Privacy Framework"
    url: "https://www.hunton.com/privacy-and-cybersecurity-law-blog/u-s-supreme-court-ftc-ruling-prompts-fresh-scrutiny-of-eu-u-s-data-privacy-framework"
    publisher: "Hunton Andrews Kurth"
  - title: "EU–US Data Privacy Framework"
    url: "https://en.wikipedia.org/wiki/EU%E2%80%93US_Data_Privacy_Framework"
    publisher: "Wikipedia"
  - title: "政院通過「個人資料保護委員會組織法」草案及「個人資料保護法」部分條文修正草案"
    url: "https://www.ey.gov.tw/Page/9277F759E41CCD91/747cda78-926f-4205-99b3-1a735fc1b97b"
    publisher: "行政院"
originalContribution: "本文把一件看似純美國國內的行政權判決（FTC 委員免職案），拆成歐盟適足性決定『獨立監理』前提的連鎖風險，並往下追一層指出真正脆弱的不只是 FTC、而是同樣靠行政命令 14086 撐起的救濟法院；再以此對照台灣正在設立的個資會，提出『獨立要寫進制度而非掛名』的在地判準。"
---

美國最高法院 6 月 29 日在 [Trump v. Slaughter 案判聯邦貿易委員會（FTC）委員的免職限制違憲](https://www.activemind.legal/guides/dpf-supreme-court/)，表面上是白宮跟一個獨立機關的權力之爭，實際上鬆動的是歐盟與美國之間整套資料傳輸協議的法律地基。核心理由很簡單：歐盟准許個人資料流到美國，前提是美國那頭有「獨立」的監理機關在看著；判決把 FTC 的獨立性拿掉，這個前提就破了。這不是明天就斷線，但地基已經在響。

先把這件事本身講清楚。這樁案子源自川普直接開除兩名 FTC 委員，沒有引用法律規定的「怠忽職守、失職或不當行為」任一理由。[最高法院以 6:3 站在總統這邊](https://www.hunton.com/privacy-and-cybersecurity-law-blog/u-s-supreme-court-ftc-ruling-prompts-fresh-scrutiny-of-eu-u-s-data-privacy-framework)，首席大法官 Roberts 主筆的多數意見走的是「單一行政權」理論：憲法把行政權交給總統，那所有行政機關就都得受總統節制。這一判，直接推翻了 1935 年 Humphrey's Executor 案立下、讓國會可以把監理機關擋在總統隨意撤換之外的老先例。獨立機關能不能真的獨立，被劃上問號。

<img src="/images/scotus-ftc-eu-us-data-transfer-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="美國最高法院判 FTC 委員免職限制違憲，象徵行政權與獨立機關的角力">

問題是這件事怎麼會燒到歐洲的資料。關鍵字是「獨立」。歐盟法規定，第三國要能接收歐盟公民的個資，那裡對資料的監督必須由一個獨立機關來做。美國拿來滿足這條要求的，正是 FTC。max Schrems 的組織 noyb 直接點出，[歐盟 2023 年那份適足性決定，整份文件前後 259 次援引「獨立的 FTC」](https://noyb.eu/en/us-supreme-court-just-blew-eu-us-data-transfers)當作美國會好好監理的保證。Schrems 的說法很直白：現在美國已經沒有獨立機關了，連歐盟自己的邏輯都撐不住，這套資料協議的基礎已經死了。話講得重，但指的地方沒錯。

<img src="/images/scotus-ftc-eu-us-data-transfer-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="歐盟要求資料監督必須由獨立機關執行的概念示意">

但真正的裂縫比 FTC 更深，這裡要往下追一層。歐美這套 Data Privacy Framework 裡，讓歐盟公民能對美國情報監控提出申訴的救濟管道，是一個叫「資料保護審查法院」的機制。它不是靠國會立法設的，而是靠[拜登 2022 年 10 月簽的行政命令 14086 撐起來的](https://en.wikipedia.org/wiki/EU%E2%80%93US_Data_Privacy_Framework)。行政命令有兩個先天弱點：下一任總統一句話就能撤，而且「所有行政部門都聽總統的」這套剛剛擊倒 FTC 的邏輯，同樣可以拿來質疑這個法院的獨立性。歐盟法要的[是「獨立而有效的監督」（GDPR 第 45 條）](https://www.activemind.legal/guides/dpf-supreme-court/)，美國端卻把它蓋在一道總統隨時能翻的命令上。從 Safe Harbor 到隱私盾再到現在這代協議，Schrems 一路告、歐盟法院一路推翻，換了三次招牌卻沒換地基。這是在處理症狀，不是處理根因。

<img src="/images/scotus-ftc-eu-us-data-transfer-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="把跨境資料合規蓋在行政命令而非法律上的結構性風險示意">

那現在到底斷了沒？還沒。[適足性決定目前仍然有效，沒有任何法院宣告它無效，已完成認證的美國企業還是可以照常接收資料](https://www.hunton.com/privacy-and-cybersecurity-law-blog/u-s-supreme-court-ftc-ruling-prompts-fresh-scrutiny-of-eu-u-s-data-privacy-framework)。改變的是確定性，不是法律狀態。noyb 已經去函要求歐盟執委會撤回這份協議，並[預告幾週內會向歐盟法院提告要求撤銷](https://noyb.eu/en/us-supreme-court-just-blew-eu-us-data-transfers)，這種官司一打通常要兩三年。對企業來說壞消息是，就算改走標準契約條款這條備援路，那套做法本身也要評估美國政府的監控與救濟，而這些評估同樣建立在剛被搖動的獨立性上。備援跟主線踩到的是同一塊鬆掉的地基。

<img src="/images/scotus-ftc-eu-us-data-transfer-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="協議暫時有效但法律不確定性升高，企業須備援的示意">

台灣該從這條新聞讀出什麼？別把它當成美國的家務事。台灣自己正在走同一道題：行政院已在 2025 年 3 月 27 日[通過「個人資料保護委員會組織法」草案，要建立獨立監督機制](https://www.ey.gov.tw/Page/9277F759E41CCD91/747cda78-926f-4205-99b3-1a735fc1b97b)，把個資會定位成相當於中央三級的獨立機關，委員任期受保障、免職有條件。這件事本來就有憲法法庭的判決在後面推。美國這一課的重點不是「行政權好可怕」，而是：獨立要能撐住，得寫進制度裡，不能只是掛個名。要有明確的法律地位、有任期保障、有把首長擋在隨意撤換之外的機制，這幾樣缺一個，歐盟在做適足性評估時就會戳到那個洞。美國就是掛了名卻沒把地基灌實，才會被一紙判決掀開。台灣資料治理近期的波動不少，[連美國都有法官出手擋下政府跨資料庫比對選民個資的做法](/articles/us-judge-blocks-save-voter-database/)，可見這條線的政治風險有多真。台灣要是哪天也想爭取歐盟適足性，現在把個資會的獨立性做扎實，就是在替未來省一場官司。

<img src="/images/scotus-ftc-eu-us-data-transfer-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣推動獨立個人資料保護委員會、把資料監理獨立性做扎實的概念示意">

一紙關於 FTC 的判決，掀開的是一個老問題：把跨境資料的信任，蓋在一道總統能翻的命令、和一個獨立性可被質疑的機關上，本來就不牢。協議這次未必立刻倒，但地基的裂縫已經被看見。看懂裂縫在哪，比追問協議哪天會斷更有用。

<h2>常見問題</h2>

<p><strong>這個判決出來後，我公司把資料傳到美國會不會違法？</strong><br>目前不會。歐盟執委會的適足性決定[仍然有效，沒有任何法院宣告它無效](https://www.hunton.com/privacy-and-cybersecurity-law-blog/u-s-supreme-court-ftc-ruling-prompts-fresh-scrutiny-of-eu-u-s-data-privacy-framework)，已完成認證的美國企業還是可以合法接收資料。改變的是法律確定性升高的風險，不是現在就斷線。真正要盯的是接下來 noyb 的訴訟和歐盟執委會的態度。</p>

<p><strong>Trump v. Slaughter 到底判了什麼，跟資料保護有什麼關係？</strong><br>最高法院 6/29 以 6:3 判 FTC 委員的免職限制違憲，[等於拿掉了 FTC 的獨立性](https://www.activemind.legal/guides/dpf-supreme-court/)。歐盟准許資料傳到美國的前提，是美國有獨立機關負責監理，而美國指定的正是 FTC。獨立性被判掉，這個前提就出現裂縫。</p>

<p><strong>改用標準契約條款（SCC）當備援就沒事了嗎？</strong><br>沒那麼簡單。[SCC 這條路一樣要評估美國政府的監控與救濟機制](https://noyb.eu/en/us-supreme-court-just-blew-eu-us-data-transfers)，而這些評估同樣建立在剛被搖動的獨立性與行政命令上。主線跟備援踩到的是同一塊鬆掉的地基，不是換條路就自動安全。</p>

<p><strong>這件事跟台灣有關嗎？</strong><br>有。台灣正在設立獨立的個人資料保護委員會，行政院已在 2025 年 3 月[通過組織法草案要建立獨立監督機制](https://www.ey.gov.tw/Page/9277F759E41CCD91/747cda78-926f-4205-99b3-1a735fc1b97b)。美國這一課告訴我們，監理機關的獨立性要寫進制度、有任期與免職保障，不能只是名義上獨立，否則未來爭取歐盟適足性時會被戳到。</p>
