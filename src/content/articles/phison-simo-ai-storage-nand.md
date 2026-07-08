---
title: "台灣兩家 NAND 控制 IC 廠搭上 AI 儲存熱：群聯、慧榮 2026 營收估翻倍跳"
slug: "phison-simo-ai-storage-nand"
description: "群聯 2026 第一季 EPS 68.8 元、年增逾 12 倍，法人估全年營收年增 223%；慧榮同季營收年增 105%、喊出創紀錄的一年。兩家 NAND 控制 IC 設計廠被 AI 儲存需求推到台前，但真正該看懂的是它們賣的東西變了。"
excerpt: "翻倍的一半是 NAND 漲價的週期順風，一半是 NAND 在 AI 推論裡的角色從『存資料』變成『參與運算』的結構轉變。分清這兩層，才知道翻倍是撿到的還是長出來的。"
publishDate: "2026-08-03T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["群聯", "慧榮", "NAND 控制晶片", "AI 儲存", "企業級 SSD", "台灣半導體"]
coverImage: "covers/phison-simo-ai-storage-nand.webp"
coverAlt: "資料中心伺服器與儲存陣列，象徵 AI 儲存需求推升 NAND 控制 IC 設計廠營收"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "群聯 2026 第一季 EPS 68.8 元、稅後純益 151.75 億元、年增 1230%，法人上修全年營收預估到 2348.45 億元、年增 223.2%；慧榮同季營收 3.421 億美元、年增 105%，兩家都翻倍跳。"
  - "翻倍分兩層：第一層是 NAND 漲價的週期順風（群聯稱 3 月零組件單日均價漲 50%、4 月再漲 20%），會隨供給鬆動回吐；第二層是 NAND 在 AI 推論裡從『存資料』變成『參與運算』的結構轉變，才是真正的護城河。"
  - "台灣不造 NAND，但慧榮是全球最大 NAND 控制晶片供應商、群聯是同格的另一個世界級玩家；這波機會不是『多接漲價的單』，是趁需求爆發把定位從賣 IC 升級成賣 AI 儲存方案。"
references:
  - title: "群聯財報／首季 EPS 高達 68.8 元 獲利年增逾 12 倍"
    url: "https://money.udn.com/money/story/11074/9490868"
    publisher: "經濟日報"
  - title: "群聯營收／3 月 183 億元創高 AI 儲存需求升溫、看好高階客製化市場續強"
    url: "https://money.udn.com/money/story/11074/9429405"
    publisher: "經濟日報"
  - title: "《半導體》群聯 EPS 上看 304 元！AI 儲存＋NAND 漲價點火跳空漲停"
    url: "https://www.chinatimes.com/realtimenews/20260511001539-260410"
    publisher: "時報資訊"
  - title: "群聯(8299) EPS 68.8 元、毛利率 61.3% 破新高！NAND 為何這麼搶手？"
    url: "https://www.bnext.com.tw/article/90889/phison-q1-2026"
    publisher: "數位時代"
  - title: "Silicon Motion Eyes Record 2026 After Strong Quarter"
    url: "https://www.theglobeandmail.com/investing/markets/stocks/SIMO/pressreleases/98371/silicon-motion-eyes-record-2026-after-strong-quarter/"
    publisher: "The Globe and Mail"
  - title: "Silicon Motion (SIMO) Q1 2026 Earnings Transcript"
    url: "https://www.fool.com/earnings/call-transcripts/2026/04/30/silicon-motion-simo-q1-2026-earnings-transcript/"
    publisher: "The Motley Fool"
originalContribution: "本文把群聯與慧榮 2026 翻倍的營收拆成『週期性 NAND 漲價』與『結構性角色轉變』兩層，對照群聯 aiDAPTIV 與慧榮 MonTitan 兩條不同的 AI 儲存路徑，並據此評估台灣在 NAND 控制 IC 這一格的卡位與風險。"
---

群聯（Phison）與慧榮（Silicon Motion）2026 年營收估翻倍跳，但真正該看懂的不是漲幅，是這兩家公司「賣的東西」變了。它們原本是躲在每一顆 SSD 裡的控制晶片供應商，現在被 AI 資料中心的儲存需求推到台前。追因下去會發現，這波成長一半是 NAND 快閃記憶體漲價的週期順風，一半是 NAND 在 AI 推論裡的角色從「存資料」變成「參與運算」的結構轉變。分清這兩層，才知道翻倍是撿到的，還是長出來的。

