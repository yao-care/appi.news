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
| [high-impression-zero-click-bot-queries.md](./high-impression-zero-click-bot-queries.md) | 高曝光零點擊不一定是 SEO 問題：氣象 App／通知的模板化查詢（非人類），改標題永遠 0 點擊，該「滅燈」不是優化；附裝置別查證法＋兩消費端 mute 機制 |
| [google-indexing-api-gray-area.md](./google-indexing-api-gray-area.md) | 「有 GSC key 就能催收錄」是誤解；Indexing API 對新聞站非官方、200 不保證收錄 |
| [google-news-surfaces-and-cover-image.md](./google-news-surfaces-and-cover-image.md) | Google News 2025-03 起不吃提交的 feed/section（自動抓取）；JSON-LD/og 圖指原圖非 900 顯示圖，封面 ≥1200 從來源端解 |
| [wordpress-date-permalink-404.md](./wordpress-date-permalink-404.md) | 舊 WordPress 日期網址漏接轉址變 404，仍在流失 Google 曝光 |
| [domain-change-worker-cors.md](./domain-change-worker-cors.md) | 換網域漏改 Cloudflare Worker 的 ALLOWED_ORIGIN → 編輯器「Failed to fetch」 |

**自動化 / 發佈 / git**
| 篇目 | 一句話 |
|---|---|
| [automation-model-and-account-split.md](./automation-model-and-account-split.md) | 帳號切換洗掉排程行＋全 Opus 燒爆週額度＋claude-appi 撞限額會 exit 0：cron 一律帶 --model、判成功不能只看 exit code；續：偵測到限額只 continue → 逐項批次變 24 次空打，須遇限額即 break 中止整批 |
| [automation-runtime-staleness.md](./automation-runtime-staleness.md) | 改了卻沒生效：程式從 publisher checkout 跑、cron 一律 UTC、.sh/server 改完要 pull |
| [auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md) | 發佈正確性坑：worktree 要先 build、publishDate 用系統時間蓋、多工不序列化用自癒重試、持續事件滾動更新同一篇；§F 一篇缺封面 webp 會讓 check:links 擋掉整條共用部署佇列、連累別線排程文，要在進 main 前攔（validate-content 升 error） |
| [commit-hygiene-shared-checkout.md](./commit-hygiene-shared-checkout.md) | 共用 checkout 別把別人 WIP 掃進 commit：只 stage 文章產物 / 用 pathspec |
| [weekly-report-mobile-layout.md](./weekly-report-mobile-layout.md) | 週報手機排版崩掉：模型手刻多欄塞一行；版面收歸決定論渲染器，模型只填數據+notes |
| [deterministic-fetch-llm-only-writes.md](./deterministic-fetch-llm-only-writes.md) | 自動線抓資料別交給 LLM agent（慢/發散翻頁/燒額度）；改固定抓→LLM 只寫；exit124 是逾時非額度、cron 別擠同一 5h session 視窗 |
| [article-draft-consumer.md](./article-draft-consumer.md) | /admin 寫作任務有生產端沒消費端：`article-draft` issue 靜默孤兒化；補消費端用 newsroom `--stage` 開 PR、kind=factual 待審、放寬分類白名單給真人下單 |

**內容 / 查證**
| 篇目 | 一句話 |
|---|---|
| [link-and-content-validation.md](./link-and-content-validation.md) | 連結查證與內容檢查的假陽性：bot 擋、IPv6 要 curl -4、regex 截斷、legal 誤報、引號不一致 |
| [wp-migration-broken-inline-html.md](./wp-migration-broken-inline-html.md) | 76 篇 wp-* 帶遷移破損 inline HTML（頂部重複 FAQ／巢狀 table／blockquote 內 hr），build+check:links 看不到；確定性腳本掃修＋dist 驗收 |
| [content-refs-and-local-build-parity.md](./content-refs-and-local-build-parity.md) | 主題/專欄 `articles:` 反查 frontmatter slug 非檔名；本機只跑 astro build 會跳過 prebuild 的 validate:content 硬 gate、錯誤等 CI 才爆；validate-content.mjs 原在 Windows（反斜線路徑）噴滿江紅假錯、已改 split(/[\\/]/) |
| [tag-and-terminology-hygiene.md](./tag-and-terminology-hygiene.md) | 標籤 86% 是碎標籤、重點是把同義／英文縮寫（TSMC→台積電、TFDA→食藥署…）收斂到 canonical 別稀釋集群；掃中國用語一律 context-aware，代碼/用戶/激活/網絡多為合法，全域 sed 會改錯，全站真錯只有存儲/美聯儲 |

> 更早的一次性遷移紀錄另見 [`../../MIGRATION_NOTES.md`](../../MIGRATION_NOTES.md)（WordPress → Astro，2026-06-09 當時快照）。
> 更多尚未整理成正本的踩坑，散在 Claude 本地記憶（`~/.claude/projects/-root-appi-news/memory/`），可逐步提煉成這裡的正本。
