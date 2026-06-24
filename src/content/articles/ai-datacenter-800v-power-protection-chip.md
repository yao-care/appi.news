---
title: "AI 缺電的瓶頸下沉到機櫃內：800V 直流配電帶起電源保護晶片新賽道，AlpSemi 募 1700 萬歐元"
slug: "ai-datacenter-800v-power-protection-chip"
description: "AI 缺電的問題正從『去哪找電』下沉到『怎麼把電穩穩送進機櫃』。800V 高壓直流配電讓電源保護半導體成為新卡位點，法國新創 AlpSemi 募 1700 萬歐元主打這層，台灣功率與電源族群值得提早留意。"
excerpt: "談 AI 缺電別只看發電。瓶頸已經下沉到機櫃內的 800V 直流配電與保護，AlpSemi 募 1700 萬歐元卡位電源保護晶片，台廠功率元件、電源管理 IC、伺服器電源廠都有接點。"
publishDate: "2026-07-14T08:00:00+08:00"
category: "tech"
subcategory: "semiconductor"
tags: ["800V HVDC", "電源保護半導體", "AI 資料中心電力", "固態斷路器", "台灣功率元件供應鏈"]
coverImage: "covers/ai-datacenter-800v-power-protection-chip.webp"
coverAlt: "AI 資料中心高壓直流配電與電源保護半導體示意，機櫃內電力線路與供電模組"
coverImageCredit: "Photo by İsmail Enes Ayhan on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "AI 缺電的瓶頸正從電網層的『去哪找電』下沉到機櫃層的『怎麼把電穩穩、安全地送進 GPU』，800V 高壓直流配電讓電源保護半導體變成新卡位點。"
  - "法國新創 AlpSemi 六月底募到 1700 萬歐元，Yotta Capital 領投、Navitas 等跟投，做寬能隙固態斷路器晶片，保護決策從毫秒級壓到微秒級。"
  - "台灣強在電源系統（台達電、光寶科）、功率元件擴產（漢磊、嘉晶）與伺服器代工，但『電源保護晶片』這顆 IP 多在歐美廠手上，卡位點還空著。"
references:
  - title: "AlpSemi raises €17M to advance solid-state circuit breaker technology"
    url: "https://tech.eu/2026/06/23/alpsemi-raises-eur17m-to-advance-solid-state-circuit-breaker-technology/"
    publisher: "Tech.eu"
    note: "AlpSemi 募 1700 萬歐元、Yotta Capital 領投、SE Ventures／Navitas／Cycle Group 跟投、首顆 AS800 為 110V/230V 固態微型斷路器"
  - title: "AlpSemi raises €17m for development of wide-bandgap power switches for AI data centers"
    url: "https://www.datacenterdynamics.com/en/news/alpsemi-raises-17m-for-development-of-wide-bandgap-power-switches-for-ai-data-centers/"
    publisher: "Data Center Dynamics"
    note: "創辦人 Frédéric Dupont（CEO）、Fabrice Letertre（CTO），2024 年成立於法國格勒諾布爾，做寬能隙／超寬能隙固態斷路器，鎖定 800V DC AI 資料中心"
  - title: "AlpSemi Raises €17 Million to Bring Solid-State Circuit Breakers to Buildings and AI Data Centers"
    url: "https://www.unite.ai/alpsemi-raises-e17-million-to-bring-solid-state-circuit-breakers-to-buildings-and-ai-data-centers/"
    publisher: "Unite.AI"
    note: "固態斷路器以電子在微秒級而非毫秒級做保護決策、消除電弧、可遠端監控；AS800 用於 110V/230V"
  - title: "AlpSemi Raises €17 Million to Scale Next-Generation Solid-State Circuit Breaker Power Switches"
    url: "https://www.semiconductor-digest.com/alpsemi-raises-e17-million-to-scale-next-generation-solid-state-circuit-breaker-power-switches-for-buildings-and-ai-data-centers/"
    publisher: "Semiconductor Digest"
    note: "Navitas CEO Chris Allexandre：AI 資料中心轉向 800V DC，對更高功率密度、轉換效率與先進保護的需求變得關鍵；AlpSemi CEO Dupont 引言"
  - title: "Nvidia prepares data center industry for 1MW racks and 800-volt DC power architectures"
    url: "https://www.datacenterdynamics.com/en/news/nvidia-prepares-data-center-industry-for-1mw-racks-and-800-volt-dc-power-architectures/"
    publisher: "Data Center Dynamics"
    note: "機架功率 Hopper 40kW → Blackwell 120kW → 2027 Rubin Ultra Kyber 600kW~1MW；800VDC 同條銅纜多送 150% 電、免 200 公斤銅排、砍中間轉換階"
  - title: "AI 工廠掀電力革命，台達電 HVDC 方案第三季出貨"
    url: "https://technews.tw/2026/06/03/ai-dc-delta-hvdc-third-quarter/"
    publisher: "科技新報 TechNews"
    note: "台達電 ±400V 與 800V HVDC 均獲美系 AI 客戶採用、預計第三季開始出貨，鎖定數百 kW 至兆瓦級 AI 機櫃"
  - title: "HVDC 改寫 AI 資料中心與台股供應鏈"
    url: "https://statementdog.com/news/13940"
    publisher: "財報狗 Statementdog"
    note: "台達電 92% 800V Grid-to-Chip、光寶科 BBU、漢磊／嘉晶擴 SiC 產能、廣達／緯穎／鴻海 OCP ORv3 直流背板、奇鋐／雙鴻液冷"
  - title: "800V HVDC 架構興起，第三代半導體需求升溫"
    url: "https://technews.tw/2026/06/15/ai-data-center-800v-hvdc-third-semiconductor/"
    publisher: "科技新報 TechNews"
    note: "前段高壓由 SiC 鎮守、後段高頻由 GaN 接棒；嘉晶等台廠受惠"
  - title: "Power Stabilization for AI Training Datacenters"
    url: "https://arxiv.org/html/2508.14318v1"
    publisher: "arXiv 2508.14318"
    note: "成千上萬顆 GPU 在算與通訊兩階段同步切換，整座資料中心用電可在一秒內擺盪數十 MW、頻率集中 0.2~3Hz，恐引發次同步共振、電壓閃變與設備受力"
