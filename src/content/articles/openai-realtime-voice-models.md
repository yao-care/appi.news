---
title: "OpenAI 一次端出三款即時語音模型：對話、翻譯、轉錄，語音 agent 的落地門檻又降一階"
slug: "openai-realtime-voice-models"
description: "OpenAI 5/7 一次推出 GPT-Realtime-2、GPT-Realtime-Translate、GPT-Realtime-Whisper 三款即時語音模型，把過去要自己串接語音轉文字、語言模型、語音合成三段管線的工程收成一條 API。真正被降的是組裝門檻，不是信任門檻；台灣要拿它做客服、醫病溝通與長照，卡住的會是後者。"
excerpt: "門檻降了一階，是哪一階？OpenAI 把三段語音管線收成一條 API，工程整合這題解對了；但語音 agent 該不該信、誰負責、幻覺在哪裡攔，這幾道門沒被這次發表推開。"
publishDate: "2026-07-14T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["OpenAI", "即時語音 AI", "語音 agent", "Realtime API", "AI 落地"]
coverImage: "covers/openai-realtime-voice-models.webp"
coverAlt: "象徵 OpenAI 一次推出對話、翻譯、轉錄三款即時語音模型的抽象聲波示意"
coverImageCredit: "Photo by Fabian Hurnaus on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "OpenAI 5/7 一次推出三款即時語音模型：GPT-Realtime-2（對話推理，脈絡窗從 3.2 萬擴到 12.8 萬 token）、GPT-Realtime-Translate（70+ 輸入語言譯成 13 種輸出語言）、GPT-Realtime-Whisper（串流轉錄）。"
  - "真正被降的是工程門檻：過去語音 agent 要自己串『語音轉文字→語言模型→語音合成』三段管線，每段各自延遲、各自出錯；現在收成一條 API，Realtime API 也轉正並補上 MCP、圖片輸入、SIP 打電話。"
  - "沒被降的是信任門檻：語音是即時吐出、使用者當場信，沒有回頭校對的攔截點。台灣拿它做客服、醫病溝通、長照，卡住的會是驗證機制、責任歸屬與那 13 種輸出語言到底含不含在地真正需要的語言。"
references:
  - title: "OpenAI has new voice models that reason, translate, and transcribe as you speak"
    url: "https://9to5mac.com/2026/05/07/openai-has-new-voice-models-that-reason-translate-and-transcribe-as-you-speak/"
    publisher: "9to5Mac"
  - title: "OpenAI Releases Three New Realtime Voice Models for the API With GPT-5-Class Reasoning"
    url: "https://www.ghacks.net/2026/05/11/openai-releases-three-new-realtime-voice-models-for-the-api-with-gpt-5-class-reasoning/"
    publisher: "gHacks Tech News"
  - title: "OpenAI Launches 3 New Realtime Voice API Models: What Builders Need to Know Right Now"
    url: "https://www.mindstudio.ai/blog/openai-realtime-voice-api-3-new-models-builders-guide"
    publisher: "MindStudio"
  - title: "OpenAI launches three new real-time audio API models"
    url: "https://www.notebookcheck.net/OpenAI-launches-three-new-real-time-audio-API-models.1293110.0.html"
    publisher: "Notebookcheck"
originalContribution: "本文把 OpenAI 這次三款語音模型放進『解對題 vs 解錯題』框架拆解：分清『語音 agent 組裝的工程門檻』與『語音 agent 值不值得信任的落地門檻』是兩道不同的門，逐一比對三款模型各降了哪一段工程苦工，並以台灣客服、醫病溝通與長照現場的語言覆蓋、查核攔截與責任歸屬，評估這波在地落地真正會卡在哪裡。"
---

OpenAI 5 月 7 日一次推出三款即時語音模型，把過去要自己拼「語音轉文字 → 大型語言模型 → 語音合成」三段管線的苦工，收成一條 API 就能叫的服務。真正被降下來的，是把語音 agent 組起來的工程門檻。沒被降下來的，是這個語音 agent 該不該信的那道門檻。台灣要拿它做客服、醫病溝通、長照陪伴，會卡住的是後面這道。

<img src="/covers/openai-realtime-voice-models.webp" width="1200" height="800" loading="lazy" decoding="async" alt="象徵 OpenAI 一次推出三款即時語音模型的抽象聲波示意">

先把這三款講清楚，它們分工不同，別當成同一顆模型的三種模式。

