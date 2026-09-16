# 代理客户端目录契约

## 1. 范围

`src/views/clients/` 拥有人工目录、按平台发布快照、列表筛选和精简详情。`/clients/` 与 `/clients/:appId` 在 `App.tsx` 注册，导航同时更新 `layout/routes.ts` 和 `layout/index.tsx` 的图标映射。

本契约覆盖首票目录及第 02 票 GitHub 手动同步；6 小时调度尚未实现。

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
- 错误：仅因访问超时删除已有正式包，或以核验时间代替发布时间，均不符合 PRD；同步回归须单独覆盖。

## 6. 必需检查

`tests/client-catalog.test.mjs` 覆盖独立收录名单、平台、筛选组合、多内核、稳定排序、包选择隔离、未知数据、URL 清理和真实英文 `t()` 的动态文案。扩充票必须根据冻结基线扩充独立期望，不从生产数据生成“期望”。

UI 检查使用构建后的 `pnpm preview`，覆盖窄屏、768px、桌面、中英文、深浅主题、Tab/Enter/Space、详情直达与返回。主题存储键为 `theme`，不是 `ip-tools:theme`；必须断言 HTML 实际 `dark` 类，不能仅写存储后宣称测过深色。完整套件先 `pnpm build` 再 `pnpm test`。

## 7. 易错对照

错误：通过 `.apk` 后缀统一归入 Android，或将所有 Apple 平台套用 iOS lookup 版本。

正确：按官方资产中的平台与架构归属收录；sing-box OpenWrt `.apk` 是路由器包，iOS SFI `.deb` 需要明确越狱条件；Mac 无独立依据的版本留空。

## 8. GitHub 手动同步契约

### 8.1 范围

`scripts/client-release-sources.mjs` 维护已核验的仓库和平台包命名规则，目前仅 FlClash 四平台、v2rayNG Android。未配置的快照原样保留；扩充来源不得按文件后缀猜测平台。调度、商店同步和生产部署不在此实现中。

### 8.2 签名

- `pnpm clients:sync`：同步并原子替换 `src/views/clients/releases.json`。
- `node scripts/sync-client-releases.mjs --dry-run`：JSON 输出到 stdout，不写文件。
- `pnpm clients:sync --output <path>`：写指定输出；与 `--dry-run` 互斥，禁止指向人工 `catalog.json`。
- `syncReleases(previous, sources, { loadRelease, checkLink, now? })`：异步返回 `{ rows, errors }`，不修改输入；`errors` 每项含 `appId/platform/message`。
- `githubClient({ fetcher?, token?, timeoutMs? })`：提供 `loadRelease(source)` 与 `checkLink(url)`；后者返回 `valid/temporary/missing`，网络异常交由同步层保守处理。
- `selectStableRelease(raw)` 与 `parseRelease(raw, source, previous, now)`：正式版筛选和单平台快照解析；代码位于 `scripts/client-release-sync.mjs`。

### 8.3 数据与环境

官方 API 元数据必须含 `id/tag_name/name/html_url/published_at/draft/prerelease`；资产含 `id/name/browser_download_url/state`。发布与资产均分页获取，每页 100，最多 10 页。正式版按发布时间选择，排除草稿、预发布及显式测试渠道；命名规则中的 `{version}` 绑定同一发布，两个捕获组依次为架构和格式，URL 必须与仓库、标签和资产一致。

输出复用 `model.ts` 的 `releaseSchema`。只有成功平台更新 `maintenance=automatic` 和 `lastCheckedAt`；时间是本轮检查时间，不代替 `publishedAt`。`GITHUB_TOKEN` 可选，仅发往 API；HEAD 核验不带 token、不读取包体。默认请求超时 15 秒。

### 8.4 校验与错误矩阵

| 场景                                       | 处理                                                       |
| ------------------------------------------ | ---------------------------------------------------------- |
| 无正式版、缺平台包、API/解析错误、分页超限 | 该平台保留旧版本及成功时间，其他项继续                     |
| HEAD 403/429/5xx/405、超时或其他不确定结果 | 不删除直链；本轮候选平台不推进                             |
| 同一直链连续两次 404/410                   | 移除该直链，补官方 fallback，保留其余可用项                |
| API 失败但旧直链独立确认失效               | 允许回退，但不刷新旧版本与成功时间                         |
| 部分来源失败                               | 保存其他成功结果，CLI 退出 1；不能将非零退出理解为没有写入 |

### 8.5 正常、基础与错误场景

- 正常：新正式版的版本、日期、平台包整组替换，不拼接旧包。
- 基础：未配置来源继续使用人工快照；多获取选项始终显示选择器，单页面或单商店保持简洁。
- 错误：fallback 与直链混合时，选 fallback 后隐藏选择器会使用户无法切回仍可用的包。

### 8.6 必需测试

`tests/client-release-sync.test.mjs` 用裁剪的真实官方样本和显式变异覆盖包匹配、草稿/预发布/测试渠道、版本与 URL 隔离、分页、单源和单平台失败、部分及全部直链失效、核验时间保留、CLI 写入/dry-run 与人工文件不变。变异测试同时验证 `test/dev` 被排除、`latest` 不被误杀。UI 改动须用混合直链与 fallback 的浏览器场景，验证选官方页后可用键盘切回直链，覆盖窄屏/桌面、中英文和实际深浅主题。

### 8.7 易错对照

错误：以 `prerelease=false` 单独证明正式性；或以 `download.kind === "direct"` 作为多选项选择器唯一显示条件。

正确：同时检查测试渠道标识；选择器在单直链或 `release.downloads.length > 1` 时可见。未知命名或临时失败保留旧值，不猜测新包。
