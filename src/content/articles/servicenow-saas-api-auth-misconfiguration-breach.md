---
title: "ServiceNow 八個月內第三次認證漏洞：SaaS API 設定錯誤正在變成主流外洩管道"
slug: "servicenow-saas-api-auth-misconfiguration-breach"
description: "ServiceNow 6/9 揭露一個 Scripted REST 端點因預設不需驗證，讓未授權請求直接查到客戶資料表，且是修補前就被觸及的首例。事件揭示 SaaS API 認證設定錯誤已成 2026 企業外洩的代表類型，企業該主動盤點自家與 agent 串接的 API 認證邊界。"
excerpt: "ServiceNow 6/9 揭露一個 Scripted REST 端點因預設不需驗證，讓未授權請求直接查到客戶資料表。SaaS API 認證設定錯誤正在從零星事故，變成 2026 企業外洩的主流管道。"
publishDate: "2026-06-18T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["SaaS 資安", "API 認證設定錯誤", "ServiceNow 漏洞", "企業資料外洩", "AI agent 權限治理"]
coverImage: "covers/servicenow-saas-api-auth-misconfiguration-breach.webp"
coverAlt: "SaaS API 認證設定錯誤成為企業資料外洩主流管道，ServiceNow 未驗證端點外洩客戶資料的示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "ServiceNow 6/9 揭露一個 Scripted REST 端點因 requires_authentication 預設 false，讓未授權請求以 Guest 身分直接查到客戶資料表，且資料在 6/5 修補前就已被查走。"
  - "這是八個月內又一起認證相關漏洞；八個月前的 CVE-2025-12420 同樣是未驗證冒用，但那次修在被利用之前，這次卻是修補前資料就被觸及。"
  - "搭配六月的 Novo Nordisk、Nintendo 外洩，共通破口都不在核心系統，而在串接出去那個服務的認證與權限設定。"
references:
  - title: "ServiceNow discloses security incident exposing customer data"
    url: "https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/"
    publisher: "BleepingComputer"
    note: "端點 /api/now/related_list_edit/create、requires_authentication=false、6/9 揭露、確認攻擊者在修補前查到客戶資料表"
  - title: "CA-26-021: ServiceNow Unauthenticated API Endpoint Misconfiguration Exploited in the Wild (KB3067321)"
    url: "https://www.deepwatch.com/labs/ca-26-021-servicenow-unauthenticated-api-endpoint-misconfiguration-exploited-in-the-wild-kb3067321/"
    publisher: "Deepwatch"
    note: "Guest 身分、KB3067321 於 6/9 公布、6/5 修補、屬一連串認證相關漏洞之一"
  - title: "ServiceNow patches critical AI platform flaw that could allow user impersonation"
    url: "https://cyberscoop.com/servicenow-fixes-critical-ai-vulnerability-cve-2025-12420/"
    publisher: "CyberScoop"
    note: "CVE-2025-12420（2025/10）未驗證冒用、AppOmni 發現、10/30 修補、無被利用證據"
  - title: "Ozempic maker Novo Nordisk breach exposed patients' clinical trial data"
    url: "https://www.scientificamerican.com/article/ozempic-maker-novo-nordisk-breach-exposed-patients-clinical-trial-data/"
    publisher: "Scientific American"
    note: "六月中證實未授權存取、臨床試驗病患資料外洩、姓名等直接識別資訊未受影響"
  - title: "Hacker Group Steals Nintendo Employee Data, Posts $2 Million Ransom"
    url: "https://www.nintendolife.com/news/2026/06/hacker-group-steals-nintendo-employee-data-posts-usd2-million-ransom"
    publisher: "Nintendo Life"
    note: "ShadowByt3$ 竊 859MB 員工資料、喊價 200 萬美元、破口在第三方平台 TINYpulse"
---

<p>ServiceNow 在 6 月 9 日揭露一起資安事件：平台上一個 Scripted REST API 端點因為預設不需要驗證，未授權的請求可以直接查到客戶執行個體裡的資料表。比這個技術細節更該記住的，是它代表的類型。2026 年的企業資料外洩，越來越多不是有人攻破了防火牆，而是某個 SaaS 服務的 API 認證設定本來就沒鎖好。問題換了，企業要顧的東西也得跟著換。不是「我家防線夠不夠硬」，而是「我串出去、和被串進來的每一個 API，認證邊界到底誰在顧」。</p>

<h2>這次 ServiceNow 到底出了什麼事</h2>

