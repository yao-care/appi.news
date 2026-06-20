---
title: "柯達證實遭入侵、ShinyHunters 聲稱握 220 萬筆資料：第三方平台整合又成外洩破口"
slug: "kodak-shinyhunters-third-party-integration-breach"
description: "柯達證實遭未授權存取，勒索集團 ShinyHunters 聲稱握有逾 220 萬筆顧客個資並設下外洩期限。這波鎖定的不是核心系統，而是企業串接出去的第三方平台整合那條信任鏈，企業該盤的是每個整合的存取邊界。"
excerpt: "柯達承認外部人士短暫存取有限資料，ShinyHunters 卻喊 220 萬筆。兩個數字對不起來，但真正該記的是攻擊鎖定的位置：第三方平台整合的信任鏈。"
publishDate: "2026-07-12T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["ShinyHunters", "柯達資料外洩", "第三方整合資安", "OAuth 供應鏈攻擊", "企業資安應變"]
coverImage: "covers/kodak-shinyhunters-third-party-integration-breach.webp"
coverAlt: "柯達遭駭客入侵、勒索集團 ShinyHunters 聲稱握有逾 220 萬筆顧客資料，第三方平台整合成資料外洩破口的示意"
coverImageCredit: "Photo by FlyD on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "柯達 6 月 17 日證實未授權第三方短暫存取了有限資料，此前 ShinyHunters 已於 6 月 15 日把柯達掛上外洩網站、聲稱握有逾 220 萬筆顧客個資與內部資料，並設下 6 月 18 日的外洩期限。"
  - "柯達說「有限」、攻擊者喊「220 萬筆」，兩個數字對不起來，且 ShinyHunters 並未公開佐證樣本，這是勒索集團的常見手法。"
  - "ShinyHunters 一年來的代表作幾乎都打在同一條線上：企業串接出去的第三方平台整合。攻擊面不在城牆中央，在那些被外包出去的接縫。"
references:
  - title: "Kodak confirms data breach claimed by ShinyHunters extortion gang"
    url: "https://www.bleepingcomputer.com/news/security/kodak-confirms-data-breach-claimed-by-shinyhunters-extortion-gang/"
    publisher: "BleepingComputer"
    note: "柯達官方聲明原文、ShinyHunters 聲稱 220 萬筆顧客個資與內部資料、柯達已找外部資安專家與執法單位、柯達現為 B2B 商用印刷與材料/化學公司、持 79,000 項專利"
  - title: "Kodak Admits Data Breach After ShinyHunters Hack Claims"
    url: "https://www.securityweek.com/kodak-admits-data-breach-after-shinyhunters-hack-claims/"
    publisher: "SecurityWeek"
    note: "6/15 ShinyHunters 上架柯達、6/18 外洩期限、柯達稱無系統或營運威脅且已遏止、ShinyHunters 近期利用 Oracle PeopleSoft 零時差影響逾 100 個組織"
  - title: "Kodak confirms breach as ShinyHunters' leak threat reaches deadline"
    url: "https://www.malwarebytes.com/blog/news/2026/06/kodak-confirms-breach-as-shinyhunters-leak-threat-reaches-deadline"
    publisher: "Malwarebytes"
    note: "6/18 外洩期限、ShinyHunters 未公開提供佐證屬勒索集團常見手法、給消費者的自保建議"
  - title: "ShinyHunters Breaches Kodak in Ongoing Enterprise Platform Campaign Targeting Third-Party Integrations"
    url: "https://techjacksolutions.com/scc-intel/shinyhunters-breaches-kodak-in-ongoing-enterprise-platform-campaign-targeting-third-party-integrations/"
    publisher: "TechJack Solutions"
    note: "把柯達事件放進 ShinyHunters 鎖定企業 SaaS 整合的持續性活動脈絡、點名 Salesforce Aura/Salesloft Drift/Snowflake/Oracle PeopleSoft"
  - title: "How three techniques are behind ShinyHunters' 2026 campaigns"
    url: "https://pushsecurity.com/blog/analyzing-the-instructure-breach"
    publisher: "Push Security"
    note: "ShinyHunters 三大手法含 OAuth 供應鏈攻擊、授權第三方整合等於把安全邊界延伸到對方身上、Salesloft/Drift 戰役逾千個組織約 15 億筆 Salesforce 紀錄"
