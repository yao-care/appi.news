// 健康紀念日年曆（單一事實來源）＋日期解析器。純函式、無 I/O，可單元測試。
//
// 用途：每年固定的健康／醫事紀念日，在 T-2 天由 cron 抓「當年度最新素材」寫成一篇文章，
// 排到當天台北 06:17 上線。協調器＝scripts/health-days.mjs，cron 包裝＝scripts/cron/health-days.sh。
//
// 【日期規則兩種】
//   固定日   { md: 'MM-DD' }
//   浮動日   { month, weekday, nth }   weekday 0=週日…6=週六；nth 為 1..4 或 'last'
//
// 【資料來源與查證（2026-07-28 建表時逐條核對）】
//   - 台灣醫事人員節日：衛福部依《紀念日及節日實施條例》公告之「所定紀念日及節日由來說明」（21 項核定）。
//   - 國際紀念日：各發起組織官網（WHO／UICC／IDF／WHL／IBE＋ILAE…）。
//   - ⚠️ 坊間流傳的「月旦醫事法網·世界醫療相關紀念日」對照表有三處過期／錯誤，本表已修正，勿照抄：
//       世界癲癇日   該表 2/14      → 實為 2 月第二個星期一（IBE＋ILAE，2015 年起）
//       世界高血壓日 該表 5 月第二個星期六 → 實為 5/17（WHL 自 2006 年起改固定日）
//       世界肥胖日   該表 10/11     → 實為 3/4（世界肥胖聯盟 2020 年起變更；10/11 是 2015-2019 舊制）
//
// 【用語鐵則】本表的 name 一律用台灣正式譯名：漢生病（非「痲瘋」，該日主旨即消除污名）、
//   阿茲海默症（非「阿爾茨海默病」）、帕金森氏症（非「帕金森病」）、自閉症「意識」日（聯合國正式名）。

/**
 * 一天可以有多個主題（例：11/12 同時是台灣醫師節與世界肺炎日），resolve 結果為陣列。
 *
 * img＝生圖的畫面主題（英文，餵 get-image.mjs --generate --topic）。本線一律 OpenAI 生圖不用圖庫，
 * 原因見檔頭。這串刻意寫死在表裡而非讓模型每年自由發揮：51 篇 × 每年一輪，模型自由下主題會漂移成
 * 全站都是同幾張聽診器；寫死才能讓同一個紀念日歷年維持同一視覺主軸，年度差異交給 --context/--caption。
 */
