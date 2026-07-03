<script>
  import { getToken } from '@/utils/editor/token';
  import { slugFromTitle } from '@/utils/editor/slugify';
  import { fetchSuggestedSlug } from '@/utils/editor/slug-suggest';
  import { createArticleIssue } from '@/utils/editor/issue';
  import { CATEGORIES } from '@/config/categories';
  import EditorPanel from './EditorPanel.svelte';

  let { authors = [] } = $props();

  // appi.news 只有 articles 一個可編輯集合
  const collection = 'articles';
  const categories = CATEGORIES;
  let title = $state('');
  let category = $state('health'); // AI 寫作任務的文章分類（消費端 article-write 用它產稿）
  let customSlug = $state('');
  let showAdvanced = $state(false);
  let direction = $state('');
  let sources = $state('');
  let conclusion = $state('');

  let open = $state(false);
  let initialDoc = $state(null);
  let repoPath = $state('');
  let slug = $state('');

  let taskState = $state(''); // '' | 'pending'
  let issueNumber = $state(0);
  let issueUrl = $state('');

  // 決定 slug：自訂有值須合法；否則請 AI 產語意化英文 slug，失敗才退回拼音。不合法回 null（已 alert）。
  async function resolveSlug() {
    if (!title.trim()) { alert('請先填標題'); return null; }
    const c = customSlug.trim();
    if (c) {
      if (!/^[a-z0-9-]+$/.test(c)) { alert('自訂網址只能用小寫英文、數字與連字號，例如 vitamin-c-myth'); return null; }
      return c;
    }
    try {
      return await fetchSuggestedSlug({ title: title.trim(), direction, sources, token: getToken() });
    } catch {
      // AI 不可用時退回拼音，確保流程不中斷
      return slugFromTitle(title.trim());
    }
  }

  async function start() {
    const s = await resolveSlug();
    if (!s) return;
    slug = s;
    repoPath = `src/content/${collection}/${slug}.md`;
    initialDoc = {
      frontmatter: { title: title.trim(), description: '', publishDate: new Date().toISOString().slice(0, 10) },
      body: '',
    };
    open = true;
  }

  async function createTask() {
    if (!category) { alert('請先選分類'); return; }
    const s = await resolveSlug();
    if (!s) return;
    slug = s;
    try {
      const issue = await createArticleIssue({ collection, category, title: title.trim(), slug, direction, sources, conclusion, token: getToken() });
      issueNumber = issue.number;
      issueUrl = issue.url;
      taskState = 'pending';
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  function closeTask() {
    taskState = '';
  }
</script>

{#if getToken()}
  {#if open}
    <EditorPanel {repoPath} {collection} {slug} {initialDoc} {authors} onclose={() => (open = false)} />
  {:else if taskState === 'pending'}
    <section class="et-new">
      <h2>AI 寫作任務</h2>
      <p class="et-task-msg">✍️ 已建立寫作任務（Issue #{issueNumber}，撰寫中）…</p>
      <p class="et-new-note">
        AI 正走 newsroom 正規產線撰寫（含配圖與連結查證），完成後會<strong>開一個 PR</strong> 供你審查合併，
        並在 Slack dev 頻道回報。你可以直接關閉這個視窗。
        <a href={issueUrl} target="_blank" rel="noopener noreferrer">查看 Issue →</a>
      </p>
      <button class="et-create" onclick={closeTask}>關閉</button>
    </section>
  {:else}
    <section class="et-new">
      <h2>新增文章</h2>
      <label>
        <span>標題</span>
        <input placeholder="例：維他命 C 的劑型迷思" bind:value={title} />
      </label>

      <button type="button" class="et-adv-toggle" onclick={() => (showAdvanced = !showAdvanced)}>
        {showAdvanced ? '▾' : '▸'} 進階選項
      </button>
      {#if showAdvanced}
        <label>
          <span>自訂網址（slug）</span>
          <input placeholder="留空則由標題自動產生" bind:value={customSlug} />
          <small>選填；只能用小寫英文、數字、連字號。留空會由 AI 依標題產生語意化英文網址（AI 不可用時退回拼音）。</small>
        </label>
        <fieldset class="et-ai-task">
          <legend>AI 代寫（選填，交給 Claude Code 撰寫）</legend>
          <label>
            <span>分類</span>
            <select bind:value={category}>
              {#each categories as c (c.slug)}
                <option value={c.slug}>{c.name}</option>
              {/each}
            </select>
            <small>AI 產稿的文章分類；決定頻道歸屬與子分類選項。</small>
          </label>
          <label><span>寫作方向</span><textarea bind:value={direction}></textarea></label>
          <label><span>參考資料源</span><textarea bind:value={sources}></textarea></label>
          <label><span>想表達的結論</span><textarea bind:value={conclusion}></textarea></label>
          <button class="et-create" onclick={createTask}>建立 AI 寫作任務</button>
        </fieldset>
      {/if}

      <button class="et-create" onclick={start}>建立並編輯</button>
    </section>
  {/if}
{/if}

<style>
  .et-new {
    margin-top: clamp(1.5rem, 1rem + 2vw, 2.5rem);
    padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: color-mix(in oklch, var(--color-paper) 55%, white);
    border: 1px solid var(--color-fog);
    border-radius: var(--radius-card);
    color: var(--color-ink);
  }
  .et-new h2 { font-size: var(--text-h3); margin: 0; }
  .et-new label { display: flex; flex-direction: column; gap: 0.25rem; }
  .et-new span { font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; }
  .et-new small,
  .et-new-note { font-size: var(--text-badge); color: color-mix(in oklch, var(--color-ink) 55%, var(--color-paper)); }
  .et-new-note { margin: 0; }
  .et-task-msg { margin: 0; font-family: var(--font-ui); font-weight: 700; color: var(--color-teal); }
  .et-new :is(input, select, textarea) {
    font-family: var(--font-ui);
    font-size: var(--text-body);
    color: var(--color-ink);
    background: white;
    border: 1px solid var(--color-fog);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.65rem;
  }
  .et-new textarea { min-height: 3.5rem; resize: vertical; }
  .et-new :is(input, select, textarea):focus-visible { outline: 2px solid var(--color-teal); outline-offset: 1px; }
  .et-adv-toggle {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0.25rem 0;
    font-family: var(--font-ui);
    font-size: var(--text-meta);
    font-weight: 600;
    color: var(--color-teal);
    cursor: pointer;
  }
  .et-ai-task {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--color-fog);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    margin: 0;
  }
  .et-ai-task legend { font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; padding: 0 0.4rem; }
  .et-create {
    align-self: flex-start;
    min-height: 44px;
    padding: 0.6rem 1.25rem;
    border: 1px solid var(--color-teal);
    border-radius: var(--radius-pill);
    font-family: var(--font-ui);
    font-size: var(--text-meta);
    font-weight: 600;
    color: white;
    background: var(--color-teal);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .et-create:hover { background: var(--color-teal-hover); border-color: var(--color-teal-hover); }
  .et-create:focus-visible { outline: 2px solid var(--color-coral); outline-offset: 2px; }
</style>
