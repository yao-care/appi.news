---
title: "FDA『TEMPO 試辦』7 月上路：AI 醫材免走完整核准，就能先進 Medicare 慢性病照護"
slug: "fda-tempo-ai-device-medicare"
description: "美國 FDA 的 TEMPO 試辦搭配 CMS 的 ACCESS 給付模式，7 月 1 日上路，讓未取得 510(k)／PMA 核准的 AI 數位醫材，能先用在傳統 Medicare 的慢性病病患身上。機制是『執法裁量』而非新核准，換的是真實世界資料。本文拆解它鬆綁了哪幾關、風險在哪，並對照台灣 TFDA 與健保的路線。"
excerpt: "FDA 不是發給 AI 醫材一張通行證，是選擇『暫時不追究』。這句話怎麼讀，決定你把 TEMPO 看成鬆綁，還是換了名字的臨床試驗。"
publishDate: "2026-08-07T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags:
  - "醫療政策"
  - "數位健康"
  - "健保"
  - "AI"
coverImage: "covers/fda-tempo-ai-device-medicare.webp"
coverAlt: "象徵 FDA 以執法裁量讓 AI 數位醫材未完整核准即進入 Medicare 慢性病照護的監理示意"
author: "lightman"
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
  - "TEMPO 讓 AI 數位醫材免走完 510(k)／PMA、免申請 IDE、也免整套知情同意與 IRB（21 CFR Part 50、56），就能先用在傳統 Medicare 病患身上；但只限在 CMS 的 ACCESS 給付模式內、只選 4 大慢性病領域、每領域至多約 10 家美國廠商。"
  - "這不是新核准，是 FDA 的『執法裁量』：暫時不追究、可撤回、綁記錄與標示條件，目的是換一批真實世界資料回去支持正式送件。看成永久鬆綁會誤判它的信任邊界。"
  - "台灣沒有這種『先用＋給付』雙門：醫療器材管理法 2021 上路、食藥署設智慧醫材專案辦公室，健保 2023 年底才首次給付一款 AI 醫材。TEMPO 值得台灣看的不是鬆綁多少，而是它把『上市』和『給付』綁在同一條路上。"
references:
  - title: "CMS and FDA Unveil a Digital Health Pilot for Chronic Conditions"
    url: "https://www.gtlaw.com/en/insights/2026/1/cms-and-fda-unveil-a-digital-health-pilot-for-chronic-conditions"
    publisher: "Greenberg Traurig"
  - title: "The Opportunity of TEMPO and ACCESS for Digital Health Device Manufacturers"
    url: "https://www.alston.com/en/insights/publications/2026/02/tempo-access-digital-health-device-manufacturers"
    publisher: "Alston & Bird"
  - title: "New FDA Digital Health Pilot, Same FDA Enforcement Discretion"
    url: "https://www.morganlewis.com/blogs/asprescribed/2025/12/new-fda-digital-health-pilot-same-fda-enforcement-discretion"
    publisher: "Morgan Lewis"
  - title: "ACCESS + TEMPO: The 2-door entryway to faster digital health innovation in traditional Medicare"
    url: "https://www.mcdermottplus.com/blog/regs-eggs/access-tempo-the-2-door-entryway-to-faster-digital-health-innovation-in-traditional-medicare/"
    publisher: "McDermott+"
  - title: "AI醫療邁新紀元！資誠解析全球智慧醫療法規動態、直擊台灣發展痛點"
    url: "https://news.gbimonthly.com/tw/article/show.php?num=82821&kind=1"
    publisher: "環球生技月刊"
  - title: "食品藥物管理署智慧醫療器材專案辦公室成立"
    url: "https://www.mohw.gov.tw/cp-5016-59558-1.html"
    publisher: "衛生福利部"
originalContribution: "本文以『執法裁量 ≠ 核准』為分析框架，逐一拆解 TEMPO 鬆綁的四道上市前關卡（510(k)/PMA、IDE、Part 50/56）、廠商仍須守的義務，並把它與台灣『上市』與『健保給付』兩條各自為政的路線對照，指出台灣真正該學的是把兩者綁成一條路。"
column: "ai-healthcare"
topics: ["ai-medical-regulation"]
---

美國 FDA 7 月 1 日起跑一個叫 TEMPO 的試辦，讓 AI 數位醫材不必先走完 510(k) 或上市前核准（PMA），就能用在傳統 Medicare 的慢性病病患身上。它靠的不是一張新的通行證，是 FDA 選擇「暫時不追究」，法律上叫執法裁量（enforcement discretion）。這句話怎麼讀，決定你把它看成鬆綁，還是換了個名字的臨床試驗。