export const HEALTH_DAYS = [
  // ── 1 月 ────────────────────────────────────────────────────────────
  {
    slug: 'medical-laboratory-scientists-day',
    name: '醫事檢驗師節',
    en: 'Medical Laboratory Scientists Day (Taiwan)',
    rule: { md: '01-14' },
    org: '中華民國醫事檢驗師公會全國聯合會（衛福部核定）',
    angle: '紀念民國 89 年 1 月 14 日《醫事檢驗師法》三讀通過。寫醫檢師在診斷鏈中的角色、人力與健保給付現況、檢驗自動化與 AI 判讀帶來的變化。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '健檢報告'],
    img: 'medical laboratory test tubes analyzer',
  },
  {
    slug: 'pharmacists-day-taiwan',
    name: '藥師節',
    en: "Pharmacists' Day (Taiwan)",
    rule: { md: '01-15' },
    org: '衛福部核定（民國 18 年 1 月 15 日《藥師暫行條例》公布）',
    angle: '紀念《藥師暫行條例》確立「藥師」職業名稱。寫社區藥局角色、分級醫療與慢箋、藥事照護與用藥安全的最新政策。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '醫病關係'],
    img: 'pharmacy shelves medicine boxes dispensing',
  },
  {
    slug: 'world-leprosy-day',
    name: '世界防治漢生病日',
    en: 'World Leprosy Day',
    rule: { month: 1, weekday: 0, nth: 'last' },
    org: '世界衛生組織（WHO）',
    angle: '提高認識、消除歧視。台灣視角務必寫樂生療養院與漢生病患者人權補償的後續。用語鐵則：一律「漢生病」，不得用污名化的「痲瘋」。',
    category: 'health',
    sub: 'health-policy',
    tags: ['傳染病防治', '醫療政策'],
    img: 'community clinic outreach bandaged hands',
  },

  // ── 2 月 ────────────────────────────────────────────────────────────
  {
    slug: 'world-cancer-day',
    name: '世界癌症日',
    en: 'World Cancer Day',
    rule: { md: '02-04' },
    org: '國際抗癌聯盟（UICC）',
    angle: 'UICC 每年有三年一期的主題，務必抓當年度主題。台灣素材：國健署最新癌症登記報告、四癌／五癌篩檢涵蓋率、標靶與免疫治療給付進展。',
    category: 'health',
    sub: 'medical',
    tags: ['癌症防治', '預防醫學'],
    img: 'oncology infusion clinic chemotherapy equipment',
  },
  {
    slug: 'world-day-of-the-sick',
    name: '世界病人日',
    en: 'World Day of the Sick',
    rule: { md: '02-11' },
    org: '天主教會（教宗若望保祿二世於 1992 年設立）',
    angle: '具宗教性質（2/11 為露德聖母顯現日），寫作宜以「關懷病患、醫療中的靈性照顧」為軸，帶到台灣安寧緩和、醫院牧靈關懷與病人自主權利法。避免傳教語氣。',
    category: 'health',
    sub: 'medical',
    tags: ['醫病關係', '長照'],
    img: 'hospital bedside hands care blanket',
  },
  {
    slug: 'international-epilepsy-day',
    name: '世界癲癇日',
    en: 'International Epilepsy Day',
    rule: { month: 2, weekday: 1, nth: 2 },
    org: '國際癲癇署（IBE）與國際抗癲癇聯盟（ILAE），2015 年起',
    angle: '提高認識、改善患者生活。台灣素材：癲癇患者就學就業歧視、駕照規範、新型抗癲癇藥物給付與難治型癲癇手術。注意日期是浮動的 2 月第二個星期一。',
    category: 'health',
    sub: 'medical',
    tags: ['醫療政策', '身心障礙'],
    img: 'eeg brain scan neurology electrodes',
  },
  {
    slug: 'dietitians-day-taiwan',
    name: '營養師節',
    en: "Dietitians' Day (Taiwan)",
    rule: { md: '02-22' },
    org: '中華民國營養師公會全國聯合會（衛福部核定）',
    angle: '222 諧音「餓餓餓」，1999 年起。寫營養師在醫院、長照、學校營養午餐與運動營養的角色，帶到最新國民營養健康狀況變遷調查。',
    category: 'health',
    sub: 'nutrition',
    tags: ['營養', '醫事人力'],
    img: 'balanced meal plate vegetables nutrition',
  },

  // ── 3 月 ────────────────────────────────────────────────────────────
  {
    slug: 'world-obesity-day',
    name: '世界肥胖日',
    en: 'World Obesity Day',
    rule: { md: '03-04' },
    org: '世界肥胖聯盟（World Obesity Federation）',
    angle: '⚠️ 2020 年起由 10/11 改為 3/4，勿沿用舊日期。每年有官方主題。台灣素材：國健署成人與兒童肥胖盛行率、減重藥物（GLP-1）給付與濫用爭議、代謝手術。',
    category: 'health',
    sub: 'preventive',
    tags: ['代謝健康', '減重管理'],
    img: 'weighing scale measuring tape health',
  },
  {
    slug: 'world-kidney-day',
    name: '世界腎臟病日',
    en: 'World Kidney Day',
    rule: { month: 3, weekday: 4, nth: 2 },
    org: '國際腎臟醫學會（ISN）與國際腎臟基金會聯合會（IFKF）',
    angle: '每年有官方主題。台灣是洗腎盛行率長年名列世界前段的國家，務必帶健保透析支出、慢性腎臟病早期篩檢、SGLT2 抑制劑等腎臟保護用藥給付。',
    category: 'health',
    sub: 'medical',
    tags: ['肝腎健康', '預防醫學'],
    img: 'dialysis machine hospital ward',
  },
  {
    slug: 'chinese-medicine-day-taiwan',
    name: '國醫節',
    en: 'Chinese Medicine Day (Taiwan)',
    rule: { md: '03-17' },
    org: '衛福部核定（紀念民國 18 年 3 月 17 日中醫界抗議成功）',
    angle: '紀念中醫界反制「廢止舊醫案」的全國抗議。寫中醫在台灣醫療體系的定位、中醫健保給付、中西醫合療與科學中藥的實證進展。',
    category: 'health',
    sub: 'tcm-integrative',
    tags: ['中醫', '醫療政策'],
    img: 'traditional chinese medicine herbs wooden drawers',
  },
  {
    slug: 'international-womens-day-health',
    name: '國際婦女節',
    en: "International Women's Day",
    rule: { md: '03-08' },
    org: '聯合國',
    angle: '本站切入點為女性健康而非泛論性別議題：性別醫療落差、女性心血管疾病被低估、更年期照護、乳癌與子宮頸癌篩檢、女性醫師與護理人力處境。聯合國每年有官方主題。',
    category: 'health',
    sub: 'preventive',
    tags: ['女性健康', '預防醫學'],
    img: 'womens health clinic examination room',
  },
  {
    slug: 'world-oral-health-day',
    name: '世界口腔健康日',
    en: 'World Oral Health Day',
    rule: { md: '03-20' },
    org: '世界牙醫聯盟（FDI）',
    angle: 'FDI 每年有官方主題。台灣素材：兒童塗氟與窩溝封填給付、成人牙周病統合照護、口腔癌與檳榔防制、長者假牙補助。',
    category: 'health',
    sub: 'medical',
    tags: ['口腔健康', '醫事人力'],
    img: 'dental clinic instruments toothbrush',
  },
  {
    slug: 'optometrists-day-taiwan',
    name: '驗光師節',
    en: "Optometrists' Day (Taiwan)",
    rule: { md: '03-23' },
    org: '中華民國驗光師公會全國聯合會（衛福部核定，對應世界驗光日）',
    angle: '呼應國際驗光與光學聯盟訂的世界驗光日。寫台灣兒童近視盛行率、驗光師法上路後的職權分工、高度近視併發症與護眼政策。',
    category: 'health',
    sub: 'medical',
    tags: ['眼睛健康', '醫事人力'],
    img: 'optometry phoropter eye examination',
  },
  {
    slug: 'world-tuberculosis-day',
    name: '世界結核病日',
    en: 'World Tuberculosis Day',
    rule: { md: '03-24' },
    org: '世界衛生組織（WHO）',
    angle: '紀念 1882 年柯霍（Robert Koch）發表發現結核桿菌。台灣素材：疾管署最新結核病發生率、潛伏結核感染治療、抗藥性結核與移工／原鄉防治。',
    category: 'health',
    sub: 'medical',
    tags: ['傳染病防治', '公共衛生'],
    img: 'chest x-ray lungs radiology lightbox',
  },
  {
    slug: 'international-social-work-day',
    name: '國際社工日',
    en: 'World Social Work Day',
    rule: { month: 3, weekday: 2, nth: 3 },
    org: '國際社會工作者聯盟（IFSW）',
    angle: 'IFSW 每年有官方主題。台灣素材：醫務社工在出院準備與長照銜接的角色、社工人力荒與薪資結構、兒少保護與心理衛生社區服務。',
    category: 'health',
    sub: 'health-policy',
    tags: ['醫事人力', '醫療政策'],
    img: 'social worker home visit living room',
  },
  {
    slug: 'international-doctors-day',
    name: '國際醫師節',
    en: "National Doctors' Day",
    rule: { md: '03-30' },
    org: '美國（紀念 1842 年 Crawford Long 完成首例乙醚全身麻醉手術）',
    angle: '注意這是美國起源的紀念日，與台灣 11/12 醫師節不同，寫作要交代清楚。可寫麻醉醫學一百八十年來的演進、台灣麻醉人力短缺與無痛醫療的普及。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '醫病關係'],
    img: 'anesthesia machine operating room monitor',
  },

  // ── 4 月 ────────────────────────────────────────────────────────────
  {
    slug: 'world-autism-awareness-day',
    name: '世界自閉症意識日',
    en: 'World Autism Awareness Day',
    rule: { md: '04-02' },
    org: '聯合國大會',
    angle: '聯合國正式名稱為「意識日」而非「關懷日」。台灣素材：早療資源與等待期、成人自閉症者就業支持、特教與融合教育現況。用「自閉症光譜」，避免「患者」以外的污名詞。',
    category: 'health',
    sub: 'mental-health',
    tags: ['身心障礙', '育兒健康'],
    img: 'wooden blocks therapy room children toys',
  },
  {
    slug: 'world-health-day',
    name: '世界衛生日',
    en: 'World Health Day',
    rule: { md: '04-07' },
    org: '世界衛生組織（WHO）',
    angle: '紀念 WHO 於 1948 年成立，每年有官方主題（務必抓當年度）。台灣視角：我國參與 WHA 的處境、全民健保在全球健康覆蓋（UHC）評比中的位置。國內同日亦為衛福部核定的「衛生節」。',
    category: 'health',
    sub: 'health-policy',
    tags: ['公共衛生', '健保'],
    img: 'public health clinic waiting area',
  },
  {
    slug: 'world-parkinsons-day',
    name: '世界帕金森氏症日',
    en: "World Parkinson's Disease Day",
    rule: { md: '04-11' },
    org: '世界衛生組織（WHO）／歐洲帕金森氏症協會',
    angle: '取 James Parkinson 生日。台灣素材：帕金森氏症盛行率與人口老化、深部腦刺激術（DBS）給付、早期症狀辨識與復健。用語一律「帕金森氏症」。',
    category: 'health',
    sub: 'aging-health',
    tags: ['高齡健康', '失智症'],
    img: 'elderly hands walking cane support',
  },
  {
    slug: 'world-hemophilia-day',
    name: '世界血友病日',
    en: 'World Hemophilia Day',
    rule: { md: '04-17' },
    org: '世界血友病聯盟（WFH）',
    angle: '取聯盟創辦人 Frank Schnabel 生日。WFH 每年有官方主題。台灣素材：凝血因子預防性治療給付、基因治療進展、罕病照護網絡。',
    category: 'health',
    sub: 'medical',
    tags: ['再生醫療', '醫療政策'],
    img: 'blood sample vials hematology laboratory',
  },
  {
    slug: 'earth-day-health',
    name: '世界地球日',
    en: 'Earth Day',
    rule: { md: '04-22' },
    org: '聯合國／EARTHDAY.ORG',
    angle: '本站切入點是環境與人類健康的關聯，不是泛論環保：空污與心肺疾病、極端高溫的健康衝擊與熱急症、醫療體系本身的碳足跡與綠色醫院。每年有官方主題。',
    category: 'health',
    sub: 'preventive',
    tags: ['環境汙染', '氣候變遷', '公共衛生'],
    img: 'city skyline haze air pollution',
  },

  // ── 5 月 ────────────────────────────────────────────────────────────
  {
    slug: 'dentists-day-taiwan',
    name: '牙醫師節',
    en: "Dentists' Day (Taiwan)",
    rule: { md: '05-04' },
    org: '衛福部核定（牙醫師許國雄博士建議，取日文蛀牙「むしば」諧音「五四吧」）',
    angle: '寫台灣牙醫人力城鄉分布、偏鄉巡迴醫療、牙醫健保總額與自費項目界線、數位牙科技術導入。日期由來的諧音典故本身就是好開場。',
    category: 'health',
    sub: 'medical',
    tags: ['口腔健康', '醫事人力'],
    img: 'dentist chair clinic equipment light',
  },
  {
    slug: 'midwives-day-taiwan',
    name: '助產師節',
    en: "Midwives' Day",
    rule: { md: '05-05' },
    org: '國際助產師聯盟（ICM）／中華民國助產師助產士公會全國聯合會（衛福部民國 111 年核定）',
    angle: '台灣助產制度一度幾乎消失後的復甦：助產所接生、友善生產與醫療化生產的拉鋸、少子化下的產科人力。ICM 每年有官方主題。',
    category: 'health',
    sub: 'medical',
    tags: ['女性健康', '醫事人力'],
    img: 'newborn baby hospital nursery blanket',
  },
  {
    slug: 'international-nurses-day',
    name: '國際護師節',
    en: 'International Nurses Day',
    rule: { md: '05-12' },
    org: '國際護理協會（ICN），取南丁格爾生日',
    angle: 'ICN 每年有官方主題。台灣素材是重頭戲：護病比、護理人力流失與缺工、三班護病比獎勵計畫成效、夜班費與職場暴力。台灣官方名稱為「護師節」。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '醫療政策'],
    img: 'hospital nursing station stethoscope clipboard',
  },
  {
    slug: 'clinical-psychologists-day-taiwan',
    name: '臨床心理師節',
    en: 'Clinical Psychologists Day (Taiwan)',
    rule: { md: '05-15' },
    org: '衛福部核定（民國 75 年 5 月 15 日「臨床心理師」職稱首次登載於政府文件）',
    angle: '寫心理治療的可近性：健保給付心理治療的限制、年輕族群心理健康支持方案、企業與校園心理服務、臨床心理師與諮商心理師的分工。',
    category: 'health',
    sub: 'mental-health',
    tags: ['心理健康', '醫事人力'],
    img: 'counseling room armchairs quiet therapy',
  },
  {
    slug: 'world-hypertension-day',
    name: '世界高血壓日',
    en: 'World Hypertension Day',
    rule: { md: '05-17' },
    org: '世界高血壓聯盟（WHL）',
    angle: '⚠️ 2006 年起固定為 5/17，坊間流傳的「5 月第二個星期六」是 2005 年首屆舊制，勿沿用。每年有官方主題。台灣素材：國健署高血壓盛行率與控制率、居家血壓量測 722 原則、新版治療指引。',
    category: 'health',
    sub: 'preventive',
    tags: ['心血管健康', '預防醫學'],
    img: 'blood pressure monitor cuff measurement',
  },
  {
    slug: 'world-thyroid-day',
    name: '世界甲狀腺日',
    en: 'World Thyroid Day',
    rule: { md: '05-25' },
    org: '歐洲甲狀腺學會（ETA）與美國甲狀腺學會（ATA）',
    angle: '甲狀腺疾病好發於女性且易被誤認為壓力或更年期。寫甲狀腺機能亢進／低下的辨識、甲狀腺結節與過度診斷爭議、健檢超音波的取捨。',
    category: 'health',
    sub: 'medical',
    tags: ['甲狀腺', '健檢報告'],
    img: 'thyroid ultrasound neck examination probe',
  },
  {
    slug: 'world-no-tobacco-day',
    name: '世界無菸日',
    en: 'World No Tobacco Day',
    rule: { md: '05-31' },
    org: '世界衛生組織（WHO）',
    angle: 'WHO 每年有官方主題。台灣素材：《菸害防制法》修法後的電子煙全面禁止與加熱菸審查、青少年使用率、戒菸服務給付。與 6/3 禁菸節相隔三天，兩篇角度必須明確區隔（本篇走國際主題與菸品管制）。',
    category: 'health',
    sub: 'preventive',
    tags: ['菸酒檳榔', '公共衛生'],
    img: 'cigarette ashtray quit smoking',
  },

  // ── 6 月 ────────────────────────────────────────────────────────────
  {
    slug: 'anti-smoking-day-taiwan',
    name: '禁菸節',
    en: 'Anti-Smoking Day (Taiwan)',
    rule: { md: '06-03' },
    org: '衛福部核定（紀念 1839 年 6 月 3 日林則徐虎門銷煙）',
    angle: '從虎門銷煙的歷史事件延伸到當代菸品危害。與 5/31 世界無菸日相隔三天，本篇走歷史縱深與台灣本土菸害防制史，不要重複國際主題。',
    category: 'health',
    sub: 'preventive',
    tags: ['菸酒檳榔', '公共衛生'],
    img: 'broken cigarettes no smoking sign',
  },
  {
    slug: 'world-blood-donor-day',
    name: '世界捐血人日',
    en: 'World Blood Donor Day',
    rule: { md: '06-14' },
    org: '世界衛生組織（WHO），取血型發現者 Karl Landsteiner 生日',
    angle: 'WHO 每年有官方主題。台灣素材：血液基金會最新庫存與捐血率、人口老化下的血荒結構性問題、捐血資格規範（如男男性行為者限制）的爭議與修訂。',
    category: 'health',
    sub: 'medical',
    tags: ['公共衛生', '醫療政策'],
    img: 'blood donation bag donor chair',
  },

  // ── 7 月 ────────────────────────────────────────────────────────────
  {
    slug: 'world-hepatitis-day',
    name: '世界肝炎日',
    en: 'World Hepatitis Day',
    rule: { md: '07-28' },
    org: '世界衛生組織（WHO），取 B 肝病毒發現者 Baruch Blumberg 生日',
    angle: 'WHO 每年有官方主題，並訂有 2030 消除病毒性肝炎目標。台灣素材：新生兒 B 肝疫苗接種成果、C 肝口服新藥全面給付後的根除進度、肝癌發生率變化。',
    category: 'health',
    sub: 'medical',
    tags: ['肝腎健康', '傳染病防治'],
    img: 'liver blood test tubes laboratory',
  },

  // ── 8 月 ────────────────────────────────────────────────────────────
  {
    slug: 'world-breastfeeding-week',
    name: '世界母乳哺育週',
    en: 'World Breastfeeding Week',
    rule: { md: '08-01' },
    org: '世界母乳哺育行動聯盟（WABA）、WHO 與 UNICEF',
    angle: '注意這是一「週」（8/1-8/7）而非單日，寫作要交代。每年有官方主題。台灣素材：母嬰親善醫院認證的檢討、職場哺集乳室與育嬰假、母乳庫運作。',
    category: 'health',
    sub: 'nutrition',
    tags: ['女性健康', '育兒健康'],
    img: 'baby bottle breast pump nursery',
  },
  {
    slug: 'international-overdose-awareness-day',
    name: '國際藥物過量意識日',
    en: 'International Overdose Awareness Day',
    rule: { md: '08-31' },
    org: 'Penington Institute（澳洲）發起，全球響應',
    angle: '每年有官方主題。台灣素材：鎮靜安眠藥與 FM2 濫用、新興毒品（依托咪酯、彩虹菸）、納洛酮（naloxone）取得管道、成癮治療與減害政策。避免獵奇與污名化用語。',
    category: 'health',
    sub: 'mental-health',
    tags: ['心理健康', '公共衛生'],
    img: 'prescription pill bottle scattered tablets',
  },

  // ── 9 月 ────────────────────────────────────────────────────────────
  {
    slug: 'physical-therapists-day-taiwan',
    name: '物理治療師節',
    en: 'World Physiotherapy Day',
    rule: { md: '09-08' },
    org: '世界物理治療聯盟（World Physiotherapy）／中華民國物理治療師公會全國聯合會（衛福部核定）',
    angle: '世界物理治療日同日。台灣素材：《物理治療師法》修法後可不經醫囑提供健康促進服務的影響、長照與運動傷害復健需求、物理治療所開業潮。',
    category: 'health',
    sub: 'medical',
    tags: ['復健治療', '醫事人力'],
    img: 'physical therapy rehabilitation equipment gym',
  },
  {
    slug: 'world-suicide-prevention-day',
    name: '世界自殺防治日',
    en: 'World Suicide Prevention Day',
    rule: { md: '09-10' },
    org: '國際自殺防治協會（IASP）與世界衛生組織（WHO）',
    angle: '每三年一期的官方主題。台灣素材：衛福部最新自殺死亡統計、青少年與長者兩個高風險族群、1925 安心專線量能。⚠️ 報導守則硬性要求：不描述自殺方法與地點、不美化、文末必附求助管道（1925、1995、1980）。',
    category: 'health',
    sub: 'mental-health',
    tags: ['心理健康', '公共衛生'],
    img: 'sunrise through window quiet hopeful',
  },
  {
    slug: 'world-patient-safety-day',
    name: '世界病人安全日',
    en: 'World Patient Safety Day',
    rule: { md: '09-17' },
    org: '世界衛生組織（WHO），2019 年起',
    angle: 'WHO 每年有官方主題。台灣素材：醫療品質及病人安全年度目標、病人安全通報系統（TPR）資料、給藥錯誤與手術部位辨識、醫療事故預防及爭議處理法上路後的影響。',
    category: 'health',
    sub: 'health-policy',
    tags: ['醫病關係', '醫療政策'],
    img: 'hospital patient wristband safety checklist',
  },
  {
    slug: 'world-alzheimers-day',
    name: '國際失智症日',
    en: "World Alzheimer's Day",
    rule: { md: '09-21' },
    org: '國際失智症協會（ADI）',
    angle: '9 月整月為國際失智症月，ADI 每年有官方主題與年度報告。台灣素材：失智人口推估、長照 2.0 失智照護服務、抗類澱粉蛋白新藥（如 lecanemab）在台審查與給付爭議。用語一律「失智症／阿茲海默症」。',
    category: 'health',
    sub: 'aging-health',
    tags: ['失智症', '長照'],
    img: 'elderly hands jigsaw puzzle memory care',
  },
  {
    slug: 'world-pharmacists-day',
    name: '國際藥師節',
    en: 'World Pharmacists Day',
    rule: { md: '09-25' },
    org: '國際藥學聯合會（FIP）',
    angle: 'FIP 每年有官方主題。與 1/15 台灣藥師節角度必須區隔：本篇走國際視野（藥師執業範圍擴張、疫苗接種授權、藥品短缺全球現象），台灣同日另有衛福部的「用藥安全日」可帶。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '藥物研發'],
    img: 'pharmacist counter prescription dispensing',
  },
  {
    slug: 'world-heart-day',
    name: '世界心臟日',
    en: 'World Heart Day',
    rule: { md: '09-29' },
    org: '世界心臟聯盟（WHF）',
    angle: 'WHF 每年有官方主題。台灣素材：心臟病長年居國人死因前段、國健署三高防治、心衰竭照護網、到院前心跳停止（OHCA）存活率與 AED 佈建。',
    category: 'health',
    sub: 'preventive',
    tags: ['心血管健康', '急救常識'],
    img: 'stethoscope heart rate monitor ecg',
  },

  // ── 10 月 ───────────────────────────────────────────────────────────
  {
    slug: 'international-day-of-older-persons',
    name: '國際高齡日',
    en: 'International Day of Older Persons',
    rule: { md: '10-01' },
    org: '聯合國',
    angle: '聯合國每年有官方主題。台灣素材：2025 年起邁入超高齡社會的實質衝擊、長照 3.0 規劃、高齡就業與年齡歧視、獨居長者與社會孤立。',
    category: 'health',
    sub: 'aging-health',
    tags: ['超高齡社會', '長照', '高齡健康'],
    img: 'elderly community activity park bench',
  },
  {
    slug: 'world-mental-health-day',
    name: '世界心理健康日',
    en: 'World Mental Health Day',
    rule: { md: '10-10' },
    org: '世界心理衛生聯盟（WFMH）',
    angle: 'WFMH 每年有官方主題。台灣素材：年輕族群心理健康支持方案的使用與續辦、職場心理健康與過勞、社區心理衛生中心佈建、精神科病床與社區復健銜接。同日為國慶日，寫作不要誤觸節慶語境。',
    category: 'health',
    sub: 'mental-health',
    tags: ['心理健康', '職場健康'],
    img: 'calm quiet room window plant',
  },
  {
    slug: 'world-menopause-day',
    name: '世界更年期關懷日',
    en: 'World Menopause Day',
    rule: { md: '10-18' },
    org: '國際更年期醫學會（IMS）',
    angle: 'IMS 每年有官方主題。台灣素材：更年期症狀被輕忽與誤診、荷爾蒙治療的風險再評估、職場更年期支持、男性更年期。與 3/8 婦女節角度區隔（本篇聚焦更年期醫療本身）。',
    category: 'health',
    sub: 'aging-health',
    tags: ['女性健康', '高齡健康'],
    img: 'womens wellness clinic consultation desk',
  },
  {
    slug: 'world-osteoporosis-day',
    name: '世界骨質疏鬆日',
    en: 'World Osteoporosis Day',
    rule: { md: '10-20' },
    org: '國際骨質疏鬆基金會（IOF）',
    angle: 'IOF 每年有官方主題。台灣素材：髖骨骨折後一年死亡率、骨密度檢測給付範圍、骨鬆藥物順從性、長者跌倒防治與肌少症的交互作用。',
    category: 'health',
    sub: 'aging-health',
    tags: ['骨骼關節', '高齡健康'],
    img: 'bone density scan spine x-ray',
  },
  {
    slug: 'occupational-therapists-day-taiwan',
    name: '職能治療師節',
    en: 'World Occupational Therapy Day',
    rule: { md: '10-27' },
    org: '世界職能治療師聯盟（WFOT）／中華民國職能治療師公會全國聯合會（衛福部核定）',
    angle: '世界職能治療日同日。台灣素材：職能治療在兒童早療、精神復健、失智照護與長照的角色，以及與物理治療的分工誤解（讀者最常混淆的一點，值得寫清楚）。',
    category: 'health',
    sub: 'medical',
    tags: ['復健治療', '醫事人力'],
    img: 'occupational therapy hand exercise tools',
  },
  {
    slug: 'world-stroke-day',
    name: '世界腦中風日',
    en: 'World Stroke Day',
    rule: { md: '10-29' },
    org: '世界中風組織（WSO）',
    angle: 'WSO 每年有官方主題。台灣素材：中風為國人主要死因與失能主因、FAST 辨識口訣的本土化（微笑、舉手、說你好）、急性中風血栓溶解與取栓的黃金時間與醫院量能、年輕型中風上升。',
    category: 'health',
    sub: 'preventive',
    tags: ['心血管健康', '急救常識'],
    img: 'brain ct scan emergency room',
  },

  // ── 11 月 ───────────────────────────────────────────────────────────
  {
    slug: 'radiologic-technologists-day-taiwan',
    name: '醫事放射師節',
    en: 'International Day of Radiology',
    rule: { md: '11-08' },
    org: '衛福部核定（紀念 1895 年侖琴發現 X 射線）／中華民國醫事放射師公會全國聯合會',
    angle: '紀念侖琴發現 X 光。台灣素材：影像檢查量能與健保支出、輻射劑量安全與不必要的重複檢查、AI 影像判讀輔助對放射師工作的改變。',
    category: 'health',
    sub: 'medtech',
    tags: ['醫療AI', '醫事人力'],
    img: 'radiology ct scanner control room',
  },
  {
    slug: 'doctors-day-taiwan',
    name: '醫師節',
    en: "Doctors' Day (Taiwan)",
    rule: { md: '11-12' },
    org: '衛福部核定（台灣全國醫師公會聯合大會，以國父誕辰定之）',
    angle: '注意這是台灣的醫師節，與 3/30 美國起源的國際醫師節不同，寫作要交代。台灣素材：五大科招募困境與內外婦兒急的人力斷層、醫師勞動權益與工時、醫療暴力、偏鄉醫療。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '醫療政策'],
    img: 'hospital corridor white coat stethoscope',
  },
  {
    slug: 'world-pneumonia-day',
    name: '世界肺炎日',
    en: 'World Pneumonia Day',
    rule: { md: '11-12' },
    org: 'Every Breath Counts 聯盟等非營利組織共同發起',
    angle: '⚠️ 與台灣醫師節同日，兩篇角度務必完全不同（本篇談疾病，不談醫事人力）。台灣素材：肺炎長年居國人死因前段、長者肺炎鏈球菌與流感疫苗公費接種範圍、抗生素抗藥性。',
    category: 'health',
    sub: 'medical',
    tags: ['傳染病防治', '預防醫學'],
    img: 'chest x-ray lungs respiratory ward',
  },
  {
    slug: 'world-diabetes-day',
    name: '世界糖尿病日',
    en: 'World Diabetes Day',
    rule: { md: '11-14' },
    org: '國際糖尿病聯盟（IDF）與 WHO，取胰島素發現者 Banting 生日',
    angle: 'IDF 每年有三年一期的官方主題。台灣素材：糖尿病人口與年輕化、糖尿病共同照護網成效、連續血糖監測（CGM）與 GLP-1 藥物給付、糖尿病腎病變與洗腎的關聯。',
    category: 'health',
    sub: 'preventive',
    tags: ['糖尿病', '代謝健康'],
    img: 'blood glucose meter test strips',
  },

  // ── 12 月 ───────────────────────────────────────────────────────────
  {
    slug: 'world-aids-day',
    name: '世界愛滋病日',
    en: 'World AIDS Day',
    rule: { md: '12-01' },
    org: '世界衛生組織（WHO）與 UNAIDS',
    angle: 'UNAIDS 每年有官方主題與年度報告。台灣素材：疾管署最新感染通報數、U=U（測不到＝不具傳染力）觀念普及、PrEP 暴露前預防用藥可近性、就學就業與就醫歧視。用語鐵則：「感染者」而非「病患」，避免污名。',
    category: 'health',
    sub: 'medical',
    tags: ['傳染病防治', '醫療政策'],
    img: 'red ribbon awareness hiv testing kit',
  },
  {
    slug: 'respiratory-therapists-day-taiwan',
    name: '呼吸治療師節',
    en: "Respiratory Therapists' Day (Taiwan)",
    rule: { md: '12-21' },
    org: '衛福部核定（紀念民國 90 年 12 月 21 日《呼吸治療師法》三讀通過）',
    angle: '紀念《呼吸治療師法》三讀通過。台灣素材：呼吸器依賴病人的照護體系、呼吸照護病房與居家呼吸照護、COVID-19 之後呼吸治療師的能見度與人力缺口。',
    category: 'health',
    sub: 'medical',
    tags: ['醫事人力', '急救常識'],
    img: 'ventilator icu respiratory equipment',
  },
];

