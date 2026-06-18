---
title: "當前沿模型開始附帶網路攻防能力：企業與政府的疑慮，是模型釋出治理的下一個門檻"
slug: "frontier-model-cyber-capability-governance"
description: "新一代旗艦模型被點名具備強大網路攻防能力後，企業與政府的不安暴露了一個治理缺口：模型釋出的分級、存取門檻與責任歸屬還沒跟上能力曲線。該補的是治理框架，不是叫大家別用。"
excerpt: "前沿模型攻防同源、能力是真的，技術上擋不掉；缺的是制度。真正的治理缺口不是能力是授權，企業該用風險分類加 ISO/IEC 42001 在能力升級時同步收緊。"
publishDate: "2026-06-30T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["前沿 AI 模型", "網路攻防能力", "AI 模型治理", "Capability-Based Access", "AI 基本法風險分類"]
coverImage: "covers/frontier-model-cyber-capability-governance.webp"
coverAlt: "前沿 AI 模型附帶網路攻防能力，引發企業與政府對釋出治理的疑慮"
coverImageCredit: "Photo by Adi Goldstein on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Anthropic Mythos/Fable 6 月被美國商務部限制出口、76 位資安老將連署反對、G7 為此同桌，凸顯前沿模型攻防能力的釋出治理還沒成形。"
  - "真正的治理缺口不是能力是授權：業界已用 MCP、OpenShell 收緊工具與執行層授權，政策圈卻還停在比參數；下一步該走向依模型能力決定存取門檻的 Capability-Based Access。"
  - "企業別等法規：用《人工智慧基本法》風險分類加 ISO/IEC 42001 管理骨架，在能力升級時同步收緊存取門檻、責任歸屬與動態降階。"
references:
  - title: "Promoting Advanced Artificial Intelligence Innovation and Security（行政命令）"
    url: "https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/"
    publisher: "The White House"
  - title: "Project Glasswing: Securing critical software for the AI era"
    url: "https://www.anthropic.com/glasswing"
    publisher: "Anthropic"
  - title: "Cybersecurity vets protest 'dangerous' US government ban on Anthropic's most powerful models"
    url: "https://techcrunch.com/2026/06/15/cybersecurity-vets-protest-dangerous-us-government-ban-on-anthropics-most-powerful-models/"
    publisher: "TechCrunch"
  - title: "Cybersecurity experts blast US government for restricting Anthropic's AI models"
    url: "https://www.cybersecuritydive.com/news/anthropic-us-government-export-ban-mythos-fable/822909/"
    publisher: "Cybersecurity Dive"
  - title: "G7 leaders vow closer ties on AI as they hash out 'trusted partners' scheme"
    url: "https://www.globalbankingandfinance.com/g7-leaders-vow-closer-ties-ai-they-hash-out-trusted-partners/"
    publisher: "Global Banking & Finance Review"
  - title: "立法院三讀通過《人工智慧基本法》 構築我國 AI 創新與安全治理基石"
    url: "https://moda.gov.tw/press/press-releases/18316"
    publisher: "數位發展部"
  - title: "AI 風險分類框架｜治理與評測"
    url: "https://moda.gov.tw/major-policies/ai/governance/19244"
    publisher: "數位發展部"
  - title: "ISO/IEC 42001:2023 Artificial Intelligence Management System Standards"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001"
    publisher: "Microsoft Learn"
---

