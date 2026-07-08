---
title: "Akrites 上線：Linux 基金會領軍，AWS、Anthropic、微軟等組開源資安應變隊"
slug: "akrites-open-source-security"
description: "Linux 基金會 6/25 帶著 AWS、Anthropic、Google、微軟等 19 個組織成立 Akrites，建一支共用資安應變隊（SIRT）與單一漏洞協調揭露流程。真正的訊號不是這份豪華名單，而是一句承認：AI 已經把漏洞從被發現到被修補的時間壓到幾分鐘，開源維護者一個人扛不住。"
excerpt: "為什麼要一次拉這麼多對手同桌？因為前沿模型幾分鐘就能掃出開源漏洞，攻擊者很快也拿得到同樣的能力。但把協調做順，解的是速度這題；維護者沒錢、沒人、早就跑掉，才是根因。"
publishDate: "2026-07-20T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["Akrites", "開源資安", "Linux 基金會", "軟體供應鏈", "漏洞揭露", "AI 資安"]
coverImage: "covers/akrites-open-source-security.webp"
coverAlt: "象徵開源軟體資安防護的盾牌與數位鎖示意"
coverImageCredit: "Photo by Digital Buggu on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Linux 基金會 6 月 25 日成立 Akrites，19 個創辦組織含 AWS、Anthropic、Google、微軟與 GitHub、NVIDIA、OpenAI、IBM、Red Hat、Rust 基金會，建一支共用資安應變隊（SIRT）與單一標準化的漏洞協調揭露（CVD）流程，種子資金來自基金會旗下的 Alpha-Omega。"
  - "成立理由是 AI：前沿模型幾分鐘就能掃出大型開源專案的漏洞，過去要幾週；同一能力很快會落到攻擊者手上，而最近被驗證出來的數千個開源漏洞，修補率不到 5%。"
  - "把揭露協調做順，解的是速度這題；但維護者沒錢、沒人、甚至專案早已無人維護才是根因，Akrites 的『最後維護者』只是補破口，沒有直接付錢給維護者，這題它只碰到邊。"
references:
  - title: "Linux Foundation and Industry Leaders Launch Akrites to Defend Critical Open Source Software Against AI-Enabled Cyber Threats"
    url: "https://www.linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats"
    publisher: "The Linux Foundation"
  - title: "Akrites: Patch the Commons, Together"
    url: "https://akrites.org/"
    publisher: "Akrites"
  - title: "Critical open-source projects get a new security framework"
    url: "https://www.helpnetsecurity.com/2026/06/26/akrites-open-source-security-framework/"
    publisher: "Help Net Security"
  - title: "Linux Foundation Unveils New Open Source Security Project Akrites"
    url: "https://www.securityweek.com/linux-foundation-unveils-new-open-source-security-project-akrites/"
    publisher: "SecurityWeek"
  - title: "Akrites: The Latest Attempt to Protect Open-Source From AI Attacks Has Arrived"
    url: "https://devops.com/akrites-the-latest-attempt-to-protect-open-source-from-ai-attacks-has-arrived/"
    publisher: "DevOps.com"
originalContribution: "本文把 Akrites 拆成兩層來讀：它把『漏洞揭露協調』這題解得漂亮（共用 SIRT＋單一 CVD＋最後維護者），但用『解對題 vs 解錯題』框架指出根因是維護者人力與誘因結構，Akrites 沒有直接付錢給維護者、與 Chainguard 的 Athena、IBM/Red Hat 的 Lightwell 三案並行又互不點名；並從『台灣是開源的下游消費者而非上游維護者』切入，指出對台廠真正該先做的是 SBOM 相依盤點，才吃得到 CVD 窗口的好處。"
---

