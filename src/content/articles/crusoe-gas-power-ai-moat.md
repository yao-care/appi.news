---
title: "Crusoe 洽談 30 億美元、估值衝 300 億：這門『燒廢氣做 AI 算力』的生意，早就不燒廢氣了"
slug: "crusoe-gas-power-ai-moat"
description: "Crusoe 正洽談約 30 億美元募資、估值上看 300 億美元，是去年 10 月 100 億的三倍。但把它當成『回收油田廢氣做 AI 算力』的環保故事會看錯重點：這門生意早已轉向自己蓋天然氣電廠、繞過電網直供資料中心。AI 最稀缺的不是晶片，是電與併網速度，這個框架對缺電的台灣直接相關。"
excerpt: "為什麼一家標榜『燒廢氣』的公司，估值一年三倍衝上 300 億美元？因為它賣的早就不是環保，而是電力交付速度：自己蓋天然氣電廠、繞過電網，把電直接送進 AI 資料中心。"
publishDate: "2026-07-22T08:00:00+08:00"
category: "tech"
subcategory: "startup"
tags: ["Crusoe", "AI 資料中心", "AI 募資", "電力瓶頸", "天然氣發電"]
coverImage: "covers/crusoe-gas-power-ai-moat.webp"
coverAlt: "象徵天然氣電廠直接供電給 AI 資料中心的能源與算力結合示意"
coverImageCredit: "Photo by Vjanodic WERSOV on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Crusoe 洽談約 30 億美元募資、估值上看 300 億美元，是去年 10 月 100 億的三倍；但撐起這估值的不是回收廢氣，而是自己蓋天然氣電廠直供 AI 資料中心。"
  - "它的招牌『數位燃燒抑制』（燒油田廢氣）撐不起 GW 級規模，真正的轉向是與 Engine No. 1 合資、拿七台 GE Vernova 渦輪機供 4.5GW 電力，繞過電網直送資料中心。"
  - "AI 產業鏈最稀缺的從來不是晶片，是電與併網速度；台灣缺電、併網要排隊，台廠真正的卡位點在機電、散熱與電力設備，不是只有雲端 GPU。"
references:
  - title: "Crusoe reportedly in talks to raise $3 billion, tripling its valuation"
    url: "https://thenextweb.com/news/crusoe-reportedly-in-talks-to-raise-3-billion-tripling-its-valuation"
    publisher: "The Next Web"
  - title: "AI data center builder Crusoe reportedly raising $3B at $30B valuation"
    url: "https://siliconangle.com/2026/07/03/ai-data-center-builder-crusoe-reportedly-raising-3b-30b-valuation/"
    publisher: "SiliconANGLE"
  - title: "Crusoe Adds 4.5 GW Natural Gas to Fuel AI, Expands Abilene Data Center to 1.2 GW"
    url: "https://www.datacenterfrontier.com/hyperscale/article/55276169/crusoe-adds-45-gw-natural-gas-to-fuel-ai-expands-abilene-data-center-to-12-gw"
    publisher: "Data Center Frontier"
  - title: "Crusoe secures 4.5GW of natural gas power for AI data centers"
    url: "https://www.datacenterdynamics.com/en/news/crusoe-secures-45gw-of-natural-gas-for-ai-data-centers-report/"
    publisher: "Data Center Dynamics"
  - title: "Crusoe: the energy-first AI factory company"
    url: "https://www.crusoe.ai/"
    publisher: "Crusoe"
originalContribution: "本文拆解 Crusoe 從『數位燃燒抑制』（回收油田廢氣）到『自建天然氣電廠繞過電網』的商業模式轉向，指出其 300 億美元估值真正定價的是電力交付速度而非環保敘事，並以『AI 最稀缺的是電與併網時間、不是晶片』為框架，延伸評估台灣在缺電與併網瓶頸下、機電與電力設備供應鏈的切入點。"
---

