---
title: "合成資料是什麼？醫療AI資料不能只靠複製貼上湊量"
slug: "synthetic-data-medical-ai-taiwan"
description: "醫療AI合成資料是用演算法生成、統計特性貼近真實但不含真實病患紀錄的資料集，用來補足醫療AI訓練卡在個資法與病歷稀缺的缺口。資料集若只靠複製貼上湊量，不具備AI建模所需的資訊量與異質性，這正是FDA研究關注、Shumailov等人定義模型崩潰的核心風險。"
updatedDate: "2026-08-22"
excerpt: "醫院病歷受個資法保護、跨院共享困難，合成資料讓 AI 可以拿「統計特性像真的」但沒有真人紀錄的假資料練功。但假資料一路餵下去也有代價，叫模型崩潰。"
publishDate: "2026-08-20T17:00:33.455Z"
category: "tech"
subcategory: "ai"
tags:
  - "醫療AI"
  - "數位健康"
  - "資料治理"
  - "個資保護"
  - "生成式AI"
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
coverImage: "covers/synthetic-data-medical-ai-taiwan-cover.webp"
coverAlt: "抽象數位資料節點與粒子視覺化，象徵演算法生成的合成資料（示意圖）"
coverImageCredit: "Photo by U.Lucas Dubé-Cantin on Pexels"
highlights:
  - "合成資料是用演算法（GAN、擴散模型或語言模型）生成、統計分佈貼近真實但不含任何真實個人紀錄的資料集，用來補足醫療 AI 訓練資料稀缺、類別不平衡與隱私限制三個缺口。"
  - "台灣個資法第20條把病歷等資料的目的外利用原則禁止，僅在學術研究、當事人同意等七款例外情形才能鬆綁，是醫院不能任意把病歷送出去訓練 AI 的法規根源。"
  - "2024年《Nature》刊登的研究證實，AI 模型若只靠上一代 AI 生成的內容遞迴訓練、不摻真實資料校正，輸出品質會逐代劣化，這個現象叫「模型崩潰」，實驗中原始文本訓練到第九代已完全跑題。"
  - "FDA 旗下研究人員在放射影像領域的合成資料綜述指出，這類技術能降低病患風險、簡化資料取得，但要發揮完整潛力仍需要額外的品質驗證工作。"
risksAndLimits:
  - "模型崩潰的實驗證據來自語言模型與生成模型的遞迴訓練，非所有醫療影像AI的合成資料應用都會同等程度受影響"
  - "合成資料生成後仍須人工或機械驗證統計保真度，不會自動保證去識別化或符合個資法要求"
  - "台灣個資法對「合成資料」本身尚無專門子法定義，實務上是否構成個人資料、如何適用例外情形仍待案例累積"
  - "FDA對合成資料用於醫材審查的具體門檻多見於研究性綜述與草案討論，非最終定案規範"
references:
  - title: "The Curse of Recursion: Training on Generated Data Makes Models Forget（後刊登於《Nature》631期，題名改為 AI models collapse when trained on recursively generated data）"
    url: "https://arxiv.org/abs/2305.17493"
    publisher: "arXiv（Shumailov et al.）"
    note: "定義模型崩潰為「用模型生成內容訓練會讓後代模型出現不可逆缺陷、原始資料分佈的尾部消失」，涵蓋語言模型、變分自編碼器、高斯混合模型"
  - title: "Using AI to train AI: Model collapse could be coming for LLMs, say researchers"
    url: "https://techxplore.com/news/2024-07-ai-collapse-llms.html"
    publisher: "Tech Xplore"
    note: "2024年7月25日報導，以中世紀建築文本為原始輸入做遞迴訓練實驗，第九代模型輸出完全變成與原題無關的「野兔清單」，說明模型崩潰的具體樣貌"
  - title: "Synthetic Data in Radiological Imaging: Current State and Future Outlook"
    url: "https://arxiv.org/abs/2407.01561"
    publisher: "arXiv（Sizikova, Badal, Delfino 等，FDA 研究人員參與）"
    note: "綜述合成資料在放射影像AI訓練的應用，指出可降低病患傷害與成本、簡化資料取得，但要發揮完整潛力仍需額外驗證工作"
  - title: "個人資料保護法第20條"
    url: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=20"
    publisher: "全國法規資料庫"
    note: "非公務機關利用個資原則限於蒐集時特定目的範圍內，僅法律明文規定、當事人同意、學術研究等七款例外情形可目的外利用"
  - title: "AI 法律3：AI與個資法：模型訓練、資料蒐集、跨境傳輸"
    url: "https://www.headinglawyer.com/HD/2026/05/10/ai-%E6%B3%95%E5%BE%8B-3-ai-%E8%88%87%E5%80%8B%E8%B3%87%E6%B3%95%E6%A8%A1%E5%9E%8B%E8%A8%93%E7%B7%B4%E3%80%81%E8%B3%87%E6%96%99%E8%92%90%E9%9B%86%E3%80%81%E8%B7%A8%E5%A2%83%E5%82%B3%E8%BC%B8/"
    publisher: "和鼎律師事務所"
    note: "2026年5月10日發布，說明個資法目的拘束原則對AI訓練資料的限制，概括同意條款可能不被認可、應採分項同意"
