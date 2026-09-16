# 第 04 票：官方来源核验

核验日期：2026-09-16。范围严格为冻结基线第 9–33 项，25 个应用；不是参考站当前排序。原有 8 项资料没有重采样覆盖。

## 方法与实际执行

- 遵循 `agent-reach`：GitHub 通过 `gh api repos/<repo>`、`/readme`、`/releases?per_page=100&page=1`、`/releases/<id>/assets`、`/git/trees/<branch>?recursive=1`；官网通过 Jina Reader，商店通过 Apple lookup JSON 与 App Store 页面交叉核对。
- 原始工作副本保存于 `/tmp/catalog04/`，不是仓库依赖。可复核的最小真实 API 响应裁剪在 `tests/fixtures/client-releases/batch-1/`；仅删无关字段，没有改写 ID、版本、日期、包名或 URL。读取时间不是发布时间。
- 实际运行 `/tmp/catalog04/live-sync.mjs`，调用仓库 `githubClient` / `officialClient` / `syncReleases` / `parseOfficialRelease`。传输适配只使用真实 `gh api` 和 `curl`，HEAD 不取安装包体，不向资源 URL 发送 token。为避免 Node 网络栈与本机代理差异，未伪造 fetch 成功响应；HTTP 状态来自真实外网响应。
- 第一轮 47 个平台成功，余下遇到 GitHub TCP 超时、Apple TLS 错误及 HEAD 临时失败；第二轮 52 个、第三轮 53 个成功。最后执行 `/tmp/catalog04/reliable-retry.mjs`，仅重试仍未成功的平台，采用真实请求重试；最后 3 项全部成功。合计本批 **56 个自动平台快照**，16 个 GitHub 应用来源、10 个独立 iOS 商店来源。曾失败的平台不推进版本或成功时间，重试成功后才写 automatic。
- 成功时间为 12:26:57.367Z、12:29:21.008Z、12:31:59.294Z、12:32:59.390Z（UTC），逐行以 `releases.json` 为准。首票快照保持原值。商店 `currentVersionReleaseDate` 才是发布日期。
- App Store lookup 只同步 iOS；即使商店兼容 Mac 或同一产品另有 Mac 版，也不将 iOS 版本、日期套给 Mac。GitHub 可核验的独立 Mac 包不受此限制。

## 逐项核验结果

每项的代码状态、简介、开发者和内核依据来自以下官网、README、源码依赖或官方商店，不以第三方参考目录证明归属。没有证据的闭源内核留空；支持某协议不等于使用同名内核。

### 9. Surge (`surge`)

官网 nssurge.com 明确 Mac/iOS；商店为 Surge Networks Inc.。完整功能为 iOS 内购、Mac 独立许可/试用。Mac 不使用 Stash 专用解析器，保留官网入口、未知版本与具体人工原因。

- 官方依据：https://apps.apple.com/app/surge-5/id1442620678
- 官方依据：https://apps.apple.com/us/app/surge-5/id1442620678?uo=4
- 官方依据：https://nssurge.com/
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/49/ab/3f/49ab3f82-3504-abd3-6e61-92b927d70e65/AppIconS-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 5.22.1 / automatic；macos 未知版本 / manual。

### 10. Quantumult X (`quantumult-x`)

Apple 页面明确 iPhone/iPad/Mac；Cross Utility Ltd，US$9.99。README/商店没有可信内核实现证据，不填“自研”。Mac 版本未独立核验。

- 官方依据：https://apps.apple.com/app/quantumult-x/id1443988620
- 官方依据：https://apps.apple.com/us/app/quantumult-x/id1443988620?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/12/42/f2/1242f2b1-d7a6-8b20-8947-7e081f78d7ae/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 1.8.0 / automatic；macos 未知版本 / manual。

### 11. Loon (`loon`)

Apple 页面兼容性列出 Apple Silicon Mac；Loon Lab Limited，US$7.99。Mac 保留商店入口，不套 iOS 3.5.0。

- 官方依据：https://apps.apple.com/app/loon/id1373567447
- 官方依据：https://apps.apple.com/us/app/loon/id1373567447?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fe/c4/5f/fec45fa1-1194-c944-7c5c-a939e1ee0dfe/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 3.5.0 / automatic；macos 未知版本 / manual。

### 12. Clash by Hako (`clash-by-hako`)