六月這幾週，AI 圈吵的不是哪個模型又刷新了跑分，而是一個更難回答的問題：當旗艦模型開始具備真刀真槍的網路攻防能力，誰該管、怎麼管。導火線是 Anthropic 的 Mythos 與 Fable 5。美國[商務部一封信下來](https://www.cybersecuritydive.com/news/anthropic-us-government-export-ban-mythos-fable/822909/)，要求對所有外國人（含 Anthropic 自家外籍員工）停止這兩個模型的存取，Anthropic 乾脆全球暫停。緊接著 [76 位資安老將連署反對](https://techcrunch.com/2026/06/15/cybersecurity-vets-protest-dangerous-us-government-ban-on-anthropics-most-powerful-models/)，[G7 峰會上各國領袖和 AI 大廠 CEO](https://www.globalbankingandfinance.com/g7-leaders-vow-closer-ties-ai-they-hash-out-trusted-partners/) 為了這件事坐到同一張桌子。我的看法是：企業與政府的不安，不是反應過度。它暴露的是一個治理缺口，模型釋出的分級、存取門檻、責任歸屬，全都還沒跟上能力曲線。該補的是治理框架，不是叫大家別用。

<img src="/images/frontier-model-cyber-capability-governance-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="前沿模型網路攻防能力引發資安警訊，數位門鎖象徵存取門檻">

先把「危言聳聽」這個選項排掉。Anthropic 在 [Project Glasswing](https://www.anthropic.com/glasswing) 講得很清楚：Mythos Preview 這顆還沒正式發表的前沿模型，已經找出上千個高風險漏洞，涵蓋每一個主要作業系統與瀏覽器，包括一個在 OpenBSD 躺了 27 年的洞、FFmpeg 裡 16 年的洞，還有好幾個 Linux 核心漏洞被串起來做權限提升。官方那句話最關鍵：讓 AI 在壞人手裡危險的那組能力，正是讓它在找漏洞、補漏洞時無可取代的同一組能力。這就是麻煩所在。攻和防共用同一身本事，你不可能只把「防」發出去、把「攻」鎖在抽屜裡，因為它們是同一個模型的同一種能力。能力曲線是真的拉起來了，這不是行銷話術。

<img src="/images/frontier-model-cyber-capability-governance-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 模型自動掃描程式碼找出軟體漏洞的能力概念圖">

那接下來的問題就不是「要不要怕」，而是「怕了之後該做什麼」。這裡我想借一個老比喻。今天沒有人會說：因為飛機很危險，所以不要造飛機。真正的做法是飛行員執照、航空器認證、維修規範、事故調查。高風險技術從來不是用禁止來管，而是用分級來管。能飛多高、載多少人、誰能駕駛、出事怎麼查，每一層都有對應的門檻和責任。美國政府六月初那道[行政命令](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/)其實就在往這個方向摸：它要建一套機密的評測流程，量「AI 模型的進階網路能力」，超過某個門檻就被指定為「covered frontier model」，由 NSA 局長認定；開發者可以在公開釋出前先給政府最多 30 天的早期存取。這是政府版的「航空器認證」雛形。但它有兩個破綻：一是全程自願，命令裡明文寫著不建立任何強制性的政府核照或預先許可制度；二是它量的、它談的，還是停在能力門檻本身。

<img src="/images/frontier-model-cyber-capability-governance-s3.webp" width="960" height="1451" loading="lazy" decoding="async" alt="飛機駕駛艙象徵航空業以分級與認證治理高風險技術">

這就帶到我認為最關鍵的一點：真正的治理缺口不是能力，是授權。看看現在的不對稱。我們已經在認真討論 AI 會自己規劃、自己執行、自己調用工具，但模型的取得方式，還停在接近「註冊帳號即可使用」的階段。一邊是能自主行動的系統，一邊是幾乎零門檻的取得方式，這兩件事擺在一起，本身就不對稱。而且業界其實已經在補授權這一塊，只是政策圈沒跟上。[MCP 在談工具存取](/articles/mcp-de-facto-standard-agent-governance/)，把 agent 接外部工具標準化；[NVIDIA 的 OpenShell 在談 Runtime Policy](/articles/nvidia-openshell-agent-authorization-layer/)，把護欄做進執行層、agent 自己改不掉；各家的 agent 在談自主執行。工具層、執行層都在收緊授權，但政策圈討論模型時，主詞還是「幾百 B 參數」「跑分多少」。我認為下一階段會冒出一個新概念，姑且叫它 Capability-Based Access：決定誰能用、能用到哪一階，不是看你是不是企業、不是看你付多少錢，而是看這個模型具備什麼能力。能力越接近「能自己找到並利用漏洞」，存取門檻就該越高、要驗的身分與用途就該越多。這跟航空把「能載 300 人的客機」和「能飛的輕航機」分兩套規則管，是同一個邏輯。

<img src="/images/frontier-model-cyber-capability-governance-s4.webp" width="960" height="641" loading="lazy" decoding="async" alt="存取控制與授權鑰匙象徵依能力決定門檻的治理思路">

可是這裡有個更深、也更尷尬的問題：誰有資格決定一個模型「太強了」？六月這場爭執把三種答案攤在桌上。Anthropic 認為問題有限，它說政府點名的是一個「狹窄、非通用的越獄」，要模型去分析程式碼找弱點，而且那些漏洞[相對簡單、其他公開模型也找得到](https://www.cybersecuritydive.com/news/anthropic-us-government-export-ban-mythos-fable/822909/)。美國政府認為必須下架：商務部長 Lutnick 與國家網路主任 Cairncross 具名要求停止對外國人開放 Fable 5 與 Mythos 5。產業界則跳出來反對，76 位資安老將（包含 Alex Stamos、Katie Moussouris、Rachel Tobac 這些業界熟面孔）連署，說這道命令[把最好的模型從防守方手上拿走](https://techcrunch.com/2026/06/15/cybersecurity-vets-protest-dangerous-us-government-ban-on-anthropics-most-powerful-models/)，在對手快速進步時無端削弱防禦，是危險的。三方都不是無理取鬧。模型公司最懂自己模型的邊界、政府扛國安責任、資安社群在第一線靠這些工具補洞。問題是他們對「這個模型該不該放出去」沒有一個共同接受的判準。這就是治理真空：沒有一套大家都認的 Frontier AI 審核機制，於是每次都變成各說各話、各憑力氣。G7 想補這個洞，峰會上各國談「trusted partners」機制，想讓非美國的盟友也能存取美國的頂尖模型；[Macron 說](https://www.globalbankingandfinance.com/g7-leaders-vow-closer-ties-ai-they-hash-out-trusted-partners/)讓 Mythos 更廣泛可用符合華府利益，否則沒人會買隨時可能被關掉的美國 AI；Altman 則喊話別把責任讓給他這種 AI 實驗室，技術由實驗室開發，規則由自由世界的公民來定。方向是對的，但這還停在政治協商，離一套可操作的審核機制還很遠。

<img src="/images/frontier-model-cyber-capability-governance-s5.webp" width="960" height="1182" loading="lazy" decoding="async" alt="天平象徵誰有資格決定一個模型太強了的治理真空">

講了半天國際角力，拉回台灣的企業現場。對大多數公司來說，你不會是那個決定 Mythos 該不該下架的人，但你會是那個決定「自家要不要、怎麼用這一階模型」的人。能力升級時，治理要怎麼同步收緊？這裡有兩個現成的骨架可以接。第一個是法規面。台灣的《人工智慧基本法》已於[民國 114 年 12 月 23 日三讀通過](https://moda.gov.tw/press/press-releases/18316)，主管機關是國科會，[風險分類框架由數位發展部研議](https://moda.gov.tw/major-policies/ai/governance/19244)，做法是先盤點應用、辨識風險、評估衝擊、再回應風險；高風險應用要標示警語、釐清責任歸屬、建立救濟補償機制。這套框架的精神，跟前面講的分級是一致的，不是禁止，而是依風險高低配不同的義務。我[在另一篇拆過這套框架企業該怎麼準備](/articles/ai-basic-law-risk-classification-enterprise-checklist/)，這裡只強調一句：別把「沒被點名」讀成「不用管」。第二個是管理面。[ISO/IEC 42001](https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001) 是全球第一個 AI 管理系統標準（AIMS），把 AI 從設計、開發、部署、監控到退役整條生命週期，變成可稽核、有負責人、有控制點的管理流程。它跟基本法的風險分類剛好互補：一個告訴你哪些用途算高風險、要負什麼義務，一個給你在公司內部怎麼把這些義務落成日常流程。

<img src="/images/frontier-model-cyber-capability-governance-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="企業 AI 治理框架與盤點清單，象徵能力升級時同步收緊治理">

把這兩個骨架接上「能力升級」這條軸，企業可以做一張很實際的對照。模型能力往上跳一階時，至少三格要跟著收緊。第一格是存取門檻。低能力模型給一般員工自助用沒問題；一旦用到具備網路攻防、能自主執行多步動作的高階模型，就該收進限定身分、限定用途、留稽核軌跡的通道，而不是全員一個 API key 通用。這正是把 Capability-Based Access 落到公司內部。第二格是責任歸屬。模型越強、能自己動的範圍越大，「出事算誰的」就越不能含糊。哪些動作必須留人工確認、哪些情境根本不該交給 AI，要在導入前就寫清楚，而不是出事再補。第三格是動態降階。模型不是一次設定就不動，值得參考的是 [Fable 5 的做法](/articles/claude-fable-5-mythos-class-model-tiering/)：碰到資安、生物這類高風險題目，系統會把請求悄悄降一階交給較保守的模型回答。企業內部也可以照這個邏輯，依任務風險自動把高風險請求路由到更嚴的審核或更保守的模型。講到底，這些都呼應我一直在說的兩件事：[可信度靠落地流程，不靠模型多聰明](/articles/llm-healthcare-promise-limits/)；還有[先定義情境，再決定開放多少](/articles/what-is-claw-llm-client-tool/)，順序不能倒。模型能力會繼續往上爬，法規和標準永遠會晚一步。先把存取門檻、責任歸屬、動態降階盤成例行事的公司，會比等條文、等國際共識的同業，更不容易在沒人看的地方滾出治理債。

## 常見問題

### 前沿模型有網路攻防能力，是不是代表它很危險、不該用？

危險和該不該用是兩件事。攻防能力強，代表它在防守端找漏洞、補漏洞也同樣強，Anthropic 的 Project Glasswing 就是把這組能力用在防禦。重點不是禁用，而是依能力高低配相應的存取門檻、用途限制與責任歸屬。

### 什麼是 Capability-Based Access？

這是一種存取治理的思路：決定誰能用、能用到哪一階，不看你是不是企業、付多少錢，而看這個模型具備什麼能力。能力越接近能自主找漏洞、自主執行多步動作，門檻就該越高。它對應的是航空把不同等級的航空器分不同規則管的邏輯。

### 台灣企業現在該做什麼，而不是等法規？

先接兩個骨架：用《人工智慧基本法》的風險分類辨識自家哪些 AI 用途算高風險，用 ISO/IEC 42001 把對應義務落成內部可稽核的管理流程。再盤三格：存取門檻、責任歸屬、能不能依風險動態降階。別把「沒被點名」當成「不用管」。

### 為什麼說這是治理缺口而不是技術問題？

因為能力是真的，而且攻防同源，技術上擋不掉。缺的是制度：模型該怎麼分級釋出、不同能力配多高門檻、出事誰負責，目前連國際上都沒有共同接受的審核機制。六月 Anthropic、美國政府、資安社群各說各話，就是這個真空的證據。
