---
title: "Google 把 Gemini 3.5 Pro 推上正式線：2M 脈絡＋Deep Think，三強旗艦同月擠在一起"
slug: "gemini-3-5-pro-ga-model-selection"
description: "Gemini 3.5 Pro 進入 GA 釋出窗口，主打 200 萬 token 脈絡與 Deep Think 推理，跟 Anthropic、OpenAI 的旗艦擠在同一個六月。對台灣團隊，選型重點已經從『誰最強』換成兩件事：你的活到底用不用得到長脈絡，以及每塊錢買到多少智慧。這篇用選型角度比三家的脈絡、推理與定價，給一個該不該換的判準。"
excerpt: "Gemini 3.5 Pro 進入 GA 釋出窗口，主打 200 萬 token 脈絡與 Deep Think，跟 Anthropic、OpenAI 旗艦擠在同一個六月。選型重點從『誰最強』換成長脈絡與每塊錢買多少智慧，這篇給一個該不該換的判準。"
publishDate: "2026-07-18T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["Gemini 3.5 Pro", "AI 模型選型", "長脈絡視窗", "Deep Think", "前沿模型定價"]
coverImage: "covers/gemini-3-5-pro-ga-model-selection.webp"
coverAlt: "三家前沿 AI 模型同月落地，台灣團隊面對的選型局面"
coverImageCredit: "Photo by Conny Schneider on Unsplash"
author: "lightman"
status: "scheduled"
contentType: "news"
sourceType: "editorial"
disclaimerType: "general"
disclosure: "本文由 APPI 編輯部以 AI 輔助起草，經人工查證來源、編輯與校對後刊出。"
highlights:
  - "Gemini 3.5 Pro 進入 GA 釋出窗口，帶 200 萬 token 脈絡與 Deep Think 推理；脈絡長度是量產旗艦最長，但定價 $15/$60 是估算、Google 還沒官方公布。"
  - "三家旗艦的差異不在誰跑分高，而在脈絡長度與每塊錢買到多少智慧：Gemini 拚長脈絡、Fable 5 拚難題穩定、GPT-5.5 拚便宜，沒有最強，只有對上你那題前提的那個。"
  - "該不該換的判準不是看規格表，是先算自家一個代表性任務跑完一次的總成本，再回頭挑模型；token 單價最低不等於把事做完最便宜。"
references:
  - title: "Gemini 3.5 Pro: 2M Tokens, Deep Think, and the 10x Pricing Problem"
    url: "https://byteiota.com/gemini-3-5-pro-2m-tokens-deep-think-and-the-10x-pricing-problem/"
    publisher: "byteiota"
    note: "2M 脈絡、Deep Think、定價估 $15/$60（約 Flash 10 倍，明確標為估算）、6/6 仍限量預覽"
  - title: "Gemini 3.5 Pro Is Days Away — Google's Last Chance to Prove It Can Ship a Frontier Model"
    url: "https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/"
    publisher: "FourWeekMBA"
    note: "GA 滾動窗口 6/23 到 6/30、2M 為量產最長（10× GPT-5、16× Claude）、Deep Think、$250/月 Ultra、6/23 仍限量企業預覽"
  - title: "OpenAI: GPT-5.5 — API Pricing & Benchmarks"
    url: "https://openrouter.ai/openai/gpt-5.5"
    publisher: "OpenRouter"
    note: "GPT-5.5 脈絡約 100 萬 token（92.2 萬輸入/12.8 萬輸出）、定價 $5/$30"
  - title: "Claude Fable 5: API, Benchmarks, Pricing & How to Use It"
    url: "https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it"
    publisher: "TrueFoundry"
    note: "Fable 5 定價 $10/$50、約 Opus 4.8 兩倍、100 萬 token 脈絡"
  - title: "What Is GPT-5.6? OpenAI's June 2026 Release Explained"
    url: "https://andrew.ooo/answers/what-is-gpt-5-6-release-june-2026/"
    publisher: "andrew.ooo"
    note: "GPT-5.6 傳聞於六月中下旬接棒、官方未證實，規格未確認"
---

<p>Google 在六月底把 Gemini 3.5 Pro 推進正式發行（GA）的<a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">滾動釋出窗口，從 6 月 23 日開到 30 日</a>，主打兩個招牌：200 萬 token 的脈絡視窗，以及叫 Deep Think 的推理模式。同一個六月，Anthropic 月初上了 Fable 5、OpenAI 的 GPT-5 系列旗艦也在線上，三家前沿旗艦擠在一起。對台灣團隊來說，這代表選型的問題已經換了：不再是「誰最強」，而是「你的活用不用得到長脈絡」跟「每塊錢買到多少智慧」這兩件事。</p>

<p>先把答案講在前面。三家現在沒有一個是全面最強的，差異落在你看得見的地方：Gemini 拚的是脈絡長度，Fable 5 拚的是難題上的穩定，GPT-5.5 拚的是便宜。該不該換，不是比規格表，是先看你手上的任務吃不吃得到這些差異。下面拆開講。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s1.webp" width="960" height="1440" loading="lazy" decoding="async" alt="三強旗艦擠在同一個六月的發表窗口，像同站起跑線">

