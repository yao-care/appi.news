---
title: "Karpathy 加入 Anthropic：頂尖 AI 研究員往哪流，前沿話語權就往哪走"
slug: "karpathy-anthropic-talent-frontier"
description: "Karpathy 5/19 加入 Anthropic 預訓練團隊，這不是孤立挖角，而是這半年頂尖研究員一整條人才潮的座標。前沿話語權跟著人走，真正的訊號在他要做的事與人流背後的股權結構；台灣該讀懂的不是搶不到明星，而是研究人力被 AI 壓縮後的位置。"
excerpt: "為什麼判斷哪家 AI 實驗室站上前沿，看頂尖研究員的流向比看 benchmark 分數準？因為料、算力、方法都會擴散，能把它們兜起來跑得最快的少數人不會。"
publishDate: "2026-08-11T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["Karpathy", "Anthropic", "AI 人才戰", "大型語言模型", "台灣供應鏈"]
coverImage: "covers/karpathy-anthropic-talent-frontier.webp"
coverAlt: "象徵頂尖 AI 研究員流向決定前沿話語權的抽象網路節點示意"
coverImageCredit: "Photo by Google DeepMind on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Karpathy 5 月 19 日加入 Anthropic 預訓練團隊、由 Nick Joseph 帶隊，任務是用 Claude 加速預訓練研究；同期 John Jumper 等 DeepMind 研究員也轉投 Anthropic，人才明顯往這裡集中。"
  - "這波人才潮的底層引擎是上市前股權：Anthropic 五月底完成 650 億美元 H 輪、投後估值 9,650 億美元並準備上市，上檔空間是已上市的 Google 難以匹敵的誘因結構。"
  - "最該劃線的訊號不是名字，是『用 AI 加速 AI 研究』會壓縮單純人力的價值；台灣該警覺的是靠『堆工程師人月』的代工思維，可能比硬體更早受衝擊。"
references:
  - title: "OpenAI co-founder Andrej Karpathy joins Anthropic's pre-training team"
    url: "https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/"
    publisher: "TechCrunch"
  - title: "AI researchers continue to leave Google for its rivals"
    url: "https://techcrunch.com/2026/06/24/ai-researchers-continue-to-leave-google-for-its-rivals/"
    publisher: "TechCrunch"
  - title: "As top talent leaves Google DeepMind, some question if the lab can remain at the forefront of AI development"
    url: "https://fortune.com/2026/06/23/google-deepmind-ai-researcher-departures-raise-doubts-about-ability-to-win-the-ai-race-shazeer-jumper-eye-on-ai/"
    publisher: "Fortune"
  - title: "Anthropic raises $65B in Series H funding at $965B post-money valuation"
    url: "https://www.anthropic.com/news/series-h"
    publisher: "Anthropic"
originalContribution: "本文把 Karpathy 加入 Anthropic 放回 2026 年 5 到 6 月整條研究員人才潮（Jumper、Adler、Pritzel、反向被 OpenAI 挖走的 Shazeer）裡判讀，提出『人才流向＝前沿話語權指標』的分析框架，追因到上市前股權的誘因結構與『用 AI 加速 AI 研究』對單純人力價值的壓縮，並延伸評估台灣硬體供應鏈與人月代工思維的受衝擊順序。"
---

判斷哪一家 AI 實驗室真的站在前沿，看頂尖研究員的流向，比看任何 benchmark 分數都準。模型權重會外流、論文會公開、算力可以用錢買，唯一不會被複製的，是能把這些兜在一起、跑得最快的那少數人。5 月 19 日 Andrej Karpathy 宣布加入 Anthropic，不是一次孤立的挖角，是這半年一整條人才潮的其中一個座標。真正該劃線的不是他的名字，是他要去做的那件事，還有人往這個方向流的結構性理由。

<img src="/images/karpathy-anthropic-talent-frontier-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵 Karpathy 加入 Anthropic 預訓練團隊、投入大型語言模型前沿研發的抽象示意">

