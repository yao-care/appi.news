---
title: "心臟監測商 iRhythm 病患資料遭竊勒索：醫療數據外洩的破口又在第三方應用"
slug: "irhythm-phi-breach-third-party-perimeter"
description: "服務美歐約 800 萬名心律不整病患的 iRhythm 證實，6/8 偵測到第三方代管商業應用遭未授權存取、隔日有人聲稱竊得病患 PHI 並勒索。事件再次顯示醫療資料外洩的入口多半不在核心系統，而在串接出去的第三方平台與社交工程，企業該優先盤點對外邊界與供應商存取權限。"
excerpt: "iRhythm 的臨床與醫材系統都沒事，被攻破的是第三方代管的商業應用、入口是社交工程。醫療資料外洩越來越少發生在資料所在的地方，而在資料流動的地方。"
publishDate: "2026-06-19T01:11:10.088Z"
category: "tech"
subcategory: "security"
tags: ["醫療資料外洩", "第三方應用資安", "社交工程", "PHI 受保護健康資訊", "供應商存取治理"]
coverImage: "covers/irhythm-phi-breach-third-party-perimeter.webp"
coverAlt: "心臟監測商 iRhythm 第三方代管商業應用遭未授權存取、病患 PHI 外洩遭勒索的示意"
coverImageCredit: "Photo by Joshua Chehov on Unsplash"
author: "lightman"
status: "published"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "iRhythm 6/8 偵測到第三方代管的商業應用遭未授權存取、入口是社交工程，6/9 收到勒索要脅公開病患 PHI 與專有資料；但臨床、醫材、製造與財報系統都未受影響。"
  - "這跟六月的 ServiceNow、Nintendo、Novo Nordisk 是同一個模式：被攻破的不是核心系統，而是串接出去的那層邊界服務與供應商存取。"
  - "醫院資安過去聚焦 HIS、PACS、EHR，現在真正要盤的是哪些 SaaS 能碰 PHI、哪些供應商有帳號、哪些 API 能讀資料、AI 工具看不看得到病患資訊。"
references:
  - title: "iRhythm Confirms Data Stolen in Hack"
    url: "https://www.securityweek.com/irhythm-confirms-data-stolen-in-hack/"
    publisher: "SecurityWeek"
    note: "6/8 偵測第三方代管商業應用遭未授權存取、涉社交工程、6/9 勒索、臨床與醫材系統未受影響、無付款卡資料"
  - title: "iRhythm discloses data breach, says hackers stole patient info"
    url: "https://www.bleepingcomputer.com/news/security/irhythm-discloses-data-breach-says-hackers-stole-patient-info/"
    publisher: "BleepingComputer"
    note: "向 SEC 揭露、社交工程入侵第三方應用、PHI 與專有資料、核心醫療系統無證據受影響"
  - title: "Cardiac patients' medical data stolen and held to ransom"
    url: "https://www.malwarebytes.com/blog/news/2026/06/cardiac-patients-medical-data-stolen-and-held-to-ransom"
    publisher: "Malwarebytes"
    note: "社交工程鎖定第三方商業應用、勒索、給病患的防禦建議（獨立管道確認通知、警惕以外洩資訊行騙）"
  - title: "Heart Monitoring Device Manufacturer Discloses Cyberattack; Data Breach"
    url: "https://www.hipaajournal.com/irhythm-data-breach/"
    publisher: "HIPAA Journal"
    note: "6/8 偵測、第三方平台代管的商業應用、社交工程、服務美歐約 800 萬名病患、Form 8-K"
  - title: "2025 Healthcare Data Breach Report"
    url: "https://www.hipaajournal.com/2025-healthcare-data-breach-report/"
    publisher: "HIPAA Journal"
    note: "2025 全年 710 起大型醫療外洩、逾 6,155 萬人受影響、128 起發生在商業夥伴端"
  - title: "iRhythm Holdings Announces Fourth Quarter and Full Year 2025 Financial Results"
    url: "https://www.theglobeandmail.com/investing/markets/stocks/IRTC/pressreleases/314181/irhythm-holdings-announces-fourth-quarter-and-full-year-2025-financial-results/"
    publisher: "The Globe and Mail"
    note: "2025 全年營收成長 26.2% 達 7.471 億美元，主要來自 Zio 服務量成長"
---

<p>一家心臟監測公司被勒索，最值得記住的細節不是駭客喊了多少錢，而是他們從哪裡進來的。<a href="https://www.securityweek.com/irhythm-confirms-data-stolen-in-hack/" target="_blank" rel="noopener">心律監測廠 iRhythm 在 6 月 8 日偵測到，由第三方平台代管的某些商業應用上，出現了未授權的活動，隔天 6 月 9 日就有人發來訊息，聲稱已經竊得包含病患受保護健康資訊（PHI）在內的敏感資料，要脅付錢換取不公開</a>。被攻破的不是它的醫材，不是它的雲端心電圖演算法，是一個掛在別人平台上、平常沒人盯著的商業應用。這一點，才是醫療業現在真正該抄起來的功課。</p>