TEMPO 全名是 Technology-Enabled Meaningful Patient Outcomes，跟 CMS 創新中心的 ACCESS 給付模式綁在一起。[ACCESS 是一個十年期（2026 到 2036）的付費模式，7 月 1 日開跑](https://www.mcdermottplus.com/blog/regs-eggs/access-tempo-the-2-door-entryway-to-faster-digital-health-innovation-in-traditional-medicare/)，針對傳統 Medicare（不含 Medicare Advantage）病患，付錢給用數位工具管理慢性病的照護單位。TEMPO 是這條路的另一道門：讓還沒拿到 FDA 核准的醫材，能先進到 ACCESS 裡被用、被給付。

<img src="/covers/fda-tempo-ai-device-medicare.webp" width="1200" height="800" loading="lazy" decoding="async" alt="FDA 以執法裁量讓 AI 數位醫材未完整核准即進入 Medicare 慢性病照護的監理示意">

## 鬆綁的到底是哪幾關

先把「免核准」講精確，不然容易嚇到人或看太輕。[FDA 對參與廠商行使執法裁量，暫時不執行三類要求](https://www.gtlaw.com/en/insights/2026/1/cms-and-fda-unveil-a-digital-health-pilot-for-chronic-conditions)：一是上市前核准（510(k) 或 PMA），二是臨床試驗要用的試驗醫材豁免（IDE），三是 21 CFR Part 50 與 Part 56，也就是整套知情同意與人體試驗審查委員會（IRB）的規定。換句話說，正常要嘛走完核准才能賣、要嘛掛「試驗用」做臨床，TEMPO 讓你兩邊都先跳過。

範圍卡得很死。[FDA 打算每個臨床領域只選最多約 10 家美國廠商](https://www.alston.com/en/insights/publications/2026/02/tempo-access-digital-health-device-manufacturers)，總共四個領域：早期心腎代謝（高血壓、高血脂、肥胖、糖尿病前期）、進階心腎代謝（糖尿病、慢性腎臟病、心血管疾病）、肌肉骨骼慢性疼痛、行為健康（憂鬱與焦慮）。而且醫材只能在 ACCESS 這個框裡用，不能拿同一個用途到外面市場行銷。這不是全面開放，是一個被圈起來的沙盒。

<img src="/images/fda-tempo-ai-device-medicare-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療器材上市前核准與法規文件，象徵 TEMPO 暫時跳過的幾道審查關卡">

## 為什麼是「不追究」而不是「核准」

這裡要踩個剎車。執法裁量和核准是兩件事，混在一起就會解錯題。核准是 FDA 認定這個醫材對它宣稱的用途安全有效；執法裁量只是 FDA 說「這段期間我不去追究你沒核准這件事」。前者是判斷，後者是選擇不判斷。

差別為什麼重要，看它的誘因結構就懂。[Morgan Lewis 的分析點得很直白：這種裁量是暫時的，FDA 最終仍會希望這些醫材走完正式核准、回到完整法規要求下](https://www.morganlewis.com/blogs/asprescribed/2025/12/new-fda-digital-health-pilot-same-fda-enforcement-discretion)。它是一條通往核准的跑道，不是核准的替代品。FDA 換到的是真實世界資料，廠商換到的是提早進場和給付，但這個狀態可撤回、綁著標示與記錄條件。你若把它當成「這醫材已經被 FDA 認證」，就誤讀了它給你的信任邊界：資料還沒攤開，判斷還沒做完。

<img src="/images/fda-tempo-ai-device-medicare-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="天秤與法規符號，象徵執法裁量是暫時不追究而非正式核准的監理選擇">

## 病患這邊，安全誰顧

跳過核准，不等於裸奔。[廠商在試辦期間仍要維持合規的品質管理系統（QMS）、通報不良事件、遵守 HIPAA，醫材也要在有臨床主任監督的照護單位下使用](https://www.alston.com/en/insights/publications/2026/02/tempo-access-digital-health-device-manufacturers)。更關鍵的是病患端：用到 TEMPO 醫材的 ACCESS 單位，得向病患取得「加強版同意」，明白告知這台醫材正在參加 FDA 試辦、部分資料會分享給 FDA。這是把知情這件事從 IRB 的正式審查，換成給付端的一紙告知。

追一下因，這裡有個沒補滿的洞。入選門檻寫的是醫材「不得對病患的健康、安全或福祉構成嚴重風險潛在可能」，但 FDA 沒說清楚這個門檻怎麼評、上線後又靠什麼在真實世界裡持續盯。安全的把關從「上市前一次審查」變成「上市後邊用邊收資料」，這對低風險的慢性病監測或許划算，但它把驗證的重量往後挪到了病患身上。這不是不能做，是要看清楚它把風險放在時間軸的哪一段。

<img src="/images/fda-tempo-ai-device-medicare-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="慢性病血壓監測與遠距照護，象徵 TEMPO 醫材用於 Medicare 病患時的安全把關與知情同意">

## 台灣沒有這道雙門

回到台灣。我們的路線是分開走的兩條。[食藥署 2021 年 5 月成立智慧醫療器材專案辦公室，配合同年上路的《醫療器材管理法》](https://www.mohw.gov.tw/cp-5016-59558-1.html)，把 AI 輔助診斷與軟體醫材（SaMD）納進管理、提供單一窗口輔導。這是「上市」這條路。給付是另一條：[健保署要到 2023 年底，才首次給付一款用於麻醉高風險手術病人監測的 AI 醫材](https://news.gbimonthly.com/tw/article/show.php?num=82821&kind=1)，被視為 AI 醫材跨進健保的里程碑。上市歸食藥署、給付歸健保署，兩邊各審各的。

TEMPO 真正值得台灣看的，不是它鬆綁了多少關，而是它把「上市」和「給付」綁在同一條路上，讓醫材一進場就有錢流、有真實世界資料回收。同一份 PwC 的整理也指出，美國走 FDA 與 CMS 的平行審查、德國有 DiGA 快速納保、南韓建了數位療法的健保指引，台灣則還卡在場域驗證不足與商業化落地。這跟我一直講的順序有關：先定義你要解的問題，再挑工具。台灣缺的不見得是更寬鬆的核准，而是一個讓上市與給付對話的機制。這件事牽涉健保財務與病安，不是一篇文章能拍板，該由主管機關和臨床端一起談。但方向可以先看懂：TEMPO 的重點在制度接線，不在放行速度。

<img src="/images/fda-tempo-ai-device-medicare-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣醫院與智慧醫療技術，象徵 TFDA 醫材管理與健保給付兩條各自為政的路線">

台灣一邊也在盤點怎麼跟國際的 AI 法規框架對齊（[歐盟 AI 法對通用 AI 長出牙齒後，台廠該怎麼一次對齊](/articles/eu-ai-act-gpai-enforcement-taiwan-alignment/)），醫療這一塊同樣要問：我們要的是抄哪一段。TEMPO 給的答案很具體，就是把給付當成醫材上市的一部分來設計，而不是等它上市後再另外排隊等健保。

<h2>常見問題</h2>

<p><strong>TEMPO 是不是代表這些 AI 醫材已經通過 FDA 核准了？</strong><br>不是。TEMPO 用的是「執法裁量」，意思是 FDA 在試辦期間選擇不去追究這台醫材尚未取得核准，不代表 FDA 已認定它安全有效。<a href="https://www.morganlewis.com/blogs/asprescribed/2025/12/new-fda-digital-health-pilot-same-fda-enforcement-discretion">這種狀態是暫時的、可撤回的，最終仍要走完正式核准</a>。把它讀成「已認證」會誤判風險。</p>

<p><strong>哪些病患、哪些病會用到 TEMPO 醫材？</strong><br>限傳統 Medicare（不含 Medicare Advantage）病患，且只在四個慢性病領域：早期與進階的心腎代謝（高血壓、糖尿病、慢性腎臟病等）、肌肉骨骼慢性疼痛、以及憂鬱與焦慮等行為健康。<a href="https://www.alston.com/en/insights/publications/2026/02/tempo-access-digital-health-device-manufacturers">每個領域 FDA 最多選約 10 家美國廠商</a>，而且醫材只能在 ACCESS 給付模式內使用。</p>

<p><strong>TEMPO 具體鬆綁了哪些要求？</strong><br><a href="https://www.gtlaw.com/en/insights/2026/1/cms-and-fda-unveil-a-digital-health-pilot-for-chronic-conditions">FDA 暫時不執行三類規定</a>：上市前核准（510(k)／PMA）、臨床試驗用的試驗醫材豁免（IDE）、以及知情同意與 IRB 規範（21 CFR Part 50、56）。但廠商仍要維持品質管理系統、通報不良事件、遵守 HIPAA，病患端也要取得加強版同意。</p>

<p><strong>台灣有沒有類似 TEMPO 的制度？</strong><br>沒有對應的「先用＋給付」雙門。台灣的醫材上市由食藥署依《醫療器材管理法》審查，健保給付由健保署另外決定，<a href="https://news.gbimonthly.com/tw/article/show.php?num=82821&kind=1">健保 2023 年底才首次給付一款 AI 醫材</a>。TEMPO 的特點是把上市與給付綁在一起，這正是台灣目前分開走、較缺乏的接線機制。</p>
