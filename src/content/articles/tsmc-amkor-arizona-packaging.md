---
title: "台積電綁 10 年向 Amkor 買封裝：CoWoS 在地化往亞利桑那移，台廠這條線怎麼站位"
slug: "tsmc-amkor-arizona-packaging"
description: "台積電與 Amkor 6 月簽 10 年先進封裝長約，把 CoWoS、InFO 的封裝測試在地化到亞利桑那 Peoria，補上美國晶片供應鏈最後一塊拼圖。對台灣，這不是 CoWoS 要外移、封測要失業，真正的問題是台廠這條線要守哪一格。"
excerpt: "晶片在鳳凰城做完還得飄洋過海運回亞洲封裝，這筆 10 年約就是要打掉這個怪現象。亞利桑那贏的是 Amkor 不是日月光；台廠該問的不是會不會被搶單，而是自己在這條鏈上守哪一層。"
publishDate: "2026-08-08T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["台積電", "先進封裝", "CoWoS", "Amkor", "亞利桑那", "半導體供應鏈"]
coverImage: "covers/tsmc-amkor-arizona-packaging.webp"
coverAlt: "象徵台積電與 Amkor 把先進封裝供應鏈在地化到美國亞利桑那的半導體封裝廠示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "台積電與 Amkor 6 月簽 10 年長約，向 Amkor 位於亞利桑那 Peoria 的新廠採購 turnkey 先進封裝與測試，把 CoWoS、InFO 這道最後製程搬到美國本土，補上美國晶片供應鏈長年缺席的封裝環節。"
  - "亞利桑那這局直接贏的是 Amkor，不是台系封測廠；日月光這類台廠受惠的是 CoWoS 供不應求外溢回台灣的訂單，不是美國在地化本身。"
  - "台廠該問的不是會不會被搶單，而是這條美國鏈會把載板、測試、設備、材料哪幾段一起拉過去、哪幾段留在台灣，先把自己在鏈上的那一層定義清楚。"
references:
  - title: "TSMC, Amkor Forge 10-Year Arizona Advanced Packaging Partnership to Complete the U.S. Chip Supply Chain"
    url: "https://www.trendforce.com/news/2026/06/17/news-tsmc-amkor-forge-10-year-arizona-advanced-packaging-partnership-to-complete-the-u-s-chip-supply-chain/"
    publisher: "TrendForce"
  - title: "TSMC and Amkor Technology Sign 10-Year U.S. Advanced Packaging Agreement"
    url: "https://anysilicon.com/news/tsmc-and-amkor-technology-sign-10-year-u-s-advanced-packaging-agreement/"
    publisher: "AnySilicon"
  - title: "Amkor and TSMC to Expand Partnership and Collaborate on Advanced Packaging in Arizona"
    url: "https://pr.tsmc.com/english/news/3174"
    publisher: "TSMC"
  - title: "TSMC, Amkor sign 10-year packaging deal for Arizona operations"
    url: "https://www.investing.com/news/company-news/tsmc-amkor-sign-10year-packaging-deal-for-arizona-operations-93CH-4745026"
    publisher: "Investing.com"
  - title: "台積電成最大贏家！AI 封裝重構半導體格局、大摩點名 CoWoS、CPO、WoW 三大技術"
    url: "https://news.cnyes.com/news/id/6480009"
    publisher: "鉅亨網"
  - title: "台積電聯手 Amkor 簽 10 年長約：先進封裝供應鏈全面點火"
    url: "https://cmnews.com.tw/article/cmoney-112e7eb6-6e14-11f1-bded-b44ce20edb2f"
    publisher: "CMoney"
originalContribution: "本文把這筆 10 年約拆成三個問題分開回答：它補的是美國供應鏈哪一塊洞、亞利桑那在地化直接受惠的是 Amkor 而非台系封測、以及台廠該以『守哪一層』而非『會不會被搶單』來讀這條新聞，並逐段對照 CoWoS 產能與需求數據，指出載板、測試、設備、材料被美國鏈牽動的先後順序。"
---

