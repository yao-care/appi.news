---
title: "美國要打造首個 FDA 授權的『會自己改藥改療程』臨床 AI agent，還配一個監督 agent 盯著它"
slug: "fda-clinical-ai-agent-overseer"
description: "ARPA-H 的 ADVOCATE 計畫要做第一個 FDA 授權、能自主調整門診用藥飲食的臨床 AI agent，再配一個監督 agent 盯著它。當醫療 AI 從回答問題走到自己動手改療程，監理重點就從演算法準不準，移到誰來監督這個會行動的 agent。"
excerpt: "把行動 agent 配上監督 agent，等於把企業治理的 Maker-Checker 雙人覆核搬進 AI。問題是，當會出錯的人和盯著它的人都換成 AI，這套覆核真的夠成熟了嗎。"
publishDate: "2026-07-07T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["醫療 AI agent", "ADVOCATE 計畫", "ARPA-H", "AI 責任歸屬", "監督 agent"]
coverImage: "covers/fda-clinical-ai-agent-overseer.webp"
coverAlt: "醫療資料與人工智慧示意，象徵 FDA 授權的臨床 AI agent 接手治療決策"
coverImageCredit: "Photo by Markus Winkler on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "medical"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "ARPA-H 的 ADVOCATE 計畫要做第一個 FDA 授權、會自己行動的臨床 AI agent：能自主調整門診、用藥、飲食，連處方都能自己開自己改，鎖定心臟衰竭與心肌梗塞康復病人，預計六個月內（約二〇二六年六月）選定團隊，39 個月內含 FDA 授權。"
  - "計畫另外做一個監督用的 overseer agent 即時盯著行動 agent，等於把企業治理的 Maker-Checker 雙人覆核搬進 AI；但這套覆核裡，會出錯的執行者和負責把關的監督者，這次都是 AI。"
  - "當 AI 不只回答而是真的做事，責任誰負就成了硬問題。台灣導入要先答的不是模型準不準，而是哪些動作可以自主、哪些一定要真人核准、出錯時責任歸屬寫清楚沒有。"
references:
  - title: "ARPA-H to revolutionize cardiovascular disease management with clinical agentic AI"
    url: "https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai"
    publisher: "ARPA-H"
  - title: "ADVOCATE Program"
    url: "https://arpa-h.gov/explore-funding/programs/advocate"
    publisher: "ARPA-H"
  - title: "ARPA-H sees heart disease as top target for agentic AI initiative"
    url: "https://www.statnews.com/2026/01/13/arpa-h-advancing-clinical-agentic-ai-use-heart-disease/"
    publisher: "STAT"
  - title: "ARPA-H Launches ADVOCATE to Transform Cardiovascular Care with Agentic AI"
    url: "https://everglade.com/arpa-h-launches-advocate-to-transform-cardiovascular-care-with-agentic-ai/"
    publisher: "EverGlade Consulting"
  - title: "ARPA-H Funds First FDA-Authorized AI Agent to Manage Heart Care Around the Clock"
    url: "https://www.techtimes.com/articles/318089/20260609/arpa-h-funds-first-fda-authorized-ai-agent-manage-heart-care-around-clock.htm"
    publisher: "Tech Times"
---