---

<p>柯達（Kodak）證實，公司近期發現一名未授權的第三方非法取得了有限資料的暫時存取權。這個說法，是在勒索集團 ShinyHunters 把柯達掛上外洩網站、聲稱握有逾 220 萬筆顧客個資與內部資料之後才出現的。一邊說「有限」，一邊喊「220 萬筆」，兩個數字對不起來，而柯達到今天也沒交代攻擊者是怎麼進來的。這篇要談的不是誰的數字準，是這波攻擊鎖定的位置：企業串接出去的第三方平台整合，那條沒人天天在看的信任鏈。</p>

<h2>先把時間軸講清楚</h2>

<p>事情的順序是這樣。<a href="https://www.securityweek.com/kodak-admits-data-breach-after-shinyhunters-hack-claims/" target="_blank" rel="noopener">6 月 15 日，ShinyHunters 把柯達列上自家的外洩網站，聲稱竊得逾 220 萬筆資料，並把外洩期限定在 6 月 18 日</a>。<a href="https://www.bleepingcomputer.com/news/security/kodak-confirms-data-breach-claimed-by-shinyhunters-extortion-gang/" target="_blank" rel="noopener">ShinyHunters 的說法是「逾 220 萬筆含顧客個資與其他內部企業資料遭外洩」，柯達隨後在報導見刊的 6 月 17 日對外證實「一名未授權的第三方非法取得有限公司資料的暫時存取權」，並表示已找外部資安專家展開調查、也與執法單位合作</a>。</p>

<p>有兩件事要誠實標出來。第一，<a href="https://www.malwarebytes.com/blog/news/2026/06/kodak-confirms-breach-as-shinyhunters-leak-threat-reaches-deadline" target="_blank" rel="noopener">ShinyHunters 並沒有公開任何佐證樣本，這是勒索集團逼人付錢的常見手法，先喊一個嚇人的數字，證據之後再說</a>。第二，柯達早就不是大家印象裡那個底片牌子，<a href="https://www.bleepingcomputer.com/news/security/kodak-confirms-data-breach-claimed-by-shinyhunters-extortion-gang/" target="_blank" rel="noopener">它今天主要做的是商用印刷、先進材料與化學產品，手上握有約 79,000 項專利</a>，是一家 B2B 製造與技術公司。所以「220 萬筆顧客個資」到底是誰的資料、從哪一段流出去的，比數字本身更值得問。</p>

<img src="/images/kodak-shinyhunters-third-party-integration-breach-s1.webp" width="960" height="1200" loading="lazy" decoding="async" alt="柯達證實未授權第三方短暫存取有限資料，ShinyHunters 設下 6 月 18 日外洩期限">

<h2>ShinyHunters 的老把戲，幾乎都打在同一條線上</h2>

<p>柯達沒講破口在哪，但這個攻擊者的習慣可以講。<a href="https://www.securityweek.com/kodak-admits-data-breach-after-shinyhunters-hack-claims/" target="_blank" rel="noopener">ShinyHunters 過去一年極度活躍，近期一手就是利用 Oracle PeopleSoft 的零時差漏洞，一口氣影響至少 100 個組織</a>。重點不是哪一個漏洞，是它鎖定的標的類型：企業共用的那幾個大平台。</p>

<p>把柯達放進這個脈絡，<a href="https://techjacksolutions.com/scc-intel/shinyhunters-breaches-kodak-in-ongoing-enterprise-platform-campaign-targeting-third-party-integrations/" target="_blank" rel="noopener">資安分析把這起事件歸進 ShinyHunters 一場鎖定企業 SaaS 整合的持續性活動，點名的標的包含 Salesforce Aura、Salesloft Drift、Snowflake 與 Oracle PeopleSoft，並指出只要在用這些平台的第三方整合，曝險程度就被拉高，跟有沒有直接跟柯達往來無關</a>。換句話說，攻擊者要的不是攻破某一道城牆，是走那條串在平台之間的信任關係。</p>

