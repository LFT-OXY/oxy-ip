# 第06票：官方来源核验（实施中）

核验日期：2026-09-16。范围：冻结基线第59–83项，25款客户端。

首轮研究记录保留如下；实施补核、用户例外及最终验证见文末。首轮候选不等于最终生产状态。

## 方法与证据边界

- 遵循 agent-reach 路由：GitHub 用 `gh api`，网页用 Jina Reader，Apple lookup 用原站 curl。参考站只作身份起点。
- `06-evidence/<id>.json` 保存官方仓库元数据、README正文、目录树路径、发行索引及裁剪发行/资产样本；各请求 URL 和基线入口都在文件中。`supplement.json` 保存重试、许可正文、商店与官网补查。`manifest.json` 为文件 SHA-256。
- GitHub 发行列表只读第一页，最多100项；未穷尽历史，未独立分页读取全部资产，未执行包HEAD。因此本文版本均是候选，**不能标为自动核验成功**。
- `icon-provenance.json` 记录23款成功获取的官方图标原始 URL/目录树提交 SHA、临时路径与 curl 结果；仍待视觉核对、必要压缩和写入生产图标目录。Loon Lite artwork首次超时、单次重试成功；Pantheon和ClashTui未取得官方图标。临时原图在 `/tmp/catalog06/`，没有下载大安装包。
- 无充分官方费用证据时应保持 unknown，不能因开源许可证或可免费下载而猜完整功能免费。Mac商店兼容性不证明独立Mac版本。
- `tests/client-catalog-batch-3.test.mjs` 的期望复制自独立冻结清单，不读取生产目录生成期望。执行 `node --import ./tests/register-paths.mjs --test tests/client-catalog-batch-3.test.mjs` 已按预期失败（生产58项、期望83项），见 `red-test.txt`。目前仍是最小名单测试，后续须加入独立平台/内核等约束。

## 逐项核验与剩余工作

### 59 Everywhere

- 官方仓库：<https://github.com/NodePassProject/Everywhere>，README明确Xray、sing-box、Mihomo三内核，GPL-3.0，维护NodePassProject。
- README链接Apple `6766003090`，lookup bundle `com.argsment.Everywhere`、1.6、发行方Argsment Limited、price=0。商店兼容iOS和Mac（macOS14+）。Mac不得直接套iOS lookup版本。
- 官方lookup artwork已下载。iOS可接现有Apple源；Mac需独立依据，否则人工商店页。完整功能收费仍需最终核对。

### 60 Connect Now

- 官方商店：<https://apps.apple.com/app/connect-now/id6749354119>。正文明确Mihomo；PASU LIMITED。未发现公开客户端源码依据。
- lookup bundle `pro.pasu.app.ConnectPro`、1.0.5、price=0；商店iOS及M1 Mac兼容，Mac版本独立留空。商店未列内购。
- lookup图标已下载；iOS可接Apple源。

### 61 incy

- 官网 <https://incy.cc/> 明确链接 <https://github.com/INCY-DEV/incy-platforms>、Apple及Google Play；仓库README明确Xray核心、免费、不销售服务。
- 全平台：Android/iOS/Windows/Mac/Linux。**桌面README明确pre-alpha**；不能仅因GitHub发行标正式就给Windows/Linux或桌面DMG正式直链。Mac另有官方Apple入口。
- Apple `6756943388`、bundle `llc.itdev.incy`、2.6.1、LLC ITDEV。Android Google Play `llc.itdev.incy`已读取。发布仓库不是完整源码，不据其存在判开源。
- 图标取lookup已下载；iOS可自动，Android商店人工；桌面正式信息留空并说明测试阶段。APK是否正式及架构仍需单独确认。

### 62 Nextin

- 官方Apple <https://apps.apple.com/us/app/nextin/id6754002454> 明确Clash Meta，NEXTIN INC；iOS及M1 Mac兼容。
- lookup bundle `com.Tommy.Nextin`、1.3.2、免费下载；商店有积分内购（US$1.99/6.49/20.49）。不能以price=0证明完整功能免费，内购与代理功能关系仍需核对。
- 图标已下载；iOS自动候选，Mac人工未知版本。未取得公开应用源码依据。

### 63 Sing-box for Apple

- 官方分支 <https://github.com/Elziy/sing-box-for-apple>，GPLv3-or-later；不能误链接SagerNet原应用并混为同一身份。
- README仍是上游的“Experimental iOS/macOS/tvOS”描述；实际2.1.3发布只有 `sing-box.tipa`，正文为iOS修复。iOS安装条件（TrollStore）、架构及本分支Mac可获取性尚需补核，不从继承README直接认定有可安装Mac版。
- 官方SFI资源图标已下载。候选自动源需固定包架构证据；未配置。

