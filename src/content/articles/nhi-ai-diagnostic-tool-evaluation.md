---
title: "AI 診斷工具擬納健保：年底效益評估，值不值得埋單怎麼算"
slug: "nhi-ai-diagnostic-tool-evaluation"
description: "健保署自 2023 年起給付第一款 AI 醫材，用於手術麻醉高風險病人的血壓穩定；下一步是把 AI 影像判讀（如 CT 顱內出血偵測）也納入給付，官方口徑是年底完成成本效益評估。拆解唯一過關案例怎麼算帳、衛福部三大 AI 中心的評估方法，以及「年底」承諾與科學驗證時程之間的落差。"
excerpt: "健保只給付過一款 AI 醫材，靠六篇臨床試驗過關。CT 顱內出血判讀能不能跟進，關鍵不是模型準不準，是醫師時間、誤診成本、資源排擠這幾筆帳有沒有算清楚。"
publishDate: "2026-08-03T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags: ["AI 診斷工具", "健保給付", "AI 影像判讀", "健保署", "醫療 AI 效益評估"]
coverImage: "covers/nhi-ai-diagnostic-tool-evaluation.webp"
coverAlt: "醫師在螢幕前檢視 AI 輔助判讀的腦部電腦斷層影像"
coverImageCredit: "Photo by Vitaly Gariev on Unsplash"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "news"
disclaimerType: "medical"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "健保目前只給付過一款 AI 醫材：2022 年上路、用於手術麻醉血壓穩定監測的「愛德華」精準感測器，靠六篇隨機對照試驗與明確的支付點數理由過關。"
  - "AI 影像判讀（如 CT 顱內出血偵測）擬納健保的「年底完成效益評估」說法最早出自 2024 年 8 月，至今看不到後續，衛福部要到 2025 年 11 月才正式啟動負責量化 AI 效益的「AI 影響性研究中心」。"
  - "效益評估真正要算的不是準確率，是醫師時間節省、誤診成本、資源排擠這幾筆隱藏帳；衛福部的作法是拿「AI 加醫師」跟「醫師單獨判讀」做隨機對照試驗比較，本土資料的試驗最快也要 3 年才有結果。"
references:
  - title: "AI診斷工具擬納健保 年底完成效益評估"
    url: "https://www.cna.com.tw/news/ahel/202408260275.aspx"
    publisher: "中央社"
    note: "2024/8/26 報導，健保署長石崇良表示健保已給付麻醉血壓穩定 AI 工具，AI 診斷工具（如 CT 顱內出血判讀）擬納健保，年底完成效益評估"
  - title: "AI診斷工具擬納健保 年底完成效益評估"
    url: "https://www.hst.org.tw/tw/story/content/4722"
    publisher: "台灣智慧醫療創新整合平台"
    note: "同一段談話的產業平台報導版本，並提及自費醫材單一審查平台規劃"
  - title: "全台第一件AI軟體健保給付過程之調查報告"
    url: "https://mdnews.web2.ncku.edu.tw/p/404-1174-214148.php?Lang=zh-tw"
    publisher: "成大醫學系電子報"
    note: "拆解「愛德華」精準感測器從取證到給付的完整過程：六篇 RCT、支付點數 8,593 點的計算方式"
  - title: "全民健康保險藥物給付項目及支付標準共同擬訂會議特材部分第64次會議議程"
    url: "https://www.nhi.gov.tw/ch/dl-20784-b72ccf022ad94fbe80591c02b3f8d2b0-1.pdf"
    publisher: "衛生福利部中央健康保險署"
    note: "112 年 5 月會議議程官方原始文件，第 10 案列有「愛德華」精準感測器納入健保給付案"
  - title: "AI要真正落實於醫療，有落地、取證、健保如何支付等三大問題必須解決"
    url: "https://blog.mohw.gov.tw/1270/"
    publisher: "衛生福利部部落格"
    note: "2025/3/10 刊出，資訊處長李建璋拆解 AI 醫療落地三大問題與三大 AI 中心的職能分工"
  - title: "衛福部啟動AI影響性研究中心 助評估AI效益"
    url: "https://www.cna.com.tw/news/ahel/202511200264.aspx"
    publisher: "中央社"
    note: "2025/11/20 報導，AI 影響性研究中心在 5 家醫學中心設示範據點，用本土資料做 RCT，李建璋表示最快 3 年才可能有結果"
  - title: "AI醫療創新加速 醫師採用意願與健保給付成落地挑戰"
    url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000759918_AH2LSDRQ09INA9904B4PE"
    publisher: "DIGITIMES"
    note: "2026/6/26 報導標題，點名醫師採用意願與健保給付是台灣 AI 醫療落地的兩大挑戰"
