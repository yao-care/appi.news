---
title: "Anthropic 把 Claude 變成 Slack 裡的「同事」：全公司共用一個 AI 身分，權限邊界與可追責怎麼設"
slug: "claude-tag-slack-shared-identity-governance"
description: "Anthropic 6/23 推出 Claude Tag，讓員工在 Slack 直接 @Claude 派活、非同步交接半成品，全公司共用同一個 Claude 身分。好用的代價是這個身分能讀對話、跨頻道存取資料，導入前要先把工具範圍、資料權限與稽核軌跡定義清楚。"
excerpt: "Anthropic 6/23 推出 Claude Tag，讓員工在 Slack 直接 @Claude 派活、非同步交接半成品，全公司共用同一個 Claude 身分。好用的代價是這個身分能讀對話、跨頻道存取資料，企業導入前要先把工具範圍、資料權限與稽核軌跡定義清楚，否則「單一身分」會變成資料邊界的破口。"
publishDate: "2026-07-16T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["Claude Tag", "Slack AI agent", "共用 AI 身分", "scoped data controls", "企業 AI 權限治理"]
coverImage: "covers/claude-tag-slack-shared-identity-governance.webp"
coverAlt: "Anthropic Claude Tag 進駐 Slack 頻道，成為全公司共用的 AI 同事，權限與問責怎麼設"
coverImageCredit: "Photo by Annie Spratt on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Anthropic 6/23 推出 Claude Tag（Claude Enterprise／Team 研究預覽），讓員工在 Slack 直接 @Claude 派活、非同步交接半成品，全頻道共用同一個 Claude 身分。"
  - "好用的代價是這個身分會跟著頻道讀對話、能存取被授權的工具與資料；官方主打 scoped data controls，由管理員定義它能碰哪些工具、資料、頻道，並留下操作紀錄。"
  - "對台灣中小團隊，先界定 Claude Tag 能碰哪些頻道與系統、留不留稽核，再談效率；否則「單一身分」會變成資料邊界的破口。"
references:
  - title: "Introducing Claude Tag"
    url: "https://www.anthropic.com/news/introducing-claude-tag"
    publisher: "Anthropic"
    note: "官方公告：頻道內單一 Claude、multiplayer、會持續學頻道脈絡、非同步自排任務、65% 產品團隊程式碼由內部版產出、管理員可定義工具/資料/記憶與分頻道存取、ambient 模式、token 花費上限、可看 @Claude 做過什麼的紀錄、Enterprise/Team beta、30 天移轉期"
  - title: "Anthropic launches Claude Tag, a tool that works like a virtual employee within Slack"
    url: "https://fortune.com/2026/06/23/anthropic-claude-tag-virtual-employee-tool-slack/"
    publisher: "Fortune"
    note: "6/23、virtual employee、Cat Wu 引述 multiplayer、scoped 防跨團隊外洩（HR 資料不會流到工程）、頻道與組織層級 token 上限、研究預覽 Enterprise/Team"
  - title: "Anthropic debuts Claude Tag, a more capable AI teammate that lives within Slack"
    url: "https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/"
    publisher: "SiliconANGLE"
    note: "全公司透過單一 Claude『identity』共用同一工具、管理員選哪些頻道/工具/資訊、法務團隊的 Claude 不會進工程頻道、持續脈絡與記憶、交接半成品、ambient 模式"
---

<p>Anthropic 在 6 月 23 日推出 Claude Tag，<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">讓團隊在 Slack 頻道裡直接 @Claude 派活，同一個頻道裡只有一個 Claude、所有人共用它</a>，先在 Claude Enterprise 與 Team 開研究預覽。好用的地方很明確，但代價也一樣明確：這個共用身分會跟著頻道讀對話、能存取被授權的工具與資料。企業要導入，第一件事不是試它聰不聰明，是先把它能碰哪些工具、哪些資料、哪些頻道，以及操作留不留得下稽核軌跡定義清楚。否則「全公司共用一個 AI 身分」這個賣點，會直接變成資料邊界的破口。</p>

<img src="/images/claude-tag-slack-shared-identity-governance-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="在 Slack 團隊頻道裡 @Claude 直接派活的共用 AI 隊友示意">

<h2>Claude Tag 到底改了什麼</h2>