### 64 Tunna

- 官方Apple <https://apps.apple.com/app/tunna/id6471652937>，Xray核心；One-Two Development, LLC。官网由lookup指向 <https://tunna.app>。
- iOS与Mac兼容；lookup `com.onetwodev.tunna`、1.7.0、price=0；Mac版本需独立依据。未取得公开客户端源码依据，完整费用尚需最终检查。
- lookup图标已下载；iOS自动候选。

### 65 Loon Lite

- 官方Apple <https://apps.apple.com/app/loon-lite/id6444029612>；Loon Lab Limited，iOS，页面不列Mac兼容。
- lookup `com.loon.LoonLite`、1.0.10、US$0.99。协议支持不证明内部内核；无公开源码依据时保持未公开与未知内核。
- iOS自动候选；官方artwork首次curl超时，单次重试成功，不需图标例外。

### 66 GUI.for.SingBox

- <https://github.com/GUI-for-Cores/GUI.for.SingBox>，GPL-3.0。v1.27.0有Windows386/amd64/arm64、Mac amd64/arm64、Linux amd64/arm64 ZIP。
- README本身很短，文档入口 <https://gui-for-cores.github.io/guide/gfs/>；还需以同标签代码确认内核/架构和费用限定。
- 图标 `build/appicon.png` 已取；包名固定不含版本，仍须绑定release标签URL，可复用现有适配器。

### 67 ClashMac

- <https://github.com/666OS/ClashMac> 与 <https://clashmac.app> 相互链接；README明确闭源专有软件，第三方许可明确外部Mihomo核心。
- Mac15+，Apple Silicon和Intel。27.1.4有DMG/ZIP，不能因文件名未分架构直接猜universal；需包或官方具体说明。
- README引用的仓库 `assets/cat.svg` 当前目录树没有，但官网实际提供 <https://clashmac.app/assets/cat.svg>，已下载。不以仓库失败扩大缺图例外。
- 费用与固定包架构尚待核对；此前仓库API一次超时不等于失效。

### 68 Throne

- <https://github.com/throneproj/Throne>，GPL-3.0，README称Formerly Nekoray，支持Windows/Mac/Linux；同时支持sing-box与Xray配置，不能漏掉Xray。
- 正式1.2.4；较新1.3.0-beta.4等排除。正式资产包含Windows32/64/legacy64/arm64与universal installer、Mac amd64/arm64/legacy-amd64、Linux amd64/arm64及system-qt变体。
- 同架构格式变体不能合并。`res/rc/base_icon@2x.png`已取；正式标签内核/许可证和Windows universal安装器架构策略需补核。

### 69 FlowZ

- <https://github.com/dododook/FlowZ>，MIT，sing-box；Windows/Mac/Linux。
- 正式v4.3.3包明确Windows x64 setup/portable、Mac arm64/x64、Linux amd64 deb/x86_64 AppImage。README系统要求与命名一致。
- `build/icons/256x256.png`已下载。可复用GitHub来源，两个Windows EXE需保留可区分标签；完整费用尚无明确声明。

### 70 Polaris

- <https://github.com/polaris-arch/Polaris>，MIT、sing-box，Windows/Mac/Linux；中文别名北极星。
- 正式v1.0.0：Mac aarch64/x64、Windows x64 setup及不含架构的portable ZIP、Linux amd64 deb/AppImage。portable架构须读同版本打包脚本，不猜。
- `src-tauri/icons/128x128.png`已取。费用未知；需核实是否所有稳定包均被规则覆盖。

### 71 OneBox

- <https://github.com/OneOhCloud/OneBox>，Apache-2.0、sing-box，OneOh Cloud LLC。Mac官方维护、Windows/Ubuntu社区稳定，其他LinuxREADME称beta质量，需保留限定。
- 正式v1.4.39具有Mac aarch64/x64、Windows x64 exe/msi、Linux deb/rpm。macOS app.tar.gz为更新包，是否提供应结合官方用法，不随意替代DMG。
- README的移动伴侣明确为**OneBoxM**。冻结清单序号137已有独立`oneboxm`身份，因此本票OneBox保持桌面身份，不能复制移动版资料造成重复。已另读其Apple/Play作为身份隔离证据。
- 图标已取。NOTICE区分源码许可与品牌权，不得暗示本站获得官方背书；费用尚待核对。

