---
title: "Codex「示範一次就變技能」：把工作流錄下來自動長成 agent，門檻換了地方"
slug: "codex-record-replay-workflow-skills"
description: "OpenAI 6/18 給 Codex 加了 Record & Replay，在 Mac 上把一段工作流做一次、錄下來就草擬成可重複執行的技能。真正的轉向不是 AI 會看你做事，而是自動化的門檻從『會不會寫程式』換成『你的流程穩不穩、成功條件清不清楚』。"
excerpt: "示範一次就變技能，聽起來很神奇。但錄一段亂七八糟的流程，只會自動化那個亂。門檻沒有消失，只是換了地方。"
publishDate: "2026-07-28T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["OpenAI Codex", "Record & Replay", "AI agent", "工作流自動化", "開放技能標準"]
coverImage: "covers/codex-record-replay-workflow-skills.webp"
coverAlt: "示意把電腦上的工作流程錄下來、自動變成可重複執行的 agent 技能"
coverImageCredit: "Photo by cottonbro studio on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "OpenAI 6/18 在 Codex 桌面 app（版本 26.616）加了 Record & Replay：在 Mac 上把一段工作流做一次錄下來，Codex 就草擬成一份記錄『何時用、要哪些輸入、步驟、怎麼驗收』的可重複技能。"
  - "真正的轉向不是『AI 會看你做事』，而是自動化的門檻搬家了：從『會不會寫程式或寫 prompt』換成『你的流程本身穩不穩、成功條件清不清楚』。錄一段爛流程只會自動化那個爛。"
  - "Record & Replay 產出的技能走 Anthropic 開源出來的 Open Agent Skills 標準，能跨 Codex、Claude Code、Gemini CLI 等工具重用；對台灣中小企業的長尾行政流程，門檻降了，但『先把 SOP 定義清楚』這件事沒有變便宜。"
references:
  - title: "Record & Replay – Codex"
    url: "https://developers.openai.com/codex/record-and-replay"
    publisher: "OpenAI Developers"
  - title: "Agent Skills – Codex"
    url: "https://developers.openai.com/codex/skills"
    publisher: "OpenAI Developers"
  - title: "Changelog – Codex"
    url: "https://developers.openai.com/codex/changelog"
    publisher: "OpenAI Developers"
  - title: "OpenAI's Codex Now Learns Workflows by Watching You Do Them Once"
    url: "https://alphasignal.ai/news/openai-s-codex-now-learns-workflows-by-watching-you-do-them-once"
    publisher: "AlphaSignal"
  - title: "Agent Skills: A standardized way to give AI agents new capabilities"
    url: "https://agentskills.io"
    publisher: "Agent Skills (open standard)"
originalContribution: "本文把 Record & Replay 從『AI 學會看你做事』的行銷框架，重新定位成『自動化門檻換位置』的問題：以 CΛ 的『解對題 vs 解錯題』與『可信度靠流程不是靠模型大小』兩個框架，指出這功能真正的槓桿在那個常被略過的『驗收步驟』與流程本身的穩定度，並交叉開放技能標準的跨工具可攜性，落地評估台灣中小企業長尾行政流程該先做的準備。"
---

