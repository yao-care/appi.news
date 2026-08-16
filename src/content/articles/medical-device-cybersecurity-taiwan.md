---
title: "醫療器材資安是什麼？台灣醫材網路安全規範走到哪"
slug: "medical-device-cybersecurity-taiwan"
description: "醫療器材資安不是醫院掛號系統或病歷資料庫的一般IT防護，而是心律調節器、血糖機、雲端心電圖這類聯網醫材本身的軟體安全。美國FDA已把資安文件列為上市審查強制項目，台灣食藥署也發布網路安全指引與五種醫材專用範本。整理它是什麼、怎麼運作、台灣規範走到哪，以及醫院採購與病患該注意的重點。"
excerpt: "醫療器材資安管的不是醫院掛號系統，是心律調節器、血糖機這類聯網醫材自己的軟體安全。台灣的指引與範本都已補上，但補的速度追不上這兩年醫院被系統性攻擊的頻率。"
publishDate: "2026-08-14T17:09:18.177Z"
category: "tech"
subcategory: "security"
tags:
  - "資安"
  - "醫療政策"
  - "數位健康"
  - "個資保護"
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
coverImage: "covers/medical-device-cybersecurity-taiwan-cover.webp"
coverAlt: "醫院內的聯網醫療監測設備，象徵醫療器材資安防護（示意圖）"
coverImageCredit: "Photo by Jair Lázaro on Unsplash"
highlights:
  - "美國FDA自2023年9月27日起要求醫材上市申請檢附軟體物料清單（SBOM）等資安文件，2023年10月1日後未附齊即直接退件（Refuse to Accept）。"
  - "台灣食藥署2021年5月3日更新「適用於製造業者之醫療器材網路安全指引」，同年12月再公布五種醫材專用的資安評估範本，涵蓋心律調節器、血糖機等聯網與植入式裝置。"
  - "2025年CrazyHunter駭客集團系統性攻擊馬偕、彰化基督教、亞洲大學附設三家醫院，馬偕外洩約1,660萬筆病患資訊、彰基428萬筆，資安署首度派專家駐點協助。"
risksAndLimits:
  - "TFDA醫療器材網路安全指引屬行政指引與查驗登記審查要求，未如美國FDA有法律明訂的退件（RTA）授權"
  - "文中馬偕、彰基資料外洩案例是醫院整體IT系統遭入侵，非公開證實的聯網醫材韌體漏洞攻擊"
  - "TFDA資安評估範本目前僅涵蓋五類醫材，未涵蓋所有聯網醫材類別"
  - "FDA的SBOM與資安文件要求僅適用其定義的「cyber device」，非全部醫材皆須比照辦理"
references:
  - title: "FDA Finalizes Premarket Cybersecurity Guidance for Medical Devices"
    url: "https://www.kslaw.com/news-and-insights/fda-finalizes-premarket-cybersecurity-guidance-for-medical-devices"
    publisher: "King & Spalding"
    note: "cyber device定義、SBOM要求、Section 524B、生效日與RTA退件政策"
  - title: "公告「適用於製造業者之醫療器材網路安全指引」"
    url: "https://regulation.cde.org.tw/10254/8725/56077/regPost"
    publisher: "台灣藥物法規資訊網"
    note: "TFDA 2021年5月3日公告文號FDA器字第1101603391號，取代2019年版本"
  - title: "公布「醫療器材網路安全評估分析參考範本」"
    url: "https://www.fda.gov.tw/TC/siteListContent.aspx?sid=11652&id=39315"
    publisher: "衛生福利部食品藥物管理署"
    note: "2021年12月6日公告、2022年6月10日更新，五種醫材專用範本清單"
  - title: "首宗特種資料外洩風暴：解密紅色「瘋狂獵人」鎖定台灣醫院系統性攻擊危機"
    url: "https://www.twreporter.org/a/hospitals-sensitive-data-breach"
    publisher: "報導者"
    note: "CrazyHunter攻擊馬偕、彰基、亞大附醫的手法與外洩規模"
  - title: "台灣首例醫院大規模遭駭：馬偕醫院遭勒索軟體攻擊，資安署進駐協助"
    url: "https://www.informationsecurity.com.tw/article/article_detail.aspx?aid=11629"
    publisher: "資安人科技網"
    note: "2025年2月9日攻擊細節、資安署首次專家駐點應對"
topics:
  - "ai-medical-regulation"
column: "ai-healthcare"
---

