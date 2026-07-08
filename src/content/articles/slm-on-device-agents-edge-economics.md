---
title: "裝置端 agent 元年？小模型把『每塊錢買多少智慧』推到邊緣"
slug: "slm-on-device-agents-edge-economics"
description: "2026 上半年，Apple 蒸餾 Gemini 上 iPhone、Google 把 Gemma 4 塞進 AICore、聯發科 Dimensity 9500 讓 30 億參數模型在手機上跑得動。真正被推動的不是『手機有沒有 AI』，而是『每塊錢買多少智慧』這個經濟學問題被小模型推到了裝置端。台灣站在 NPU 與邊緣晶片這一層，該看懂這波要的是什麼。"
excerpt: "為什麼 Apple、Google、聯發科同時押注跑在裝置裡的小模型，而不是更大的雲端模型？因為 agent 的多數任務其實窄而重複，小模型就夠，而且便宜 10 到 30 倍。"
publishDate: "2026-07-22T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["小語言模型", "裝置端 AI", "AI agent", "邊緣運算", "聯發科"]
coverImage: "covers/slm-on-device-agents-edge-economics.webp"
coverAlt: "小型 AI 模型跑在邊緣裝置晶片上的抽象示意，象徵智慧被推向裝置端"
coverImageCredit: "Photo by Steve A Johnson on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "NVIDIA 研究團隊主張，多數 agent 任務是解析指令、呼叫工具、格式化輸出這類窄而重複的工，用小模型就夠，而且比頂規大模型便宜 10 到 30 倍；真正的問題不是模型夠不夠聰明，是任務該不該用大砲打小鳥。"
  - "2026 上半年裝置端一起發力：Apple 用蒸餾把 Gemini 壓成離線跑的 iPhone 模型、Google 把 Gemma 4 送進 Android 的 AICore、聯發科 Dimensity 9500 讓 30 億參數模型在手機上跑得動且更省電。"
  - "台灣在這一層的卡位點是 NPU 與邊緣運算晶片，不是雲端那顆大 GPU；聯發科把 agent 直接做進晶片，證明裝置端 AI 的戰場已從『參數比大小』移到『模型、晶片、系統、應用怎麼搭』。"
references:
  - title: "How Small Language Models Are Key to Scalable Agentic AI"
    url: "https://developer.nvidia.com/blog/how-small-language-models-are-key-to-scalable-agentic-ai/"
    publisher: "NVIDIA Technical Blog"
  - title: "Small Language Models are the Future of Agentic AI"
    url: "https://arxiv.org/abs/2506.02153"
    publisher: "arXiv (NVIDIA Research)"
  - title: "Apple Distills Google Gemini for On-Device iPhone AI"
    url: "https://aiweekly.co/alerts/apple-distills-google-gemini-for-on-device-iphone-ai"
    publisher: "AI Weekly"
  - title: "Announcing Gemma 4 in the AICore Developer Preview"
    url: "https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html"
    publisher: "Android Developers Blog"
  - title: "MediaTek Dimensity 9500 Unleashes Best-in-Class Performance, AI Experiences, and Power Efficiency"
    url: "https://www.mediatek.com/press-room/mediatek-dimensity-9500-unleashes-best-in-class-performance-ai-experiences-and-power-efficiency-for-the-next-generation-of-mobile-devices"
    publisher: "MediaTek"
  - title: "MediaTek to Empower the Agentic AI Era with Edge-to-Cloud Tech at Computex 2026"
    url: "https://www.mediatek.com/press-room/mediatek-to-empower-the-agentic-ai-era-with-edge-to-cloud-tech-at-computex-2026"
    publisher: "MediaTek"
originalContribution: "本文把 2026 上半年 Apple 蒸餾 Gemini、Google Gemma 4 進 AICore、聯發科 Dimensity 9500 三條各自的裝置端進展，接到 NVIDIA『SLM 是 agentic AI 的未來』論文的成本論證上，提出真正的驅動力是『每塊錢買多少智慧』被推到邊緣，並以『解對題 vs 解錯題』框架評估台灣在 NPU 與邊緣晶片這一層的卡位點與判斷陷阱。"
---

裝置端 agent 要不要算元年，其實不是重點。重點是 2026 上半年這幾件事湊在一起，說的是同一句話：智慧正在從雲端往裝置裡搬，推動它的不是「手機有沒有 AI」，而是「每塊錢買多少智慧」這個經濟學問題。Apple 把 Google 的 Gemini 蒸餾成能離線跑的小模型上 iPhone、Google 把 Gemma 4 送進 Android 的 AICore、聯發科的 Dimensity 9500 讓 30 億參數的模型在手機上跑得動。三家在做的是同一件事：把夠用的智慧塞進你口袋裡那顆晶片。

