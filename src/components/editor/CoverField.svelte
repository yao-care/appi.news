<script>
  import { getToken } from '@/utils/editor/token';
  import { uploadImage } from '@/utils/editor/image-upload';
  import { compressImage } from '@/utils/editor/image-compress';
  import { asset } from '@/utils/url';
  import ImagePicker from './ImagePicker.svelte';

  // frontmatter：完整物件；onchange(next) 回傳完整物件（與 SeoFields 一致）
  let { frontmatter, slug = '', onchange } = $props();

  let showPicker = $state(false);
  let uploading = $state(false);
  let uploadError = $state('');
  let sessionPreview = $state(''); // 剛上傳的 object URL，當場顯示不等部署

  let coverImage = $derived(frontmatter.coverImage ?? '');
  let coverAlt = $derived(frontmatter.coverAlt ?? '');

  // 預覽來源：本階段剛上傳 > 用 asset() 解析（與文章頁同邏輯：絕對 URL 原樣、相對補 BASE 並收斂斜線）
  // 修正：舊資料的 coverImage 可能無開頭斜線（如 "covers/wp-134.jpg"），手動串接會缺斜線而壞圖。
  let previewSrc = $derived(
    sessionPreview ? sessionPreview : !coverImage ? '' : asset(coverImage),
  );

  function setField(key, value) {
    onchange({ ...frontmatter, [key]: value });
  }

  // prompt 預填：用標題引導，作者可改
  let initialPrompt = $derived(
    frontmatter.title ? `${frontmatter.title}：簡約編輯風新聞封面插畫，沉穩色調，無文字` : '',
  );

  async function onpick(result) {
    if (result.source !== 'generated') return;
    uploading = true; uploadError = '';
    try {
      // 壓縮：封面縮到 ≤1280 寬、轉 WebP，避免 ~3.3MB 生成圖拖慢網站
      const compressed = await compressImage(result.blob, { maxWidth: 1280, mime: 'image/webp', quality: 0.82 });
      const url = await uploadImage({ blob: compressed, slug, token: getToken(), timestamp: Date.now(), dir: 'covers' });
      sessionPreview = URL.createObjectURL(compressed); // 當場預覽壓縮後實際上傳的圖
      onchange({ ...frontmatter, coverImage: url });
      showPicker = false;
    } catch (e) {
      uploadError = e instanceof Error ? e.message : String(e);
    } finally {
      uploading = false;
    }
  }

  function removeCover() {
    sessionPreview = '';
    onchange({ ...frontmatter, coverImage: '' });
  }
</script>

<div class="cf">
  <span class="cf-label">封面圖</span>
  {#if previewSrc}
    <img class="cf-preview" src={previewSrc} alt={coverAlt || '封面預覽'} />
  {:else}
    <div class="cf-preview cf-empty">尚無封面</div>
  {/if}
  <div class="cf-btns">
    <button type="button" class="cf-choose" onclick={() => (showPicker = true)} disabled={uploading}>
      {uploading ? '上傳中…' : coverImage ? '更換封面' : '選擇封面'}
    </button>
    {#if coverImage}<button type="button" class="cf-remove" onclick={removeCover}>移除</button>{/if}
  </div>
  <label class="cf-alt">
    <span>替代文字（alt）</span>
    <input value={coverAlt} oninput={(e) => setField('coverAlt', e.currentTarget.value)} placeholder="描述封面內容，無障礙用" />
  </label>
  {#if uploadError}<p class="cf-err">{uploadError}</p>{/if}
</div>

{#if showPicker}
  <ImagePicker {initialPrompt} size="landscape" {onpick} onclose={() => (showPicker = false)} />
{/if}

<style>
  /* 整體填滿左欄高度：預覽撐開 (flex:1)，按鈕與 alt 固定在下 */
  .cf { display: flex; flex-direction: column; gap: 0.4rem; height: 100%; }
  .cf-label { font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); font-weight: 600; color: var(--color-ink); }
  .cf-preview { flex: 1 1 auto; width: 100%; min-height: 150px; object-fit: cover; border-radius: var(--radius-sm, 4px); border: 1px solid var(--color-fog, #e5e5e5); background: var(--bg-soft, #f5f5f5); }
  .cf-empty { display: flex; align-items: center; justify-content: center; border-style: dashed; color: var(--color-ink-2, #888); font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); }
  .cf-btns { display: flex; gap: 0.5rem; }
  .cf-choose { font-family: var(--font-ui); font-weight: 600; padding: 0.45rem 1rem; border: none; border-radius: var(--radius-sm, 4px); background: var(--appi-brand, #1a3a5a); color: white; cursor: pointer; }
  .cf-choose:disabled { opacity: 0.6; cursor: default; }
  .cf-remove { font-family: var(--font-ui); padding: 0.45rem 0.8rem; border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); background: white; cursor: pointer; }
  .cf-alt { display: flex; flex-direction: column; gap: 0.25rem; }
  .cf-alt span { font-family: var(--font-ui); font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--color-ink-2, #555); }
  .cf-alt input { width: 100%; box-sizing: border-box; font-family: var(--font-ui); border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); padding: 0.45rem 0.6rem; }
  .cf-err { color: var(--color-coral, #c0392b); font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); margin: 0; }
</style>
