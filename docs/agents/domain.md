# Domain Docs

本仓库采用 single-context 领域文档布局。

## Before exploring, read these

- 根目录 `CONTEXT.md`：领域术语与概念。
- `docs/adr/`：读取与当前工作相关的架构决策。
- 若以后出现根目录 `CONTEXT-MAP.md`，先读取该索引，再读取相关上下文的 `CONTEXT.md` 和 `src/<context>/docs/adr/`。

上述文件不存在时静默继续，不为其缺失报警，也不提前建议创建空文档。领域术语或决策明确后，由 `atw-domain-modeling` 按需建立。

## File structure

采用以下 single-context 布局，文件和目录按需创建：

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       └── NNNN-<slug>.md
└── src/
```

## Use the glossary's vocabulary

在事项标题、重构建议、假设、测试名称等输出中，使用 `CONTEXT.md` 定义的术语，不替换成词汇表明确避免的同义词。

所需概念尚未收录时，先判断是否误用了项目之外的术语；若确有缺口，记录给 `atw-domain-modeling`。

## Flag ADR conflicts

建议与现有 ADR 冲突时，明确指出相关 ADR 及重新讨论的理由，不静默覆盖已有决策。
