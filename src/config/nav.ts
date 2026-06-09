/** 主導覽與 Footer 連結結構（集中管理） */
import { CATEGORIES } from './categories';

export const MAIN_NAV = [
  ...CATEGORIES.map((c) => ({ label: c.name, href: `/${c.slug}/` })),
  { label: '作者群', href: '/authors/' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'APPI',
    links: [
      { label: '關於 APPI', href: '/about/' },
      { label: '編輯方針', href: '/editorial-policy/' },
      { label: '聯絡我們', href: '/contact/' },
    ],
  },
  {
    title: '內容',
    links: [
      { label: '焦點', href: '/focus/' },
      { label: '健康', href: '/health/' },
      { label: '科技', href: '/tech/' },
      { label: '財經', href: '/finance/' },
      { label: '時事', href: '/society/' },
      { label: '運動', href: '/sports/' },
      { label: '生活', href: '/lifestyle/' },
      { label: '專欄', href: '/columns/' },
    ],
  },
  {
    title: '作者與合作',
    links: [
      { label: '成為作者', href: '/join/' },
      { label: '作者方案', href: '/pricing/' },
      { label: '投稿規範', href: '/contributor-guidelines/' },
      { label: '新聞稿與商業合作', href: '/sponsored/' },
    ],
  },
  {
    title: '政策',
    links: [
      { label: '隱私權政策', href: '/privacy/' },
      { label: '服務條款', href: '/terms/' },
      { label: '免責聲明', href: '/disclaimer/' },
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
];
