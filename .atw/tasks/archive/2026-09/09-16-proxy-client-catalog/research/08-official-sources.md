# 第08票：第5批官方来源核验与实施记录

核验时间：2026-09-17 UTC（承接2026-09-16会话）。范围仅第109–133项；未启动09或10票、未提交或标记完成。

## 实施结果与图标授权

- 25项资料、47个平台快照已写入，累计133项。20条iOS来源和4条GitHub来源真实成功；24款官方图标已视觉核验、等比转换WebP。
- **ShadowSocksR Plus+ 图标例外已获授权**：官方 `fw876/helloworld` 完整递归树未截断；唯一PNG是依赖 `shadowsocksr-libev/src/libsodium/logo.png`，不能当应用品牌。README没有应用图标。用户于2026-09-17明确回复“授权文字占位图”，已记入PRD专项例外；新增本站制作的SSR+文字SVG并明确标注非官方，其他24款仍要求官方WebP图标。下文缺图失败为授权前的历史验证记录，不代表当前状态。
- Outline GitHub仓库发布超过既有10页×100上限，真实同步保守失败，Windows经审查补核后人工维护v1.10.1正式EXE直链及发布时间，自动成功时间仍未知；iOS与Mac来源不受影响。保留分页保护，不用离线夹具成功冒充生产核验。
- 未新增接口、平台枚举、页面布局或抓取器。Apple TV/Vision等不在既定平台分类中；资料提及不扩展新栏目。

## 方法与边界

GitHub使用`gh api`读取元数据、README、LICENSE、完整目录和发布；网页遵循agent-reach经Jina Reader阅读，图片及Apple lookup使用原站curl。重试为空的四个Apple页面后取得Compatibility。商店身份分别用lookup的trackId/bundleId与商店页面互证；它们属于同一发布体系，不声称两个独立维护者。重要内核/平台尽可能用官方网站、源码或发布说明交叉检查。没有独立内核证据时留空，不从协议名、Clash配置兼容或参考站推断实现。

临时抓取与执行脚本在`/tmp/catalog-b5/`，不提交。仓库保留裁剪真实同步fixture于`tests/fixtures/client-releases/batch-5/`；本文件保留官方URL、关键引文和结论。图标的逐项原始URL在`public/client-icons/NOTICE.txt`，不取参考站图标。

商店未提供公开应用源码入口的商业项目标“未公开”，不等同确认其底层库闭源；主导开发采用商店官方Seller，已核实开源项目采用许可证署名/维护者。未知完整功能费用保持unknown，不把商店Free等同全部免费。iOS兼容Mac记录只保留官方商店入口与硬件限制，不复制iOS版本；原生Mac独立lookup暂人工维护，因为现有适配器只允许iOS。

## 109 Open-Box