<p>這條路去年已經演過很大一齣。<a href="https://pushsecurity.com/blog/analyzing-the-instructure-breach" target="_blank" rel="noopener">ShinyHunters 在 Salesloft 與 Drift 的戰役裡竊取第三方整合的 OAuth 權杖，再拿這些權杖存取下游客戶環境，逾千個組織受害、聲稱取得超過 15 億筆 Salesforce 紀錄，核心一句就點破了：你授權一個第三方整合的當下，安全邊界就延伸到把那家廠商也包進來</a>。柯達沒揭露自家是不是同一條路進來，我不替它認定，但同一個攻擊者、同一類標的、同一段時間，這個方向值得先當主要假設來盤。這也是上個月 <a href="/articles/servicenow-saas-api-auth-misconfiguration-breach/">ServiceNow 八個月內第三次認證設定出包</a>講的同一件事：外洩入口越來越不在核心系統，而在串接出去那一層。</p>

<img src="/images/kodak-shinyhunters-third-party-integration-breach-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="SaaS 串 SaaS、webhook 與 API 串接形成的信任鏈，第三方平台整合成為企業的主要攻擊面">

<h2>我的觀點：最大的攻擊面不是程式碼，是沒畫清楚的信任邊界</h2>

<p>從工程的角度看，第三方整合已經變成企業攻擊面（attack surface）的主要來源，這不是這次才發生，是累積出來的結構問題。問題出在三個地方，一層比一層難看。</p>

<p>第一層，API 整合本身就是一條隱性的信任邊界（implicit trust boundary）。SaaS 串 SaaS、webhook、OAuth、API token，這些串接讓系統跑得起來，但每接一條，你就把信任交出去一段。真正該問的是：這整條鏈裡，哪一段其實是你控制不到的？你發出去的那把 token，對方怎麼存、放多久、誰能看，多數時候你根本不知道。</p>

<p>第二層更常見，是資料流向盤點（data flow mapping）的缺失。很多公司知道自己系統上有哪些 API，卻不知道資料實際流到哪裡去（data actually flows where）。沒有資料血緣（data lineage），就等於沒有安全模型，因為你連「哪些資料會經過哪個第三方」都畫不出來，自然也守不住。出事的時候，第一個答不出來的問題往往就是「這批資料當初是從哪條整合流出去的」。<a href="/articles/what-is-claw-llm-client-tool/">先把使用情境與資料流定義清楚，再決定要不要開這條整合，順序不能倒</a>。</p>

<p>講白一點：現代系統的最大攻擊面不是程式碼，而是你沒有畫清楚的 API 信任邊界。程式碼有漏洞，掃描器掃得到；一條沒人記得自己授權過、權限開得比需要的大的整合，沒有工具會主動提醒你。<a href="/articles/llm-healthcare-promise-limits/">可信度靠的是落地流程的品質，不是工具或平台本身有多大牌</a>。</p>

<img src="/images/kodak-shinyhunters-third-party-integration-breach-s4.webp" width="960" height="509" loading="lazy" decoding="async" alt="授權第三方整合的當下，安全邊界就延伸到對方身上，API 信任邊界裡有你控制不到的那一段">

<h2>外洩之後，工程跟公關是綁在一起的</h2>

<p>第三層問題在事後才現形：資安事件應變（incident response），本質是工程跟公關的耦合，不是單純修一個 bug。發現外洩後，工程端真正要做的是一串動作：撤銷所有相關權杖（revoke tokens）、調出並比對稽核日誌（audit logs）、把被攻破的那段信任邊界重建（rebuild trust boundary），同時還要對齊法規要求的通報時程（notify timeline compliance）。每一步都跟「我把整合的存取邊界畫清楚了沒」直接相關，邊界沒盤過，這四件事每一件都會卡。</p>