<h2>三家同月擠一起，但先踩一個剎車</h2>

<p>熱鬧歸熱鬧，有件事得先說清楚：Gemini 3.5 Pro 的規格還沒全部落定。它<a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">在 6 月 23 日當天仍是限量企業預覽，GA 是往後幾天才陸續開</a>；更關鍵的是定價。網路上到處在傳的 $15/$60（每百萬 token 輸入/輸出），<a href="https://byteiota.com/gemini-3-5-pro-2m-tokens-deep-think-and-the-10x-pricing-problem/" target="_blank" rel="noopener">是用 Flash 價格推算出來的估值，差不多是 Flash 的 10 倍，Google 自己還沒官方公布</a>。所以你看到的那組數字，現在是估的不是定的。</p>

<p>會強調這個，是因為選型最怕拿估值當定案去算帳。規格表上最亮的那幾個數字，往往是還沒被現實磨過的；真正能拿來做決策的，是你能查證、能複算的那部分。Deep Think 也一樣，它是 Gemini 的延伸推理模式，<a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">概念上等同 Claude 的延伸思考或 OpenAI o 系列的推理</a>，但要用它的完整版得吃 $250 一個月的 Ultra 方案，這是目前消費端最貴的訂閱。能力是一回事，用得起、用得到又是另一回事。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s2.webp" width="960" height="1440" loading="lazy" decoding="async" alt="規格還沒全部落定，定價是估算不是定案，先踩剎車">

<h2>把三家攤在同一張表上看</h2>

<p>與其各看各的規格頁，不如把這三家放在你真的會比較的三個欄位：脈絡長度、推理模式、API 定價。其餘花俏的東西先放一邊。</p>

| 旗艦 | 脈絡長度 | 推理模式 | API 定價（每百萬 token 輸入/輸出） |
|---|---|---|---|
| Gemini 3.5 Pro | <a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">200 萬 token（量產最長）</a> | Deep Think | <a href="https://byteiota.com/gemini-3-5-pro-2m-tokens-deep-think-and-the-10x-pricing-problem/" target="_blank" rel="noopener">估約 $15/$60（未官方）</a> |
| Claude Fable 5 | <a href="https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it" target="_blank" rel="noopener">100 萬 token</a> | 延伸思考 | <a href="https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it" target="_blank" rel="noopener">$10/$50</a> |
| GPT-5.5 | <a href="https://openrouter.ai/openai/gpt-5.5" target="_blank" rel="noopener">約 100 萬（92.2 萬輸入/12.8 萬輸出）</a> | o 系列推理 | <a href="https://openrouter.ai/openai/gpt-5.5" target="_blank" rel="noopener">$5/$30</a> |

<p>這張表的重點不是替誰加冕。三家都有延伸推理、脈絡都長到一般工作用不完，價格帶卻明顯分層：Gemini 站上最長脈絡也站上最貴（如果估值成真），Fable 5 卡中間，GPT-5.5 是裡面最便宜的一階。順帶一提，OpenAI 這邊還有<a href="https://andrew.ooo/answers/what-is-gpt-5-6-release-june-2026/" target="_blank" rel="noopener">傳聞月底接棒的 GPT-5.6（官方未證實）</a>，規格還沒確認，這也是「同月擠一起」的一部分。換句話說，沒有最強的模型，只有對上你那題前提的那個。我在<a href="/articles/opencode-overtakes-commercial-ide/">先前談開源 coding agent 超車那篇</a>也說過同一句話。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s3.webp" width="960" height="1183" loading="lazy" decoding="async" alt="把三家旗艦攤在脈絡、推理、定價三個欄位上比較">

<h2>200 萬 token，你真的用得到嗎</h2>

<p>Gemini 最搶眼的就是那個 2M 脈絡，<a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">官方說是 GPT-5 的 10 倍、Claude 量產上限的 16 倍</a>。聽起來很猛，但這裡要先問一個很實際的問題：你手上的任務，到底會不會一次塞超過一百萬 token 進去？</p>

<p>多數團隊的日常其實塞不滿。一份合約、一個程式庫的相關檔案、一場會議的逐字稿，這些離一百萬 token 都還遠，更別說兩百萬。長脈絡真正用得到的場景很具體：要一次讀完整套法規、整個大型程式庫、或一批跨文件的長報告做交叉比對，而且你不想自己切塊、不想自己接檢索。如果你的活是這種，2M 是真的差異；如果不是，那條最長脈絡對你就是規格表上好看、帳單上多付的數字。先確認你吃不吃得到，再決定它值不值。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s4.webp" width="960" height="1440" loading="lazy" decoding="async" alt="兩百萬 token 長脈絡像超大的資料桌面，但多數任務其實塞不滿">

<h2>貴一點，有時候反而是對的</h2>

