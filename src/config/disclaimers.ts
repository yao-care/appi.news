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

/**
 * sourceType 代表內容來源（誰提供的內容），而非製作工具。
 * 一般 editorial / author / contributor / expert 內容不需在前台特別揭露；
 * press-release / sponsored / partner / wire 屬外部或商業來源，需明確揭露。
 */
export type SourceType =
  | 'editorial'
  | 'author'
  | 'contributor'
  | 'expert'
  | 'press-release'
  | 'sponsored'
  | 'partner'
  | 'wire';

/** 依 sourceType 顯示的來源揭露文字（DisclosureBox）；null 表示前台不另外顯示揭露框 */
export const DISCLOSURES: Record<SourceType, { label: string; text: string } | null> = {
  editorial: {
    label: '編輯部',
    text: '本文由 APPI 編輯部製作，內容經編輯檢核。',
  },
  author: {
    label: '作者',
    text: '本文為 APPI 作者撰稿，觀點不必然代表 APPI 編輯部立場。',
  },
  contributor: {
    label: '特約作者',
    text: '本文為特約作者來稿，觀點不必然代表 APPI 編輯部立場。',
  },
  expert: {
    label: '專家來稿',
    text: '本文為專家來稿，由作者本於專業提出觀點，不必然代表 APPI 編輯部立場。',
  },
  'press-release': {
    label: '新聞稿',
    text: '本文為新聞稿內容，相關資訊由發布方提供，APPI 保留基本刊登規範。',
  },
  sponsored: {
    label: '贊助內容',
    text: '本文為贊助 / 商業合作內容，已依 APPI 商業內容揭露規範標示。',
  },
  partner: {
    label: '合作來源',
    text: '本文為合作夥伴提供之內容，APPI 保留基本刊登與檢核規範。',
  },
  wire: {
    label: '外部授權來源',
    text: '本文為外部授權 / 通訊社來源內容，著作權歸原發布方所有。',
  },
};

/** 來源類型顯示名稱（給文章卡 / breadcrumb 標籤用） */
export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  editorial: '編輯部',
  author: '作者',
  contributor: '特約作者',
  expert: '專家來稿',
  'press-release': '新聞稿',
  sponsored: '贊助內容',
  partner: '合作來源',
  wire: '外部授權來源',
};