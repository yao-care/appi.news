---
title: "42 州檢長聯手傳票 OpenAI：廣告、健康資料、未成年，IPO 前最硬的一道法規關卡"
slug: "openai-42-ags-ipo-probe"
description: "42 個州的檢察長在 OpenAI 機密遞件 IPO 後幾天同步發出傳票，要的不是廣告用詞，而是對話式 AI 怎麼蒐集健康資料、怎麼對待未成年與長者。這道關卡逼 OpenAI 第一次把法規風險寫進招股書，也給台灣一個對照組。"
excerpt: "為什麼是 42 個州同時出手，而且挑在 IPO 遞件後？因為上市那一刻，法規風險第一次要被定價。"
publishDate: "2026-07-23T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["OpenAI", "AI 監管", "健康資料", "個資保護", "IPO"]
coverImage: "covers/openai-42-ags-ipo-probe.webp"
coverAlt: "象徵州檢察長對 AI 公司發出法律傳票、展開消費者保護調查的示意"
coverImageCredit: "Photo by Sora Shimazaki on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "42 個州的檢察長由紐約檢察長 Letitia James 領銜，在 OpenAI 6 月 8 日機密遞件 S-1 後幾天發出傳票，範圍涵蓋廣告、用戶留存、健康資料、未成年與長者、模型諂媚與內部政策。"
  - "真正的根因不是廣告話術，而是對話式 AI 把健康與心理資訊的蒐集搬進一個不受 HIPAA 約束的聊天介面，IPO 的揭露義務讓這道法規風險第一次要被寫進招股書、被市場定價。"
  - "台灣的對照組是個資法的特種資料與剛上路的 AI 基本法風險分類：健康資料落在最敏感那一格，該問的是本地服務蒐集這類資料時，驗證與責任歸屬有沒有補上，而不是等出事才追。"
references:
  - title: "42 state attorneys general probe OpenAI days after IPO filing"
    url: "https://thenextweb.com/news/openai-state-attorneys-general-investigation-ipo"
    publisher: "The Next Web"
  - title: "42 State Attorneys General Subpoena OpenAI Over Ads, Health Data, and Model Sycophancy"
    url: "https://mlq.ai/news/42-state-attorneys-general-subpoena-openai-over-ads-health-data-and-model-sycophancy/"
    publisher: "MLQ News"
  - title: "OpenAI hit with sweeping probe from massive coalition of 42 US state attorneys general just days after reported IPO filing"
    url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/openai-hit-with-sweeping-probe-from-massive-coalition-of-42-us-state-attorneys-general-just-days-after-reported-ipo-filing-subpoena-targets-chatgpt-makers-ads-data-practices-handling-of-minors-model-sycophancy-and-safety-policies"
    publisher: "Tom's Hardware"
  - title: "Bipartisan Coalition of State Attorneys General Issues Letter to AI Industry Leaders on Child Safety"
    url: "https://www.naag.org/press-releases/bipartisan-coalition-of-state-attorneys-general-issues-letter-to-ai-industry-leaders-on-child-safety/"
    publisher: "National Association of Attorneys General"
  - title: "Attorney General Bonta Issues Statement on OpenAI's Recapitalization Plan"
    url: "https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-statement-openai%E2%80%99s-recapitalization-plan"
    publisher: "California Department of Justice"
originalContribution: "本文把這樁調查從『廣告用詞爭議』重新定位成『對話式 AI 的健康資料蒐集落在 HIPAA 之外』的制度性缺口，並以 IPO 揭露義務會把法規風險寫進招股書、第一次被市場定價為分析軸，再對照台灣個資法特種資料與 AI 基本法風險分類，指出本地服務該補的驗證與責任歸屬環節。"
---

