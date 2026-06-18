---
title: "AI 開發框架 Mastra 的 npm 套件遭大規模投毒：舊貢獻者權限沒收回，成了供應鏈破口"
slug: "mastra-npm-supply-chain-stale-credential"
description: "6 月 17 日有人用一個沒被收回的前貢獻者帳號，在 88 分鐘內把 Mastra AI 框架的 140+ 個 npm 套件重新發佈、塞進惡意相依。重點不是手法多新，而是離職貢獻者的 scope 權限從沒被撤掉這種權限殘留，正成為 AI 開發供應鏈最常見的破口。"
excerpt: "一個放了 16 個月、沒人記得的舊帳號，撬開了週下載破百萬的 @mastra 套件生態。AI 供應鏈最大的漏洞不是程式碼，是沒人收回的權限。"
publishDate: "2026-07-01T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["npm 供應鏈攻擊", "Mastra 套件投毒", "貢獻者權限殘留", "AI 開發供應鏈", "lockfile 版本鎖定"]
coverImage: "covers/mastra-npm-supply-chain-stale-credential.webp"
coverAlt: "Mastra AI 框架的 npm 套件遭大規模供應鏈投毒，相依套件被植入惡意程式的示意"
coverImageCredit: "Photo by FlyD on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "6 月 17 日凌晨，攻擊者用一個沒被收回的前貢獻者帳號，在 88 分鐘內（UTC 01:12–02:39）把 142 個 @mastra 套件重新發佈、塞進同一個惡意相依，連同 mastra、create-mastra 共 144 個套件受影響。"
  - "破口不是零時差漏洞，而是離職貢獻者的 scope 發佈權限從沒被撤掉；npm 不會因閒置就收回權限，一個放了約 16 個月的舊憑證就足以推送整個 scope。"
  - "防禦三件事：定期盤點 scope 與 token 權限、離職即撤；鎖版本而非用浮動範圍、CI 開 provenance／lockfile 稽核；出事輪換 npm／GitHub／雲端／LLM API 等所有憑證。"
references:
  - title: "144 Mastra npm Packages Compromised via Supply Chain Attack"
    url: "https://orca.security/resources/blog/mastra-npm-supply-chain-attack/"
    publisher: "Orca Security"
    note: "142 個 @mastra 套件＋mastra/create-mastra 共 144 個、6/17 UTC 01:12–02:39 88 分鐘、ehindero 帳號、@mastra/core 約 918K 週下載、合計逾 110 萬、postinstall 關 TLS 自刪、tradecraft 與 Sapphire Sleet/BlueNoroff 重疊（微軟注意到）"
  - title: "Mastra npm Supply Chain Attack: 140+ Packages Backdoored via easy-day-js Typosquat"
    url: "https://www.stepsecurity.io/blog/mastra-npm-packages-compromised-using-easy-day-js"
    publisher: "StepSecurity"
    note: "easy-day-js 為 dayjs 的 typosquat、6/16 乾淨 1.11.21 後 6/17 武器化 1.11.22、^1.11.21 semver 自動解析、鎖版本與輪換憑證建議"
  - title: "A forgotten contributor account compromised the entire Mastra npm package scope"
    url: "https://snyk.io/blog/a-forgotten-contributor-account-compromised-the-entire-mastra-npm-package-scope/"
    publisher: "Snyk"
    note: "ehindero 約 16 個月閒置、npm 不會因閒置收回 scope 權限、Project hygiene not a zero-day、歸因未確認不臆測、輪換 cloud/CI/LLM API/npm/SSH 等所有憑證"
  - title: "Over 140 popular Mastra npm Packages Hit by Supply Chain Attack"
    url: "https://www.aikido.dev/blog/over-140-popular-mastra-npm-packages-hit-by-supply-chain-attack"
    publisher: "Aikido Security"
    note: "第二階段常駐程式鎖定逾 160 個瀏覽器加密貨幣錢包外掛（MetaMask、Keplr、Coinbase 等）、^1.11.21 caret 解析自動拉到惡意 1.11.22"
---

<p>6 月 17 日凌晨，有人用一個早就沒在維護的前貢獻者帳號，在 88 分鐘內把 AI 開發框架 Mastra 的 npm 套件生態整批改寫。<a href="https://orca.security/resources/blog/mastra-npm-supply-chain-attack/" target="_blank" rel="noopener">142 個 @mastra 套件被重新發佈、塞進同一個惡意相依，連同 mastra 與 create-mastra 共 144 個套件受影響，時間落在 UTC 01:12 到 02:39 這 88 分鐘內</a>。這件事真正該記住的，不是手法多新，而是一個沒人回頭看的問題：離職貢獻者的發佈權限，從頭到尾沒有被收回。</p>