clash.md 实际 HTML 链接 id6794257189、TokenPLS/Hako 与 TokenPLS/Hako-Client，明确两者源码开放及 iPhone/iPad/Mac/TV。内核为 Hako（基于 Mihomo）；商店 OmniWide Media Limited，免费下载。Mac 来源独立版本未核验。TV 不在本任务既定平台枚举中。

- 官方依据：https://clash.md/
- 官方依据：https://apps.apple.com/us/app/clash-rule-based-proxy-utility/id6794257189?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/7e/1a/a3/7e1aa38d-aa96-fbb9-b21a-55196c6c494a/AppIcon-0-0-1x_U007epad-0-0-0-1-0-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 1.0.7 / automatic；macos 未知版本 / manual。

### 13. Karing (`karing`)

README 明确 Android/iOS/Windows/macOS/Linux；定制 sing-box、KaringX。README 的 iOS 商店链接与 lookup 同一身份。GitHub 包名明确平台/架构，Mac universal。

- 官方依据：https://github.com/KaringX/karing
- 官方依据：https://apps.apple.com/us/app/karing/id6472431552?uo=4
- README：https://github.com/KaringX/karing/blob/main/README.md
- 发布：https://github.com/KaringX/karing/releases
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/82/b3/92/82b392c6-2489-83b8-4ed9-2facbaf8e546/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：android v1.2.25.2802 / automatic；ios 1.2.25.2802 / automatic；windows v1.2.25.2802 / automatic；macos v1.2.25.2802 / automatic；linux v1.2.25.2802 / automatic。

### 14. Pharos Pro (`pharos-pro`)

Apple listing/lookup 分别呈现品牌 Pharos Limited Co.,Ltd 与法定 seller Kuaizhu Technology Limited Co., Ltd，目录采用 lookup seller；US$2.99。Apple 兼容性列出 M1 Mac，但未验证独立 Mac 版本。支持 Xray 协议/配置不是证明内核实现，内核留空。

- 官方依据：https://apps.apple.com/app/pharos-pro/id1456610173
- 官方依据：https://apps.apple.com/us/app/pharos-pro/id1456610173?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8f/27/27/8f272712-3513-347c-44e9-5c6f7f2bb097/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 1.8.7 / automatic；macos 未知版本 / manual。

### 15. Hiddify (`hiddify`)

README 和发布正文明确四个桌面/Android 目标及 Apple 商店；sing-box GUI、Hiddify。Mac DMG/PKG 的 universal 架构来自发布正文，不由文件名猜测；通过可选逐平台 architectures 映射表达。iOS 4.0 与 GitHub v4.1.1 分开。

- 官方依据：https://github.com/hiddify/hiddify-app
- 官方依据：https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532?uo=4
- README：https://github.com/hiddify/hiddify-app/blob/main/README.md
- 发布：https://github.com/hiddify/hiddify-app/releases
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/70/5e/2f/705e2fce-cacd-28c0-05bb-946667dbc03a/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：android v4.1.1 / automatic；ios 4.0 / automatic；windows v4.1.1 / automatic；macos v4.1.1 / automatic；linux v4.1.1 / automatic。

### 16. Egern (`egern`)

egernapp.com 链接 id1616105820；Apple 页面列 Apple Silicon Mac，seller BYTE CROSSING LTD。免费下载不等于完整功能免费：Unlock Pro US$5.99，因此 price=paid。内核无官方依据，留空。

- 官方依据：https://egernapp.com/
- 官方依据：https://apps.apple.com/us/app/egern/id1616105820?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c3/8c/38/c38c38c1-54ad-175a-7f73-6284de3c5841/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 2.20.0 / automatic；macos 未知版本 / manual。

### 17. ClashFest (`clashfest`)

README 明确 Android 手机/TV、Mihomo、Nemu-x 和 GPL。v1.1.0 元数据 prerelease=false，但全部资产含 alpha；README 也称 alpha flavor。依本项目正式渠道保守约定，不将这些包作为正式版。应用与官方 Release 页保留，版本/发布时间/成功时间未知；不配置会永远失败的正式资产匹配。

- 官方依据：https://github.com/Nemu-x/ClashFest
- README：https://github.com/Nemu-x/ClashFest/blob/feat/init-clashfest/README.md
- 发布：https://github.com/Nemu-x/ClashFest/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/Nemu-x/ClashFest/feat/init-clashfest/design/ClashFest_notxt.png（本地缩放为256px以内 WebP）
- 本次平台快照：android 未知版本 / manual。

