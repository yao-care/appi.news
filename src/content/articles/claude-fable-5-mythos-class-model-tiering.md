---
title: "Claude Fable 5 開出「Mythos 級」新層級：模型分層對開發者到底差在哪"
slug: "claude-fable-5-mythos-class-model-tiering"
description: "Anthropic 6 月 9 日把 Fable 5 推上「Mythos 級」，一個比 Opus 高一階的正式產品層。真正該看的不是 80.3 這種跑分，而是它在長任務、agentic coding 上的領先會隨任務難度拉開。這篇拆解這個分層對開發者選型的實際意義：哪些工作值得用貴一倍的模型、哪些 Opus 4.8 就夠。"
excerpt: "Anthropic 6 月 9 日把 Fable 5 推上「Mythos 級」，一個比 Opus 高一階的正式產品層。真正該看的不是 80.3 這種跑分，而是它在長任務、agentic coding 上的領先會隨任務難度拉開。這篇拆解這個分層對開發者選型的實際意義。"
publishDate: "2026-06-16T22:56:27.649Z"
category: "tech"
subcategory: "ai"
tags: ["Claude Fable 5", "Mythos 5", "AI 模型分層", "模型選型", "agentic coding"]
coverImage: "covers/claude-fable-5-mythos-class-model-tiering.webp"
coverAlt: "AI 模型能力一層疊一層往上分層，最頂端是新開出的層級"
author: "lightman"
status: "published"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文由 APPI 編輯部以 AI 輔助起草，經人工查證來源、編輯與校對後刊出。"
highlights:
  - "Mythos 級是 Anthropic 開在 Opus 之上的一層，Fable 5 定價約為 Opus 4.8 的兩倍；真正的訊號不是跑分高，是它在難題上領先得更多。"
  - "選型要先把任務難度分清楚再決定用哪一階：短而規則明確的任務 Opus 4.8 就夠，長鏈、跨檔案、要自我驗證的 agentic 任務才值得貴一倍。"
  - "越強的 AI 被套上越多限制，碰到高風險題目會被悄悄降一階回答，加上不少動作改成手動確認，這是『變笨』論述的一部分來源，也是便利與安全的取捨。"
references:
  - title: "Claude Fable 5 and Claude Mythos 5"
    url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
    publisher: "Anthropic"
    note: "官方公告：Mythos 級定義、與 Mythos 5 同底層、定價、任務越複雜領先越大、分類器改由 Opus 4.8 回答"
  - title: "Claude Fable 5 & Claude Mythos 5 Full Benchmark Breakdown"
    url: "https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained"
    publisher: "Vellum"
    note: "SWE-Bench Pro 80.3% vs 69.2%、FrontierCode Diamond 29.3% vs 13.4%、定價 $10/$50 vs $5/$25"
  - title: "Claude Fable 5: API, Benchmarks, Pricing & How to Use It"
    url: "https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it"
    publisher: "TrueFoundry"
    note: "定價約 Opus 4.8 兩倍、100 萬 token 脈絡視窗、6 月 9 日發布"
  - title: "Anthropic releases Claude Fable 5 and Mythos 5 with major gains in coding and science"
    url: "https://the-decoder.com/anthropic-releases-claude-fable-5-and-mythos-5-with-major-gains-in-coding-and-science/"
    publisher: "The Decoder"
    note: "分類器把高風險請求自動轉給 Opus 4.8、影響不到 5% 對話、跑分總表"
  - title: "Anthropic released Claude Fable 5, its most powerful model publicly, days after warning AI is getting too dangerous"
    url: "https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/"
    publisher: "TechCrunch"
    note: "在警告 AI 太危險、呼籲業界裝剎車後幾天才公開；強制 30 天留存抓新型攻擊；外部抓漏逾千小時無通用越獄"
  - title: "Claude Fable 5's SWE-Bench Pro Score Is Contested: What Independent Evaluators Actually Confirm"
    url: "https://techjacksolutions.com/ai-brief/claude-fable-5s-swe-bench-pro-score-is-contested-what-indepe/"
    publisher: "TechJack Solutions"
    note: "80.3% 為廠商以自家 scaffolding 跑出，非中立評測環境，獨立來源數字不同"
---

<p>Anthropic 在 6 月 9 日上線 <a href="https://www.anthropic.com/news/claude-fable-5-mythos-5" target="_blank" rel="noopener">Claude Fable 5，並順手開了一個新的產品層級叫「Mythos 級」</a>。很多人第一個反應是去翻跑分表，看它贏 Opus 4.8 幾分。這個方向沒有錯，但只盯著分數，很容易看錯重點。</p>

