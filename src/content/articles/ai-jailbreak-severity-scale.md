---
title: "Fable 5 解禁後，四家 AI 巨頭合訂『越獄嚴重度』量表：真正的考驗不在量表本身"
slug: "ai-jailbreak-severity-scale"
description: "Anthropic 7 月 2 日聯手 Amazon、Microsoft、Google，在 Project Glasswing 底下公布 CJS 越獄嚴重度量表，四軸五級、比照資安界的 CVSS。這是把『越獄危不危險』從各說各話變成一套共同語言，方向對了。但真正的考驗不在量表分幾級，在誰打分、打完能不能被檢核；而 Fable 5 為了重新上線裝的分類器，把可疑請求改導到較弱模型，正好暴露了分不出研究者與攻擊者的老問題。"
excerpt: "越獄嚴重度量表把 AI 安全講成像 CVSS 那樣的共同語言，方向沒錯。但量表是自願框架、由 labs 自己打分，信任要靠流程不是靠名單。台灣資安產業早就在用這套語言，該從這件事讀出什麼？"
publishDate: "2026-08-09T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["AI 安全", "越獄", "Claude Fable 5", "資安治理", "CVSS"]
coverImage: "covers/ai-jailbreak-severity-scale.webp"
coverAlt: "象徵把 AI 越獄風險分級評分的資安嚴重度量表儀表示意"
coverImageCredit: "Photo by Jonathan Cooper on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Anthropic 7/2 聯手 Amazon、Microsoft、Google 公布 CJS 越獄嚴重度量表：四軸（能力增益、廣度、武器化難易、可得性）、五級（CJS-0 到 CJS-4），刻意做成指數級，比照資安界行之有年的 CVSS 漏洞評分。"
  - "這是解對題：把『越獄危不危險』從各說各話變成一套可比較的共同語言。但它是自願框架、由 labs 自己給分，真正的考驗在誰打分、打完能不能被獨立檢核，不在量表分幾級。"
  - "Fable 5 為了重新上線裝的分類器，會把看起來可疑的請求改導到較弱的 Opus 4.8；根因是分不出資安研究者與攻擊者的『驗證缺口』，過度封鎖會傷到正當的資安工作。台灣資安團隊早就用 CVSS 這套語言，這套量表若撐得住是好事。"
references:
  - title: "More details on Fable 5’s cyber safeguards and our jailbreak framework"
    url: "https://www.anthropic.com/news/fable-safeguards-jailbreak-framework"
    publisher: "Anthropic"
  - title: "Anthropic Proposes Cross-Industry Framework For Scoring AI Jailbreak Severity"
    url: "https://letsdatascience.com/news/anthropic-proposes-cross-industry-framework-for-scoring-ai-j-8da00d16"
    publisher: "Let's Data Science"
  - title: "Anthropic details Claude Fable 5’s cybersecurity safeguards and AI jailbreak framework"
    url: "https://cryptobriefing.com/anthropic-claude-fable-5-jailbreak-framework/"
    publisher: "Crypto Briefing"
  - title: "Fable 5 Is Back: Why Anthropic's AI Was Suspended and What Changed"
    url: "https://naraway.com/Blogs/fable-5-redeployment-government-jailbreak-ai-framework-2026.html"
    publisher: "Naraway"
originalContribution: "本文把 CJS 越獄嚴重度量表放進『解對題 vs 解錯題』的框架拆解：先肯定共同語言（比照 CVSS）解的是對的問題，再指出量表的信任瓶頸在打分與稽核流程而非量表分級，並把 Fable 5 重新上線裝的『改導較弱模型』分類器讀成一種解症狀而非解根因的權宜設計，最後接回台灣資安產業已在使用 CVSS 語言、以及依賴外部 AI API 的供應風險。"
---