先把結論講在前面。台積電和 Amkor 這筆 [10 年先進封裝長約](https://www.trendforce.com/news/2026/06/17/news-tsmc-amkor-forge-10-year-arizona-advanced-packaging-partnership-to-complete-the-u-s-chip-supply-chain/)，補的是美國晶片供應鏈長年缺席的最後一塊拼圖：封裝。晶片在鳳凰城的晶圓廠做完，還得飄洋過海運回亞洲封裝，這個繞地球一圈的怪現象，就是這約要打掉的東西。

對台灣，這條新聞很容易被讀成「CoWoS 要外移、封測要失業」。這是解錯題。真正該問的不是會不會被搶單，而是這條正在美國本土長出來的封裝鏈，會把哪幾段一起拉過去、哪幾段留在台灣，台廠又該守哪一格。

<img src="/images/tsmc-amkor-arizona-packaging-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="美國晶片做完仍需運回亞洲封裝的供應鏈缺口示意">

先看這約在補什麼洞。過去幾年美國靠《晶片法案》把台積電拉去亞利桑那蓋晶圓廠，[鳳凰城的先進製程量產、上半年還轉盈](/articles/tsmc-arizona-first-half-profit/)，前段的「製造」這一塊補起來了。但一顆 AI 晶片不是切下晶圓就能用，還要經過封裝測試把多顆晶粒和高頻寬記憶體整合起來，這道後段製程幾乎全在亞洲。結果就是美國做好的裸晶得運回亞洲封完再運回去，供應鏈斷在中間。這約讓台積電[向 Amkor 位於亞利桑那 Peoria 的新廠採購 turnkey 先進封裝與測試](https://pr.tsmc.com/english/news/3174)，服務對象正是鳳凰城那些晶圓廠的客戶，等於把斷掉的那一段接回美國本土。

<img src="/images/tsmc-amkor-arizona-packaging-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="AI 晶片對 CoWoS 先進封裝的爆量需求示意">

為什麼是現在？因為封裝已經從配角變成 AI 算力的咽喉。[大摩的統計](https://news.cnyes.com/news/id/6480009)顯示，台積電的 CoWoS 月產能要從 2023 年約 2.3 萬片衝到 2027 年約 16.5 萬片，光輝達一家就吃掉約六成。[輝達預訂超過七成 CoWoS-L 產能](/articles/tsmc-cowos-nvidia-capacity-booking/)這件事我先前寫過，需求擺在那裡。當一道製程變成瓶頸、又幾乎只長在台灣一地，客戶和美國政府都會想把它複製一份到自己看得到的地方。晶圓廠在地化之後，封裝在地化是同一條邏輯往下走，不是意外。

<img src="/images/tsmc-amkor-arizona-packaging-s3.webp" width="960" height="540" loading="lazy" decoding="async" alt="Amkor 在亞利桑那 Peoria 興建先進封裝與測試廠示意">

那台灣封測廠在這局是什麼位置？先講清楚：亞利桑那這一局直接贏的是 Amkor，不是日月光。台積電挑的封裝夥伴是這家美國本土 OSAT，台系封測廠不在這條在地化的主線上。台廠這幾年在先進封裝的受惠，來自另一個來源：CoWoS 供不應求，[日月光這類廠承接外溢回台灣的中低階 AI 晶片訂單](https://news.cnyes.com/news/id/6480009)，跟台積電形成梯次分工。這是需求太滿溢出來的單，跟美國那條在地化的鏈是兩回事，別把兩件事混在一起算成同一筆帳。

<img src="/images/tsmc-amkor-arizona-packaging-s4.webp" width="960" height="540" loading="lazy" decoding="async" alt="先進封裝廠要到 2028 至 2029 年才量產的時程示意">

不過要先踩個剎車，別把時程讀太急。[Amkor 的 Peoria 廠預計 2028 年才量產、台積電自己在亞利桑那的先進封裝廠要到 2029 年才有 CoWoS 與 3D-IC 產能](https://www.trendforce.com/news/2026/06/17/news-tsmc-amkor-forge-10-year-arizona-advanced-packaging-partnership-to-complete-the-u-s-chip-supply-chain/)。這是台積電[1,650 億美元美國投資裡的兩座封裝廠](https://anysilicon.com/news/tsmc-and-amkor-technology-sign-10-year-u-s-advanced-packaging-agreement/)的一部分。換句話說，未來三、四年 CoWoS 的主場仍在台灣，美國那頭初期產能不大、也還在蓋。這約是一張十年期的長線佈局，不是明天就把封裝訂單搬走。看它的意義，要放在[台積電美日德三地同步在地化](/articles/tsmc-three-site-overseas-fabs/)這條大趨勢裡看，而不是當成一次性的產能轉移。

<img src="/images/tsmc-amkor-arizona-packaging-s5.webp" width="960" height="540" loading="lazy" decoding="async" alt="台灣封測、載板與設備廠在先進封裝供應鏈的卡位示意">

所以台廠這條線該怎麼站位？把問題拆成「哪幾段會被這條美國鏈拉著走」。封裝不是一家廠的事，它牽動載板、測試、封裝材料和設備一整串。美國那頭要真的把 turnkey 做起來，這幾段遲早得跟著補齊；[欣興的載板、京元電的測試、相關封裝設備商](https://cmnews.com.tw/article/cmoney-112e7eb6-6e14-11f1-bded-b44ce20edb2f)這些台廠，反而可能透過供貨或設點被這條在地化鏈牽動，這是機會不是威脅。真正該守的，是把技術含量最高、別人短期補不上的那幾段（先進製程的 CoWoS 良率、精密測試、關鍵材料）留在台灣，讓在地化只補到產能、補不到核心。

<img src="/images/tsmc-amkor-arizona-packaging-s6.webp" width="960" height="540" loading="lazy" decoding="async" alt="台廠要定義自己在半導體供應鏈守哪一層的策略示意">

這筆約真正的訊號，是先進封裝正式從「台灣獨門」走向「分散佈署」的第一步。趨勢擋不住，但擋不住不等於守不住。台灣能不能接住這一波，不會取決於能不能留住每一張封裝單，而是取決於有沒有把自己在這條鏈上守的那一層定義清楚：把會被複製走的產能，跟複製不走的核心分開來守。看懂它要補的是哪塊洞、拉走的是哪幾段，比記住「10 年」這個數字重要。

<h2>常見問題</h2>

<p><strong>台積電跟 Amkor 簽這個約，代表 CoWoS 封裝要全部搬去美國嗎？</strong><br>不會。這是一張<a href="https://www.trendforce.com/news/2026/06/17/news-tsmc-amkor-forge-10-year-arizona-advanced-packaging-partnership-to-complete-the-u-s-chip-supply-chain/">十年期的長約</a>，Amkor 的亞利桑那 Peoria 廠要到 2028 年才量產、台積電自己的亞利桑那封裝廠要到 2029 年才有 CoWoS 產能。未來幾年 CoWoS 的主要產能仍在台灣，美國初期只是補一份在地產能，不是把封裝整包搬走。</p>

<p><strong>這個約對台灣的日月光、京元電這些封測廠是利多還是利空？</strong><br>直接接下亞利桑那封裝單的是 Amkor，不是台系封測廠。台廠這幾年的受惠來自另一頭：CoWoS 供不應求，<a href="https://news.cnyes.com/news/id/6480009">外溢的訂單回流到日月光等廠</a>。美國在地化跟台廠的外溢受惠是兩件事，短期對台灣封測的訂單沒有直接搶食。</p>

<p><strong>為什麼美國要特別把「封裝」拉回本土，晶圓廠不是已經蓋了嗎？</strong><br>因為一顆 AI 晶片切下晶圓後還要封裝測試才能用，而這道後段製程過去幾乎全在亞洲。<a href="https://www.trendforce.com/news/2026/06/17/news-tsmc-amkor-forge-10-year-arizona-advanced-packaging-partnership-to-complete-the-u-s-chip-supply-chain/">美國晶圓廠做好的裸晶得運回亞洲封完再運回去</a>，供應鏈斷在中間。把封裝拉回本土，才算把美國晶片供應鏈的最後一塊拼圖補上。</p>

<p><strong>台灣在先進封裝還守得住優勢嗎？</strong><br>短中期守得住，因為 CoWoS 的良率、精密測試與關鍵材料這些高技術含量的環節，別人短期補不上。真正的風險不是產能被複製，而是核心能力外流；台廠該做的是把複製得走的產能，跟複製不走的核心分開來守。</p>
