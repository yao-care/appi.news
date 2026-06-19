---
title: "「AI 健康答案贏過醫師」怎麼讀：OpenAI 自評勝出，但每週 2.3 億人已在問才是重點"
slug: "chatgpt-health-beats-doctors-evaluation-gap"
description: "OpenAI 6 月用自家評測說 GPT-5.5 Instant 的健康回答在五項評比全面勝過醫師親手寫的、健康陳述錯誤率降 71%。但真正該注意的不是這個自評分數，而是每週逾 2.3 億人已經拿 ChatGPT 問健康，落地把關（誰驗、何時轉診）比跑分更關鍵。本文拆解自評的方法論陷阱、對照 Evaluation Gap，給一般人與診所一份 AI 健康答案的判讀框架。"
excerpt: "OpenAI 說新模型的健康答案贏過醫師，但分數全在它自家內部跑、未公開外審。真正的重點不是它贏了幾項，是每週 2.3 億人已在用 ChatGPT 問健康。AI 取代的不是醫師，而是 Google 搜尋。"
publishDate: "2026-07-03T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["ChatGPT 健康", "AI 醫療諮詢", "Evaluation Gap", "OpenAI GPT-5.5", "AI 健康答案判讀"]
coverImage: "covers/chatgpt-health-beats-doctors-evaluation-gap.webp"
coverAlt: "OpenAI 自評 GPT-5.5 Instant 健康回答勝過醫師、每週逾 2.3 億人用 ChatGPT 問健康的示意"
coverImageCredit: "Photo by National Cancer Institute on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "medical"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "OpenAI 自評 GPT-5.5 Instant 健康答案在五項評比勝過醫師、指令遵循達 89.9%、錯誤率降 71%，但結果全在自家內部跑、未公開外審。"
  - "真正的重點不是分數，是每週逾 2.3 億人已拿 ChatGPT 問健康；它取代的不是醫師，而是 Google 搜尋。"
  - "用四層框架讀 AI 健康答案：知識正確、適用這個病人、知道自己不知道、知道何時轉醫師。最難的是後兩層。"
references:
  - title: "ChatGPT's new health upgrade beats doctor-written answers, OpenAI says"
    url: "https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/"
    publisher: "The Decoder"
    note: "GPT-5.5 Instant 在五項評比勝過 GPT-4o 與醫師寫的答案、指令遵循達 89.9%、錯誤率降 71%、60 國逾 260 位醫師審過逾 70 萬則回覆"
  - title: "OpenAI Brings Improved Health Responses To Free ChatGPT"
    url: "https://www.searchenginejournal.com/openai-brings-improved-health-responses-to-free-chatgpt/579919/"
    publisher: "Search Engine Journal"
    note: "結果全在 OpenAI 自家內部跑、未公開給外部審查，醫師在約 3,500 則回覆上比較模型與醫師寫的答案；面對與其他 AI 健康答案相同的量測落差"
  - title: "OpenAI unveils ChatGPT Health, says 230 million users ask about health each week"
    url: "https://techcrunch.com/2026/01/07/openai-unveils-chatgpt-health-says-230-million-users-ask-about-health-each-week/"
    publisher: "TechCrunch"
    note: "每週逾 2.3 億人在 ChatGPT 問健康與保健問題；OpenAI 條款明載工具不用於任何疾病的診斷或治療"
  - title: "HealthBench: Advancing AI evaluation in healthcare, but not yet clinically ready"
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12547120/"
    publisher: "PMC / npj Digital Medicine"
    note: "benchmark 表現好不保證轉成更準診斷、更好流程或更高病人安全；在 HealthBench 拿高分不等於臨床決策做得好"
---

<p>OpenAI 在 6 月放出一個很搶眼的說法：新模型寫的健康答案，比醫師親手寫的還好。<a href="https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/" target="_blank" rel="noopener">它說 GPT-5.5 Instant 在五項評比裡，全面勝過 GPT-4o 與醫師親手寫的答案</a>。這句話很容易讓人立刻選邊站，一邊喊 AI 要取代醫師了，一邊罵這是行銷話術。但我想先把焦點從分數上移開。真正該記住的數字不是它贏了幾項，是<a href="https://techcrunch.com/2026/01/07/openai-unveils-chatgpt-health-says-230-million-users-ask-about-health-each-week/" target="_blank" rel="noopener">每週已經有超過 2.3 億人拿 ChatGPT 問健康與保健問題</a>。這 2.3 億人問完之後，誰來把關、什麼時候該回到醫師，才是會真正影響到人的地方。跑分高不高，是其次。</p>

<h2>先看 OpenAI 到底測了什麼</h2>