一件在資安圈值得記下來的事：7 月 2 日，Anthropic 聯手 Amazon、Microsoft、Google，在一個叫 [Project Glasswing 的合作底下公布了一套越獄嚴重度量表](https://cryptobriefing.com/anthropic-claude-fable-5-jailbreak-framework/)，把 AI 被「越獄」（jailbreak，用特定提示繞過安全限制）這件事，從各家各說各話，變成一套可以互相比較的共同語言。這個方向是對的。但先講清楚重點在哪：真正的考驗不在量表分幾級，在誰打分、打完能不能被別人檢核。

<img src="/images/ai-jailbreak-severity-scale-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心伺服器離線示意，象徵 AI 模型被下架停用">

先把事情的來龍去脈接上。這套量表不是憑空冒出來的，是被一次下架事件逼出來的。[根據事件整理](https://naraway.com/Blogs/fable-5-redeployment-government-jailbreak-ai-framework-2026.html)，6 月 12 日 Amazon 的研究員在 Anthropic 最強的模型 Fable 5 上找到一個破口：只要提示得當，它會指出你給它的程式碼裡有哪些漏洞，甚至示範這些漏洞可以怎麼被利用。美國政府隨即動用出口管制，Anthropic 把 Fable 5 與 Mythos 5 全球下架，前後 19 天，直到 Anthropic 的分類器能擋掉逾 99% 的該手法、6 月 30 日管制才解除，7 月 1 日重新上線。我先前寫 [Fable 5 開出 Mythos 級那篇](/articles/claude-fable-5-mythos-class-model-tiering/)時提過，它公開前跑了超過一千小時外部抓漏、沒被找到通用越獄才敢放；結果放出去沒多久，通用破口沒有、針對性的高風險破口卻真的出現了。這正是問題所在：抓漏永遠追在能力後面跑。

<img src="/images/ai-jailbreak-severity-scale-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="風險評分儀表與數據視覺化，象徵把越獄危害分級評分">

量表本身長怎樣？它叫 Cyber Jailbreak Severity（CJS），[用四個軸打分](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework)：能力增益（這個手法讓攻擊者比原本強多少）、廣度（同一招能套用在多少種攻擊任務上）、武器化難易（要多少人力才能把越獄變成一支跑得動的攻擊）、可得性（威脅行為者有多容易拿到這個手法）。四軸加總後落到五個級別，從 CJS-0（僅供參考）到 CJS-4（危急）。關鍵細節是這五級刻意做成指數級而非線性，每升一級代表現實風險是下一級的好幾倍。這套設計不是新發明，它明擺著在[對標資安界行之有年的 CVSS 漏洞評分](https://letsdatascience.com/news/anthropic-proposes-cross-industry-framework-for-scoring-ai-j-8da00d16)，想讓大家談越獄時，能像談一般軟體漏洞那樣有一把共同的尺。

<img src="/images/ai-jailbreak-severity-scale-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="產業標準文件與協議握手示意，象徵四家公司自願框架的治理問題">

到這裡我是認同的，這是解對題。過去每家 labs 對「這個越獄有多嚴重」的判斷各憑感覺，紅隊回報一個破口，沒有一把公認的尺，就很難談該封鎖、該修補、還是該公開。有了共同語言，[紅隊有一致的方式把發現升級處理、labs 有站得住腳的依據去選擇封鎖或默默修補、政策制定者也能拿到比『危險或不危險』更精確的東西來寫規則](https://letsdatascience.com/news/anthropic-proposes-cross-industry-framework-for-scoring-ai-j-8da00d16)。但這裡要踩一個剎車。CJS 是一份自願框架，而且分數是由 labs 自己打的。CVSS 之所以能當公信力的基準，不只是因為它有一張評分表，是因為它背後有中立的組織生態在維護、有大量第三方在用同一套標準互相對照。一套嚴重度量表值不值得信，看的不是它分幾級、公式多漂亮，是這套打分的流程能不能被外部檢核。當發現破口的是自己、決定要不要公開的也是自己、給這個破口打幾分的還是自己，這三件事擺在同一方手上，量表再精緻，信任的結構性缺口都還在那裡。

<img src="/images/ai-jailbreak-severity-scale-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="安全檢查閘門與存取控制示意，象徵分類器攔截可疑請求">

Fable 5 為了重新上線裝上的那套分類器，剛好把另一個代價擺上檯面。[它會把看起來可疑的請求改導到能力較弱的 Opus 4.8](https://cryptobriefing.com/anthropic-claude-fable-5-jailbreak-framework/)，[而且安全邊界抓得很緊，一個請求得看起來非常明確地無害，才不會觸發分類器](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework)。這是很典型的解症狀而不是解根因。根因是那個[分不出正當資安研究者與惡意攻擊者的『驗證缺口』](https://naraway.com/Blogs/fable-5-redeployment-government-jailbreak-ai-framework-2026.html)：同一句「幫我看這段程式碼有沒有漏洞」，出自要修補系統的工程師、還是要找攻擊面的入侵者，模型當下分不出來。分類器分不出來，就只好一律從嚴，寧可錯殺。對真正在做防禦、做滲透測試、做程式碼審查的人來說，這代表你越是認真用它處理有安全意涵的工作，越容易被降級到一個較弱的模型。收一點能力換多一點安全，這個取捨本身沒錯，但代價落在誰身上、有沒有被講清楚，是另一回事。

<img src="/images/ai-jailbreak-severity-scale-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="資安監控中心多螢幕畫面，象徵資安團隊使用共同的評分語言">

那台灣該從這件事讀出什麼？兩層。第一層是機會。台灣的資安團隊、資安服務商本來就天天在用 CVSS 這套語言分漏洞、排修補優先序、寫進採購與稽核文件。越獄嚴重度如果真能長成 AI 界的 CVSS，對這些團隊是實打實的好事：買 AI 服務時可以要求供應商用同一把尺揭露越獄風險，合規與稽核時可以把它寫進條款，而不是只能聽廠商說一句「我們很安全」。這正是共同語言的價值，它讓資訊不對稱的一方有籌碼要求對稱。第二層是風險，而且這層更少人講。這次事件裡，一個模型可以因為政府一紙命令、在 19 天內從全球下架。任何把產品長在這些外部 AI API 上的台灣開發者與新創，這就是很具體的供應風險：你依賴的那一階能力，不完全由你決定它明天還在不在。

<img src="/images/ai-jailbreak-severity-scale-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="抽象數位網路連線示意，象徵共同語言與信任框架能否撐住">

所以看這條新聞，重點不是量表分成幾級，是這套共同語言撐不撐得住。撐住的條件很清楚：打分要能被自己以外的人檢核、封鎖與公開的決策要有一致的依據、過度封鎖傷到正當資安工作時要有申訴與校正的路徑。四家公司願意先把一把共同的尺立起來，是好的第一步。但一套安全機制的可信度，從來不是靠參與名單有多響亮，是靠它的流程經不經得起被外面的人檢查。這件事現在只走到了第一步。

<h2>常見問題</h2>

<p><strong>什麼是 AI 越獄？跟一般駭客攻擊差在哪？</strong><br>越獄是用特定的提示或對話手法，繞過 AI 模型內建的安全限制，讓它做出原本被擋下來的事，例如指出程式碼漏洞並示範怎麼利用。它不是入侵伺服器或竊取資料那種傳統攻擊，攻擊的對象是模型的行為邊界本身。這次 Amazon 研究員在 Fable 5 上找到的，就是[一個能讓它協助辨識並利用軟體漏洞的越獄手法](https://naraway.com/Blogs/fable-5-redeployment-government-jailbreak-ai-framework-2026.html)。</p>

<p><strong>CJS 越獄嚴重度量表怎麼打分？</strong><br>它由 Anthropic 聯手 Amazon、Microsoft、Google 制定，[用能力增益、廣度、武器化難易、可得性四個軸打分，加總後落到 CJS-0（僅供參考）到 CJS-4（危急）五個級別](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework)，而且分級刻意做成指數級，每升一級代表風險是下一級的好幾倍。設計上對標的是資安界既有的 CVSS 漏洞評分制度。</p>

<p><strong>Fable 5 為什麼被下架又重新上線？</strong><br>6 月 12 日 Amazon 研究員找到能讓 Fable 5 協助利用程式碼漏洞的越獄，美國政府動用出口管制，Anthropic 把它全球下架 19 天；直到分類器能擋掉逾 99% 的該手法、[6 月 30 日管制解除、7 月 1 日重新上線](https://naraway.com/Blogs/fable-5-redeployment-government-jailbreak-ai-framework-2026.html)。重新上線後，看起來可疑的請求會被改導到較弱的模型處理。</p>

<p><strong>這套量表對台灣的開發者和資安團隊有什麼影響？</strong><br>正面是它可能成為 AI 界的共同語言，讓台灣資安團隊能像用 CVSS 那樣，要求 AI 供應商用同一把尺揭露越獄風險、寫進採購與稽核。要留意的是供應風險：這次事件顯示一個模型可能因政府命令在短時間內全球下架，任何把產品長在外部 AI API 上的團隊，都該把這種能力中斷納入評估。</p>
