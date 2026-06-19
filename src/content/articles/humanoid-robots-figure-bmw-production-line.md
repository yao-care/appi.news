---
title: "人形機器人從展示走進產線：Figure 03 量產達每小時一台、BMW 11 個月組裝逾 3 萬輛"
slug: "humanoid-robots-figure-bmw-production-line"
description: "Figure 在自家 BotQ 廠把人形機器人拉到每小時量產一台，Figure 02 在 BMW 廠跑了 11 個月、參與組裝逾三萬輛 X3、每班次準確率逾 99%。人形機器人從展示影片走進真實產線，但台灣製造業真正該讀的不是炫技，是與既有產線整合、工安、責任歸屬、維運成本這幾道落地門檻怎麼收。"
excerpt: "過去看人形機器人都是後空翻、疊積木的展示影片。這次擺上桌的是兩個產線數字：每小時一台、逾三萬輛車。能力跨過去了，難的是落地門檻怎麼收。"
publishDate: "2026-07-05T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["人形機器人", "Figure 03", "BMW 產線", "實體 AI 落地", "台灣製造業"]
coverImage: "covers/humanoid-robots-figure-bmw-production-line.webp"
coverAlt: "人形機器人站在工廠產線旁，象徵人形機器人從展示影片走進真實量產現場"
coverImageCredit: "Photo by Simon Kadula on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Figure 把 BotQ 廠從每天一台拉到每小時一台，120 天內提升 24 倍、交付逾 350 台第三代機器人；Figure 02 在 BMW 廠跑了 11 個月、參與組裝逾三萬輛 X3、每班次準確率逾 99%，是第一個公開記錄、量產規模的人形機器人汽車部署。"
  - "三萬輛這個數字不代表人形機器人會組車，它做的是取放鈑金件放進焊接夾治具這種結構化、重複、有明確節拍的單一任務；真正的落地門檻在與既有產線整合、工安、責任歸屬與維運成本，這些是展示影片不會告訴你的。"
  - "Apptronik Apollo、Tesla Optimus 同期一起進入限量生產，整個產業同步跨線；台灣製造業該讀的不是炫技，而是把自己在感測、機構件、邊緣運算這條鏈上的位置先定義清楚。"
references:
  - title: "Ramping Figure 03 Production"
    url: "https://www.figure.ai/news/ramping-figure-03-production"
    publisher: "Figure"
  - title: "Figure claims new BotQ facility can make one humanoid robot per hour"
    url: "https://interestingengineering.com/ai-robotics/figure-humanoid-robot-production-scale-up"
    publisher: "Interesting Engineering"
  - title: "F.02 Contributed to the Production of 30,000 Cars at BMW"
    url: "https://www.figure.ai/news/production-at-bmw"
    publisher: "Figure"
  - title: "Humanoid robot Figure 02 helps build over 30,000 BMW X3s"
    url: "https://www.heise.de/en/news/Humanoid-robot-Figure-02-helps-build-over-30-000-BMW-X3s-11085687.html"
    publisher: "heise online"
  - title: "Physical AI Deployment ROI: BMW's 30,000-Car Proof"
    url: "https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/"
    publisher: "IIoT World"
  - title: "Apptronik brings in another $520M to ramp up Apollo production"
    url: "https://www.therobotreport.com/apptronik-brings-in-another-520m-to-ramp-up-apollo-production/"
    publisher: "The Robot Report"
  - title: "Which humanoid robots launch in 2026?"
    url: "https://qviro.com/blog/humanoid-robots-launch-2026/"
    publisher: "Qviro"
---

