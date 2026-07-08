---
title: "TwelveLabs 募 1 億美元衝『影片超級智慧』：讓 AI 真的看懂每一秒畫面"
slug: "twelvelabs-video-superintelligence-100m"
description: "影片理解新創 TwelveLabs 7/1 拿到 1 億美元 B 輪，NEA 與 NAVER Ventures 領投、Amazon 跟投。這輪錢押的不是生成影片，是讓機器讀懂已拍好的每一秒畫面；並綁定 AWS Trainium 繞過 Nvidia。台灣該從『理解影片』這條線讀出攝影機、感測與邊緣運算的卡位點。"
excerpt: "為什麼投資人押的是『看懂影片』而不是『生成影片』？因為生成模型正在商品化，能把影片變成可搜尋語意層的理解引擎，護城河卡在真實世界那一邊，更深。"
publishDate: "2026-08-02T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags: ["TwelveLabs 募資", "影片理解 AI", "影片超級智慧", "AWS Trainium", "台灣供應鏈"]
coverImage: "covers/twelvelabs-video-superintelligence-100m.webp"
coverAlt: "多螢幕影像牆與監控畫面，象徵讓 AI 讀懂每一秒影片的影片超級智慧"
coverImageCredit: "Photo by Samon Yu on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "TwelveLabs 7/1 拿到 1 億美元 B 輪，NEA 與 NAVER Ventures 共同領投、Amazon 跟投，累計募資超過 2 億美元；它做的是『理解影片』不是『生成影片』。"
  - "CEO Jae Lee 的判斷是『模型會商品化，把它們組起來的智慧層不會』；護城河不在單一模型多聰明，在能把影片變成可搜尋語意層的那套系統。"
  - "台灣的卡位點不是多接雲端 GPU 代工，是攝影機、感測器、監視器影像與邊緣運算這些會碰到真實世界影片的零組件。"
references:
  - title: "TwelveLabs Raises $100M to Build Video Superintelligence（官方部落格）"
    url: "https://www.twelvelabs.io/blog/twelvelabs-series-b-100m"
    publisher: "TwelveLabs"
  - title: "TwelveLabs Raises $100 Million in Series B Funding to Build Video Superintelligence（新聞稿）"
    url: "https://www.globenewswire.com/news-release/2026/07/01/3320545/0/en/twelvelabs-raises-100-million-in-series-b-funding-to-build-video-superintelligence.html"
    publisher: "GlobeNewswire"
  - title: "TwelveLabs raises $100M to bring superintelligence to AI video models"
    url: "https://siliconangle.com/2026/07/01/twelvelabs-raises-100m-bring-superintelligence-ai-video-models/"
    publisher: "SiliconANGLE"
  - title: "Twelve Labs Raises $100 Million to Fund Bet on Video AI"
    url: "https://www.pymnts.com/news/investment-tracker/2026/twelve-labs-raises-100-million-to-fund-bet-on-video-ai/"
    publisher: "PYMNTS"
originalContribution: "本文把 TwelveLabs 這輪募資從『又一個 AI 大額募資』重新定位成『理解影片 vs 生成影片』的路線分歧，以 CEO『模型會商品化、智慧層不會』的判斷為分析框架，串起它綁 AWS Trainium 繞過 Nvidia 的硬體選擇，並延伸評估台灣在攝影機、感測與邊緣運算這條『真實世界影片』供應鏈的切入點。"
---