<p>先把事情講清楚。出問題的端點是 <a href="https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/" target="_blank" rel="noopener"><code>/api/now/related_list_edit/create</code>，它的 <code>requires_authentication</code> 旗標被設成 false，等於對外完全不要求驗證，ServiceNow 在 6 月 5 日的安全更新才把它改回 true，並在 6 月 9 日對外揭露</a>。<a href="https://www.deepwatch.com/labs/ca-26-021-servicenow-unauthenticated-api-endpoint-misconfiguration-exploited-in-the-wild-kb3067321/" target="_blank" rel="noopener">因為不要求驗證，未授權的請求是以權限最低的 Guest 身分在跑，而支援公告 KB3067321 直到 6 月 9 日才公布</a>。</p>

<p>關鍵不在「設定可以被改」，而在「預設值就是錯的」。一個對外的端點，預設不需要任何身分就能呼叫，這不是被誰繞過了什麼，是它出廠時門就沒關。<a href="https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/" target="_blank" rel="noopener">ServiceNow 也確認，攻擊者利用這個漏洞成功查詢了客戶執行個體的資料表</a>。資料不是有可能被看到，是已經被查走了。</p>

<img src="/images/servicenow-saas-api-auth-misconfiguration-breach-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="ServiceNow 一個 Scripted REST 端點因預設不需驗證，讓未授權請求以 Guest 身分直接查到客戶資料表">

<h2>為什麼這一次特別該記一筆</h2>

<p>把這次算進去，ServiceNow 在八個月內已經第三度因為認證設定出包。<a href="https://www.deepwatch.com/labs/ca-26-021-servicenow-unauthenticated-api-endpoint-misconfiguration-exploited-in-the-wild-kb3067321/" target="_blank" rel="noopener">資安機構 Deepwatch 的事件通報，就把這起問題放進 ServiceNow 一連串認證繞過與權限提升漏洞的脈絡裡看</a>。八個月前那一起也很典型：<a href="https://cyberscoop.com/servicenow-fixes-critical-ai-vulnerability-cve-2025-12420/" target="_blank" rel="noopener">2025 年 10 月的 CVE-2025-12420，由 AppOmni 發現，讓未驗證的攻擊者能冒用任何使用者，ServiceNow 在 10 月 30 日修補，並表示沒有證據顯示它在修補前被利用</a>。</p>

<p>差別就在這裡。前面那次是趕在被攻擊之前先補起來，沒有確認的外洩。這次不一樣，是修補前資料就已經被觸及，是這一串認證問題裡第一個「先被查走、才被修掉」的。要誠實補一句：ServiceNow 在 6 月 10 日的後續說明裡，把那波活動描述成「可能」與資安研究者或漏洞獎金回報有關，而非確定的惡意攻擊者。但這不改變一件事，未驗證的請求確實在修補前就查到了客戶資料表。能不能用，跟有沒有被用，是兩回事，這次是後者也成立了。</p>

<img src="/images/servicenow-saas-api-auth-misconfiguration-breach-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="八個月內反覆出現認證相關漏洞，這次是修補前客戶資料就被觸及的首例">

<h2>不是只有 ServiceNow，六月很熱鬧</h2>

<p>把鏡頭拉開，六月不只 ServiceNow。<a href="https://www.scientificamerican.com/article/ozempic-maker-novo-nordisk-breach-exposed-patients-clinical-trial-data/" target="_blank" rel="noopener">生產 Ozempic 的藥廠 Novo Nordisk 在六月中證實，內部 IT 系統遭未授權存取，外洩了臨床試驗的病患資料，包括年齡、性別、健康與生活型態因子，以及隨機化的病患代號；但姓名等直接識別資訊未受影響，公司認為不足以讓第三方辨識出參與者</a>。同一個月，<a href="https://www.nintendolife.com/news/2026/06/hacker-group-steals-nintendo-employee-data-posts-usd2-million-ransom" target="_blank" rel="noopener">駭客團體 ShadowByt3$ 宣稱竊得約 859MB 的 Nintendo 員工資料、喊價 200 萬美元，而破口在第三方員工調查平台 TINYpulse，不是 Nintendo 自家系統，任天堂強調自家系統未被攻破、無客戶資料外洩</a>。</p>

<p>這三件事看起來各不相干，但有個共通點：外洩的入口都不在核心系統，而在「串接出去的那個服務」的設定與權限。藥廠的內部系統、任天堂的第三方調查平台、ServiceNow 的對外 API，被攻破的都是邊界上那一層。SaaS 與 API 的認證設定錯誤，正在從零星事故，變成企業外洩的主流管道。</p>

