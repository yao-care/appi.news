---
title: "Claude Sonnet 5 成 Claude Code 預設模型：百萬 token 脈絡、promo 價 $2/$10 的真相"
slug: "sonnet-5-claude-code-default"
description: "Claude Code 的 sonnet 預設別名改指 Sonnet 5，帶 100 萬 token 脈絡窗、promo 價 $2/$10（標準 $3/$15，2026/8/31 止）。但同時換了新 tokenizer，同一段文字多切約三成 token，帳面降價未必等於帳單變輕。"
excerpt: "$2/$10 看起來比 Sonnet 4.6 的 $3/$15 便宜，但 Sonnet 5 換了新 tokenizer、同一段文字多切約 30% token。單價降、實際請求成本未必降。真正的結構性改變是那顆預設就給滿的百萬 token 脈絡窗。"
publishDate: "2026-08-06T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["Claude Sonnet 5", "Claude Code", "AI 寫程式", "token 成本", "脈絡窗"]
coverImage: "covers/sonnet-5-claude-code-default.webp"
coverAlt: "象徵 Claude Sonnet 5 成為 Claude Code 預設模型的程式碼與 AI 抽象示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Claude Code 日常寫程式的 sonnet 預設別名，在 Anthropic API 上現在指向 Sonnet 5，帶 100 萬 token 脈絡窗與 adaptive thinking 預設，promo 價 $2/$10（標準 $3/$15，2026/8/31 止）。"
  - "別把 promo 價當降價：Sonnet 5 換了新 tokenizer，同一段文字約多切三成 token（英文約 1.42 倍、Python 約 1.27 倍、簡體中文幾乎不變），帳面單價降、實際每次請求的帳單未必變輕。"
  - "真正的結構性改變是那顆預設就給滿的百萬 token 脈絡窗，不是價格；決定 AI 寫程式成本的是脈絡與工作流怎麼管，不是單價表上的數字。"
references:
  - title: "What's new in Claude Sonnet 5"
    url: "https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5"
    publisher: "Anthropic (Claude Docs)"
  - title: "Model configuration（Claude Code）"
    url: "https://code.claude.com/docs/en/model-config"
    publisher: "Anthropic (Claude Code Docs)"
  - title: "Pricing（Claude Platform Docs）"
    url: "https://platform.claude.com/docs/en/about-claude/pricing"
    publisher: "Anthropic (Claude Docs)"
  - title: "Claude Sonnet 5 lands with 1M context and a tokenizer tax"
    url: "https://aiweekly.co/alerts/claude-sonnet-5-lands-with-1m-context-and-a-tokenizer-tax"
    publisher: "AI Weekly"
originalContribution: "把官方分開發布的兩件事（promo 降價、換新 tokenizer 讓 token 變多）併在一起算，指出帳面單價與實際請求成本之間的落差，並拆出中英文與程式碼的 tokenizer 差異對台灣開發者的實務影響。"
---

這波該看懂的一句話：別把 Claude Sonnet 5 的 promo 價當成降價。帳面上 $2/$10 比 Sonnet 4.6 的 $3/$15 便宜，但 Anthropic 同一時間[換了新的 tokenizer，同一段文字會被切成大約多三成的 token](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5)。單價降了，你每次請求實際被算的 token 卻變多，帳單未必真的變輕。這次真正的結構性改變不在價格，在那顆預設就給滿的 100 萬 token 脈絡窗。

<img src="/images/sonnet-5-claude-code-default-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者終端機畫面，象徵 Claude Code 以 Sonnet 5 為日常寫程式的預設模型">

