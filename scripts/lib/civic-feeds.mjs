// 全台縣市政府「便民市政」RSS 來源配置 ＋ 便民措施關鍵字初篩（純資料/純函式）。
//
// 可用性註記（2026-07-20 從本機日本 Osaka 出口實測）：
//   ✅ reachable=true：本機 curl -4 直接 200 + 標準 RSS，現在就用。
//   ❌ reachable=false：本機（非台灣 IP）被 geo/IPv6/bot/TLS 擋，抓不到。feed 多半存在，
//      日後若接台灣境內 proxy 再把 reachable 打開即可（fetch 端會自動跳過 reachable:false）。
//   花蓮／彰化：確認無公開 RSS，不列。
// 便民措施「絕大多數縣市無專屬分類」→ 統一靠關鍵字初篩（高召回）＋ LLM 精挑，不靠 per-feed 分類。

export const CIVIC_FEEDS = [
  // ── 本機可直接抓 ──
  { area: '臺北市', reachable: true, url: 'https://www.gov.taipei/OpenData.aspx?SN=7DEC7150E6BAD606' },
  { area: '新北市', reachable: true, url: 'https://www.ntpc.gov.tw/LatestNews' },
  { area: '桃園市', reachable: true, url: 'https://news.tycg.gov.tw/OpenData.aspx?SN=65C6B1AA38BDD145' },
  { area: '臺中市', reachable: true, url: 'https://www.taichung.gov.tw/10179/564770/rss?nodeId=9962' },
  { area: '臺南市', reachable: true, url: 'https://www.tainan.gov.tw/OpenData.aspx?SN=0C669D9634F511BC' },
  { area: '高雄市', reachable: true, url: 'https://www.kcg.gov.tw/OpenData.aspx?SN=D33B55D537402BAA' },
  { area: '基隆市', reachable: true, url: 'https://www.klcg.gov.tw/tw/klcg1/3170-RSS.html' },
  { area: '屏東縣', reachable: true, url: 'https://www.pthg.gov.tw/Rss_News.aspx?n=EC690F93E81FF22D' },
  { area: '宜蘭縣', reachable: true, url: 'https://www.e-land.gov.tw/OpenData.aspx?SN=7E7F28876E1CB175' },
  { area: '南投縣', reachable: true, url: 'https://www.nantou.gov.tw/big5/news2rss.php' },
  { area: '嘉義市', reachable: true, url: 'https://www.chiayi.gov.tw/OpenData.aspx?SN=880E46BF63C27EC0' }, // 本機偶爾逾時，抓不到自動略過
  // ── 本機（非台灣 IP）抓不到，待台灣 proxy ──
  { area: '新竹市', reachable: false, url: 'https://www.hccg.gov.tw/hccg/app/rss?lang=ch&folderName=hccg&id=30122' }, // Cloudflare JS 挑戰
  { area: '新竹縣', reachable: false, url: 'https://www.hsinchu.gov.tw/News_rss.aspx?n=153&sms=8603' },              // IPv6-only/GSN
  { area: '苗栗縣', reachable: false, url: 'https://www.miaoli.gov.tw/News_rss.aspx?n=285&sms=9462' },               // IPv6-only/GSN
  { area: '雲林縣', reachable: false, url: 'https://www.yunlin.gov.tw/rss/' },                                        // bot 封鎖
  { area: '臺東縣', reachable: false, url: 'https://www.taitung.gov.tw/Rss_News.aspx?n=E4FA0485B2A5071E' },          // 境外封鎖
  { area: '金門縣', reachable: false, insecure: true, url: 'https://www.kinmen.gov.tw/OpenData.aspx?SN=20C1A3DAF6A74FCE' }, // TLS 中繼憑證不全
];

// 便民措施正面訊號（標題初篩，寬鬆納入；最終由 LLM 精挑）。
export const CIVIC_POSITIVE = [
  '便民', '為民服務', '申辦', '申請', '線上', '預約', '掛號', '繳費', '繳稅', '規費', '退費',
  '補助', '津貼', '獎助', '育兒', '托育', '敬老', '長照', '送餐', '據點', '諮詢', '免費',
  '開辦', '試辦', '上路', '啟用', '通車', '增設', '增班', '加開', '延長', '受理', '換發',
  '代辦', '到府', '行動', '一站式', '窗口', '便利', '數位', 'APP', '平台', '減免', '優惠',
  '加碼', '轉乘', '公車', '捷運', '停車', '無障礙', '疫苗', '篩檢', '健檢', '關懷', '措施', '服務',
];

// 明確排除（典禮/表揚/競賽/首長行程/災防公告等，非便民措施）。先排除、再看正面詞（同警消手法）。
export const CIVIC_EXCLUDE = [
  '表揚', '頒獎', '得獎', '獲獎', '奪冠', '冠軍', '錦標', '競賽', '比賽', '徵選', '甄選',
  '招標', '決標', '標案', '開幕', '揭幕', '剪綵', '啟動儀式', '典禮', '記者會', '座談', '研習',
  '參訪', '視察', '行程', '出席', '致詞', '蒞臨', '施政成果', '招商', '媒合', '簽約', 'MOU',
  '花絮', '嘉年華', '演唱', '音樂會', '展覽', '特展', '燈會', '煙火', '市長', '縣長', '局長',
  '議員', '人事', '布達', '就職', '災情', '地震', '颱風', '豪雨', '停班', '停課', '訃', '公祭',
];

/** 便民措施初篩：先排除典禮/表揚/首長行程，再要求含正面便民詞。 */
export function isCivicService(title = '') {
  const t = String(title);
  if (CIVIC_EXCLUDE.some((k) => t.includes(k))) return false;
  return CIVIC_POSITIVE.some((k) => t.includes(k));
}
