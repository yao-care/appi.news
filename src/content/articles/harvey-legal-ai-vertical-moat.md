---
title: "法律 AI Harvey 半年二度募 3 億、估值衝 50 億：創投買的不是模型，是受監管行業的護城河"
slug: "harvey-legal-ai-vertical-moat"
description: "Harvey 2025 年 2 月募 3 億美元、估值 30 億，四個月後 6 月再募 3 億、估值翻到 50 億，一年內一路衝到 110 億。但它的模型是租 OpenAI 跟 Anthropic 的。創投掏這筆錢買的不是模型，是把通用模型包進法律工作流程、驗證與責任歸屬的那一層，而垂直 agent 在受監管行業站穩的根因，不在模型多聰明。"
excerpt: "一家把模型外包給 OpenAI 和 Anthropic 的公司，半年內估值從 30 億衝到 50 億，再衝到 110 億。創投到底在買什麼？答案是法律這種受監管行業裡，通用模型碰不到的那一層：流程、驗證、責任。"
publishDate: "2026-07-28T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags: ["Harvey", "法律 AI", "垂直 AI", "受監管行業", "AI 募資"]
coverImage: "covers/harvey-legal-ai-vertical-moat.webp"
coverAlt: "象徵法律與人工智慧結合、垂直 AI 在受監管行業站穩的抽象示意"
coverImageCredit: "Photo by Vincent Olman on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Harvey 2025 年 2 月剛募 3 億美元、估值 30 億，四個月後 6 月再募 3 億、估值直接翻到 50 億，一年內一路衝到 110 億；但它的模型是租 OpenAI 跟 Anthropic 的，估值買的不是模型。"
  - "創投掏這筆錢買的是應用層：把已經商品化的通用模型，包進法律的工作流程、驗證機制與責任歸屬，這才是護城河。聊天模型誰都做得出八成像，垂直 agent 卡在受監管行業這一邊。"
  - "在法律、會計、醫療這種受監管專業，AI 再自動化，出事的責任還是掛在人身上（加州民法 1714.46 直接堵掉『是 AI 自己做的』這種抗辯）；台灣的切入點是在地法規知識與流程設計，不是再訓練一顆大模型。"
references:
  - title: "Harvey Raises $300M Series E Co-led by Kleiner Perkins and Coatue"
    url: "https://www.harvey.ai/blog/harvey-raises-series-e"
    publisher: "Harvey"
  - title: "Four months after a $3B valuation, Harvey AI grows to $5B"
    url: "https://techcrunch.com/2025/06/23/four-months-after-a-3b-valuation-harvey-ai-grows-to-5b/"
    publisher: "TechCrunch"
  - title: "Harvey raises $300 million at $5 billion valuation to be legal AI for lawyers worldwide"
    url: "https://fortune.com/2025/06/23/harvey-raises-300-million-at-5-billion-valuation-to-be-legal-ai-for-lawyers-worldwide/"
    publisher: "Fortune"
  - title: "Harvey Raises at $11 Billion Valuation to Scale Agents Across Law Firms and Enterprises"
    url: "https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises"
    publisher: "Harvey"
  - title: "United States: Legal Accountability for AI Agents"
    url: "https://www.bakermckenzie.com/en/insight/publications/2026/06/united-states-legal-accountability-for-ai-agents"
    publisher: "Baker McKenzie"
originalContribution: "本文以『估值買的不是模型、而是受監管行業的流程與課責層』為框架，逐一比對 Harvey 半年內兩輪各 3 億美元募資（估值 30 億→50 億，一年內衝到 110 億）的結構，交叉加州民法 1714.46 與 Baker McKenzie 對 AI agent 課責的分析，論證垂直 agent 在法律業站穩的根因不在模型能力，並延伸台灣在受監管專業服務的在地卡位點。"
---

一家自己不做基礎模型、模型是租 OpenAI 跟 Anthropic 的公司，半年內估值從 30 億美元衝到 50 億，再一年衝到 110 億。這件事看起來很瘋，但如果你以為創投在賭「更聰明的法律聊天機器人」，就把題目讀錯了。創投買的不是模型，是把通用模型包進法律工作流程、驗證機制與責任歸屬的那一層。垂直 agent 之所以能在受監管行業站穩，根因也在這裡。

<img src="/covers/harvey-legal-ai-vertical-moat.webp" width="1200" height="800" loading="lazy" decoding="async" alt="象徵法律與人工智慧結合、垂直 AI 在受監管行業站穩的抽象示意">

