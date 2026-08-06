import { describe, it, expect } from 'vitest';
import {
  isPolitical,
  parsePush,
  decodeEntities,
  parseBoardIndex,
  normalizeKey,
  isNoiseTitle,
  collectCandidates,
  filterUnseen,
  mergeSeen,
  BOARDS,
} from './forum-signals.mjs';

describe('政治過濾（第二層）', () => {
  it('擋政黨與政治人物', () => {
    expect(isPolitical('[新聞] 賴清德回擊盧秀燕：食安破口在台中')).toBe(true);
    expect(isPolitical('[討論] 民進黨這次選舉會不會輸')).toBe(true);
    expect(isPolitical('[新聞] 立委質詢時說了什麼')).toBe(true);
    expect(isPolitical('[問卦] 大罷免結果出爐')).toBe(true);
  });

  it('擋國際政治', () => {
    expect(isPolitical('[新聞] 川普宣布新關稅')).toBe(true);
    expect(isPolitical('[國際] 俄烏停火談判進度')).toBe(true);
  });

  it('**不擋**行政機關的監理與便民作為（那是財經/生活的正當題材）', () => {
    expect(isPolitical('[新聞] 金管會加碼要求銀行 民眾理財周轉金貸款')).toBe(false);
    expect(isPolitical('[情報] 衛福部公布新版流感疫苗接種對象')).toBe(false);
    expect(isPolitical('[新聞] 勞動部調整基本工資試算')).toBe(false);
  });

  it('不擋一般生活與科技題', () => {
    expect(isPolitical('[討論] 摺疊機到底有什麼很實用的地方啊？')).toBe(false);
    expect(isPolitical('[情報] 全家app 拿鐵買一送一')).toBe(false);
  });
});

describe('推文數解析', () => {
  it('爆 → 100、噓 → -1、空 → 0', () => {
    expect(parsePush('爆')).toBe(100);
    expect(parsePush('X5')).toBe(-1);
    expect(parsePush('XX')).toBe(-1);
    expect(parsePush('')).toBe(0);
    expect(parsePush('  ')).toBe(0);
    expect(parsePush('37')).toBe(37);
  });
});

describe('HTML entity 解碼', () => {
  it('處理 PTT 標題常見的 entity', () => {
    expect(decodeEntities('使用前請閱讀板&#34;龜&#34;')).toBe('使用前請閱讀板"龜"');
    expect(decodeEntities('A&amp;B')).toBe('A&B');
    expect(decodeEntities('&lt;script&gt;')).toBe('<script>');
  });
});

describe('看板索引解析', () => {
  const html = `
    <div class="r-ent">
      <div class="nrec"><span class="hl f1">爆</span></div>
      <div class="title"><a href="/bbs/Stock/M.1.A.html">[新聞] 台積電法說會重點</a></div>
      <div class="meta"><div class="date"> 8/06</div></div>
    </div>
    <div class="r-ent">
      <div class="nrec"><span class="hl f3">37</span></div>
      <div class="title"><a href="/bbs/Stock/M.2.A.html">[情報] 某某公司財報</a></div>
      <div class="meta"><div class="date"> 8/05</div></div>
    </div>
    <div class="r-ent">
      <div class="nrec"></div>
      <div class="title">(本文已被刪除)</div>
      <div class="meta"><div class="date"> 8/05</div></div>
    </div>`;

  it('抽出推文數、標題、絕對網址、日期', () => {
    const rows = parseBoardIndex(html);
    expect(rows).toHaveLength(2); // 已刪除的略過
    expect(rows[0]).toMatchObject({ push: 100, title: '[新聞] 台積電法說會重點' });
    expect(rows[0].href).toBe('https://www.ptt.cc/bbs/Stock/M.1.A.html');
    expect(rows[0].date).toBe('8/06');
    expect(rows[1].push).toBe(37);
  });

  it('空 HTML 回空陣列，不丟例外', () => {
    expect(parseBoardIndex('')).toEqual([]);
    expect(parseBoardIndex(null)).toEqual([]);
  });
});

