# 警消好人好事 — 來源清單（待建管線，隨時更新狀況）

生活台「好人好事」規劃：**全自動上線**、跟著官方公開新聞稿走（員警照原稿具名、民眾比照原稿揭露程度、**不轉載有版權的照片**、每條附原文連結並驗活）。主力來源＝各縣市政府警察局官方新聞稿/好人好事專欄。**不碰 Facebook、不碰消防署中央站（TLS 壞）。**

> 狀態：**管線已建＝固定抓→LLM 只寫**（`scripts/lib/police-fetch.mjs` + `police-parsers*.mjs`；為什麼這樣做見 [../docs/lessons/deterministic-fetch-llm-only-writes.md](./lessons/deterministic-fetch-llm-only-writes.md)）。來源最後盤點日：2026-06-21（從境外機房實測；正式環境同一台、IP 在境外）。
> 「本機可達」欄反映我們 server（境外 IP）能否抓到；標 ⚠️/❌ 者多為境外封鎖或 WAF，內容其實存在，需台灣 IP 代理才能補。

## 22 縣市政府警察局

| # | 警局 | 新聞稿/好人好事來源 | 好人好事量 | 本機可達 | 備註 |
|---|---|---|---|---|---|
| 1 | 臺北市 | police.gov.taipei `News.aspx` | 多 | ✅ | |
| 2 | 新北市 | police.ntpc.gov.tw `/np-3344-1.html` | 偏少 | ✅ | 暖心需挖子頻道 |
| 3 | 桃園市 | typd.gov.tw（好人好事子頻道 cid=8） | 有 | ⚠️ | 境外 504 |
| 4 | 臺中市 | police.taichung.gov.tw 警政新聞 | 有 | ⚠️ | 境外封鎖 |
| 5 | 臺南市 | tnpd.gov.tw `/News/…` | 有 | ✅ | |
| 6 | 高雄市 | kcpd.kcg.gov.tw `News.aspx?n=3FAEF3DDE4DD3CD0…` | **最強** | ✅ | **獨立「好人好事」頻道**，900+ 篇 |
| 7 | 基隆市 | klg.gov.tw `?code=list&ids=22` | ❓ | ⚠️ | 境外封鎖 |
| 8 | 新竹市 | hccp.gov.tw `/ch/home.jsp?id=23` | 偏少 | ✅ | |
| 9 | 嘉義市 | ccpb.gov.tw `/news/?parent_id=10321` | 有 | ❌ | F5 WAF 硬擋（需真實瀏覽器）|
| 10 | 新竹縣 | hchpb.gov.tw 警政新聞 | 有 | ✅ | |
| 11 | 苗栗縣 | mpb.gov.tw `/NewsRss?Parser=9,3,36` | 有 | ⚠️ | **有榮譽榜＋RSS**（最對題），境外封鎖 |
| 12 | 彰化縣 | chpb.gov.tw `/Announcement/C002100` | 偏少 | ✅ | |
| 13 | 南投縣 | ncpd.gov.tw `/latestevent` | 有 | ✅ | |
| 14 | 雲林縣 | ylhpb.yunlin.gov.tw `News.aspx` | 偏少 | ✅ | 主域 www.ylhpb.gov.tw 拒連，用此子域 |
| 15 | 嘉義縣 | cypd.gov.tw 即時新聞 | 有 | ❌ | F5 WAF 硬擋 |
| 16 | 屏東縣 | pthg.gov.tw `/pcpb/…CategorySN=3404` | 多 | ✅ | |
| 17 | 宜蘭縣 | ilcpb.gov.tw `News.aspx?n=16343` | **最強** | ✅ | **「警馨錄」專欄** |
| 18 | 花蓮縣 | hlpb.gov.tw `/tw` | ❓ | ⚠️ | 境外封鎖 |
| 19 | 臺東縣 | ttcpb.gov.tw `/chinese/index.jsp` | 有 | △ | 須偽裝瀏覽器 UA |
| 20 | 澎湖縣 | phpb.gov.tw | ❓ | ⚠️ | 境外封鎖 |
| 21 | 金門縣 | kpb.kinmen.gov.tw `News.aspx?n=67F346BB9C4B0172` | 豐富 | ✅ | 須處理 TLS 中繼憑證 |
| 22 | 連江縣 | lchpd.gov.tw `/Chhtml/news/2666` | 有 | ✅ | 結構最乾淨 |

## 現況小結
- **境外可穩抓 ~13–14 家**（含六都的台北/台南/高雄/新北）；好人好事最現成：**高雄（好人好事頻道）、宜蘭（警馨錄）、屏東、台南、南投、新竹縣、連江、金門**。
- **抓不到 8 家**：桃園/台中/基隆/苗栗/花蓮/澎湖（境外封鎖，台灣 IP 應正常）＋嘉義市/縣（WAF）。補滿需台灣 IP 代理。

## 待辦（建管線時）
- 全自動：掃以上來源 → 篩好人好事（尋人/拾金/救援/助民/暖心，排除純執法/宣導）→ 跟著原稿具名改寫繁中 → 附原文連結並驗活 → 圖庫示意圖（不轉載版權照）→ 自動上架生活台 → 去重。
- 抓不到的當次自動略過；之後評估台灣 IP 代理補齊 8 家。
