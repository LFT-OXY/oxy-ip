# 代理客户端目录契约

## 1. 范围

`src/views/clients/` 拥有人工目录、按平台发布快照、列表筛选和精简详情。`/clients/` 与 `/clients/:appId` 在 `App.tsx` 注册，导航同时更新 `layout/routes.ts` 和 `layout/index.tsx` 的图标映射。

本契约覆盖首票目录、第 02 票 GitHub 手动同步、第 03 票商店／官网更新源及第 04 票收录扩充的代码契约；6 小时调度尚未实现。

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

`scripts/client-release-sources.mjs` 维护已核验的仓库和平台包命名规则，首票 FlClash 四平台、v2rayNG Android 与后续批次共用同一适配器。未配置的快照原样保留；扩充来源不得按文件后缀猜测平台。商店／官网来源见第 9 节；调度和生产部署不在此实现中。

### 8.2 签名

- `pnpm clients:sync`：同步并原子替换 `src/views/clients/releases.json`。
- `node scripts/sync-client-releases.mjs --dry-run`：JSON 输出到 stdout，不写文件。
- `pnpm clients:sync --output <path>`：写指定输出；与 `--dry-run` 互斥，禁止指向人工 `catalog.json`。
- `syncReleases(previous, sources, { loadRelease, checkLink, parse?, now? })`：异步返回 `{ rows, errors }`，不修改输入；`errors` 每项含 `appId/platform/message`。
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

## 9. 官方商店与官网更新源

### 9.1 范围

`scripts/client-official-sync.mjs` 适配 Apple lookup 与 Stash Mac appcast；`officialSources` 包含首票 Shadowrocket iOS、Stash iOS、Stash Mac 及后续批次的独立 iOS 来源。Shadowrocket Mac 及 Stash Android / Windows 仍人工维护。新增平台需要单独的官方版本依据，不能扩展一个 iOS 来源去覆盖 Mac。

### 9.2 签名

- `officialClient({ fetcher?, timeoutMs? })` 提供 `loadRelease(source)`，返回商店 JSON 或官网 XML；默认超时 15 秒，不发送 token。
- `parseOfficialRelease(raw, source, previous, now)` 返回既有 `releaseSchema` 快照，解析失败抛错。
- `syncReleases` 的可选 `parse` 默认 `parseRelease`（GitHub）；官方来源传入 `parseOfficialRelease`，直链核验复用 `githubClient().checkLink` 的通用 HEAD 行为。
- CLI 依次同步 GitHub 与官方来源，共用本轮核验时间、合并错误、原子保存；命令及退出语义与第 8 节一致。

### 9.3 数据契约

- App Store 配置：`kind=app-store`、`appId`、`platforms: { ios: true }`、`trackId`、`bundleId`、`country=us`。请求 `https://itunes.apple.com/lookup?id=…&country=us&entity=software`，核对唯一结果的身份、`kind/wrapperType=software`、美国区 Apple HTTPS 入口及纯数字点分版本。
- `version` 与 `publishedAt` 分别取 `version`、可选 `currentVersionReleaseDate`。后者缺失时删除旧发布日期，不退回应用首发 `releaseDate`；成功才设置 `maintenance=automatic` 与 `lastCheckedAt`。
- Stash 配置：`kind=stash-macos`、`platforms: { macos: true }`、官方 `url` 与 `fallback`。XML 必须是 Stash 标题和 Sparkle 命名空间的 RSS，使用 `fast-xml-parser`（仅维护脚本开发依赖），不解析实体、不接受 DOCTYPE，解析前限制为 100 万字符。
- 仅选不含 `sparkle:channel` 且标题／版本无测试标记的 item，按 `pubDate` 排序。同一个 item 的 `sparkle:shortVersionString` 是展示版本，`sparkle:version` 是构建号；enclosure 必须为 `https://releases.stash.ws/Stash-build-<构建号>.zip`。官网明确支持 Apple Silicon 与 Intel，因此标记 `universal/zip`；未来出现硬件约束或非 Mac enclosure 时保守拒绝，不猜架构。
- 商店快照输出 `store`；官网 feed 输出版本绑定的 `direct`，fallback 为 `https://stash.ws/download`。人工 `catalog.json` 不受同步影响。

### 9.4 校验与错误矩阵

