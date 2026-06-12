<script>
  import { onMount } from 'svelte';
  import yaml from 'js-yaml';
  import { CORE_KEYS } from '@/utils/editor/article-schema';
  import { CATEGORIES } from '@/config/categories';
  import { getToken } from '@/utils/editor/token';
  import { fetchSuggestedTags, mergeTags } from '@/utils/editor/tags-suggest';
  import CoverField from './CoverField.svelte';
  import AuthorSelect from './AuthorSelect.svelte';

  // frontmatter：完整物件；onchange(next) 回傳完整物件
  // authors：[{id,name}]；body：內文（給 AI 推薦標籤）；defaultAuthorId：GitHub 登入對應的作者 id
  let { frontmatter, slug = '', authors = [], body = '', defaultAuthorId = '', onchange } = $props();

  // 由 widget 直接處理、不進「進階 YAML」的 key（含封面欄位）
  const HANDLED_KEYS = [...CORE_KEYS, 'coverImage', 'coverAlt', 'coverImageCredit'];

  const STATUS_ALL = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已發佈' },
    { value: 'scheduled', label: '排程' },
    { value: 'archived', label: '封存' },
  ];

  // 進階 YAML：非 HANDLED key 的子物件，序列化成 YAML 字串供編輯
  function advObject(fm) {
    const o = {};
    for (const k of Object.keys(fm)) if (!HANDLED_KEYS.includes(k)) o[k] = fm[k];
    return o;
  }
  let advText = $state(yaml.dump(advObject(frontmatter), { lineWidth: -1, forceQuotes: false }));
  let advError = $state('');

  function setCore(key, value) {
    onchange({ ...frontmatter, [key]: value });
  }
  function onAdvInput(text) {
    advText = text;
    try {
      const adv = text.trim() ? yaml.load(text) : {};
      advError = '';
      // 合併：保留 HANDLED key，覆寫其餘
      const kept = {};
      for (const k of HANDLED_KEYS) if (k in frontmatter) kept[k] = frontmatter[k];
      onchange({ ...kept, ...(adv || {}) });
    } catch (e) {
      advError = 'YAML 格式錯誤：' + e.message;
    }
  }
  function tagsToText(v) { return Array.isArray(v) ? v.join(', ') : (v ?? ''); }
  function textToTags(t) { return t.split(',').map((s) => s.trim()).filter(Boolean); }

  // 狀態選項：發佈日期早於今天 → 只剩「已發佈」可選
  let isPast = $derived.by(() => {
    const pd = frontmatter.publishDate;
    if (!pd) return false;
    const d = new Date(pd);
    return !isNaN(d.getTime()) && d < new Date(new Date().toDateString());
  });
  let statusOptions = $derived(isPast ? STATUS_ALL.filter((o) => o.value === 'published') : STATUS_ALL);

  // 過去日期但狀態非「已發佈」→ 自動修正（避免排程到過去）
  $effect(() => {
    if (isPast && frontmatter.status && frontmatter.status !== 'published') {
      setCore('status', 'published');
    }
  });

  // 新文章預設作者帶入 GitHub 登入對應的作者
  onMount(() => {
    if (!frontmatter.author && defaultAuthorId) setCore('author', defaultAuthorId);
  });

  // AI 推薦標籤
  let tagsBusy = $state(false);
  let tagsError = $state('');
  async function recommendTags() {
    const token = getToken();
    if (!token) { tagsError = '請先登入管理者帳號'; return; }
    tagsBusy = true; tagsError = '';
    try {
      const suggested = await fetchSuggestedTags({ title: frontmatter.title ?? '', body, token });
      setCore('tags', mergeTags(Array.isArray(frontmatter.tags) ? frontmatter.tags : [], suggested));
    } catch (e) {
      tagsError = e instanceof Error ? e.message : String(e);
    } finally {
      tagsBusy = false;
    }
  }
</script>

