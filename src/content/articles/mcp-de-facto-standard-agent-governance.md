---
title: "MCP 成 AI agent 事實標準後，Anthropic 把它捐了：企業現在要治理的是什麼"
slug: "mcp-de-facto-standard-agent-governance"
description: "MCP 月下載破 9,700 萬、被捐給 Linux Foundation 旗下的 Agentic AI Foundation 成為廠商中立標準。標準底定後，企業要面對的不再是『選哪個協定』，而是 agent 接外部工具的治理與權限邊界。"
excerpt: "MCP 月下載破 9,700 萬、被捐給 Linux Foundation 旗下的 Agentic AI Foundation 成為廠商中立標準。標準底定後，企業要面對的不再是『選哪個協定』，而是 agent 接外部工具的治理與權限邊界。"
publishDate: "2026-06-17T06:02:25.023Z"
category: "tech"
subcategory: "digital-tools"
tags: ["MCP", "Model Context Protocol", "AI agent 治理", "Agentic AI Foundation", "MCP server 資安"]
coverImage: "covers/mcp-de-facto-standard-agent-governance.webp"
coverAlt: "AI agent 透過統一標準協定連接企業內部多個系統與工具，象徵 MCP 成為事實標準後的治理課題"
author: "lightman"
status: "published"
sourceType: "editorial"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "MCP 月下載破 9,700 萬、較發布初期成長約 970 倍，2025 年底被 Anthropic 捐給 Linux Foundation 旗下的 Agentic AI Foundation，成為廠商中立標準。"
  - "標準底定降低整合成本，但 NIST 已啟動 AI agent 標準、把 agent 串接外部工具的攻擊面攤開來談；每個 MCP server 都是一個新的權限治理對象。"
  - "這對上台灣新修的《人工智慧基本法》：法令到位不等於意識到位，企業和政府若沒先建立治理意識，再多框架也接不住這波浪潮。"
references:
  - title: "Donating the Model Context Protocol and establishing the Agentic AI Foundation"
    url: "https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation"
    publisher: "Anthropic"
    note: "2025/12/9 宣布捐 MCP 給 Linux Foundation 旗下 AAIF、97M+ 月下載、逾萬個公開 server"
  - title: "Linux Foundation Announces the Formation of the Agentic AI Foundation (AAIF)"
    url: "https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation"
    publisher: "The Linux Foundation"
    note: "AAIF 成立、MCP 為創始專案、廠商中立治理"
  - title: "MCP in 2026: 97 Million Downloads and Growing Crypto Infrastructure"
    url: "https://news.bitcoin.com/mcp-in-2026-97-million-downloads-and-growing-crypto-infrastructure-from-bitgo-to-coingecko/"
    publisher: "Bitcoin.com News"
    note: "97M 月下載、發布初期約 10 萬、約 970 倍成長"
  - title: "MCP Adoption Statistics 2026"
    url: "https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol"
    publisher: "Digital Applied"
    note: "官方登錄 9,652 個公開 server（2026/5/24）、四大廠原生支援"
  - title: "The future of MCP: 2026 roadmap, enterprise adoption, and what comes next"
    url: "https://toloka.ai/blog/the-future-of-mcp-enterprise-adoption/"
    publisher: "Toloka AI"
    note: "MCP 已是 AI agent 整合的事實標準、97M 月下載、逾 9,400 公開 server、四大廠原生支援"
  - title: "Use the Claude Agent SDK with your Claude plan"
    url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    publisher: "Anthropic / Claude Help Center"
    note: "原訂 6/15 改抽獨立月額度，官方公告已喊停"
  - title: "Announcing the AI Agent Standards Initiative for Interoperable and Secure Innovation"
    url: "https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure"
    publisher: "NIST"
    note: "CAISI 於 2026/2/17 啟動，焦點為 agent 認證、授權、互通與安全"
  - title: "Everything you should know about NIST's AI Agent Standards Initiative"
    url: "https://workos.com/blog/nist-ai-agent-standards-initiative-explained"
    publisher: "WorkOS"
    note: "agent 身分與授權缺口、憑證浮濫、prompt injection 視為架構控制問題"
  - title: "Top 8 MCP security risks enterprises can't ignore"
    url: "https://www.surepath.ai/blog/8-mcp-security-risks-every-enterprise-needs-to-know"
    publisher: "SurePath AI"
    note: "過度授權、憑證浮濫、無驗證 server、OAuth token 單點失效"
---

<p>過去一年，要讓 AI agent 接上你公司的資料庫、CRM 或內部 API，最大的麻煩從來不是模型不夠聰明，是每接一個系統就要再寫一套黏合層。MCP（Model Context Protocol，模型脈絡協定）把這件事標準化，然後它紅到一個地步：Anthropic 在 2025 年底把它<a href="https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation" target="_blank" rel="noopener">捐出去了</a>。標準底定之後，企業要煩惱的問題會換一個。不再是「該選哪個協定」，而是「agent 連出去的每一個工具，到底誰在管」。</p>

