# 第 12 票：内核筛选分类依据

## 边界与方法

本票枚举现有人工目录的 29 个不同 `cores` 字符串，仅新增筛选映射，不改 `catalog.json`、`releases.json`、卡片或详情名称。空内核及未来未登记名称进入其他，不由闭源、协议兼容或名字相似推定自研。这里的自研表示有明确来源证明的项目自身维护核心，不表示没有复用第三方代码，也不是开源状态。

已有来源核验取第 01、04–09 票官方资料记录；本轮通过 agent-reach 的 GitHub `gh api .../readme` 路由读取下列官方正文，Smart 文档按网页路由用 Jina Reader 读取。核心与客户端相互链接用于交叉核实身份；这不是两个互相独立的第三方背书。

## 本轮直接读取的证据

- [Nyanpasu README](https://github.com/LibNyanpasu/clash-nyanpasu/blob/main/README.md)：`Built-in support` 中 **Clash Rust** 直接链接 `Watfaq/clash-rs`，**Meow** 直接链接 `madeye/meow-rs`。不是按名称猜测别名。
- [clash-rs README](https://github.com/Watfaq/clash-rs)：标题 ClashRS，GUI 章节反向链接 Nyanpasu；[meow-rs README](https://github.com/madeye/meow-rs)：标题 meow-rs，称自己为 Mihomo 的 Rust implementation。两者有独立指定分类，不再因历史关系归 Mihomo。
- [Hako README](https://github.com/TokenPLS/Hako)：`proxy kernel based on mihomo v1.19.30`、`independent derivative`，明确同一上游基线及修改边界；第 04 票另核实官网、商店与客户端链接。Hako 归 Mihomo 是家族筛选，不声称它是完全相同二进制。
- [VX 客户端 README](https://github.com/5VNetwork/VX)：VX 内核面板；[vx-core README](https://github.com/5VNetwork/vx-core)：`vx-core powers ... VX and UmiVPN`，同组织实现且反向链接客户端；其 `go.mod` 为 `module github.com/5vnetwork/vx-core`。因此 VX 归自研；README 明确复用 V2Ray、Xray、Hysteria、sing-box 代码，不据此宣称完全从零实现或同时归四类。
- [Sudoku 核心 README](https://github.com/SUDOKU-ASCII/sudoku)：明确 official Android client Sudodroid 与 official Desktop client sudoku4x4；[Android README](https://github.com/SUDOKU-ASCII/sudoku-android)：`thin Android shell around ... sudoku Go core`。与第 05、07 票记录相符，项目自有核心进入自研。协议也被 Mihomo 支持不等于此内核是 Mihomo。
- [Exclave core README](https://github.com/ExclaveNetwork/exclave-core)：许可证包含 V2Fly 版权，不能仅凭版权继承推定其就是 V2Ray，也不凭仓库名判定完全独立自研；保守归其他。
- [Clash Party README](https://github.com/mihomo-party-org/clash-party)分别列 Smart 与 Mihomo；[Smart 官方指南](https://clashparty.org/docs/guide/smart-core)描述智能节点选择与规则覆写。本轮所读正文不足以证明 Smart 是 Mihomo 的别名或项目自有核心，单独归其他。Clash Party 同时记录 Mihomo，因此会命中 Mihomo 和其他。
- CoreX 使用第 08 票已核验的[官方商店](https://apps.apple.com/us/app/linkclashx/id6757075299)和 [Apple lookup](https://itunes.apple.com/lookup?id=6757075299&country=us&entity=software)证据：`CoreX engine`、`Built on the Mihomo architecture`。按明确架构家族归 Mihomo，保留 CoreX 名称，不声称只是改名。

## 逐项映射（29 项）

| 原始字符串       | 分类     | 依据／保守边界                                               |
| ---------------- | -------- | ------------------------------------------------------------ |
| AnyTLS Zig       | 其他     | 第 09 票 fancyss 来源；独立实现，不在指定六种具名类中        |
| Clash            | 其他     | 第 04–06 票原始 Clash 与 Mihomo 分列，不将祖先实现等同后继   |
| Clash Premium    | 其他     | 第 04–05 票与 Nyanpasu README 分列，不等同 Mihomo            |
| Clash Rust       | clash-rs | 本轮 Nyanpasu 链接与 clash-rs 反向 GUI 链接                  |
| CoreX            | Mihomo   | 第 08 票官方明确 Built on the Mihomo architecture            |
| Exclave core     | 其他     | 第 04 票 go.mod 与本轮版权正文不足以证明具名类别或自研       |
| Hako             | Mihomo   | 本轮官方明确 Mihomo 基线及衍生关系                           |
| Hysteria         | 其他     | 第 05、07 票独立内核，不按协议兼容合并                       |
| Hysteria 2       | 其他     | 第 04 票 FoXray 历史官方证据，不改历史例外                   |
| Hysteria2        | 其他     | 第 09 票 fancyss 来源，原名称保留                            |
| Meow             | meow-rs  | 本轮 Nyanpasu 明确链接 madeye/meow-rs                        |
| Mihomo           | Mihomo   | 第 01、04–09 票官方来源，同名直接匹配                        |
| NaiveProxy       | 其他     | 第 07–09 票路由器插件原始依赖，非指定类                      |
| Outline SDK      | 其他     | 第 08 票确认 SDK 使用，但不把使用 SDK 自动解释为应用自研     |
| Phantom          | 其他     | 第 05 票官方频道只足以确认核心名，不推断自研                 |
| ShadowTLS        | 其他     | 第 07–08 票插件来源，非指定类                                |
| Shadowsocks      | 其他     | 第 07–09 票插件来源，协议／核心名不推断成其他实现            |
| ShadowsocksR     | 其他     | 第 07–09 票插件来源，非指定类                                |
| Smart            | 其他     | 本轮官方指南不足以确认别名／自研；不按名称猜测               |
| Sudoku           | 自研     | 官方核心、客户端双向链接与实际核心集成；第 05、07 票身份互证 |
| TUIC             | 其他     | 第 09 票 fancyss 来源，非指定类                              |
| V2Ray            | V2Ray    | 第 01、04–09 票原名直接匹配，不与 Xray 混同                  |
| VX               | 自研     | VX 与 vx-core 官方双向链接、模块身份明确，承认第三方代码复用 |
| Xray             | Xray     | 第 01、04–09 票原名直接匹配                                  |
| clash-rs         | clash-rs | 第 07 票 Nikki RS 来源与本轮官方核心 README                  |
| dae              | 其他     | 第 07 票 dae/daed 官方来源，不在指定具名类中                 |
| meow-rs          | meow-rs  | 第 08 票四款客户端官方来源与本轮核心 README                  |
| shadowsocks-rust | 其他     | 第 04 票 Shadowsocks Android 官方来源，非指定类              |
| sing-box         | sing-box | 第 01、04–09 票原名直接匹配                                  |

空数组不计入上述29项，归其他，详情仍显示 `—`。未知新字符串也归其他。多内核逐项取并集：Nyanpasu 同时命中 Mihomo、meow-rs、clash-rs、其他；不会因有主流核心就丢弃其余分类。

## URL 与 UI 契约

继续只用 `core` 参数。新选项依次为空值、`group:mihomo`、`group:sing-box`、`group:self-developed`、`group:xray`、`group:v2ray`、`group:meow-rs`、`group:clash-rs`、`group:other`。

旧值不迁移：`core=Meow` 只返回 Nyanpasu，`core=meow-rs` 只返回原来四款应用；`core=unknown` 仅匹配空数组。触发器显示翻译后的“精确内核：…”而非伪装为全部或宽泛分类，展开仍只有九项。`group:missing` 保持空结果及无匹配选项。新选项写回既有 updateFilter，原有分页重置、语言／无关参数、详情返回和历史机制不变。

## 验证

先新增独立 29 项映射期望、固定九项顺序、具体应用集合、未知／空数组、组合及旧链接回归；首次运行因缺少新导出而失败，再实现后聚焦17项全通过。完整构建／测试／lint／格式结果在完成后追加；真实浏览器由主代理验证，不以 Node 测试冒充交互验收。

### 本轮本地验证结果

- 测试先行：`node --import ./tests/register-paths.mjs --test tests/client-core-groups.test.mjs` 首次因尚未实现 `coreGroupLabels` 导出而失败。
- 实现后聚焦：`node --import ./tests/register-paths.mjs --test tests/client-core-groups.test.mjs tests/client-catalog.test.mjs tests/client-pagination.test.mjs`，17/17 通过。
- `pnpm build` 退出0，随后 `pnpm test` 退出0，204/204通过（含发布快照升级副本回归）。
- `pnpm lint` 退出0，有既有警告及主代理浏览器证据脚本的未使用表达式警告，本票产品改动未新增警告。
- 仅本票六个改动文件执行 Prettier write/check，不格式化主代理的 `research/12-evidence/`。
- 有效旧值才显示精确标签；非法 `core=missing` 保留空结果和“无匹配选项”。Node 已覆盖空结果；真实触发器及其他交互证据由主代理浏览器补充。

### 真实浏览器验证

- 在构建后的本地预览 `http://127.0.0.1:4173` 使用 Chromium，`12-evidence/browser.js` 完成 390/768/1440 × 中英文 × 实际 light/dark 共12组，结果见 `browser-result.json`。逐组断言HTML实际主题、九项及顺序、无横溢出、弹层边界、Enter/Space展开、Escape返回焦点、End键选择、Tab到代码状态、刷新与详情返回、分类变化回首页且保留语言/无关参数。
- `12-evidence/behavior.js` 使用独立名单核对 meow-rs/clash-rs 全部成员及四种旧精确参数、非法值空结果和无匹配提示，验证各主流类/自研/其他代表、平台/搜索/价格/代码组合、多内核卡片/详情原名、浏览器前进后退、详情刷新、空态清除、分页重置和历史未知详情；结果见 `behavior-result.json`。
- 浏览器脚本初次运行分别遇到CLI沙箱无URL全局及Radix选项关闭后焦点异步恢复，均修正脚本（URL读取放入page.evaluate，Tab前等待真实焦点），未修改产品逻辑降低断言。最终两套均通过。
- 已读取12组截图拼图及桌面中文展开态、别名详情、未知详情原图。保留7张代表WebP在 `12-evidence/`，原图和执行日志在 `/tmp/catalog-12/`。控制台仅站点既有启动信息，无页面错误。
- 重放：先 `playwright-cli -s=catalog12 open http://127.0.0.1:4173/clients/`，再 `sed '1s/^export default //;$s/;$//' <脚本.js> > /tmp/catalog-12/run.js`，最后 `playwright-cli -s=catalog12 run-code --filename=/tmp/catalog-12/run.js`。脚本导出仅便于静态检查，CLI接收剥离export的函数表达式。

以上不代表生产部署或用户最终验收；未执行线上同步或发布。

主代理最终再次依序运行 `pnpm build`、`pnpm test`，204/204通过，无跳过；日志 `/tmp/catalog-12/{build,test}-final.log`。最终lint退出0，浏览器证据脚本改为导出函数，不再新增未使用表达式警告；其余警告属于既有文件。任务脚本生成的task.json格式检查首次不通过，限定该文件格式化后复查。
