---
title: "C1 把 AI agent 收進跟人同一套政策引擎：方向對了，但別以為問題就解決了"
slug: "ai-agent-identity-policy-engine"
description: "C1（前身 ConductorOne）三月推出 AI Access Management，把 AI agent 當成跟員工一樣的『一等公民身分』，收進同一套身分政策引擎審核、授權、撤銷。把 agent 當身分管是對的方向，但 agent 不是人：數量、速度、生命週期、委派鏈都打破為人設計的 IAM。金管會已把代理式 AI 納入金融業指引研議，台灣企業該先做什麼。"
excerpt: "把 AI agent 收進跟人類同一套身分政策引擎，方向對。但真正的難點不在要不要給 agent 身分，而在 agent 根本不是人。把人的那套審核流程原封套上去，就是解錯題。"
publishDate: "2026-08-06T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["AI agent 身分", "身分治理", "非人類身分", "存取管理", "金管會 AI 監理", "資安"]
coverImage: "covers/ai-agent-identity-policy-engine.webp"
coverAlt: "AI agent 身分被收進與人類同一套政策引擎的資安治理示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "C1（前身 ConductorOne）3/19 推出 AI Access Management，把 AI agent 當成有自己憑證、政策、生命週期與擁有者的『一等公民身分』，跟真人放進同一套政策引擎審核、授權、撤銷；把 agent 當身分管是對的方向。"
  - "但 agent 不是人：Gartner 估 2028 年一家財星五百大企業會有超過 15 萬個 agent（2025 年還不到 15 個），生命週期可能短到幾秒、還有『代誰執行』的委派鏈，人用的年度權限複審在這裡完全失速。"
  - "台灣不是旁觀者：金管會 5/7 已把代理式 AI 納入金融業 AI 指引研議、強調問責留在人身上；企業明天就能做的是盤點非人類身分、每個 agent 指定 human owner、權限改成有時限能秒撤。"
references:
  - title: "C1 Announces AI Access Management to Secure Enterprise AI Adoption at Scale"
    url: "https://www.c1.ai/news/press-release/introducing-ai-access-management"
    publisher: "C1 (ConductorOne)"
  - title: "The C1 Platform: Access and governance for the agentic enterprise"
    url: "https://www.c1.ai/platform-overview"
    publisher: "C1 (ConductorOne)"
  - title: "C1 Survey Finds 95% of Enterprises Now Run AI Agents Autonomously as Identity Risks Escalate"
    url: "https://www.c1.ai/news/press-release/future-of-identity-security-2026"
    publisher: "C1 (ConductorOne)"
  - title: "Gartner predicts a surge in agentic AI adoption by 2028（150,000 agents per Fortune 500）"
    url: "https://www.okoone.com/spark/industry-insights/gartner-predicts-a-surge-in-agentic-ai-adoption-by-2028/"
    publisher: "Okoone / Gartner"
  - title: "Okta introduces Cross App Access to help secure AI agents in the enterprise"
    url: "https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access-to-help-secure-ai-agents-in-the/"
    publisher: "Okta"
  - title: "金管會規劃 AI 監理 AI Agent 納指引"
    url: "https://www.epochtimes.com/b5/26/5/7/n14758846.htm"
    publisher: "大紀元"
originalContribution: "本文把 C1『把 agent 收進人類同一套身分政策引擎』的產品動作，放進 Lightman 的『解對題 vs 解錯題』框架，指出身分是治理 agent 的正確控制層（對的題目），但直接沿用為人設計的 IAM 流程會解錯題；並歸納 agent 與人相異的三個結構點（數量級／生命週期／委派鏈），交叉 C1 調查、Gartner 預估、Okta 與微軟同類動作，落到金管會已納指引研議下台灣企業的三項可執行盤點。"
---

把 AI agent 的權限收進跟人類同一套身分政策引擎，方向是對的。身分（identity）本來就是治理軟體行為最合適的控制層，agent 會自己去呼叫工具、跨系統拿資料、連續做好幾步，這種東西不給它一個「身分」，就等於讓一個沒有員工編號、沒有主管、沒人能一鍵停掉的東西在你的系統裡到處跑。C1（前身是 ConductorOne）三月推出的 AI Access Management，把 AI agent 當成跟員工一樣的「一等公民身分」來管，這件事該做。但要先踩個剎車：把對的題目擺上桌，不等於已經解對題。真正的難點不在「要不要給 agent 身分」，而在 agent 根本不是人。