<p>我想先踩一個剎車。一個模型贏對手 11 分，對你每天的工作幾乎沒有意義；真正會改變決策的，是「這多出來的能力到底在什麼任務上才看得出來」。Fable 5 最關鍵的訊號不是它考了幾分，而是官方自己講的一句話：<a href="https://www.anthropic.com/news/claude-fable-5-mythos-5" target="_blank" rel="noopener">任務越長、越複雜，它領先其他模型的幅度就越大</a>。這句話才是分層的重點，也是這篇要拆的東西。</p>

<h2>Mythos 級是什麼：一個比 Opus 高一階的正式產品層</h2>

<p>先把名詞講清楚。Anthropic 把 <a href="https://www.anthropic.com/news/claude-fable-5-mythos-5" target="_blank" rel="noopener">Mythos 級定義成「比 Opus 級更高一階的一層模型」</a>，第一個 Mythos 級模型是 4 月透過 Project Glasswing 放出的 Claude Mythos Preview，只給少數對象。這次的 Fable 5 是同一套底層模型，差別在 Fable 5 替一般人加了安全護欄，而拿掉護欄的版本叫 Mythos 5，只開放給政府與少數通過審核的單位。</p>

<p>定價也標出了它的位階。<a href="https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it" target="_blank" rel="noopener">Fable 5 是每百萬輸入 token 10 美元、輸出 50 美元，差不多是 Opus 4.8（5 美元 / 25 美元）的兩倍，脈絡視窗一樣是 100 萬 token</a>。換句話說，Anthropic 不是把它當成 Opus 的小改款，而是當成一個要你多付一倍錢、放在 Opus 之上的正式層級在賣。這件事本身就逼出一個問題：什麼工作值得多付這一倍？</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="一個比現有頂層更高一階的新產品層級正式登場">

<h2>真正的訊號不是 80.3 分，是領先幅度會隨難度拉開</h2>

<p>先把跑分看完，再說為什麼別只看跑分。在量軟體工程能力的 SWE-Bench Pro 上，<a href="https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained" target="_blank" rel="noopener">Fable 5 拿 80.3%，Opus 4.8 是 69.2%</a>，聽起來是 11 分的差距。但同一份比較裡換到更難的 FrontierCode Diamond，<a href="https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained" target="_blank" rel="noopener">Fable 5 是 29.3%，Opus 4.8 只有 13.4%，直接翻了一倍以上</a>。</p>

<p>這兩組數字放在一起才有意思。在「中等難度」的題目上，兩個模型差 11 分；在「最難」的題目上，差距拉到兩倍。這正好對上官方的說法，<a href="https://www.anthropic.com/news/claude-fable-5-mythos-5" target="_blank" rel="noopener">任務越長越複雜，Fable 5 的領先越大</a>。所以該記住的不是某個絕對分數，而是這條規律：它的價值不在平均分高一點，而在難題上能拉開，在簡單題上其實跟 Opus 差不多。這條規律，才是選型真正要用的東西。</p>

<p>這裡得再踩一個剎車。80.3% 這個數字本身要打點折扣：<a href="https://techjacksolutions.com/ai-brief/claude-fable-5s-swe-bench-pro-score-is-contested-what-indepe/" target="_blank" rel="noopener">它是廠商用自己的測試框架（scaffolding）跑出來的，不是中立的評測環境</a>。絕對分數本來就不該照單全收。但這反而更說明前面那條規律才是重點：就算分數有水分，「難題上拉開、簡單題上接近」這個形狀，在不同來源的比較裡是一致的，而你做選型靠的是這個形狀，不是某一個被廠商條件美化過的小數點。</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="兩條成長曲線隨任務難度拉開差距，領先幅度越來越大">

<h2>先把「任務難度」分清楚，再回頭挑哪一階模型</h2>

<p>這裡是我一直在講的老毛病：選工具的順序常常被倒過來。正確的順序是先定義你要解的任務長什麼樣，再看哪一階模型符合前提，最後才比較具體選項。把順序倒過來，先看誰跑分高、再硬找任務塞給它，是選型最常見的失敗模式。我在<a href="/appi.news/articles/post-280/">先前談 LLM 工具選型那篇</a>講過同一件事：工具能力跟底層模型能力是兩回事，選型要從使用情境的前提出發，不是從功能清單出發。</p>

