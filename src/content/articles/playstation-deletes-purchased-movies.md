---
title: "PlayStation 刪掉 551 部你「買下」的電影：數位購買鍵賣的從來不是所有權"
slug: "playstation-deletes-purchased-movies"
description: "Sony 通知歐洲與英國用戶，9 月 1 日起 551 部已購電影從 PS5 圖書館下架、不退款，因為 StudioCanal 授權到期。這不是意外，是數位商店「購買」按鈕的合約設計本來就允許的結果。從追因、前例到台灣消費者能怎麼自保，一次講清楚。"
excerpt: "你在數位商店按下的「購買」，買到的是一份可撤銷的授權，不是所有權。Sony 這次刪片把這件事攤在陽光下：問題不在哪家平台比較壞，在合約結構把上游授權風險轉嫁給了你。"
publishDate: "2026-07-16T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["數位所有權", "PlayStation", "數位內容授權", "消費者保護", "數位商店"]
coverImage: "covers/playstation-deletes-purchased-movies.webp"
coverAlt: "發光的數位影片圖書館介面，象徵已購電影可能隨時從雲端消失"
coverImageCredit: "Photo by Thibault Penin on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Sony 9 月 1 日起把 551 部已購電影與影集從英國、歐洲用戶的 PS5 圖書館刪掉、不退款，肇因是 StudioCanal 授權到期；美國帳號不受影響。"
  - "根因不是平台變壞，是 PSN 使用條款第 10 條早就寫明「購買」不代表所有權、授權可撤銷；上游授權鏈一斷，風險整包轉嫁給付過錢的消費者。"
  - "加州 AB 2426 只要求商店揭露「你買的是授權」，解的是知情問題不是救濟問題；台灣對網路連線遊戲有 30 天預告與退費規範，但買斷型數位電影幾乎沒對應保護，真要保命得靠實體或無 DRM 備份。"
references:
  - title: "PlayStation Is Deleting Terminator 2 And 550 Other Movies People Paid For"
    url: "https://kotaku.com/playstation-store-movies-digital-studio-canal-terminator-2000711013"
    publisher: "Kotaku"
  - title: "PlayStation Store Deleting 551 Digital Purchases, Offers No Refunds"
    url: "https://gamerant.com/playstation-store-deletes-purchases-no-refunds/"
    publisher: "Game Rant"
  - title: "Sony's attempted removal of \"purchased\" content"
    url: "https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content"
    publisher: "Consumer Rights Wiki"
  - title: "AB 2426: New California Law Requires Clear Licensing Disclosures for Digital Goods"
    url: "https://www.gtlaw.com/en/insights/2024/12/ab-2426-new-california-law-requires-clear-licensing-disclosures-for-digital-goods"
    publisher: "Greenberg Traurig LLP"
  - title: "網路購物及線上遊戲問題（消費者保護）"
    url: "https://cpc.ey.gov.tw/Page/5C73E80D45D176F0"
    publisher: "行政院消費者保護會"
originalContribution: "本文把 Sony 三次下架事件（2022 德國奧地利、2023 Discovery 因抗議反轉但只保 30 個月、2026 這次 551 部）串成一條時間線，以『誘因結構決定信任邊界』與『解對題 vs 解錯題』兩個框架拆解：指出加州 AB 2426 的揭露義務只解知情、不解救濟，並對照台灣網路連線遊戲定型化契約的 30 天預告退費機制，替買斷型數位內容的保護缺口定位，最後給台灣消費者可執行的自保步驟。"
---

