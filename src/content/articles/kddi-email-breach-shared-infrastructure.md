---
title: "KDDI ISP信箱外洩：1,422萬筆帳密外流真相"
slug: "kddi-email-breach-shared-infrastructure"
description: "KDDI 提供給 ISP 的信箱系統遭入侵，6/17 發現、7/6 確認外洩 1,223 萬筆信箱與 761 萬筆密碼，波及 @nifty、BIGLOBE、J:COM 等六家業者。事件的重點不在哪套軟體有洞，在共用基礎設施的爆破半徑、密碼儲存方式與第三方供應鏈信任邊界，台灣有一模一樣的結構。"
excerpt: "一套信箱系統同時服務六家 ISP，一個第三方軟體的未知漏洞就撈走 1,223 萬筆信箱、761 萬筆密碼。問題不在「哪套軟體有洞」，在為什麼一個洞可以炸這麼大、撈出來的密碼還能直接用。"
publishDate: "2026-07-13T08:00:00+08:00"
updatedDate: 2026-08-22
category: "tech"
subcategory: "security"
tags:
  - "資安"
  - "韓國"
  - "供應鏈"
  - "個資保護"
coverImage: "covers/kddi-email-breach-shared-infrastructure.webp"
coverAlt: "資料中心機房伺服器與網路線，象徵多家 ISP 共用的信箱基礎設施"
coverImageCredit: "Photo by Brett Sayles on Pexels"
author: "appi-editorial"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "KDDI 提供給 ISP 的信箱系統 6/17 遭入侵，7/6 確認外洩 12,233,087 筆信箱與 7,616,173 筆密碼，波及自家與另外五家業者共六家 ISP 的信箱服務；破口是第三方軟體一個連原廠都不知道的未知漏洞。"
  - "真正的教訓不是「哪套軟體有洞」，是三層根因：一套系統服務六家業者的爆破半徑太大、761 萬對 1,223 萬的密碼落差暴露儲存方式有問題、第三方供應鏈的責任歸屬說不清。"
  - "台灣有一模一樣的結構：地方有線電視與中小型 ISP 常共用後台、企業郵件大量外包給同一家業者；外洩的帳密還會被拿去撞庫攻擊台灣的其他服務，因為很多人跨站重用密碼。"
risksAndLimits:
  - "撞庫風險評估基於密碼重用假設，若未跨站重用同一組密碼則風險大幅降低"
  - "密碼儲存方式僅知部分經雜湊或加密，明碼與可逆加密比例未經 KDDI 公開證實"
  - "台灣共用信箱後台的爆破半徑為結構類比推論，未附台灣業者具體外洩數字佐證"
references:
  - title: "KDDI Suffers Massive Data Breach: Up to 12.23 Million Email Addresses, 7.61 Million Passwords Leaked"
    url: "https://finance.biggo.com/news/576ce4ec-db71-4d7f-adbe-ec6361cd0093"
    publisher: "BigGo Finance"
  - title: "Data breach exposes up to 14.2 million email logins at six ISPs"
    url: "https://www.bleepingcomputer.com/news/security/data-breach-exposes-up-to-142-million-email-logins-at-six-isps/"
    publisher: "BleepingComputer"
  - title: "KDDI Breach Affects Six Japanese ISPs, Exposes 14.2M Email Credentials"
    url: "https://www.infosecurity-magazine.com/news/kddi-breach-japanese-telcos/"
    publisher: "Infosecurity Magazine"
  - title: "KDDI、メアドなど最大1422万件漏えいか ISP事業者向けシステムに不正アクセス"
    url: "https://www.itmedia.co.jp/news/articles/2606/23/news114.html"
    publisher: "ITmedia NEWS"
  - title: "KDDIのISP向けメール基盤不正アクセス、最大1422万件漏洩の可能性で総務省が報告求める"
    url: "https://k-tai.watch.impress.co.jp/docs/news/2119914.html"
    publisher: "ケータイ Watch"
  - title: "KDDI Data Breach Impacts up to 14.2 Million Email Accounts at Six ISPs"
    url: "https://securityaffairs.com/194387/data-breach/kddi-data-breach-impacts-up-to-14-2-million-email-accounts-at-six-isps.html"
    publisher: "Security Affairs"
originalContribution: "本文把 KDDI 外洩拆成集中度（單一系統服務六家業者的爆破半徑）、密碼儲存（761 萬對 1,223 萬的落差與明碼／可逆雜湊風險）、供應鏈信任邊界（第三方未知漏洞的責任歸屬）三層根因，並對照台灣共用後台 ISP 與外包郵件的相同結構風險，給使用者與業者分層的應對框架。"
---