### 18. Exclave (`exclave`)

README 明确 Android 默认与 legacy 两种构建，dyhkwong/ExclaveNetwork。library/core/go.mod 明确 libexclavecore/exclave-core，记录为 Exclave core，不凭历史印象填成 sing-box。正式 0.17.56 的8个架构/legacy包来自同一 release。

- 官方依据：https://github.com/ExclaveNetwork/Exclave
- 官方依据：https://github.com/ExclaveNetwork/Exclave/blob/dev/library/core/go.mod
- README：https://github.com/ExclaveNetwork/Exclave/blob/dev/README.md
- 发布：https://github.com/ExclaveNetwork/Exclave/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/ExclaveNetwork/Exclave/dev/app/src/oss/play/listings/en-US/graphics/icon/icon.png（本地缩放为256px以内 WebP）
- 本次平台快照：android 0.17.56 / automatic。

### 19. NekoBox for Android (`nekobox-for-android`)

README 明确 sing-box、MatsuriDayo、Android，警告 Google Play 自2024年5月被第三方控制。只提供该官方 GitHub release，不给被接管商店链接。

- 官方依据：https://github.com/MatsuriDayo/NekoBoxForAndroid
- README：https://github.com/MatsuriDayo/NekoBoxForAndroid/blob/main/README.md
- 发布：https://github.com/MatsuriDayo/NekoBoxForAndroid/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/MatsuriDayo/NekoBoxForAndroid/main/app/src/main/ic_launcher-playstore.png（本地缩放为256px以内 WebP）
- 本次平台快照：android 1.4.2 / automatic。

### 20. Husi (`husi`)

README 当前明确多平台；v2.1.4 有 Android/Windows/macOS/Linux 包，不能只按旧 Android 分类。libcore/go.mod 使用 sing-box；Mac仅arm64，README明确不再支持darwin/amd64。Windows AMD64 JBR/non-JBR 包均按真实资产识别。

- 官方依据：https://github.com/xchacha20-poly1305/husi
- 官方依据：https://github.com/xchacha20-poly1305/husi/blob/dev/libcore/go.mod
- README：https://github.com/xchacha20-poly1305/husi/blob/dev/README.md
- 发布：https://github.com/xchacha20-poly1305/husi/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/xchacha20-poly1305/husi/dev/fastlane/metadata/android/en-US/images/icon.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v2.1.4 / automatic；windows v2.1.4 / automatic；macos v2.1.4 / automatic；linux v2.1.4 / automatic。

### 21. YumeBox (`yumebox`)

README 指向 yumebox.gal.tf，官网标题明确 Android/mihomo，并承诺开源免费。v0.6.2 的 app/build.gradle.kts 明确只支持 arm64-v8a（不是 universal）；builtin/external 仅 Geo 数据内置与否不同。图标来自官方仓库应用资源，仅用于标识原项目而非分支品牌。

- 官方依据：https://github.com/YumeYucca/YumeBox
- README：https://github.com/YumeYucca/YumeBox/blob/Moe/README.md
- 发布：https://github.com/YumeYucca/YumeBox/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/YumeYucca/YumeBox/Moe/app/res/mipmap-xxxhdpi/ic_launcher.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v0.6.2 / automatic。

### 22. Shadowsocks Android (`shadowsocks-android`)

官方 README 明确手机/Android TV、Max Lv/Mygod Studio 和 shadowsocks-rust。最新元数据 v5.3.5-nightly 即使 prerelease=false 仍排除，选正式 v5.3.4，两个包均在名称声明 universal。

- 官方依据：https://github.com/shadowsocks/shadowsocks-android
- README：https://github.com/shadowsocks/shadowsocks-android/blob/master/README.md
- 发布：https://github.com/shadowsocks/shadowsocks-android/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/shadowsocks/shadowsocks-android/master/core/ic_launcher-web.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v5.3.4 / automatic。

### 23. OneXray (`onexray`)

README 和 Apple lookup 确认五平台、Xray-core、Yuan Dev LLC。GitHub Mac 的 OneXraySE Universal ZIP 是独立版本依据；iOS 用 App Store，不把需要付费开发者签名能力的IPA直接充当可安装商店替代。

