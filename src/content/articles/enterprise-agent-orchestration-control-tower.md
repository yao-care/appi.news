---
title: "跨廠牌 AI agent 各自為政，企業要的是統一中控：Cognizant 把 ServiceNow agent 接進單一編排層，再疊一層 AI Control Tower"
slug: "enterprise-agent-orchestration-control-tower"
description: "Cognizant 六月連走兩步：先把 Neuro AI Trust 接進 ServiceNow 的 AI Control Tower 做治理，再讓 ServiceNow agent 和自家 Neuro 多代理加速器互通，湊出一個跨 ServiceNow、第三方與自建系統的單一編排層。方向抓對了，企業真正的痛是 agent 各自為政；但統一中控要小心做成新的鎖定或一套規則套死所有 agent。"
excerpt: "企業手上不缺 agent，缺的是有人把它們統一中控。但『統一到單一廠商的層』和『一套治理套所有 agent』，可能正好是解錯題的兩種方式。"
publishDate: "2026-07-11T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags:
  - "AI agent"
  - "AI治理"
  - "企業經營"
  - "數位轉型"
coverImage: "covers/enterprise-agent-orchestration-control-tower.webp"
coverAlt: "象徵企業把跨廠牌 AI agent 匯進單一編排層與中控台的網路操作中心示意"
coverImageCredit: "Photo by Fernando Narvaez on Pexels"
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
  - "Cognizant 六月連走兩步：6/4 把 Neuro AI Trust 接進 ServiceNow AI Control Tower 做治理與觀測，6/18 讓 ServiceNow agent 和自家開源的 Neuro 多代理加速器互通，組成跨 ServiceNow、第三方與自建系統的單一編排層。"
  - "這波產品在解的真問題不是『agent 不夠多』，而是各廠牌 agent 各自為政、各帶各的連接器；企業要的是統一中控，這個方向抓對了。"
  - "但統一中控有兩個容易解錯題的地方：把所有 agent 統一到單一廠商的層是換一種鎖定；一套治理規則套死所有 agent，Gartner 直指會失敗。信任邊界要看『能做什麼動作』和『能碰什麼資料』分開授權。"
references:
  - title: "Cognizant expands cross-platform agentic AI with new ServiceNow AI Agent interoperability"
    url: "https://news.cognizant.com/2026-06-18-Cognizant-expands-cross-platform-agentic-AI-with-new-ServiceNow-AI-Agent-interoperability"
    publisher: "Cognizant Newsroom"
  - title: "Cognizant announces ServiceNow partnership to accelerate scalable, operationalized AI governance at enterprise scale"
    url: "https://news.cognizant.com/2026-06-04-Cognizant-announces-ServiceNow-partnership-to-accelerate-scalable,-operationalized-AI-governance-at-enterprise-scale"
    publisher: "Cognizant Newsroom"
  - title: "Neuro SAN Studio（Cognizant AI Lab 開源多代理編排框架）"
    url: "https://github.com/cognizant-ai-lab/neuro-san-studio"
    publisher: "GitHub / cognizant-ai-lab"
  - title: "Why 40% Of Agentic AI Projects May Be Canceled By 2027"
    url: "https://www.forbes.com/sites/robertszczerba/2026/07/07/why-40-of-agentic-ai-projects-may-be-canceled-by-2027/"
    publisher: "Forbes"
  - title: "Why most agentic AI projects stall before they scale"
    url: "https://www.cio.com/article/4132031/why-most-agentic-ai-projects-stall-before-they-scale.html"
    publisher: "CIO"
  - title: "AI Agent Interoperability: What MCP and A2A Mean for Enterprise Governance"
    url: "https://airia.com/ai-agent-interoperability-what-mcp-and-a2a-mean-for-enterprise-governance/"
    publisher: "Airia"
originalContribution: "本文把 Cognizant 六月兩則分開發佈的公告（6/4 治理層、6/18 編排層）併讀成同一套『統一中控』策略，用『解對題 vs 解錯題』框架拆出兩個容易被忽略的失敗點：把 agent 統一到單一廠商的可攜性風險，以及一套治理套死所有 agent 的授權設計錯誤，並交叉 Gartner 與 A2A 互通協定的證據延伸到台灣企業的採購順序。"
---

企業手上真正的問題，不是 agent 不夠多，是沒人把它們統一中控。每套 SaaS 都塞了自己的 agent，各帶各的連接器、各講各的話，湊在一起就是一團各自為政。Cognizant 六月連走的兩步，剛好踩在這個痛點上：先把治理層接好，再把編排層打通，方向抓對了。但這裡要先踩一個剎車，統一中控有兩種很容易解錯題的做法，等一下說。