<div class="ef">
  <!-- 上方全寬：標題、描述 -->
  <label class="ef-full">
    <span>標題<em> *</em></span>
    <input value={frontmatter.title ?? ''} oninput={(e) => setCore('title', e.currentTarget.value)} />
  </label>
  <label class="ef-full">
    <span>描述（摘要）<em> *</em></span>
    <textarea value={frontmatter.description ?? ''} oninput={(e) => setCore('description', e.currentTarget.value)}></textarea>
    <small>{String(frontmatter.description ?? '').length} / 160</small>
  </label>

  <!-- 中段左右兩欄 -->
  <div class="ef-cols">
    <div class="ef-left">
      <CoverField {frontmatter} {slug} {body} onchange={(fm) => onchange(fm)} />
    </div>

    <div class="ef-right">
      <label>
        <span>分類<em> *</em></span>
        <select value={frontmatter.category ?? ''} onchange={(e) => setCore('category', e.currentTarget.value)}>
          <option value="" disabled>— 選擇 —</option>
          {#each CATEGORIES as c}<option value={c.slug}>{c.name}</option>{/each}
        </select>
      </label>

      <label>
        <span class="ef-tags-head">標籤
          <button type="button" class="ef-tag-ai" onclick={recommendTags} disabled={tagsBusy}>
            {tagsBusy ? '推薦中…' : '從內文推薦標籤'}
          </button>
        </span>
        <input value={tagsToText(frontmatter.tags)} oninput={(e) => setCore('tags', textToTags(e.currentTarget.value))} placeholder="逗號分隔" />
        {#if tagsError}<small class="ef-err">{tagsError}</small>{/if}
      </label>

      <label>
        <span>發佈日期<em> *</em></span>
        <input type="date" value={String(frontmatter.publishDate ?? '').slice(0, 10)} oninput={(e) => setCore('publishDate', e.currentTarget.value)} />
      </label>

      <label>
        <span>作者</span>
        <AuthorSelect value={frontmatter.author ?? ''} {authors} onchange={(id) => setCore('author', id)} />
      </label>

      <label>
        <span>狀態</span>
        <select value={frontmatter.status ?? ''} onchange={(e) => setCore('status', e.currentTarget.value)}>
          <option value="" disabled>— 選擇 —</option>
          {#each statusOptions as o}<option value={o.value}>{o.label}</option>{/each}
        </select>
      </label>

      <div class="ef-checks">
        <label class="ef-check"><input type="checkbox" checked={!!frontmatter.featured} onchange={(e) => setCore('featured', e.currentTarget.checked)} /> 精選</label>
        <label class="ef-check"><input type="checkbox" checked={!!frontmatter.hero} onchange={(e) => setCore('hero', e.currentTarget.checked)} /> 首頁顯示</label>
      </div>
    </div>
  </div>

  <details class="ef-adv">
    <summary>進階欄位（YAML）</summary>
    <textarea class="ef-adv-yaml" value={advText} oninput={(e) => onAdvInput(e.currentTarget.value)}></textarea>
    {#if advError}<small class="ef-err">{advError}</small>{/if}
  </details>
</div>

<style>
  .ef { display: flex; flex-direction: column; gap: 0.75rem; }
  .ef label { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
  .ef span { font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; color: var(--color-ink); }
  .ef em { color: var(--color-coral); font-style: normal; }
  .ef :is(input, textarea, select) {
    width: 100%; box-sizing: border-box;
    font-family: var(--font-ui); font-size: var(--text-body); color: var(--color-ink);
    background: white; border: 1px solid var(--color-fog); border-radius: var(--radius-sm); padding: 0.5rem 0.65rem;
  }
  .ef textarea { min-height: 4rem; resize: vertical; }
  .ef small { font-size: var(--text-xs, 0.72rem); color: var(--color-ink-2, #777); }
  .ef-err { color: var(--color-coral); }

  /* 左右兩欄；左欄封面高度由右欄撐開（stretch） */
  .ef-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; align-items: stretch; }
  .ef-left { display: flex; flex-direction: column; }
  .ef-right { display: flex; flex-direction: column; gap: 0.6rem; }

  .ef-tags-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .ef-tag-ai { font-family: var(--font-ui); font-size: var(--text-xs, 0.72rem); font-weight: 600; padding: 0.2rem 0.6rem; border: 1px solid var(--appi-brand, #1a3a5a); border-radius: 20px; background: white; color: var(--appi-brand, #1a3a5a); cursor: pointer; }
  .ef-tag-ai:disabled { opacity: 0.6; cursor: default; }

  .ef-checks { display: flex; gap: 1.25rem; align-items: center; margin-top: 0.2rem; }
  .ef-check { flex-direction: row; align-items: center; gap: 0.4rem; }
  .ef-check input { width: auto; }

  .ef-adv summary { cursor: pointer; font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; }
  .ef .ef-adv-yaml { width: 100%; box-sizing: border-box; min-height: 14rem; margin-top: 0.4rem; resize: vertical; font-family: ui-monospace, monospace; }

  @media (max-width: 640px) {
    .ef-cols { grid-template-columns: 1fr; }
  }
</style>