### 72 Interstellar

- <https://github.com/zn0wii/interstellar-proxy>，MIT；Android7+，sing-box/Mihomo/Xray三内核，中文星际穿越。
- 正式v0.5.4具有arm64-v8a/armeabi-v7a/x86/x86_64/universal APK；README也说明四ABI构建。
- `assets/android/playstore-icon.png`已取；GitHub自动候选，费用无充分声明。

### 73 Satelite

- <https://github.com/zn0wii/satelite-proxy>，Apache-2.0，sing-box/Xray/Mihomo；Windows/Mac/Linux。
- README把Android明确指向独立Interstellar，本票两身份已分开，不能给Satelite再加Android包。
- 正式v1.0.36：Mac aarch64/x64 DMG、Windows x64 setup/portable、Linux amd64 AppImage；app.tar.gz是独立更新资产需核对用途。
- `src-tauri/icons/128x128@2x.png`已取；费用尚未知。

### 74 ClashBar

- <https://github.com/Sitoi/ClashBar>，GPL-3.0、Mihomo，Mac13+；Sitoi。
- v0.3.3包分别apple-silicon/intel，含core与no-core两变体；须用已核实架构映射且两变体同时保留。
- README明确内核路径，品牌 `docs/public/clashbar-logo.png` 已取。费用尚待核实。

### 75 KumoApp

- <https://github.com/ProjectKumo/KumoApp>，AGPL-3.0-only；Mihomo；Mac15+，品牌Kumo。
- 正式0.0.15具有amd64/arm64 DMG；同一release另有更新YAML，不作安装包。
- 应用AssetCatalog `icon_256x256.png`已取；可配GitHub源，费用无充分声明。

### 76 Singboard for Mac

- <https://github.com/okunvei/singboard_for_mac>，AGPL-3.0；Mac分支README为sing-box启动器，核心需用户自备，首次安装root helper需管理员权限。
- **全仓最新v2.3.6只有`singboard.exe`，不能更新Mac快照。** Mac独立渠道`build-20260627-121223-f6c9f44`正文明确ForMac、arm64/x86_64、对应机型和安装步骤，资产两ZIP。
- build不是自动等价测试版，但需补读发布工作流确认正式策略；若自动配置应以`releaseTag`隔离Mac渠道并绑定整条标签，不将Windows版号套用Mac。
- Mac图标已取；费用未知；不依据历史Windows资产给Mac独立分支增加Windows身份。

### 77 IRBox

- <https://github.com/frank-vpl/IRBox>，GPL-3.0，README明确sing-box与Xray；Windows/Mac/Linux。
- 正式v1.0.2包含Windows x64/arm64 exe/msi、Mac x64/aarch64、Linux amd64/x86_64 deb/AppImage/rpm。
- 应用图标已取；原README有图标第三方署名，需保留相应出处。免费订阅赠品不证明应用完整功能费用免费。

### 78 Netch

- <https://github.com/netchx/netch>，GPL-3.0，Windows/.NET6 x64。README当前提示为2.0准备清理1.x，不能以当前描述替代旧正式1.9.7。
- 1.9.7只有Netch.7z；1.9.6官方日志明确从Xray切换SagerNet/v2ray-core并用于所有协议。仍需读取1.9.7代码/构建确保核心、x64和图标与该版一致，不沿参考站填Xray。
- 官方README直接引用 `Netch/Resources/Netch.png`，已获取；非名字含icon的托盘图优先。

### 79 Pantheon — 获取入口与图标阻塞

- 冻结入口 <https://github.com/Zephyruso/Pantheon> 的仓库、README、releases、tree API均404。
- `gh search repos 'Pantheon user:Zephyruso'`无结果；`gh api users/Zephyruso/repos --paginate`仅列dae/domain-list-community/metacubex-d/mihomo/zashboard，没有迁移入口。
- 参考站当前也明确原仓库不可访问、无可靠版本、无可访问官方来源；它只提供第三方图标，不能当官方原图。参考文本在`pantheon-reference.txt`。
- 尚未找到可用官方获取入口及图标，也不能独立证实所有元数据。**需要本项专项例外或用户提供官方来源**，不能套用FoXray/Clash MIX旧票例外。已通知主会话，未自行生成占位或失效下载按钮。

### 80 Stelliberty

