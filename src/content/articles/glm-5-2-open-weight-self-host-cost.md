---
title: "開源 GLM-5.2 寫程式超車 GPT-5.5、成本剩六分之一：但要 8 張 H100 才跑得動，自架的真實門檻在哪"
slug: "glm-5-2-open-weight-self-host-cost"
description: "GLM-5.2 在 SWE-bench Pro、FrontierSWE 等長時序寫程式測試贏過 GPT-5.5，API 價只要六分之一、MIT 授權、權重掛在 HuggingFace。但「開源＋便宜」最容易被解錯題：要自己架起來，得先擺 8 張資料中心級 GPU。真正在降的是授權門檻，硬體門檻沒降。"
excerpt: "為什麼一個贏過 GPT-5.5 又只要六分之一價的開源模型，多數公司還是架不起來？因為便宜的是 API，不是自架。自架 GLM-5.2 的 FP8 權重約 750GB，要 8 張 H200 才跑得舒服。"
publishDate: "2026-07-22T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["GLM-5.2", "開源模型", "自架 LLM", "AI 成本", "H100"]
coverImage: "covers/glm-5-2-open-weight-self-host-cost.webp"
coverAlt: "資料中心伺服器機櫃，象徵開源 GLM-5.2 雖免費開放權重，自架卻卡在硬體門檻"
coverImageCredit: "Photo by panumas nikhomkhai on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "GLM-5.2（Z.AI，前身智譜 Zhipu）在 SWE-bench Pro 拿 62.1 贏 GPT-5.5 的 58.6、FrontierSWE 74.4 對 72.6，MIT 授權、API 價約為 GPT-5.5 的六分之一；但 Claude Opus 4.8 仍以 69.2／75.1 壓在前面，它是「開源打進第一梯隊」不是「最強」。"
  - "六分之一是『用它的 API』的價，不是『自己架』的價。自架 FP8 權重約 750GB，8 張 H100 80GB 會卡在 KV cache、要 8 張 H200 141GB 才舒服，一套自有硬體攤提約每月 3 到 5 千美元，對照官方雲端方案月付約 30 美元，差兩三個數量級。"
  - "自架的損益平衡點在每天約 3,000 次請求以上；低於這個量，把人推去自架的通常不是省錢，是資料不能出門、要離線、要可控這些前提。台灣的機會不只在供那 8 張卡，也在量化、推論加速、邊緣運算這段『讓模型用更少硬體跑起來』的工。"
references:
  - title: "GLM-5.2 Just Beat GPT-5.5 at a Sixth of the Cost（含 SWE-bench Pro / FrontierSWE 分數與 API 價）"
    url: "https://www.labellerr.com/blog/glm-5-2-open-weight-ai-model/amp/"
    publisher: "Labellerr"
  - title: "Z.AI's GLM-5.2 outperforms GPT-5.5 on coding benchmarks at one-sixth the cost"
    url: "https://cryptobriefing.com/z-ai-glm-5-2-outperforms-gpt-5-5-coding/"
    publisher: "Crypto Briefing"
  - title: "Self-Host GLM 5.2 (2026): 8×H200 vLLM Cost vs $30/mo Cloud"
    url: "https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/"
    publisher: "ofox.ai"
  - title: "GLM-5.2 model weights（MIT 授權、1M context）"
    url: "https://huggingface.co/zai-org/GLM-5.2"
    publisher: "Hugging Face"
originalContribution: "本文把 GLM-5.2 的兩組成本分開拆：『用 API』的六分之一價，與『自架』要 8 張資料中心 GPU、每月 3 到 5 千美元攤提的真實帳，交叉 benchmark 與自架硬體需求，導出『授權門檻在降、硬體門檻沒降』的判讀框架，並延伸台灣在量化與邊緣推論這段的卡位點。"
---

開源模型 GLM-5.2 在寫程式的測試上贏了 GPT-5.5，API 價格只要六分之一，權重還用 MIT 授權直接開放。但「開源＋便宜」很容易被解讀成「所以可以自己架一台來省錢」，這是這則新聞最容易解錯的題。真相是：要把它跑起來，你得先擺一整櫃、8 張等級的資料中心 GPU。門檻不在授權，在硬體。