| 模型 | 做的事 | 關鍵規格 |
|---|---|---|
| GPT-Realtime-2 | 對話與推理，會接話、被打斷、臨時加條件還接得住 | GPT-5 級推理、可調推理強度，脈絡窗從 3.2 萬擴到 12.8 萬 token，能同時呼叫多個工具 |
| GPT-Realtime-Translate | 即時口譯，邊聽邊譯 | 70 種以上輸入語言，譯成 13 種輸出語言 |
| GPT-Realtime-Whisper | 即時轉錄，邊講邊出字 | 串流語音轉文字，低延遲 |

[三款都掛在同一條 Realtime API 底下，也都能在 Playground 先試](https://9to5mac.com/2026/05/07/openai-has-new-voice-models-that-reason-translate-and-transcribe-as-you-speak/)。GPT-Realtime-2 這款的脈絡窗[從 3.2 萬 token 擴到 12.8 萬 token、可以平行呼叫多個工具，還會在做事時用聲音回報進度](https://www.ghacks.net/2026/05/11/openai-releases-three-new-realtime-voice-models-for-the-api-with-gpt-5-class-reasoning/)。翻譯那款有個細節值得記：[它會等到動詞出現的位置才開始翻，而不是逐字硬譯](https://www.mindstudio.ai/blog/openai-realtime-voice-api-3-new-models-builders-guide)，這樣譯出來的話比較像真人口譯的節奏，不會卡成一格一格。

<img src="/images/openai-realtime-voice-models-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="數位聲波與麥克風，象徵即時語音模型的三種分工">

那「門檻降一階」，降的是哪一階？

過去要做一個能講話的 AI 客服，得自己串三段：先用一個模型把聲音轉成文字，再把文字丟給語言模型想答案，最後再用一個模型把答案唸出來。三段各自有延遲、各自會出錯，串起來延遲很容易破一秒，對話只要一卡，使用者當場就聽出來這不是真人。這波把這條管線收短了：GPT-Realtime-2 是端到端的語音對語音，中間不用再繞文字轉一手；而且 [Realtime API 這次正式轉正（一般可用），還補上 MCP server、圖片輸入，以及用 SIP 直接打電話進來的能力](https://www.notebookcheck.net/OpenAI-launches-three-new-real-time-audio-API-models.1293110.0.html)。MCP 這塊接上，等於讓語音 agent 能照[已經變成 agent 事實標準的那套協定去接外部工具與資料](/articles/mcp-de-facto-standard-agent-governance/)。工程上，這是實打實的省事。

<img src="/images/openai-realtime-voice-models-s2.webp" width="960" height="506" loading="lazy" decoding="async" alt="管線收束成一條連線，象徵三段語音管線整合成單一 API">

但這裡要踩一個剎車。工程門檻降下來，不等於落地門檻跟著降。這是兩道不同的門。

我一直用同一個框架看這種發表：先別問「模型會不會」，先問「你要解的到底是哪一題、根因在哪」。語音 agent 過去做不起來，有一部分原因確實是工程太苦、延遲太高，這波把這段解對了。但語音 agent 真正難的地方不在這裡。難在語音是即時吐出去的，使用者當場就信、當場就照做，中間沒有一個讓你回頭校對的攔截點。文字場景你還能把 AI 的答案讀一遍再送出，語音客服講錯一句藥、報錯一個號碼，話已經出口了。模型推理再強，幻覺該有還是有，只是換到一個更難攔的介面上。價格也提醒了這件事的重量：[GPT-Realtime-2 的語音輸入每百萬 token 要 32 美元、輸出 64 美元](https://9to5mac.com/2026/05/07/openai-has-new-voice-models-that-reason-translate-and-transcribe-as-you-speak/)，真要跑量，成本跟責任是綁在一起算的。

<img src="/images/openai-realtime-voice-models-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="戴耳機聆聽的畫面，象徵語音即時輸出缺少回頭校對的攔截點">

翻譯那款單獨拉出來看，對台灣特別有意義，也特別要看細節。

台灣醫院現場有大量移工與新住民，長照機構裡照顧者與被照顧者常常不同母語，醫病溝通落差是真實在傷人的地方。[一款能邊聽邊譯、還懂得等動詞位置才開口的即時口譯模型](https://www.mindstudio.ai/blog/openai-realtime-voice-api-3-new-models-builders-guide)，理論上正好對到這個缺口。但要務實一點：輸入吃 70 幾種語言很漂亮，真正決定能不能用的是那 13 種輸出語言含不含台灣現場真正需要的。印尼語、越南語、泰語這些長照與醫療第一線最需要的語言在不在裡面，是要一項一項對過才算數的，不能看到「即時翻譯」四個字就當它解決了問題。而且醫療翻譯譯錯的代價，跟點餐翻錯不是同一個量級，這種場景的驗證機制必須另外設計，不能靠模型自己保證。

<img src="/images/openai-realtime-voice-models-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="跨語言即時口譯情境，象徵醫病與多語溝通的翻譯需求">

所以台灣該怎麼接這波，才不會解錯題？

順序不能倒。先定義你要解的情境，再看這條 API 符不符合情境的前提，最後才是接上去。想清楚哪些場景「講錯的代價低、容忍度高」，那裡先上：例如查營業時間、報進度、初步分流客服問題，錯了頂多重問一次。哪些場景「講錯會出人命或出法律責任」，那裡就得把人留在迴路裡，AI 只做前置、真正的判斷交給人。給幾個明天就能動的判準：第一，把驗證機制設計進流程，關鍵數字（金額、劑量、時間、地址）要有回讀確認或落地成文字讓對方核對；第二，責任歸屬先講清楚，出錯時是誰的責任、怎麼追、怎麼補；第三，語言覆蓋要逐項驗，不要用「支援多國語言」一句話帶過。這幾件缺一個，上線後就會在那裡出事。

<img src="/images/openai-realtime-voice-models-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="客服人員戴耳機的辦公場景，象徵台灣客服與長照的語音落地現場">

把三段管線收成一條 API，是 OpenAI 在用產品說一句話：語音 agent 的組裝這件事，從今以後不該再是門檻。這是真的省事，值得肯定。但語音 agent 能不能在台灣的客服、醫院、長照現場站得住，從來不是因為模型夠不夠聰明，而是因為有沒有把驗證、責任與在地語言這幾件事先想清楚、先設計進去。門檻降了一階，接下來那幾階，得靠落地的人自己爬。

<img src="/images/openai-realtime-voice-models-s6.webp" width="868" height="1300" loading="lazy" decoding="async" alt="智慧語音裝置與麥克風，象徵語音 agent 落地的下一步">

<h2>常見問題</h2>

<p><strong>OpenAI 這次推出的三款語音模型分別是做什麼的？</strong><br>三款分工不同：GPT-Realtime-2 負責對話與推理，能接話、被打斷、臨時加條件還接得住，脈絡窗從 3.2 萬擴到 12.8 萬 token；GPT-Realtime-Translate 負責即時口譯，吃 70 種以上輸入語言、譯成 13 種輸出語言；GPT-Realtime-Whisper 負責即時轉錄，邊講邊出字。三款都掛在同一條 <a href="https://9to5mac.com/2026/05/07/openai-has-new-voice-models-that-reason-translate-and-transcribe-as-you-speak/">Realtime API 底下</a>。</p>

<p><strong>為什麼說這降低了語音 agent 的落地門檻？</strong><br>降的主要是工程門檻。過去做語音 AI 要自己串「語音轉文字→語言模型→語音合成」三段管線，每段各自延遲、各自出錯，串起來延遲容易破秒。這波改成端到端的語音對語音，而且 <a href="https://www.notebookcheck.net/OpenAI-launches-three-new-real-time-audio-API-models.1293110.0.html">Realtime API 也轉正並補上 MCP、圖片輸入與 SIP 打電話</a>，組裝這件事變簡單很多。但這不等於信任門檻降了。</p>

<p><strong>台灣的醫療或長照現場能直接用它的即時翻譯嗎？</strong><br>要先對細節。它輸入吃 70 幾種語言，但輸出只有 13 種，能不能用取決於印尼語、越南語、泰語這些在地真正需要的語言含不含在內，得逐項確認。而且醫療翻譯譯錯代價很高，這種場景一定要另外設計驗證機制，把人留在迴路裡，不能靠模型自己保證正確。</p>

<p><strong>企業要導入這類語音 agent，該先做什麼？</strong><br>先定義情境再選工具，順序不能倒。把「講錯代價低」的場景（查時間、報進度、初步分流）先上，「講錯會出人命或法律責任」的場景把人留在迴路裡。導入前先確認三件事：關鍵數字有回讀或落地確認、出錯的責任歸屬講清楚、語言覆蓋逐項驗過。缺一個上線後就會出事。</p>