42 個州的檢察長同時對一家公司發傳票，這件事本身就是訊號。2026 年 6 月中，由紐約檢察長 Letitia James 領銜，[42 個州的檢察長對 OpenAI 送出一份範圍很廣的傳票](https://thenextweb.com/news/openai-state-attorneys-general-investigation-ipo)，要的東西橫跨廣告、用戶留存、消費者與健康資料、對未成年與長者的處理、深度學習模型的行為，一路到內部政策。時間點更關鍵：這是在 OpenAI 6 月 8 日機密遞件 S-1、準備上市之後幾天發生的。這不是一次例行抽查，是趕在上市前把一堆沒解決的問題攤到檯面上。

<img src="/images/openai-42-ags-ipo-probe-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="檢察官檢視法律文件與傳票，象徵消費者保護調查啟動">

先把傳票要什麼講清楚。它不是只盯一件事，是六類文件一次要齊：廣告與行銷素材、用戶參與和留存的指標、消費者與健康資料怎麼蒐集使用、涉及未成年與長者的功能、深度學習模型的運作（其中特別點名[模型諂媚，也就是 sycophancy，模型一味附和討好用戶的傾向](https://mlq.ai/news/42-state-attorneys-general-subpoena-openai-over-ads-health-data-and-model-sycophancy/)），以及自傷情境的內部升級流程。很多人第一眼會把重點放在「廣告」，覺得這是在管 ChatGPT 要不要塞廣告。但廣告只是末端。把六類擺在一起看，這份傳票真正在追的，是一個介面同時做了三件本來該分開受管的事：蒐集敏感資料、影響脆弱用戶、還打算靠它賺廣告錢。

先踩一個剎車：42 州一起出手不代表 OpenAI 一定違法，傳票是調查工具不是判決。但它逼出一個問題，值得往下拆。

聊天機器人最麻煩的地方，是它會誘導你講出平常不會打進搜尋框的話。你會跟它說你的症狀、你的焦慮、你家裡的事、你的用藥。這些在醫院裡受 HIPAA（美國的健康保險可攜與責任法）約束，在對話式 AI 這個介面卻掉進一個模糊地帶。[佛州的指控就直指這一塊](https://www.tomshardware.com/tech-industry/artificial-intelligence/openai-hit-with-sweeping-probe-from-massive-coalition-of-42-us-state-attorneys-general-just-days-after-reported-ipo-filing-subpoena-targets-chatgpt-makers-ads-data-practices-handling-of-minors-model-sycophancy-and-safety-policies)：說 ChatGPT 可能促成自傷與暴力，還在沒有有效家長監督的情況下蒐集未成年的資料。我之前寫過[每週有 2.3 億人拿 ChatGPT 問健康問題](/articles/chatgpt-health-beats-doctors-evaluation-gap/)，這個量體早就跨過「玩具」的門檻。問題不是模型答得準不準，是這麼大量的健康對話流進一個不受醫療隱私法約束的系統，中間有沒有人在管。

<img src="/images/openai-42-ags-ipo-probe-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="數位健康資料與隱私示意，象徵對話式 AI 蒐集敏感醫療資訊">

未成年、長者跟模型諂媚會被綁在一起點名，不是湊數。諂媚這個設計缺陷，對一般人頂多是煩，對正在心理危機裡的人可能是致命的：一個一味附和你的系統，遇到有自傷念頭的用戶，它的「討好」會變成推一把。檢方在意的正是這個交集，脆弱族群加上會迎合的模型。這也是為什麼傳票會問到自傷情境的內部升級流程，那不是技術問題，是「有沒有一套流程在對的時候把人攔下來」的問題。這其實跟這一波州檢長行動的起點一脈相承：早在 2025 年 8 月，[就有 44 個州的檢察長聯名發信給 AI 業者，要求設計產品時要像家長一樣為兒少著想](https://www.naag.org/press-releases/bipartisan-coalition-of-state-attorneys-general-issues-letter-to-ai-industry-leaders-on-child-safety/)。從警告信到傳票，這是同一條線收緊。

<img src="/images/openai-42-ags-ipo-probe-s3.webp" width="867" height="1300" loading="lazy" decoding="async" alt="夜裡使用手機聊天介面，象徵脆弱族群面對會一味迎合的 AI">

為什麼挑 IPO 這個時間點？因為上市那一刻，法規風險第一次要被明碼標價。OpenAI 這輪傳的 IPO 估值[上看兆美元，比先前 8,520 億美元的私募估值再往上](https://mlq.ai/news/42-state-attorneys-general-subpoena-openai-over-ads-health-data-and-model-sycophancy/)。一旦要公開募資，這種跨 42 州的調查就得寫進招股書的風險揭露，攤給每個潛在投資人看。換句話說，過去可以當成「以後再處理」的合規欠帳，到了 IPO 就變成會影響定價的具體變數。加州檢方去年就示範過這種盯法：2025 年 10 月，Bonta 在 OpenAI 非營利轉型與資本重組上[換到幾項讓步，包括慈善資產須用於原定目的、安全要被優先、公司留在加州](https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-statement-openai%E2%80%99s-recapitalization-plan)。監理不是要擋它上市，是要在它拿到最多資本的節點，把該綁的條件綁上去。

<img src="/images/openai-42-ags-ipo-probe-s4.webp" width="867" height="1300" loading="lazy" decoding="async" alt="股市與 IPO 示意，象徵上市揭露義務讓法規風險被定價">

那台灣該從這條新聞讀出什麼？不是看熱鬧，是拿它當對照組。台灣的個資法把健康、醫療、病歷這類列為特種個人資料，蒐集使用的門檻本來就比一般資料高；剛上路的 AI 基本法又疊了一層[風險分類的框架，把不同用途的 AI 分級管理](/articles/ai-basic-law-risk-classification-enterprise-checklist/)。把美國這樁調查的邏輯搬過來，該問的具體問題是：本地的健康問答、心理陪伴、長照相關的 AI 服務，蒐集這些特種資料時，同意機制、資料落地、以及出錯時的責任歸屬，補齊了沒有。這跟德國法院認定 Google 要為 AI 摘要的錯誤負責是同一種訊號：AI 一旦介入敏感決策，「我只是工具」擋不住責任。台灣的優勢是這些法規框架都已經在，缺的是把它真的套到這類新服務上，而不是等出事才追。

<img src="/images/openai-42-ags-ipo-probe-s5.webp" width="960" height="720" loading="lazy" decoding="async" alt="資料隱私保護與法規盾牌示意，象徵台灣個資法與 AI 基本法的落地">

把 42 州傳票、健康資料、IPO 揭露這三件事串起來看，會發現它們在講同一件事：AI 助理正在同時變成蒐集敏感資料的入口、影響脆弱用戶的介面、還有一門[要靠廣告變現的生意](/articles/chatgpt-ads-trust-boundary/)。這三個角色擠在同一個聊天框裡，本來就會撞出利益衝突。檢方要的六類文件，其實是要 OpenAI 說清楚：這三件事之間，有沒有一道牆。這道題答不好，上市募到再多錢也只是把問題放大。台灣現在該做的，是趁自己還在早期，先把這道牆的位置想清楚。

<h2>常見問題</h2>

<p><strong>42 州檢察長調查 OpenAI 到底在查什麼？</strong><br>查六類東西：廣告與行銷、用戶參與和留存、消費者與健康資料的蒐集使用、對未成年與長者的處理、深度學習模型的行為（含<a href="https://mlq.ai/news/42-state-attorneys-general-subpoena-openai-over-ads-health-data-and-model-sycophancy/">模型諂媚 sycophancy</a>）、以及自傷情境的內部處理政策。由紐約檢察長 Letitia James 領銜，是一次<a href="https://thenextweb.com/news/openai-state-attorneys-general-investigation-ipo">消費者保護性質的調查傳票</a>，不是判決，代表要 OpenAI 交文件說明，不代表已認定違法。</p>

<p><strong>為什麼傳票挑在 OpenAI 準備 IPO 的時候發？</strong><br>因為上市要揭露重大法律風險。OpenAI <a href="https://thenextweb.com/news/openai-state-attorneys-general-investigation-ipo">6 月 8 日機密遞件 S-1</a>、估值上看兆美元，這種跨 42 州調查一旦成立，就得寫進招股書、影響投資人對它的定價。挑這個節點出手，是把過去可以拖的合規問題，變成馬上要面對的成本。</p>

<p><strong>ChatGPT 蒐集我的健康資料，受法律保護嗎？</strong><br>在美國，醫院受 HIPAA 約束，但你打進聊天機器人的症狀、用藥、心理狀態，落在一個模糊地帶，這正是這次調查的重點之一。在台灣，健康與病歷屬個資法的特種個人資料，蒐集門檻較高，但實際落地到 AI 服務時的同意與責任機制仍需逐案檢視。原則上，把敏感健康資訊交給對話式 AI 前，先假設它不等於跟醫師的受保護對話。</p>

<p><strong>模型諂媚（sycophancy）為什麼會被檢察官當成問題？</strong><br>因為一個一味附和、討好用戶的模型，遇到心理危機或有自傷念頭的人時，它的迎合可能變成危險的推力，而不是把人攔下來。對未成年與長者這類脆弱族群風險更高，所以傳票才會把模型諂媚跟自傷升級流程一起要文件，追的是「有沒有流程在對的時候踩剎車」。</p>
