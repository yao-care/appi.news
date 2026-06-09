#!/usr/bin/env python3
"""
WordPress (WXR) → Astro content collection 遷移腳本。

來源：old/asia-pacificpreventiveinsight.WordPress.2026-06-09.xml
輸出：src/content/articles/wp-<id>.md

遷移規則見 MIGRATION_NOTES.md。為一次性 / 可重複執行的工具，
不屬於 build 流程。重複執行會覆寫 wp-*.md（不動其他手寫文章）。
"""
import os
import re
import json
import html
import collections
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'old', 'asia-pacificpreventiveinsight.WordPress.2026-06-09.xml')
OUT = os.path.join(ROOT, 'src', 'content', 'articles')

NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'dc': 'http://purl.org/dc/elements/1.1/',
}

# WordPress 分類 → APPI 分類 / 子分類
CATEGORY_MAP = {
    '預防醫學': ('health', 'preventive'),
    '中醫': ('health', 'tcm'),
    '科技': ('tech', None),
    '時事': ('society', None),
    '焦點新聞': ('focus', 'today'),
    '運動': ('sports', None),
    '未分類': ('focus', None),  # 需人工確認
}
NEEDS_REVIEW_CATS = {'未分類'}

# 高風險分類 → disclaimerType
DISCLAIMER_BY_CAT = {
    'health': 'medical',
    'finance': 'financial',
}

# WordPress 帳號 → 真實作者 slug（依 old/personas/appi.news 的 publish.json 對應）
AUTHOR_MAP = {
    'appieditor': 'appi-editorial',
    'asignbio': 'huang-ziyan',     # 黃子彥（草本上膳醫廚 / GCM 總編輯）
    'vegeta': 'luo-yang',          # 羅揚（健康教育內容創作者）
    'chou': 'chou-jingyan',        # 周敬彥（Winsame 數位行銷）
    'light': 'lightman',           # CΛ / Lightman（AI 數位健康設計者）
    'youxiang': 'xie-youxiang',    # 謝佑祥（室內設計師）
    'pharmacistlo': 'luo-wenyou',  # 羅文佑（生活駭客藥師）
}
AUTHOR_DEFAULT = 'appi-editorial'

# 依標籤自動歸入專題（tag 命中即加入該 topic）
TOPIC_RULES = {
    'drug-repurposing': {'老藥新用', '藥物再利用', 'AI醫療', 'TxGNN', '二甲雙胍'},
    'healthy-aging': {'高齡者骨骼健康', '肌少症', '骨質疏鬆', '高齡運動', '預防醫學'},
}

STATUS_MAP = {
    'publish': 'published',
    'future': 'scheduled',
    'draft': 'draft',
    'pending': 'draft',
    'private': 'draft',
}

# ---------------------------------------------------------------- HTML 清理

ALLOWED = {
    'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'blockquote', 'strong', 'b',
    'em', 'i', 'a', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'code', 'pre', 'sup', 'sub',
}
# 連同內容一起丟棄
DROP_TREE = {'script', 'style', 'img', 'figure', 'iframe', 'noscript', 'svg', 'form', 'button', 'input'}
# 拆掉標籤但保留子內容
UNWRAP = {'div', 'section', 'span', 'article', 'header', 'footer', 'main',
          'aside', 'figcaption', 'nav', 'time', 'small', 'mark', 'u',
          'font', 'center', 'tbody'}


VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'col'}