- 官方依据：https://github.com/OneXray/OneXray
- 官方依据：https://apps.apple.com/us/app/onexray/id6745748773?uo=4
- README：https://github.com/OneXray/OneXray/blob/main/README.md
- 发布：https://github.com/OneXray/OneXray/releases
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/98/4c/6d/984c6d6c-200a-b66d-fe89-a30a745fe025/IconBlue-0-0-1x_U007epad-0-1-sRGB-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：android v26.9.3 / automatic；ios 26.9.2 / automatic；windows v26.9.3 / automatic；macos v26.9.3 / automatic；linux v26.9.3 / automatic。

### 24. SSRVPN (`ssrvpn`)

README 明确 Android arm64-v8a、Mac仅Apple Silicon、Windows x64，Mihomo/Elegying；三个固定名文件不含架构，所以采用逐平台官方固定映射。README标明桌面包未签名/未公证，详情保留提示。

- 官方依据：https://github.com/Elegying/SSRVPN
- README：https://github.com/Elegying/SSRVPN/blob/main/README.md
- 发布：https://github.com/Elegying/SSRVPN/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/Elegying/SSRVPN/main/SSRVPN_MacOS/macos/Runner/Assets.xcassets/AppIcon.appiconset/app_icon_256.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v5.0.5 / automatic；windows v5.0.5 / automatic；macos v5.0.5 / automatic。

### 25. SingCast (`singcast`)

官网与README明确Flutter/定制sing-box、mapleafgo、四平台；README明确iOS不支持，尽管最新发布含IPA，仍不把它列为可用平台或正式获取项。四平台包均按实际命名匹配。

- 官方依据：https://mapleafgo.github.io/singcast/
- 官方依据：https://github.com/mapleafgo/singcast
- README：https://github.com/mapleafgo/singcast/blob/singcast/README.md
- 发布：https://github.com/mapleafgo/singcast/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/mapleafgo/singcast/singcast/assets/icon.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v1.2.2 / automatic；windows v1.2.2 / automatic；macos v1.2.2 / automatic；linux v1.2.2 / automatic。

### 26. Streisand (`streisand`)

Apple 页面/lookup：ARCADIA ODYSSEY INC.、免费、iPhone/iPad与Apple Silicon Mac兼容。未公开源码且无内核官方依据，不推断成Xray/sing-box。

- 官方依据：https://apps.apple.com/app/streisand/id6450534064
- 官方依据：https://apps.apple.com/us/app/streisand/id6450534064?uo=4
- 实际取得的官方图标：https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0b/cd/a2/0bcda234-4997-1fce-731b-96bd7d36c773/AppIcon-0-0-1x_U007epad-0-0-0-1-0-85-220.png/512x512bb.jpg（本地缩放为256px以内 WebP）
- 本次平台快照：ios 1.6.76 / automatic；macos 未知版本 / manual。

### 27. FoXray (`foxray`)

详见下方已接受的例外。历史官方页面确认 YIGUO NETWORK INC.、iOS/Mac、Xray和Hysteria2；当前商店无结果，不填当前版本/发布日期/成功时间，不配置虚假的自动源。费用当前未知，保留历史免费限定。

- 官方依据：https://yiguo.dev/docs/apple/
- 官方依据：https://apps.apple.com/us/app/foxray/id6448898396
- 图标：官方原图未能重新取得；本票自绘文字 F 占位，不冒称官方图标。
- 本次平台快照：ios 未知版本 / manual；macos 未知版本 / manual。

### 28. Clash Nyanpasu (`clash-nyanpasu`)

README明确Clash Premium/Mihomo/Clash Rust/Meow，多内核不是单纯Mihomo；GPL，libnyanpasu。选正式v1.6.1，排除开发预发布；Windows/Mac/Linux均有真实包。

- 官方依据：https://github.com/libnyanpasu/clash-nyanpasu
- README：https://github.com/libnyanpasu/clash-nyanpasu/blob/main/README.md
- 发布：https://github.com/libnyanpasu/clash-nyanpasu/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/libnyanpasu/clash-nyanpasu/main/backend/tauri/icons/128x128@2x.png（本地缩放为256px以内 WebP）
- 本次平台快照：windows v1.6.1 / automatic；macos v1.6.1 / automatic；linux v1.6.1 / automatic。

### 29. Clash Party (`clash-party`)

README明确Mihomo与Smart内核、WebDAV/Sub-Store；mihomo-party-org。只匹配clash-party正式产品名前缀，不将同一release内重复mihomo-party别名包再展示一次。win7/catalina等变体保留真实文件名区分。

