<script>
  import { onMount, onDestroy } from 'svelte';
  import { imageUploadName, repoImagePath, publicImageUrl, blobToBase64 } from '@/utils/editor/image-upload';
  import { compressImage } from '@/utils/editor/image-compress';
  import ImagePicker from './ImagePicker.svelte';

  // addPending：登記待提交圖（存檔時與 .md 打包成單一 commit）
  let { value = '', slug = '', title = '', addPending, onchange } = $props();

  let el;
  let editor;
  let lastSet = value; // 防止 外部更新 ↔ change 事件互相觸發成迴圈
  let showPicker = $state(false);

  // Toast UI 的 CSS 以 runtime <link> 注入（指向 public/vendor 的靜態副本），
  // 刻意不走 import()——否則 Astro 會把它收進文章頁 render-blocking 的 route CSS，
  // 害匿名訪客下載 ~170KB 永遠用不到的編輯器樣式。public/vendor/toastui-editor.css
  // 是 node_modules/@toast-ui/editor/dist/toastui-editor.css 的副本（升級 toast 時需同步更新）。
  function ensureToastCss() {
    const id = 'toastui-editor-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/vendor/toastui-editor.css`;
    document.head.appendChild(link);
  }

  onMount(async () => {
    ensureToastCss();
    const { default: Editor } = await import('@toast-ui/editor');

    // 自訂工具列鈕：開 ImagePicker（AI 生成 / 找圖庫 / 上傳 / 圖庫）
    const aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.textContent = '＋AI圖';
    aiBtn.style.cssText = 'font-family:inherit;font-size:12px;font-weight:600;color:#1a3a5a;background:none;border:none;cursor:pointer;padding:0 6px;white-space:nowrap;';
    aiBtn.addEventListener('click', () => { showPicker = true; });

    editor = new Editor({
      el,
      height: '78vh', // TOAST 會把此值設為 el 的 inline height（直接拉高內文編輯區）
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      initialValue: value,
      usageStatistics: false,
      toolbarItems: [
        ['heading', 'bold', 'italic'],
        ['link', 'ul', 'ol', 'quote'],
        ['image', { name: 'aiImage', tooltip: 'AI 生成 / 找圖庫 / 上傳 / 既有圖庫', el: aiBtn }],
      ],
      events: {
        change: () => {
          const md = editor.getMarkdown();
          lastSet = md;
          onchange?.(md);
        },
      },
      hooks: {
        addImageBlobHook: async (blob, callback) => {
          try {
            const compressed = await compressImage(blob, { maxWidth: 1280, mime: 'image/webp', quality: 0.82 });
            const name = imageUploadName(slug, compressed.type, Date.now());
            const publicUrl = publicImageUrl(name);
            addPending?.({ path: repoImagePath(name), base64: await blobToBase64(compressed), publicUrl });
            callback(publicUrl, '');
          } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
          }
          return false;
        },
      },
    });
  });

  // ImagePicker 選定 → 取得 URL → 插入內文
  async function onPick(result) {
    showPicker = false;
    try {
      let url;
      let credit = '';
      if (result.source === 'stock') {
        url = result.url; credit = result.credit || ''; // 外部 URL + 攝影師署名
      } else if (result.source === 'library') {
        url = result.url; // 站內路徑直接用
      } else {
        // generated | uploaded：壓縮後登記待提交（存檔時打包）
        const compressed = await compressImage(result.blob, { maxWidth: 1280, mime: 'image/webp', quality: 0.82 });
        const name = imageUploadName(slug, compressed.type, Date.now());
        url = publicImageUrl(name);
        addPending?.({ path: repoImagePath(name), base64: await blobToBase64(compressed), publicUrl: url });
      }
      editor?.exec('addImage', { imageUrl: url, altText: '' });
      // 圖庫圖署名：把剛插入的 markdown image 換成 <figure> + <figcaption>
      if (credit && editor) {
        const md = editor.getMarkdown();
        const imgMd = `![](${url})`;
        const figure = `<figure>\n  <img src="${url}" alt="">\n  <figcaption>攝影：${credit}</figcaption>\n</figure>`;
        if (md.includes(imgMd)) editor.setMarkdown(md.replace(imgMd, figure));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  $effect(() => {
    if (editor && value !== lastSet) {
      lastSet = value;
      editor.setMarkdown(value ?? '');
    }
  });

  onDestroy(() => editor?.destroy?.());
</script>

<div class="et-body-editor" bind:this={el}></div>

{#if showPicker}
  <ImagePicker
    initialPrompt={title ? `${title}：內文示意插圖，沉穩色調` : ''}
    size="landscape"
    {title}
    body={value}
    exclude={[]}
    onpick={onPick}
    onclose={() => (showPicker = false)}
  />
{/if}

<style>
  /* 內文編輯區拉高到接近滿版。TOAST 會把 height(78vh) 設成 el 的 inline 高度；
     此元件是 modal flex 容器裡的可收縮子項，需 flex-shrink:0 才不會被壓回 min-height。 */
  .et-body-editor { height: 78vh; min-height: 22rem; flex-shrink: 0; }
</style>
