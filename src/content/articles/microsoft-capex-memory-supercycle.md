---
title: "AI 記憶體超級循環的第一張帳單，先砸到雲端大廠自己：微軟 2026 資本支出衝 1900 億，其中 250 億是記憶體漲出來的"
slug: "microsoft-capex-memory-supercycle"
description: "微軟把 2026 會計年度資本支出上修到 1900 億美元，財務長 Amy Hood 明說其中約 250 億是記憶體與零組件漲價純墊上去的成本。這張 AI 記憶體超級循環的帳單，先砸到出錢蓋機房的雲端大廠自己，再一路往下壓到筆電與手機。台灣同時站在受惠與受壓兩端。"
excerpt: "微軟願意在毛利被壓的情況下砸 1900 億、含淚吞 250 億漲價，賭的是 AI 需求撐得住這個成本結構。台灣看這條新聞最容易只讀半邊：不能只看記憶體台廠利多，也不能只看 PC 被壓垮。"
publishDate: "2026-07-11T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags:
  - "半導體"
  - "AI基礎建設"
  - "供應鏈"
coverImage: "covers/microsoft-capex-memory-supercycle.webp"
coverAlt: "堆疊的電腦記憶體晶片與電路板，象徵 AI 記憶體超級循環墊高的資本支出帳單"
coverImageCredit: "Photo by IT services EU on Pexels"
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
  - "微軟 2026 會計年度資本支出上修到 1900 億美元，創同業紀錄；財務長 Amy Hood 明說其中約 250 億美元是記憶體與零組件漲價墊上去的成本，跟蓋更多資料中心無關。"
  - "這不是景氣循環。原廠把八成以上產能轉去做 HBM 與企業級產品，DRAM 供給被結構性抽走，TrendForce 估 2026 年 DRAM 價格再漲超過七成。"
  - "帳單一路往下壓：記憶體占雲端 AI 支出比重四年翻四倍到三成，占筆電手機 BOM 一到兩成，華碩已預告台灣 PC 第二季漲 25% 到 30%。"
risksAndLimits:
  - "微軟 250 億美元記憶體墊高成本為公司財報自估數字，未見獨立會計查核佐證"
  - "TrendForce 預估 2026 年 DRAM 再漲逾七成屬預測值，非已發生事實"
  - "華碩預告台灣 PC 售價漲 25% 至 30% 為估計區間，實際調幅依各通路而定"
  - "文中台廠受惠與受壓判斷僅涵蓋提及公司，不代表整體記憶體供應鏈"
references:
  - title: "Microsoft lifts 2026 CapEx by $25B to cover price rises"
    url: "https://www.theregister.com/2026/04/30/microsoft_q3_2026/"
    publisher: "The Register"
  - title: "Skyrocketing component prices push Big Tech capex to record $725 billion"
    url: "https://www.tomshardware.com/tech-industry/big-tech/microsoft-attributed-25-billion-of-its-record-ai-budget-to-memory-chip-costs"
    publisher: "Tom's Hardware"
  - title: "Memory will consume 30% of hyperscaler AI data center spending this year, a 4X increase over 2023"
    url: "https://www.tomshardware.com/tech-industry/memory-will-consume-30-percent-of-hyperscaler-spending-this-year"
    publisher: "Tom's Hardware"
  - title: "Memory Wall Bottleneck: AI Compute Sparks Memory Supercycle"
    url: "https://www.trendforce.com/insights/memory-wall"
    publisher: "TrendForce"
  - title: "2026 Market Outlook: SK hynix's HBM to Fuel AI Memory Boom"
    url: "https://news.skhynix.com/2026-market-outlook-focus-on-the-hbm-led-memory-supercycle/"
    publisher: "SK hynix Newsroom"
  - title: "專家觀點／記憶體價格瘋漲 消費性電子高成本有壓"
    url: "https://money.udn.com/money/story/11162/9195263"
    publisher: "經濟日報"
  - title: "晚買反而沒折扣，華碩：PC 價格第二季估漲 25%~30%"
    url: "https://finance.technews.tw/2026/03/23/asus-pc-pricing/"
    publisher: "科技新報"
  - title: "記憶體漲價延續至 2026！這幾家台廠迎利多"
    url: "https://money.cmoney.tw/article/30203"
    publisher: "Money 錢雜誌"
