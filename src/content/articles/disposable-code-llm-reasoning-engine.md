---
title: "一篇 arXiv 論文重新定義『軟體』：當 LLM 成了推理引擎，程式碼變成用完即丟的資源"
slug: "disposable-code-llm-reasoning-engine"
description: "一篇 2026 年 4 月的 arXiv 論文主張程式碼正從稀缺工藝品變成用完即丟的商品，軟體工程要圍著協調、驗證與人類問責重組。真正的重點不是程式碼變免費，而是稀缺性搬了家；台灣軟體業該看懂價值移到哪一格。"
excerpt: "程式碼變便宜不等於維護變便宜。當 LLM 成了推理引擎、程式碼用完即丟，稀缺的東西搬到驗證與責任這一邊，這才是這篇論文真正在講的事。"
publishDate: "2026-08-05T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["LLM", "軟體工程", "AI 寫程式", "程式碼驗證", "台灣軟體業"]
coverImage: "covers/disposable-code-llm-reasoning-engine.webp"
coverAlt: "抽象示意：程式碼在數位空間中溶解消散，象徵程式碼從稀缺工藝品變成用完即丟的資源"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "arXiv:2604.10599 主張程式碼正從「稀缺、要慢慢刻的工藝品」變成「量大、用完即丟的商品」，軟體工程要圍著協調、驗證、人機協作三件事重組。"
  - "真正的重點不是程式碼變免費，而是稀缺性搬家：當寫一段程式的邊際成本趨近零，價值移到「寫出來對不對、誰負責」這一邊，驗證變成新瓶頸。"
  - "台灣軟體業的卡位點不在拼生成速度，在驗證、責任歸屬與領域知識這幾格；程式碼變便宜，不代表維護變便宜。"
references:
  - title: "Rethinking Software Engineering for Agentic AI Systems"
    url: "https://arxiv.org/abs/2604.10599"
    publisher: "arXiv (Mamdouh Alenezi)"
  - title: "Every Software as an Agent: Blueprint and Case Study"
    url: "https://arxiv.org/abs/2502.04747"
    publisher: "arXiv (Mengwei Xu)"
  - title: "Andrej Karpathy on Software 3.0: Software in the Age of AI"
    url: "https://www.latent.space/p/s3"
    publisher: "Latent Space"
  - title: "The Flawed Ephemeral Software Hypothesis"
    url: "https://www.blackhc.net/essays/future_of_software/"
    publisher: "Andreas Kirsch"
originalContribution: "本文把三份文獻放在同一條軸上讀：以 arXiv:2604.10599「程式碼變可拋棄商品」為錨、對照 arXiv:2502.04747 把程式碼即時注入 runtime 用完即丟的激進版本、再用 Kirsch 的 ephemeral vs malleable 反方踩剎車，提出「稀缺性搬家到驗證與責任」的分析框架，並據此評估台灣軟體業的實際卡位點。"
---

這篇論文真正說的，不是「LLM 會寫程式了，工程師可以下班」。它說的是：當程式碼從稀缺、要慢慢刻的工藝品，變成一種要多少有多少、用完即丟的商品，稀缺性並沒有消失，只是搬了家。搬到驗證與責任歸屬這一邊。把它讀成「程式碼現在免費了」，就是解錯題。

<img src="/images/disposable-code-llm-reasoning-engine-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="研究論文與抽象程式碼符號，象徵一篇論文重新定義軟體的邊界">

## 這篇論文改的是哪個定義

