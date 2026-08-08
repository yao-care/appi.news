---
title: "聯邦學習是什麼？醫院想合作訓練 AI，卻不用把病歷送出院外"
slug: "federated-learning-medical-ai-taiwan"
description: "聯邦學習讓 AI 模型在多家醫院之間巡迴受訓，只傳回權重更新、不搬動病患資料。拆解它的運作原理、台大醫院跨院AI驗證中心的實際做法、台灣個資法第6條的法規背景，以及模型聚合仍可能洩漏資訊、資料分佈不均等尚未解決的限制。"
excerpt: "多家醫院想合作訓練 AI，個資法卻不准把病歷送出院外。聯邦學習讓模型「巡迴受訓」，資料留在原地，只有學到的權重更新往中央跑。"
publishDate: "2026-08-08T17:08:14.886Z"
category: "tech"
subcategory: "ai"
tags:
  - "醫療AI"
  - "數位健康"
  - "資料治理"
  - "個資保護"
  - "AI基礎建設"
  - "資安"
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
coverImage: "covers/federated-learning-medical-ai-taiwan-cover.webp"
coverAlt: "醫療人員在醫院機房檢視伺服器與數據系統畫面（示意圖）"
coverImageCredit: "Photo by panumas nikhomkhai on Pexels"
highlights:
  - "聯邦學習由 Google 研究團隊於 2017 年提出，核心機制是模型在各節點本地訓練，只把權重更新傳回中央伺服器聚合，原始資料全程不離開本地端。"
  - "台大醫院依衛福部「次世代數位醫療平臺成立三大AI中心」補助設立臨床AI取證驗證中心，已建置聯邦學習機制，串連輔大醫院、桃園敏盛醫院等聯盟醫院，確保驗證用資料不離院。"
  - "台灣個資法第6條把病歷、醫療、健康檢查列為特種個人資料，原則禁止蒐集、處理、利用，僅在六款例外情形下才能鬆綁，是聯邦學習這類「資料不動、模型動」設計在台灣受重視的法規背景。"
  - "法國四家醫院用聯邦學習訓練病理影像 AI 模型，650 名三陰性乳癌患者的資料全程留在各院防火牆內，研究成果 2023 年刊登於《Nature Medicine》。"
risksAndLimits:
  - "學界已證實模型更新聚合後仍可能被反推出部分訓練資料資訊，須搭配差分隱私等技術因應"
  - "各醫院病患組成與疾病盛行率不同，資料分佈不均會拖慢模型收斂、降低準確率"
  - "加入差分隱私雜訊能降低洩漏風險，但也會犧牲一定的模型準確率，兩者需要取捨"
  - "台灣現有案例仍以醫學中心聯盟的AI驗證為主，尚未見全國性強制規範或大規模上線時程"
references:
  - title: "Communication-Efficient Learning of Deep Networks from Decentralized Data"
    url: "https://arxiv.org/abs/1602.05629"
    publisher: "arXiv（McMahan et al.）"
    note: "聯邦學習原始論文摘要，定義模型在裝置端本地訓練、彙整本地更新學習共享模型的機制"
  - title: "The UK-US Blog Series on Privacy-Preserving Federated Learning: Introduction"
    url: "https://www.nist.gov/blogs/cybersecurity-insights/uk-us-blog-series-privacy-preserving-federated-learning-introduction"
    publisher: "NIST"
    note: "NIST 官方部落格，說明中央伺服器只收模型更新不收資料的機制，並揭露模型更新／模型本身皆可能被反推出訓練資料資訊的風險層級"
  - title: "臨床AI取證驗證中心"
    url: "https://www.ntuh.gov.tw/AI/Fpage.action?fid=5861"
    publisher: "台大醫院智慧醫療中心"
    note: "台大醫院依衛福部補助計畫設立的跨院AI驗證機制，載明聯邦學習平台確保數據不離院，聯盟醫院含輔大醫院、桃園敏盛醫院，頁面更新於 2026/07/22"
  - title: "個人資料保護法第6條"
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=6"
    publisher: "全國法規資料庫"
    note: "病歷、醫療、基因、健康檢查等特種個人資料原則禁止蒐集處理利用之條文與六款例外情形"
  - title: "Nature Medicine publishes breakthrough Owkin research on the first ever use of federated learning to train deep learning models on multiple hospitals' histopathology data"
    url: "https://www.owkin.com/newsfeed/nature-medicine-publishes-breakthrough-owkin-research-on-the-first-ever-use-of-federated-learning-to-train-deep-learning-models-on-multiple-hospitals-histopathology-data"
    publisher: "Owkin"
    note: "法國四家醫院聯邦學習訓練病理影像AI模型案例，650名三陰性乳癌患者資料未離開各院，2023年1月刊登於《Nature Medicine》"
  - title: "Balancing privacy and performance in healthcare: A federated learning framework for sensitive data"
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/"
    publisher: "PMC（NIH）"
    note: "醫療聯邦學習框架研究，涵蓋梯度反推隱私風險、差分隱私因應、non-IID資料分佈對準確率的影響、通訊成本數據"
topics: ["ai-medical-regulation"]
---