先看它到底贏了什麼。6 月中旬，中國的 Z.AI（前身是智譜 Zhipu）放出 GLM-5.2，[權重直接掛在 HuggingFace、採 MIT 授權](https://huggingface.co/zai-org/GLM-5.2)，任何人都能下載、商用、改。在幾個真實工程任務的測試上，[它的 SWE-bench Pro 拿 62.1，贏過 GPT-5.5 的 58.6；FrontierSWE 74.4 對 72.6](https://www.labellerr.com/blog/glm-5-2-open-weight-ai-model/amp/)，Terminal-Bench 2.1 也有 81.0。這些不是背幾題的靜態考題，是要模型連續跑一長串步驟、改一個真的 repo 的長時序任務。開源模型能在這種題型上壓過一線閉源旗艦，是這半年少見的事。

<img src="/images/glm-5-2-open-weight-self-host-cost-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者盯著螢幕上的程式碼，象徵 GLM-5.2 在真實工程任務測試上超車 GPT-5.5">

但要如實踩個剎車：贏 GPT-5.5 不等於天下第一。同一份對照裡，[Claude Opus 4.8 的 SWE-bench Pro 是 69.2、FrontierSWE 75.1](https://www.labellerr.com/blog/glm-5-2-open-weight-ai-model/amp/)，還是穩穩壓在 GLM-5.2 前面。所以精準的說法是：GLM-5.2 把「開源模型」這一格，第一次推進到跟閉源第一梯隊同桌的位置，而不是超越所有人。這個分寸很重要，因為接下來談成本的時候，你比的到底是「跟誰同級」會直接決定值不值得。

那六分之一的成本是怎麼算的？GLM-5.2 是 753B 總參數、每次推論只激活約 40B 的 MoE（混合專家）架構，帶 1M token 的 context。[它的 API 報價是每百萬 input token 1.40 美元、output 4.40 美元](https://www.labellerr.com/blog/glm-5-2-open-weight-ai-model/amp/)，[整體大約是 GPT-5.5 的六分之一](https://cryptobriefing.com/z-ai-glm-5-2-outperforms-gpt-5-5-coding/)。這個價差對「打 API 的人」是真省，一家把 AI 寫程式接進工作流的公司，帳單直接砍到一個零頭。我先前寫過[AI 寫程式工具正在集體重新定價](/articles/ai-coding-tools-repricing/)，GLM-5.2 這種開源旗艦壓價，就是那股下殺力道的來源之一。

<img src="/images/glm-5-2-open-weight-self-host-cost-s2.webp" width="960" height="541" loading="lazy" decoding="async" alt="計算機與帳單，象徵 GLM-5.2 API 成本只要 GPT-5.5 的六分之一">

問題是，成本敘事在這裡有個常被跳過的分岔：你是要「用它的 API」，還是「自己架」。開源真正解鎖的選項，是後者：你可以把權重下載回自己機房、資料完全不出門。但「可以自架」跟「自架比較便宜」是兩件事，很多人把這兩件事黏在一起，就開始解錯題。

來算自架這條路的帳。[GLM-5.2 的 FP8 精度權重大約 750GB](https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/)，光是把它塞進顯示記憶體就是一場硬仗。同一份自架分析給的配置是：FP8 要 8 張 H200 141GB 才「舒服」；換成 8 張 H100 80GB，勉強塞得下但會卡在 KV cache（context 一長就爆記憶體）。想省一點走 Q4 量化，也還要 4 張 H100。一套自有的 8×H200，硬體大約 20 萬美元、四年攤提加電費，[換算下來每月大概 3 到 5 千美元](https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/)。

<img src="/images/glm-5-2-open-weight-self-host-cost-s3.webp" width="960" height="639" loading="lazy" decoding="async" alt="資料中心整櫃 GPU 伺服器，象徵自架 GLM-5.2 需要 8 張 H100 或 H200 級顯示卡">

把兩邊擺在一起看就很清楚了。[Z.AI 官方的 coding 方案一個月大約 30 美元](https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/)，自架一套硬體攤下來每月 3 到 5 千美元。中間差了兩三個數量級。所以那句「開源省六分之一」對絕大多數人成立的版本是：用它的 API，比用 GPT-5.5 的 API 省；而不是「搬回家自己跑省」。自己跑，多數情況下反而更貴。

那自架什麼時候才划算？[那份分析抓的損益平衡點是每天超過約 3,000 次請求](https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/)，量到這個級別，自有硬體的攤提才追得上 API 帳單。低於這個量，自架就是拿一整櫃 GPU 的折舊，去換一個每月幾十美元 API 也能給你的東西。所以真正把人推去自架的，通常根本不是省錢，是別的前提條件：資料合規不能出門、要能離線、要改模型權重、要確保不被上游斷供或改價。先定義你要解的是哪個問題，是成本、是資料主權、還是可控性，順序不能倒。把順序倒過來、先看到「開源免費」就衝去架機器，是選型最常見的失敗。這一點在[開源模型的成本結構](/articles/minimax-m3-open-weights-cost-structure/)上其實是同一套邏輯：授權免費，不代表總持有成本低。

<img src="/images/glm-5-2-open-weight-self-host-cost-s4.webp" width="960" height="639" loading="lazy" decoding="async" alt="企業機房與 IT 基礎設施，象徵自架開源模型要先想清楚解的是成本還是資料主權">

台灣該從這則新聞讀出什麼？最直接的一層是硬體利多。開源旗艦一個接一個，把「想自己跑就得買 8 張旗艦 GPU」變成一種剛需，短期內受惠的還是雲端與伺服器供應鏈。但這裡有個容易看歪的地方：不是每個人都要用 FP8 全精度去跑 753B。量化技術、MoE 每次只激活一小部分參數、以及塞得進單機甚至邊緣裝置的小模型，正在把推論從「非資料中心不可」往下推。真正有意思的卡位，不只在供那 8 張卡，也在做「讓模型用更少硬體跑起來」的那一段：量化、推論加速、邊緣運算晶片。台灣在後面這段本來就有底子，這波開源壓價越兇，「怎麼用更省的硬體把它跑起來」的需求就越大。

<img src="/images/glm-5-2-open-weight-self-host-cost-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與電子零組件，象徵台灣在量化與邊緣推論這段的供應鏈機會">

GLM-5.2 這則新聞真正的訊號，不是「開源終於贏了閉源」。是模型的授權門檻正在快速消失，權重開放、MIT 授權、隨便下載，但硬體門檻一步都沒退，要跑起頂規開源模型，該擺的 GPU 一張都少不了。看懂哪個門檻在降、哪個沒降，比記住 62.1 這個分數重要。便宜的是打 API，貴的是把它變成你自己的東西。

<h2>常見問題</h2>

<p><strong>GLM-5.2 真的比 GPT-5.5 會寫程式嗎？</strong><br>在幾個長時序的真實工程任務測試上是的。<a href="https://www.labellerr.com/blog/glm-5-2-open-weight-ai-model/amp/">GLM-5.2 的 SWE-bench Pro 拿 62.1、贏過 GPT-5.5 的 58.6，FrontierSWE 也以 74.4 對 72.6 領先</a>。但同一組對照裡 Claude Opus 4.8 仍以 69.2／75.1 壓在最前面，所以比較準確的說法是它把開源模型推進到第一梯隊，而不是全世界最強。</p>

<p><strong>成本只有六分之一，我自己架一台是不是更省？</strong><br>多數情況下不會，反而更貴。六分之一指的是<a href="https://cryptobriefing.com/z-ai-glm-5-2-outperforms-gpt-5-5-coding/">用它的 API</a>比用 GPT-5.5 的 API 便宜。自架要 <a href="https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/">8 張 H200 級 GPU、硬體攤提每月約 3 到 5 千美元</a>，對照官方雲端方案月付約 30 美元，只有在每天請求量超過約 3,000 次時自架才開始划算。</p>

<p><strong>要自己跑 GLM-5.2 需要什麼硬體？</strong><br>它的 <a href="https://ofox.ai/blog/glm-5-2-self-host-vllm-hardware-cost-2026/">FP8 權重約 750GB</a>，要 8 張 H200 141GB 才跑得舒服；用 8 張 H100 80GB 塞得下但會卡 KV cache，走 Q4 量化則至少 4 張 H100。這是資料中心等級的配置，不是一般伺服器或工作站扛得住的。</p>

<p><strong>MIT 授權開放權重，代表可以免費商用嗎？</strong><br>授權層面是的，<a href="https://huggingface.co/zai-org/GLM-5.2">GLM-5.2 用 MIT 授權把權重開放在 HuggingFace</a>，可以下載、修改、商業部署，沒有使用費。但「授權免費」不等於「總持有成本低」，真正的支出在跑它需要的硬體、電力與維運，這才是自架前要先算清楚的帳。</p>
