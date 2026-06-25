---
title: "agent 進企業後，資安從「盯人」變「同時盯 AI agent」：Ent.AI 帶 1 億美元種子出場"
slug: ent-ai-agent-workspace-security
description: "Ent 帶 1 億美元種子出隱形期，做即時分析人與 AI agent 行為的意圖感知工作區資安平台；企業放進 agent 後，資安監控對象從盯人擴到同時盯會自己動的 AI agent，防禦重心也從事後比對偏離轉向事前看意圖、即時攔下。"
publishDate: "2026-07-22T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags:
  - "Ent.AI"
  - "AI agent 資安"
  - "非人身分治理"
  - "UEBA 行為分析"
  - "意圖感知資安"
author: "lightman"
coverImage: "covers/ent-ai-agent-workspace-security.webp"
coverAlt: "象徵企業端資安同時監控人與 AI agent 工作區行為的抽象資料防護畫面"
coverImageCredit: "Photo by Chris Yang on Unsplash"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有事實陳述與超連結均經人工查證後編輯定稿。"
highlights:
  - "Ent（ent.ai）2026/6/16 以 1 億美元種子出隱形期、Decibel 領投，做即時分析「人＋AI agent」行為的意圖感知工作區資安平台。"
  - "agent 用人的合法授權在跑，動起來就像正在做事的開發者，沒有惡意程式可掃、沒有被盜帳號可擋，傳統盯人或盯惡意程式的工具接不住。"
  - "和 UEBA 差在 agent 沒有穩定的人類節奏可建基線，防禦重心從「事後比對偏離」轉向「事前看意圖、即時攔下」。"
  - "防禦三件事：意圖要可判讀、agent 身分要與真人拆開、每個會自動的 agent 當成新權限治理對象來盤（最小權限、可追責、能即時停）。"
references:
  - title: "Ent raises USD $100 million seed round led by Decibel"
    url: "https://securitybrief.co.nz/story/ent-raises-usd-100-million-seed-round-led-by-decibel"
    publisher: "SecurityBrief"
  - title: "Ex-Microsoft duo behind Security Copilot raises $100M seed to catch AI threats before they strike"
    url: "https://techfundingnews.com/ent-100m-seed-ex-microsoft-security-copilot-ai-threats/"
    publisher: "Tech Funding News"
  - title: "Ent Raises $100M to Reinvent Endpoint Security for AI Era"
    url: "https://www.bankinfosecurity.com/ent-raises-100m-to-reinvent-endpoint-security-for-ai-era-a-31995"
    publisher: "BankInfoSecurity"
  - title: "What Is User and Entity Behavior Analytics (UEBA)?"
    url: "https://www.microsoft.com/en-us/security/business/security-101/what-is-user-entity-behavior-analytics-ueba"
    publisher: "Microsoft Security"
  - title: "Goalkeeper：醫療 AI 合規守門引擎"
    url: "https://yao.care/ai/goalkeeper/"
    publisher: "yao.care"
---

資安新創 Ent（ent.ai）2026 年 6 月 16 日帶著 1 億美元種子資金結束隱形期，由 Decibel 領投。它做的事一句話講完：在端點上即時分析「人」和「AI agent」兩種行為，看每個動作的意圖有沒有對齊公司政策，不對就在動作完成前攔下來。這件事真正的訊號，是企業把 agent 放進工作流之後，資安要盯的對象從「盯人」擴大到「同時盯會自己動手的 AI agent」。底下把這個轉變拆開講。