class Cleaner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip_depth = 0  # >0 表示正在丟棄子樹（含非 void 巢狀計數）

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        a = dict(attrs)
        if self.skip_depth:
            # 已在丟棄子樹中：非 void 標籤計入巢狀深度
            if tag not in VOID:
                self.skip_depth += 1
            return
        # 觸發丟棄：進度條提示，或需連內容丟棄的標籤
        if a.get('id') == 'article-progress-msgs' or tag in DROP_TREE:
            if tag not in VOID:
                self.skip_depth = 1
            return
        if tag in UNWRAP:
            return
        if tag == 'h1':
            tag = 'h2'
        if tag in ALLOWED and tag not in VOID:
            if tag == 'a':
                href = a.get('href', '')
                if href and not href.startswith('#'):
                    self.out.append(f'<a href="{html.escape(href, quote=True)}">')
                else:
                    self.out.append('<a>')
            else:
                self.out.append(f'<{tag}>')
        elif tag in ('br', 'hr'):
            self.out.append(f'<{tag}>')

    def handle_startendtag(self, tag, attrs):
        tag = tag.lower()
        if self.skip_depth:
            return
        if tag in ('br', 'hr'):
            self.out.append(f'<{tag}>')

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in VOID:
            return
        if self.skip_depth:
            self.skip_depth -= 1
            return
        if tag in UNWRAP or tag in DROP_TREE:
            return
        if tag == 'h1':
            tag = 'h2'
        if tag in ALLOWED:
            self.out.append(f'</{tag}>')

    def handle_data(self, data):
        if self.skip_depth:
            return
        self.out.append(data)

    def get_html(self):
        raw = ''.join(self.out)
        # 移除每行前導 tab/空白（WP 原始縮排），避免 markdown 誤判為程式碼區塊
        raw = re.sub(r'(?m)^[ \t]+', '', raw)
        # 收斂多餘空白與空段落
        raw = re.sub(r'<p>\s*</p>', '', raw)
        raw = re.sub(r'<(\w+)>\s*</\1>', '', raw)
        raw = re.sub(r'\n{3,}', '\n\n', raw)
        # 區塊標籤之間補換行，避免 markdown 把整段視為一段
        raw = re.sub(r'(</(?:h2|h3|h4|p|ul|ol|blockquote|table|pre)>)', r'\1\n\n', raw)
        raw = re.sub(r'(<(?:h2|h3|h4|p|ul|ol|blockquote|table|pre)>)', r'\n\1', raw)
        raw = re.sub(r'\n{3,}', '\n\n', raw)
        return raw.strip()


def clean_html(body):
    c = Cleaner()
    try:
        c.feed(body)
        c.close()
    except Exception:
        pass
    return c.get_html()


def text_only(body, limit=140):
    """抽純文字做摘要"""
    t = re.sub(r'<[^>]+>', ' ', body)
    t = html.unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    if len(t) > limit:
        t = t[:limit].rstrip() + '…'
    return t


def yaml_str(s):
    """以 JSON 雙引號標量輸出（YAML 相容）"""
    return json.dumps(s if s is not None else '', ensure_ascii=False)


def yaml_list(items):
    return '[' + ', '.join(json.dumps(x, ensure_ascii=False) for x in items) + ']'


def to_iso(wp_date):
    # "2026-06-08 10:45:36" (Asia/Taipei) → ISO +08:00
    if not wp_date or wp_date == '0000-00-00 00:00:00':
        return None
    return wp_date.strip().replace(' ', 'T') + '+08:00'


def slugify(name, pid):
    s = unquote(name or '').strip()
    # 移除檔案系統 / URL 不安全字元
    s = re.sub(r'[\\/:*?"<>#%|\s]+', '-', s)
    s = re.sub(r'-{2,}', '-', s).strip('-')
    if not s:
        s = f'post-{pid}'
    return s


def g(item, tag):
    e = item.find(tag, NS)
    return e.text if e is not None else None