<p>把它宣稱的數字攤開來，確實漂亮。<a href="https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/" target="_blank" rel="noopener">OpenAI 說 GPT-5.5 Instant 在準確、清楚、完整等五個評比面向上，分數都高過醫師寫的答案，指令遵循最高到 89.9%，而且過去兩個月被標記至少一個事實問題的健康回答比率，降了 71%</a>。<a href="https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/" target="_blank" rel="noopener">參與評測的是來自 60 個國家、超過 260 位醫師，他們累計審過逾 70 萬則模型回覆</a>。光看陣仗，這不是隨手做做的測試。</p>

<p>問題不在數字漂不漂亮，在這個分數該怎麼讀。一個健康答案的好壞，能不能用這種方式量出來，比量出來幾分更值得想清楚。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="OpenAI 用自家評測比較 GPT-5.5 Instant 與醫師寫的健康答案，宣稱五項評比全勝、指令遵循 89.9%">

<h2>這個分數的方法論陷阱</h2>

<p>看到任何「贏過醫師」的自評，先問三件事：誰當裁判、題庫怎麼選、測的跟真實差多遠。</p>

<p>裁判這關，要看清楚。<a href="https://www.searchenginejournal.com/openai-brings-improved-health-responses-to-free-chatgpt/579919/" target="_blank" rel="noopener">這些評測全是 OpenAI 在自家內部跑的，沒有任何結果公開給外部審查</a>，等於它自己出題、自己改考卷、自己宣布成績。題庫這關也一樣，<a href="https://www.searchenginejournal.com/openai-brings-improved-health-responses-to-free-chatgpt/579919/" target="_blank" rel="noopener">醫師是在約 3,500 則回覆上，拿模型答案去比醫師在有充足時間、可以上網查的情況下寫出來的答案</a>。這是在「寫一段文字答案」這件事上比高下，不是在「真的看一個病人、做出正確處置」上比。</p>

<p>第三件事最關鍵：測試情境跟診間的真實落差有多大。<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12547120/" target="_blank" rel="noopener">一篇評析 HealthBench 這類健康評測的研究就直接點破，在 benchmark 上表現好，不保證能轉成更準的診斷、更好的流程或更高的病人安全；在 HealthBench 拿高分，不等於臨床決策做得好</a>。自評本身不是造假，但它測得到的，本來就只是模型「會不會寫出一段看起來對的答案」，不是它在真實病人面前做不做得對。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="自評的方法論陷阱：誰當裁判、題庫怎麼選、測試與真實診間的落差">

<h2>這會不會就是 Evaluation Gap</h2>

<p>講一段我自己的判斷。我看到這種自評，第一個反應就是：這準嗎？會不會就是 Evaluation Gap（評測落差）？因為這剛好是現在 AI 最大的問題。一個模型可以在 benchmark 上拿 95 分，丟進真實世界卻只剩 75 分。</p>

<p>醫療這個落差更明顯。<a href="/articles/openai-deployment-simulation-evaluation-gap/" target="_blank" rel="noopener">我先前寫過，OpenAI 自己用真實對話重放來測模型時就發現，模型認得出標準安全測試的比率高到近乎滿分，換成真實生產對話卻只剩個位數</a>，這正說明 benchmark 沒辦法可靠預測模型在真實情境裡的表現與風險。這也是我一直在講的同一件事，<a href="/articles/llm-healthcare-promise-limits/" target="_blank" rel="noopener">可信度靠的是落地設計，不是模型本身的強弱</a>。一個自評分數再高，後面沒有驗證機制接住它，分數就只是分數。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="Evaluation Gap 評測落差：模型 benchmark 高分、真實世界掉分，醫療場景更明顯">

<h2>重點講三次：AI 取代的不是醫師，而是 Google 搜尋</h2>

<p>有一句話我想講三次，因為它決定了你該怎麼看這整件事。</p>

<p>AI 取代的不是醫師，而是 Google 搜尋。</p>

<p>AI 取代的不是醫師，而是 Google 搜尋。</p>

<p>AI 取代的不是醫師，而是 Google 搜尋。</p>

<p>過去身體不舒服，多數人的第一步是打開搜尋引擎輸入症狀，在一堆內容農場跟論壇裡自己拼湊。現在這一步換成了問 ChatGPT。<a href="https://techcrunch.com/2026/01/07/openai-unveils-chatgpt-health-says-230-million-users-ask-about-health-each-week/" target="_blank" rel="noopener">每週 2.3 億人在做的</a>，本質上是「查」這個動作的升級，不是「看診」這個動作的取代。看清楚這件事，風險的位置就清楚了。AI 比 Google 強，是因為它把散落的資訊整理成一段話；但它跟 Google 一樣，給你的是資訊，不是診斷。</p>

<p><a href="/articles/llm-no-incentive-to-exploit/" target="_blank" rel="noopener">我之前寫過，LLM 在健康場景最有用的地方，是幫你補上「你不知道自己該問的問題」，讓你帶著更完整的問題清單去看醫師</a>，而不是讓它替醫師下判斷。<a href="https://techcrunch.com/2026/01/07/openai-unveils-chatgpt-health-says-230-million-users-ask-about-health-each-week/" target="_blank" rel="noopener">OpenAI 自己的條款也寫得很清楚，這工具不用於任何疾病的診斷或治療</a>。一個比 Google 好用很多的健康搜尋，這個定位其實剛剛好。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s4.webp" width="960" height="637" loading="lazy" decoding="async" alt="AI 取代的不是醫師，而是 Google 搜尋：人們從搜尋引擎查健康轉成用 AI 問健康">