column: "ai-healthcare"
topics: ["ai-medical-regulation"]
---

<p>健保署從 2023 年起給付第一款 AI 醫材，用途是手術麻醉高風險病人的血壓穩定監測。下一步喊出要把 AI 影像判讀，例如電腦斷層顱內出血偵測，也送進健保給付名單，官方口徑是年底完成成本效益評估。這筆帳該怎麼算，決定了台灣 AI 醫療能不能從個案補助走向常規保障，而帳目裡最容易被忽略的一塊，不是模型準不準，是醫師省下多少時間、誤診一次要付出什麼代價、資源會不會被排擠掉。</p>

<h2>目前唯一過關的案例，靠六篇臨床試驗</h2>

<p>目前健保唯一給付的 AI 醫材，是負責監測手術中血壓變化的「愛德華」精準感測器。<a href="https://mdnews.web2.ncku.edu.tw/p/404-1174-214148.php?Lang=zh-tw" target="_blank" rel="noopener">成大醫學系電子報的調查報導</a>指出，這款醫材從 2020 年 8 月取得許可證，到 2022 年 7 月 1 日健保正式給付，前後花了約兩年九個月。過關靠的是六篇隨機對照試驗，其中四篇證實這套系統能提前預測低血壓，另外五篇文獻顯示能降低術後併發症、縮短住院天數。<a href="https://www.nhi.gov.tw/ch/dl-20784-b72ccf022ad94fbe80591c02b3f8d2b0-1.pdf" target="_blank" rel="noopener">健保特材共同擬訂會議 112 年 5 月第 64 次會議議程</a>把這個案子列為第 10 案，最後核定的支付點數是基礎的 6,138 點加計 40%，等於 8,593 點，理由是這套系統多了既有監測器做不到的低血壓預測功能。</p>

<img src="/images/nhi-ai-diagnostic-tool-evaluation-s1.webp" width="867" height="1300" loading="lazy" decoding="async" alt="手術室麻醉監測儀器螢幕顯示血壓與生理數值（示意圖）" title="手術室裡的生理監測儀器畫面，呼應唯一已通過健保給付的 AI 醫材案例情境（示意圖）">

<h2>下一步是 CT 顱內出血判讀，效益評估卡在哪</h2>

<p><a href="https://www.cna.com.tw/news/ahel/202408260275.aspx" target="_blank" rel="noopener">中央社 2024 年 8 月的報導</a>引述健保署長石崇良的話，下一步是把 AI 診斷工具，例如輔助判讀電腦斷層造影的顱內出血，納入健保給付，署方當時的說法是「今年底完成相關評估，也許就會進入給付」。<a href="https://www.hst.org.tw/tw/story/content/4722" target="_blank" rel="noopener">台灣智慧醫療創新整合平台的報導</a>記錄了同一段談話。這裡要先講清楚一件事：這個「年底」指的是 2024 年底，不是今年。查到目前為止，公開資訊裡看不到這款 CT 顱內出血判讀工具實際完成給付的後續消息，等於這筆評估已經拖過了原訂時程。</p>

