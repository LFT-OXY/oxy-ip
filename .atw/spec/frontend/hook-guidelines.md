# Hook 规范

## 归属与复用

共享 Hook 在 `src/hooks/use-*.ts`，导出 `use*` 函数。`use-theme.ts` 导出 `useTheme`，`use-mobile.ts` 导出 `useIsMobile`，文件名与函数名不要求逐字对应。

先检查已有 Hook：`useTheme` 组合主题 atom 与系统偏好，`useLookupHistory<T>` 管理查询历史，`useAvailableTools` 组合配置查询与纯函数 `visibleTools`。页面仍可直接使用 `useQuery`，不要为每个请求机械增加自定义 Hook。

## 请求与取消

`src/hooks/use-challenge-config.ts` 的完整 Hook（`endpoint`、`useQuery` 与类型在同文件定义/导入）：

```ts
export function useChallengeConfig(enabled = true) {
  return useQuery({
    queryKey: ["challenge-config"],
    queryFn: ({ signal }) =>
      endpoint<ChallengeProvider[]>("/browser/challenges", { signal }),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
```

- 调用链为 `useAvailableTools` → `useChallengeConfig` → `endpoint` → `request`；只在 browser 分组启用查询，配置未加载时不展示可选验证入口。
- 参数影响结果时放入 query key。页面示例：IP 的 `["lookup-ip-coffee", ip]`、WHOIS 的 `["whois", q]`；不要给不同查询共用不带参数的缓存键。
- 让 Query 的 `signal` 沿 API 函数传到 `src/lib/network.ts`。`request` 将它与 12 秒超时合并；`src/views/ip/api.ts`、`src/views/whois/api.ts` 都透传 signal。
- `endpoint` 用于 Worker API，`request` 用于浏览器直接请求。不要把 React Query 的数据/错误再复制到一套 effect + state 请求循环。
- 重试和陈旧时间按查询决定：全局 retry 为 1、失焦后重新聚焦不刷新；验证配置/IP/WHOIS 查询覆盖 retry 为 false。详见[状态管理](./state-management.md)。

## 订阅与副作用

`src/hooks/use-mobile.ts` 的订阅清理：

```ts
const query = "(max-width: 767px)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
```

`useIsMobile` 和 `useTheme` 均使用 `useSyncExternalStore(subscribe, getSnapshot, () => false)`，读取 matchMedia，不另设轮询。`ThemeProvider` 用 `useLayoutEffect` 同步根元素；`useTheme.setTheme` 还同步修改 DOM，使 View Transition 捕获新外观，不能误删为“重复逻辑”。

动画副作用参照 `src/views/ip/index.tsx` 的 tween 返回清理和 `src/components/toolkit.tsx` 的 DataTable 清理，不保留卸载后的动画或监听器。

## 查询历史的实际契约

`src/hooks/use-lookup-history.ts`：

- 返回 `{ entries, save, find }`，条目为 `{ query, data, savedAt }`。
- 懒初始化读取 localStorage；外层只接受数组，检查 query 为字符串、data 为真值、savedAt 为有限数值，最多保留 10 条。
- `save` 用函数式更新，不区分大小写去重，将最新成功结果放最前；读写存储失败时退化为当前会话内存状态。
- key 应在一次 Hook 生命周期内稳定：IP、WHOIS 页面各传固定且不同的 key；当前实现不会因参数 key 改变而重新读取存储。
- 泛型 `T` 不校验存储里的 data 内容。不要将历史数据描述为经过完整 schema 校验，也不要移除存储异常兜底。

相关回归：`tests/optional-config.test.mjs` 覆盖配置可见性，`tests/query-subscription.test.mjs` 覆盖缓存订阅和刷新；这两组不是 React DOM Hook 挂载测试。
