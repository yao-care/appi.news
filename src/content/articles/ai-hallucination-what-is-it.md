---
title: "AI 幻覺是什麼？為什麼聊天機器人會一本正經說錯話"
slug: "ai-hallucination-what-is-it"
description: "AI 幻覺是語言模型用自信語氣生成錯誤內容的現象。OpenAI 研究團隊 2025 年 9 月發表的論文指出，這是訓練與評分機制鼓勵猜測、而不是承認不確定所造成的統計結果。《BMJ Open》2026 年研究實測五個聊天機器人回答健康問題，發現半數答案被判定有問題、參考文獻完整度中位數僅四成。台灣衛福部同年 5 月已要求醫療機構主動揭露 AI 幻覺風險。拆解幻覺怎麼被訓練出來、健康資訊查詢有多常中招，以及一般人與企業該怎麼自保。"
excerpt: "AI 幻覺不是模型故障，是訓練與評分機制鼓勵猜測、而不是承認不確定所造成的結果。實測發現問 AI 健康問題，半數答案有問題；台灣衛福部已要求醫院主動揭露這個風險。"
publishDate: "2026-08-04T17:07:03.994Z"
category: "tech"
subcategory: "ai"
tags:
  - "AI"
  - "醫療AI"
  - "數位健康"
  - "AI治理"
  - "醫療政策"
author: "appi-editorial"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "published"
sourceType: "wire"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
coverImage: "covers/ai-hallucination-what-is-it-cover.webp"
coverAlt: "一名民眾坐在沙發上，手持智慧型手機查看聊天機器人的回覆內容，表情略顯疑惑（示意圖）"
highlights:
  - "OpenAI 研究團隊 2025 年 9 月發表的論文指出，AI 幻覺是統計上自然產生的結果：只要正確與錯誤陳述在語言模式上難以區分，幻覺就會在預訓練階段浮現，不是單一模型設計失誤。"
  - "主流 AI 評測採二元評分，答對得分、答錯不得分，讓模型「棄權永遠是次優選擇」，逼模型傾向亂猜而非誠實承認不確定；論文提出把答錯依信心門檻倒扣分數的改良評分機制。"
  - "《BMJ Open》2026 年 4 月發表的研究測試五個聊天機器人回答健康問題，發現 50% 回答被判定有問題（20% 屬高度有問題），且所有模型的參考文獻完整度中位數僅 40%。"
  - "台灣衛福部 2026 年 5 月 29 日發布「醫療機構應用生成式人工智慧指引」，把 AI 幻覺列為六大風險之一，要求醫院主動揭露並提醒病人不要照單全收 AI 生成內容。"
risksAndLimits:
  - "《BMJ Open》研究樣本為每平台100則回答（五類×20題），非大規模統計，實際使用情境的錯誤率可能不同"
  - "OpenAI論文提出的評分改革僅是理論提案與計算範例，尚未有主流評測機構正式採用的公開數據"
  - "衛福部指引適用對象為醫療機構，一般消費性AI聊天機器人的健康問答不受此指引直接規範"
references:
  - title: "Why Language Models Hallucinate"
    url: "https://arxiv.org/abs/2509.04664"
    publisher: "arXiv / OpenAI"
    note: "OpenAI 研究團隊論文，說明幻覺為何是訓練與評分機制下統計上自然產生的結果，並提出信心門檻式評分改革"
  - title: "Substantial amount of medical information provided by popular chatbots inaccurate and incomplete"
    url: "https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/"
    publisher: "BMJ Group"
    note: "《BMJ Open》2026 年 4 月研究新聞稿，五個聊天機器人回答健康問題近半數有問題，參考文獻完整度中位數僅 40%"
  - title: "醫療機構應用生成式人工智慧指引"
    url: "https://www.mohw.gov.tw/cp-18-86695-1.html"
    publisher: "衛生福利部"
    note: "2026 年 5 月 29 日公告（文號：衛部醫字第1151663164號），列出六大風險與三階段導入原則"
  - title: "衛福部生成式AI使用指引 醫院需主動揭露避免「AI幻覺」延誤就醫"
    url: "https://udn.com/news/story/7266/9535477"
    publisher: "聯合新聞網"
    note: "說明指引中對醫院揭露義務與病人知情權的具體規定"
  - title: "衛福部首發醫療GenAI指引 六大風險、九項要點建立治理框架"
    url: "https://news.gbimonthly.com/tw/article/show.php?num=87116"
    publisher: "環球生技月刊"
    note: "逐項列出六大風險類型與三階段導入原則"
originalContribution: "把 OpenAI 2025 年 9 月幻覺成因論文原文、台灣衛福部醫療機構生成式AI指引官方公告、以及《BMJ Open》2026 年健康聊天機器人準確度研究三份原始文件交叉比對，只採用能在原始文獻中逐字核實的數字與引述，捨棄部分二手報導中無法在論文原文找到出處的統計數字。"
topics: ["medical-ai-frontline"]
---

