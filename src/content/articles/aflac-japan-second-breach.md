---
title: "Aflac 日本一年內第二次遭駭、438 萬客戶個資外洩：把資安當成補洞就是解錯題"
slug: "aflac-japan-second-breach"
description: "Aflac 日本 6/30 公布約 438 萬名客戶與代理店個資因不正存取外洩，其中約 23 萬人連銀行振替帳戶資訊都被拿走。這是 Aflac 一年內第二次遭駭；重點不是又被駭，而是攻擊面換了位置：去年美國打的是人，今年日本打的是客戶入口網站。"
excerpt: "同一家公司一年內兩次外洩，直覺反應是這家公司不長記性。但兩次攻擊面完全不同，去年補的洞擋不住今年的攻擊。真正該解的題是攻擊面治理，不是出一次事補一個點。"
publishDate: "2026-07-29T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["Aflac", "資料外洩", "壽險資安", "個資保護", "攻擊面治理"]
coverImage: "covers/aflac-japan-second-breach.webp"
coverAlt: "壽險公司客戶資料外洩的資安示意"
coverImageCredit: "Photo by cottonbro studio on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Aflac 日本 6/30 公布約 438 萬名客戶與代理店個資外洩，其中約 23 萬人連保險費振替的銀行帳戶資訊都被拿走，未含信用卡與 My Number。"
  - "這是 Aflac 一年內第二次遭駭；去年 6 月美國業務被駭波及 2,265 萬人、帶有 Scattered Spider 社交工程特徵，今年日本打的卻是客戶入口網站，兩次攻擊面完全不同。"
  - "真正的教訓不是又被駭，是攻擊面會移動；把資安當成出一次事補一個洞就是解錯題，該做的是把系統、第三方、人納入同一套攻擊面治理。"
references:
  - title: "Aflac Japan reports breach on 4.38 million customers, includes bank details"
    url: "https://asia.nikkei.com/spotlight/cybersecurity/aflac-japan-reports-breach-on-4.38-million-customers-includes-bank-details"
    publisher: "Nikkei Asia"
  - title: "Aflac Japan Data Breach Impacts 4.38 Million"
    url: "https://www.securityweek.com/aflac-japan-data-breach-impacts-4-38-million/"
    publisher: "SecurityWeek"
  - title: "Insurance giant Aflac discloses data breach after subsidiary hack"
    url: "https://www.bleepingcomputer.com/news/security/insurance-giant-aflac-discloses-data-breach-after-subsidiary-hack/"
    publisher: "BleepingComputer"
  - title: "22 Million Affected by Aflac Data Breach"
    url: "https://www.securityweek.com/22-million-affected-by-aflac-data-breach/"
    publisher: "SecurityWeek"
  - title: "Japanese insurer, brewer, manufacturer and telecom disclose cyber breaches"
    url: "https://therecord.media/japan-cyber-breaches-aflac-sapporo-nidec-kddi"
    publisher: "The Record"
originalContribution: "本文把 Aflac 2025 年美國（2,265 萬人、帶社交工程特徵）與 2026 年日本（438 萬人、客戶入口網站遭不正存取）兩次外洩並置比對，提出『攻擊面會移動、單點補洞是解錯題』的分析框架，並延伸到台灣壽險『入口網站＋代理人體系』的同構風險與個資自保。"
---

