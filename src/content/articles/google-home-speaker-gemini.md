---
title: "Google 六年來首款喇叭把 Assistant 換成 Gemini：對話式 AI 走回家庭硬體，也走進月費訂閱"
slug: "google-home-speaker-gemini"
description: "Google Home Speaker 6/25 上市、99.99 美元，用 Gemini for Home 全面取代 Google Assistant，是自 2020 年 Nest Audio 以來第一款新喇叭。它修好了 Assistant 死板指令的老問題，卻同時把免費的對話能力鎖進月費 10 美元起的訂閱，而且切換後回不去。這篇拆解它到底解對了哪個問題、又換掉了哪個問題，以及台灣該從硬體這一端接什麼。"
excerpt: "喇叭終於聽得懂人話，是真進步。但把免費的對話助理升級成更好用、也更貴、還回不去的訂閱服務，是另一回事。這兩件事要分開看。"
publishDate: "2026-08-04T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["Gemini", "Google Home Speaker", "語音助理", "邊緣運算", "訂閱經濟"]
coverImage: "covers/google-home-speaker-gemini.webp"
coverAlt: "客廳裡的智慧喇叭，象徵 Google 把對話式 AI 從手機搬回家庭硬體"
coverImageCredit: "Photo by Anete Lusina on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Google 六年來第一款新喇叭把 Assistant 換成 Gemini for Home，賣點是聽得懂多步驟自然口語；但招牌功能 Gemini Live、Camera History Search、Home Briefs 全鎖在月費 10 美元起的 Google Home Premium，Assistant 時代免費的對話能力被重新包裝成訂閱。"
  - "一旦全家切換 Gemini for Home 就回不去，老裝置拿不到 Gemini Live，新喇叭音質還落在 Nest Mini 與 Nest Audio 之間；這不只是升級，是一次帶著取捨的單向遷移。"
  - "真正的訊號是對話式 AI 從手機走回家庭硬體、價值從雲端模型移到「裝置端 NPU＋訂閱」；台灣的機會不在追這台喇叭，而在接住它揭示的邊緣硬體與聲學這局。"
references:
  - title: "Meet the new Google Home Speaker, built for Gemini"
    url: "https://blog.google/products-and-platforms/devices/google-nest/google-home-speaker-gemini-features/"
    publisher: "Google（The Keyword）"
  - title: "A new era for the smart home with Gemini for Home"
    url: "https://blog.google/products-and-platforms/devices/google-nest/gemini-for-home/"
    publisher: "Google（The Keyword）"
  - title: "Gemini for Home Replaces Google Assistant"
    url: "https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/"
    publisher: "The Gadgeteer"
  - title: "The new Google Home Speaker is a slap in the face to Nest Audio users"
    url: "https://www.androidauthority.com/google-home-speaker-bad-nest-audio-upgrade-3678211/"
    publisher: "Android Authority"
  - title: "I lived with the new Google Home Speaker"
    url: "https://www.makeuseof.com/i-lived-with-google-home-speaker/"
    publisher: "MakeUseOf"
  - title: "Gemini will replace Google Assistant on Android in 2026"
    url: "https://9to5google.com/2025/12/19/google-assistant-gemini-2026/"
    publisher: "9to5Google"
  - title: "Google Nest (smart speakers)：Nest Audio 上市日期"
    url: "https://en.wikipedia.org/wiki/Google_Nest_(smart_speakers)"
    publisher: "Wikipedia"
originalContribution: "以「解對題 vs 解錯題」拆解 Google 這次換代：分開處理「Gemini 修好 Assistant 死板指令的真問題」與「同時把免費對話能力轉成不可逆的月費訂閱」兩件事，並據此主張台灣該接的是裝置端 NPU、聲學與邊緣運算這局，而非追逐喇叭本身。"
---

