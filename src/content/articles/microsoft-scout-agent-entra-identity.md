---
title: "微軟把爆紅開源的 OpenClaw 包成企業版 Scout：真正賣的不是會辦事的 agent，是替它動的每一手負責"
slug: "microsoft-scout-agent-entra-identity"
description: "微軟 6/2 發表建在開源專案 OpenClaw 上的 Scout，核心是每個 agent 配一組 Entra 身分、做事可回溯到人。真正的產品不是那顆會辦事的引擎，是綁著的身分治理層。看懂微軟把錢收在哪一層，比追 OpenClaw 熱鬧重要。"
excerpt: "微軟把會辦事的執行引擎免費放掉，把『每個 agent 一組身分、做事可究責』這層留著收費。因為企業裡難的從來不是 agent 能不能自動辦事，而是它闖了禍誰負責。"
publishDate: "2026-07-27T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["微軟 Scout", "OpenClaw", "AI agent", "Entra 身分", "企業治理"]
coverImage: "covers/microsoft-scout-agent-entra-identity.webp"
coverAlt: "象徵企業級 AI agent 身分與資安治理的概念示意"
coverImageCredit: "Photo by cottonbro studio on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "微軟 6/2 發表的 Scout 建在爆紅開源專案 OpenClaw 上，賣點不是那顆會自動辦事的引擎，而是綁著的身分層：每個 agent 一組被治理的 Entra 身分，做的事都歸得到一個大家認得的行為者。"
  - "為每個 agent 配獨立身分解的是對的題：過去 agent 靠共享服務帳號動作，出事查不到人；獨立身分讓行為可歸戶、可稽核、可單獨撤權，還要指派一個對它負責的真人 sponsor。"
  - "但身分解決的是歸責不是判斷，一個 agent 可以驗證得乾乾淨淨還是做錯事；微軟把執行引擎商品化、把治理層留著收費，台灣企業真正要補的是非人身分的治理功課。"
references:
  - title: "Introducing Microsoft Scout: Your always-on personal agent"
    url: "https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/"
    publisher: "Microsoft 365 Blog"
  - title: "What is Microsoft Entra Agent ID?"
    url: "https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id"
    publisher: "Microsoft Learn"
  - title: "Governing Agent Identities - Microsoft Entra ID Governance"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview"
    publisher: "Microsoft Learn"
  - title: "Microsoft unveils Scout, an autonomous AI agent built on OpenClaw"
    url: "https://www.computerworld.com/article/4180103/microsoft-unveils-scout-an-autonomous-ai-agent-built-on-openclaw.html"
    publisher: "Computerworld"
  - title: "Microsoft Scout Always-On Work Agent: OpenClaw, Governance, Security Risks"
    url: "https://windowsforum.com/threads/microsoft-scout-always-on-work-agent-openclaw-governance-security-risks.421703/"
    publisher: "Windows Forum"
originalContribution: "本文把這則新聞從『微軟包了個爆紅開源 agent』的表層，拆到『微軟把執行引擎免費放掉、把身分治理層留著收費』的商業結構，並以『身分解決歸責、不解決判斷』為分析框架區分兩種常被混談的風險，最後落到台灣企業非人身分治理的可執行盤點清單。"
---

微軟這次真正做的事，不是把週末爆紅的開源專案 OpenClaw 包裝成企業版 Scout，而是把「agent 自己會動手」這件能力免費放掉，把「每個 agent 一組身分、做的事可以回溯到人」這一層留在自己手上收費。因為在企業裡，難的從來不是 agent 能不能自動辦事，而是它闖了禍，誰負責。這一題微軟解對了。但買了 Scout 不等於買到安全，這兩件事很容易被講成同一件。

<img src="/images/microsoft-scout-agent-entra-identity-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="常駐背景、自動辦事的企業 AI 代理概念示意">

先把事情講清楚。6 月 2 日微軟發表了 [Scout，一個常駐在背景、不用每次下指令就會自己辦事的 agent](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)，微軟給它一個新名字叫 autopilot。它建在 OpenClaw 這個開源專案上，能接進 Teams、Outlook、OneDrive、SharePoint，讀你的信件、行事曆、聯絡人，替你排會議、整理待辦。OpenClaw 原本是開源社群裡爆紅的 agent 執行框架，微軟沒有重造輪子，而是拿現成的來包，還把自家的企業政策控制回饋給上游那個專案。

## 真正的產品不是那顆引擎，是它綁著的身分

Scout 這個名字底下真正的產品，不是那顆會辦事的引擎，是它綁著的身分層。微軟在官方說明裡寫得很白：[每個 agent 都在自己被治理的 Entra 身分底下運作，不是掛在一個共用、匿名的服務帳號上，所以它做的事，都歸得到一個大家認得的行為者身上](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)。憑證只給當下這個任務用、從日誌裡遮蔽掉、按第一方服務的規格來管。這套機制有個正式名字叫 [Entra Agent ID，今年四月正式上線](https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id)，把原本管人與工作負載的那一整套身分治理，延伸到 AI agent 身上。

<img src="/images/microsoft-scout-agent-entra-identity-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="為每個 AI agent 配發專屬數位身分與存取控制的概念示意">

## 為什麼「一組身分」是對的題