先講清楚在講哪一篇。2026 年 4 月一篇 arXiv 論文[《Rethinking Software Engineering for Agentic AI Systems》](https://arxiv.org/abs/2604.10599)（作者 Mamdouh Alenezi）把話講得很白：程式碼[「正從稀缺、費心雕琢的工藝品，轉變成量大而且越來越可拋棄的商品」](https://arxiv.org/abs/2604.10599)。它接著主張，軟體工程要圍著三件核心能力重組：多代理系統的協調、對 AI 產出的嚴格驗證、以及有結構的人機協作，而不是圍著「人手寫程式」這件事。

這套定義的底層，是 Andrej Karpathy 2025 年那場「Software 3.0」的說法。他把軟體分三代：1.0 是手寫的程式碼，2.0 是神經網路的權重，3.0 是[用自然語言去「編程」LLM](https://www.latent.space/p/s3)。在這個框架裡，LLM 不是一個函式庫，是一種新的電腦、一顆通用推理引擎，你用英文對它下指令。程式碼從「你要親手產出的東西」，降級成「引擎順手吐出來的中間產物」。

<img src="/images/disposable-code-llm-reasoning-engine-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="數位資料流溶解消散，象徵程式碼即時生成、用完即丟">

## 「用完即丟」是把稀缺性搬家，不是消滅它

有一篇更早、更激進的 arXiv 論文把這件事推到底。2025 年 2 月的[《Every Software as an Agent》](https://arxiv.org/abs/2502.04747)（作者 Mengwei Xu）主張，讓 LLM 拿到軟體的原始碼與執行環境，[「把生成的程式碼動態注入軟體裡執行」](https://arxiv.org/abs/2502.04747)。在這種設計裡，程式碼是一段 action code，用完就丟，下一個需求來了再生一段。程式碼徹底變成耗材。

問題不在這樣做得到做不到，在它把價值往哪裡推。我的看法是這樣：當寫一段程式的邊際成本趨近零，「會不會寫」就不再是門檻，門檻換成「寫出來對不對、跑起來安不安全、出事誰負責」。稀缺的東西沒有消失，它從鍵盤這一端，搬到驗收這一端。論文自己也承認這件事，它把 verification 明明白白列成核心能力，還強調[問責這件事無法自動化、最後仍然是人在扛](https://arxiv.org/abs/2604.10599)。

<img src="/images/disposable-code-llm-reasoning-engine-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="品質把關與測試清單，象徵驗證成為軟體生產的新瓶頸">

## 驗證變成新瓶頸，這條線我寫過很多次

程式碼免費，不代表對的程式碼免費。這是我一直在追的同一條線：可信度靠的是流程，不是模型多大。之前寫[全自動 AI 研究系統 FARS 一口氣產 166 篇論文卻解錯了題](/articles/fars-ai-research-validation-bottleneck/)，講的就是產出量爆炸之後，瓶頸整個移到「這些東西誰來驗、驗得動嗎」。也寫過 [AI 證出數學定理、還用 Lean 4 逐行機器驗證](/articles/ai-theorem-proving-lean-verifiable/)，那篇的重點不是 AI 多會證，是它的產物第一次能被機器查證，驗證這一格終於有解。

把這兩篇疊到今天這篇論文上，結論很一致：LLM 讓「生成」變便宜，於是整條價值鏈裡最貴的那一格，變成「驗證」。你可以三秒生出一千行程式，但你沒辦法三秒確定這一千行不會在某個邊界情況把生產環境弄垮。生成端越自動，驗收端的責任越重，這不是巧合，是同一件事的兩面。

<img src="/images/disposable-code-llm-reasoning-engine-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程師檢視螢幕上複雜的程式碼，象徵邊界情況與稽核需求不會因程式碼變便宜而消失">

## 先踩個剎車：是可塑，不是拋棄

「程式碼用完即丟」講起來很爽，但這裡要踩一個剎車。研究者 Andreas Kirsch 寫過一篇[《The Flawed Ephemeral Software Hypothesis》](https://www.blackhc.net/essays/future_of_software/)，直接反對「軟體會變成拋棄式」這個假設。他引 Karpathy 那句[「程式碼突然變得免費、短暫、可塑、用一次就丟」](https://www.blackhc.net/essays/future_of_software/)，然後說：這句話只在小型、拋棄式的任務成立，換到正式系統就不成立。

他的理由很扎實，也很符合我對這類命題的態度。邊界情況要靠實際上線才長得出來，你把程式碼整段重生，等於把這些累積的知識一起丟掉；狀態與整合面、稽核可查性、介面穩定性，這幾樣都要求「留下正式、持久的產物」，不是留一段自然語言的需求描述就算數。他的結論是：軟體會變得**可塑（malleable）**，改起來更快，但程式碼、測試、schema、營運紀錄還是要留著，這跟「拋棄式」是兩回事。台灣有個現成的例子可以對照：[Godot 引擎乾脆明文拒收 AI 寫的程式碼](/articles/godot-bans-ai-code/)，理由正是責任與可維護性，不是效能。程式碼變便宜，不代表維護變便宜。

<img src="/images/disposable-code-llm-reasoning-engine-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="科技產業工程師在工作，象徵台灣軟體業在驗證與領域知識上的卡位點">

## 台灣軟體業該讀出什麼

台灣談 AI 常常只看硬體，軟體這一格反而容易被這種論文嚇到，覺得「連寫程式都被 LLM 吃了，還剩什麼」。這是看歪的方向。如果稀缺性真的搬到驗證與責任這一邊，那台灣軟體業的卡位點就很清楚：不是去跟大廠拼生成速度、拼 coding agent 誰比較快，那一格已經在快速商品化，[連 AI 寫程式工具自己都在一個月內改名又改計價](/articles/ai-coding-tools-repricing/)，護城河很淺。真正值錢的，是把特定領域的驗收標準、法遵要求、責任歸屬做進流程裡。

醫療、金融、公部門這些台灣有真實場景又管很嚴的領域，正好是「生成便宜、驗證昂貴」最極端的地方。一段自動生成的病歷摘要程式，寫得再快，只要驗不動就不能用。誰能把「這段 AI 產物到底能不能上線」這件事做成可重複、可稽核的流程，誰就握住了搬過去的那份稀缺性。看懂論文改的是哪個定義，比背下「程式碼變免費」這句口號重要。

<h2>常見問題</h2>

<p><strong>這篇論文是說工程師會被 LLM 取代嗎？</strong><br>不是。arXiv:2604.10599 的主張是程式碼變成可拋棄的商品，但它同時強調協調、驗證與問責這三件事仍然要人來扛，還特別指出問責無法自動化。它講的是工程師的工作重心從「手寫程式」移到「設計、驗證、負責」，不是這個角色消失。</p>

<p><strong>「程式碼用完即丟」到底是什麼意思？</strong><br>指 LLM 依需求即時生成一段程式、跑完就丟，下次需求來了再生一段，程式碼變成耗材而非長期資產。這在 arXiv:2502.04747 這種把程式碼動態注入執行環境的設計裡最明顯。但這個模式目前主要適用小型、拋棄式任務，正式系統仍需要保留程式碼、測試與紀錄。</p>

<p><strong>如果程式碼變便宜，那軟體工程最值錢的變成什麼？</strong><br>驗證與責任歸屬。當生成的邊際成本趨近零，瓶頸就從「會不會寫」移到「寫出來對不對、能不能上線、出事誰負責」。把特定領域的驗收標準與稽核做成可重複的流程，會是價值最集中的地方。</p>

<p><strong>台灣軟體業該怎麼因應？</strong><br>不要去拼生成速度那一格，那已經在商品化。把力氣放在醫療、金融、公部門這類「生成便宜、驗證昂貴」的領域，做深驗收標準、法遵與責任流程，這才是搬不走的護城河。</p>
