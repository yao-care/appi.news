---
title: "KPMG 把 AI agent 推給 27.6 萬員工：全員部署之後，治理才是真考題"
slug: "kpmg-agent-365-workforce-governance"
description: "KPMG 6/9 宣布把 Microsoft 365 Copilot 與 Agent 365 鋪給全球 27.6 萬名員工。真正難的不是導入，是 27 萬人同時用 agent 時，權限、稽核與責任歸屬要怎麼一次到位。"
excerpt: "KPMG 6/9 把 Copilot 與 Agent 365 推給全球 27.6 萬名員工。導入不難，難在 27 萬人同時用 agent，權限、稽核與責任歸屬要一次到位。治理不是附加題，是這場部署的真正考題。"
publishDate: "2026-06-23T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["KPMG Agent 365", "Microsoft Agent 365", "企業 AI agent 治理", "大規模 agent 部署", "agent 權限與責任歸屬"]
coverImage: "covers/kpmg-agent-365-workforce-governance.webp"
coverAlt: "KPMG 與微軟把 AI agent 治理層 Agent 365 與 Copilot 推給全球 27.6 萬名員工的大規模部署示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "KPMG 6/9 宣布與微軟擴大合作，把 Microsoft 365 Copilot 鋪給全球逾 27.6 萬名員工，並導入 Agent 365 來部署、監控與保護組織內的 AI agent。"
  - "Agent 365 被微軟定位成 AI agent 的「控制層」，靠註冊表、唯一 agent ID 與存取控制，把 agent 當成像員工一樣的治理對象來管。"
  - "真正難的不是導入，是 27 萬人同時用 agent 時權限、稽核與責任歸屬要一次到位；治理不是部署完再補的附加題，是這場部署本身的考題。"
references:
  - title: "KPMG and Microsoft scale trusted, enterprise AI agents globally through deployment of Agent 365 and Copilot"
    url: "https://news.microsoft.com/source/2026/06/09/kpmg-and-microsoft-scale-trusted-enterprise-ai-agents-globally-through-deployment-of-agent-365-and-copilot/"
    publisher: "Microsoft Source"
    note: "6/9 宣布、276,000 名員工、Agent 365 manage/monitor/secure agents、Trusted AI framework、Lisa Heneghan 與 Deb Cupp 引述"
  - title: "Microsoft Agent 365: the control plane for AI agents"
    url: "https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/"
    publisher: "Microsoft 365 Blog"
    note: "Agent 365 為 control plane、五大能力（Registry/Access Control/Visualization/Interoperability/Security）、唯一 agent ID、像管理員工一樣管理 agent、Entra agent ID"
  - title: "KPMG and Microsoft Scale AI Agents to 276,000 Staff"
    url: "https://enterprisedna.co/resources/news/kpmg-microsoft-agent-365-enterprise-ai-agents-2026/"
    publisher: "Enterprise DNA"
    note: "Agent 365 為 governance and orchestration layer、'governance is the feature, not an afterthought'、pilot 到 production 卡關、'who is accountable when an agent makes a mistake'"
---

<p>KPMG 在 6 月 9 日宣布跟微軟擴大合作，<a href="https://news.microsoft.com/source/2026/06/09/kpmg-and-microsoft-scale-trusted-enterprise-ai-agents-globally-through-deployment-of-agent-365-and-copilot/" target="_blank" rel="noopener">把 Microsoft 365 Copilot 鋪給全球超過 27.6 萬名員工，同時導入 Microsoft Agent 365 來部署、監控與保護組織內的 AI agent</a>。數字很嚇人，但我關心的不是 27 萬這個量級有多大。一家專業服務公司願意把 agent 當全員工具發下去，這件事真正難的從來不是導入。難的是 27 萬人同時開始用 agent 的那一刻，誰能碰哪些資料、每一步留不留得下稽核軌跡、出事了算誰的，這三件事要怎麼一次到位。</p>

<h2>KPMG 這次到底鋪了什麼</h2>

<p>先把東西分清楚。這次發的其實是兩層。一層是 Copilot，給員工日常用的助理；<a href="https://news.microsoft.com/source/2026/06/09/kpmg-and-microsoft-scale-trusted-enterprise-ai-agents-globally-through-deployment-of-agent-365-and-copilot/" target="_blank" rel="noopener">KPMG 把它擴大到全球 27.6 萬名專業人員，距離初次導入約兩年</a>。另一層才是重點：Agent 365。它不是聊天機器人，是<a href="https://enterprisedna.co/resources/news/kpmg-microsoft-agent-365-enterprise-ai-agents-2026/" target="_blank" rel="noopener">一個讓組織去部署、監控、管理跨多套系統運作的 agent 的治理與協調層</a>，KPMG 要用它來強化自家的 Trusted AI 框架。</p>