這起 KDDI 信箱外洩最該記住的，不是 1,422 萬這個數字，是它暴露的結構：一套信箱系統同時服務六家 ISP，一個第三方軟體的未知漏洞，就把 [1,223 萬筆信箱、761 萬筆密碼](https://finance.biggo.com/news/576ce4ec-db71-4d7f-adbe-ec6361cd0093)一次撈走。問題不在「哪套軟體有洞」，在「為什麼一個洞可以炸這麼大、撈出來的密碼還能直接拿去用」。台灣有一模一樣的結構，只是還沒輪到我們上新聞。

<img src="/images/kddi-email-breach-shared-infrastructure-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="資安與資料外洩概念，鎖頭圖示象徵帳號密碼遭竊">

先把事件講清楚。日本電信商 KDDI 在 6 月 17 日發現[提供給 ISP 業者的信箱系統遭到不正存取](https://www.itmedia.co.jp/news/articles/2606/23/news114.html)，當天就修補系統止血，6 月 23 日對外公布，最初估計最多 1,422 萬筆信箱與密碼可能外洩，含已停用與長期休眠的帳號。經過詳細調查，KDDI 在 [7 月 6 日確認實際外洩 12,233,087 筆信箱、7,616,173 筆密碼](https://finance.biggo.com/news/576ce4ec-db71-4d7f-adbe-ec6361cd0093)。這套系統是 KDDI 賣給多家 ISP 共用的信箱平台，波及自家與另外五家業者，[包含 @nifty、BIGLOBE、J:COM、STNet 的 Pikara、Chubu Telecommunications 的 Commufa、KDDI Web Communications 的租用主機](https://www.infosecurity-magazine.com/news/kddi-breach-japanese-telcos/)。KDDI 自營的 au mail、UQ mobile mail、au one net 走不同基礎設施，沒被波及。日本總務省已依電気通信事業法[要求 KDDI 提交發生原因與再發防止對策報告](https://k-tai.watch.impress.co.jp/docs/news/2119914.html)。

延伸閱讀：[柯達證實遭入侵、ShinyHunters 聲稱握 220 萬筆資料：第三方平台整合又成外洩破口](/articles/kodak-shinyhunters-third-party-integration-breach/)

<img src="/images/kddi-email-breach-shared-infrastructure-s2.webp" width="868" height="1300" loading="lazy" decoding="async" alt="筆電上的信箱登入畫面，象徵外洩的帳號密碼登入資訊">

很多人第一個反應是「趕快修漏洞、換掉那套軟體」。這個方向沒有錯，但如果只做到這一步，就是在處理症狀不是根因。根因有三層，第一層是集中度。為什麼一個漏洞可以同時炸到六家業者？因為它們共用同一套後台。資安圈有個詞叫爆破半徑（blast radius），指的是一次入侵能波及的範圍。當你把六家 ISP 的信箱都掛在同一套系統上，這套系統的爆破半徑就等於六家的用戶總和。省成本的共用平台，在正常時候是效率，出事的時候是把所有雞蛋放在同一個籃子。這不是 KDDI 一家的疏忽，是整個「白牌信箱外包」商業模式內建的風險，只是平常沒人算這筆帳。

<img src="/images/kddi-email-breach-shared-infrastructure-s3.webp" width="960" height="639" loading="lazy" decoding="async" alt="網路節點互相連接的抽象示意，象徵共用系統放大波及範圍">

第二層在密碼怎麼存。這裡有個容易被略過、但很關鍵的數字：外洩的信箱有 1,223 萬筆，密碼卻是 761 萬筆，兩者差了 460 萬。KDDI 說[部分密碼是以雜湊或加密形式儲存](https://www.bleepingcomputer.com/news/security/data-breach-exposes-up-to-142-million-email-logins-at-six-isps/)，但沒有交代用的是哪種演算法、多少比例是明碼。落差和這句含糊的說明放在一起，就值得警覺：如果全部都是加了鹽的不可逆雜湊，被撈走也難以還原，那根本不必特別點出「761 萬筆密碼外洩」這個數字。能被單獨清點出來、還要提醒用戶改密碼，代表這批裡有相當比例是明碼或可逆加密，可以直接拿去試登入。真正的用戶風險就在這：這些帳密會被丟進撞庫攻擊（credential stuffing），拿你在 KDDI 的密碼去試你的網路銀行、電商、社群帳號，只要你跨站重用密碼就會中。

<img src="/images/kddi-email-breach-shared-infrastructure-s4.webp" width="960" height="638" loading="lazy" decoding="async" alt="密碼輸入欄位與資安鎖頭，象徵密碼儲存方式與撞庫風險">

第三層是供應鏈的信任邊界。KDDI 把破口指向一個[第三方軟體的漏洞，而且是連原廠自己都還不知道的未知漏洞](https://finance.biggo.com/news/576ce4ec-db71-4d7f-adbe-ec6361cd0093)，公司也拒絕公布是哪套軟體。這帶出一個沒有標準答案的問題：當你採用的第三方元件出包，責任在誰？出事被總務省要求報告、要對用戶負責的是 KDDI，不是那家匿名的軟體商。破口在別人家、帳算在你頭上，這正是近期一連串外洩的共同劇本，我之前寫過[心臟監測商 iRhythm 病患資料遭竊](/articles/irhythm-phi-breach-third-party-perimeter/)、寫過[LastPass 因第三方情報平台 Klue 的 OAuth token 被竊而外洩](/articles/lastpass-klue-oauth-token-breach/)，破口都不在自家核心系統，而在接進來的第三方那一段。KDDI 事後說要導入 AI 程式碼分析來防範，方向可以理解，但別把它當成解方：AI 掃描抓的是已知模式，這次是連原廠都不知道的洞，真正要補的是「第三方元件進來之前，有沒有盡職調查、有沒有把爆破半徑切小」的制度，不是再疊一層工具。

<img src="/images/kddi-email-breach-shared-infrastructure-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="程式碼與軟體元件示意，象徵第三方供應鏈的未知漏洞風險">

那台灣該從這條日本新聞讀出什麼？別以為這是隔壁的事。台灣的地方有線電視業者、中小型 ISP，很多也是共用同一套郵件後台；不少企業的公司信箱直接外包給同一家服務商。同樣的共用結構，同樣的爆破半徑。而且就算你不是這六家 ISP 的用戶，外洩的帳密也會被拿來撞台灣的服務，因為密碼重用是跨國界的。所以框架分兩層看。使用者這一層，能做的很具體：假設你在該類信箱的密碼已經外洩，立刻改掉，並且把任何和它重用同一組密碼的帳號一起換掉，能開兩步驟驗證（2FA）的全部打開，別再靠一組密碼守全部。業者與監管這一層要解的是另一組題：密碼儲存有沒有落實不可逆雜湊加鹽、第三方元件納入前有沒有實質審查、共用平台的集中度風險要不要對用戶揭露。使用者做的是止血，制度做的才是把根因補上，兩件事不能互相替代。

<img src="/images/kddi-email-breach-shared-infrastructure-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="手機上的兩步驟驗證畫面，象徵使用者可立即採取的防護行動">

看懂這起外洩，重點不是記住 1,422 萬這個數字，是看清它把三個平常被省成本蓋住的問題一次掀開：共用系統的爆破半徑、密碼儲存的偷工、第三方供應鏈的責任真空。這三題台灣都有，差別只在還沒被同一個未知漏洞同時戳到。與其等輪到自己再來滅火，不如現在就把密碼換掉、把兩步驟打開，然後問一句：我用的服務，後台是不是也和一堆人共用一個籃子。

## 常見問題

**我不是 KDDI 或日本 ISP 的用戶，這次外洩跟我有關嗎？**
有可能有關。外洩的信箱與密碼會被拿去撞庫攻擊，也就是拿這批帳密去試登入其他網站。只要你曾經在別的服務用過相同的電子郵件加相同的密碼，那組密碼就等於也曝險了。最保險的做法是把重用同一組密碼的帳號全部換掉，並開啟兩步驟驗證。

**外洩了 1,223 萬筆信箱，密碼卻只有 761 萬筆，這代表什麼？**
代表這套系統裡不是每個帳號的密碼都以同樣方式被撈到，也暗示密碼的儲存方式並不一致。KDDI 說[部分密碼有雜湊或加密](https://www.bleepingcomputer.com/news/security/data-breach-exposes-up-to-142-million-email-logins-at-six-isps/)，但沒說明比例與演算法。會被單獨清點成「外洩密碼」並要求用戶改密碼，通常意味著其中有相當比例是明碼或可以還原的，風險比只洩信箱高很多。

**這次是誰的錯，KDDI 還是那家第三方軟體商？**
破口出在 [KDDI 系統採用的第三方軟體的未知漏洞](https://finance.biggo.com/news/576ce4ec-db71-4d7f-adbe-ec6361cd0093)，但對用戶負責、被日本總務省要求提交報告的是 KDDI。這正是供應鏈風險的難處：你採用別人的元件，就把對方的漏洞一起接進了自己的信任邊界，出事時外包不掉責任。

**台灣有沒有同樣的風險？**
有。台灣的地方有線電視、中小型 ISP 常共用同一套郵件後台，企業信箱也大量外包給同一家業者，這種共用結構的爆破半徑和 KDDI 這次一樣大。差別只在還沒被同一個漏洞同時戳中。個資保護與共用平台的集中度揭露，是監管端該補的題。
