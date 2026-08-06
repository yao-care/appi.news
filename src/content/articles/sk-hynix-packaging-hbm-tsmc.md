---
title: "SK 海力士砸 19 兆韓元蓋封裝廠、再綁台積電做 HBM4：記憶體龍頭把戰線拉到封裝"
slug: "sk-hynix-packaging-hbm-tsmc"
description: "SK 海力士宣布投 19 兆韓元（約 130 億美元）在南韓清州蓋號稱全球最大的 HBM 先進封裝廠 P&T7，同時跟台積電簽備忘錄把 HBM4 綁上台積電邏輯製程與 CoWoS。兩件事是同一題：記憶體龍頭把競爭戰線從晶圓拉到封裝。台灣要讀的是台積電 CoWoS 這道咽喉正在鬆動。"
excerpt: "HBM 龍頭不缺產能技術，為什麼還要砸 130 億美元蓋封裝廠、又跑去綁台積電？因為 AI 記憶體真正的瓶頸不在 DRAM 晶圓，在把晶粒堆疊、封裝、測試、控熱成可交付模組的後段。"
publishDate: "2026-07-13T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags:
  - "先進封裝"
  - "半導體"
  - "台積電"
coverImage: "covers/sk-hynix-packaging-hbm-tsmc.webp"
coverAlt: "象徵 SK 海力士把資本壓上 HBM 先進封裝、將競爭戰線從晶圓拉到後段封測的示意"
coverImageCredit: "Photo by Marta Branco on Pexels"
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
  - "SK 海力士要投 19 兆韓元（約 130 億美元）在南韓清州蓋 P&T7 先進封裝廠，4 月動工、2027 年底完工、2028 年全產，號稱全球最大的 HBM 封裝設施，是韓國半導體後段製程史上數一數二的單筆投入。"
  - "同一時間 SK 海力士跟台積電簽備忘錄，HBM4 的基礎裸晶（base die）改用台積電邏輯製程、並與台積電 CoWoS 封裝整合；蓋自家封裝廠與綁台積電封裝是同一題的兩手，都在補後段。"
  - "台積電 CoWoS 產能吃緊，已逼得 SK 海力士去測 Intel 的 EMIB 封裝，Google、Meta 也在採用；台積電這道封裝咽喉是台灣的位置，也是正在被撬動的位置。"
risksAndLimits:
  - "SK海力士測試Intel EMIB封裝屬TrendForce報導的傳聞，尚未證實會實際採用或量產"
  - "P&T7廠2027年底才完工、2028年全產，目前後段封裝產能與效益仍未實現"
  - "HBM市場年複合33%成長率為產業預估數字，非已發生的實際結果"
  - "SK海力士與台積電合作細節多來自雙方新聞稿，實際良率與量產進度尚待第三方查證"
references:
  - title: "SK Hynix to build $13 bn new advanced chip packaging plant to bolster HBM lead"
    url: "https://www.kedglobal.com/korean-chipmakers/newsView/ked202601130007"
    publisher: "KED Global"
  - title: "SK hynix Partners With TSMC to Strengthen HBM Technological Leadership"
    url: "https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/"
    publisher: "SK hynix Newsroom"
  - title: "SK hynix Reportedly Tests Intel EMIB 2.5D Packaging With HBM Amid TSMC CoWoS Tightness"
    url: "https://www.trendforce.com/news/2026/05/11/news-sk-hynix-reportedly-tests-intel-emib-2-5d-packaging-with-hbm-amid-tsmc-cowos-tightness/"
    publisher: "TrendForce"
  - title: "SK Hynix invests 19 trillion won: Advanced packaging becomes the bottleneck of the AI memory boom"
    url: "https://www.igorslab.de/en/sk-hynix-invests-19-trillion-won-advanced-packaging-becomes-the-bottleneck-of-the-ai-memory-boom/"
    publisher: "igor'sLAB"
originalContribution: "本文把 SK 海力士『自蓋 P&T7 封裝廠』與『綁台積電 CoWoS 做 HBM4』兩則看似獨立的新聞，用『解對題』框架合成同一件事：記憶體龍頭把資本壓在後段封裝而非前段晶圓，因為 AI 記憶體的瓶頸在封裝不在晶圓。並從台積電 CoWoS 吃緊逼出 Intel EMIB 替代這條張力，推導台灣封測在 HBM 後段鏈的位置與被撬動的風險。"
---