先把兩個數字擺在一起。一個是 Figure 在自家 BotQ 廠把人形機器人做到[每小時量產一台](https://www.figure.ai/news/ramping-figure-03-production)。另一個是 Figure 02 在 BMW 的工廠跑了 11 個月，[參與組裝逾三萬輛 X3、每班次準確率逾 99%](https://www.figure.ai/news/production-at-bmw)。過去我們看人形機器人，看到的多半是展示影片：後空翻、疊積木、走一段台步，然後配上一句「未來已來」。這兩個數字不是 demo。一個是工廠的產出節拍，一個是真實汽車產線上的良率。它把人形機器人從「能不能做到」這一格，搬進了「已經在做」這一格。

<img src="/images/humanoid-robots-figure-bmw-production-line-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="工廠裡的橘色機器手臂在汽車產線上作業，象徵自動化從固定設備走向人形機器人">

但我習慣先踩一個剎車。能力跨過某條線，跟這件事能在台灣工廠落地，是兩回事。所以這篇要做的不是替人形機器人歡呼，而是把這兩個數字拆開，看清楚它證明了什麼、又沒有證明什麼，然後談台灣製造業真正該收的那幾道門檻。

## 每小時一台，是「用造機器人來練造機器人」

先看 Figure 這邊的量產數字。BotQ 廠[從原本每天造一台，拉到每小時造一台，在 120 天內把吞吐量提升了 24 倍](https://www.figure.ai/news/ramping-figure-03-production)。這條產線鋪了[逾 150 個連網工作站，產線末端的首件良率已經做到逾 80%，電池產線甚至到 99.3%，到目前交付了逾 350 台第三代機器人](https://www.figure.ai/news/ramping-figure-03-production)。[Figure 給的目標是年產 12,000 台，這段期間已經產出逾 9,000 個致動器](https://interestingengineering.com/ai-robotics/figure-humanoid-robot-production-scale-up)。

<img src="/images/humanoid-robots-figure-bmw-production-line-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="電子製造廠的自動化組裝產線，象徵 Figure 用專屬產線量產人形機器人">

這裡值得停一下。重點不是「每小時一台」這個速度本身有多快，而是 Figure 是用工業化的產線方法在造人形機器人，不是在實驗室手工拼。首件良率、致動器產出、電池線良率，這些都是做量產才會去管的指標。換句話說，Figure 把造機器人這件事，當成了一個製造問題在解，而不是一個研究問題。一台機器人會不會做某個動作，跟一條產線能不能每小時穩定吐出一台合格品，難度完全不同。後者才是把炫技變成生意的那道坎。

## 三萬輛 X3，難的不是數字是「真的在線上」

再看 BMW 這邊。Figure 02 在 BMW 位於南卡羅來納州的 Spartanburg 廠，跑了一個[約 11 個月的部署專案，十個月內參與生產逾三萬輛 BMW X3，搬運逾九萬個鈑金件，累積逾 1,250 小時運轉、走了 120 萬步、移動逾 200 英里](https://www.figure.ai/news/production-at-bmw)。它的工作是[從料架或料箱取出三種不同的鈑金件，在 5 公釐公差內、兩秒內放進焊接夾治具，每班次的放置準確率要做到逾 99%，而且是每週一到五、每天跑滿十小時的班](https://www.heise.de/en/news/Humanoid-robot-Figure-02-helps-build-over-30-000-BMW-X3s-11085687.html)。

<img src="/images/humanoid-robots-figure-bmw-production-line-s3.webp" width="940" height="627" loading="lazy" decoding="async" alt="汽車車身在產線上焊接、火花四濺的畫面，象徵 BMW 廠的真實量產現場">

把這段讀慢一點。逾 99% 的準確率不是在攝影棚裡跑一次給你看，是每天十小時、連續做十個月、橫跨三萬輛車的平均值。[IIoT World 把這次部署稱為第一個有公開記錄、量產規模的人形機器人汽車製造案例](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)。這就是它跟展示影片最大的差別：影片秀的是峰值能力，產線要的是穩定度。一個動作做對一次叫能力，做對一百萬次叫可靠。BMW 這三萬輛，買到的是後者的證據。

## 先踩剎車：它解的是「哪一類題」

不過這裡要先把話說清楚，免得被數字帶著跑。三萬輛 X3，不代表人形機器人「會組車」。它在 BMW 做的，是[取放三種鈑金件、放進焊接夾治具這一個動作](https://www.heise.de/en/news/Humanoid-robot-Figure-02-helps-build-over-30-000-BMW-X3s-11085687.html)。這是一個結構化、重複、有明確節拍、容錯邊界清楚的單一任務，不是隨機應變的通用組裝。

<img src="/images/humanoid-robots-figure-bmw-production-line-s4.webp" width="960" height="1280" loading="lazy" decoding="async" alt="工廠料架上整齊堆放的金屬板件，象徵人形機器人負責取放鈑金件的單一任務">

證據就藏在退役報告裡。[IIoT World 指出這次部署找出的最大故障點是機器人的前臂，受限於緊湊的封裝、手腕的三個自由度與散熱限制，這個發現直接觸發了 Figure 03 的重新設計](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)。同一篇也給了很實在的建議：[要從有明確節拍目標的結構化、重複任務起步，鈑金上料才是對的第一個應用場景，而不是通用組裝](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)。

這正好對上我一直在用的框架：別先問「有沒有人形機器人」，先問「你要解的到底是哪一類問題」。人形機器人現在能穩定接住的，是那種「動作固定、節拍明確、放錯了看得出來」的活。把它放到需要臨場判斷、動作會變、出錯後果嚴重的場景，就是解錯題了。這條線跟我先前談 AI 落地的立場是同一套：[真正決定可信度的是落地設計，不是技術本身多強](/articles/llm-healthcare-promise-limits/)。三萬輛證明的是落地設計做對了一個窄場景，不是人形機器人通用了。

## 落地門檻一：跟既有產線整合，還有那本成本帳

把展示影片關掉，台灣製造業要面對的第一道門檻是整合與成本。人形機器人最大的賣點是「為人設計的環境它不用改」，可是真要進線，節拍得對上既有產線。BMW 那條線的目標節拍是 84 秒，鈑金件要[在兩秒內、5 公釐公差內放進夾治具](https://www.heise.de/en/news/Humanoid-robot-Figure-02-helps-build-over-30-000-BMW-X3s-11085687.html)。換句話說，機器人不是擺進去就好，是要對上既有線的節拍、料架擺位、夾治具設計，一個對不上，整條線就卡。

<img src="/images/humanoid-robots-figure-bmw-production-line-s5.webp" width="960" height="1440" loading="lazy" decoding="async" alt="工廠自動化設備與成本試算的概念畫面，象徵人形機器人落地的整合與回收年限門檻">

成本帳更現實。[IIoT World 估目前單台落在九萬到十萬美元，回收期約 18 到 24 個月；要等單台成本壓到三萬美元，回收期才會縮到 14 個月內](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)。這個數字對台灣中小製造廠是關鍵。BMW 這種規模的廠，吃得下兩年回收的試水溫成本；多數台灣工廠不是。所以對台廠來說，現在這個價位的人形機器人，財務上還在「示範案」而不是「主力產能」的階段。看到三萬輛就急著喊全面導入，是把別人練兵的成本誤算成自己的回收效益。

## 落地門檻二：工安與責任歸屬，這是影片不會演的

第二道門檻，影片裡永遠不會出現。Figure 02 在 BMW 是[每天跑滿十小時、跟生產節奏同步在活的產線上工作](https://www.figure.ai/news/production-at-bmw)。一台會自己走動、自己取放重物的機器人，長時間在人旁邊作業，工安怎麼界定、出事責任歸誰，這些問題在展示影片裡完全看不到，但在真實工廠裡是第一線的事。

<img src="/images/humanoid-robots-figure-bmw-production-line-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="空曠的工廠地坪與作業區，象徵人形機器人進線後的工安與責任界定問題">

責任歸屬是最硬的一關。機器人放錯一個鈑金件，往下游流到焊接、塗裝、總裝，誰負責、怎麼追、賠償怎麼算，這套制度在多數製造現場還沒長出來。這跟我先前談[居家陪伴機器人撞上台灣《人工智慧基本法》時的核心一樣：能力能進到場景裡，不代表照護或生產的責任歸屬問題就被解決了，問責原則要回答的「出錯誰負責」往往才是真正的門檻](/articles/companion-robots-ai-basic-law-elderly-care/)。產線上的人形機器人也一樣。它愈像人、動作愈自由，工安與責任的邊界就愈難畫，而這條邊界不先畫清楚，導入就會卡在這裡。

## 落地門檻三：維運成本，啟動後沒人顧很快就廢

第三道門檻是維運。Figure 02 跑完 11 個月後[退役，由 Figure 03 接替](https://www.heise.de/en/news/Humanoid-robot-Figure-02-helps-build-over-30-000-BMW-X3s-11085687.html)，而它[最大的故障點就是長時間作業磨損的前臂](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)。這提醒一件容易被忽略的事：人形機器人是會磨損、會壞、會退役的硬體，不是裝上去就一勞永逸的軟體。

<img src="/images/humanoid-robots-figure-bmw-production-line-s7.webp" width="960" height="640" loading="lazy" decoding="async" alt="工作檯上的維修工具，象徵人形機器人需要保養、備品與維運的長期成本">

維運的問題很具體：誰來保養、備品從哪來、壞了停多久、會不會卡住整條線。一台機器人每小時造得出來，不代表壞了能每小時修得好。台灣工廠導入自動化最常見的坑，就是設備買進來、啟動後沒人持續維護，很快就廢在角落。人形機器人結構更複雜、單價更高，維運沒先想清楚，回收帳會比試算表上更難看。把它當成一個要長期養的產能單位，而不是一次性的採購，才算把帳算對。

## 同期不只 Figure：整個產業一起跨線

把鏡頭拉遠，會發現這不是 Figure 一家在衝。[Apptronik 在二月又募了 5.2 億美元、累計募資已近十億，要拿來擴大 Apollo 的量產與全球部署，合作名單裡有 Mercedes-Benz、GXO 物流、Jabil 與 Google DeepMind](https://www.therobotreport.com/apptronik-brings-in-another-520m-to-ramp-up-apollo-production/)。同一時間，[Tesla 計畫 2026 年把 Optimus 推向商用，中國的 Xpeng 也要在 2026 量產 Iron](https://qviro.com/blog/humanoid-robots-launch-2026/)。

<img src="/images/humanoid-robots-figure-bmw-production-line-s8.webp" width="960" height="640" loading="lazy" decoding="async" alt="機器人研發實驗室的場景，象徵 Apollo、Optimus 等多條人形機器人程式同期進入限量生產">

幾條人形機器人程式同期進入限量生產，這個訊號比任何單一公司的炫技都重要。它代表的是整個產業同步跨過了某條線：從「我們有一台會做事的機器人」變成「我們有一條造機器人的產線、有一個敢付錢的工廠客戶」。這跟我先前看實體 AI 熱錢的角度一致，[資金正從聊天模型移到能驅動機器人、模擬與感知的世界模型底層，護城河從演算法那邊移到卡住真實世界的硬體這一邊](/articles/odyssey-world-models-physical-ai-moat/)。人形機器人量產，正是這條線上最具體的一步。

## 真人觀點：最可能先落地的場景，其實長這樣

講了這麼多門檻，那到底哪種場景會先落地？我自己的判斷是，最可能先落地的人形機器人場景，不是什麼高精密組裝，也不是炫技式 demo。

<img src="/images/humanoid-robots-figure-bmw-production-line-s9.webp" width="960" height="1275" loading="lazy" decoding="async" alt="夜間倉儲走道與料車，象徵人形機器人最可能先落地的夜班物流加巡檢場景">

而是台灣工廠最常見的一段現實：夜班時，產線還在跑，但人力已經縮到最低配置。這時候總得有人負責在各廠區之間搬料、補料、收空箱，推著料車在走道、電梯、不同樓層之間移動，同時還要定時巡設備，看儀表、確認警示燈、記錄異常。這種人通常是一個人扛一整區的物流加巡檢。

問題不是技術做不到，而是這件事本質上很尷尬。它太分散、太瑣碎、又太依賴現場臨場判斷，導致很難用固定自動化設備一次解掉。你擺一台 AMR，它只會搬料不會巡檢；你裝一支機械手臂，它釘在原地哪都不能去。但也因為這樣，它反而最適合人形機器人。因為它做的不是單一動作，而是在一個為人設計的混亂工廠裡，把走動、搬運、簡單判斷這一整段工作接起來。人形機器人真正的優勢從來不是哪個動作做得多漂亮，而是它能在不改造廠房的前提下，把這種零碎到沒辦法用單一設備解的活整段承接下來。

## 台灣製造業該怎麼站位

所以回到台灣製造業，這條新聞該怎麼讀。我的判斷是，別被展示影片帶風向，也別被三萬輛這個數字嚇到急著全面導入。真正該做的是先定義自己的位置。

<img src="/images/humanoid-robots-figure-bmw-production-line-s10.webp" width="960" height="640" loading="lazy" decoding="async" alt="精密電子零組件的特寫，象徵台灣製造業在感測、機構件、邊緣運算的卡位">

台灣的機會多半不在做整台人形機器人本體，而在它身上會用到的零組件。一台會走會搬會判斷的機器人，要靠感測器知道周遭、靠精密機構件動得準、靠邊緣運算晶片即時反應，這些[會碰到真實世界的零組件，正是台灣供應鏈該卡進去的位置，而不是只守雲端代工](/articles/odyssey-world-models-physical-ai-moat/)。政府這邊也已經把[智慧機器人列為關鍵技術主軸之一](/articles/ai-new-infrastructure-compute-trusted-industries/)，方向是定了，接不接得住要看自家能力有沒有先長出來。

至於要不要把人形機器人導進自家產線，順序一樣不能倒。[先把你要解的情境定義清楚，再評估哪類工具符合這個情境的前提，最後才比具體型號](/articles/what-is-claw-llm-client-tool/)。Figure 在 BMW 證明的，是「結構化、重複、節拍明確」這類任務值得試；它沒證明的，是你那個需要臨場判斷的活也能交給它。三萬輛是別人替整個產業跑出來的證據，它告訴你能力到哪了；但落地門檻怎麼收，與既有產線整合、工安、責任歸屬、維運成本這四格，得你自己一格一格盤過。能力是別人的，門檻是自己的。看懂這個差別，才不會把別人的展示，當成自己的捷徑。

## 常見問題

**Figure 03 每小時量產一台，代表人形機器人成熟了嗎？**

代表的是「造機器人」這件事工業化了，不代表機器人「會做的事」變多了。[每小時一台講的是 Figure 自家產線的吞吐量與良率](https://www.figure.ai/news/ramping-figure-03-production)，是製造能力的突破。機器人在現場能穩定接住的任務，目前還集中在結構化、重複、節拍明確的單一動作，離通用還很遠。

**BMW 用人形機器人組了三萬輛車，台灣工廠現在該導入嗎？**

先看成本帳再決定。[目前單台約九到十萬美元、回收期 18 到 24 個月](https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/)，這個價位 BMW 規模的廠吃得下，多數台灣中小廠不一定。更該先盤的是與既有產線整合、工安、責任歸屬與維運這四道門檻，而不是看到三萬輛就急著跟進。

**台灣製造業在這波人形機器人裡的機會在哪？**

多半不在做整台機器人本體，而在它會用到的零組件：感測器、精密機構件、邊緣運算晶片這些[會碰到真實世界的部分](/articles/odyssey-world-models-physical-ai-moat/)。先把自己在這條鏈上的位置定義清楚，把該長的能力先長出來，比急著導入整台機器人更實際。
