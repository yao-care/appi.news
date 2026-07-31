# 歷史經驗（lessons）— 為什麼這樣做

> 這個資料夾記錄**踩過的坑與重大決策**：每篇講清楚「**問題 → 原因 → 解法**」。
>
> 三層文件分工：
> - **`CLAUDE.md`（根）/ `README.md`**：導航 + 鐵則（在哪一格、不可破壞什麼）。
> - **說明文件**（`PERFORMANCE.md`、`docs/SERVER_HANDOFF.md`…）：**怎麼做**（現行 SOP）。遇到「為什麼這樣做」就連到這裡。
> - **本資料夾**：**為什麼**（前因後果）。說明文件不重述歷史，一律連過來。

## 寫法（新增一篇時照這個骨架）

```markdown
# <標題：一句話講清楚是什麼坑>

> 摘要：<一句話> ｜ 範圍：<字型/效能/SEO/自動化…> ｜ 狀態：已解決 / 緩解中 ｜ 日期：YYYY-MM-DD

## 問題（症狀）   ← 當時看到什麼、影響多大
## 原因（根因）   ← 真正的原因，不是表象
## 解法（怎麼修 + 現在怎麼維持）
## 怎麼避免重犯 / 相關   ← 鐵則、連到對應 SOP 段落
```

## 現有篇目

**效能**
| 篇目 | 一句話 |
|---|---|
| [font-render-blocking.md](./font-render-blocking.md) | 全腳本字型進入點造成 545 個 @font-face、662 KB render-blocking，怎麼救回來的 |
| [psi-cold-edge.md](./psi-cold-edge.md) | 剛部署 PSI 暴跌到 55 多半是冷邊緣假象，別對假問題改程式；低流量站連 cb 都暖不回 PSI 的 POP，判健康看暖讀指標非總分 |

**SEO / 換網域**
| 篇目 | 一句話 |
|---|---|
| [topical-authority-concentration.md](./topical-authority-concentration.md) | 512 篇/7 分類卡排名 18：主題權威靠「收斂」賺不是「多產」堆，具名作者+高產量≠權威（權威站外賺）；把作者收攏回打得贏的窄利基、選題從「獵熱度」改「獵可贏性」四項 gate，別再跑平行商品科技產線 |
| [query-targeting-event-vs-concept.md](./query-targeting-event-vs-concept.md) | tech 93 篇排在 pos 4~10 卻每篇只有 13.8 曝光：主標瞄準 `figure 03 bmw`、`fable 5` 這種只活一週的事件字（90 天各 2~11 曝光），同期唯一一篇「是什麼／運作原理」概念文拿 177 曝光、差 16 倍；選題 gate 管不到下標，另加 `targetQuery` 三檢查；附「熱門新聞第一頁＝Top Stories 權威×速度賽道、非 SEO」的實測 |
| [high-impression-zero-click-bot-queries.md](./high-impression-zero-click-bot-queries.md) | 高曝光零點擊不一定是 SEO 問題：氣象 App／通知的模板化查詢（非人類），改標題永遠 0 點擊，該「滅燈」不是優化；附裝置別查證法＋兩消費端 mute 機制 |
| [tag-taxonomy.md](./tag-taxonomy.md) | `tags` 是全站唯一沒做 enum 約束的分類欄位，481 篇長出 1,883 個標籤、85.9% 只出現一次、1,618 個 noindex 死頁；唯一被指定固定詞的產線是唯一沒爛的產線；改成受控詞彙表＋schema enum 硬擋，unique 1,883→179 |
| [duplicate-topic-gate.md](./duplicate-topic-gate.md) | `髖關節痛` 被自家 5 個 URL 瓜分全卡 pos 76-83：去重下在選題端（14 天窗、單一產線）蓋不到跨月與跨產線的重複，改下在寫入端；另查出 131 個 meta-refresh 轉址殘骸仍吃 15% 站台曝光，「轉址已處理」≠「權重已傳遞」 |
| [google-indexing-api-gray-area.md](./google-indexing-api-gray-area.md) | 「有 GSC key 就能催收錄」是誤解；Indexing API 對新聞站非官方、200 不保證收錄 |
| [discover-image-and-meta-signals.md](./discover-image-and-meta-signals.md) | Discover 0 曝光但技術前置全齊：破口是 20 篇直式封面（worker 搜圖沒帶 orientation）、og:image 尺寸寫死 1200×630 與實際不符、4 篇熱連結封面且 3 篇低於 1200px；附「標題不用為 Discover 另訂規則」的實測結論 |
| [google-news-surfaces-and-cover-image.md](./google-news-surfaces-and-cover-image.md) | Google News 2025-03 起不吃提交的 feed/section（自動抓取）；JSON-LD/og 圖指原圖非 900 顯示圖，封面 ≥1200 從來源端解 |
| [wordpress-date-permalink-404.md](./wordpress-date-permalink-404.md) | 舊 WordPress 日期網址漏接轉址變 404，仍在流失 Google 曝光 |
| [domain-change-worker-cors.md](./domain-change-worker-cors.md) | 換網域漏改 Cloudflare Worker 的 ALLOWED_ORIGIN → 編輯器「Failed to fetch」 |

