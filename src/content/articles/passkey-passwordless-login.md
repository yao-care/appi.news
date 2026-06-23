---
title: "Passkey 通行密鑰是什麼：無密碼登入的運作原理與台灣導入現況"
slug: "passkey-passwordless-login"
description: "通行密鑰用裝置端的公私鑰取代密碼，登入時以生物辨識解鎖私鑰簽章，密碼不再傳輸或外洩。本文整理 Passkey 的運作原理、怎麼開始用，以及台灣已支援的服務與限制。"
publishDate: "2026-06-23T17:05:00+08:00"
status: "published"
category: "tech"
subcategory: "security"
tags: ["Passkey", "通行密鑰", "無密碼登入", "FIDO", "資安", "生物辨識", "TW FidO"]
author: "appi-editorial"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，經 APPI 編輯部人工查證與編輯；文中事實與每一條超連結均逐條核對官方或權威來源。"
coverImage: "covers/passkey-passwordless-login.webp"
coverAlt: "手指觸碰智慧型手機螢幕，象徵以生物辨識完成無密碼登入"
coverImageCredit: "Photo by Onur Binay on Unsplash"
highlights:
  - "Passkey 以裝置端的公私鑰取代密碼，私密金鑰不離開裝置、不傳輸，擋得掉釣魚與伺服器外洩。"
  - "Google、Apple、Microsoft 帳號都已支援，建立後用指紋、臉部或螢幕鎖即可登入。"
  - "台灣政府的行動自然人憑證（TW FidO）與露天市集、可樂旅遊、智冠科技等民間服務已陸續導入。"
references:
  - title: "FIDO Passkeys：Passwordless Authentication"
    url: "https://fidoalliance.org/passkeys/"
    publisher: "FIDO Alliance"
  - title: "About the security of passkeys"
    url: "https://support.apple.com/en-us/102195"
    publisher: "Apple Support"
  - title: "Create and save a passkey"
    url: "https://support.microsoft.com/en-us/account-billing/create-and-save-a-passkey-e92cd3e0-11fa-4630-a5ea-3ccc0396b3d9"
    publisher: "Microsoft Support"
  - title: "行動自然人憑證 TW FidO"
    url: "https://fido.moi.gov.tw/pt/"
    publisher: "中華民國內政部"
  - title: "FIDO 在臺落地規模擴大，逾 300 個政府與企業系統支援"
    url: "https://www.ithome.com.tw/news/172885"
    publisher: "iThome"
  - title: "跟上國際腳步，臺灣 Passkey 應用實例出爐"
    url: "https://www.ithome.com.tw/news/165788"
    publisher: "iThome"
---

