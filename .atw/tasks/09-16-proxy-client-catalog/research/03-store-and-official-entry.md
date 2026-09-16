# 第 03 票：官方商店与官网更新源

核验日期：2026-09-16。仅涉及已有 Shadowrocket / Stash 的商店与官网发布信息，不扩充应用清单，不启动第 10 票调度，不部署。

## 官方依据与取舍

- Apple 官方 [Search API 文档](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html) 区分 `software`、`iPadSoftware`、`macSoftware`。本票的两个 lookup 都只绑定 `ios`，不因商店兼容 Mac 就复制 iOS 版本。
- [Shadowrocket 商店](https://apps.apple.com/us/app/shadowrocket/id932747118) 与 [lookup](https://itunes.apple.com/lookup?id=932747118&country=us&entity=software)：`trackId=932747118`、`bundleId=com.liguangming.Shadowrocket`，2.2.92，2026-09-07T04:14:10Z。
- [Stash 商店](https://apps.apple.com/us/app/stash-rule-based-proxy/id1596063349) 与 [lookup](https://itunes.apple.com/lookup?id=1596063349&country=us&entity=software)：`trackId=1596063349`、`bundleId=ws.stash.app`，3.4.1，2026-07-16T17:06:42Z。
- [Stash 官方下载页](https://stash.ws/download) 的正文说明 Mac 支持 Apple Silicon 与 Intel，Android / Windows 为 early access / early build；原 HTML 的 Mac 入口为 `https://releases.stash.ws/Stash-latest.zip`。后者没有绑定明确版本，不直接录入发布快照。
- [Homebrew Stash](https://formulae.brew.sh/cask/stash) 与其 cask 源码提供官网更新订阅的发现线索；仅用于发现与交叉核对，不作为动态发布来源。Homebrew 当时显示 4.3.0,497，不能据此认定正式版。
- 实际读取 [Stash 官方 appcast](https://mac-release.stash.ws/appcast.xml)：默认渠道 4.2.1 / build 487，`Wed, 15 Jul 2026 16:30:50 -0700`；较新的 4.3.0 / build 497 明确含 `<sparkle:channel>beta</sparkle:channel>`，不收录。
- [Sparkle 发布文档](https://sparkle-project.org/documentation/publishing/) 说明 appcast 的版本、展示版本、发布时间、enclosure 与渠道语义。本站读取同一个 item 的展示版本与构建号，仅接受默认渠道、已核验的 Mac 包命名；不把任何自定义渠道默认为正式版。
- appcast 中正式版地址 `https://releases.stash.ws/Stash-build-487.zip` 的 HEAD 返回 200、`application/zip`；不下载包体、不做代理。来源保留 appcast，fallback 保留官网下载页。

网页先通过 Jina Reader 读取；API、XML 与入口 HTML 通过原站 HTTP 读取。Apple 两项 JSON fixture 仅裁剪无关字段；Stash XML fixture 仅移除三语变更日志，保留两个 item 的版本、渠道、时间和 enclosure。测试中的错误身份、空结果、测试版本与错包为明确的变异样本，不代表真实发布。

## 实现边界

- `officialSources` 配置三项：Shadowrocket iOS、Stash iOS、Stash Mac。
- `officialClient` 仅获取官方元数据；`parseOfficialRelease` 输出既有 `releaseSchema`，通过 `syncReleases` 的可选 `parse` 注入沿用逐平台失败保留、直链核验与 fallback。
- App Store 核对结果数量、trackId、bundleId、软件类型、美国区 Apple 入口、正式数字版本。缺少当前版本日期则留空，不使用应用首发日期或旧版本日期补齐。
- Stash 使用 `fast-xml-parser` 开发依赖解析 XML，不用正则实现 XML 解析器；验证语法、命名空间、应用标题、默认渠道、构建号与包地址的一致性，拒绝 DOCTYPE、异常 XML 和未知平台／硬件约束。
- 现有 `pnpm clients:sync` 同步 GitHub 后继续官方来源，合并错误；部分失败仍写成功结果、退出 1。dry-run 与指定输出的语义不变。
- Shadowrocket Mac 版本、发布时间、成功核验时间仍未知；Stash Android / Windows 保留人工页面及早期版本说明，不伪造自动核验。

## 实际核验与验证

- 本票三项官方来源实际同步无错误，成功时间 `2026-09-16T09:46:22.736Z`；只将这三项快照写回，其他应用及人工 `catalog.json` 不变。
- 红阶段分别证明：新适配器缺失、Stash 官方来源未接入、CLI 不更新商店。添加实现后转绿。目录测试还发现构建号不等于展示版本，以及新增来源标签缺英文翻译，均已按实际契约修正。
- 定向同步、目录与翻译测试 30/30；`pnpm exec tsc -b`、`pnpm build`、`pnpm test`（124/124）通过；`pnpm lint` 退出 0，未改动文件的既有警告保留。
- 构建后 `pnpm preview` 上执行 12 组浏览器检查：390 / 768 / 1440px × 浅／深主题 × 中文／英文，断言真实 HTML `dark` 类、Stash iOS 商店、Mac 4.2.1 与 build 487、Windows 官网且日期未知、Shadowrocket 切 Mac 不继承 iOS 版本；Tab 焦点、Space / Escape、按字母选择平台、Enter 返回保留筛选均通过。原生 select 的 ArrowDown 自动化不稳定，改用字母键选择并等待 React 提交，不以脚本修改值冒充键盘操作。
- 检查了窄屏英文深色官网页、桌面中文浅色 Mac 商店页，以及 Stash Mac 直链页截图；没有增加任何详情区块，未改 UI 组件或布局。原始记录与截图在本机 `/tmp/oxy-store-research/`，不纳入生产资源。

## 双轴审查与收尾

- 统一冻结补丁基点：`e8cd68b0bb539cba90288f2d9194e1496afd56fe`，涵盖全部工作树和新文件。
- 规格轴：无可确认的遗漏、越界或行为错误，无阻断项。
- 标准轴：0 项硬违反；1 项低优先级可能重复代码建议（测试文件三处 XML fixture 准备），按判断建议规则保留，不扩大重构范围。
- 两份只读审查报告均已原样转达；规范契约回写 `.atw/spec/frontend/client-catalog.md` 第 9 节。
- 最终再次执行格式检查、`git diff --check`、构建及 124/124 全量测试，全部通过。
