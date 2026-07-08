---
title: "FARS 全自動 AI 研究系統首度公開部署：166 篇論文零人工，但它解錯了題"
slug: "fars-ai-research-validation-bottleneck"
description: "AI 新創 Analemma 的 FARS 系統跑 417 小時、自動產出 166 篇機器學習論文、全程零人工。但平均審稿分數只有 3.17／10、近三成被標出誠信問題。它自動化了最容易的產出，把最難的驗證與信任丟回一個已超載的學術系統。"
excerpt: "AI 能自己寫 166 篇論文，這件事技術上做到了。但真正該問的不是它能不能寫，而是這批論文有沒有人審得動、信得過。"
publishDate: "2026-07-14T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["AI 自動研究", "FARS", "學術誠信", "同儕審查", "國科會評鑑"]
coverImage: "covers/fars-ai-research-validation-bottleneck.webp"
coverAlt: "象徵全自動 AI 研究系統把論文從發想到完稿自動產出的概念示意"
coverImageCredit: "Photo by Tara Winstead on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "FARS 由 AI 新創 Analemma 開發，四個代理人接力發想、規劃、實驗、寫作，417 小時自動產出 166 篇機器學習論文、燒掉 216 億 token、成本約 18.6 萬美元，全程零人工。"
  - "但品質是另一回事：平均審稿分數只有 3.17／10、僅 17.7% 達 ICLR 錄取門檻、27.9% 被審過的論文被標出實驗設計或誠信問題。FARS 證明的是產量，不是研究品質。"
  - "研究的瓶頸從來不在生成，在驗證與信任。arXiv 已因 AI 灌水論文祭出一年禁令；台灣國科會今年 2 月已廢除論文量化評鑑，這個方向現在看格外有先見之明。"
references:
  - title: "FARS: A Fully Automated Research System Deployed at Scale"
    url: "https://arxiv.org/html/2606.31651v1"
    publisher: "arXiv (Analemma)"
  - title: "FARS：Fully Automated Research System"
    url: "https://analemma.ai/fars/"
    publisher: "Analemma"
  - title: "The AI scientist: now academic papers can be fully automated, what does this mean for the future of research?"
    url: "https://theconversation.com/the-ai-scientist-now-academic-papers-can-be-fully-automated-what-does-this-mean-for-the-future-of-research-282161"
    publisher: "The Conversation"
  - title: "A key science publishing platform is cracking down on AI slop"
    url: "https://theconversation.com/a-key-science-publishing-platform-is-cracking-down-on-ai-slop-283136"
    publisher: "The Conversation"
  - title: "鼓勵研究落地 國科會計畫審查不再重論文量化指標"
    url: "https://www.cna.com.tw/news/ahel/202502200148.aspx"
    publisher: "中央社 CNA"
originalContribution: "本文把 FARS 的產量數字（166 篇、417 小時）與其品質數字（平均 3.17／10、17.7% 達標、27.9% 誠信問題）並置，提出『它自動化的是最容易的生成、把最難的驗證外部化給已超載的同儕審查層』的分析框架，並交叉台灣國科會 2026 年 2 月廢除論文量化評鑑的政策，指出以篇數評鑑在 AI 量產時代等於自願被灌水。"
---

FARS 這套系統證明的是產量，不是研究。AI 新創 Analemma 讓它連續跑 417 小時、自動產出 166 篇完整的機器學習論文、全程零人工，這件事技術上做到了。但真正該問的問題不是「AI 能不能自己寫論文」，那個答案是能；該問的是「它解的是不是對的題」。答案是沒有。它把研究裡最容易自動化的一段（從發想到起草）自動化了，把最難、也最花人力的一段（驗證與信任）原封不動丟回一個已經快撐不住的系統。

<img src="/covers/fars-ai-research-validation-bottleneck.webp" width="1200" height="800" loading="lazy" decoding="async" alt="象徵全自動 AI 研究系統把論文從發想到完稿自動產出的概念示意">

