---
title: "AI 證出數學定理、還用 Lean 4 逐行機器驗證：AI 做研究的產物第一次能被查證"
slug: "ai-theorem-proving-lean-verifiable"
description: "2024 年 AlphaProof 在奧數拿相當於銀牌的成績，整份證明跑在 Lean 形式化環境逐步驗證；2026 年初 AxiomProver 用 Lean/Mathlib 解掉四個未解猜想。真正的突破不是 AI 更會算數學，而是它的產物第一次能被機器查證，不必靠人相信它沒在唬爛。"
excerpt: "AI 拿奧數金牌很亮眼，但那是自然語言、靠人工評審判對錯。用 Lean 4 逐行驗證的證明才解掉了難題：不用人幫忙也知道它是對的。這才是 AI 可信度第一次有的工程解法。"
publishDate: "2026-07-12T08:00:00+08:00"
category: "tech"
subcategory: "ai"
tags:
  - "生成式AI"
  - "AI治理"
  - "半導體"
coverImage: "covers/ai-theorem-proving-lean-verifiable.webp"
coverAlt: "AI 產出的數學證明被機器逐行驗證的示意"
coverImageCredit: "Photo by Vitaly Gariev on Pexels"
author: "appi-editorial"
reviewedBy:
  - "lightman"
factCheckedBy:
  - "appi-editorial"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "AlphaProof 2024 年在奧數拿相當於銀牌的 28 分，且整份證明跑在 Lean 形式化環境裡逐步驗證；2026 年初 AxiomProver 更用 Lean/Mathlib 解掉四個過去沒人解出來的猜想，外加 Putnam 全部十二題。"
  - "2025 年 Gemini Deep Think 拿的奧數金牌是端到端自然語言、靠人工評審判對錯，沒經 Lean 驗證；金牌證明 AI 寫得出對的數學，可驗證才證明不用人幫忙也知道它是對的。"
  - "真正的突破是 AI 產物第一次有了『能被機器查證』這個結構；台灣的切入點不是搶著訓練證明模型，而是把可驗證產物的方法用進晶片與關鍵軟體驗證。"
risksAndLimits:
  - "Gemini Deep Think 的金牌成績未經 Lean 機器驗證，是由 IMO 評審人工判對錯"
  - "可被 Lean 形式化查證的目前僅限命題明確、對錯二分的數學，整篇論文全面形式化仍是大工程"
  - "形式化只加速了證明的生成與驗證，人類理解背後數學的消化端未被加速"
references:
  - title: "AI achieves silver-medal standard solving International Mathematical Olympiad problems"
    url: "https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/"
    publisher: "Google DeepMind"
  - title: "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the IMO"
    url: "https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/"
    publisher: "Google DeepMind"
  - title: "AxiomProver: AI-Generated Mathematical Proofs"
    url: "https://wal.sh/research/axiomprover-2026/"
    publisher: "wal.sh (Axiom Math 研究整理)"
  - title: "Formalization of Erdős problems"
    url: "https://xenaproject.wordpress.com/2025/12/05/formalization-of-erdos-problems/"
    publisher: "The Xena Project"
  - title: "About the Lean Focused Research Organization"
    url: "https://lean-lang.org/fro/about/"
    publisher: "Lean FRO"
  - title: "Mathematical methods and human thought in the age of AI"
    url: "https://terrytao.wordpress.com/2026/03/29/mathematical-methods-and-human-thought-in-the-age-of-ai/"
    publisher: "Terence Tao, What's new"
originalContribution: "本文把 2024 年 AlphaProof（Lean 驗證、銀牌）與 2025 年 Gemini Deep Think（自然語言、金牌但靠人工評審）並置，提出『拿金牌 ≠ 可被機器驗證』的分辨框架，接上 Terence Tao 生成／驗證／消化三段的速度落差，延伸主張台灣的機會在把形式化驗證方法接進晶片與關鍵軟體驗證，而非搶著訓練證明模型。"
---

