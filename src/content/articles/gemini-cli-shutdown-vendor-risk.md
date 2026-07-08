---
title: "Google 6/18 關掉 Gemini CLI、改推閉源 Antigravity：你依賴的開發工具，被供應商說停就停"
slug: "gemini-cli-shutdown-vendor-risk"
description: "Google 於 2026 年 6 月 18 日停止對免費與 Pro/Ultra 用戶服務 Gemini CLI，改推閉源的 Antigravity CLI，沒有緩衝期，呼叫 gemini 的 CI/CD 腳本當天全斷。真正的教訓不是 Google 太狠，而是把關鍵流程綁在單一供應商的免費工具上，本來就是一筆沒算進去的風險。"
excerpt: "免費、開源、好用的官方工具一夕收掉，開發者該解的題不是趕快換去 Antigravity，而是怎麼讓手上的工具隨時可替換。"
publishDate: "2026-07-27T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["Gemini CLI", "Antigravity", "供應商鎖定", "開發工具", "開源"]
coverImage: "covers/gemini-cli-shutdown-vendor-risk.webp"
coverAlt: "開發者在終端機前寫程式，象徵被供應商說停就停的命令列工具"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Google 於 2026 年 6 月 18 日停止對免費、Google AI Pro 與 Ultra 用戶服務 Gemini CLI，改推閉源的 Antigravity CLI；只有 Gemini Code Assist 企業版授權維持不變。"
  - "Gemini CLI 原本是 Apache 2.0 開源專案，接手的 Antigravity CLI 是閉源 Go 改寫、上線時沒有 1:1 功能對等；沒有緩衝期，呼叫 gemini 指令的 CI/CD 腳本與自動化當天直接斷。"
  - "真正該解的題不是趕快換去 Antigravity，而是把工具做成可替換的抽象層：先定義工作流程要的能力，再讓具體工具能被抽換，才不會下次又被說停就停。"
references:
  - title: "An important update: Transitioning Gemini CLI to Antigravity CLI"
    url: "https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/"
    publisher: "Google Developers Blog"
  - title: "Bye-bye, Gemini CLI; Google nudges devs toward Antigravity"
    url: "https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605"
    publisher: "The Register"
  - title: "Gemini CLI and Code Assist shut down for consumers this week amid Antigravity focus"
    url: "https://9to5google.com/2026/06/17/gemini-cli-code-assist-shutting-down/"
    publisher: "9to5Google"
  - title: "Google Kills Gemini CLI June 18: Antigravity Migration"
    url: "https://www.aibuilderclub.com/blog/google-kills-gemini-cli-june-18-2026"
    publisher: "AI Builder Club"
originalContribution: "本文把 Gemini CLI 停用事件從『又一個工具改朝換代』重新定義成『免費開發工具的誘因結構風險』，用可替換性抽象層而非換一家供應商當作解法，並交叉三篇 APPI 既有文章的單一供應商依賴主題，落到台灣團隊明天早上就能做的降依賴清單。"
---

Google 在 2026 年 6 月 18 日[停止對免費、Google AI Pro 與 Ultra 用戶服務 Gemini CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)，把開發者推向新的 Antigravity CLI。真正的教訓不是「Google 太狠」，而是把關鍵工作流程綁在單一供應商的免費工具上，本來就是一筆沒被算進去的風險。追因不在 Google 的道德，在免費開發工具的商業模式。開發者該解的題也不是「趕快換去 Antigravity」，而是「怎麼讓手上的工具隨時可替換」。

