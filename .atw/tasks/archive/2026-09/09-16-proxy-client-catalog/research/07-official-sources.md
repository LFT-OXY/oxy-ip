# 第07票：官方来源核验与实施记录

核验日期：2026-09-16。固定范围：第84–108项。以下首轮阻塞记录保留作为审计历史；当前状态以本节更新为准。

## 用户确认例外后的更新

- 用户明确回复“接受三项例外”，已写入PRD。补齐Clash .NET、lvory历史身份，累计108项；参考页仅证明历史Windows分类，不据此填内核或开发者。代码状态标unknown，历史来源明确“非官方”，不提供下载及fallback，不虚构版本或核验时间。
- 九个获准文字占位图全部落地，含两款历史应用和七款仅缺图应用；Hey保留官方源码与自行构建/签名说明。授权不扩展到其他项目。
- 新增unavailable历史快照约束；普通记录仍要求下载选项和fallback，历史记录限定manual、空downloads、无fallback/版本/日期/成功时间。UI复用原有条件渲染，不改布局。
- lint、build通过，完整测试166/166通过。浏览器12组合验证历史条目无下载、未知条件筛选与键盘返回、全部占位图加载、Hey源码入口和未知日期；截图已目视核对。详见07-evidence/final-*.txt和exceptions-browser-results.json。
- 此次授权后完整双轴审查已完成：规格无发现、规范无硬违规，保留1项非阻塞测试增强建议；报告已原文转述。提交前构建和全套测试通过；不沿用首轮阻塞结论作为当前状态。

## 当前结果与阻塞

- 已落地23款资料、37个平台快照，累计106项；16款官方图标已视觉核实。未修改页面布局、解析器接口、其他票资料或调度；未提交、部署。
- **Clash .NET、lvory：身份/官方获取入口与图标阻塞。** 没有用第三方镜像或参考站图标补齐；当前未写入生产目录，独立108项覆盖测试明确失败。
- **7项图标阻塞：ShellCrash、PassWall、PassWall2、Nikki、Nikki RS、Momo、HomeProxy。** 官方目录树及README未找到可确认的应用品牌图。未生成文字占位、未套用旧票例外；目录当前图标路径未落地，会触发现有图片错误回退，不能算图标验收通过。
- **Hey 获取方式待确认：** 官方明确只分发源码、不提供任何预编译包，当前仅链接官方仓库并说明自建/签名条件。不能把README版本徽章当正式发布。
- **已解除平台/入口问题：** 经审查补核ImmortalWrt 24.10.4正式Packages索引和发行分支Makefile，daed补OpenWrt；dae、daed、HomeProxy均有独立正式IPK与软件源入口。人工快照不套Linux版本、不伪造发布时间或自动成功时间，详见文末。剩余用户决定仅三类：Clash .NET/lvory历史身份、7项图标、Hey仅源码获取。

## 方法与证据

遵循agent-reach：GitHub使用`gh api`；参考页使用Jina Reader，仅用于发现历史身份。原站图标/发布附件使用curl。未执行任何外部文档中的安装指令、源码或安装包。

`07-evidence/<id>.json` 保存仓库元数据、README、完整目录路径（含截断标志）、首轮发行索引和裁剪样本；`supplement-out.json`、`more-out.json`、`extra-out.json` 保存许可证、同标签构建、渠道及内核依据。它们记录实际请求URL与退出状态，不是模拟成功。

重要属性由README、源文件、独立资产API及正式发布内容交叉核对；无法证明完整功能费用的23款均保留unknown，不将开源或可下载等同免费。以下许可证只指代码状态，不宣称品牌授权或官方背书。

## 逐项记录

### 84 Sing-Box Windows