/* ------------------------------------------------------------------ */
/*  日期解析                                                           */
/* ------------------------------------------------------------------ */

const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/** 某年某月的天數。 */
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 把日期規則解析成該年的實際日期。
 * @param {{md?:string, month?:number, weekday?:number, nth?:number|'last'}} rule
 * @param {number} year 西元年
 * @returns {string} YYYY-MM-DD
 */
export function resolveHealthDate(rule, year) {
  if (rule.md) return `${year}-${rule.md}`;
  const { month, weekday, nth } = rule;
  if (nth === 'last') {
    const lastDay = daysInMonth(year, month);
    const lastWeekday = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
    return ymd(year, month, lastDay - ((lastWeekday - weekday + 7) % 7));
  }
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  if (day > daysInMonth(year, month)) {
    throw new Error(`日期規則解不出來：${year} 年 ${month} 月沒有第 ${nth} 個 weekday=${weekday}`);
  }
  return ymd(year, month, day);
}

/** 該日期（YYYY-MM-DD）當天的所有紀念日；一天可能不只一個（例：11/12）。 */
export function healthDaysOn(dateStr) {
  const year = Number(dateStr.slice(0, 4));
  return HEALTH_DAYS.filter((d) => resolveHealthDate(d.rule, year) === dateStr);
}

