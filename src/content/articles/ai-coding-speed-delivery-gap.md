---
title: "AI 把寫程式變快了，交付速度卻沒跟上：25 萬名工程師的實測戳破生產力神話"
slug: "ai-coding-speed-delivery-gap"
description: "Opsera 分析 25 萬名以上工程師，AI 讓 time-to-PR 最多快 58%，但這些 PR 在審查排隊等上 4.6 倍時間；Faros 追蹤 2.2 萬名開發者更發現 commit 到上線的 lead time 反而暴增 480%。寫程式本來就不是交付最慢的一段，壓縮它救不了整條線。"
excerpt: "為什麼工程師覺得自己快了一倍，公司的出貨速度卻沒變？因為瓶頸從來不在打字，而在下游的審查、測試與部署，AI 只是把塞車往後推了一站。"
publishDate: "2026-08-12T08:00:00+08:00"
category: "tech"
subcategory: "digital-tools"
tags: ["AI 寫程式", "軟體交付", "開發者生產力", "DORA 指標", "工程管理"]
coverImage: "covers/ai-coding-speed-delivery-gap.webp"
coverAlt: "程式碼與軟體交付流程示意，象徵寫程式變快但整體交付速度沒跟上"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Opsera 分析 25 萬名以上工程師、60 多家企業：AI 讓 time-to-PR 最多快 58%，但 AI 生成的 PR 在審查佇列等上 4.6 倍時間、多帶 15 至 18% 資安漏洞。"
  - "Faros 追蹤 2.2 萬名開發者兩年遙測：任務吞吐量每人多 33.7%、程式碼被反覆重寫多 861%，但 commit 到上線的 lead time 不減反增 480%。"
  - "寫程式從來不是交付最慢的一段，AI 只是把塞車往下游推。台灣團隊多在既有系統上改，正好落在 AI 效益最低、只有個位數的那一格，該量的是系統層 DORA 而非個人打字速度。"
references:
  - title: "AI Coding Impact 2026 Benchmark Report"
    url: "https://opsera.ai/resources/report/ai-coding-impact-2026-benchmark-report/"
    publisher: "Opsera"
  - title: "The AI Engineering Report 2026: The Acceleration Whiplash — Ten Takeaways"
    url: "https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways"
    publisher: "Faros AI"
  - title: "Software Engineering Productivity Research — AI Impact"
    url: "https://softwareengineeringproductivity.stanford.edu/ai-impact"
    publisher: "Stanford University"
  - title: "Does AI Really Increase Developer Productivity? Large-Scale Stanford Research"
    url: "https://www.aviator.co/podcast/ai-developer-productivity-stanford-study"
    publisher: "Aviator"
originalContribution: "本文把三份 2026 年大規模遙測研究（Opsera 25 萬人、Faros 2.2 萬人、Stanford 12 萬人）的數據對齊到同一條交付流水線上，用『解對題 vs 解錯題』框架指出瓶頸從打字移到下游審查與部署，並延伸評估台灣以既有系統維運為主的軟體團隊為何正落在 AI 效益最低的那一格、該改量哪些指標。"
---

AI 確實讓寫程式變快了，但交付速度幾乎沒動。2026 年幾份規模最大的實測數據講得很白：寫程式從來不是軟體交付最慢的那一段，所以把這一段壓縮再多，整條線也快不了多少。工程師個人覺得自己快了一倍，公司的出貨速度卻沒變，這不是錯覺，是瓶頸換了位置。