美國醫療高等研究計畫署（ARPA-H）要做一件以前沒人正式做成的事：打造[第一個拿到 FDA 授權、會自己行動的臨床 AI agent](https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai)。這個計畫叫 ADVOCATE，鎖定心臟衰竭與心肌梗塞康復的病人，要做一個直接面對病人的 agent，[能自主調整門診、用藥、飲食和運動](https://arpa-h.gov/explore-funding/programs/advocate)，連處方都能[自己開、自己改](https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai)。為了盯著它，計畫另外要做一個監督用的 overseer agent。重點在這裡：當醫療 AI 走到「自己調整治療」這一步，監理要解的題就從「演算法準不準」，換成「誰來監督這個會動手的 agent」。

## 從「回答問題」到「自己改藥」

過去談醫療 AI，大半在談它會不會看錯、答得準不準。ADVOCATE 把問題往前推了一大格。它要的不是一個衛教問答機器人，而是一個會替心臟病人[做事](https://www.statnews.com/2026/01/13/arpa-h-advancing-clinical-agentic-ai-use-heart-disease/)的 agent：幫你約回診、給飲食運動建議、做出診斷與可能的治療計畫，必要時直接開立或修改在授權範圍內的處方。

ARPA-H 會這樣設計，是因為它要解的是一個很實在的缺口。美國[有 46% 的郡連一位心臟科醫師都沒有](https://www.statnews.com/2026/01/13/arpa-h-advancing-clinical-agentic-ai-use-heart-disease/)，計畫想用一個[全天候運作](https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai)的數位團隊成員補上，獨立評估甚至估出每年可省下逾 500 億美元。需求是真的，方向也說得通。

但「會動手」這件事本身，就把風險等級整個拉高了。我先前談過，[LLM 比較適合低決策風險、高重複性的語言任務](/articles/llm-healthcare-promise-limits/)，像行政文書、衛教整理；用藥調整、臨床決策這種高風險場景，向來建議它最多當輔助、不要獨立拍板。ADVOCATE 直接讓 agent 跨進後面這一格，所以 ARPA-H 自己也把它定位成[高風險的 AI 醫材](https://www.statnews.com/2026/01/13/arpa-h-advancing-clinical-agentic-ai-use-heart-disease/)，全程要跟 FDA 密切走認證流程。

<img src="/images/fda-clinical-ai-agent-overseer-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="臨床用藥與病歷示意，比喻 AI agent 自主調整處方與療程">

## 雙層設計：把 Maker-Checker 搬進 AI

ADVOCATE 真正有意思的，是它的兩層結構。計畫拆成三個技術領域：一個面對病人的行動 agent，一個[監督用的 overseer agent](https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai)，再加上一套導進醫療機構工作流程的整合方案。這個監督 agent 是[領域中立的設計](https://www.statnews.com/2026/01/13/arpa-h-advancing-clinical-agentic-ai-use-heart-disease/)，在臨床 AI 部署後即時盯它跑、稽核它的行為，再透過真人回饋把表現拉回來。

我看到這個設計的第一個反應是：這不就是把企業治理裡的 Maker-Checker 搬進 AI 嗎。一個 agent 負責執行，另一個 agent 負責覆核，等於把銀行、會計那套「做的人跟查的人要分開」的雙人覆核制度，原封不動套到 AI 身上。這個直覺方向是對的。會持續學習的 AI 系統一旦上線就沒人盯，[本來就是醫療 AI 最大的破口之一](https://arpa-h.gov/news-and-events/arpa-h-revolutionize-cardiovascular-disease-management-clinical-agentic-ai)，ADVOCATE 願意把「上線後怎麼管」當成核心技術領域來做，而不是丟給一句「會持續優化」帶過，已經比很多計畫誠實。

<img src="/images/fda-clinical-ai-agent-overseer-s2.webp" width="960" height="588" loading="lazy" decoding="async" alt="多螢幕監控畫面，比喻監督 agent 即時盯著行動 agent 的雙層覆核">

## 真的夠成熟了嗎：監督者也是 AI

但把 Maker-Checker 搬進 AI，有一道裂縫不能跳過。在企業裡，Checker 是人；在 ADVOCATE 裡，Checker 也是 AI。

雙人覆核之所以擋得住錯，靠的是兩個獨立的判斷主體，犯同一個錯的機率夠低。可是當執行的 agent 和監督的 agent 共用相似的訓練資料、相似的模型架構、相似的盲點，它們很可能在同一個地方一起看走眼。這時候第二層不是防線，只是回音。所以這套設計裡，最後那個真人回饋的環節才是關鍵，問題是當行動 agent 的自主程度越高、動作越快，旁邊的真人會不會慢慢退化成只按確認鍵的橡皮圖章。

更硬的問題在後面。當 AI 不是停在回答，而是真的開始做事，責任誰負。Tech Times 點得很直接：[一旦 agent 的用藥調整造成傷害，責任要怎麼落在開發商、監督的臨床醫師和醫療體系之間，目前根本還沒定下來](https://www.techtimes.com/articles/318089/20260609/arpa-h-funds-first-fda-authorized-ai-agent-manage-heart-care-around-clock.htm)。這正是我一直在追的那條線：[幻覺不是結論，責任歸屬框架在多數場景還沒建立清楚才是真風險](/articles/llm-healthcare-promise-limits/)。ADVOCATE 給了 39 個月，[含 FDA 授權在內分三階段做](https://everglade.com/arpa-h-launches-advocate-to-transform-cardiovascular-care-with-agentic-ai/)，[預計六個月內選定團隊](https://www.techtimes.com/articles/318089/20260609/arpa-h-funds-first-fda-authorized-ai-agent-manage-heart-care-around-clock.htm)。技術做得出來我不懷疑，我懷疑的是責任這條線，三年夠不夠把它走完。

<img src="/images/fda-clinical-ai-agent-overseer-s3.webp" width="960" height="1182" loading="lazy" decoding="async" alt="天秤示意，比喻 AI 開始做事之後的責任歸屬與問責邊界">

## 台灣導入要先答的，不是模型準不準

把這件事拉回台灣，會發現我們其實在問同一組問題。

台灣《人工智慧基本法》民國 114 年 12 月 23 日三讀通過，[高風險應用要標示警語、釐清責任歸屬、建立救濟補償機制](/articles/ai-basic-law-risk-classification-enterprise-checklist/)。一個會自己改藥的醫療 agent，幾乎一定落進高風險那一格，問責原則要回答的[「出錯誰負責」](/articles/companion-robots-ai-basic-law-elderly-care/)，會比技術本身更難。衛福部《醫療機構應用生成式人工智慧指引》底下還壓著醫師法、個資法、醫療法這些真正有法律義務的條文，我之前拆[醫療 AI 守門引擎](/articles/medical-ai-compliance-gatekeeper-engine/)時的核心原則就是：守門類服務只回狀態、不替呼叫方做決策。ADVOCATE 的監督 agent，本質上就是一個會替臨床行為背書的東西，它跨過那條「只回狀態」的線了沒，是台灣要先想清楚的。

所以真正該先答的不是「這個模型準不準」，而是落地設計那幾格有沒有先排好。順序也不能倒，[要先把使用情境定義清楚，再決定哪一類動作交給 AI](/articles/what-is-claw-llm-client-tool/)。具體上有三件事可以現在就盤：哪些動作能讓 agent 自主、哪些一定要真人核准；監督 agent 之上，有沒有一個明確的真人問責點，而不是 AI 監督 AI 就算結案；以及出錯時，開發商、醫師與機構之間的責任，制度有沒有寫死。能力是別人的，這幾道門檻是自己的。

<img src="/images/fda-clinical-ai-agent-overseer-s4.webp" width="960" height="720" loading="lazy" decoding="async" alt="醫院走廊示意，比喻台灣醫療 AI 導入的監理與責任歸屬">

## 常見問題

**監督 agent 既然也是 AI，會不會只是多此一舉？**

不算多此一舉，但也不能當成萬靈丹。把上線後的監控當成核心技術來做，本身是進步，總比放著不管好。風險在於執行 agent 和監督 agent 如果共用相似的模型與盲點，可能一起犯同一個錯，第二層就失去獨立性。關鍵還是在那個真人回饋的環節撐不撐得住，而不是又疊一層 AI 就安心。

**台灣短期內會出現這種會自己改藥的 AI 嗎？**

短期內不容易。這類應用幾乎必然被歸為高風險，要過《人工智慧基本法》的問責與責任歸屬要求，還要對上衛福部生成式 AI 指引底下的醫師法、醫療法。技術不是最大的卡點，責任歸屬與監理路徑才是。比較可能先出現的，是停在輔助、不自主拍板的版本。

**一般民眾現在該擔心嗎？**

現在不必過度緊張，ADVOCATE 還在選團隊階段，距離真的有 agent 替你改藥還有好幾年。值得留意的是方向：醫療 AI 正在從「給你資訊」往「替你行動」移動。當哪天一個工具開始能改你的療程，要問的第一個問題不是它聰不聰明，而是它做錯時，誰負責、找得到人嗎。