Crusoe 正在洽談一輪約 [30 億美元的募資，估值上看 300 億美元](https://thenextweb.com/news/crusoe-reportedly-in-talks-to-raise-3-billion-tripling-its-valuation)，是去年 10 月那輪剛過 100 億美元的三倍。把這家公司當成「把油田廢氣燒成 AI 算力」的環保故事，會看錯它到底值多少錢。這門生意早就轉向了：真正撐起 300 億估值的不是回收廢氣，而是繞過電網、自己蓋天然氣電廠，把電直接送進 AI 資料中心。AI 這條產業鏈上最稀缺的東西，從來不是晶片，是電，以及把電接進來要等多久。

<img src="/covers/crusoe-gas-power-ai-moat.webp" width="1200" height="794" loading="lazy" decoding="async" alt="天然氣電廠與 AI 資料中心相鄰，象徵能源與算力綁在一起的商業模式">

先把 Crusoe 是誰講清楚，因為它的招牌跟現在的樣子已經對不太上。這家公司 2018 年成立，兩位創辦人 Chase Lochmiller 與 Cully Cavness 做的第一件事，是一套叫「數位燃燒抑制」（Digital Flare Mitigation）的技術：油田採油時會伴生大量天然氣，賣不掉又沒管線可送，業者只能就地點火燒掉（flaring）。Crusoe 把貨櫃機房拖到井口，用這些本來要燒掉的廢氣發電，拿去挖比特幣。用廢氣、賺算力，故事很漂亮。

<img src="/images/crusoe-gas-power-ai-moat-s1.webp" width="960" height="563" loading="lazy" decoding="async" alt="創投資金湧入 AI 基礎建設，象徵 Crusoe 估值一年三倍">

但那套挖礦生意，Crusoe 去年已經[賣給 NYDIG](https://thenextweb.com/news/crusoe-reportedly-in-talks-to-raise-3-billion-tripling-its-valuation) 收掉了。今天它把自己定位成 [「能源優先的 AI 工廠公司」](https://www.crusoe.ai/)，官網掛的口號是「讓運算的未來對齊氣候的未來」。招牌還留著環保色彩，實際在做的事，規模已經完全不是同一個量級。

<img src="/images/crusoe-gas-power-ai-moat-s2.webp" width="960" height="1280" loading="lazy" decoding="async" alt="天然氣渦輪機發電機組，象徵 Crusoe 改買全新渦輪機蓋電廠">

轉向的關鍵，在電從哪裡來。今年 Crusoe 跟投資機構 Engine No. 1 合資，拿下[七台 GE Vernova 天然氣渦輪機、合計約 4.5GW 的發電量，預計 2027 年上線](https://www.datacenterdynamics.com/en/news/crusoe-secures-45gw-of-natural-gas-for-ai-data-centers-report/)。這些渦輪機是 Engine No. 1 與雪佛龍（Chevron）買下的全新機組，不是油田井口那些回收廢氣的小發電機。4.5GW 是什麼概念？報導引述，這比微軟去年全球資料中心可用的 5GW 也差不了多少。這已經不是「回收本來要燒掉的氣」，而是「為了餵 AI，去買一整座天然氣電廠」。

<img src="/images/crusoe-gas-power-ai-moat-s3.webp" width="960" height="1280" loading="lazy" decoding="async" alt="高壓輸電鐵塔與電網，象徵電力與併網才是 AI 真正的瓶頸">

為什麼非得自己蓋電廠？這裡是解對題還是解錯題的分野。很多人以為 AI 產業卡在晶片，於是把注意力全放在誰買得到多少張 GPU。但把 GPU 買回來只是第一步，那幾萬張卡要插電才會動，而美國的電網接不上這麼大的用電。變壓器要等好幾年、想直接併網排隊排到很後面。Crusoe 賭的就是這一段：與其等電網，不如把發電機組跟機房蓋在一起，繞過併網流程，用最快的速度把電交付出去。它賣給客戶的核心價值，其實是「電力交付速度」，模型跑得多聰明不是它的事。

<img src="/images/crusoe-gas-power-ai-moat-s4.webp" width="960" height="639" loading="lazy" decoding="async" alt="超大規模資料中心的伺服器機櫃，象徵 Meta、Oracle、OpenAI 包下的算力">

客戶名單能佐證這個判斷。Crusoe 目前簽下的[併網容量約 4.9GW、開發中的專案管線超過 40GW](https://www.datacenterdynamics.com/en/news/crusoe-secures-45gw-of-natural-gas-for-ai-data-centers-report/)，Meta 一家就包下約 1.6GW，分布在德州 Childress 與密蘇里州 Warrenton 兩個廠址。另一頭，Crusoe 在德州 Abilene 蓋的園區，是[給 OpenAI 的 1.2GW Stargate 資料中心，跟甲骨文（Oracle）合作、裝的是 NVIDIA 最新的 AI 晶片](https://www.datacenterfrontier.com/hyperscale/article/55276169/crusoe-adds-45-gw-natural-gas-to-fuel-ai-expands-abilene-data-center-to-12-gw)。這些客戶不缺錢也不缺晶片，他們缺的是有人能在合理時間內把幾 GW 的電變出來。Crusoe 至今[累計募得約 27.7 億美元](https://siliconangle.com/2026/07/03/ai-data-center-builder-crusoe-reportedly-raising-3b-30b-valuation/)，這輪再進 30 億，錢是拿去把電廠與機房一座座蓋起來。

<img src="/images/crusoe-gas-power-ai-moat-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="天然氣燃燒的排放與工業設施，象徵碳排代價與碳捕捉承諾">

這裡要踩個剎車，別把「能源優先」聽成「乾淨能源」。當初燒的是本來就要燒掉、不燒也是排放的廢氣，多少有回收的意義；現在是為了 AI 去多蓋天然氣發電，這是實打實新增的碳排。Crusoe 的回應是[承諾加裝燃燒後碳捕捉、搭配風電與電池儲能](https://www.datacenterfrontier.com/hyperscale/article/55276169/crusoe-adds-45-gw-natural-gas-to-fuel-ai-expands-abilene-data-center-to-12-gw)來壓碳足跡。碳捕捉能不能如期裝上、成本壓不壓得住，現在都還是承諾不是成績。把環保敘事跟這個新增排放的事實分開看，才不會被口號帶著走。

<img src="/images/crusoe-gas-power-ai-moat-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="變電站與電力設備，象徵台灣在 AI 用電與併網瓶頸下的供應鏈機會">

那台灣該從這條新聞讀出什麼？答案不是「我們沒有油田、燒不了廢氣」，那是看歪了。Crusoe 這個案子真正的訊號是：AI 的競爭正在從「誰有晶片」下沉到「誰有電、誰接得快」。台灣同樣卡在這一格。經濟部已經[上修十年用電預估，2026 到 2035 年均成長 2.5%，AI 與半導體是最大推力](/articles/taiwan-power-demand-forecast-2035/)；台電也在[趕工強韌電網、加速 161kV 電纜佈建](/articles/taipower-grid-resilience-161kv-cable/)。缺電跟併網排隊，台灣一項都沒少。台廠若只想著「多接一點雲端 GPU 代工的單」，就漏掉了這波真正在缺的東西：把電從電廠送到機櫃這一整段，需要的變壓器、開關設備、機電整合、以及把幾萬張卡的廢熱帶走的散熱系統。這幾段台灣本來就有底子，卡位點在這裡，不在只守著雲端那顆大晶片。

把估值一年拉高三倍的，不是「燒廢氣」這個好聽的起源故事，是「我能比別人更快把電交到你機房」這件很不性感的事。看懂 Crusoe 值 300 億的理由，比記住 30 億這個募資數字更重要：AI 的下一道瓶頸是電，誰先把電的問題解掉，誰就卡到位。台灣要接住這波，靠的不會是誰的模型比較聰明，而是有沒有把自己在電力這條鏈上的位置先定義清楚、把該長的能力先長出來。

<h2>常見問題</h2>

<p><strong>Crusoe 是做什麼的公司，為什麼估值這麼高？</strong><br>Crusoe 是一家垂直整合的 AI 基礎建設公司，自己發電、蓋資料中心、再租算力給客戶。它正洽談約 <a href="https://thenextweb.com/news/crusoe-reportedly-in-talks-to-raise-3-billion-tripling-its-valuation">30 億美元募資、估值上看 300 億美元</a>，是去年 10 月的三倍。估值高的原因不是技術多神，而是它能繞過塞車的電網，用比別人快的速度把幾 GW 的電交付給 Meta、OpenAI 這類急著要算力的客戶。</p>

<p><strong>Crusoe 還在用油田廢氣發電嗎？</strong><br>基本上不是主力了。它 2018 年靠回收油田要燒掉的廢氣（數位燃燒抑制）挖比特幣起家，但那套挖礦生意去年已賣給 NYDIG。現在的規模靠的是與 Engine No. 1 合資、拿下<a href="https://www.datacenterdynamics.com/en/news/crusoe-secures-45gw-of-natural-gas-for-ai-data-centers-report/">七台 GE Vernova 渦輪機、約 4.5GW 的全新天然氣發電</a>，這是為了餵 AI 新增的產能，不是回收廢氣。</p>

<p><strong>為什麼說 AI 的瓶頸是電，不是晶片？</strong><br>因為 GPU 買回來要插電才會動，而美國電網接不上這麼大的用電，變壓器要等數年、併網得排隊。Crusoe 之所以值錢，正是它自己蓋發電機組、繞過併網流程直供資料中心，把「等電」這段時間壓短。晶片有錢就買得到，電力交付速度買不到，這才是稀缺點。</p>

<p><strong>這波對台灣供應鏈的機會在哪？</strong><br>不在「多接雲端 GPU 代工」，而在把電從電廠送到機櫃的整段設備：變壓器、開關與配電設備、機電整合、資料中心散熱。台灣同樣面臨缺電與併網瓶頸，經濟部已<a href="/articles/taiwan-power-demand-forecast-2035/">上修十年用電預估</a>、台電也在<a href="/articles/taipower-grid-resilience-161kv-cable/">加速強韌電網</a>，這些會碰到真實電力的零組件，才是台廠的卡位點。</p>