先講清楚發生了什麼。Google 5 月先預告、6 月 18 日硬切斷，免費與個人訂閱層的 Gemini CLI 直接停止服務，只有[持有 Gemini Code Assist 企業版授權的組織不受影響](https://9to5google.com/2026/06/17/gemini-cli-code-assist-shutting-down/)。接手的是 Antigravity CLI，屬於 Google 新的 Antigravity 代理平台，用 Go 改寫、主打多代理協作。問題在於[沒有緩衝期，任何呼叫 `gemini` 指令的 CI/CD 流水線、shell 腳本或自動化，當天就斷，沒有事先警告](https://www.aibuilderclub.com/blog/google-kills-gemini-cli-june-18-2026)。認證、設定、部分指令都換了位置，舊的 `GEMINI_API_KEY` 也不再認得，腳本得重寫。

<img src="/images/gemini-cli-shutdown-vendor-risk-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="終端機跳出錯誤與警告，象徵呼叫 gemini 指令的自動化流程一夕失效">

這件事讓人特別刺的地方，不是停用本身，是它的來歷。Gemini CLI 當初是[以 Apache 2.0 授權開源、由社群一起貢獻長大的專案，接手的 Antigravity CLI 卻是閉源，官方公開的儲存庫只有文件跟資源、沒有原始碼](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)。社群在 GitHub 上的不滿集中在三點：付出貢獻的開源工具被收進一個閉源產品、日益嚴格的用量與每週請求上限、以及 Google 用開源養大用戶再把出海口關掉。官方同時承認新工具「上線不會有 1:1 的功能對等」，有些能力可能永遠不會搬過來。

<img src="/images/gemini-cli-shutdown-vendor-risk-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="開源鎖鏈與程式碼，象徵 Apache 2.0 開源工具被改寫成閉源產品">

但這裡要先踩一個剎車：把矛頭全指向 Google 的道德，其實看錯了根因。免費、好用、官方掛保證的開發工具，它的誘因結構本來就不是「長期免費服務你」。廠商用免費開源版把生態養起來、把你的工作流程黏住，等到要收斂資源、把力氣集中到能收費的旗艦產品時，免費層就是第一個被砍的。Google 自己的說法是「把精力集中在一個為今天多代理現實打造的單一產品」，翻成白話就是：我們決定把資源移去別的地方，你得跟上。這不是 Google 特別壞，是這類工具共通的商業重力。指望供應商的善意來保證延續性，本來就是把信任放錯了地方。

<img src="/images/gemini-cli-shutdown-vendor-risk-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="免費試用與訂閱收費的示意，象徵先養用戶再收割的工具商業模式">

所以真正的問題不是「該不該換去 Antigravity」。很多人第一個反應是趕快照官方指南遷移、把腳本裡的指令改掉，這個方向沒有錯，但如果只做到這一步，很容易解錯題：你只是把同一顆雞蛋從一個籃子換到另一個籃子，而且新籃子還是閉源、還是同一家、還加了更嚴的用量上限。下次它再改一次，你又得重來。這跟我先前寫過的[Windsurf 一個月內又改名又改計價、Cursor 與 Copilot 同步轉用量收費](/articles/ai-coding-tools-repricing/)是同一種病：把核心流程綁死在單一供應商的具體產品上，你就永遠在追著別人的產品決策跑。

<img src="/images/gemini-cli-shutdown-vendor-risk-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="模組化積木象徵把開發工具做成可替換的抽象層">

解對題的順序是：先定義你的工作流程真正要的能力（在終端機裡用自然語言查程式碼、產測試、跑批次任務），再讓實作這些能力的具體工具可以被抽換。做法很具體：把對某個 CLI 的呼叫包一層自己的腳本或介面，讓底層是 Gemini、Claude 還是開源模型都能替換；CI/CD 裡別直接寫死廠商指令，走一層抽象；認證金鑰、模型名稱這些會變的東西集中管理。這也是為什麼[開源的 coding agent 反而後來居上](/articles/opencode-overtakes-commercial-ide/)：不是它比較聰明，是它把「你隨時可以帶著走、可以自己接後端」這件事變成預設。可替換性不是模型多強的問題，是落地設計的問題，跟我一直講的一樣，可信度靠流程不是靠選哪個牌子。

<img src="/images/gemini-cli-shutdown-vendor-risk-s5.webp" width="868" height="1300" loading="lazy" decoding="async" alt="工程師檢視自動化部署流程，象徵團隊降低單一供應商工具依賴">

台灣的團隊要特別把這條看進去。很多新創跟小團隊的自動化、部署、日常開發，正是靠這些免費層的官方工具撐起來的，貪的就是免費跟省事。省事沒有錯，但要把「這個工具明天消失，我的產線會不會停」當成一個真的要回答的問題，而不是假設它會一直在。這跟我寫過的[把關鍵流程綁單一雲模型、一紙出口管制令就全球下線](/articles/single-vendor-ai-continuity-risk/)是同一個題目的不同版本：斷點可能來自地緣政治，也可能只是廠商的一次產品收斂。明天早上能做的第一步，是盤點手上有哪幾條流程完全依賴某一家的免費工具、斷了誰會痛，先從最痛的那條開始包一層抽象、留一個備援。

看懂這件事的重點，不是記住 6 月 18 日這個日期，是把「供應商說停就停」當成常態來設計，而不是當成意外來反應。工具會換、廠商會變，唯一你能控制的，是有沒有把自己的流程做成可替換的。

## 常見問題

<p><strong>Gemini CLI 停用後，我原本的腳本和自動化還能用嗎？</strong><br>不能。Google 在 2026 年 6 月 18 日就切斷免費與 Pro/Ultra 用戶的服務，[沒有緩衝期，呼叫 `gemini` 指令的 CI/CD 流水線與 shell 腳本當天直接失效](https://www.aibuilderclub.com/blog/google-kills-gemini-cli-june-18-2026)，舊的 API 金鑰也不再認得，需要改寫成新工具的指令與認證方式。</p>

<p><strong>Antigravity CLI 和 Gemini CLI 差在哪？</strong><br>最關鍵的差別是 Gemini CLI 原本[以 Apache 2.0 授權開源，Antigravity CLI 則是閉源、用 Go 改寫](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)，主打多代理協作。Google 也明說上線時「不會有 1:1 的功能對等」，部分能力可能不會搬過來，遷移前要先確認你依賴的功能還在不在。</p>

<p><strong>付費用戶就一定不受影響嗎？</strong><br>不一定。Google AI Pro 與 Ultra 這類個人付費層一樣被停用，[只有持有 Gemini Code Assist 企業版（Standard/Enterprise）授權的組織不受影響](https://9to5google.com/2026/06/17/gemini-cli-code-assist-shutting-down/)。判斷自己會不會斷，要看的是授權類型，不是有沒有付錢。</p>

<p><strong>要怎麼避免下次又被供應商說停就停？</strong><br>把工具做成可替換的抽象層，而不是趕快換到另一家。先定義工作流程真正要的能力，再把對某個 CLI 的呼叫包一層自己的介面，讓底層模型和廠商能被抽換；CI/CD 別寫死廠商指令，並盤點哪幾條流程完全依賴單一免費工具、斷了會痛，從最痛的那條先做備援。</p>