def main():
    ch = ET.parse(SRC).getroot().find('channel')
    items = ch.findall('item')
    posts = [i for i in items if g(i, 'wp:post_type') == 'post']

    os.makedirs(OUT, exist_ok=True)
    # 先清掉舊的 wp-*.md，確保可重複執行
    for f in os.listdir(OUT):
        if f.startswith('wp-') and f.endswith('.md'):
            os.remove(os.path.join(OUT, f))

    seen_slugs = {}
    stats = collections.Counter()
    cat_stats = collections.Counter()

    for p in posts:
        pid = g(p, 'wp:post_id')
        title = (g(p, 'title') or '（未命名）').strip()
        wp_status = g(p, 'wp:status') or 'draft'
        status = STATUS_MAP.get(wp_status, 'draft')
        stats[status] += 1

        # 分類
        wp_cat = None
        tags = []
        for c in p.findall('category'):
            if c.get('domain') == 'category' and wp_cat is None:
                wp_cat = c.text
            elif c.get('domain') == 'post_tag':
                if c.text:
                    tags.append(c.text)
        cat, sub = CATEGORY_MAP.get(wp_cat or '未分類', ('focus', None))
        cat_stats[wp_cat or '(none)'] += 1
        needs_review = (wp_cat in NEEDS_REVIEW_CATS) or (wp_cat is None)

        # 日期
        pub = to_iso(g(p, 'wp:post_date')) or '2026-01-01T00:00:00+08:00'

        # 摘要
        body_raw = g_content(p)
        ex = p.find('excerpt:encoded', NS)
        excerpt = (ex.text or '').strip() if ex is not None else ''
        if not excerpt:
            excerpt = text_only(body_raw, 140)
        description = excerpt if len(excerpt) <= 155 else text_only(excerpt, 150)
        if not description:
            description = title

        slug = slugify(g(p, 'wp:post_name'), pid)
        if slug in seen_slugs:
            slug = f'{slug}-{pid}'
        seen_slugs[slug] = True

        disclaimer = DISCLAIMER_BY_CAT.get(cat, 'general')
        legacy_author = g(p, 'dc:creator') or ''
        author_slug = AUTHOR_MAP.get(legacy_author, AUTHOR_DEFAULT)

        # 依標籤自動歸入專題
        tagset = set(tags)
        article_topics = [t for t, keys in TOPIC_RULES.items() if tagset & keys]

        body = clean_html(body_raw)
        if not body.strip():
            body = f'<p>{html.escape(description)}</p>'

        fm = []
        fm.append('---')
        fm.append(f'title: {yaml_str(title)}')
        fm.append(f'slug: {yaml_str(slug)}')
        fm.append(f'description: {yaml_str(description)}')
        fm.append(f'excerpt: {yaml_str(excerpt[:160])}')
        fm.append(f'publishDate: {yaml_str(pub)}')
        fm.append(f'category: {yaml_str(cat)}')
        if sub:
            fm.append(f'subcategory: {yaml_str(sub)}')
        fm.append(f'tags: {yaml_list(tags)}')
        fm.append(f'author: {yaml_str(author_slug)}')
        if article_topics:
            fm.append(f'topics: {yaml_list(article_topics)}')
        fm.append(f'status: {yaml_str(status)}')
        fm.append(f'sourceType: {yaml_str("ai-assisted")}')
        fm.append(f'disclaimerType: {yaml_str(disclaimer)}')
        fm.append(f'legacyAuthor: {yaml_str(legacy_author)}')
        fm.append(f'legacyCategory: {yaml_str(wp_cat or "")}')
        if needs_review:
            fm.append('# TODO: 分類需人工確認（原 WordPress 分類為「未分類」或無分類）')
        if status == 'draft':
            fm.append('draft: true')
        fm.append('---')
        fm.append('')
        fm.append(body)
        fm.append('')

        path = os.path.join(OUT, f'wp-{pid}.md')
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(fm))

    print('遷移完成。')
    print('狀態統計:', dict(stats))
    print('原始分類統計:', dict(cat_stats))
    print(f'輸出目錄: {OUT}')
    print(f'總文章數: {len(posts)}')


def g_content(p):
    e = p.find('content:encoded', NS)
    return (e.text or '') if e is not None else ''


if __name__ == '__main__':
    main()