<img src="/images/nhi-ai-diagnostic-tool-evaluation-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="電腦斷層腦部影像掃描畫面，顯示多張腦部橫切面影像（示意圖）" title="電腦斷層腦部影像判讀畫面，對應健保擬評估的下一項 AI 診斷工具：顱內出血偵測（示意圖）">

<h2>效益怎麼算：準確率之外的三筆帳</h2>

<p><a href="https://blog.mohw.gov.tw/1270/" target="_blank" rel="noopener">衛福部資訊處長李建璋在部落格文章</a>裡把 AI 醫療落地卡住的原因分成三塊：醫師願不願意用、要不要花巨量資料重新驗證、以及健保怎麼付錢。第三塊靠的是「AI 影響性研究中心」，做法是找實驗組跟對照組做隨機對照試驗，比較「AI 加醫師」跟「醫師單獨判讀」的臨床結果差多少，用這個差距去訂價，而不是只看模型自己測出的準確率分數。套到 CT 顱內出血判讀，這筆帳至少要拆成三塊算：</p>

<table>
<thead>
<tr><th>要算的項目</th><th>麻醉血壓穩定案例（已給付）</th><th>CT 顱內出血判讀（評估中）</th></tr>
</thead>
<tr><td>臨床證據</td><td>6 篇 RCT，4 篇證實可預測低血壓</td><td>尚未見官方公布對應 RCT 清單</td></tr>
<tr><td>安全效益</td><td>5 篇文獻顯示降低術後併發症、縮短住院天數</td><td>待驗證：判讀提早多少時間、能不能改變處置</td></tr>
<tr><td>醫師時間 / 資源排擠</td><td>減少麻醉醫師盯著監測儀器的負擔</td><td>放射科醫師的判讀時間怎麼分配、誤判要不要人力複核</td></tr>
<tr><td>給付結果</td><td>6,138 點加 40%，等於 8,593 點</td><td>未定案</td></tr>
</table>

<p>這張表格的重點不在誰快誰慢，是麻醉那個案例把「AI 幫醫師省下什麼、少掉什麼風險」講得很具體，CT 顱內出血判讀目前公開的討論還停在「值不值得做」這一層，還沒有人把「醫師時間省多少、誤判一次的代價多重、會不會排擠到其他影像判讀量能」這三筆帳攤開來給。</p>

<img src="/images/nhi-ai-diagnostic-tool-evaluation-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="桌面上攤開的醫療費用報表與計算文件（示意圖）" title="桌上攤開的醫療費用與成本效益報表，呼應健保效益評估要算的不只是準確率（示意圖）">

<h2>年底是政治語言，還是科學時程</h2>

<p><a href="https://www.cna.com.tw/news/ahel/202511200264.aspx" target="_blank" rel="noopener">中央社 2025 年 11 月的報導</a>寫下另一個時間點：衛福部這時候才正式啟動「AI 影響性研究中心」，在台北榮總、台中榮總、三軍總醫院、成大醫院、台大醫院五家醫學中心設示範據點。李建璋在啟動記者會上說，過去常常直接引用國外數據，這次要求用本土資料做隨機對照試驗，而且「最快 3 年才可能有結果」。把兩個時間點擺在一起看：2024 年 8 月喊出的「年底完成評估」，跟 2025 年 11 月才成立、且承認要 3 年才有結果的驗證機制，兩者對不上。喊出年底，比較像是給外界一個交代的政治語言；把證據做紮實需要的科學時程，看起來遠不只一年。</p>

<img src="/images/nhi-ai-diagnostic-tool-evaluation-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="會議桌上攤開的政策評估文件與時鐘（示意圖）" title="會議桌上的政策文件與時鐘，呼應年底完成評估的政治承諾與科學驗證實際時程的落差（示意圖）">

<h2>醫師採不採用，才是最後一關</h2>