先把時間軸攤開。做法律 AI 的 Harvey，2025 年 2 月才由 Sequoia 領投[募了 3 億美元、估值 30 億](https://techcrunch.com/2025/06/23/four-months-after-a-3b-valuation-harvey-ai-grows-to-5b/)；四個月後的 6 月，[又拿 3 億、估值直接翻到 50 億](https://www.harvey.ai/blog/harvey-raises-series-e)，這輪由 Kleiner Perkins 跟 Coatue 共同領投。往後看更誇張，它在[2026 年 3 月又募一輪、估值來到 110 億](https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises)。同一家公司，一年多內估值翻了快四倍。CEO Winston Weinberg 自己講得很白：擴張速度這麼快，就是得一直這樣募。

<img src="/images/harvey-legal-ai-vertical-moat-s1.webp" width="960" height="563" loading="lazy" decoding="async" alt="創投熱錢湧入法律 AI、估值飆升的資金流向示意">

## 模型是租來的，那估值在買什麼

這裡要先踩一個剎車。Harvey 沒有自己的看家大模型，它的底層[就是 OpenAI 的 GPT 系列跟 Anthropic 的 Claude](https://fortune.com/2025/06/23/harvey-raises-300-million-at-5-billion-valuation-to-be-legal-ai-for-lawyers-worldwide/)，再套上律師設計的工作流程、拿律所自己的文件去客製。換句話說，模型這一格它是租的，誰都租得到。

那 50 億、110 億的估值到底貼在哪？貼在應用層。通用聊天模型正在快速商品化，開源一個月追上一個，價格一路往下殺，「跟 AI 聊天」這件事誰都做得出八成像的東西，護城河很淺。真正難複製的，是把這顆通用模型塞進一個特定行業的實際工作裡：律師怎麼做盡職調查、合約怎麼審、併購文件怎麼一份份比對。Harvey 到 2026 年上面已經跑著[超過 2 萬 5 千個客製 agent、10 萬名律師](https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises)在用。這些東西買不到，得一個客戶一個客戶長出來。

<img src="/images/harvey-legal-ai-vertical-moat-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="通用模型商品化、應用層才是護城河的抽象技術堆疊示意">

## 受監管行業的護城河，其實是責任

垂直 agent 為什麼特別能在法律這種受監管行業站住？我的答案不是「因為法律資料多」，而是這行業有一個通用模型天生跨不過去的東西：責任歸屬。

法律工作出錯是要負責的，而且這個責任沒辦法外包給 AI。加州 2026 年生效的民法 1714.46 條，直接[堵掉「是 AI 自己做的」這種抗辯](https://www.bakermckenzie.com/en/insight/publications/2026/06/united-states-legal-accountability-for-ai-agents)，不管 agent 多自主，課責還是回到公司跟背後的人身上。這條規則對產品設計是決定性的：既然律師要為輸出負最終責任，工具就必須把「可查核、可追溯、人留在迴路裡」做進去，不能只給你一段看起來很順的答案。這正好是純聊天介面做不到、而 Harvey 這種垂直產品在賣的東西。

換個框架看就清楚了。可信度靠的不是模型多大，是流程：問題定義、資料供給、角色設計、驗證機制、責任歸屬，缺一個就在那裡出事。這套我之前談[LLM 在醫療的可能與極限](/articles/llm-healthcare-promise-limits/)時就寫過，法律是同一個道理。受監管行業的護城河，本質是「幫專業人士扛住責任」的那套流程設計，不是那顆可以隨時換掉的模型。

<img src="/images/harvey-legal-ai-vertical-moat-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="法律書籍與法槌，象徵受監管行業的課責不會外包給 AI">

## 解錯題的人，會去比模型分數

看懂這件事，關鍵在別解錯題。很多人評估法律 AI，第一個反應是去比誰的模型分數高、誰的 benchmark 漂亮。但 Harvey 的例子告訴你，模型是租來的、大家租的是同幾顆，這條線根本分不出勝負。真正拉開差距的，是它已經接進[美國前百大律所的多數、超過 500 個企業法務團隊、橫跨 60 個國家](https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises)，客戶名單裡有 Paul Weiss 這種頂級律所、也有 KKR、PwC 這類企業客戶。這種行業內的信任跟工作流程滲透，才是模型換誰都搬不走的資產。

Harvey 用的原始料其實也不神秘：它[10% 以上的員工在做資安](https://fortune.com/2025/06/23/harvey-raises-300-million-at-5-billion-valuation-to-be-legal-ai-for-lawyers-worldwide/)，因為法律客戶最怕的是資料外洩，不是模型不夠聰明。它的年化營收從年初的 5 千萬[跳到 4 月的 7 千 5 百萬美元](https://techcrunch.com/2025/06/23/four-months-after-a-3b-valuation-harvey-ai-grows-to-5b/)，賣的是這套「幫律師扛責任」的完整解法，不是一個 API。

<img src="/images/harvey-legal-ai-vertical-moat-s4.webp" width="960" height="641" loading="lazy" decoding="async" alt="律師逐份查核法律文件的工作流程與驗證示意">

## 台灣該從這條線讀出什麼

那台灣呢？這波垂直 AI 往受監管行業鑽，對台灣的意義不是「我們也去 training 一顆法律大模型」，那是拿最弱的一格去打別人最強的一格。真正的機會在另一層：在地的法規知識加上流程設計。

法律、會計、報稅、醫療這些受監管專業，每個國家的規則都不一樣。台灣的判例、稅法、健保給付規則、食藥署的規範，全球通用模型不會懂、也不該由它來扛。誰把台灣特定領域的法規流程、驗證機制、責任邊界設計清楚，把通用模型包成本地專業人士敢用、且出事能追溯的工具，誰就握住這一格的護城河。這跟做基礎模型是兩回事，需要的是懂行業、懂法規的人，不是最大的 GPU 叢集。

<img src="/images/harvey-legal-ai-vertical-moat-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台北城市與科技產業，象徵台灣在受監管專業服務的垂直 AI 機會">

Harvey 半年二度募 3 億、一年估值翻四倍，市場其實是在用真金白銀說一句話：通用模型的故事講到某個程度就見頂了，下一輪的價值在「把模型包進特定行業、扛住那個行業的責任」的垂直層。Weinberg 說 AI 不只是在協助律師，而是[正在變成法律工作被完成的那套系統](https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises)。這句話會不會兌現還要看時間。但看懂它賭的護城河在哪，比記住 50 億這個數字重要，因為那不是賭模型，是賭一個受監管行業裡，人始終要負責、所以流程始終有價值的結構。

<img src="/images/harvey-legal-ai-vertical-moat-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI agent 成為企業與法律工作運行系統的抽象示意">

<h2>常見問題</h2>

<p><strong>Harvey 是什麼？它有自己的 AI 模型嗎？</strong><br>Harvey 是一家法律 AI 新創，賣給律所和企業法務團隊做盡職調查、合約審閱、併購文件比對這類工作。它沒有自己的基礎模型，底層用的是 <a href="https://fortune.com/2025/06/23/harvey-raises-300-million-at-5-billion-valuation-to-be-legal-ai-for-lawyers-worldwide/">OpenAI 的 GPT 系列與 Anthropic 的 Claude</a>，價值在律師設計的工作流程與客製化，不在模型本身。</p>

<p><strong>Harvey 估值為什麼漲這麼快？</strong><br>它 2025 年 2 月估值還是 30 億美元，6 月就翻到 <a href="https://www.harvey.ai/blog/harvey-raises-series-e">50 億</a>，2026 年 3 月再到 <a href="https://www.harvey.ai/blog/harvey-raises-at-dollar11-billion-valuation-to-scale-agents-across-law-firms-and-enterprises">110 億</a>。創投看的不是模型能力，而是它在法律這個受監管行業的滲透度：接進美國多數頂級律所、超過 500 個企業法務團隊，這種行業內的信任與工作流程整合，換誰的模型都搬不走。</p>

<p><strong>用 AI 做法律工作，出錯了誰負責？</strong><br>責任還是在使用它的律師和事務所身上，不能推給 AI。加州 2026 年生效的民法 1714.46 條就明確<a href="https://www.bakermckenzie.com/en/insight/publications/2026/06/united-states-legal-accountability-for-ai-agents">堵掉「是 AI 自主造成的」這種抗辯</a>，課責回到公司與背後的人。所以這類工具必須做到可查核、可追溯、人留在迴路裡。</p>

<p><strong>台灣在垂直法律／專業 AI 有機會嗎？</strong><br>機會不在做一顆通用大模型，而在在地法規知識加流程設計。台灣的判例、稅法、健保與食藥署規範，全球通用模型不會懂；誰把本地法規流程、驗證與責任邊界設計清楚，包成專業人士敢用、出事能追溯的工具，誰就握住這一格。這需要懂行業與法規的人，不是最大的運算叢集。</p>