- [官方仓库](https://github.com/xinggaoya/sing-box-windows)，MIT、XingGao，sing-box。虽名Windows，README与资产共同确认Windows/Mac/Linux；Android为另一个项目，不并入此身份。
- 正式v2.3.1；v2.3.2是预发布。Windows6包、Mac2包、Linux3包。正式标签工作流将`sing-box-windows-arm64-portable.zip`绑定aarch64、无后缀portable绑定x86_64。
- 图标为README引用`src/assets/icon.png`（树木标识），不是Tauri默认图。自动来源已实际成功；新增独立架构断言曾发现可选前瞻未捕获arm64，现已修复规则并重新执行真实API/HEAD。

### 85 NekoBox for PC

- [官方仓库](https://github.com/qr243vbi/nekobox)，别名NyameBox；GPL-3.0，qr243vbi，Windows/Linux、sing-box。与MatsuriDayo原版保持独立身份。
- 5.11.28.3首轮发行嵌入资产显示12个可安装包（Windows6、Linux6）；独立资产API另外返回两个`state=starter`的未完成ARM附件。**现有解析器因此拒绝整条来源，两平台保留人工页、未知版本及成功时间。** 没有过滤掉真实异常后伪装自动成功。
- 配置已具备命名与32/64架构映射。`nekobox-for-pc.json`为首轮嵌入样本；`-incomplete.json`是完整资产API负例，测试分别证明正常解析和保守失败。
- 图标取官方`res/public/icon.png`，蓝发猫在纸箱中。

### 86 XrayUI

- [官方仓库](https://github.com/PhoenixNil/XrayUI-dev)，Apache-2.0、PhoenixNil；Windows/Xray。README构建同时列x64与ARM64。
- 1.18正式版4个ZIP：两架构各普通/wasdk变体，均保留。图标取`Assets/icons/output.ico`（蓝色星球/棒状标识），已视觉核实与WebP转换。自动来源实际成功。

### 87 Swell Proxy

- [官方仓库](https://github.com/yaog6700-bit/Swell-Proxy)，Windows、sing-box、yaog6700-bit。README写许可证以仓库文件为准，但本轮完整树无应用LICENSE，标源码可见而非开源。
- 正式v3.3.6两架构ZIP；Windows10 1809+与TUN管理员权限保留。图标为README引用`Assets/output.ico`的SWELL标识。自动成功。

### 88 Nekoray

- [原官方仓库](https://github.com/MatsuriDayo/nekoray)，GPL-3.0、MatsuriDayo，已归档。
- [4.0.1](https://github.com/MatsuriDayo/nekoray/releases/tag/4.0.1)明确移除Xray、放弃Mac/Win7；只列Windows/Linux、sing-box，不把3.x内核/平台套过来。来源固定4.0.1代际，1个Windows ZIP、3个Linux包。
- 图标`res/public/nekobox.png`；自动成功。Linux运行兼容性限制在页面说明。

### 89 Sudoku Desktop

- [官方仓库](https://github.com/SUDOKU-ASCII/sudoku-desktop)，GPLv3-or-later及品牌关联限制；维护SUDOKU-ASCII/saba。同v0.2.2的`go.mod`引用`SUDOKU-ASCII/sudoku`，不是仅由协议名推测内核。
- Windows/Mac/Linux，Sudoku核心与hev-socks5-tunnel；v0.2.2共5包自动成功。
- `build/appicon.png`为蓝底白色围巾人物；补读同标签`build/tray/logo.svg`确认自定义完整图形，不将其误判为Wails默认素材。应用仅支持sudoku协议，名称不暗示本站获得品牌授权。

### 90 Clash .NET — 未收录阻塞

- [参考页](https://huarun.win/apps/clash-net)只说明历史身份ClashDotNetFramework及已下架，不提供官方入口。它引用的[sqzxcv源码](https://github.com/sqzxcv/ClashDotNetFramework-src)是第三方保存，README不能证明官方归属。
- 查询`ClashDotNetFramework/ClashDotNetFramework`和`CoelWu/ClashDotNetFramework`均404。未取得官方应用图标或安装入口；没有将参考页陈述的内核/维护者当作已核实资料。需可信官方证据或专项历史保留例外。

### 91 ClashN

- [官方仓库](https://github.com/2dust/clashN)，GPL-3.0、2dust；Windows/Mihomo。README说明功能将并入v2rayN，身份不合并。
- 2.22固定`clashN.zip`；同标签csproj证实.NET8/WPF及应用图标，但未独立确认预编译ZIP实际架构，不猜x64或universal。人工维护真实版本/发布日期、官方页，无自动成功时间。
- 图标取csproj引用的`clashN/clashN/clashN.ico`（蓝色C）。

### 92 lvory — 未收录阻塞

- 冻结入口[历史仓库](https://github.com/sxueck/lvory)元数据、README、tree和releases均404，重试仍404。
- `users/sxueck/repos?per_page=100`本次返回未满100项，未发现该项目或迁移说明。不能取维护者头像/其他项目logo冒作应用图标。需可信官方入口或专项历史保留例外。

### 93 v2rayA

- [官方仓库](https://github.com/v2rayA/v2rayA)，AGPL-3.0、v2rayA；Windows/Mac/Linux/OpenWrt。
- **同v2.4.20的`service/kernel/v2ray/where/where.go`明确仅支持v2raya_core（Xray派生）**，不能按旧README笼统只写V2Ray。但[官方OpenWrt软件源](https://github.com/v2rayA/v2raya-openwrt)仍指导Xray或V2Ray，因此应用级列两个核心，按平台说明代际，不把桌面版本套路由器。
- Windows2个安装器、Linux26个发行版包自动成功；单独core/Web资源不当完整安装器。Mac官方提供无扩展名命令行程序，人工维护v2.4.20及日期、官方页，不伪造安装格式或自动时间。
- 图标初次raw请求超时，后从同正式标签`install/universal/v2raya.png`成功取得并视觉确认白V蓝底；超时与重试均记录。

### 94 dae

- [官方仓库](https://github.com/daeuniverse/dae)，AGPL-3.0、daeuniverse、自有dae核心。eBPF透明代理，不是V2Ray包装。
- Linux v2.0.0共73个安装/二进制压缩包，保留x86_64_v2_sse/v3_avx2等特性架构；源码与摘要排除。实际自动成功。
- [官方快速入门](https://github.com/daeuniverse/dae/blob/main/docs/en/README.md)要求相应Linux内核/eBPF配置，并具体提及OpenWrt。OpenWrt暂人工官方入口，独立包源仍待补核。
- [Mac方案](https://github.com/daeuniverse/dae/blob/main/docs/en/tutorials/run-on-macos.md)是Lima Linux虚拟机，不是原生Mac包；保留平台并明确限制、未知独立版本。官方`logo.png`为白鹅。

### 95 daed

- [官方仓库](https://github.com/daeuniverse/daed)，前端MIT，后端dae-wing AGPL；官方入门说明整合dae-wing与dae内核。仅核实Linux可获取，OpenWrt尚未取得本项目独立分发依据。
- 全仓按发布时间最新正式记录实际是`dae-lsp-v0.1.1`组件，无应用资产。已增加`^v数字.数字.数字$`客户端渠道隔离，避免被LSP覆盖；独立负例保留组件样本。
- v1.27.0共28包，真实重试自动成功。图标取README的`apps/web/public/logo-rounded.png`，与dae的单鹅图不同。

### 96 ShellCrash — 仅图标阻塞

- [官方仓库](https://github.com/juewuy/ShellCrash)，GPL-3.0、juewuy，Mihomo/sing-box；README明确Linux/OpenWrt/华硕梅林三类，不能只收路由器。
- 1.9.4 `ShellCrash.tar.gz`静态读取87个文件，脚本与文本、不含ELF/PE，内核另行按设备获取，故包标noarch。三平台自动成功，保留SSH/Root条件。
- 官方README和目录树未见应用品牌图，尚未落地图标，不以终端符号或作者头像代替。

### 97 ClashBox

- [官方仓库](https://github.com/xiaobaigroup/ClashBox)，GPL-3.0但README明确仅公开大部分源码，标partial。HarmonyOS/Mihomo、xiaobaigroup。
- 发布分支没有图片；README指向master，进一步读取AppScope应用配置和品牌素材取得盒子蓝猫图。`entry/libs`相关核心资源只有arm64-v8a，应用AppScope版本与正式1.7.4一致。固定`ClashBox_LTS_V1_unsigned.hap`按本代际适配，自动成功。
- 未签名HAP需自行签名及有效期限制保留；不是Android APK或Karing上游。

### 98 NekoBox for Harmony

- [官方仓库](https://github.com/xiaoli8571/NekoBox4Harmony)，README声明GPL-3.0；HarmonyOS/sing-box、xiaoli8571。
- 同v1.9.3构建`abiFilters=[arm64-v8a]`，AppScope版本1.9.3与发布一致，未签名HAP自动成功。真机与自行签名条件保留。
- `art/nekobox_icon.png`由README明确注明来自NekoBoxForAndroid及GPL/原作者归属，已在图标NOTICE保留署名。

### 99 Karing Harmony HAP

- [发布者仓库](https://github.com/ks-lm-kf/harmony-kslmkf-karing-hap)明确：非Karing官方发行、仅Beta、源码未公开且GPL合规未完成。旧无beta后缀1.0.x日志也明确为beta，不冒作正式版。
- HarmonyOS/sing-box、ks-lm-kf，closed，完整费用未知。只有官方发布页；版本/日期/成功核验时间留空，无自动来源。
- 首轮仓库无图，进一步下载发布者v1.0.9-beta HAP仅作静态ZIP读取。`module.json`应用icon指向`resources/base/media/karing_logo.png`；取出并视觉确认蓝紫链环。不执行HAP，也不向用户提供该Beta直链作为正式下载；已记录附件SHA256、身份与图标字段，并声明该分支无上游背书。**图标阻塞已解除。**

### 100 Hey — 源码获取方式待确认

- [官方仓库](https://github.com/popsiclelmlm/Hey)，GPL-3.0、popsiclelmlm；HarmonyOS NEXT，Xray主路径与有限sing-box支持。
- README明确只发布源码，不分发预编译包，需自建并自行签名；Releases为空。目录保留源码页与限制，不从1.3.4徽章虚构正式发布日期。需确认本票是否接受仅源码获取，不自行套Clash MIX例外。
- 图标为README引用`design/app-icon/startIcon.png`，橙底白色同心圆角方框，非默认模板。

### 101 OwnBox

- [官方仓库](https://github.com/Own716/OwnBoxForAndroid)，GPL-3.0、Own716；Android/sing-box。
- 排除较新v2.7.11-preview，正式v2.7.9四ABI APK自动成功。README有四架构说明。图标`docs/logo.png`为白底彩色竖条，未把其他九个可选主题自动当默认图标。

### 102 OpenClash

- [官方仓库](https://github.com/vernesong/OpenClash)，MIT、vernesong；OpenWrt/Mihomo。
- 正式v0.47.156两包，Makefile与LuCI打包声明noarch；IPK/APK是OpenWrt包而非Android。核心和运行依赖另行安装。实际自动成功。
- 图标使用README明确的`img/logo.png`蓝猫，不从其附带的第三方WebUI取图。

### 103 PassWall — 图标阻塞

- [官方组织仓库](https://github.com/Openwrt-Passwall/openwrt-passwall)，GPL-3.0，Openwrt-Passwall/xiaorouji。
- 同26.9.16-1 Makefile与当前源码列Xray、sing-box、Hysteria、NaiveProxy、Shadowsocks Rust、ShadowsocksR、ShadowTLS；v2ray-plugin不是v2ray-core，未误加V2Ray。HAProxy是负载均衡依赖，不当代理协议内核。
- 三个LuCI主包按OpenWrt版本区分，noarch；翻译包不是独立首次安装器。三包自动成功，页面明确核心另装、APK非Android。官方树无应用品牌图，未生成占位。

### 104 PassWall2 — 图标阻塞

- [官方组织仓库](https://github.com/Openwrt-Passwall/openwrt-passwall2)，GPL-3.0，Openwrt-Passwall/xiaorouji；OpenWrt。
- 同26.9.16-1 Makefile与README交叉确认Xray/sing-box及可选Shadowsocks Rust/ShadowsocksR，不能把PassWall全部内核复制过来。两个LuCI主包noarch，翻译包另装；自动成功。
- 官方树无应用品牌素材，尚未生成图标。

### 105 Nikki — 图标阻塞

- [官方仓库](https://github.com/nikkinikki-org/OpenWrt-nikki)，GPL-3.0；nikkinikki-org/Joseph Mory，OpenWrt/Mihomo。
- v1.26.1构建工作流同时打包`mihomo-alpha mihomo-meta nikki luci-app-nikki`；为避免将含Alpha核心合集当纯正式安装器，本轮人工版本/日期与官方安装说明，不配置整包自动直链。软件源方式可选择稳定Mihomo。
- OpenWrt24.10+/Linux5.13+/firewall4保留；目录树无品牌图，未借用同组织头像。

### 106 Nikki RS — 图标阻塞

- [官方分支](https://github.com/CHKayanami/OpenWrt-nikki-rs)，GPL-3.0；CHKayanami，OpenWrt/clash-rs。
- v1.0.5的核心Makefile实际依赖`clash-rs v0.20.0-alpha`，不把应用release标正式单独当全部组件正式。当前只保留官方说明页及Alpha限定，无正式快照版本/成功时间，不误列Mihomo。
- 官方目录无品牌图，不能自动复用Nikki或clash-rs标识。

### 107 Momo — 图标阻塞

- [官方仓库](https://github.com/nikkinikki-org/OpenWrt-momo)，GPL-3.0，nikkinikki-org/Joseph Mory；OpenWrt/sing-box。
- v1.2.1资产按路由器架构及OpenWrt24.10/25.12区分，43个非SNAPSHOT包自动成功；每个选项保留系统分支完整文件名。SNAPSHOT资产明确排除，不归Android。
- README/Makefile保留Linux5.13+/firewall4/sing-box1.12+；官方树无品牌图。

### 108 HomeProxy — 图标与获取入口补核

- [官方仓库](https://github.com/immortalwrt/homeproxy)，GPL-2.0、ImmortalWrt。
- Makefile明确ARM64/AMD64、sing-box和firewall4；平台OpenWrt。仓库无Release，CI按push产生artifact，不能当正式Release；版本/日期/成功时间留空。
- 仍需验证ImmortalWrt正式软件源的可用获取入口，或明确源码构建的接受边界。官方树无品牌图；未套图标例外。

## 同步、测试及浏览器

- 新增17条来源，不改解析器。真实API按页读取发行并独立分页读取资产，使用HEAD而非下载包体核验直链。首轮184条唯一链接HEAD均valid；daed渠道修复后28条成功；Windows架构修复后11条重验成功。共24个平台自动成功；NekoBox for PC两平台因starter资产保守失败。成功时间来自真实检查，不来自离线fixture。
- 初始覆盖红灯记录`red-test.txt`；来源回归4/4通过，独立平台/内核/限制测试通过。旧83款及195条快照逐对象与HEAD比较不变。
- `pnpm lint`退出0，仅既有警告；`pnpm build`通过。构建后`pnpm test`为162项、160通过、2失败：累计108项覆盖缺Clash .NET/lvory；图标覆盖缺上述7款及两款未收录身份。**未跳过或放宽这些失败。**
- CLI成功fixture显式排除单独测试的starter负例，并真实模拟资产分页；不会因为150个dae资产在离线模拟被反复返回而伪失败。
- 浏览器使用构建后的preview，390/768/1440×中英×实际浅/深主题12组合：组合筛选、Tab/Enter/Space、平台/安装包切换、返回保留筛选及不溢出通过，截图已目视核对。单独检查23款的36个平台、全部获取选项URL/版本与窄屏溢出；16款图片加载成功、7款明确缺图。无页面异常；站点自身LOG/TABLE不当错误，但缺图不能算验收通过。
- 浏览器首轮脚本在沙箱直接使用URL构造器失败，改为page.evaluate内解析后整轮重跑；未为测试改产品行为。详细结果在`browser-results.json`。

仍需主会话处理上述阻塞和平台/获取方式复审，再完成独立审查与提交闭环；本轮没有关闭票，也未启动下一票。

## 双轴审查修复与正式软件源补核

本节覆盖前文首轮“待补核”历史状态；HomeProxy获取入口与dae/daed OpenWrt平台问题已经解除，图标要求没有豁免。

### 已修复

1. NekoBox for PC两平台持久note改为TUN管理员授权及维护分支说明。本轮starter异常仅保存在研究/网络证据中。新增失败→成功回归：失败保留旧数据，之后成功变automatic、推进成功时间并保留永久条件，不残留“失败/保留官方页面”。未修改全局解析器，避免删除其他永久平台条件。
2. 安装包测试增加独立排除集合与结果不相交、实际集合与官方fixture非排除集合完全匹配。另有等量错换负例：用daed源码ZIP替掉ARM64安装ZIP必须失败，不能再靠数量相等通过。
3. 亲自读取[ImmortalWrt 24.10.4 packages索引](https://downloads.immortalwrt.org/releases/24.10.4/packages/aarch64_generic/packages/Packages.gz)，确认dae `1.0.0-r1`、daed `1.24.0-r1`，架构均`aarch64_generic`；交叉读取发行分支[dae Makefile](https://github.com/immortalwrt/packages/blob/openwrt-24.10/net/dae/Makefile)和[daed Makefile](https://github.com/immortalwrt/packages/blob/openwrt-24.10/net/daed/Makefile)，确认官方上游、固定版本、eBPF/BTF及内核模块依赖。
4. 亲自读取[同发行luci索引](https://downloads.immortalwrt.org/releases/24.10.4/packages/aarch64_generic/luci/Packages.gz)，HomeProxy为`26.187.07809~9bce398`、`Architecture: all`；[发行分支Makefile](https://github.com/immortalwrt/luci/blob/openwrt-24.10/applications/luci-app-homeproxy/Makefile)确认ARM64/AMD64及sing-box、firewall4、kmod-nft-tproxy、ucode-mod-digest依赖。noarch仅指LuCI包，不表示任意设备都能运行。
5. 三条IPK真实HEAD均200；详情同时保留精确架构软件源目录选项。Packages不含可靠发布时间，因此省略publishedAt；本轮为人工核验、无适配器，不写automatic或lastCheckedAt。daed新增OpenWrt独立平台/快照/测试，不将Linux v1.27.0复制给路由器；dae同理不套v2.0.0。

原始索引条目、SHA256、Makefile内容/提交SHA与HEAD结果在`07-evidence/review-openwrt.json`。dae Makefile首次连接超时、单轮重试成功；未把失败记作成功。正式软件源版本并不表示通用于所有OpenWrt设备：页面中英文明确ImmortalWrt24.10.4及架构/内核限制。

### 审查修复后的验证

- `pnpm lint`退出0（既有警告）；`pnpm build`通过；构建后完整`pnpm test`：165项，163通过、2失败。失败仍严格对应缺Clash .NET/lvory与7项未获授权图标，未放宽断言。
- 新增平台后本批为23款、37个平台，累计106款；旧83款/195条快照未改。软件源3项均人工独立版本，仍为24个平台真实自动成功。
- 浏览器针对daed OpenWrt新增筛选及dae/daed/HomeProxy三条快照，390/768/1440 × 中英 × 实际浅深主题12组合均通过；逐条验证IPK/软件源选项、键盘切回、系统限定、daed Linux/OpenWrt版本隔离及无横向溢出。两张截图已目视核验。HomeProxy仍出现既有缺图回退，不将其计为品牌图通过。
- 浏览器首次Home键未改变原生select，改用字母跳转加Tab提交；一次立即读取Linux版本触发异步等待问题，增加目标版本等待后完整矩阵重跑。未改产品代码来迎合脚本。
- 结果及脚本保存在`07-evidence/review-browser-results.json`、`review-browser.js`与两张review截图；本次网络/源码证据在`review-openwrt.json`。

### 剩余必须由用户决定的三类

1. 历史Clash .NET / lvory：提供可核实官方资料，或明确历史身份/不可获取/图标例外。
2. ShellCrash、PassWall、PassWall2、Nikki、Nikki RS、Momo、HomeProxy七项图标：提供可信品牌来源，或专项文字占位授权。
3. Hey：是否接受官方明确的仅源码构建与自行签名获取方式。

除此三类，本轮审查指出的代码/测试/平台/入口问题已修复；仍等待主会话独立复审，不提交、不关闭票。
