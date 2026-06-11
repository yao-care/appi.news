<script>
  import { getToken } from '@/utils/editor/token';
  import { uploadImage } from '@/utils/editor/image-upload';
  import ImagePicker from './ImagePicker.svelte';

  // frontmatter：完整物件；onchange(next) 回傳完整物件（與 SeoFields 一致）
  let { frontmatter, slug = '', onchange } = $props();

  let showPicker = $state(false);
  let uploading = $state(false);
  let uploadError = $state('');
  let sessionPreview = $state(''); // 剛上傳的 object URL，當場顯示不等部署

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

  let coverImage = $derived(frontmatter.coverImage ?? '');
  let coverAlt = $derived(frontmatter.coverAlt ?? '');

  // 預覽來源：本階段剛上傳 > 外部絕對 URL > 站內路徑（補 BASE）
  let previewSrc = $derived(
    sessionPreview ? sessionPreview
    : !coverImage ? ''
    : /^https?:\/\//.test(coverImage) ? coverImage
    : `${BASE}${coverImage}`,
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
      const url = await uploadImage({ blob: result.blob, slug, token: getToken(), timestamp: Date.now(), dir: 'covers' });
      sessionPreview = result.previewUrl; // 當場預覽（記憶體圖），不等部署
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
  <div class="cf-body">
    {#if previewSrc}
      <img class="cf-thumb" src={previewSrc} alt={coverAlt || '封面預覽'} />
    {:else}
      <div class="cf-empty">尚無封面</div>
    {/if}
    <div class="cf-side">
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
  </div>
</div>

{#if showPicker}
  <ImagePicker {initialPrompt} size="landscape" {onpick} onclose={() => (showPicker = false)} />
{/if}

<style>
  .cf { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem; }
  .cf-label { font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); font-weight: 600; color: var(--color-ink); }
  .cf-body { display: flex; gap: 1rem; align-items: start; }
  .cf-thumb { width: 180px; height: 120px; object-fit: cover; border-radius: var(--radius-sm, 4px); border: 1px solid var(--color-fog, #e5e5e5); background: var(--bg-soft, #f5f5f5); }
  .cf-empty { width: 180px; height: 120px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); color: var(--color-ink-2, #888); font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); }
  .cf-side { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 0; }
  .cf-btns { display: flex; gap: 0.5rem; }
  .cf-choose { font-family: var(--font-ui); font-weight: 600; padding: 0.45rem 1rem; border: none; border-radius: var(--radius-sm, 4px); background: var(--appi-brand, #1a3a5a); color: white; cursor: pointer; }
  .cf-choose:disabled { opacity: 0.6; cursor: default; }
  .cf-remove { font-family: var(--font-ui); padding: 0.45rem 0.8rem; border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); background: white; cursor: pointer; }
  .cf-alt { display: flex; flex-direction: column; gap: 0.25rem; }
  .cf-alt span { font-family: var(--font-ui); font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--color-ink-2, #555); }
  .cf-alt input { width: 100%; box-sizing: border-box; font-family: var(--font-ui); border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); padding: 0.45rem 0.6rem; }
  .cf-err { color: var(--color-coral, #c0392b); font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); margin: 0; }
</style>