先把事件講清楚。Sonnet 5 是 Sonnet 4.6 的直接升級，最有感的地方是它落進了 Claude Code：在 Anthropic 官方 API 上，[`sonnet` 這個別名現在指向 Sonnet 5](https://code.claude.com/docs/en/model-config)，而 `sonnet` 就是 Claude Code 日常寫程式的預設工作模型。它[預設就帶 100 萬 token 的脈絡窗（這也是上限，沒有較小的版本），最多 128K 輸出，且 adaptive thinking 預設開啟](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5)。對每天用 Claude Code 的人來說，不用改任何設定，換模型這件事已經替你發生了。

<img src="/images/sonnet-5-claude-code-default-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="抽象的數位資料與程式碼流，象徵新 tokenizer 把文字切成更多 token">

那為什麼說「降價可能是假降價」。關鍵在 tokenizer。tokenizer 就是把你的文字切成一個個 token 的那把刀，模型是按 token 計費的。Sonnet 5 換了新的切法，[官方直接寫明「同一段文字約多產生 30% token」](https://platform.claude.com/docs/en/about-claude/pricing)，而且不是平均分攤：[英文約 1.42 倍、西班牙文約 1.33 倍、Python 程式碼約 1.27 倍，簡體中文則幾乎沒變](https://aiweekly.co/alerts/claude-sonnet-5-lands-with-1m-context-and-a-tokenizer-tax)。把兩件事疊起來看：單價從 $3/$15 促銷到 $2/$10，帳面砍了三分之一；但同一份英文提示詞或程式碼要多算約三成 token。一來一回，一段以英文與程式為主的請求，實際帳單可能跟 Sonnet 4.6 差不了多少，促銷結束回到 $3/$15 後甚至會更貴。

<img src="/images/sonnet-5-claude-code-default-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="計算機與財務報表，象徵評估 AI 寫程式成本的單價、token 數與用量">

這裡要踩一個剎車：很多人評估 AI 寫程式划不划算，只盯著單價表上那個「每百萬 token 多少錢」。但單價不是成本。你的帳單是「token 數 × 單價 × 用量」三個數字相乘，換 tokenizer 動到的是第一個數字，促銷動到的是第二個。只比第二個，就是解錯題。要算清楚，唯一可靠的做法是拿你自己真實的提示詞，用 Anthropic 的 token 計數工具在 Sonnet 5 上實測一次，不要沿用 Sonnet 4.6 量過的數字，也不要憑感覺推估。

<img src="/images/sonnet-5-claude-code-default-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料流與自動化管線示意，象徵百萬 token 脈絡窗改變開發工作流">

那什麼才是這次真正值得注意的槓桿？是那顆百萬 token 的脈絡窗，而且[它是以標準單價計費、沒有長脈絡加價](https://platform.claude.com/docs/en/about-claude/pricing)。100 萬 token 大到能把一個中型程式庫整個塞進去，或撐一場很長的自動化 session 不斷線，這才是 Sonnet 5 對 Claude Code 這種代理式寫程式工具的實質改變。但這裡又有個反直覺的地方：脈絡塞得越多，token 就越多，帳單就越高。所以決定你成本的，不是模型單價表上的數字，而是你怎麼管脈絡、怎麼設計工作流，該餵什麼、不該餵什麼。可信度與成本，靠的都是流程設計，不是模型本身多聰明。

<img src="/images/sonnet-5-claude-code-default-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="現代科技工作空間，象徵台灣軟體團隊與獨立開發者評估 AI 寫程式成本">

回到台灣的開發現場。這件事對台灣團隊有個容易被忽略的細節：tokenizer 漲的是英文與程式碼，中文幾乎不受影響。如果你的提示詞是中文為主、只夾少量程式，這波 tokenizer 稅對你相對輕；但真正燒 token 的往往不是聊天，是你貼進去的程式碼、英文的 README 與 commit 訊息、log。獨立開發者與小型團隊尤其該把握這段到 8 月 31 日的促銷窗口，先用自己的實際用量算一輪，決定要不要在這段期間把量拉上來，而不是看到「降價」兩個字就直接加碼。

把單價當成本，是這波最容易犯的錯。$2/$10 是真的，多三成 token 也是真的，兩件事要一起算才有意義。看懂帳單怎麼算出來，比記住促銷價那個數字重要。

<h2>常見問題</h2>

<p><strong>Claude Sonnet 5 現在一百萬 token 要多少錢？</strong><br>促銷期是每百萬 token 輸入 $2、輸出 $10，這個價[到 2026 年 8 月 31 日止](https://platform.claude.com/docs/en/about-claude/pricing)，之後回到標準的 $3/$15。要注意這只是單價，Sonnet 5 換了新 tokenizer，同一段文字會被算成更多 token，實際成本要用你自己的用量另外計算。</p>

<p><strong>為什麼說降價可能是假降價？</strong><br>因為 Sonnet 5 在降單價的同時[換了新的 tokenizer，同一段文字約多產生 30% token](https://platform.claude.com/docs/en/about-claude/models/whats-new-sonnet-5)，英文與程式碼漲得更多、中文幾乎不變。單價砍三分之一、token 多三成，一來一回，以英文和程式為主的請求實際帳單未必變輕。</p>

<p><strong>我要怎麼在 Claude Code 用到 Sonnet 5？</strong><br>在 Anthropic 官方 API 上，[Claude Code 的 `sonnet` 別名已經指向 Sonnet 5](https://code.claude.com/docs/en/model-config)，也就是日常寫程式的預設模型，通常不用手動改。官方文件註明 Sonnet 5 需要 Claude Code v2.1.197 以上版本，舊版可跑 `claude update` 更新。</p>

<p><strong>一百萬 token 的脈絡窗對寫程式有什麼實際用途？</strong><br>它大到能把一個中型程式庫整個放進脈絡，或撐一場很長的自動化寫程式 session 不中斷，而且[以標準單價計費、沒有長脈絡加價](https://platform.claude.com/docs/en/about-claude/pricing)。但脈絡塞越多、token 越多、帳單越高，所以重點是脈絡管理，不是無腦全塞。</p>

<p><strong>中文使用者會被這次 tokenizer 改動影響嗎？</strong><br>影響很小。根據實測，[新 tokenizer 讓英文約多 1.42 倍、Python 約 1.27 倍 token，簡體中文則幾乎沒變](https://aiweekly.co/alerts/claude-sonnet-5-lands-with-1m-context-and-a-tokenizer-tax)。真正變貴的是你貼進去的程式碼與英文內容，不是中文對話本身。</p>