- 官方依据：https://github.com/mihomo-party-org/clash-party
- README：https://github.com/mihomo-party-org/clash-party/blob/smart_core/README.md
- 发布：https://github.com/mihomo-party-org/clash-party/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/mihomo-party-org/clash-party/smart_core/resources/icon.png（本地缩放为256px以内 WebP）
- 本次平台快照：windows v2.0.2 / automatic；macos v2.0.2 / automatic；linux v2.0.2 / automatic。

### 30. GUI.for.Clash (`gui-for-clash`)

官方README指向GUI-for-Cores文档；文档和源码为Mihomo桌面UI，Windows/darwin/Linux三个资产前缀，386/amd64/arm64按官方命名提供。固定无版本文件名仍必须属于同一release标签URL。

- 官方依据：https://github.com/GUI-for-Cores/GUI.for.Clash
- README：https://github.com/GUI-for-Cores/GUI.for.Clash/blob/main/README.md
- 发布：https://github.com/GUI-for-Cores/GUI.for.Clash/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/GUI-for-Cores/GUI.for.Clash/main/build/appicon.png（本地缩放为256px以内 WebP）
- 本次平台快照：windows v1.27.0 / automatic；macos v1.27.0 / automatic；linux v1.27.0 / automatic。

### 31. Sparkle (`sparkle`)

README明确Mihomo、Electron和三桌面目标、xishang0128。正式1.26.8，不取rolling预发布；Linux各架构/包格式不通过后缀猜平台。

- 官方依据：https://github.com/xishang0128/sparkle
- README：https://github.com/xishang0128/sparkle/blob/master/README.md
- 发布：https://github.com/xishang0128/sparkle/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/xishang0128/sparkle/master/resources/icon.png（本地缩放为256px以内 WebP）
- 本次平台快照：windows 1.26.8 / automatic；macos 1.26.8 / automatic；linux 1.26.8 / automatic。

### 32. v2rayN (`v2rayn`)

官方README明确Windows/Linux/macOS、Xray/sing-box与2dust；资产64/86/arm64对应README矩阵x64/x86/arm64，保留官方架构命名。不把移动v2rayNG合并。

- 官方依据：https://github.com/2dust/v2rayN
- README：https://github.com/2dust/v2rayN/blob/master/README.md
- 发布：https://github.com/2dust/v2rayN/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/2dust/v2rayN/master/v2rayN/v2rayN.Desktop/v2rayN.png（本地缩放为256px以内 WebP）
- 本次平台快照：windows 7.24.9 / automatic；macos 7.24.9 / automatic；linux 7.24.9 / automatic。

### 33. AnyPortal (`anyportal`)

README明确Windows/macOS/Linux/Android，以及iOS entitlement受阻。多内核列表有V2Ray/Xray/sing-box/Clash/Mihomo。源码公开但README“All rights reserved until further notice”：新增available（源码可见）而不是谎称开源许可证。Windows/Linux x64、Mac universal由README下载表确认。Android api28和apilatest能力不同。

- 官方依据：https://github.com/AnyPortal/AnyPortal
- README：https://github.com/AnyPortal/AnyPortal/blob/main/README.md
- 发布：https://github.com/AnyPortal/AnyPortal/releases
- 实际取得的官方图标：https://raw.githubusercontent.com/AnyPortal/AnyPortal/main/assets/icon/icon_rounded_square.png（本地缩放为256px以内 WebP）
- 本次平台快照：android v0.6.31+105 / automatic；windows v0.6.31+105 / automatic；macos v0.6.31+105 / automatic；linux v0.6.31+105 / automatic。

## FoXray 的外部限制（用户已接受例外）

- 基线 `https://github.com/fofapro/foXray`：GitHub repo/readme/releases 实际均404。
- `https://itunes.apple.com/lookup?id=6448898396&country=us&entity=software`：实际 `resultCount: 0`；App Store直接HTML返回通用Today，不是应用详情。
- `https://yiguo.dev/docs/apple/`：Jina DNS失败、直接curl无内容。按专用skill回退到 Exa `web_fetch_exa` 成功读取其**缓存官方页面**及Apple历史详情。缓存不是实时可下载证明，因此未写缓存25.4.3为当前版本。
- 实际访问 Exa 缓存官方 `https://yiguo.dev/` 现在显示OneXray；不因此合并两项身份。Apple历史页面指向 `https://foxray.app`，直接访问却是域名出售页，因此**不把它作为下载入口**。
- Apple历史文字不含官方图标原始地址。检索到的第三方 AppRecs 图标未采用；不能拿第三方重压图片冒充本次已核验官方图标。保留Apple历史商店入口并明确当前不可用，文字占位图，当前费用未知。
- 该项不满足原“25项官方图标均取得、官方下载入口当前可用”的要求。用户于 2026-09-16 明确回复“接受例外”，同意保留当前无法获取说明、文字占位图、未知版本与日期及历史官方商店入口；已写入 PRD 和第 04 票。此决定解除本票验收阻塞，不意味着官方渠道已恢复，也不豁免其他应用。

