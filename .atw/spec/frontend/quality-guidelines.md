# 质量规范

## 环境与验证命令

`package.json` 要求 Node.js >=24、pnpm 10.32.1；CI（`.github/workflows/pages.yml`）使用 Node 24，按锁文件安装后先构建再测试。

```bash
pnpm install --frozen-lockfile
pnpm exec tsc -b
pnpm lint
pnpm build
pnpm test
```

- `pnpm build` 为 `tsc -b && vite build`。
- `pnpm test` 先执行 `wrangler deploy --dry-run --env='' --outdir .worker-test`，再以路径注册 Hook 执行 `tests/*.test.mjs`；这里是本地打包检查，不发布 Worker。
- 完整测试前必须构建：`tests/content.test.mjs` 检查 `dist/index.html`、静态资源和后端源码排除；Worker 测试还依赖 `.worker-test` 产物。
- 只跑不依赖构建产物的单文件时可以直接运行下列命令；Worker/产物测试不能机械照搬。

```bash
node --import ./tests/register-paths.mjs --test tests/ip-score.test.mjs
node --import ./tests/register-paths.mjs --test tests/query-subscription.test.mjs
```

`pnpm worker:dev` 提供本地联调（README 中的 8787 入口），`pnpm dev` 只是 Vite；不要把 `pnpm deploy` / `make deploy` 当成验证步骤。

## 格式与 lint

- `.prettierrc` 配置分号、双引号、Tailwind 类排序及 import 排序插件。import 分组依次是 React、React Router、其余模块、`./`、`../`，具体交给格式器。
- `.husky/pre-commit` 运行 `pnpm exec lint-staged`；`package.json` 中 lint-staged 对暂存的 JS/TS/JSON/CSS/Markdown 文件执行 Prettier，并不运行测试。
- 只格式化本次改动文件：`pnpm exec prettier --write <文件路径>`；检查用 `--check`。`pnpm format` 会写全仓，不要用它顺手清理无关文件。
- `pnpm lint` 使用 Oxlint，不是 ESLint。`.oxlintrc.json` 加载 react/typescript/oxc 插件，将 `react/rules-of-hooks` 设为 error、`react/only-export-components` 设为 warn；忽略 vendor 浏览器诊断及其生成 JS。
- CI 当前构建并测试，没有独立 lint/格式检查步骤。退出码为 0 也不等于无警告：现存代码有组件/常量混合导出、effect 依赖等警告，本次初始化不修正它们。

## 测试写法与真实覆盖

使用 Node 自带 `node:test` 和 `node:assert/strict`，测试在根 `tests/*.test.mjs`，通过 Node 24 的 TypeScript 支持直接导入可擦除类型的 `.ts` 模块。别名由 `tests/register-paths.mjs` 注册，不是 Vitest/Jest 或浏览器 DOM 测试环境。

`tests/ip-score.test.mjs` 的有效零分边界断言：

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ipScoreColor } from "../src/lib/ip-score.ts";

test("零分仍是有效分数", () => {
  for (const score of [0, 44])
    assert.equal(ipScoreColor(score), "var(--danger)");
});
```

示例保留原断言，中文测试名为本规范示意。原文件还覆盖 45/75 分档及缺失/越界值。按改动补一个能失败的行为断言，不只检查源码是否含某个字符串。

其他现有例子：

- `tests/optional-config.test.mjs`：缺失/不完整/域名不匹配的验证配置隐藏入口，普通工具仍保留。
- `tests/query-subscription.test.mjs`：使用 QueryClient/QueryObserver 验证订阅、主动刷新和重置；结束时取消订阅并清空 client。
- `tests/content.test.mjs`：有源码约束及构建产物断言，不能被描述为端到端浏览器交互测试。

- `tests/third-party-ip-check.test.mjs`：用独立于生产数据的期望校验 JSON 目录成员、分组、固定网址和用途，并逐站检查中英文风险限定。不能把测试期望改为从生产目录生成，否则目录遗漏也会同步消失在期望中。
- 动态 `t(site.purpose)` / `t(site.hint)` 不在 `tests/i18n.test.mjs` 的字面量调用扫描范围；修改此类目录时，须枚举目录中的动态文案键，通过真实英文 `t()` 检查翻译、占位符、中文回退及具体限定，而不只验证键存在。

```bash
node --import ./tests/register-paths.mjs --test tests/third-party-ip-check.test.mjs tests/i18n.test.mjs
```

不因补文档引入测试框架。涉及 UI 的变更还需按实际范围检查移动/桌面、深浅主题、键盘焦点和中英文；现有 Node 测试不证明这些交互全部通过。

## 检查清单与边界

- 查询是否带正确 key、取消信号、错误/加载状态，是否保留未知值与失败值的区别？参照 IP、WHOIS 页面和 `src/components/connectivity.tsx`。
- `LookupForm` 的错误提示、`ActionButton` 的禁用/忙碌语义、IP 搜索的焦点处理是否保留？详细依据见[组件规范](./component-guidelines.md)。
- 文案是否进入 `t()` / `src/i18n/en.json`？相关回归在 `tests/i18n.test.mjs`。
- 是否误把浏览器直连探测改成后端探测，或暴露 `public/worker/` 源码？参照 `src/lib/network.ts`、`vite.config.ts`、`tests/content.test.mjs`。
- 密钥不得写入 `VITE_*` 或提交到仓库；README 要求 Secret 留在 Worker 配置，`.gitignore` 排除 `.dev.vars*`、`.secrets.*.env`。分享诊断截图前遮盖 IP、位置及指纹标识。

验证结果按实际退出码和失败内容报告，分清既有警告、本次回归和环境阻塞；不要为了让规范显得完善而扩大代码修改范围。