<h2>標準怎麼底定的：9,700 萬次下載，然後被捐給中立基金會</h2>

<p>先把規模講清楚。<a href="https://news.bitcoin.com/mcp-in-2026-97-million-downloads-and-growing-crypto-infrastructure-from-bitgo-to-coingecko/" target="_blank" rel="noopener">MCP 的 Python 與 TypeScript SDK 合計月下載量已達 9,700 萬，相較發布初期的約 10 萬次，大約成長了 970 倍</a>。公開的 MCP server <a href="https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol" target="_blank" rel="noopener">在官方登錄就有 9,600 多個（2026 年 5 月），Claude、ChatGPT、Gemini、Copilot 四大廠都原生支援</a>。一個協定能不能變標準，不是看技術多漂亮，是看大家願不願意一起用，這個數字已經把答案寫死了。</p>

<p>真正讓它從「Anthropic 的協定」升格成「產業的協定」的，是治理權的轉移。<a href="https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation" target="_blank" rel="noopener">2025 年 12 月 9 日，Anthropic 把 MCP 捐給 Linux Foundation 旗下新成立的 Agentic AI Foundation，並由 Anthropic、Block、OpenAI 共同創立</a>。<a href="https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation" target="_blank" rel="noopener">Linux Foundation 提供的是中立的家，MCP 成為基金會的創始專案，而基金會不主導它的技術方向</a>。捐出去這個動作的意思是：沒有任何一家公司能單方面決定這個標準長怎樣。對企業是好消息，整合成本會掉下來。但好消息背後的帳，要算在別的地方。</p>

<img src="/images/mcp-de-facto-standard-agent-governance-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="MCP 月下載破 9,700 萬、被捐給 Linux Foundation 旗下中立基金會成為標準">

<h2>比下載量更值得看的，是 agent 開始被當成「要單獨計費的東西」</h2>

<p>有個容易被當成單純漲價新聞、其實藏著訊號的改動。Anthropic <a href="https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan" target="_blank" rel="noopener">原本宣布從 2026 年 6 月 15 日起，透過 Claude Agent SDK 的程式化呼叫不再算進訂閱方案的額度，改扣一筆只給 agent 用、隨帳單週期刷新的獨立月額度，後來在官方公告裡又把這項變更喊停（目前維持原狀）</a>。喊不喊停是商業決策，但「把人在用和 agent 自己在跑切成兩個額度池」這個念頭本身，說明了一件事：廠商已經把這兩種使用當成兩種不同的東西在管。</p>

<p>把這條跟標準化擺在一起看，方向就清楚了。MCP 把 agent 連外部工具變得便宜又一致，agent 就會從「模型附帶的一個功能」變成一個會自己去連一大堆系統的獨立行為者。它有自己的憑證、自己的權限、自己的行為軌跡。當一個東西開始被單獨計費，通常也是它該被單獨治理的時候。</p>

<img src="/images/mcp-de-facto-standard-agent-governance-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI agent 程式化執行與人工互動被當成兩種不同的東西分開計費與管理">

<h2>標準化的另一面：NIST 也動了，攻擊面跟著變大</h2>

<p>標準化是一把雙面刃。一面是 <a href="https://toloka.ai/blog/the-future-of-mcp-enterprise-adoption/" target="_blank" rel="noopener">MCP 成為 AI agent 整合的事實標準，企業不必再為每一組「模型對系統」各寫一套客製整合</a>，整合成本確實降了。另一面是，連標準機構都覺得這件事危險到要先立規矩。<a href="https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure" target="_blank" rel="noopener">美國 NIST 旗下的 CAISI 在 2026 年 2 月 17 日啟動「AI Agent Standards Initiative」，三大支柱之一就是 agent 的安全與身分研究，要解決 agent 如何認證、授權、安全地代表使用者行動</a>。</p>

<p>為什麼要特別立這個？因為攻擊面變了。<a href="https://workos.com/blog/nist-ai-agent-standards-initiative-explained" target="_blank" rel="noopener">WorkOS 整理 NIST 的方向時點出，現行系統靠共用服務帳號和 API key，對能自主行動的 agent 根本不夠，企業會遇到跟傳統 IT 一樣的憑證浮濫和存取控制問題，但這次是以機器的速度發生；NIST 甚至把 prompt injection 從「模型品質問題」重新定義成「要靠架構控制去防的攻擊」</a>。落到 MCP 上更具體：<a href="https://www.surepath.ai/blog/8-mcp-security-risks-every-enterprise-needs-to-know" target="_blank" rel="noopener">過度授權的 agent、沒有任何身分驗證就在跑的 server、橫跨多個未受治理 server 的憑證浮濫，都是常見風險，而一台 MCP server 往往存著多個服務的 OAuth token，被攻破就等於一次拿到所有連接服務的存取權</a>。裝得越多，門就開得越多。</p>

