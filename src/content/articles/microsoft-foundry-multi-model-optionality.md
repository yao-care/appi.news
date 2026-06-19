---
title: "微軟自研 coding 模型、Foundry 收進逾 11000 個模型：平台層「去單一供應商」對企業選型的訊號"
slug: "microsoft-foundry-multi-model-optionality"
description: "微軟六月推自研程式碼模型 MAI-Code-1-Flash，並把 Foundry 模型目錄做到逾一萬一千個（含 Claude Opus 4.8），明講降低對 OpenAI 的依賴、替開發者壓低成本。連綁 OpenAI 最深的微軟都在平台層去單一供應商，企業選型該對齊的是可換性與成本，不是無腦追單一最強模型。"
excerpt: "以前一家公司配一顆模型：Google 是 Gemini、OpenAI 是 GPT。現在三大雲全走 multi-model，模型正在商品化；企業未來買的不是模型，而是切換模型的能力。"
publishDate: "2026-07-04T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["微軟 Foundry", "MAI-Code-1-Flash", "多模型平台", "模型商品化", "企業 AI 選型"]
coverImage: "covers/microsoft-foundry-multi-model-optionality.webp"
coverAlt: "象徵雲端平台同時上架上萬個 AI 模型、走向去單一供應商的抽象網絡示意"
coverImageCredit: "Photo by Conny Schneider on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "微軟六月推自研程式碼模型 MAI-Code-1-Flash，明講是為了降低對 OpenAI 的依賴、替開發者壓低成本；同時把 Foundry 模型目錄做到逾一萬一千個，含 Claude Opus 4.8 與上萬個開源模型。"
  - "三大雲（Azure Foundry、AWS Bedrock、Vertex AI）全往 multi-model 走，模型正在商品化，單一一顆模型很難再是你選平台的理由；企業未來買的不是模型，而是切換模型的能力。"
  - "同月 Cursor 被 SpaceX 以六百億美元收購、Gemini CLI 消費版退場，正好是押單一供應商被綁死的反例；選型該對齊可換性與成本，並在模型層先留好換家餘地。"
references:
  - title: "Microsoft unveils MAI models to cut OpenAI reliance"
    url: "https://www.resultsense.com/news/2026-06-03-microsoft-mai-models-build/"
    publisher: "ResultSense"
  - title: "Microsoft Build 2026: AI Features, Copilot, and Developer Tools"
    url: "https://digitaldigest.com/microsoft-build-2026/"
    publisher: "Digital Digest"
  - title: "Microsoft Foundry Models overview"
    url: "https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview"
    publisher: "Microsoft Learn"
  - title: "Claude Opus 4.8 available via Microsoft Foundry"
    url: "https://futurework.blog/2026/05/29/claude-opus-4-8-available-via-microsoft-foundry/"
    publisher: "Future Work"
  - title: "SpaceX Just Bought Cursor for $60 Billion. Why the Deal Matters."
    url: "https://blog.kilo.ai/p/spacex-just-bought-cursor-for-60"
    publisher: "Kilo Code Blog"
  - title: "Gemini CLI and Code Assist shut down for consumers this week amid Antigravity focus"
    url: "https://9to5google.com/2026/06/17/gemini-cli-code-assist-shutting-down/"
    publisher: "9to5Google"
---