<h2>88 分鐘，144 個套件</h2>

<p>先把經過講清楚。攻擊者前一天先發了一個乾淨的誘餌，<a href="https://www.stepsecurity.io/blog/mastra-npm-packages-compromised-using-easy-day-js" target="_blank" rel="noopener">套件名叫 easy-day-js，是知名日期函式庫 dayjs 的 typosquat（仿冒名稱），連作者資訊、首頁、版本號都照抄；第一版 1.11.21 是無害的，隔天才發出夾帶惡意程式的 1.11.22 並標成 latest</a>。手法的關鍵在版本範圍：<a href="https://www.stepsecurity.io/blog/mastra-npm-packages-compromised-using-easy-day-js" target="_blank" rel="noopener">因為這些套件把相依寫成 <code>^1.11.21</code>，npm 的 semver 解析會在安裝當下自動抓到符合範圍的最新版，等於把武器化的那一版直接拉進來，不需要任何人手動操作</a>。</p>

<p>惡意的那一版藏了一段安裝後（postinstall）腳本。<a href="https://orca.security/resources/blog/mastra-npm-supply-chain-attack/" target="_blank" rel="noopener">它會先關掉 TLS 憑證驗證、把安裝路徑寫進暫存檔當作回報信標、生出背景常駐程式，跑完再把 setup.cjs 從套件樹裡刪掉，抹掉最主要的鑑識痕跡</a>。它要的東西也很直接：<a href="https://www.aikido.dev/blog/over-140-popular-mastra-npm-packages-hit-by-supply-chain-attack" target="_blank" rel="noopener">第二階段以常駐背景程式蒐集系統資訊，鎖定超過 160 個瀏覽器加密貨幣錢包外掛，包含 MetaMask、Keplr、Coinbase 等</a>，是會直接造成財務損失的竊密程式。</p>

<img src="/images/mastra-npm-supply-chain-stale-credential-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="攻擊者在 88 分鐘內自動化把 144 個 npm 套件重新發佈、塞進惡意相依">

<h2>真正的破口：沒人收回的權限</h2>

<p>套件規模看著嚇人，但根因一點都不高科技。<a href="https://snyk.io/blog/a-forgotten-contributor-account-compromised-the-entire-mastra-npm-package-scope/" target="_blank" rel="noopener">出事的帳號 ehindero 在 2024 年底到 2025 年初還有正常發佈紀錄，之後就沒再動；問題是 npm 不會因為閒置就收回 scope 的發佈權限，一個放著大約 16 個月的舊憑證，就足以推送到整個 scope 底下的每一個套件</a>。Snyk 把話講得很白：<a href="https://snyk.io/blog/a-forgotten-contributor-account-compromised-the-entire-mastra-npm-package-scope/" target="_blank" rel="noopener">真正的根因是專案的權限衛生，不是什麼零時差漏洞</a>。</p>

<p>@mastra/core 這種週下載約 91 萬、<a href="https://orca.security/resources/blog/mastra-npm-supply-chain-attack/" target="_blank" rel="noopener">整個 Mastra 生態合計週下載超過 110 萬的套件</a>，背後的破口竟然是一把沒人記得要拔掉的鑰匙。能不能攻破，跟有沒有人把鑰匙收回來，是兩件事，這次是後者沒做。</p>

<img src="/images/mastra-npm-supply-chain-stale-credential-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="一把沒人記得收回的鑰匙，對應離職貢獻者從沒被撤掉的 npm 發佈權限">

<h2>AI 生態正在重演 IT 三十年的老問題</h2>

<p>這就是我看這件事最在意的地方。Mastra 投毒事件，是 AI 生態系開始重演企業 IT 三十年的老問題；而它延伸出來的，是 AI 供應鏈最大的漏洞，不是程式碼，而是沒人記得的權限。</p>

<p>離職的人權限沒收、放著不管的存取憑證、沒人回頭審的預設值，這些在傳統 IT 治理裡是講到爛的東西，可是換到 AI 開發這條新管道，又從頭發生一次。我先前寫 ServiceNow 那篇講的是同一種病：<a href="/articles/servicenow-saas-api-auth-misconfiguration-breach/">一個沒人回頭檢查的預設值，功能照跑，就不會有人多看一眼，直到資料被查走</a>。Mastra 這次只是把場景換成 npm 套件供應鏈，病灶一樣。</p>

<p>而且 AI 開發把它放大了。<a href="/articles/mcp-de-facto-standard-agent-governance/">每一個接進來的外部相依，都該被當成一個新的權限治理對象</a>，但用 AI 一句話就拉進一堆套件的速度，讓相依清單長得比任何人盤得動的還快。沒人記得自己的專案到底拉進了哪些套件、哪些舊帳號還握著發佈權，這就是新破口的養成方式。</p>

