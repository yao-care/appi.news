---
title: "Databricks 把 AI agent 變「同事」：當 vibe coding 進公司，資料權限邊界誰來守"
slug: "databricks-genie-one-agent-governance"
description: "Databricks 6/16 發表 Genie One，把 agent 講成能跑重複工作流的「同事」，還給業務開了 vibe coding 環境 Genie App Builder。真正的門檻不是好不好用，而是 agent 動到的資料與權限要靠 Unity Catalog 這層治理收住。"
excerpt: "Databricks 6/16 發表 Genie One，把 agent 講成能跑重複工作流的「同事」，還給業務開了 vibe coding 環境。當全員自助生成應用，真正的門檻不在介面，在 agent 動得到哪些資料、用誰的權限。"
publishDate: "2026-06-20T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["Databricks Genie One", "AI agent 同事", "vibe coding", "Unity Catalog 資料治理", "企業 AI 權限邊界"]
coverImage: "covers/databricks-genie-one-agent-governance.webp"
coverAlt: "Databricks 把 AI agent 做成企業同事，背後靠 Unity Catalog 治理層守住資料權限邊界的示意"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Databricks 6/16 在 Data + AI Summit 發表 Genie One，定位成跨結構化與非結構化資料、能自動跑工作的 agentic coworker；Genie Agents、Genie Code 同步正式上線，Genie App Builder 進私測。"
  - "Genie App Builder 是給業務用的 vibe coding 環境，讓最貼近業務問題的人自己用自然語言生出連到企業資料的應用，官方主打全程由 Unity Catalog 的權限與存取控制收住。"
  - "話術很性感，但真正的門檻不在介面好不好用，而在每個會自己動作的 agent 動得到哪些資料、用誰的權限，這一關靠治理層守，不是靠模型更聰明。"
references:
  - title: "Databricks' new agentic coworker Genie One brings AI automation to every part of the business"
    url: "https://siliconangle.com/2026/06/16/databricks-new-agentic-coworker-genie-one-brings-ai-automation-every-part-business/"
    publisher: "SiliconANGLE"
    note: "6/16 Data + AI Summit 發表、agentic coworker、Genie App Builder 由 Unity Catalog 保護、Ali Ghodsi context problem 引述、token 計價"
  - title: "Databricks Launches Genie One: All-New Agentic Coworker for Every Team"
    url: "https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team"
    publisher: "Databricks"
    note: "agentic coworker 定義、Genie Agents 把對話存成可重複 agent、App Builder 為 vibe coding 環境、Unity Catalog 權限與存取控制、GA 與私測範圍、Ghodsi 引述"
  - title: "Enabling Governed Vibe Coding for Enterprise Apps on Databricks"
    url: "https://www.databricks.com/blog/enabling-governed-vibe-coding-enterprise-apps-databricks"
    publisher: "Databricks Blog"
    note: "App Space 層級設定資料與權限存取、on-behalf-of-user API scope、最貼近業務的人可建應用而不累積治理債、開發者非資安專家也能安全用資料"
---

<p>Databricks 在 6 月 16 日的 Data + AI Summit 上發表 Genie One，<a href="https://siliconangle.com/2026/06/16/databricks-new-agentic-coworker-genie-one-brings-ai-automation-every-part-business/" target="_blank" rel="noopener">把它定位成一個能跨結構化與非結構化資料、替每個團隊自動跑工作的「agentic coworker」</a>。同一天還開了給業務用的 vibe coding 環境 Genie App Builder。話術很性感，但我關心的不是它好不好用。一個能自己動作、還能讓業務自己生出應用的 agent 進到公司，真正的門檻從來不在介面，在它動得到哪些資料、用誰的權限。這一關，Databricks 把答案押在 Unity Catalog 這層治理上。</p>

<h2>Genie One 到底發了什麼</h2>

<p>先把東西講清楚。<a href="https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team" target="_blank" rel="noopener">Genie One 被 Databricks 講成「能幫業務團隊自動化並協調工作的 agentic coworker」，重點是它不只回答問題，還能接著做事</a>。配套有兩個關鍵：Genie Agents 讓你<a href="https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team" target="_blank" rel="noopener">把任何一段 Genie 對話存成一個可重複使用、會繼承那段對話記憶的 agent</a>，等於把一次性的問答固化成能反覆跑的工作流；Genie App Builder 則是<a href="https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team" target="_blank" rel="noopener">一個為企業打造的「全託管 vibe coding 環境」</a>。</p>