先看它做了什麼。第一步在 6 月 4 日，Cognizant 把自家的 Neuro AI Trust [接進 ServiceNow 的 AI Control Tower](https://news.cognizant.com/2026-06-04-Cognizant-announces-ServiceNow-partnership-to-accelerate-scalable,-operationalized-AI-governance-at-enterprise-scale)。Control Tower 這個東西的定位是「治理與觀測的統一底座」，把散在企業各處的 AI 系統、agent 和身分找出來、看得到、管得動；Cognizant 疊上去的是一批「責任式 AI」與 Guardian agent，負責在 AI 運作時即時盯公平、安全、資安、透明與合規。Cognizant 雲端與基礎設施服務全球負責人 Sriram Kumaresan 講得直接：市場已經解決了「用得到 AI」這件事，企業現在要的是「用得負責、又快又大規模」。

<img src="/images/enterprise-agent-orchestration-control-tower-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料網路匯流示意，象徵跨平台 agent 接進單一編排層">

第二步在 6 月 18 日，Cognizant 讓 ServiceNow 的 AI Agents 和自家的 Neuro AI 多代理加速器[互通](https://news.cognizant.com/2026-06-18-Cognizant-expands-cross-platform-agentic-AI-with-new-ServiceNow-AI-Agent-interoperability)，湊出一個跨 ServiceNow、第三方平台與自建系統的單一編排層。過去不同廠牌的 agent 基本上是各跑各的孤島，每接一個就得寫一套連接器、靠人工去協調。這一步就是要把那些孤島串起來，讓 ServiceNow 裡的 agent 能參與跨平台的工作流程。加速器本身[是開源的](https://github.com/cognizant-ai-lab/neuro-san-studio)，放在 GitHub 上，還附了業務、財務、供應鏈、客服這些現成的多代理網路。Cognizant 引 IDC 的數字說，[超過七成企業](https://news.cognizant.com/2026-06-18-Cognizant-expands-cross-platform-agentic-AI-with-new-ServiceNow-AI-Agent-interoperability)打算同時投現成 agent、自建 agent，和內建在既有軟體裡的 agent。三種來源混著買，碎片化幾乎是注定的。

<img src="/images/enterprise-agent-orchestration-control-tower-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="密布的電路板線路，象徵多套系統各帶各的連接器造成碎片化">

所以先確認一件事：這波產品在解的到底是哪一類問題。答案很清楚，它解的是「整合」與「治理」，不是「agent 不夠聰明」。這個定位我認為對。真正拖垮企業 agent 專案的，從來不是模型笨。Gartner 預測[到 2027 年底會有超過四成的 agentic AI 專案被砍掉](https://www.forbes.com/sites/robertszczerba/2026/07/07/why-40-of-agentic-ai-projects-may-be-canceled-by-2027/)，理由是成本失控、商業價值講不清、風險控制不到位，沒有一項是「模型能力不足」。換句話說，卡點在落地設計，不在演算法。Cognizant 這兩步瞄準的正是落地那一端，值得肯定。

<img src="/images/enterprise-agent-orchestration-control-tower-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="齒輪與控制機構示意，象徵 AI 治理與授權範圍的控制設計">

但統一中控有第一個容易解錯題的地方：把治理做成「一套規則套死所有 agent」。Gartner 另一份研究直接點名，對所有 agent 一視同仁地套同一套治理，反而會害死企業的 agent 專案。原因是把兩件本該分開的事混在一起：一個 agent「能做什麼動作」和它「能碰到什麼資料、什麼系統」，是兩層授權，不能綁成一個開關。你不會因為一個實習生會用 Excel，就把整個財務系統的權限開給他。agent 也一樣。真正該固定的是誘因與流程：這個 agent 的角色是什麼、它動了資料誰負責、出錯時哪一關攔得住。信任的依據是這套結構，不是它掛在哪個中控台底下。中控台讓你「看得到」，但看得到不等於「授權設計對了」，這中間還隔著一段功夫。這也是為什麼 [MCP 這類連接標準](/articles/mcp-de-facto-standard-agent-governance/)成形之後，企業真正要治理的重點反而從「怎麼接」移到了「接上之後誰有權碰什麼」。

<img src="/images/enterprise-agent-orchestration-control-tower-s4.webp" width="960" height="639" loading="lazy" decoding="async" alt="連接的網狀節點，象徵開放互通協定與單一廠商編排層之爭">

第二個容易解錯題的地方，是「統一到誰家」。單一編排層聽起來很美，但它本身也是一個廠商的層。Cognizant 把加速器開源、掛在 GitHub 上，這是加分，代表它至少不想把你鎖進一個閉源黑盒。可是企業要問的下一個問題是：這個中控層可不可攜？我今天把所有跨廠牌 agent 都編進 Cognizant 加 ServiceNow 這一層，明天想換掉其中一塊，成本有多高？業界另一條路線是走廠商中立的開放協定，像 A2A，讓不同廠牌的 agent 直接對話，不必透過誰家的中控。但開放互通自己也帶風險：一個在你治理範圍內的 agent，可能把任務[轉交給範圍外的外部 agent，而這筆交接沒留下稽核紀錄](https://airia.com/ai-agent-interoperability-what-mcp-and-a2a-mean-for-enterprise-governance/)。所以這不是「用中控台或用開放協定」的二選一，而是要想清楚：中控與可攜要怎麼並存，別為了統一而換來新的單一依賴。

再補一個成本上的提醒。CIO 訪談裡 Gartner 分析師 Anushree Verma 講過一句實話：[當你把編排器、治理層和多個 agent 疊上去，成本會很快失控](https://www.cio.com/article/4132031/why-most-agentic-ai-projects-stall-before-they-scale.html)。統一中控本身就是在往上疊層。疊得值不值，取決於它替你省下的協調成本有沒有超過它自己的開銷，這筆帳要在買之前算，不是上線後才發現。

<img src="/images/enterprise-agent-orchestration-control-tower-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="現代企業辦公大樓與城市天際線，象徵台灣企業導入 agent 的採購場景">

那台灣企業該怎麼讀這條新聞？台灣的金融、製造、電信，這幾年一套一套地買 SaaS，每套很快都會附上自己的 agent。同樣的碎片化，一兩年內就會撞到。這時候順序不能倒：先定義你要編排的到底是哪些流程、哪些 agent 該有權碰哪些資料，再去挑中控與編排工具，[最後才是比較具體選哪家](/articles/llm-healthcare-promise-limits/)。把順序倒過來，先被某家的「單一編排層」框住，再回頭硬套自己的流程，是選型最常見的失敗模式。對本地的系統整合商來說，機會也在這裡：能替客戶把治理與編排的架構定義清楚，比再賣一個 agent 值錢得多。政府若要替企業立座標，新加坡那套[主體型 AI 治理框架](/articles/singapore-agentic-ai-governance-mgf/)已經示範了「治理要跟著 agent 的自主程度分級」的思路，值得參考。

回到那兩則公告。Cognizant 的 AI 長 Babak Hodjat 說，多代理系統是企業 AI 的未來，價值在「一群 agent 一起工作」，不在任何單一 agent、平台或廠商。這句話我同意一半。價值確實在協作，這是對的。但「協作」要成立，前提是每個 agent 的角色、授權與責任先被定義清楚，中控台只是讓你看得見這一切，不是替你把這些定義好。看懂它解的是整合與治理這個對的題，再看清楚它可能在授權設計與廠商可攜上留下的兩個坑，比記住「單一編排層」這個賣點重要。

## 常見問題

<p><strong>AI agent 的「單一編排層」到底在解決什麼問題？</strong><br>解決的是跨廠牌 agent 各自為政的整合問題。企業常常同時用 ServiceNow、第三方平台和自建系統的 agent，過去每接一個都要寫專屬連接器、靠人工協調。編排層的目標是把這些孤島串成能一起跑的工作流程，<a href="https://news.cognizant.com/2026-06-18-Cognizant-expands-cross-platform-agentic-AI-with-new-ServiceNow-AI-Agent-interoperability">Cognizant 六月就是這樣把 ServiceNow agent 接進自家 Neuro 加速器</a>。它解的是整合與治理，不是讓單一 agent 變聰明。</p>

<p><strong>有了 AI Control Tower，agent 的治理就算做好了嗎？</strong><br>沒有。Control Tower 讓你「看得到」企業裡所有 AI 系統與 agent，但看得到不等於授權設計對了。Gartner 提醒，對所有 agent 套同一套治理反而會出事，關鍵是把「agent 能做什麼動作」和「能碰什麼資料、什麼系統」分成兩層授權。治理的重點是角色、資料權限與責任歸屬，中控台是必要條件不是充分條件。</p>

<p><strong>為什麼那麼多企業 agent 專案最後被砍掉？</strong><br>因為卡點多半在落地設計，不在模型能力。Gartner 預測<a href="https://www.forbes.com/sites/robertszczerba/2026/07/07/why-40-of-agentic-ai-projects-may-be-canceled-by-2027/">到 2027 年底超過四成 agentic AI 專案會被取消</a>，主因是成本失控、商業價值講不清、風險控制不到位。分析師也指出，把編排器、治理層和多個 agent 疊上去，<a href="https://www.cio.com/article/4132031/why-most-agentic-ai-projects-stall-before-they-scale.html">成本會很快膨脹</a>，這筆帳要在導入前先算清楚。</p>

<p><strong>台灣企業導入多代理 agent 前，第一步該做什麼？</strong><br>先定義問題再選工具，順序不能倒。先想清楚要編排哪些流程、哪個 agent 該有權碰哪些資料、出錯誰負責，再去挑中控與編排平台，最後才比較選哪家。先被某家的單一編排層框住、再回頭硬套自己的流程，是選型最常見的失敗模式。</p>