<p>大家現在都在比 token 單價，這沒錯，但我想補一個本業帶來的角度：在比價的同時，回覆的品質一樣重要。如果一個模型能用最短的時間、最好的做法把工作做完，貴一點其實是可以接受的。便宜的模型如果讓你來回重試、多繞幾步才到位，那省下來的單價，最後不一定真的省到。</p>

<p>這跟我<a href="/articles/minimax-m3-open-weights-cost-structure/">先前談開源模型把智慧成本打到地板那篇</a>講的「迷宮計費」是同一件事。舊世界像電梯計費，看 token 單價、模型越大越貴、線性加總；新世界像走迷宮，同一個問題不同模型走的路不一樣長，便宜的模型可能因為想太久、重試、多輪工具呼叫，最後反而更貴。你真正付的，是「解決一次問題到底要跑多複雜的流程」，不是牌價上那個每百萬 token 多少錢。把回覆品質、把一次到位省下的時間算進去，貴一階的模型在對的任務上才划算，這跟我在<a href="/articles/claude-fable-5-mythos-class-model-tiering/">談模型分層那篇</a>說的「難題才值得用貴一倍的模型」是接得起來的。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="別只比 token 單價，回覆品質與一次到位省下的時間同樣重要">

<h2>那到底該不該換</h2>

<p>把上面收成一個可以照做的判準，順序不要倒過來。先別問「哪家旗艦最強」，先問你自己這三格：</p>

<p>第一，<strong>你吃不吃得到長脈絡</strong>。會不會一次餵超過一百萬 token、又不想自己切塊接檢索？會，Gemini 的 2M 才是真差異；不會，這條別當成換家的理由。第二，<strong>拿自家一個代表性任務算總成本，不是算單價</strong>。挑一個你每天都在做的活，用候選模型實跑一次，看它跑了幾輪、重試幾次、叫了幾次工具、最後品質如何，再把這條完整流程的成本擺在一起比，便宜的單價不等於便宜的一次任務。第三，<strong>留換家的餘地</strong>。別把提示、資料管線、工作流焊死在某一家的專屬介面上，這樣下個月又有新旗艦時你才換得動。先定義你的情境，再去挑工具，這個順序我從<a href="/articles/what-is-claw-llm-client-tool/">最早談 LLM 工具選型那篇</a>講到現在，沒變過。</p>

<img src="/images/gemini-3-5-pro-ga-model-selection-s6.webp" width="960" height="540" loading="lazy" decoding="async" alt="該不該換的可執行判準：先確認長脈絡用不用得到、算總成本、留換家餘地">

<h2>常見問題</h2>

<p><strong>Gemini 3.5 Pro 已經正式 GA 了嗎？定價是多少？</strong><br>它在六月底進入 <a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">GA 滾動釋出窗口（6/23 到 30），但 6/23 當天仍是限量企業預覽</a>。定價方面，外界流傳的 <a href="https://byteiota.com/gemini-3-5-pro-2m-tokens-deep-think-and-the-10x-pricing-problem/" target="_blank" rel="noopener">每百萬 token $15/$60 是依 Flash 推算的估值（約 10 倍），不是官方數字</a>，下單前要以 Google 正式公布為準。</p>

<p><strong>三家旗艦哪一個最強，我該選誰？</strong><br>沒有單一最強的。<a href="https://fourweekmba.com/gemini-3-5-pro-2-million-context-deep-think-launch/" target="_blank" rel="noopener">Gemini 3.5 Pro 的脈絡最長（2M）</a>、<a href="https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it" target="_blank" rel="noopener">Claude Fable 5 是 $10/$50、100 萬脈絡</a>、<a href="https://openrouter.ai/openai/gpt-5.5" target="_blank" rel="noopener">GPT-5.5 最便宜（$5/$30、約 100 萬脈絡）</a>。該選誰看你的任務吃不吃得到長脈絡、以及一個代表性任務跑完一次的總成本，不是看誰跑分高。</p>

<p><strong>token 單價最低的就最省錢嗎？</strong><br>不一定。真正的成本是解決一次問題要跑多複雜的流程。便宜的模型若得來回重試、多輪工具呼叫才到位，總成本可能比貴一階、一次到位的還高。<a href="/articles/minimax-m3-open-weights-cost-structure/">用「迷宮計費」的角度</a>，拿自家真實任務實跑算總帳，比看牌價準。</p>

<h2>結語</h2>

<p>Gemini 3.5 Pro 進 GA、三強旗艦同月擠在一起，看起來是又一輪「誰最強」的軍備競賽，但對要做事的團隊，真正的問題早就換了。脈絡長度與每塊錢買多少智慧，才是現在的選型軸線；而其中「每塊錢買多少智慧」不能只看 token 單價，得把回覆品質、把一次把事做完省下的時間算進去。先確認你的任務吃不吃得到那條最長脈絡，再拿自家代表性任務算一次總成本，最後保留換家的餘地。順序對了，下個月不管哪家又推新旗艦，你都換得動，也不會為了規格表上最亮的數字多付冤枉錢。</p>