先分清楚 agent 跟聊天機器人差在哪。[一個聊天機器人頂多幻覺出一個爛答案；一個有持續存取權的 agent，會把一句壞指令、一次惡意的提示注入、一段被誤解的情境，直接變成一個動作](https://windowsforum.com/threads/microsoft-scout-always-on-work-agent-openclaw-governance-security-risks.421703/)。後果的層級不一樣。過去 agent 要動用系統，靠的是共享的服務帳號或 service principal，一旦出事，日誌上只看到那個共享帳號，查不出是哪個 agent、替誰做的。給每個 agent 一組獨立身分，等於把「這件事是誰做的」重新接回來：可歸戶、可稽核、可單獨撤權。微軟的治理文件講得更遠，[每個 agent 身分都要指派一個 sponsor，是對它的生命週期與存取負責的真人；這個人離開組織，責任自動轉給他的主管，確保永遠有一個真人為這個 agent 的權限負責](https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview)。存取權還能綁到期日，時間到沒人續，自動失效。

<img src="/images/microsoft-scout-agent-entra-identity-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="稽核軌跡與究責，agent 做的每件事都可回溯到負責的人">

## 踩個剎車：身分不等於判斷力

身分解決的是「歸責」，不是「判斷」。[一個 agent 可以身分驗證得乾乾淨淨，還是做錯事](https://windowsforum.com/threads/microsoft-scout-always-on-work-agent-openclaw-governance-security-risks.421703/)。Forrester 分析師 Jeff Pollard 講得直接：Scout [把你組織裡本來就有的資料治理問題放大，因為它不只是把敏感資料攤給人看，它還可能拿那份資料去動手](https://www.computerworld.com/article/4180103/microsoft-unveils-scout-an-autonomous-ai-agent-built-on-openclaw.html)。提示注入、過度授權、agent 用了不該用的工具，這些是架構層的風險，一組乾淨的身分擋不住。所以要分開看：Scout 的身分層讓你事後查得到是誰闖的禍，但它不保證禍不會闖。把「可歸責」講成「已安全」，是這波企業採用最容易犯的誤讀。

<img src="/images/microsoft-scout-agent-entra-identity-s4.webp" width="960" height="638" loading="lazy" decoding="async" alt="自主 agent 的資安風險與警示概念示意">

## 微軟把錢收在哪一層

看懂身分這層，微軟的商業盤算就清楚了。它把會辦事的執行引擎放進開源、幾乎免費，把身分、憑證、稽核、以及跟 Microsoft 365 綁在一起的治理層留著收費。[要把 Entra 這套安全與治理延伸到 agent，得買 Agent 365 授權，搭配 Microsoft 365 E5 或 E7](https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview)。價值被從「能力」搬到「可控」。這跟我先前的判斷是同一條線：[當 MCP 這類 agent 協定變成事實標準、能力本身不再稀缺，企業真正要買、要治理的，是權限邊界與責任歸屬](/articles/mcp-de-facto-standard-agent-governance/)。能力會被商品化，治理不會。微軟很清楚護城河該挖在哪一邊。

<img src="/images/microsoft-scout-agent-entra-identity-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="把執行引擎免費、把治理層留著收費的商業結構概念示意">

## 台灣企業該讀出什麼

台灣的行政與服務業大量用 Microsoft 365，這波不管你用不用 Scout，「非人身分」的治理都是遲早要補的功課。你公司現在很可能已經有一堆自動化程式、機器人、外掛，掛著共享服務帳號在動，出事查不到人。可以明天就做三件事：盤點目前有多少自動化程式在用共享帳號存取公司資料；問清楚每一個背後有沒有一個負責的真人；檢查這些權限有沒有到期與定期複審的機制。看懂微軟這次把錢收在哪一層，比追 OpenClaw 週末爆紅那則熱鬧重要。真正的門檻不在 agent 聰不聰明，在你能不能為它動的每一手負責。

<img src="/images/microsoft-scout-agent-entra-identity-s6.webp" width="867" height="1300" loading="lazy" decoding="async" alt="台灣企業面對非人身分治理功課的城市商業區概念示意">

<h2>常見問題</h2>

<p><strong>微軟 Scout 跟一般的 Copilot 聊天助理差在哪？</strong><br>差在會不會自己動手。Copilot 多半是你問它答、你按它做；Scout 被微軟定位成 [常駐背景、不用每次下指令就自動辦事的 autopilot agent](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)，能自己排會議、整理事情。因為它會動手，出錯的後果比聊天助理答錯一句嚴重，所以微軟才在它底下疊一整套身分與稽核機制。</p>

<p><strong>為每個 AI agent 配一組 Entra 身分，實際上解決了什麼？</strong><br>解決「查不到是誰做的」。過去 agent 常共用一個服務帳號動作，出事時日誌上只看到那個共享帳號。[Entra Agent ID 給每個 agent 一組被治理的獨立身分](https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id)，讓每一次認證與行為都有紀錄、可歸戶、可單獨撤權，還要指派一個對它負責的真人 sponsor。</p>

<p><strong>有了 Scout 的身分治理，是不是就安全了？</strong><br>不是。身分解決的是事後歸責，不是事前判斷。[一個 agent 可以驗證得乾乾淨淨，還是做錯事](https://windowsforum.com/threads/microsoft-scout-always-on-work-agent-openclaw-governance-security-risks.421703/)。提示注入、過度授權這類架構層風險，一組乾淨的身分擋不住，需要另外設權限範圍、審核與人工確認關卡。</p>

<p><strong>台灣企業現在該先做什麼？</strong><br>先盤點非人身分。查清楚公司現有多少自動化程式、機器人或外掛掛著共享服務帳號在存取資料，每一個背後有沒有一個負責的真人，權限有沒有到期與複審機制。這是不管用不用 Scout 都要補的功課，因為台灣企業普遍已在用 Microsoft 365。</p>