<img src="/covers/slm-on-device-agents-edge-economics.webp" width="1200" height="800" loading="lazy" decoding="async" alt="小型 AI 模型跑在邊緣裝置晶片上的抽象示意，象徵智慧被推向裝置端">

先把問題層次分清楚，不然很容易看歪。

大家習慣的聊天機器人背後是大型語言模型（LLM），參數動輒幾千億，跑在雲端資料中心。小語言模型（SLM，small language model）通常一到九十億參數，小到能塞進手機或筆電。差別不只是大小。NVIDIA 研究團隊去年一篇立場論文[《小語言模型是 agentic AI 的未來》](https://arxiv.org/abs/2506.02153)講得直接：agent 系統實際在做的，多半是「重複執行少數幾個專門任務、變化很小」的工。解析一句指令、產出呼叫工具用的 JSON、把結果整理成摘要，這些任務[重複、可預測、又高度專門化](https://developer.nvidia.com/blog/how-small-language-models-are-key-to-scalable-agentic-ai/)。拿一顆全能的巨型模型去做這種事，是用大砲打小鳥。

<img src="/images/slm-on-device-agents-edge-economics-s1.webp" width="868" height="1300" loading="lazy" decoding="async" alt="機器手臂重複執行單一動作，象徵 agent 任務其實窄而重複">

真正把這件事推成產業轉向的，是錢。

NVIDIA 那篇部落格算過一筆帳：跑一顆 Llama 3.1B 這種小模型，[比跑它最頂規的 405B 手足便宜 10 到 30 倍](https://developer.nvidia.com/blog/how-small-language-models-are-key-to-scalable-agentic-ai/)，看架構和查詢條件而定。他們自家的 Nemotron Nano 2（90 億參數）還能做到[六倍吞吐量](https://developer.nvidia.com/blog/how-small-language-models-are-key-to-scalable-agentic-ai/)，同級模型裡的推理、寫程式、遵循指令都打得贏。這就是「每塊錢買多少智慧」的意思。聊天這件事正在商品化，開源模型一個月追上一個，價格一路往下殺，誰都做得出八成像的東西。當單位智慧的成本被壓到夠低，運算就沒有理由一定要待在雲端。塞得進裝置，就省下每一次 API 呼叫的錢，也省下把你的資料傳出去的風險。

<img src="/images/slm-on-device-agents-edge-economics-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="運算晶片與成本效益的抽象示意，象徵每塊錢買多少智慧">

所以三大廠這半年的動作，讀起來才這麼一致。

Apple 的做法最能說明轉向。它拿到 Google 的 Gemini 資料中心存取權，但不是把 Gemini 搬上 iPhone，而是[用大模型當「老師」，蒸餾出不需連網就能在裝置上跑的「學生」模型](https://aiweekly.co/alerts/apple-distills-google-gemini-for-on-device-iphone-ai)，預計在六月 WWDC 2026、隨 iOS 27 的 Siri 改版一起亮相。Google 這邊，[Gemma 4 已經進了 Android 的 AICore 開發者預覽](https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html)，分成偏推理的 E4B 與拚速度的 E2B 兩種尺寸，號稱比前一代最多快四倍、[省下最多六成電力](https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html)，還原生支援一百四十種語言，並且是下一代 Gemini Nano 的底。這三步的共同點是：不靠把模型做大來贏，靠把夠用的模型做小、做省電、塞進裝置。

<img src="/images/slm-on-device-agents-edge-economics-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="智慧型手機在本地離線處理 AI 的示意，象徵裝置端推論不必連雲端">

那台灣站在這條線的哪裡？

站在最關鍵的那一段：讓小模型真的跑得動的晶片。聯發科的 [Dimensity 9500 把第九代 NPU 990 的算力翻倍](https://www.mediatek.com/press-room/mediatek-dimensity-9500-unleashes-best-in-class-performance-ai-experiences-and-power-efficiency-for-the-next-generation-of-mobile-devices)，30 億參數模型的輸出速度快了一倍、支援 12.8 萬 token 的長文處理，峰值功耗還降了超過五成。更關鍵的是它加進一顆「超高效 NPU」，用記憶體內運算讓輕量模型能一直開著跑，撐起那種會主動幫你辦事的體驗。聯發科在 [Computex 2026 直接把主軸擺在 agentic AI](https://www.mediatek.com/press-room/mediatek-to-empower-the-agentic-ai-era-with-edge-to-cloud-tech-at-computex-2026)，從平板、車用到 IoT，賣的是「讓 agent 在裝置端自主編排任務」的整套邊緣到雲端能力。一家台北的晶片公司，把 agent 做進晶片，這件事本身就說明裝置端 AI 的戰場已經從「參數比大小」，移到「模型、晶片、系統、應用怎麼搭在一起」。

<img src="/images/slm-on-device-agents-edge-economics-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶片電路板特寫，象徵台灣在 NPU 與邊緣運算的卡位">

但這裡要踩一個剎車，不然又解錯題。

「裝置端 agent 元年」很容易被讀成「把所有 AI 都塞進手機就贏了」。這是常見誤讀。NVIDIA 那篇論文的結論其實不是「小模型取代大模型」，而是[異質系統才是自然選擇](https://arxiv.org/abs/2506.02153)：小模型負責重複的日常工，需要通用對話或複雜推理時才叫用大模型。真正要解的題不是「模型放裝置還是放雲端」，是「哪一類任務該放哪裡」的分派設計。這跟我之前寫[醫療 AI 那篇](/articles/llm-healthcare-promise-limits/)談的是同一個底層道理：可信與好用不是由模型多大決定，是由問題定義、角色設計、驗證機制這些落地設計決定。裝置端 agent 也一樣，晶片再強，如果任務分派設計不良，體驗照樣撐不住。

<img src="/images/slm-on-device-agents-edge-economics-s5.webp" width="960" height="929" loading="lazy" decoding="async" alt="運算路徑分流的抽象示意，象徵任務該放裝置還是雲端的分派決策">

把智慧推到邊緣，是產業在用真金白銀說一句話：多數 agent 任務根本不需要最貴的那顆模型。台灣站在 NPU 與邊緣晶片這一層，位置很好，但接不接得住這波，不會是因為誰的晶片 TOPS 數字比較大，而是有沒有把「哪些智慧該長在裝置裡、怎麼跟雲端分工」想清楚。看懂這是一場分派設計的仗，比記住「元年」這個標籤重要。

<h2>常見問題</h2>

<p><strong>小語言模型（SLM）跟 ChatGPT 那種大模型差在哪？</strong><br>差在參數規模與跑的地方。大型語言模型參數上看幾千億、跑在雲端資料中心；小語言模型通常一到九十億參數，小到能塞進手機或筆電離線跑。SLM 在窄而重複的任務上就夠用，而且[比頂規大模型便宜 10 到 30 倍](https://developer.nvidia.com/blog/how-small-language-models-are-key-to-scalable-agentic-ai/)，大模型則留給需要通用對話或複雜推理的時候。</p>

<p><strong>為什麼 Apple、Google 要把 AI 塞進手機，而不是全放雲端？</strong><br>因為多數 agent 任務窄而重複，用小模型在裝置端跑更便宜、更快、也更保護隱私，不必每次把資料傳出去。Apple 用蒸餾把 [Gemini 壓成能離線跑的 iPhone 模型](https://aiweekly.co/alerts/apple-distills-google-gemini-for-on-device-iphone-ai)、Google 把 [Gemma 4 送進 Android 的 AICore](https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html)，走的都是這條路。</p>

<p><strong>手機真的跑得動 AI agent 嗎？續航會不會爆掉？</strong><br>跑得動，而且愈來愈省電。聯發科 [Dimensity 9500 讓 30 億參數模型輸出速度翻倍、支援 12.8 萬 token 長文，峰值功耗降超過五成](https://www.mediatek.com/press-room/mediatek-dimensity-9500-unleashes-best-in-class-performance-ai-experiences-and-power-efficiency-for-the-next-generation-of-mobile-devices)；Google 的 Gemma 4 也號稱比前代[省下最多六成電力](https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html)。專門的 NPU 加上小模型，就是為了讓 AI 能一直開著又不把電吃光。</p>

<p><strong>台灣在裝置端 AI 這波的機會在哪？</strong><br>在 NPU 與邊緣運算晶片這一段，而不是雲端那顆大 GPU。聯發科把 agent 直接做進 Dimensity 晶片、在 [Computex 2026 主打 agentic AI 的邊緣到雲端方案](https://www.mediatek.com/press-room/mediatek-to-empower-the-agentic-ai-era-with-edge-to-cloud-tech-at-computex-2026)，證明戰場已從比參數大小，移到模型、晶片、系統與應用怎麼整合。</p>
