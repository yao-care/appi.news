---
title: "Passkey 是什麼、怎麼設定？簡訊 OTP 退場台灣現況"
slug: "passkey-taiwan-sms-otp-replacement"
description: "簡訊一次性密碼擋不住即時釣魚與門號竊取，台灣的銀行與網購結帳正陸續改用 Passkey 刷臉或指紋登入。整理原因、台灣現有服務清單、逐步設定教學與換手機的備援作法。"
publishDate: "2026-08-06T05:55:28.112Z"
updatedDate: "2026-08-22T00:00:00.000Z"
status: "published"
category: "tech"
subcategory: "security"
tags:
  - "資安"
  - "數位身分"
  - "金融科技"
author: "appi-editorial"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，經 APPI 編輯部人工查證與編輯；文中事實與每一條超連結均逐條核對官方或權威來源。"
coverImage: "covers/passkey-taiwan-sms-otp-replacement.webp"
coverAlt: "數位資安與無密碼登入意象（示意圖）"
coverImageCredit: "Photo by Towfiqu barbhuiya on Pexels"
highlights:
  - "簡訊驗證碼擋不住即時釣魚轉貼與門號竊取（SIM swap），NIST 最新準則已把它列為「受限」驗證方式。"
  - "台灣第三方支付公會與四大金流業者、多家銀行已陸續開通 Passkey 刷臉或指紋結帳與登入。"
  - "設定不需額外硬體，換手機時的備援要靠雲端密碼管理工具同步，否則得重新註冊。"
risksAndLimits:
  - "各銀行與支付業者導入進度不一，部分服務仍在測試階段，尚未全面開放"
  - "全球採用數據引自 FIDO 聯盟跨國調查，非台灣本地實測數字"
  - "換生態系（如 iPhone 換 Android）目前仍需掃 QR code 驗證，非一鍵搬移"
  - "各業者設定畫面與選單名稱可能隨版本更新調整，與本文截圖時點未必一致"
references:
  - title: "SP 800-63B: Digital Identity Guidelines — Authentication and Lifecycle Management"
    url: "https://pages.nist.gov/800-63-3/sp800-63b.html"
    publisher: "NIST"
  - title: "簡訊驗證掰了！Passkey 技術登台 75% 全球消費者已採用"
    url: "https://news.tvbs.com.tw/life/3269001"
    publisher: "TVBS 新聞網"
  - title: "[新聞] 簡訊驗證掰了！Passkey 技術登台 75% 全球"
    url: "https://www.ptt.cc/bbs/creditcard/M.1785431040.A.983.html"
    publisher: "PTT creditcard 板"
  - title: "Five Billion Passkeys: FIDO Alliance Reports Mainstream Global Usage on World Passkey Day 2026"
    url: "https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/"
    publisher: "FIDO Alliance"
  - title: "FIDO Passkeys：Passwordless Authentication"
    url: "https://fidoalliance.org/passkeys/"
    publisher: "FIDO Alliance"
  - title: "升級行動裝置綁定與 FIDO 生物辨識"
    url: "https://bank.sinopac.com/sinopacBT/webevents/sinopacmidfido/index.html"
    publisher: "永豐銀行"
  - title: "行動自然人憑證 TW FidO"
    url: "https://fido.moi.gov.tw/pt/"
    publisher: "中華民國內政部"
  - title: "FIDO 在臺落地規模擴大，逾 300 個政府與企業系統支援"
    url: "https://www.ithome.com.tw/news/172885"
    publisher: "iThome"
---

簡訊一次性密碼（SMS OTP）擋不住兩種現在很常見的攻擊：即時把驗證碼轉貼到真網站的釣魚手法，以及把電話號碼過戶到別人 SIM 卡上的門號竊取。Passkey 用手機或電腦內建的生物辨識搭配裝置端的公開金鑰配對取代密碼與簡訊驗證碼，讓這兩種攻擊都偷不到可用的東西。台灣的銀行、網購結帳已陸續開通這套機制，設定門檻不高，真正容易卡關的反而是換手機時要怎麼把 Passkey 帶過去。

<img src="/images/passkey-taiwan-sms-otp-replacement-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="手機螢幕顯示簡訊驗證碼輸入畫面（示意圖）">

## 簡訊驗證碼為什麼要退場

簡訊 OTP 擋不住兩種攻擊。一是即時釣魚：詐騙集團架假銀行或購物網站，誘導使用者當場輸入驗證碼再轉貼到真網站盜刷，使用者收到的簡訊本身完全正常，擋不下這種轉貼攻擊。二是門號竊取（SIM swap）：詐騙集團拿受害者個資去電信門市補辦 SIM 卡，把電話號碼過戶到自己手上，銀行寄出的驗證碼就直接送到詐騙集團手機。NIST 最新版數位身分準則已把透過電話網路（含簡訊）傳送的一次性密碼列為「受限」（restricted）驗證方式，要求機構若還要用，得先做風險評估並提供至少一種非受限的替代方式（見 [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) 5.1.3.3 節）。

