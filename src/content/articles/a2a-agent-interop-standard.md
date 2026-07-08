---
title: "繼 MCP 之後，agent 互通標準 A2A 衝上 v1.0、150 家組織採用：跨廠牌 agent 交棒進了生產環境"
slug: "a2a-agent-interop-standard"
description: "Agent2Agent（A2A）一年內從 Google 專案變成 Linux Foundation 治理的 v1.0 標準，150+ 組織採用，Azure、Bedrock、Google Cloud 都接，金融、保險、供應鏈、IT 進了生產。跨廠牌 agent 互通確實是真瓶頸，但有標準不等於協作問題解決了，真正難的是交棒時的責任歸屬。"
excerpt: "A2A 到 v1.0、150 家組織採用，agent 互通從 demo 走進生產。但別把『有標準』當成『協作問題解決了』：協定管得到怎麼講話，管不到講錯話誰負責。"
publishDate: "2026-08-05T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["A2A 協定", "AI agent", "互通標準", "MCP", "企業 AI"]
coverImage: "covers/a2a-agent-interop-standard.webp"
coverAlt: "象徵跨廠牌 AI agent 互相連線、交棒協作的抽象網路節點示意"
coverImageCredit: "Photo by Google DeepMind on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Agent2Agent（A2A）2026 年 4 月 9 日宣布突破 150 家組織採用、發布 v1.0，並落地 Azure AI Foundry、Amazon Bedrock AgentCore、Google Cloud，金融、保險、供應鏈、IT 維運都有生產部署。"
  - "v1.0 最關鍵的不是傳輸更快，是簽章 Agent Card：加密驗證『對面這個 agent 真的是它宣稱的網域發的』，這是跨廠牌交棒能進生產的信任前提。"
  - "有標準不等於協作問題解決。協定管得到 agent 怎麼講話，管不到 agent A 委派 agent B、B 出錯時損失算誰的；責任歸屬才是台灣系統整合商真正要接的活。"
references:
  - title: "A2A Protocol Surpasses 150 Organizations, Lands in Major Cloud Platforms, and Sees Enterprise Production Use in First Year"
    url: "https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year"
    publisher: "Linux Foundation"
  - title: "Linux Foundation Launches the Agent2Agent Protocol Project to Enable Secure, Intelligent Communication Between AI Agents"
    url: "https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents"
    publisher: "Linux Foundation"
  - title: "Agent2Agent (A2A) 開放協定原始碼專案"
    url: "https://github.com/a2aproject/A2A"
    publisher: "GitHub / A2A Project"
  - title: "Google A2A Protocol: How Agent-to-Agent Coordination Works"
    url: "https://atlan.com/know/google-a2a-protocol/"
    publisher: "Atlan"
  - title: "Announcing Agent Payments Protocol (AP2)"
    url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol"
    publisher: "Google Cloud"
originalContribution: "本文把 A2A v1.0 的技術更新逐項對照『解對題 vs 解錯題』框架：指出互通格式是真瓶頸、簽章 Agent Card 是真進展，但跨廠牌交棒的責任歸屬協定管不到，並以此推導台灣系統整合商該卡的是『受信任 agent 節點』而非趕接 SDK。"
---

跨廠牌 AI agent 互相講話這件事，這一年真的從投影片走進了生產環境。2026 年 4 月 9 日，Google 開源、後來交給 Linux Foundation 治理的 Agent2Agent（A2A）協定[宣布突破 150 家組織採用、同步發布 v1.0](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year)，Azure AI Foundry、Amazon Bedrock AgentCore、Google Cloud 都把它接進去，金融、保險、供應鏈、IT 維運已經有真的在跑的部署。這是 agent 互通進入生產的訊號，值得記一筆。

但這裡要先踩一個剎車：有一個標準，不等於協作這件事就解決了。協定管得到 agent 之間「怎麼講話」，管不到「講錯話誰負責」。後面這一關，才是真正難的。