| 场景                                                                   | 行为                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| 商店空结果、多结果、身份／地区／类型不符、测试版本、HTTP/JSON/超时错误 | 保留该平台旧数据和核验时间，其他来源继续         |
| 新商店版本无当前发布日期                                               | 发布日期留空，不沿用旧版或首发日期               |
| feed 只有 Beta／自定义渠道、坏 XML、错应用、错构建包、未知硬件约束     | 保留旧快照；不自动改用 latest 包                 |
| 候选或旧直链暂时失败／两次确认失效                                     | 复用第 8 节临时保留／失效 fallback 规则          |
| 无可靠自动版本源的平台                                                 | 不配置自动来源；人工页面、未知版本与时间原样保留 |

### 9.5 正常、基础与错误场景

- 正常：Stash iOS 3.4.1 与 Mac 4.2.1 独立展示；Mac 4.2.1 对应 build 487。
- 基础：Stash Windows 仅展示官方页与早期版本说明；版本、发布时间和成功核验时间均为未知。
- 错误：Homebrew 或 feed 中较新的 4.3.0 / 497 不等于正式版；官方 feed 的 beta 渠道不能被第三方版本号覆盖。

### 9.6 必需测试

`tests/client-official-sync.test.mjs` 用裁剪真实 lookup / appcast 与明确变异覆盖身份隔离、空结果、HTTP/超时/JSON 错误、日期缺失、默认渠道、构建号包绑定、XML 拒绝与直链回退。CLI 子进程测试同时覆盖 GitHub 与官方源成功、商店部分失败后的退出 1 和其他结果仍写入，且生产文件及人工目录不变。

目录直链测试不能要求所有 URL 含展示版本：GitHub 维持版本匹配断言，Stash 按构建号 URL 规则检查，展示版本和构建号的绑定由独立 feed fixture 断言。新增来源标签须通过真实英文 `t()` 测试。页面回归覆盖 store/direct/page、Mac 未知值、实际主题、语言、平台切换与键盘返回筛选。

### 9.7 易错对照

错误：把官网 `Stash-latest.zip` 配上 feed 的正式版号；把 Apple 软件兼容 Mac 当作独立 Mac 版本依据；HTTP 200 就刷新人工页的核验时间。

正确：使用同一正式 item 的构建号固定地址；独立配置平台来源；无可核验版本时保留人工状态与未知时间。

## 10. 批次扩充：固定包名、源码可见与包变体

### 10.1 范围

第 04 票新增来源复用既有适配器；保留固定名单及独立平台依据，不按参考站后续排序或生产数据生成期望。

### 10.2 签名

`parseRelease(raw, source, previous, now)` 的 `source` 新增可选 `architectures: Record<string, string>`；`appSchema.code` 与 `codeLabels` 新增 `available`（源码可见）。筛选仍使用原 `code` URL 参数。

### 10.3 数据契约

- 官方固定文件名不含架构时，正则第一个捕获组为空，架构取 `source.architectures[previous.platform]`；第二组仍为格式。固定映射须有官方 README 或同版本构建配置依据；不能猜 universal。
- 文件名没有版本时仍严格校验下载 URL 中的仓库、当前 release 标签及文件名。不接受可漂移的 latest URL。
- 源码公开但保留全部权利不等于开源许可证；使用 `available`，不得归入 `open`。
- 同平台同架构同格式的多个包，选择器标签追加真实 `download.id`（GitHub 文件名）；不同包仍保留各自 URL，不在展示层合并。

### 10.4 校验与错误

| 条件                                       | 行为                               |
| ------------------------------------------ | ---------------------------------- |
| 架构捕获为空且无平台映射                   | schema 拒绝，同步保留旧快照        |
| 固定包名对应另一个 release 标签 URL        | 拒绝，不跨版本拼接                 |
| iOS lookup 成功且 Apple 声明兼容 Mac       | 仅更新 iOS，Mac 未独立核验字段留空 |
| 元数据非预发布但所有资产包含 alpha/nightly | 不将这些资产作为正式包             |

### 10.5 正常、基础与错误场景

正常：SSRVPN 三平台固定文件名分别对应 README 声明的架构。基础：仅有官方页面且版本未知，保留人工说明。错误：把 YumeBox builtin/external 或 AnyPortal api28/apilatest 合并为一个同名选项。

### 10.6 必需检查

