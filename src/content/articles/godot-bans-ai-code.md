---
title: "Godot 引擎明文拒收 AI 寫的程式碼：第一個禁 vibe coding 貢獻的主要開源專案"
slug: "godot-bans-ai-code"
description: "開源遊戲引擎 Godot 修改貢獻守則，禁止 AI 生成大段程式碼、禁 AI 代理送 PR、禁用 AI 生成的人對人溝通，違反自動封鎖。重點不是『禁 AI』，而是它把問題定位對了：AI 不能負責，志工審查的經濟學被 vibe coding 打破。台灣導入 AI 協作的團隊該從這條政策讀出治理的骨架。"
excerpt: "為什麼一個開源專案要明文擋掉 AI 寫的碼？因為真正壞掉的不是程式碼品質，是審查這件事的誘因結構：AI 不能負責，回饋被機器吸收，志工就沒有理由再花免費時間審 PR。"
publishDate: "2026-07-23T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["Godot", "開源", "vibe coding", "AI 程式碼", "開源治理"]
coverImage: "covers/godot-bans-ai-code.webp"
coverAlt: "開源遊戲引擎開發與程式碼審查的示意，象徵 Godot 拒收 AI 生成的程式碼貢獻"
coverImageCredit: "Photo by Godfrey Atima on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Godot 基金會於 2026 年 6 月底修改貢獻守則，禁止用 AI 生成大段程式碼、禁 AI 代理自動送 PR、禁用 AI 生成的人對人溝通，違反自動封鎖 GitHub；成為第一個明文禁 vibe coding 貢獻的主要開源專案。"
  - "政策真正的理由不是程式碼品質，是誘因結構：志工審 PR 的報酬是『教出下一個維護者』，當回饋被機器吸收、AI 又無法為程式碼負責，這份免費勞動就撐不下去。"
  - "Godot 不是孤例，curl 早在 2025 年就開始即時封鎖 AI slop、2026 年 1 月更收掉漏洞獎金；台灣導入 AI 協作的團隊該學的是治理骨架（揭露、責任歸屬、審查機制），不是一刀切禁工具或放任 vibe coding。"
references:
  - title: "Changes to our Contribution Policies"
    url: "https://godotengine.org/article/contribution-policy-2026/"
    publisher: "Godot Engine"
  - title: "Godot says bye bye AI, bans vibe-coded contributions"
    url: "https://www.theregister.com/ai-and-ml/2026/07/01/godot-says-bye-bye-ai-bans-vibe-coded-contributions/5265344"
    publisher: "The Register"
  - title: "Godot to ban (almost all) AI coding contributions"
    url: "https://www.gamedeveloper.com/business/godot-to-ban-almost-all-ai-coding-contributions"
    publisher: "Game Developer"
  - title: "Curl shutters bug bounty program to stop AI slop"
    url: "https://www.theregister.com/2026/01/21/curl_ends_bug_bounty/"
    publisher: "The Register"
originalContribution: "本文把 Godot 的貢獻政策拆成『被禁的行為』與『被允許的例外』兩欄，指出這條政策的分界不是 AI 能力強弱、而是責任能否歸屬與審查誘因是否成立；再以 curl 收掉漏洞獎金為對照，把單一新聞放回一條開源治理趨勢線，最後轉成台灣團隊可直接套用的『揭露、責任歸屬、審查機制』三件事檢查表。"
---