<img src="/images/a2a-agent-interop-standard-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="跨廠牌 AI agent 互相發現與協作的網路連線示意">

先把名詞跟前面那條線接起來。我之前寫過[MCP 成 AI agent 事實標準、Anthropic 把它捐出去](/articles/mcp-de-facto-standard-agent-governance/)，MCP 解的是「一個 agent 怎麼連到外部工具跟資料」，是垂直方向的一條線。A2A 解的是另一個方向：[一個 agent 怎麼發現、呼叫、把工作交給另一個 agent](https://atlan.com/know/google-a2a-protocol/)，是水平方向的協調層。兩者不是打對台，是分工。用最白話的講法：MCP 回答「這個 agent 能碰到哪些工具跟資料」，A2A 回答「這件事該派哪個 agent 做、彼此怎麼交棒」。實際跑起來常是先用 A2A 把任務路由到對的專門 agent，那個 agent 再用 MCP 去撈自己要的資料。

<img src="/images/a2a-agent-interop-standard-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="MCP 垂直接工具、A2A 水平接 agent 的分層架構示意" >

時間軸拉出來看會更清楚這一年跑多快。A2A 是 Google 在 2025 年 4 月開源，兩個月後的[6 月 23 日就交給 Linux Foundation 做中立治理](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)，避免變成單一廠商的私有規格。到 2026 年 4 月，採用組織從一開始的五十幾家長到 150 家以上，名單裡有 AWS、Cisco、IBM、微軟、Salesforce、SAP、ServiceNow。開源碼在 GitHub 上，官方把 A2A 定義成[「讓不透明的 agent 應用之間能溝通與互通」的協定](https://github.com/a2aproject/A2A)，白話說就是：就算你不知道對面那個 agent 內部長怎樣，你們也能交棒。

<img src="/images/a2a-agent-interop-standard-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="加密簽章驗證數位身分、象徵簽章 Agent Card 的資安示意">

那 v1.0 到底加了什麼？官方列的是簽章 Agent Card、企業級多租戶、多協定綁定這幾樣。多數報導會抓「支援 JSON-RPC 跟 gRPC」這種傳輸細節，但真正讓它跨得過生產門檻的，是簽章 Agent Card。Agent Card 本來是一份放在 `/.well-known/agent-card.json` 的公開檔案，寫著一個 agent 的能力、認證方式跟連線位置，讓別人能發現它。v1.0 給它加了加密簽章，收到的一方可以驗證「這張卡真的是那個網域的主人發的」，不是別人冒名做的。這件事聽起來小，卻是信任邊界的地基：跨廠牌交棒的前提，是你先能確定對面到底是誰。傳輸協定快不快是次要的，能不能驗身分才是能不能上線的分水嶺。

<img src="/images/a2a-agent-interop-standard-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="商業合約簽署與握手，象徵跨廠牌 agent 交棒的責任歸屬">

問題來了。互通不通，確實是真瓶頸，跨廠牌 agent 各說各話、每接一家就要重寫一次介接，這個痛是真的，A2A 把它解掉是實打實的進展。但標準解掉的是「怎麼講話」，沒解掉「講錯話誰負責」。agent A 把一筆採購委派給廠牌不同的 agent B，B 判斷錯、下錯單、造成損失，這筆帳算誰的？是 A 的營運方、B 的供應商、還是寫規則的整合商？協定本身回答不了這題，因為責任歸屬是制度問題，不是傳輸問題。

值得看的是 Google 補這一塊的方向。他們把付款這一段抽出來做成 A2A 的正式延伸 [AP2（Agent Payments Protocol）](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)，用加密簽章的「授權書」（Mandates）串起一條可稽核的證據鏈，從使用者意圖、購物車確認到付款執行，明確要回答授權、真實性、問責這三個問題。方向對，但它只補了付款這一段。其他場景的責任歸屬，還是得靠導入方自己在流程裡界定清楚。可信度從來不是靠協定版本號長出來的，是靠問題定義、角色設計、驗證機制、責任歸屬這幾件事一個一個扣起來，缺一個就在那裡出事。

<img src="/images/a2a-agent-interop-standard-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程師與軟體開發團隊，象徵台灣系統整合商的切入點">

那台灣該從這條新聞讀出什麼？

對台灣的軟體公司跟系統整合商，開放互通標準先是好消息。Linux Foundation 講明這套協定的目的之一就是[降低廠商鎖定](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)，你不必被單一雲平台綁死，接哪家的 agent 都照同一套規矩。但這裡有個容易看歪的地方：以為導入 A2A 就是「趕快接個 SDK、讓我們的 agent 也能上架」。互通只是入場券。真正落在整合方頭上的，是簽章身分怎麼管、交棒出錯時的稽核紀錄夠不夠、跨廠牌的責任界線寫不寫得清楚。這些是資安與制度的活，不是介接的活。

<img src="/images/a2a-agent-interop-standard-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心與雲端基礎建設，象徵 agent 協作進入生產的長線">

這一題對我不算陌生。跨系統整合本來就是最難的那一類問題，難不在技術，難在誰負責、資料誰能碰、出事誰認帳。醫療界喊互通標準喊了幾十年，HL7、FHIR 規格早就有，但「標準存在」跟「醫院之間真的能安全交換病歷」中間，隔的一直是授權、責任跟信任，不是格式。A2A 是 agent 版的同一個夢，會踩到的也是同一批坑。台灣要卡的位置，不是最快接上 SDK 的那個，而是能當「受信任的 agent 節點」的那個：把身分驗證、稽核軌跡、責任界定的落地流程先長出來，讓別人敢把工作交給你的 agent。

v1.0 加上 150 家組織是真的里程碑，agent 互通進生產也是真的。但下一關不會是協定的版本號，而是誰能在跨廠牌交棒時把責任講清楚。看懂這關卡在哪，比記住 150 這個數字重要。

## 常見問題

<p><strong>A2A 跟 MCP 是競爭關係嗎？我該選哪一個？</strong><br>不是競爭，是分工，多數情況兩個一起用。<a href="https://atlan.com/know/google-a2a-protocol/">MCP 是垂直協定，管一個 agent 怎麼連到外部工具跟資料</a>；A2A 是水平協定，管一個 agent 怎麼把工作交給另一個 agent。實務上常是 A2A 先把任務派到對的 agent，那個 agent 再用 MCP 去撈資料，不需要二選一。</p>

<p><strong>A2A v1.0 最重要的改動是什麼？</strong><br>簽章 Agent Card。<a href="https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year">v1.0 給描述 agent 能力的 Agent Card 加了加密簽章</a>，收到的一方能驗證這張卡真的是那個網域發的，不是冒名的。跨廠牌交棒要進生產，先決條件就是能確認對面是誰，這比支援哪種傳輸協定更關鍵。</p>

<p><strong>台灣企業想導入跨廠牌 agent，第一步該先想什麼？</strong><br>先想責任歸屬跟資安，不是先接 SDK。互通標準讓不同廠牌的 agent 能溝通，但 agent A 委派 agent B、B 出錯時誰負責，協定管不到。導入方要自己把身分驗證、稽核紀錄、跨廠牌責任界線在流程裡定義清楚，這才是真正的工。</p>

<p><strong>A2A 能處理 AI agent 之間的付款嗎？</strong><br>能，但要靠延伸。Google 把付款做成 A2A 的正式延伸 <a href="https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol">AP2（Agent Payments Protocol）</a>，用加密簽章的授權書串起一條從使用者意圖到付款執行的可稽核證據鏈，處理授權、真實性與問責。它只覆蓋付款這一段，其他場景的責任歸屬仍要另外設計。</p>