/**
 * 從 fromDate 起算「第 offsetDays 天」的紀念日（提前寫稿用）。
 * 跨年也成立：12/30 往後 2 天會落到隔年 1/1。
 * @returns {Array<{entry:object, date:string}>}
 */
export function healthDaysAhead(fromDate, offsetDays) {
  const [y, m, d] = fromDate.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const dateStr = target.toISOString().slice(0, 10);
  return healthDaysOn(dateStr).map((entry) => ({ entry, date: dateStr }));
}

/**
 * 掃 fromDate 起算 T+1 … T+leadDays 這個**區間**內的所有紀念日，由近到遠排序。
 *
 * 為什麼是區間而不是「剛好第 leadDays 天」：那樣寫失敗就永遠補不回來。以 8/31 為例，
 * 8/29 跑（T+2）失敗後，8/30 跑的是 9/2，8/31 那篇再也不會被看到。改掃區間後，
 * 8/30 仍會看到 8/31（T+1），配合協調器的「已寫過就跳過」帳本，天然形成一次重試機會。
 *
 * 不含 T+0（當天）：上線 cron 在台北 06:17 跑、寫稿 cron 在 11:00，當天才寫已經來不及。
 * @returns {Array<{entry:object, date:string}>}
 */
export function healthDaysWithin(fromDate, leadDays) {
  const out = [];
  for (let i = 1; i <= leadDays; i++) out.push(...healthDaysAhead(fromDate, i));
  return out;
}

