# 第09票：最后21项官方来源与验证

核验日期：2026-09-17 UTC。冻结序号134–154，目录累计154项；本批39个平台快照。未开始第10票、未部署、未归档。

## 方法与数据边界

按 agent-reach 路由使用 `gh api` 获取官方仓库、完整目录树、README、许可证正文和发布；网页先 Jina Reader，发现缓存缺内容时读取官方原始 HTML。Exa 仅发现 VPNET Android 与 Magic Catling2 频道，结论再次读取官方页面原文。Apple lookup 与商店兼容页交叉核对身份；两者属于同一官方发布体系，不冒称两个独立维护者。无法交叉确认的属性保留未知，不以协议名推定内核。

5条GitHub来源及11条Apple来源使用原同步器、真实 gh/curl 传输更新成功，51次请求的结果在 `/tmp/catalog-b6/sync-results.json`。人工直链19个逐个HEAD均200，结果在 `/tmp/catalog-b6/manual-head.json`。人工页、Google Play、静态官网和软件源没有写入 `lastCheckedAt`；缺可靠发布时间时不使用HTTP Last-Modified或抓取时间替代。成功快照的时间由同步器实际生成，不取测试 `now`。

原始抓取、执行脚本及截图存于 `/tmp/catalog-b6/`，不提交临时工具输出。仓库保留裁剪真实fixture于 `tests/fixtures/client-releases/batch-6/`；其GitHub数组保留最近5个发布及全部附件，覆盖测试渠道与应用/内核混排；Apple保留身份及发布必需字段。

本票没有新增图标占位例外。21款图标来自官方应用资源、官网或同身份商店 artwork，逐项查看拼图；DeckyClash SVG与AeroBox Android矢量单独渲染查看。NOTICE逐项记录URL；AeroBox保持白底、蓝色飞机、原pathData和位移/缩放/旋转，不以文字占位。Merlin XrayUI保留CC BY-NC-SA署名和转换说明；BSD及MIT素材保留相应许可证正文。

费用字段不会把商店Free或开源等同于全部免费：仅Clash Plus与Wisp有明确全部功能免费说明，其余不确定项标待核实。商店Seller作为主导开发；Magic Catling2无独立实名依据，开发者留空。无公开应用代码依据的商店项目标未公开，不等于底层依赖闭源。

## GitHub与官网条目

### 136 FlClash Patched