- <https://github.com/Kindness-Kismet/Stelliberty>，Mihomo，Windows/Mac/Linux。
- README自称fully open source，但实际LICENSE为自定义WTF条款，明确**仅非商业用途**，并要求衍生源码公开与移除原标识。因此目录应标`available`源码可见，不标OSI意义的`open`。
- 正式v2.0.30为三平台x64/arm64，Linux五格式、Mac dmg/pkg、Windows setup/zip。图标已取。需要补核同正式标签许可证，避免默认分支与正式版许可代际差异；费用按实际条款限定，不猜商用收费方案。

### 81 Carton

- <https://github.com/821869798/carton>，README及LICENSE正文GPLv3（API NOASSERTION不能代替正文）；sing-box；Windows/Linux，README明确不提供Mac。
- v0.6.2包Windows x64/arm64 setup/portable ZIP、Linux x64/arm64 portable tar.gz/AppImage，nupkg与release JSON为更新资源需与用户安装包区分。
- `src/carton.GUI/Assets/carton_icon.png`已取；官方明确无APT/DNF/AUR等官方在线源，目录不要自行添加第三方入口。

### 82 Pandora Box

- <https://github.com/snakem982/Pandora-Box>，GPL-3.0、Mihomo；Windows/Mac/Linux。
- v1.0.23三平台均amd64/arm64；Windows app.zip/msi，Mac dmg，Linux deb/rpm。官方包带完整`v`版本前缀，来源规则应保留。
- README品牌 `build/appicon.png` 已取；自动候选。费用尚需最终核验。

### 83 ClashTui — 图标阻塞候选

- <https://github.com/JohanChane/clashtui>，MIT，Mihomo/sing-box；Windows/Mac/Linux，终端界面而非桌面GUI。
- 正式v0.3.1三平台amd64/arm64；Mac/Linux gz、Windows zip；较新v0.3.2-alpha.2排除。
- 当前完整222项目录树没有PNG/SVG/ICO等应用图标；README与中文README仅录屏、功能及徽章，没有品牌原图。不能用维护者头像、第三方目录图或通用终端图冒充官方图标。
- 需继续查官方历史/发布文档是否有原图；若确无图标则须专项占位授权。其官方发布入口正常，不需要获取入口例外。

## 下一步（仍未实施）

1. 补核同正式标签代码、架构、完整费用与上述缺项；查ClashTui历史品牌资源，等待Pantheon专项决定。
2. 独立固定平台/内核期望先入测试；旧批测试限定各自冻结子集，不用生产数据生成期望。
3. 新增目录、逐平台人工快照、官方图标及中英限定；旧58项必须逐对象不变。
4. 新来源走既有GitHub/Apple同步，实际资产分页与HEAD后才automatic；解析失败、测试版及错误版本URL加单源回归。
5. 构建后全量测试、lint、修改文件Prettier；真实preview浏览器做390/768/桌面×中英×实际dark矩阵、筛选/返回/包选择/键盘。

本阶段没有提交、关闭票或启动其他票。研究发现不代替后续独立双轴审查。

## 实施补核与已确认边界

用户已明确回复“接受两项例外”，Pantheon不可获取／文字占位与ClashTui仅文字占位写入PRD；没有扩展到其他应用。

`implementation-supplement.json` 保存同正式标签的源码、README、构建工作流及许可补核：

