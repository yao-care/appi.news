<script>
  // value：作者 id；authors：[{ id, name }]；onchange(id)
  let { value = '', authors = [], onchange } = $props();

  let open = $state(false);
  let query = $state('');
  let activeName = $derived(authors.find((a) => a.id === value)?.name ?? value ?? '');

  // 輸入框顯示：開啟時顯示搜尋字、關閉時顯示選定作者名
  let display = $derived(open ? query : activeName);

  let filtered = $derived(
    query.trim()
      ? authors.filter((a) => a.name.includes(query.trim()) || a.id.includes(query.trim()))
      : authors,
  );

  function openList() {
    query = activeName;
    open = true;
  }
  function pick(a) {
    onchange?.(a.id);
    open = false;
    query = '';
  }
  function onBlur() {
    // 延遲關閉，讓 click 先觸發
    setTimeout(() => { open = false; query = ''; }, 150);
  }
</script>

<div class="as">
  <input
    class="as-input"
    value={display}
    placeholder="搜尋或選擇作者"
    onfocus={openList}
    oninput={(e) => { query = e.currentTarget.value; open = true; }}
    onblur={onBlur}
    autocomplete="off"
  />
  {#if open && filtered.length}
    <ul class="as-list" role="listbox">
      {#each filtered as a}
        <li>
          <button type="button" class="as-opt" class:sel={a.id === value} onmousedown={() => pick(a)}>
            <span class="as-name">{a.name}</span>
            <span class="as-id">{a.id}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .as { position: relative; }
  .as-input { width: 100%; box-sizing: border-box; font-family: var(--font-ui); font-size: var(--text-body, 1rem); color: var(--color-ink); background: white; border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); padding: 0.5rem 0.65rem; }
  .as-list { position: absolute; z-index: 10; top: calc(100% + 2px); left: 0; right: 0; margin: 0; padding: 0.25rem; list-style: none; background: white; border: 1px solid var(--color-fog, #ccc); border-radius: var(--radius-sm, 4px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); max-height: 220px; overflow: auto; }
  .as-opt { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; width: 100%; text-align: left; background: none; border: none; border-radius: var(--radius-sm, 4px); padding: 0.4rem 0.55rem; cursor: pointer; font-family: var(--font-ui); }
  .as-opt:hover { background: var(--bg-soft, #f3f3f3); }
  .as-opt.sel { background: var(--bg-tint, #eef3f7); }
  .as-name { font-size: var(--text-body, 1rem); color: var(--color-ink); }
  .as-id { font-size: var(--text-xs, 0.72rem); color: var(--color-ink-2, #999); font-family: ui-monospace, monospace; }
</style>
