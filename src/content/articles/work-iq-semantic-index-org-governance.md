---
title: "微軟 Work IQ 讓 AI 讀懂你公司的工作脈絡：組織行為被做成索引，資料邊界怎麼守"
slug: "work-iq-semantic-index-org-governance"
description: "微軟 Work IQ 把 email、會議、聊天與協作模式做成語意索引，讓 AI agent 讀懂組織怎麼運作。好處是 agent 更懂你公司，代價是『誰能查到誰的工作軌跡』成為新的隱私與權限治理對象。"
excerpt: "微軟 Work IQ 把 email、會議、聊天與協作模式做成語意索引，讓 AI agent 讀懂組織怎麼運作。好處是 agent 更懂你公司，代價是『誰能查到誰的工作軌跡』成為新的隱私與權限治理對象。"
publishDate: "2026-06-25T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["微軟 Work IQ", "語意索引", "組織知識治理", "AI agent 權限邊界", "資料治理"]
coverImage: "covers/work-iq-semantic-index-org-governance.webp"
coverAlt: "抽象數位網路節點與連線，象徵 Work IQ 把組織協作行為做成語意索引"
coverImageCredit: "Photo by Shubham Dhage on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "微軟 6/2 Build 端出 Work IQ、6/16 API 正式上線；它持續處理 email、行事曆、會議、聊天、檔案、人員與協作模式，建出『組織如何運作的即時模型』。"
  - "被治理的東西變了：從資料安全延伸到組織行為的可觀測性與存取邊界；當行為被語意化建立索引，權力會轉移到索引結構與它的設計方式。"
  - "微軟用使用者範圍權限、Rego 政策引擎、全程稽核與租戶信任邊界把關，但需要這整套防線，正說明『誰能查到誰的工作軌跡』已是要被治理的真問題。"
references:
  - title: "Announcing the new Work IQ APIs"
    url: "https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/"
    publisher: "Microsoft 365 Blog"
    note: "6/2 Build 發表、API 6/16 GA；語意索引持續處理 email/行事曆/會議/聊天/檔案/人員/協作模式，建出組織如何運作的即時模型；資料與脈絡留在 Microsoft 365 租戶信任邊界內"
  - title: "Work IQ: Production-ready intelligence for every agent"
    url: "https://devblogs.microsoft.com/microsoft365dev/work-iq-production-ready-intelligence-for-every-agent/"
    publisher: "Microsoft 365 Developer Blog"
    note: "10 個泛用工具透過 MCP 漸進揭露、getSchema 執行期動態探索結構；每個請求為使用者範圍、Rego 政策引擎逐請求判斷、每次工具呼叫皆記錄與評估供稽核"
---

<p>微軟在 6 月 2 日的 Build 大會上端出 Work IQ，6 月 16 日 API 正式上線。它的定位不是再多一個聊天機器人，而是想當「讓 AI agent 讀得懂你公司怎麼運作」的那一層。<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/" target="_blank" rel="noopener">官方的說法很直接：Work IQ 會持續處理 email、行事曆、會議、聊天、檔案、人員、協作模式，以及你的營運系統，建出一個「你的組織如何運作的即時模型」</a>。把這句話拆開，重點不是它能讀多少檔案，是它把組織的協作行為本身，做成了 agent 查得到的脈絡來源。</p>

<img src="/images/work-iq-semantic-index-org-governance-s1.webp" width="960" height="1440" loading="lazy" decoding="async" alt="現代辦公室協作場景，象徵 Work IQ 串接 email、會議與檔案等工作脈絡">

<h2>它索引的是「怎麼運作」，不是「有哪些檔案」</h2>

<p>過去企業內的 AI 大多停在翻檔案、查資料這一層。Work IQ 往前走了一步：它索引的是行為與關係，誰跟誰常開會、一個決策在哪些人之間流動、哪一封信牽動了哪個檔案。<a href="https://devblogs.microsoft.com/microsoft365dev/work-iq-production-ready-intelligence-for-every-agent/" target="_blank" rel="noopener">技術上它把上百個資料專用工具收斂成 10 個泛用工具，透過 MCP（Model Context Protocol，模型脈絡協定）漸進揭露，還給 agent 一個 getSchema，讓它在執行的當下就能問「這份資料長什麼樣、怎麼組」，不必預先把資料模型寫死</a>。對開發者這是省事，對組織的意義卻不只是省事。</p>

