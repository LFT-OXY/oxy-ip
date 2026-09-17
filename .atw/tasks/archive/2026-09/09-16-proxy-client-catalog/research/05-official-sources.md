# 第 05 票：官方来源核验与实施记录

核验日期：2026-09-16。范围为冻结基线第 34–58 项，共 25 项。**最新状态：本票实现与完整双轴复审均已通过。** 下文保留分阶段研究历史；各次暂停和未完成项的后续结论见文末，最终报告见 `05-review.md`。未部署。

## 读取方法与证据边界

- 按 `agent-reach` 路由：GitHub 使用 `gh api` 读取仓库、README、发布列表、目录树及特定源码；网页使用 Jina Reader，HTML/Apple lookup 使用原站 curl。参考站仅用作独立身份/收录对照，不作为官方归属或实时下载源。
- 每项独立参考：`https://huarun.win/apps/<应用ID>`；逐项原文及实际官方响应裁剪保存于 [`05-evidence/`](./05-evidence/)。该目录每个 JSON 对应一个固定 ID，包含参考文本、官方仓库信息、README、资源路径、正式/测试发布元数据、实际资产 URL，适用时包含 Apple lookup 与页面。`manifest.json` 记录裁剪样本的 SHA-256。原始临时副本另在 `/tmp/catalog05/`，但后续不依赖它才能恢复研究。
- GitHub 发布列表本轮只读第一页（最多100项），未全部分页，不能把“该页未找到正式版”写成“历史从未有正式版”。资产取 release 响应，尚未再次独立分页读取 assets，也未逐包 HEAD。下文版本是**已观察候选**，不是生产同步成功记录。
- 图标路径被目录树、README、官网HTML或lookup列出，不等于已经下载、转换和视觉核对。本轮没有生成生产图标。不得把网页截图、第三方重制图或项目使用的仪表盘图标冒充应用图标。
- 自动源均为后续候选方案，尚未接入或实跑。人工渠道不填自动核验时间；未确认的发布日期、架构、完整费用继续未知。下文未写“免费”的项目，不得仅凭能免费下载便断言完整功能免费。
- 架构、许可和平台如尚待补读，明确列出；确认4项例外也不等于豁免这些剩余常规核验。

## 逐项结果

### 34. ClashX Meta (`clashx-meta`)