topics: ["ai-medical-regulation"]
---

<p>資料集如果只靠重複複製貼上湊量，即便規模再龐大，也不具備 AI 建模所需的資訊量與異質性，這正是合成資料要解決的核心問題之一。合成資料是用演算法生成出來的資料集，統計特性貼近真實資料，但每一筆紀錄都不對應任何真實存在的病患。醫療 AI 需要大量病歷才練得起來，偏偏病歷受個資法保護、難以跨院流通，合成資料因此成為補這個缺口的手段之一。但這條路不是萬靈丹：如果 AI 模型一路只靠 AI 生成的資料訓練下一代，品質會隨世代遞減，這個現象叫「模型崩潰」（model collapse）。</p>

<h2>合成資料是什麼</h2>

<p>合成資料由生成模型產出，常見做法包括生成對抗網路（GAN）、擴散模型，近年也有人直接拿大型語言模型生成結構化的假紀錄。目標是讓產出的資料集在統計分佈、變數之間的關聯性上盡量貼近真實世界，卻不含任何一筆能對應到真實個人的紀錄。<a href="https://arxiv.org/abs/2407.01561" target="_blank" rel="noopener">一份由 FDA 研究人員參與撰寫的放射影像合成資料綜述指出，這類技術能用來擴增稀缺或類別不平衡的資料集，也能在不動用真實患者影像的情況下做品質保證測試，好處是降低病患風險、簡化資料取得、可擴充規模</a>，但同一份綜述也強調，要讓合成資料真正發揮潛力，還需要額外的驗證工作才能確認生成出來的樣本沒有失真或遺漏臨床上重要的邊緣案例。</p>

<p>跟解決「資料要不要離開醫院」這個問題的<a href="/articles/federated-learning-medical-ai-taiwan/" target="_blank" rel="noopener">聯邦學習</a>不同，合成資料處理的是另一層問題：聯邦學習讓模型巡迴到各醫院用真實病歷訓練、資料本身不動；合成資料則是乾脆生成一批不對應任何真人的假資料，訓練時根本不需要真實病歷在場。兩者可以互補，一個解決「資料能不能被搬動」，一個解決「有沒有足夠資料可以練」。</p>

<img src="/images/synthetic-data-medical-ai-taiwan-s1.webp" width="960" height="639" loading="lazy" decoding="async" alt="醫院機房伺服器與資料線纜畫面（示意圖）">

<h2>台灣現況：個資法的目的拘束原則卡在哪</h2>

<p>台灣醫院的病歷能不能被拿去訓練 AI，第一關要先問個資法。<a href="https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=20" target="_blank" rel="noopener">個人資料保護法第20條規定，非公務機關利用個人資料原則上應限於蒐集時的特定目的範圍內，只有法律明文規定、增進公共利益、當事人書面同意、學術研究機構基於公共利益進行統計或研究等七款例外情形才能做目的外利用</a>。病歷在蒐集當下的特定目的是診療，事後想拿去訓練商用 AI 模型，等於超出原本目的，除非能落入七款例外之一，否則原則上不能做。<a href="https://www.headinglawyer.com/HD/2026/05/10/ai-%E6%B3%95%E5%BE%8B-3-ai-%E8%88%87%E5%80%8B%E8%B3%87%E6%B3%95%E6%A8%A1%E5%9E%8B%E8%A8%93%E7%B7%B4%E3%80%81%E8%B3%87%E6%96%99%E8%92%90%E9%9B%86%E3%80%81%E8%B7%A8%E5%A2%83%E5%82%B3%E8%BC%B8/" target="_blank" rel="noopener">執業律師的分析進一步指出，實務上企業慣用的「概括同意條款」（如同意公司將本人資料用於各種業務目的）未必能被認可為有效同意，應該採「分項同意」讓當事人可以選擇性地同意特定用途</a>，這代表就算走同意這條路，門檻也不像想像中低。</p>

