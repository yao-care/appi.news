---
title: "股票融資是什麼？台股一週狂加碼透露的槓桿風險"
slug: "stock-margin-risk-guide"
description: "看懂股票融資的自備款、130%維持率、2個營業日追繳與166%解除追繳條件，並用證交所與櫃買中心週資料拆解台股一週融資增加近392.6億元，最後提供券商帳戶查核步驟。"
publishDate: "2026-08-21T14:06:24.183Z"
category: "finance"
subcategory: "investing-literacy"
tags: ["投資理財", "資本市場", "金管會"]
author: "appi-editorial"
contentType: "guide"
sourceType: "editorial"
status: "published"
disclaimerType: "financial"
disclosure: "本文以 AI 輔助起草，經人工逐條查證與編輯校對後刊出。"
coverImage: "covers/leveraged-etf-dynamic-rebalance-checklist.webp"
coverAlt: "電子股市看板密集顯示紅綠色價格數值，象徵股市槓桿與價格波動"
coverImageCredit: "Photo by Pixabay on Pexels"
highlights:
  - "7月31日至8月7日，上市與櫃買市場融資金額合計增加392.58億元"
  - "融資是以自備款加上證券商借款買股，整戶擔保維持率低於130%會觸發追繳"
  - "讀者可從券商信用交易庫存查看融資金額、維持率、追繳紀錄與補繳期限"
risksAndLimits:
  - "7月31日至8月7日是歷史週資料，不能代表8月21日的即時融資水位"
  - "130%是法定追繳門檻，個股融資成數與券商計算仍可能依公告調整"
  - "PTT討論反映網友觀察，文中市場數據改以交易所與央行資料查核"
references:
  - title: "股市融資衝破8000億創高：央行槓桿風險可控仍須留意"
    url: "https://www.ptt.cc/bbs/Stock/M.1784852377.A.602.html"
    publisher: "PTT Stock板"
  - title: "股市融資衝破8000億創高　央行：槓桿風險可控仍須留意"
    url: "https://www.cna.com.tw/news/afe/202607230333.aspx"
    publisher: "中央社"
  - title: "融資融券餘額：2026年8月7日信用交易統計"
    url: "https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&date=20260807"
    publisher: "臺灣證券交易所"
  - title: "融資融券餘額：2026年7月31日信用交易統計"
    url: "https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&date=20260731"
    publisher: "臺灣證券交易所"
  - title: "櫃買市場現況：2026年8月7日融資融券餘額"
    url: "https://www.moneydj.com/KMDJ/News/NewsViewer.aspx?a=60455e07-4da5-4aa7-9c9c-457fb48f1539"
    publisher: "MoneyDJ理財網"
  - title: "證交所投資人知識網：融資融券投資Q&A"
    url: "https://investoredu.twse.com.tw/pages/TWSE_InvestmentQA.aspx?ID=4"
    publisher: "臺灣證券交易所"
  - title: "你應知的信用交易"
    url: "https://shl.twse.com.tw/newsArticle/library/list/4028e4f68c5cc01e018c5cc658b30001"
    publisher: "臺灣證券交易所宅在家學習網"
  - title: "調整成數"
    url: "https://www.tpex.org.tw/zh-tw/mainboard/trading/margin-trading/adjusting.html"
    publisher: "證券櫃檯買賣中心"
  - title: "證券商辦理有價證券買賣融資融券業務操作辦法第54條"
    url: "https://twse-regulation.twse.com.tw/TW/law/DOC01.aspx?FLCODE=FL007121&FLNO=54"
    publisher: "臺灣證券交易所法規分享知識庫"
topics: ["personal-finance-basics"]
readingTime: 5
---

股票融資是投資人先付自備款，再向證券商借錢買股。融資餘額短期快速增加，代表市場槓桿部位變大，股價回落時容易同時出現追繳與被迫賣出，投資人應先看維持率與現金調度能力；若同時持有多檔股票或ETF，可先用[資產集中度檢查表](/articles/portfolio-concentration-risk-checklist/)盤點重複曝險。

<img src="/images/taishin-richart-deposit-rate-comparison-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="眼鏡放在財務文件上，象徵閱讀融資規則與投資資料（示意圖）" title="查融資風險時，先把交易規則與自己的部位資料看完整（示意圖）">