- 官方：[仓库](https://github.com/MetaCubeX/ClashX.Meta)、[候选正式 v1.4.45](https://github.com/MetaCubeX/ClashX.Meta/releases/tag/v1.4.45)。平台 Mac；维护者 MetaCubeX；仓库 API 为 AGPL-3.0。
- 主README仍含旧ClashX名称、上游下载入口，不能照抄为本项目入口。实际 [`install_dependency.sh`](https://github.com/MetaCubeX/ClashX.Meta/blob/v1.4.45/install_dependency.sh) 拉取 Mihomo 的 darwin arm64/amd64 并 lipo 合并；项目构建文件使用 `ARCHS_STANDARD`。最终客户端ZIP的通用架构仍需在正式构建产物或明确构建配置上复核。
- 入口为本仓库 Releases；资产 `ClashX.Meta.zip`。可复用 GitHub 自动源，固定包名须有架构映射证据。未发现独立收费说明，尚未完成完整费用复核。
- 图标路径：`ClashX/Images.xcassets/AppIcon.appiconset/icon_256x256.png`，来自本仓库目录树，待取图。

### 35. V2rayU (`v2rayu`)

- 官方：[v5.2.0 README](https://github.com/yanue/V2rayU/blob/v5.2.0/README.md)、[发布](https://github.com/yanue/V2rayU/releases/tag/v5.2.0)。Mac 14+、Xray-core 与 sing-box 双内核，维护者 yanue。
- 当前默认分支为 `rm`，README只有 `rm`，但**v5.2.0标签的完整源码仍可读取**，README明确 GPLv3；不能仅因默认分支清空判定发布源码消失。正式标签 LICENSE 原文还需补核。
- 获取：本仓库 Releases；`V2rayU-64.dmg`、`V2rayU-arm64.dmg`，`V2rayU-dSYM.zip`为调试符号，不作普通安装包。候选自动GitHub源；64对应架构需结合构建脚本确认。
- 图标：[正式标签资源](https://github.com/yanue/V2rayU/blob/v5.2.0/V2rayU/Resources/Assets.xcassets/AppIcon.appiconset/256.png)。费用未见完整收费说明，仍需补核。

### 36. Surfboard (`surfboard`)

- 官方：[官网](https://getsurfboard.com/)、[安装说明](https://getsurfboard.com/docs/installation)、[官方发布仓库](https://github.com/getsurfboard/surfboard/releases)。官网安装页HTML明确链接该GitHub，不能按猜测的Google Play入口分发（本轮旧Play地址返回404）。
- Android；官网称网络流量处理工具。闭源应用的具体核心与完整费用尚无本轮充分依据，不能把协议兼容写成内核或推定免费。
- 发布有 **mobile-2.34.4** 与 **tv-1.1.1** 两个不同正式产品渠道。mobile有arm64-v8a、armeabi-v7a、universal、x86、x86_64五个APK；TV还含APKS。不能以全仓最新TV版本替换手机版本，也不能同一平台快照混配两版包。
- 自动候选需要按mobile渠道过滤后选正式版；TV保留官网说明并标明独立版本，或先人工维护，不能静默丢失渠道差异。官网说明Telegram渠道可能有未知问题，不把其更新频率当正式性证明。
- 图标：官网HTML指向 `https://getsurfboard.com/img/logo.png`，待下载视觉核对。

### 37. InsightBox (`insightbox`) — 图标阻塞

- 官方：[发布频道](https://t.me/s/v2rayInsight)、[核心依据263](https://t.me/v2rayInsight/263)、[1.1.2发布287](https://t.me/v2rayInsight/287)、[arm64获取288](https://t.me/v2rayInsight/288)。频道明确InsightBox基于NekoBox，另一个v2rayInsight基于v2rayNG；263明确sing-box 1.11.3。
- Android；未发现公开应用源码/许可证或明确个人开发归属。频道APK可获取，不代表已经核实完整功能费用。1.1.2发布贴与四架构APK相互对应；后续v2rayInsight 2.x Test不是InsightBox更新。
- 人工原因：Telegram帖子分发，无既有版本适配器；入口可用官方帖子/频道页，不伪造CDN安装包直链和架构选择器。官方287实际正文与参考站复制的英文日志不同，不能沿用参考站日志。
- **未取得InsightBox专属图标原图**。频道同时承载两款应用；279为频道换头像、281为InsightBox改图标，时间相近不是“当前频道头像必然等于当前应用图标”的证据。第三方目录图标不作官方原图。

### 38. Xray GUI (`xray-gui`)

- 官方：[README](https://github.com/SaeedDev94/Xray)、[v12.6.0](https://github.com/SaeedDev94/Xray/releases/tag/v12.6.0)。Android、XTLS/Xray-core；SaeedDev94，MIT。
- 官方README给出APK编号：基础versionCode+1=arm32、+2=arm64、+3=x86、+4=amd64；本次包名为1201–1204。不能直接把1201显示为CPU架构。
- 官方GitHub与README链接的F-Droid为入口。自动候选须有明确编号到架构映射并测试，不能用APK后缀猜架构；本轮未更改适配器。
- 图标：`metadata/en-US/images/icon.png`。应用源码可用，完整费用仍需最终确认。

### 39. Clash Mi (`clash-mi`)

- 官方：[README](https://github.com/KaringX/clashmi)、[唯一官网](https://clashmi.app)、[商店](https://apps.apple.com/us/app/clash-mi/id6744321968)。明确 Android、iOS、Windows、Mac、Linux；Mihomo；KaringX，GPL-3.0。
- GitHub候选正式 `v1.0.29.1503`；较新的1.0.30.160x标预发布，排除。四桌面/Android平台资产完整名称在样本；iOS lookup独立为1.0.29.1503，bundle `com.nebula.clashmi`，seller SUPERNOVA NEBULA LLC，price=0。
- 自动候选：GitHub四平台 + 独立Apple iOS。不使用TestFlight。图标：`assets/demo/icon_256.png`或lookup官方artwork URL。

### 40. FlClashX (`flclashx`)

- 官方：[README](https://github.com/pluralplay/FlClashX)、[v0.4.2](https://github.com/pluralplay/FlClashX/releases/tag/v0.4.2)。Android、Windows、Mac、Linux；ClashMeta/Mihomo；pluralplay，GPL-3.0。README明确开源无广告，未列收费授权。
- 官方资产含Android四架构、Windows amd64/arm64 exe/zip、Mac amd64/arm64 dmg、Linux amd64 AppImage/deb/rpm及arm64 deb。`core-v…`为预发布核心渠道，不能充作客户端。
- 可复用GitHub自动源；固定文件名仍绑定同一release URL。图标：`assets/images/icon.png`或`android/app/src/main/ic_launcher-playstore.png`。

### 41. MikuBox for Android (`mikubox-for-android`)

- 官方：[正式标签README](https://github.com/HatsuneMikuUwU/MikuBoxForAndroid/blob/1.4.3-UwU-2/README.md)、[正式发布](https://github.com/HatsuneMikuUwU/MikuBoxForAndroid/releases/tag/1.4.3-UwU-2)。Android；该发布基于sing-box/NekoBox，README标GPL-3.0，发布正文标End of Life。
- **当前主分支已换成Mihomo且API识别Apache-2.0**。不能把主分支核心/许可覆盖旧正式包的属性；后续目录应明确当前开发分支与可获取正式版的区别，不随意合并不同核心描述。
- 自动候选GitHub；标签末尾`-2`不在四个APK名中（包名`MikuBox-1.4.3-UwU-<arch>.apk`），不能强制伪造包含完整版本的文件名。
- 正式标签图标候选：`app/src/main/res/drawable-nodpi/uwu_icon_miku.png`，另有多款主题图标，仍需用该标签Android资源定义确认默认图标。维护者HatsuneMikuUwU，未见完整费用收费说明。

### 42. KunBox (`kunbox`)

- 官方：[README](https://github.com/roseforljh/KunBox)、[v2.24.1](https://github.com/roseforljh/KunBox/releases/tag/v2.24.1)。Android 7+，sing-box；roseforljh/KunK，MIT。README以赞助支持开发，未列功能付费限制。
- 正式包`app-arm64-v8a-release.apk`、`app-armeabi-v7a-release.apk`；GitHub自动候选。
- 官方图标不是PNG：`app/src/main/res/drawable/ic_launcher_foreground.xml`白色盒子路径、`ic_launcher_background.xml`黑底，原XML保存在证据中。可按原路径/颜色转SVG，但应再核对adaptive icon引用，不自行重画品牌。

### 43. NekoBox by starifly (`nekobox-by-starifly`)

- 官方：[README](https://github.com/starifly/NekoBoxForAndroid)、[1.4.2-rev-24](https://github.com/starifly/NekoBoxForAndroid/releases/tag/1.4.2-rev-24)。Android，sing-box；starifly维护分支，LICENSE正文GPLv3-or-later（API的NOASSERTION不能代替读正文）。
- 官方四架构APK可适配GitHub。README警告Play已被第三方控制，**不提供该Play入口**。README附研究/使用限制，目录应保留必要限定；不将上游捐赠信息误归新分支个人。
- 图标：`app/src/main/ic_launcher-playstore.png`；未见功能收费限制，仍需最终费用核验。

### 44. Happ Proxy (`happ-proxy`)

- 官方：[桌面README](https://github.com/Happ-proxy/happ-desktop)、[Android发布](https://github.com/Happ-proxy/happ-android/releases)、[全球Apple商店](https://apps.apple.com/us/app/happ-proxy-utility/id6504287215)。Android、iOS、Windows、Mac、Linux；Xray-core；Flyfrog LLC。
- 桌面正式候选4.2.1（4.3.0预发布）；Android独立4.4.1；iOS lookup为5.8.0、bundle `su.ffg.happ`，price=0。发布仓库不含完整客户端源码，不将发布仓库存在当开源。
- 自动候选需要两条GitHub源分别覆盖Android/桌面，再加iOS lookup。不能将Happ_beta.apk、TestFlight或RU独立Happ Lite身份混入全球版。
- 图标取lookup官方artwork。完整功能是否存在费用仍需结合官方政策核对，不能只看price=0。

### 45. clash-xiaoy (`clash-xiaoy`)

- 官方：[README](https://github.com/aimy1/clash-xiaoy)、[v2.7.20](https://github.com/aimy1/clash-xiaoy/releases/tag/v2.7.20)。Windows、Mac、Linux；aimy1，GPL-3.0，仓库已归档。
- README称Clash Nyanpasu衍生、多内核管理，但本轮**尚未核对源码中的完整内核枚举**，不能直接沿参考站填单Mihomo或复制上游全部内核。
- 正式资产为三个桌面平台；GitHub自动候选，归档不妨碍保留正式包。图标：`backend/tauri/icons/128x128@2x.png`。完整费用尚待补核。

### 46. MonadBox (`monadbox`)

- 官方：[README](https://github.com/MonadBoxLab/MonadBox)、[发布](https://github.com/MonadBoxLab/MonadBox/releases)。Android 8+手机/平板，Mihomo，MonadBoxLab，AGPL-3.0-only；README另要求发行二进制通过LICENSING政策。
- 候选`meta-v1.19.31-ab405bad`标正式且五架构APK不带测试标识；相邻alpha发布明确预发布。**正式元数据和命名通过初筛，不等于已审完许可政策/发布身份**，应补读LICENSING后再决定自动源。
- 固定包名`monadbox-meta-MonadBox-<arch>-release.apk`可适配；图标：`app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`。收费限制未最终核实。

### 47. MConnect (`mconnect`)

- 官方：[频道](https://t.me/mconnectofficial)、[官网](https://668993.xyz/)、[Phantom V2.8R1帖子](https://t.me/mconnectofficial/189)。频道自述Phantom核心，名称Mundo Connect/通途；未取得公开客户端源码/许可证、完整费用或明确法定开发者。
- 官网HTML实际提供Android APK、Windows/Linux共同7z、HarmonyOS unsigned HAP、Mac DMG，并有品牌`assets/images/logo.svg`。本轮参考站还声称iOS，但**尚无应用iOS获取入口的官方证据**；编译器支持iOS的帖子不能证明该客户端可在iOS获取。Windows/Linux则不能因参考站遗漏而忽略。
- 人工维护：文件名日期083026不等于版本或发布时间，不把频道V2.8R1直接套给所有平台；未确认架构/正式性前只提供官网获取页。Play入口是public beta，不冒作正式商店版。
- 图标候选：`https://668993.xyz/assets/images/logo.svg`；待下载视觉核验。平台和签名条件仍需后续确认。

### 48. Vproxy (`vproxy`)

- 官方：[README](https://github.com/5VNetwork/VX)、[官网](https://vx.5vnetwork.com/)、[商店](https://apps.apple.com/us/app/vproxy/id6744701950)。现名VX，保留基线Vproxy单一ID并以VX作别名，不新增身份。
- Android、iOS、Windows、Mac、Linux；README称VX内核，不凭旧品牌推断为Xray；5VNetwork，GPL-3.0。官网Pro含云同步/备份等，¥30约US$4终身；美国Apple页Pro为US$4.99，应记录地区与渠道差异，完整功能归付费。
- GitHub候选v3.10.5，iOS独立3.10.4、bundle `com.5vnetwork.x`。GitHub有Android APK/ZIP、桌面包；Windows工作流显示启用x64，arm64任务为注释，不因下载过arm64核心便宣称有arm64客户端。Mac通用架构仍需补核。
- 自动候选GitHub四平台+iOS lookup；图标`assets/dev/icon.png`或Apple artwork。不能将iOS版本套到Mac商店/DMG。

### 49. FlyClash 桌面版 (`flyclash`)

- 官方：[README](https://github.com/GtxFury/FlyClash)、[v0.2.9](https://github.com/GtxFury/FlyClash/releases/tag/v0.2.9)。Mihomo（README致谢链接），GtxFury，MIT。
- v0.2.9正式包只见Windows x64 exe/7z、Mac arm64/x64 dmg；较新0.3.x均预发布。**Linux如在新版本存在，不可将其测试包混进0.2.9**；全部平台仍需读预发布资产/官方支持说明后判断能否保留Linux官方页。
- 可适配GitHub现有正式平台；图标`src-tauri/icons/128x128@2x.png`。完整费用待补核。

### 50. FlyClash Android (`flyclash-android`)

- 官方：[发布仓库](https://github.com/GtxFury/FlyClash-Android/releases)。Android；GtxFury；仓库只有广告与截图README、无LICENSE，不冒称开源。核心（尤其Smart变体）需补核官方正文，不能仅凭名称推断全部实现。
- 已读取的发行全带Alpha/Alpha-Smart，即使`prerelease=false`也应排除。保留官方页，版本/发布时间未知，不提供测试包作为正式下载；尚未分页穷尽历史。
- 未配置自动源，人工原因是本轮未确认正式渠道。**图标也未取得独立原图**：仓库只有screenshots，不能用广告图冒充图标；可继续查官方APK资源或发布截图。此项尚属常规补查，不因下面4项例外获准就自动豁免。

### 51. Sudodroid (`sudodroid`)

- 官方：[README](https://github.com/SUDOKU-ASCII/sudoku-android)、[正式v0.3.1](https://github.com/SUDOKU-ASCII/sudoku-android/releases/tag/v0.3.1)。Android；Sudoku核心及hev-socks5-tunnel桥接；SUDOKU-ASCII。
- LICENSE正文GPLv3-or-later，另有名称/关联授权限制；代码许可证和品牌限制分开记录。README当前版本v0.4.0-rc.1是候选版，不能用它覆盖正式v0.3.1。
- 正式arm64-v8a、armeabi-v7a、universal三APK可适配GitHub；图标`app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`。未见完整功能收费说明，后续补核。

### 52. Box for Root (`box-for-root`)

- 官方：[README](https://github.com/taamarin/box_for_magisk)、[v1.10.2](https://github.com/taamarin/box_for_magisk/releases/tag/v1.10.2)。Android Root模块，Magisk/KernelSU/APatch；README列clash、sing-box、v2ray、hysteria、xray；taamarin，GPL-3.0。
- 资产`box_for_root-v1.10.2.zip`及可选`BFR-20250905-1227-release.apk`管理器。管理器不是模块本身，未查明其架构/版本前不与模块版本拼配。模块架构与核心下载方式仍需根据打包内容核验，不能盲写universal。
- GitHub自动候选针对模块；Root要求保留在说明。图标`docs/box.svg`/`docs/box.png`明确出现在README，待取图。费用未见独立收费声明。

### 53. Surfing (`surfing`)

- 官方：[README](https://github.com/GitMetaio/Surfing)、[v7.8.4](https://github.com/GitMetaio/Surfing/releases/tag/v7.8.4)。Android Root，Magisk/KernelSU/APatch；README列Clash/Mihomo、sing-box、v2ray、xray、hysteria；GitMetaio，GPL-3.0。
- 正式`Surfing_v7.8.4_release.zip`，排除Prerelease-Alpha。包中核心架构尚未确认，不能凭ZIP推断通用；候选GitHub适配前应补核。
- 图标`folder/logo.svg`由README直接引用；模块风险（配置错误、数据/设备风险）有官方警告，应保留必要Root限定。费用未见独立收费声明。

### 54. Box4Magisk (`box4magisk`)

- 官方：[README](https://github.com/CHIZI-0618/box4magisk)、[v5.1](https://github.com/CHIZI-0618/box4magisk/releases/tag/v5.1)。Android Root，Magisk/KernelSU/APatch；Clash、Mihomo、sing-box、v2ray、xray、hysteria；CHIZI-0618，GPL-3.0。
- 官方明确模块不包含代理核心二进制，需手动放入设备对应核心；`box4_v5.1.zip`是模块而非某CPU核心。自动候选GitHub，架构标注须表达脚本模块性质并与实际ZIP复核。
- 目录树发现`webui/src/assets/hero.png`、`webui/public/favicon.svg`，但**尚未证明哪张是模块品牌图，不能直接采用通用仪表盘图标**。需要补读WebUI引用及视觉核对。未见独立收费声明。

### 55. Box for Android (`box-for-android`) — 图标阻塞

- 官方：[仓库](https://github.com/boxproxy/box)、[正式1.2.8](https://github.com/boxproxy/box/releases/tag/1.2.8)、[README链接的频道](https://t.me/zero_o0)。README当前自称Box for Root，是boxproxy的独立维护项目，不与taamarin条目合并。
- Android Root模块；Mihomo、sing-box、xray、v2fly、hysteria；boxproxy，GPL-3.0。正式`box-1.2.8.zip`；频道1.2.9构建明确链接GitHub debug预发布，不能用其较新号覆盖正式版。
- GitHub自动候选，模块架构仍需核验；完整费用未见收费声明。频道还有独立BoxProxy APK管理器，不把其版本/图标自动当作模块资料。
- **官方仓库目录树没有品牌图标文件，频道名为Re且通用头像不能证明属于Box for Android。** 需用户决定是否允许明确占位图，或补充可信图标来源。

### 56. akashaProxy (`akashaproxy`) — 图标阻塞

- 官方：[仓库](https://github.com/akashaProxy/akashaProxy)、[正式候选20260825-e3ba5d6](https://github.com/akashaProxy/akashaProxy/releases/tag/20260825-e3ba5d6)、[README频道](https://t.me/akashaProxyci)。Android Magisk/KernelSU透明代理模块，原生Mihomo；GPL-3.0。
- README构建说明明确只构建Android arm64-v8a；日期+提交名ZIP为实际官方资产，不伪造语义版本。README发布链接另外指向TG-Twilight/akashaProxy，因此维护归属、上游与当前分发关系还须进一步确认，不能据链接变化擅自改ID。
- 自动候选GitHub，旧`ci-*`条目不能仅依`prerelease=false`全部当正式版；应核对当前发布策略。Root限定必须保留。
- **仓库无品牌图标，频道抓取为akashaProxy 301，头像为不可复用blob地址，未取得可确认官方图标原图。** 不拿仓库组织头像或第三方目录图冒充应用图标。

### 57. Clash MIX (`clash-mix`) — 图标及获取入口阻塞

- 官方：[仓库](https://github.com/AXEVO/Clash-MIX)、[module.prop](https://github.com/AXEVO/Clash-MIX/blob/Clash-MIX-4.0/module.prop)、[更新配置](https://raw.githubusercontent.com/AXEVO/Clash-MIX/refs/heads/Archive/Update/4.0Update.json)。默认分支Clash-MIX-4.0；README API返回404，Releases API返回空数组。
- module.prop写Android Clash透明代理Tun、版本V4.0、versionCode=20260401、author=`GFW Fucker`；仓库账户AXEVO。不能把versionCode或源码提交日期当正式发布日期。具体Mihomo核心还需从源码/二进制确认，参考站说法不算官方证明。
- 仓库无LICENSE：最多称源码可见，不按参考站“开源”推定许可证。更新配置version为v4、versionCode=20250101，zipUrl指向`https://github.com/AXEVO/Clash-MIX/releases/latest`，但当前无release。**没有已确认可安装的官方发布包**。
- 可读源码仓库不是已核验安装包；若用户接受保留源码获取页，应明确仅源码、无正式版/发布时间/成功核验时间，不写“下载正式版”。不接入必然失败的GitHub自动源。
- 图标仅见`Proxy/WebUI/`内zashboard资源（包含metacubex图片），不足以证明为Clash MIX模块图标。第三方目录图不替代证据。

### 58. Anywhere (`anywhere`)

- 官方：[README](https://github.com/NodePassProject/Anywhere)、[Apple商店](https://apps.apple.com/us/app/id6758235178)。README说明原生Swift/C协议实现，不包装sing-box或Xray；NodePassProject，发行方Argsment Limited，GPLv3源码，品牌另有限制（允许合理指称官方应用）。
- iOS/iPadOS；Apple页面另外明确M1 Mac兼容，故本任务平台应包含iOS、Mac。TV/watch不在平台枚举，不扩栏目。Mac没有本轮独立版本依据，不能套iOS版本。
- iOS lookup2.2、bundle `com.argsment.Anywhere`、免费下载，但Apple页有Anywhere Voyager US$2.99内购，完整费用/功能限制需进一步核对，不能简单归免费。
- 自动候选iOS lookup；Mac人工商店页且未知版本。GitHub无Release不影响官方App Store获取。图标：README `https://storage.argsment.com/Anywhere-AppIcon-iOS.png`或lookup官方artwork。

## 首轮4项例外范围（用户已确认）

用户于2026-09-16回复“接受两项例外”，以下四项范围已写入PRD；不是全局缺图豁免。以下问句为当时的决策原文。

1. **InsightBox：仅图标。** 官方身份、Android/sing-box和1.1.2获取帖有证据；能否在无法取得专属原图时用明确文字占位图？不要求豁免版本与应用身份隔离，也不采用共享频道头像冒充应用图。
2. **Box for Android：仅图标。** 官方模块仓库、GPL和1.2.8发布可读；能否用文字占位图？不因此把BoxProxy管理器APK合并为模块或省略Root限定。
3. **akashaProxy：仅图标。** 官方源码/发布候选可读；能否用文字占位图？不因此豁免上游分发归属、架构及正式策略复核。
4. **Clash MIX：图标 + 无已核验安装包时的获取方式。** 是否接受文字占位图，并仅保留可读官方源码仓库页，明确“当前未确认可安装的官方正式包”、未知版本/发布日期/核验时间？或需提供另一个可证明官方归属且可用的包入口才能收录。不得用失效Releases/latest、参考站包或第三方镜像补齐。

## 恢复实施时的常规工作（尚未完成）

- 用户的4项决定只改变上述局部要求。MConnect完整平台/iOS证据、FlyClash桌面Linux状态、FlyClash Android正式历史及图标、Box4Magisk品牌图、MikuBox默认主题图、模块/固定包架构、各项完整费用仍须补核。
- 为可靠来源配置同步；考虑Surfboard手机/TV渠道过滤、Xray编号架构映射，不扩大前端架构。获取完整资产与HEAD成功后才写automatic成功时间；人工网页不刷新自动时间。
- 固定名单测试来自冻结基线，累计58项不从生产数据生成期望；第04票33项和available断言应缩为其固定子集约束，但本轮未改测试。
- 后续实现需补动态英文、真实fixture回归，按构建后全量测试顺序验证。主会话负责浏览器矩阵与独立双轴审查。本次只有研究文档，未运行build/test，不声称应用可预览或票已完成。

## 授权后的实施进度（2026-09-16）

- 生产目录已从33项扩至58项，新增49个平台快照。旧91条快照逐对象与HEAD比较完全一致。
- 新增21条GitHub来源配置、4条Apple来源。真实API分页与资产HEAD检查后，38个平台快照自动更新；首轮6个平台出现临时错误未推进，单独重试后全部成功。检查时间与每条直链结果见 `05-evidence/sync-evidence.json`、`retry-evidence.json`，没有把人工页标自动核验。
- 11条人工快照：InsightBox的Android、MConnect五平台、Vproxy Mac、FlyClash Linux、FlyClash Android、Clash MIX Android、Anywhere Mac。保留逐项原因，不伪造版本、日期或架构；InsightBox 1.1.2为官方帖人工版本。
- MConnect官网明确提供Android、HarmonyOS、Windows、Mac、Linux入口；未取得iOS获取证据，不照抄参考站的iOS分类。FlyClash Linux在v0.3.3测试发布中存在，保留平台但不提供测试包。FlyClash Android读取的34条发行全在Alpha渠道，版本日期留空。
- 新增 `releaseTag` 渠道匹配和 `architectureAliases`。Surfboard只更新手机渠道，TV版本不混入；MikuBox固定旧正式代际，拒绝以新Mihomo主分支覆盖sing-box正式版。Xray包号末位映射四种真实架构。V2rayU官方构建脚本的两个DMG均打包通用应用。
- Vproxy Mac有DMG但独立架构未确认，保留官方页面、不使用iOS版本。Root模块中Box for Root、Box4Magisk、Box for Android按无平台二进制脚本标noarch，核心按设备获取；Surfing现有busybox实测ARM aarch64，akashaProxy Makefile编译Android arm64，二者不标noarch。
- 完整费用未获得充分官方依据的项目使用unknown及中英文说明，不因能免费下载或源码开放就猜成免费。Clash Mi与Happ商店明确免费；VX官方标Pro付费；Anywhere官方VoyagerNotice展示Voyager Only，商店US$2.99，按完整功能付费记录。
- 20款取得官方图标，4款按已批范围使用文字占位。FlyClash Android图标通过官方Alpha APK静态资源提取，未运行APK或把测试安装包分发给用户。KunBox原Android矢量路径转SVG。原图来源与转换见 `05-evidence/icon-provenance.json`。
- **唯一已知阻塞：Box4Magisk图标。** 进一步读取 `webui/src/App.tsx`、`webui/public/favicon.svg`、`webui/src/assets/hero.png` 确认只是Vite/React默认素材，并非模块图标。没有把该项目默默纳入已批四项例外；尚未生成 `public/client-icons/box4magisk.svg`，覆盖测试据此保持失败。需用户确认是否允许文字占位图，或提供可核验官方图标。
- UI仅补中文应用名的 `t()` 调用（卡片、标题、详情与面包屑），不改布局。真实英文动态资料测试现在枚举名称，避免“FlyClash 桌面版”在英文页面回退中文。

### 当前验证，不代表票完成

- `pnpm exec tsc -b`、`pnpm build`通过；`pnpm lint`退出0，保留既有警告，无范围外清理。
- 构建后`pnpm test`：144项，143通过，唯一失败为Box4Magisk图标缺失；没有绕过或跳过失败断言。
- 浏览器覆盖390/768/1440px × 中英文 × 实际浅/深主题，搜索、无结果清除、筛选返回与Tab/Enter/Space通过，无页面异常或横向溢出。另逐25项/49个平台/全部下载选项检查URL和版本匹配；24项图标实际加载，Box4Magisk明确标待授权。结果见 `05-evidence/browser-results.json`。
- 仍需用户解决图标阻塞后补图与相应说明，重跑构建、全套与浏览器检查，执行独立双轴审查、处理发现，再提交与关闭第05票。**尚未进行独立审查，不声称审查通过，不启动第06票。**

## 最终图标授权后的验证（2026-09-16，审查前）

用户再次回复“允许”，授权Box4Magisk文字占位图，已写PRD并新增B4M文字SVG与中英文说明。因此上一节的缺图阻塞已解除。现在20项官方图标、5项明确授权的文字占位图全部通过实际浏览器加载。

- `pnpm build`通过；构建后`pnpm test`为144/144通过；`pnpm lint`退出0（仅既有警告）。
- 重新执行12种宽度/语言/实际主题矩阵及25项、49个平台全部下载选项检查，均通过。最新结果替换在 `05-evidence/browser-results.json`，Box4Magisk也不再跳过图标检查。
- 尚未记录独立双轴审查结论，当前进入审查，不因测试通过提前关闭票。

## 第一轮独立审查与修复

- Standards轴：硬违反0，判断建议0；独立定向测试27/27通过。
- Spec轴：发现1项P2，Box for Root虽在官方v1.10.2安装脚本与box.tool提供Mihomo支持，目录却漏填Mihomo，导致内核筛选漏项。其他已核对范围未发现确认问题；定向测试16/16和lint通过。
- 主会话复读官方同标签 `box/scripts/box.tool:569–575` 确认问题，补充证据至implementation-supplement.json。先加独立六内核期望回归，观察3通过/1失败，再补目录Mihomo；不从生产cores生成预期。接下来执行完整双轴复审。

## 最终验证与双轴复审

- `pnpm build`通过，构建后的 `pnpm test` 为145/145通过，`pnpm lint`退出0（仅既有警告）。
- 完整Standards复审：硬违反0、判断建议0，独立28/28定向测试通过。完整Spec复审：原P2已修复，无新确认缺陷或未解决项，独立32/32定向测试通过，38条自动快照与官方fixture全字段匹配。
- 浏览器补测Android＋Mihomo筛选能够找到Box for Root，Enter进入详情展示六内核。其余12矩阵与49平台结果见browser-results.json。
- 五项占位图均已获明确授权、实际加载，图标阻塞已全部解除；旧91条快照保持不变。完整报告见 `05-review.md`。本记录中的前序“未审查/暂停”均为历史状态，不是当前遗留项。
