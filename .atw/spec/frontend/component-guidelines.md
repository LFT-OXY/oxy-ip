# 组件规范

## 组件与 Props

- 以函数组件为主。懒加载页面采用默认导出（`src/views/ip/index.tsx`、`src/views/whois/index.tsx`），公共组件采用具名导出（`src/components/lookup-form.tsx`、`src/components/toolkit.tsx`）。不要把这一常见模式误写为全仓禁止其他导出方式。
- 简短 Props 直接写在解构参数后；有默认值就在参数处表达。`LookupForm` 的 `onSubmit: (query: string) => void` 和 `ResponsiveDialog` 的 `onOpenChange: (open: boolean) => void` 是事件回调样例。
- 包装控件时复用 `React.ComponentProps`，不要重新枚举原生属性。`src/components/ui/button.tsx` 组合原生 button Props、`VariantProps<typeof buttonVariants>` 和 `asChild`；`ActionButton` 再继承 Button Props。
- 可渲染插槽使用 `ReactNode`（`ToolCard`、`ResponsiveDialog`），只有 children 的 Provider 使用 `PropsWithChildren`（`QueryProvider`、`ThemeProvider`）。

`src/components/toolkit.tsx` 的完整 `ActionButton` 示例：

```tsx
export function ActionButton({
  busy,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { busy?: boolean }) {
  return (
    <Button
      {...props}
      disabled={busy || props.disabled}
      aria-busy={busy}
      className={`action-button ${props.className ?? ""}`}
    >
      {busy ? (
        <Pending>
          <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
            {children}
          </span>
        </Pending>
      ) : (
        children
      )}
    </Button>
  );
}
```

## 组合、样式与文案

- 复用 `toolkit.tsx` 的 `ToolCard`、`Facts`、`Pending`、`ErrorNotice`、`ActionButton`，查询输入复用 `LookupForm`。参照 WHOIS 页面与 IP 页面，不复制整套加载/错误 UI。
- `Button` 用 `cva` 表达 variant/size，用来自 `cn` 包的 `cn` 合并类名，用 Radix `Slot.Root` 支持 `asChild`。`src/App.tsx` 中 `<Button asChild><Link ... /></Button>` 展示链接组合，避免按钮嵌套链接。
- `src/index.css` 提供 Tailwind v4 与主题变量；`src/app.css` 引入它并维护应用布局/语义类。组件同时使用工具类和 `lookup-page`、`tool-card` 等现有类；不要宣称项目只用 Tailwind，也不要引入 CSS-in-JS 来替代现状。
- 用户可见文案调用 `src/i18n/index.ts` 的 `t("中文消息")`，英文映射在 `src/i18n/en.json`；动态参数用 `{0}` 等占位。示例见 `LookupForm`、`ErrorNotice`、WHOIS 页面。不要绕开映射硬编码一套独立语言逻辑。

### 第三方 IP 目录

`src/views/components/third-party-ip-check.tsx` 的 `ThirdPartyIpCheck()` 无查询参数，首页及 IP 页复用同目录 JSON 的 `label/sites/name/url/purpose/hint`。页面依既有 `query.data` 决定有结果或搜索区下方的位置，不在目录组件中读取 IP、查询或管理缓存。

导航与提示是两个独立操作：`<a target="_blank" rel="noopener noreferrer">` 放在 `<details><summary>…</summary>…</details>` 外。保留站名相关的可访问名称、外链标识和焦点样式；不设置 `open`、互斥 `name` 或持久化状态。链接保持目录固定网址，图标来自本地 lucide，不追加 IP 或自动访问外站。

该目录采用用户确认的 A「轻量清单」，不再嵌套网站小卡片。`md`（768px）起表头和各站共用 `7rem 10rem minmax(0,1fr) 5.5rem` 四列，依次为类别、网站、用途和提示入口；移动端单列堆叠。`details` 跨满整行，桌面 `summary` 定位在本行预留的末列，提示正文保留在正常文档流中占满下一行，避免开合移动入口或压缩用途列。短入口文案仍需以 `aria-label` 包含站名。不能用固定行高、截断文案或 JS 测高代替内容驱动布局。

## 无障碍与响应式

- 表单保留 `aria-label`、`aria-invalid` 和 `FieldError`；`LookupForm` 使用 react-hook-form + Zod，不能仅依靠 placeholder 展示错误。
- `ActionButton` 同时处理 `disabled`、`aria-busy`，`Pending` 提供 `role="status"`。不要移除这些属性来简化样式。
- `src/views/ip/index.tsx` 的折叠搜索保留 `aria-expanded`、`aria-controls`、`inert`，展开聚焦输入、Escape 收起后归还焦点。
- 弹层复用 `src/components/ui/responsive-dialog.tsx`：移动端 Drawer、桌面 Dialog，两侧保留 Title/Description。断点由 `useIsMobile` 管理。
- 动画沿用减少动态效果检查和销毁逻辑：IP 搜索面板的 tween 清理、`toolkit.tsx` 中 DataTable 的 `prefers-reduced-motion`/`killTweensOf`。这不是已通过完整无障碍审计的声明。

## 已知例外

`PageHeading` 接收 `description`，但当前只设置文档标题、渲染隐藏 h1 和可选隐私开关，并不展示 description。使用前读实现，不能仅凭 Props 推断可见 UI；修正该行为属于另一个任务。
