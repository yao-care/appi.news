---
title: "FHIR 是什麼？AI 想讀懂病歷，得先學會這套語言"
slug: "fhir-ai-medical-data-taiwan"
description: "FHIR 是把病歷拆成機器讀得懂的「資源」的醫療資料標準。AI 直接讀病歷文字猜代碼，準確率不到五成；讀結構化的 FHIR 資料，準確率能拉到九成以上。台灣衛福部的 FHIR Box 計畫已完成三大醫學中心跨院互通示範，2026 年底要擴大到全台醫學中心。拆解 FHIR 怎麼運作、AI 為什麼非它不可、台灣現在做到哪、還有哪些沒補齊。"
excerpt: "FHIR 把病歷拆成機器讀得懂的「資源」。AI 讀結構化 FHIR 資料的代碼準確率能拉到九成以上，遠高於直接讀病歷文字猜代碼。台灣的 FHIR Box 計畫正把這套語言鋪進全台醫學中心。"
publishDate: "2026-07-30T17:06:47.256Z"
category: "tech"
subcategory: "ai"
tags:
  - "醫療AI"
  - "數位健康"
  - "健保"
  - "資料治理"
  - "AI基礎建設"
coverImage: "covers/fhir-ai-medical-data-taiwan-cover.webp"
coverAlt: "醫療人員在電腦螢幕前檢視數位病歷資料介面"
coverImageCredit: "Photo by Tima Miroshnichenko on Pexels"
author: "lightman"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "published"
sourceType: "author"
contentType: "column"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
column: "ai-healthcare"
highlights:
  - "FHIR 用可組合的 Resource 模組取代舊版 HL7／CDA 的固定格式；美國西奈山醫學中心發表在《NEJM AI》的實測顯示，GPT-4 直接讀病歷文字猜 ICD-10 代碼準確率只有 33.9%，另一份把 FHIR／mCODE 結構化資源餵給模型的研究則把 SNOMED-CT、LOINC、RxNorm 準確率拉到 84%~90%。"
  - "台灣衛福部的 FHIR Box 計畫已於 2025 年底完成長庚、馬偕、中山附醫三大醫學中心跨院互通示範，2026 年底目標擴大到全台醫學中心，2027 年底納入區域與地區醫院。"
  - "LOINC 檢驗代碼已完成近 100% 健保對應，RxNorm 藥品編碼完成 72.33%，SNOMED CT 由工研院開發 AI 輔助編碼工具、動員逾 30 位醫師與 50 位疾病分類管理師完成逾一萬筆病歷校正。"
  - "2026 年 AI 業界興起把 FHIR 伺服器包成 MCP Server 讓 AI agent 直接存取，但這道新開的門要怎麼分權限、留稽核紀錄，目前沒有公開實測資料可以驗證。"
risksAndLimits:
  - "西奈山與 mCODE 兩份研究測試模型和代碼系統不同，準確率數字不能直接互相比較"
  - "RxNorm 藥品編碼僅完成 72.33% 對應，AI 用藥提醒功能尚未能全面上線"
  - "中醫與中藥資料目前不在 TWCDI 與 FHIR Box 規劃範圍內，落差沒有時程表"
  - "AI agent 大量自動化查詢下 OAuth 2.0 權限機制擋不擋得住，目前沒有公開實測資料"