- Throne 1.2.4 README同时声明sing-box/Xray；NSIS安装器实际包含x86/x64/arm64分支，数字包映射为真实架构。system-qt、legacy和安装器均独立保留。图标首轮误取控件素材 `res/rc/base_icon@2x.png`，视觉核对后替换为同正式标签应用品牌 `res/public/Throne.png`，未使用模板素材。
- Polaris v1.0.0工作流Windows唯一目标为x86_64-pc-windows-msvc，便携ZIP与安装器同目标；只含一次版本占位的规则同时核对两种命名。
- Singboard Mac同标签工作流明确手动触发、两种Mac目标、独立build标签及非预发布；所有下载仍绑定该release，不挪用Windows v2.3.6。用户需自备sing-box和配置，首次Helper安装需管理员授权。
- Netch 1.9.7的`Other/v2ray-sn/build.ps1`明确SagerNet/v2ray-core v5.0.14、GOARCH=amd64；Netch.csproj只构建x64。同步源固定该旧正式代际，避免未来2.x继承错误内核说明。
- Stelliberty同v2.0.30的LICENSE确认非商业限制，用源码可见而非开源，价格说明为非商业免费。Kumo 0.0.15 LICENSE第一次读取失败，重试成功确认AGPL-3.0；没有因一次失败当作无许可证。
- OneBox同v1.4.39声明Mac官方稳定、Windows/Ubuntu社区稳定、其他Linux测试质量。仅提供Ubuntu DEB，排除RPM；app.tar.gz、签名和latest.json是更新资产，不作为首次安装包。移动伴侣OneBoxM另有冻结身份，不重复收录。Satelite同理只收桌面，Android Interstellar独立。
- Elziy SFI 2.1.3有独立正式TIPA发行及iOS修复记录，工程要求arm64；其公开issue也记录TrollStore安装。保留TIPA设备／系统限制，不能当App Store通用安装。本分支Mac只核实实验源码，版本空、不冒用上游SagerNet。
- ClashMac官方README指导同一DMG用于Apple Silicon与Intel并自动按CPU取核，27.1.4提供同应用DMG/ZIP，因此记录universal。官网和仓库互链、官网明确Mihomo；闭源状态来自README，不因发布仓库可见标开源。
- incy官方桌面pre-alpha不提供正式包；Mac使用官方商店入口并保持版本未知。Android采用官网／README明确链接的Google Play，尚无独立APK架构证据，不猜universal；保留人工状态。
- Everywhere、Connect Now和Tunna商店列免费且无内购；incy官方声明免费。Nextin有积分内购但与完整功能的关系未明，费用分类unknown并列明三档价格。Loon Lite美国区US$0.99。其他无明确完整收费声明的项目保持unknown，不把开源许可的“free software”误作零价格。
- IRBox官方图标归属PiraIcons / Hossein Pira，CC BY 4.0；署名、许可链接与转换说明写入`public/client-icons/NOTICE.txt`，同文件保留OneBox品牌原始NOTICE。全部23个官方图标逐个视觉核对，压缩到最多256px WebP（ClashMac保留原SVG），两例外明确文字占位。

## 同步与测试证据

- 独立名单先红：`red-test.txt`及`red-expanded.txt`，期望来自冻结清单／官方核验，不从生产目录生成。
- 新增25项、55个平台快照；旧58项和140条快照逐对象与实施基点一致。生产UI组件与页面结构未变。
- 实际读取官方API（GitHub分页发行和独立资产API、Apple lookup）并逐个HEAD；既有`syncReleases`和解析器负责推进状态。`sync-evidence.json`记录完整请求状态、实际时间、选中元数据与临时失败；`sync-retry-evidence.json`记录对失败来源的单轮重试。未向生产写入离线模拟结果。
- 静态fixture为真实官方元数据的裁剪；Windows/Mac渠道、较新Alpha/Beta、架构映射、未知架构拒绝、同版本URL和临时失败保留均有回归。OneBox RPM、Mac更新包及各应用签名／更新元数据都有独立排除清单。

### 验证结果（审查前）

- `pnpm build` 通过；随后 `pnpm test` 153/153通过（含Worker本地打包，不是部署）。`pnpm lint` 退出0，仅既有警告。
- 43/55平台快照实际自动核验成功。Stelliberty Linux、Pandora Box Windows在首轮及单轮重试中仍遇到临时失败，保留人工官方发布页与未知版本／日期／成功时间，并在页面说明原因。Stelliberty Windows首轮成功、重试临时失败，保留首轮成功数据与时间，没有覆盖为失败轮时间。
- 浏览器`browser-results.json`记录390/768/1440×中英文×实际深浅主题12种组合：Throne四维组合筛选、键盘卡片进入／平台和包切换／返回、Space侧栏与Tab焦点通过。25项可搜索，全部55个平台详情、版本日期、全部下载选项URL、图标加载及窄屏不溢出通过；控制台无错误或警告。截图已目视核对，长build标签可换行，版本行仍是详情末尾。
- 原生Mac select的方向键在自动化中未提交选择，改用实际键盘字母跳转＋Tab提交后整轮重跑；脚本也修正了英文标题大小写和异步等待。没有以脚本失败为由修改产品UI或放宽断言。
- 两项获批例外说明均已显示，Pantheon字段未知、ClashTui仍正常核验发布。未修改排除的栏目、调度或其他批次。

独立双轴审查及完整复审已完成，原P2已修复，两轴无剩余发现；报告与修复轨迹见`06-review.md`。

- 审查修复：独立双轴均发现OneBox Mac误套移动商店未知版本说明；主会话沿同一原因还发现人工sources误带OneBoxM商店链接。先增加独立身份与状态一致性测试观察失败，再删除错误说明和来源链接。构建后全套154/154通过，lint退出0；12种浏览器矩阵、55平台及OneBox Mac中英文专项全部重跑通过。