<p>AI 聊天機器人有時候會用非常肯定的語氣，說出根本不存在的事實，這種現象叫做 AI 幻覺（AI hallucination）。根本原因在於訓練與評分方式本身鼓勵模型用猜的，不鼓勵它承認不知道，模型並沒有真的故障。台灣衛福部 2026 年 5 月已要求醫療機構導入生成式 AI 時，主動揭露這個風險並提醒病人不要照單全收。</p>

<h2>AI 幻覺是什麼</h2>

<p>AI 幻覺指語言模型用流暢、自信的語氣生成一段聽起來合理、但實際上錯誤或憑空捏造的內容，模型本身不會顯示任何不確定的訊號。<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">OpenAI 研究團隊 2025 年 9 月發表的論文指出，這類錯誤在統計上是自然產生的：只要正確與錯誤的陳述在語言模式上難以區分，幻覺就會在預訓練階段浮現</a>，屬於整類生成式模型共享的結構性限制，而非單一模型設計得不夠好。</p>

<p><a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">論文用考試作答來比喻這個現象：「像面對困難考題的學生一樣，大型語言模型有時候會在不確定的時候用猜的，生成看似合理但錯誤的陳述」</a>。作者舉了一個具體案例：研究人員請一個公開釋出的語言模型回答論文作者之一 Kalai 的生日，而且明確要求只在確定的時候才回答，模型連續三次給出三個不同、而且全部錯誤的日期。這代表模型不是不知道自己可能答錯，是整套訓練機制沒有給它「說不知道」的誘因。</p>

<img src="/images/ai-hallucination-what-is-it-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="書桌上擺著一張填答用的選擇題答案卡與一支鉛筆，象徵猜題情境（示意圖）">

<h2>幻覺是怎麼被「訓練」出來的</h2>

<p>問題出在怎麼幫 AI 模型打分數。<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">論文指出，主流評測方式對答案採用二元評分，答對得分、答錯不得分，模型若誠實承認不知道反而拿不到分：「在二元評分下，棄權永遠是次優選擇，過度自信的『最佳猜測』才是最優解」</a>。這跟考生面對選擇題的心理很像，寧可猜一個答案賭運氣，也不要交白卷，因為空白永遠是零分，亂猜至少有機會答對。</p>

<p>研究團隊也提出具體改法：<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">把評分規則從單純的「答對得分、答錯不得分」，改成依信心門檻設定懲罰，例如信心門檻設在 0.75 就倒扣 2 分、設在 0.9 就倒扣 9 分，答對則固定得 1 分</a>，門檻愈高，答錯的代價愈重，模型才有動機在真正不確定時選擇不答。<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">他們主張不必另外設計新的測驗，只要把信心門檻放進既有、已經在用的主流評測，就能重新調整模型被訓練去追逐的目標</a>。目前這仍停留在論文提出的理論方案，還沒有主流評測機構正式採用。</p>

<img src="/images/ai-hallucination-what-is-it-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="一名工程師坐在辦公室電腦前，螢幕顯示數據圖表與測試結果（示意圖）">

<h2>問 AI 健康問題，幻覺有多常見</h2>

<p>這套機制在健康資訊查詢上特別容易出事，因為使用者通常缺乏足夠背景知識去識破一段聽起來很專業、實際上錯誤的回答。<a href="https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/" target="_blank" rel="noopener">來自美國、加拿大與英國的研究團隊 2026 年 4 月在《BMJ Open》發表研究，測試 ChatGPT、Gemini、Meta AI、Grok、DeepSeek 五個聊天機器人，針對癌症、疫苗、幹細胞、營養、運動表現五大類別各提出開放式與封閉式問題，結果半數（50%）回答被判定有問題，其中 20% 屬於高度有問題</a>。<a href="https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/" target="_blank" rel="noopener">Grok 產生高度有問題回答的比例最高，達 58%（29/50），Gemini 表現相對最佳</a>。</p>

<p>更麻煩的是引用來源本身也靠不住：<a href="https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/" target="_blank" rel="noopener">研究發現所有聊天機器人的參考文獻完整度中位數只有 40%，沒有一個模型能針對任何一題提供完整且準確的參考文獻清單，原因正是幻覺與捏造的引用</a>。也就是說，就算使用者想點連結查證，連結指向的文獻本身也可能是編出來的，光靠「有附來源」判斷可信度並不安全。</p>

<img src="/images/ai-hallucination-what-is-it-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="一名民眾坐在家中沙發上，手持平板電腦瀏覽健康資訊網頁（示意圖）">

<h2>台灣現況：衛福部要求醫院主動揭露</h2>

