---
title: "微軟砸 25 億美元成立 Frontier Company：不賣現成 AI，派工程師進駐企業做落地"
slug: "microsoft-frontier-forward-deployed-ai"
description: "微軟 7 月 2 日成立 Frontier Company，投入 25 億美元、6000 名工程師派駐企業客製 AI 落地。同月亞馬遜、OpenAI、Anthropic 都在做前進部署工程。四家集體轉向揭露一件事：企業 AI 卡的不是模型強不強，是落地做不出來；台灣該卡的位置在落地服務這一段。"
excerpt: "為什麼微軟不賣現成 AI，反而派 6000 名工程師坐進客戶辦公室？因為 MIT 調查顯示 95% 企業 AI 試點對損益毫無貢獻，瓶頸在落地不在模型。四家巨頭同月轉向，台灣的機會在本地落地服務這一段。"
publishDate: "2026-07-20T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["微軟 Frontier", "企業 AI 落地", "前進部署工程", "AI 商品化", "台灣系統整合"]
coverImage: "covers/microsoft-frontier-forward-deployed-ai.webp"
coverAlt: "象徵微軟派工程師進駐企業、把 AI 做到能落地的抽象示意"
coverImageCredit: "Photo by Mikhail Nilov on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "微軟 7/2 成立 Frontier Company、投 25 億美元與 6000 名工程師，做法反常：不賣現成工具，派自家工程師進駐客戶端共同建置與維運 AI 系統。"
  - "同月亞馬遜投 10 億、OpenAI 與 Anthropic 五月各自成立部署事業；四家頂尖 AI 公司集體轉向落地服務，等於承認模型正在商品化，賺頭往『幫你把 AI 用起來』那層移。"
  - "MIT 報告指 95% 企業生成式 AI 試點對損益無貢獻、根因是學習落差非模型品質；台灣企業卡在同一段，機會在懂產業懂資料懂流程的本地落地服務，而非追模型。"
references:
  - title: "Microsoft Frontier Company: AI engineering that amplifies and protects your intelligence"
    url: "https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/"
    publisher: "The Official Microsoft Blog"
  - title: "Microsoft launches its own AI deployment company with $2.5 billion commitment"
    url: "https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/"
    publisher: "TechCrunch"
  - title: "Microsoft launches $2.5B Frontier Company for enterprise AI"
    url: "https://techwireasia.com/2026/07/microsoft-frontier-company-enterprise-ai-deployments/"
    publisher: "Tech Wire Asia"
  - title: "MIT report: 95% of generative AI pilots at companies are failing"
    url: "https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/"
    publisher: "Fortune"
  - title: "Why 40% Of Agentic AI Projects May Be Canceled By 2027"
    url: "https://www.forbes.com/sites/robertszczerba/2026/07/07/why-40-of-agentic-ai-projects-may-be-canceled-by-2027/"
    publisher: "Forbes"
originalContribution: "本文把微軟 Frontier 放進亞馬遜、OpenAI、Anthropic 同月成立落地部隊的脈絡裡並列比對，交叉 MIT『95% 試點失敗、根因是學習落差』與 Gartner『四成 agentic 專案將被砍』兩份數據，論證企業 AI 瓶頸在落地非模型，並據此評估台灣中型企業碰不到巨頭 FDE 軍團、機會反而在本地系統整合與落地顧問這一層的卡位邏輯。"
---

微軟花 25 億美元、調 6000 名工程師，成立一間叫 Microsoft Frontier Company 的新事業，做法很反常：不賣你一套現成軟體就走，而是把自家工程師派進你公司，坐在你的辦公室裡幫你把 AI 做到能用。這不是微軟一家的怪招。同一個月，亞馬遜、OpenAI、Anthropic 全在做同一件事。四家一起轉向，等於集體承認一件事：企業 AI 這兩年卡住的，從來不是模型不夠強，是落地做不出來。

先把這間公司講清楚。[微軟 7 月 2 日宣布](https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/)成立 Frontier Company，[投入 25 億美元、6000 名產業與工程專家](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)，由曾任微軟亞洲區總裁的 Rodrigo Kede Lima 領軍，商業事業群執行長 Judson Althoff 對外說明。運作方式業界叫「前進部署工程」（forward-deployed engineering，FDE）：廠商把自己的技術人員派到客戶現場，跟客戶一起設計、建置、部署、持續維運 AI 系統，而不是賣一套工具、做完教育訓練就閃人。早期客戶是聯合利華、諾和諾德、倫敦證交所集團這種等級的大企業。微軟還特別強調一件事：[客戶用自己資料長出來的 AI 系統、工作流程與商業知識，所有權留在客戶手上](https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/)，資料與智慧財產不會被拿去訓練模型、稀釋掉客戶的競爭優勢。