<p>微軟把這次合作講成一個轉折。負責商務的執行副總 Deb Cupp 的說法是，這是<a href="https://news.microsoft.com/source/2026/06/09/kpmg-and-microsoft-scale-trusted-enterprise-ai-agents-globally-through-deployment-of-agent-365-and-copilot/" target="_blank" rel="noopener">「從實驗走向企業規模影響」的一步</a>。這句話點到了今年六月企業端的共同動作：從少數人試玩的試點，轉成真的在正式系統上跑、處理真實工作流的 production 部署。Agent 365 賣的不是哪個模型更強，是這套東西能不能在公司規模上被管住。</p>

<img src="/images/kpmg-agent-365-workforce-governance-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="KPMG 與微軟把 Microsoft 365 Copilot 與 Agent 365 部署到全球 27.6 萬名員工">

<h2>27 萬人同時用，規模本身就是新題目</h2>

<p>很多人看到這種新聞，第一個反應是「導入了，所以解決了」。這個方向要先踩一個剎車。導入一個 agent 跟讓 27 萬人同時用 agent，根本是兩種難度。Enterprise DNA 講得直接：<a href="https://enterprisedna.co/resources/news/kpmg-microsoft-agent-365-enterprise-ai-agents-2026/" target="_blank" rel="noopener">真正讓多數企業卡住的，是從試點跳到正式環境那一步，因為 agent 開始在真實系統上跑、處理真實工作流、扛真實的責任</a>。</p>

<p>規模放大的不是功能，是治理的破口面積。一個 agent 越權，影響有限；27 萬個入口同時開著，每一個都可能連到客戶資料、財務系統、稽核底稿，這時候沒被回頭檢查的權限預設值、沒留下軌跡的操作、講不清楚歸屬的決策，都會以員工人數的規模長出來。我先前在談 MCP 成為事實標準時就講過這條線，<a href="/articles/mcp-de-facto-standard-agent-governance/">agent 接出去的每一個對象，都該被當成一個獨立的權限治理對象來盤</a>。KPMG 這次只是把同一個問題乘上 27 萬。</p>

<img src="/images/kpmg-agent-365-workforce-governance-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="27 萬人同時使用 AI agent，權限、稽核與責任歸屬要一次到位的治理挑戰">

<h2>治理是內建功能，不是部署完再補的附加題</h2>

<p>這正是 Agent 365 把自己賣點押在治理上的原因。微軟直接<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/" target="_blank" rel="noopener">把它定位成「AI agent 的控制層」，拆成五個能力：註冊表、存取控制、可視化、互通與資安</a>。其中兩個最關鍵：註冊表是<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/" target="_blank" rel="noopener">一份「唯一事實來源」，目的是防止 agent 數量失控蔓延</a>；存取控制則是<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/" target="_blank" rel="noopener">要求組織內每個 agent 都有唯一的 agent ID，好把它的存取限制在真正需要的資源上</a>。微軟把這套哲學講得很白：<a href="https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/" target="_blank" rel="noopener">用管理員工的同一套基礎設施跟防護來管理 agent</a>。</p>

<p>Enterprise DNA 的一句評語我很認同：<a href="https://enterprisedna.co/resources/news/kpmg-microsoft-agent-365-enterprise-ai-agents-2026/" target="_blank" rel="noopener">在這套產品裡，治理是功能本身，不是事後才補的東西</a>。這跟我一直在講的立場是同一條線：可信度靠落地流程，不靠模型多聰明。我在<a href="/articles/llm-healthcare-promise-limits/">談 LLM 在醫療能不能落地時</a>就是這麼說的。把治理留到全員都開好之後再回頭補，順序就倒了，而順序倒過來是最常見的失敗模式，這點我在<a href="/articles/what-is-claw-llm-client-tool/">談怎麼選工具</a>時也提過。</p>

<img src="/images/kpmg-agent-365-workforce-governance-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="Agent 365 作為 AI agent 的控制層，用註冊表與唯一 agent ID 把 agent 治理收住">

<h2>把每個 agent 當權限對象：責任歸屬才是最硬的一關</h2>

