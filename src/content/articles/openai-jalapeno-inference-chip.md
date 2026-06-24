---
title: "OpenAI 端出自研推論晶片 Jalapeño、博通操刀：九個月 tape-out，「全端自製」從口號變產品"
slug: "openai-jalapeno-inference-chip"
description: "OpenAI 首款自研晶片 Jalapeño 由博通負責矽智財與實作，從設計到 tape-out 只花九個月。重點不是去不去 Nvidia 化，而是前沿大廠把推論成本與供應鏈主導權往上游收，台廠該盯代工與封裝接單怎麼分。"
excerpt: "Jalapeño 是 OpenAI 專為自家 LLM 推論量身的 ASIC，博通操刀實作、台積電 3nm 代工。別只看『去 Nvidia 化』，這是一場成本結構戰，台廠在代工、先進封裝、ASIC 設計服務這條鏈上是直接玩家。"
publishDate: "2026-07-15T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["OpenAI Jalapeño", "自研推論晶片", "博通 ASIC", "台積電先進封裝", "台廠半導體供應鏈"]
coverImage: "covers/openai-jalapeno-inference-chip.webp"
coverAlt: "OpenAI 自研推論晶片 Jalapeño 示意，客製化 ASIC 半導體特寫"
coverImageCredit: "Photo by Igor Omilaev on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Jalapeño 是 OpenAI 首款自研晶片，由博通負責矽智財與實作、Celestica 做機板與機櫃整合，台積電 3nm 代工，從設計到 tape-out 只花九個月。"
  - "別把它讀成一夜去 Nvidia 化：它是推論專用 ASIC，訓練仍靠 Nvidia，官方主打每瓦效能，外電報導早期測試指向推論成本約砍五成，但屬早期數據、非量產確認值。"
  - "不管設計 IP 在博通手上，晶圓與 CoWoS 封裝還是在台灣落地；台廠在代工、先進封裝、ASIC 設計服務這條 custom-silicon 鏈是直接玩家，風險在客戶集中與 CoWoS 產能被輝達排擠。"
references:
  - title: "OpenAI and Broadcom unveil \"Jalapeño,\" a custom chip built for LLM inference"
    url: "https://the-decoder.com/openai-and-broadcom-unveil-jalapeno-a-custom-chip-built-for-llm-inference/"
    publisher: "The Decoder"
    note: "OpenAI 設計、博通做矽智財與 Tomahawk 網通、Celestica 做機板機櫃整合；九個月設計到 tape-out、號稱史上最快 ASIC 週期；OpenAI 用自家模型加速設計；微軟認購首批四成產能"
  - title: "OpenAI unveils Jalapeño chip for large-scale inference workloads"
    url: "https://interestingengineering.com/ai-robotics/openai-jalapeno-ai-inference-chip-broadcom"
    publisher: "Interesting Engineering"
    note: "首款自研推論加速器、博通提供 silicon implementation 與 Tomahawk 網通、Celestica 系統整合；每瓦效能明顯優於現有頂規；多世代運算平台、2026 年起 GW 級資料中心部署"
  - title: "OpenAI tests first homegrown AI chip Jalapeño for customer queries"
    url: "https://cryptobriefing.com/openai-jalapeno-ai-chip-broadcom/"
    publisher: "Crypto Briefing"
    note: "台積電 3nm 製造、systolic array 架構、前 Google 工程師 Richard Ho 領軍；初批原訂 2026 年底、現預期落在 2027 年"
  - title: "OpenAI's Jalapeño chip: a way out from Nvidia"
    url: "https://thenextweb.com/news/openai-jalapeno-chip-broadcom-nvidia"
    publisher: "The Next Web"
    note: "為推論而非訓練打造、訓練仍以 Nvidia 為主夥伴；官方主打每瓦效能；定位為邊緣分散而非與 Nvidia 決裂，動機是掌控整條技術堆疊以求更便宜更快"
  - title: "OpenAI's First Custom AI Chip Targets 50% Cheaper Inference: Jalapeño Unveiled"
    url: "https://www.techtimes.com/articles/319012/20260624/openais-first-custom-ai-chip-targets-50-cheaper-inference-jalapeno-unveiled.htm"
    publisher: "Tech Times"
    note: "外電報導早期測試指向每代幣推論成本較現有 GPU 約砍五成，屬早期數據而非量產確認值"
  - title: "OpenAI unveils its first custom chip, built by Broadcom"
    url: "https://techcrunch.com/2026/06/24/openai-unveils-its-first-custom-chip-built-by-broadcom/"
    publisher: "TechCrunch"
    note: "OpenAI 首款自研推論處理器、與博通合作設計製造；定位為降低對 Nvidia GPU 的依賴，但前訓練等高負載仍仰賴 Nvidia"
  - title: "Who Will Divide Up the CoWoS Production Capacity in 2026?"
    url: "https://eu.36kr.com/en/p/3580962946874242"
    publisher: "36Kr"
    note: "2026 年 CoWoS 配額：輝達約 60%（59.5 萬片）、博通 custom ASIC 約 15 萬片，內含替 OpenAI 預留約 1 萬片；超大客戶鎖走逾 85% 台積電 CoWoS 產能"
  - title: "TSMC's CoWoS Capacity Emerges as Key Battleground for 2026 AI Chips"
    url: "https://finance.biggo.com/news/B4HCopsBZ4N-kGRr7STX"
    publisher: "BigGo Finance"
    note: "台積電 2026 CoWoS 月產能自 2025 年底約 8 萬片爬向年底約 12 萬片；輝達約六成；博通預配暴增 122%、世芯-KY（Alchip）因 AWS Trainium 預配增約 200% 至 6 萬片"
  - title: "OpenAI Begins Advertising Rollout in ChatGPT as It Tests New Revenue Model"
    url: "https://theaiinsider.tech/2026/02/26/openai-begins-advertising-rollout-in-chatgpt-as-it-tests-new-revenue-model/"
    publisher: "The AI Insider"
    note: "OpenAI 2026 年初在 ChatGPT 免費與 Go 方案測試廣告，為應用層變現的一步"