先看數字。Opsera 的《AI Coding Impact 2026 Benchmark Report》[分析了 25 萬名以上工程師、60 多家企業](https://opsera.ai/resources/report/ai-coding-impact-2026-benchmark-report/)，結論是 AI 讓開發者從動工到送出 PR（pull request，把改好的程式碼交出去等人審）的時間最多縮短 58%。聽起來很猛。但同一份報告接著說：這些 AI 生成的 PR，在審查佇列裡要多等 4.6 倍的時間，還多帶 15 到 18% 的資安漏洞。前面省下的，後面等回來還不夠。

<img src="/images/ai-coding-speed-delivery-gap-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程數據儀表板與圖表，象徵 25 萬名工程師的大規模實測數據">

Faros AI 的《Acceleration Whiplash》報告用[2.2 萬名開發者、4 千個團隊兩年的遙測資料](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)把這件事看得更透。它比的是每家公司自己「AI 用最少」和「AI 用最多」兩段時期的差。結果：每個工程師的任務吞吐量多了 33.7%、合併的 PR 多了，這一段跟 Opsera 對得上。但代價那一欄很嚇人：每人的臭蟲多 54%、每個 PR 引發的線上事故比例暴增 242.7%、兩週內就被改掉或退掉的「程式碼重工」多了 861%。最關鍵的一個數字是，從 commit 到真正上線的 lead time，不減反增 480%。程式碼寫得更快，上線卻更慢，這就是「加速的甩尾」。

## 快的是打字，慢的還是那些老問題

這裡要踩一個剎車。很多人把「AI 讓我寫程式快很多」直接推成「所以團隊交付會快很多」，這一步就解錯題了。

先問一個更根本的問題：軟體交付最慢的一段，本來是哪一段？Stanford 一個[涵蓋 12 萬名以上工程師、600 多個組織](https://softwareengineeringproductivity.stanford.edu/ai-impact)的長期研究給了答案。主持這項研究的 Yegor Denisov-Blanch 直接說，[AI 帶來的整體生產力中位數提升大約只有 10 到 15%](https://www.aviator.co/podcast/ai-developer-productivity-stanford-study)，遠低於業界早期喊的 60%；表現好的團隊能到 20 到 30%，表現差的團隊「幾乎沒有，甚至是負的」。原因很單純：真正吃掉時間的，從來不是敲鍵盤那一段，而是理解既有程式碼、把需求問清楚、除錯、測試、在複雜系統裡繞路這些前後段。AI 幫得上最快的那一段，剛好是本來就不慢的那一段。

<img src="/images/ai-coding-speed-delivery-gap-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="工廠輸送帶與生產線，象徵交付瓶頸從寫程式移到下游審查與部署">

把三份報告疊在同一條流水線上看，故事就完整了：上游用 AI 灌進來的程式碼變多變快，下游的審查、測試、整合、部署卻還是原本那個人力、那個節奏。水管前段加粗，後段沒動，塞車只是從打字這一站，被推到審查和部署那一站。Faros 那個 480% 的 lead time，就是塞在後段的那攤水。

## 隱藏成本：更多程式碼，不等於更好的程式碼

被推到下游的不只是等待，還有品質。AI 一次吐出的改動更大、更多，人來審的速度沒變，於是審查變成瓶頸，審不完的就容易放水。Faros 的數字裡，臭蟲、線上事故、兩週內重工全部同步往上跳，這不是巧合，是同一個因果：審查跟不上生成，品質就從縫裡漏出去。

<img src="/images/ai-coding-speed-delivery-gap-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="放大鏡檢視程式碼審查畫面，象徵 AI 生成程式碼帶來的臭蟲與資安漏洞成本">

Opsera 那個「多 15 到 18% 資安漏洞」也是同一回事。AI 會補出看起來對、跑得動的程式碼，但它不知道你這個系統的歷史包袱、不知道哪個輸入沒過濾會出事。這些洞不會在打字那一刻被擋下來，要靠後面的審查和測試接住。生成端加速、把關端沒加速，等於把更多沒把過關的東西往上游倒。這正是我之前寫[醫療 AI 合規守門引擎](/articles/medical-ai-compliance-gatekeeper-engine/)時反覆講的那條原則：可信度靠的是流程設計，不是模型多聰明；問題定義、驗證機制、責任歸屬缺一個，就會在那裡漏。程式碼生成也一樣，缺的把關那一關，AI 幫你寫得再快都補不回來。

## 誰真的變快了：資深與資淺的落差正在拉開

還有一個容易被平均值蓋掉的事實。Opsera 發現，[資深工程師拿到的生產力增益，幾乎是資淺工程師的 5 倍](https://opsera.ai/resources/report/ai-coding-impact-2026-benchmark-report/)。這不難理解：AI 生成的程式碼要判斷「這段能不能收、哪裡有雷」，靠的正是資深工程師腦裡那套系統知識和經驗。你越懂，AI 對你越像加速器；你越不懂，它越像一台會自信地帶你撞牆的機器。

<img src="/images/ai-coding-speed-delivery-gap-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程師在辦公桌前使用筆記型電腦工作，象徵資深與資淺工程師的 AI 增益落差">

這件事有個尷尬的後果。過去資淺工程師靠寫大量基礎程式碼練功，現在這一段被 AI 接走了，練功的機會反而變少，能判斷 AI 輸出好壞的能力卻更重要。Stanford 也觀察到，[開發者剛開始用 AI 的前 30 到 100 小時通常會先變慢](https://www.aviator.co/podcast/ai-developer-productivity-stanford-study)，要熬過那段學習曲線才有正效益。這跟我先前談[技能半衰期縮短、再培訓視窗](/articles/wef-skills-gap-ai-reskilling/)的擔憂是同一條線：工具換得快，會用工具做判斷的人養不出來，落差只會越拉越大。

## 台灣團隊該量的，不是打字速度

那台灣的軟體團隊該從這裡讀出什麼？

台灣多數工程團隊做的是既有系統的維運與加值（brownfield），不是從零開始的新專案（greenfield）。而 Stanford 的資料顯示，AI 效益最高的是新專案、簡單任務；碰到複雜的既有系統，增益就掉到個位數甚至是負的。也就是說，台灣團隊剛好落在 AI 帳面效益最低的那一格。這時候如果拿「工程師個人 PR 數變多」「AI 採用率達標」當 KPI 去衝，衝出來的很可能就是 Faros 那組數字：帳面吞吐量漂亮，臭蟲、事故和上線時間一起惡化。

<img src="/images/ai-coding-speed-delivery-gap-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="商業指標儀表板與 KPI 監控畫面，象徵團隊應改看系統層交付指標">

該量的是整條交付線的健康度，不是單點的打字速度。DORA 那四個指標就是現成的體檢表：部署頻率、變更前置時間（lead time，改一行到上線要多久）、變更失敗率、服務復原時間。這四個量的是「東西多久能穩穩上線」，而不是「工程師手速多快」。先把這條線的瓶頸找出來，通常是在審查和測試那一段，再決定 AI 要放在哪裡幫忙。順序不能倒：先定義你要解的到底是哪一段的問題，再選工具。把 AI 塞進本來就不慢的打字那段，再回頭抱怨整體沒變快，是自己解錯了題。

AI 讓寫程式變快是真的，這不需要爭。但「寫程式變快」和「軟體交付變快」是兩件事，中間隔著審查、測試、整合和部署一整段沒被加速的下游。25 萬名工程師的數據不是在說 AI 沒用，而是在說：你把加速器裝在了不是瓶頸的地方。看懂瓶頸在哪，比記住 58% 這個數字重要。

<h2>常見問題</h2>

<p><strong>AI 寫程式到底有沒有讓工程師變快？</strong><br>單看寫程式那一段是有的。Opsera 分析 25 萬名以上工程師，發現 AI 讓從動工到送出 PR 的時間[最多縮短 58%](https://opsera.ai/resources/report/ai-coding-impact-2026-benchmark-report/)。但整體生產力的中位數提升，Stanford 12 萬人的研究[量到只有大約 10 到 15%](https://www.aviator.co/podcast/ai-developer-productivity-stanford-study)，因為寫程式只是交付的一小段，前後的理解、審查、測試沒有一起變快。</p>

<p><strong>寫程式變快了，為什麼公司出貨速度沒變快？</strong><br>因為瓶頸不在打字，在下游。AI 讓上游灌進更多程式碼，但審查、測試、部署的人力和節奏沒變，塞車只是往後推一站。Faros 追蹤 2.2 萬名開發者就發現，任務吞吐量每人多 33.7%，但 commit 到上線的 lead time [反而增加 480%](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)。</p>

<p><strong>AI 生成的程式碼品質會比較差嗎？</strong><br>在把關跟不上生成速度時會。Faros 的資料顯示高度使用 AI 後，每人臭蟲多 54%、每個 PR 引發的線上事故比例增加 242.7%、兩週內被改掉的重工多 861%；Opsera 也發現 AI 生成的 PR [多帶 15 到 18% 的資安漏洞](https://opsera.ai/resources/report/ai-coding-impact-2026-benchmark-report/)。問題不在 AI 本身，在於審查和測試這道關卡沒有同步加速。</p>

<p><strong>團隊想評估 AI 有沒有真的幫上忙，該看什麼指標？</strong><br>看整條交付線的 DORA 四指標：部署頻率、變更前置時間、變更失敗率、服務復原時間，而不是個人的 PR 數或打字速度。這四個量的是「東西多久能穩穩上線」，才抓得到瓶頸有沒有真的被解掉。個人吞吐量漂亮但這四項惡化，通常代表 AI 被裝在了不是瓶頸的地方。</p>