<p>聯邦學習（Federated Learning）是一種讓 AI 模型「巡迴受訓」的訓練方式：模型被送到各家醫院在本地用自己的病患資料訓練，訓練完只把學到的權重更新傳回中央伺服器聚合，原始病歷資料全程留在院內、不集中送出。這正好對上醫療 AI 最大的卡點：多家醫院想合作訓練同一個模型，卻受限於個資法規範，病歷不能任意跨院外流。聯邦學習把「資料要不要離開醫院」這個問題，換成「模型要不要去醫院巡迴訓練」來解。</p>

<h2>聯邦學習是什麼</h2>

<p>聯邦學習這個概念由 Google 研究團隊在 2017 年正式提出。<a href="https://arxiv.org/abs/1602.05629" target="_blank" rel="noopener">McMahan 等人發表的論文摘要明確定義這套方法「讓訓練資料留在裝置端，透過彙整本地計算出的模型更新來學習一個共享模型」</a>，並提出以疊代模型平均化取代同步隨機梯度下降，通訊輪次可以減少十倍到百倍。這篇論文原本鎖定的場景是手機鍵盤輸入預測，資料散落在數百萬支手機裡，把資料集中運算既不現實也侵犯隱私，於是改讓模型主動去每支手機上受訓。</p>

<p>醫療場景的邏輯完全一樣，只是節點從手機換成醫院。跟解決「病歷格式看不看得懂」的 <a href="/articles/fhir-ai-medical-data-taiwan/" target="_blank" rel="noopener">FHIR 醫療資料交換標準</a>不同，聯邦學習要解決的是「病患資料要不要離開醫院」這個更根本的問題：FHIR 打通的是資料互通的語言，聯邦學習繞開的是資料根本不外流的限制，兩者處理的是同一張醫療 AI 拼圖裡不同的兩塊。</p>

<img src="/images/federated-learning-medical-ai-taiwan-s2.webp" width="960" height="540" loading="lazy" decoding="async" alt="醫療人員在平板電腦上查看數位資料畫面（示意圖）">

<h2>怎麼運作：模型跑，資料不跑</h2>

<p><a href="https://www.nist.gov/blogs/cybersecurity-insights/uk-us-blog-series-privacy-preserving-federated-learning-introduction" target="_blank" rel="noopener">NIST 官方部落格說明整套流程：中央伺服器把一份訓練到一半的模型副本送給每個參與機構，收回的是「模型更新」而不是資料；每個機構在自己的敏感資料上把模型練得更好，資料本身從未離開該機構</a>，中央伺服器再把各院回傳的權重更新加總平均，得到下一輪更精進的全域模型，如此反覆疊代到模型收斂。整個過程中，中央伺服器看到的永遠是「這家醫院的模型參數往哪個方向調整了」，看不到造成這個調整的原始病歷長什麼樣子。</p>

<p>這也是聯邦學習跟傳統「資料先集中、再統一訓練」最大的差別。傳統作法要求所有醫院把病歷去識別化後送到同一個資料庫，資料一旦離開院內系統，後續的存取控管、外洩風險就多了一層變數；聯邦學習讓資料的物理位置維持不動，變動的只有模型參數，等於把「誰能碰到原始病歷」的答案，永遠鎖定在資料原本所在的那家醫院。</p>

<img src="/images/federated-learning-medical-ai-taiwan-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="工程師在電腦螢幕前檢視 AI 模型訓練與資料網路連線圖（示意圖）">

<h2>台灣現況：跨院AI驗證的第一步</h2>

<p>台灣醫療資料能不能用來訓練 AI，第一關要先過個資法。<a href="https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=6" target="_blank" rel="noopener">個人資料保護法第6條把病歷、醫療、基因、性生活、健康檢查及犯罪前科列為特種個人資料，原則上不得蒐集、處理或利用，只有法律明文規定、當事人書面同意、統計或學術研究目的且經處理後無從識別特定當事人等六款例外情形才能鬆綁</a>。這代表任何想把多家醫院病歷集中起來訓練 AI 的計畫，一開始就得面對這道原則禁止的門檻，而聯邦學習「資料不動」的設計，正好讓合作訓練不必去挑戰這條紅線。</p>

<p>實際的跨院合作已經在動。<a href="https://www.ntuh.gov.tw/AI/Fpage.action?fid=5861" target="_blank" rel="noopener">台大醫院依衛福部「次世代數位醫療平臺成立三大AI中心」補助計畫設立臨床AI取證驗證中心，目的是建立跨院資料互通機制、加速AI醫療工具的發展與驗證，中心建置了聯邦學習平台，確保數據不離院、保障病人隱私與資料安全，聯盟涵蓋台大醫院體系的醫學中心、區域醫院、地區醫院，並延伸到輔大醫院、桃園敏盛醫院等聯盟醫院</a>，審查流程由台大研究倫理委員會主審、聯盟醫院採簡易審查，搭配電子化申請表與單一窗口服務。這套機制目前的角色是加速 AI 醫療工具的取證與驗證，還不是全國性、涵蓋所有醫院的強制規範。</p>

