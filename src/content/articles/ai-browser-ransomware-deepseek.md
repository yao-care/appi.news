---
title: "AI 第一次把「理論級」瀏覽器勒索軟體橋接成真攻擊：DeepSeek 生成案例的資安警訊"
slug: "ai-browser-ransomware-deepseek"
description: "Check Point Research 揭露一支 DeepSeek 生成的惡意程式，用瀏覽器合法的 File System Access API 把「純理論」的瀏覽器勒索軟體變成可跑的攻擊鏈：不裝任何執行檔，靠使用者自己按下「允許」就能加密整個資料夾。真正該修的不是模型會不會寫毒，而是那個大家都習慣亂按的授權提示。"
excerpt: "為什麼防守方一直以為瀏覽器沙盒擋得住勒索軟體，這次卻破了？因為攻擊沒有繞過沙盒，是使用者自己開了門。AI 只是把這個大家都忽略的縫隙推理出來、寫成成品。"
publishDate: "2026-08-09T08:00:00+08:00"
category: "tech"
subcategory: "security"
tags: ["瀏覽器勒索軟體", "DeepSeek", "File System Access API", "AI 資安", "社交工程"]
coverImage: "covers/ai-browser-ransomware-deepseek.webp"
coverAlt: "象徵 AI 生成瀏覽器原生勒索軟體資安威脅的深色示意畫面"
coverImageCredit: "Photo by cottonbro studio on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "Check Point Research 在近 3,000 支 DeepSeek 相關檔案裡挖到一支 Flask 應用，是第一個有文件記載、由 AI 自己把「理論級」瀏覽器勒索軟體橋接成可運作攻擊鏈的案例。"
  - "攻擊沒有繞過瀏覽器沙盒，也沒裝任何執行檔或 APK，全靠合法的 File System Access API：使用者按下一次「允許」，網頁就能讀取、外傳、加密整個資料夾。"
  - "真正該修的不是「AI 會不會寫惡意程式」，而是那個大家都習慣隨手按掉的瀏覽器授權提示；台灣一般使用者、家長手機相簿與企業端都在同一條攻擊面上。"
references:
  - title: "Browser-Only Ransomware: From LLM Hallucinations to a Practical Attack Technique"
    url: "https://research.checkpoint.com/2026/browser-only-ransomware-from-llm-hallucinations-to-a-practical-attack-technique/"
    publisher: "Check Point Research"
  - title: "When AI Invents the Attack: Browser-Native Ransomware"
    url: "https://blog.checkpoint.com/research/when-ai-invents-the-attack-browser-native-ransomware"
    publisher: "Check Point Blog"
  - title: "DeepSeek-Generated Malware Shows How AI Can Build Browser-Native Ransomware Workflows"
    url: "https://cyberpress.org/ai-built-browser-ransomware-workflows/"
    publisher: "Cyber Press"
  - title: "Check Point Uncovers AI-Generated Browser Ransomware Technique"
    url: "https://securitymea.com/2026/07/02/check-point-uncovers-ai-generated-browser-ransomware-technique/"
    publisher: "Security MEA"
originalContribution: "本文把 Check Point 的技術揭露重新定位成一個「解對題」的問題：這次破防的根因不是 AI 會寫惡意程式，而是瀏覽器授權模型把最後一道防線交給了使用者的一次點擊；並據此推導台灣一般使用者、家長手機相簿與企業端該把「授權提示」當成攻擊面來管，而不是繼續依賴端點防毒。"
---

