---
title: "ASIC晶片出貨衝109%超車GPU，世芯喊到6200元"
slug: "asic-over-gpu-taiwan-ic-design"
description: "摩根大通估2026年ASIC晶片出貨年增109%、2027年以53%超車GPU，台灣世芯目標價喊到6200元、創意6800元，法人重估IC設計服務族群，但真正該問的是誰接到CSP專案、客戶集中度與製程位階。"
excerpt: "為什麼雲端巨頭寧可自己設計晶片也不多買 GPU？答案不在演算法，在電費。當每瓦效能變成天花板，專用 ASIC 就贏了，而台灣卡的是設計服務這道別人繞不過的工序。"
publishDate: "2026-07-12T08:00:00+08:00"
updatedDate: 2026-08-07
category: "tech"
subcategory: "semiconductor"
tags:
  - "半導體"
  - "AI基礎建設"
  - "資本市場"
coverImage: "covers/asic-over-gpu-taiwan-ic-design.webp"
coverAlt: "象徵 AI 資本從通用 GPU 轉向客製化 ASIC 晶片的半導體示意"
coverImageCredit: "Photo by Ivan Chumak on Pexels"
author: "appi-editorial"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "摩根大通估 2026 年客製 ASIC 出貨年增 109%、遠高於 GPU 約 39%，占全球 AI 晶片出貨約 42%，2027 年以 53% 正式超車 GPU；擴張瓶頸已從資本轉向電力，每瓦效能成勝負關鍵。"
  - "台灣 IC 設計服務族群被法人重估：世芯-KY 目標價喊到 6,200 元、創意 6,800 元，DIGITIMES 估 2026 第二季台灣 IC 設計業營收年增 11.8%，AI ASIC 是主要拉動力。"
  - "這波是贏者全拿不是雨露均霑：該問的是誰真的拿到 CSP 專案、客戶集中度與製程階級，而不是把掛 ASIC 概念的股票當基本面一起買。"
risksAndLimits:
  - "ASIC 出貨與滲透率預估來自小摩單一機構，尚未見其他法人或官方數據交叉驗證"
  - "世芯、創意等目標價與 EPS 為法人預估值，實際財報與股價可能不同"
  - "文中專案歸屬（如世芯拿亞馬遜、創意拿微軟）未附訂單金額或合約細節可查證"
  - "DIGITIMES 11.8% 營收年增為單一季度數字，不代表全年或長期趨勢"
references:
  - title: "輝達 AI 霸權鬆動？小摩：ASIC 將於 2027 年超車 GPU、博通成最大贏家"
    url: "https://news.cnyes.com/news/id/6506040"
    publisher: "鉅亨網"
  - title: "JPMorgan: AI ASIC Shipments to Exceed GPUs by 2027"
    url: "https://www.kucoin.com/news/flash/jpmorgan-ai-asic-shipments-to-surpass-gpus-by-2027"
    publisher: "KuCoin News"
  - title: "ASIC 取代 GPU？今年市占衝 3 成，創意、世芯肉多多，重量級法人曝最新目標價 EPS"
    url: "https://tw.stock.yahoo.com/news/asic%E5%8F%96%E4%BB%A3gpu-%E4%BB%8A%E5%B9%B4%E5%B8%82%E5%8D%A0%E8%A1%9D3%E6%88%90-%E5%89%B5%E6%84%8F-%E4%B8%96%E8%8A%AF%E8%82%89%E5%A4%9A%E5%A4%9A-%E9%87%8D%E9%87%8F%E7%B4%9A%E6%B3%95%E4%BA%BA%E6%9B%9D%E6%9C%80%E6%96%B0%E7%9B%AE%E6%A8%99%E5%83%B9eps-024742851.html"
    publisher: "Yahoo 股市"
  - title: "AI ASIC 與記憶體需求驅動 2Q26 台灣 IC 設計業營收估年增 11.8%"
    url: "https://www.digitimes.com.tw/research/report/?v=20260630-199"
    publisher: "DIGITIMES 研究中心"
  - title: "AI 加速器需求爆發，CSP 自研晶片推升 IP 與 ASIC 產業能見度：世芯-KY、創意、智原、晶心科"
    url: "https://news.cnyes.com/news/id/6303221"
    publisher: "鉅亨網"
