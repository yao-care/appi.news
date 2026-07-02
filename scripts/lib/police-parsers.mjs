// 警消好人好事各站 HTML parser 匯總（純函式）。
// 三組 CMS 分檔隔離各自 helper（decodeEntities/stripTags/normDate…），避免同名衝突：
//   - police-parsers-aspx.mjs    News.aspx 家族（高雄/宜蘭/屏東/台北/雲林/金門）
//   - police-parsers-central.mjs 臺南/南投/彰化
//   - police-parsers-misc.mjs    連江/新北/新竹市/臺東/新竹縣
export { parseListNewsAspx, parseDetailNewsAspx } from './police-parsers-aspx.mjs';
export {
  parseListTainan, parseListNantou, parseListChanghua,
  parseDetailTainan, parseDetailNantou, parseDetailChanghua,
} from './police-parsers-central.mjs';
export {
  parseListMatsu, parseListNewTaipei, parseListHsinchuCity, parseListTaitung, parseListHsinchuCounty,
  parseDetailMatsu, parseDetailNewTaipei, parseDetailHsinchuCity, parseDetailTaitung, parseDetailHsinchuCounty,
} from './police-parsers-misc.mjs';
