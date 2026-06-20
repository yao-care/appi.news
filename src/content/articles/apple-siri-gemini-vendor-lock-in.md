---
title: "Apple 新 Siri 借 Gemini 的腦、卻在歐盟和中國缺席：把核心助理外包給對手模型的取捨"
slug: "apple-siri-gemini-vendor-lock-in"
description: "WWDC 2026 上 Apple 把新 Siri 建在 Google Gemini 之上，還因法規在歐盟、中國缺席。該讀的不是功能多炫，而是單一供應商依賴，加上落地範圍被治理與合規綁住。"
publishDate: "2026-07-09T08:00:00+08:00"
category: "tech"
subcategory: "software-products"
tags: ["Apple Siri", "Google Gemini", "單一供應商依賴", "AI 選型", "AI 落地法規"]
author: "lightman"
sourceType: "editorial"
contentType: "analysis"
status: "scheduled"
coverImage: "covers/apple-siri-gemini-vendor-lock-in.webp"
coverAlt: "示意圖：手機上發光的 AI 語音助理介面"
coverImageCredit: "Photo by Tim Witzdam on Unsplash"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，並經真人編輯逐條查證外部連結與事實後編修發佈。"
highlights:
  - "Google 與 Apple 的聯合聲明把話說白：下一代 Apple Foundation Models 建立在 Gemini 模型與雲端技術上，連 Apple 都得借對手的腦。"
  - "新 Siri AI 不在歐盟與中國上線，歐盟卡在 DMA 與其他語音助理互通、中國卡在法規，落地範圍是治理問題不是技術問題。"
  - "給台灣企業的提醒：別幻想一次選對模型就永遠不用換，選型要先定義情境，並保留切換、治理與持續營運的空間。"
references:
  - title: "Joint statement from Google and Apple"
    url: "https://blog.google/company-news/inside-google/company-announcements/joint-statement-google-apple/"
    publisher: "Google"
  - title: "WWDC 2026: Everything announced on Siri AI, iOS 27, Apple Intelligence, and more"
    url: "https://techcrunch.com/2026/06/09/wwdc-2026-everything-announced-on-siri-ai-os-27-apple-intelligence-and-more/"
    publisher: "TechCrunch"
  - title: "New Siri AI Features Won't Be Available in EU, China Later This Year"
    url: "https://www.macrumors.com/2026/06/08/siri-ai-not-available-eu-china/"
    publisher: "MacRumors"
  - title: "Apple Reveals New AI Architecture Built Around Google Gemini Models"
    url: "https://www.macrumors.com/2026/06/08/apple-reveals-new-ai-architecture/"
    publisher: "MacRumors"
---