<p>合成資料常被拿來討論的定位，是繞過「原始病歷要不要離開醫院」這個問題本身：既然生成出來的資料不對應任何真實個人，理論上就不落在個資法規範的「個人資料」範疇。但這個推論並非自動成立，能不能真的被認定為去識別化、有沒有被重新識別的風險，仍要看生成方式與驗證程度而定，台灣目前對合成資料本身尚無專門子法給出明確答案。</p>

<p>台灣手上其實握有全球數一數二完整的健保資料庫，規模龐大卻不能直接拿來訓練商用 AI，這也是<a href="/articles/chatgpt-health-nhi-sdk-accountability/" target="_blank" rel="noopener">健保健康存摺SDK採政府認證第三方App生態、而不是把資料庫整包開放</a>的原因之一：資料治理的設計本身就要在「資料好用」跟「資料安全」之間畫線，合成資料是這條線上的其中一種折衷方案，不是唯一解。</p>

<img src="/images/synthetic-data-medical-ai-taiwan-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="法規文件與檔案畫面，象徵個資法對資料使用的限制（示意圖）">

<h2>該注意什麼：模型崩潰的風險</h2>

<p>合成資料解決了「有沒有資料可以練」，但沒解決「一直用合成資料練下去會不會出問題」。<a href="https://arxiv.org/abs/2305.17493" target="_blank" rel="noopener">Shumailov 等人的研究把這個現象定義為模型崩潰：用模型生成的內容訓練後續世代的模型，會讓新模型出現不可逆的缺陷，原始資料分佈中比較少見的「尾部」內容會逐漸消失，這個現象在語言模型、變分自編碼器、高斯混合模型上都觀察得到</a>，這篇論文後來以《AI models collapse when trained on recursively generated data》為題，刊登在2024年《Nature》631期。<a href="https://techxplore.com/news/2024-07-ai-collapse-llms.html" target="_blank" rel="noopener">研究團隊做了一個具體實驗：拿中世紀建築的文本當原始輸入做遞迴訓練，模型一代一代只學上一代自己生成的內容，到了第九代，輸出已經完全跑題，變成一串跟建築毫無關聯的「野兔清單」，且多代之後的輸出普遍出現重複短語，是效能劣化的另一個徵兆</a>。</p>

<p>放到醫療 AI 的脈絡裡，這代表合成資料不能是訓練資料的唯一來源，而是要跟真實病歷資料搭配使用、定期用真實資料校正，避免模型在一代一代的合成資料循環裡把罕見但臨床重要的病徵樣態（例如少見疾病的影像特徵）給遺忘掉。這正好呼應前面放射影像綜述提到的重點：合成資料能擴增資料量，但保真度與邊緣案例的覆蓋度需要額外驗證，不是生成出來就直接能用。</p>

<img src="/images/synthetic-data-medical-ai-taiwan-s2.webp" width="960" height="722" loading="lazy" decoding="async" alt="數位雜訊與失真圖樣，象徵資料品質逐代劣化（示意圖）">

<h2>常見問題</h2>

<p><strong>合成資料跟去識別化的真實資料是同一回事嗎？</strong><br>不是。去識別化資料仍然是從真實個人紀錄處理而來、理論上仍有被重新識別的風險；合成資料則是由演算法憑統計特性生成、不對應任何真實存在的個人，兩者的資料來源與風險性質不同。</p>

<p><strong>用合成資料訓練醫療 AI，在台灣就不受個資法規範了嗎？</strong><br>不必然。<a href="https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=20" target="_blank" rel="noopener">個資法規範的是「個人資料」的蒐集、處理、利用</a>，合成資料理論上因為不對應真實個人而可能不落入規範範疇，但實際能不能被認定為真正去識別化、有沒有重新識別的風險，仍取決於生成與驗證的品質，台灣對此尚無專門子法明確定義。</p>

<p><strong>什麼是模型崩潰，跟合成資料有什麼關係？</strong><br>模型崩潰是指 AI 模型如果只靠上一代 AI 生成的內容遞迴訓練、缺乏真實資料校正，輸出品質會逐代劣化，<a href="https://arxiv.org/abs/2305.17493" target="_blank" rel="noopener">原始資料分佈裡比較少見的內容會率先消失</a>。這代表合成資料能補資料量的不足，但不能完全取代真實資料，否則長期下來模型會偏離真實世界的分佈。</p>