describe('去重鍵正規化', () => {
  it('Re: 串與本文收斂成同一個 key', () => {
    expect(normalizeKey('[閒聊] 摺疊機到底實用在哪')).toBe(
      normalizeKey('Re: [閒聊] 摺疊機到底實用在哪'),
    );
  });

  it('標點與空白不影響', () => {
    expect(normalizeKey('[新聞] 顯卡，正式開漲！')).toBe(normalizeKey('[新聞] 顯卡正式開漲'));
  });

  it('不同題目不會撞 key', () => {
    expect(normalizeKey('[問題] 蛋白質要吃多少')).not.toBe(normalizeKey('[問題] 顯卡要買哪張'));
  });
});

describe('噪音過濾', () => {
  it('擋板務、交易、廣告', () => {
    expect(isNoiseTitle('[公告] 板規更新')).toBe(true);
    expect(isNoiseTitle('[黑名] 黑名單 abc 棄單')).toBe(true);
    expect(isNoiseTitle('[廣宣] 回饋台中鄉里 分離式冷氣清洗')).toBe(true);
    expect(isNoiseTitle('[NBA] NBA板主徵選即將開始')).toBe(true);
  });

  it('擋賽事即時串與逐日例行文', () => {
    expect(isNoiseTitle('[LIVE] CPBL例行賽#244 富邦 VS 中信兄弟')).toBe(true);
    expect(isNoiseTitle('[炸裂] 莎菈 滿貫砲')).toBe(true);
    expect(isNoiseTitle('[花邊] Jaylen Brown：徵婆')).toBe(true);
    expect(isNoiseTitle('[分享] CPBL戰績')).toBe(true);
  });

  it('擋股市逐日例行統計', () => {
    expect(isNoiseTitle('[閒聊] 2026/08/06 盤中閒聊')).toBe(true);
    expect(isNoiseTitle('[情報] 0805 上市外資買賣超排行')).toBe(true);
    expect(isNoiseTitle('[情報] 115年08月05日 三大法人買賣金額統計表')).toBe(true);
  });

  it('**不擋**真正可寫的題', () => {
    expect(isNoiseTitle('[討論] 摺疊機到底有什麼很實用的地方啊？')).toBe(false);
    expect(isNoiseTitle('[新聞] 宇樹機器人給活豬動手術')).toBe(false);
    expect(isNoiseTitle('[討論] 大家一天都吃多少蛋白質')).toBe(false);
    expect(isNoiseTitle('[情報] 全家app 拿鐵買一送一')).toBe(false);
  });
});

describe('collectCandidates（注入 fetch，不打網路）', () => {
  const mkHtml = (rows) =>
    rows
      .map(
        ([push, title]) => `
    <div class="r-ent">
      <div class="nrec"><span class="hl f1">${push}</span></div>
      <div class="title"><a href="/bbs/X/${encodeURIComponent(title)}.html">${title}</a></div>
      <div class="meta"><div class="date"> 8/06</div></div>
    </div>`,
      )
      .join('');

  const boards = [
    { board: 'MobileComm', category: 'tech', minPush: 20 },
    { board: 'Tainan', category: 'lifestyle', minPush: 15, local: true },
  ];

  it('套門檻、過濾政治與噪音、標記 local', async () => {
    const fetchImpl = async (url) => ({
      ok: true,
      text: async () =>
        url.includes('MobileComm')
          ? mkHtml([
              [87, '[討論] 摺疊機到底實用在哪'],
              [5, '[問題] 推文太少應該被門檻擋掉'],
              [50, '[公告] 板規更新'],
            ])
          : mkHtml([
              [40, '[問題] 台南哪裡買得到蟑螂藥'],
              [99, '[新聞] 賴清德回擊盧秀燕'],
            ]),
    });

    const { candidates, failures, scanned } = await collectCandidates({ boards, fetchImpl });
    expect(scanned).toBe(2);
    expect(failures).toEqual([]);
    const titles = candidates.map((c) => c.title);
    expect(titles).toContain('[討論] 摺疊機到底實用在哪');
    expect(titles).toContain('[問題] 台南哪裡買得到蟑螂藥');
    expect(titles).not.toContain('[問題] 推文太少應該被門檻擋掉'); // 門檻
    expect(titles).not.toContain('[公告] 板規更新'); // 噪音
    expect(titles).not.toContain('[新聞] 賴清德回擊盧秀燕'); // 政治
    expect(candidates.find((c) => c.board === 'Tainan').local).toBe(true);
    expect(candidates.find((c) => c.board === 'MobileComm').local).toBe(false);
  });

  it('單板抓取失敗只記 failures，不影響其他板', async () => {
    const fetchImpl = async (url) =>
      url.includes('Tainan')
        ? { ok: false, status: 503 }
        : { ok: true, text: async () => mkHtml([[87, '[討論] 摺疊機到底實用在哪']]) };

    const { candidates, failures } = await collectCandidates({ boards, fetchImpl });
    expect(candidates).toHaveLength(1);
    expect(failures).toEqual([{ board: 'Tainan', error: 'HTTP 503' }]);
  });

  it('perBoardLimit 限制每板取幾則', async () => {
    const fetchImpl = async () => ({
      ok: true,
      text: async () => mkHtml([[90, '[討論] A題'], [80, '[討論] B題'], [70, '[討論] C題']]),
    });
    const { candidates } = await collectCandidates({
      boards: [boards[0]],
      fetchImpl,
      perBoardLimit: 2,
    });
    expect(candidates).toHaveLength(2);
    expect(candidates.map((c) => c.title)).toEqual(['[討論] A題', '[討論] B題']); // 取推文最高的
  });
});

