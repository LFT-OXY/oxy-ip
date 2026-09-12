# 类型安全

## 实际编译约束

`package.json` 声明 TypeScript `~6.0.2`，`pnpm-lock.yaml` 当前锁定 `6.0.3`。根 `tsconfig.json` 引用 app 和 node 两个配置：

- `tsconfig.app.json` 覆盖 `src`，使用 `moduleResolution: "bundler"`、`jsx: "react-jsx"`、`resolveJsonModule`、`noEmit`、`verbatimModuleSyntax`。
- `tsconfig.node.json` 覆盖 `vite.config.ts`，使用 NodeNext 模块解析。
- 两者启用 `noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`、`noFallthroughCasesInSwitch`。虽然未显式配置 `strict`，当前 TypeScript 6 默认启用严格检查；不能仅凭配置缺省推断 strict 关闭。
- 已用锁定的编译器分别加载两个配置进行内存编译：隐式 any 参数报 TS7006，给 string 赋 null 报 TS2322。升级编译器时重新核实默认行为；严格检查仍不禁止显式 any 或类型断言。
- 类型检查命令为 `pnpm exec tsc -b`，不包含 `tests/*.mjs` 或 Worker JavaScript 的静态类型检查。

## 类型放置与组合

- 多模块通用数据在 `src/lib/types.ts`（`Geo`、`Risk`、`Lookup`），可选上游字段保留 `?`，不以空字符串/0 伪造保证。
- 请求特定类型跟随模块：`src/views/whois/api.ts` 的 `Registration`、`src/hooks/use-challenge-config.ts` 的 `ChallengeProvider`。不要把只用一次的 Props 全部提升到共享类型文件。
- `interface` 和 `type` 都有实例，不强制互换。纯类型导入用 `import type` 或导入项上的 `type`，如 IP API 的 `Geo`、WHOIS 页面的 `Registration`。
- 控件用 `React.ComponentProps`，变体用 `VariantProps`；泛型复用见 `useLookupHistory<T>`、`DataTable<T>`、`request<T>`，不要以 any 丢弃已知结构。
- 无法确定的内容用 `unknown` 再收窄：`Registration` 的 `vcardArray`、`Lookup.rdap`、`ErrorNotice` 的错误参数都是现有示例。

`src/components/toolkit.tsx` 中 `ErrorNotice` 渲染错误文本的表达式：

```tsx
error instanceof Error ? error.message : String(error);
```

这里先收窄错误对象，不假定每次 catch/外部输入都有 message。

## 输入校验与 API 边界

`src/components/lookup-form.tsx` 的 schema 原文：

```ts
const schema = z.object({
  query: z.string().trim().min(1, t("请输入查询内容")).max(253, t("输入过长")),
});
```

它经 `zodResolver` 连接 react-hook-form，只负责通用非空与长度校验，**不证明 query 是有效 IP/域名**。不要把 UI 校验等同于完整的服务端或业务校验。

`src/views/whois/api.ts` 的请求包装：

```ts
export const lookupWhois = (query: string, signal: AbortSignal) =>
  endpoint<Registration>(`/whois/lookup/${encodeURIComponent(query)}`, {
    signal,
  });
```

IP 请求也用 `encodeURIComponent` 编码路径输入，并在 `src/views/ip/api.ts` 检查返回 ip 是字符串且与所请求地址标准化后相符，不符时抛错。保留已有边界检查，不直接拼入未编码输入。

## 不能由静态类型保证的事

- `src/lib/network.ts` 的 `request<T>` 对 JSON/text/headers 结果使用类型断言；`endpoint<Registration>` 不是响应 schema 校验。不要声称所有远端 JSON 都经过 Zod。
- `request` 在非 opaque 模式检查 HTTP 状态，尽可能读取字符串 error，否则使用状态码消息；网络/超时错误继续向上传播。`probe` 的普通失败为 `-1`，调用方取消则重新抛出。不要统一将失败折叠成成功的空对象。
- `useLookupHistory<T>` 仅检查存储条目的外层结构，不验证 `T`；`themeAtom` 则逐个验证字符串取值。两者边界不同。
- 缺失、零值和失败值有各自意义。参照 `tests/ip-score.test.mjs`：0 是合法分数，undefined/null/NaN/Infinity/越界值用未知样式。不要用真假判断把 0 当作缺失。

上述限制是现状记录；修改编译选项、全面补 schema 或替换网络协议都不属于规范初始化任务。
