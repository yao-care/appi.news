// @ts-check
// 把「單張帶 title 的 Markdown 圖片」轉成可見圖說。
//
// Markdown 的 `![alt](url "title")` 會渲染成 <p><img alt="alt" title="title"></p>——
// title 在瀏覽器只會變成滑鼠 tooltip，讀者看不到。本 plugin 於 build 期把這種段落改寫成
//   <figure class="article-figure"><img …><figcaption class="article-figcaption">title</figcaption></figure>
// 讓圖說以灰色小字顯示在圖片下方，對齊專業新聞網站的排版。
//
// 只處理「整段只有一張圖、且該圖帶非空 title」的情況；行內圖、無 title 的圖、
// 以及以原始 <img> HTML 寫入內文（目前 imgTag 產出、無 title）者一律不動。
// 圖說內容以 hast text 節點寫入（stringify 會做 HTML escape），不會被當標籤解析。

const isElement = (n, tag) => !!n && n.type === 'element' && n.tagName === tag;
const isImg = (n) => isElement(n, 'img');

/** 去掉純空白 text 節點後的有效子節點（例如 <p> 內圖片前後的換行空白）。 */
const meaningfulChildren = (children) =>
  (Array.isArray(children) ? children : []).filter(
    (c) => !(c.type === 'text' && !String(c.value ?? '').trim()),
  );

/** 取 img 的 title（trim 後）；無 title / 非字串回空字串。 */
const captionOf = (img) => {
  const t = img?.properties?.title;
  return typeof t === 'string' ? t.trim() : '';
};

/**
 * 純函式：就地把符合條件的 <p> 節點改寫成 <figure> + <figcaption>。
 * 回傳同一棵 tree（方便測試）。
 * @param {any} tree hast root
 */
export function applyFigcaption(tree) {
  const walk = (node) => {
    const kids = node?.children;
    if (!Array.isArray(kids)) return;
    for (const child of kids) {
      if (isElement(child, 'p')) {
        const inner = meaningfulChildren(child.children);
        if (inner.length === 1 && isImg(inner[0])) {
          const caption = captionOf(inner[0]);
          if (caption) {
            const img = inner[0];
            // 移除 title，避免 tooltip 與可見圖說重複。
            if (img.properties) delete img.properties.title;
            child.tagName = 'figure';
            child.properties = { ...(child.properties || {}), className: ['article-figure'] };
            child.children = [
              img,
              {
                type: 'element',
                tagName: 'figcaption',
                properties: { className: ['article-figcaption'] },
                children: [{ type: 'text', value: caption }],
              },
            ];
            continue; // 已轉成 figure，內部無需再走訪
          }
        }
      }
      walk(child);
    }
  };
  walk(tree);
  return tree;
}

/** rehype plugin factory：接在 rehypeBaseImages 之後。 */
export function rehypeFigcaption() {
  return (tree) => applyFigcaption(tree);
}