<h2>iRhythm 這次到底發生什麼事</h2>

<p>先把事情講清楚。iRhythm 是做穿戴式心臟監測的公司，旗艦產品 Zio 是一片貼在胸口的生物感測貼片，搭配雲端資料分析與演算法，幫醫師抓出心律不整。<a href="https://www.theglobeandmail.com/investing/markets/stocks/IRTC/pressreleases/314181/irhythm-holdings-announces-fourth-quarter-and-full-year-2025-financial-results/" target="_blank" rel="noopener">這門生意不小，公司 2025 全年營收成長 26.2%、達 7.471 億美元，主要就是 Zio 服務量成長帶動的</a>。<a href="https://www.hipaajournal.com/irhythm-data-breach/" target="_blank" rel="noopener">它的服務在美國與歐洲累積服務過約 800 萬名病患</a>，規模放在這裡，外洩的潛在影響面就很清楚。</p>

<p>事件的時間線很短也很典型。<a href="https://www.bleepingcomputer.com/news/security/irhythm-discloses-data-breach-says-hackers-stole-patient-info/" target="_blank" rel="noopener">iRhythm 在向美國證券交易委員會（SEC）遞交的文件裡說明，這次未授權存取的對象是「由第三方平台代管的某些商業應用」，而入侵的手法涉及社交工程</a>。<a href="https://www.malwarebytes.com/blog/news/2026/06/cardiac-patients-medical-data-stolen-and-held-to-ransom" target="_blank" rel="noopener">攻擊者在 6 月 9 日找上門，聲稱手上有專有資料、病患 PHI 與其他個人資訊，並以公開外洩為要脅索討贖金</a>。<a href="https://www.securityweek.com/irhythm-confirms-data-stolen-in-hack/" target="_blank" rel="noopener">到目前為止，公司確認確實有資料被外流，但還在釐清被竊資料的種類與數量，也尚未公布受影響的人數，外界也沒有任何勒索軟體集團出面宣稱犯案</a>。</p>

<p>沒有公布人數、沒有集團認領，這在調查初期很正常。值得抓住的是手法：不是有人破解了什麼高深的加密，是有人用社交工程騙過了人，拿到一個對外應用的存取權。門沒被撞開，是有人把鑰匙交了出去。</p>

<img src="/images/irhythm-phi-breach-third-party-perimeter-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="iRhythm 第三方平台代管的商業應用遭社交工程入侵，病患 PHI 外洩遭勒索">

<h2>核心系統都沒事，為什麼這反而是重點</h2>

<p>iRhythm 在揭露裡花了不少篇幅講「什麼沒被影響」，而這份清單本身就很有資訊量。<a href="https://www.securityweek.com/irhythm-confirms-data-stolen-in-hack/" target="_blank" rel="noopener">公司表示，這起事件並未影響它的臨床或醫材系統、與客戶的連線、病患安全、製造與配送，以及財務報告系統，也說明它並未儲存個人的金融帳戶或付款卡資料</a>。換句話說，貼在病患身上的感測器照常運作、醫師端照常收得到報告、生產線照常出貨。</p>

<p>很多人看到這裡會鬆一口氣：核心沒事，那還好。但這正是要踩一個剎車的地方。核心系統沒事，不代表病患沒事。被拿走的是 PHI，是會跟著一個人一輩子的醫療身分資料，不像信用卡可以掛失重發。攻擊者就算碰不到醫材、碰不到臨床系統，光是手上那批 PHI，就足以拿來做精準的釣魚與身分冒用。</p>

<p>所以「核心系統未受影響」這句話，要當成兩件事一起讀。一件是好消息，醫療服務的連續性沒被打斷，病患的即時安全沒有立即風險。另一件是壞消息，也是這篇要講的重點：能造成傷害的資料，根本不需要待在核心系統裡。它待在一個第三方代管的商業應用上，而那層東西，恰恰是平常資安盤點最容易漏掉的地方。<a href="https://www.malwarebytes.com/blog/news/2026/06/cardiac-patients-medical-data-stolen-and-held-to-ransom" target="_blank" rel="noopener">資安公司 Malwarebytes 給病患的提醒也很實際：對任何號稱來自 iRhythm 的通知，先透過官方獨立管道查證再回應，不要點訊息裡的連結，也要對那些拿著你外洩資料來搭話、談補償或退款的來電保持高度警覺</a>。</p>