Google 這台新喇叭最該看懂的，不是它變聰明了，是它把一件免費的事變成要收月費、而且回不去的事。6 月 25 日上市的 [Google Home Speaker，99.99 美元，用 Gemini for Home 全面取代了 Google Assistant](https://blog.google/products-and-platforms/devices/google-nest/google-home-speaker-gemini-features/)，這是自 [2020 年 Nest Audio](https://en.wikipedia.org/wiki/Google_Nest_(smart_speakers)) 以來 Google 第一款全新智慧喇叭。它同時做了兩件性質完全不同的事：修好了 Assistant 一直被嫌的死板指令，也把原本免費的對話能力搬進訂閱牆。要判斷這台值不值得，先把這兩件事拆開。

<img src="/images/google-home-speaker-gemini-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="客廳架上的智慧喇叭，象徵 Google 六年後推出的新一代家庭語音硬體">

先講發生了什麼。Google 六年沒出過新喇叭，這台一上市就直接[讓 Nest Mini 與 Nest Audio 停產](https://www.androidauthority.com/google-home-speaker-bad-nest-audio-upgrade-3678211/)，等於一款接替兩款。Assistant 不是被冷凍，是被換掉：Google 說[會逐步在既有的喇叭與顯示器上，用 Gemini for Home 取代 Google Assistant](https://blog.google/products-and-platforms/devices/google-nest/gemini-for-home/)。這條線也不只在客廳，[手機端的 Google Assistant 同樣要在 2026 走入歷史](https://9to5google.com/2025/12/19/google-assistant-gemini-2026/)，連 iOS 上的獨立 App 都會收掉。換句話說，這不是一台新喇叭的發表，是整個語音助理品牌的換代。

<img src="/images/google-home-speaker-gemini-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="抽象聲波示意，象徵喇叭改用自然口語互動而非死板指令">

先說它解對的那題。Assistant 這些年真正卡人的，是你得記住它聽得懂的固定句型，講錯一個詞就當機。Gemini for Home 的做法對症：它聽自然口語，你可以[一口氣下好幾個指令](https://blog.google/products-and-platforms/devices/google-nest/google-home-speaker-gemini-features/)，官方的例子是「把廚房燈調暗、放點放鬆的音樂、再設一個 20 分鐘的計時器」，也可以講到一半改口。它還有一段短期記憶，能[接著你剛才的話往下對](https://blog.google/products-and-platforms/devices/google-nest/google-home-speaker-gemini-features/)，不用每句都從頭喊喚醒詞。這一段是真進步，因為它處理的是使用者真正的痛點，不是硬塞一個更大的模型進去充場面。

<img src="/images/google-home-speaker-gemini-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="信用卡與付款示意，象徵進階功能改為月費訂閱">

問題在另一半。喇叭最會被拿來當賣點的三個功能，Gemini Live 的開放式對話、拿問題去查 Nest 攝影機畫面的 Camera History Search、每天幫你摘要家裡動靜的 Home Briefs，全部鎖在 [Google Home Premium，月費 10 美元起](https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/)。基礎版的 Gemini for Home 免費，[Google 也明說會有免費與付費兩種版本](https://blog.google/products-and-platforms/devices/google-nest/gemini-for-home/)。這就是要分清楚的地方：Assistant 時代這些對話能力大多不用錢，現在被重新切成「堪用的免費」加「好用的付費」。追根究柢，這台喇叭的商業目的，是把一個大家習慣免費的家用工具，轉成有月費現金流的訂閱服務。硬體只是入口。

<img src="/images/google-home-speaker-gemini-s4.webp" width="960" height="643" loading="lazy" decoding="async" alt="門鎖示意，象徵切換 Gemini 後不可逆、老裝置失去對等功能">

而且這道門是單向的。[一旦你家切換到 Gemini for Home，就回不去 Assistant 了](https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/)，同一個家裡之後接的裝置也一律跟著走新系統。老喇叭雖然多半能升級，但拿不到 Gemini Live 這類招牌功能。更尷尬的是硬體本身：[新喇叭的音質落在 Nest Mini 與 Nest Audio 之間](https://www.androidauthority.com/google-home-speaker-bad-nest-audio-upgrade-3678211/)，對原本用 Nest Audio 的人是退步，而且某些功能是 Google [刻意只給新機、不是舊機辦不到](https://www.androidauthority.com/google-home-speaker-bad-nest-audio-upgrade-3678211/)。這種「新功能綁新機、切換不可逆」的設計，跟 [Apple 把 Siri 外包給 Gemini 那條供應商綁定的線](/articles/apple-siri-gemini-vendor-lock-in/)是同一種味道：你買的不只是裝置，是一段之後很難反悔的關係。

<img src="/images/google-home-speaker-gemini-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="處理器晶片特寫，象徵喇叭首次內建 NPU 把部分 AI 運算搬回裝置">

技術上有個容易被浪漫化的細節：這台第一次[配了獨立的 NPU 來跑 AI 相關運算](https://www.makeuseof.com/i-lived-with-google-home-speaker/)。這代表一部分處理可以留在裝置上，反應更快、也少送一點資料出門。但別急著喊「AI 回到裝置端了」，同一篇實測也點破，[這台的許多招牌功能還是靠雲端的 Gemini 在跑](https://www.makeuseof.com/i-lived-with-google-home-speaker/)。所以準確的說法是：對話式 AI 從純雲端往裝置端挪了一步，但只挪了一步。它揭示的方向比現況重要，價值正在從「哪個雲端模型比較大」，往「裝置端能算多少＋你付多少月費」移動，這條裝置端經濟的帳，[我之前算過一輪](/articles/slm-on-device-agents-edge-economics/)。

<img src="/images/google-home-speaker-gemini-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓製造示意，象徵台灣在裝置端 AI 硬體與聲學的切入點">

那台灣該從這台喇叭讀出什麼？不是「Google 出新品了」，是「AI 要落地到家裡，得靠會感測、會運算、聽得清楚的硬體」。當招牌功能要即時反應、又要少依賴雲端，關鍵零件就落在裝置端 NPU、麥克風陣列與聲學、以及邊緣運算晶片這幾段，這些正好是台灣供應鏈碰得到的地方。台灣讀者真正要問的兩件事很具體：一是 Gemini for Home 的繁體中文與付費服務何時、以什麼條件進台灣，二是硬體這一端我們接的是哪一格。追雲端那顆大模型不是台灣的局，把家庭 AI 需要的感測、聲學與邊緣運算做到位，才是。

看懂這台喇叭，重點不在「六年來第一款」的懷舊。它把一個免費、堪用的家用助理，升級成更好用、也更貴、還回不去的服務。這是產品的進步，也是商業模式的收網。對使用者，該問的是這個訂閱值不值得綁一輩子；對台灣，該問的是這波把 AI 塞進家庭硬體的浪潮，我們要站在感測與運算的哪一段。

<h2>常見問題</h2>

<p><strong>Google Home Speaker 多少錢？還要另外付訂閱嗎？</strong><br>喇叭本身 99.99 美元，基礎版的 Gemini for Home 免費，能做智慧家庭控制、放音樂、問答與多步驟指令。但 Gemini Live、Camera History Search、Home Briefs 這些招牌功能要加購 <a href="https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/">Google Home Premium，月費 10 美元起</a>。</p>

<p><strong>換成 Gemini 之後還能切回 Google Assistant 嗎？</strong><br>不行。<a href="https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/">一旦整個家切換到 Gemini for Home 就是永久的</a>，之後接的裝置也會自動跟著走新系統。手機端的 <a href="https://9to5google.com/2025/12/19/google-assistant-gemini-2026/">Google Assistant 同樣會在 2026 逐步退場</a>，所以這是全面換代，不是可回復的功能切換。</p>

<p><strong>我舊的 Nest 喇叭需要換這台新機嗎？</strong><br>不一定。<a href="https://blog.google/products-and-platforms/devices/google-nest/gemini-for-home/">Gemini for Home 會逐步下放到既有的喇叭與顯示器</a>，舊機多半升得上去，但 <a href="https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/">Gemini Live 這類對話功能限新機</a>。而且 <a href="https://www.androidauthority.com/google-home-speaker-bad-nest-audio-upgrade-3678211/">新喇叭音質介於 Nest Mini 與 Nest Audio 之間</a>，音質敏感的 Nest Audio 用戶未必算升級。</p>

<p><strong>它的 AI 是在喇叭裡跑還是靠雲端？</strong><br>兩者都有。這台<a href="https://www.makeuseof.com/i-lived-with-google-home-speaker/">首次內建獨立 NPU 處理部分 AI 運算</a>，反應更快也少送資料出門；但同一篇實測指出，<a href="https://www.makeuseof.com/i-lived-with-google-home-speaker/">許多招牌功能仍依賴雲端的 Gemini</a>。所以它是往裝置端挪了一步，還沒到完全離線。</p>
