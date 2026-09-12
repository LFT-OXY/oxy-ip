# 前端规范初始化记录

## 范围与依据

- 基线提交：`2d2d860e212bfd5c1d8b288aea51a8b02e717b25`（main）。开始时 ATW/各宿主目录、根 AGENTS.md 等尚未跟踪；只提交本任务规范及任务记录，不将其他初始化文件一起纳入。
- 任务没有 `issues/`，`tickets.py frontier` 为空，按单会话任务实施；用户已调用 `/atw-implement`。
- 修改前的差距：6 份前端规范及索引均为占位模板；现在记录真实模式并提供源码示例。
- 边界：6 份规范 + 索引、当前任务 PRD 完成项/审查上下文/验证记录/状态；不改应用源码、依赖清单、锁文件、ATW 脚本或通用思考指南。
- 已查找常见约定文档。现有入口为 `AGENTS.md`、`docs/agents/`、`README.md` 及工具配置；未找到独立的 CLAUDE.md、CONTRIBUTING.md、.cursorrules 或 .editorconfig。
- 使用语义检索和代码索引定位范围，直接读取代表源码；`useChallengeConfig` 的调用链确认到页面/导航消费者及 `endpoint`/`request`。

## 文档与代表样例

| 文档                 | 主要源码依据                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| directory-structure  | `src/main.tsx`、`src/App.tsx`、IP/WHOIS/Ping 目录、`vite.config.ts`                                                                                                |
| component-guidelines | `src/components/lookup-form.tsx`、`src/components/toolkit.tsx`、`src/components/ui/button.tsx`、`src/components/ui/responsive-dialog.tsx`                          |
| hook-guidelines      | `src/hooks/use-challenge-config.ts`、`src/hooks/use-theme.ts`、`src/hooks/use-mobile.ts`、`src/hooks/use-lookup-history.ts`                                        |
| state-management     | `src/components/providers/query-provider.tsx`、`src/store/theme.ts`、`src/store/privacy.ts`、IP/WHOIS 查询、`src/components/connectivity.tsx`                      |
| type-safety          | 两份 tsconfig、`src/lib/types.ts`、`src/lib/network.ts`、`src/views/whois/api.ts`、LookupForm                                                                      |
| quality-guidelines   | `package.json`、`.prettierrc`、`.oxlintrc.json`、`.husky/pre-commit`、CI、`tests/ip-score.test.mjs`、`tests/query-subscription.test.mjs`、`tests/content.test.mjs` |

未把单个配置伪装成“2–3 个实例”：如 QueryClient 全局默认值只在 provider 定义，运行时/编译配置以权威文件为依据；重复模式分别交叉核对多个消费者。

## 验证

验证环境：Node v24.15.0、pnpm 10.32.1。仅文档变更，不新增业务逻辑或测试框架；使用既有回归测试并额外检查文档链接、源码路径及占位文本。

- `pnpm install --frozen-lockfile`：通过，锁文件无需更新。pnpm 提示跳过 esbuild/workerd 构建脚本；未执行 approve-builds，后续实际构建/测试仍通过。
- `pnpm exec tsc -b`：通过。
- `node --import ./tests/register-paths.mjs --test tests/optional-config.test.mjs tests/query-subscription.test.mjs`：5/5 通过。
- `pnpm lint`：退出 0，有 13 条修改前已存在的警告（10 条应用代码、3 条未跟踪的 `.pi/extensions/atw/index.ts`）；不将其描述为零警告。
- `pnpm build`：通过。
- `pnpm test`：95/95 通过，0 失败、0 跳过；包含 Worker dry-run，没有远程部署。
- Prettier 定向检查：9 份 Markdown 通过；7 份前端文档无模板占位，10 个相对链接、103 处源码路径及 check.jsonl 引用均存在。

## 已回写的关键限制

- 两份配置未显式设置 strict，但锁定的 TypeScript 6.0.3 默认启用严格检查；泛型网络包装仍不进行响应 schema 校验。
- IP 查询缓存 5 分钟，WHOIS 为 Infinity；本地历史不是统一永不过期策略。
- 主题使用原始字符串存储，隐私偏好使用默认 atomWithStorage；不能任意替换序列化方式。
- Node 测试不是 DOM/E2E 验证，完整测试依赖先生成 dist。
- PageHeading 当前不展示 description；只记录，不借初始化修复。

## 首轮审查修正

标准轴发现 1 项硬性违规：最初把 strict 配置缺省误写成未启用严格检查；规格轴未发现问题。主会话独立用已安装的 TypeScript 6.0.3 验证，确认标准轴发现成立，已更正类型规范及本记录。另采纳 1 项精确性建议，补明 API 默认前缀可由 `VITE_API_BASE_URL` 覆盖。未改应用配置或源码，修正后重新进行完整双轴审查。

严格检查行为的可复现验证（在仓库根运行，只在内存中编译，不创建探针文件）：

```bash
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import ts from 'typescript';
for (const config of ['tsconfig.app.json', 'tsconfig.node.json']) {
  const { config: json } = ts.readConfigFile(config, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(json, ts.sys, process.cwd());
  const file = resolve('__strict_probe__.ts');
  const source = 'export function identity(value) { return value; }\nexport const text: string = null;';
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => name === file
    ? ts.createSourceFile(name, source, version, true)
    : read(name, version, ...rest);
  const program = ts.createProgram([file], options, host);
  const codes = ts.getPreEmitDiagnostics(program)
    .filter(d => d.file?.fileName === file).map(d => d.code);
  assert.ok(codes.includes(7006), `${config}: 缺少隐式 any 诊断`);
  assert.ok(codes.includes(2322), `${config}: 缺少 null 赋值诊断`);
  console.log(`${ts.version} ${config}: TS7006 / TS2322 已验证`);
}
NODE
```