AI 現在不只解得出國際數學奧林匹亞的金牌題，還能把整份證明寫成 Lean 這種形式化語言，讓機器逐行檢查每一步對不對。這件事真正的意義不是「AI 更會算數學」，而是 AI 做研究的產物第一次能被機器查證，不必靠你相信它沒在唬爛。長年卡住 AI 的那個老問題，它講得頭頭是道但你不知道是不是幻覺，在數學這一塊，第一次有了工程上的解法。

先看這一年多發生了什麼。2024 年 Google DeepMind 的 AlphaProof [在國際數學奧林匹亞拿到相當於銀牌的成績](https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/)，解掉六題裡的三題（含全場最難那題），加上 AlphaGeometry 解掉一題幾何，合計 28 分。關鍵在它怎麼解：AlphaProof 整個跑在 Lean 這個形式化環境裡，DeepMind 講得很白，形式語言的好處就是涉及數學推理的證明可以被形式化地驗證正確性。到 2026 年初，一個叫 AxiomProver 的系統更進一步，[解掉四個過去沒人解出來的數學猜想、外加 2025 年 Putnam 競賽全部十二題](https://wal.sh/research/axiomprover-2026/)，每一份證明都在 Lean/Mathlib 裡驗過。連數學界的未解問題都開始倒：2025 年底那一週，[三個 Erdős 問題被 AI 攻下，並用 Lean 完成形式化](https://xenaproject.wordpress.com/2025/12/05/formalization-of-erdos-problems/)。

<img src="/images/ai-theorem-proving-lean-verifiable-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="數學競賽與難題求解，象徵 AI 攻下奧數與過去未解的問題">

這裡要踩一個剎車，因為很容易看歪。2025 年 DeepMind 另一條線更搶版面：Gemini Deep Think [在奧數拿到貨真價實的金牌，六題解掉五題、35 分](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)。但那份成績跟 AlphaProof 是兩回事。Gemini 是端到端用自然語言直接寫出證明，沒有經過 Lean 驗證，對錯是靠 IMO 評審人工判的；官方自己也註明，評審只確認答案完整正確，不去驗證他們的系統與模型。換句話說，金牌證明的是「AI 寫得出對的數學」，可驗證證明的是「不用人幫忙也知道它是對的」。前者更亮眼，後者才是難題。把這兩類混為一談，就會誤以為 AI 已經能自己做可信的研究，其實中間差的正是那道驗證關卡。

<img src="/images/ai-theorem-proving-lean-verifiable-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="金牌與打勾符號，象徵拿金牌與可被機器驗證是兩件不同的事">

Lean 到底把問題解在哪？它把「可信」從「相信模型」換成「檢查憑證」。[Lean 是一套定理證明器兼形式化驗證系統](https://lean-lang.org/fro/about/)，一份證明能不能在 Lean 裡編譯通過，是機器說了算，沒有模糊空間。有數學家講得很直接，形式化過的證明拿到的是一張形式驗證憑證，一份能編譯的 Lean 證明[沒辦法被幻覺出來](https://xenaproject.wordpress.com/2025/12/05/formalization-of-erdos-problems/)，這就把主觀的「這證明看起來對不對」變成客觀的計算結果。這正是我一直講的那件事：AI 值不值得信，關鍵從來不是模型多大，而是有沒有一道能攔住它的驗證機制。我在寫[醫療 AI 合規守門引擎](/articles/medical-ai-compliance-gatekeeper-engine/)時就是這個立場，缺了驗證這一關，再強的模型都不該直接信。Lean 之於數學，就是那道機制。

<img src="/images/ai-theorem-proving-lean-verifiable-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="程式碼在螢幕上，象徵 Lean 把可信變成檢查憑證，能不能編譯就是對錯">

但別急著說問題全解了。可驗證有它的邊界。第一，能被 Lean 這樣查的，目前還是「有明確命題、對錯二分」的數學，一整篇研究論文要把每個定義、引理、定理都形式化，還是大工程，離全自動很遠。第二，也是更根本的，數學家 Terence Tao 就提醒過，形式化給了你自然語言證明沒有的可驗證性，但[人要真正理解背後的數學，這一端沒被加速](https://terrytao.wordpress.com/2026/03/29/mathematical-methods-and-human-thought-in-the-age-of-ai/)。他把 AI 數學拆成生成、驗證、消化三段，生成端被 AI 拉快了好幾個數量級，驗證跟消化還卡在人的認知頻寬，中間出現嚴重的速度落差。所以「機器驗證通過」不等於「有人看懂了、能拿去用」。這是訊號跟建議之間那段系統性的距離，形式化解掉的是其中一段，不是全部。

<img src="/images/ai-theorem-proving-lean-verifiable-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="人在白板前思考複雜圖表，象徵可驗證之後人類理解仍是瓶頸">

那台灣該從這條線讀出什麼？別只當它是一則數學新聞。Lean 這套形式化驗證，本來就不只用在數學。[Lean FRO 的定位就寫著它橫跨數學、軟體與硬體驗證](https://lean-lang.org/fro/about/)，AWS 拿它驗過權限政策。台灣最該接的點在這裡：我們的強項是半導體與晶片，而晶片設計驗證、關鍵軟體正確性，跟數學證明形式化是同一套思路，用機器把「這東西到底對不對」證到底，而不是靠人眼掃過去賭它沒錯。當 AI 開始大量生產程式與設計，能不能信得過，就看有沒有把這種可驗證的產物做進流程。台灣的機會不是去搶著訓練下一個證明模型，而是把「產物要能被機器查證」這套方法，用進本地真正需要可信度的地方。這件事我在談[LLM 是不是救贖](/articles/llm-healthcare-promise-limits/)時就說過，先問你要解的是哪類問題、根因在哪，再談要不要、怎麼用 AI。

<img src="/images/ai-theorem-proving-lean-verifiable-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體晶圓檢測，象徵台灣把可驗證產物用進晶片與關鍵軟體驗證">

把數學證明交給 AI 寫、交給機器驗，這波真正的突破不是又刷新一個 benchmark 分數，而是 AI 產物第一次有了「能被查證」這個結構。看懂這個結構，比記住 AI 又解了幾題重要。因為接下來每一個想把 AI 放進嚴肅工作的人，遲早都要回答同一個問題：它做出來的東西，你憑什麼信？數學這邊先給了一個答案，讓機器去驗。

<img src="/images/ai-theorem-proving-lean-verifiable-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="數學算式與證明手寫在黑板上，象徵 AI 產出可查證的數學證明">

<h2>常見問題</h2>

<p><strong>AI 證明的數學定理，怎麼確定不是它唬爛的？</strong><br>看它有沒有經過形式化驗證。像 AlphaProof、AxiomProver 這類系統會把證明寫成 <a href="https://lean-lang.org/fro/about/">Lean 這種形式化語言</a>，一份證明能不能在 Lean 裡編譯通過是機器判定的，沒有模糊空間，一份能編譯的證明沒辦法被幻覺出來。反過來說，如果只是自然語言寫的一大段推理、沒有形式化，那就還是得靠人逐段檢查。</p>

<p><strong>既然 2025 年 AI 都拿數學奧林匹亞金牌了，為什麼還說「可驗證」才是重點？</strong><br>因為那面金牌是 Gemini Deep Think <a href="https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/">用自然語言寫、靠 IMO 評審人工判對錯拿到的</a>，沒有經過機器驗證。金牌證明 AI 寫得出對的數學，可驗證證明的是不用人幫忙也知道它是對的。後者才是把 AI 放進嚴肅研究時真正卡住的那關。</p>

<p><strong>Lean 4 是什麼？只有數學用得到嗎？</strong><br>Lean 是一套定理證明器兼形式化驗證系統，由 Lean FRO 維護。它<a href="https://lean-lang.org/fro/about/">不只驗數學，也用在軟體與硬體驗證</a>，例如 AWS 拿它驗過權限政策。核心概念是用機器嚴格證明「某個東西符合某個規格」，這套思路跟晶片設計驗證、關鍵軟體正確性是相通的。</p>

<p><strong>台灣在這波 AI 證明數學的趨勢裡有什麼機會？</strong><br>機會不在搶著訓練下一個證明模型，而在把「產物要能被機器查證」這套方法用進本地強項。台灣的半導體與晶片設計驗證，跟數學形式化是同一套思路。當 AI 大量生產程式與設計，能不能信得過就看有沒有把可驗證的產物做進流程，這正是台灣能接的位置。</p>
