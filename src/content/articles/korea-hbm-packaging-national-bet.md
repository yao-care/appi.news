---
title: "南韓砸 2,525 億美元擴 HBM 產能：三星、SK 海力士同步蓋新廠，重點卻在封裝"
slug: "korea-hbm-packaging-national-bet"
description: "南韓 6/29 端出 800 兆韓元（約 5,190 億美元）半導體國家計畫，光忠清區就砸 392 兆韓元（2,525 億美元）。三星電子 56 兆蓋 HBM 廠加封裝、SK 海力士 20 兆補先進封裝，押的是卡住 AI 晶片供給的真瓶頸。這一格正是台積電 CoWoS 的護城河。"
excerpt: "南韓這筆錢真正押的不是多蓋幾座晶圓廠，是先進封裝。而封裝正是這兩年卡住 Nvidia、AMD 加速器出貨的瓶頸，也是台積電 CoWoS 的護城河那一格。"
publishDate: "2026-07-23T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["HBM", "先進封裝", "南韓半導體", "記憶體", "台積電 CoWoS", "台灣供應鏈"]
coverImage: "covers/korea-hbm-packaging-national-bet.webp"
coverAlt: "堆疊的記憶體與半導體晶片，象徵南韓擴充 HBM 與先進封裝產能"
coverImageCredit: "Photo by Sergei Starostin on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "南韓 6/29 宣布的是一整套 800 兆韓元（約 5,190 億美元）半導體計畫，光忠清區產業投資就 392 兆韓元（2,525 億美元），三星電子 56 兆蓋 HBM 廠加封裝、SK 海力士 100 兆裡有 20 兆專攻先進封裝。"
  - "這筆錢真正的施力點在封裝，不在晶圓：HBM 的供給瓶頸一直卡在把記憶體堆疊鍵合的封裝產能，而不是晶圓產出，這決定了 Nvidia、AMD 加速器出貨的速度。"
  - "先進封裝是台積電 CoWoS 的護城河那一格，南韓國家隊帶著資金和加速審批對著同一格砸下去；台灣強在邏輯晶片封裝，卻沒有本土記憶體大廠，這是要提早看懂的卡位問題。"
references:
  - title: "Samsung, SK hynix to build HBM packaging fabs in Chungcheong region as part of W392tr in total investment"
    url: "https://www.koreaherald.com/article/10795719"
    publisher: "The Korea Herald"
  - title: "Samsung, SK hynix pledge $519 bil. for southwestern chip hub"
    url: "https://www.koreatimes.co.kr/southkorea/20260629/samsung-sk-hynix-pledge-519-bil-for-southwestern-chip-hub"
    publisher: "The Korea Times"
  - title: "Samsung and SK hynix Build HBM Packaging Fabs"
    url: "https://letsdatascience.com/news/samsung-and-sk-hynix-build-hbm-packaging-fabs-f9069af3"
    publisher: "Let's Data Science"
  - title: "South Korea is investing $520 billion in Samsung and SK Hynix to build more HBM fabs for AI"
    url: "https://www.tweaktown.com/news/112402/south-korea-is-investing-dollars520-billion-in-samsung-and-sk-hynix-to-build-more-hbm-fabs-for-ai/index.html"
    publisher: "TweakTown"
  - title: "Samsung, SK Hynix mega South Korea chips gamble tests optimism of AI cycle"
    url: "https://www.investing.com/news/stock-market-news/samsung-sk-hynix-mega-south-korea-chips-gamble-tests-optimism-of-ai-cycle-4767082"
    publisher: "Reuters / Investing.com"
originalContribution: "本文把南韓 392 兆韓元忠清區產業盤子拆開，指認出三星 56 兆與 SK 海力士 20 兆這兩筆封裝投資才是主軸，並以『HBM 瓶頸在封裝不在晶圓』為分析框架，對照台積電 CoWoS 護城河與台灣缺本土記憶體大廠的結構缺口，評估台灣在這條供應鏈的卡位點。"
---

