---
title: "LastPass 證實客戶資料外洩：第三方情報平台 Klue 的 OAuth token 被竊，連帶掃到 Snyk、Tanium 一票廠商"
slug: "lastpass-klue-oauth-token-breach"
description: "LastPass 證實客戶資料外洩，但破口不在自家系統，而是第三方情報平台 Klue 的 OAuth 長期權杖被竊，攻擊者拿來橫向讀走各家 Salesforce 的 CRM 資料。受害的反而多是資安廠。企業真正該補的是第三方整合授權這筆爛帳。"
publishDate: "2026-06-24T15:00:06.316Z"
category: "tech"
subcategory: "security"
tags:
  - "LastPass 資料外洩"
  - "OAuth token"
  - "SaaS 供應鏈攻擊"
  - "第三方整合資安"
  - "Salesforce 外洩"
author: "lightman"
contentType: "news"
sourceType: "editorial"
status: "published"
coverImage: "covers/lastpass-klue-oauth-token-breach.webp"
coverAlt: "示意圖：SaaS 第三方整合鏈被攻破，企業資料從串接的縫隙外流"
coverImageCredit: "Photo by Joan Gamell on Unsplash"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有事實、數據與引述均經作者逐條查證原始來源、人工編輯後發佈。"
highlights:
  - "破口不在 LastPass 自家系統，而在它接的第三方情報平台 Klue：攻擊者用一組被遺忘的舊憑證打進 Klue，竄改整合系統去收割客戶的 OAuth 權杖。"
  - "這些長期權杖等於各家 Salesforce 的萬能鑰匙，攻擊者用合法授權跑了約 24 小時的自動化查詢，把 CRM 客戶資料整批搬走，外洩限於聯絡與業務資料、未及密碼庫。"
  - "受影響的反而多是資安廠：HackerOne、Snyk、Tanium、Recorded Future、Huntress、Jamf、OneTrust 等逾十餘家。"
  - "企業真正該補的不是這次的攻擊手法，而是「給了多少第三方整合長期權杖」這筆沒人在盤的爛帳：盤點、最小權限、授權到期一起收。"
references:
  - title: "Klue hack results in data breach at several cybersecurity firms"
    url: "https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/"
    publisher: "TechCrunch"
  - title: "Klue breach exposed Salesforce CRM data through stolen OAuth tokens"
    url: "https://www.csoonline.com/article/4187907/klue-breach-exposed-salesforce-crm-data-through-stolen-oauth-tokens.html"
    publisher: "CSO Online"
  - title: "LastPass says customer data exposed in Klue supply chain breach"
    url: "https://cyberinsider.com/lastpass-says-customer-data-exposed-in-klue-supply-chain-breach/"
    publisher: "CyberInsider"
  - title: "LastPass Confirms Customer Data Breach After Klue OAuth Token Theft"
    url: "https://hackread.com/lastpass-customer-data-breach-klue-oauth-token/"
    publisher: "Hackread"
  - title: "Threat Spotlight: Integration Abused in CRM Data Theft"
    url: "https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/"
    publisher: "ReliaQuest"
  - title: "Klue: SaaS supply chain compromise through long-lived OAuth tokens"
    url: "https://www.threatlocker.com/blog/klue-saas-supply-chain-compromise-through-long-lived-oauth-tokens"
    publisher: "ThreatLocker"
  - title: "BeyondTrust, LastPass Impacted by Klue-Salesforce Incident"
    url: "https://www.securityweek.com/beyondtrust-lastpass-impacted-by-klue-salesforce-incident/"
    publisher: "SecurityWeek"
---