<img src="/images/mcp-de-facto-standard-agent-governance-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="標準化降低整合成本，但 NIST 啟動 AI agent 標準、串接工具擴大資安攻擊面">

<h2>真正要治理的：每個 MCP server 都是一個新的權限對象</h2>

<p>所以企業現在該換的問題是這個：別再問「MCP 強不強、要不要上」，這題標準已經幫你回答了。要問的是「我這台 agent 接出去的每一個 server，我治理了嗎」。這延續我先前的立場，<a href="/articles/llm-healthcare-promise-limits/">落地設計的品質遠比工具本身的強弱更關鍵</a>，工具再標準，沒有把問題定義清楚、把角色和驗證機制設計好，一樣會在那裡破口。順序也不能倒，<a href="/articles/what-is-claw-llm-client-tool/">先定義使用情境、再對前提，最後才談具體工具</a>，把 server 裝了就放、等出事再補，是最常見的失敗模式。</p>

<p>把「治理」拆成明天就能做的事，大致是這幾條。第一，把每一台 MCP server 當成一個權限主體列冊，記清楚它能讀什麼、能寫什麼。第二，用誰的憑證跑，能不能改成最小權限、能不能收斂成集中管理，而不是每台各自塞一把萬能鑰匙。第三，破壞性動作要不要卡一道人工確認。第四，留得下審計紀錄，出事時查得到是哪個 agent、用哪台 server 做了什麼。這幾條沒有一條是 MCP 標準會幫你決定的，它只統一了「怎麼接」，沒有統一「接出去之後誰有鑰匙」。</p>

<img src="/images/mcp-de-facto-standard-agent-governance-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="把每個 MCP server 當成新的權限治理對象，盤點它能讀寫什麼、用誰的憑證、誰負責">

<h2>台灣的考題：法令到位了，意識到位了嗎</h2>

<p>這套治理課題，剛好對上台灣新修的 AI 法令。<a href="/articles/companion-robots-ai-basic-law-elderly-care/">《人工智慧基本法》已於民國 114 年 12 月 23 日三讀通過</a>，談的問責、資料治理、隱私保護，正好是 agent 串接外部工具時最容易破口的幾個點。但法條寫得再完整，都只是地基。真正的問題是：不論企業還是政府機構，如果都還沒建立起足夠的意識，又該怎麼面對這一波浪潮？</p>

<p>這句問話不是修辭，是現況。意識不到位的時候，框架會變成兩種空轉：一種是把「有法、有標準」讀成「裝了就安全」，於是把一堆 MCP server 接進核心系統卻沒人盤點；另一種是反過來，因為看不懂就整批禁掉，把該用的工具也擋在門外。兩種都是因為沒先想清楚「我家的 agent 到底連去哪、出錯誰負責」。法令給的是要回答的題目，答案還是得每個組織自己盤點自己的業務才寫得出來。標準和法規都會晚到，agent 接出去的速度不會等，現在就把治理意識建起來的人，才有本錢在便利和紀律之間留一個踩得住的剎車。</p>

<img src="/images/mcp-de-facto-standard-agent-governance-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣人工智慧基本法上路，企業與政府機構面對 AI agent 新浪潮的治理意識">

<h2>常見問題</h2>

<p><strong>MCP 變成標準了，是不是接了就安全？</strong><br>不是。標準解決的是「怎麼接」這件事，讓整合不必每組重寫。但它不解決「接出去之後權限誰管」。現實裡仍有不少 MCP server 沒有任何身分驗證、agent 帶著過大的權限在跑，標準化反而讓這些破口一次擴散到更多地方。</p>

<p><strong>Claude Agent SDK 6 月 15 日不是改成扣獨立額度了嗎？</strong><br>那是原訂的計畫，後來 Anthropic 在官方公告裡把這項變更喊停，目前 Agent SDK 的用量仍照舊算進訂閱方案額度。值得留意的不是這次有沒有上，而是廠商已經把「人在用」和「agent 自己在跑」當成兩種要分開管的東西，這個方向短期內不會變。</p>

<p><strong>我們公司沒用 MCP，是不是就不用管？</strong><br>不見得。只要你有任何 AI 工具或 agent 去連內部系統，憑證、權限、審計這些治理問題就一樣存在。MCP 沒有製造新問題，它只是把這些問題變得顯眼、變得規模化。沒用 MCP 不代表沒有 agent 在你的系統裡開門。</p>

<h2>結語</h2>

<p>MCP 變成事實標準、又被捐成廠商中立的協定，是整個 agent 生態的好消息，整合成本掉下來，大家終於講同一種語言。但別把「有標準」讀成「不用管」。agent 接出去的每一個工具，都是一道新的門；標準幫你把門做成同一種規格，沒幫你決定誰拿鑰匙。那把鑰匙怎麼分、出事誰負責，是企業和政府現在就該建立的意識，不是等條文或等標準補上的那一天。</p>