---

<p>OpenAI 端出首款自研晶片 Jalapeño，由博通（Broadcom）負責矽智財與實作，從設計到 tape-out 只花<a href="https://the-decoder.com/openai-and-broadcom-unveil-jalapeno-a-custom-chip-built-for-llm-inference/" target="_blank" rel="noopener">九個月，OpenAI 號稱是高效能先進半導體史上最快的 ASIC 開發週期</a>。這件事的重點不是 OpenAI 要不要繼續當輝達（Nvidia）的大客戶，而是前沿大廠開始把推論成本與供應鏈主導權往自己上游收。對台廠來說，該盯的是代工與封裝的接單怎麼分，而不是擔心被誰取代。先把問題定義清楚，再談誰受惠誰受傷。</p>

<h2>Jalapeño 到底是什麼，誰做了哪一段</h2>

<p>它是一顆專為 OpenAI 自家 LLM 推論量身的 ASIC，不是通用晶片。OpenAI 從零定義架構，<a href="https://the-decoder.com/openai-and-broadcom-unveil-jalapeno-a-custom-chip-built-for-llm-inference/" target="_blank" rel="noopener">依自家的模型、kernel、serving 系統與產品需求設計，並用自家模型加速設計流程</a>。分工要看清楚：OpenAI 出架構與需求定義，<a href="https://interestingengineering.com/ai-robotics/openai-jalapeno-ai-inference-chip-broadcom" target="_blank" rel="noopener">博通負責矽智財與實作、配上 Tomahawk 網通，Celestica 做機板、機櫃與系統整合</a>。晶圓這段在台灣：這顆晶片<a href="https://cryptobriefing.com/openai-jalapeno-ai-chip-broadcom/" target="_blank" rel="noopener">由台積電 3nm 製造、採 systolic array 架構，由前 Google 工程師 Richard Ho 領軍</a>。一句話，OpenAI 定義要什麼，博通把它變成矽，台積電把矽做出來。</p>

<img src="/images/openai-jalapeno-inference-chip-s1.webp" width="960" height="721" loading="lazy" decoding="async" alt="客製化 ASIC 晶片與半導體晶圓特寫，象徵 Jalapeño 推論加速器">

<h2>「自研＝去 Nvidia 化」這個直覺，先踩個剎車</h2>