<p>把視野拉到國外，聯邦學習在醫療研究上已經有更成熟的實績可以參照。<a href="https://www.owkin.com/newsfeed/nature-medicine-publishes-breakthrough-owkin-research-on-the-first-ever-use-of-federated-learning-to-train-deep-learning-models-on-multiple-hospitals-histopathology-data" target="_blank" rel="noopener">法國新創 Owkin 與居禮研究所、里昂雷翁貝拉爾中心、古斯塔夫魯西研究所、圖盧茲腫瘤中心四家醫院合作，用聯邦學習訓練病理影像 AI 模型，650 名三陰性乳癌患者的病理切片資料全程留在各院防火牆內未曾集中，模型用來預測患者對化療的反應，研究成果 2023 年 1 月刊登於《Nature Medicine》，是這類跨院病理影像聯邦學習研究首次發表</a>。台灣目前的案例仍集中在AI醫療工具的驗證與取證階段，離這種直接產出可發表臨床研究成果的規模，還有一段路要走。</p>

<img src="/images/federated-learning-medical-ai-taiwan-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="醫療團隊在會議室討論跨院資料合作與人工智慧應用計畫（示意圖）">

<h2>該注意什麼：隱私風險與資料不均</h2>

<p>聯邦學習不是把隱私風險降到零，只是換了一種風險。<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/" target="_blank" rel="noopener">一份平衡隱私與效能的醫療聯邦學習框架研究指出，聯邦學習雖然靠資料不動來降低集中化風險，但仍可能受到梯度反推攻擊，讓私密資訊從模型更新中被還原</a>。中央伺服器收到的權重更新看起來只是一串數字，理論上仍藏著能被反推出部分原始資料特徵的線索。因應做法是搭配差分隱私：<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/" target="_blank" rel="noopener">該研究在傳回的梯度上做範數裁剪並加入校準過的高斯雜訊，把隱私預算控制在符合 NIST 建議的嚴格範圍內，藉此降低資料被還原的風險</a>，代價是模型準確率會因為加了雜訊而打一點折扣，隱私保護跟模型效能之間得做取捨。</p>

<p>資料分佈不均也是聯邦學習繞不開的限制。各醫院收治的病患組成、疾病盛行率、檢驗儀器規格本來就不一樣，統計上稱為 non-IID（非獨立同分佈）。<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/" target="_blank" rel="noopener">同一份研究測試發現，在真實的異質資料條件下訓練，跟資料分佈一致的基準情況相比，模型準確率會下降 2% 到 4%，各輪次之間的 F1 分數變異也會增加</a>，這代表小型或病患特徵特殊的醫院加入聯邦學習聯盟時，全域模型不一定能公平反映每一家醫院的實際情況。通訊成本則相對友善：<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/" target="_blank" rel="noopener">同一份研究把模型更新量化到 8 位元後，每個節點每輪傳輸量約 320KB，網路負擔不算重</a>，這部分不是聯邦學習落地的主要障礙。</p>

<p>資料治理的責任歸屬同樣值得預先問清楚。跟 <a href="/articles/chatgpt-health-nhi-sdk-accountability/" target="_blank" rel="noopener">健保健康存摺SDK與OpenAI自建病歷連結兩種資料開放模式的比較</a>類似，聯邦學習聯盟裡「誰負責稽核、模型出錯算誰的、聯盟醫院退出後模型參數怎麼處理」這些治理問題，不會因為採用了聯邦學習就自動解決，需要聯盟自己另外訂規則。</p>

<img src="/images/federated-learning-medical-ai-taiwan-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="螢幕顯示資料加密與隱私保護機制的抽象視覺畫面（示意圖）">

<h2>常見問題</h2>

<p><strong>聯邦學習跟把病歷去識別化後集中訓練有什麼不同？</strong><br>去識別化資料仍然要離開醫院送到中央資料庫，一旦外流仍有被還原識別的風險；<a href="https://www.nist.gov/blogs/cybersecurity-insights/uk-us-blog-series-privacy-preserving-federated-learning-introduction" target="_blank" rel="noopener">聯邦學習則是資料完全不離開產生它的機構，中央伺服器只收模型更新</a>，兩種做法在資料實際的物理位置上是不同的設計。</p>

<p><strong>聯邦學習訓練出來的模型會不會洩漏病患資訊？</strong><br>不是完全不會。<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12464415/" target="_blank" rel="noopener">學界已證實模型更新在特定條件下可能被反推出部分訓練資料的資訊，因此業界常搭配差分隱私等技術，對回傳的梯度加入校準雜訊來降低這類風險</a>，但這會犧牲一定的模型準確率。</p>

<p><strong>台灣現在有醫院已經在用聯邦學習訓練 AI 了嗎？</strong><br>有，但還在早期階段。<a href="https://www.ntuh.gov.tw/AI/Fpage.action?fid=5861" target="_blank" rel="noopener">台大醫院依衛福部補助計畫設立的臨床AI取證驗證中心已建置聯邦學習平台，串連輔大醫院、桃園敏盛醫院等聯盟醫院進行AI工具驗證</a>，屬於醫學中心聯盟層級的跨院合作，尚未擴大到全國性、強制性的規範。</p>
