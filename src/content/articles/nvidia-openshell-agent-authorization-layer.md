---
title: "NVIDIA 把 agent 護欄做進開源平台：OpenShell 加 Nemotron 3，17 家軟體大廠一起賭『自我進化』的 agent"
slug: "nvidia-openshell-agent-authorization-layer"
description: "NVIDIA 這波開源 agent 平台的重點不是又一個 toolkit，而是把安全、網路、隱私護欄做成 runtime（OpenShell），配上為長任務調過的 Nemotron 3 Ultra。真正要看的是治理被往工具層下沉，而不是模型跑分。"
excerpt: "NVIDIA 把安全、網路、隱私護欄做成 runtime（OpenShell），配上為長任務調過的 Nemotron 3 Ultra。真正要看的是治理被往工具層下沉，不是模型跑分。"
publishDate: "2026-06-27T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["NVIDIA OpenShell", "Nemotron 3 Ultra", "AI agent 授權治理", "agent 護欄 runtime", "MCP 對照"]
coverImage: "covers/nvidia-openshell-agent-authorization-layer.webp"
coverAlt: "象徵 AI agent 安全護欄與授權治理被做進開源平台 runtime 層"
coverImageCredit: "Photo by Markus Winkler on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "NVIDIA 開源 agent 平台的重點不是功能多，而是把安全、網路、隱私護欄從提示詞改寫成 runtime 層強制執行的 OpenShell，治理被往工具層下沉。"
  - "搭配為長任務調過的 Nemotron 3 Ultra（開源 550B MoE、推理快 5 倍、agentic 任務成本降約 30%），Adobe、Salesforce、SAP、ServiceNow 等 17 家軟體大廠採用。"
  - "MCP 解決連接、OpenShell 解決授權，是兩種治理哲學；企業導入前要先問護欄的政策由誰定義、會不會被綁進另一套生態。"
references:
  - title: "NVIDIA Ignites the Next Industrial Revolution in Knowledge Work With Open Agent Development Platform"
    url: "https://nvidianews.nvidia.com/news/ai-agents"
    publisher: "NVIDIA Newsroom"
  - title: "Run Autonomous, Self-Evolving Agents More Safely with NVIDIA OpenShell"
    url: "https://developer.nvidia.com/blog/run-autonomous-self-evolving-agents-more-safely-with-nvidia-openshell/"
    publisher: "NVIDIA Technical Blog"
  - title: "NVIDIA Nemotron 3 Ultra Powers Faster, More Efficient Reasoning for Long-Running Agents"
    url: "https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/"
    publisher: "NVIDIA Technical Blog"
---