/** 該篇在該年度的文章 slug（每年一篇，年份入 slug）。 */
export function articleSlugFor(entry, year) {
  return `${entry.slug}-${year}`;
}

/** 帳本鍵值（去重用）。 */
export function ledgerKey(entry, year) {
  return `${entry.slug}@${year}`;
}

/* ------------------------------------------------------------------ */
/*  寫作 prompt                                                        */
/* ------------------------------------------------------------------ */

/**
 * 組當年度紀念日的寫作 prompt。
 * 重點：這不是「介紹這個紀念日的由來」，而是「借這一天，報導今年的新東西」——
 * 由來只是引子，主體必須是當年度的官方主題、最新統計與今年的政策／指引變動。
 *
 * @param {object} entry  HEALTH_DAYS 的一筆
 * @param {string} date   該年度的實際日期 YYYY-MM-DD
 * @param {{priorTitles?: string[]}} [opts] 歷年同一紀念日已寫過的標題（避免年復一年同一篇）
 */
export function buildHealthDayPrompt(entry, date, opts = {}) {
  const year = Number(date.slice(0, 4));
  const slug = articleSlugFor(entry, year);
  const prior = (opts.priorTitles || []).length
    ? opts.priorTitles.map((t) => `  - ${t}`).join('\n')
    : '（往年尚未寫過這個紀念日，這是第一篇）';

  return [
    `你是 APPI News 健康線編輯。今年的 ${date} 是「${entry.name}」（${entry.en}），請寫一篇繁體中文（台灣用語）的事實型報導，以 APPI 編輯部署名、中性語氣、無個人觀點。`,
    '',
    '【這篇要寫什麼——最重要的一條】',
    `這**不是**一篇「介紹 ${entry.name} 由來」的百科文。紀念日只是新聞由頭，讀者要的是「今年有什麼新的」。由來與典故最多佔開頭一小段（兩三句），**主體必須是當年度的新資訊**：`,
    `  1. **${year} 年的官方主題／年度報告**——${entry.org} 幾乎每年都會公布當年度主題（theme）或年度數據報告，用 WebSearch/WebFetch 去找當年度的，不要拿去年的充數。`,
    '  2. **台灣的最新統計**——衛福部、國健署、疾管署、健保署或相關公會的最新一期數據（找得到哪一年就寫哪一年，並註明統計年度）。',
    `  3. **今年（或最近一年內）的政策、給付、指引或技術變動**——這是全篇最有價值的部分。`,
    '',
    '【本篇的切入方向（企劃時已定，請遵循）】',
    `  ${entry.angle}`,
    '',
    `【權威來源錨點】${entry.org}。先從這個組織的官網找當年度主題與素材，再補台灣官方數據。`,
    '',
    '【往年已寫過的同一紀念日（角度不得重複，今年必須有新的重點）】',
    prior,
    '',
    '【硬性要求】',
    '- **至少 3 條「當年度或最新可得年度」的可查證來源**，每條附 inline 超連結並逐條實際查證可連線（2xx 且內容確實支持該句）。死連結不得使用。',
    '- 數字一律照官方原文，標明單位與統計年度，零杜撰、零臆測。找不到當年度數據就寫最新可得年度並註明，不要含糊帶過。',
    '- 醫療內容不得構成個人化診療建議；涉及疾病症狀時，加一句提醒讀者就醫評估。',
    '- 全文繁體中文＋台灣用語，禁中國用語（軟件／程序／網絡／算法／人工智能／質量／信息…）。',
    '- 【去 AI 腔·統一禁用清單，違反即改】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「值得一提的是」「換句話說」；禁空泛收束（總的來說／綜上所述／總而言之／歸根結底／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展/普及」「在…的今天」開場公式；禁「至關重要/不可或缺/舉足輕重」；禁模糊引用（研究顯示／有研究指出／專家認為／學者認為／普遍認為——要嘛當下附具體可點來源、要嘛不寫）；禁模板化第一人稱開場。正向：長短句交錯、每段換開法、每段至少一個具體事實、台灣口語。',
    '',
    '【配圖：本線一律 OpenAI 生圖，不用圖庫】',
    `- 封面：\`node scripts/get-image.mjs --generate --topic "${entry.img}" --context "<這篇今年的重點，一句話>" --caption "<封面要傳達的訊息>" --out public/covers/${slug}-cover.webp\``,
    `  \`--generate\` 必帶（跳過圖庫、直接 OpenAI 生成）。\`--topic\` 請照抄上面那串英文（年曆表為這個紀念日定好的畫面主題），**不要自己改**，這是讓歷年封面維持同一視覺主軸的關鍵；\`--context\`／\`--caption\` 則要填今年的重點，讓同一主題每年生出不同畫面。`,
    '  構圖以器材、場景與物件為主軸，**不要加 `--people`**（那是人物特寫專用；不帶它時生圖仍會依場景需要帶入人物，且模組已強制台灣人臉孔，不必為了「要有人」而加）。',
    `- 內文至少一張圖：\`node scripts/get-image.mjs --generate --topic "<該段的畫面主題，英文>" --context "<該段重點>" --out public/images/${slug}-s1.webp\`。`,
    '- 圖說一律尾註「（示意圖）」。全部是生成圖，沒有圖庫授權問題，**不要**填 `coverImageCredit`。',
    '- **鐵則：設了 coverImage 就一定要先確認該檔真的存在；拿不到圖就不要設 coverImage**（會變壞連結、整篇發不出）。',
    '',
    '【frontmatter（照抄，只填空）】',
    `  title: 帶上「${year}」與當年度重點的具體標題，不要只寫「${entry.name}」五個字（每年一篇，標題必須能互相區分）`,
    `  slug: "${slug}"（檔名也是 ${slug}.md）`,
    `  category: "health"`,
    `  subcategory: "${entry.sub}"`,
    '  author: "appi-editorial"',
    '  contentType: "feature"',
    '  sourceType: "editorial"',
    '  status: "scheduled"',
    `  publishDate: "${date}T06:17:00+08:00"`,
    '  topics: ["health-days"]',
    `  tags: 只能填 ${entry.tags.map((t) => `"${t}"`).join('、')}（受控詞彙表，見 src/config/tags.ts；不得自行新增或改寫）`,
    '  disclosure: 說明本文整理自官方與權威組織公開資料、附原文出處',
    '',
    `寫入 src/content/articles/${slug}.md，**不要 git add/commit/push**（外層處理）。`,
    '',
    `【最後輸出】一行：\`HEALTHDAY_RESULT=OK｜${slug}\`（已寫），或 \`HEALTHDAY_RESULT=SKIP｜<原因>\`（找不到足夠的當年度可查證素材，寧可不寫）。若有寫，再附查證報告（每條超連結＋HTTP 狀態＋是否支持該句）。`,
  ].join('\n');
}

/** 解析 claude 回傳的 HEALTHDAY_RESULT 行。 */
export function parseHealthDayResult(stdout) {
  const m = String(stdout || '').match(/HEALTHDAY_RESULT=(OK|SKIP)｜([^\n\r]*)/);
  if (!m) return { action: 'skip', note: '找不到 HEALTHDAY_RESULT 行', slug: '' };
  if (m[1] === 'OK') return { action: 'ok', slug: m[2].trim(), note: '已寫' };
  return { action: 'skip', slug: '', note: m[2].trim() || '未說明' };
}
