---
title: "醫療 AI 導入怎麼做？五道臨床關卡"
slug: "medical-ai-implementation-gates"
description: "醫療 AI 導入醫院不能只看模型準確率，還要過用途定義、代表性資料、FHIR 交換、臨床工作流與上線後監測五道關卡。整理台灣 TFDA、衛福部三大中心與 FDA 實務原則。"
excerpt: "醫療 AI 能不能進醫院，決勝點不在展示會上的準確率。從資料代表性、FHIR 串接到醫師覆核和版本監測，每一關都要留下可追溯的證據。"
publishDate: "2026-08-22T17:11:21.808Z"
category: "tech"
subcategory: "ai"
tags:
  - "醫療AI"
  - "數位健康"
  - "資料治理"
  - "AI治理"
  - "AI"
author: "lightman"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "published"
sourceType: "author"
contentType: "column"
disclaimerType: "medical"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
coverImage: "covers/medical-ai-implementation-gates-cover.webp"
coverAlt: "醫療人員在醫院電腦前檢視臨床 AI 工作流程，象徵醫療 AI 導入必須通過多道關卡"
highlights:
  - "醫療 AI 導入要先定義用途、輸入資料、輸出結果與使用者，再做代表性資料與臨床情境驗證，模型準確率不能單獨代表可用性。"
  - "台灣食藥署 2026 年公告人工智慧醫療器材優良機器學習實務，明列訓練與測試資料集、臨床評估、上市後性能監控等管理重點。"
  - "衛福部臨床 AI 取證驗證中心以跨院資料、FHIR 標準與聯邦學習支援外部驗證，AI 影響性評估中心則處理臨床效益、健康經濟與給付證據。"
expertNote: "醫院評估 AI 時，先要求廠商交出用途邊界、族群資料、版本變更與失效處置，再談導入價格。資訊介接與醫師覆核要在採購規格裡寫死，這兩處最容易在展示後才發現接不起來。"
risksAndLimits:
  - "FDA 與 WHO 指引提供治理框架，不能直接替代台灣個案的醫材分類與查驗登記"
  - "衛福部中心頁面描述的是制度與服務方向，未代表每項 AI 產品都已完成臨床驗證"
  - "FHIR 能規範交換格式，資料品質、代碼對應與權限設計仍須由導入機構驗收"
references:
  - title: "公告「人工智慧醫療器材優良機器學習實務：發展與管理原則」"
    url: "https://www.fda.gov.tw/TC/siteListContent.aspx?id=50868&sid=310"
    publisher: "衛生福利部食品藥物管理署"
  - title: "Good Machine Learning Practice for Medical Device Development: Guiding Principles"
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles"
    publisher: "U.S. Food and Drug Administration"
  - title: "Guiding Principles: Good Machine Learning Practice for Medical Device Development"
    url: "https://www.fda.gov/media/153486/download?attachment="
    publisher: "U.S. Food and Drug Administration"
  - title: "Transparency for Machine Learning-Enabled Medical Devices: Guiding Principles"
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/transparency-machine-learning-enabled-medical-devices-guiding-principles"
    publisher: "U.S. Food and Drug Administration"
  - title: "Marketing Submission Recommendations for a Predetermined Change Control Plan for Artificial Intelligence-Enabled Device Software Functions"
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence"
    publisher: "U.S. Food and Drug Administration"
  - title: "臺灣智慧醫療三大中心"
    url: "https://aicenter.mohw.gov.tw/acp/mp-212.html"
    publisher: "衛生福利部"
  - title: "臨床AI取證驗證中心"
    url: "https://aicenter.mohw.gov.tw/AC/cp-7203-82655-208.html"
    publisher: "衛生福利部資訊處"
  - title: "FHIR Overview"
    url: "https://hl7.org/fhir/overview.html"
    publisher: "HL7 International"
  - title: "Ethics and governance of artificial intelligence for health"
    url: "https://www.who.int/publications/i/item/9789240029200"
    publisher: "World Health Organization"
  - title: "WHO issues first global report on Artificial Intelligence in health and six guiding principles"
    url: "https://www.who.int/news/item/28-06-2021-who-issues-first-global-report-on-ai-in-health-and-six-guiding-principles-for-its-design-and-use"
    publisher: "World Health Organization"
originalContribution: "以醫院實際導入的資料流與責任流為主軸，把台灣 TFDA、衛福部三大中心、FHIR 與 FDA AI/ML 生命週期原則整理成五道可驗收的臨床關卡，讓採購、資訊與醫療團隊能用同一張清單談 AI。"
column: "ai-healthcare"
topics:
  - "medical-ai-frontline"
  - "ai-medical-regulation"
---

醫療 AI 要進醫院，先過五道關：用途定義、代表性資料驗證、資料交換、臨床工作流與責任分工、上線後監測。只拿一個漂亮的準確率或展示會 Demo，還不足以證明它能安全地放進照護流程；FDA 的機器學習實務原則把資料、臨床情境、人機團隊與部署後監控都列入同一個產品生命週期。[FDA 的 GMLP 指引](https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles)也明確要求，模型要對應預定用途，測試要接近真實臨床條件。

