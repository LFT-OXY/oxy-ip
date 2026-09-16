# 05 — 客户端收录第 2 批

**What to build:** 本票固定名单中的 25 个客户端完整出现在目录与精简详情中，可按全部适用平台筛选并通过官方入口获取。

**Blocked by:** 01
**Status:** ready-for-agent
**Impl:** doing

## 验收标准

- [x] 逐项完成下方固定 ID 与名称清单，不依赖参考站未来的实时排序。
- [x] 每项核对图标、名称、别名、简介、全部适用平台、内核、代码状态、费用与主导开发；不确定信息不编造。
- [x] 每项逐平台核对官方获取入口，并记录官方更新来源或人工维护原因；有可靠直链时按平台、架构和格式提供。
- [x] 使用独立的来源清单比对收录覆盖率，不能从待验收的数据反向生成期望清单。
- [x] 本批应用均能通过相应筛选找到，详情和下载入口可使用，动态中英文文案接受检查。
- [x] 能自动更新的来源配置符合既定约定；同步能力尚未完成时不将人工资料标为自动核验结果。
- [x] 本批计数正确，与其他批次无重复、无遗漏；多平台应用保持单一应用身份。
- [x] 参考站存在仅有测试版或已停止维护的应用时，保留应用与官方获取入口；不把测试版填作正式版，不提供测试版安装包冒充正式版，无法核验的正式发布信息留空。

- [x] 本票相关检查通过，未修改本任务明确排除的功能；UI 变更验证移动与桌面、主题、语言和基本键盘操作。

## 固定收录名单

| 来源序号 | 应用 ID               | 名称                |
| -------- | --------------------- | ------------------- |
| 34       | `clashx-meta`         | ClashX Meta         |
| 35       | `v2rayu`              | V2rayU              |
| 36       | `surfboard`           | Surfboard           |
| 37       | `insightbox`          | InsightBox          |
| 38       | `xray-gui`            | Xray GUI            |
| 39       | `clash-mi`            | Clash Mi            |
| 40       | `flclashx`            | FlClashX            |
| 41       | `mikubox-for-android` | MikuBox for Android |
| 42       | `kunbox`              | KunBox              |
| 43       | `nekobox-by-starifly` | NekoBox by starifly |
| 44       | `happ-proxy`          | Happ Proxy          |
| 45       | `clash-xiaoy`         | clash-xiaoy         |
| 46       | `monadbox`            | MonadBox            |
| 47       | `mconnect`            | MConnect            |
| 48       | `vproxy`              | Vproxy              |
| 49       | `flyclash`            | FlyClash 桌面版     |
| 50       | `flyclash-android`    | FlyClash Android    |
| 51       | `sudodroid`           | Sudodroid           |
| 52       | `box-for-root`        | Box for Root        |
| 53       | `surfing`             | Surfing             |
| 54       | `box4magisk`          | Box4Magisk          |
| 55       | `box-for-android`     | Box for Android     |
| 56       | `akashaproxy`         | akashaProxy         |
| 57       | `clash-mix`           | Clash MIX           |
| 58       | `anywhere`            | Anywhere            |

本名单是收录基线，不代表参考站所写的官方归属、版本和下载有效性已独立核实；实施时须逐项检查官方来源。多平台应用一次收录全部适用平台，不重复创建应用。

## 依赖说明

本票可先展示有官方依据的人工发布信息，因此不等待同步票。同步源配置遵循首票的数据约定；02、03 完成后的全量同步覆盖由 10 核验。不得将人工录入标成自动核验。

## 边界

以本任务已确认规格和数据维护决策为准。本票保持待实施，需用户手动触发实施；不自行启动下一张票或发布生产环境。

## Comments

- 2026-09-16：已按固定25项采集参考页、官方README/发布元数据及部分源码、商店与官网证据，持久化至 `research/05-official-sources.md` 和 `research/05-evidence/`。暂停生产实施，等待用户明确决定 InsightBox、Box for Android、akashaProxy 的图标例外，以及 Clash MIX 的图标和仅源码获取页例外；FoXray例外不自动扩用。主会话负责征询决定。
- 本次未修改生产文件、PRD或验收勾选，不关闭本票，`Impl: doing` 保持。记录包含仍需常规补核的平台、费用、图标与架构，不将采集完成冒充25项验收完成；确认上述4项也不豁免其余核验。

- 2026-09-16：用户回复“接受两项例外”，授权上述三款文字占位图，以及 Clash MIX 文字占位图和仅官方源码页；精确边界已写入 PRD。恢复本票实现，其余核验要求不变。

- 2026-09-16：已实现25项资料、49个平台快照与25条同步来源配置；38个平台实际自动核验成功。构建和lint通过，全套144项中143通过，Box4Magisk图标缺失为唯一失败。该项目经补查仅有Vite默认素材，未擅自扩用四项缺图例外，等待用户确认文字占位图或提供官方图标。浏览器12种布局/语言/主题组合及49个平台下载匹配通过，Box4Magisk图标明确未验收。尚未独立双轴审查、未提交，不关闭票。详情见研究记录末尾。

- 2026-09-16：用户回复“允许”，新增授权 Box4Magisk 使用文字占位图；已写入PRD并补图。保持本票doing，继续完整验证、双轴审查与提交。

- 2026-09-16：最终构建通过、全套145/145通过，lint退出0（既有警告）；浏览器12种矩阵、49个平台与全部图标通过，另复测Android＋Mihomo筛选进入Box for Root。首轮Spec的Mihomo漏项已按红→绿测试修正，完整双轴复审均无剩余发现，报告已原样转发，持久化于 `research/05-review.md`。准备提交本票，不启动后续票。