<p>先把東西講清楚。過去你在 Slack 用 Claude，是你一個人對一個私人的對話。Claude Tag 把單位從「個人對話」搬到「團隊頻道」。<a href="https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/" target="_blank" rel="noopener">同一個頻道裡只有一個 Claude，跟所有人互動，誰都看得到它正在做什麼，也能從別人離開的地方接手</a>。Anthropic 把它講成 multiplayer，<a href="https://fortune.com/2026/06/23/anthropic-claude-tag-virtual-employee-tool-slack/" target="_blank" rel="noopener">負責 Claude Code 與 Cowork 的產品主管 Cat Wu 的說法是，Claude Tag 在頻道裡工作時，每個人都看得到、都能跳進來把它導回正確方向</a>。</p>

<p>它還會跟著頻道長記憶。<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">官方說 @Claude 會隨著跟進頻道而累積對工作的脈絡，你不必每次從頭解釋；它也能非同步工作，你交它一個任務、自己去忙別的，它甚至會替自己排後續任務</a>。Anthropic 拿自家當招牌：<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">現在產品團隊有 65% 的程式碼是由內部版的 Claude Tag 產出的</a>。能力面我沒有要吵，這篇要談的是另一半。</p>

<img src="/images/claude-tag-slack-shared-identity-governance-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="多人共用同一個 AI 身分、非同步交接半成品工作的協作示意">

<h2>共用身分的真正代價：權限與問責</h2>

<p>把一個會讀對話、會自己動手的身分交給全公司共用，方便和風險是同一個東西的兩面。它好用，正是因為它跟著頻道讀脈絡、碰得到被授權的工具與資料；而它危險，也正是因為這些。重點不在「AI 變同事好方便」，在於共用身分加上自動讀對話，把權限邊界和問責設計一次推到檯面上：這個身分能讀到誰的對話、跨不跨頻道、出了事查不查得到是誰指使的。</p>

<p>Anthropic 自己也把答案押在這裡。<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">官方主打對敏感資料與特定工具的存取可以「很緊地控制」，由管理員定義 Claude 在哪些頻道能用哪些工具、資訊與記憶，為不同用途切出各自獨立的 Claude 身分</a>。<a href="https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/" target="_blank" rel="noopener">管理員選定哪些頻道、工具與資訊給某個 Claude Tag 身分，它就只留在那些頻道，譬如法務團隊的 Claude 不會跑進工程頻道</a>。可追責的部分也有：<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">管理員能設 token 花費上限，並查看 @Claude 做過的所有事的紀錄</a>。<a href="https://fortune.com/2026/06/23/anthropic-claude-tag-virtual-employee-tool-slack/" target="_blank" rel="noopener">Fortune 也點到這層分隔的用意，是擋掉跨團隊外洩，例如 HR 的資料不會流到工程</a>。換句話說，這套產品內建了治理鈕，但鈕開多大，是你的決定，不是它的預設。這跟我一直講的同一條線：可信度靠落地流程，不靠模型多聰明，這點我在<a href="/articles/llm-healthcare-promise-limits/">談 LLM 在醫療能不能落地時</a>就說過。</p>

<img src="/images/claude-tag-slack-shared-identity-governance-s3.webp" width="960" height="641" loading="lazy" decoding="async" alt="共用身分加自動讀對話帶來的權限邊界與資料存取控制示意">

<h2>我的觀察：反覆撞牆，可能正是邊界在運作</h2>

<p>講一個我自己最近的體感。用的時候一直觸碰到安全邊界，明明都已經再三確認了，它還是重問一樣的問題。一開始我以為是它變笨或記性差，但看完 Claude Tag 這套設計，我傾向這就是主要原因：當一個身分被切成分頻道、分工具、分記憶的多個獨立 scope，每跨一道邊界、每碰一次敏感資料，系統就得重新確認你這次有沒有權限，而不是憑上一輪的確認放行。它不是記不住，是被設計成不准用「我剛剛問過了」來省掉這一步。</p>