---

<p>AI 缺電的問題，正在從「去哪找電」變成「怎麼把電穩穩送進機櫃」。過去兩年談 AI 電力，焦點都在發電、買電、簽電力長約。現在真正的瓶頸下沉到機櫃裡：當單一機架的功率往 1MW 衝，800V 高壓直流（HVDC）配電架構讓「電源保護半導體」這一層變成一個還沒被講開的卡位點。法國新創 AlpSemi 六月底<a href="https://tech.eu/2026/06/23/alpsemi-raises-eur17m-to-advance-solid-state-circuit-breaker-technology/" target="_blank" rel="noopener">募到 1700 萬歐元，Yotta Capital 領投，SE Ventures、Navitas、Cycle Group 跟投</a>，主打的就是這層。對台灣的功率元件、電源管理 IC 與伺服器電源族群來說，這條供應鏈值得提早留意。</p>

<h2>電力問題的層級，正在往下掉</h2>

<p>先把「層級轉移」這件事講清楚。發電與電網是一層，把電送進機房是一層，把電穩穩、安全地送到每一顆 GPU 又是一層。以前缺電卡在最上面，現在卡點往下掉了。原因是功率密度暴衝：機架功率<a href="https://www.datacenterdynamics.com/en/news/nvidia-prepares-data-center-industry-for-1mw-racks-and-800-volt-dc-power-architectures/" target="_blank" rel="noopener">在輝達 Hopper 世代約 40kW，到 Blackwell 跳到 120kW，2027 年的 Rubin Ultra「Kyber」機架預計衝到 600kW 至 1MW</a>，三年漲二十幾倍。傳統 415V／480V 三相交流配電到這個量級就撐不住。</p>

<img src="/images/ai-datacenter-800v-power-protection-chip-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 資料中心伺服器機房走道與密集電力線路，象徵機櫃功率密度暴增">

<p>解法是把機櫃內的配電拉高到 800V 直流。好處很實際：同一條銅纜<a href="https://www.datacenterdynamics.com/en/news/nvidia-prepares-data-center-industry-for-1mw-racks-and-800-volt-dc-power-architectures/" target="_blank" rel="noopener">可以多送 150% 以上的電，省掉餵單一機架要用的 200 公斤銅排，還砍掉中間好幾道交直流轉換</a>，效率和總持有成本都往下壓。但電壓拉高、電流變大之後，新的問題接著來：這麼粗的一條直流電，萬一短路或故障，要怎麼在毫秒之內安全切斷。這就是電源保護晶片要解的題。</p>

