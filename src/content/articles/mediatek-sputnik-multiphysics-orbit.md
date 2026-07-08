---
title: "聯發科喊半導體『史普尼克時刻』：一句話綁了兩件時間尺度差很遠的事，該分開讀"
slug: "mediatek-sputnik-multiphysics-orbit"
description: "蔡明介在 MARC Workshop 2026 說半導體迎來下一個『史普尼克時刻』，把『多重物理量設計』與『太空軌道運算』綁在同一句話。這兩件事的成熟度、時間尺度、對台灣的意義差很遠，該拆開讀：一個是現在就要補的設計功課，一個是全球一波還在燒錢卡成本的遠場。"
excerpt: "太空軌道運算是聳動的標題，但它不是聯發科的原創洞見，是 2025 到 2026 全球一起在燒的熱潮，而且經濟性還在吵。對台灣真正有立即意義的，是那個沒上頭條的『多重物理量設計』。"
publishDate: "2026-07-19T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["聯發科", "多重物理量設計", "太空軌道運算", "先進封裝", "台灣半導體"]
coverImage: "covers/mediatek-sputnik-multiphysics-orbit.webp"
coverAlt: "象徵半導體晶片設計走向多重物理量與太空運算新世代的電路示意"
coverImageCredit: "Photo by Steve A Johnson on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "蔡明介 6/24 在 MARC Workshop 2026 拋出『史普尼克時刻』，同時點名『多重物理量設計』與『太空軌道運算』；但這兩件事的成熟度差一大截，綁在一句話裡讀會誤判優先順序。"
  - "多重物理量設計是現在進行式：AI 算力密度把電、熱、光、機械、材料耦合到不能再分開設計，台灣強在封裝與散熱，但功課是從『代工製造』升級到『協同設計』，不是多接單。"
  - "太空軌道運算不是聯發科的原創，是 Nvidia、Starcloud、Google 一起在燒的全球熱潮，且經濟性還在吵（有人算軌道每瓦成本是地面三倍）；台灣的近場是衛星通訊零組件與 6G 射頻，不是真的把資料中心送上天。"
references:
  - title: "迎向下個「史普尼克時刻」！聯發科技蔡明介揭示多重物理量與太空運算新世代"
    url: "https://www.mediatek.com/zh-tw/press-room/embracing-the-next-sputnik-moment"
    publisher: "聯發科技"
  - title: "從 AI 晶片到太空軌道運算，蔡明介領軍聯發科描繪半導體未來藍圖"
    url: "https://technews.tw/2026/06/25/from-ai-chips-to-orbital-computing-in-space/"
    publisher: "科技新報 TechNews"
  - title: "多重物理量、太空運算成新戰場 聯發科蔡明介：半導體迎下個「史普尼克時刻」"
    url: "https://www.technice.com.tw/issues/semicon/226878/"
    publisher: "科技島 TechNice"
  - title: "NVIDIA Launches Space Computing, Rocketing AI Into Orbit"
    url: "https://nvidianews.nvidia.com/news/space-computing"
    publisher: "NVIDIA Newsroom"
  - title: "Orbital Data Center Race 2026"
    url: "https://introl.com/blog/orbital-data-centers-space-computing-race-2026"
    publisher: "Introl"
originalContribution: "本文把蔡明介一句『史普尼克時刻』裡綁在一起的兩個議題，依成熟度與時間尺度拆開分別評估，並對照全球軌道運算競賽的經濟性爭議，指出台灣的近場真功課是多重物理量的協同設計與衛星通訊零組件，而非追太空資料中心這個遠場。"
---

蔡明介這句「史普尼克時刻」值得聽，但要拆成兩件事來聽。他在同一場演講裡點了兩個方向：一個叫「多重物理量設計」，一個叫「太空軌道運算」。前者是現在就發生、台灣半導體該立刻補的設計功課；後者是聳動的遠場，還在燒錢、還在吵值不值得。綁在一句話裡讀，最容易犯的錯就是被太空那個字帶走，把注意力放到還很遠的地方。