<p>上線節奏也說明了成熟度差異。<a href="https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team" target="_blank" rel="noopener">Genie One、Genie Agents 與 Genie Code 是直接正式上線（GA），Genie App Builder 與背景維運 agent ZeroOps 則先進私人預覽</a>。執行長 Ali Ghodsi 把要解的問題講得很白：<a href="https://siliconangle.com/2026/06/16/databricks-new-agentic-coworker-genie-one-brings-ai-automation-every-part-business/" target="_blank" rel="noopener">「如果你是財務長，AI 卻說不出毛利為什麼變動，那不是 AI 問題，是脈絡問題。」</a>他想賣的不是更大的模型，是讓 AI 真的懂這家公司。</p>

<img src="/images/databricks-genie-one-agent-governance-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="Databricks 在 Data + AI Summit 發表 Genie One，定位成能跨資料自動跑工作流的 agentic coworker">

<h2>「agent 變同事」這個說法，重量在哪</h2>

<p>把 agent 叫「同事」不是行銷修辭而已，它改了一件事：誰能生出在公司裡跑的軟體。過去要連到正式資料、做一個內部 app，得走工程團隊。Genie App Builder 想做的是把這件事交給業務本人。<a href="https://www.databricks.com/blog/enabling-governed-vibe-coding-enterprise-apps-databricks" target="_blank" rel="noopener">Databricks 自己的說法是，讓「最貼近業務問題的人，能用真正的企業資料把 app 建出來、發出去」，而且組織能撐起一大堆 app 卻不累積治理債</a>。</p>

<p>這就是 vibe coding 進公司的真正樣子。不是工程師在 IDE 裡跟 AI 對話，是行銷、業務、財務的人，用一句白話描述需求，AI 就把連著資料的應用生出來。能力面我不擔心，Databricks 這種等級的資料平台要把這條路做順並不意外。我擔心的是，當生出 app 的門檻被壓到「會打字就行」，動到資料的人從少數工程師變成全公司，這時候誰來管每個 app、每個 agent 碰得到什麼。</p>

<img src="/images/databricks-genie-one-agent-governance-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="業務人員用自然語言在 Genie App Builder 生出連到企業資料的應用，vibe coding 進公司">

<h2>真正的門檻是治理層，不是好不好用</h2>

<p>這正是 Databricks 把整個故事押在 Unity Catalog 上的原因。<a href="https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team" target="_blank" rel="noopener">官方的承諾是，這些 app 從一開始就帶著 Unity Catalog 的權限與存取控制在跑</a>。更具體的設計在它談治理的技術文章裡：<a href="https://www.databricks.com/blog/enabling-governed-vibe-coding-enterprise-apps-databricks" target="_blank" rel="noopener">權限不是一個一個 app 各自設，而是在「App Space」這個層級由管理員統一定義資源與資料的存取、API 範圍、以及「代表使用者」呼叫的 on-behalf-of-user 權限，同一個 space 裡的每個 app 自動繼承這些設定</a>。換句話說，它想讓<a href="https://www.databricks.com/blog/enabling-governed-vibe-coding-enterprise-apps-databricks" target="_blank" rel="noopener">那些根本不是資安專家的開發者，也能安全地碰資料</a>，靠的是事先架好的護欄，而不是事後人工審查。</p>

<p>方向我認同，但要說的是：這恰好證明了門檻在哪。當每個業務都能生出一個會自己動作、會去連資料的 agent，每一個 agent 其實都是一個新的權限治理對象。我先前在談 MCP 成為事實標準時就講過這條線，<a href="/articles/mcp-de-facto-standard-agent-governance/">agent 接出去的每一台 server，都該被當成一個獨立的權限治理對象來盤</a>。Genie App Builder 只是把這個問題搬進公司內部、而且規模放大：不是少數幾個 agent，是潛在每個員工都能造一個。治理層收不收得住，決定的不是好不好用，是會不會出事。可信度從來靠落地流程，不靠模型多聰明，這點我在<a href="/articles/llm-healthcare-promise-limits/">講 LLM 在醫療能不能落地時</a>就是同一個立場。</p>