<img src="/images/work-iq-semantic-index-org-governance-s2.webp" width="960" height="509" loading="lazy" decoding="async" alt="節點與連線構成的關係網路圖，象徵 Work IQ 索引的是組織的行為與關係而非單純檔案">

<h2>真正被治理的東西，從「資料」變成「組織行為」</h2>

<p>這裡要先踩一個剎車。這類系統的本質，不只是讓 AI 讀取文件，而是讓它理解並重建整個組織的運作方式。治理問題也跟著轉變：從傳統的資料安全，延伸到對組織行為的可觀測性，以及存取邊界該怎麼設計。兩者的差別很實際：資料外洩，你至少看得出少了哪一份檔；但當一個 agent 能還原「某個團隊這半年怎麼做決策、誰在中間卡關」，被讀走的不是某份文件，是組織的行為軌跡。這兩件事不是同一個量級。</p>

<img src="/images/work-iq-semantic-index-org-governance-s3.webp" width="960" height="677" loading="lazy" decoding="async" alt="抽象數位視覺，象徵組織行為的可觀測性與資料存取邊界">

<h2>權力會轉移到「索引結構」本身</h2>

<p>再往裡看一層。當組織行為被語意化、建立索引之後，真正的權力不再只存在於資料本身，而是轉移到索引結構與它的設計方式。誰能定義索引、誰能決定查詢與組合的方式，誰就能在實質上影響「組織記憶」如何被建構、又如何被讀取。這跟我先前談 MCP 的立場是同一條線：協定底定之後，<a href="/articles/mcp-de-facto-standard-agent-governance/">每一台接進來的 server 都該被當成一個新的權限治理對象</a>。Work IQ 把這件事又推進一層：要治理的不只是工具，是組織記憶的索引本身。</p>

<img src="/images/work-iq-semantic-index-org-governance-s4.webp" width="960" height="1280" loading="lazy" decoding="async" alt="資料庫與索引結構的抽象視覺，象徵權力轉移到索引結構與其設計方式">

<h2>微軟自己築了防線，但那恰好證明問題在</h2>

<p>講句公道話，微軟這次的權限設計不算隨便。<a href="https://devblogs.microsoft.com/microsoft365dev/work-iq-production-ready-intelligence-for-every-agent/" target="_blank" rel="noopener">官方文件寫得清楚：每個請求都是「使用者範圍」，agent 只能存取那位使用者本來看得到、做得到的東西；底層用 Rego 政策引擎，在每一次請求上跑依脈絡判斷的規則；每一次工具呼叫都會被記錄與評估，供稽核、用量分析與即時合規</a>。<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/" target="_blank" rel="noopener">資料、脈絡與洞察也都留在 Microsoft 365 租戶的信任邊界內</a>。這套防線該肯定。但反過來想，需要這麼一整套防線，正說明「誰能查到誰的工作軌跡」已經是個要被治理的真問題，而不是可以事後再補的細節。順序也不能倒，<a href="/articles/what-is-claw-llm-client-tool/">先把使用情境定義清楚，再決定開放到哪裡</a>，不是先把索引建好、等出事才回頭想誰能查。</p>

<img src="/images/work-iq-semantic-index-org-governance-s5.webp" width="960" height="720" loading="lazy" decoding="async" alt="數位存取控制與信任邊界視覺，象徵使用者範圍權限、政策引擎與稽核紀錄">

<h2>會冒出來的新角色，和你明天就能盤的三件事</h2>

<p>所以接下來真正關鍵的，會是一批新型治理角色：負責語意索引設計的人、負責查詢權限模型的人、負責組織知識結構管理的人。這不是多掛幾個職稱的問題，是「組織記憶誰能讀、能怎麼組」這個權力，要交到誰手上。落地不必等規則到齊，可以先盤三件事。第一，哪些協作行為該被放進索引、哪些不該，預設值別開到最大。第二，誰能查到誰的工作軌跡，這條界線現在是誰在定。第三，查詢與組合的權限由誰核給、有沒有留下軌跡可以回查。能力進到公司的速度很快，但這些邊界要是沒人先畫，索引只會讓本來就看不見的地方，更看不見。</p>

<img src="/images/work-iq-semantic-index-org-governance-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣資料治理專業人員檢視組織知識結構，象徵語意索引設計與查詢權限模型等新型治理角色">
