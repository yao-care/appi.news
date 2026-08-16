---
title: "OpenAI為何砍AI模型價格迎戰中國平價競爭？全球AI價格戰一次看懂"
slug: "openai-price-cut-china-ai-competition"
description: "OpenAI於2026年7月30日大砍GPT-5.6 Luna模型API價格達八成、Terra降二成，官方坦言是為了因應中國Kimi K3、MiniMax M3等平價與開源模型的競爭壓力。整理降價細節、中國陣營的定價策略，以及對台灣企業導入AI成本與新創競爭環境的具體影響。"
publishDate: "2026-08-15T09:05:49.909Z"
category: "tech"
subcategory: "ai"
author: "appi-editorial"
coverImage: "covers/openai-price-cut-china-ai-competition.webp"
coverAlt: "抽象的雲端運算與網路連線科技意象"
coverImageCredit: "Photo by Conny Schneider on Unsplash"
tags:
  - "生成式AI"
  - "新創"
  - "中國"
  - "數位轉型"
factCheckedBy: ["appi-editorial"]
status: "published"
sourceType: "editorial"
contentType: "guide"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
topics:
  - "startups-and-vc"
risksAndLimits:
  - "文中定價為2026年7月30日OpenAI官方公告時點資訊，後續可能再調整"
  - "Artificial Analysis的「每美元智慧」排名為單一研究機構評比，非唯一衡量標準"
  - "OpenRouter開源模型token占比為單一平台統計，不代表全球企業AI使用全貌"
  - "中國開源模型自架涉及資料治理與合規評估，本文未逐一列出各企業適用規範"
references:
  - title: "Announcing a major Price drop for 5.6 Terra and Luna and Fast mode for 5.6-Sol"
    url: "https://community.openai.com/t/announcing-a-major-price-drop-for-5-6-terra-and-luna-and-fast-mode-for-5-6-sol/1388484"
    publisher: "OpenAI Developer Community"
  - title: "API Pricing"
    url: "https://developers.openai.com/api/docs/pricing"
    publisher: "OpenAI"
  - title: "OpenAI blinks in face-off with Chinese rivals, drops pricing for some models up to 80%"
    url: "https://www.scmp.com/tech/tech-trends/article/3362568/openai-blinks-face-chinese-rivals-drops-pricing-some-models-80"
    publisher: "South China Morning Post"
  - title: "Moonshot AI releases Kimi K3 open weights, largest free AI model ever at 2.8 trillion parameters"
    url: "https://techstartups.com/2026/07/27/moonshot-ai-releases-kimi-k3-open-weights-largest-free-ai-model-ever-at-2-8-trillion-parameters/"
    publisher: "Tech Startups"
  - title: "AI運算成本暴增 企業加速轉用平價模型尋求解方"
    url: "https://sunmedia.tw/news/technology/1782778238-AI%E9%81%8B%E7%AE%97%E6%88%90%E6%9C%AC%E6%9A%B4%E5%A2%9E%E3%80%80%E4%BC%81%E6%A5%AD%E5%8A%A0%E9%80%9F%E8%BD%89%E7%94%A8%E5%B9%B3%E5%83%B9%E6%A8%A1%E5%9E%8B%E5%B0%8B%E6%B1%82%E8%A7%A3%E6%96%B9"
    publisher: "商傳媒"
---

