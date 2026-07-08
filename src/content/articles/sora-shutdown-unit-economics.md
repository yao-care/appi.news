---
title: "OpenAI 收掉 Sora：生成影片的單位經濟學，從第一天就算不平"
slug: "sora-shutdown-unit-economics"
description: "OpenAI 在 2026 年 3 月宣布關閉 Sora，四月應用程式與網站下線。外界瘋傳的「每天燒 1500 萬美元、總營收僅 210 萬」把兩個不同時點的數字混在一起，但更關鍵的數字更簡單：一支十秒影片生成成本約 1.3 美元，賣 1 美元，而且大多數人根本不付錢。這不是 AI 泡沫的訊號，是把『能做出來』誤當成『能做成生意』的教科書案例。"
excerpt: "為什麼技術驚豔的 Sora 撐不過六個月？因為每賣一支影片就賠錢，而且大多數影片免費送。單位經濟學算不平，用戶再多都是用更貴的方式虧損。"
publishDate: "2026-07-16T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["Sora", "OpenAI", "單位經濟學", "生成式影片", "推論成本"]
coverImage: "covers/sora-shutdown-unit-economics.webp"
coverAlt: "燃燒的鈔票，象徵生成式影片單位經濟學崩壞、成本遠超營收"
coverImageCredit: "Photo by Jp Valery on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Sora 被收掉不是因為做得不好，是單位經濟學算不平：據分析師估算，一支十秒影片生成成本約 1.3 美元，OpenAI 卻只收 1 美元，而且絕大多數影片是免費送的。連 Sora 負責人 Bill Peebles 都公開承認『經濟模型完全不成立』。"
  - "瘋傳的『每天燒 1500 萬美元 vs 總營收 210 萬』把兩個不同時點的數字兜在一起：1500 萬是 Forbes 去年 11 月用尖峰用量推估的上限，等到真正關閉時，華爾街日報報導的日燒是約 100 萬美元，因為用戶已經先崩掉了。兩個數字方向一致，收支從沒接近打平。"
  - "台灣該讀出的不是『AI 泡沫要破』，而是『推論成本是新的牆』：戰場從『模型多聰明』移到『每支影片、每個 token 的邊際成本壓多低』，這條鏈上的推論效率、散熱、電力與邊緣運算，才是台灣硬體真正要卡的位。"
references:
  - title: "OpenAI Could Be Blowing As Much As $15 Million Per Day On Silly Sora Videos"
    url: "https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/"
    publisher: "Forbes"
  - title: "Why OpenAI really shut down Sora"
    url: "https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/"
    publisher: "TechCrunch"
  - title: "OpenAI Shuts Down AI Video App Sora. The First Crack In The AI Bubble?"
    url: "https://www.forbes.com/sites/rachelwells/2026/03/26/openai-shuts-down-ai-video-app-sora-the-first-crack-in-the-ai-bubble/"
    publisher: "Forbes"
  - title: "Sora shutdown reveals costly limits of AI video generation and creative use"
    url: "https://techxplore.com/news/2026-04-sora-shutdown-reveals-limits-ai.html"
    publisher: "Tech Xplore"
  - title: "Sora Shutdown Highlights Cost Challenges in AI Video Generation"
    url: "https://www.ciol.com/tech-buzz/openai-shuts-sora-video-app-costs-usage-decline-11436718"
    publisher: "CIOL"
originalContribution: "本文拆解『每天燒 1500 萬 vs 營收 210 萬』這組瘋傳數字的來源，指出 1500 萬是尖峰推估、100 萬是關閉時的實際日燒，兩者被混用；並主張真正的關鍵證據是『每支影片成本 1.3 美元 > 售價 1 美元』這個與每日總額無關的單位數字，據此把 Sora 收攤定位為單位經濟學問題而非 AI 泡沫破裂，並延伸到台灣硬體在推論成本這道新牆上的卡位點。"
---

OpenAI 把自家最會上頭條的產品 Sora 收掉了，原因不是它做得不好。是它從第一天起，每生成一支影片就在賠錢，而且絕大多數影片是免費送的。這是一個技術做得出來、生意卻算不平的案例，跟「AI 泡沫要破了」是兩回事。