醫療器材資安，指的是心律調節器、血糖機、雲端心電圖系統這類聯網醫材本身的軟體安全，不是醫院掛號系統或病歷資料庫的一般IT防護。這條防線這幾年才真正成形：美國FDA從2023年開始把資安文件列為醫材上市審查的強制項目，台灣食藥署也陸續補上指引與範本。規範補齊的速度，追不上台灣醫院這兩年被系統性攻擊的頻率。

## 是什麼：聯網醫材的資安，跟醫院IT資安不是同一件事

一般講「醫院資安」，多半指的是掛號系統、病歷資料庫、內部辦公網路這類IT基礎設施。醫療器材資安管的是另一層：裝在病患身上或接在病床邊、本身跑著軟體並連上網路的那台機器。美國FDA把這類產品定義為「cyber device」，條件是含有經驗證、安裝或授權的軟體、能連上網路、且具備可能被資安威脅利用的特性。凡符合這個定義的醫材，[上市申請就得檢附完整的資安文件](https://www.kslaw.com/news-and-insights/fda-finalizes-premarket-cybersecurity-guidance-for-medical-devices)，不再只是選配。

這兩層資安容易混在一起講，但攻擊面完全不同。裝置本身的軟體可能十年沒換過，卻要一直連著網路收發資料；而攻進醫院的入口，往往不在裝置本身，而在裝置外圍的串接系統。[美國心臟監測商iRhythm去年就是一個例子](/articles/irhythm-phi-breach-third-party-perimeter/)：它的臨床系統與醫材本身都沒事，被攻破的是代管在外的第三方商業應用，入口是社交工程而不是硬體漏洞。醫療器材資安要顧的，其實是從裝置韌體到雲端後台、再到串接廠商的整條鏈，任何一段沒補好，整體防護都算沒做完。

<img src="/images/medical-device-cybersecurity-taiwan-s1.webp" width="960" height="720" loading="lazy" decoding="async" alt="醫院病房內連網的醫療監測儀器，象徵聯網醫療器材（示意圖）">

## 怎麼運作：軟體物料清單、上市前文件、修補生命週期

醫材資安審查的核心工具是軟體物料清單（SBOM），把裝置裡用到的每一個軟體元件、不管是自家寫的還是第三方套件，逐項列出名稱、版本與供應商，讓後續有漏洞通報時能立刻比對哪些產品受影響。[FDA的規定涵蓋自有與第三方元件兩種，並建議採用NTIA的軟體元件透明度框架，搭配CISA已知遭利用漏洞清單做比對](https://www.kslaw.com/news-and-insights/fda-finalizes-premarket-cybersecurity-guidance-for-medical-devices)。除了SBOM，上市申請還要附威脅模型、風險評估、元件維護支援資訊，以及尚未解決的異常評估，這些文件合在一起才構成一份完整的資安風險報告。

台灣的做法是先給範本，讓廠商照著填。食藥署[2021年12月公布「醫療器材網路安全評估分析參考範本」，2022年6月又更新過一次](https://www.fda.gov.tw/TC/siteListContent.aspx?sid=11652&id=39315)，一共五份：一份通用範本，另外四份分別對應植入式心律調節器脈搏產生器、葡萄糖試驗系統、血氧濃度應用軟體、雲端心電圖管理系統。廠商申請查驗登記時，照對應範本準備資安文件與業者揭露聲明書，等於把美國那套「威脅模型＋SBOM＋測試證據」的邏輯，拆成台灣審查人員看得懂的固定格式。

<img src="/images/medical-device-cybersecurity-taiwan-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="電腦螢幕顯示程式碼與資安檢查文件，象徵軟體物料清單審查（示意圖）">

上市之後才是真正的挑戰。一般軟體發現漏洞可以隨時推更新，醫材韌體改版卻牽動法規列管的產品規格，改版本身可能要重新走一次審查或至少報備。這也是為什麼醫材廠商的資安承諾，不能只看上市那一刻的文件齊不齊，還要看它有沒有建立一套能長期維護、快速回應漏洞通報的機制。

## 台灣現況：指引補上了，攻擊已經先到

台灣其實動作不晚。食藥署最早在2019年11月18日就發布過一版醫材網路安全指引，[2021年5月3日再以FDA器字第1101603391號公告更新版「適用於製造業者之醫療器材網路安全指引」，取代2019年那版](https://regulation.cde.org.tw/10254/8725/56077/regPost)。這個時間點其實比美國早：美國國會要到2022年底才把資安要求正式寫進聯邦法（Section 524B），2023年3月生效、同年10月才開始真的因為資安文件不齊而退件。台灣在紙面規範上並沒有慢半拍，差別在於：美國那套有法律授權的強制退件機制撐腰，台灣目前仍是行政指引與查驗登記審查要求，[兩地在AI醫材監管上走的路線本來就不同](/articles/fda-ai-medical-device-taiwan-eu/)，資安這塊也延續了同樣的邏輯，一個靠法定退件，一個靠審查關卡。

規範補齊的同時，台灣醫院這兩年正好被攻擊得很兇。2025年2月9日，馬偕紀念醫院[台北、淡水院區超過500台電腦系統當機，核心醫令與掛號系統停擺](https://www.informationsecurity.com.tw/article/article_detail.aspx?aid=11629)，數位發展部資安署首度派專家直接進駐醫院協助應變，事後也把60家關鍵基礎設施醫院列為優先強化對象。攻擊者用的手法是把惡意程式偽裝成印表機驅動程式躲過防毒軟體，入侵Active Directory主機取得高權限後大規模感染。[這波系統性攻擊後來擴及彰化基督教醫院與亞洲大學附設醫院，馬偕外洩約1,660萬筆病患資訊、彰基428萬筆](https://www.twreporter.org/a/hospitals-sensitive-data-breach)，包含病歷、身分證字號、手術紀錄等特種資料。

<img src="/images/medical-device-cybersecurity-taiwan-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫院機房內的伺服器與網路設備，象徵醫院資訊系統資安防護（示意圖）">

要說清楚的是，這幾起事件公開資料顯示攻擊的是醫院整體IT系統與內部網路，不是特定聯網醫材的韌體漏洞被直接入侵。但兩者共用同一個現實：醫院的網路環境愈來愈密，掛號系統、病歷資料庫跟連床邊的監測儀器往往在同一張網裡跑，IT系統一旦被攻陷，聯網醫材是不是完全獨立於受害範圍之外，很難打包票。這正是資安指引與範本存在的意義，把裝置本身的軟體安全顧好，至少不讓它變成攻擊面的另一個破口。

## 該注意什麼

對醫院採購端來說，挑聯網醫材不能只比功能規格，也該問廠商要SBOM、要漏洞通報窗口、要修補時程承諾，這些原本就是TFDA範本要求廠商準備的文件，採購時直接拿來當比較依據並不難。對醫材廠商來說，資安文件現在是市場准入的一部分，尤其要銷往美國的產品，缺件就是直接被退件，早點把SBOM與威脅模型的準備流程內建進產品開發，比事後補件划算。對一般使用者而言，植入式或穿戴式聯網醫材出問題通常不能自己更新，只能靠回廠或原廠推播修補，選購前多留意廠商是否公開資安聯絡管道、過去是否穩定釋出韌體更新，會比單看價格或外觀更實際。

<img src="/images/medical-device-cybersecurity-taiwan-s4.webp" width="960" height="720" loading="lazy" decoding="async" alt="醫護人員檢視醫療設備規格文件，象徵醫院採購醫材前的資安評估（示意圖）">

<h2>常見問題</h2>

<p><strong>醫療器材資安漏洞真的會被拿來攻擊病患嗎？</strong><br>目前公開紀錄的重大案例，像馬偕、彰基遭CrazyHunter攻擊，<a href="https://www.twreporter.org/a/hospitals-sensitive-data-breach">鎖定的都是醫院整體IT系統與病患資料庫，並非個別聯網醫材的韌體被直接入侵</a>。但FDA與TFDA之所以要求SBOM與威脅模型，正是為了在漏洞被大規模利用之前先堵住這個攻擊面，而不是等事情發生才處理。</p>

<p><strong>台灣的醫材網路安全指引是強制的嗎？</strong><br>它屬於行政指引，不是獨立專法，但已經是聯網醫材<a href="https://www.fda.gov.tw/TC/siteListContent.aspx?sid=11652&id=39315">查驗登記審查的一部分</a>，廠商要照對應範本備齊資安文件才能過關，實務效果接近強制。差別在於台灣沒有像美國那樣，由法律明訂資安文件不齊就直接退件的授權機制。</p>

<p><strong>買穿戴裝置或植入式醫材，一般人該注意什麼？</strong><br>先看廠商是否公開資安聯絡窗口、過去是否穩定釋出韌體更新，這比單純比較功能規格更能反映廠商長期維護的意願。植入式裝置尤其重要，因為出問題往往無法自行更新，只能靠回廠處理，選購前掌握廠商的維護紀錄比事後補救實際。</p>