<img src="/images/mastra-npm-supply-chain-stale-credential-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="盤根錯節的相依網路，AI 開發把舊的套件與權限風險放大成新的供應鏈破口">

<h2>三件治理事，現在就能盤</h2>

<p>講防禦，不講怎麼攻擊。這次事件其實對應三件可以馬上做的治理事。</p>

<p>第一，定期盤點套件 scope 與 token 權限，離職即撤。誰還握著發佈權、哪些 token 還活著、哪些貢獻者其實早就不在了，要列冊定期清。這正是 Mastra 沒做到的那一格，也是整起事件的起點。第二，鎖版本，不要用浮動範圍。<a href="https://orca.security/resources/blog/mastra-npm-supply-chain-attack/" target="_blank" rel="noopener">鎖定或釘住套件版本，避免 npm 自動把相依解析到被投毒的版本</a>；CI 裡開 provenance 與 lockfile 稽核，讓每個進到建置流程的套件來源可驗證。這次就是 <code>^</code> 這個浮動範圍把武器化版本自動拉進來的。第三，先想清楚出事要輪換哪些憑證。<a href="https://snyk.io/blog/a-forgotten-contributor-account-compromised-the-entire-mastra-npm-package-scope/" target="_blank" rel="noopener">一旦主機可能被碰過，該輪換的不只是 npm token，還有雲端金鑰、CI 的各種 secret、LLM 與其他 API 金鑰、GitHub token 與 SSH 金鑰</a>，因為這段惡意程式碰得到的範圍就是這麼廣。</p>

<p>順序不要倒。<a href="/articles/what-is-claw-llm-client-tool/">先定義這個相依要解決什麼、誰該有發佈權，再決定開放範圍</a>，不是先全開、出事才回頭補。</p>

<img src="/images/mastra-npm-supply-chain-stale-credential-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者盤點套件 scope 與 token 權限、鎖版本、開啟 lockfile 稽核的治理清單">

<h2>那這次是誰幹的？</h2>

<p>有幾家廠商把這次的手法跟北韓相關的攻擊團體連在一起。<a href="https://orca.security/resources/blog/mastra-npm-supply-chain-attack/" target="_blank" rel="noopener">Orca 指出這次的 tradecraft 與 Sapphire Sleet（也就是 BlueNoroff）有重疊，而這個重疊是微軟先注意到的</a>。但要誠實補一句：<a href="https://snyk.io/blog/a-forgotten-contributor-account-compromised-the-entire-mastra-npm-package-scope/" target="_blank" rel="noopener">Snyk 明說這起事件本身的歸因尚未確認，不會進一步臆測</a>。對防守方來說，是不是某個特定團體幹的，其實不影響該補的洞。<a href="/articles/llm-healthcare-promise-limits/">可信度靠的是落地流程的品質，不是猜對是誰</a>。</p>

<img src="/images/mastra-npm-supply-chain-stale-credential-s5.webp" width="940" height="625" loading="lazy" decoding="async" alt="出事後輪換 npm、GitHub、雲端與 LLM API 等所有憑證的示意">

<h2>常見問題</h2>

<p><strong>我沒有用 Mastra，這件事跟我有關嗎？</strong><br>有關。重點從來不是 Mastra 這個框架，是「離職貢獻者的權限沒被收回」這個模式。任何用 npm、用套件管理器的團隊，只要有人離開後帳號和 token 沒清，就會踩到同一個雷。Mastra 只是這個月最大的例子。</p>

<p><strong>鎖了版本就安全了嗎？</strong><br>鎖版本能擋掉這次這種「浮動範圍自動拉到投毒版本」的攻擊，是該做的第一道。但它不是萬靈丹，還要搭配權限盤點與 CI 的來源驗證。真正的根因是權限殘留，版本鎖定處理的是傳播路徑，兩邊都要顧。</p>

<p><strong>如果我可能裝到了，要換哪些金鑰？</strong><br>把主機當成可能被碰過來處理。npm token、GitHub token、雲端供應商金鑰、CI 的各種 secret、LLM 與其他 API 金鑰、SSH 金鑰，全部輪換一次；裝過的環境先回滾到事發前的套件版本，再清掉常駐痕跡。寧可多換，不要賭它沒外洩。</p>

<h2>結語</h2>

<p>一個放了 16 個月、沒人記得的帳號，撬開了週下載破百萬的套件生態。AI 工具讓相依長得更快、讓套件接得更多，可是「誰還握著鑰匙」這個問題，沒有任何模型會替你回答。先把自家的 scope 權限、token、離職帳號盤一次，把版本鎖好，想清楚出事要換什麼。這些事都不性感，但破口就在這裡。</p>