先把這輪講清楚。Ent 6/16 出隱形期，1 億美元種子由 Decibel 領投，紅杉、Crosspoint Capital、Craft Ventures、Shield Capital、Felicis 與美國情報體系創投 In-Q-Tel 跟投，是資安史上數一數二大的種子輪（[SecurityBrief](https://securitybrief.co.nz/story/ent-raises-usd-100-million-seed-round-led-by-decibel)）。兩位創辦人 Elias Manousos 與 Brandon Dixon 來頭不小，前一家公司是攻擊面情報平台 RiskIQ、2021 年被微軟收購，團隊也參與過微軟 Security Copilot（[Tech Funding News](https://techfundingnews.com/ent-100m-seed-ex-microsoft-security-copilot-ai-threats/)）。產品定位是「意圖感知」（intent-aware）的工作區資安平台，用跑在端點上的 AI 即時判讀，已經部署在飯店、金融、國防等 Global 2000 客戶，用途涵蓋內部威脅、AI 治理與資料外洩防護（[SecurityBrief](https://securitybrief.co.nz/story/ent-raises-usd-100-million-seed-round-led-by-decibel)）。

<img src="/images/ent-ai-agent-workspace-security-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵資安新創獲得鉅額種子資金的科技投資概念畫面">

重點不在募了多少，在它賭的題目。傳統資安工具盯的是「人」或「惡意程式」，但 agent 是第三種東西。它用的是某個員工授權給它的帳號與權限，做的動作又都是正常工作會做的事。Ent 的說法很直白：一個有生產系統存取權的 coding agent，動起來就跟一個正在做事的開發者一模一樣（[Tech Funding News](https://techfundingnews.com/ent-100m-seed-ex-microsoft-security-copilot-ai-threats/)）。沒有惡意程式可掃、沒有被盜的帳號可擋，因為它本來就握有合法身分。所以問題不是「它是不是壞人」，而是「這個合法身分現在做的事，是不是它該做的事」。

<img src="/images/ent-ai-agent-workspace-security-s2.webp" width="960" height="539" loading="lazy" decoding="async" alt="資料中心伺服器，象徵 AI agent 以開發者身分在生產系統中執行動作">

這跟過去十年資安界熟悉的 UEBA（使用者與實體行為分析）差在哪？UEBA 的做法是替每個使用者和實體建一條「正常行為基線」，再把偏離基線的動作標成可疑（[Microsoft Security](https://www.microsoft.com/en-us/security/business/security-101/what-is-user-entity-behavior-analytics-ueba)）。它其實早就涵蓋非人實體，伺服器、服務帳號、資料庫都算。但 agent 打破的是「基線」這個前提。一個真人有穩定的作息節奏，agent 沒有：它可以 24 小時不停、一秒切換十個應用、橫跨平常不會碰的系統，而且每次任務的行為都可能長得不一樣，你很難拿「跟昨天的它比」來抓異常。Ent 的轉向就是從「事後比對偏離」改成「事前看意圖」，CEO Manousos 講得很清楚，一旦理解了意圖，看到動作偏離意圖，就能在不該發生的行為發生前把它停下來，不管做的是人還是 agent（[BankInfoSecurity](https://www.bankinfosecurity.com/ent-raises-100m-to-reinvent-endpoint-security-for-ai-era-a-31995)）。

<img src="/images/ent-ai-agent-workspace-security-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="行為分析監控的數據儀表板，象徵建立行為基線並偵測偏離">

從防禦角度，這把幾件本來就該做、但很多公司沒做的事推到檯面上。第一，意圖對齊要可判讀。Manousos 說現有產品答不出的關鍵問題是「使用者或 agent 的意圖有沒有對齊公司目標，不對的話多快能停」（[SecurityBrief](https://securitybrief.co.nz/story/ent-raises-usd-100-million-seed-round-led-by-decibel)）。第二，身分要拆得開。agent 不該共用某個真人的帳號在跑，否則出事根本分不清是人做的還是 agent 做的，這正是我先前在 [Anthropic 把 Claude 變成 Slack 裡共用「同事」](/articles/claude-tag-slack-shared-identity-governance/) 那篇講過的非人身分難題。第三，每個會自己動的 agent 都要當成一個新的權限治理對象來盤，最小權限、可稽核、離場即收，這條線我在 [MCP 成 AI agent 事實標準](/articles/mcp-de-facto-standard-agent-governance/) 那篇也標過。可追責的底線只有一句話：這個動作是誰做的、能不能即時停。

<img src="/images/ent-ai-agent-workspace-security-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="鎖與存取控制概念，象徵 agent 身分拆分與最小權限治理">

講到「即時把 agent 攔下來」，我自己的體會是，這條路最後幾乎一定走到「用 AI 守 AI」，也就是用魔法對抗魔法。我做的 [goalkeeper](https://yao.care/ai/goalkeeper/) 就是這個路數：它是一個醫療內容的合規守門引擎，用自動化的方式去查另一個 AI 生出來的內容有沒有踩到台灣的醫療法規。但這裡有一條我一直守住的鐵律：守門引擎只回狀態，不替呼叫方做決定。它告訴你這段內容在揭露、來源、範圍、個資、幻覺五關各自過或不過，最後要不要發，判斷留給人。Ent 把「人在錯誤發生時做修正」設計進產品，方向是對的；但用 AI 盯 AI 最怕的就是把判斷整包交給那個盯著的 AI。美國 ARPA-H 乾脆配一個監督 agent 去盯會自己改藥的臨床 agent，我在 [那篇](/articles/fda-clinical-ai-agent-overseer/) 就提過，當執行和監督都是 AI、可能共用同一套盲點，第二層很容易變成回音。守得住的設計，是讓 AI 接走「持續盯、標異常」這種人做不來的苦工，但撤不撤、停不停的最後一手，留給真人。

<img src="/images/ent-ai-agent-workspace-security-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="伺服器機房入口的關卡，象徵自動守門引擎把關 AI 產出">

<h2>常見問題</h2>

<p><strong>Ent.AI 這輪到底募了多少、誰投的？</strong><br>Ent（ent.ai）2026 年 6 月 16 日結束隱形期，一次拿下 1 億美元種子資金，由 Decibel 領投，紅杉、Crosspoint Capital、Craft Ventures、Shield Capital、Felicis 與美國情報體系創投 In-Q-Tel 跟投，是資安史上規模數一數二大的種子輪（<a href="https://securitybrief.co.nz/story/ent-raises-usd-100-million-seed-round-led-by-decibel">SecurityBrief</a>）。</p>

<p><strong>監控 AI agent 跟傳統 UEBA 有什麼不一樣？</strong><br>UEBA 是替每個使用者和實體建一條正常行為基線、再抓偏離基線的異常，本來就涵蓋伺服器、服務帳號等非人實體（<a href="https://www.microsoft.com/en-us/security/business/security-101/what-is-user-entity-behavior-analytics-ueba">Microsoft Security</a>）。但 agent 沒有穩定的人類作息可建基線，它用人的合法授權在跑、動起來像在做事的開發者（<a href="https://techfundingnews.com/ent-100m-seed-ex-microsoft-security-copilot-ai-threats/">Tech Funding News</a>），所以 Ent 把重心從事後比對偏離改成事前判讀意圖、不對就在動作完成前攔下（<a href="https://www.bankinfosecurity.com/ent-raises-100m-to-reinvent-endpoint-security-for-ai-era-a-31995">BankInfoSecurity</a>）。</p>

<p><strong>企業導入 AI agent，資安第一步該先做什麼？</strong><br>先把每個會自己動的 agent 當成一個新的權限治理對象來盤：給它獨立身分、不要共用真人帳號、套最小權限、留可稽核軌跡、離場即收。先確認「這個動作是誰做的、能不能即時停」答得出來，再決定要不要放它碰生產系統。</p>

<p><strong>用 AI 監控 AI，會不會反而更不安全？</strong><br>關鍵在分工怎麼設計。讓 AI 接走「持續盯、標異常」這種人做不來的苦工是合理的，但別把最後的判斷整包交給那個盯著的 AI；像合規守門引擎 <a href="https://yao.care/ai/goalkeeper/">goalkeeper</a> 的設計就是只回狀態、不替呼叫方做決定，撤不撤、停不停留給真人，才不會讓監督那層變成另一個共用盲點的回音。</p>