<p>這就是便利和安全的取捨，攤在使用體感上的樣子。重問同樣的問題很煩，但反過來想，這正是邊界還在運作的訊號。我先前談 Fable 5 的模型分層時就提過類似的取捨，<a href="/articles/claude-fable-5-mythos-class-model-tiering/">越強的 AI 往往被套上越多限制、越多手動確認，便利與安全的取捨像隱私條款</a>。Claude Tag 把這個取捨從單人對話放大到全公司共用，撞牆的頻率只會更高，不會更低。要少撞牆，方法不是把邊界拆掉，是把 scope 設對。</p>

<img src="/images/claude-tag-slack-shared-identity-governance-s4.webp" width="960" height="1440" loading="lazy" decoding="async" alt="一直觸碰到安全邊界、再三確認還重問同樣問題的取捨示意">

<h2>台灣中小團隊：先界定範圍與稽核，再談效率</h2>

<p>對台灣的中小團隊，我的建議很直接：別被「AI 變同事好方便」帶著走，先界定再開放，順序不能倒。落地前先想清楚三格：一是 Claude Tag 放進哪些頻道、碰得到哪些系統，沒理由一上來就給全頻道、全工具的最大權限；二是它的記憶與資料存取要收到「只給這個用途需要的」，不要讓一個共用身分把跨部門的對話通通讀進去；三是留不留稽核，<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">官方既然給了查看 @Claude 做過什麼的紀錄</a>，就把它當必開項，而不是出事才回頭找。</p>

<p>這套思路其實不新。我在<a href="/articles/databricks-genie-one-agent-governance/">談 Databricks 把 agent 變「同事」</a>、<a href="/articles/kpmg-agent-365-workforce-governance/">談 KPMG 把 agent 推給 27.6 萬員工</a>時就反覆講同一件事：當動到資料的人從少數工程師變成全公司，每個會自己動作的 agent 都成了新的權限治理對象，治理收不收得住才是真門檻。Claude Tag 只是把這個門檻搬到了你最常用的 Slack 裡。工具好不好用是一回事，落地設計比工具強弱更關鍵，這個立場我不會改。</p>

<img src="/images/claude-tag-slack-shared-identity-governance-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣中小團隊先界定 Claude Tag 範圍與稽核再談效率的規劃示意">

<h2>常見問題</h2>

<p><strong>Claude Tag 是什麼？跟以前在 Slack 用 Claude 有什麼不同？</strong><br>Claude Tag 是 Anthropic 6/23 推出、先在 Claude Enterprise 與 Team 開研究預覽的功能，<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">把 Claude 從你一個人的私人對話，變成整個 Slack 頻道共用的同一個 Claude</a>。<a href="https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/" target="_blank" rel="noopener">頻道裡所有人看得到它在做什麼、能接手別人留下的半成品</a>，差別就在從「個人助理」變成「團隊共用的成員」。</p>

<p><strong>全公司共用一個 Claude 身分，最大的風險是什麼？</strong><br>是這個身分會讀對話、又碰得到被授權的工具與資料，一旦範圍開太大，跨部門資料就可能被同一個身分讀過去。<a href="https://fortune.com/2026/06/23/anthropic-claude-tag-virtual-employee-tool-slack/" target="_blank" rel="noopener">Anthropic 的做法是讓管理員把存取切到分頻道、分用途，例如 HR 的資料不流到工程</a>，但範圍開多大是企業自己設，不是預設就安全。</p>

<p><strong>導入 Claude Tag 前，台灣中小團隊該先做什麼？</strong><br>先界定再開放，順序別倒。盤三格：放進哪些頻道、碰得到哪些系統；記憶與資料存取收到只給該用途需要的；以及把<a href="https://www.anthropic.com/news/introducing-claude-tag" target="_blank" rel="noopener">官方提供的操作紀錄</a>當必開的稽核項。先把範圍與稽核定清楚，再談效率，比較不會在沒人看的地方滾出治理債。</p>

<h2>結語</h2>

<p>Claude Tag 把 AI 從個人工具變成全公司共用的同事，方便是真的，但它讀對話、跨頻道、能自己動手的那些能力，反過來就是要被管住的邊界。Anthropic 把治理鈕內建好了，鈕開多大卻是你的事。最近一直撞到安全邊界、被重問同樣問題的那股煩，其實是邊界還在運作的證據；要的不是拆掉它，是把 scope 設對。先界定它能碰什麼、留不留軌跡，再談它能幫你省多少時間，這個順序別倒過來。</p>
