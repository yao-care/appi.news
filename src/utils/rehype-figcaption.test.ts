import { describe, it, expect } from 'vitest';
import { applyFigcaption } from './rehype-figcaption.mjs';

/** 建一個 <p><img></p> 段落節點。 */
function paragraphWithImg(props: Record<string, unknown>, extraChildren: unknown[] = []) {
  return {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [
      { type: 'element', tagName: 'img', properties: props, children: [] },
      ...extraChildren,
    ],
  };
}

function root(children: unknown[]) {
  return { type: 'root', children };
}

describe('applyFigcaption', () => {
  it('帶 title 的單圖段落 → figure + figcaption，並移除 title', () => {
    const tree = root([paragraphWithImg({ src: '/a.jpg', alt: '畫面', title: '這是圖說' })]) as any;
    applyFigcaption(tree);
    const fig = tree.children[0];
    expect(fig.tagName).toBe('figure');
    expect(fig.properties.className).toEqual(['article-figure']);
    const [img, cap] = fig.children;
    expect(img.tagName).toBe('img');
    expect(img.properties.title).toBeUndefined(); // title 已移除，避免與圖說重複
    expect(cap.tagName).toBe('figcaption');
    expect(cap.properties.className).toEqual(['article-figcaption']);
    expect(cap.children[0].value).toBe('這是圖說');
  });

  it('圖片前後的空白 text 節點不影響判定', () => {
    const p = paragraphWithImg({ src: '/a.jpg', title: '圖說' }, []);
    p.children.unshift({ type: 'text', value: '\n' });
    p.children.push({ type: 'text', value: '\n  ' });
    const tree = root([p]) as any;
    applyFigcaption(tree);
    expect(tree.children[0].tagName).toBe('figure');
  });

  it('無 title 的圖片段落維持 <p>（不生圖說）', () => {
    const tree = root([paragraphWithImg({ src: '/a.jpg', alt: '無圖說' })]) as any;
    applyFigcaption(tree);
    expect(tree.children[0].tagName).toBe('p');
  });

  it('title 為空字串或純空白時不轉換', () => {
    const tree = root([paragraphWithImg({ src: '/a.jpg', title: '   ' })]) as any;
    applyFigcaption(tree);
    expect(tree.children[0].tagName).toBe('p');
  });

  it('段落含圖片以外的內容（行內圖）不轉換', () => {
    const p = paragraphWithImg({ src: '/a.jpg', title: '圖說' }, [
      { type: 'text', value: '這是一段有文字的段落' },
    ]);
    const tree = root([p]) as any;
    applyFigcaption(tree);
    expect(tree.children[0].tagName).toBe('p');
  });

  it('巢狀結構也會處理（如包在容器 div 內）', () => {
    const tree = root([
      {
        type: 'element',
        tagName: 'div',
        properties: {},
        children: [paragraphWithImg({ src: '/a.jpg', title: '巢狀圖說' })],
      },
    ]) as any;
    applyFigcaption(tree);
    expect(tree.children[0].children[0].tagName).toBe('figure');
  });
});