南韓這筆錢，真正的重點不是「蓋更多晶圓廠」。三星和 SK 海力士這輪同步擴產，最該盯的是他們把大把資金押在「先進封裝」這一格，而封裝正是這兩年一直卡住 AI 晶片供給的真瓶頸。看懂這件事，比記住 2,525 億美元這個數字重要。對台灣來說這是一記直球：先進封裝本來是台積電的護城河，現在南韓國家隊帶著錢和加速審批，正對著同一格砸下去。

<img src="/images/korea-hbm-packaging-national-bet-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="興建中的半導體廠房，象徵南韓大規模擴充記憶體與封裝產能">

先把數字拆清楚，別被大標題帶偏。6 月 29 日，南韓總統李在明[端出一套 800 兆韓元、約 5,190 億美元的半導體國家計畫](https://www.koreatimes.co.kr/southkorea/20260629/samsung-sk-hynix-pledge-519-bil-for-southwestern-chip-hub)，核心是三星和 SK 海力士各蓋兩座、共四座新記憶體廠，蓋在西南部光州一帶。至於各家新聞掛的「2,525 億美元」，指的是[另一塊忠清區的 392 兆韓元產業投資](https://www.koreaherald.com/article/10795719)，裡面三星集團出 140 兆，其中三星電子 56 兆專門蓋一座 HBM 廠加封裝設施；SK 海力士出 100 兆，蓋 NAND 快閃記憶體與先進封裝廠，光是封裝的 P&T7 廠就佔 20 兆，M17 廠明年動土、目標 2029 上半年投產。一堆數字，抓兩個就好：三星的 56 兆、SK 海力士的 20 兆，這兩筆錢的主體都是 HBM 與封裝。

<img src="/images/korea-hbm-packaging-national-bet-s2.webp" width="960" height="720" loading="lazy" decoding="async" alt="半導體晶圓與封裝製程特寫，象徵把記憶體堆疊鍵合的先進封裝環節">

為什麼是封裝？因為 HBM 的供給瓶頸從來不在晶圓。HBM 是把好幾層 DRAM 疊起來、用先進封裝鍵合成一整塊高頻寬記憶體，再貼到 GPU 旁邊。過去兩年 Nvidia、AMD 的 AI 加速器出貨速度，[卡的一直是封裝這道工，而不是晶圓產出](https://letsdatascience.com/news/samsung-and-sk-hynix-build-hbm-packaging-fabs-f9069af3)。每顆 GPU 都要一組經過先進封裝鍵合的記憶體堆疊，全球這種封裝產能就那麼多，是它決定了 AI 晶片能出多少貨。所以三星和 SK 海力士把錢往封裝廠丟，是認出了對的瓶頸。這件事的判準不是「蓋了幾座廠」，而是「有沒有砸在真正卡住供給的那一段」，這一輪他們砸對了。

<img src="/images/korea-hbm-packaging-national-bet-s3.webp" width="960" height="641" loading="lazy" decoding="async" alt="建廠工地的起重機與鋼構，象徵南韓政府加速審批、壓縮建廠工期">

南韓政府這次也把「制度」當成工具在用。目標訂得很白：[五年內把國內記憶體產能翻一倍](https://www.koreatimes.co.kr/southkorea/20260629/samsung-sk-hynix-pledge-519-bil-for-southwestern-chip-hub)，並承諾加速核准、把過去要花七到十二年的建廠流程大幅壓短。這一步值得台灣認真看。台灣談半導體投資常卡在土地、水電、環評，一拖就是好幾年；南韓直接由總統帶頭把行政流程當成競爭工具在削。工具用得對不對，還是要看它服務的題目是什麼。南韓這次的題目是封裝與 HBM 產能，加速審批就是為了讓封裝廠早一點長出來，方向沒有跑偏。

<img src="/images/korea-hbm-packaging-national-bet-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="金融市場數據與走勢畫面，象徵記憶體景氣循環與過度投資的下行風險">

但這裡要踩一個剎車。把整個國家的資本押在 AI 記憶體，是一場有下行風險的賭注，不是穩贏。[路透整理的分析師看法](https://www.investing.com/news/stock-market-news/samsung-sk-hynix-mega-south-korea-chips-gamble-tests-optimism-of-ai-cycle-4767082)講得直接：晨星分析師 Jing Jie Yu 說，未來十年一路加碼資本支出，「長期反而拉高供給過剩的風險」，這波記憶體榮景「完全押在 AI 超大規模業者會不會維持現在的擴張速度」；CLSA 的 Sanjeev Rana 也承認「記憶體產業一旦反轉，明顯會是這個計畫的風險」；首爾大學教授李鍾昊更質疑時機，「沒人知道三年後長什麼樣，需求不確定，決策該謹慎」。要命的是這些新產能大多要到本十年末才真正上線，等於用今天的需求假設，去賭好幾年後的市場。認出對的瓶頸是一回事，賭注會不會兌現是另一回事，兩件事不能混為一談。

<img src="/images/korea-hbm-packaging-national-bet-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與電子製造特寫，象徵台灣在先進封裝供應鏈的卡位與缺口">

那台灣該從這條新聞讀出什麼？先進封裝這一格，本來是台積電用 CoWoS 撐起來的護城河，Nvidia 的 AI 晶片就是靠它把 GPU 和 HBM 封在一起。現在南韓國家隊帶著資金和加速審批，正對著同一格砸下去，而且他們手上多一張台灣沒有的牌：三星和 SK 海力士自己就是 HBM 大廠，記憶體本體加封裝可以垂直整合。台灣強在邏輯晶片的先進封裝，卻沒有自己的記憶體巨頭，HBM 這段一直得看南韓和美光的臉色。我先前寫過 [SK 海力士把戰線拉到封裝、還綁台積電做 HBM4](/articles/sk-hynix-packaging-hbm-tsmc/)，也寫過 [SK 海力士赴那斯達克募資、有一段會流回台積電](/articles/sk-hynix-nasdaq-hbm-listing/)，講的都是同一件事：南韓在補自己封裝的短板，台灣的護城河不是天生就守得住。真正的卡位點，是把台積電在 CoWoS 這類先進封裝的技術領先，跟本土封測、材料、設備廠一起做深，而不是假設別人追不上來。看懂南韓押的是封裝，比盯著 2,525 億這個數字重要。

<h2>常見問題</h2>

<p><strong>南韓這 2,525 億美元到底是拿去做什麼的？</strong><br>它指的是南韓中部忠清區的 392 兆韓元（約 2,525 億美元）產業投資，主體是三星電子 56 兆韓元的 HBM 廠與封裝設施、SK 海力士 100 兆韓元的 NAND 與先進封裝廠（其中封裝約 20 兆）。這一塊又屬於 6/29 公布、總額 800 兆韓元的全國半導體計畫的一部分，該計畫的核心是四座新記憶體廠。</p>

<p><strong>為什麼重點是先進封裝，不是多蓋晶圓廠？</strong><br>因為 HBM 的供給瓶頸卡在封裝，不在晶圓。HBM 要把多層 DRAM 堆疊、用先進封裝鍵合再貼到 GPU 旁，全球這種封裝產能有限，直接決定 Nvidia、AMD 的 AI 加速器能出多少貨。所以錢砸在封裝，才是砸在真正卡住供給的那一段。</p>

<p><strong>這對台積電和台灣供應鏈是威脅嗎？</strong><br>是要提早看懂的競爭訊號。先進封裝（如台積電 CoWoS）本來是台灣的護城河，南韓帶著國家資金和加速審批往同一格投，還有自家 HBM 大廠可以垂直整合。台灣強在邏輯晶片封裝，但沒有本土記憶體巨頭，HBM 這段仰賴南韓與美光，這個結構缺口值得正視。</p>

<p><strong>這麼大的投資會不會蓋出來卻沒人買？</strong><br>這是真實風險。晨星、CLSA 與首爾大學的分析師都警告，若 AI 超大規模業者的擴張速度放緩，長期恐出現記憶體供給過剩，而這些新產能大多要到本十年末才上線，等於用今天的需求去賭好幾年後的市場。</p>