這則資安新聞的重點，不是「AI 又學會寫病毒了」。重點是它揭穿了一個大家一直沒認真面對的縫隙：瀏覽器裡有一道合法的門，鑰匙在使用者手上，而多數人習慣看都不看就把門打開。Check Point Research 在近 3,000 支 DeepSeek 相關檔案裡，挖到[一支用瀏覽器合法功能寫成的勒索軟體](https://research.checkpoint.com/2026/browser-only-ransomware-from-llm-hallucinations-to-a-practical-attack-technique/)，它不裝任何執行檔、不用系統漏洞、不需要 root，光靠使用者按一次「允許」，就能把整個資料夾讀走、外傳、加密。這是第一個有文件記載、由 AI 自己把「純理論」推理成可運作攻擊鏈的案例。

<img src="/images/ai-browser-ransomware-deepseek-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="AI 跨越既有平台知識推理出全新攻擊路徑的示意">

先講清楚為什麼這件事值得停下來看。瀏覽器原生的勒索軟體，資安圈以前當它是空談，理由是瀏覽器沙盒（sandbox）把網頁關在一個小盒子裡，碰不到你的檔案系統。Check Point 說這次的關鍵，是[「一個 AI 跨越既有平台知識、推理出一條全新的攻擊路徑」](https://blog.checkpoint.com/research/when-ai-invents-the-attack-browser-native-ransomware)。它沒有去打穿沙盒，而是找到沙盒上一扇「本來就設計來讓你打開」的門，然後說服你自己開。攻擊面一直都在，只是沒人把它拼成一個完整、可用、傻瓜化的成品。這次 AI 把它拼出來了。

<img src="/images/ai-browser-ransomware-deepseek-s2.webp" width="960" height="640" loading="lazy" decoding="async" alt="瀏覽器跳出資料夾存取授權提示的示意畫面">

那扇門叫 File System Access API。這是給網頁版修圖軟體、線上文件編輯器用的正規功能，讓網頁在你同意後，能存取本機某個資料夾、讀寫裡面的檔案。問題出在「同意」這一步。Check Point 描述的流程是：網頁呼叫 `showDirectoryPicker()`，跳出一個看起來很日常的授權視窗，[一旦你按下允許，網頁就能列舉資料夾內的檔案、讀取並外傳內容、加密後覆寫回去](https://securitymea.com/2026/07/02/check-point-uncovers-ai-generated-browser-ransomware-technique/)。整條鏈沒有一步是「非法」的，每一步瀏覽器都認為是你授權的操作。這就是它難防的地方：防毒軟體攔的是可疑執行檔，但這裡從頭到尾沒有執行檔。

<img src="/images/ai-browser-ransomware-deepseek-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="偽裝成正常網站的釣魚頁面誘導使用者授權的警示示意">

騙你按下允許的手法，設計得很懂人性。Check Point 分析的樣本（被命名為 InfernoGrabber）把自己[偽裝成一個 Discord 頭像的 AI 放大工具](https://cyberpress.org/ai-built-browser-ransomware-workflows/)，說要「處理你的圖片」，所以請你授權存取放圖片的資料夾。這個要求聽起來完全合理，修圖工具本來就需要讀你的檔案。你以為在放大一張頭像，實際上網頁靜靜地把整個資料夾讀走、加密，最後跳出一張要你付比特幣的勒索通知。整個過程你的電腦沒裝過任何東西。這裡要踩一個剎車：這種釣魚頁本身不是新發明，新的是它背後那條「用合法 API 完成加密」的攻擊邏輯，被 AI 一次補完了。

<img src="/images/ai-browser-ransomware-deepseek-s4.webp" width="867" height="1300" loading="lazy" decoding="async" alt="AI 依提示生成程式碼的抽象示意">

為什麼是 DeepSeek，不是別家？因為門檻。Check Point 的觀察是，DeepSeek 免費、公開好取得，而且[拒答率比 OpenAI、Anthropic 低](https://research.checkpoint.com/2026/browser-only-ransomware-from-llm-hallucinations-to-a-practical-attack-technique/)，在測試裡「單一個籠統的提示就吐出一支完整的惡意應用」，換成其他模型得拆成好幾次請求、手動拼裝才做得到。這才是真正該擔心的點。不是模型變得多聰明，而是它把「需要一點技術底子才做得出來」的東西，變成「不會寫程式的人講一句話就拿到成品」。門檻塌下來，能動手的人就從少數變成很多。這是能力擴散的問題，不是能力上限的問題。

<img src="/images/ai-browser-ransomware-deepseek-s5.webp" width="960" height="640" loading="lazy" decoding="async" alt="手機與行動裝置資安風險的示意">

影響範圍也比想像廣。這套技術在桌面版 Chromium 瀏覽器上跑得起來，Windows、Linux 都中；Safari 和 Firefox 沒有對應的檔案選擇器，暫時擋得住。但真正該注意的是手機：[Chrome 132 之後，Android 也開放了完整的 File System Access](https://securitymea.com/2026/07/02/check-point-uncovers-ai-generated-browser-ransomware-technique/)，代表你手機相簿那個放滿照片、有時還混著證件翻拍、財務單據的 DCIM 資料夾，也在射程內。目前 Check Point 說還沒看到有人真的拿它發動攻擊，他們是因為門檻太低、太容易被複製，才提早把研究公開示警。

那台灣該從這條新聞讀出什麼？先把題目定對。很多人第一個反應會是「所以要禁 DeepSeek、要更強的防毒」，這個方向會解錯題。禁一個模型，攻擊者換一個就好；防毒抓執行檔，這條鏈根本沒有執行檔。這次破防的根因，是瀏覽器把最後一道防線交到了使用者的一次點擊上，而我們早就被訓練成看到授權視窗就反射性按「允許」。所以能真正止血的，是把「瀏覽器的資料夾授權提示」當成一個攻擊面來管，不是當成無關緊要的彈窗。

對一般使用者，可執行的動作很具體：碰到網頁要求存取「整個資料夾」而不只是「選一個檔案」時停一秒，想清楚這個工具為什麼需要讀你一整包檔案；不要把授權指到桌面、文件、相簿這種塞滿重要東西的目錄。對家裡有長輩、小孩用手機的人，這條提醒要往下傳，因為手機相簿的心理防線最低。對企業資安，這是一個訊號：端點防護該把瀏覽器的 API 授權行為納入監控，資安意識訓練的教材也該把「授權提示」加進去，跟釣魚信、假網站放在同一個層級講。

AI 這次示範的，不是它會作惡，而是它會把散落在文件裡、沒人拼起來的縫隙，主動推理成一條可用的路。防守方的功課因此變了：不能再假設「還沒被利用的理論風險」有時間慢慢補，因為把理論變成成品的成本，正在被壓到趨近於零。看懂這條攻擊鏈靠的是誰開了門，比記住它叫什麼名字重要。

<h2>常見問題</h2>

<p><strong>瀏覽器勒索軟體會裝在我的電腦上嗎？</strong><br>不會，這正是它難防的地方。這次 Check Point 揭露的技術[全程在瀏覽器內完成，不安裝任何執行檔、不需要系統漏洞或 root 權限](https://research.checkpoint.com/2026/browser-only-ransomware-from-llm-hallucinations-to-a-practical-attack-technique/)。它靠的是你按下「允許」後，網頁透過合法的 File System Access API 直接讀取並加密你授權的資料夾，所以傳統防毒軟體抓執行檔的做法攔不到它。</p>

<p><strong>我怎麼知道一個網頁的資料夾授權要求是不是陷阱？</strong><br>關鍵看它要的範圍與必要性。如果一個工具要求存取「整個資料夾」而不是讓你「選一個檔案上傳」，而且那份權限跟它宣稱的功能不成比例，就該提高警覺。攻擊樣本[偽裝成 Discord 頭像的 AI 放大工具](https://cyberpress.org/ai-built-browser-ransomware-workflows/)，用「處理圖片」當藉口要你開放整個相簿資料夾，就是典型的話術。授權前先想清楚它為什麼需要讀你一整包檔案。</p>

<p><strong>手機也會中招嗎？</strong><br>會，而且風險可能更高。[Chrome 132 之後 Android 開放了完整的 File System Access API](https://securitymea.com/2026/07/02/check-point-uncovers-ai-generated-browser-ransomware-technique/)，讓網頁在授權後能存取手機上的資料夾，包含放滿照片與翻拍證件的相簿目錄。iOS 上的 Safari 沒有開放同樣的功能，暫時不受這條技術影響。</p>

<p><strong>這是 DeepSeek 的漏洞嗎？該不該禁用它？</strong><br>不是 DeepSeek 的軟體漏洞，被利用的是瀏覽器的合法功能與使用者的授權習慣。DeepSeek 之所以被點名，是因為它[免費、拒答率較低，用一句籠統的提示就能生出完整的惡意程式](https://blog.checkpoint.com/research/when-ai-invents-the-attack-browser-native-ransomware)，把作案門檻壓得很低。但禁一個模型解決不了根因，因為攻擊者可以換工具，真正要補的是瀏覽器授權提示這個攻擊面與使用者的點擊習慣。</p>
</content>
</invoke>
