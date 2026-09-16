# 前端开发规范

本项目是 React 19 + TypeScript + Vite 单仓 SPA，配套 Cloudflare Worker API。以下规范来自当前源码、测试和构建配置，不将框架惯例当作项目事实。

## 规范索引

| 文档                                  | 内容                               |
| ------------------------------------- | ---------------------------------- |
| [目录结构](./directory-structure.md)  | 入口、页面、共享组件与 Worker 边界 |
| [组件规范](./component-guidelines.md) | Props、组合、样式、文案与无障碍    |
| [Hook 规范](./hook-guidelines.md)     | 请求、订阅、清理与本地历史         |
| [状态管理](./state-management.md)     | URL、React Query、Jotai 与局部状态 |
| [类型安全](./type-safety.md)          | 实际编译选项、类型归属与运行时校验 |
| [质量规范](./quality-guidelines.md)   | 格式化、lint、构建与 Node 测试     |

代理客户端目录还须阅读[目录数据与交互契约](./client-catalog.md)，涵盖人工资料／发布快照边界和平台安装包匹配。

## 开发前检查

1. 先读目标模块源码和对应文档；新增页面先读目录结构，修改请求先读 Hook 和状态管理，修改输入/响应先读类型安全。
2. 开始修改前阅读质量规范，选择相关的单文件测试；完整验证按构建、测试的顺序执行。
3. 阅读共享[思考指南索引](../guides/index.md)，按触发条件选读，不用通用建议覆盖这里的源码事实。
4. 先复用 `src/components/toolkit.tsx`、`src/components/ui/`、`src/lib/network.ts` 和已有 Hook；不要另起一套 UI 或请求封装。

## 证据与边界

- 技术栈及命令以 `package.json`、`pnpm-lock.yaml` 为准；项目介绍和本地开发流程见 `README.md`。
- 本目录用简体中文维护。代码片段摘自所列文件，省略部分会明确说明；不要把历史警告或局部例外推广为规则。
- 本次仅建立前端规范，不调整应用行为、依赖、编译选项、ATW 运行时或既有通用思考指南。