Aflac 日本在 2026 年 6 月 30 日公布，約 438 萬名客戶與代理店的個人資料因不正存取外洩，其中約 23 萬人連保險費振替的銀行帳戶資訊都被拿走。這是 Aflac 一年內第二次出事，去年 6 月美國業務才被駭、[波及 2,265 萬人](https://www.securityweek.com/22-million-affected-by-aflac-data-breach/)。但兩次真正的教訓不是「又被駭」，而是攻擊面換了位置：美國那次打的是人，日本這次打的是客戶入口網站。把資安當成「這次的洞補起來就好」，就是解錯題。

<img src="/images/aflac-japan-second-breach-s1.webp" width="960" height="639" loading="lazy" decoding="async" alt="資安警示與系統遭不正存取的示意畫面">

先把這次的事講清楚。[根據 SecurityWeek 整理的官方揭露](https://www.securityweek.com/aflac-japan-data-breach-impacts-4-38-million/)，攻擊者從 6 月 15 日開始入侵，反覆存取系統到 6 月 25 日才被發現、切斷連線並停用相關系統。外洩內容包含姓名、地址、電話、生日、性別、安全資訊與保單內容；約 23 萬人另外被拿走保險費振替的口座資訊（金融機構、分行、帳號、戶名），但沒有信用卡資料，也沒有 My Number。受影響的還有約 4 萬家代理店。Aflac 在日本[有約 1,350 萬名保單客戶](https://asia.nikkei.com/spotlight/cybersecurity/aflac-japan-reports-breach-on-4.38-million-customers-includes-bank-details)，這次外洩的規模等於三分之一的客戶基礎。事件已通報金融廳與警方，日本金融廳並要求 Aflac 回報原因與防範措施。

<img src="/images/aflac-japan-second-breach-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="外洩的個人資料與銀行帳戶資訊示意">

把去年那次拿來對照，就看得出破口在哪裡移動。去年美國那起，Aflac 沒有官方點名兇手，但整起事件[被形容為「帶有 Scattered Spider 的所有特徵」](https://www.bleepingcomputer.com/news/security/insurance-giant-aflac-discloses-data-breach-after-subsidiary-hack/)。Scattered Spider 是一個靠社交工程、打客服與 help desk 把人騙進系統的組織，同一波還掃過 Erie 與 Philadelphia 這兩家保險公司。那次美國偵測到異常是 6 月 12 日，外洩的是社會安全碼、駕照、醫療與健康保險資訊這類更敏感的料。日本這次不一樣，不是騙人，是客戶入口網站「よりそうネット」直接被不正存取。同一家公司，一次破口在人，一次破口在對外系統。

<img src="/images/aflac-japan-second-breach-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="駭客攻擊與社交工程手法的示意">

這裡要踩個剎車。二度遭駭最直覺的反應是「這家公司不長記性」，但兩次攻擊面不同，代表去年補的洞（假設是強化 help desk 驗證、加嚴多因子）不會自動擋住今年打入口網站的攻擊。資安從來不是一條防線，是一整片會移動的攻擊面。我這半年寫過的外洩案，破口一直在換位置：[iRhythm 的破口在第三方應用](/articles/irhythm-phi-breach-third-party-perimeter/)、[LastPass 的破口在第三方情報平台被竊的 OAuth token](/articles/lastpass-klue-oauth-token-breach/)。真正該解的題是「攻擊面治理」，把所有對外系統、第三方接點、人的環節當成一個整體持續盤點，而不是出一次事、修一個點，然後等下一個沒盤到的地方被打。

<img src="/images/aflac-japan-second-breach-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心與企業網路資安環境示意">

Aflac 也不是孤例。同一段時間，日本啤酒商 Sapporo、馬達大廠 Nidec、電信 KDDI 都接連[傳出資料外洩](https://therecord.media/japan-cyber-breaches-aflac-sapporo-nidec-kddi)。目前沒有證據顯示這些攻擊彼此相關、或出自同一組人，但短短兩週內橫跨保險、製造、電信全中，說明日本企業整體正處在高強度的攻擊環境。對跨國集團來說，「總部在美國、子公司在日本」的結構讓攻擊面更大：美國一套系統、日本一套系統，任何一邊的入口都是一扇門，補好一扇不等於補好全部。

<img src="/images/aflac-japan-second-breach-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="個資保護與網路安全自保的示意">

那台灣讀者該從這條新聞讀出什麼？台灣同樣是壽險大國，幾乎每家壽險都有「客戶入口網站加上龐大代理人體系」這種和 Aflac 幾乎一模一樣的結構。個資外洩在台灣受個人資料保護法規範，金管會對保險業另有資安要求；企業端該學的，是把對外入口與代理端納進同一套攻擊面盤點，別讓代理系統變成沒人看管的側門。至於一般人，如果你是壽險客戶，收到自稱保險公司、要你點連結或提供帳戶資訊的訊息要特別警覺，因為外洩的姓名加保單資訊正好讓釣魚訊息看起來很真；口座資訊被外洩的人，要盯緊帳戶有沒有異常扣款。這些不是一篇文章能替你做的判斷，但知道破口在哪，至少不會被騙第二次。

把 Aflac 兩次事件放在一起看，重點不是數字。438 萬、2,265 萬只是規模。重點是攻擊面會移動，防守如果只跟著上一次的破口走，永遠慢一步。看懂這件事，比記住外洩了幾萬筆重要。

<h2>常見問題</h2>

<p><strong>Aflac 這次外洩了哪些資料？我會受影響嗎？</strong><br>外洩的是 Aflac 日本客戶與代理店的姓名、地址、電話、生日、性別、安全資訊與保單內容，約 23 萬人另外被拿走保險費振替的<a href="https://www.securityweek.com/aflac-japan-data-breach-impacts-4-38-million/">銀行帳戶資訊</a>，但沒有信用卡與 My Number。這次事件限於日本業務、不影響美國。如果你是 Aflac 日本的保單客戶或代理店，就可能在這 438 萬人之列，應留意官方通知與後續說明。</p>

<p><strong>這跟去年 Aflac 在美國那次外洩是同一件事嗎？</strong><br>不是同一件事。去年 6 月是美國業務被駭、<a href="https://www.securityweek.com/22-million-affected-by-aflac-data-breach/">波及約 2,265 萬人</a>，手法帶有 Scattered Spider 社交工程的特徵；今年 6 月是日本的客戶入口網站遭不正存取。兩次是不同地區、不同攻擊面，官方也說日本這次<a href="https://asia.nikkei.com/spotlight/cybersecurity/aflac-japan-reports-breach-on-4.38-million-customers-includes-bank-details">不影響美國系統</a>。</p>

<p><strong>我的銀行帳戶資訊被外洩了，錢會被領走嗎？</strong><br>外洩的是保險費振替用的金融機構、分行、帳號與戶名，不含信用卡與密碼，直接被盜領的門檻較高，但這些資訊足以讓詐騙訊息更逼真。<a href="https://www.securityweek.com/aflac-japan-data-breach-impacts-4-38-million/">官方目前表示尚未發現資料被不正利用</a>，建議定期檢查帳戶扣款、對任何自稱保險公司索取帳戶或驗證碼的訊息提高警覺。</p>

<p><strong>台灣的保險公司也會發生一樣的事嗎？</strong><br>結構上風險相同。台灣壽險普遍有客戶入口網站加代理人體系，和 Aflac 被打的那類系統同構；同期日本也有<a href="https://therecord.media/japan-cyber-breaches-aflac-sapporo-nidec-kddi">多家企業接連外洩</a>。個資外洩在台灣受個人資料保護法規範、金管會對保險業另有資安要求，能不能守住，取決於有沒有把入口與代理端納入同一套持續盤點，而不是出事才補。</p>