<h2>AlpSemi 卡的，是「把電切斷」這一層</h2>

<p>AlpSemi 不做 GPU、也不做電源轉換的主力元件，它做的是斷路器裡的那顆開關。這家公司<a href="https://www.datacenterdynamics.com/en/news/alpsemi-raises-17m-for-development-of-wide-bandgap-power-switches-for-ai-data-centers/" target="_blank" rel="noopener">2024 年成立於法國格勒諾布爾，創辦人是執行長 Frédéric Dupont 與技術長 Fabrice Letertre，做的是寬能隙與超寬能隙的固態斷路器功率開關</a>。第一顆產品 AS800 還不是給資料中心用的，<a href="https://tech.eu/2026/06/23/alpsemi-raises-eur17m-to-advance-solid-state-circuit-breaker-technology/" target="_blank" rel="noopener">而是 110V／230V 的固態微型斷路器，用在住宅與商業建築</a>，800V DC 資料中心是它接下來的路線圖。</p>

<img src="/images/ai-datacenter-800v-power-protection-chip-s2.webp" width="960" height="628" loading="lazy" decoding="async" alt="電源保護半導體與固態斷路器晶片的功率元件特寫">

<p>固態斷路器跟家裡那種會「啪」一聲跳開的機電式斷路器，差在哪？差在用半導體加數位控制取代機械接點。它<a href="https://www.unite.ai/alpsemi-raises-e17-million-to-bring-solid-state-circuit-breakers-to-buildings-and-ai-data-centers/" target="_blank" rel="noopener">把保護決策做在微秒級而不是毫秒級，沒有機械火花、可以遠端監控與控制</a>。快這幾個數量級，在 800V、大電流的環境裡就是能不能在故障擴大前擋下來的關鍵。投資人裡的功率晶片廠 Navitas，執行長 Chris Allexandre 講得直接：<a href="https://www.semiconductor-digest.com/alpsemi-raises-e17-million-to-scale-next-generation-solid-state-circuit-breaker-power-switches-for-buildings-and-ai-data-centers/" target="_blank" rel="noopener">AI 資料中心轉向 800V DC 後，對更高功率密度、更好的轉換效率與先進保護的需求會變得很關鍵</a>。錢往這裡擺，押的就是保護這一層會獨立長出一個市場。</p>

<h2>你知道 AI 伺服器突然斷電會怎麼樣嗎</h2>

<p>講到這裡我自己最先想到的，其實不是缺電，是另一件事：AI 伺服器要是突然斷電，會怎麼樣？這不是嚇人的假設。一個訓練 job 跑好幾天，電一斷、又剛好沒存到 checkpoint，就得退回上一個存檔點，前面幾小時的算力等於白燒。這還算溫和的。</p>

<img src="/images/ai-datacenter-800v-power-protection-chip-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="伺服器電源供應器與機櫃供電線路，象徵 AI 機房的供電穩定與保護">

<p>更難纏的是反過來。成千上萬顆 GPU 是同步在跑的，運算階段一起拉到接近滿載、通訊同步階段又一起掉到接近待機，<a href="https://arxiv.org/html/2508.14318v1" target="_blank" rel="noopener">整座資料中心的用電可以在一秒內擺盪幾十 MW，振盪頻率集中在 0.2 到 3Hz</a>。這個頻段很尷尬，剛好會去敲到發電機與輸電線的共振帶，研究指出可能引發次同步共振、電壓閃變，甚至讓設備長期受力。所以機櫃內那層保護不是配角。斷得夠快、夠準，才能把這些瞬態擋在機櫃裡，不讓它往上游電網竄。固態斷路器壓到微秒級的價值，正是在這種會連鎖的瞬態前面，先把門關起來。</p>

<h2>這條鏈，台灣接得到哪幾段</h2>

