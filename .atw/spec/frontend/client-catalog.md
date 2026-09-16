# 代理客户端目录契约

## 1. 范围

`src/views/clients/` 拥有人工目录、按平台发布快照、列表筛选和精简详情。`/clients/` 与 `/clients/:appId` 在 `App.tsx` 注册，导航同时更新 `layout/routes.ts` 和 `layout/index.tsx` 的图标映射。

本契约来自首票实现，不代表后续官方同步与 6 小时调度已经存在。

## 2. 签名

`model.ts` 导出：

- `readFilters(params: URLSearchParams)`：读取 `q/platform/core/code/price/sort`。
- `filterApps(apps: ClientApp[], rows: ClientRelease[], filters, translate)`：组合筛选并稳定排序。
- `releaseFor(rows: ClientRelease[], appId: string, platform: string)`：仅返回该应用、该平台快照。
- `selectedDownload(release: ClientRelease | undefined, id: string)`：匹配该快照中的包；旧标识回退到此快照第一项。
- `latestPublishedAt(rows, appId, platform = "")`：返回官方发布时间，不读取核验时间。

## 3. 数据与 URL 契约

- `catalog.json` 所有权为人工基础资料；`releases.json` 是独立的发布快照。`data.ts` 用 `model.ts` 的 Zod schema 各解析一次，UI 不重复定义数据格式。
- 应用身份为 `id`，快照身份为 `appId + platform`，同平台仅保存一个当前正式版。`downloads` 属于该快照，而非应用级公共包池。
- 获取选项分 `direct`、`store`、`page`。直链须有 `arch`、`format`，所在快照须有 `version`；商店／页面不伪造架构。
- `source` 记录官方依据，`fallback` 是官方商店或页面入口；确认直链失效后的回退由后续同步票实现。
- `maintenance=manual` 的人工初始化不伪装成自动核验。`publishedAt`、`lastCheckedAt` 是不同的可选 ISO 时间；未知省略字段。
- 列表条件始终在 URL；详情另用 `target` 选下载平台，不覆写列表的 `platform`。返回时只移除 `target`；清除筛选不移除 `lang` 或其他无关参数。
- 动态中文资料通过全站 `t()` 翻译，不额外建立目录专用语言系统。

## 4. 校验与错误

| 输入                                        | 行为                                    |
| ------------------------------------------- | --------------------------------------- |
| 非 HTTPS 获取入口，或直链缺版本、架构、格式 | schema 解析失败，由现有路由错误边界承接 |
| 未知应用 ID                                 | 可返回列表的不存在页面                  |
| 不匹配的筛选                                | 空结果及清除筛选入口                    |
| 无效／旧包标识                              | 只回退当前所选平台的第一个包            |
| 缺版本／日期／内核                          | 显示 `—`，不补猜测值                    |

跨记录身份唯一性、平台覆盖和数据来源正确性由目录测试与来源核验检查；schema 不宣称证明“官网”归属或发布正式性。

## 5. 正常、基础与错误场景

- 正常：FlClash Android 切 Windows，包列表与按钮 URL 一起切换；两平台可有不同版本。
- 基础：Stash Mac 只有官方页面时，按钮为“前往官方下载页”，不伪造直链或发布时间。
- 错误：仅因访问超时删除已有正式包，或以核验时间代替发布时间，均不符合 PRD；后续同步票须单独测试。

## 6. 必需检查

`tests/client-catalog.test.mjs` 覆盖独立收录名单、平台、筛选组合、多内核、稳定排序、包选择隔离、未知数据、URL 清理和真实英文 `t()` 的动态文案。扩充票必须根据冻结基线扩充独立期望，不从生产数据生成“期望”。

UI 检查使用构建后的 `pnpm preview`，覆盖窄屏、768px、桌面、中英文、深浅主题、Tab/Enter/Space、详情直达与返回。主题存储键为 `theme`，不是 `ip-tools:theme`；必须断言 HTML 实际 `dark` 类，不能仅写存储后宣称测过深色。完整套件先 `pnpm build` 再 `pnpm test`。

## 7. 易错对照

错误：通过 `.apk` 后缀统一归入 Android，或将所有 Apple 平台套用 iOS lookup 版本。

正确：按官方资产中的平台与架构归属收录；sing-box OpenWrt `.apk` 是路由器包，iOS SFI `.deb` 需要明确越狱条件；Mac 无独立依据的版本留空。