影片理解新創 TwelveLabs 7 月 1 日[拿到 1 億美元 B 輪](https://www.twelvelabs.io/blog/twelvelabs-series-b-100m)，共同領投的是創投老牌 NEA 與南韓 NAVER 旗下的 NAVER Ventures，Amazon 也在跟投名單裡。這輪錢押的不是「再生一支影片」，是「讓機器真的看懂已經拍好的每一秒畫面」。看懂這個分別，比記住 1 億這個數字重要。

<img src="/images/twelvelabs-video-superintelligence-100m-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="創投出資名單象徵資金流向影片理解新創的示意">

先把它在做什麼講清楚。這兩年最紅的影片 AI 多半是「生成」那一派，餵一句話吐一段影片。TwelveLabs 走的是反方向：不生成，只理解。它有兩顆模型，一顆叫 Marengo，[把畫面、聲音、對白、螢幕上的文字整合成一個可搜尋的表示法](https://www.twelvelabs.io/blog/twelvelabs-series-b-100m)；另一顆叫 Pegasus，把影片拆成場景邊界、實體、時間段這類[結構化資料](https://www.globenewswire.com/news-release/2026/07/01/3320545/0/en/twelvelabs-raises-100-million-in-series-b-funding-to-build-video-superintelligence.html)，讓系統可以拿去搜尋、問答、推理。CEO Jae Lee 一句話點題：「[世界不是用文字發生的，是用動態發生的](https://www.pymnts.com/news/investment-tracker/2026/twelve-labs-raises-100-million-to-fund-bet-on-video-ai/)。」他把全世界的影片形容成機器眼中的暗物質，多數還只能靠檔名、資料夾、字幕和人的記憶去找。

<img src="/images/twelvelabs-video-superintelligence-100m-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="影片被拆成場景、時間段與實體的結構化資料示意">

那為什麼是 Amazon、NEA 這種老錢投它，不是投一個做聊天 AI 的公司？Jae Lee 自己下的判斷很直接：「[模型會商品化，把它們組起來的智慧層不會](https://www.globenewswire.com/news-release/2026/07/01/3320545/0/en/twelvelabs-raises-100-million-in-series-b-funding-to-build-video-superintelligence.html)。」這句話值得台灣讀者記著。我之前寫[模型分級與商品化那條線](/articles/claude-fable-5-mythos-class-model-tiering/)時講過同樣的事：底層模型一個追一個，價格一路往下殺，能力這格護城河很淺。真正難複製的，是把多個模型、感知、知識、推理組成一套「能把影片變成可用語意層」的系統。TwelveLabs 押的就是這一層，不是押哪顆模型跑分比較高。

<img src="/images/twelvelabs-video-superintelligence-100m-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="把多個模型組合成智慧層的示意，象徵護城河在組合層而非單一模型">

硬體那條線也對得上。TwelveLabs 把 AWS 設為優先雲端，還簽了[多年期承諾、要用 Amazon 自研的 Trainium 晶片跑影片推論，新模型也先在 AWS 上線](https://siliconangle.com/2026/07/01/twelvelabs-raises-100m-bring-superintelligence-ai-video-models/)。Trainium 是 Amazon 對 Nvidia 算力壟斷端出的自家答案。一家賭影片理解的公司，配上一組想繞過 Nvidia 的金主，這個組合我在寫 [Odyssey 世界模型那篇](/articles/odyssey-world-models-physical-ai-moat/)時就看過一次，方向一模一樣：熱錢在往「綁資料、綁算力、綁自研晶片」的底層走。要踩個剎車的是，優先不等於獨家，到底是真看好 Trainium 還是拿到比較好的條件，現在說不準；但賭注壓在系統整合、不壓在單一模型，這點很清楚。

<img src="/images/twelvelabs-video-superintelligence-100m-s4.webp" width="960" height="639" loading="lazy" decoding="async" alt="資料中心伺服器機房，象徵綁定 AWS Trainium 晶片的算力賭注">

那台灣該從這條新聞讀出什麼。這裡有個容易看歪的地方：把它讀成「AI 影片熱、台灣多接一點雲端 GPU 代工的單」。理解影片這件事要的料，跟生成影片、跟聊天模型都不一樣。它靠的是攝影機拍進來的真實畫面、[監控與公部門影像、體育賽事、廣告內容分析、車載影像](https://siliconangle.com/2026/07/01/twelvelabs-raises-100m-bring-superintelligence-ai-video-models/)這些場景裡的感測與邊緣運算。畫面要拍得清楚靠鏡頭模組與影像感測器，模型要在裝置端即時反應靠邊緣運算晶片，這幾段台灣本來就有底子。卡位點是去吃這些「會碰到真實世界影片」的零組件，而不是只守在雲端那顆大晶片等單。

<img src="/images/twelvelabs-video-superintelligence-100m-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="監視器與攝影機影像，象徵台灣在影片感測與邊緣運算的切入點">

把錢從生成影片搬到讀懂影片，是投資人在說：影片這座金礦大部分還鎖在檔案裡沒被機器讀過，先把它變得可搜尋、可被 AI 代理拿去用，價值在這。這條路會不會走成還要看技術，TwelveLabs 要把它的[影片認知系統推進到全世界最重要的影片庫](https://www.twelvelabs.io/blog/twelvelabs-series-b-100m)也還早。但台灣站在攝影機、感測與邊緣運算這條供應鏈上，現在就該看懂「理解影片」要的是什麼料。能不能接住這波，不會是因為誰的模型比較聰明，而是有沒有把自己在這條鏈上的位置先定義清楚。

<h2>常見問題</h2>

<p><strong>TwelveLabs 是做 AI 生成影片的公司嗎？</strong><br>不是。它做的是「理解影片」，把已經拍好的影片變成機器讀得懂、搜尋得到的結構化資料，不是靠一句話生出一段新影片。它的 Marengo 模型負責把畫面、聲音、對白整合成可搜尋的表示法，Pegasus 模型把影片拆成場景、實體、時間段等結構，讓系統能拿去搜尋與推理（<a href="https://www.twelvelabs.io/blog/twelvelabs-series-b-100m">官方說明</a>）。</p>

<p><strong>TwelveLabs 這輪募了多少、誰投的？</strong><br>2026 年 7 月 1 日宣布的 B 輪共 1 億美元，由 NEA 與 NAVER Ventures 共同領投，Amazon、Radical Ventures、Korea Investment Partners、Index Ventures 等跟投，累計募資超過 2 億美元。資金用於研發與在紐約、倫敦開設新據點（<a href="https://www.globenewswire.com/news-release/2026/07/01/3320545/0/en/twelvelabs-raises-100-million-in-series-b-funding-to-build-video-superintelligence.html">新聞稿</a>、<a href="https://siliconangle.com/2026/07/01/twelvelabs-raises-100m-bring-superintelligence-ai-video-models/">SiliconANGLE</a>）。</p>

<p><strong>為什麼是 Amazon 投，還要用 AWS Trainium 晶片？</strong><br>TwelveLabs 簽了多年期承諾，用 Amazon 自研的 Trainium 晶片跑影片推論、新模型先在 AWS 上線。Trainium 是 Amazon 對 Nvidia 算力壟斷端出的替代方案，這筆投資等於把影片理解的算力綁在 AWS 這一側，而不是預設走 Nvidia（<a href="https://siliconangle.com/2026/07/01/twelvelabs-raises-100m-bring-superintelligence-ai-video-models/">SiliconANGLE</a>）。</p>

<p><strong>這對台灣硬體業是機會還是只是雲端代工加單？</strong><br>機會在「會碰到真實世界影片」的那一段，不是雲端 GPU 代工。理解影片要靠攝影機的鏡頭模組與影像感測器把畫面拍進來，靠邊緣運算晶片在裝置端即時處理，這幾段台灣有底子。把自己定位成影片感測與邊緣運算的供應鏈，比只等雲端大晶片的單更貼近這波需求。</p>