<img src="/images/microsoft-frontier-forward-deployed-ai-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="工程師在企業辦公室協作，象徵微軟派人進駐客戶端做 AI 落地">

微軟不承認這叫 FDE。Althoff [說這「超越目前被稱為前進部署工程的做法」](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)，要做「業界規模最大、最以成果為導向的工程組織」。名詞之爭先放一邊，真正該看的是時間點。[亞馬遜 6 月 30 日才投 10 億美元做同樣的嵌入式工程團隊](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)，OpenAI 五月成立自己的部署公司，Anthropic 也傳出在籌類似的企業服務事業。連老牌的 Palantir 本來就是靠這套 FDE 模式做起來的。四家頂尖 AI 公司在同一季把大錢押在「派人進駐」，這不是巧合，是集體判斷：模型本身正在商品化，賺頭往「幫你把模型用起來」這一層移。

<img src="/images/microsoft-frontier-forward-deployed-ai-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業會議室裡的策略討論，象徵四家 AI 巨頭同月押注落地服務的資本競賽">

這裡要追一個根因。過去兩年企業砸錢導入 AI，成效卻普遍難看，很多人第一個反應是模型還不夠聰明、再等下一代就好。這個方向是錯的。[MIT 去年的報告分析了 300 個企業 AI 部署，發現 95% 的生成式 AI 試點對損益幾乎沒有可衡量的貢獻](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/)，而報告點出的根因不是模型品質，是「學習落差」：通用工具像 ChatGPT 對個人好用是因為它彈性，但塞進企業就卡住，因為它不會學你的工作流程、不會跟著你的流程調整。[Gartner 也預測到 2027 年底，超過四成的 agentic AI 專案會被砍掉](https://www.forbes.com/sites/robertszczerba/2026/07/07/why-40-of-agentic-ai-projects-may-be-canceled-by-2027/)，原因是成本失控、商業價值不清、風險控管不足，一樣沒有一條是「模型不夠強」。

翻成白話：企業 AI 的瓶頸從來在落地那一段，不在模型那一段。我一直在講[可信度靠的是落地流程設計，不是模型選哪個](/articles/medical-ai-compliance-gatekeeper-engine/)：問題定義、資料供給、角色設計、驗證機制、責任歸屬，缺一個就在那裡出問題。四家巨頭花大錢派工程師進駐，等於用真金白銀承認了同一件事：賣模型解決不了落地，落地要人坐進去一起解。

<img src="/images/microsoft-frontier-forward-deployed-ai-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="下滑的圖表與數據分析，象徵企業 AI 專案高失敗率卡在落地而非模型">

那台灣呢？台灣企業卡在同一個地方，而且卡得更前面。就算不看國外報告，本地的產業調查也顯示多數企業還在概念驗證（PoC）打轉，過不了關的原因不外乎數據基礎不夠、找不到明確的商業案例、人才缺口。這些全是落地問題，不是模型問題。

但這裡要踩個剎車。微軟這 6000 人的部隊，打的是聯合利華、諾和諾德這種規模的客戶。台灣絕大多數是中型企業，不會有微軟工程師飛來坐進你辦公室。指望巨頭的 FDE 軍團順手把台灣中型企業的落地一起解掉，是想太多。

<img src="/images/microsoft-frontier-forward-deployed-ai-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣城市商業區街景，象徵台灣企業同樣卡在 AI 落地的數據、商業案例與人才三缺">

真正的機會在本地那一層。當 AI 的價值從「模型多強」移到「有沒有人幫你把它塞進流程」，稀缺的技能就變成：懂你這個產業、懂你的資料、懂你的流程，能把 AI 做到能用的那種前進部署工程。這正是台灣的系統整合商（SI）、落地顧問、甚至製造業自己的資訊團隊該卡的位置，而不是去追誰的提示詞寫得漂亮。微軟自己也把 Accenture、Capgemini、勤業眾信這類系統整合商列進[合作夥伴生態系](https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/)，因為它一家吃不下所有落地需求，這個縫隙就是本地服務商的機會。

不過巨頭派工程師坐進你公司，也有要提防的一面。微軟這麼用力強調[資料與智慧財產歸客戶、「不會吃掉被部署企業的智慧」](https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/)，執行長 Nadella 甚至說沒有一種社會授權，允許一個會吃掉它所部署企業智慧的 AI 未來，反過來讀，正說明這是企業最大的疑慮。工程師嵌得愈深，對單一供應商的依賴愈重，換供應商的成本愈高。微軟這輪主打[能幫客戶在 OpenAI、Anthropic 與開源模型之間評估與切換](https://techwireasia.com/2026/07/microsoft-frontier-company-enterprise-ai-deployments/)，表面是彈性，底層仍是把你綁進它的平台與方法論。要不要讓別人的工程師坐進自己的核心流程，是一筆要算清楚的帳，不是簽了約就沒事。我之前寫[平台層「去單一供應商」對企業選型的訊號](/articles/microsoft-foundry-multi-model-optionality/)，講的就是這條要提防的線。

<img src="/images/microsoft-frontier-forward-deployed-ai-s5.webp" width="960" height="639" loading="lazy" decoding="async" alt="機房與系統整合場景，象徵本地系統整合商與落地顧問是台灣的卡位點">

把這則新聞讀成「微軟又推一個 AI 服務」，就看小了。四家頂尖 AI 公司同一季集體轉去做落地服務，是 AI 產業的價值鏈正在往下沉的訊號：錢從「誰的模型最強」，移到「誰能把 AI 真的用進企業的流程裡」。這也呼應[OpenAI 這類公司把重心從刷 benchmark 轉向真實部署](/articles/openai-deployment-simulation-evaluation-gap/)的同一個方向。台灣要卡的位置，不在模型那一格，那格早就是巨頭的主場，而在落地這一段：懂產業、懂資料、懂流程的那種能力，現在就該長出來。看懂這波在轉什麼，比記住 25 億這個數字重要。

<img src="/images/microsoft-frontier-forward-deployed-ai-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="抽象的技術網路分層示意，象徵 AI 價值鏈從模型往落地服務下沉">

<h2>常見問題</h2>

<p><strong>什麼是「前進部署工程」（forward-deployed engineering）？</strong><br>指 AI 廠商把自家工程師派到客戶公司現場，跟客戶一起設計、建置、部署與維運 AI 系統，而不是賣一套工具就離開。微軟 Frontier Company 用 [25 億美元、6000 名工程師](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)做的就是這件事，Palantir 更早就靠這套模式做起來。核心差別在於責任跟著人走進客戶的實際流程，不只交付軟體。</p>

<p><strong>微軟 Frontier Company 跟一般 IT 顧問或系統整合有什麼不同？</strong><br>方向類似，但微軟強調兩點：一是以「可衡量的商業成果」而非交付專案為目標，二是[客戶用自己資料長出的 AI 系統與知識所有權留在客戶手上](https://blogs.microsoft.com/blog/2026/07/02/microsoft-frontier-company-ai-engineering-that-amplifies-and-protects-your-intelligence/)、不拿去訓練模型。實務上它仍會把你更深地綁進微軟的平台與方法論，換供應商的成本要先算清楚。</p>

<p><strong>為什麼微軟、亞馬遜、OpenAI 幾乎同時做這件事？</strong><br>因為模型本身正在商品化，價值往「幫企業把 AI 用起來」的落地那層移。[亞馬遜 6 月 30 日投 10 億美元做嵌入式工程團隊](https://techcrunch.com/2026/07/02/microsoft-launches-its-own-ai-deployment-company-with-2-5-billion-commitment/)、OpenAI 與 Anthropic 五月各自成立部署事業，四家在同一季集體轉向，等於承認賣模型賺不到最大的那塊，落地服務才是。</p>

<p><strong>台灣中小企業用得到微軟 Frontier 嗎？</strong><br>多數用不到。這 6000 人的部隊打的是聯合利華、諾和諾德這種規模的客戶，台灣中型企業不會有微軟工程師飛來進駐。台灣企業的落地缺口，比較實際的解法是本地系統整合商與落地顧問，以及企業自己養出懂產業、懂資料、懂流程的落地能力。</p>