references:
  - title: "什麼是 FHIR 服務？"
    url: "https://www.hl7.org/fhir/overview.html"
    publisher: "HL7 International"
    note: "FHIR 官方定義，Resource 架構與 RESTful API 設計理念，版本 R5"
  - title: "【什麼是 FHIR？】FHIR 三大優勢可快速複製應用，完勝前一代醫療資料交換標準"
    url: "https://www.ithome.com.tw/news/141637"
    publisher: "iThome"
    note: "FHIR 與 HL7 v2/v3、CDA R2 的差異，145 種 Resource 分類，台灣 EEC 現況，2020-12-17 報導"
  - title: "衛福部揭 FHIR Box 醫療作業系統，目標 2027 年底完成全臺醫院病歷互通"
    url: "https://www.ithome.com.tw/news/176062"
    publisher: "iThome"
    note: "FHIR Box 內建元件、時程、效能數據、LOINC/RxNorm/SNOMED CT 標準化進度，2026-05-22 報導"
  - title: "臺安醫院攜手資慧科技率先全面落地 FHIR 於臨床第一線"
    url: "https://technews.tw/2026/05/19/fully-implement-fhir-in-clinical-practice/"
    publisher: "TechNews 科技新報"
    note: "台灣醫院實際導入 FHIR 的臨床案例，SMART on FHIR 應用「Insight」"
  - title: "AI Falls Short: Large Language Models Struggle With Medical Coding, Study Shows"
    url: "https://scitechdaily.com/ai-falls-short-large-language-models-struggle-with-medical-coding-study-shows/"
    publisher: "SciTechDaily"
    note: "西奈山醫學中心／《NEJM AI》研究，GPT-4 等四款模型直接讀病歷文字猜醫療代碼的準確率數字"
  - title: "Novel Development of LLM Driven mCODE Data Model for Improved Clinical Trial Matching"
    url: "https://arxiv.org/abs/2410.19826"
    publisher: "arXiv"
    note: "FHIR Resource 架構結合 LLM 生成 mCODE profile，SNOMED-CT/LOINC/RxNorm 準確率數字"
  - title: "What is the Model Context Protocol (MCP)?"
    url: "https://modelcontextprotocol.io/introduction"
    publisher: "Model Context Protocol"
    note: "MCP 官方定義，AI 應用程式接上外部資料源與工具的開放標準"
  - title: "Introducing FHIR MCP Server: A Natural Language Interface for Healthcare Data"
    url: "https://www.themomentum.ai/blog/introducing-fhir-mcp-server-natural-language-interface-for-healthcare-data"
    publisher: "Momentum"
    note: "把 FHIR 伺服器包成 MCP Server 讓 AI agent 存取的做法與動機"
  - title: "中醫 AI 值不值得信任？上線前該查清楚的六件事"
    url: "https://appi.news/articles/tcm-ai-credibility-checklist/"
    publisher: "APPI News"
    note: "本站姊妹文，指出中醫與中藥資料目前不在 FHIR Box／TWCDI 的規劃範圍內"
originalContribution: "把 HL7 官方對 FHIR 的技術定義、iThome 對台灣 CDA R2 現況的分析、衛福部 FHIR Box 記者會的完整揭露、台安醫院的實際臨床案例、西奈山醫學中心與 mCODE 兩份 AI 醫療編碼準確率研究、MCP 與 FHIR 結合的 2026 年趨勢，串成一篇給非工程背景讀者的 FHIR 概念解說，並指出資料互通打通之後、AI 存取權限治理尚未補齊的空白。"
topics: ["ai-medical-regulation"]
---

<p>FHIR 是醫療資料的共同語言，全名 Fast Healthcare Interoperability Resources，由國際醫療資料交換標準組織 HL7 制定，把病歷拆成一個一個叫做 Resource 的模組，讓不同醫院、不同系統能用同一套規則組合、查詢、交換資料。AI 要在醫療現場派上用場，得先讀得懂這套語言：把病歷文字直接丟給模型去猜代碼，準確率不到五成；改讀結構化的 FHIR 資源，準確率能拉到九成以上。台灣衛福部正把這套語言鋪進全國醫學中心，目標 2026 年底前讓病歷真的能跨院互通。</p>

<img src="/covers/fhir-ai-medical-data-taiwan-cover.webp" width="1200" height="800" loading="lazy" decoding="async" alt="醫療人員在電腦螢幕前檢視數位病歷資料介面">

<h2>FHIR 到底在解決什麼問題</h2>

