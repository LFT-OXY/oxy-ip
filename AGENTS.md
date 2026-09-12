<!-- ATW:START -->

# ATW Instructions

These instructions are for AI assistants working in this project.

This project is managed by ATW. The working knowledge you need lives under `.atw/`:

- `.atw/workflow.md` — development phases, when to create tasks, skill routing
- `.atw/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.atw/workspace/` — per-developer journals and session traces
- `.atw/tasks/` — active and archived tasks (PRDs, research, jsonl context)

ATW commands are written by bare name throughout `.atw/` — `start`, `continue`, `finish-work`. The prefix that invokes them is your platform's, not ATW's: Claude Code uses `/atw:`, Cursor and Pi `/atw-`, Codex `$`, Copilot a plain `/`, and a few hosts expose them as skills instead. Prefer an available ATW command over manual steps; not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:

- `.agents/skills/` — reusable ATW skills
- `.codex/agents/` — optional custom subagents

Managed by ATW. Edits outside this block are preserved; edits inside may be overwritten by a future `atw update`.

<!-- ATW:END -->

## Agent skills

### Issue tracker

事项仅保存在 `.atw/tasks/<task>/`，不向 GitHub 同步。发布、读取或分诊事项前，读取 `docs/agents/issue-tracker.md`。

### Triage labels

使用五个默认分诊标签；需要应用标签时，读取 `docs/agents/triage-labels.md`。

### Domain docs

采用 single-context：根目录 `CONTEXT.md` + `docs/adr/`。探索领域概念或架构决策前，读取 `docs/agents/domain.md`。
