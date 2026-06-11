<script>
  import yaml from 'js-yaml';
  import { CORE_FIELDS, CORE_KEYS } from '@/utils/editor/article-schema';

  // frontmatter：完整物件；onchange(next) 回傳完整物件
  let { frontmatter, authors = [], onchange } = $props();

  // 進階 YAML：非核心 key 的子物件，序列化成 YAML 字串供編輯
  function advObject(fm) {
    const o = {};
    for (const k of Object.keys(fm)) if (!CORE_KEYS.includes(k)) o[k] = fm[k];
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
      // 合併：保留核心 key，覆寫非核心
      const core = {};
      for (const k of CORE_KEYS) if (k in frontmatter) core[k] = frontmatter[k];
      onchange({ ...core, ...(adv || {}) });
    } catch (e) {
      advError = 'YAML 格式錯誤：' + e.message;
    }
  }
  function tagsToText(v) { return Array.isArray(v) ? v.join(', ') : (v ?? ''); }
  function textToTags(t) { return t.split(',').map((s) => s.trim()).filter(Boolean); }
</script>

<div class="et-fields">
  {#each CORE_FIELDS as f}
    <label class:full={f.full}>
      <span>{f.label}{#if f.required}<em> *</em>{/if}</span>
      {#if f.type === 'textarea'}
        <textarea value={frontmatter[f.key] ?? ''} oninput={(e) => setCore(f.key, e.currentTarget.value)}></textarea>
        {#if f.maxLength}<small>{String(frontmatter[f.key] ?? '').length} / {f.maxLength}</small>{/if}
      {:else if f.type === 'enum'}
        <select value={frontmatter[f.key] ?? ''} onchange={(e) => setCore(f.key, e.currentTarget.value)}>
          <option value="" disabled>— 選擇 —</option>
          {#each f.options as opt}<option value={opt.value}>{opt.label}</option>{/each}
        </select>
      {:else if f.type === 'bool'}
        <input type="checkbox" checked={!!frontmatter[f.key]} onchange={(e) => setCore(f.key, e.currentTarget.checked)} />
      {:else if f.type === 'tags'}
        <input value={tagsToText(frontmatter[f.key])} oninput={(e) => setCore(f.key, textToTags(e.currentTarget.value))} placeholder="逗號分隔" />
      {:else if f.type === 'date'}
        <input type="date" value={String(frontmatter[f.key] ?? '').slice(0, 10)} oninput={(e) => setCore(f.key, e.currentTarget.value)} />
      {:else}
        <input value={frontmatter[f.key] ?? ''} oninput={(e) => setCore(f.key, e.currentTarget.value)} />
      {/if}
    </label>
  {/each}

  <details class="et-adv">
    <summary>進階欄位（YAML）</summary>
    <textarea class="et-adv-yaml" value={advText} oninput={(e) => onAdvInput(e.currentTarget.value)}></textarea>
    {#if advError}<small class="et-adv-err">{advError}</small>{/if}
  </details>
</div>

<style>
  /* 2 欄 grid：標題、描述（.full）與進階區跨整列，其餘欄位左右各 50% 省版面 */
  .et-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1rem;
    align-items: start;
  }
  .et-fields label { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
  .et-fields label.full { grid-column: 1 / -1; }
  .et-fields span { font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; color: var(--color-ink); }
  .et-fields em { color: var(--color-coral); font-style: normal; }
  .et-fields :is(input, textarea, select) {
    width: 100%; box-sizing: border-box;
    font-family: var(--font-ui); font-size: var(--text-body); color: var(--color-ink);
    background: white; border: 1px solid var(--color-fog); border-radius: var(--radius-sm); padding: 0.5rem 0.65rem;
  }
  .et-fields input[type="checkbox"] { width: auto; align-self: start; }
  .et-fields textarea { min-height: 4rem; resize: vertical; }
  .et-adv { grid-column: 1 / -1; }
  .et-adv summary { cursor: pointer; font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; }
  /* 提高 specificity 蓋過 .et-fields textarea 的 4rem min-height */
  .et-fields .et-adv-yaml { width: 100%; box-sizing: border-box; min-height: 16rem; margin-top: 0.4rem; resize: vertical; font-family: ui-monospace, monospace; }
  .et-adv-err { color: var(--color-coral); }

  @media (max-width: 560px) {
    .et-fields { grid-template-columns: 1fr; }
  }
</style>
