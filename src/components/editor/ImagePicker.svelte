<script>
  import { getToken } from '@/utils/editor/token';
  import { b64ToBlob } from '@/utils/editor/image-upload';
  import { AI_WORKER as WORKER } from '@/utils/editor/ai-worker';

  // onpick(result)：{ source:'generated', blob, mime, previewUrl }
  // size：'landscape'（封面預設）| 'square' | 'portrait'
  let { initialPrompt = '', size = 'landscape', onpick, onclose } = $props();

  let tab = $state('generate'); // 目前僅 AI 生成（Phase 1）
  let prompt = $state(initialPrompt);
  let model = $state('openai'); // 'openai'（gpt-image-2）| 'flux'
  let busy = $state(false);
  let error = $state('');
  // 生成候選累加（re-roll 比較用）；selected 指向其中一張
  let candidates = $state([]); // { b64, mime, previewUrl }
  let selected = $state(null);
  let genCount = $derived(candidates.length);

  async function generate() {
    if (!prompt.trim()) { error = '請先輸入或調整描述（prompt）'; return; }
    const token = getToken();
    if (!token) { error = '請先登入管理者帳號再生圖'; return; }
    if (genCount >= 10 && !confirm(`本次已生成 ${genCount} 張（每張都會計費），確定再生一張？`)) return;
    busy = true; error = '';
    try {
      const res = await fetch(`${WORKER}/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, model, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `生圖失敗（${res.status}）`);
      const cand = { b64: data.b64, mime: data.mime, previewUrl: `data:${data.mime};base64,${data.b64}` };
      candidates = [...candidates, cand];
      selected = cand; // 新生成的自動選取
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }

  function use() {
    if (!selected) return;
    onpick?.({ source: 'generated', blob: b64ToBlob(selected.b64, selected.mime), mime: selected.mime, previewUrl: selected.previewUrl });
  }
</script>

<div class="ip-overlay" role="dialog" aria-modal="true">
  <div class="ip-panel">
    <header class="ip-head">
      <strong>選擇圖片</strong>
      <nav class="ip-tabs">
        <button class:active={tab === 'generate'} onclick={() => (tab = 'generate')}>AI 生成</button>
        <!-- Phase 2/3：AI 找圖庫、上傳、圖庫 -->
      </nav>
      <button class="ip-x" onclick={onclose} aria-label="關閉">✕</button>
    </header>

    {#if tab === 'generate'}
      <div class="ip-gen">
        <label class="ip-field">
          <span>描述（prompt）</span>
          <textarea bind:value={prompt} rows="3" placeholder="描述你想要的封面畫面，例如：簡約編輯風插畫，一個人在下圍棋，沉穩色調"></textarea>
        </label>
        <div class="ip-controls">
          <label class="ip-model">
            <span>模型</span>
            <select bind:value={model}>
              <option value="openai">OpenAI（image2）</option>
              <option value="flux">Flux</option>
            </select>
          </label>
          <button class="ip-gen-btn" onclick={generate} disabled={busy}>
            {busy ? '生成中…' : genCount ? '再畫一張' : '生成'}
          </button>
          {#if genCount}<span class="ip-count">本次已生成 {genCount} 張</span>{/if}
        </div>

        {#if error}<p class="ip-error">{error}</p>{/if}

        {#if candidates.length}
          <div class="ip-strip">
            {#each candidates as c, i}
              <button class="ip-thumb" class:sel={selected === c} onclick={() => (selected = c)} title="第 {i + 1} 張">
                <img src={c.previewUrl} alt="候選 {i + 1}" />
              </button>
            {/each}
          </div>
          <div class="ip-actions">
            <button class="ip-use" onclick={use} disabled={!selected}>用這張</button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .ip-overlay {
    position: fixed; inset: 0; z-index: 60;
    background: rgba(0, 0, 0, 0.5);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .ip-panel {
    background: white; border-radius: var(--radius-md, 8px);
    width: min(720px, 100%); max-height: 90vh; overflow: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
  .ip-head { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-fog, #e5e5e5); }
  .ip-head strong { font-family: var(--font-ui); }
  .ip-tabs { display: flex; gap: 0.25rem; flex: 1; }
  .ip-tabs button { font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); padding: 0.3rem 0.7rem; border: 1px solid var(--color-fog, #e5e5e5); border-radius: 20px; background: white; cursor: pointer; }
  .ip-tabs button.active { background: var(--color-ink, #1a2a3a); color: white; border-color: var(--color-ink, #1a2a3a); }
  .ip-x { border: none; background: none; font-size: 1.1rem; cursor: pointer; color: var(--color-ink, #333); }
  .ip-gen { padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
  .ip-field { display: flex; flex-direction: column; gap: 0.3rem; }
  .ip-field span, .ip-model span { font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); font-weight: 600; }
  .ip-gen textarea { width: 100%; box-sizing: border-box; font-family: var(--font-ui); font-size: var(--text-body, 1rem); border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); padding: 0.5rem 0.65rem; resize: vertical; }
  .ip-controls { display: flex; align-items: end; gap: 0.75rem; flex-wrap: wrap; }
  .ip-model { display: flex; flex-direction: column; gap: 0.3rem; }
  .ip-model select { font-family: var(--font-ui); padding: 0.45rem 0.6rem; border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); }
  .ip-gen-btn { font-family: var(--font-ui); font-weight: 600; padding: 0.5rem 1.1rem; border: none; border-radius: var(--radius-sm, 4px); background: var(--appi-brand, #1a3a5a); color: white; cursor: pointer; }
  .ip-gen-btn:disabled { opacity: 0.6; cursor: default; }
  .ip-count { font-family: var(--font-ui); font-size: var(--text-xs, 0.75rem); color: var(--color-ink-2, #666); }
  .ip-error { color: var(--color-coral, #c0392b); font-family: var(--font-ui); font-size: var(--text-meta, 0.85rem); margin: 0; white-space: pre-wrap; }
  .ip-strip { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .ip-thumb { border: 2px solid transparent; border-radius: var(--radius-sm, 4px); padding: 0; cursor: pointer; background: none; line-height: 0; overflow: hidden; }
  .ip-thumb.sel { border-color: var(--appi-accent, #a87515); }
  .ip-thumb img { width: 140px; height: 94px; object-fit: cover; display: block; }
  .ip-actions { display: flex; justify-content: flex-end; }
  .ip-use { font-family: var(--font-ui); font-weight: 600; padding: 0.5rem 1.4rem; border: none; border-radius: var(--radius-sm, 4px); background: var(--appi-accent, #a87515); color: white; cursor: pointer; }
  .ip-use:disabled { opacity: 0.5; cursor: default; }
</style>
