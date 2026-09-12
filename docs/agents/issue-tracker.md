# Issue tracker: ATW task directory (local only)

本仓库使用 ATW 任务目录作为事项的唯一权威来源。规格和实施票据保存在本地 Markdown 文件中，不创建 GitHub Issue，也不执行远程镜像。存在 GitHub 远程不代表授权同步。

## Resolving the current task directory

所有任务路径都相对于当前活动任务。先执行：

```bash
TASK=$(python3 .atw/scripts/task.py current)
```

`current` 输出仓库相对任务路径；没有活动任务时以非零状态退出。此时停止任务事项操作，请用户确认创建或启动任务，不回退到 `.scratch/`。

## Conventions

- 规格：`$TASK/prd.md`。
- 实施票据：`$TASK/issues/<NN>-<slug>.md`，从 `01` 开始，按依赖顺序编号。
- 研究笔记：`$TASK/research/<topic>.md`，每个主题一个文件。
- 任务内实施票据不进入分诊队列。
- 评论和讨论追加到票据末尾的 `## Comments` 下。

## Ticket file fields

```markdown
# 01 — 票据标题

**What to build:** 本票据交付的端到端行为。

**Blocked by:** none
**Status:** ready-for-agent
**Impl:** ready
```

- `Status:` 使用分诊角色，任务内实施票据固定为 `ready-for-agent`，仅用于词汇兼容。
- `Impl:` 使用 `ready` / `doing` / `done`，由 `tickets.py` 管理实施进度。
- `Blocked by:` 指定依赖票据编号；无依赖时为 `none`。
- 若模板带有空的 `**Issue:**` 行，可以保留；本地模式不填入远程 Issue。

`Status:` 表示分诊状态，`Impl:` 表示实施进度，两者不能混用。

## When a skill says "publish to the issue tracker"

| 产物     | 目标                          |
| -------- | ----------------------------- |
| 规格     | `$TASK/prd.md`                |
| 实施票据 | `$TASK/issues/<NN>-<slug>.md` |

写入文件即完成发布，没有远程发布或同步步骤，也不应用分诊标签。

## When a skill says "fetch the relevant ticket"

- 给出编号或文件名时，读取 `$TASK/issues/<NN>-*.md`。
- 未给出引用时，先用 `tickets.py list` 查找 `Impl: doing` 的票据；若没有，再用 `tickets.py frontier` 获取首个可执行票据。
- 读取票据不等于领取票据，领取仍遵循 ATW 工作流。

## Ticket operations

```bash
python3 .atw/scripts/tickets.py list
python3 .atw/scripts/tickets.py frontier
python3 .atw/scripts/tickets.py claim <NN>
python3 .atw/scripts/tickets.py done <NN>
```

`frontier` 列出依赖已完成的 `ready` 票据；`claim` 将票据置为 `doing`；`done` 将其置为 `done`。

默认一次只实施一张票据，不对同一任务目录并行领取或实施。

## Wayfinding operations

供 `atw-map` 使用，地图和决策票据保存在任务目录内：

- 地图：`$TASK/map.md`，保存 Notes / Decisions-so-far / Fog。
- 决策票据：`$TASK/map-issues/NN-<slug>.md`。
- `Type:` 使用 `research` / `prototype` / `interview` / `task`。
- `Status:` 使用 `claimed` / `resolved`；领取前的票据保持未领取。
- `Blocked by: NN, NN` 指定依赖，依赖全部 `resolved` 后才能推进。
- 可执行集合：筛选未解决、未领取、依赖已解决的票据，按编号选取。
- 领取：开始工作前写入 `Status: claimed`。
- 解决：在 `## Answer` 下追加答案，设置 `Status: resolved`，并在 `map.md` 的 Decisions-so-far 中追加上下文指针。

决策票据放在 `map-issues/`，实施票据放在 `issues/`。两者使用不同状态词汇；`tickets.py` 仅处理 `issues/`，不可混放。

## What is _not_ tracked here

以下资料跨任务存续，不放入会归档的任务目录：

- `CONTEXT.md`：领域词汇。
- `docs/adr/`：架构决策。
- `.out-of-scope/`：被否决概念的记录。
- `.atw/spec/`：分层编码规范。

## Re-enabling the GitHub mirror

仅在用户明确决定切换为镜像模式后执行：

1. 在 `.atw/config.yaml` 配置生命周期钩子：

   ```yaml
   hooks:
     after_create:
       - "python3 .atw/scripts/github_sync.py create"
     after_archive:
       - "python3 .atw/scripts/github_sync.py archive"
   ```

2. 在 `.atw/workflow.md` 增加规格完成后的 `sync-spec` 和票据拆分后的 `sync-tickets` 步骤：

   ```bash
   TASK_JSON_PATH="$TASK/task.json" python3 .atw/scripts/github_sync.py sync-spec
   TASK_JSON_PATH="$TASK/task.json" python3 .atw/scripts/github_sync.py sync-tickets
   ```

   生命周期钩子会获得 `TASK_JSON_PATH`；显式同步命令需要自行传入。文件写入不会自动触发生命周期钩子。

3. 使用 `.agents/skills/atw-init-repo/references/issue-tracker-atw.md` 镜像模板替换本文，并同步更新 `AGENTS.md` 的追踪方式摘要。

不自动回填历史任务，也不因添加或更换远程仓库而自行启用镜像。

## Why this variant exists

本仓库明确选择仅使用本地 ATW 任务目录管理规划与实施事项。GitHub 远程用于代码协作，不承担任务镜像。
