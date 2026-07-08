---
title: "Snap 端出 2,195 美元 AR 眼鏡、內建 OpenAI 與 Gemini：搶在 Meta 前上市，不等於贏了空間運算"
slug: "snap-specs-ar-glasses-ai"
description: "Snap 6/16 發表 2,195 美元的 Specs 真 AR 眼鏡，Lens 直接吃 OpenAI 與 Gemini 的 API，搶在 Meta、Apple 之前把消費級產品端上市。但這則新聞真正的重點不是誰先上市、也不是 AI 多聰明：Snap 把兩家 AI 都擺成可替換的 API，等於承認 AI 是介面不是護城河，真正卡關的是光學、延遲、重量與價格，而那一段正好是台灣的位置。"
excerpt: "為什麼 Snap 敢把 OpenAI 和 Gemini 兩家都塞進同一副眼鏡？因為對他們來說 AI 是可替換的介面層，護城河在 7 毫秒延遲、132 克重量、LCoS 光學這些硬體題上，而這正是台灣供應鏈該讀懂的一格。"
publishDate: "2026-07-23T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["Snap Specs", "AR 眼鏡", "空間運算", "OpenAI", "台灣供應鏈"]
coverImage: "covers/snap-specs-ar-glasses-ai.webp"
coverAlt: "象徵 Snap Specs 消費級 AR 眼鏡與空間運算的智慧眼鏡示意"
coverImageCredit: "Photo by Vika Glitter on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Snap 6/16 發表 Specs 真 AR 眼鏡，2,195 美元、200 美元可退訂金，今年秋天在美英法開賣，搶在 Meta（真 AR 消費機估 2027）與 Apple（首款眼鏡估 2027 年底）之前把消費級產品端上市。"
  - "Specs 的 Lens 直接呼叫 OpenAI 與 Gemini 的 API 來做 AI 體驗；把兩家都擺成可替換的 API，等於 Snap 自己承認 AI 是介面層不是護城河，賭注押在 7 毫秒延遲、132 克重量、自研 LCoS 光學這些硬體題上。"
  - "台灣在這條鏈上的真位置不是搶品牌，而是供 AR 眼鏡的光學與矽：LCoS 微顯示（台南的奇景光電已在做）、光波導、以及跑在 Snapdragon 上的晶片代工，這幾段才是延遲與重量能不能壓下來的關鍵。"
references:
  - title: "Introducing SPECS Augmented Reality Glasses"
    url: "https://newsroom.snap.com/introducing-specs-augmented-reality-glasses"
    publisher: "Snap Newsroom"
  - title: "Snap Launches $2,195 'Specs' Augmented Reality Glasses"
    url: "https://www.macrumors.com/2026/06/16/snap-specs-ar-glasses/"
    publisher: "MacRumors"
  - title: "Snap Opens Preorders For Specs, True AR Glasses Shipping This Fall For $2195"
    url: "https://www.uploadvr.com/snap-specs-design-revealed-preorders-open-price/"
    publisher: "UploadVR"
  - title: "Snap SPECS AR Glasses Unveiled at AWE 2026"
    url: "https://www.auganix.org/ar-news-snap-specs-awe-2026/"
    publisher: "Auganix"
  - title: "No, not Orion — Meta's first 'real' AR glasses tipped to debut in 2027"
    url: "https://www.tomsguide.com/computing/vr-ar/no-not-orion-metas-first-real-ar-glasses-tipped-to-debut-in-2027"
    publisher: "Tom's Guide"
  - title: "Himax Technologies Unveils Advanced High-Contrast LCoS Microdisplay Technology for AR Glasses at Display Week 2026"
    url: "https://www.quiverquant.com/news/Himax+Technologies+Unveils+Advanced+High-Contrast+LCoS+Microdisplay+Technology+for+AR+Glasses+at+Display+Week+2026"
    publisher: "Quiver Quantitative"
originalContribution: "本文把 Specs 的兩個容易被當賣點的事實（同時內建 OpenAI 與 Gemini、搶在 Meta 與 Apple 前上市）反過來讀成 Snap 的戰略自白：AI 被降格為可替換的 API、護城河改押在延遲/重量/光學的硬體題上；再以此框架對回台灣，指出真正的卡位點在 LCoS 微顯示、光波導與 Snapdragon 代工這段光學與矽，而非品牌賽。"
---