`client-catalog-batch-1.test.mjs` 校验冻结名单、平台、筛选、源码可见和未知版本；`client-batch-sources.test.mjs` 使用裁剪真实样本验证 16 个 GitHub、10 个 App Store 来源的平台资产数量、版本 URL 隔离、固定架构缺失拒绝、测试资产排除和失败保留。英文动态字段仍由目录测试枚举全量资料。UI 检查需验证重复架构/格式选项标签唯一且键盘选择改变正确 URL。

### 10.7 易错对照

错误：`SSRVPN.apk` 后缀能证明 Android arm64；Apple 兼容 Mac 能证明独立 Mac 版本。

正确：平台与架构取已核验官方资料；每个平台仅写本平台成功核验的发布信息。

## 11. 第二批渠道与架构映射

### 11.1 范围

同仓库有手机／TV独立发布或包名使用数字架构编码时，扩充现有GitHub来源配置，不扩展前端平台枚举和快照身份。数据验收仍以独立冻结基线为准。

### 11.2 签名

- `selectStableRelease(raw, releaseTag?: RegExp)`：在正式版筛选基础上匹配可选标签渠道，再按发布日期取最新。
- `source.releaseTag?: RegExp`：由 `githubClient().loadRelease` 和 `parseRelease` 同时执行；来源配置只用不含 `g/y` 的无状态正则。
- `source.architectureAliases?: Record<string, string>`：把第一个捕获组映射成实际架构；未配置时保留原捕获组，空捕获组仍走 `architectures[platform]`。

### 11.3 契约

Surfboard手机渠道为 `mobile-*`，不能被较新的TV发布覆盖；MikuBox旧正式版的sing-box代际固定标签，不以Mihomo开发分支资料解释旧包。Xray GUI包编号末位1–4分别映射arm32、arm64、x86、x86_64。源码构建为通用应用但保留历史架构文件名时，以实际构建为准；V2rayU两个DMG均为universal。

Root模块仅在核实不含平台二进制时标 `noarch`，并在说明中明确核心需按设备另行安装。包含arm64原生工具的Surfing、akashaProxy不得归为noarch。所有直链仍绑定同一个release标签和资产，不按扩展名推断架构。

### 11.4 校验与错误

- 渠道不匹配：选择阶段跳过；直接传入解析器时抛错并保留旧快照。
- 配置了映射但没有该捕获值：不回退数字原文，schema拒绝并保留旧快照。
- 临时HEAD/API失败：保留人工入口或旧成功数据，不写新的成功核验时间。

### 11.5 场景

正常：手机渠道选择mobile，忽略较新TV。基础：旧来源无新增配置，行为不变。错误：把1202当CPU架构或把TV1.x与mobile2.x资产合到同一快照。

### 11.6 测试

`client-batch-2-sources.test.mjs`覆盖21条GitHub与4条商店配置、真实资产数量及遗漏、错误版本URL、API层手机渠道选择、未知映射拒绝、Root架构边界、Alpha误标正式及单平台失败保留。离线CLI夹具应返回同仓库全部发布，并按实际release id返回资产，不能固定只返回第一份夹具。

### 11.7 易错对照

错误：扩批后把旧测试的期望直接改成生产目录；或每张票仍断言全站永远只有本票截止数量。

正确：旧批次验证各自冻结子集；最新批次以独立基线验证累计覆盖、顺序与唯一性。内核覆盖也须包含独立的官方期望，例如Box for Root在v1.10.2支持Mihomo；只遍历生产`app.cores`无法发现漏填内核。图标例外只按PRD中明确获批的应用执行，不能由一个缺图案例扩用至其他应用。

## 12. 第三批：平台成熟度、独立渠道与品牌素材