## 特定架构与来源契约

- 既有两个正则捕获组仍分别是架构和格式。固定文件名仅允许第一组为空，再读取本条来源 `architectures[platform]`；没有官方映射时schema拒绝，不按OS/后缀推断。
- 固定架构仅用于Hiddify Mac、YumeBox Android、SSRVPN三平台及AnyPortal桌面；均有README/同版本构建配置依据。
- UI对同平台同架构同格式不同包追加真实文件名，避免YumeBox builtin/external、AnyPortal API变体、Windows安装器变体成为不可区分选项。
- Mac商店兼容快照人工原因逐行明示；Surge Mac是未接入独立厂商更新源；ClashFest是alpha正式性不足；FoXray是分发渠道不可达。其余可适配来源均已真实同步成功，而非以人工原因绕过。

## 裁剪样本的核验摘要

下列是实际读取原始响应的SHA-256；无需保存庞大网页/仓库API全文到生产目录。测试样本是正式发布与商店响应的字段裁剪，另保留真实Shadowsocks Nightly和ClashFest alpha作为拒绝样本。

| 原始文件                           | SHA-256                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| `anyportal-releases.txt`           | `6be40918a6e0a6a670a6fcfd37d5377a71dd2709b87b6c650297236f0fb30ce2` |
| `clash-nyanpasu-releases.txt`      | `dfd44cafcb72f7410adeeba51128e25981341ba28a2781a2179169248640d26b` |
| `clash-party-releases.txt`         | `a29d83fd30d1327415f6f2a84191d0cfd8231ca053cdaf593158e5a225a5b999` |
| `clashfest-releases.txt`           | `ae87fbfd9b13c53a163237042665be1e790317f8cec208c542d28d4719459be7` |
| `exclave-releases.txt`             | `1b5c6dfd49df7dca9699914312fe5d6e9f2ad24a1bc170d34cde59f4685bc897` |
| `gui-for-clash-releases.txt`       | `bb804f91728a081b4956e6d3793bd782f5ae7de15fea32f7058e38d6b973f968` |
| `hiddify-releases.txt`             | `d7fa6ca470655383b3810daf00d4806fe05dca853614c66dc7a3487066b0fb94` |
| `husi-releases.txt`                | `40163ac4a7f63954a0b3c7b9b03a7a76bab738bbb7cd78fb54444ee22d86ba92` |
| `karing-releases.txt`              | `e800931c230d08db66ee0177788c27d17b2edc0933cf3d2ac225fadc3623f5aa` |
| `nekobox-for-android-releases.txt` | `501691292e945cd7176614eee9dbf50694c5fb57829a1b405729d7ea69d593e8` |
| `onexray-releases.txt`             | `4afff7ca2b177b4c162d0f291607b226a6995963b68a71e14ae42331a1272147` |
| `shadowsocks-android-releases.txt` | `2a43cda8defd5ee6b7865bd0986f37ed1624fdcde20ca1241e188dacba31561e` |
| `singcast-releases.txt`            | `e570432c3dd3fb908a9213bd0a2c471d3926ba84c7d79905beedc692ab48c906` |
| `sparkle-releases.txt`             | `3e2209625fafadb2adbb6d7d2e2c3d167d145d564aeea96034596d06703212a5` |
| `ssrvpn-releases.txt`              | `7e19956646ea4b2f8bd459d82749ca46fb91af59cd5cc4d66e5563300bdd9f10` |
| `v2rayn-releases.txt`              | `046f8d3bd20027ad948aacd0aca89810dc827ef844af49e572684c17c2a88be0` |
| `yumebox-releases.txt`             | `1acb17f399508c6cfe29be81b699705a3d5e92cd4d8da80aa8c8958b5e585e73` |
| `clash-by-hako-lookup.json`        | `b6e5dc64ca4c6cef2722e78c4bf0a95b4095bfb0a281da42f190f4d8d824f93c` |
| `egern-lookup.json`                | `60a1264e20924fc22d3a501583ae1c7ca2fecf554b9aaa37256a7f2f0dfe391b` |
| `foxray-lookup.json`               | `7f5ce663b726607eae2fde2a6dc438052ac0d1681e636de7cc3377c0bb77e047` |
| `hiddify-lookup.json`              | `bb4a9a9c7eeb90f5a36366b0c5fcddc60d632cd7a8f482387d8292d181666a57` |
| `karing-lookup.json`               | `08724734cf1ff844eedaa637a9ed79dae500c92dc331b3095a8e5b1edcf59603` |
| `loon-lookup.json`                 | `cbf18eccd6e508022c58559d17a67525e5c3ac1472a31f758f99958cd4b2f41c` |
| `onexray-lookup.json`              | `43b37cbe2183042d1744caebf405f4233dcb950ad79882aa1a6d31e298405b1f` |
| `pharos-pro-lookup.json`           | `18b056c3438734cdfe69b5d6dd15d98846e2c4640217dd6e716850b48f974ab5` |
| `quantumult-x-lookup.json`         | `2b414169a893b1fd115dbd7a7ba3436b9a6308d87446c7bbcd02a8548272b54b` |
| `streisand-lookup.json`            | `75a7809057e47bb125d81668b898b429ec45a5f0a776824bbcd85632042b57f9` |
| `surge-lookup.json`                | `11e1fa754e4307d1edecfec0b3f5715bf1d13d83ea5ea945382a154976fdda5c` |