<p>對外溝通是另一半，這次柯達示範了那個尷尬的缺口。<a href="https://www.securityweek.com/kodak-admits-data-breach-after-shinyhunters-hack-claims/" target="_blank" rel="noopener">柯達說只有「有限資料」、無系統或營運威脅、且事件已被遏止</a>，攻擊者卻喊 220 萬筆。當你內部還沒把資料流盤清楚，就只能說「有限」這種模糊的話，而模糊在外洩事件裡會被讀成心虛。能講清楚範圍的前提，是平常就知道哪條整合碰得到哪些資料。這也呼應我先前的立場：<a href="/articles/mcp-de-facto-standard-agent-governance/">每一個串接進來的服務，都該被當成一個新的權限治理對象</a>，平常列冊管好，出事才有底氣把話說準。</p>

<img src="/images/kodak-shinyhunters-third-party-integration-breach-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="外洩後的應變：撤銷權杖、調閱稽核日誌、重建信任邊界、對齊合規通報時程">

<h2>明天早上就能做的盤點</h2>

<p>講防禦，不講攻擊。這件事不需要等什麼高深方案，先盤點就能擋掉一大半。具體四條。</p>

<p>第一，把每一個第三方整合列冊。你公司接出去、被接進來的每一個 SaaS、webhook、OAuth 連線，各自用了誰的權杖、能讀寫哪些資料表、權限開了多大，全部寫下來。沒列冊，後面三條都做不了。第二，畫出資料血緣。針對含個資的資料，標出它實際會經過哪些第三方，這就是你的安全模型，缺了它就是憑感覺在守。第三，做權杖衛生。OAuth 權杖與 API token 定期輪換、離職或停用的整合立刻撤權、一律給最小必要權限，這次這類攻擊靠的就是一把沒人記得拔掉的鑰匙。第四，先把通報時程定好。誰負責判定、幾小時內對內升級、什麼程度要對外與通報主管機關，這些在平時就排好，不要等資料已經在外洩網站上了才開始想流程。</p>

<img src="/images/kodak-shinyhunters-third-party-integration-breach-s5.webp" width="960" height="585" loading="lazy" decoding="async" alt="盤點第三方整合的存取邊界、畫出資料血緣，把預設權限與通報時程收好">

<h2>常見問題</h2>

<p><strong>我們公司又沒用柯達、也沒用 Salesforce，這件事跟我有關嗎？</strong><br>有關。重點不是哪一家平台，是「第三方整合」這個結構。只要你有接任何 SaaS、任何 webhook、任何 OAuth 連線，你就有同一類的信任邊界要顧。柯達只是這個月最顯眼的例子，攻擊鎖定的那條線，幾乎每家公司都有。</p>

<p><strong>柯達說只有「有限資料」，是不是就代表沒事？</strong><br>不能這樣讀。「有限」是柯達目前的說法，攻擊者喊的是 220 萬筆，雙方差距到截稿都沒有對齊，而 ShinyHunters 也還沒公開佐證。在範圍被釐清之前，把它當成範圍未定的事件處理比較安全，尤其如果你是它的上下游或供應鏈夥伴。</p>

<p><strong>第三方整合那麼多，到底從哪一個盤起？</strong><br>從「權限開最大、又最久沒人看」的那幾個開始。能讀寫大量資料、長期有效、當初接了之後就沒人回頭檢查的整合，風險最高。先把這類找出來收緊權限或撤掉，再往下逐條盤，比一次想盤完整套切實際。</p>

<h2>結語</h2>

<p>柯達這一次，把一個平常沒人盯的位置推到了檯面上。攻擊者要的不是攻破誰的城牆，是走那條串在平台之間、被外包出去、開了就沒人回頭看的整合。標準會晚到，法規會晚到，攻擊者的速度不會等。但你家每一條第三方整合碰得到哪些資料、用誰的權杖、權限開多大，現在就盤得起來。先把那條控制不到的信任邊界畫出來，門關上，剩下的才有得談。</p>
