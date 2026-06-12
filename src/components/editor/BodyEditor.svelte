<script>
  import { onMount, onDestroy } from 'svelte';
  import { getToken } from '@/utils/editor/token';
  import { uploadImage } from '@/utils/editor/image-upload';
  import { compressImage } from '@/utils/editor/image-compress';
  import ImagePicker from './ImagePicker.svelte';

  let { value = '', slug = '', title = '', onchange } = $props();

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
    aiBtn.style.cssText = 'font-family:inherit;font-size:12px;font-weight:600;color:#1a3a5a;background:none;border:none;cursor:pointer;padding:0 4px;';
    aiBtn.addEventListener('click', () => { showPicker = true; });

    editor = new Editor({
      el,
      height: '100%',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      initialValue: value,
      usageStatistics: false,
      toolbarItems: [
        ['heading', 'bold', 'italic'],
        ['link', 'ul', 'ol', 'quote'],
        ['image'],
        [{ name: 'aiImage', tooltip: 'AI 生成 / 找圖庫 / 上傳 / 既有圖庫', el: aiBtn }],
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
            const url = await uploadImage({ blob: compressed, slug, token: getToken(), timestamp: Date.now() });
            callback(url, '');
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
      if (result.source === 'stock' || result.source === 'library') {
        url = result.url; // 外部 URL / 站內路徑直接用
      } else {
        // generated | uploaded：壓縮後上傳 public/images
        const compressed = await compressImage(result.blob, { maxWidth: 1280, mime: 'image/webp', quality: 0.82 });
        url = await uploadImage({ blob: compressed, slug, token: getToken(), timestamp: Date.now() });
      }
      editor?.exec('addImage', { imageUrl: url, altText: '' });
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
  .et-body-editor { min-height: 20rem; }
</style>