originalContribution: "本文把摩根大通的 ASIC 出貨與市占預測、KuCoin 整理的 2027 加速器出貨結構、法人給世芯與創意的目標價，以及 DIGITIMES 的台灣 IC 設計營收數據串成一條線，並以『瓶頸從資本轉向電力、每瓦效能定勝負』為分析框架，提出台灣該問的三個篩選問題（拿到哪個 CSP 專案、客戶集中度、製程階級），把題材與基本面分開。"
topics: ["ai-compute-infrastructure"]
---

AI 的錢正在換跑道。摩根大通（小摩）估 2026 年客製化 ASIC 晶片[出貨量年增 109%，遠高於 GPU 約 39% 的增速](https://news.cnyes.com/news/id/6506040)，占全球 AI 晶片出貨比重衝上約 42%，到 2027 年更以 53% 正式超車 GPU。這件事對台灣的直接後果，是世芯、創意、智原這群 IC 設計服務公司被法人重新估值，目標價與 EPS 一路上修。但要先把一件事講清楚：這不是輝達被取代，是雲端巨頭在替特定工作分流，追的是每瓦效能和成本，不是誰的晶片比較全能。

先把 ASIC 跟 GPU 的差別講白。GPU 是通用加速器，什麼 AI 工作都能算，彈性高，但為了通用會犧牲效率；ASIC（特殊應用積體電路）是為單一任務量身打造的晶片，只做一件事，但做得又快又省電。雲端巨頭現在不缺演算法，缺的是把自家那幾樣固定的訓練與推論工作用最低電費跑完的晶片，所以乾脆自己下海設計。小摩估 Google 自研的 TPU 出貨量會[從 2026 年的 450 萬顆跳到 2027 年的 800 萬顆](https://news.cnyes.com/news/id/6506040)，亞馬遜的 Trainium 系列從 190 萬顆增到 330 萬顆，微軟與 Meta 的自研晶片也進量產。把這些加起來，[2027 年全球 AI 加速器總出貨估 2,330 萬顆，其中 ASIC／XPU 占 1,240 萬顆、GPU 剩 1,090 萬顆](https://www.kucoin.com/news/flash/jpmorgan-ai-asic-shipments-to-surpass-gpus-by-2027)，客製晶片第一次在數量上贏過通用 GPU。

<img src="/images/asic-over-gpu-taiwan-ic-design-s1.webp" width="960" height="1280" loading="lazy" decoding="async" alt="資料中心裡並存的 AI 加速器與伺服器晶片，象徵 GPU 與 ASIC 的出貨結構轉變">

為什麼是現在轉？追根究柢是兩個瓶頸換了位置。第一個是商品化，通用算力誰都買得到，差異化的空間被壓得很薄。第二個更關鍵：限制資料中心擴張的瓶頸，已經從「有沒有錢買晶片」變成「有沒有電可以插」。小摩點名，[「每瓦效能」正成為 AI 時代最關鍵的競爭指標](https://news.cnyes.com/news/id/6506040)，Google 最新的 Ironwood TPU 效能已是上一代的兩倍。當電費和電力額度變成天花板，能把同樣工作用更少瓦數跑完的專用晶片就贏了。這也解釋了博通為什麼會是最大贏家：它[握有高階 ASIC 市場約八到八成五的市占](https://www.kucoin.com/news/flash/jpmorgan-ai-asic-shipments-to-surpass-gpus-by-2027)，小摩估其 AI 業務營收會從 2026 年約 600 億美元，2027 年翻倍突破 1,500 億美元。市場正在形成「輝達主攻通用運算、博通主攻客製晶片」的雙寡頭。這裡要踩個剎車：ASIC 超車 GPU 講的是出貨數量，不是輝達出局。通用運算的需求還在長，只是成長最快的那一塊換成了客製晶片。

<img src="/images/asic-over-gpu-taiwan-ic-design-s2.webp" width="960" height="639" loading="lazy" decoding="async" alt="雲端資料中心機櫃，象徵雲端巨頭自研晶片大規模放量">

台灣被重估的，是 IC 設計服務這一段。CSP（雲端服務商）有想法、有訂單，但不見得有能力把晶片從設計送進台積電的先進製程、再封裝出來，這道工序外包給誰做？世芯拿的是亞馬遜的 Trainium，創意接的是微軟與 CSP 的案子，加上智原、晶心科，構成台灣的 [ASIC 設計服務族群](https://news.cnyes.com/news/id/6303221)。法人的估值直接反映了這個轉向：[世芯-KY 被喊到 6,200 元、2026／2027 EPS 上看 133／153.6 元；創意目標價 6,800 元、EPS 估 46.22／98.55 元](https://tw.stock.yahoo.com/news/asic%E5%8F%96%E4%BB%A3gpu-%E4%BB%8A%E5%B9%B4%E5%B8%82%E5%8D%A0%E8%A1%9D3%E6%88%90-%E5%89%B5%E6%84%8F-%E4%B8%96%E8%8A%AF%E8%82%89%E5%A4%9A%E5%A4%9A-%E9%87%8D%E9%87%8F%E7%B4%9A%E6%B3%95%E4%BA%BA%E6%9B%9D%E6%9C%80%E6%96%B0%E7%9B%AE%E6%A8%99%E5%83%B9eps-024742851.html)。整個產業的體感也熱，DIGITIMES 估 [2026 年第二季台灣 IC 設計業營收年增 11.8%](https://www.digitimes.com.tw/research/report/?v=20260630-199)，AI ASIC 是主要拉動力之一。我先前寫[中國 AI 資本這盤棋台廠該怎麼讀](/articles/deepseek-capital-taiwan-supply-chain/)、寫[台灣端出 AI 新十大建設](/articles/ai-new-infrastructure-compute-trusted-industries/)，講的都是同一條線：台灣的價值不在追題材，在供應鏈上某一段別人繞不過去的能力。ASIC 設計服務就是這種能力。

<img src="/images/asic-over-gpu-taiwan-ic-design-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓與晶片製造，象徵台灣 IC 設計族群受惠 ASIC 商機被重估">

但這裡最容易解錯題。看到「[ASIC 滲透率 2026 突破 3 成、2025 到 2028 年複合成長率三成五到四成](https://tw.stock.yahoo.com/news/asic%E5%8F%96%E4%BB%A3gpu-%E4%BB%8A%E5%B9%B4%E5%B8%82%E5%8D%A0%E8%A1%9D3%E6%88%90-%E5%89%B5%E6%84%8F-%E4%B8%96%E8%8A%AF%E8%82%89%E5%A4%9A%E5%A4%9A-%E9%87%8D%E9%87%8F%E7%B4%9A%E6%B3%95%E4%BA%BA%E6%9B%9D%E6%9C%80%E6%96%B0%E7%9B%AE%E6%A8%99%E5%83%B9eps-024742851.html)」，就把所有掛 ASIC 概念的股票一起買，是把題材當基本面。真正該問的是三個問題。一，這家公司到底拿到哪個 CSP 的哪個專案、量產排程在哪，還是只在門口喊有機會。二，客戶集中度多高，設計服務綁定單一大客戶，一旦客戶自己養團隊或轉單，營收就會斷崖。三，位置在哪一階，真正吃到肉的是先進製程的高階 ASIC 案，成熟製程的雜項訂單毛利完全是另一回事。這波不是雨露均霑，是贏者全拿。台灣還有一個結構性壓力要面對：中國 IC 設計產值靠內需把量堆起來，成長速度已經威脅到台灣的排名。台灣守得住的不是量，是卡在先進製程與封裝整合這道別人短期補不上的門檻。

<img src="/images/asic-over-gpu-taiwan-ic-design-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與晶片設計特寫，象徵 ASIC 設計服務的客戶集中度與供應鏈風險">

把錢從 GPU 搬到 ASIC，是雲端巨頭在用訂單投票：通用算力我照買，但我自己那幾樣固定又吃電的工作，要用自己設計、更省電的晶片來跑。台灣站在這條供應鏈的設計服務這一格，短期會因為法人重估吃到股價紅利，長期能不能守住，看的不是誰喊的目標價高，而是誰真的把 CSP 的專案接進手裡、把先進製程那道門檻墊得夠高。看懂誰拿到專案，比記住「年增 109%」這個數字重要。

<img src="/images/asic-over-gpu-taiwan-ic-design-s3.webp" width="960" height="635" loading="lazy" decoding="async" alt="資料中心電力設施，象徵擴張瓶頸從資本轉向電力與每瓦效能競賽">

## 常見問題

<p><strong>ASIC 跟 GPU 到底差在哪？為什麼雲端公司要自己做 ASIC？</strong><br>GPU 是通用加速器，什麼 AI 工作都能算，彈性高但為了通用會犧牲效率；ASIC 是為單一任務量身打造，只做一件事、但又快又省電。雲端巨頭那幾樣固定的訓練與推論工作量夠大，自己設計專用晶片能把每瓦效能和成本壓下來，這在<a href="https://news.cnyes.com/news/id/6506040">電力已成資料中心擴張瓶頸</a>的當下就是關鍵優勢。</p>

<p><strong>小摩說 ASIC 2027 年超車 GPU，是說輝達要被取代了嗎？</strong><br>不是。小摩講的是<a href="https://www.kucoin.com/news/flash/jpmorgan-ai-asic-shipments-to-surpass-gpus-by-2027">出貨數量</a>：2027 年 ASIC／XPU 占約 1,240 萬顆、GPU 1,090 萬顆。通用運算需求還在成長，只是成長最快的那塊換成客製晶片。市場更像是形成「輝達主攻通用、博通主攻客製」的雙寡頭，不是誰把誰趕出場。</p>

<p><strong>台灣哪些公司受惠這波 ASIC 轉向？</strong><br>主要是 IC 設計服務族群：世芯-KY（拿亞馬遜 Trainium）、創意（微軟與 CSP 案子），加上智原、晶心科。法人給<a href="https://tw.stock.yahoo.com/news/asic%E5%8F%96%E4%BB%A3gpu-%E4%BB%8A%E5%B9%B4%E5%B8%82%E5%8D%A0%E8%A1%9D3%E6%88%90-%E5%89%B5%E6%84%8F-%E4%B8%96%E8%8A%AF%E8%82%89%E5%A4%9A%E5%A4%9A-%E9%87%8D%E9%87%8F%E7%B4%9A%E6%B3%95%E4%BA%BA%E6%9B%9D%E6%9C%80%E6%96%B0%E7%9B%AE%E6%A8%99%E5%83%B9eps-024742851.html">世芯目標價 6,200 元、創意 6,800 元</a>，DIGITIMES 估<a href="https://www.digitimes.com.tw/research/report/?v=20260630-199">台灣 IC 設計業第二季營收年增 11.8%</a>。</p>

<p><strong>看到 ASIC 概念股是不是可以直接買？</strong><br>題材熱不等於每家都吃到肉。先問三件事：這家到底拿到哪個 CSP 的哪個專案、量產排程在哪；客戶集中度多高（綁單一大客戶，轉單就斷崖）；位置在先進製程的高階案還是成熟製程的雜項訂單。這波是贏者全拿，把題材當基本面最容易踩雷。</p>