Snap 這副眼鏡最該讀的地方，不是它多炫，是它把 AI 擺在哪個位置。6 月 16 日，Snap 在擴增實境展 AWE 上[發表消費級 AR 眼鏡 Specs](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)，售價 2,195 美元、先付 200 美元可退訂金，今年秋天在美國、英國、法國開賣。兩個被拿去當賣點的事實：一是眼鏡上的 AI 體驗[直接呼叫 OpenAI 與 Gemini 的 API](https://www.macrumors.com/2026/06/16/snap-specs-ar-glasses/)，二是它[搶在 Apple 之前上市](https://www.macrumors.com/2026/06/16/snap-specs-ar-glasses/)（Apple 首款眼鏡估要等到 2027 年底）。但把這兩件事反過來讀，它們其實是 Snap 的戰略自白：AI 對他們來說是可替換的介面層，賭注押在別的地方。

<img src="/images/snap-specs-ar-glasses-ai-s1.webp" width="960" height="638" loading="lazy" decoding="async" alt="AR 眼鏡把數位介面疊在真實視野上的擴增實境示意">

先把「真 AR」跟你在路上看到的智慧眼鏡分清楚。市面上賣得動的 Meta Ray-Ban，加的是相機和喇叭，[看不到任何數位影像疊在你眼前](https://www.uploadvr.com/snap-specs-design-revealed-preorders-open-price/)。Specs 是另一種東西：它用 Snap 自研的 LCoS（矽基液晶）顯示技術，[把 51 度視野、1,600 萬色的畫面直接投在你看真實世界的視線上](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)，官方形容工作時像一台 24 吋螢幕、看電影時像 10 英尺外一塊 115 吋的布幕。這才是「擴增」實境該有的樣子，也是它為什麼比 350 美元起跳的 Ray-Ban 貴上一大截的原因。

<img src="/images/snap-specs-ar-glasses-ai-s5.webp" width="868" height="1300" loading="lazy" decoding="async" alt="消費級智慧 AR 眼鏡特寫，象徵光學與矽的硬體堆疊">

規格攤開來看，Snap 花力氣的地方全在硬體的物理極限。這副眼鏡[做到 7 毫秒的動作到成像延遲](https://www.uploadvr.com/snap-specs-design-revealed-preorders-open-price/)，比它自家開發者版的 13 毫秒又壓了一半，UploadVR 說這是他們看過六自由度裝置公開講過的最低數字。重量壓到 [47 毫米款 132 克、52 毫米款 136 克](https://www.uploadvr.com/snap-specs-design-revealed-preorders-open-price/)，機身用瑞士 TR90 高分子。裡面塞了[兩顆 Snapdragon 晶片，一顆專跑電腦視覺、一顆跑 Lens](https://www.auganix.org/ar-news-snap-specs-awe-2026/)。這些數字要對付的都不是「AI 聰不聰明」，是延遲、重量、散熱、光學這一類會讓人戴了頭暈或嫌重的物理問題。這裡也得踩個剎車：續航只有[混用約四小時、含充電盒共二十小時](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)，加上兩千多美元的價格，它離「人人都戴」還很遠，比較像包裝成消費品的早期採用者裝置。

<img src="/images/snap-specs-ar-glasses-ai-s2.webp" width="960" height="641" loading="lazy" decoding="async" alt="AI 助理作為 AR 眼鏡操作介面的抽象科技示意">

回到 AI 這件事，Snap 的做法比宣傳詞誠實。開發者做 AI Lens 時，[可以直接靠 OpenAI 和 Gemini 的 API](https://www.macrumors.com/2026/06/16/snap-specs-ar-glasses/) 來生成擴增實境體驗；連寫 Lens 的工具，[官方也開放接 Claude Code、Codex、Cursor](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses) 這些第三方代理。重點在「兩家都接、而且可替換」。如果 AI 是這副眼鏡的靈魂，你不會把它外包給兩家隨時能互換的雲端供應商。Snap 的選擇說明它把 AI 當成水電：接誰家的都行，哪家好用切哪家。這跟這幾年常見的「有 AI 就贏了」剛好相反。眼鏡的價值不在背後那顆模型，在它能不能舒服地戴在臉上、把畫面穩穩投進你眼裡。AI 只是介面，護城河在硬體。

<img src="/images/snap-specs-ar-glasses-ai-s3.webp" width="960" height="606" loading="lazy" decoding="async" alt="科技公司市場卡位競賽，以棋局象徵誰先上市的策略戰">

那「搶在 Meta 前」到底算不算贏？先看 Meta 的進度。Meta 去年秀出的 Orion 是[只給員工和開發者的原型，永遠不會零售](https://www.tomsguide.com/computing/vr-ar/no-not-orion-metas-first-real-ar-glasses-tipped-to-debut-in-2027)，它真正能買的消費級真 AR 眼鏡（傳聞代號 Artemis）[外界估要等到 2027 年](https://www.tomsguide.com/computing/vr-ar/no-not-orion-metas-first-real-ar-glasses-tipped-to-debut-in-2027)。所以 Snap 確實把消費級真 AR 眼鏡先端上了架。但先上市和贏市場是兩件事。Meta 的 Ray-Ban 走的是「便宜、先讓幾百萬人戴上臉、之後再把 AR 加進去」的路；Snap 走的是「一次把真 AR 做到位、但貴又重、續航短」的路。誰對還沒有答案，因為這題的瓶頸從來不是誰先發表，是價格、重量、續航這三個死結什麼時候能一起解開，讓夠多人願意天天戴。搶第一是新聞標題，解開死結才是市場。

<img src="/images/snap-specs-ar-glasses-ai-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓與光學製造，象徵台灣在 AR 眼鏡供應鏈的光學與矽卡位">

台灣該從這則新聞讀出的，不是「哪個品牌會贏」，而是「不管誰贏，那副眼鏡裡的光學和矽是誰供的」。Specs 卡關的每一個數字，都對著一段供應鏈：要壓延遲和重量，靠的是微顯示與光學引擎；要把畫面投進眼裡又不擋住真實世界，靠的是光波導；兩顆 Snapdragon 要有人代工。這幾段台灣本來就有底子。以顯示這段為例，[台南的奇景光電（Himax）已經在為下一代 AR 眼鏡做高對比的 LCoS 微顯示](https://www.quiverquant.com/news/Himax+Technologies+Unveils+Advanced+High-Contrast+LCoS+Microdisplay+Technology+for+AR+Glasses+at+Display+Week+2026)，跟 Specs 用的正是同一類技術。真正的卡位點，是去吃這些「AR 專用」的微顯示、光學與晶片代工，而不是等品牌廠打完仗才去搶最後那點組裝代工。看懂眼鏡裡裝了什麼，比記住是 Snap 還是 Meta 先發表重要。

戴上眼鏡這件事會不會真的取代手機，還早得很，Snap 自己也還在燒錢等那天。但這則新聞已經把話講清楚：這一輪不是 AI 之爭，是硬體之爭。AI 被放到可替換的介面層，勝負押在光學、延遲、重量、續航這些會碰到真實世界的物理題上。而台灣的位置，剛好就在這些題的答案裡。

<h2>常見問題</h2>

<p><strong>Snap Specs 跟一般智慧眼鏡差在哪？</strong><br>差在有沒有「真 AR」的顯示。Meta Ray-Ban 這類智慧眼鏡只加了相機和喇叭，看不到任何數位畫面疊在眼前；Specs 用自研的 LCoS 顯示技術，把 <a href="https://newsroom.snap.com/introducing-specs-augmented-reality-glasses">51 度視野、1,600 萬色的影像直接投在你看真實世界的視線上</a>，這才是擴增實境該有的樣子，也是它貴很多的原因。</p>

<p><strong>Specs 多少錢、什麼時候能買？</strong><br>售價 2,195 美元，先付 <a href="https://www.uploadvr.com/snap-specs-design-revealed-preorders-open-price/">200 美元可退訂金、出貨時再付剩下的 1,995 美元</a>，預計今年秋天在美國、英國、法國開賣。續航是混合使用約四小時、含充電盒共約二十小時。</p>

<p><strong>它為什麼同時內建 OpenAI 和 Gemini？</strong><br>因為 Snap 把 AI 當成可替換的介面層，不是它的護城河。開發者做 AI Lens 時<a href="https://www.macrumors.com/2026/06/16/snap-specs-ar-glasses/">可以直接呼叫 OpenAI 與 Gemini 的 API</a>，哪家好用接哪家。眼鏡真正的價值押在延遲、重量、光學這些硬體題，而不是背後那顆模型。</p>

<p><strong>Snap 搶在 Meta 前面，是不是就贏了？</strong><br>不必然。Snap 確實先把消費級真 AR 眼鏡端上市，Meta 能買的真 AR 消費機<a href="https://www.tomsguide.com/computing/vr-ar/no-not-orion-metas-first-real-ar-glasses-tipped-to-debut-in-2027">外界估要等到 2027 年</a>。但這題的瓶頸是價格、重量、續航能不能一起解開，讓夠多人天天戴，先發表只是新聞標題，不等於贏市場。</p>

<p><strong>這波 AR 眼鏡對台灣的機會在哪？</strong><br>在眼鏡裡的光學與矽，而不是品牌賽。要壓延遲和重量靠微顯示與光波導，晶片要有人代工。台灣在這幾段本來就有底子，例如<a href="https://www.quiverquant.com/news/Himax+Technologies+Unveils+Advanced+High-Contrast+LCoS+Microdisplay+Technology+for+AR+Glasses+at+Display+Week+2026">台南的奇景光電已在為下一代 AR 眼鏡做 LCoS 微顯示</a>，跟 Specs 用的是同一類技術。</p>
</content>
</invoke>