PTT Stock板7月24日一篇轉貼股市融資新聞的[相關討論串](https://www.ptt.cc/bbs/Stock/M.1784852377.A.602.html)引發熱議，留言從8000億元是否含上市與上櫃，到房貸、信貸等槓桿來源都有討論。把這種現象簡化成「連銀行都進場」，需要先拆開資金來源與銀行買股兩件事。央行說明，整體融資資金主要來自銀行體系，這指的是資金供應鏈；[中央社報導](https://www.cna.com.tw/news/afe/202607230333.aspx)也指出，6月底股市融資餘額為8035億元，創當時新高。銀行資金進入融資體系，不能直接解讀成銀行拿自有資金買股票。

<img src="/images/leveraged-etf-dynamic-rebalance-checklist-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="桌面上擺放投資報表、筆記本、計算機與筆電，象徵檢查槓桿部位（示意圖）" title="檢查融資部位時，要把借款金額與股價波動放在同一張表上（示意圖）">

## 一週增加近392.6億元，先看餘額再看漲幅

[證交所7月31日信用交易統計](https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&date=20260731)與[8月7日統計](https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&date=20260807)顯示，上市市場融資金額由5074.63億元升至5376.65億元，增加302.02億元；櫃買市場則由1661.58億元升至1752.14億元，增加90.56億元。[櫃買市場週資料](https://www.moneydj.com/KMDJ/News/NewsViewer.aspx?a=60455e07-4da5-4aa7-9c9c-457fb48f1539)合計後，兩市場一週增加約392.58億元。這是槓桿水位上升的警訊，不能單獨當成股價必跌的預測。

<img src="/images/stock-margin-risk-guide/weekly-financing.svg" width="960" height="600" loading="lazy" decoding="async" alt="長條圖比較2026年7月31日至8月7日上市與櫃買市場融資金額增加，上市增加302.02億元，櫃買增加90.56億元，合計392.58億元" title="7月31日至8月7日兩市場融資金額合計增加392.58億元（資料圖）">

## 股票融資怎麼運作？

融資買股時，投資人以自備款取得股票，證券商提供借款並把股票列為擔保品。[證交所投資人教育資料](https://shl.twse.com.tw/newsArticle/library/list/4028e4f68c5cc01e018c5cc658b30001)列出的最高融資比率是60%，等於買進100元股票時，通常至少準備40元自備款；個股若依[櫃買中心的調整成數規則](https://www.tpex.org.tw/zh-tw/mainboard/trading/margin-trading/adjusting.html)調降融資比率，自備款就會增加。股價下跌時，擔保品市值下降，借款本金仍在，維持率便會跟著下滑。

這種交易和[槓桿型ETF的單日倍數機制](/articles/leveraged-etf-dynamic-rebalance-checklist/)不同，融資的核心風險在於證券商借款與擔保品價值之間的比例。投資人同時使用信貸、股票質押或其他借款時，還要把每筆債務的還款日與利息列入現金流。

<img src="/images/south-korea-margin-call-crash-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="電子股市看板密集顯示紅綠色價格數值，呈現市場波動（示意圖）" title="股價波動會直接改變融資擔保品的市值（示意圖）">

## 低於130%後會發生什麼？

擔保維持率公式是「擔保品與抵繳品市值，除以融資金額與融券標的市值，再乘以100%」。依[證交所操作辦法第54條](https://twse-regulation.twse.com.tw/TW/law/DOC01.aspx?FLCODE=FL007121&FLNO=54)，整戶擔保維持率低於130%時，券商應通知投資人，從通知送達日起2個營業日內補繳融資自備款或融券保證金差額。

未在期限內補足時，券商可依規定處分擔保品，市場俗稱「斷頭」。[證交所投資人問答](https://investoredu.twse.com.tw/pages/TWSE_InvestmentQA.aspx?ID=4)說明，若追繳紀錄尚未清除，投資人須繳清追繳款項，或讓整戶擔保維持率回升至166%以上，才會取消追繳紀錄。130%是追繳起點，166%是解除追繳紀錄的條件，兩個門檻用途不同。

<img src="/images/south-korea-margin-call-crash-s3.webp" width="960" height="540" loading="lazy" decoding="async" alt="手持手機查看股票行情與資產數值，象徵即時監看投資部位（示意圖）" title="追繳期間要同步看維持率、補繳期限與可動用現金（示意圖）">

## 3步查自己的融資水位

1. 登入券商App或網頁，進入「信用交易」「融資融券庫存」或相近頁面，記下每筆融資金額、擔保品市值、維持率、追繳紀錄與補繳期限。
2. 先用券商顯示的維持率判斷距離130%與166%有多遠，再把信貸、質押與生活預備金放進同一張現金流表。
3. 以主要持股下跌的情境重跑試算，確認補繳資金來源與還款期限。證交所提供的是市場融資餘額與信用交易規則，個人帳戶維持率仍要以券商信用帳戶資料為準。

<img src="/images/taishin-richart-deposit-rate-comparison-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="黑色計算機顯示數值，象徵試算融資維持率與補繳金額（示意圖）" title="把維持率與可動用現金一起試算，才能看見部位能否撐過下跌（示意圖）">

融資餘額上升可以反映市場承擔的槓桿增加，但它無法回答個別投資人的斷頭價格，也無法取代帳戶維持率。看到漲幅時，先確認借了多少、維持率剩多少、追繳時能否在2個營業日內補足，這三項資料比追著熱門股加碼更直接。

<img src="/images/taiwan-central-bank-september-rate-hike-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="桌上攤開記帳本與財務表格，象徵整理借款、維持率與現金流（示意圖）" title="把借款、維持率與現金流列在同一張表，才看得出槓桿能否承受波動（示意圖）">

<h2>常見問題</h2>

<p><strong>股票融資維持率低於130%就會立刻斷頭嗎？</strong><br>低於130%會觸發券商通知追繳，投資人通常有通知送達日起2個營業日補繳差額的期限。逾期未補足時，券商才依規定處分擔保品。</p>

<p><strong>融資餘額越高，台股就一定會下跌嗎？</strong><br>不一定。融資餘額是市場槓桿水位的總量指標，能提示下跌時的追繳賣壓，但不能單獨預測指數方向，個別帳戶仍要看持股與維持率。</p>

<p><strong>我要去哪裡查自己的融資維持率？</strong><br>登入開戶券商的App或網頁，從信用交易庫存查看個人融資金額、擔保品市值、維持率與追繳通知。證交所公開查詢頁主要提供市場融資融券餘額與規則，個人帳戶數值以券商資料為準。</p>