WWDC 2026 上 Apple 端出新一代 Siri，底層換成 Google 的 [Gemini](https://techcrunch.com/2026/06/09/wwdc-2026-everything-announced-on-siri-ai-os-27-apple-intelligence-and-more/)。發表會把鎂光燈打在它變得多會聊天、多懂你螢幕上在做什麼。但真正該讀的不是這些功能，是兩件被功能蓋過去的事：Apple 連自家最貼身的助理都得借對手的模型，以及同一套功能因為法規，在歐盟和中國上不了。

今年 WWDC 最值得看的，不是 Siri 變得多聰明，而是 Apple 選擇把最貼身的 AI 助理建立在競爭對手的模型能力之上。這代表一件很現實的事：在生成式 AI 時代，即使擁有全球最強的硬體、生態系與數十億裝置，依然不一定能在每個層面都自己做。

<img src="/images/apple-siri-gemini-vendor-lock-in-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="示意圖：iPhone 上的 Siri 語音助理畫面">

## Apple 把 Siri 的腦，外包給了 Google

Google 與 Apple 的[聯合聲明](https://blog.google/company-news/inside-google/company-announcements/joint-statement-google-apple/)把話講得很白：下一代 Apple Foundation Models 會建立在 Google 的 Gemini 模型與雲端技術之上，用來驅動 Apple Intelligence 與今年登場的新 Siri。換句話說，這個全世界最貼身的助理，腦是跟對手借的。

Apple 想守住的那條線是隱私。新 Siri 的基礎模型經過 Apple 自己改寫，跑在它原有的 [Private Cloud Compute](https://www.macrumors.com/2026/06/08/apple-reveals-new-ai-architecture/) 上，Google 碰不到使用者資料。隱私這關 Apple 處理得不錯。但隱私守得住，不等於依賴解得開。資料留在自己家，模型的核心能力卻長在別人家的地基上，這是兩件事。

<img src="/images/apple-siri-gemini-vendor-lock-in-s2.webp" width="940" height="628" loading="lazy" decoding="async" alt="示意圖：雲端資料中心的伺服器機房">

## 連 Apple 都得借對手的腦，你還信「一次選對就不用換」嗎

如果連 Apple 都得借 Google Gemini 的腦，那台灣企業還在幻想「一次選對模型就永遠不用換」嗎？

這句話不是看 Apple 笑話。它擁有全世界最深的口袋和最完整的生態系，最後還是判斷自己訓一顆夠強的助理模型不划算，去借了對手的。一家公司能不能在每個層面都自己做，跟它有多強沒有絕對關係，跟「這件事值不值得自己做、現在做得起來嗎」比較有關係。模型這層的答案，連 Apple 都說了不。

選型的順序因此不能倒。先定義你要解的情境、要碰到哪些資料，再評估哪一類模型符合前提，最後才比較具體選項。把順序倒過來，從「哪個模型最強」開始挑，是選型最常見的失敗模式，這點我在[談 LLM 工具選型](/articles/what-is-claw-llm-client-tool/)時就講過。模型最強不代表對準你的情境，落地設計的品質才是決定成敗的地方，而[落地設計遠比模型強弱關鍵](/articles/llm-healthcare-promise-limits/)。

把關鍵能力綁在單一外部模型，風險不是抽象的。一道[出口管制令就能讓某顆雲端模型全球下線](/articles/single-vendor-ai-continuity-risk/)，把流程焊死在它上面的人當天就斷手。連微軟都在往反方向走，[自研 coding 模型、把上萬個模型收進 Foundry](/articles/microsoft-foundry-multi-model-optionality/)，目的就是在平台層留住「換得掉」這件事。Apple 借 Gemini 是省了訓練成本，但也把一塊核心交了出去。便利收得到，代價是未來價格、政策或供應關係一變，你有沒有退路。

<img src="/images/apple-siri-gemini-vendor-lock-in-s3.webp" width="960" height="1440" loading="lazy" decoding="async" alt="示意圖：單一鎖鏈環扣，象徵被單一供應商綁住">

## 同一套 Siri，歐盟和中國用不到

真正有趣的地方不在 Gemini，而在另一個細節：新的 Siri AI 並不會在歐盟與中國同步推出。

[歐盟那邊](https://www.macrumors.com/2026/06/08/siri-ai-not-available-eu-china/)，Apple 說監管機關不接受它任何一個提案。卡點是《數位市場法》（DMA）要求系統得讓其他語音助理也能用，Apple 提的 Trusted System Agent 方案被打回票，Craig Federighi 直接說執委會沒同意 Apple 的任何提議。中國則是 Apple 還在處理當地的法規要求，所以先不上。同一套技術，因為法規與治理要求不同，最終能落地的範圍也不同。

這不是 Apple 獨有的處境。當[前沿模型開始附帶網路攻防能力](/articles/frontier-model-cyber-capability-governance/)，一紙出口管制就能讓同一顆模型在某些市場直接缺席。同一套能力在哪裡用得到、用不到，越來越不是工程問題，是治理與合規問題。企業導入 AI 時，關注的多半是模型能力；但真正決定能不能上線的，往往是資料能不能出去、法規允不允許。落地範圍從一開始就是合規問題，不是上線之後再補的附加題。

<img src="/images/apple-siri-gemini-vendor-lock-in-s4.webp" width="960" height="627" loading="lazy" decoding="async" alt="示意圖：歐盟旗幟與法規建築">

## 台灣企業該留的三個空間

Apple 的選擇給所有企業一個提醒：不要把目光只放在哪個模型最強，而要想清楚當核心能力建立在外部供應商之上時，你有沒有保留切換、治理與持續營運的空間。

把這句話拆成明天就能動的三格。第一，先定義情境再選模型，把「這個 AI 要解什麼問題、碰得到哪些資料、哪些情境根本不該交給它」寫下來，再去比模型，順序不能倒。第二，留換家的退路，別把提示、資料管線、工作流焊死在單一模型的專屬介面上，換一顆模型的成本要控制在你扛得動的範圍。第三，把治理當例行事，資料能不能出境、責任歸誰、哪些動作要人工確認，這些在選型當下就要有答案，不要等出事才回頭補。

AI 的競爭已經不是模型競賽，而是架構設計的競賽。誰把情境、退路與治理先盤清楚，誰才真的握得住自己的助理；只盯著哪顆模型跑分最高的人，遲早會在某個自己決定不了的時間點，被別人的價格、政策或法規牽著走。

<img src="/images/apple-siri-gemini-vendor-lock-in-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="台灣企業團隊圍著桌子討論 AI 導入與選型">

## 常見問題

**Apple 用 Gemini，等於把使用者資料交給 Google 嗎？**

不是。Apple 說新 Siri 的基礎模型跑在自家的 Private Cloud Compute 上，Google 不會取得使用者資料。借的是模型能力，不是把資料送出去。要分清楚「資料外流」和「能力依賴」是兩種不同的風險：前者 Apple 守住了，後者它選擇承擔。

**台灣企業在歐盟、中國的 AI 服務也會踩到同樣的法規牆嗎？**

會，而且要早盤。Siri 上不了歐盟卡在 DMA 的互通要求、上不了中國卡在當地法規，這類落地限制取決於你的服務在哪個市場、碰哪類資料。賣進歐盟或服務當地使用者，就該先把「用了哪些 AI、各算哪一級風險、誰負責、怎麼監督」盤成清單，別等被點名才開始補。