<p>套到這次的分層，問題就很具體：你手上這個任務，到底落在「難題」那一端，還是「日常重複」那一端？如果是一句話能講清楚、改一個函式、產一段固定格式的東西，Fable 5 的領先在這種任務上幾乎看不出來，多付的那一倍錢是純浪費。但如果是要跨很多檔案、連續判斷很多步、還得自己驗證自己的那種長鏈 agentic 任務（讓模型自己一路規劃、動手、再檢查的工作型態），領先幅度才會真的反映在結果上。先把任務難度分清楚，再回頭挑模型，順序不能倒。</p>

<p>為什麼難度這麼關鍵？因為長鏈任務的錯誤會累積。一個要連續判斷二十步的工作，每一步的小失誤都會被往下游帶、被放大；模型在這種任務上多出來的那點穩定度，到結尾可能就是「整條跑完」跟「中途歪掉要你回去收」的差別。短任務沒有這個累積效應，所以強一階的模型在短任務上看起來跟 Opus 4.8 差不多，不是它不強，是這種任務根本用不到它強的地方。這就是為什麼我不先問「哪個模型分數高」，而是先問「我這題的根因是長度、是步數、還是單純難」，問題的形狀決定了答案。</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="把任務依難度分層後再決定用哪一階工具的選型流程">

<h2>哪些工作值得貴一倍、哪些 Opus 4.8 就夠</h2>

<p>把上面那條規律落成一張可以對照的表。重點不是「Fable 5 比較強所以都用它」，而是把成本跟任務難度對起來。</p>

| 任務型態 | 例子 | 建議用哪一階 | 為什麼 |
|---|---|---|---|
| 短、規則明確、低風險 | 改一個函式、套版、固定格式抽取 | Opus 4.8 或更省的 | 領先在這幾乎看不出來，多付一倍是浪費 |
| 中等、多步但邊界清楚 | 一般功能開發、有測試接得住的重構 | 看預算，兩者皆可 | 差約 11 分，值不值得看你對錯誤的容忍度 |
| 長鏈、跨檔案、要自我驗證 | 大型重構、長時間 agentic coding、難題除錯 | Fable 5 | 難度越高領先越大，這時那一倍錢才換得到東西 |

<p>這張表的邏輯很簡單：貴一倍的模型只在「難度高到領先看得出來」的任務上才划算，其餘往下放。這跟模型本身強不強沒關係，跟你這個任務有沒有用到它強的地方才有關係。落地設計的品質，你怎麼切任務、怎麼接驗證，一直比模型本身的強弱更關鍵，這點我在<a href="/appi.news/articles/post-282/">先前談 LLM 是不是醫療救贖那篇</a>也說過。</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="成本與任務難度對應的決策表，貴一倍的工具只用在最難的任務">

<h2>越強的 AI，人類給它的限制就越多</h2>

<p>講完選型，得講一件這次改版裡更有意思的事。Fable 5 能公開放出來，靠的不是它更聽話，而是 Anthropic 在它外面加了一圈限制。<a href="https://the-decoder.com/anthropic-releases-claude-fable-5-and-mythos-5-with-major-gains-in-coding-and-science/" target="_blank" rel="noopener">當分類器判斷你的問題碰到資安、生物、化學這些高風險領域，系統會悄悄把這題交給比較弱的 Opus 4.8 去回答，官方說這影響不到 5% 的對話</a>。而且 Anthropic 是在<a href="https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/" target="_blank" rel="noopener">公開警告「AI 正變得太危險」、呼籲業界裝一個「協調的剎車」之後沒幾天，才把這個最強的模型放出來</a>。</p>

<p>這正是作者本人最有感的地方。隨著 AI 越來越強大，人類也開始增加諸多限制給它。原本 AI 可以在使用者同意下提升自己的權限，這次改版後變成只能由使用者手動操作，避免 AI 為了達成某些目的硬繞過限制。出發點當然是安全。但對使用者而言，這卻大大增加了使用上的不便，網路上也因此冒出一股覺得它變笨了的論述。</p>

<p>把這兩件事擺在一起看就很清楚：你以為自己在用最強的模型，但碰到某些題目，回你的其實是被降一階的 Opus 4.8；你以為 AI 會自己把事情做完，但很多動作現在得你手動點頭。「變笨」的感覺，有一部分就是這些限制造成的，不一定是模型真的退步。這回到我一直在講的一個框架：要不要信任一個系統，看的是它的誘因結構，不是它的能力。我在<a href="/appi.news/articles/post-278/">先前談 LLM 不會打從心底佔你便宜那篇</a>說過，機器值得信任，是因為它的運作機制裡沒有要佔你便宜的理由。現在多了一層：當廠商為了安全主動把能力收回去、把開關交還給你，這是保護，但保護的代價是便利。</p>

