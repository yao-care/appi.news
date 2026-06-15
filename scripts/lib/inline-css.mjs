// 純函式：把指向 _astro/*.css 的 render-blocking <link> 換成內聯 <style>。
// getCss(filename) 回傳該 css 檔內容字串，或 null（找不到則保留原 link）。
export function inlineCssLinks(html, getCss) {
  const linkRe = /<link\b[^>]*\brel="stylesheet"[^>]*>/g;
  let out = html;
  let inlined = 0;
  let bytes = 0;
  for (const link of html.match(linkRe) || []) {
    const m = link.match(/href="[^"]*\/_astro\/([^"]+\.css)"/);
    if (!m) continue;
    const css = getCss(m[1]);
    if (css == null) continue;
    out = out.replace(link, `<style>${css}</style>`);
    inlined++;
    bytes += css.length;
  }
  return { html: out, inlined, bytes };
}