<p>很多人第一個反應是「OpenAI 自己做晶片，要甩掉 Nvidia 了」。這個方向沒有錯，但只看到這一步就容易解錯題。退三步看清楚。第一，Jalapeño 是<a href="https://thenextweb.com/news/openai-jalapeno-chip-broadcom-nvidia" target="_blank" rel="noopener">為推論而非訓練打造，訓練仍以 Nvidia 為主要夥伴，定位是邊緣分散而不是跟 Nvidia 決裂</a>。第二，成本講法要分清楚：官方主打的是每瓦效能明顯優於現有頂規，至於<a href="https://www.techtimes.com/articles/319012/20260624/openais-first-custom-ai-chip-targets-50-cheaper-inference-jalapeno-unveiled.htm" target="_blank" rel="noopener">外電報導早期測試指向每代幣推論成本約砍五成</a>，那是早期數據與目標值，不是量產確認的結果，官方詳細 benchmark 也還沒放。第三，時程是慢熱的，<a href="https://cryptobriefing.com/openai-jalapeno-ai-chip-broadcom/" target="_blank" rel="noopener">初批原訂 2026 年底、現預期落在 2027 年</a>，量產爬坡要再往後。</p>

<p>所以這比較像一場成本結構戰，不是一夜換掉 Nvidia。OpenAI 真正要解的題，是把每天回答幾億次查詢的推論成本壓下來，順便把供應鏈的主導權往自己收一段。能不能成，看的是落地：良率、封裝產能、軟體堆疊接得順不順，而不是發表會上那張投影片。</p>

<img src="/images/openai-jalapeno-inference-chip-s2.webp" width="960" height="539" loading="lazy" decoding="async" alt="AI 資料中心 GPU 伺服器機櫃，象徵推論工作負載與運算成本">

<h2>台廠在這條垂直整合鏈，吃得到哪一段</h2>

<p>關鍵的事實是：設計 IP 在博通手上，但晶圓還是台積電做、先進封裝（CoWoS）也多在台灣落地。客戶換誰，這兩段都跑不掉。而且 custom ASIC 在先進封裝裡的份量正在往上走。<a href="https://finance.biggo.com/news/B4HCopsBZ4N-kGRr7STX" target="_blank" rel="noopener">台積電 2026 年 CoWoS 月產能從 2025 年底約 8 萬片爬向年底約 12 萬片，輝達仍吃掉約六成，但博通的客製 ASIC 預配年增約 122%，世芯-KY（Alchip）靠 AWS Trainium 訂單預配也跳增約 200% 至 6 萬片</a>。OpenAI 這顆晶片就在這股潮流裡，<a href="https://eu.36kr.com/en/p/3580962946874242" target="_blank" rel="noopener">在博通的 CoWoS 配額中替 OpenAI 預留約 1 萬片</a>。</p>

<p>讀這條新聞，先放下模型跑分，看供應鏈與市場連動，這個框架在<a href="/articles/deepseek-capital-taiwan-supply-chain/" target="_blank" rel="noopener">談中國 AI 資本與台廠供應鏈那篇</a>講過：誰在買單、買什麼、需求最後連動到先進製程與封測的哪一段。套到 Jalapeño，答案是台積電的 3nm 代工與 CoWoS 封裝最直接受惠，台灣的 ASIC 設計服務商（世芯-KY、創意）在這層 custom-silicon 服務是直接玩家而不是旁觀者。風險也要說清楚：一是客戶集中，單一超大客戶抽單或改架構，接單就晃；二是最高毛利的設計 IP 段被博通與美系 ASIC 房吃走，台廠多卡在代工與封裝；三是 CoWoS 產能被輝達排擠，自研 ASIC 想搶配額得排隊。卡位點在哪一段空著、哪一段擠破頭，得分段看，這跟<a href="/articles/ai-datacenter-800v-power-protection-chip/" target="_blank" rel="noopener">機櫃內電源保護晶片那條鏈</a>是同一種讀法。</p>

<img src="/images/openai-jalapeno-inference-chip-s3.webp" width="960" height="721" loading="lazy" decoding="async" alt="半導體晶圓與積體電路特寫，象徵晶圓代工與先進封裝供應鏈">