<p>Anthropic 自己對這層限制其實下了不少功夫。<a href="https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/" target="_blank" rel="noopener">它跑了外部抓漏，超過一千小時測試裡沒被找到通用的越獄破口，才敢公開放</a>。這代表廠商是認真把「能力收一點、安全多一點」當成發布的前提，而不是事後再補的。對開發者來說，這帶出一個很實際的習慣：別預設你呼叫的就是最強那一階，也別預設 AI 會自動幫你把需要提權的步驟做完。哪些動作要它自己跑、哪些一定要你手動點頭，現在是你得明確設定的東西，不是它替你決定的。</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="越強大的 AI 被人類套上越多安全限制與手動關卡">

<h2>便利與安全之間：會不會看都沒看就簽名</h2>

<p>作者本人提了一個很準的類比：這其實有點像隱私權或使用者條款的議題。會不會為了方便，人們願意犧牲自己的權利，看都沒看條款就簽名？放到 AI 這邊是反過來的版本：為了安全，我們願意放掉多少便利？又或者，為了便利，我們願意讓 AI 自己多走幾步、少問我們幾次？</p>

<p>這個拿捏沒有標準答案，而且兩個方向都會出事。限制給太鬆，AI 為了達成目標硬繞過該停的地方；限制給太緊，使用者嫌煩，乾脆關掉所有確認、把權限一次開好開滿，那跟沒看條款就按「我同意」其實是同一件事。Anthropic 這次的做法，連同它<a href="https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/" target="_blank" rel="noopener">對所有流量強制留 30 天紀錄、用來抓新型攻擊</a>，本質上是把一部分便利換成可被稽核的安全。值不值得，得看你是誰、在做什麼。</p>

<p>究竟在便利性和安全性之間要怎麼拿捏，一直是人們努力的話題。對開發者來說，這件事跟前面的選型其實是同一個問題的兩面：你不只是在選「哪一階模型」，你也在選「願意把多少判斷、多少權限交給它」。這兩個選擇都不該預設答案，而是看你這個任務的難度與風險，分清楚了再決定。</p>

<img src="/images/claude-fable-5-mythos-class-model-tiering-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="便利與安全之間的天平，像沒看條款就簽名的取捨">

<h2>常見問題</h2>

<p><strong>Claude Fable 5 是不是直接取代 Opus 4.8？</strong><br>不是。它是 Opus 之上的另一層，<a href="https://www.truefoundry.com/blog/claude-fable-5-api-benchmarks-pricing-how-to-use-it" target="_blank" rel="noopener">定價約兩倍</a>。它在難題、長任務上領先明顯，但在短而規則明確的任務上跟 Opus 4.8 差不多，那種場景用 Fable 5 只是多花錢。把它當成「難題專用」的一階，而不是全面換掉 Opus。</p>

<p><strong>為什麼有人覺得 Fable 5「變笨」？</strong><br>一部分是因為當問題碰到資安、生物等高風險領域，<a href="https://the-decoder.com/anthropic-releases-claude-fable-5-and-mythos-5-with-major-gains-in-coding-and-science/" target="_blank" rel="noopener">系統會自動把它交給比較弱的 Opus 4.8 回答，影響不到 5% 的對話</a>；另一部分是這一代普遍把不少需要 AI 自己提權的動作，改成要使用者手動確認。這些是刻意加的限制，不一定代表模型本身退步。</p>

<p><strong>那我該怎麼決定一個任務要不要用 Fable 5？</strong><br>先別問模型，先問任務：它有多長、要連續判斷幾步、做錯的代價多大。長、步數多、錯了難收回的，才把它放到 Fable 5 這一階；短、規則明確、錯了好改的，留在 Opus 4.8。決定權在任務的形狀，不在模型的招牌。</p>

<h2>結語</h2>

<p>Fable 5 把「比 Opus 高一階」做成一個你要多付一倍錢的正式產品層。它真正的訊號不是 80.3 這個分數，而是領先幅度會隨任務難度放大，這決定了你該把哪一類工作交給哪一階模型，而不是無腦全用最貴的。另一邊，越強的 AI 被套上越多限制，把一部分便利換成安全。兩件事其實是同一個判斷：先把任務的難度與風險分清楚，再決定要用哪一階、要交出多少權限。順序對了，貴一倍的錢跟多出來的麻煩，才花得有道理。</p>