Linux 基金會 6 月 25 日拉著一票平常在市場上互打的公司，[成立了一個叫 Akrites 的開源資安應變組織](https://www.linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)。19 個創辦組織裡有 AWS、Anthropic、Google、微軟與 GitHub、NVIDIA、OpenAI、IBM、Red Hat、Rust 基金會，還有 Citi、摩根大通這種銀行。做法是建一支共用的資安應變隊（SIRT）加一條單一、標準化的漏洞協調揭露（CVD）流程。真正的訊號不是這份豪華名單。是這份名單背後那句沒明講的承認：AI 已經把漏洞從被發現到被修補的時間壓到幾分鐘，開源維護者一個人扛不住了。

<img src="/covers/akrites-open-source-security.webp" width="1200" height="900" loading="lazy" decoding="async" alt="象徵開源軟體資安防護的盾牌與數位鎖示意">

先看它實際上是什麼。口號是[「一起修補公共財」（Patch the Commons, Together）](https://akrites.org/)，核心是一支共用 SIRT，負責驗證與去重複回報、協調修補、往上游推補丁，全程「保密優先」，用的是 CVE、CVSS、VEX 這套資安圈既有標準。對維護者的承諾是主導權還在你手上，補丁到揭露時發回你原本的專案。早已沒人維護的套件，Akrites 自己當[「最後維護者」（maintainer of last resort）](https://www.securityweek.com/linux-foundation-unveils-new-open-source-security-project-akrites/)。種子資金來自基金會旗下的 Alpha-Omega，金額沒公布。名字取自[拜占庭帝國東境的邊防軍 Akritai](https://en.wikipedia.org/wiki/Akritai)，字根 akron 是「邊界、邊緣」，守在威脅最先抵達、防線最薄的地方；這個字根也正好是英文 critical（關鍵）的來源，而它要守的就是關鍵開源軟體。

<img src="/images/akrites-open-source-security-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="資安應變團隊監控與協調作業示意">

為什麼是現在？因為攻守的時間差被 AI 抹平了。AWS 的 Matt Wilson 講得直白：[前沿 AI 模型讓防守方能用過去做不到的速度與規模去找漏洞、修漏洞](https://www.helpnetsecurity.com/2026/06/26/akrites-open-source-security-framework/)。問題是這句話反過來也成立：以前資深研究員要花幾週逆向工程才摸得出的漏洞，模型幾分鐘掃完，這種能力很快也會落到攻擊者手上。過去「漏洞公開」到「補丁上線」那段緩衝，是下游系統來得及更新的救命窗口，AI 正在把它關掉。更難看的是數字：最近被驗證的數千個開源漏洞，[修補率不到 5%](https://www.linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)，不是找不到洞，是找到了也修不完。IBM 的 Jamie Thomas 那句「風險已經大到沒有任何一家能單獨扛」，白話就是各修各的來不及了。

<img src="/images/akrites-open-source-security-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 分析程式碼、快速掃出漏洞的螢幕示意">

但這裡要踩一個剎車。把揭露協調做順，解的是「速度」這題，不是「根因」這題。開源真正的病灶，不是回報漏洞的管道太亂，是維護者這一端撐不住：很多關鍵套件背後是一個沒領錢的人在業餘時間維護，或者根本已經跑掉、多年沒碰。Akrites 用一支共用 SIRT 把回報收攏成一條線，這是實打實的改善，回報者不用再對著十幾個專案各喊各的。可是 SIRT 收到洞、驗好、推上游，最後那一哩還是得有人願意、有能力把補丁合進去。Akrites 當「最後維護者」補的是「專案沒人」這個破口，但它[沒有一套直接付錢給維護者的機制](https://devops.com/akrites-the-latest-attempt-to-protect-open-source-from-ai-attacks-has-arrived/)。協調做得再漂亮，也解不了維護者根本人力不足這件事。誘因結構沒動，症狀就會一直長回來。

<img src="/images/akrites-open-source-security-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="開發者深夜獨力維護程式碼，象徵開源維護者的過勞與人力缺口">

而且這塊地並不空。Linux 基金會自己的 Mike Dolan 都承認這個領域[「很擁擠，過往成績也是好壞參半」](https://devops.com/akrites-the-latest-attempt-to-protect-open-source-from-ai-attacks-has-arrived/)。Chainguard 才剛推過性質相近的 Athena 聯盟，IBM 和 Red Hat 也有 Project Lightwell，而 Akrites 的發布[通篇沒提 Athena](https://www.securityweek.com/linux-foundation-unveils-new-open-source-security-project-akrites/)一個字。三案目標高度重疊、彼此不點名，就有點反諷：一個嫌回報太分散而生的計畫，會不會自己先變成又一個分散的來源。判斷它值不值得信，看的不是名單多長，是一年後真的有幾個補丁靠它落地。這跟[之前 LastPass 那場外洩的教訓](/articles/lastpass-klue-oauth-token-breach/)是同一個道理：破口往往在你沒直接掌控、也沒人盯著的那段相依裡。

<img src="/images/akrites-open-source-security-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路與網路節點，象徵軟體供應鏈中層層相依的開源套件">

那台灣該從這條新聞讀出什麼？先認清位置：台灣在開源這條鏈上，絕大多數是下游消費者，不是上游維護者。我們的軟體、韌體、雲端服務裡塞滿開源相依，卻很少是那些關鍵套件的主要維護方。這代表 CVD 窗口打開時，台廠幾乎都站在「收通報」這端，不是「發補丁」那端。要吃到窗口的好處，前提是先知道自己用了什麼：一個套件公布漏洞時，你能不能幾小時內查出哪些產品、哪個版本用到它，靠的是有沒有一份維護良好的軟體物料清單（SBOM）與相依盤點。這跟 Akrites 無關，是台廠自己該先長出來的能力。對關鍵基礎設施業者，資通安全管理法要求的資產盤點與弱點通報，本來就該把開源相依算進去。窗口變窄的時代，來得及反應的，是平常就把家底盤清楚的人。

<img src="/images/akrites-open-source-security-s5.webp" width="960" height="1280" loading="lazy" decoding="async" alt="古代石造城牆與瞭望塔，呼應 Akrites 名稱源自拜占庭邊防軍">

拿邊防軍當名字，是個誠實的隱喻。邊防軍守的是最前線，但一個帝國的存亡從來不只靠邊境那幾個哨站，靠的是後方有沒有持續的補給與人力。Akrites 把哨站建起來了，這一步該給肯定。但如果後方對維護者的長期投資沒跟上，哨站再密，也只是把警報拉得更快而已。看懂它解了哪題、沒解哪題，比記住 19 這個數字重要。

<h2>常見問題</h2>

<p><strong>Akrites 是什麼？跟一般的漏洞回報有什麼不一樣？</strong><br>Akrites 是 Linux 基金會 2026 年 6 月 25 日成立的開源資安應變組織，[核心是一支共用的資安應變隊（SIRT）加一條單一、標準化的漏洞協調揭露流程](https://www.linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)。差別在於，過去回報者要對著各個專案分頭通報，Akrites 把這件事收攏成一條線，統一驗證、去重複、協調修補，並在保密前提下協調對外公布的時機。</p>

<p><strong>為什麼要現在做？跟 AI 有什麼關係？</strong><br>因為前沿 AI 模型幾分鐘就能掃出大型開源專案的漏洞，過去這要幾週，而同樣的能力很快會落到攻擊者手上，把「漏洞公開到補丁上線」的緩衝時間壓縮掉。加上[最近被驗證的數千個開源漏洞修補率不到 5%](https://www.linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)，各家各修已經來不及，才需要一個集中協調的機制。</p>

<p><strong>Akrites 能解決開源維護者人力不足的問題嗎？</strong><br>不能，至少不直接解決。它把回報與協調做順，也會替無人維護的套件當「最後維護者」，但[目前沒有直接付錢給維護者的機制](https://devops.com/akrites-the-latest-attempt-to-protect-open-source-from-ai-attacks-has-arrived/)。維護者沒錢、沒人、專案早就沒人碰，這個根因它只碰到邊，協調速度變快不等於後端修補人力變多。</p>

<p><strong>台灣的公司或開發者該怎麼因應？</strong><br>台灣多半是開源的下游使用者，重點是先盤清自己用了什麼。維護一份軟體物料清單（SBOM）與相依清單，等關鍵套件被公布漏洞時，才有辦法在幾小時內查出哪些產品、哪個版本受影響。對關鍵基礎設施業者，這也呼應資通安全管理法要求的資產盤點與弱點通報，把開源相依納進去。</p>