<h2>作者觀點：先吃完廣告，現在端出晶片</h2>

<p>我看 OpenAI 這步，重點在它的路數。上面，它今年初<a href="https://theaiinsider.tech/2026/02/26/openai-begins-advertising-rollout-in-chatgpt-as-it-tests-new-revenue-model/" target="_blank" rel="noopener">在 ChatGPT 開始放廣告</a>，把幾億使用者的流量先變成錢；下面，它現在把最貴的那塊成本，推論晶片，自己做。這是垂直整合的兩面包夾：應用層收錢，基礎層省錢，中間夾著的是它自己的模型。所謂「全端自製」過去是口號，現在上面有廣告變現、下面有自研矽，變成了看得到的產品線。</p>

<p>對手要對的，因此不是一顆晶片，是整條從使用者到矽的價值鏈。這也是台廠該讀的訊號：當應用大廠開始自己定義晶片，台灣的價值不在「有沒有被點名」，而在這條鏈上守不守得住代工、封裝、ASIC 設計服務這幾段，並有沒有本事往設計 IP 端再爬一格。這跟政府把半導體與 AI 列為<a href="/articles/ai-new-infrastructure-compute-trusted-industries/" target="_blank" rel="noopener">五大信賴產業、要做晶片台灣隊</a>是同一件事的兩面：方向定了，真正的勝負在落地能吃到哪一段，不在口號喊得多響。</p>

<img src="/images/openai-jalapeno-inference-chip-s4.webp" width="960" height="628" loading="lazy" decoding="async" alt="電路板上的處理器晶片堆疊，象徵 OpenAI 從應用到矽的全端垂直整合">

<h2>常見問題</h2>

<p><strong>OpenAI 的 Jalapeño 是要取代 Nvidia 嗎？</strong><br>不是直接取代。它是推論專用的 ASIC，<a href="https://thenextweb.com/news/openai-jalapeno-chip-broadcom-nvidia" target="_blank" rel="noopener">為推論而非訓練打造，訓練仍以 Nvidia 為主要夥伴，定位是邊緣分散而非決裂</a>。目的是把自家推論成本壓下來，官方主打每瓦效能，<a href="https://www.techtimes.com/articles/319012/20260624/openais-first-custom-ai-chip-targets-50-cheaper-inference-jalapeno-unveiled.htm" target="_blank" rel="noopener">外電報導早期測試指向成本約砍五成</a>，但屬早期數據而非量產確認值。</p>

<p><strong>Jalapeño 由誰製造？台廠有份嗎？</strong><br>有。OpenAI 出架構，<a href="https://the-decoder.com/openai-and-broadcom-unveil-jalapeno-a-custom-chip-built-for-llm-inference/" target="_blank" rel="noopener">博通做矽智財與網通、Celestica 做機板與機櫃整合</a>，晶圓由<a href="https://cryptobriefing.com/openai-jalapeno-ai-chip-broadcom/" target="_blank" rel="noopener">台積電 3nm 代工</a>，先進封裝（CoWoS）也多在台灣，台廠在代工與封裝吃得到單。</p>

<p><strong>九個月 tape-out 有多快？</strong><br>從設計到 tape-out 只花九個月，<a href="https://interestingengineering.com/ai-robotics/openai-jalapeno-ai-inference-chip-broadcom" target="_blank" rel="noopener">OpenAI 號稱是高效能先進半導體史上最快的 ASIC 開發週期，並用自家模型加速設計</a>。對照業界一顆先進 ASIC 動輒要一年半到兩年，這個速度很猛，但量產良率與封裝產能能不能跟上，是另一回事。</p>

<p><strong>台灣哪些公司可能受惠，風險在哪？</strong><br>台積電的 3nm 代工加 CoWoS 封裝最直接；台灣 ASIC 設計服務商如世芯-KY 也在這波 custom-silicon 接單，<a href="https://finance.biggo.com/news/B4HCopsBZ4N-kGRr7STX" target="_blank" rel="noopener">其 CoWoS 預配年增約 200%</a>。風險在客戶集中、最高毛利的設計 IP 段多被美系廠吃走，以及 CoWoS 產能被輝達排擠。</p>