<img src="/images/irhythm-phi-breach-third-party-perimeter-s2.webp" width="940" height="627" loading="lazy" decoding="async" alt="iRhythm 臨床、醫材、製造與財報系統未受影響，外洩發生在第三方代管的商業應用這層邊界">

<h2>同一個破口，這半年已經出現太多次</h2>

<p>把鏡頭拉開，iRhythm 不是孤例，它是一條很清楚的線上的最新一個點。我在上一篇談 <a href="/articles/servicenow-saas-api-auth-misconfiguration-breach/" target="_blank" rel="noopener">ServiceNow 八個月內第三次認證設定出包</a> 時，就把六月那一串外洩擺在一起看：ServiceNow 是對外 API 的認證預設沒鎖、藥廠 Novo Nordisk 是內部 IT 遭未授權存取外洩臨床試驗病患資料、Nintendo 則是第三方員工調查平台 TINYpulse 被攻破。三件事看起來不相干，共通點卻是同一個：被攻破的入口都不在核心系統，而在「串接出去的那層服務」。</p>

<p>iRhythm 又補上一個一模一樣的例子，只是這次的邊界長成「第三方代管的商業應用」加「社交工程」。手法不同，破口的位置一樣。這不是巧合，是醫療與健康科技業整體的結構在變。<a href="https://www.hipaajournal.com/2025-healthcare-data-breach-report/" target="_blank" rel="noopener">攤開 HIPAA Journal 的 2025 年度統計，全年共 710 起影響 500 人以上的大型醫療資料外洩、至少 6,155 萬人的受保護健康資訊被波及，其中有 128 起就發生在「商業夥伴」（business associate，也就是處理資料的第三方供應商）端</a>。每七、八起大型外洩，就有一起的起點不在醫療機構自己，而在它委外串接的某個供應商。</p>

<p>這個數字還可能被低估。<a href="https://www.hipaajournal.com/2025-healthcare-data-breach-report/" target="_blank" rel="noopener">同一份報告也指出，責任歸屬上，就算外洩技術上發生在商業夥伴端，最終仍是各個適用 HIPAA 的醫療機構要負責通報</a>。換句話說，破口在供應商，責任卻回到你身上。你把資料交出去那一刻，沒有把責任一起交出去。</p>

<img src="/images/irhythm-phi-breach-third-party-perimeter-s3.webp" width="960" height="509" loading="lazy" decoding="async" alt="ServiceNow、Nintendo、Novo Nordisk、iRhythm 共通破口都在串接出去的第三方平台與供應商存取">

<h2>當醫療變成平台，資安邊界就跟著消失了</h2>

<p>這裡講一段我自己的看法。當醫療服務變成一個平台生態系，資安邊界也跟著消失了。其實在現代醫療體系裡，資料外洩已經很少發生在資料所在的地方，而是發生在資料流動的地方。iRhythm 這起事件就是活教材：資料的「家」在臨床與醫材系統裡，好好的；出事的是資料流動到第三方商業應用的那一段。</p>

<p>這對醫院資訊室的衝擊是直接的。過去做資安稽核，盯的就是那幾個核心系統：HIS（醫院資訊系統）、PACS（醫療影像儲傳系統）、EHR（電子病歷）。把這三個守好，大致就守住了資料的主體。但現在已經很難只盯這三個了，因為串進來、接出去的服務越來越多，真正該問的問題變成這幾條：</p>

<ul>
<li>哪些 SaaS 服務能接觸到 PHI？</li>
<li>哪些供應商手上有可以登入系統的帳號？</li>
<li>哪些 API 能讀到病患資料？</li>
<li>那些被導入的 AI 工具，到底看不看得到病患資訊？</li>
</ul>

<p>這四條問題，每一條都是 HIS、PACS、EHR 那張舊清單上不會出現的。它們不是核心系統，是核心系統「流出去」的管道。iRhythm 被攻破的第三方商業應用，就落在第一條跟第二條之間：一個能碰到病患資料、又有人持有存取權的外部服務。社交工程之所以有效，正是因為這層邊界上的帳號與權限，往往沒有被當成核心資產一樣嚴管。</p>

<p>所以問題就回到一句很難回答、但非問不可的話：服務越接越多、資料流得越來越散，到底該怎麼有效地把資安做好？</p>

<img src="/images/irhythm-phi-breach-third-party-perimeter-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療變成平台生態系後，資料外洩發生在資料流動的地方，醫院資訊室要盤的是 SaaS、供應商、API 與 AI 工具的存取邊界">

<h2>那資安到底該怎麼做：把對外邊界盤成例行事</h2>