LastPass 這次的客戶資料外洩，破口不在它自家系統。攻擊者打進的是 LastPass 行銷團隊在用的第三方競品情報平台 [Klue](https://cyberinsider.com/lastpass-says-customer-data-exposed-in-klue-supply-chain-breach/)，偷走 Klue 替客戶保管的 OAuth 長期權杖，再拿這些權杖直接讀走各家 Salesforce 裡的客戶資料。密碼庫沒事，出事的是企業給出去、卻沒人在盤的那一大把第三方整合授權。

所以這篇要談的不是「LastPass 又被駭了」這種標題。真正的問題是：為什麼一個競品情報工具被攻破，能連帶把十幾家資安公司的 CRM 資料一起帶走？答案藏在每家企業都有、但很少有人完整盤過的一筆爛帳裡，也就是你到底發了多少張「長期有效、權限很大、過期遙遙無期」的第三方整合權杖出去。

<img src="/images/lastpass-klue-oauth-token-breach-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：一把數位安全鎖被撬開，象徵外洩破口出現在串接邊界而非核心系統">

## 先把事件還原清楚：出事的是串接，不是密碼庫

LastPass 在 6 月 12 日接獲 Klue 通報，得知 Klue 遭入侵。[LastPass 的說法](https://hackread.com/lastpass-customer-data-breach-klue-oauth-token/)很明確：外洩限於存放在 Salesforce 裡的客戶關係管理資料，包含客戶姓名、電話、電子郵件、地址、客服案件紀錄與業務往來資料。它同時強調「LastPass 產品、服務、基礎設施與客戶密碼庫均未受影響」。

這個切割很重要。LastPass 過去最被記得的就是 2022 年那場波及加密密碼庫的外洩，所以這次它第一時間要先把界線畫出來：[密碼庫安全與任何受密碼管理服務保護的客戶機密都沒被動到](https://cyberinsider.com/lastpass-says-customer-data-exposed-in-klue-supply-chain-breach/)。換句話說，這次被搬走的是「業務聯絡簿」，不是「保險箱」。

但別因此鬆一口氣。被搬走的聯絡與客服資料，正好是拿來做精準釣魚與社交工程的上等原料，LastPass 自己也提醒客戶要對針對性的釣魚保持警覺。資料分級不同，後果路徑也不同，這不是「無關緊要的資料」，而是「另一種武器的彈藥」。

<img src="/images/lastpass-klue-oauth-token-breach-s2.webp" width="960" height="636" loading="lazy" decoding="async" alt="示意圖：雲端 CRM 客戶關係管理系統的資料儀表板畫面">

## 一把鑰匙開十幾家門：OAuth 長期權杖怎麼變成萬能鑰匙

這次最該看懂的，是攻擊鏈怎麼從「一家被打」變成「一票一起倒」。

起點平凡到有點荒謬。據 [CSO Online](https://www.csoonline.com/article/4187907/klue-breach-exposed-salesforce-crm-data-through-stolen-oauth-tokens.html) 整理，攻擊者用的是「一組早就沒在用、卻還活著的舊憑證」進到 Klue，那是 Klue 當初為了試做一個後來放棄的第三方整合而建立的帳號。功能砍了，憑證沒收回，就這樣擺著。攻擊者進去之後，往 Klue 的整合系統推了一段惡意更新，[專門用來收割客戶的 OAuth 權杖](https://www.csoonline.com/article/4187907/klue-breach-exposed-salesforce-crm-data-through-stolen-oauth-tokens.html)。

接下來才是關鍵。Klue 是競品情報平台，要做事就得連上客戶的 Salesforce、Gong 這些系統，所以它手上握著一大批客戶授權給它的 OAuth 權杖。這些權杖是「長期有效」的，當初設計就是讓整合可以一直自動同步資料，不必每次都重新登入。攻擊者把這批權杖偷到手，等於同時拿到了十幾家公司 Salesforce 的鑰匙。

資安公司 [ReliaQuest 還原的存取行為](https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/)讓人背脊發涼：攻擊者用被竊的整合服務帳號登入、生成 OAuth 權杖，再跑自動化的 Python 腳本，對 Salesforce 的 REST API 連續查詢了將近 24 小時。它的原話是「這個量與節奏指向的是批量資料撈取，不是日常整合流量，等於有人用一個合法整合自己的憑證，從一道本來就開著的門裡，安靜地大規模把 CRM 紀錄抽走」。

最難防的點就在這裡。整個過程沒有惡意程式、沒有盜用使用者帳號，用的是「被信任的整合」名下的合法授權。ReliaQuest 直接點破：因為這個整合是「被信任的」，它的異常活動「幾乎沒被檢視」。這跟我先前在 [MCP 成事實標準後談 agent 治理](/articles/mcp-de-facto-standard-agent-governance/)那篇的觀察是同一件事，每一個串接進來的整合，都是一個新的權限治理對象，而 OAuth 權杖的單點失效，會把風險瞬間放大到所有連著的系統。

<img src="/images/lastpass-klue-oauth-token-breach-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：象徵 OAuth 授權權杖的數位金鑰，一把鑰匙連向多個系統">

## 受害的反而多是資安廠，這件事本身就是案例

把這次的受害名單念出來，會發現一個很諷刺的現象。[TechCrunch](https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/) 與 [Hackread](https://hackread.com/lastpass-customer-data-breach-klue-oauth-token/) 整理出的受影響企業，包含 HackerOne、Snyk、Tanium、Recorded Future、Huntress、Jamf、OneTrust、Gong、Sprout Social，加上 LastPass。[SecurityWeek 後續又補上了 BeyondTrust](https://www.securityweek.com/beyondtrust-lastpass-impacted-by-klue-salesforce-incident/)，並指出確認受影響的組織已逾十餘家，把 Icarus 外洩網站上列名、但還沒公開承認的算進去，總數大約 15 家。

這份名單幾乎是一張資安產業的點名簿。漏洞回報平台、軟體供應鏈安全、端點防護、威脅情報，這些公司本業就是教別人怎麼把資安做好。它們不是不懂，也不是沒投資。但它們一樣中了。

原因不在它們自家系統強不強，而在破口根本不在它們家。它們的共通點只有一個：都用了同一個競品情報平台。當這個共用的第三方被攻破，誰的防禦做得多好都沒用，因為被偷的是「它們發給這個第三方的鑰匙」。這正好說明一件事，你的資安等級，不只取決於你自己築了多高的牆，還取決於你把鑰匙交給了誰、那個人的牆有多高。

<img src="/images/lastpass-klue-oauth-token-breach-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：資安公司的伺服器機房，象徵這次受害者多為資安廠商">

## 真正的爛帳：你到底發了多少張長期權杖出去

把攻擊手法看一遍很容易，但企業真正該補的不是「怎麼防 Klue 這種攻擊」，而是一筆平常沒人在算的帳：你到底給了多少第三方整合、多大的權限、多長的有效期？

現代企業的 SaaS 串接是長出來的，不是規劃出來的。某個團隊為了同步資料，授權了一個工具讀寫 Salesforce；另一個團隊試用某個分析服務，給了它一個 API 權杖；行銷接了競品情報平台，業務接了會議記錄工具。每一筆當下都很合理，但沒有人回頭把它們匯整成一張清單，更沒有人定期問「這個授權還需要嗎、權限是不是開太大、要不要設到期」。Klue 那組「放棄的整合卻沒收回的憑證」就是這筆爛帳的縮影，東西沒在用了，鑰匙還掛在門上。

[ReliaQuest 的建議](https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/)講得直接：「任何一個對 Salesforce 這類核心平台有 OAuth 存取權的第三方 app，都是你攻擊面的一部分，都該被清點、被監控、被收斂到最小權限。」這句話值得貼在每個資安團隊的牆上。問題從來不是「要不要用第三方工具」，而是「用了之後，那把鑰匙誰在管」。

這條線跟我之前寫 [SaaS 與 API 認證設定錯誤正在變成主流外洩管道](/articles/servicenow-saas-api-auth-misconfiguration-breach/)是同一個趨勢的兩面。一面是對外端點的「預設未驗證」沒人回頭檢查，另一面是對外授權的「長期權杖」沒人回頭收回。共通點都是：外洩的入口越來越常落在你串接出去的邊界，而不是核心系統。攻擊者很清楚，與其硬攻一家防得很好的公司，不如去打它信任的、防得比較鬆的那個第三方，再用合法的授權走進來。

<img src="/images/lastpass-klue-oauth-token-breach-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：盤根錯節、難以理清的網路線，象徵企業第三方整合授權盤點不清">

## 企業現在該怎麼收：盤點、最小權限、授權到期

這不是文章能幫你做完的盤點，但方向很清楚，而且明天早上就能開始。把它拆成三件具體的事，順序不要倒。

**第一，先盤點，把帳算出來。** 你沒辦法保護你不知道存在的東西。第一步是列出所有對核心系統（Salesforce、Google Workspace、Microsoft 365、GitHub 這類）有 OAuth 存取權的第三方 app，記下每一個的擁有者、權限範圍、最後使用時間。光是這一步，多數公司就會挖出一堆「沒人記得授權過、也沒人在用」的殭屍整合。[ThreatLocker 在這次事件的分析](https://www.threatlocker.com/blog/klue-saas-supply-chain-compromise-through-long-lived-oauth-tokens)裡建議的第一件事，就是檢視、隔離或嚴格監控這些整合的擁有者、帳號範圍與可疑活動。

**第二，收斂權限，把鑰匙磨小。** 盤完之後，逐一檢查每個整合的權限是不是開太大。一個只需要讀取聯絡人的工具，沒道理給它讀寫所有物件的權限。OAuth 的 scope 設計就是讓你能切細，問題是大家圖方便，常常一路給到底。最小權限不是口號，是把「萬一這把鑰匙被偷，能開的門」這件事先縮到最小。

**第三，給授權設到期，別讓權杖永生。** 長期有效的權杖是這次災難的核心。可行的做法是替整合憑證設定輪替週期、定期重新授權、並把 ThreatLocker 那份清單裡的動作常態化：[輪替服務帳號憑證、撤銷可疑的 OAuth 與更新權杖、稽核 Salesforce 的存取事件](https://www.threatlocker.com/blog/klue-saas-supply-chain-compromise-through-long-lived-oauth-tokens)。一把每 90 天就會自動失效、用一次就被監控一次的鑰匙，跟一把發出去就永遠有效、沒人看的鑰匙，被偷之後的後果差很多。

這三件事不性感，是苦工。但 Klue 事件證明的就是這個：被攻破的不是哪個聰明的技術環節，而是沒人回頭整理的那筆爛帳。

<img src="/images/lastpass-klue-oauth-token-breach-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：資安稽核清單與治理流程，象徵第三方整合的盤點與權限收斂">

## 在這個時代，該怎麼用 AI 來補強這些漏洞

談到這裡，我自己最關心的問題其實是：在現在這個時代，該怎麼用 AI 來補強這些漏洞？

先把話說清楚，AI 不是用來「變聰明地擋下攻擊」的那種救世主，會這樣想就解錯題了。這次事件裡，攻擊用的是合法授權、走的是被信任的整合，沒有惡意程式可以掃、沒有盜用帳號可以擋。所以 AI 真正能補的位置，不是去當一個更厲害的防火牆，而是去做兩件人類做不來、又非做不可的苦工。

第一件，是把那筆「沒人在盤的爛帳」盤起來。第三方整合清點、權限比對、找出殭屍授權與權限開太大的項目，這種跨系統、要持續重複、又枯燥到沒人想做的工作，正是 AI 該頂上的地方。讓它持續掃過你所有核心平台的 OAuth 授權，整理成一張隨時更新的清單，標出哪些很久沒用、哪些權限大得不合理。把人從「沒空做盤點」這個藉口裡解放出來，這比任何花俏功能都實際。

第二件，是異常存取的偵測。回想 ReliaQuest 描述的那段：攻擊者用合法權杖跑了 24 小時的自動化查詢，「量與節奏」明顯不像日常整合流量，但因為整合是被信任的，沒人去看。這恰恰是 AI 擅長的題目，學出每個整合「平常長什麼樣」的基線，然後在存取量、時間、查詢模式偏離常態時示警。一個正常的同步整合不會在凌晨對 REST API 連打 24 小時，這種偏離，模型抓得到。

但這裡要踩一個剎車。AI 在這兩件事上的價值，是把訊號整理好、把異常標出來，不是替你做決定。哪個權杖該撤、哪個整合該砍、這個異常是攻擊還是某個工程師在跑批次，這些判斷得留給人。我一直相信，可信度靠的是落地流程，不是模型多聰明。AI 把盤點和偵測這兩段苦工接走，讓人類專注在判斷與決策，這才是這個時代用 AI 補資安漏洞的正確姿勢。把判斷整包丟給 AI，等於把另一把更大的鑰匙，交給一個你還沒學會監控的對象。

<img src="/images/lastpass-klue-oauth-token-breach-s7.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：AI 監控儀表板與異常偵測分析畫面，象徵用 AI 盤點權杖與偵測異常存取">

<h2>常見問題</h2>

<p><strong>LastPass 這次外洩，我的密碼庫會不會被看光？</strong><br>不會。LastPass 明確表示這次外洩限於存放在 Salesforce 的客戶關係管理資料（姓名、電話、電子郵件、地址、客服與業務紀錄），<a href="https://cyberinsider.com/lastpass-says-customer-data-exposed-in-klue-supply-chain-breach/">產品、基礎設施與客戶密碼庫均未受影響</a>，密碼庫的加密機密沒有被動到。但被外洩的聯絡資料適合用來做精準釣魚，收到自稱 LastPass 的訊息仍要提高警覺。</p>

<p><strong>我公司沒用 Klue，是不是就沒事？</strong><br>不一定。Klue 只是這次的破口，真正的風險是任何一個對你 Salesforce、Google Workspace、Microsoft 365 這類核心平台有 OAuth 存取權的第三方 app。<a href="https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/">資安公司 ReliaQuest 建議</a>把這些整合全部清點、監控並收斂到最小權限。該盤的不是 Klue 一個工具，是你發出去的所有第三方整合授權。</p>

<p><strong>第三方整合的 OAuth 權杖該多久換一次？</strong><br>沒有單一標準天數，但原則是長期有效、永不過期的權杖最危險。可行做法是替整合憑證設定輪替週期、定期重新授權、收斂到最小權限，並監控異常存取。<a href="https://www.threatlocker.com/blog/klue-saas-supply-chain-compromise-through-long-lived-oauth-tokens">ThreatLocker 在這次事件的分析</a>建議撤銷與更新可疑的 OAuth 權杖、輪替服務帳號憑證，把這些動作常態化而非等出事才做。</p>

<p><strong>為什麼這次受害的多是資安公司？</strong><br>因為破口在大家共用的第三方工具，不是各家自家系統的強弱。HackerOne、Snyk、Tanium、Recorded Future、Huntress 等<a href="https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/">逾十餘家公司</a>的共通點是都用了同一個競品情報平台，當這個第三方被攻破、客戶的 OAuth 權杖被收割，連著的 Salesforce 就一起被掃，跟受害者自己的防禦做得多好無關。</p>
