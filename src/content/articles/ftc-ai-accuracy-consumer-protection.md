---
title: "FTC 出手管 AI 準確度：系統偷偷偏離你的預期，算不算消費者被騙"
slug: "ftc-ai-accuracy-consumer-protection"
description: "美國 FTC 七月提出《抑制人工智慧系統準確度》政策聲明草案，把『AI 系統偷偷偏離用戶合理預期』定性為《FTC 法》第 5 條的欺騙問題。這個原則站得住，但觸發它的政治動機讓『正當調校 vs 準確度壓制』這條線特別重要。台灣的《人工智慧基本法》其實走同一條路。"
excerpt: "一家公司說模型會給你最準的答案，私下卻把輸出調去追別的目標又不講，這算不算欺騙消費者？FTC 說算。但所有上線的 AI 都被調校過，界線該畫在哪？"
publishDate: "2026-08-03T08:00:00+08:00"
category: "tech"
subcategory: "tech-policy"
tags: ["FTC", "AI 監管", "消費者保護", "人工智慧基本法", "AI 準確度"]
coverImage: "covers/ftc-ai-accuracy-consumer-protection.webp"
coverAlt: "FTC 提出 AI 準確度政策聲明，象徵以消費者保護監管人工智慧輸出"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "FTC 七月一日提出《抑制人工智慧系統準確度》政策聲明草案（評論到 7/31），把『AI 對外宣稱中立、私下把輸出調去追別的目標又不揭露』定性為《FTC 法》第 5 條的欺騙。"
  - "界線不在模型會不會出錯，而在『宣稱的行為』與『實際被設計成的行為』有沒有使用者察覺不到的落差；揭露不能藏在服務條款，愈牴觸使用者預期就要愈顯著。"
  - "台灣《人工智慧基本法》去年 12/23 三讀、國科會為主管機關，已把 AI 廣告不實與資訊誤導導回公平交易法、消保法，跟 FTC 走同一條路徑；差在還沒寫出揭露顯著度的量尺。"
references:
  - title: "FTC Proposes Policy Statement on AI Accuracy and Ideological Manipulation of AI Outputs"
    url: "https://www.consumerfinancialserviceslawmonitor.com/2026/07/ftc-proposes-policy-statement-on-ai-accuracy-and-ideological-manipulation-of-ai-outputs/"
    publisher: "Consumer Financial Services Law Monitor"
  - title: "FTC Seeks Comment On AI Accuracy Policy Statement"
    url: "https://www.mondaq.com/unitedstates/technology/1811176/ftc-seeks-comment-on-ai-accuracy-policy-statement"
    publisher: "Mondaq"
  - title: "FTC Cracks Down on AI Model's AI Detection Claims"
    url: "https://www.crowell.com/en/insights/client-alerts/ftc-cracks-down-on-ai-models-ai-detection-claims"
    publisher: "Crowell & Moring LLP"
  - title: "立院三讀人工智慧基本法 國科會為主管機關"
    url: "https://www.cna.com.tw/news/aipl/202512230036.aspx"
    publisher: "中央社 CNA"
  - title: "立法院三讀通過《人工智慧基本法》 構築我國AI創新與安全治理基石"
    url: "https://moda.gov.tw/press/press-releases/18316"
    publisher: "數位發展部 moda"
originalContribution: "本文把 FTC《抑制 AI 準確度》草案的第 5 條欺騙路徑，與台灣《人工智慧基本法》把 AI 不實／誤導導回公平交易法、消保法的做法並置比對，指出兩者採同一套『宣稱與實際不符即違規』的既有消保法邏輯，並提出真正的分界不在模型出錯與否、而在『正當調校 vs 未揭露的準確度壓制』與揭露顯著度的量尺。"
---

美國聯邦貿易委員會（FTC）七月初提了一份政策聲明草案，把「AI 系統偷偷偏離用戶合理預期」直接當成消費者保護問題來管：一家公司對外說模型會給你最準的答案，私底下卻把輸出調去追別的目標又不講，這在美國《FTC 法》第 5 條下可能就構成欺騙。我認同這個原則，消費者確實有一個沒被保護到的信任缺口。但要先踩一個剎車：這份草案真正的觸發動機是政治的，中間有一條很容易走歪的線得先畫清楚，不然會從「保護消費者」滑成「管制內容」。

<img src="/images/ftc-ai-accuracy-consumer-protection-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="美國聯邦貿易委員會以第 5 條欺騙條款監管 AI 準確度示意">

