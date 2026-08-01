---
title: "OpenAI 端出 LifeSciBench：AI 做生命科學研究只過三成，而且裁判是自家"
slug: "openai-lifescibench-self-graded"
description: "OpenAI 發布自家設計的生命科學研究評測 LifeSciBench，750 題真實研究任務，連自家最強模型 GPT-Rosalind 都只過 36.1%、失敗近六成四。這個數字值得看，但更該看的是握尺的人：出題、評分、秀成績的都是 OpenAI 自己。"
excerpt: "AI 連自家出的生命科學考卷都只過三成，這件事該怎麼讀？分數是一回事，出題兼改考卷兼頒獎的是同一個人，又是另一回事。"
publishDate: "2026-07-15T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags:
  - "藥物研發"
  - "生成式AI"
  - "AI治理"
  - "生技產業"
coverImage: "covers/openai-lifescibench-self-graded-cover.webp"
coverAlt: "藥物研發相關情境（示意圖）"
coverImageCredit: "Photo by Trnava University on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "OpenAI 的 LifeSciBench 由 173 位 PhD 科學家出 750 題真實研究任務，最強的自家模型 GPT-Rosalind 只過 36.1%，等於失敗近六成四；GPT-5.5 更只有 25.7%。"
  - "真正的訊號不是分數低，是崩跌的位置：純文字題還有 45.1%，一旦要讀真實圖表、序列檔或連結就掉到 28.1%。研究不是問答，是對雜亂真實資料下判斷。"
  - "出題、評分、拿來當範例秀成績的都是 OpenAI 自己，還把 Claude 排除在比較之外、沒放人類基準線；不管分數高低，自己握尺的成績單先天少一層可信度。"
references:
  - title: "OpenAI Releases LifeSciBench, a 750-Task Benchmark Grading AI Models on Real Life-Science Research With Expert-Written Rubric"
    url: "https://www.marktechpost.com/2026/06/17/openai-releases-lifescibench-a-750-task-benchmark-grading-ai-models-on-real-life-science-research-with-expert-written-rubric/"
    publisher: "MarkTechPost"
  - title: "OpenAI Announces Benchmarks for AI Life Sciences Research. Its Best Model Failed 63.9% of the Test"
    url: "https://science.slashdot.org/story/26/06/20/202204/openai-announces-benchmarks-for-ai-life-sciences-research-its-best-model-failed-639-of-the-test"
    publisher: "Slashdot"
  - title: "LifeSciBench: OpenAI's Hard New Life-Science Benchmark and How GPT-Rosalind Stacks Up"
    url: "https://labcritics.com/blog/2026/06/19/lifescibench-openais-hard-new-life-science-benchmark-and-how-gpt-rosalind-stacks-up/"
    publisher: "Labcritics"
  - title: "OpenAI Unveils LifeSciBench"
    url: "https://www.startuphub.ai/ai-news/artificial-intelligence/2026/openai-unveils-lifescibench"
    publisher: "StartupHub.ai"
originalContribution: "本文把 LifeSciBench 拆成兩層分開讀：一層是『分數與崩跌位置』的技術訊號（文字題 45.1% 對上真實資料題 28.1%，指出瓶頸在讀真實研究產物而非知識背誦），另一層是『誰握尺』的誘因結構問題（OpenAI 自出自評自秀、排除 Claude、無人類基準），並據此給台灣生技產業一套『看基準先看握尺的人』的判讀框架。"
column: "ai-healthcare"
topics: ["medical-ai-frontline"]
---