先把結論講完。你在數位商店按下的那顆「購買」鍵，買到的從來不是這部電影的所有權，是一份隨時可以被收回的授權。Sony 通知英國與歐洲用戶，9 月 1 日起把 [551 部已經付過錢的電影與影集從 PS5 圖書館直接刪除、不退款也不補償](https://kotaku.com/playstation-store-movies-digital-studio-canal-terminator-2000711013)，原因是跟片商 StudioCanal 的授權到期。這件事會發生，不是哪個環節出包，是數位商店這門生意的合約結構本來就允許。要追的因不是「Sony 怎麼可以這樣」，是「為什麼你按了購買，卻沒買到能守住的東西」。

<img src="/covers/playstation-deletes-purchased-movies.webp" width="1200" height="801" loading="lazy" decoding="async" alt="發光的數位影片圖書館介面，象徵已購電影可能隨時從雲端消失">

## 先看清楚發生了什麼事

受影響的名單不是冷門片。[《魔鬼終結者 2》、《魔鬼總動員》、《BJ 單身日記》、《羊男的迷宮》、《第一滴血》系列跟《帕丁頓熊 2》都在裡面](https://gamerant.com/playstation-store-deletes-purchases-no-refunds/)，加上《凡爾賽》這類影集，總共 551 部。關鍵在於它不是只從商店貨架下架，是連你「圖書館」裡那份已購紀錄一起清掉，付過錢的人 9 月 1 日之後就再也點不開。Sony 其實[早在 2021 年就停止在 PlayStation 商店賣電影](https://gamerant.com/playstation-store-deletes-purchases-no-refunds/)，只是讓舊的購買紀錄一直留著能看，這次是連這條尾巴都收了。地區也講得很明白：受害的是英國跟歐洲帳號，美國用戶這批片留得住。同一顆按鈕、同一筆消費，你能不能繼續看，取決於你人在哪個市場、平台跟片商的合約撐到哪一天。

<img src="/images/playstation-deletes-purchased-movies-s1.webp" width="960" height="641" loading="lazy" decoding="async" alt="客廳裡的遊戲主機與電視螢幕，代表 PS5 的數位影片圖書館">

## 追因：問題不在道德，在合約結構

很多人第一個反應是罵 Sony 吃相難看。這個情緒沒有錯，但如果只停在這裡，會解錯題。真正的根因寫在你當初一路點「同意」跳過的那份文件裡。[PlayStation Network 使用條款第 10.1 條白紙黑字寫著，「buy」「purchase」這些字不代表任何所有權的移轉；第 10.2 條再補一刀，所有內容都是以「非專屬且可撤銷」的方式授權給你](https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content)。這不是 Sony 臨時翻臉，是這筆交易從第一天起就長這樣。

用我常講的框架來說，信任的依據是誘因結構，不是善意。平台願不願意讓你繼續看片，跟它人好不好無關，跟它上游那條授權鏈還撐不撐得住有關。StudioCanal 收回授權，平台就沒有讓你看片的權利，而合約早就把這個風險整包放在你這一邊：授權沒了，內容跟著沒，錢不退。你以為自己是買方，實際上是租客，而且是連退租都拿不回押金的那種。看懂這一層，就會知道對象不該只是這家平台，而是「數位購買」這個詞本身在賣一個它給不起的承諾。

<img src="/images/playstation-deletes-purchased-movies-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="放大鏡檢視合約細字，象徵使用條款把購買定義成可撤銷授權">

## 這不是第一次，而且反轉是特例

如果覺得這是單一意外，看一下時間線就知道它是規律。[2022 年 8 月 31 日，Sony 就從 314 個德國帳號跟 137 個奧地利帳號移除過 StudioCanal 內容](https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content)，理由一樣是授權變動。2023 年底更大條，Sony 一度宣布要刪掉超過 1,300 部 Discovery 的節目，包括《流言終結者》。那次[因為用戶反彈太大，Sony 才回頭跟華納兄弟探索重談授權，承諾至少再保留 30 個月的觀看權](https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content)。

這裡要踩個剎車，別把 Discovery 那次的反轉讀成「消費者會贏」。它成立的條件很苛刻：要規模夠大、聲量夠響、片商剛好願意重談，缺一個就不會發生。而且就算談成，也只是把死線往後推 30 個月，不是把所有權還給你。這次的 551 部沒有這種待遇，反而說明常態是刪，特例才是留。把偶爾一次的反轉當成保障，是把運氣當成制度。

<img src="/images/playstation-deletes-purchased-movies-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="倒數的期限日曆，象徵數位內容被撤回的重複模式">

## 各地怎麼管：揭露解的是知情，不是救濟

法規開始追這件事，但要分清楚它們解的是哪一類問題。加州 2025 年 1 月 1 日生效的 [AB 2426，要求數位商店在賣「數位商品」時，必須清楚揭露消費者買到的是授權而非所有權，不能再用會讓人誤以為擁有的「buy」「purchase」字樣含糊帶過](https://www.gtlaw.com/en/insights/2024/12/ab-2426-new-california-law-requires-clear-licensing-disclosures-for-digital-goods)，違反可構成輕罪並負民事責任。

這是進步，但它解的是「知情問題」，不是「救濟問題」。AB 2426 讓你買之前就知道自己在買一份可撤銷的授權，卻沒有規定授權被撤銷時平台要怎麼賠。用我的話說，揭露把資訊不對稱補起來了，卻沒有補上退場機制這個真正的缺口。你更清楚地知道自己隨時會被收回，然後呢？真要解對題，該管的是「內容被下架時，付過錢的人拿得回什麼」，而不只是把免責條款印大一點。

<img src="/images/playstation-deletes-purchased-movies-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="法槌與立法意象，象徵各地用消費者保護法規處理數位所有權">

## 台灣視角：規範有一半，自保得靠自己

台灣的處境是保護只蓋到一半。[行政院消費者保護會針對網路連線遊戲有明確規範](https://cpc.ey.gov.tw/Page/5C73E80D45D176F0)：業者要終止服務得提前公告，消費者未使用的付費點數或費用可依規定退還，開始遊戲後 7 天內也有請求退費的空間，定型化契約還不准業者保留「最終解釋權」。問題是這套機制是為「網路連線遊戲」設計的，你在 PlayStation、iTunes 或各家商店買斷的一部電影、一款單機遊戲，並不直接落在這個規範傘下。買斷型數位內容被下架時，台灣消費者能主張的救濟，比連線遊戲玩家還薄。

所以在制度補起來之前，能執行的自保有幾條，明天就能做。第一，真的重視的電影、音樂、書，優先選實體或明確標示無 DRM、可離線永久保存的版本，別把不能重買的東西全押在雲端圖書館。第二，別把消費集中在單一平台，雞蛋分籃，一家收回不會清空你全部收藏。第三，心態上把數位商店的「購買」重新定價成「長期租用」，用租的價值去衡量值不值得，而不是用「擁有」的心情去買。這不是叫你不用數位服務，是叫你別把租來的東西當成買斷的資產在囤。

<img src="/images/playstation-deletes-purchased-movies-s5.webp" width="960" height="1200" loading="lazy" decoding="async" alt="架上的藍光與 DVD 實體收藏，象徵回到實體媒介作為數位撤回的對策">

Sony 這次刪 551 部片，真正該記住的不是哪幾部經典消失，是那顆「購買」鍵一直在賣一個它給不起的承諾。看懂你買的是授權不是所有權，你才會用對的方式去評估每一次數位消費值不值得，也才知道哪些東西不能只留在別人的伺服器上。

## 常見問題

<p><strong>我在 PlayStation 買的電影，Sony 憑什麼刪掉還不退錢？</strong><br>因為 <a href="https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content">PlayStation Network 使用條款第 10 條寫明「購買」不代表所有權移轉，內容是以可撤銷的方式授權給你</a>。當 Sony 跟片商 StudioCanal 的授權到期，它就失去讓你觀看的權利，而合約把這個風險放在消費者這邊，所以 9 月 1 日下架時不退款也不補償。</p>

<p><strong>這次下架影響哪些地區跟哪些片？</strong><br>影響英國與歐洲帳號，<a href="https://gamerant.com/playstation-store-deletes-purchases-no-refunds/">美國用戶不受影響</a>。被刪的共 551 部，包含《魔鬼終結者 2》、《魔鬼總動員》、《BJ 單身日記》、《第一滴血》系列與《帕丁頓熊 2》等，9 月 1 日起連圖書館裡的已購紀錄一起清除。</p>

<p><strong>抗議有用嗎？Sony 以前收回過又還回來嗎？</strong><br>有一次成功案例但屬特例。<a href="https://consumerrights.wiki/w/Sony%27s_attempted_removal_of_%22purchased%22_content">2023 年 Sony 原本要刪超過 1,300 部 Discovery 節目，因用戶強烈反彈才重談授權、承諾至少再保留 30 個月</a>。但這需要規模夠大、聲量夠響、片商願意重談，缺一不可，而且只是延後死線不是還你所有權，這次 551 部就沒有這種待遇。</p>

<p><strong>台灣買數位內容有沒有法規保護？</strong><br>只有一半。<a href="https://cpc.ey.gov.tw/Page/5C73E80D45D176F0">台灣對「網路連線遊戲」有定型化契約規範，業者終止服務要預告、未使用費用可退</a>，但你買斷的一部數位電影或單機遊戲不直接落在這個傘下，被下架時能主張的救濟相當有限。</p>

<p><strong>我該怎麼避免買過的內容憑空消失？</strong><br>重要的內容優先選實體或標示無 DRM、可離線永久保存的版本；消費別集中在單一平台，分散風險；並把數位商店的「購買」當成「長期租用」來估值，別把不能重買的收藏全押在雲端圖書館。</p>