<p>FHIR 由<a href="https://www.hl7.org/fhir/overview.html" target="_blank" rel="noopener">國際醫療資料交換標準組織 HL7 定義為一套「以 Resource 組成」的架構</a>，2011 年問世，持續演進到目前主流的 R4、R5 版本。<a href="https://www.ithome.com.tw/news/141637" target="_blank" rel="noopener">HL7 協會把健康照護領域常見的可互通資料項目歸納成 145 種 Resource，涵蓋病人基本資料、生理量測、用藥紀錄、醫療影像標記等類別，每種 Resource 就像資料庫裡的一張表，使用者可以直接複製、微調來解決臨床或行政上的需求</a>。跟前幾代標準比，這是關鍵差異：HL7 v2、v3 與 CDA 把規格寫死，要求各系統照著同一套文件格式走；FHIR 反過來，用組合的方式讓各醫院把自己需要的 Resource 拼起來，再透過通用的 RESTful API 存取，不必額外學資料庫查詢語法。</p>

<p><a href="https://www.ithome.com.tw/news/141637" target="_blank" rel="noopener">台灣醫界目前主要依賴 15 年前定義的 CDA R2 標準，由電子病歷交換中心（EEC）統一管理，只支援 XML 格式、只能處理臨床文件，資料格式修訂得透過 EEC 統一發文件，醫院再向 EEC 申請測試檔案驗證，流程慢；FHIR 除了 XML 還支援 JSON、Turtle 等更貼近網頁應用的格式，規格擴充可以直接在官網註冊發布，不必逐案往返公文</a>。這正是台灣現在要從 CDA R2 換軌到 FHIR 的理由：不是規格好不好看，是換一套能跟行動裝置、雲端 App、AI 模型直接對話的資料底座。</p>

<img src="/images/fhir-ai-medical-data-taiwan-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="資訊人員在伺服器機房檢視醫療資料交換系統畫面">

<h2>為什麼 AI 特別需要這套語言</h2>

<p>AI 讀病歷，最怕的不是看不懂字，是把不存在的醫療代碼講得煞有其事。<a href="https://scitechdaily.com/ai-falls-short-large-language-models-struggle-with-medical-coding-study-shows/" target="_blank" rel="noopener">美國西奈山醫學中心的團隊從院內 12 個月的常規醫療紀錄抽出 2 萬 7 千多筆診斷與處置代碼，要求 GPT-4、GPT-3.5、Gemini Pro、Llama-2-70b 這四款模型直接依代碼描述反推正確代碼，結果全部低於五成：表現最好的 GPT-4 在 ICD-9-CM 拿到 45.9%，ICD-10-CM 只有 33.9%，CPT 代碼 49.8%</a>，這項研究發表在《NEJM AI》。問題不在模型不夠聰明，是自由文字病歷裡沒有結構，AI 只能靠語意猜，猜錯了看起來還是一句通順的句子，沒人看得出來。</p>

<p>反過來，<a href="https://arxiv.org/abs/2410.19826" target="_blank" rel="noopener">一份把 FHIR 的 Resource 架構與 LLM 生成的 mCODE 腫瘤資料模型結合的研究，讓模型直接吃結構化資源而不是自由文字，SNOMED-CT 編碼準確率做到 87%，LOINC 90%，RxNorm 84%，整體資料標準化準確率衝上 92% 以上，比對照組 GPT-4 與 Claude 3.5 平均 77% 的表現高出一截</a>。兩份研究測的模型、代碼系統都不一樣，但指向同一件事：AI 讀結構化資料跟讀自由文字，是兩種完全不同的準確度量級。</p>

<p>這也是為什麼 2026 年 AI 業界開始把<a href="https://modelcontextprotocol.io/introduction" target="_blank" rel="noopener">由 Anthropic 提出、現已成為多家 AI 應用共通支援的開放標準 MCP（Model Context Protocol），也就是讓 AI 應用程式接上外部資料源與工具的通用協定</a>，跟 FHIR 綁在一起用。<a href="https://www.themomentum.ai/blog/introducing-fhir-mcp-server-natural-language-interface-for-healthcare-data" target="_blank" rel="noopener">把 FHIR 伺服器包裝成 MCP Server，讓 AI agent 用自然語言查詢時，實際執行的是標準化的 FHIR CRUD 操作與 LOINC 代碼比對，而不是把整份病歷丟給模型當純文字猜</a>。這條路徑等於幫 AI 先架好一層翻譯：模型負責理解使用者想問什麼，實際查資料、驗代碼的工作交給結構化的 FHIR 層去做。</p>

