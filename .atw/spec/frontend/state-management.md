# 状态管理

## 状态放在哪里

| 状态                 | 当前载体                             | 真实示例                                      |
| -------------------- | ------------------------------------ | --------------------------------------------- |
| 局部交互             | `useState` / `useRef`                | `src/views/ip/index.tsx` 的搜索展开与焦点引用 |
| 表单输入与校验       | react-hook-form                      | `src/components/lookup-form.tsx`              |
| 可分享查询条件       | React Router 路径/搜索参数           | IP 的 `:ip`；WHOIS 的 `?q=`                   |
| 异步结果、错误、进度 | TanStack React Query                 | IP、WHOIS、`src/components/connectivity.tsx`  |
| 跨页面偏好           | Jotai atom                           | `src/store/theme.ts`、`src/store/privacy.ts`  |
| 业务刷新轮次         | 就近的 Jotai atom                    | `src/views/link/store/index.ts`               |
| 最近成功查询         | `useLookupHistory<T>` + localStorage | IP 和 WHOIS 页面，各自最多 10 条              |

不是所有状态都需要全局化，也不是所有持久化都通过 Jotai。语言是 `src/i18n/index.ts` 的模块值；切换会写存储、更新 `lang` 查询参数并导航，不是响应式 atom。

## React Query 是异步结果的来源

`src/components/providers/query-provider.tsx` 在模块级创建一个 QueryClient，默认 `retry: 1`、`refetchOnWindowFocus: false`。不要在组件每次渲染时新建 client。

页面控制自己的缓存策略：

- `src/views/ip/index.tsx`：`["lookup-ip-coffee", ip]`，`enabled: !!ip`，`staleTime: 300_000`。
- `src/views/whois/index.tsx`：`["whois", q]`，`enabled: !!q`，`staleTime: Infinity`。
- 两者都用历史的 `data` 和 `savedAt` 填充 `initialData` / `initialDataUpdatedAt`，成功后保存历史，同条件再次提交时调用 `refetch()`。

不要把 IP 历史误写成永不过期，也不要把 WHOIS 的 Infinity 推广到所有查询。历史展示与 Query 内存缓存是两层机制。

## 进度订阅与派生值

`src/components/connectivity.tsx` 中的进度查询片段：

```tsx
const progressKey = ["connectivity-progress", target.url, round];
const progress = useQuery<ProbeResult>({
  queryKey: progressKey,
  enabled: false,
  queryFn: skipToken,
});
```

同文件的主动查询通过 `client.setQueryData(progressKey, result)` 推送进度；进度订阅本身不发请求。选择结果时直接计算 `query.isFetching ? progress.data : query.data`，无需第三份 result state。

`tests/query-subscription.test.mjs` 验证只读订阅仍接收更新、不会启动抓取，也覆盖挂着禁用摘要观察者时的刷新/重置。不要为了消除“缺少 queryFn”提示给进度订阅添加虚假请求。

## Jotai 与持久化

`src/store/privacy.ts` 的完整代码：

```ts
import { atomWithStorage } from "jotai/utils";

export const hideIpAtom = atomWithStorage("ip-tools:hide-ip", false);
```

- `src/components/toolkit.tsx` 的 `PrivacyToggle` 用 `useAtom` 修改，`IpText` 用 `useAtomValue` 读取；展示通过 `maskedIp` 派生，不把遮盖值写回原始结果。
- `src/store/theme.ts` 的 `themeAtom` 不同于上面的默认 JSON 存储：它使用自定义存储，以原始字符串保存 `light` / `dark` / `system`，校验值、捕获存储错误，并启用 `getOnInit: true`。不要无意改动其序列化格式。
- `themeTransitionPendingAtom` 是内存 atom；`src/views/link/store/index.ts` 的 `connectivityRoundAtom` 是 `atom<Record<string, number>>({})`，不持久化。
- `useTheme` 从主题选择和系统偏好计算 `resolvedTheme`；`useAvailableTools` 从配置计算工具列表。这类可派生值不需要额外 atom。

变更前先确认消费者和既有 key，不新建一套 Redux/Context/store 来重复管理已有查询或偏好。