通行密鑰（Passkey）是用裝置上的一對公開金鑰與私密金鑰取代密碼的登入方式。登入時，你用手機或電腦的生物辨識、PIN 或螢幕鎖解開存在裝置裡的私密金鑰，由它簽署一道伺服器送來的挑戰；密碼本身不再被輸入、傳輸或儲存在伺服器，因此釣魚網站騙不到、伺服器資料庫外洩也偷不走。目前 [Google](https://support.google.com/accounts/answer/13548313)、[Apple](https://support.apple.com/en-us/102195)、[Microsoft](https://support.microsoft.com/en-us/account-billing/what-are-passkeys-and-why-they-matter-301c8944-5ea2-452b-9886-97e4d2ef4422) 三大平台的帳號都已支援，台灣的政府「行動自然人憑證（TW FidO）」與露天市集、可樂旅遊、智冠科技等民間服務也陸續導入。

<img src="/images/passkey-passwordless-login-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="手持智慧型手機以臉部與指紋完成無密碼登入的示意">

## Passkey 怎麼運作：用公私鑰取代密碼

依 [FIDO 聯盟](https://fidoalliance.org/passkeys/)的說明，當你在一個服務註冊 passkey 時，裝置會產生一對金鑰：公開金鑰送到服務端的伺服器保存，私密金鑰則留在你的裝置上，不會離開。登入時伺服器送來一道隨機挑戰，裝置要求你用「平常解鎖這支手機或這台電腦的同一組生物辨識、PIN 或螢幕鎖」批准，才會用私密金鑰簽署這道挑戰，再把簽章送回伺服器以公開金鑰驗證。

關鍵在於私密金鑰從頭到尾不會傳出去。Apple 在[通行密鑰安全性說明](https://support.apple.com/en-us/102195)中指出，伺服器永遠不會知道私密金鑰是什麼。也因為沒有可被竊取的共用密碼，passkey 同時具備「你持有的裝置」與「你的生物特徵或螢幕鎖」兩種因素，本質上就帶有多因素驗證的效果。

<img src="/images/passkey-passwordless-login-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="代表公開金鑰加密的數位安全鎖與金鑰示意圖">

## 一般使用者怎麼開始用

開始用 passkey 不需要額外硬體，流程是在支援的服務裡「建立一把」，之後改用裝置解鎖方式登入。Google 帳號可在帳號安全設定裡建立 passkey，建立後用指紋、臉部辨識或螢幕鎖就能登入，且可存進 Google 密碼管理工具跨裝置使用（見 [Google 官方說明](https://support.google.com/accounts/answer/13548313)）。

Apple 裝置要先開啟 iCloud 鑰匙圈與雙重認證，passkey 會加密存進 iCloud 鑰匙圈、在你的 Apple 裝置間同步，也能用 iPhone 去登入非 Apple 裝置上的網站與 App（見 [Apple 使用說明](https://support.apple.com/guide/iphone/use-passkeys-to-sign-in-to-websites-and-apps-iphf538ea8d0/ios)）。Microsoft 帳號則可[建立並儲存 passkey](https://support.microsoft.com/en-us/account-billing/create-and-save-a-passkey-e92cd3e0-11fa-4630-a5ea-3ccc0396b3d9)，用臉部、指紋或 PIN 確認登入，進一步還能移除密碼、改成完全無密碼登入。

<img src="/images/passkey-passwordless-login-s3.webp" width="960" height="540" loading="lazy" decoding="async" alt="使用者以臉部辨識解鎖智慧型手機的近拍">

## 台灣導入現況：從政府到民間

政府端最具規模的是內政部「行動自然人憑證（TW FidO）」，採 FIDO 標準，免插卡、免帳密，用手機生物辨識就能登入線上報稅、查健保資料、申請戶籍謄本等政府服務（見 [TW FidO 官網](https://fido.moi.gov.tw/pt/)）。據 [iThome 報導](https://www.ithome.com.tw/news/172885)，光是 TW FidO 介接，就讓國內超過 300 個政府與企業系統支援 FIDO 技術。

民間服務方面，[iThome 在 2024 年的盤點](https://www.ithome.com.tw/news/165788)指出，露天市集、可樂旅遊、智冠科技是台灣首波提供 Passkey 無密碼登入的業者；到了 2025 年下半年，[報導](https://www.ithome.com.tw/news/172885)再點名酷澎、誠品、杏一醫療等陸續跟進，支付領域也出現「一卡通 iPASS MONEY」等落地案例。數位發展部作為 FIDO 聯盟政府會員，正協助電商、遊戲、旅遊與金融等產業導入無密碼驗證。

<img src="/images/passkey-passwordless-login-s4.webp" width="960" height="1440" loading="lazy" decoding="async" alt="台灣街景與行動裝置，象徵政府與民間數位身分服務">

## 限制與注意事項

Passkey 還是有要留意的地方。它多半綁在某個生態系的同步機制裡，例如 Apple 存在 iCloud 鑰匙圈、Google 存在 Google 密碼管理工具；要在不同生態系之間（例如把 iPhone 上的 passkey 拿到 Android 用）目前得靠掃 QR code 的跨裝置登入流程，不是無痛搬移。FIDO 聯盟也說明，passkey 是由作業系統、瀏覽器或第三方密碼工具這類「通行密鑰提供者」保管（見 [FIDO 聯盟](https://fidoalliance.org/passkeys/)）。

開通通常需要先有一個已驗證、設好螢幕鎖的裝置。以 Apple 為例，使用 iCloud 鑰匙圈一定要開啟雙重認證，沒開的話註冊 passkey 時會被要求補設定（見 [Apple 安全性說明](https://support.apple.com/en-us/102195)）。裝置遺失時，要靠帳號的雲端同步或備援登入方式，才能在新裝置取回。目前多數服務仍保留密碼當備援，passkey 是更安全的選項，而不是唯一入口。

<img src="/images/passkey-passwordless-login-s5.webp" width="960" height="960" loading="lazy" decoding="async" alt="筆電與手機並排，象徵通行密鑰在多裝置間同步">

<h2>常見問題</h2>

<p><strong>Passkey 和密碼有什麼不同？</strong><br>密碼是你要記住、輸入並送到伺服器比對的字串，會被釣魚或在資料庫外洩時一起被偷；passkey 是存在裝置裡的私密金鑰，登入時只送出簽章、不送金鑰本身，伺服器只保存公開金鑰，因此擋得掉釣魚與伺服器端外洩（見 <a href="https://fidoalliance.org/passkeys/">FIDO 聯盟</a>）。</p>

<p><strong>手機掉了 passkey 會跟著不見嗎？</strong><br>不一定。如果 passkey 有同步到雲端，例如 Apple 的 iCloud 鑰匙圈或 Google 密碼管理工具，只要在新裝置登入同一個帳號就能取回（見 <a href="https://support.apple.com/en-us/102195">Apple 說明</a>）。建議搭配雙重認證與螢幕鎖，降低裝置遺失的風險。</p>

<p><strong>台灣有哪些服務可以用 passkey？</strong><br>政府端有內政部的行動自然人憑證（TW FidO），民間有露天市集、可樂旅遊、智冠科技等業者，2025 年後再有誠品、杏一醫療等跟進（見 <a href="https://www.ithome.com.tw/news/165788">iThome 報導</a>）；Google、Apple、Microsoft 帳號在台灣同樣可以使用。</p>