**自動化 / 發佈 / git**
| 篇目 | 一句話 |
|---|---|
| [automation-model-and-account-split.md](./automation-model-and-account-split.md) | 帳號切換洗掉排程行＋全 Opus 燒爆週額度＋claude-appi 撞限額會 exit 0：cron 一律帶 --model、判成功不能只看 exit code；續：偵測到限額只 continue → 逐項批次變 24 次空打，須遇限額即 break 中止整批 |
| [automation-runtime-staleness.md](./automation-runtime-staleness.md) | 改了卻沒生效：程式從 publisher checkout 跑、cron 一律 UTC、.sh/server 改完要 pull |
| [auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md) | 發佈正確性坑：worktree 要先 build、publishDate 用系統時間蓋、多工不序列化用自癒重試、持續事件滾動更新同一篇；§F 一篇缺封面 webp 會讓 check:links 擋掉整條共用部署佇列、連累別線排程文，要在進 main 前攔（validate-content 升 error）；**§G 過期的護欄（為已移除的 timeout 而設的時間預算）會變減產器、把去重放在最貴的那一端＝整晚燒在 SKIP 上，故障不可當成模型的判斷** |
| [annual-observance-scheduling.md](./annual-observance-scheduling.md) | 年度紀念日產線：`status: scheduled` 不會自己上線（`isPublic` 比對 build 當下時間，6 小時 cron 對不上 06:17，要另排一支準點戳 deploy 的 cron）；「時間戳準」與「可見時刻準」二選一；坊間紀念日對照表三筆過期/錯誤（癲癇日、高血壓日、肥胖日），照抄會每年錯一次；「提前 N 天寫」掃單日會沒有重試能力，要掃區間＋冪等帳本；浮動日期要寫成規則不能寫死 |
| [commit-hygiene-shared-checkout.md](./commit-hygiene-shared-checkout.md) | 共用 checkout 別把別人 WIP 掃進 commit：只 stage 文章產物 / 用 pathspec |
| [weekly-report-mobile-layout.md](./weekly-report-mobile-layout.md) | 週報手機排版崩掉：模型手刻多欄塞一行；版面收歸決定論渲染器，模型只填數據+notes |
| [deterministic-fetch-llm-only-writes.md](./deterministic-fetch-llm-only-writes.md) | 自動線抓資料別交給 LLM agent（慢/發散翻頁/燒額度）；改固定抓→LLM 只寫；exit124 是逾時非額度、cron 別擠同一 5h session 視窗 |
| [youtube-video-digest.md](./youtube-video-digest.md) | 「影片變文章」拿不到逐字稿：主機 IP 被 YouTube 擋（yt-dlp 五種 client 全掛）、台灣媒體站對境外 403；改用官方頻道 RSS 當線索＋≥2 個獨立來源交叉查證才寫（否則 SKIP＝洗稿防線），影片用本地縮圖 facade 不嵌 iframe 保 CLS 0；「我已經有某工具」要在主機驗證 |
| [article-draft-consumer.md](./article-draft-consumer.md) | /admin 寫作任務有生產端沒消費端：`article-draft` issue 靜默孤兒化；補消費端用 newsroom `--stage` 開 PR、kind=factual 待審、放寬分類白名單給真人下單 |
| [newsroom-photoreal-people-image-port.md](./newsroom-photoreal-people-image-port.md) | newsroom 人物圖移植 agent.writer 的擬真攝影流程（sonnet 展開 prompt + haiku 視覺自檢 + 不合格重生）；概念圖刻意維持插畫、全程 fail-open、每張多 1 sonnet+1 haiku，worker quality 待部署 |
| [image-realism-system.md](./image-realism-system.md) | 拼貼概念封面套版被點名：生成全面改超寫實新聞攝影（反拼貼硬條款＋seed 多樣性輪轉）、圖庫過 Haiku 審查（相關度＋外國臉孔淘汰）、圖說「（示意圖）」、圖表統一 chart-spec 原生 SVG 禁生圖模型、白名單擴充 gov.tw |