<p>把鏡頭轉回台股。800V HVDC 這條鏈，台廠站的位置其實不少。電源系統這端，<a href="https://technews.tw/2026/06/03/ai-dc-delta-hvdc-third-quarter/" target="_blank" rel="noopener">台達電的 ±400V 與 800V HVDC 方案都拿到美系 AI 客戶、預計第三季開始出貨，鎖定數百 kW 到兆瓦級的機櫃</a>。再往周邊看，<a href="https://statementdog.com/news/13940" target="_blank" rel="noopener">台達電端出 92% 效率的 800V「Grid-to-Chip」方案、光寶科切備援電池（BBU）、漢磊與嘉晶擴 SiC 產能、廣達與緯穎與鴻海升級 OCP ORv3 直流背板、奇鋐與雙鴻吃液冷</a>。功率元件分工也清楚：<a href="https://technews.tw/2026/06/15/ai-data-center-800v-hvdc-third-semiconductor/" target="_blank" rel="noopener">前段高壓由碳化矽（SiC）鎮守、後段高頻由氮化鎵（GaN）接棒</a>。</p>

<img src="/images/ai-datacenter-800v-power-protection-chip-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板上的功率電子元件與電源模組，象徵台灣功率與電源供應鏈">

<p>但這裡要踩一個剎車。台灣的強項是電源系統、功率元件擴產與伺服器代工，這幾段都吃得到。可是 AlpSemi、Navitas 在卡的那顆「電源保護晶片」的核心 IP，目前多半握在歐美廠手上，台廠著墨相對少。這不是說台灣沒機會，而是說這個卡位點還空著、值得功率族群盯著。選邊之前，順序別倒：先看清楚自家在 800V 這層做的到底是系統、是元件、還是那顆 IP，再決定要往哪一段加碼。缺電是被寫爛的題，但底下這一層，才剛開始有人卡位。</p>

<h2>常見問題</h2>

<p><strong>什麼是 800V DC（HVDC）資料中心，為什麼 AI 要改用？</strong><br>因為 AI 機架功率暴衝，傳統交流配電撐不住。輝達機架功率<a href="https://www.datacenterdynamics.com/en/news/nvidia-prepares-data-center-industry-for-1mw-racks-and-800-volt-dc-power-architectures/" target="_blank" rel="noopener">從 Hopper 的 40kW 一路衝到 2027 年 Rubin Ultra 的 600kW 至 1MW</a>，改用 800V 高壓直流可以用同條銅纜多送 150% 以上的電、省掉笨重銅排、砍掉中間幾道轉換，效率與成本都更好。</p>

<p><strong>AI 伺服器突然斷電會怎麼樣？</strong><br>輕則訓練進度退回上一個 checkpoint、前面幾小時算力白費。更麻煩的是反向問題：<a href="https://arxiv.org/html/2508.14318v1" target="_blank" rel="noopener">成千上萬顆 GPU 同步在運算與通訊間切換，整座資料中心用電可在一秒內擺盪數十 MW，落在 0.2 至 3Hz 的頻段</a>，可能引發電網次同步共振與電壓閃變，所以機櫃內要有夠快的保護把瞬態擋下來。</p>

<p><strong>固態斷路器和傳統斷路器差在哪？</strong><br>傳統機電式斷路器靠機械接點跳開，固態斷路器用半導體加數位控制。它<a href="https://www.unite.ai/alpsemi-raises-e17-million-to-bring-solid-state-circuit-breakers-to-buildings-and-ai-data-centers/" target="_blank" rel="noopener">把保護決策從毫秒級壓到微秒級，沒有電弧火花、可遠端監控</a>，在 800V、大電流的資料中心環境裡，這個反應速度是能不能在故障擴大前切斷的關鍵。</p>

<p><strong>台灣有哪些公司吃得到 800V HVDC 這條供應鏈？</strong><br>電源系統有<a href="https://technews.tw/2026/06/03/ai-dc-delta-hvdc-third-quarter/" target="_blank" rel="noopener">第三季出貨 HVDC 方案的台達電</a>，周邊還有<a href="https://statementdog.com/news/13940" target="_blank" rel="noopener">光寶科（BBU）、漢磊與嘉晶（SiC 擴產）、廣達與緯穎與鴻海（直流背板）、奇鋐與雙鴻（液冷）</a>。不過真正「電源保護晶片」這顆 IP 目前多在歐美廠，是這條鏈裡台廠著墨較少、值得留意的一段。</p>