OpenAI在2026年7月30日無預警調降GPT-5.6系列模型的API價格，入門款Luna降幅達八成、中階款Terra降二成，官方公告直接點名是為了因應中國平價與開源模型帶來的競爭壓力（[OpenAI官方公告](https://community.openai.com/t/announcing-a-major-price-drop-for-5-6-terra-and-luna-and-fast-mode-for-5-6-sol/1388484)）。這波降價緊接在[MiniMax M3把智慧成本壓到地板](/articles/minimax-m3-open-weights-cost-structure/)、中國Moonshot AI免費釋出2.8兆參數模型之後，等於是美系AI龍頭首度公開跟進中國陣營的定價邏輯，全球AI產業正式進入比拼每token成本的白熱化階段。

<img src="/images/openai-price-cut-china-ai-competition-s1.webp" width="960" height="540" loading="lazy" decoding="async" alt="資料中心機房內成排的伺服器機櫃與線路" title="AI模型的運算成本主要來自資料中心，是這場價格戰的核心戰場（示意圖）">

## OpenAI這次降了多少：Luna砍八成、Terra砍二成

依OpenAI官方定價頁，Luna每百萬token輸入價從1美元降到0.2美元、輸出價從6美元降到1.2美元；Terra輸入價從2.5美元降到2美元、輸出價從15美元降到12美元，旗艦款Sol維持每百萬token輸入5美元、輸出30美元不變（[OpenAI定價頁](https://developers.openai.com/api/docs/pricing)）。OpenAI在公告中表示，這波降價來自GPT-5.6 Sol優化自家推理架構的成果，包括GPU核心改良讓服務成本降低二成、推測性解碼技術讓token生成效率提升逾一成五，並強調同樣任務現在用Luna跑只要原本的六分之一價格（[OpenAI官方公告](https://community.openai.com/t/announcing-a-major-price-drop-for-5-6-terra-and-luna-and-fast-mode-for-5-6-sol/1388484)）。這波調整同步套用在API、Codex與ChatGPT三個平台。

<img src="/images/openai-price-cut-china-ai-competition-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="辦公桌上的電腦螢幕顯示數據圖表" title="API定價下調直接反映在企業每月的AI服務帳單上（示意圖）">

## 中國平價與開源模型是誰在逼宮

這波降價的背景是中國陣營同時祭出低價與免費兩張牌。上海Moonshot AI在7月27日免費釋出2.8兆參數的Kimi K3完整權重，是目前公開釋出過規模最大的開源模型，任何企業都能下載到自己的伺服器上跑（[Tech Startups](https://techstartups.com/2026/07/27/moonshot-ai-releases-kimi-k3-open-weights-largest-free-ai-model-ever-at-2-8-trillion-parameters/)）。南華早報報導指出，智譜AI的GLM-5.2與MiniMax的M3同樣以低價策略搶市，OpenAI降價後，研究機構Artificial Analysis的「每美元智慧」排名顯示，Luna已反超這兩款中國模型登上榜首（[南華早報](https://www.scmp.com/tech/tech-trends/article/3362568/openai-blinks-face-chinese-rivals-drops-pricing-some-models-80)）。

<img src="/images/openai-price-cut-china-ai-competition-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="特寫拍攝的電腦晶片與電路板" title="中國開源模型主打低成本推理，把晶片運算效率變成競爭賣點（示意圖）">

## 對台灣企業導入AI成本與新創競爭環境的影響

對台灣企業來說，這波價格戰最直接的意義是用AI的門檻正在往下掉。財經媒體商傳媒報導，AI模型交易平台OpenRouter上，開源模型處理的token占比從今年1月的34%躍升到6月的65%，顯示企業已經在把任務分流給更便宜的模型，只把貴的旗艦模型留給複雜任務（[商傳媒](https://sunmedia.tw/news/technology/1782778238-AI%E9%81%8B%E7%AE%97%E6%88%90%E6%9C%AC%E6%9A%B4%E5%A2%9E%E3%80%80%E4%BC%81%E6%A5%AD%E5%8A%A0%E9%80%9F%E8%BD%89%E7%94%A8%E5%B9%B3%E5%83%B9%E6%A8%A1%E5%9E%8B%E5%B0%8B%E6%B1%82%E8%A7%A3%E6%96%B9)）。這種多模型並用、依任務選型的做法，也讓專做開源模型代管的[Together AI這類neocloud公司拿到台灣供應鏈的入場券](/articles/together-ai-open-model-neocloud/)，其最新一輪估值就有台灣和碩入股。對台灣新創而言，API成本下降直接壓低產品的邊際成本，但選型變多也代表要多做功課：

- **比較的不只是單價**：不同模型的輸入與輸出價格差異可以到十倍以上，實際成本要依任務類型試算，不能只看牌價。
- **留意資料治理與合規**：使用中國陣營的開源模型自架，涉及資料落地、授權條款與合規評估，跟直接呼叫美系API是不同的風險層級。
- **供應商鎖定要提前設計**：多模型並用能降低對單一供應商的依賴，架構上及早支援模型可替換，未來議價與轉換的空間都比較大。

<img src="/images/openai-price-cut-china-ai-competition-s4.webp" width="960" height="540" loading="lazy" decoding="async" alt="辦公室會議桌上擺放筆電，團隊正在討論" title="價格戰讓中小企業與新創有更多平價AI工具可選，但也考驗選型判斷（示意圖）">

<h2>常見問題</h2>

<p><strong>OpenAI為什麼突然大砍AI模型價格？</strong><br>OpenAI在官方公告中表示，這波降價一方面來自GPT-5.6 Sol優化推理架構帶來的成本下降，另一方面是為了因應中國Moonshot AI、智譜AI、MiniMax等業者以低價或免費開源模型搶市的競爭壓力（<a href="https://community.openai.com/t/announcing-a-major-price-drop-for-5-6-terra-and-luna-and-fast-mode-for-5-6-sol/1388484">OpenAI官方公告</a>）。</p>

<p><strong>這波降價會影響一般ChatGPT訂閱用戶嗎？</strong><br>這次調整的是Luna與Terra在API、Codex與ChatGPT平台上的每百萬token計費，主要衝擊透過API串接AI功能的企業與開發者，一般訂閱用戶的月費方案並不在這波公告的調整範圍內（<a href="https://developers.openai.com/api/docs/pricing">OpenAI定價頁</a>）。</p>

<p><strong>台灣企業現在該不該改用中國的平價AI模型？</strong><br>這牽涉個別企業的資料治理需求與合規評估，本文不做單一建議。可以確定的是，中國陣營的低價與開源策略已經把整體AI服務的價格壓低，企業無論最終選哪家，都能用更低成本取得接近前一代旗艦水準的AI能力，選型時建議把資料落地、授權條款與長期支援一併納入比較。</p>