微軟六月做了兩件看起來沒什麼關係的事。一件是推出自家的程式碼模型 MAI-Code-1-Flash，一件是把雲端的 Foundry 模型目錄做到[逾一萬一千個模型](https://digitaldigest.com/microsoft-build-2026/)。分開看是兩條產品新聞，串起來看是同一個訊號：連最深綁 OpenAI 的微軟，都在平台層拆掉「一家供應商打天下」這件事。

<img src="/images/microsoft-foundry-multi-model-optionality-s1.webp" width="960" height="539" loading="lazy" decoding="async" alt="雲端資料中心的伺服器機櫃，象徵微軟同時推自研模型與擴大模型目錄的平台動作">

先看自研模型。[微軟在六月初的 Build 大會推出 MAI-Code-1-Flash](https://www.resultsense.com/news/2026-06-03-microsoft-mai-models-build/)，一個小而快的程式碼模型，能把文字描述直接生成應用程式與網站的程式碼，已經塞進 GitHub Copilot 與 Visual Studio Code。微軟講得很直白：這是為了[降低對 OpenAI 的依賴、替開發者壓低成本](https://www.resultsense.com/news/2026-06-03-microsoft-mai-models-build/)。微軟 AI 主管甚至宣稱，針對特定情境調校後，成本效率比 OpenAI 的 GPT-5.5 高出十倍。執行長 Nadella 給的框架是「從消費一個前沿模型，變成完整參與在前沿」。翻成白話就是：以前每一次 Copilot 補完都要付錢給別人，現在自己也下場做一顆，把這條成本線抓回自己手上。

<img src="/images/microsoft-foundry-multi-model-optionality-s2.webp" width="960" height="615" loading="lazy" decoding="async" alt="螢幕上的程式碼編輯畫面，象徵自研程式碼模型把文字描述生成程式">

另一邊是目錄。微軟的 [Foundry 平台](https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview)現在攤開逾一千九百個精選模型，加上從 Hugging Face 接進來的[逾萬個開源模型，合計破一萬一千個](https://digitaldigest.com/microsoft-build-2026/)，供應商橫跨 OpenAI、Meta、Mistral、DeepSeek、NVIDIA。其中也包括 Anthropic 的 Claude 家族，[Claude Opus 4.8 五月底就進了 Foundry](https://futurework.blog/2026/05/29/claude-opus-4-8-available-via-microsoft-foundry/)，被標為目前最適合程式與代理任務的頂尖模型。一個平台上，自研模型、OpenAI、Claude、上萬個開源模型並排站著讓你挑。這就是重點：平台不再幫你押單一一家。

<img src="/images/microsoft-foundry-multi-model-optionality-s3.webp" width="960" height="720" loading="lazy" decoding="async" alt="排列整齊的眾多選項格子，象徵 Foundry 上萬個模型與多供應商的目錄">

我自己看這條新聞，最有感的不是 MAI 跑幾分，而是平台層正在去單一模型供應商，這是非常大的產業訊號。

以前的世界很單純，一家公司配一顆模型：Google 就是 Gemini，Anthropic 就是 Claude，OpenAI 就是 GPT。你選了平台，等於選了模型。現在不是了。Azure Foundry、AWS Bedrock、Google 的 Vertex AI，三家雲全部往同一個方向走：multi-model，把所有人的模型都收進來給你選。

這代表一件事：模型正在商品化（commoditization）。當每個平台都能給你十家供應商、上萬顆模型，單一一顆模型就很難再是你選平台的理由。我[在寫 Odyssey 那篇](/articles/odyssey-world-models-physical-ai-moat/)就講過聊天模型在商品化、護城河變淺，這次從平台的動作又看到同一條線。所以可以再往下延伸一句：企業未來買的不是模型，而是切換模型的能力。

<img src="/images/microsoft-foundry-multi-model-optionality-s4.webp" width="960" height="657" loading="lazy" decoding="async" alt="可互相替換、彼此銜接的模組方塊，象徵平台去單一供應商與模型商品化">

「能切換」為什麼值錢，這個月剛好有兩個反例可以對照。

一個是 [SpaceX 用六百億美元把 Cursor 的母公司 Anysphere 買下](https://blog.kilo.ai/p/spacex-just-bought-cursor-for-60)。Cursor 是很多人天天在用的 AI 程式工具，被買走之後，它的模型選擇就不再純粹是「對開發者最好」，而要看新東家的盤算；[依賴單一供應商，等於你的生產流程可能因為你管不到的原因一夜改變](https://blog.kilo.ai/p/spacex-just-bought-cursor-for-60)。另一個是 [Google 在六月十八日把消費版的 Gemini CLI 與 Code Assist 收掉](https://9to5google.com/2026/06/17/gemini-cli-code-assist-shutting-down/)，要大家搬去新的 Antigravity。把流程焊死在一家供應商的工具上，對方說退場就退場，你只能跟著搬家。這兩件事跟微軟攤開上萬個模型放在一起看，方向其實一致：押單一供應商的成本，正在被市場標出來。

<img src="/images/microsoft-foundry-multi-model-optionality-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="纏成一團的纜線，象徵押單一供應商被綁死、難以拆解的依賴">

回到企業這邊。我的判斷是：選型該對齊的是可換性與成本，不是無腦追那顆「當下最強」的模型。最強這件事每個月都在換人，但被綁死的成本會跟你很久。這跟我先前幾篇的立場是同一套。[先定義你的情境再選工具，順序不能倒](/articles/what-is-claw-llm-client-tool/)；[依任務難度與風險分流到不同階，別全用最貴的那顆](/articles/claude-fable-5-mythos-class-model-tiering/)；[與其比功能清單，先決定你要不要可組合、能不能換掉](/articles/opencode-overtakes-commercial-ide/)。模型只是其中一格，真正決定可信度的是[落地設計，不是模型本身多聰明](/articles/llm-healthcare-promise-limits/)。

落到模型層，留換家餘地可以從三件事盤起。第一，把跟模型供應商溝通的那層介面抽出來，不要讓商業邏輯直接黏死某一家的 API，換家時改一層就好。第二，平常就準備好一組你自己的題目，換模型時先用真實情境跑一輪比對，不是只看供應商的成績單。第三，把成本與可用性當例行監看，一家漲價或退場時，你手上要有第二、第三順位能立刻頂上。

<img src="/images/microsoft-foundry-multi-model-optionality-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="岔路口的方向指標，象徵企業選型要留好換家餘地的判斷">

微軟自研模型、攤開上萬個模型，這兩步合起來不是「微軟模型變強了」的故事，而是平台層在告訴所有人：模型會換，不要押單一一家。對企業來說這不是壞消息。它把選型從「賭哪顆最強」變成「留好能換的餘地」，而後者，才是你真正能握在手裡的東西。

## 常見問題

**微軟推自研模型，是要跟 OpenAI 拆夥嗎？**

不是拆夥，是降低單點依賴。微軟明講推 MAI-Code-1-Flash 是為了降低對 OpenAI 的依賴、替開發者壓低成本，但它同時把 OpenAI 的模型也留在 Foundry 目錄裡。重點不是換掉誰，而是不再只靠一家。

**「模型商品化」對一般企業的實際影響是什麼？**

當每個雲端平台都能給你上萬顆模型，單一一顆模型很難再是你選平台的理由，議價權會往「能不能輕鬆換家」那邊移。實際影響是：你該投資的是切換模型的能力，而不是把身家壓在某一顆當下最強的模型上。

**中小團隊要怎麼開始留換家餘地？**

從三件事做起：把跟模型溝通的介面抽成獨立一層、別讓商業邏輯黏死某家 API；準備一組自己的測試題，換模型先用真實情境比對；把成本與可用性當例行監看，隨時有第二順位能頂上。