網路上瘋傳的那組數字是「[每天燒 1500 萬美元、總營收只有 210 萬](https://www.ciol.com/tech-buzz/openai-shuts-sora-video-app-costs-usage-decline-11436718)」。這組對比很有畫面，但它把兩個不同時間點的數字兜在一起了。1500 萬美元是 [Forbes 在 2025 年 11 月的推估上限](https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/)，前提假設是尖峰時約 450 萬用戶、每天生出 1100 多萬支影片。等到 2026 年 3 月真的要關的時候，[華爾街日報報導 Sora 當時的日燒大約是 100 萬美元](https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/)，因為用量早就先崩了。數字差 15 倍，但方向一模一樣：收支從來沒接近打平過。

<img src="/images/sora-shutdown-unit-economics-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="向下的紅色箭頭與虧損圖表，象徵營收與成本的巨大落差">

## 先把發生的事講清楚

Sora 是 OpenAI 的文字生成影片應用，2025 年秋天靠一支支社群瘋傳的短片衝上熱度。2026 年 3 月宣布關閉，[應用程式與網站在四月下線](https://techxplore.com/news/2026-04-sora-shutdown-reveals-limits-ai.html)，底層 API 稍後也排定收掉。從爆紅到收攤，中間大概半年。

收掉的過程還撞掉一筆大生意。OpenAI 原本跟迪士尼談了一份號稱十億美元等級的角色授權合作，結果 [迪士尼是在公布前不到一小時才知道 Sora 要關](https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/)，合作等於作廢。做這個決定的是執行長 Sam Altman，理由不複雜：每一顆 GPU 拿去跑 Sora，就少一顆能拿去跑 ChatGPT、寫程式或企業 API，而那些都直接進帳。Sora 被內部形容成一個在 IPO 前養不起的「支線任務」。

<img src="/images/sora-shutdown-unit-economics-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="手機上的影片串流應用程式畫面，象徵 Sora 應用程式下線">

## 真正該盯的那個數字，跟每天燒多少無關

把每日總額的爭議放一邊，有一個數字自己就把話講完了：[分析師估算一支十秒影片的生成成本約 1.3 美元](https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/)（Cantor Fitzgerald 的 Deepak Mathivanan 提出，SemiAnalysis 的分析師背書為合理）。而 OpenAI 標準版一支收 1 美元、Pro 版收 3 美元。也就是說，就算每一支影片都有人付全價，標準版還是賣一支賠 0.3 美元。

問題是絕大多數影片根本沒人付錢。免費與低價方案撐起了聲量，卻沒撐起營收。用「單位經濟學」的語言講：每多服務一個使用者、每多生一支影片，虧損就多一點。這種結構下，用戶成長不是解方，是加速器，用戶越多虧越快。連 [Sora 負責人 Bill Peebles 都公開講白了：經濟模型「完全不成立」](https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/)。當一個產品的負責人自己這樣說，剩下的只是什麼時候關而已。

<img src="/images/sora-shutdown-unit-economics-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="計算機與財務試算表，象徵每支影片邊際成本高於售價的單位經濟學">

## 這是解錯題，不是泡沫破掉

有人把 Sora 收攤讀成 [「AI 泡沫的第一道裂縫」](https://www.forbes.com/sites/rachelwells/2026/03/26/openai-shuts-down-ai-video-app-sora-the-first-crack-in-the-ai-bubble/)。我覺得這個框架抓錯層次了。Sora 的技術是真的能用，短片品質也真的驚豔過一票人。它倒的地方不在「能不能做出來」，在「做出來之後這門生意怎麼算都是負的」。這兩件事要分開看，混在一起就會得出「AI 不行」這種太廉價的結論。

把它擺回「解對題還是解錯題」的框架就清楚了。OpenAI 解的題其實是「能不能做出一個會讓人瘋傳的影片產品」，這題他們解出來了。但真正該先問的題是「一支影片的邊際成本，能不能壓到低於使用者願意付的價格」。影片生成的算力需求本質上就重：每一秒要算出幾十張影格，每張都要處理空間、動態、光影、時間連貫，[目前沒有一條捷徑能讓它變便宜](https://techxplore.com/news/2026-04-sora-shutdown-reveals-limits-ai.html)。在這個成本結構沒被壓下來之前就大規模免費開放，就是在用補貼換一個算不平的未來。

這帶出一個比 Sora 本身更重要的判斷：推論成本（inference cost，模型每次生成要花的算力錢）正在變成新的牆。過去大家比的是模型訓練得多聰明，現在真正卡住商業化的，是每一次生成要燒多少錢。ChatGPT 的圖片與文字產品之所以留下、Sora 之所以被砍，差別就在同樣一秒 GPU 時間，誰能換回比較多的錢。

<img src="/images/sora-shutdown-unit-economics-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="資料中心的伺服器機櫃與 GPU，象徵推論成本是新的牆與算力機會成本">

## 留存撐不住，補貼就只是更貴的虧損

單位經濟學算不平還能靠成長硬撐一陣，前提是留得住人。Sora 連這點都沒守住。[下載量從 2025 年 11 月的約 333 萬，四個月內掉到 113 萬，跌掉約六成六](https://www.ciol.com/tech-buzz/openai-shuts-sora-video-app-costs-usage-decline-11436718)；[活躍用戶從尖峰接近百萬，掉到不足五十萬](https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/)。爆紅之後，很多人玩過幾次就找不到非玩不可的用途。

這裡有個容易看歪的地方：以為 Sora 是死在「太紅、成本爆掉」。剛好相反，它是死在「紅完之後留不住人，但每個留下來的人都還在讓公司賠錢」。當留存撐不住，補貼換來的每一個活躍用戶，都只是用更貴的方式在虧。這也是為什麼一份看似風光的迪士尼授權案救不了它，授權談的是內容題材，補不了底層每支影片就賠錢的洞。

<img src="/images/sora-shutdown-unit-economics-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="向下走的折線圖，象徵下載量與活躍用戶崩跌、留存撐不住">

## 台灣該從這條新聞讀出什麼

台灣最該接住的訊號，不是「生成式影片沒搞頭」，而是「推論成本成了主戰場」。當商業化的瓶頸從模型能力移到每次生成的邊際成本，這條鏈上會被重新定價的東西，很多都在台灣手上：更省電的推論晶片、把模型塞進裝置端就近運算的邊緣運算、扛得住高密度算力的散熱與電力。台灣經濟部已經上修未來十年用電，[把 AI 與半導體列為最大推力](/articles/taiwan-power-demand-forecast-2035/)，而 [台積電也說 AI 晶片需求沒有緩下來](/articles/tsmc-wei-ai-demand-high-na-euv/)。Sora 這一課把話講得更直白：能不能省下每一秒 GPU 的成本，本身就是一門生意。

對台灣在做 AI 應用、AI 新創的人，這課更貼身。別急著複製「免費開放衝用戶、之後再想辦法收錢」的劇本。先把一件事算清楚：你的產品每服務一個使用者的邊際成本是多少、使用者願意付的價格是多少，這兩個數字誰大。如果生成一次的成本高於能收的錢，用戶越多只會虧越快，這跟模型換哪一顆、介面做得多漂亮都無關。Sora 是全世界最有錢的 AI 公司，尚且要為這條算式收掉旗艦產品。看懂那支影片賣 1 美元、成本 1.3 美元的落差，比記住「每天燒 1500 萬」這個聳動數字重要。

<img src="/images/sora-shutdown-unit-economics-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="高壓電塔與輸電線，象徵台灣在推論成本、散熱與電力這條鏈上的卡位點">

<h2>常見問題</h2>

<p><strong>OpenAI 為什麼要關掉 Sora？</strong><br>核心是單位經濟學算不平。據分析師估算，<a href="https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/">一支十秒影片生成成本約 1.3 美元，OpenAI 卻只收 1 美元</a>，而且大多數影片免費，等於做越多賠越多。加上用戶留存崩跌、GPU 拿去跑更會賺錢的 ChatGPT 更划算，OpenAI 在 2026 年 3 月決定收攤。</p>

<p><strong>「每天燒 1500 萬美元、營收只有 210 萬」是真的嗎？</strong><br>兩個數字都出現在報導裡，但屬於不同時點，不該直接相減。1500 萬美元是 <a href="https://www.forbes.com/sites/phoebeliu/2025/11/10/openai-spending-ai-generated-sora-videos/">Forbes 在 2025 年 11 月用尖峰用量推估的上限</a>；到真正關閉時，<a href="https://techcrunch.com/2026/03/29/why-openai-really-shut-down-sora/">華爾街日報報導日燒約 100 萬美元</a>，因為用戶已先崩掉。營收 210 萬則是 <a href="https://www.ciol.com/tech-buzz/openai-shuts-sora-video-app-costs-usage-decline-11436718">累計數字</a>。不論用哪個成本數字，收支都沒接近打平。</p>

<p><strong>Sora 收掉代表 AI 泡沫要破了嗎？</strong><br>不宜這樣推論。Sora 的技術是能用的，它倒在商業模式而非技術能力。這比較像單一產品的定價與成本失衡，不等於整個 AI 產業的估值崩解。真正的教訓是：技術做得出來，不代表這門生意算得平。</p>

<p><strong>台灣廠商能從 Sora 事件得到什麼機會？</strong><br>當商業化瓶頸從模型能力轉到推論成本，省電推論晶片、邊緣運算、散熱與電力這些台灣強項會被重新定價。台灣 <a href="/articles/taiwan-power-demand-forecast-2035/">經濟部已把 AI 與半導體列為未來十年用電最大推力</a>，壓低每次生成的算力成本本身就是一門生意。</p>