<p><a href="https://www.mohw.gov.tw/cp-18-86695-1.html" target="_blank" rel="noopener">衛福部 2026 年 5 月 29 日公告「醫療機構應用生成式人工智慧指引」（文號：衛部醫字第1151663164號）</a>，適用對象是預備導入或已經導入生成式 AI 的醫療機構，把 AI 幻覺列為六大風險之一。<a href="https://news.gbimonthly.com/tw/article/show.php?num=87116" target="_blank" rel="noopener">另外五項風險分別是基礎模型本身的訓練風險、外部資料來源品質風險、提詞攻擊造成的資安攻擊風險、醫事人員過度依賴 AI 導致臨床判斷力下降的使用者依賴風險，以及雲端服務中斷或供應商政策變更造成的服務中斷風險</a>。</p>

<p>在揭露義務上，<a href="https://udn.com/news/story/7266/9535477" target="_blank" rel="noopener">指引要求醫院主動揭露並提醒民眾不要照單全收 AI 生成的內容，幫助民眾理解這些資訊僅供參考，避免因為誤信錯誤資訊延誤真正需要的醫療需求；若 AI 工具具備錄音或錄影功能，必須事先明確告知病人，病人拒絕就要停止使用</a>。這是台灣第一次把「AI 幻覺」寫進具名的醫療機構治理文件，而不是只留在技術圈內部討論。</p>

<img src="/images/ai-hallucination-what-is-it-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫護人員與資訊人員在會議室中討論文件，桌上擺放筆電與紙本資料（示意圖）">

<h2>一般人與企業該注意什麼</h2>

<p>對一般讀者而言，BMJ 的研究結果給出一個直接的自保方法：<a href="https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/" target="_blank" rel="noopener">聊天機器人給的參考文獻清單，完整度中位數只有四成</a>，拿到 AI 的健康建議之後，先點開它附的來源連結，連結打不開或內容對不上原文，就代表這段回答不能直接採信。涉及診斷、用藥劑量、禁忌症這類高風險內容，AI 的角色最多是幫忙整理問題方向，不能取代醫療人員的判斷。</p>

<p>對企業或平台開發者而言，<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">OpenAI 研究團隊的建議是從評測與獎勵設計下手</a>，單純加大模型規模不會改變猜測比誠實划算的誘因結構。落地做法包括在系統提示明確要求模型在不確定時說明信心程度、用檢索增強生成搭配可信文件庫，並在醫療、法律、財務這類高風險場景保留人工複核這一關，不把 AI 輸出直接當成最終答案。<a href="https://www.mohw.gov.tw/cp-18-86695-1.html" target="_blank" rel="noopener">衛福部的指引也把指派主責單位辨識風險、導入前完成資安與個資保護評估，列為醫療機構導入前的核心原則</a>，邏輯是同一套：先假設 AI 會犯錯，再設計攔截機制。</p>

<h2>常見問題</h2>

<p><strong>AI 幻覺是模型故障或程式錯誤嗎？</strong><br>不是。<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">OpenAI 研究團隊指出，只要正確與錯誤的陳述在語言模式上難以區分，幻覺就會在預訓練階段自然浮現</a>，這是整類生成式模型共享的統計性限制，不是單一產品的程式錯誤，也無法靠修補程式碼解決。</p>

<p><strong>加大模型規模或增加訓練資料，能解決 AI 幻覺嗎？</strong><br>不能徹底解決。<a href="https://arxiv.org/abs/2509.04664" target="_blank" rel="noopener">論文指出問題根源在評測與評分機制鼓勵模型猜測而非承認不確定</a>，模型愈大只會愈擅長生成流暢、有說服力的錯誤答案，除非評分機制本身改變，否則誘因結構不會變。</p>

<p><strong>問 AI 健康問題安全嗎？</strong><br>要看用途。<a href="https://bmjgroup.com/substantial-amount-of-medical-information-provided-by-popular-chatbots-inaccurate-and-incomplete/" target="_blank" rel="noopener">《BMJ Open》2026 年研究發現五個主流聊天機器人回答健康問題，半數被判定有問題，參考文獻完整度中位數僅 40%</a>，拿來初步整理問題方向可以，但診斷、用藥、禁忌症這類決策仍需要醫療人員把關，不能只靠 AI 的答案。</p>

<p><strong>台灣醫療院所現在有規範 AI 幻覺揭露嗎？</strong><br>有。<a href="https://www.mohw.gov.tw/cp-18-86695-1.html" target="_blank" rel="noopener">衛福部 2026 年 5 月 29 日發布「醫療機構應用生成式人工智慧指引」，把 AI 幻覺列為六大風險之一</a>，<a href="https://udn.com/news/story/7266/9535477" target="_blank" rel="noopener">要求醫院主動揭露並提醒病人不要照單全收 AI 生成內容</a>，但這份指引僅適用於醫療機構，一般消費性聊天機器人的健康問答不在規範範圍內。</p>