這篇的判斷很簡單：醫療 AI 導入是一個跨部門驗收案，模型只是其中一個零件。台灣食藥署 2026 年 6 月公告的 AI 醫材機器學習實務，已把訓練與測試資料集、臨床評估、上市後性能監控放在同一套管理框架裡。[想先補上 FHIR 這個資料交換底層的讀者，可以從站內的 FHIR 入門稿開始](/articles/fhir-ai-medical-data-taiwan/)。

## 什麼叫醫療 AI 導入

醫療 AI 導入，指的是把一項模型功能放進明確的醫療工作流，讓指定的人在指定時間，用指定資料得到一個可以採取行動的輸出。這個定義包含四個欄位：誰使用、處理哪類病人、讀什麼資料、輸出要影響哪個決策。少一欄，後面的驗證結果就很難解讀。

實際資料流通常會長成這樣：病人的 EHR 或影像進入系統，模型產出風險分數、標記或文字草稿，醫療人員在自己的介面看到結果，最後由流程決定採用、覆核、退回或升級處理。每一步都應能留下模型版本、輸入時間、輸出內容與人工處置紀錄。WHO 的健康 AI 治理原則把人類自主、透明、責任與持續評估列為核心原則，這正是把 Demo 變成臨床服務時要補上的骨架。[WHO 的六項原則](https://www.who.int/news/item/28-06-2021-who-issues-first-global-report-on-ai-in-health-and-six-guiding-principles-for-its-design-and-use)指出，醫療決策的人類控制權與受影響者的救濟機制都要被保留。

<img src="/images/medical-ai-implementation-gates-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫院電腦螢幕顯示臨床決策支援流程與稽核紀錄介面">

## 五道臨床關卡

### 第一關：先把用途邊界寫成一句話

「協助醫師判讀」太寬，無法拿來做驗收。採購文件至少要寫出輸入資料的來源與格式、適用族群、輸出形式、使用者、建議反應時間，以及哪些情況必須停止使用。若模型從影像標記病灶，和模型替病人產出治療建議，風險、證據與法規路線都不同。

FDA 的 GMLP 把模型設計與可取得的資料、預定用途綁在一起，也要求多專業團隊參與整個產品生命週期。[FDA 的透明度原則](https://www.fda.gov/medical-devices/software-medical-device-samd/transparency-machine-learning-enabled-medical-devices-guiding-principles)則要求把醫療目的、功能、適用疾病與使用情境交代給醫療人員、病人與管理者。我的做法是先寫一頁「用途卡」，再讓臨床、資訊、法遵與廠商逐欄簽名，後面每一項測試都回頭對這張卡。

### 第二關：資料要像病房，不要只像資料集

模型在開發資料上表現好，還要回答三個問題：資料是否涵蓋預定病人、訓練集與測試集是否獨立、真實臨床的缺漏與設備差異是否被測過。FDA、Health Canada 與英國 MHRA 的 GMLP 十項原則，包含代表性研究參與者與資料集、訓練資料和測試資料獨立、在臨床相關條件測試，以及部署後監控模型表現。[這份官方原則清單](https://www.fda.gov/media/153486/download?attachment=)可直接拿來改成院內驗證表。

台灣場域還要多問一層：模型接觸的病人是不是本院的病人，檢驗單位、影像設備、轉診型態與病歷書寫習慣有沒有變。衛福部臨床 AI 取證驗證中心的官方說明指出，這套計畫要讓開發商與研究團隊使用更大規模、較符合台灣人群特性的資料驗證，也把跨院合作、FHIR 與聯邦學習列入架構。[臨床 AI 取證驗證中心](https://aicenter.mohw.gov.tw/AC/cp-7203-82655-208.html)這個方向，補的是「外院能不能重現」這一關。

<img src="/images/medical-ai-implementation-gates-s2.webp" width="960" height="720" loading="lazy" decoding="async" alt="醫療研究人員比較 AI 模型驗證資料與臨床測試結果">

### 第三關：資料交換要能被系統驗收

AI 讀不到病歷，準確率再高也進不了醫師的畫面。HL7 對 FHIR 的定義是醫療資訊電子交換標準，基本單位是可組合的 Resource，病人、檢驗、診斷報告、用藥與照護流程可以用不同資源互相參照。[FHIR 官方 Overview](https://hl7.org/fhir/overview.html)也把結構化資料與機器處理列為電子病歷互通的需求。

落地時不要只驗證「API 打得通」。資訊團隊要逐欄確認病人識別、時間、單位、代碼、缺值、版本與權限；臨床團隊要確認畫面上的資料還保留原始脈絡。FHIR 負責交換語言，資料品質與語意對應仍要由醫院驗收。這也是我在[拆解醫療 AI 合規上線前的六個坑](/articles/medical-ai-compliance-lessons/)時反覆強調的地方：權限、稽核與資料隔離若沒有在架構階段決定，到了上線前很難補成完整流程。

<img src="/images/medical-ai-implementation-gates-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療資訊系統介面以結構化資料連接電子病歷、FHIR 資源與 AI 分析模組">

### 第四關：把人機分工寫進操作流程

醫師覆核不能只寫在簡報裡。系統要明確顯示 AI 結果的狀態，醫師要能接受、修改、退回或標記不適用，遇到影像品質不足、資料過期或模型無法判讀時，流程要有替代路徑。這些設計會直接決定醫療人員是在做有意義的覆核，還是在畫面上快速按下同意。

FDA 的透明度指引把「人與 AI 團隊的表現」與「提供清楚、必要資訊」列為重點；WHO 則要求維持人類對醫療系統與醫療決策的控制，並讓責任與救濟管道清楚可追。對醫院來說，責任分工至少要拆成四張表：廠商負責什麼、資訊部門負責什麼、臨床使用者負責什麼、病人如何知道 AI 參與了哪一段。

### 第五關：上線後要看版本與失效

模型上線不是驗收結束。醫院應先定義監測指標、資料漂移門檻、誤報與漏報的回報方式、停用條件、版本回復方法，以及誰有權批准更新。這些項目要能從稽核紀錄還原，不能靠某位工程師的記憶。

FDA 2025 年發布的 AI 醫材預定變更控制計畫指引，建議廠商在送審時描述預計修改、開發驗證與實作方法，以及修改影響評估；這套做法讓產品在既定範圍內更新時，仍有安全性與有效性的證據鏈。[FDA 的 PCCP 最終指引](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence)就是把「模型會變」納入事前設計的例子。台灣醫院不必照搬美國文件，但可以把同樣的欄位放進合約與變更審查單。

<img src="/images/medical-ai-implementation-gates-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫院 AI 治理儀表板顯示模型版本、效能監測與人工覆核狀態">

## 台灣現在走到哪裡

台灣的監管與導入支援已經開始分層。食藥署 2026 年 6 月公告「人工智慧醫療器材優良機器學習實務：發展與管理原則」，公告理由直接點出產品設計、軟體工程品質、訓練與測試資料集、臨床評估及上市後性能監控都需要適當規範。[食藥署公告頁](https://www.fda.gov.tw/TC/siteListContent.aspx?id=50868&sid=310)因此，醫院採購時把模型準確率當唯一門檻，會漏掉官方已經要求管理的其他環節。

衛福部「臺灣智慧醫療三大中心」目前把工作拆成負責任 AI、臨床 AI 取證驗證、AI 影響性評估三類：前者處理導入治理與風險管理，中間一層支援外部驗證與臨床導入，後者蒐集臨床效益與成本資料，提供健康經濟與給付決策證據。[官方中心總覽](https://aicenter.mohw.gov.tw/acp/mp-212.html)這個分工很有用，因為「能不能用」與「值不值得付費」是兩份不同的驗收報告。

醫療團隊若要把 AI 放進 EHR，FHIR 互通與臨床證據應該同時規畫。只做介接，醫師可能看得到結果卻不信；只做試驗，結果又可能回不到日常畫面。這兩條線要在同一個導入專案裡排時程，才能測出真正的工作流成本。

## 我的導入清單

我會要求醫院在簽約前拿到八份文件：用途卡、資料字典、訓練與測試資料說明、本地或外部驗證報告、臨床操作流程、AI 輸出與人工處置的稽核格式、版本變更計畫、停用與回復程序。這份清單是依 TFDA 的資料與上市後管理要求、FDA 的 GMLP/PCCP，以及 WHO 對自主、透明與責任的原則整理而成。

採購評分也要把「接得上」與「有人管」列成獨立項目。API 規格、FHIR Profile、代碼對應、權限與稽核紀錄屬資訊驗收；誰覆核、多久回應、何時停用、病人如何被告知，屬臨床與治理驗收。兩者缺一，導入案就只完成一半。

我的取捨是，第一個導入場景應該選輸出邊界窄、失效時有人工替代、資料品質能量測的工作流。這樣做不會把醫院一次推進最高風險的決策位置，卻能先把介接、覆核、稽核與監測四件基礎工程做出來，再拿真實使用資料決定要不要擴大。

## 常見問題

### 醫療 AI 模型準確率高，就能直接導入嗎？

不能只用單一準確率做決定。代表性資料、臨床相關情境、人機團隊表現與上線後監測，都會影響模型在本院是否可用，FDA 的 GMLP 原則把這些項目列在同一個生命週期裡。

### 有了 FHIR，醫療 AI 就能直接讀懂所有病歷嗎？

FHIR 提供交換標準與 Resource 架構，讓系統有共同的資料語言。病歷欄位的完整度、代碼對應、缺值處理、權限與版本仍須由醫院逐項驗收，FHIR 本身不會替導入團隊完成這些工作。

### AI 判斷出錯時，應該由誰負責？

責任要在導入前拆給廠商、醫院資訊部門、臨床使用者與治理單位，並寫進操作和異常處理流程。WHO 的原則要求責任、問責與受影響者的救濟機制可運作，醫院不能等事故發生後才開始找責任邊界。