OpenAI 6 月 18 日給 Codex 桌面 app 加了一個叫 [Record & Replay 的功能](https://developers.openai.com/codex/record-and-replay)：你在 Mac 上把一段工作流親手做一次、讓它錄下來，Codex 就把這段示範草擬成一份可以重複執行的「技能」。官方的說法很直白，[你不用把每個步驟和偏好寫進 prompt 裡，做給它看一次，下次它就能替你做](https://alphasignal.ai/news/openai-s-codex-now-learns-workflows-by-watching-you-do-them-once)。

真正的重點不是「AI 會看著你做事」很神奇。是自動化的門檻搬家了。以前這道門卡在「你會不會寫程式、會不會寫 prompt」，現在卡在另一個地方：你的流程本身穩不穩定、成功條件清不清楚。這個轉向對誰有利、對誰沒用，取決於你有沒有看懂門檻換到了哪裡。

<img src="/images/codex-record-replay-workflow-skills-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="一個人在筆電前操作，示意把日常工作流程做一次錄下來">

## 先把這功能講清楚

Record & Replay 目前只在 macOS 上，[跟著你的操作記錄「學會這段工作流所需要的動作與視窗內容」](https://developers.openai.com/codex/record-and-replay)，錄到你手動停止為止。你停下來之後，Codex 會寫出一份技能文件，裡面記四件事：什麼情況該用這個工作流、它需要哪些會變動的輸入、實際的步驟、以及怎麼驗證結果對不對。之後你叫它做，它就套進當次的值去跑。

規格上要留意幾個限制。這是 Codex app [版本 26.616 的更新，首波不含歐洲經濟區、英國與瑞士](https://developers.openai.com/codex/changelog)，而且要先開啟 Computer Use（讓 Codex 能操作你的電腦）才會動。官方也講得很保守：這功能在「步驟穩定、成功條件明確」時效果最好。這句話不是免責聲明，是整件事的關鍵，等一下會回來講。

<img src="/images/codex-record-replay-workflow-skills-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意生成的技能文件記錄何時使用、輸入、步驟與驗收條件">

## 這不是「AI 學會看你做事」，是自動化的門檻搬家了

先踩一個剎車。把這功能講成「AI 學會模仿人類」，會讓人誤判它能解什麼。它不會憑空補上你沒做的判斷，它忠實錄下你做的每一步，包括你的壞習慣、你臨時繞的路、你沒說清楚為什麼要這樣做的那些默會決定。

所以先問一句老問題：你打算解的到底是哪一類問題。如果一段流程本來就設計得乾淨、每一步都有明確理由、做完看得出成不成功，那把它錄成技能，是把重複勞動交出去，划算。但如果這段流程本身是一團亂，每次做法都不太一樣、成功與否憑感覺，那錄下來只是把那團亂自動化，跑十次錯八次，你還得回頭一步步查它哪裡歪掉。工具沒解你的問題，只是把症狀放大。這也是為什麼 OpenAI 自己要強調「步驟穩定、成功條件明確」才好用，門檻沒有消失，它從寫程式那一格，移到了流程設計那一格。

<img src="/images/codex-record-replay-workflow-skills-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="白板上的流程圖，示意流程本身穩不穩定決定自動化值不值得">

## 關鍵藏在那個「驗收步驟」

我認為這功能設計裡最該被看見的，是它逼你留下一個「怎麼驗證結果」的步驟。這一步平常最容易被跳過，卻是自動化能不能信任的邊界。

道理很單純。一段沒有驗收條件的自動化，出錯的時候不會停，它會帶著錯誤一路跑完，然後把一個看起來完成、其實不對的結果交給你。有明確的驗收條件，它才知道自己這次到底算成功還是失敗，該不該停下來喊人。可不可信不是看背後那顆模型多大、多聰明，是看這份技能有沒有把「什麼叫做對了」寫清楚。這跟模型選哪個關係不大，跟你把成功長什麼樣子定義得夠不夠明確，關係很大。示範的時候多做一個檢查動作，比事後怪 AI 不可靠有用得多。

<img src="/images/codex-record-replay-workflow-skills-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意品質檢查與驗收的打勾動作，是自動化能不能信任的邊界">

## 開放標準這件事，比功能本身重要

比「示範一次就變技能」更值得記住的，是這些技能長成什麼格式。[Codex 的技能走的是 Open Agent Skills 這個開放標準](https://developers.openai.com/codex/skills)：一個資料夾，裡面一份 `SKILL.md` 寫清楚名稱、描述和步驟，可以再帶腳本與參考檔。

這個格式[本來是 Anthropic 開發、開源出來的標準，現在被一大票 agent 工具採用](https://agentskills.io)，Codex、Claude Code、Gemini CLI 都在名單上，標準自己的說法是「做一次技能，就能在任何相容的 agent 上用」。意思是你在 Codex 錄出來的一段報帳流程，理論上能搬到別的工具去跑，不必被單一廠商綁死。這跟先前 [Anthropic 把 MCP 捐成 agent 事實標準](/articles/mcp-de-facto-standard-agent-governance/)是同一條線：真正在長出來的護城河，不是哪一家的功能比較炫，是這些讓 agent 能互通、能重用的底層規格。功能會被抄，格式一旦變成大家共用的地基，才擋得住。

<img src="/images/codex-record-replay-workflow-skills-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意拼圖拼合，開放技能標準讓一份技能能跨不同工具重用">

## 台灣視角：門檻降了，紀律不能降

這功能瞄準的，正是台灣一堆公司每天在做、卻一直自動化不起來的東西：報帳、請假、填制式表單、從內部系統下載每週報表這種螢幕上的長尾雜事。過去要自動化這些，得上機器人流程自動化（RPA）那套工具，導入貴、介面一改就壞、啟動後沒人維護很快就廢了。示範一次就生技能，確實把這道門檻壓低了。

但門檻降不等於可以偷懶。錄一段沒整理過的爛流程，換來的是一個會穩定出錯的技能，比人工還難收拾。真要用，順序是這樣：先挑一段你已經做到閉著眼睛都不會錯、每次做法都一致的流程，先把它的成功條件講清楚（這份報表對不對、金額有沒有對上、檔案有沒有存到該存的地方），再去錄。示範的時候刻意把那個檢查動作做出來，讓它學走。先定義好問題和驗收，再談自動化，順序不能倒。把它當成一次逼自己把 SOP 寫乾淨的機會，比當成一個免寫程式的神奇按鈕，實在得多。

<img src="/images/codex-record-replay-workflow-skills-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="辦公桌上的單據與計算機，示意台灣中小企業的長尾行政流程">

示範一次就變技能，是把自動化的入場券從工程師手上，發給了每一個把自己流程摸得夠熟的人。這是好事。但它沒有替你把流程想清楚，也沒有替你定義什麼叫做對了。這兩件事還是你的功課。看懂門檻換到哪裡，比記住「錄一次就好」這句話重要。

## 常見問題

<p><strong>Codex 的 Record & Replay 到底在做什麼？</strong><br>它讓你在 Mac 上把一段工作流親手做一次、錄下來，Codex 就把這段示範草擬成一份可重複執行的技能，裡面記錄什麼時候該用、需要哪些輸入、步驟、以及怎麼驗證結果。之後你叫它做，它會套進當次的值去跑。目前僅限 macOS，且要先開啟 Computer Use，[首波不含歐洲經濟區、英國與瑞士](https://developers.openai.com/codex/changelog)。</p>

<p><strong>示範一次就變技能，那我還需要寫程式或寫 prompt 嗎？</strong><br>寫程式那道門檻確實降低了，但門檻沒消失，只是換位置。它移到了流程本身穩不穩定、成功條件清不清楚。[OpenAI 自己說這功能在「步驟穩定、成功條件明確」時效果最好](https://developers.openai.com/codex/record-and-replay)。換句話說，要準備的不再是程式碼，而是一段你已經做得很一致、而且說得出「怎樣算做對了」的流程。</p>

<p><strong>在 Codex 錄出來的技能，能拿去別的 AI 工具用嗎？</strong><br>可以，這正是它值得注意的地方。這些技能走 [Anthropic 開源出來的 Open Agent Skills 開放標準](https://agentskills.io)，Codex、Claude Code、Gemini CLI 等工具都採用，標準的目標是「做一次技能，就能在任何相容的 agent 上用」，理論上不必被單一廠商綁死。</p>

<p><strong>我的公司想用它自動化行政流程，第一步該做什麼？</strong><br>不要先錄，先挑。挑一段你已經做到每次做法都一致、閉著眼睛都不會錯的流程，把它的成功條件先寫清楚（金額對不對、檔案有沒有存對地方），再去錄，並在示範時刻意把那個檢查動作做出來讓它學走。錄一段沒整理過的亂流程，只會得到一個會穩定出錯的技能，比人工還難收拾。</p>