先把事情講清楚。FARS 的全名是 Fully Automated Research System，由 AI 新創 Analemma 開發。它不是一個聊天機器人，而是[四個分工的代理人接力](https://arxiv.org/html/2606.31651v1)：Ideation 負責發想題目、Planning 排實驗計畫、Experiment 跑程式與實驗、Writing 把結果寫成論文。中間所有的提案、程式、日誌、結果都寫進一個共用工作區，一篇論文從一句研究方向長到完稿，過程不需要人插手。這輪公開部署[跑了 417 小時、燒掉 216 億個 token、總成本約 18.6 萬美元](https://arxiv.org/html/2606.31651v1)，換算下來一篇論文大約 1,120 美元，166 篇涵蓋 67 個細分的 AI／機器學習主題。

<img src="/images/fars-ai-research-validation-bottleneck-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="四個 AI 代理人接力把研究方向自動生成論文的流水線示意">

帳面上很驚人，平均兩個半小時就生一篇論文。但把品質數字攤開看，故事就不一樣了。Analemma 找了 88 位審稿人，對其中 140 篇論文做了[282 份結構化評審](https://arxiv.org/html/2606.31651v1)，結果是：平均總分只有 3.17 分（滿分 10），只有 17.7% 達到頂級會議 ICLR 的錄取門檻（6 分）。更麻煩的是誠信問題，有 27.9% 被審過的論文被至少一位審稿人標出實驗設計病灶或內部前後矛盾。換句話說，FARS 證明的是產量，不是品質。它能穩定地把東西生出來，但生出來的東西大多達不到能發表的標準。

<img src="/images/fars-ai-research-validation-bottleneck-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="以放大鏡逐項檢查品質，象徵 FARS 論文的審查與評分">

這裡要追一下因，為什麼我說它解錯題。一篇論文之所以是一個有用的「訊號」，代表某個人投入了時間、判斷、實驗與同儕檢驗，靠的是產出很貴。當產出變便宜、變得可以量產，訊號本身就跟著貶值。研究真正的瓶頸，從來不在「想不想得出題目、寫不寫得出文字」，這兩件 LLM 早就會做。瓶頸在後面那一段：這個結果是真的嗎、實驗設計站不站得住、有沒有人願意花時間審它。FARS 把最不缺的產能又放大了一輪，對最缺的驗證能力一點幫助都沒有。可信度靠的是流程，不是模型多大或跑多快。

<img src="/images/fars-ai-research-validation-bottleneck-s3.webp" width="960" height="1284" loading="lazy" decoding="async" alt="大量堆疊的文件，象徵論文被量產後訊號價值貶值">

而這個驗證的層，本來就已經在崩。就在 FARS 上場的同時，預印本平台 arXiv 因為被 AI 生成的低品質論文灌爆，[對作者祭出最重一年的禁令](https://theconversation.com/a-key-science-publishing-platform-is-cracking-down-on-ai-slop-283136)，理由很直白：只要一篇論文有明確證據顯示作者沒檢查 AI 生成的內容，那整篇都不能信。同一篇分析也指出，生醫領域現在大約每 8 篇論文就有 1 篇含 AI 生成文字。同儕審查的人力本來就追不上投稿量，[FARS 這種系統一年可以產出數千篇](https://theconversation.com/the-ai-scientist-now-academic-papers-can-be-fully-automated-what-does-this-mean-for-the-future-of-research-282161)，等於把最貴的一段自動化，卻把驗證的成本全推給一個已經超載的下游。這是把成本外部化，不是解決問題。

<img src="/images/fars-ai-research-validation-bottleneck-s4.webp" width="867" height="1300" loading="lazy" decoding="async" alt="被文件淹沒的桌面，象徵同儕審查層在 AI 論文洪流下超載">

台灣該從這裡讀出什麼？剛好台灣的學術評鑑走在一個對的方向上。國科會今年 2 月宣布[廢除計畫的量化成果表、不再要求填論文與專利篇數](https://www.cna.com.tw/news/ahel/202502200148.aspx)，改看專利、產學合作、社會貢獻與影響力。主委吳誠文講得很重：研究的目的不應該是發表論文，「不應該把學術當成代工廠」。FARS 出現之後，這個政策的先見之明才看得更清楚：當 AI 能量產論文，還把升等、計畫、排名綁在篇數上，等於自願讓自己的評鑑指標被灌水。台灣要做的不是比誰生得快，而是把評鑑的重心移到 AI 現在還做不好的那一段：真正的驗證、落地與貢獻。

<img src="/images/fars-ai-research-validation-bottleneck-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="大學圖書館與研究環境，象徵台灣學術評鑑從篇數轉向貢獻">

FARS 不是壞消息，它把一件事逼到台面上講清楚：研究的難點從來不在生成，在驗證與信任。誰能把驗證的流程做起來，誰才拿到真正的護城河。看懂這一點，比記住「166 篇、零人工」這個數字重要得多。

<h2>常見問題</h2>

<p><strong>FARS 真的能取代 AI 研究人員嗎？</strong><br>還不行。FARS 能自動產出完整論文，但這批論文[平均審稿分數只有 3.17／10、僅 17.7% 達 ICLR 錄取門檻](https://arxiv.org/html/2606.31651v1)。它取代的是「把想法寫成初稿」這段勞力，取代不了判斷實驗站不站得住、結果可不可信的那段判斷。</p>

<p><strong>AI 自動生成的論文品質到底怎麼樣？</strong><br>以 FARS 這批來看，大多達不到能發表的標準。[近三成被審過的論文被標出實驗設計問題或前後矛盾](https://arxiv.org/html/2606.31651v1)。能穩定產出不等於產出可用，量產反而放大了把關的難度。</p>

<p><strong>為什麼說量產論文對同儕審查是問題？</strong><br>因為審查的人力本來就不夠。arXiv 已因 AI 生成的低品質論文[對作者祭出一年禁令](https://theconversation.com/a-key-science-publishing-platform-is-cracking-down-on-ai-slop-283136)，而全自動系統一年可產出數千篇。產出被自動化、驗證沒被自動化，等於把成本全推給已超載的審查層。</p>

<p><strong>台灣的學術評鑑會受什麼影響？</strong><br>影響在於「用篇數評鑑」會愈來愈危險。台灣國科會今年 2 月已[廢除量化成果表、不再要求填論文篇數](https://www.cna.com.tw/news/ahel/202502200148.aspx)，改看實際貢獻。當 AI 能量產論文，把升等與計畫綁在篇數上，就是自願被灌水。</p>
