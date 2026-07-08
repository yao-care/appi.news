---
title: "輝達把 Windows 講成『agentic AI OS』：RTX Spark 今秋出貨，CPU 交給台灣聯發科操刀"
slug: "nvidia-rtx-spark-mediatek-windows"
description: "輝達與微軟五月底發表 RTX Spark，把 Windows 定位成 agentic AI 平台，今秋出貨。真正值得台灣看的不是口號，是 128GB 統一記憶體讓大模型在本機跑，與 Arm CPU 由聯發科共同設計、台灣 IC 設計爬進高階 Windows PC。"
excerpt: "『你只要問，電腦替你做事』聽起來很科幻，但 agentic AI OS 是行銷語言。真正被解掉的是本地推論的記憶體門檻；真正該讀懂的，是聯發科從代工爬到共同設計高階處理器這件事。"
publishDate: "2026-08-08T08:00:00+08:00"
category: "tech"
subcategory: "industry-tech"
tags: ["輝達 RTX Spark", "聯發科", "Windows on Arm", "agentic AI", "台灣半導體"]
coverImage: "covers/nvidia-rtx-spark-mediatek-windows.webp"
coverAlt: "象徵輝達 RTX Spark 超級晶片與 Windows AI PC 的電路板特寫"
coverImageCredit: "Photo by Jimmy Chan on Pexels"
author: "lightman"
status: "scheduled"
sourceType: "editorial"
contentType: "analysis"
disclaimerType: "general"
disclosure: "本文以 AI 輔助起草，所有數據、事實與引述來源均經人工逐條查證、編輯與校對後刊出。"
highlights:
  - "輝達與微軟五月底發表 RTX Spark，把 Windows 講成 agentic AI 作業系統，今秋由華碩、戴爾、HP、聯想、微軟 Surface 與微星出貨；晶片內部代號 N1X，跟 DGX Spark 的 GB10 是同一塊矽。"
  - "真正被這顆晶片解掉的是本地推論的記憶體門檻：128GB 統一記憶體讓 120B 參數、百萬 token 上下文的模型整個塞進本機跑，資料不必回雲端。這是解對了一個具體的題，跟『作業系統會自己幫你做事』是兩回事。"
  - "這顆 Arm CPU 是聯發科共同設計、台積電製造；聯發科不是代工，是掛名設計一顆進旗艦筆電的處理器核心，從中低階手機 SoC 爬到高階 Windows PC，是台灣 IC 設計往上走一階的訊號。"
references:
  - title: "NVIDIA and Microsoft Reinvent Windows PCs for the Age of Personal AI"
    url: "https://nvidianews.nvidia.com/news/nvidia-microsoft-windows-pcs-agents-rtx-spark"
    publisher: "NVIDIA Newsroom"
  - title: "MediaTek Collaborates with NVIDIA on RTX Spark to Power the Next Wave of Windows PC Experiences"
    url: "https://www.mediatek.com/press-room/mediatek-collaborates-with-nvidia-on-rtx-spark-to-power-the-next-wave-of-windows-pc-experiences"
    publisher: "MediaTek"
  - title: "Introducing a powerful new chapter for Windows PCs, accelerated by NVIDIA RTX Spark"
    url: "https://blogs.windows.com/windowsexperience/2026/05/31/introducing-a-powerful-new-chapter-for-windows-pcs-accelerated-by-nvidia-rtx-spark/"
    publisher: "Windows Experience Blog"
  - title: "Nvidia's Grace Blackwell superchips are officially coming to the PC with RTX Spark notebooks"
    url: "https://www.theregister.com/systems/2026/06/01/nvidia-recasts-gb10-superchip-in-bid-for-high-end-pc-market/5249068"
    publisher: "The Register"
  - title: "Nvidia RTX Spark"
    url: "https://en.wikipedia.org/wiki/Nvidia_RTX_Spark"
    publisher: "Wikipedia"
originalContribution: "本文把輝達『agentic AI OS』的行銷語言拆成三層各自檢驗：128GB 統一記憶體解的是本地推論記憶體門檻（真實）、OpenShell 解的是 agent 權限邊界（信任靠機制不靠模型）、以及聯發科從代工升級到共同設計高階 CPU 的台灣定位，並點出 Windows on Arm x86 相容性這個沒被解掉的舊坑。"
---

