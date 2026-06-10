#!/usr/bin/env python3
"""
從 WordPress 匯出 XML 抓「featured 封面圖」下載到 public/covers/，
並把 coverImage 欄位填進 src/content/articles/wp-<id>.md。

版權安全：只下載 appi.news 媒體庫（使用者自有附件）的圖；
第三方（gcm.org.tw 等內文熱鏈）一律不下載。

用法：
  python scripts/fetch_covers.py            # dry-run，只報告能配到幾篇
  python scripts/fetch_covers.py --apply    # 實際下載 + 寫入 coverImage

注意：migrate_wp.py 重跑會覆寫 wp-*.md（清掉 coverImage），之後需重跑本腳本。
"""
import xml.etree.ElementTree as ET
import urllib.request, os, sys, re
from urllib.parse import urlsplit, urlunsplit, quote


def encode_url(u):
    """把 URL 路徑中的非 ASCII（中文檔名）percent-encode，供 urllib 下載。"""
    p = urlsplit(u)
    return urlunsplit((p.scheme, p.netloc, quote(p.path, safe="/%"), p.query, p.fragment))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XML = os.path.join(ROOT, 'old', 'asia-pacificpreventiveinsight.WordPress.2026-06-09.xml')
COVERS = os.path.join(ROOT, 'public', 'covers')
ARTICLES = os.path.join(ROOT, 'src', 'content', 'articles')
NS = {'wp': 'http://wordpress.org/export/1.2/'}
APPLY = '--apply' in sys.argv


def text(el, tag):
    e = el.find(tag, NS)
    return e.text if e is not None else None


def main():
    channel = ET.parse(XML).getroot().find('channel')
    attach = {}   # attachment post_id -> url
    posts = []
    for item in channel.findall('item'):
        pt = text(item, 'wp:post_type')
        pid = text(item, 'wp:post_id')
        if pt == 'attachment':
            url = text(item, 'wp:attachment_url')
            if url:
                attach[pid] = url.strip()
        elif pt == 'post':
            posts.append((pid, item))

    os.makedirs(COVERS, exist_ok=True)
    matched = downloaded = skipped_3rd = no_thumb = no_md = failed = 0
    for pid, item in posts:
        thumb = None
        for pm in item.findall('wp:postmeta', NS):
            if text(pm, 'wp:meta_key') == '_thumbnail_id':
                thumb = (text(pm, 'wp:meta_value') or '').strip()
        if not thumb or thumb not in attach:
            no_thumb += 1
            continue
        url = attach[thumb]
        if 'appi.news' not in url:
            skipped_3rd += 1
            continue
        md = os.path.join(ARTICLES, f'wp-{pid}.md')
        if not os.path.exists(md):
            no_md += 1
            continue
        matched += 1
        ext = re.sub(r'\?.*$', '', url).rsplit('.', 1)[-1].lower()
        if ext not in ('jpg', 'jpeg', 'png', 'webp', 'gif'):
            ext = 'jpg'
        fn = f'wp-{pid}.{ext}'
        rel = f'covers/{fn}'
        dest = os.path.join(COVERS, fn)
        if APPLY:
            if not os.path.exists(dest):
                try:
                    req = urllib.request.Request(encode_url(url), headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=25) as r, open(dest, 'wb') as f:
                        f.write(r.read())
                    downloaded += 1
                except Exception as e:
                    failed += 1
                    print(f'  ✗ wp-{pid} 下載失敗：{e}')
                    continue
            with open(md, encoding='utf-8') as f:
                src = f.read()
            if 'coverImage:' not in src:
                src2 = re.sub(r'(\ncategory: [^\n]*\n)',
                              rf'\1coverImage: "{rel}"\n', src, count=1)
                if src2 != src:
                    with open(md, 'w', encoding='utf-8') as f:
                        f.write(src2)
        else:
            print(f'  wp-{pid} ← {url}')

    print(f'\n配到 appi.news 封面：{matched}　第三方略過：{skipped_3rd}　'
          f'無縮圖：{no_thumb}　無對應 md：{no_md}')
    if APPLY:
        print(f'實際下載：{downloaded}　失敗：{failed}')
    else:
        print('(dry-run；加 --apply 實際下載並寫入 coverImage)')


if __name__ == '__main__':
    main()