## 独立审查回修（2026-09-16）

- **Surge Mac 入口纠正**：初始生成代码误将所有有商店数据的 Mac 行归入 iOS 商店，导致资料与上述核验结论不一致。现将 Mac 的 source、fallback 和 download 三处统一为 `https://nssurge.com/` 官方页面；保留独立授权说明、manual 与未知版本/日期，不写成功核验时间。再次实际通过 Jina 读取官网，标题明确“Advanced Network Toolbox for Mac & iOS”。新回归逐字段断言，不能只检查研究文字。
- **Husi Linux 补齐**：正式 v2.1.4 的 Linux 资产完整为10个：2个AppImage、2个便携tar.zst、2个DEB、2个RPM、2个Pacman pkg.tar.zst。新增6个发行包，匹配版本及真实架构；未将 Android/Windows/Mac 包混入。
- **Clash Nyanpasu Linux 补齐**：正式 v1.6.1 的用户安装包为3个：amd64 DEB、amd64 AppImage、x86_64 RPM，新增遗漏的RPM。
- 执行 `/tmp/catalog04/review-sync.mjs`，实际重新请求这两个仓库的正式发布及独立资产API，并对两个Linux平台的**全部13个包**执行真实HEAD，13个均返回valid，无错误；通过既有 `syncReleases` 写入新快照，成功时间 **2026-09-16T12:47:15.044Z**。不是从fixtures生成生产成功快照；其余平台不刷新时间。
- 逐个检查本批16个GitHub fixtures的未匹配资产，剩余都有明确排除原因：Husi mapping是调试映射；SSRVPN provenance是来源记录；v2rayN asc为公钥；sig/sha256/zsync为签名、校验或更新元数据；OneXray IPA需要额外签名能力，Singcast官方README明确不支持iOS，沿用前述商店/平台边界；Clash Party的mihomo-party前缀是同版别名包，每项均存在已选clash-party对应项，不重复展示。
- **Nyanpasu更新器档案不混作普通安装包**：实际读取 `https://github.com/libnyanpasu/clash-nyanpasu/releases/download/v1.6.1/latest.json`，其平台URL分别指向 `clash-nyanpasu_1.6.1_amd64.AppImage.tar.gz`、`Clash.Nyanpasu_x64.app.tar.gz` 和 `Clash.Nyanpasu_1.6.1_x64-setup.nsis.zip`，作为Tauri更新器档案保留排除；ARM `.app.tar.gz` 同样是带配对`.sig`的应用更新档案，普通Mac安装已有对应DMG。JSON/YAML更新清单不作为安装包。
- 新增独立完整Linux文件名/架构/格式断言，并对所有真实资产做“已选或有明确排除理由”归类回归，避免仅调整生产规则和计数却继续漏项。FoXray例外不变。
