# 目录结构

## 入口与边界

`src/main.tsx` 初始化语言，依次组合 Jotai Provider、ThemeProvider、BrowserRouter 和 QueryProvider；`src/App.tsx` 用 React Router 声明路由、用 `lazy` 加载页面。这不是文件系统路由或 React Server Components 项目（`components.json` 的 `rsc` 为 `false`）。

```text
src/
├── main.tsx / App.tsx       # 应用入口与路由
├── layout/                 # 外壳、工具分组、导航、路由错误边界
├── views/                  # 按工具组织页面及其数据逻辑
│   ├── ip/                 # index.tsx、api.ts、coffee.ts、details.tsx 等
│   ├── whois/              # index.tsx、api.ts
│   ├── ping/               # index.tsx、api.ts、components/、presets.ts
│   └── components/         # 多页面复用的业务展示组件
├── components/             # 跨页面组件、toolkit.tsx
│   ├── ui/                 # shadcn/Radix 基础控件及组合
│   └── providers/          # 查询、主题、更新与路由进度
├── hooks/                  # use-*.ts 共享 Hook
├── store/                  # 跨页面 atom
├── lib/                    # 网络工具、共享类型与纯函数
├── i18n/                   # index.ts 与 en.json
└── app.css / index.css     # 应用样式与 Tailwind/主题基础
public/worker/              # Cloudflare Worker 后端源码
scripts/                    # 本地开发、构建及维护脚本
tests/                      # Node 原生测试（*.test.mjs）
```

这是关键目录节选，不是要求新功能逐项创建文件的模板。

## 文件归属与命名

- 页面放在 `src/views/<工具>/index.tsx`，页面专用请求放同目录 `api.ts`，局部展示组件就近放置。示例：IP 的 `details.tsx`、WHOIS 的 `api.ts`、Ping 的 `components/ping-results.tsx`。
- 多页面 UI 优先查 `src/components/toolkit.tsx`、`src/components/lookup-form.tsx` 和 `src/views/components/service-status.tsx`；基础控件查 `src/components/ui/`。只在页面使用的组件不必提升为公共模块。
- 跨页面状态在 `src/store/`，业务专属状态也存在于 `src/views/link/store/index.ts`、`src/views/gpt/store/index.ts`；不要仅为统一目录而搬迁。
- 多词文件通常用 kebab-case（`lookup-form.tsx`、`use-challenge-config.ts`），组件名用 PascalCase，Hook 用 `use*`；入口 `App.tsx` 是现存例外。
- 跨模块导入通常使用 `@/`，同目录用 `./`。`tsconfig.app.json` 和 `vite.config.ts` 都将 `@/` 映射到 `src/`；Node 测试另由 `tests/register-paths.mjs` 解析。

## 真实代码示例

`src/App.tsx` 的页面懒加载：

```tsx
const IpPage = lazy(() => import("@/views/ip"));
const WhoisPage = lazy(() => import("@/views/whois"));
```

新增导航入口时同时核对 `src/layout/routes.ts` 的分组/旧路由映射和 `src/App.tsx` 的真实路由，参照 `tests/content.test.mjs` 的映射断言；仅新建页面文件不会自动注册入口。

## 不要混淆的边界

- `public/worker/` 虽位于 `public`，却不是要公开的静态源码。`vite.config.ts` 的 `excludeBackendSource` 在构建后移除 `dist/worker`，开发时拦截 `/worker`。不要从前端导入其中的服务端模块。
- 浏览器请求通过 `src/lib/network.ts`；Worker 路径由 `endpoint` 默认添加 `/api` 前缀，可由 `VITE_API_BASE_URL` 覆盖，浏览器探测则由 `request` 直连目标，不要为了绕过 CORS 改为 Worker 探测。
- `public/browser-diagnostics.js` 来自 `scripts/build-browser-diagnostics.mjs`；第三方来源在 `vendor/browser-diagnostics/`。不要把生成产物当作手写前端模块修改。