<img src="/images/fhir-ai-medical-data-taiwan-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="電腦螢幕顯示醫療數據分析與 AI 輔助判讀畫面">

<h2>台灣的 FHIR Box，現在做到哪</h2>

<p><a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">衛福部資訊處科長游子佳在 5 月 20 日的記者會上點出台灣智慧醫療最大的卡點：全台醫院用了 40 多套不同的醫院資訊系統（HIS），資料格式與編碼互不一致，病患跨院看診時醫師拼不出完整病史，民眾常得重複說明病情、重複檢查，甚至自己帶病歷光碟跑醫院</a>。衛福部沒有要求醫院全面換系統，做法是<a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">在既有 HIS 之上疊一層叫「FHIR Box」的資料中臺，內建高效能 FHIR 伺服器、台灣核心資料群（TWCDI）工具、FHIR 轉換器與 SMART on FHIR 應用執行環境，衛福部次長莊人祥把它比喻成「就像 Chrome 作業系統，可以在共同底座上部署各種醫療應用」</a>。</p>

<p>時程已經在跑：<a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">2025 年底完成長庚、馬偕、中山附醫三大醫學中心的 FHIR 跨院互通示範，2026 年底前推動全台醫學中心部署，2027 年底擴大到全台區域與地區醫院</a>。<a href="https://technews.tw/2026/05/19/fully-implement-fhir-in-clinical-practice/" target="_blank" rel="noopener">臺安醫院已經把病歷依台灣核心實作指引（TW Core IG）即時轉換成 FHIR 格式，搭配資慧科技開發的 SMART on FHIR 應用「Insight」，把病歷摘要、檢驗報告、醫囑、用藥、手術紀錄、影像報告整合進單一介面，醫師不用再跨系統一個個查</a>，這不是實驗室展示，是已經在看診現場用的工具。</p>

<table>
<thead>
<tr><th>時程</th><th>進度</th></tr>
</thead>
<tr><td>2025 年底</td><td>長庚、馬偕、中山附醫三大醫學中心完成 FHIR 跨院互通示範</td></tr>
<tr><td>2026 年底</td><td>全台醫學中心部署 FHIR Box，實現跨院病歷互通</td></tr>
<tr><td>2027 年底</td><td>擴大到全台區域與地區醫院</td></tr>
</table>

<p><a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">效能上，FHIR Box 目前可同時處理醫學中心 200 筆病歷交換請求，每秒能處理超過 2,500 筆 FHIR Resources；資安上採 OAuth 2.0 身分驗證，搭配定期弱點掃描與 SBOM 軟體成分檢查，病患得先簽署數位同意書，醫院才能透過 FHIR Box 向其他醫院調閱病歷，再由既有的電子病歷交換中心（EEC）完成交換</a>。代碼標準化這塊也在同步推進：<a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">LOINC 檢驗代碼已完成近 100% 的健保檢驗碼對應，RxNorm 藥品編碼完成 72.33%，剩下對不上的本土藥品後續要用延伸編碼補上；SNOMED CT 這塊顆粒度更細，衛福部委託工研院開發 AI 輔助臨床編碼工具，動員逾 30 位醫師與 50 位疾病分類管理師完成一萬多筆病歷校正</a>。</p>

<img src="/images/fhir-ai-medical-data-taiwan-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫師在診間電腦上查閱跨院病歷資料畫面">

<h2>該注意什麼</h2>

<p>FHIR Box 解決的是「醫院之間打不打得通」，沒有解決「打通之後誰能拿資料做什麼」。<a href="https://www.themomentum.ai/blog/introducing-fhir-mcp-server-natural-language-interface-for-healthcare-data" target="_blank" rel="noopener">把 FHIR 伺服器包成 MCP Server 讓 AI agent 存取</a>，等於多開了一道門，這道門的存取權限怎麼分、查詢紀錄有沒有留稽核軌跡、AI agent 能不能被限制成只能讀不能寫，是接下來要盯的地方。衛福部目前公開的做法是靠 OAuth 2.0 分權限、定期弱點掃描，這套機制擋不擋得住 AI agent 大量自動化查詢的新型態存取模式，目前沒有公開的實測資料可以參考。</p>

