# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## 本 repo 特記（appi.news）

- 本 repo 已有一套等價的「為什麼」文件：**重大決策與踩坑正本在 [`docs/lessons/`](../lessons/)**（索引＝`docs/lessons/README.md`），規則入口在 repo 根目錄 `CLAUDE.md` 與 `README.md`。動手前先讀 `CLAUDE.md` 的「維護情境路由」與「真實來源指標」兩表。
- 未來若寫 ADR，放 `docs/adr/`；與 lessons 的分工＝ADR 記「決定了什麼架構」、lessons 記「踩了什麼坑」。相近主題別重複，互相連結即可。

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