<p>我不打算給「導入某某產品就解決」的答案，因為這類破口的根因不是缺工具，是缺盤點。延續我一直講的立場，<a href="/articles/llm-healthcare-promise-limits/" target="_blank" rel="noopener">可信度靠的是落地流程，不是靠哪個系統夠不夠新</a>。下面四件事，是把「對外邊界與供應商存取」變成例行稽核項目的具體做法，明天早上就能開始做。</p>

<p><strong>第一，先把對外邊界列成一張清單，而不是先買防護。</strong>盤點哪些服務會碰到 PHI、各自掛在誰家平台上、由誰負責。iRhythm 的教訓是，你連「有哪些第三方代管的商業應用碰得到病患資料」都列不齊，就不可能守得住。清單沒有，後面的權限管理都是空話。順序不能倒，先定義有哪些邊界，再決定每一條怎麼鎖。</p>

<p><strong>第二，把每一個供應商帳號與 API 存取，當成一個獨立的權限治理對象。</strong>這跟我先前談 <a href="/articles/mcp-de-facto-standard-agent-governance/" target="_blank" rel="noopener">AI agent 串接時每一台 server 都是新權限治理對象</a> 是同一個道理，只是這次的對象換成 SaaS 供應商與對外 API。每個帳號要問三件事：給的權限是不是只到它真正需要的範圍、閒置或離職後有沒有人記得收回、有沒有留下可回查的存取軌跡。最小權限不是口號，是這層邊界唯一撐得住的設計。</p>

<p><strong>第三，把社交工程當成「人」的洞，不是「系統」的洞來補。</strong>iRhythm 這次的入口是社交工程，這代表再硬的技術防線，都可能被一通話術繞過。對外服務的登入要上多因素驗證、重設密碼與權限變更要走可驗證的流程、客服與資訊人員要有辨識假冒請求的演練。這部分補的不是程式碼，是流程與人的判斷。</p>

<p><strong>第四，把 AI 工具明確納入這張盤點表。</strong>當醫院開始導入 AI 助理、分析工具，要在第一天就回答「它看得到哪些病患資訊、看到之後資料流去哪、能不能被外部存取」。AI 工具往往是最新接進來、卻最少被當成資料管道盤點的一層，等於替前面三條又開了一道沒人看的邊界。先想清楚它該看什麼、不該看什麼，再決定要不要讓它上線。</p>

<p>這四件事的共同點，是把資安的視角從「守住核心」移到「盤清流動」。iRhythm 的核心系統守得很好，但傷害還是從一個沒人盯的第三方應用流了出去。在醫療變成平台生態系的今天，誰先把對外邊界與供應商存取盤成每月都做的例行事，誰就比還在只守 HIS、PACS、EHR 的同業，少了一個會在沒人看的地方被撬開的破口。</p>

<img src="/images/irhythm-phi-breach-third-party-perimeter-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="把對外邊界與供應商存取權限列為優先稽核項目：盤點清單、最小權限、防社交工程、納入 AI 工具">

<h2>常見問題</h2>

<p><strong>問：iRhythm 這次外洩，我的心臟監測裝置還能用嗎？資料安全嗎？</strong></p>

<p>答：<a href="https://www.securityweek.com/irhythm-confirms-data-stolen-in-hack/" target="_blank" rel="noopener">就公司目前的說明，臨床與醫材系統、與客戶的連線、病患安全都未受影響，裝置本身照常運作</a>。但被外流的是儲存在第三方商業應用上的病患個資與 PHI，不是裝置功能。資料安全與裝置可用，是兩件事，這次是前者出問題。</p>

<p><strong>問：我的醫療資料如果在這類外洩裡，最該擔心的是什麼？</strong></p>

<p>答：最該防的是「拿著你真實醫療資料來搭話」的釣魚與身分冒用。<a href="https://www.malwarebytes.com/blog/news/2026/06/cardiac-patients-medical-data-stolen-and-held-to-ransom" target="_blank" rel="noopener">收到自稱來自業者的通知，先透過官方獨立管道查證再回應、不要點訊息裡的連結，對談補償或退款的來電保持警覺</a>。PHI 不像信用卡能掛失重發，外洩後的風險是長期的。</p>

<p><strong>問：為什麼這麼多醫療外洩都發生在第三方，而不是醫院自己的系統？</strong></p>

<p>答：因為核心系統通常被嚴管，而串接出去的供應商、SaaS、API 這層邊界往往沒被當成同等資產來盯。<a href="https://www.hipaajournal.com/2025-healthcare-data-breach-report/" target="_blank" rel="noopener">2025 年 710 起大型醫療外洩裡，有 128 起發生在第三方商業夥伴端</a>，而且責任最終仍回到醫療機構身上。資料流出去的地方，比資料待著的地方更容易出事。</p>