[官方仓库](https://github.com/chenx-dust/FlClash-Patched)、[正式发布v0.8.123](https://github.com/chenx-dust/FlClash-Patched/releases/tag/v0.8.123)及GPL-3.0正文确认五平台/Mihomo/chenx-dust。README虽说iOS需要开发者账号构建，正式发布已有`ios-arm64-unsigned.ipa`，不能漏掉也不能把未签名等同Beta；说明自行签名与Apple开发者权限。Android3包、iOS1包、Windows4包、Mac2包、Linux10包，全部按官方文件名匹配；Linux包包含Pacman tar.zst。图标取`assets/images/icon.png`。

### 146 ToMoon

[仓库](https://github.com/YukiCoco/ToMoon)、[v0.2.8构建](https://github.com/YukiCoco/ToMoon/blob/v0.2.8/.github/workflows/build.yml)、[发布](https://github.com/YukiCoco/ToMoon/releases/tag/v0.2.8)。BSD-3-Clause，Steam Deck/Decky；同标签工作流下载Mihomo linux-amd64、编译x86_64 Rust后端。但合集还下载`subconverter/releases/download/Alpha/subconverter_linux64.tar.gz`，因此只保留官方发布页及长期说明，不将合集标为纯正式包，版本/发布时间/成功时间留空，不接自动来源。不是不可获取例外，官方发布页可用；遵循已有Alpha合集处理约定。图标是仓库`assets/logo.png`。

### 147 DeckyClash

[仓库](https://github.com/chenx-dust/DeckyClash)、[v1.3.4构建](https://github.com/chenx-dust/DeckyClash/blob/v1.3.4/.github/workflows/build.yaml)、[同标签安装脚本](https://github.com/chenx-dust/DeckyClash/blob/v1.3.4/install.sh)。BSD-3-Clause，Chenx Dust；Mihomo amd64，SteamOS/Decky。正式v1.3.4排除更新的Nightly，提供普通ZIP、full ZIP和离线SH，排除version.txt。普通ZIP需另拉依赖，说明保留。官方`assets/logo.svg`是带猫与DeckyClash字样的Steam Deck轮廓，浅色白底等比栅格化，不冒作方形图标重绘。

### 148 FancySS

[README](https://github.com/hq450/fancyss)、[固定提交版本文件](https://github.com/hq450/fancyss/blob/b19e82cb6a05e08990a96905353921819d44d134/packages/version.json.js)、[同提交构建](https://github.com/hq450/fancyss/blob/b19e82cb6a05e08990a96905353921819d44d134/build.sh)。GPL-3.0，hq450；仅带软件中心的华硕官改/梅林，不泛化为OpenWrt。正式3.5.30的7平台×full/lite共14包固定raw提交直链；arm/hnd/qca/ipq32按机型表armv7，hnd_v8/mtk/ipq64为armv8，不按SoC硬件64位忽略32位固件。排除debug包。内核依README与构建包括Xray、V2Ray、Shadowsocks、ShadowsocksR、NaiveProxy、TUIC、Hysteria2；构建额外明确anytls-zig的ARM目标拷贝与lite裁剪，补AnyTLS Zig。`version.json.js`同提交再次读取确认3.5.30；版本日期未知，人工维护。红色纸飞机为本项目软件中心`fancyss/res/icon-shadowsocks.png`，不是任意依赖图片。

### 149 Merlin XrayUI

[仓库](https://github.com/DanielLavrushin/asuswrt-merlin-xrayui)、[v0.69.1构建](https://github.com/DanielLavrushin/asuswrt-merlin-xrayui/blob/v0.69.1/.github/workflows/build-n-release.yml)、LICENSE确认Xray/ASUSWRT-Merlin/Entware。CC BY-NC-SA 4.0有限制，不标开源而是源码可见。发布的`asuswrt-merlin-xrayui.tar.gz`是JS/脚本dist，noarch；`xrayui-datbuilder.tar.gz`是独立组件，排除。内核运行架构另按设备安装。图标取官方文档`images/logo.png`，带ASUSXRAY文字和路由器。

### 150 FullCombo Shark

[仓库](https://github.com/fcshark-org/openwrt-fchomo)、[Makefile](https://github.com/fcshark-org/openwrt-fchomo/blob/master/luci-app-fchomo/Makefile)、[README链接的软件源](https://fantastic-packages.github.io/releases/)、[25.12 x86_64 LuCI索引](https://fantastic-packages.github.io/releases/25.12/packages/x86_64/luci/index.json)确认GPL-2.0、Anya Lin、Mihomo、OpenWrt及`LUCI_PKGARCH:=all`。人工提供该软件源`luci-app-fchomo-26.259.56423~80383b9.apk`，架构noarch，明确25.12与设备依赖；不把apk后缀归入Android，不将i18n包当应用。发布日期未知；本轮索引无GitHub发布API，不新增抓取器。官方鲨鱼图来自`assets/img/shark.png`。

### 151 NekoBox for OpenWrt

[仓库](https://github.com/Thaolga/openwrt-nekobox)、[2.0.8 Makefile](https://github.com/Thaolga/openwrt-nekobox/blob/2.0.8/luci-app-nekobox/Makefile)、[正式2.0.8](https://github.com/Thaolga/openwrt-nekobox/releases/tag/2.0.8)。根MIT、Makefile另标GPLv3，均开源但不宣称全树统一MIT；Thaolga，Mihomo+sing-box。`PKGARCH:=all`且编译阶段为空，脚本/PHP包noarch，运行内核另装。2.0.9虽然prerelease=false，附件是`2.0.9-rc14`，不混入；来源暂锁已核实2.0.8-cn正式包，不把RC兜底为正式。图标是README引用`assets/img/nekobox.png`。

### 152 Neko for OpenWrt

[仓库](https://github.com/nosignals/openwrt-neko)、[应用发布页](https://github.com/nosignals/openwrt-neko/releases)、Makefile/README确认GPL-3.0、nosignals、Mihomo+sing-box。应用标签带Beta，普通正式标签mihomo属于独立核心；不能从同仓挑核心版本当Neko应用版本。仅保留官方发布页，正式版/日期/成功时间未知，说明Beta，不提供测试包直链。图标取应用`luci-app-neko/htdocs/nekoclash/assets/img/neko.png`，不是内置MetaCubex面板图标。

### 153 Magic Catling2

[官方文档](https://mcreadme.gitbook.io/mc)、[更换内核](https://mcreadme.gitbook.io/mc/function/updatecore)、[官方发布帖827](https://t.me/merlinclashcat/827)相互印证：Mihomo、KoolCenter官改/梅改386及以上，ARM32/64。Exa仅用于发现频道；直接读取Telegram嵌入HTML核实v1.2.2、官方Wiki回链以及实际文件帖588/590。旧链接479/480仍附在消息中且对应2023旧包，不能把它们当v1.2.2安装包。采用发布帖为人工获取入口，让用户在Telegram选择附件，不提供臆造CDN直链。帖初始时间与后续版本编辑关系不明，发布日期留空；不复制参考站版本日期。官网巫师猫图标来自GitBook站点icon，已查看。官方开发者实名、应用公开源码和完整费用未核实，分别留空/未公开/待核实。

### 154 AeroBox for Android

[仓库](https://github.com/imengying/AeroBoxForAndroid)、[v1.2.1](https://github.com/imengying/AeroBoxForAndroid/releases/tag/v1.2.1)、LICENSE确认GPL-3.0-or-later、AeroBox contributors、sing-box/libbox、Android12+。4份APK分别arm64-v8a/armeabi-v7a/x86/x86_64；版本、日期、全部包同一正式发布。官方图标不是PNG，而是`mipmap-anydpi/ic_launcher.xml`引用的背景/前景vector，保持原图形变换栅格化，非自行设计占位。

## Apple商店条目

下列均读取对应美国区lookup与商店Compatibility、Seller及介绍。iOS成功更新不覆盖Mac；独立Mac版本未知者保持人工页。Clash Plus桌面另有官网1.2.7正式包，不使用iOS1.4.1；OneBoxM不并入前批OneBox桌面身份。

### 134 Clash Plus

[商店](https://apps.apple.com/us/app/clash-plus-smart-proxy-tool/id6774378761) · [lookup](https://itunes.apple.com/lookup?id=6774378761&country=us&entity=software)。`com.fluxflux.fluxflux`；Seller `Vextralis LLC`；本轮iOS `1.4.1`，当前版本发布时间 `2026-09-14T17:52:29Z`。图标来自同身份artworkUrl512。

Apple明确Mihomo；[官网](https://clashplus.io/)明确全部免费无内购。Jina缓存仅移动端，原始HTML另有Windows x64 EXE、Mac arm64/x64 DMG和Android arm64-v8a APK，四个文件HEAD200；人工1.2.7，日期未知。官网称Android/鸿蒙同APK，明确仅支持APK的鸿蒙环境，非NEXT HAP。

### 135 PanVell

[商店](https://apps.apple.com/us/app/panvell/id6780153714) · [lookup](https://itunes.apple.com/lookup?id=6780153714&country=us&entity=software)。`com.pandavs.clash`；Seller `REIFENG SHARE LIMITED`；本轮iOS `1.2.1`，当前版本发布时间 `2026-09-15T21:09:43Z`。图标来自同身份artworkUrl512。

介绍明确ClashMeta，即Mihomo；Compatibility列Apple Silicon Mac，独立版本未知。完整功能费用未知。

### 137 OneBoxM

[商店](https://apps.apple.com/us/app/oneboxm/id6759716475) · [lookup](https://itunes.apple.com/lookup?id=6759716475&country=us&entity=software)。`cloud.oneoh.networktools`；Seller `OneOh Cloud LLC`；本轮iOS `1.0.16`，当前版本发布时间 `2026-08-01T05:23:20Z`。图标来自同身份artworkUrl512。

描述明确sing-box；仅iPhone/iPad、不含Mac。[官网](https://www.sing-box.net/)把OneBoxM作为独立移动应用，并直链[Google Play](https://play.google.com/store/apps/details?id=cloud.oneoh.networktools)，Play页面回链官网，补Android；Android不复制iOS版本。

### 138 XRay Connect

[商店](https://apps.apple.com/us/app/xray-connect/id6746749546) · [lookup](https://itunes.apple.com/lookup?id=6746749546&country=us&entity=software)。`com.xrayConnect.xrayInstance`；Seller `SYSTEM ART DESIGN LLC`；本轮iOS `1.6`，当前版本发布时间 `2026-07-04T09:02:08Z`。图标来自同身份artworkUrl512。

当前简介仅列协议，但官方商店Version History的1.5明确“update Xray Core”、1.1明确“update xray core”，可确认Xray实现，内核填Xray；Apple Silicon Mac兼容，不套iOS版本。首轮仅看当前简介而遗漏版本历史的错误已经独立审查指出并修复。

### 139 Изи VPN

[商店](https://apps.apple.com/us/app/%D0%B8%D0%B7%D0%B8-vpn/id6746414734) · [lookup](https://itunes.apple.com/lookup?id=6746414734&country=us&entity=software)。`yvn.easydev.access`；Seller `Easy Dev`；本轮iOS `4.2.1`，当前版本发布时间 `2026-08-14T17:32:02Z`。图标来自同身份artworkUrl512。

介绍明确Xray-core/Project-X/MPL-2.0，仅证明依赖，不等于应用开源。Apple Silicon Mac兼容。

### 140 VPNET

[商店](https://apps.apple.com/us/app/vpnet-fast-proxy-client/id6756558545) · [lookup](https://itunes.apple.com/lookup?id=6756558545&country=us&entity=software)。`com.gmm.proxyclient`；Seller `GREEN MEADOW MEDIA SIA`；本轮iOS `1.425`，当前版本发布时间 `2026-07-24T13:47:11Z`。图标来自同身份artworkUrl512。

[官网](https://vpnet-client.com/)明确Xray与iOS/Android；[Play](https://play.google.com/store/apps/details?id=com.gmm.vpnet.client)隐私/支持回链同域，Google发行者与Apple身份互证。不要混同官网另一VPN服务产品。另有Apple Silicon Mac兼容。

### 141 susi connect

[商店](https://apps.apple.com/us/app/susi-connect/id6759531907) · [lookup](https://itunes.apple.com/lookup?id=6759531907&country=us&entity=software)。`com.susinetwork.connect`；Seller `Artem Sharifullin PR Beograd`；本轮iOS `1.11.0`，当前版本发布时间 `2026-09-11T06:58:28Z`。图标来自同身份artworkUrl512。

描述明确Built with Xray core；Compatibility含Mac macOS12+，没有强加Apple Silicon限制，独立版本未知。隐私子路径可访问，但猜测的/connect首页404，不当应用入口。

### 142 BClient

[商店](https://apps.apple.com/us/app/bclient/id6760386281) · [lookup](https://itunes.apple.com/lookup?id=6760386281&country=us&entity=software)。`com.bhub.client`；Seller `VAN CRIS DEEN SRL`；本轮iOS `2.0.4`，当前版本发布时间 `2026-09-01T22:54:35Z`。图标来自同身份artworkUrl512。

官方介绍两处明确v2ray/xray core，保留两个内核；Apple Silicon Mac兼容。

### 143 Wisp

[商店](https://apps.apple.com/us/app/wisp-vpn-vless-xray-reality/id6767654269) · [lookup](https://itunes.apple.com/lookup?id=6767654269&country=us&entity=software)。`mtrx.top.app`；Seller `DIGITAL BENEFIT SERVICES d.o.o.`；本轮iOS `4.0.38`，当前版本发布时间 `2026-09-16T04:58:11Z`。图标来自同身份artworkUrl512。

[官网](https://getwisp.top/)明确xray-core及全部免费、无付费解锁；Apple支持iPhone/iPad/Mac。官网与商店广告/隐私声明有差异，资料不抄零追踪保证。

### 144 XRayClient

[商店](https://apps.apple.com/us/app/xrayclient/id6738344532) · [lookup](https://itunes.apple.com/lookup?id=6738344532&country=us&entity=software)。`com.llp.app.making.MangoXray`；Seller `MAKING-APP, TOO`；本轮iOS `1.0`，当前版本发布时间 `2025-01-27T08:00:00Z`。图标来自同身份artworkUrl512。

Compatibility仅iPhone/iPad，不含Mac。XRay服务器/协议名称不足以证明实现内核，留空。

### 145 Pixel-Proxy

[商店](https://apps.apple.com/us/app/pixel-proxy/id6754511751) · [lookup](https://itunes.apple.com/lookup?id=6754511751&country=us&entity=software)。`com.khrabryi.pixel.proxy`；Seller `MAKSIM KHRABRYI, IE`；本轮iOS `2.6.4`，当前版本发布时间 `2026-09-01T01:14:17Z`。图标来自同身份artworkUrl512。

同一条目标题Pixel-Proxy，介绍Pixel Proxy，保留别名。支持Mac但独立版本未核实；X-ray protocol family不是足够实现依据，内核空数组；不混入同开发者Casper VPN。

## 实施验证（初次待审）

- 新增独立名单测试先红：4项失败；完成资料/图标后通过。新增来源测试按独立官方资产冻结完整文件名/架构，同时覆盖跨平台等量错换、组件错换、RC/Beta/Nightly、版本URL、Apple身份、Mac隔离与失败保留。
- 构建后完整`pnpm test`：184/184通过。`pnpm build`和`pnpm lint`退出0，lint保留既有警告；动态真实英文`t()`回归通过。初轮动态翻译发现“官方软件源”缺键，已补并重测。
- HEAD原有133个应用与281个平台快照逐对象保持不变；仅追加21项和39条快照。前批测试仅冻结旧批子集，未从生产反向生成期望。
- 浏览器使用构建产物4179端口：390/768/1440 × 中英 × 实际浅深主题共12组合；Clash Plus搜索+Windows/Mihomo/未公开/免费组合筛选，Enter进入、键盘选择Mac、Tab提交、Enter返回保留全部筛选。实际DOM确认Mac1.2.7及arm64下载链接，无横向溢出、无pageerror；另用Space选择Steam Deck分类。已查看移动英文深色、桌面中文浅色截图。
- 逐项打开21款详情、39个平台，检查每个获取选项的DOM URL、版本、图片加载及窄屏溢出，全部通过。该浏览器遍历仅证明渲染和模型一致，不冒充来源独立验证；独立官方期望在Node测试中。
- 首次浏览器脚本复制旧案例时残留Jamjams期望URL，检查报错；核对实际DOM为正确Clash Plus链接后修正测试脚本，12组合重跑通过，没有为迎合检查修改生产页面。
- 临时日志：`/tmp/catalog-b6/{build,test,lint,focused,browser-results,browser-all-results,space}.txt`；截图`mobile-dark-en.png`、`desktop-light-zh.png`、`list-390.png`。

等待规格/规范双轴独立审查；测试通过不代表本票已经完成。

## 首轮独立审查与修复

- 规格轴：确认1项P2。XRay Connect官方商店版本历史两处明确更新Xray Core，原先空内核导致Xray组合筛选漏项。已将生产资料、独立期望与本研究改为Xray，并增加名称+内核+iOS/Mac两平台的明确回归。先改测试确认2项失败，再补生产资料转绿。
- 规范轴：无硬违规。非阻断建议为新来源测试与第五批的通用变异流程存在重复；本票保留独立期望及现有流程，不为建议扩大重构。
- 父会话已经将两个原始报告原文转交用户；此处仅记录处置摘要，不将摘要冒作独立报告原文。
- 规范回写：官方版本历史也是内核实现的证据，不能因当前简介未写内核就保留未知；见目录契约第15节。

修复后完整验证：`pnpm build`通过，其后`pnpm test`185/185通过；`pnpm lint`退出0、保留既有警告。定向先红4通过/2失败，修复后6/6通过。浏览器追加验证XRay Connect的名称+Xray+iOS/Mac筛选各得唯一应用，进入详情显示Xray。日志`/tmp/catalog-b6/review-fix-{red,green}.txt`及`round2-{build,test,lint,browser}.txt`。等待第二轮完整双轴复审，尚未提交。

## 第二轮完整双轴复审报告

父会话并行派发独立只读审查，并已将两轴原文转述用户。共同输入为`/tmp/catalog-b6/review-round2.patch`，226871字节，SHA256 `1eeb175ce30420a2371f7a6028036b07d4c519cdf05ec945ff63e5f86fbd8164`，固定基点`49d158df207ff9074eff1981a6a99741da8c11ae`。以下保留父会话交回的完整报告内容与边界。

### 规格轴

补丁SHA/大小匹配，覆盖全部21项及回归；原P2已真正修复，catalog cores=[Xray]与page.txt:65,77一致，tests:31,224–239独立期望及两平台组合回归正确，审查员另行调用真实filterApps验证两组合仅返回xray-connect；研究与规范同步。全范围21身份39快照一致，新增fixture逐份比对原抓取、正式测试资产/架构/来源/入口/时间/中英文未发现新增确认问题，无缺失无越界；审查员独立本批10测通过，全程只读无git。

### 规范轴

无硬违规，复用解析器、版本架构渠道、维护边界和独立Mac、修正Xray与版本历史依据、独立名单附件架构版本隔离失败保留、NOTICE均符合client-catalog规范；无新增建议，首轮tests/client-batch-6-sources.test.mjs:98–145 Duplicated Code非阻断仍保留，接受避免扩大重构，期望不可生产派生；审查边界为读本地官方档案未重新联网，未重跑测试，WebP补丁仅路径不独立背书图像；第10票非范围。

### 最终验证与处置

修复后的最终构建退出0；其后完整测试185项全部通过，0失败、0跳过，日志`/tmp/catalog-b6/round2-test.txt`。lint退出0（既有警告），全部改动的可格式化文件Prettier检查通过，`git diff --check`通过。此前21图标人工视觉核验和12组合浏览器验证由实施者完成，不将其归功于未检查图片的规范审查员。两轴均通过，非阻断重复流程建议保留；不再修改业务实现。父会话授权提交本票实现、研究和必要规范，票据关闭及状态提交留给父会话；不开始第10票、不部署、不归档。