這股趨勢也吹進台灣。2026 年 7 月，台灣第三方支付公會攜手藍新科技、綠界科技等四大金流業者宣布，網購結帳與公益捐款將逐步改用 Passkey 刷臉或指紋確認（見 [TVBS 報導](https://news.tvbs.com.tw/life/3269001)）。這則新聞轉貼到 PTT 信用卡板累積超過 80 則推文，討論多集中在換手機怎麼辦、被脅迫刷臉的風險（見 [PTT 原文](https://www.ptt.cc/bbs/creditcard/M.1785431040.A.983.html)）。

延伸閱讀：[零信任架構三階段：台灣政府機關、金融業做到哪](/articles/zero-trust-architecture-taiwan/)

<img src="/images/passkey-taiwan-sms-otp-replacement-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="使用者以指紋辨識解鎖智慧型手機（示意圖）">

## Passkey 是什麼、台灣哪些服務已經能用

Passkey 註冊時裝置會產生一對金鑰：公開金鑰留在伺服器，私密金鑰只存在手機或電腦裡，不會被傳輸。登入時用平常解鎖裝置的指紋、臉部辨識或螢幕鎖確認身分，由私密金鑰簽署伺服器送來的驗證挑戰（見 [FIDO 聯盟說明](https://fidoalliance.org/passkeys/)）。釣魚網站騙不到可轉貼的字串，門號被過戶也動不到裝置裡的私密金鑰。運作原理完整說明見本站先前整理的〈[Passkey 通行密鑰是什麼](/articles/passkey-passwordless-login/)〉。FIDO 聯盟 2026 年調查指出，全球估計已有 50 億組 Passkey 在用，75% 受訪者已在至少一個帳戶啟用過（見 [FIDO 2026 年報告](https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/)）。

台灣端，政府的行動自然人憑證（TW FidO）已介接超過 300 個政府與企業系統，可用生物辨識登入線上報稅、查健保資料（見 [TW FidO 官網](https://fido.moi.gov.tw/pt/)、[iThome 報導](https://www.ithome.com.tw/news/172885)）；銀行端如永豐銀行已開放生物辨識快速登入（見 [永豐銀行說明](https://bank.sinopac.com/sinopacBT/webevents/sinopacmidfido/index.html)）；網購與行動支付端則有前述四大金流業者導入的刷臉結帳。

<img src="/images/passkey-taiwan-sms-otp-replacement-s3.webp" width="960" height="600" loading="lazy" decoding="async" alt="使用者手持智慧型手機進行網路購物付款（示意圖）">

## 逐步設定教學

以永豐銀行 App 為例：先完成裝置綁定（可選 App 內 SIM 卡驗證、晶片金融卡驗證、臨櫃或視訊驗證四種之一），再到登入設定啟用生物辨識並完成 FIDO 註冊，之後開啟 App 就能直接用指紋、臉部或虹膜辨識登入（見 [永豐銀行 FIDO 說明](https://bank.sinopac.com/sinopacBT/webevents/sinopacmidfido/index.html)）。Google 帳號可在帳號安全設定裡直接建立 Passkey（見 [Google 官方說明](https://support.google.com/accounts/answer/13548313)）；Apple 裝置則要先開啟 iCloud 鑰匙圈與雙重認證才能建立並同步（見 [Apple 說明](https://support.apple.com/en-us/102195)）。多數服務目前仍保留密碼或簡訊驗證碼當備援，不是唯一登入入口。

<img src="/images/passkey-taiwan-sms-otp-replacement-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="桌面上的智慧型手機顯示安全鎖定畫面（示意圖）">

## 換手機時的備援作法

<img src="/images/passkey-passwordless-login-s5.webp" width="960" height="960" loading="lazy" decoding="async" alt="筆電與手機並排，象徵通行密鑰在多裝置間同步（示意圖）">

換手機前最重要的是確認同步機制有開啟。Apple 裝置若已開 iCloud 鑰匙圈，登入同一個 Apple ID 就能在新裝置取用 Passkey（見 [Apple 說明](https://support.apple.com/en-us/102195)）；Google 帳號的 Passkey 存在密碼管理工具裡，換機登入同帳號也會自動帶過去（見 [Google 官方說明](https://support.google.com/accounts/answer/13548313)）。換到不同生態系（如 iPhone 換 Android）目前得靠掃 QR code 的跨裝置流程重新驗證；舊裝置遺失且未同步的話，多數服務會退回密碼或原有方式，可用備援登入重新註冊一把新的 Passkey。

<h2>常見問題</h2>

<p><strong>簡訊驗證碼會被完全停用嗎？</strong><br>目前還沒有，多數服務仍保留當備援。但 NIST 最新準則已把它列為需搭配風險評估的「受限」驗證方式，各業者正逐步改用 Passkey 為主要登入（見 <a href="https://pages.nist.gov/800-63-3/sp800-63b.html">NIST SP 800-63B</a>）。</p>

<p><strong>Passkey 比簡訊驗證碼安全在哪裡？</strong><br>私密金鑰只存在裝置裡，不會被輸入或傳送，釣魚網站騙不到可轉貼的驗證碼；門號被過戶到別人的 SIM 卡（SIM swap），也動不到裝置裡的私密金鑰（見 <a href="https://fidoalliance.org/passkeys/">FIDO 聯盟說明</a>）。</p>

<p><strong>換新手機的話 Passkey 會不見嗎？</strong><br>同步機制若有開啟就不會。Apple 靠 iCloud 鑰匙圈、Google 靠密碼管理工具，登入同帳號即可在新裝置取回；沒開同步或跨到不同生態系，得靠掃 QR code 或備援登入重新設定（見 <a href="https://support.apple.com/en-us/102195">Apple 說明</a>）。</p>