[README](https://github.com/liandu2024/Open-Box)明确完整包包含应用、sing-box、Node和Geo数据，x64/arm64为OpenWrt路由器，至少512MB存储/内存。仓库只公开安装维护脚本，面板/内核许可随包，因此源码状态partial而非open。v0.1.201只选两个`open-box-v0.1.201-linux-{arm64,x64}.tar.gz`完整包；虽然文件名含linux，不列通用Linux平台；排除app/kernel/runtime/geo组件、校验及无版本别名。品牌来自README引用`docs/pic/logo.png`。

## 110 ShadowSocksR Plus+

[仓库](https://github.com/fw876/helloworld)、[Makefile](https://github.com/fw876/helloworld/blob/master/luci-app-ssr-plus/Makefile)与[GPL-3.0正文](https://github.com/fw876/helloworld/blob/master/LICENSE)核对。Makefile `LUCI_PKGARCH:=all`；列Xray、Mihomo、Shadowsocks Rust、ShadowsocksR、NaiveProxy、ShadowTLS，v2ray-plugin不是V2Ray内核。v196.9只选两个LuCI主包，独立核心不当完整管理应用。包名196-r9与应用tag不同，来源固定本代际。唯一阻塞为官方图标，详见首节。

## 111 Orbit X

[官方商店](https://apps.apple.com/us/app/orbit-x/id6762544103)；[Apple lookup](https://itunes.apple.com/lookup?id=6762544103&country=us&entity=software)。本轮版本 `1.7.1`、当前版本发布时间 `2026-08-22T01:50:18Z`；Seller `ADOPT AMERICA NETWORK`；bundleId `com.TKPUGQFAD8.orbitx`。图标来自同身份`artworkUrl512`。

商店支持iPhone/iPad及Apple Silicon Mac；介绍写Xray系列协议与NetworkExtension，不等于可确认Xray-core实现，内核空数组。

## 112 V2Box

[官方商店](https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690)；[Apple lookup](https://itunes.apple.com/lookup?id=6446814690&country=us&entity=software)。本轮版本 `10.1.8`、当前版本发布时间 `2026-09-15T02:32:48Z`；Seller `techlaim`；bundleId `hossin.asaadi.V2Box`。图标来自同身份`artworkUrl512`。

[Google Play](https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box)列HexaSoftware、回链hexasoftware.dev并明确“v2ray core”；Apple 10.1.8发行说明明确“Xray-Core 26.7.28”。因此应用级保留两代内核，不从协议名猜测。Android/iOS/Mac三平台；Android版本未知不复制Apple版本。Google Play列广告/内购，故完整费用unknown。

## 113 Outline

[官网](https://getoutline.org/)、[客户端下载](https://getoutline.org/get-started/#step-3)、[系统要求](https://support.getoutline.org/client/getting-started/system-requirements)与[仓库](https://github.com/OutlineFoundation/outline-apps)确认五平台、Outline SDK和Apache-2.0；不把Outline Manager并入。官网底部组织归属Outline Foundation，Jigsaw-Code仓库重定向已核实。iOS ID1356177741 / `org.outline.ios.client`，Mac ID1356178125 / `org.outline.macos.client`是两条独立应用信息；两者本轮虽同为1.21.0，发布时间不同。Windows v1.10.1同标签`src/electron/electron-builder.json`明确NSIS ia32，配置x86；Linux AppImage架构未独立确认，只保留官网入口。GitHub真实分页超限，不刷成功时间；人工快照已补v1.10.1、2023-03-20T21:16:19Z与x86 EXE，source/fallback均为该tag官方Release。图标是Client绿色圆环，不是Manager。

## 114 Potatso

[官方商店](https://apps.apple.com/us/app/potatso/id1239860606)；[Apple lookup](https://itunes.apple.com/lookup?id=1239860606&country=us&entity=software)。本轮版本 `2.16.0`、当前版本发布时间 `2026-01-06T01:40:58Z`；Seller `Potatso Lab LTD`；bundleId `com.touchingapp.potatsolite`。图标来自同身份`artworkUrl512`。

Apple条目是`com.touchingapp.potatsolite`，别名Potatso Lite；不能套用历史Potatso开源仓库的许可。兼容性无Mac；内核实现未知，不把SS/SSR协议当库身份。商店Pro去广告$5.99，完整体验含付费功能。

## 115 OnlyNet

[官方商店](https://apps.apple.com/us/app/onlynet-vpn-client/id6502987522)；[Apple lookup](https://itunes.apple.com/lookup?id=6502987522&country=us&entity=software)。本轮版本 `1.2.1.8`、当前版本发布时间 `2026-09-13T05:51:31Z`；Seller `HNET TECHNOLOGY PTY LTD`；bundleId `com.gala.speedgoup`。图标来自同身份`artworkUrl512`。

商店明确Mac兼容性但未独立核验版本；Premium升级$0.99。DNS及协议支持不证明使用哪个内核，保持未知。

## 116 Jamjams

[官方商店](https://apps.apple.com/us/app/jamjams/id6477182037)；[Apple lookup](https://itunes.apple.com/lookup?id=6477182037&country=us&entity=software)。本轮版本 `2.4.3`、当前版本发布时间 `2026-07-30T16:58:27Z`；Seller `Fiber Logic Inc`；bundleId `net.fiberlogic.jamjams`。图标来自同身份`artworkUrl512`。

[官网](https://jamjamsapp.com/)、[Windows](https://jamjamsapp.com/windows.html)、[Mac](https://jamjamsapp.com/macos.html)明确三平台。Windows 0.2.1需Windows10+且仅JustMySocks，架构未核实保留页面；Mac 2.4.4为Apple Silicon/Intel universal DMG，HEAD 200；iOS独立2.4.3。Mac 2.4.1和Windows 0.1.12变更记录分别明确迁移到Xray。官网未给可靠发布日期，不把HTTP Last-Modified冒作发布时间。

## 117 RabbitHole

[官方商店](https://apps.apple.com/us/app/rabbithole-vpn-client/id6683309629)；[Apple lookup](https://itunes.apple.com/lookup?id=6683309629&country=us&entity=software)。本轮版本 `1.5.0`、当前版本发布时间 `2026-08-29T14:12:13Z`；Seller `RABBIT HOLE STUDIO LTD`；bundleId `com.rabbithole.RabbitHole`。图标来自同身份`artworkUrl512`。

Apple说明专门列Mac按进程分流，Compatibility列macOS15+。列出的协议数量不能证明其内核；完整费用未明确。

## 118 ShadowClash

[官方商店](https://apps.apple.com/us/app/shadowclash/id6760091330)；[Apple lookup](https://itunes.apple.com/lookup?id=6760091330&country=us&entity=software)。本轮版本 `1.8`、当前版本发布时间 `2026-09-02T00:30:16Z`；Seller `FUZZYPN COMPANY LIMITED`；bundleId `com.fuzzypn.hinet`。图标来自同身份`artworkUrl512`。

商店自称Clash-compatible，并支持访客导入/Panel token；不能据此断言Mihomo实现。Mac限制Apple Silicon。

## 119 Bamboo Dragonfly

[官方商店](https://apps.apple.com/us/app/bamboo-dragonfly/id6473621095)；[Apple lookup](https://itunes.apple.com/lookup?id=6473621095&country=us&entity=software)。本轮版本 `1.41.0`、当前版本发布时间 `2026-05-23T17:07:58Z`；Seller `Flhcc Tech, LLC`；bundleId `com.flhcc.BambooDragonfly`。图标来自同身份`artworkUrl512`。

Apple兼容iPhone/iPad/Apple TV，不含Mac；保留既定iOS分类。商店内购列Pro$1.99、Lifetime2025 $2.99，不推断订阅时长。

## 120 Oneok VPN

[官方商店](https://apps.apple.com/us/app/oneok-vpn/id6761477404)；[Apple lookup](https://itunes.apple.com/lookup?id=6761477404&country=us&entity=software)。本轮版本 `4.9`、当前版本发布时间 `2026-09-06T16:57:54Z`；Seller `Olivut Resources Ltd`；bundleId `com.OneOk.Connect`。图标来自同身份`artworkUrl512`。

lookup/页面标题仍为Oneok VPN，介绍正文改称OneOk Connect；保留冻结名称并新增别名，不错误宣称标题已更名。iPhone与Apple Silicon Mac；不凭VLESS/VMess协议判断内核。

## 121 XTunnel

[官方商店](https://apps.apple.com/us/app/xtunnel/id6741881458)；[Apple lookup](https://itunes.apple.com/lookup?id=6741881458&country=us&entity=software)。本轮版本 `2.0`、当前版本发布时间 `2026-03-06T10:28:19Z`；Seller `Ami Innotech Limited`；bundleId `com.haolin.shadowx`。图标来自同身份`artworkUrl512`。

官方中文介绍列iPhone/iPad及SS/Trojan/VMess/SOCKS5/HTTPS；Compatibility另列Apple Silicon Mac。Seller为Ami Innotech Limited，不把版权行或第三方人物当主导开发。

## 122 v2RAGE

[官方商店](https://apps.apple.com/us/app/v2rage/id6761075402)；[Apple lookup](https://itunes.apple.com/lookup?id=6761075402&country=us&entity=software)。本轮版本 `2.0`、当前版本发布时间 `2026-09-07T08:49:07Z`；Seller `DGTL TECH LLC`；bundleId `ac.rage.v2`。图标来自同身份`artworkUrl512`。

[官网](https://v2rage.com/)FAQ明确“no in-app purchases, no paywall, and no subscription”，可标免费。官网称open client不等于开放源码许可证，没有应用源码证据不标开源；支持协议不作内核证据。

## 123 OpenVXS

[官方商店](https://apps.apple.com/us/app/openvxs-vpn/id6757167153)；[Apple lookup](https://itunes.apple.com/lookup?id=6757167153&country=us&entity=software)。本轮版本 `0.17.5`、当前版本发布时间 `2026-08-07T10:40:56Z`；Seller `Intime Infotech Inc`；bundleId `com.openvxs.vpn`。图标来自同身份`artworkUrl512`。

Apple说明V/X/S分别对应V2Board/XBoard/SSPanel，是面板兼容身份，不是内核。需兼容服务账号。Compatibility未列Mac，故只列iOS。

## 124 Dash VPN

[官方商店](https://apps.apple.com/us/app/dash-vpn-for-outline-vless/id6758860923)；[Apple lookup](https://itunes.apple.com/lookup?id=6758860923&country=us&entity=software)。本轮版本 `1.0.2`、当前版本发布时间 `2026-03-25T03:46:58Z`；Seller `Hangzhou Dash Network Software Co., Ltd.`；bundleId `com.dashvpn.mac`。图标来自同身份`artworkUrl512`。

[官网](https://getdashvpn.com/)回链同商店ID并明确原生iOS/Mac；“for Outline/Vless/V2Ray/singbox servers”描述服务器兼容，不当内核列表。Pro年$6.99、月$0.99。bundleId含mac但lookup kind=software，不能据字符串让iOS适配器更新Mac。

## 125 Ship

[官方商店](https://apps.apple.com/us/app/ship-fastly-network-tool/id6736895153)；[Apple lookup](https://itunes.apple.com/lookup?id=6736895153&country=us&entity=software)。本轮版本 `1.0.0`、当前版本发布时间 `2024-10-16T21:06:54Z`；Seller `Shenzhen Star Umbrella Technology Co., Ltd.`；bundleId `com.yellow.clash`。图标来自同身份`artworkUrl512`。

Apple自述流量捕获/用量监测；正文MITM段落出现“Loon”疑似复制，未据此给Ship推断Loon内核或归属。Seller与Copyright署名不同，采用Seller；Mac仅Apple Silicon。

## 126 VoxiProxyTun

[官方商店](https://apps.apple.com/us/app/voxiproxytun/id6768408266)；[Apple lookup](https://itunes.apple.com/lookup?id=6768408266&country=us&entity=software)。本轮版本 `0.14.3`、当前版本发布时间 `2026-09-04T15:12:37Z`；Seller `A NETWORK TECHNOLOGIES, TOO`；bundleId `com.voxiproxy.VoxiProxyTun`。图标来自同身份`artworkUrl512`。

官方俄文说明支持Apple Silicon Mac、订阅/二维码、自动重连及锁屏状态，并明确不提供服务器。底层实现与完整费用未知。

## 127 VPSUS

[官方商店](https://apps.apple.com/us/app/vpsus/id6761466149)；[Apple lookup](https://itunes.apple.com/lookup?id=6761466149&country=us&entity=software)。本轮版本 `3.1.0`、当前版本发布时间 `2026-09-08T12:56:49Z`；Seller `D.T. TOUR P.C.`；bundleId `com.vpsus.vpsus`。图标来自同身份`artworkUrl512`。

俄文官方说明付费服务器订阅与自备VLESS/VMess配置是两种模式；内购为服务/余额，不把内购金额直接当客户端完整费用，因此unknown。

## 128 Clash Lite

[官方商店](https://apps.apple.com/us/app/clash-lite/id6761357475)；[Apple lookup](https://itunes.apple.com/lookup?id=6761357475&country=us&entity=software)。本轮版本 `1.0.13`、当前版本发布时间 `2026-09-14T17:57:31Z`；Seller `Hood Lawn Service Inc.`；bundleId `com.Hood.ClashLite`。图标来自同身份`artworkUrl512`。

Apple介绍明确“Mihomo-based”，发行说明“Update mihomo v1.19.31”，两处互证；iPhone及Apple Silicon Mac。开发者链接是AppPrivacy而非应用源码，不标开源。

## 129 LinkClashX

[官方商店](https://apps.apple.com/us/app/linkclashx/id6757075299)；[Apple lookup](https://itunes.apple.com/lookup?id=6757075299&country=us&entity=software)。本轮版本 `1.1.9`、当前版本发布时间 `2026-08-19T09:09:27Z`；Seller `Installer Digital Technology OU`；bundleId `com.mielink.nexuslink`。图标来自同身份`artworkUrl512`。

商店明确“CoreX engine”“Built on the Mihomo architecture”，内核按CoreX标识而非偷偷改名Mihomo；官方明确全部功能免费、无广告/内购。Mac为Apple Silicon兼容，Apple TV另有平台但不新增本站枚举。

## 130 Meow

[官方商店](https://apps.apple.com/us/app/meow-smart-vpn/id6778303404)；[Apple lookup](https://itunes.apple.com/lookup?id=6778303404&country=us&entity=software)。本轮版本 `1.5.0`、当前版本发布时间 `2026-08-11T06:15:18Z`；Seller `Shanghai Tangzixiang Information Technology Co., Ltd`；bundleId `com.tangzixiang.meow`。图标来自同身份`artworkUrl512`。

[源码](https://github.com/meow-rs/meow-ios)（madeye/meow-ios重定向）、MIT正文及Apple描述共同确认Max Lv、meow-rs；一次性$1.99且明确无内购订阅。商店正式1.5.0与GitHub较新tag不混用；README、描述最低系统表述不一致，本轮不硬编码最低iOS版本。Mac仅兼容层，独立版本未知。图标来自Apple artwork，不套用未发布源码新图。

## 131 Meow Android

[仓库](https://github.com/meow-rs/meow-android)、MIT正文、[v1.0.8](https://github.com/meow-rs/meow-android/releases/tag/v1.0.8)确认Android/meow-rs/Max Lv；GitHub公开uploaded universal APK且draft/prerelease均false，发布说明无GitHub测试限制。说明另写Google Play内部测试轨道，当前不把该轨道当商店正式发布，页面明确区分；仅跟踪GitHub发布包。图标取fastlane商店素材。

## 132 BaoLianDeng

[官方商店](https://apps.apple.com/us/app/baoliandeng/id6779101876)；[Apple lookup](https://itunes.apple.com/lookup?id=6779101876&country=us&entity=software)。本轮版本 `6.0`、当前版本发布时间 `2026-08-14T15:15:33Z`；Seller `Shanghai Tangzixiang Information Technology Co., Ltd`；bundleId `io.github.baoliandeng.macos`。图标来自同身份`artworkUrl512`。

[源码](https://github.com/madeye/BaoLianDeng)与MIT许可确认Max Lv及Mac专属。Apple lookup kind=mac-software、bundleId=io.github.baoliandeng.macos，不混入iOS；6.0发行说明“New Rust meow-rs kernel”覆盖过时简介的Mihomo声明，当前只列meow-rs。Mac商店正式6.0、$19.99，人工维护独立版本/日期，无自动成功时间。GitHub5.5旧包与主分支版本不覆盖商店。

## 133 Paws

[仓库](https://github.com/richerfu/Paws)、MIT正文、同v1.1.0 `crates/paws_core/Cargo.toml` meow-*依赖及三份正式HAP资产交叉确认meow-rs/HarmonyOS；README虽写Clash/mihomo client却不是Mihomo二进制内核。arm64-v8a/armeabi-v7a/x86_64三包均unsigned，保留自行签名和HarmonyOS6.1/兼容6.0.2条件。图标为docs/brand/paws-app-icon.png黑色爪印。

## 验证与剩余工作

- 红灯：新增第08票独立基线时4项全部失败；补齐资料后累计133项、独立47个平台/内核、过滤与版本隔离通过，图标测试仅剩ShadowSocksR Plus+失败。
- 来源focused测试覆盖5条GitHub/20条商店：逐平台完整文件名和架构、等量组件错换、Windows/Linux错归、错误版本URL、草稿/预发布/测试资产、缺固定架构、Apple身份/平台隔离、失败保留与其他来源继续。离线CLI显式加入本批真实fixture，不读取生产数据生成期望。
- 真实同步使用既有githubClient/officialClient/syncReleases，注入真实gh/curl传输；GitHub发行和资产分别分页读取、附件仅HEAD不下载。4条GitHub/20条商店成功，Outline分页超限保守失败。Jamjams官网DMG独立HEAD200，仍人工维护。
- 旧108项及其发布对象通过与HEAD逐对象比较保持不变；前批测试只收窄固定批次截取范围，不改变它们的身份/平台/内核期望。
- 浏览器：390/768/1440 × 中文/英文 × 实际浅/深主题，共12组合；搜索+Windows/Xray/代码/费用组合筛选，键盘Enter进入、字母切换Mac、Tab提交、Enter返回筛选，正确显示Windows0.2.1/Mac2.4.4及官方DMG，无横向溢出。另逐项检查25款/47个平台所有获取选项URL及版本、24图标加载成功、SSR Plus明确缺图。已查看移动英文深色和桌面中文浅色截图。
- 初轮自动化未等待React提交即连续改变URL状态，造成旧参数覆盖，检查失败；增加参数和渲染等待后12组合重跑通过。未修改页面来迎合测试。这不替代快速连击交互的专门检查。
- 临时结果：`/tmp/catalog-b5/{red-test,focused,lint,build,test,browser-results,browser-all-results}.txt`，真实网络日志`sync-results.json`，截图`mobile-dark-en.png`/`desktop-light-zh.png`。工具和抓取原文均不提交。

授权前已完成两轮独立双轴审查，Outline Windows遗漏已修复并复审确认。当时唯一阻塞为SSR Plus+图标，用户随后单独授权文字占位。授权未扩展至其他应用或下载条件，未推进09或10票；授权后的验证与审查见后续记录。

### 最终验证记录

- `pnpm lint`：退出0，保留既有警告；`pnpm build`：退出0（含TypeScript编译）。
- focused：40/40通过；包括新来源、目录动态英文、离线CLI及第3/4批受影响回归。
- 构建后`pnpm test`：**174项、173通过、1失败**，唯一失败为本批图标完整性，缺`shadowsocksr-plus`，没有跳过或放宽断言。
- `git diff --check`通过。HEAD基线108项人工资料、234条发布快照逐对象不变；新增25项、47条快照。
- 最后重建后额外浏览器检查V2Box Android，来源标签为Google Play、官方商店链接正确、版本与成功时间未知，不误标Apple来源。
- GitHub本轮8个安装包HEAD全部200；额外Jamjams DMG HEAD200。正式快照成功时间来自2026-09-17实际同步，不是测试里的固定`now`。
- 最终日志：`/tmp/catalog-b5/final-{focused,lint,build,test}.txt`，最终浏览器标签检查`final-label-check.txt`。首轮全量测试的第3批尾切片回归已修复为固定区间17–23；本批20条Apple来源有独立身份断言，不借此放宽前批期望。

### 独立审查后：Outline Windows 人工直链修复

规格轴指出：自动分页失败不应抹去人工可核验的正式发布。重新读取官方release tag接口（release id `95608656`）、独立资产接口（asset id `100198671`）以及同标签[构建配置](https://github.com/OutlineFoundation/outline-apps/blob/v1.10.1/src/electron/electron-builder.json)：v1.10.1为非draft/非prerelease，发布时间2023-03-20T21:16:19Z，EXE为uploaded，NSIS目标明确ia32。重新HEAD请求经302跳转最终200。

Windows快照补齐上述版本/时间、`x86 / exe`官方固定直链；source与fallback均指向[v1.10.1官方Release](https://github.com/OutlineFoundation/outline-apps/releases/tag/v1.10.1)。保留`maintenance=manual`，没有`lastCheckedAt`。不修改分页上限、抓取器、其他平台或SSR Plus+图标断言。

新增独立回归先红后绿，冻结该快照全部关键字段，并验证分页超限时，无论旧直链HEAD有效还是临时失败，都原样保留人工版本、直链、来源和未知成功时间。focused共21项，20通过、1失败（仍为SSR Plus+图标）；lint/build退出0；完整175项、174通过、1失败（同一缺图阻塞）。浏览器390/768/1440三宽度确认Windows v1.10.1、2023-03-20、x86 EXE、人工维护及未知成功时间，Tab聚焦正确下载链接。网络、红绿测试、构建与浏览器日志均在`/tmp/catalog-b5/outline-review-*`，未提交临时文件。

### 图标专项授权后的验证（2026-09-17）

- 用户明确回复“授权文字占位图”，仅适用于ShadowSocksR Plus+图标。PRD、素材NOTICE和独立测试同步记录边界；新增`shadowsocksr-plus.svg`，标题明确“文字占位图（非官方图标）”，显示SSR+，其余24款保留官方WebP断言。
- 先改独立测试并确认缺图失败，再补图标后focused 9/9通过。`pnpm lint`、`pnpm build`通过，构建后全量`pnpm test` **175/175通过**，没有跳过测试。
- 浏览器补验390/768/1440 × 中英 × 实际浅深主题共12组合：列表/详情SVG正常加载，无横向溢出，官方包链接不变，键盘Enter返回保留搜索与OpenWrt筛选；已查看移动英文深色截图。
- 临时日志`/tmp/catalog-b5/ssr-icon-{red,green}.txt`、`authorized-{lint,build,test}.txt`、`ssr-browser-results.txt`及截图`ssr-mobile.png`，不提交工具产物。图标授权没有修改发布快照、下载或其他应用资料。

### 最终独立复审

- 规格轴：复审通过，无剩余发现。25项／47平台、SSR Plus+图标专项授权边界及Outline人工直链修复符合规格；独立定向16/16通过。
- 规范轴：复审通过，无剩余硬违规或判断项。新增来源、独立测试、前批冻结子集与动态翻译符合契约；独立focused 45/45通过。
- 规格轴曾指出的浏览器临时加载态快照已移至`/tmp/catalog-b5/ssr-initial-page.yml`；两轴对移除后的完整补丁再次复审确认，不提交临时工具产物。