**內容 / 查證**
| 篇目 | 一句話 |
|---|---|
| [link-and-content-validation.md](./link-and-content-validation.md) | 連結查證與內容檢查的假陽性：bot 擋、IPv6 要 curl -4、regex 截斷、legal 誤報、引號不一致 |
| [wp-migration-broken-inline-html.md](./wp-migration-broken-inline-html.md) | 76 篇 wp-* 帶遷移破損 inline HTML（頂部重複 FAQ／巢狀 table／blockquote 內 hr），build+check:links 看不到；確定性腳本掃修＋dist 驗收 |
| [content-refs-and-local-build-parity.md](./content-refs-and-local-build-parity.md) | 主題/專欄 `articles:` 反查 frontmatter slug 非檔名；本機只跑 astro build 會跳過 prebuild 的 validate:content 硬 gate、錯誤等 CI 才爆；validate-content.mjs 原在 Windows（反斜線路徑）噴滿江紅假錯、已改 split(/[\\/]/) |
| [tag-and-terminology-hygiene.md](./tag-and-terminology-hygiene.md) | 標籤 86% 是碎標籤、重點是把同義／英文縮寫（TSMC→台積電、TFDA→食藥署…）收斂到 canonical 別稀釋集群；掃中國用語一律 context-aware，代碼/用戶/激活/網絡多為合法，全域 sed 會改錯，全站真錯只有存儲/美聯儲 |
| [faq-markdown-links-mobile-overflow.md](./faq-markdown-links-mobile-overflow.md) | FAQ 用 Markdown `[](url)` 寫在原生 `<p>` 裡不渲染、露裸網址，長網址在手機撐破版面；改 `<a href>` ＋ `.article-body` overflow-wrap/表格橫捲安全網；驗收用 chromium 量 scrollWidth |
| [ai-tone-gate.md](./ai-tone-gate.md) | 去 AI 腔一直只是寫作 prompt 的自檢指示、全站三道硬 gate 沒一道讀正文，「免得你覺得我在夾帶」才會上線；正文文風 regex 誤判極高（破折號 123 篇存量），解法＝只掃改動檔＋ERROR 只擋零誤判簽名句／語氣類留 WARN，build 與 newsroom-write 兩點各接 |

> 更早的一次性遷移紀錄另見 [`../../MIGRATION_NOTES.md`](../../MIGRATION_NOTES.md)（WordPress → Astro，2026-06-09 當時快照）。
> 更多尚未整理成正本的踩坑，散在 Claude 本地記憶（`~/.claude/projects/-root-appi-news/memory/`），可逐步提煉成這裡的正本。