<p>權限跟稽核還算有工具可接，責任歸屬是最硬的。Enterprise DNA 把企業現在該問自己的問題講得很準：<a href="https://enterprisedna.co/resources/news/kpmg-microsoft-agent-365-enterprise-ai-agents-2026/" target="_blank" rel="noopener">你的治理模式長什麼樣，以及當一個 agent 出錯時，到底誰要負責</a>。這跟我先前在談台灣《人工智慧基本法》時強調的問責原則是同一件事，<a href="/articles/ai-basic-law-risk-classification-enterprise-checklist/">法令到位不等於意識到位，企業要先建立治理意識，把盤點變成例行事，而不是等規則或工具補上才開始管</a>。</p>

<p>KPMG 的 Global Chief Digital Officer Lisa Heneghan 自己也把話講在這上面：<a href="https://news.microsoft.com/source/2026/06/09/kpmg-and-microsoft-scale-trusted-enterprise-ai-agents-globally-through-deployment-of-agent-365-and-copilot/" target="_blank" rel="noopener">這需要在治理、可視性與問責上有扎實的基礎</a>。具體到能動手的，我會先盤三格：一是 agent 註冊表有沒有真的把所有在跑的 agent 列全，沒登記的就是看不見的破口；二是每個 agent 的存取範圍是不是收到「只給它需要的」，而不是沿用某個人的全部權限；三是哪些 agent 從問答升級成會自動執行的工作流，這類才是真的要被當成獨立角色、講清楚歸屬的對象。三格先想清楚，再來談全員自助。</p>

<img src="/images/kpmg-agent-365-workforce-governance-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="像管理員工一樣管理 AI agent，給每個 agent 唯一身分並限制資料存取範圍">

<h2>我的觀察：醫療 AI 的成功關鍵，是治理模式不是技術多寡</h2>

<p>看 KPMG 這場部署，我想到的是醫療這端。醫療 AI 的成功關鍵，不在於擁有多少技術，而在於建立正確的治理模式。KPMG 這次的實踐其實給了一個很值得借鏡的樣板：讓最了解問題的人主導 AI，讓最了解風險的人建立護欄，在完善的資料治理基礎上推動創新。</p>

<p>這三件事看起來簡單，做起來是醫療場景最容易卡的地方。最懂臨床問題的是醫師，但工具常常是技術端決定的；最懂風險的是法遵與資安，但護欄常常等到出事才補。把主導權跟護欄各自交到對的人手上，再墊在扎實的資料治理上面，AI 才有機會從一個被導入的工具，變成組織真正長出來的能力。我期待更多醫療夥伴一起往這個方向走，把 AI 從工具導入提升為組織能力，創造兼具安全性、可信度與實際價值的智慧醫療未來。</p>

<img src="/images/kpmg-agent-365-workforce-governance-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療 AI 的成功關鍵是治理模式，讓最了解問題的人主導、最了解風險的人建護欄">

<h2>常見問題</h2>

<p><strong>Agent 365 跟 Copilot 差在哪？</strong><br>Copilot 是員工日常在用的助理，你問它答、幫你寫東西。Agent 365 不是助理，是管理 agent 的控制層，負責登記、給身分、限制存取、監控與保護那些會自己動作的 agent。一個是被管的工具，一個是管工具的那層。</p>

<p><strong>把 Copilot 跟 Agent 365 鋪給 27.6 萬人，最大的風險是什麼？</strong><br>不是員工會不會用，是動得到資料的入口一下子變成 27 萬個。當每個人都能透過 agent 連到正式系統，碰得到哪些資料、操作有沒有留軌跡、出錯算誰的，這三件事要是沒在控制層先收好，破口會以員工人數的規模長出來。</p>

<p><strong>導入了 Agent 365 這種治理層，是不是就安全了？</strong><br>它把治理機制接上了，不代表你不用管。控制層給的是工具：註冊表、唯一 agent ID、存取控制。真正決定安不安全的是你怎麼設，預設權限開多大、哪些 agent 被允許自動執行、責任歸屬講不講得清楚。工具備齊，判斷還是要人做。</p>

<h2>結語</h2>

<p>27.6 萬這個數字會被當成新聞重點，但它其實只是把一個老問題放到了最大。agent 能不能進公司，從來不是能力問題；能不能在每個人都用的規模下，還守得住誰碰得到什麼、誰要負責，才是。KPMG 願意一開始就把 Agent 365 這層治理綁進去，方向是對的。但發表會證明不了治理在 27 萬人的真實組織裡撐不撐得住，那要靠跑過一輪的人把經驗講出來。先想清楚權限、稽核跟歸屬，再談全員部署，這個順序別倒過來。</p>