describe('跨次去重帳本', () => {
  const today = new Date('2026-08-06T00:00:00Z');

  it('濾掉近期看過的題', () => {
    const seen = [{ key: normalizeKey('[討論] 摺疊機到底實用在哪'), date: '2026-08-05' }];
    const cands = [
      { key: normalizeKey('[討論] 摺疊機到底實用在哪'), title: 'A' },
      { key: normalizeKey('[討論] 蛋白質吃多少'), title: 'B' },
    ];
    expect(filterUnseen(cands, seen, today).map((c) => c.title)).toEqual(['B']);
  });

  it('超過比對窗的舊紀錄不再擋（題目可以重新被提）', () => {
    const seen = [{ key: normalizeKey('[討論] 摺疊機到底實用在哪'), date: '2026-07-01' }];
    const cands = [{ key: normalizeKey('[討論] 摺疊機到底實用在哪'), title: 'A' }];
    expect(filterUnseen(cands, seen, today)).toHaveLength(1);
  });

  it('帳本壞掉/空的時候全部放行（寧可重推，不要整條啞掉）', () => {
    const cands = [{ key: 'k1', title: 'A' }];
    expect(filterUnseen(cands, [], today)).toHaveLength(1);
  });

  it('mergeSeen 併入新題並砍掉過期紀錄', () => {
    const seen = [
      { key: 'old', date: '2026-05-01' }, // 超過保留期
      { key: 'keep', date: '2026-08-01' },
    ];
    const merged = mergeSeen(seen, [{ key: 'new', title: 'N', board: 'B' }], today);
    const keys = merged.map((s) => s.key);
    expect(keys).toContain('keep');
    expect(keys).toContain('new');
    expect(keys).not.toContain('old');
  });

  it('mergeSeen 不重複記同一個 key', () => {
    const seen = [{ key: 'k', date: '2026-08-01' }];
    const merged = mergeSeen(seen, [{ key: 'k', title: 'X', board: 'B' }], today);
    expect(merged.filter((s) => s.key === 'k')).toHaveLength(1);
  });
});

describe('看板白名單本身就是第一層政治過濾', () => {
  it('政治板不在白名單裡', () => {
    const names = BOARDS.map((b) => b.board);
    for (const banned of ['Gossiping', 'HatePolitics', 'Military', 'PublicServan']) {
      expect(names).not.toContain(banned);
    }
  });

  it('每個看板都有合法分類與正數門檻', () => {
    const valid = new Set(['tech', 'finance', 'health', 'lifestyle', 'international', 'sports']);
    for (const b of BOARDS) {
      expect(valid.has(b.category)).toBe(true);
      expect(b.minPush).toBeGreaterThan(0);
    }
  });
});
