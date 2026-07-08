---
title: "OpenAI 一次端出 Sol、Terra、Luna 三層模型：用分層定價對打 Anthropic 的 Mythos 級距"
slug: "openai-sol-terra-luna-tiers"
description: "OpenAI 6 月 26 日一口氣端出 GPT-5.6 的 Sol、Terra、Luna 三個層級，用每百萬 token 1 到 5 美元的價格階梯，對打 Anthropic 把 Mythos 疊在 Opus 之上、要你多付一倍的單一高階打法。兩家解的不是同一題。這篇拆給要在這些 API 上蓋東西的人：該先問的不是誰家模型聰明，而是你的工作量分不分得乾淨。"
excerpt: "OpenAI 的旗艦 Sol 只要 5 美元 / 30 美元，比 Anthropic 的 Fable 5 便宜一半。這不是旗艦對旗艦硬碰價，是拿一整條價格階梯去對打一道溢價閘門。兩家的賭法根本不同。"
publishDate: "2026-08-02T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["GPT-5.6", "Sol Terra Luna", "AI 模型定價", "Anthropic Mythos", "模型選型"]
coverImage: "covers/openai-sol-terra-luna-tiers.webp"
coverAlt: "象徵 OpenAI 三層模型與分層定價階梯的抽象示意"
coverImageCredit: "Photo by Google DeepMind on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "OpenAI 6 月 26 日一次端出 GPT-5.6 的 Sol、Terra、Luna 三層，定價從每百萬 token 1 美元鋪到 5 美元輸入、6 到 30 美元輸出，還把數字（世代）跟名字（能力層級）拆開。"
  - "同樣是分層，兩家目的相反：OpenAI 攤成一條價格階梯是為了擋商品化、守住量；Anthropic 把 Mythos 疊在 Opus 之上、貴一倍還加閘門，是為了鎖住更危險的能力收溢價。旗艦 Sol（5/30）比 Fable 5（10/50）便宜一半。"
  - "台灣做 AI 應用的團隊該讀出的重點不是誰聰明：命名脫鉤後『最新的 5.6』不再等於最強，把工作量切乾淨、每段配到對的層級，該用 Luna 的地方別付 Sol 的錢，這要在寫程式時就進路由邏輯。"
references:
  - title: "OpenAI Previews GPT-5.6 With Sol, Terra, and Luna: Tiered Models, New Reasoning Modes, Limited Access"
    url: "https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/"
    publisher: "MarkTechPost"
  - title: "GPT-5.6 Pricing 2026: Sol, Terra and Luna Tiers Explained"
    url: "https://www.finout.io/blog/gpt-5.6-pricing-2026-sol-terra-and-luna-tiers-explained"
    publisher: "Finout"
  - title: "Anthropic releases its first Mythos-class model to the public"
    url: "https://fortune.com/2026/06/09/anthropic-releases-its-first-mythos-model-to-the-public/"
    publisher: "Fortune"
  - title: "Claude Fable 5 and Mythos 5: Pricing, API Costs, and Benchmark Comparison"
    url: "https://www.finout.io/blog/claude-fable-5-mythos-5-pricing-benchmarks"
    publisher: "Finout"
originalContribution: "本文把 OpenAI 的 Sol/Terra/Luna 三層價格階梯，與 Anthropic 把 Mythos 疊在 Opus 之上的單一高階閘門逐項對照，指出兩者雖同為『分層』但目的相反（守量的商品化防禦 vs 鎖能力的溢價含容），並以 Sol（5/30）低於 Fable 5（10/50）的旗艦定價為據，替台灣 API 應用團隊整理出一套『先切工作量、再配層級、把成本當架構』的選型框架。"
---

OpenAI 這次不是又發一個更強的模型，是換了一套賣法。6 月 26 日它一口氣端出 GPT-5.6 的 Sol、Terra、Luna 三個層級，用一條從每百萬 token 1 美元到 5 美元的價格階梯，去對打 Anthropic 把 Mythos 疊在 Opus 之上、要你多付一倍錢的單一高階打法。兩家在解的根本不是同一題。對要在這些 API 上蓋東西的人來說，該先看懂的不是誰家模型比較聰明，而是你的工作量分不分得乾淨、你的風險承受度要不要那個被鎖起來的版本。