<img src="/images/ai-agent-identity-policy-engine-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI agent 被當成有憑證與擁有者的一等公民身分，納入存取控制平面示意">

先講 C1 做了什麼。這家公司三月十九日發表 [AI Access Management](https://www.c1.ai/news/press-release/introducing-ai-access-management)，把管人存取權的那套控制平面，延伸去管 AI 工具、agent 跟 MCP 連線。它的說法是：AI agent 被當成「有自己的憑證、政策、生命週期狀態與擁有者的一等公民身分」，每一次 agent 呼叫工具都會被驗證身分、檢查權限、留下完整稽核紀錄。C1 平台首頁把這句話寫得更直白：[「一個平台，管每一個身分」](https://www.c1.ai/platform-overview)，還推了一個叫「C1 Autonomous Worker」的產品，字面上就是把 agent 當成一種「自主身分的工作者」，跟真人放進同一套政策引擎裡審核、授權、撤銷。

<img src="/images/ai-agent-identity-policy-engine-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="身分是治理軟體行為的正確控制層示意">

為什麼說方向對？因為問題的根因，是治理速度追不上部署速度。C1 自己三月做的[第三年度身分安全調查](https://www.c1.ai/news/press-release/future-of-identity-security-2026)（508 位美國千人以上企業的資安主管）給的數字很清楚：95% 的組織已經在讓 AI agent 自主執行 IT 或資安任務；47% 的組織說自家的非人類身分（機器、服務、agent 這類非真人的帳號）已經比真人帳號還多；但只有 22% 說自己對這些身分有完整的能見度。也就是說，會動、會存取的東西已經多過人，能看清楚它們在幹嘛的卻不到四分之一。這種缺口不是靠再買一套掃描工具補得起來的，它是治理層的破口。把 agent 收進身分政策引擎，等於承認「這些東西要跟人受同一套授權與問責約束」，這一步方向沒錯。

<img src="/images/ai-agent-identity-policy-engine-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI agent 的數量、速度與生命週期與人類不同，打破為人設計的權限流程">

但這裡就是最容易解錯題的地方：把 agent 當身分管是對的，把「人的那套流程」原封不動套到 agent 上，是錯的。傳統的身分治理是為人設計的。申請、主管審核、一年一次的權限複審、離職手動撤銷，這套節奏以「人天」為單位。agent 不吃這一套。第一，數量級不同。Gartner 預估到 2028 年，一家平均規模的財星五百大企業會有[超過十五萬個 AI agent 在跑，而 2025 年還不到十五個](https://www.okoone.com/spark/industry-insights/gartner-predicts-a-surge-in-agentic-ai-adoption-by-2028/)。年度複審十五萬個身分，等於沒審。第二，生命週期不同。一個 agent 可能為了一個任務活幾秒鐘就消失，人的季度性權限回收在這裡完全失速，必須是即時、有時限的權限（just-in-time）加上能秒斷的 kill switch。第三，也是最麻煩的，委派鏈不同。agent 常常是替某個人、或替另一個 agent 做事，出事要問責時，你得能一路追回「這個動作到底是誰授權、代誰執行」。人跟人之間沒有這種代理鏈，人的 IAM 模型裡根本沒設計這一格。

<img src="/images/ai-agent-identity-policy-engine-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="Okta、微軟等廠商一起把 agent 存取收回統一政策引擎示意">

所以真正決定這件事成不成的，不是誰家的平台比較聰明，是落地流程有沒有把這三件事補上：身分怎麼發、權限怎麼給時限、擁有者是誰、動作怎麼稽核回問責。這也是為什麼這不會是 C1 一家的生意，而是一整個類別在成形。Okta 推的 [Cross App Access](https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access-to-help-secure-ai-agents-in-the/) 是把 agent 跨應用存取這件事，用 OAuth 的延伸協定收回身分供應商手上管；微軟則在 Entra 推了 Agent ID。大家做的其實是同一件事：讓 agent 在拿到權限之前，先經過一個統一的政策引擎。這是好事，但也提醒一件事，協定與平台只是把關卡架好，關卡背後要放什麼規則，還是得企業自己定義。我先前寫過 [MCP 正在變成 agent 治理的事實標準](/articles/mcp-de-facto-standard-agent-governance/)，講的是同一條線：標準與工具負責把介面統一，真正的信任邊界還是靠設計出來的。

<img src="/images/ai-agent-identity-policy-engine-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣金管會將代理式 AI 納入金融業 AI 指引研議示意">

台灣不是這條線的旁觀者，位置甚至比想像中前面。金管會主委彭金隆五月七日在立法院財委會報告時就說，會把[「代理 AI（AI Agent）」、可程式化 AI、AI 風險分類納入金融業 AI 指引研議](https://www.epochtimes.com/b5/26/5/7/n14758846.htm)，理由正是代理式 AI 具備目標導向、多步驟執行、可呼叫工具、跨系統存取資料這些特性，跟前面講的 agent 難點完全對得上；業界也表態會維持「人機協作」，把關鍵決策與問責留在人身上。這個「問責留在人」的原則，就是身分治理要落地的那顆螺絲：每一個 agent 都要能指回一個負責的人或團隊。企業明天早上就能做的，不是急著採購哪一家，而是三件具體事：盤點自家有多少非人類身分、逼自己面對那 47% 可能比真人還多的帳號；替每一個 agent 指定一個 human owner；把 agent 的權限改成有時限、能秒撤，別再沿用人的年度複審。憑證外洩的代價已經有前例，我寫過的 [LastPass 那條 OAuth token 被盜的事件](/articles/lastpass-klue-oauth-token-breach/)，破口就是一組沒人盯著的機器憑證。

<img src="/images/ai-agent-identity-policy-engine-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="沒人盯著的機器憑證與 API token 成為新的攻擊破口示意">

回到那句剎車。C1 把 AI agent 收進跟人同一套身分政策引擎，是這個產業目前最合理的方向，身分確實是治理 agent 的正確控制層。但別把它讀成「買了這套就治好了」。可信度從來不是靠工具大小或平台品牌決定的，是靠落地設計：問題定義、權限時限、擁有者歸屬、稽核回問責，缺一個就會在那裡漏。agent 不是人，把它當身分管是第一步對的判斷，接下來別再把人的那套流程原封搬過去。看懂 agent 跟人差在哪，比記住哪家先喊出「自主身分工作者」重要。

<h2>常見問題</h2>

<p><strong>什麼是 AI agent 的身分治理，跟一般帳號管理有什麼不同？</strong><br>AI agent 是會自己呼叫工具、跨系統拿資料、連續執行多步的軟體，把它當成有憑證、有權限、有擁有者的「一等公民身分」來管，就是 agent 身分治理。跟一般帳號最大的差別在數量與速度：Gartner 預估 2028 年一家財星五百大企業會有[超過十五萬個 agent](https://www.okoone.com/spark/industry-insights/gartner-predicts-a-surge-in-agentic-ai-adoption-by-2028/)，且生命週期可能短到幾秒，人用的年度權限複審完全不適用。</p>

<p><strong>C1（ConductorOne）的 AI Access Management 到底在管什麼？</strong><br>它把管人存取權的控制平面延伸去管 AI 工具、agent 跟 MCP 連線，讓每一次 agent 呼叫工具都先被驗證身分、檢查權限、留稽核紀錄。C1 把 agent 當成有自己憑證、政策、生命週期與擁有者的[一等公民身分](https://www.c1.ai/news/press-release/introducing-ai-access-management)，跟真人放進同一套政策引擎審核與撤銷。</p>

<p><strong>台灣對 AI agent 有監理規範嗎？</strong><br>有在動。金管會主委彭金隆 2026 年 5 月 7 日在立法院表示，會把[代理 AI（AI Agent）、可程式化 AI 與 AI 風險分類納入金融業 AI 指引研議](https://www.epochtimes.com/b5/26/5/7/n14758846.htm)，並強調業界維持「人機協作」、把關鍵決策與問責留在人身上。金融業以外目前還沒有專法，但企業內部治理不用等法規，可以先盤點非人類身分、替每個 agent 指定負責人。</p>

<p><strong>非人類身分（NHI）為什麼是資安重點？</strong><br>因為它已經多過真人卻更看不清楚。C1 的調查顯示 47% 的組織非人類身分比真人帳號還多，但只有 22% 對這些身分有完整能見度（[來源](https://www.c1.ai/news/press-release/future-of-identity-security-2026)）。一組沒人盯著的機器憑證就足以成為破口，[LastPass 的 OAuth token 外洩事件](/articles/lastpass-klue-oauth-token-breach/)就是實例。</p>