先講事情本身。6 月 24 日，聯發科前瞻研發中心的年度 MARC Workshop 2026 上，董事長蔡明介[以近七十年前史普尼克衛星升空為引](https://www.mediatek.com/zh-tw/press-room/embracing-the-next-sputnik-moment)，說半導體與 AI 的發展「或許正迎來下一次的史普尼克時刻」。他點出兩個新戰場：晶片設計從傳統電訊號走向「多重物理量設計」，以及一個更前瞻的領域「太空軌道運算」。媒體的標題大多押在太空上，因為太空好寫。但我認為講反了輕重。

<img src="/covers/mediatek-sputnik-multiphysics-orbit.webp" width="1200" height="800" loading="lazy" decoding="async" alt="象徵半導體晶片設計走向多重物理量與太空運算新世代的電路示意">

## 多重物理量設計：這才是現在進行式

先把名詞講清楚。過去設計晶片，工程師主要算電：訊號怎麼跑、邏輯閘怎麼接。多重物理量設計（Multi-Physics Design）的意思是，這樣算已經不夠了。蔡明介的說法是，晶片研發[必須跨越單一學科界線，從材料、電路、散熱、封裝到通訊系統整體設計](https://www.technice.com.tw/issues/semicon/226878/)，把電、熱、光、機械結構這些原本各算各的物理量，在設計初期就一起算。

為什麼是現在？因為 AI 把算力密度逼上去了。一顆晶片塞越多電晶體、跑越高的功耗，熱就越集中，散熱撐不住效能就掉；訊號跑越快，電磁干擾與光學傳輸的問題就浮上檯面；先進封裝把多顆裸晶疊在一起，機械應力與材料膨脹係數不匹配就會裂。這些以前可以「設計完再想辦法散熱」的事，現在得在第一筆線畫下去之前就一起考慮。這不是口號，是被物理逼出來的工程現實。

<img src="/images/mediatek-sputnik-multiphysics-orbit-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="處理器晶片特寫，象徵電、熱、光、機械耦合的多重物理量設計">

## 對台灣，這是解對題

這一段對台灣的意義最實在，因為它正好打在台灣的強項上，也點出台灣的弱點。

台灣強在製造與封裝。先進封裝就是多重物理量最典型的戰場：把運算裸晶、記憶體、中介層疊在一起，電、熱、機械應力全部耦合。[台積電 CoWoS 產能被 NVIDIA 預訂逾七成](/articles/tsmc-cowos-nvidia-capacity-booking/)，代表這條路現在就是 AI 晶片的主戰場。台灣有能力把它做出來，這是真本事。

但這裡要踩個剎車。「做得出來」跟「設計得出來」是兩件事。多重物理量設計的核心是設計方法學：要有能同時模擬電熱光機械的協同設計工具、要有把不同物理量放進同一個最佳化迴圈的流程。這一塊的話語權，目前多半握在 EDA（電子設計自動化）大廠手上。台灣如果只停在「把別人設計好的東西高良率地做出來」，等於守在代工那一格；真正的升級，是往設計方法學的上游走。蔡明介會在自家前瞻研發中心的場合講這個，本身就是訊號：他要的不是多接單，是補設計能力的課。

<img src="/images/mediatek-sputnik-multiphysics-orbit-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與晶片封裝特寫，象徵先進封裝的多物理協同設計">

## 太空軌道運算：先認清這不是聯發科的原創

換到太空這一段，語氣就得換。太空軌道運算（Orbit Compute）不是聯發科想出來的新方向，是 2025 到 2026 全球一起在燒的一波熱潮，聯發科比較像是在插旗，宣示自己有在看。

看一下這波有多擠。[NVIDIA 在 3 月的 GTC 2026 發表太空運算平台](https://nvidianews.nvidia.com/news/space-computing)，執行長黃仁勳直接說「太空運算，這個最終疆界，來了」，端出號稱比 H100 多 25 倍推論算力的 Space-1 模組。新創這邊，[Starcloud 2025 年 11 月把第一顆 H100 送上軌道、12 月在太空訓練了第一個大型語言模型](https://introl.com/blog/orbital-data-centers-space-computing-race-2026)，還申報了八萬顆衛星的星系；Google 的 Project Suncatcher 用自研的抗輻射 TPU、預計 2027 年初發射原型；SpaceX 與 xAI 合併後，向美國 FCC 申報了上看百萬顆的軌道資料中心衛星。聯發科在這張名單裡不是領跑者，蔡明介講的是趨勢判斷，不是產品發表。

<img src="/images/mediatek-sputnik-multiphysics-orbit-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="地球軌道上的衛星，象徵太空軌道運算與軌道資料中心">

## 而且，帳還沒算清楚

太空運算聽起來浪漫，但它現在卡的不是技術，是經濟性。這是遠場的另一個理由。

支持方的說法是太空有物理優勢：太陽能一年能收到比地面同尺寸板子多好幾倍的能量，散熱可以直接對真空輻射、不耗水。但[反方的帳更現實](https://introl.com/blog/orbital-data-centers-space-computing-race-2026)：Starcloud 宣稱軌道運算每度電成本約 0.005 美元、遠低於地面的 0.04 到 0.08 美元，可是也有太空公司的工程師算出來，軌道運算每瓦成本其實是地面的大約三倍。差在哪？差在發射成本。要讓兩邊打平，得等火箭把每公斤運費壓到 100 美元以下，而現在獵鷹九號大約是每公斤 2,700 美元。整個故事能不能成真，押在火箭經濟學上，不在晶片上。這種還在等一個外部變數才成立的方向，適合當前瞻布局，不適合當眼前的重押。

<img src="/images/mediatek-sputnik-multiphysics-orbit-s4.webp" width="796" height="1300" loading="lazy" decoding="async" alt="火箭發射升空，象徵太空運算成本卡在發射費用">

## 那台灣在太空這一格的近場是什麼

如果把「史普尼克時刻」讀成「快去做太空資料中心晶片」，那是解錯題，追了一個還很遠、還沒算清楚帳的遠場。台灣在太空真正吃得到的，是更近、更務實的那一段。

線索就在聯發科自己的成績單裡。前瞻研發中心 2025 年[執行 91 個產學計畫、發表 195 篇論文、申請 11 件專利](https://www.mediatek.com/zh-tw/press-room/embracing-the-next-sputnik-moment)，而三組傑出研究獎團隊的題目是：影像 AI 處理、衛星地面網路干擾抑制、6G 射頻功率放大器設計自動化。看到重點沒有？跟太空沾邊的那兩題，是衛星「地面網路」與 6G 射頻，不是把運算送上軌道。這才是台灣的近場：低軌衛星的通訊零組件、地面接收與干擾抑制、太空級的可靠度與抗輻射元件。這些是真的接得到、現在就有需求的位置。太空軌道運算當長線願景可以，但別把願景當成明年的訂單。

<img src="/images/mediatek-sputnik-multiphysics-orbit-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="衛星通訊天線，象徵台灣在低軌衛星與地面網路的近場機會">

最後給一個框架，把蔡明介這句話拆成兩欄來看：

| | 多重物理量設計 | 太空軌道運算 |
|---|---|---|
| 時間尺度 | 現在進行式 | 五年以上的遠場 |
| 卡點 | 設計方法學、協同模擬工具 | 發射成本、經濟性未定 |
| 是不是聯發科原創 | 是被 AI 逼出來的產業共識 | 全球一波熱潮，聯發科插旗 |
| 台灣近場切入點 | 先進封裝、散熱、材料的協同設計 | 衛星通訊零組件、6G 射頻、地面網路 |

看懂哪一格是近場、哪一格是遠場，比記住「史普尼克時刻」這個漂亮的比喻重要。近場的功課是把晶片設計方法從電訊號拉到多物理協同，這件事沒有太空那麼上鏡，卻是台灣半導體接下來幾年真正要補的課。

<h2>常見問題</h2>

<p><strong>多重物理量設計是什麼，跟以前的晶片設計差在哪？</strong><br>以前設計晶片主要算電訊號，散熱、機械應力這些多半是「設計完再想辦法」。多重物理量設計是把電、熱、光、機械結構、材料這些物理量在設計初期就一起算，因為 AI 晶片的算力密度太高，[散熱、電磁干擾、封裝應力已經會直接決定晶片跑不跑得動](https://www.technice.com.tw/issues/semicon/226878/)，不能再分開處理。</p>

<p><strong>蔡明介說的「史普尼克時刻」是在什麼場合講的？</strong><br>是 2026 年 6 月 24 日聯發科前瞻研發中心的年度 MARC Workshop 2026。他[以近七十年前史普尼克衛星升空為引](https://www.mediatek.com/zh-tw/press-room/embracing-the-next-sputnik-moment)，形容半導體與 AI 的發展可能正迎來下一個關鍵轉折點，並點出多重物理量設計與太空軌道運算兩個新戰場。</p>

<p><strong>太空軌道運算是聯發科要做的產品嗎？</strong><br>不是。太空軌道運算是把 AI 運算搬上衛星的概念，目前[全球有 Nvidia、Starcloud、Google 等一票玩家在推](https://introl.com/blog/orbital-data-centers-space-computing-race-2026)，而且經濟性還在爭論、成本卡在火箭發射費用。聯發科講的是趨勢判斷與前瞻布局，不是產品發表；台灣目前實際接得到的是衛星通訊與 6G 射頻這類地面端零組件。</p>

<p><strong>這件事對台灣半導體最實際的影響是什麼？</strong><br>是先進封裝與晶片設計方法學。多重物理量正好打在台灣封裝、散熱、材料的強項上（[CoWoS 就是典型戰場](/articles/tsmc-cowos-nvidia-capacity-booking/)），但真正的升級是從「高良率製造別人的設計」，往「能做電熱光機械協同設計」的上游走，而不是把力氣押在還很遠的太空。</p>