originalContribution: "本文把微軟 250 億美元的記憶體漲價成本，串成一條從雲端資本支出、記憶體牆結構、到台灣消費端與台廠兩面受力的完整傳導鏈，並以『這張帳單改寫了誰的議價權』為分析框架，指出台灣同時站在受惠與受壓兩端、該盯的是自己卡在鏈上哪一段。"
---

AI 記憶體超級循環的第一張大帳單，先砸到出錢蓋機房的雲端大廠自己。微軟把 2026 會計年度的資本支出上修到 1900 億美元，其中約 250 億是記憶體與零組件漲價「純墊出來」的成本，不是多買了東西，是同樣的料變更貴。這句話是財務長 Amy Hood 在[第三季財報電話會議親口講的](https://www.theregister.com/2026/04/30/microsoft_q3_2026/)。追下去會發現，這不是微軟一家的偶發帳單，而是整條 AI 供應鏈把記憶體吸乾之後，必然要有人先付的那一筆。

<img src="/images/microsoft-capex-memory-supercycle-s1.webp" width="960" height="639" loading="lazy" decoding="async" alt="雲端資料中心的伺服器機櫃，象徵微軟為 AI 擴建機房的巨額資本支出">

先把數字擺清楚。微軟這輪 1900 億美元的資本支出創下同業紀錄，把五大雲端業者加起來，[2026 年整體大型科技公司的資本支出衝上約 7250 億美元的新高](https://www.tomshardware.com/tech-industry/big-tech/microsoft-attributed-25-billion-of-its-record-ai-budget-to-memory-chip-costs)。其中微軟明說有 250 億美元是記憶體與晶片漲價貢獻的，跟蓋更多資料中心無關。Amy Hood 還補了一句關鍵的話：記憶體與儲存價格從去年秋天以來飆漲，部分品項[漲超過三倍，而且供給「至少到 2026 年都會持續吃緊」](https://www.theregister.com/2026/04/30/microsoft_q3_2026/)。翻成白話，這不是一次性的成本抖動，是一段時間內都得含淚吞下去的固定支出。

<img src="/images/microsoft-capex-memory-supercycle-s2.webp" width="960" height="720" loading="lazy" decoding="async" alt="特寫的 DRAM 記憶體模組，象徵 AI 需求把記憶體現貨價格推到三倍以上">

這裡要踩個剎車。很多人把記憶體漲價當成又一次景氣循環的高點，等它像過去那樣自己跌回來。這次的根因不太一樣。TrendForce 把它講成「記憶體牆」：AI 晶片的算力兩年成長三倍，記憶體頻寬只跟上一點點，於是 AI 加速器需要的高頻寬記憶體（HBM）大口吃掉 DRAM 的晶圓產能，[排擠掉一般的伺服器與消費級記憶體](https://www.trendforce.com/insights/memory-wall)。原廠把八成以上產能轉去做高階與企業級產品，供給那一端被結構性地抽走。結果是 TrendForce 估 2026 年 DRAM 價格再漲超過七成；SK 海力士引用美銀的預估，[2026 年全球 DRAM 營收年增 51%、NAND 年增 45%，HBM 市場規模衝到 546 億美元、年增 58%](https://news.skhynix.com/2026-market-outlook-focus-on-the-hbm-led-memory-supercycle/)。這是供需失衡被設計出來的結果，不是景氣循環的自然波動。

<img src="/images/microsoft-capex-memory-supercycle-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓製造場景，象徵 HBM 排擠一般 DRAM 產能形成的記憶體牆">

帳單不會停在微軟。先看雲端這一層：記憶體占大型雲端業者 AI 資料中心支出的比重，[2026 年估計來到三成，2023 年還只有約 8%，四年翻了四倍](https://www.tomshardware.com/tech-industry/memory-will-consume-30-percent-of-hyperscaler-spending-this-year)。這代表同樣一筆 AI 預算，愈來愈大一塊被記憶體吃走，而不是拿去買更多算力。再往下看消費端：[記憶體在筆電與手機的物料清單（BOM）成本占比，已升到一到兩成](https://money.udn.com/money/story/11162/9195263)。傳導的結果很直接，華碩系統事業總經理廖逸翔已經預告，[2026 年第二季台灣 PC 售價估計要漲 25% 到 30%](https://finance.technews.tw/2026/03/23/asus-pc-pricing/)。TrendForce 同步把今年智慧型手機出貨下修到年減 7%、筆電下修 5.4%。一張帳單，從雲端一路壓到你家那台想換的筆電。

<img src="/images/microsoft-capex-memory-supercycle-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="消費者在賣場選購筆電，象徵記憶體漲價成本傳導到 PC 與手機終端">

台灣看這條新聞，最容易只讀到半邊。一種只看「記憶體台廠大利多」：[南亞科、華邦電、晶豪科報價續漲，模組廠創見、威剛、十銓、宇瞻，還有做企業級 SSD 的群聯，帳面上確實受惠](https://money.cmoney.tw/article/30203)。另一種只看「PC 品牌和 ODM 被成本壓垮、消費者要多付錢」。這兩個故事都對，但單看任一邊都會解錯題。真正要盯的是這張帳單改寫了誰的議價權：當記憶體從「配角零件」變成占 AI 預算三成的關鍵物料，掌握 HBM 與高階 DRAM 產能的人說話就大聲，站在下游組裝、只能轉嫁或自己吸收成本的人就被動。台灣同時站在這條鏈的兩端，受惠的是有記憶體與封測籌碼的那一段，受壓的是純代工組裝、對上游沒有議價權的那一段。看懂自己站在哪一段，比慶祝或哀嘆記憶體漲價更重要。

<img src="/images/microsoft-capex-memory-supercycle-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="電子製造產線與電路板組裝，象徵台灣供應鏈在記憶體循環中受惠與受壓兩面受力">

把這張帳單讀完，會得到一個和「AI 泡沫」無關的判斷。微軟願意在毛利被壓的情況下，還是把 1900 億美元砸下去、還說要[含淚吞 250 億的漲價](https://www.theregister.com/2026/04/30/microsoft_q3_2026/)，代表它賭 AI 的實際需求撐得住這個成本結構。這個賭注成不成，要看兩件事：AI 的使用量有沒有跟上這條愈墊愈高的成本曲線，以及記憶體供給什麼時候鬆。誰吃得住這張帳單，不會是因為誰的模型比較聰明，而是誰在這條鏈上卡到了別人繞不過去的位置。

<img src="/images/microsoft-capex-memory-supercycle-s3.webp" width="960" height="541" loading="lazy" decoding="async" alt="上升的成本與財務圖表，象徵記憶體漲價墊高整條 AI 供應鏈的固定支出">

## 常見問題

<p><strong>微軟 2026 年資本支出為什麼衝到 1900 億美元？</strong><br>因為它要繼續為 AI 擴建資料中心，同時記憶體與零組件價格大漲。財務長 Amy Hood 在第三季財報說明，這 1900 億裡有約 <a href="https://www.theregister.com/2026/04/30/microsoft_q3_2026/">250 億美元純粹是記憶體與晶片漲價墊上去的</a>，不是買了更多設備，而是同樣的料變更貴。</p>

<p><strong>記憶體為什麼突然漲這麼多，是一般的景氣循環嗎？</strong><br>比較像結構性供需失衡，不是單純的循環高點。AI 加速器需要的 HBM 大量吃掉 DRAM 晶圓產能，原廠又把八成以上產能轉向高階產品，供給端被抽走，<a href="https://www.trendforce.com/insights/memory-wall">TrendForce 估 2026 年 DRAM 價格還會再漲超過七成</a>。</p>

<p><strong>記憶體漲價會讓我買筆電、手機變貴嗎？</strong><br>會，而且已經在發生。記憶體占筆電與手機物料成本已升到<a href="https://money.udn.com/money/story/11162/9195263">一到兩成</a>，華碩已預告<a href="https://finance.technews.tw/2026/03/23/asus-pc-pricing/">台灣 PC 第二季售價估漲 25% 到 30%</a>。TrendForce 也把今年筆電與手機出貨量往下修。想換機的話，這波短期內不容易等到大幅降價。</p>

<p><strong>這波記憶體超級循環，台灣是受惠還是受害？</strong><br>兩者同時發生，要看你指的是哪一段。有記憶體與封測籌碼的<a href="https://money.cmoney.tw/article/30203">南亞科、華邦電、模組廠與群聯等台廠帳面受惠</a>；純做 PC 品牌與代工組裝、對上游沒有議價權的那一段則被成本壓縮。關鍵是看清自己卡在供應鏈的哪個位置。</p>
</content>
</invoke>