<img src="/images/databricks-genie-one-agent-governance-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="Unity Catalog 在 App Space 層級統一設定資料與權限存取，收住 agent 動得到的資料">

<h2>把 agent 當權限對象，順序不要倒</h2>

<p>所以企業該做的，不是先把全員 vibe coding 開好再回頭補權限。順序要對：先定義這個 agent、這個 app 要解的是哪個情境、該由誰用、碰得到哪張表，再決定開放範圍。這跟我一直在講的選工具邏輯一樣，<a href="/articles/what-is-claw-llm-client-tool/">先把使用情境的前提條件講清楚，再談要不要放它進來</a>，把順序倒過來是最常見的失敗模式。</p>

<p>具體到 Genie 這套，有三件事值得先盤。一是 App Space 的權限預設值到底開了多大，因為同一個 space 裡每個 app 都繼承它，設錯就是一次錯一整片。二是 on-behalf-of-user 這種「代表使用者」的呼叫，agent 到底是用哪個人的身分在讀資料、權限會不會被放大。三是哪些 agent 從問答升級成會自動執行的工作流，這類才是真的需要被當成獨立角色來管的對象。把這三格先想清楚，再來談全員自助，治理債才不會在沒人看的地方默默滾大。</p>

<img src="/images/databricks-genie-one-agent-governance-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="每個 agent 都是新的權限治理對象，企業全員自助生成應用後要先盤點資料邊界">

<h2>我的觀察：很期待大公司願意把心得攤出來</h2>

<p>講完該擔心的，我想說一句真心話。我十分期待能看到大公司的分享心得，這會促進更多好的 AI 出現。</p>

<p>原因很簡單。像 Genie App Builder 這種把治理收進 App Space、用 on-behalf-of-user 控存取的設計，到底在真實組織裡撐不撐得住，光看發表會講不準，要看用過的公司願不願意把踩過的雷講出來。哪種權限預設值會出事、哪類 agent 升級成自動工作流之後最容易越界、治理債是在哪一步開始滾大，這些一手經驗比任何規格表都有用。大公司有資源做這種規模的實驗，如果它們願意把成功跟失敗都攤開，後面的人就不用每家重踩一遍，好的做法會擴散得更快，AI 落地的整體水準才會被一起往上拉。我等的就是這種分享。</p>

<img src="/images/databricks-genie-one-agent-governance-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="期待大公司公開分享 AI 落地與治理心得，促進更多好的 AI 出現">

<h2>常見問題</h2>

<p><strong>Genie One 跟原本的 Genie 差在哪？</strong><br>原本的 Genie 比較像對話式分析，你問它答。Genie One 被定位成 agentic coworker，重點是它不只回答，還能接著協調與執行工作；搭配 Genie Agents，能把一段對話固化成會重複跑的工作流。差別就在「會不會自己動作」。</p>

<p><strong>vibe coding 給業務用，最大的風險是什麼？</strong><br>不是程式寫得好不好，是動到資料的人從少數工程師變成全公司。當每個人都能生出連著正式資料的 app，碰得到哪張表、用誰的權限這件事要是沒在治理層收好，破口會以員工人數的規模長出來。Databricks 的解法是把權限拉到 App Space 層級統一管，方向對，但預設值設多大、繼承關係有沒有理清楚，得自己盤。</p>

<p><strong>「全程由 Unity Catalog 保護」就代表安全了嗎？</strong><br>代表它把治理機制接上了，不代表你不用管。治理層提供的是工具，真正決定安不安全的是你怎麼設：App Space 開多大、on-behalf-of-user 用誰的身分、哪些 agent 被允許自動執行。工具備齊，判斷還是要人做，這跟模型多強無關。</p>

<h2>結語</h2>

<p>Genie One 把 agent 講成同事，這個比喻其實點到了重點：同事是會自己動作、會碰到公司資料的角色，不是一個只會回話的工具。Databricks 願意一開始就把 Unity Catalog 的治理綁進去，方向是對的。但發表會證明不了治理在真實組織裡撐不撐得住，那要靠用過的人把經驗講出來。技術能讓全公司都會 vibe coding，這不難；難的是讓每個被生出來的 agent，都還在某個人說得清楚的權限邊界裡。先想清楚誰碰得到什麼，再談全員自助，這個順序別倒過來。</p>