SK 海力士這半年做的兩件大事，其實是同一題。一是要砸 [19 兆韓元（約 130 億美元）在南韓清州蓋一座號稱全球最大的 HBM 先進封裝廠](https://www.kedglobal.com/korean-chipmakers/newsView/ked202601130007)，二是跟[台積電簽備忘錄，把下一代 HBM4 綁上台積電的邏輯製程與封裝技術](https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/)。一個是自己蓋廠、一個是找外援，方向卻一致：這家記憶體龍頭把競爭的戰線，從「晶圓做不做得出來」拉到「封裝堆不堆得出量」。

它不缺 DRAM 技術，也不缺先進製程，缺的是把一堆晶粒疊起來、封好、測完、還壓得住熱的後段產能。這才是這兩則新聞真正在講的事。

## 先把「封裝」為什麼是瓶頸講清楚

HBM（高頻寬記憶體）不是一顆晶片，是好幾顆 DRAM 晶粒垂直疊起來、再跟 GPU 或 AI 加速器透過特製的中介層接在一起的模組。做出晶圓只是第一步，真正難的是把它們[堆疊、鍵合、測試，變成一個能交付、能通過品質驗證、還能控熱的模組](https://www.igorslab.de/en/sk-hynix-invests-19-trillion-won-advanced-packaging-becomes-the-bottleneck-of-the-ai-memory-boom/)。這一段需要的是鍵合、測試、中介層、基板、散熱、良率控制，跟前段的曝光蝕刻是兩套本事。

igorslab 那篇分析講得直接：如果封裝產能不夠，前段晶圓開好開滿也幫不上忙。這句話是理解這波投資的鑰匙。前段做得再多，卡在後段封不出量，客戶手上還是拿不到貨。

<img src="/images/sk-hynix-packaging-hbm-tsmc-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="多顆記憶體晶粒垂直堆疊封裝的近距離示意">

## 為什麼砸 130 億美元在後段，不是前段

先問一個問題：SK 海力士已經是 HBM 龍頭、供貨給 Nvidia，它要花這筆錢，為什麼選蓋封裝廠，而不是再開一座 DRAM 晶圓廠？

答案就在上一段。它診斷出自己的瓶頸不在前段，在後段。這座叫 P&T7（Package and Test 7）的新廠，蓋在清州科技谷園區，[4 月動工、2027 年底完工、2028 年進入全產](https://www.kedglobal.com/korean-chipmakers/newsView/ked202601130007)，專門負責前段晶圓做完之後的最終組裝與品質驗證，還刻意蓋在自家 M15X DRAM 廠旁邊，把前段跟後段串成一條線。SK 海力士自己說得很白：先進封裝在物流、運作穩定度與速度上，必須跟前段緊密整合。

這是把資本壓在對的地方。全球 HBM 市場被估到[2030 年前以年複合 33% 的速度成長](https://www.kedglobal.com/korean-chipmakers/newsView/ked202601130007)，需求端沒有問題，能不能吃下這波，賭的是後段封得出多少量。花 130 億美元蓋一座封裝廠，是這家公司對「瓶頸在哪」給出的答案。

<img src="/images/sk-hynix-packaging-hbm-tsmc-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體後段封裝測試無塵室產線示意">

## 綁台積電，補的是同一段

自己蓋封裝廠是一手，綁台積電是另一手，兩手補的是同一段。

SK 海力士跟台積電簽的備忘錄，重點有兩個。一是 [HBM4 的基礎裸晶（base die）改用台積電的先進邏輯製程來做](https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/)，好在有限的空間裡塞進更多功能、做出客製化的 HBM。二是把 SK 海力士的 HBM 跟台積電的 CoWoS 封裝整合，CoWoS 就是台積電那套把 GPU 邏輯晶片跟 HBM 封在同一片基板上的 2.5D 封裝技術。HBM4 預計 2026 年開始量產。

SK 海力士 AI 基礎設施負責人 Justin Kim 講這段合作時說，期待跟台積電的合作能加速他們跟客戶的開放協作、做出業界效能最好的 HBM4。翻成白話：記憶體廠、代工廠、晶片設計三方要綁在一起，HBM 才做得出來。這也印證了前面的判斷，HBM4 的護城河不在 DRAM 晶粒本身，在封裝這一段，而這段有一塊掌握在台積電手上。

<img src="/images/sk-hynix-packaging-hbm-tsmc-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="晶圓上的邏輯晶片與 2.5D 封裝整合示意">

## 咽喉在 CoWoS，而咽喉正在鬆動

這裡要踩個剎車。綁台積電不等於高枕無憂，反而暴露了整條鏈最脆弱的一點：台積電的 CoWoS 產能就是這麼緊。

緊到什麼程度？緊到 SK 海力士已經[跑去測試 Intel 的 EMIB 2.5D 封裝技術](https://www.trendforce.com/news/2026/05/11/news-sk-hynix-reportedly-tests-intel-emib-2-5d-packaging-with-hbm-amid-tsmc-cowos-tightness/)。TrendForce 的報導講得清楚，台積電 CoWoS 在 AI 需求暴衝下供給嚴重吃緊，逼得大廠去找替代方案；而且不只 SK 海力士，Google、Meta 也傳出要在下一代 AI 加速器採用 EMIB。這代表封裝產能已經是限制 AI 晶片供貨的真實瓶頸，也代表台積電在先進封裝的獨佔，第一次出現了實質的替代壓力。

所以這則新聞可以這樣讀：SK 海力士一邊綁台積電拿最好的 CoWoS，一邊自己蓋 P&T7、還去測 Intel EMIB。它不是不信任台積電，是不敢把整條後段命脈押在一個吃緊的咽喉上。封裝從幕後的成本項，變成了兵家必爭的戰場。

<img src="/images/sk-hynix-packaging-hbm-tsmc-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體產能吃緊與供應鏈瓶頸示意">

## 台灣該從這條戰線讀出什麼

台灣的位置，就在那道正在鬆動的咽喉上。

台積電的 CoWoS 是這條 HBM 鏈最關鍵的一段，也是台灣目前最強的卡位。但這裡有個容易看歪的地方：以為 CoWoS 吃緊等於台積電穩贏、訂單接不完就好。真實情況是，吃緊本身正在把客戶推向 Intel EMIB 這類替代方案，Google、Meta 已經在採用，替代路徑正在長出來。獨佔靠的是別人做不出來，一旦替代方案成熟，議價權會鬆。

另一個容易漏掉的是後段封測。HBM 要疊、要測、要控熱，這些後段活不是只有台積電在做，日月光、京元電這些台灣封測與測試廠本來就在半導體後段鏈上有位置。當整個產業把資源往先進封裝與測試搬，這一段的重要性只會往上走。台灣要讀的不是「SK 海力士又砸了多少錢」這個數字，是這波錢往後段封裝流，台灣在這條鏈上到底守著哪幾格、哪幾格正在被別人補上。看懂戰線移到哪裡，比記住 19 兆這個數字重要。

<img src="/images/sk-hynix-packaging-hbm-tsmc-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣半導體封測與 IC 產業示意">

<h2>常見問題</h2>

<p><strong>SK 海力士花 19 兆韓元蓋的 P&T7 到底是什麼廠？</strong><br>是一座專做 HBM 先進封裝的後段廠，不是做 DRAM 晶圓的前段廠。它負責把前段做好的晶粒堆疊、封裝、測試成可交付的 HBM 模組，蓋在南韓清州、<a href="https://www.kedglobal.com/korean-chipmakers/newsView/ked202601130007">4 月動工、2027 年底完工、2028 年全產</a>，號稱全球最大的 HBM 封裝設施。</p>

<p><strong>為什麼 AI 記憶體的瓶頸是封裝，不是晶圓產能？</strong><br>因為 HBM 是好幾顆 DRAM 晶粒疊起來、再跟 GPU 接在一起的模組，做出晶圓只是第一步。<a href="https://www.igorslab.de/en/sk-hynix-invests-19-trillion-won-advanced-packaging-becomes-the-bottleneck-of-the-ai-memory-boom/">如果封裝、堆疊、測試、控熱的後段產能不夠，前段晶圓開好開滿也幫不上忙</a>，客戶拿到的還是缺貨。</p>

<p><strong>SK 海力士跟台積電合作 HBM4 是做什麼？</strong><br>兩家簽了備忘錄，<a href="https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/">HBM4 的基礎裸晶改用台積電的邏輯製程來做，並跟台積電的 CoWoS 封裝整合</a>。等於記憶體廠、代工廠、晶片設計三方綁在一起，HBM4 預計 2026 年量產。</p>

<p><strong>台積電 CoWoS 產能吃緊對台灣是好是壞？</strong><br>短期是訂單滿載的好事，但吃緊也在把客戶推向替代方案。SK 海力士已經<a href="https://www.trendforce.com/news/2026/05/11/news-sk-hynix-reportedly-tests-intel-emib-2-5d-packaging-with-hbm-amid-tsmc-cowos-tightness/">去測 Intel 的 EMIB 封裝，Google、Meta 也在採用</a>，代表台積電在先進封裝的獨佔開始有實質競爭，台灣得看緊自己在後段封測的位置有沒有被補上。</p>