- 不新增解析接口。来源继续使用 `releaseTag`、两个捕获组及可选固定架构；`{version}` 只出现一次，避免现有单次替换留下未展开的占位。
- 发布的 `prerelease=false` 不能覆盖官方平台限制：incy 桌面仍为 pre-alpha，只留官方页；OneBox 仅 Ubuntu 属于稳定 Linux 支持，提供 DEB，不将 RPM 测试平台冒作正式版。OneBoxM 和 Interstellar 等独立伴侣不并入桌面应用身份。
- Singboard for Mac 使用 `build-日期-时间-提交号` 的独立发布渠道，工作流明确 `draft/prerelease=false`，故不凭 `build` 单词判测试版，也不使用同仓 Windows 的版本。Netch 锁定已核实的 1.9.7 代际，其 V2Ray 分支及 x64 依据不能自动外推到未来 2.x。
- 无架构文件名须核对官方构建：Polaris Windows 便携包来自 x86_64 目标；Throne universal 安装器按 x86/x64/arm64 选择，32/64 数字经别名映射。ClashBar 含核／无核、Throne system-qt／legacy 变体不可合并。
- 品牌图标必须视觉核对并追溯到应用资源或官方商店，不以目录中任意 `icon` 文件充数：Throne 的 `res/rc/base_icon` 是控件素材，使用 `res/public/Throne.png`。需署名的素材及品牌声明保留在 `public/client-icons/NOTICE.txt`。
- 源码状态读许可证正文而不是 README 的自称：Stelliberty 非商业条款用 `available`。免费下载或开源不自动证明完整功能免费；积分内购与功能关系不明确时保持 `price=unknown`，价格说明列已核实事实。
- `client-catalog-batch-3.test.mjs` 独立验证25项平台／内核和例外；`client-batch-3-sources.test.mjs` 验证18条GitHub与6条Apple来源、包计数及排除理由、版本隔离、渠道、架构、正式性与失败保留。离线 CLI 枚举该批真实夹具；真实 HTTP 失败保留人工页，不以离线测试的成功冒充生产核验。

- 补充研究中的移动商店信息仅作伴侣身份排除证据，不自动复制到桌面应用的 `sources` 或 `note`；OneBox Mac的成功GitHub快照不得残留“商店兼容／版本未核实”说明，独立回归须同时检查来源列表与状态说明。

## 13. 第四批：历史不可获取状态与正式软件源

### 13.1 范围

已获PRD专项授权的历史条目可以没有官方下载入口；不能编造失效网址冒作官方入口。其余应用仍遵循原下载契约。第四批全部来源复用既有解析器，不新建调度。

### 13.2 签名

`appSchema.code`、`codeLabels`增加`unknown`（待核实）；`releaseSchema`增加可选`unavailable: true`，`fallback`在字段层面可选，由记录级约束决定是否必填。`selectedDownload()`仍在空列表返回undefined，详情既有条件渲染不显示下载按钮。

### 13.3 契约

- `unavailable=true`仅用于获准历史记录：manual、空downloads、无fallback/version/publishedAt/lastCheckedAt，必须有note。历史收录来源明确非官方，不作下载中转；未知代码状态不是closed，内核/开发者空数组。
- 普通记录仍必须有非空downloads及官方fallback；直链必须绑定版本和架构。恢复官方可获取状态前须人工重核并移除unavailable，不由同步器自动解除历史例外。
- ImmortalWrt软件源包按软件源自身版本、架构和发行分支记录。dae/daed的Linux新版本不覆盖OpenWrt软件源版本；HomeProxy的LuCI包noarch不等于运行依赖支持全部CPU。
- `note`只保存长期条件；本轮临时网络/资产失败写研究或错误结果，不把失败文案继承到下次成功快照。NekoBox上传中starter资产仍保守拒绝。
- daed用应用标签渠道排除较新的dae-lsp组件；Nikki系列不将含Alpha核心的合集包装成纯正式包。

### 13.4 校验与错误

历史状态携带下载、fallback、版本或时间、或标automatic时拒绝；普通状态缺下载/fallback也拒绝。空获取选项不影响搜索、排序及详情直达。图标占位仅按PRD明确名单执行。

### 13.5 场景

正常：Clash .NET、lvory显示历史来源、未知值与不可获取说明，无下载按钮。基础：Hey按授权仅提供官方源码，并说明自行构建与签名。错误：用参考页填官方下载按钮、把unknown写成closed、或把OpenWrt版本套成Linux版本。

### 13.6 检查

`client-catalog-batch-4.test.mjs`核对独立累计108项、全部平台/内核、九个指定占位、历史状态变异拒绝及ImmortalWrt独立快照；`client-batch-4-sources.test.mjs`核对17源、排除资产互斥/完整集合/等量错换负例、starter失败后恢复和渠道隔离。浏览器验证历史页面无下载、图片正常加载、未知条件筛选及中英文/实际主题/键盘返回。

### 13.7 易错对照

错误：测试只断言“被选入或有排除理由”，排除资产被误选也会通过。正确：独立期望同时检查完整集合与排除集合不相交；可进一步按平台冻结文件名和架构，发现跨平台等量互换。
