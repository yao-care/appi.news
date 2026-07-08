---
title: "Uber、Stellantis、Wayve 簽 MOU 要把 L4 robotaxi 鋪向全球：真正的賣點是『不靠逐城建圖』"
slug: "wayve-uber-stellantis-l4-robotaxi"
description: "6/17 三方簽了一份非約束性 MOU，要把 Level 4 robotaxi 鋪向歐洲、北美與更多城市。這則新聞值得看懂的不是『L4 來了』，而是 Wayve 主打的『不靠逐城建圖』能不能把自駕的擴張成本壓下來。台灣這格有鴻海在陣營裡，但卡點不在技術，在法規與供應鏈定位。"
excerpt: "Waymo 每進一座城市都要先把街道建成高精地圖，慢又貴。Wayve 賭的是相反的路：一個端到端神經網路直接看鏡頭開車，換城市不必重建圖。這份 MOU 真正在賭的是這條路能不能規模化。"
publishDate: "2026-07-21T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["robotaxi", "Wayve", "自駕車", "Stellantis", "台灣供應鏈"]
coverImage: "covers/wayve-uber-stellantis-l4-robotaxi.webp"
coverAlt: "都市街道上的自駕計程車，象徵 Uber、Stellantis、Wayve 三方合作要把 L4 robotaxi 鋪向全球"
coverImageCredit: "Photo by Stephen Leonardi on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "6/17 Stellantis、Wayve、Uber 簽的是非約束性 MOU，沒有金額也沒有時程；Stellantis 造 L4-Ready 平台車、Wayve 供 AI 駕駛軟體、Uber 用 App 派單。"
  - "這則新聞真正的賣點是 Wayve 主打的『不靠逐城建圖』：AV2.0 用單一端到端神經網路直接把鏡頭畫面轉成駕駛動作，換城市不必重建高精地圖，號稱擴張更快更省。"
  - "台灣這格有鴻海在同一個 Stellantis／NVIDIA／Uber 的 L4 陣營，但真正的卡點不在技術，在法規尚未開放與供應鏈要卡哪一段。"
references:
  - title: "Stellantis, Wayve, and Uber Partner to Scale Robotaxis Globally"
    url: "https://www.stellantis.com/en/news/press-releases/2026/june/stellantis-wayve-and-uber-partner-to-scale-robotaxis-globally"
    publisher: "Stellantis"
  - title: "AV2.0 – Autonomy 2.0 – Wayve's data-driven approach"
    url: "https://wayve.ai/technology/av2-0/"
    publisher: "Wayve"
  - title: "Wayve, Uber and Stellantis partner to deploy Level 4 robotaxis globally"
    url: "https://zagdaily.com/featured/wayve-uber-and-stellantis-partner-to-deploy-level-4-robotaxis-globally/"
    publisher: "Zag Daily"
  - title: "鴻海Robotaxi有望在台上路？行政院長卓榮泰鬆口：研議修法"
    url: "https://cars.tvbs.com.tw/car-news/291177"
    publisher: "TVBS 地球黃金線"
  - title: "無人載具科技創新實驗條例：完備智慧運輸"
    url: "https://www.ey.gov.tw/Page/5A8A0CB5B41DA11E/6cf45fd7-8031-4256-9e39-1106325975e0"
    publisher: "行政院"
originalContribution: "本文把這份三方 MOU 的重點從『L4 來了』拉回到真正的變數，也就是 Wayve『不靠逐城建圖』的端到端路線能否壓低擴張成本，並以此對照台灣：鴻海雖在同一個 Stellantis／NVIDIA／Uber 陣營，但台灣的卡點是法規與供應鏈定位而非技術，據此拆解台灣該卡哪一段。"
---

三方簽的是一份不綁時程、不綁金額的意向書，這則新聞真正值得看懂的不是「Level 4 robotaxi 要來了」。真正的變數藏在 Wayve 那句「不靠逐城建圖」：它賭的是自駕的擴張成本能不能被壓下來。能，這樁合作才有意義；不能，這就只是又一份漂亮的新聞稿。