<p><a href="https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000759918_AH2LSDRQ09INA9904B4PE" target="_blank" rel="noopener">DIGITIMES 2026 年 6 月的報導</a>標題講得很直白：AI 醫療創新加速，醫師採用意願與健保給付才是落地挑戰。這跟李建璋部落格裡講的第一個問題一樣：醫師的判斷跟 AI 不一致時該聽誰的、醫師對 AI 有多少信任，這件事跟給付金額無關，但決定了一款工具核准給付之後會不會真的被用起來。<a href="/articles/fda-ai-medical-device-taiwan-eu/" target="_blank" rel="noopener">我先前拆過台灣 AI 醫材卡住的地方</a>，多半在臨床場域驗證與商業化落地，不在查驗登記這關；這裡的邏輯延伸下去也一樣，給付評估過關之後，還有醫師端願不願意把判讀結果當一回事這一關要走。</p>

<p>我自己很期待這一步能走完，不是期待核准速度變快，是期待這次的效益評估真的把醫師時間、誤診成本、資源排擠這幾筆隱藏帳算進去，而不是又拿一個準確率數字交差。麻醉血壓穩定那個案例示範過，把臨床效益講清楚、把支付點數的理由攤開，一款 AI 醫材就能穩穩留在健保給付名單裡。CT 顱內出血判讀能不能走到這一步，年底就會有答案，這是接下來半年台灣 AI 醫療落地最該盯緊的一件事。</p>

<img src="/images/nhi-ai-diagnostic-tool-evaluation-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫師在診間螢幕前審視 AI 輔助診斷系統畫面" title="醫師在診間審視 AI 輔助診斷畫面，傳達醫師採用意願才是 AI 診斷工具落地的最後一關">

<h2>常見問題</h2>

<p><strong>健保現在到底給付哪些 AI 醫材？</strong><br>目前只有一款正式給付，是 2022 年 7 月上路、用於手術麻醉高風險病人血壓穩定監測的「愛德華」精準感測器，靠六篇隨機對照試驗過關，<a href="https://mdnews.web2.ncku.edu.tw/p/404-1174-214148.php?Lang=zh-tw" target="_blank" rel="noopener">支付點數訂在 8,593 點</a>。AI 影像判讀（如 CT 顱內出血偵測）還在評估階段，尚未正式給付。</p>

<p><strong>「年底完成效益評估」是什麼時候的說法？現在還算數嗎？</strong><br><a href="https://www.cna.com.tw/news/ahel/202408260275.aspx" target="_blank" rel="noopener">這句話最早出自健保署長石崇良 2024 年 8 月的談話</a>，指的是 2024 年底。公開資訊看不到當時的評估如期完成的後續，衛福部一直到 <a href="https://www.cna.com.tw/news/ahel/202511200264.aspx" target="_blank" rel="noopener">2025 年 11 月才正式啟動負責量化 AI 效益的「AI 影響性研究中心」</a>，等於原本的時程已經延後。</p>

<p><strong>健保評估 AI 診斷工具給付，只看準確率嗎？</strong><br>不只。依<a href="https://blog.mohw.gov.tw/1270/" target="_blank" rel="noopener">衛福部資訊處長李建璋的說法</a>，評估要看臨床效益、經濟價值與醫療科技價值，具體做法是拿「AI 加醫師」跟「醫師單獨判讀」做隨機對照試驗比較，量化出醫師時間、誤診代價這類看不見的成本，再拿來訂支付點數，不是只看模型自己測出的準確率分數。</p>

<p><strong>這套評估要多久才會有結果？</strong><br><a href="https://www.cna.com.tw/news/ahel/202511200264.aspx" target="_blank" rel="noopener">李建璋在 2025 年 11 月受訪時說，用本土資料做的臨床試驗最快 3 年才可能有結果</a>。對照麻醉血壓穩定案例從取證到給付花了將近三年，AI 診斷工具的評估要走完整個流程，恐怕不會比這快。</p>