NVIDIA 這次端出來的東西，很容易被當成「又一個 agent 工具包」掃過去。但這次值得停一下。它在[一個開源 agent 開發平台](https://nvidianews.nvidia.com/news/ai-agents)裡放了兩塊真正的重點：一個叫 OpenShell 的 runtime，和一顆為長任務調過的開源模型 Nemotron 3 Ultra；採用名單上有 Adobe、Salesforce、SAP、ServiceNow、CrowdStrike、Red Hat 在內、NVIDIA 列出的 17 家軟體大廠。重點不在它多了哪些功能，而在它把安全、網路、隱私的護欄，從提示詞裡的叮嚀，改寫成 runtime 層強制執行的規則。真正要看的，是治理被往工具層下沉，不是模型又跑了幾分。

<img src="/images/nvidia-openshell-agent-authorization-layer-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="多家軟體大廠採用 NVIDIA 開源 agent 開發平台，象徵生態串接">

先看 OpenShell 到底管什麼。它是一個 Apache 2.0 的[開源 runtime](https://developer.nvidia.com/blog/run-autonomous-self-evolving-agents-more-safely-with-nvidia-openshell/)，做法不是靠提示詞請 agent「乖一點」，而是直接在 agent 跑的環境上設約束，agent 自己改不掉，就算被攻陷也一樣。官方文件寫得很白：它不依賴行為提示，而是對 agent 運行的環境施加限制。三件事撐起這套護欄：一個 sandbox 提供可程式化的系統與網路隔離、一個 policy engine 在檔案、網路、process 三層逐個動作判定（採 deny-by-default，預設先擋），還有一個 Privacy Router 把敏感脈絡留在本地的開源模型上、只有政策允許才送往 Claude、GPT 這類前沿模型。每個動作執行前先驗證權限、session 之間互相隔離、留下完整的 allow／deny 稽核軌跡。

<img src="/images/nvidia-openshell-agent-authorization-layer-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="沙箱隔離與政策引擎在環境層攔截 agent 動作的安全防護概念">

另一塊是模型。Nemotron 3 Ultra 是[為長鏈 agent 調過的開源模型](https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/)，別被「小模型」的印象帶偏，它其實是 550B 參數的 MoE 架構、每次推理約啟用 55B，權重、資料、訓練配方全開源。賣點全押在長任務：吞吐量比同級開源模型快 5 倍，在 SWE-bench 與 Terminal-Bench 上用更少的 token 把複雜 agent 任務的成本壓低約 30%。把護欄和這顆模型放一起看，NVIDIA 想講的不是「我的模型多聰明」，而是 agent 自己會連續動好幾十步的時候，旁邊有沒有東西踩得住剎車。

<img src="/images/nvidia-openshell-agent-authorization-layer-s3.webp" width="960" height="800" loading="lazy" decoding="async" alt="為長任務調過的開源推理模型在晶片上高效運算的概念圖">

這裡要對照前陣子的另一條線。[MCP 去年底被捐進基金會、成了廠商中立的事實標準](/articles/mcp-de-facto-standard-agent-governance/)，它解決的是「連接」：在它的世界觀，所有工具都能接。OpenShell 解決的是另一個問題，「授權」：在它的世界觀，先決定哪些工具能接。這其實是兩種完全不同的治理哲學。也許當 agent 時代真的來臨，最重要的基礎設施不是模型，而是授權系統。因為未來真正危險的不是 GPT 太聰明，而是它跑歪了之後，你怎麼即時把執行方向修回來。

<img src="/images/nvidia-openshell-agent-authorization-layer-s4.webp" width="960" height="1200" loading="lazy" decoding="async" alt="連接與授權兩種治理哲學的對照，以鑰匙與通道象徵">

那企業該採用嗎？這裡先踩一個剎車。把護欄做進平台是好事，但護欄做進「誰的」平台是另一回事。寫 MCP 那篇時就提過，每一台接進來的 server 都是一個新的權限治理對象；OpenShell 把權限收進 NVIDIA 自家的 runtime 與 Nemotron 生態，方便的代價，是你的授權邊界開始長在別人家的地基上。台灣團隊導入前，先問三件事，順序不能倒（這延續[先定義情境再選工具](/articles/what-is-claw-llm-client-tool/)的老立場）：第一，我要這個 agent 解的情境到底是什麼、它得碰到哪些系統和資料；第二，護欄的政策由誰定義、能不能匯出、哪天想換掉 runtime 會不會整套搬不走；第三，deny-by-default 的預設權限要開多大、哪些動作必須留人工確認。

<img src="/images/nvidia-openshell-agent-authorization-layer-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="企業導入 agent 前盤點權限與生態綁定取捨的清單概念圖">

可信度從來不是靠模型多聰明撐起來的，是靠[落地流程](/articles/llm-healthcare-promise-limits/)。OpenShell 把這件事講白了：它賭的不是 agent 會不會更強，而是 agent 自己亂動的時候，環境攔不攔得下來。對要導入的人來說，問題其實不是「要不要用 NVIDIA 的護欄」，而是這套護欄的鑰匙，最後握在誰手上。

<img src="/images/nvidia-openshell-agent-authorization-layer-s6.webp" width="960" height="641" loading="lazy" decoding="async" alt="授權護欄的控制鑰匙握在誰手上，象徵權限歸屬的關鍵問題">