<p>標準化本身也還沒補完。RxNorm 的 72.33% 對應率代表剩下近三成本土藥品要靠延伸編碼手動補，這段補完進度會直接影響 AI 用藥提醒功能能不能全面上線。而<a href="/articles/tcm-ai-credibility-checklist/" target="_blank" rel="noopener">中醫和中藥資料現階段完全不在 TWCDI 與 FHIR Box 的規劃範圍裡</a>，西醫這邊資料標準化衝得很快，中醫那邊還在各自為政，這道落差短期內不會消失。</p>

<p>對還在觀望的醫療 IT 團隊，實務上最該先問的問題不是「要不要導入 FHIR」，是「導入之後，AI 能不能真的碰到乾淨的結構化資料，還是又多包一層轉換」。<a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">衛福部強調 FHIR Box 是開放架構、不綁特定廠商規格</a>，這代表選型階段還有空間，但轉換品質好不好，得看醫院自己的 HIS 資料原本乾不乾淨，這一步沒有捷徑。</p>

<img src="/images/fhir-ai-medical-data-taiwan-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="螢幕顯示資料存取權限控管與安全稽核介面">

<p>FHIR 不是一個只有工程師才需要懂的技術名詞，它決定了台灣的醫療 AI 接下來是接得到乾淨資料做出可信判斷，還是繼續在破碎的病歷格式裡用自由文字猜答案。衛福部的時程表已經排到 2027 年，接下來兩年是這套地基打不打得穩的關鍵期。</p>

<h2>常見問題</h2>

<p><strong>FHIR 跟以前的 HL7、CDA 標準差在哪？</strong><br><a href="https://www.ithome.com.tw/news/141637" target="_blank" rel="noopener">CDA R2 只支援 XML 格式，只能傳臨床文件，規格改版要透過台灣電子病歷交換中心（EEC）統一發文件審核；FHIR 用可組合的 Resource 架構，支援 XML、JSON、Turtle 多種格式，採用 RESTful API，規格擴充能直接在官網註冊公開</a>，更適合行動裝置與 AI 應用存取。</p>

<p><strong>台灣的 FHIR Box 什麼時候會用到我看病？</strong><br><a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">2025 年底長庚、馬偕、中山附醫三大醫學中心已完成示範，2026 年底前擴大到全台醫學中心，2027 年底納入區域與地區醫院</a>，實際感受得到跨院調閱病歷免帶光碟，得看所在醫院的部署進度。</p>

<p><strong>AI 直接讀病歷文字判斷，準確率真的比讀 FHIR 資料差那麼多？</strong><br>是。<a href="https://scitechdaily.com/ai-falls-short-large-language-models-struggle-with-medical-coding-study-shows/" target="_blank" rel="noopener">西奈山醫學中心發表在《NEJM AI》的實測，GPT-4 直接讀病歷文字猜 ICD-10 代碼準確率只有 33.9%</a>；<a href="https://arxiv.org/abs/2410.19826" target="_blank" rel="noopener">另一份把 FHIR／mCODE 結構化資源餵給模型的研究，SNOMED-CT、LOINC、RxNorm 準確率拉到 84%~90%</a>，兩份研究方法不同，但都指向結構化資料能大幅提升 AI 判讀醫療代碼的準確度。</p>

<p><strong>FHIR 資料互通之後，誰能看到我的病歷？</strong><br><a href="https://www.ithome.com.tw/news/176062" target="_blank" rel="noopener">病患需先簽署數位同意書，醫院才能透過 FHIR Box 向其他醫院調閱資料，搭配 OAuth 2.0 權限控管與電子病歷交換中心（EEC）既有機制完成交換</a>，但 AI agent 透過 MCP 等新方式存取資料的稽核機制，目前還沒有公開實測資料佐證其嚴謹度。</p>