OpenAI 剛端出一套自己設計的生命科學研究評測 LifeSciBench，結果連它家最強的模型都只過了 36.1% 的題目，[等於六成四的真實研究任務直接不及格](https://science.slashdot.org/story/26/06/20/202204/openai-announces-benchmarks-for-ai-life-sciences-research-its-best-model-failed-639-of-the-test)。這個數字本身值得看。但更值得看的是握尺的人：出題的是 OpenAI、改考卷的是 OpenAI、被拿出來當範例秀成績的還是 OpenAI 自家模型。一份自己出題、自己改考卷、自己頒獎的成績單，不管分數高低，先天就少一層可信度。

<img src="/covers/openai-lifescibench-self-graded.webp" width="868" height="1300" loading="lazy" decoding="async" alt="AI 進入生命科學實驗室、接受真實研究任務評測的示意">

先把這份考卷是什麼講清楚。

## LifeSciBench 到底在考什麼

LifeSciBench 不是那種「請問這個基因的功能是什麼」的問答題。OpenAI 找了 [173 位有生技與製藥實務經驗的博士級科學家，出了 750 道題，橫跨七種研究工作流程與七個生物領域](https://www.startuphub.ai/ai-news/artificial-intelligence/2026/openai-unveils-lifescibench)，題目涵蓋證據處理、實驗設計與最佳化、科學推理、驗證與操作、轉譯，還有科學溝通。每題不是對一個標準答案，而是配一份專家寫的評分量表；[全套 750 題加起來有 19,020 條評分準則，平均每題 25 條](https://www.marktechpost.com/2026/06/17/openai-releases-lifescibench-a-750-task-benchmark-grading-ai-models-on-real-life-science-research-with-expert-written-rubric/)，用來給部分分數。

<img src="/images/openai-lifescibench-self-graded-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="基因定序與生命科學實驗室，象徵 LifeSciBench 的真實研究任務">

這件事本身做得對。真實的研究工作長什麼樣？是在證據不完整時做判斷、把互相矛盾的結果兜攏、設計一個難做的實驗、排查跑不出來的檢測、評估一個發現能不能真的用到人身上。這些沒有一題像考選擇題。一個評測願意去逼近這種「真實研究決策」，比起那種刷到飽和、大家都 95 分的知識背誦題，訊號誠實得多。問題不在題目，題目出得好。

## 那個 36.1%，訊號在崩跌的位置

先看分數。最強的 GPT-Rosalind 過 36.1%，[比前一代 GPT-5.5 的 25.7% 高一截，其餘 Gemini 3.1 Pro 拿 23.6%、Grok 4.3 只有 13.0%](https://www.marktechpost.com/2026/06/17/openai-releases-lifescibench-a-750-task-benchmark-grading-ai-models-on-real-life-science-research-with-expert-written-rubric/)。全場沒有任何一個模型過半，這份卷子還很遠沒被解掉。

但分數高低不是重點，崩跌的位置才是。同一個 GPT-Rosalind，[純文字題還能拿 45.1%，一旦題目要它去讀真實的圖表、大型序列檔或連結，就掉到 28.1%](https://labcritics.com/blog/2026/06/19/lifescibench-openais-hard-new-life-science-benchmark-and-how-gpt-rosalind-stacks-up/)。這才是這份評測講出來最有用的一句話：模型不是不會講生物學，是一碰到真實研究產物就撐不住。科學溝通那類「把東西講清楚」的題目它能到七成，換到要處理數字、要動手分析的題目就只剩三成上下。

<img src="/images/openai-lifescibench-self-graded-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="科學數據圖表與分析畫面，象徵 AI 讀真實研究資料時分數崩跌">

用我常講的框架來看，這是解對題還是解錯題的差別。研究不是問答，是對一堆雜亂、不完整、互相打架的真實資料下判斷。你要它背知識，它很行；你要它讀你實驗跑出來的那張圖、那個序列、那份髒資料，再告訴你下一步該做什麼，它就露餡了。落差不在模型聰不聰明，在它有沒有能力接住真實世界丟過來的那些料。這跟聊天視窗裡問它一句它答得漂亮，是兩回事。

## 裁判是自家，這件事要單獨講

分數怎麼讀是一層，誰在給分是另一層，得分開講。LifeSciBench 有個結構性問題：[這是 OpenAI 出的評測、由 OpenAI 評分、拿來展示 OpenAI 的模型](https://labcritics.com/blog/2026/06/19/lifescibench-openais-hard-new-life-science-benchmark-and-how-gpt-rosalind-stacks-up/)。同一篇分析還點出兩件事：在科學工具裡被大量使用的 Claude，被排除在這次模型比較之外；而且整份成績單沒有放一條人類科學家的基準線，你根本不知道 36.1% 對一個真正的研究員來說算好還算差。

<img src="/images/openai-lifescibench-self-graded-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="哨子與裁判意象，象徵出題與評分由同一方掌握的利益衝突">

我不是在說數字造假。有 453 位外部專家審過題目品質，題目本身可信。要踩剎車的是另一件事：當出題、選手名單、改考卷、寫新聞稿全在同一家手上，這份東西的性質就從「評測」滑向「行銷」。判斷一個訊號值不值得信，看的不是它聰不聰明，而是它的[運作機制裡有沒有讓它需要粉飾的結構性理由](/articles/llm-no-incentive-to-exploit/)。自家握尺、又拿自家模型當範例，粉飾的動機就結構性地存在，跟誠不誠實無關。你看一份基準之前，得先問一句：這把尺是誰做的、誰在量。

## 台灣生技要從這讀出什麼

先擋一個常見誤讀：這份成績單不是在說「AI 快能取代科學家了」。連 OpenAI 自己的敘事都收斂到[「今天的 AI 離自主科學家還很遠，能幫忙、能協助，但無法可靠地取代研究所需的專業判斷」](https://science.slashdot.org/story/26/06/20/202204/openai-announces-benchmarks-for-ai-life-sciences-research-its-best-model-failed-639-of-the-test)。台灣生技與精準醫療圈要接的，不是排行榜上誰又多兩分，是那個崩跌位置指出來的真正工作在哪。

<img src="/images/openai-lifescibench-self-graded-s4.webp" width="867" height="1300" loading="lazy" decoding="async" alt="生技實驗室的精密操作，象徵台灣生技產業的落地流程與資料能力">

模型從 45.1% 掉到 28.1% 那一段，就是價值所在。真正難、真正還沒被做好的，是把實驗室跑出來的真實資料，乾淨地、可驗證地餵給模型，再把它的輸出接回研究流程。這件事拚的不是模型大小，是[落地流程：問題定義、資料供給、角色設計、驗證機制、責任歸屬，缺一個就在那裡出問題](/articles/llm-healthcare-promise-limits/)。台灣手上有臨床資料、有製程資料、有實驗現場，這些恰好是模型最撐不住的那一格；要卡的位是把這條資料到判斷的管線做紮實，不是去追誰的模型又刷高幾分。

看懂這則新聞的正確方式，是把兩件事分開放：一個是「AI 讀真實研究資料還很弱」的技術事實，這是真的，也指出了機會；另一個是「出題兼改考卷兼頒獎」的可信度問題，這讓分數本身不能盡信。看基準先看握尺的人，比記住 36.1% 這個數字重要。

<h2>常見問題</h2>

<p><strong>LifeSciBench 是什麼？AI 真的只過三成嗎？</strong><br>LifeSciBench 是 OpenAI 2026 年 6 月發布的生命科學研究評測，由 173 位博士級科學家出 750 道真實研究任務，用專家寫的評分量表打分。最強的模型 GPT-Rosalind 只過 36.1%，<a href="https://science.slashdot.org/story/26/06/20/202204/openai-announces-benchmarks-for-ai-life-sciences-research-its-best-model-failed-639-of-the-test">等於失敗近六成四</a>，GPT-5.5 更只有 25.7%，全場沒有一個模型過半。</p>

<p><strong>為什麼說「裁判是自家」是個問題？</strong><br>因為這份<a href="https://labcritics.com/blog/2026/06/19/lifescibench-openais-hard-new-life-science-benchmark-and-how-gpt-rosalind-stacks-up/">評測由 OpenAI 出題、OpenAI 評分，還拿來展示 OpenAI 自己的模型</a>，同時把常被科學工具使用的 Claude 排除在比較外、也沒放人類科學家的基準線。這不代表數字造假，而是當出題、選手、改考卷都在同一家手上，這份東西的性質就會從中立評測滑向產品行銷，讀的時候要打折。</p>

<p><strong>這代表 AI 不能用在生命科學研究了嗎？</strong><br>不是。它代表 AI 現在能協助、還不能取代研究判斷。訊號最清楚的是：模型處理純文字題有 45.1%，一碰到真實圖表、序列檔就掉到 28.1%，弱點在讀真實研究資料。真正該投入的，是把實驗資料乾淨可驗證地接進模型的那條流程，而不是追排行榜分數。</p>

<p><strong>台灣生技產業該關注什麼？</strong><br>關注那個「崩跌位置」指出的機會。台灣手上有臨床、製程與實驗現場的真實資料，這恰好是模型最撐不住的一格。把資料供給、驗證機制、責任歸屬這條落地管線做紮實，比追誰的模型多刷幾分更有價值。</p>