輝達（NVIDIA）把一句行銷話講得很大：RTX Spark 會「把 Windows 變成 agentic AI 作業系統」。先把結論放前面。真正值得台灣看的不是那句口號，是兩件硬事。一是這顆晶片塞了 128GB 統一記憶體，可以在本機直接跑 120B 參數的大型語言模型，不必把資料丟回雲端；二是它的 Arm CPU 是找台灣聯發科（MediaTek）共同設計的，等於台灣的 IC 設計爬進了高階 Windows PC 這一格。這兩件事都成立，但「agentic AI OS」這個包裝要打個折。

先講清楚發生什麼事。輝達與微軟五月底共同發表 [RTX Spark](https://nvidianews.nvidia.com/news/nvidia-microsoft-windows-pcs-agents-rtx-spark)，一顆把 20 核 Arm CPU、6,144 個 CUDA 核心的 Blackwell GPU 與最高 128GB 統一記憶體綁在一起的超級晶片，號稱 1 petaflop 的 AI 算力，今秋由華碩、戴爾、HP、聯想、微軟 Surface 與微星等品牌出貨。執行長黃仁勳的定調是：「四十年來你打開 app、點擊、打字；有了 RTX Spark 跟 Windows，你只要問，電腦替你做事。」這顆晶片內部代號 N1X，[跟輝達自家 DGX Spark 用的 GB10 是同一塊矽](https://www.theregister.com/systems/2026/06/01/nvidia-recasts-gb10-superchip-in-bid-for-high-end-pc-market/5249068)，差別只在一個裝 Windows、一個裝改過的 Ubuntu。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s1.webp" width="960" height="640" loading="lazy" decoding="async" alt="RTX Spark 超級晶片的處理器與電路板特寫，象徵 20 核 Arm CPU 與 Blackwell GPU">

「你只要問，電腦替你做事」聽起來很像科幻，但這裡要先踩個剎車。把 Windows 叫做 agentic AI OS，是行銷語言，不是產品事實。真正被這顆晶片解掉的問題其實很具體：本地推論的記憶體門檻。過去要在本機跑一個上百億參數的模型，記憶體根本不夠，只能把你的問題、你的檔案送到雲端算完再送回來。128GB 統一記憶體讓 [120B 參數、百萬 token 上下文的模型可以整個塞進本機跑](https://nvidianews.nvidia.com/news/nvidia-microsoft-windows-pcs-agents-rtx-spark)。這件事的價值不是「AI 變聰明」，是資料不必離開你的機器：延遲低、隱私留在本地，也不必按 token 付雲端費。這是解對了一個真實的題，跟「作業系統會自己幫你做事」是兩回事。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s2.webp" width="867" height="1300" loading="lazy" decoding="async" alt="筆電與工作桌面，象徵在本機直接跑大型語言模型、資料不必回雲端">

第二個要看的是控制邊界。微軟自己在公告裡把話說得比輝達保守：[「控制是 Windows 上 AI 的基本原則，你決定 agent 什麼時候、以什麼方式代你行動」](https://blogs.windows.com/windowsexperience/2026/05/31/introducing-a-powerful-new-chapter-for-windows-pcs-accelerated-by-nvidia-rtx-spark/)。它靠的是新的 Windows 安全隔離機制，加上輝達的 OpenShell 執行環境，讓 agent 在一個受限、可稽核的容器裡跑。這一段才是重點。agent 值得信任，從來不是因為模型多強，而是因為你能限制它碰什麼、看得到它做了什麼。能力給得越大，權限邊界就越要先畫清楚。我之前寫過 [MCP 成為 agent 事實標準之後、企業真正要治理的是權限邊界](/articles/mcp-de-facto-standard-agent-governance/)，同一句話搬到桌機上一樣成立：一台能在本地跑 agent 的電腦，麻煩的不是它會不會做事，是它被授權做到哪裡。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s3.webp" width="960" height="640" loading="lazy" decoding="async" alt="數位安全與存取控制示意，象徵 agent 的權限邊界與可稽核隔離">

再來是台灣最該讀懂的一段。這顆 CPU 不是輝達自己做的，是[聯發科共同設計的](https://www.mediatek.com/press-room/mediatek-collaborates-with-nvidia-on-rtx-spark-to-power-the-next-wave-of-windows-pc-experiences)。聯發科資深副總經理 Vince Hu 的說法是，這次他們提供的是 CPU 與快取架構、系統整合、記憶體控制器、電源管理，以及無線連線這幾塊，晶片交由台積電製造。過去大家對台灣半導體的印象停在「台積電代工那顆大晶片」。但這次聯發科不是代工，是掛名共同設計一顆要進華碩、戴爾、聯想旗艦筆電的處理器核心，從中低階手機 SoC 與 Chromebook 一路爬到高階 Windows PC 這一格。這是台灣 IC 設計能力往上走一階的訊號，不是又接了一張代工單。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s4.webp" width="960" height="640" loading="lazy" decoding="async" alt="半導體與電子製造示意，象徵聯發科共同設計晶片、台積電製造">

那為什麼是現在？答案在一個時間點：[高通（Qualcomm）獨家供應 Windows on Arm 的協議到期了](https://en.wikipedia.org/wiki/Nvidia_RTX_Spark)，微軟才有動機把 Arm 生態系開給第二家。輝達接手的位置，正是高通一直沒打下來的那塊。但這裡有個所有人都在裝作沒看到、房間裡的大象：x86 軟體相容性。Windows on Arm 過去屢戰屢敗，卡的從來不是晶片不夠快，是舊軟體得靠模擬層跑，跑不順就沒人要用。[連科技媒體都注意到，這波公告刻意繞開了相容性這題](https://www.theregister.com/systems/2026/06/01/nvidia-recasts-gb10-superchip-in-bid-for-high-end-pc-market/5249068)。晶片規格漂亮不代表生態系會跟上。這是同一個坑，換一家廠商跳，不保證這次跳得過。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s5.webp" width="867" height="1300" loading="lazy" decoding="async" alt="筆電鍵盤與軟體畫面，象徵 Windows on Arm 的 x86 相容性與模擬層難題">

所以台灣該從這則新聞讀出的，不是「又有一顆 AI 晶片要出」。是兩層。一層，聯發科把自己從代工推進到共同設計高階處理器，這個位置比接單更難被取代，該守住、往上疊。另一層，這波賭的成敗不在晶片本身，在 Windows on Arm 的軟體生態能不能撐起來，這不是任何一顆晶片解得掉的問題。看懂哪個是晶片能解的題、哪個是生態系才能解的題，比背下 128GB 這個數字重要。台灣站在共同設計這一格，該做的是先把能力長好，不是等這波風口自己把單送上門。

<img src="/images/nvidia-rtx-spark-mediatek-windows-s6.webp" width="960" height="640" loading="lazy" decoding="async" alt="電路板與電子工程示意，象徵台灣在實體 AI 供應鏈從代工到共同設計的卡位點">

## 常見問題

<p><strong>RTX Spark 是什麼，跟一般筆電差在哪？</strong><br>它是輝達與微軟合推的 Windows PC 平台，核心是一顆結合 20 核 Arm CPU、Blackwell GPU 與最高 128GB 統一記憶體的超級晶片，號稱 <a href="https://nvidianews.nvidia.com/news/nvidia-microsoft-windows-pcs-agents-rtx-spark">1 petaflop AI 算力</a>。跟一般筆電最大的差別是那 128GB 統一記憶體，讓百億參數等級的大模型可以整個在本機跑，不必回雲端。今秋由華碩、戴爾、HP、聯想、微軟 Surface 與微星出貨。</p>

<p><strong>『agentic AI OS』是真的嗎，Windows 會自己幫我做事？</strong><br>那是行銷定位，不是說 Windows 變成一個會自作主張的系統。實際落地的是：AI agent 可以在本機、在輝達 OpenShell 的受限容器裡跑，而且微軟強調 <a href="https://blogs.windows.com/windowsexperience/2026/05/31/introducing-a-powerful-new-chapter-for-windows-pcs-accelerated-by-nvidia-rtx-spark/">你決定 agent 什麼時候、以什麼方式代你行動</a>。真正的重點是權限邊界，不是「電腦自己會做事」。</p>

<p><strong>聯發科在這顆晶片裡到底做了什麼？</strong><br>聯發科共同設計了這顆晶片的 Arm CPU 部分，<a href="https://www.mediatek.com/press-room/mediatek-collaborates-with-nvidia-on-rtx-spark-to-power-the-next-wave-of-windows-pc-experiences">提供 CPU 與快取架構、系統整合、記憶體控制器、電源管理與無線連線</a>，晶片由台積電製造。這不是代工，而是掛名共同設計一顆進旗艦筆電的處理器核心，代表台灣 IC 設計往高階 Windows PC 市場升一階。</p>

<p><strong>Windows on Arm 這次會成功嗎？</strong><br>還很難說。最大的變數不是晶片夠不夠快，是 x86 舊軟體的相容性，這是 Windows on Arm 過去屢戰屢敗的老坑。這波能成局，是因為 <a href="https://en.wikipedia.org/wiki/Nvidia_RTX_Spark">高通獨家供應 Windows on Arm 的協議到期</a>，微軟才把生態系開給第二家；但晶片規格漂亮不等於軟體生態會跟上。</p>