<img src="/covers/openai-sol-terra-luna-tiers.webp" width="1200" height="675" loading="lazy" decoding="async" alt="象徵 OpenAI 三層模型與分層定價階梯的抽象示意">

先把這三層講清楚。[Sol 是旗艦，主打長鏈程式、資安與 agent 類的難題；Terra 是產線主力，官方說它拉到接近 GPT-5.5 的表現、價錢只要一半；Luna 最便宜最快，拿去做分類、意圖路由、內容審核這類不需要動用重推理的高量工作](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)。定價也照這條線鋪開：[Sol 是每百萬輸入 token 5 美元、輸出 30 美元；Terra 是 2.5 美元 / 15 美元；Luna 是 1 美元 / 6 美元](https://www.finout.io/blog/gpt-5.6-pricing-2026-sol-terra-and-luna-tiers-explained)。更關鍵的是命名的改動。以前 GPT-4、GPT-5 一個數字就代表一個能力世代，這次 [OpenAI 把數字跟能力拆開：「5.6」只標世代，Sol、Terra、Luna 才是會各自往前跑的能力層級](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)。以後看到「5.6」你不會知道它多強，得先讀是哪一層。這是刻意的，它把選型的責任推給你。

<img src="/images/openai-sol-terra-luna-tiers-s1.webp" width="884" height="1300" loading="lazy" decoding="async" alt="由低到高的階梯，象徵 Sol、Terra、Luna 三個能力與價格層級">

把這套擺到 Anthropic 旁邊，對比就出來了。Anthropic 六月的做法是往上疊一層：[它把 Fable 5 推上「Mythos 級」這個比 Opus 高一階的層，定價每百萬輸入 10 美元、輸出 50 美元，剛好是 Opus 4.8 的兩倍](https://fortune.com/2026/06/09/anthropic-releases-its-first-mythos-model-to-the-public/)，而拿掉安全護欄的 Mythos 5 只留給政府與少數審核過的單位。我先前[拆過這條 Mythos 分層對開發者選型的意義](/articles/claude-fable-5-mythos-class-model-tiering/)。OpenAI 走的是反方向。它不往上疊一個更貴的頂層，而是把同一個世代攤成一條階梯，讓你按任務挑價位。它的旗艦 Sol 只要 5 美元 / 30 美元，[比 Anthropic 的 Fable 5（10 美元 / 50 美元）足足便宜一半](https://www.finout.io/blog/claude-fable-5-mythos-5-pricing-benchmarks)。所以這不是拿旗艦對旗艦硬碰價，是拿一整條價格階梯去對打一道溢價閘門。

追下去問，兩家為什麼選不同的賣法。OpenAI 要擋的是商品化：聊天與通用推理這件事越來越多人做得出八成像，硬守單一高價守不住毛利，把層級攤開、讓買方自己往下選便宜那格，反而黏得住量。Anthropic 賭的是另一件事，它要把真正更難、也更危險的能力關起來收溢價，順便含容資安、生物這類高風險用途。同樣是分層，一個為了守住量，一個為了鎖住能力。

<img src="/images/openai-sol-terra-luna-tiers-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="兩條分岔的路徑，象徵階梯定價與單一溢價閘門兩種策略">

所以買方該問的問題，不是「Sol 跟 Fable 5 誰聰明」。這題問錯了。先定義你要解的工作，再回頭挑層級，順序不能倒。真正該問的是兩個。第一，你的工作量切不切得乾淨。如果你的流量裡有一大塊是路由、分類、抽欄位這種規則明確的活，那用 Luna 這種每百萬輸出 6 美元的層去接，成本會跟用旗艦差一個量級；只有那些長鏈、跨檔案、要模型自己驗證自己的 agent 任務，才值得推到 Sol。OpenAI 這次還替上層加了兩個推理旋鈕，[max 模式把單一條推理鏈加深、ultra 模式讓多個子代理並行協作](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)，這些都是給真的難題用的，套在簡單任務上只是燒錢。

第二個問題是風險。如果你碰的是資安、生物這類題目，Anthropic 那條線會把請求悄悄降一階、改用能力較弱的模型回答，OpenAI 這批也還只開給[約 20 家受信任的機構做限量預覽，之後幾週才逐步放寬](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)。要不要、拿不拿得到那個被鎖或被降級的版本，取決於你的用途，不取決於跑分。

<img src="/images/openai-sol-terra-luna-tiers-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="先把任務分類再選對應層級的決策示意">

那台灣做 AI 應用的團隊該讀出什麼。第一，別再用「用最新最強的」當預設。命名脫鉤之後，「最新的 5.6」不再等於「最強」，你要嘛讀懂 Sol、Terra、Luna 分別對應什麼，要嘛就會在該用 Luna 的地方付 Sol 的錢。對燒錢速度敏感的新創，這一格配錯，一個月的 API 帳單就差很多。

第二，把成本當架構在設計，不是事後才省。一條產品線裡，哪些呼叫走 Luna、哪些走 Terra、哪些非 Sol 不可，這個切分要在寫程式的時候就想清楚、塞進路由邏輯，而不是上線後帳單爆掉才回頭砍。第三，看策略別只看價目表。[Anthropic 在公開 Fable 5 前幾天才剛警告 AI 太危險、呼籲業界裝剎車](https://fortune.com/2026/06/09/anthropic-releases-its-first-mythos-model-to-the-public/)，它的溢價閘門是安全論述的延伸；OpenAI 的階梯是成本論述的延伸。你押哪一家、押哪一層，其實是在選你認同哪一種對 AI 的假設。

<img src="/images/openai-sol-terra-luna-tiers-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發團隊在雲端 API 上規劃模型成本的示意">

一次端三層、還把命名跟能力拆開，OpenAI 這步不是技術宣示，是價格戰的隊形。它賭的是把價值攤在一條階梯上、讓量自己流下來；Anthropic 賭的是把最強的能力關進閘門裡收溢價。兩種賭法現在都還沒分出勝負。但對要在上面蓋東西的人，早一點把自己的工作量切乾淨、把每一段配到對的層級，比記住 Sol 這個名字重要得多。

<img src="/images/openai-sol-terra-luna-tiers-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="棋局布局，象徵兩家在定價策略上的長線賭注">

<h2>常見問題</h2>

<p><strong>OpenAI 的 Sol、Terra、Luna 差在哪？</strong><br>它們是 GPT-5.6 這個世代裡的三個能力層級。<a href="https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/" target="_blank" rel="noopener">Sol 是旗艦，處理長鏈程式、資安與 agent 類難題；Terra 是產線主力，效能接近 GPT-5.5 但價錢約一半；Luna 最便宜最快，適合分類、路由、審核這種高量但不需重推理的工作</a>。名字代表能力層級，會各自往前迭代，數字只標世代。</p>

<p><strong>GPT-5.6 三層各要多少錢？</strong><br>以每百萬 token 計，<a href="https://www.finout.io/blog/gpt-5.6-pricing-2026-sol-terra-and-luna-tiers-explained" target="_blank" rel="noopener">Sol 是輸入 5 美元、輸出 30 美元；Terra 是 2.5 美元 / 15 美元；Luna 是 1 美元 / 6 美元</a>。同一段對話走哪一層，成本可以差到五倍以上，所以選層是成本問題不是面子問題。</p>

<p><strong>Sol 跟 Anthropic 的 Fable 5 哪個划算？</strong><br>單看旗艦定價 Sol 便宜。Sol 是 5 美元 / 30 美元，<a href="https://www.finout.io/blog/claude-fable-5-mythos-5-pricing-benchmarks" target="_blank" rel="noopener">Anthropic 的 Fable 5 是 10 美元 / 50 美元，剛好貴一倍</a>。但划不划算要看任務：規則明確的高量工作用 Luna 或 Terra 更省，只有長鏈、要自我驗證的難題才值得推到最高階，這時該比的是誰在你那類任務上真的做得完，而不是誰的旗艦標價低。</p>

<p><strong>我的專案該選哪一層？</strong><br>先把流量拆開再決定。路由、分類、抽欄位這類規則明確的活走 Luna；一般產線工作走 Terra；長鏈、跨檔案、要模型自我驗證的 agent 任務才用 Sol。把這個切分寫進路由邏輯、在開發階段就決定，不要整條產品線都掛旗艦，否則帳單會用最貴的層去接最便宜就能做完的活。</p>
