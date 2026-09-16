# 07 — 客户端收录第 4 批

**What to build:** 本票固定名单中的 25 个客户端完整出现在目录与精简详情中，可按全部适用平台筛选并通过官方入口获取。

**Blocked by:** 01
**Status:** ready-for-agent
**Impl:** ready

## 验收标准

- [ ] 逐项完成下方固定 ID 与名称清单，不依赖参考站未来的实时排序。
- [ ] 每项核对图标、名称、别名、简介、全部适用平台、内核、代码状态、费用与主导开发；不确定信息不编造。
- [ ] 每项逐平台核对官方获取入口，并记录官方更新来源或人工维护原因；有可靠直链时按平台、架构和格式提供。
- [ ] 使用独立的来源清单比对收录覆盖率，不能从待验收的数据反向生成期望清单。
- [ ] 本批应用均能通过相应筛选找到，详情和下载入口可使用，动态中英文文案接受检查。
- [ ] 能自动更新的来源配置符合既定约定；同步能力尚未完成时不将人工资料标为自动核验结果。
- [ ] 本批计数正确，与其他批次无重复、无遗漏；多平台应用保持单一应用身份。
- [ ] 参考站存在仅有测试版或已停止维护的应用时，保留应用与官方获取入口；不把测试版填作正式版，不提供测试版安装包冒充正式版，无法核验的正式发布信息留空。

- [ ] 本票相关检查通过，未修改本任务明确排除的功能；UI 变更验证移动与桌面、主题、语言和基本键盘操作。

## 固定收录名单

| 来源序号 | 应用 ID               | 名称                |
| -------- | --------------------- | ------------------- |
| 84       | `sing-box-windows`    | Sing-Box Windows    |
| 85       | `nekobox-for-pc`      | NekoBox for PC      |
| 86       | `xrayui`              | XrayUI              |
| 87       | `swell-proxy`         | Swell Proxy         |
| 88       | `nekoray`             | Nekoray             |
| 89       | `sudoku-desktop`      | Sudoku Desktop      |
| 90       | `clash-net`           | Clash .NET          |
| 91       | `clashn`              | ClashN              |
| 92       | `lvory`               | lvory               |
| 93       | `v2raya`              | v2rayA              |
| 94       | `dae`                 | dae                 |
| 95       | `daed`                | daed                |
| 96       | `shellcrash`          | ShellCrash          |
| 97       | `clashbox`            | ClashBox            |
| 98       | `nekobox-for-harmony` | NekoBox for Harmony |
| 99       | `karing-harmony-hap`  | Karing Harmony HAP  |
| 100      | `hey`                 | Hey                 |
| 101      | `ownbox`              | OwnBox              |
| 102      | `openclash`           | OpenClash           |
| 103      | `passwall`            | PassWall            |
| 104      | `passwall2`           | PassWall2           |
| 105      | `nikki`               | Nikki               |
| 106      | `nikki-rs`            | Nikki RS            |
| 107      | `momo`                | Momo                |
| 108      | `homeproxy`           | HomeProxy           |

本名单是收录基线，不代表参考站所写的官方归属、版本和下载有效性已独立核实；实施时须逐项检查官方来源。多平台应用一次收录全部适用平台，不重复创建应用。

## 依赖说明

本票可先展示有官方依据的人工发布信息，因此不等待同步票。同步源配置遵循首票的数据约定；02、03 完成后的全量同步覆盖由 10 核验。不得将人工录入标成自动核验。

## 边界

以本任务已确认规格和数据维护决策为准。本票保持待实施，需用户手动触发实施；不自行启动下一张票或发布生产环境。