先講 FTC 到底提了什麼。這份草案叫《抑制人工智慧系統準確度》（Suppression of Accuracy in Artificial Intelligence Systems），[七月一日公布、開放公眾評論到七月三十一日](https://www.consumerfinancialserviceslawmonitor.com/2026/07/ftc-proposes-policy-statement-on-ai-accuracy-and-ideological-manipulation-of-ai-outputs/)。它的法律鉤子是《FTC 法》第 5 條的「欺騙」條款。FTC 的論證分兩步：第一，使用者對 AI 有一個合理預期，就是它會盡量給出最準確、最忠於事實的答案，不會被業者暗藏的目標扭曲；第二，[使用者有超過九成的時間，是直接接受 AI 的輸出、不會自己再去查證](https://www.consumerfinancialserviceslawmonitor.com/2026/07/ftc-proposes-policy-statement-on-ai-accuracy-and-ideological-manipulation-of-ai-outputs/)。信任度這麼高，落差就變得危險：當系統被刻意調去壓低準確度、追別的目標，使用者根本沒有能力察覺，這就是欺騙成立的地方。

<img src="/images/ftc-ai-accuracy-consumer-protection-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 系統在後台被調校、輸出偏離使用者合理預期的示意">

這個推理的骨架是對的。用我一貫的框架看，AI 值不值得信任，關鍵從來不是模型多聰明，而是它的運作機制裡有沒有「需要對你隱瞞」的結構性理由。一個對外宣稱中立、私下被調過的系統，就是在誘因結構裡種了一個隱瞞的動機。FTC 抓的正是這一點：問題不在模型會犯錯，錯是難免的；問題在業者一邊拿準確度當賣點行銷，一邊在後台把正確答案覆蓋掉。[FTC 舉的例子是「把模型訓練成去修正開發者眼中的『歷史不正義』，改寫一個本來事實正確的答案」](https://www.mondaq.com/unitedstates/technology/1811176/ftc-seeks-comment-on-ai-accuracy-policy-statement)，同時繼續用「最準」的話術對外賣。這跟單純的技術失誤是兩回事。

<img src="/images/ftc-ai-accuracy-consumer-protection-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="揭露不能藏在服務條款細字裡、須清楚顯著的示意">

但這裡就是那條要畫清楚的線。所有上線的 AI 系統，其實沒有一個是「純準確度」的。安全過濾、品牌風險控管、人類回饋微調（RLHF）、拒答敏感問題，這些全都是把模型調離「原始最準輸出」的動作，而且多數是必要的。那 FTC 要怎麼分「正當調校」和「欺騙性壓制」？草案給的答案是揭露：你可以為了準確度以外的目標調整系統，但你得清楚、顯著地講出來。而且標準訂得很高，[藏在服務條款裡的免責聲明不算數，揭露愈是牴觸使用者在別處被建立起來的合理預期，就得愈顯著、愈持續才能真的把預期扳過來](https://www.consumerfinancialserviceslawmonitor.com/2026/07/ftc-proposes-policy-statement-on-ai-accuracy-and-ideological-manipulation-of-ai-outputs/)。這一句其實是整份草案最有價值的地方：它不是禁止你調校，是要求你別偷偷來。

<img src="/images/ftc-ai-accuracy-consumer-protection-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 效能宣稱與實測準確度落差的量表示意">

FTC 有沒有本錢這樣說？有，因為它已經用第 5 條打過 AI 準確度的仗。去年 FTC 對一家叫 Workado 的公司開罰，[它把自家 AI 內容偵測器行銷成「98% 準確」，獨立測試卻顯示在一般內容上只有 53% 的準確率，FTC 主管直接形容那「跟丟銅板差不多」](https://www.crowell.com/en/insights/client-alerts/ftc-cracks-down-on-ai-models-ai-detection-claims)。那案子的和解令要求 Workado 不得再做沒有可靠證據支撐的效能宣稱，之後每次違規最高可罰 53,088 美元。Workado 是「宣稱的準確度」對不上「實際的準確度」；這份新草案往前推了一步，管的是「宣稱中立、實際被調過」。同一條法、同一個邏輯：你對外講的，跟系統實際做的，不能有使用者察覺不到的落差。

<img src="/images/ftc-ai-accuracy-consumer-protection-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣人工智慧基本法上路、國科會為主管機關的示意">

台灣不是旁觀者，因為我們已經有對應的法律鉤子。立法院[去年十二月二十三日三讀通過《人工智慧基本法》，主管機關是國科會](https://www.cna.com.tw/news/aipl/202512230036.aspx)，條文明訂政府應避免 AI 應用出現廣告不實、資訊誤導或造假，違反《公平交易法》《消費者保護法》這些既有法令的情事；高風險應用還要加註警語。數位發展部公布的[七大原則裡也包含「透明與可解釋」「公平與不歧視」，並要求對 AI 產出做適當的資訊揭露或標記](https://moda.gov.tw/press/press-releases/18316)。換句話說，台灣走的路徑跟 FTC 幾乎一樣：不另立一套全新的 AI 罰則，而是把 AI 的不實與誤導導回公平交易法、消保法這些管「宣稱與實際不符」的老法。這條路的好處是不必等專法長齊就能執法，難處在揭露標準到底多顯著才算數，這點台灣還沒有像 FTC 這樣寫出「愈牴觸預期就要愈顯著」的量尺。我先前寫[歐盟 AI 法對通用模型長出牙齒、台廠該怎麼對齊](/articles/eu-ai-act-gpai-enforcement-taiwan-alignment/)時就講過，台灣的義務框架是拼接既有法規，這次的準確度議題又是一個例子。

<img src="/images/ftc-ai-accuracy-consumer-protection-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="判讀 AI 產品是否踩線的分析框架示意">

所以台灣的廠商和讀者該記住的，不是「美國又要管 AI 了」這個標題，而是一個可以直接套用的框架：判斷一個 AI 產品有沒有踩線，看的不是它會不會出錯，而是它「對外宣稱的行為」跟「實際被設計成的行為」之間，有沒有使用者察覺不到的落差。做 AI 產品的，這代表兩件具體的事：為了安全、合規、品牌做的調校，只要會系統性偏離使用者預期的「準確中立」，就該在使用當下顯著揭露，別塞進服務條款；行銷話術也別再無限上綱講「最準」「最客觀」，Workado 那 53% 就是前車之鑑。而做為使用者，這件事提醒一個更基本的認知：AI 給你的答案，永遠是被某個目標函數調過的，差別只在業者有沒有老實告訴你調了什麼。FTC 這步不完美，政治動機也確實可議，但它把一個對的問題擺上檯面：在你信任一台機器九成答案的時代，「它有沒有偷偷偏離你的預期」本來就該是消費者保護要管的事。

## 常見問題

<p><strong>FTC 這份 AI 準確度政策聲明現在有法律效力嗎？</strong><br>還沒有。它是一份「政策聲明草案」，七月一日公布後開放公眾評論到七月三十一日，屬於 FTC 表達執法立場、徵求意見的階段，不是正式規則。但它闡述的是 FTC 打算怎麼用《FTC 法》第 5 條的欺騙條款來管 AI，[即便只是政策聲明，也等於預告了執法方向](https://www.consumerfinancialserviceslawmonitor.com/2026/07/ftc-proposes-policy-statement-on-ai-accuracy-and-ideological-manipulation-of-ai-outputs/)。</p>

<p><strong>AI 本來就會有安全過濾和微調，這樣算不算違規？</strong><br>不算，只要你老實揭露。FTC 的重點不是禁止調校，是禁止「偷偷調校又對外宣稱中立」。草案明確要求，任何把系統調離使用者合理預期的設計都要清楚顯著地揭露，而且[藏在服務條款裡的免責聲明不算數，愈牴觸使用者預期就要揭露得愈顯著](https://www.mondaq.com/unitedstates/technology/1811176/ftc-seeks-comment-on-ai-accuracy-policy-statement)。</p>

<p><strong>台灣有沒有類似的規定可以管 AI 不實或誤導？</strong><br>有。立法院去年十二月三讀通過的《人工智慧基本法》明訂，政府應避免 AI 出現廣告不實、資訊誤導或造假，違反《公平交易法》《消費者保護法》等既有法令，主管機關是國科會，[高風險應用還須加註警語](https://www.cna.com.tw/news/aipl/202512230036.aspx)。台灣的做法跟 FTC 一樣，是把 AI 誤導導回既有的消費者保護法規，而不是另立專門罰則。</p>

<p><strong>FTC 說的「系統偏離合理預期」跟 AI 會產生幻覺是同一件事嗎？</strong><br>不是。幻覺是模型能力的限制、非蓄意的錯誤；FTC 這份草案管的是蓄意的設計：業者刻意把正確輸出覆蓋掉去追別的目標，卻繼續用「最準」行銷。前者是技術問題，後者才是欺騙問題，兩者的責任歸屬完全不同。</p>
