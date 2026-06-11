/**
 * 免責聲明（DisclaimerBox）與內容來源揭露（DisclosureBox）文案。
 * 文章 frontmatter 以 disclaimerType / sourceType 對應到這裡。
 */

export type DisclaimerType = 'general' | 'medical' | 'financial' | 'legal' | 'sponsored';

export const DISCLAIMERS: Record<DisclaimerType, { label: string; text: string }> = {
  general: {
    label: '一般資訊',
    text: '本文為一般資訊整理與觀點分析，僅供參考，不構成任何專業建議。',
  },
  medical: {
    label: '健康醫療',
    text: '本文為健康教育與資訊整理，不能取代醫師、藥師或其他醫事人員的診斷與治療建議。如有個人健康問題，請諮詢合格醫療專業人員。',
  },
  financial: {
    label: '財經資訊',
    text: '本文為財經資訊與觀點分析，不構成任何投資建議、買賣建議或收益保證。投資有風險，請自行評估。',
  },
  legal: {
    label: '法律政策',
    text: '本文為一般法律或政策資訊整理，不構成法律意見。如有具體案件，請諮詢合格法律專業人士。',
  },
  sponsored: {
    label: '合作內容',
    text: '本文為合作、贊助或新聞稿內容，相關資訊由合作方提供，APPI 仍保留基本刊登規範與內容檢核。',
  },
};

export type SourceType =
  | 'editorial'
  | 'contributor'
  | 'sponsored'
  | 'press-release'
  | 'ai-assisted';

/** 依 sourceType 顯示的揭露文字（DisclosureBox） */
export const DISCLOSURES: Record<SourceType, { label: string; text: string } | null> = {
  editorial: {
    label: '編輯部',
    text: '本文由 APPI 編輯部製作，內容經編輯檢核。',
  },
  'ai-assisted': null,
  contributor: {
    label: '作者來稿',
    text: '本文為作者來稿，觀點不必然代表 APPI 編輯部立場。',
  },
  sponsored: {
    label: '商業合作',
    text: '本文為商業合作內容，已依 APPI 商業內容揭露規範標示。',
  },
  'press-release': {
    label: '新聞稿',
    text: '本文為新聞稿內容，相關資訊由發布方提供，APPI 保留基本刊登規範。',
  },
};

/** 內容類型顯示名稱（給文章卡 / breadcrumb 標籤用） */
export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  editorial: '編輯部',
  contributor: '作者來稿',
  sponsored: '商業合作',
  'press-release': '新聞稿',
  'ai-assisted': '編輯部',
};