<h2>AI 健康答案怎麼讀：四層判讀框架</h2>

<p>既然它是更強的搜尋，那就需要一套讀法。我用一個簡單的框架，把一個 AI 健康答案拆成四層：</p>

<ul>
<li><strong>第一層，知識正確。</strong>它講的醫學知識本身對不對。</li>
<li><strong>第二層，適用於這個病人。</strong>對的知識，套到你的年齡、病史、正在吃的藥上，還成不成立。</li>
<li><strong>第三層，知道自己不知道。</strong>資訊不足時，它會不會老實說「這我不確定」，而不是硬擠一個聽起來很篤定的答案。</li>
<li><strong>第四層，知道什麼時候該轉給醫師。</strong>該叫你去急診、該面對面檢查的時候，它會不會明確把你推回醫療系統。</li>
</ul>

<p>OpenAI 的自評，分數主要落在第一、二層。<a href="https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/" target="_blank" rel="noopener">它也宣稱新版在察覺何時需要緊急就醫、以及不誇大信心地說明不確定上有進步</a>，這對應到第三、四層。但這兩層恰恰最難量，也最難只靠自評證明。前兩層是知識題，題庫測得出來；後兩層是判斷題，要在真實、資訊不全的情況下做對。真正難的，是後面兩層，而那正是評測落差最容易咬人的地方。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="AI 健康答案四層判讀框架：知識正確、適用這個病人、知道自己不知道、知道何時轉醫師">

<h2>一般人與診所怎麼用，何時該回到醫師</h2>

<p>給一般人的用法很簡單：把 AI 的健康答案當成升級版的搜尋，拿它整理問題、列出該追問的點，但把第三、四層的判斷權留給自己跟醫師。出現這幾種情況就直接回到醫師，不要再跟它盧下去：症狀急、會痛、變化快；答案要你停藥、改藥或自行用藥；你問到第二、三輪它開始反覆或閃躲。帶著它幫你整理出來的問題清單去門診，是它目前最務實的用法。</p>

<p>給診所與醫療機構的話，重點不是要不要用，是先想清楚誰來驗、在哪一步驗。<a href="/articles/llm-healthcare-promise-limits/" target="_blank" rel="noopener">可信度靠的是落地流程，不是模型多強</a>。把 AI 答案定位成衛教與初步整理，明確標出哪些情境不交給它、哪一關一定要真人或獨立第三方把關。順序不能倒，先定義它在你的流程裡負責哪一段，再決定開放到哪。一個自評贏過醫師的模型，落地的價值上限，仍然是由你怎麼接住它決定的。</p>

<img src="/images/chatgpt-health-beats-doctors-evaluation-gap-s6.webp" width="960" height="540" loading="lazy" decoding="async" alt="一般人與診所怎麼用 AI 健康答案，何時該回到醫師把關">

<h2>常見問題</h2>

<p><strong>問：GPT-5.5 Instant 的健康答案真的比醫師好嗎？</strong></p>

<p>答：<a href="https://the-decoder.com/chatgpts-new-health-upgrade-beats-doctor-written-answers-openai-says/" target="_blank" rel="noopener">OpenAI 自評說它在五項評比勝過醫師寫的答案、指令遵循達 89.9%</a>，但<a href="https://www.searchenginejournal.com/openai-brings-improved-health-responses-to-free-chatgpt/579919/" target="_blank" rel="noopener">這些結果全在它自家內部跑、未公開外審</a>，比的也是「寫一段文字答案」而不是真實看診。把它當參考，不要當定論。</p>

<p><strong>問：那我可以直接用 ChatGPT 看病嗎？</strong></p>

<p>答：不行。<a href="https://techcrunch.com/2026/01/07/openai-unveils-chatgpt-health-says-230-million-users-ask-about-health-each-week/" target="_blank" rel="noopener">OpenAI 條款明寫它不用於疾病的診斷或治療</a>。比較準確的理解是，它取代的是你以前用 Google 查健康那一步，給的是資訊不是診斷；急症、用藥調整、症狀變化快的時候，一律回到醫師。</p>

<p><strong>問：什麼是 Evaluation Gap，為什麼醫療特別要在意？</strong></p>

<p>答：評測落差指模型在 benchmark 上分數漂亮，到真實情境卻明顯掉漆。<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12547120/" target="_blank" rel="noopener">研究指出在 HealthBench 拿高分，不保證臨床決策做得好</a>。醫療因為資訊不全、後果重，這個落差更明顯，所以分數越高，越要回頭看落地有沒有驗證機制接住它。</p>