<img src="/images/phison-simo-ai-storage-nand-s0.webp" width="960" height="640" loading="lazy" decoding="async" alt="電腦記憶體晶片特寫，象徵 AI 儲存熱把控制 IC 設計廠推到台前">

先把數字攤開。群聯 2026 第一季每股稅後純益（EPS）68.8 元、稅後純益 151.75 億元，[年增 1230%](https://money.udn.com/money/story/11074/9490868)；單季營收 409.67 億元、年增 196%，毛利率衝到 61.3%。3 月單月營收 183.17 億元、年增 221%，[PCIe SSD 控制晶片出貨量年增 25%](https://money.udn.com/money/story/11074/9429405)。法人更把全年營收預估上修到 2348.45 億元、[年增 223.2%，EPS 上看 304.67 元](https://www.chinatimes.com/realtimenews/20260511001539-260410)。慧榮同一季營收 3.421 億美元、年增 105%，連兩季創高，[管理層直接把 2026 定調成「創紀錄的一年」](https://www.fool.com/earnings/call-transcripts/2026/04/30/silicon-motion-simo-q1-2026-earnings-transcript/)。兩家方向一致：翻倍。

<img src="/images/phison-simo-ai-storage-nand-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="群聯與慧榮 2026 財報營收與獲利大幅成長示意">

翻倍的第一層原因，是 NAND 在漲價。NAND 供給從 2025 年第四季轉緊，多家原廠取消既有報價、重評出貨時程，[2026 年合約價估維持雙位數成長](https://www.chinatimes.com/realtimenews/20260511001539-260410)。群聯法說會講得更白：[3 月有零組件單日平均售價漲 50%，4 月又漲 20%](https://www.bnext.com.tw/article/90889/phison-q1-2026)。控制 IC 設計廠自己不造 NAND，但手上有先期備妥的低價庫存，漲價這段的價差直接墊高毛利，群聯毛利率因此從一季前的四成初跳到六成。這是順風。但順風也提醒一件事：週期會轉，靠漲價撐起來的獲利，等供給一鬆就會回吐。這一層不是護城河。

<img src="/images/phison-simo-ai-storage-nand-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="NAND 快閃記憶體晶片，象徵供給吃緊與合約價上漲">

真正值得盯的是第二層：NAND 在 AI 推論裡的角色正在改變，從被動存資料，變成參與運算的一環。群聯推 aiDAPTIV，把 NAND 當成 AI 的 KV cache（推論時暫存上下文用的記憶體），[讓 SSD 從儲存裝置變成推論加速引擎，號稱能替用戶省下超過七成的 token 費用](https://money.udn.com/money/story/11074/9429405)。創辦人潘健成把公司定位改寫成「PHISON 3.0」，[從 NAND 控制晶片廠轉成 AI 儲存基礎架構與邊緣 AI 運算平台供應商](https://www.bnext.com.tw/article/90889/phison-q1-2026)。慧榮走的是企業級這條：MonTitan 企業級 SSD 控制晶片，估 2026 年底佔營收 5% 到 10%，加上賣給某家 AI GPU 大廠的開機碟（boot drive），[管理層估這塊 2026 年約貢獻 5000 萬美元](https://www.theglobeandmail.com/investing/markets/stocks/SIMO/pressreleases/98371/silicon-motion-eyes-record-2026-after-strong-quarter/)。兩家路徑不同，但講的是同一件事：控制 IC 廠賣的不再只是那顆 IC，是整套讓 NAND 在 AI 場景跑得動的方案。這一層才是解對題。

<img src="/images/phison-simo-ai-storage-nand-s3.webp" width="960" height="720" loading="lazy" decoding="async" alt="企業級 SSD 與控制晶片電路板，象徵 NAND 成為 AI 推論加速引擎">

這裡要踩個剎車。翻倍的估值裡，到底多少是漲價的一次性、多少是結構性的長線，現在還分不乾淨。最明顯的訊號，是法人一路在追著上修：光 5 月，本土法人就把群聯全年營收預估拉到 2348.45 億元、年增 223.2%，[EPS 上看 304.67 元](https://www.chinatimes.com/realtimenews/20260511001539-260410)，比幾個月前的估值又高一大截。半年內估值被反覆改寫，不是市場對公司特別有信心，是市場自己也算不準 NAND 這波漲價會走多久。企業級 SSD 專案（MonTitan、aiDAPTIV）才剛放量，佔比還是個位數到一成上下，短期真正撐營收的仍是漲價那一塊。判斷這波成長的品質，要看的不是單季 EPS 幾元，是企業級與 AI 專用產品的佔比爬得多快。那才是漲價退潮後還留得下來的部分。

<img src="/images/phison-simo-ai-storage-nand-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="金融市場波動與風險分析示意，象徵營收翻倍中週期性與結構性難以分辨">

最後拉回台灣。這條產業鏈有兩格：一格是造 NAND 的原廠（三星、美光、SK 海力士、鎧俠），台灣沒有玩家；另一格是 NAND 控制 IC 與韌體，慧榮是全球最大的 NAND 控制晶片供應商，群聯是同一格的另一個世界級玩家。台灣的卡位不在「造記憶體」，在「讓記憶體變好用」的控制晶片、韌體與系統整合。這波 AI 儲存熱把這一格從幕後推到台前，是機會，但機會的內容不是「多接漲價的單」，是趁需求爆發時，把定位從賣 IC 升級成賣 AI 儲存方案。能不能接住，取決於有沒有把自己在這條鏈上的位置定義清楚，把控制晶片以外的軟體與平台能力先長出來。看懂賣的東西變了，比記住營收翻倍這個數字重要。

<img src="/images/phison-simo-ai-storage-nand-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣半導體晶片製造，象徵在 NAND 控制晶片與韌體的世界級卡位">

<h2>常見問題</h2>

<p><strong>群聯和慧榮 2026 年營收真的會翻倍嗎？</strong><br>群聯第一季營收已年增 196%、法人估全年年增 223%（達 2348.45 億元），<a href="https://www.chinatimes.com/realtimenews/20260511001539-260410">已遠超過翻倍</a>；慧榮第一季營收年增 105%、<a href="https://www.fool.com/earnings/call-transcripts/2026/04/30/silicon-motion-simo-q1-2026-earnings-transcript/">管理層喊出創紀錄的一年</a>。兩家都在翻倍量級，但這是市況強勁下的預估，不是保證，NAND 價格若反轉會直接影響下修。</p>

<p><strong>為什麼 NAND 控制 IC 廠會賺這麼多，它們又不造記憶體？</strong><br>因為 NAND 供給吃緊、價格大漲，而控制 IC 廠手上有先期備妥的低價庫存，價差直接墊高毛利，群聯第一季毛利率因此衝到 <a href="https://money.udn.com/money/story/11074/9490868">61.3%</a>。另一部分來自 AI 資料中心對高容量、高效能 SSD 的需求爆發，把控制晶片的出貨量與單價一起拉高。</p>

<p><strong>群聯的 aiDAPTIV 和慧榮的 MonTitan 是什麼？</strong><br>aiDAPTIV 是群聯把 NAND 當成 AI 推論的 KV cache 使用，<a href="https://money.udn.com/money/story/11074/9429405">讓 SSD 變成推論加速引擎、替用戶省下逾七成 token 費用</a>。MonTitan 是慧榮的企業級 SSD 控制晶片，<a href="https://www.theglobeandmail.com/investing/markets/stocks/SIMO/pressreleases/98371/silicon-motion-eyes-record-2026-after-strong-quarter/">估 2026 年底佔慧榮營收 5% 到 10%</a>。兩者都是把控制晶片從單純儲存升級成 AI 儲存方案。</p>

<p><strong>這波成長是一次性還是能長久？</strong><br>要拆兩層看。NAND 漲價是週期性的，供給鬆動就會回吐；AI 專用的企業級 SSD 與 aiDAPTIV 這類產品才是結構性的長線。但後者目前佔比還只在個位數到一成，所以現階段撐營收的主要仍是漲價，判斷品質要盯企業級與 AI 產品佔比爬升的速度。</p>