先把事情講清楚。Karpathy 是 OpenAI 的創始成員之一，離開後帶過 Tesla 的自動輔助駕駛（Autopilot 與全自動輔助駕駛 FSD），2024 年再創辦做 AI 教育的 Eureka Labs。這次他[加入 Anthropic 的預訓練（pre-training）團隊，帶隊的是 Nick Joseph](https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/)，任務是啟動一個新方向：用 Claude 本身去加速預訓練研究。他自己的說法很直白：「我加入了 Anthropic。我認為接下來幾年在大型語言模型的前沿會特別關鍵，我很興奮能回到研發。」同一時間 Anthropic 也把資安老將 Chris Rohlf（待過 Meta、Yahoo）找進負責安全壓力測試的前沿紅隊。一個做研究、一個做防線，補的都是最靠近前沿的位置。

<img src="/images/karpathy-anthropic-talent-frontier-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵一整波頂尖研究員在各大 AI 實驗室之間流動的節點與箭頭示意">

把時間軸拉長，這不是單一事件。六月，Google DeepMind 連續失血：拿過 2024 年諾貝爾化學獎、做出 AlphaFold 的 [John Jumper 在 6 月 20 日宣布轉投 Anthropic](https://techcrunch.com/2026/06/24/ai-researchers-continue-to-leave-google-for-its-rivals/)，同組的 Jonas Adler、Alexander Pritzel 也跟著去；另一頭，做出 LaMDA 的 Noam Shazeer 反向被 OpenAI 挖走，Google 甚至用 27 億美元把他先前創的 Character.AI 收下來換人回鍋。[這一連串出走讓 Google 股價一度下跌超過 5%](https://fortune.com/2026/06/23/google-deepmind-ai-researcher-departures-raise-doubts-about-ability-to-win-the-ai-race-shazeer-jumper-eye-on-ai/)，市場開始質疑 DeepMind 是不是正在掉出領先群。人才不是均勻流動，是明顯往 Anthropic 和 OpenAI 這兩個方向集中。前沿話語權正在重新分配，而分配的方式，就寫在這些出走名單裡。

<img src="/images/karpathy-anthropic-talent-frontier-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵上市前股權成為挖角磁鐵的財務成長曲線抽象示意">

很多人第一個反應是「Anthropic 錢多、名氣響，當然搶得到人」。這個讀法沒有錯，但只到這一步就會解錯題。真正的磁鐵是股權的上檔空間。Anthropic 五月底剛[完成 650 億美元的 H 輪、投後估值衝到 9,650 億美元](https://www.anthropic.com/news/series-h)，而且正在準備上市。對一個手上抱著 Google 限制型股票、每年穩定解鎖的研究員來說，換到一家上市前、股權還有數倍想像空間的公司，這筆帳算得過來。這不是情懷，是誘因結構。看懂這一層才知道：這波人才潮的底層引擎是上市前的股權賭注，不是誰的願景比較動人。

<img src="/images/karpathy-anthropic-talent-frontier-s4.webp" width="960" height="960" loading="lazy" decoding="async" alt="象徵用 AI 加速 AI 研究、形成自我加速迴圈的電路抽象示意">

但整件事最該被劃線的，是 Karpathy 要做的那件具體工作：用 Claude 去加速預訓練研究。這句話翻成白話，是 AI 開始被拿去加速 AI 自己的研發迴圈。它改變的是「話語權」的定義。過去比的是誰的 GPU 多、誰的團隊人頭多；當研究本身能被模型加速，單純堆人力的邊際價值就被壓下去，真正稀缺的變成能設計問題、能指揮這個「人加模型」迴圈的少數人。Anthropic 賭的不是純算力堆到贏，是[靠 AI 輔助研究這條路徑跟 OpenAI、Google 保持競爭](https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/)。它找 Karpathy，找的正是能把這個迴圈定義清楚的人。這才是這次挖角比任何股權數字更重要的訊號。

<img src="/images/karpathy-anthropic-talent-frontier-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵台灣半導體與硬體供應鏈在 AI 前沿位置的電路板特寫示意">

那台灣該從這條新聞讀出什麼？先擋掉一個沒營養的讀法：這不是「我們搶不到 Karpathy」的故事，台灣本來就不在前沿研究話語權那一格。我們的位置在硬體供應鏈。我之前寫過[Anthropic 走向 IPO、資本市場怎麼讀它的算力供應鏈](/articles/anthropic-ipo-compute-supply-chain-signal/)，也寫過[中國 AI 資本這盤棋、台廠供應鏈該怎麼接](/articles/deepseek-capital-taiwan-supply-chain/)，講的都是同一件事：台灣接的是「讓 AI 跑起來」的那一段，不是「決定 AI 怎麼研究」的那一段。真正該警覺的是另一件事。如果前沿連「研究人力」都能用 AI 壓縮，那台灣長年靠「堆工程師人月」接案、代工的思維，會比硬體更早受衝擊。值得先卡的位置，是能定義問題、能指揮 AI 迴圈的那種角色，不是可以被模型替換掉的人月。這裡要踩個剎車：這波才剛開始，Anthropic 自己也只是押注，用 AI 加速研究能不能真的兌現還沒有定論。但方向已經很清楚。

<img src="/images/karpathy-anthropic-talent-frontier-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="象徵看人流方向判讀前沿話語權走向的策略指向抽象示意">

看人流，比看單一公告重要。一次挖角可以是偶然，一整季的人往同一個方向流不是。Karpathy 這一步值得記住的，不是他從哪裡來、簽了多少，而是他要去解的問題告訴我們：前沿的競爭正在從「誰算力多」轉成「誰能讓少數頂尖研究員加上模型跑得最快」。看懂人往哪走，比記住任何一個估值數字都有用。

<h2>常見問題</h2>

<p><strong>Karpathy 是誰，他加入 Anthropic 為什麼重要？</strong><br>Karpathy 是 OpenAI 創始成員之一，也帶過 Tesla 的自動輔助駕駛，是少數同時懂大型語言模型理論與大規模訓練實務的人。他[加入 Anthropic 的預訓練團隊](https://techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team/)，要啟動用 Claude 加速預訓練研究的新方向，代表 Anthropic 把最靠近前沿的位置交給他，也是這半年頂尖研究員往 Anthropic 集中的其中一步。</p>

<p><strong>為什麼這麼多頂尖研究員選 Anthropic，而不是留在 Google？</strong><br>主因是股權的上檔空間。Anthropic 五月底完成 650 億美元 H 輪、[投後估值 9,650 億美元](https://www.anthropic.com/news/series-h)並準備上市，上市前的股權想像空間是已上市的 Google 難以比拚的。同期 Google DeepMind 接連流失 John Jumper 等人，[股價一度跌逾 5%](https://fortune.com/2026/06/23/google-deepmind-ai-researcher-departures-raise-doubts-about-ability-to-win-the-ai-race-shazeer-jumper-eye-on-ai/)。</p>

<p><strong>「用 Claude 加速預訓練研究」是什麼意思？</strong><br>就是把 AI 拿去加速 AI 自己的研發，讓模型幫忙做原本靠研究員人力推進的預訓練實驗。它的意義在於：當研究能被模型加速，單純堆人力的價值下降，能設計問題、指揮「人加模型」迴圈的少數人變得更稀缺。</p>

<p><strong>台灣在這波 AI 人才流動裡該擔心什麼？</strong><br>不是擔心搶不到明星研究員，台灣的位置本來就在硬體供應鏈。真正該警覺的是：如果前沿連研究人力都能用 AI 壓縮，靠「堆工程師人月」接案、代工的模式會比硬體更早受衝擊，該卡的是能定義問題的角色，而不是可被替換的人月。</p>