<img src="/images/servicenow-saas-api-auth-misconfiguration-breach-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="六月企業外洩清單：藥廠臨床試驗資料外洩、企業員工資料遭勒索，API 與第三方服務的設定成共通破口">

<h2>我的觀察：vibe coding 把這個破口放大了</h2>

<p>我自己這陣子的感受是這樣。隨著用 vibe coding 的人越來越多，很多服務上線時忽略了程式品質，也沒有注意到 AI 無意間造成的漏洞。把這個觀察接回 ServiceNow 那個 <code>requires_authentication=false</code>，其實是同一件事的兩個版本。一個「預設不需要驗證」的設定值，正是那種功能跑得起來、就不會有人回頭多看一眼的東西。</p>

<p>AI 幫你把端點生出來、把功能接起來、把 demo 跑通，這些它都很強。但「這個端點該不該對外開」「Guest 身分碰得到什麼」這種判斷，模型不會主動替你踩剎車，它只會把你要的功能交出來。這也是我先前一直在講的同一條線：<a href="/articles/llm-healthcare-promise-limits/">能不能信任一個系統，靠的是落地流程的品質，不是工具本身有多強</a>。工具越好用、出活越快，沒人把關的設定就越容易整批帶上線，破口不會變少，只會變得更隱形。</p>

<img src="/images/servicenow-saas-api-auth-misconfiguration-breach-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="vibe coding 風潮下服務匆促上線忽略程式品質，AI 順手生成的設定漏洞沒人回頭檢查">

<h2>明天早上就能做的盤點</h2>

<p>講防禦，不講攻擊。這件事不需要等什麼高深的資安方案，先做盤點就能擋掉一大半。具體有四條。</p>

<p>第一，把「預設未驗證」列為優先稽核項。逐一檢查每一個對外的 API 與端點，預設值到底要不要驗證、匿名或 Guest 身分能碰到哪些資料表。這次 ServiceNow 出事的就是這一格，它最該被排在盤點清單的最前面。第二，把 SaaS 供應商也算進來。你公司用的每一個 SaaS，包含第三方 HR、問卷調查、CRM，各自開了哪些 API、用誰的憑證、能讀寫什麼，都要列冊，任天堂的破口就在這一層。第三，自家 AI agent 串接的 API 一樣要收。<a href="/articles/mcp-de-facto-standard-agent-governance/">每一台 agent 接出去的 server，都該被當成一個新的權限治理對象</a>，agent 會自己去連一堆系統，認證邊界沒收好，問題只會以機器的速度擴大。第四，順序不要倒。<a href="/articles/what-is-claw-llm-client-tool/">先定義這個端點要解決什麼情境、誰該用，再決定要不要對外開放</a>，不是先開好再回頭補驗證。</p>

<img src="/images/servicenow-saas-api-auth-misconfiguration-breach-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業盤點自家與 AI agent 串接的 API 認證邊界，把預設未驗證列為優先稽核項">

<h2>常見問題</h2>

<p><strong>我們公司沒用 ServiceNow，這件事跟我有關嗎？</strong><br>有關。重點從來不是 ServiceNow 這個產品，是「預設不需要驗證」這個設定模式。任何 SaaS、任何自建的對外 API，只要有人把驗證關掉或忘了打開，就會踩到同一個雷。ServiceNow 只是這個月最顯眼的例子。</p>

<p><strong>「預設不需要驗證」這種設定怎麼可能上線？</strong><br>因為功能會動，沒人會回頭看那一格。趕著上線、用 AI 順手把端點生出來、設定值照抄範本，這些情況下，一個 false 很容易就跟著進了正式環境。它不會報錯，也不會讓 demo 失敗，所以平常根本不會被注意到，直到被人查走資料。</p>

<p><strong>AI agent 串接的 API 也要一起查嗎？</strong><br>要，而且更該查。agent 會自動去連很多系統、帶著自己的憑證跑，認證邊界沒收好，等於把這個破口交給一個會自己動作的角色去放大。每台 agent 接出去的服務，都要當成一個獨立的權限對象來盤。</p>

<h2>結語</h2>

<p>ServiceNow 這一次，把一個平常沒人看的設定值推到了檯面上。八個月內第三起認證問題，加上六月一連串都從邊界服務破口的外洩，講的是同一件事：企業現在最該補的洞，不在城牆中央，在那些串接出去、被外包出去、被 AI 順手生出來的接縫上。標準會晚到，法規會晚到，但你家 API 的認證邊界該怎麼收，現在就盤得起來。先把「預設未驗證」這一格找出來，門關上，剩下的才有得談。</p>