開源遊戲引擎 Godot 把「不准用 AI 寫程式碼」寫進了貢獻守則。這在 2026 年 6 月底[正式公告](https://godotengine.org/article/contribution-policy-2026/)，讓它成為第一個明文禁止 vibe coding 貢獻的主要開源專案。但這條新聞真正該讀的地方，不是「又一個專案討厭 AI」。Godot 把問題定位對了：壞掉的不是程式碼品質，是審查這件事背後的誘因結構。看懂這一層，比記住「Godot 禁 AI」這四個字有用得多。

先把政策講清楚，因為它不是一句「全面封殺」。[Godot 的新守則](https://godotengine.org/article/contribution-policy-2026/)禁三件事：一、不准用 AI 生成大段程式碼，所有程式碼要由人撰寫；二、不准 AI 代理自主送 pull request（PR）或做 vibe coding，違反直接自動封鎖 GitHub 帳號；三、不准用 AI 生成「人對人」的溝通內容，因為維護者不想跟一台機器對話。留了兩個例外：AI 拿來做雜事沒問題（自動補完、正規表達式、尋找取代），機器翻譯也還能用，但前提是原文由真人寫。而且只要你有用到 AI 幫忙寫碼，[就必須在 PR 討論裡揭露](https://www.theregister.com/ai-and-ml/2026/07/01/godot-says-bye-bye-ai-bans-vibe-coded-contributions/5265344)。分界不在「有沒有碰 AI」，在「這段碼由誰負責、由誰理解」。

<img src="/images/godot-bans-ai-code-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者在螢幕上審查 GitHub pull request 的程式碼變更">

很多人第一個反應是：這是不是老派工程師在抗拒 AI？這個方向沒抓到重點。Godot 講得很白，AI 貢獻讓人心累的地方，[是它把審查這件事的報酬抽掉了](https://www.gamedeveloper.com/business/godot-to-ban-almost-all-ai-coding-contributions)。開源維護者多半是志工，審 PR 本來就是苦差事，願意做是因為有一個回報：你給的意見會教出一個新貢獻者，這個人可能變成未來的維護者。這份報酬不是錢，是「我在帶人」。當 PR 是機器產的、你的回饋被一台不會學也不會留下來的機器吸收，這份誘因就整個垮掉。同時 PR 的量暴增、審查的人力沒變，一邊灌爆、一邊抽掉動機，志工的免費勞動就撐不住。

<img src="/images/godot-bans-ai-code-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者被大量通知與待審工作淹沒、面露疲態的示意">

再往下一層，是責任。Godot 那句話講到骨子裡：[AI 無法承擔責任，而他們無法信任重度使用 AI 的人能夠理解自己的程式碼到足以修好它](https://godotengine.org/article/contribution-policy-2026/)。這才是分界線的真正位置。程式碼進了主幹，日後出 bug、要回頭改、要跟其他模組協調，這些都需要有一個「懂這段碼、扛得起這段碼」的人。AI 產得出能跑的碼，但它不會在半年後為這段碼負責，送碼的人如果自己也看不懂，責任就懸空了。開源專案的地基是責任可歸屬，一段沒有人真正理解、沒有人真正負責的碼，對維護者來說不是幫忙，是負債。這跟模型多聰明無關，是誰簽名扛下來的問題。

<img src="/images/godot-bans-ai-code-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者在鍵盤前工作，象徵程式碼需要有人理解並負責">

Godot 不是第一個踩剎車的專案，它是一條趨勢線上比較晚、但講得最完整的那個點。網路傳輸工具 curl 更早就被 AI 生成的假漏洞報告灌爆，維護者 Daniel Stenberg 從 2025 年就開始即時封鎖送「AI slop」的人，[到 2026 年 1 月乾脆把跑了六年的漏洞獎金計畫整個收掉](https://www.theregister.com/2026/01/21/curl_ends_bug_bounty/)，理由同樣是要拿掉「送沒研究過的爛報告」的誘因。把 Godot 跟 curl 放在一起看就清楚了：這不是遊戲圈的個別情緒，是整個開源生態在面對同一個結構性問題：當送 PR、送報告的成本被 AI 壓到趨近於零，篩選與審查的成本卻沒有跟著降，天平就會倒。我之前寫[開源 coding agent 反壓商業 IDE](/articles/opencode-overtakes-commercial-ide/)，講的是 AI 工具怎麼長進開發流程；這條 Godot 新聞是同一枚硬幣的背面：工具長得快，接住它的治理沒跟上。

<img src="/images/godot-bans-ai-code-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="開源軟體開發者在終端機與筆電前工作的示意">

那台灣的團隊該讀出什麼？先別急著選邊。市面上兩種反應都在解錯題：一種是「AI 出包，全面禁用」，另一種是「AI 提升效率，全部放行」。Godot 的政策其實兩邊都不站，它盯的是三件具體的事，這三件才是可以直接抄的骨架。第一是揭露：用了 AI 就要講，讓審的人知道這段碼的來歷，別讓它假裝成純手工。第二是責任歸屬：送這段碼的人要能解釋、能維護、能負責，做不到就不該進主幹。第三是審查機制：把關的人力與流程要跟得上產出的速度，不然量一衝上來就破防。台灣不少軟體團隊與開源社群正在大量導入 AI 協作，該做的不是在「禁」與「放」之間二選一，而是把這三件事寫進自己的貢獻守則與 code review 流程。工具可以換，這三根柱子不能少。

<img src="/images/godot-bans-ai-code-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="軟體團隊在辦公室協作討論的示意，象徵治理流程而非禁用工具">

Godot 這步棋會不會變成開源圈的通用做法，還要看接下來一年別的專案怎麼跟。但它已經把一件常被含糊帶過的事講明白：AI 能不能進你的專案，不是看它寫得好不好，是看有沒有人為它負責、有沒有人審得動。這句話對開源適用，對公司內部的工程團隊一樣適用。禁不禁 AI 是假議題，真議題是你的責任歸屬與審查機制撐不撐得住 AI 帶來的產量。

## 常見問題

<p><strong>Godot 是完全禁止用 AI 嗎？</strong><br>不是。Godot 禁的是用 AI 生成大段程式碼、AI 代理自動送 PR、以及用 AI 生成人對人的溝通內容。<a href="https://godotengine.org/article/contribution-policy-2026/">仍允許把 AI 用在雜事</a>，例如自動補完、正規表達式、尋找取代，機器翻譯只要原文是真人寫的也可以，但用了 AI 幫忙寫碼必須在 PR 討論裡揭露。</p>

<p><strong>什麼是 vibe coding？為什麼開源專案要擋它？</strong><br>vibe coding 泛指讓 AI 大量生成程式碼、開發者不細看就送出的做法。開源專案要擋，不是因為 AI 寫得差，而是<a href="https://www.gamedeveloper.com/business/godot-to-ban-almost-all-ai-coding-contributions">審查的誘因被打破</a>：志工審 PR 的回報是帶出新貢獻者，當回饋被機器吸收、送碼的人又未必理解自己的碼，這份免費勞動就撐不下去。</p>

<p><strong>Godot 是第一個這樣做的專案嗎？</strong><br>它是第一個把「禁 AI 寫的程式碼」明文寫進貢獻守則的主要開源專案，但不是第一個處理這問題的。網路傳輸工具 curl 更早就封鎖 AI 生成的假漏洞報告，<a href="https://www.theregister.com/2026/01/21/curl_ends_bug_bounty/">2026 年 1 月甚至收掉了跑六年的漏洞獎金計畫</a>，理由都是要拿掉灌爆審查的誘因。</p>

<p><strong>台灣的開發團隊該怎麼看這件事？</strong><br>重點不是跟著禁 AI，而是把 Godot 政策背後的三根柱子抄進自己的流程：用了 AI 要揭露、送碼的人要能負責與維護、審查人力與流程要跟得上產出速度。禁或放是假選擇，責任歸屬與審查機制撐不撐得住才是真問題。</p>