6 月 17 日，Stellantis、AI 自駕新創 Wayve 與 Uber [宣布簽署合作備忘錄，要一起把 L4 driverless robotaxi 鋪向歐洲、北美與更多城市](https://www.stellantis.com/en/news/press-releases/2026/june/stellantis-wayve-and-uber-partner-to-scale-robotaxis-globally)。分工很清楚：Stellantis 負責設計、工程與量產搭載感測套件、為高工時無人營運做好安全與備援的「L4-Ready 平台」車；Wayve 出 AI 駕駛軟體，讓車能自己感知與行駛；Uber 把這些車掛上它的網路，用 App 把乘客接上車。

<img src="/images/wayve-uber-stellantis-l4-robotaxi-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="都市街道上等待乘客的自駕計程車，象徵車廠造車、AI 供駕駛、平台派單的三方分工">

先踩一個剎車：這是[非約束性的 MOU，沒有固定時間表、也沒有財務條款](https://zagdaily.com/featured/wayve-uber-and-stellantis-partner-to-deploy-level-4-robotaxis-globally/)，只是替後續談判搭一個框架。所以「全球佈署」四個字現在還是意向，不是承諾。真要讀出這樁合作的份量，得看 Wayve 帶進來的那套方法到底不一樣在哪。

## 賣點不是「會開車」，是「換城市不用重來」

多數人熟悉的自駕路線，是 Waymo 那種：每進一座城市，先派車把街道掃描成高精地圖（HD map），把號誌、車道、路緣都建進資料庫，車再照著這張圖跑。這條路穩，但慢也貴，每開一座新城市幾乎都要重來一次。

Wayve 走的是相反的路。它主打的 AV2.0 是[一個端到端的神經網路，從鏡頭與雷達的原始訊號直接輸出「轉方向盤、踩煞車」這些駕駛動作，中間不靠手寫規則，也不靠高精地圖](https://wayve.ai/technology/av2-0/)。官方講法是這套做法「讓自駕跨過逐城佈署，就算對一座城市幾乎沒有先前經驗，也能開進去」。反映在這樁合作上，就是 Stellantis 那句 Wayve 的軟體「不必逐城建圖或重新工程，就能適應不同地區與路況，擴張更快也更省」。

<img src="/images/wayve-uber-stellantis-l4-robotaxi-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="裝著多顆鏡頭與感測器的自駕車，象徵端到端神經網路直接把畫面轉成駕駛動作">

這才是這則新聞的重點。robotaxi 卡了這麼多年沒能大規模鋪開，瓶頸從來不是「單一路口會不會開」，是「每多開一座城市要多花多少錢、多久」。誰能把這個單位成本壓下來，誰才有可能真的把車鋪到全球。Wayve 賭的就是這一格。

## 這條路成不成，還沒證明

方向清楚，不等於已經成立。把地圖依賴拿掉，代價是把更多重擔壓到模型身上：它得在沒有先驗地圖的城市裡，靠當下看到的畫面自己判斷。這在展示影片裡跑得漂亮，跟在一座陌生城市做到能商業營運、能通過安全驗證，是兩件事。

<img src="/images/wayve-uber-stellantis-l4-robotaxi-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="車內導航畫面上的城市道路，象徵不靠逐城建圖的自駕擴張路線">

Wayve 執行長 Alex Kendall [說法規「已經不再是把自駕規模化的關鍵路徑」](https://zagdaily.com/featured/wayve-uber-and-stellantis-partner-to-deploy-level-4-robotaxis-globally/)。這句話我保留。對一家要募資、要簽 MOU 的公司來說，把技術說成已經就緒、瓶頸只剩外部，是可以理解的敘事。但 L4 真正難的一關，是在沒有安全駕駛坐鎮的情況下證明「夠安全」，這件事的關鍵路徑仍是驗證與責任歸屬，不是把地圖丟掉就跳過去了。Wayve 和 Uber 目前也還在倫敦、東京等城市推進，[今年計畫再上十餘座城市](https://zagdaily.com/featured/wayve-uber-and-stellantis-partner-to-deploy-level-4-robotaxis-globally/)，多數仍屬部署與測試階段。這是一場長線賭注，不是已經兌現的成果。

## 台灣這格：有人在陣營裡，卡的卻不是技術

那台灣該從這則新聞讀出什麼？先講一個很多人沒接起來的點：這波 L4 陣營裡，其實有台灣的名字。鴻海在 2025 科技日就[宣布要和 Stellantis、NVIDIA、Uber 共同開發 Level 4 的無人計程車](https://cars.tvbs.com.tw/car-news/291177)，跟這份三方 MOU 是同一個大棋盤上的相鄰棋子。

<img src="/images/wayve-uber-stellantis-l4-robotaxi-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣街頭的車流，象徵 robotaxi 在台灣仍受法規限制尚未上路">

問題是，台灣要解的第一題根本不是技術。同一則報導講得很直白：無人計程車在別的國家已陸續上路測試甚至營運，[台灣卻受限於法律規範，還不能正式在道路上行駛](https://cars.tvbs.com.tw/car-news/291177)，連特斯拉的 FSD 都還沒開放。台灣不是沒有法源，2018 年就通過[《無人載具科技創新實驗條例》，用監理沙盒讓業者試行，實驗期原則一年、必要時可展延，有修法必要時全程最長四年](https://www.ey.gov.tw/Page/5A8A0CB5B41DA11E/6cf45fd7-8031-4256-9e39-1106325975e0)。但沙盒是「關起門來試」，跟「正式商業營運」中間還隔著一整套要修的法。行政院長卓榮泰面對質詢也只鬆口說會把無人載具納入 AI 新時代建設、研議修法可行性，[還沒端出具體方向與議程](https://cars.tvbs.com.tw/car-news/291177)。

用我一貫的說法：先分清楚要解的是哪一題，別解錯題。台灣在這條 robotaxi 供應鏈上，真正要顧的是兩件事，而且順序不能倒。一是制度那一題，沙盒到商業營運之間的法規缺口誰來補、責任與保險怎麼算，這題不通，技術再好也只能在封閉場域繞圈。二是供應鏈定位那一題，車鋪不鋪得到台灣街上，跟台灣廠商能不能吃到這波的訂單，是可以分開的兩件事。

## 別只想著代工那顆大晶片

第二題最容易看歪的地方，是把它想成「多接一點雲端 AI 晶片的單」。Stellantis 那台 L4-Ready 平台車，要的是嵌在車上的感測套件、為無人營運做的線路備援、車規等級的整車整合，這些都是碰真實世界、要長期驗證的硬功夫，跟資料中心那顆大晶片是不同的戰場。台灣在車用電子、感測、精密機構這幾段本來就有底子，鴻海直接站進整車與平台這一格，[也和它從電子代工往電動車整車跨的路線一致](/articles/foxconn-mexico-nvidia-ai-server/)。

<img src="/images/wayve-uber-stellantis-l4-robotaxi-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="車用電子與感測零組件的製造產線，象徵台灣在 robotaxi 供應鏈的卡位點">

把這份 MOU 讀完整，重點不是「L4 robotaxi 要來了」這種標題，而是它把賭注押在哪：押在「不靠逐城建圖能把擴張成本壓下來」。這條路會不會成，還要看 Wayve 接下來在陌生城市能不能真的做到夠安全、能營運。台灣站在這條供應鏈上，該做的不是等它成真，是先把自己的兩題想清楚：法規那題有沒有人在補，供應鏈那題要卡感測與整車、還是只想守著代工那一格。看懂賭注押在哪，比記住「三方簽了 MOU」重要。

<h2>常見問題</h2>

<p><strong>這次 Uber、Stellantis、Wayve 的合作到底簽了什麼？</strong><br>是一份 6/17 簽的非約束性合作備忘錄（MOU），要一起把 Level 4 robotaxi 鋪向歐洲、北美等城市。分工是 Stellantis 造 L4-Ready 平台車、Wayve 供 AI 駕駛軟體、Uber 用 App 派單。<a href="https://zagdaily.com/featured/wayve-uber-and-stellantis-partner-to-deploy-level-4-robotaxis-globally/">它沒有固定時程也沒有金額</a>，現階段是意向與框架，不是已經拍板的商業佈署。</p>

<p><strong>Wayve 說的「不靠逐城建圖」跟 Waymo 差在哪？</strong><br>Waymo 那類做法每進一座城市要先把街道掃描成高精地圖，車照圖跑，穩但慢又貴。Wayve 的 AV2.0 是<a href="https://wayve.ai/technology/av2-0/">一個端到端神經網路，直接把鏡頭與雷達訊號轉成駕駛動作，不靠手寫規則也不靠高精地圖</a>，主打換城市不必重建圖，因此擴張理論上更快更省。代價是更吃模型在陌生環境的判斷力，還要證明夠安全。</p>

<p><strong>Level 4 robotaxi 什麼時候會在台灣上路？</strong><br>短期內不會有明確時間。台灣目前<a href="https://cars.tvbs.com.tw/car-news/291177">法規尚未開放無人計程車正式在道路上營運</a>，連特斯拉 FSD 都還沒開放。雖有 2018 年《無人載具科技創新實驗條例》的監理沙盒可試行，但行政院僅表示會研議修法，尚未提出具體時程。</p>

<p><strong>台灣廠商能從這波 robotaxi 得到什麼？</strong><br>機會在供應鏈而非等車上路。鴻海已站進 Stellantis／NVIDIA／Uber 的 L4 陣營，切的是整車與平台；台灣在車用電子、感測與精密機構也有底子。要卡的是這些會碰真實世界、需長期驗證的零組件與整車整合，而不只是雲端 AI 晶片代工那一格。</p>
