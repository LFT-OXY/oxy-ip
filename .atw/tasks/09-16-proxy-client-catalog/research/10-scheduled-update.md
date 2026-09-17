# 第 10 票：全量定时同步与发布链验证

## 变更边界

固定审查基点：`3cf5b90ba5ed55bbf4c6f1ef55b95de40406144b`。

复用原 `pnpm clients:sync`、GitHub／Apple／Stash 适配器及 `data.ts` 读取路径。新增 `.github/workflows/sync-client-releases.yml` 与 `scripts/publish-client-releases.sh`，补同步内部有界并发和 CLI 总预算；不改人工 `catalog.json`、发布源配置、现有快照内容、页面、部署开关或秘密配置。不新增 Worker 调度，不托管安装包。

## 流程与操作说明

- UTC `17 */6 * * *`（00:17、06:17、12:17、18:17）及 `workflow_dispatch`，仅 main 执行。Actions 实际调度可能排队，不承诺精确准点。
- checkout main → frozen-lockfile 安装 → `pnpm clients:sync` → `pnpm build` → `pnpm test` → 安全提交唯一发布快照路径 → 显式 dispatch 原 `pages.yml` main。
- 同步步骤允许后续处理部分成功结果；最后重新报告同步失败，整轮不会假绿。构建／测试失败则不提交。日志逐条记录应用／平台失败；提交和 dispatch 的失败也保留为 Actions 失败步骤。
- 内建 `GITHUB_TOKEN` 的 push 不触发 push workflow（仓库既有 `sync-upstream.yml` 已采用显式 dispatch）。这里不照搬上游流程的部署开关判断：即使部署关闭，也必须进入 pages 的 build/test；生产 deploy 仍完全服从 pages 中的 `ENABLE_CF_DEPLOY == 'true'`。
- 没有数据变化时不创建提交，但仍 dispatch pages，便于手动重跑恢复上一轮“已提交但 dispatch 失败”。不绕过分支保护；若仓库规则不允许 bot 直接写 main，工作流会明确失败，须维护者决定授权策略，不能自行改规则或换 PAT。
- 并发运行共用固定组且不取消进行中的工作。发布前 fetch 比较 HEAD；分支变化则失败，下一轮从最新 main 重新同步。fetch 后发生竞态也由普通快进 push 拒绝。不 rebase、不 force，不把旧抓取结果套在较新的人工修订上。
- 自动提交前拒绝其他 tracked 改动和 untracked 文件。只 `git add -- src/views/clients/releases.json`。Git 凭据留在 runner 的 checkout 环境，安装包 HEAD 和非 GitHub 来源不携带 token；前端产物不含凭据。

维护者在代码合入后，可在 GitHub Actions 的 **Sync client releases** 手动运行 main；定时运行需要仓库启用 Actions／schedule（fork 的禁用状态由维护者处理）。检查同步、校验、提交、dispatch 和 pages 运行各阶段。若要本地只核验来源，使用 `pnpm clients:sync --output /tmp/client-releases.json` 或 `--dry-run`；不要把生产发布脚本当本地测试命令直接执行，它会尝试推送当前 origin。

本轮没有远程 push、线上 dispatch、部署、修改 secrets/vars 或调用生产写 API。测试中的 Git push 全部指向测试创建的本地临时裸仓库；dispatch 使用 PATH 前置的本地假 gh 进程，未连接 GitHub。

## 全量覆盖与例外

- 固化基线及前六批独立名单测试仍覆盖全部154项、320个平台。
- 当前84条 GitHub、54条官方来源，共218个不重复的 appId/platform；其余102个平台没有自动源，离线 CLI 完整成功后逐对象确认原样保留。
- FoXray、Clash MIX、Pantheon、Clash .NET、lvory、Hey 不添加自动源；其他人工平台也不受覆盖。人工基础目录字节不变，未知版本／日期和历史状态不被自动填充。
- 全量离线 CLI 对所有已配置平台断言进入 automatic；模拟 Shadowrocket 429，确认该平台和成功时间保持，其他来源仍更新；把这次真实部分失败 CLI 输出经发布脚本推入本地裸仓库，远端 main 中快照逐对象等于该输出，人工目录不变。
- 同一 CLI 模拟 FlClash 某直链连续404，确认只去除该包并补 fallback；改为401，确认该平台整组旧值保留。既有测试继续覆盖无正式版、临时错误、API失败后的旧直链独立失效、正式渠道与版本／包绑定。

## 时限与并发

现有快照有761条直链。仅一轮串行 HEAD 在每条15秒时约190分钟，候选失败后再检查旧包会更久，不能照搬 pages 的15分钟 runner 时限。

同步现在同时处理最多4个来源，每个平台的包检查最多4路，当前 CLI 两类源依次执行，最多16个在途请求；结果仍按输入顺序收集。CLI 给两类来源共享40分钟总预算，与每次15秒请求超时组合，到期取消在途请求，剩余请求立即失败并保留旧值，最终仍原子落盘成功结果、退出1。workflow 总时限60分钟，给安装、构建、测试和发布留余量。此上限避免异常网络无限拖延，不保证所有来源在坏网络下都能成功；超预算来源须看日志后重跑，不能称为完整核验成功。

并发回归先红后绿：来源测试初次实测峰值1而期望4；包测试同样峰值1而失败。实现后两项峰值均4、顺序稳定，失败来源／包不影响其他结果。预算测试在离线 fetch 中遵守实际 AbortSignal，注入已耗尽总预算后，CLI退出1、快照完全保留。测试使用标记 token，拒绝其进入非 GitHub API 请求，并确认输出不含该 token。

## 验证证据

首轮审查前按顺序执行：

1. `pnpm build`：退出0。
2. `pnpm test`：193项通过，0失败、0跳过。包括真实本地 Git 的重复执行、不变不提交、人工资料混入拒绝、fetch前冲突、pre-push hook制造fetch后竞态；真实运行工作流里的dispatch命令及失败报告shell，确认失败退出码非零。
3. `pnpm lint`：退出0，保留组件混合导出、Hook依赖等既有警告，无本次新增错误。
4. 仅改动文件 Prettier检查、`git diff --check`、发布shell的`bash -n`；使用本机已安装的 YAML 2.9.0 解析工作流并断言调度和失败门禁。未新增依赖，未安装全局工具。

主要临时日志在 `/tmp/catalog-10/`：`final-build.txt`、`final-test.txt`、`final-lint.txt`、`focused-final.txt`、`link-red.txt`、`link-green.txt`。这些日志和浏览器大文件不进入提交。

## 构建后页面回归

使用本机已有 `playwright-cli` 操作 `pnpm preview --host 127.0.0.1 --port 4180`，不是 dev server；浏览器检查期间阻断非本地请求，不点击真实下载地址。

- 390／768／1440 × 中文／英文 × 浅色／深色，12组合全部通过。每组合验证154卡片、实际 HTML `dark` 类、最近更新日期降序、默认排序恢复、搜索／Windows／Mihomo／开源／免费组合、详情进入与筛选保留返回、空结果及清除、语言参数保留、Space选择Steam Deck、无横向溢出。
- FlClash从Windows通过键盘字母匹配并Tab提交切到Mac，再键盘切安装包；断言实际下载URL属于Mac的同一v0.8.98，Tab焦点落在下载按钮，Enter进入和返回。这里使用本机Chromium有效的字母匹配，不把未生效的原生选择框ArrowDown/Enter当通过。
- 逐一直接打开全部320个平台快照，覆盖154项身份，校验版本、所选平台、全部897个获取选项的DOM URL及direct/store/page按钮标签、图标加载、窄屏／768／桌面溢出；历史unavailable记录没有下载按钮。4批各80平台，选项数280／173／328／116，无pageerror。
- 已实际查看 `mobile-dark-en.png` 和 `desktop-light-zh.png`；侧栏／卡片及移动底栏正常。日志 `browser-matrix.txt`、`browser-all-{0,1,2,3}.txt` 与执行脚本均在临时目录。
- 浏览器脚本初次遇到执行沙箱没有URL全局、React渲染等待不足、误认为FlClash关键词只命中一个结果（Bettbox简介也命中）、原生选择框键盘提交方式及h1选择器范围错误；修正测试脚本后完整重跑，没有为迎合测试修改页面。全量第4批首次被shell总超时中断，单独完整重跑80项通过。

## 局限与审查边界

本轮用全量离线官方夹具和真实本地Git行为验证链路，没有声称在GitHub runner上完成过定时执行、权限／分支保护验收或Cloudflare部署。真实网络可用性会变化，维持既有保守失败处理；线上生效仍须维护者合入并按现有授权开启运行，部署开关关闭时只构建不部署。

页面遍历证明渲染与当前快照一致，不代替逐条官方事实核验；独立来源和平台期望由前票研究与全量Node测试覆盖。规范第16节记录调度、预算、并发、权限和错误契约。完整双轴独立审查通过父代理工具通道执行，共享固定基点到当前工作树（含未追踪文件）的冻结补丁；最终以两份原始审查报告为准，不能以本节验证记录代替审查。

## 第一轮独立审查与修复

父代理回传两份独立只读报告，共同冻结补丁为 `/tmp/catalog-10/review-round1.patch`，SHA256 `0287542413e54a5e7a5f31383eaf39a41b3fd0d84770eb46666ff2d1bf0a4fab`。

- 规格轴发现1项P1：CLI故障URL依赖生产快照，但候选包来自固定v0.8.98夹具；生产升级后故障不再命中，发布前测试会拦住整轮有效结果。源码复核确认成立。故障URL现改为从独立FlClash夹具中选定明确包名，而不是生产old行。另一个既有“部分直链失效”单元场景也发现同类候选／旧快照混用，已给它构造固定夹具对应的旧快照，并保留不同的旧成功时间断言。
- 规范轴没有硬违规，提出1项Duplicated Code判断建议：两个测试文件重复Git子进程／临时仓库准备。本次保留现有小范围准备代码，不为两处调用新建通用框架；该维护性建议未冒充已修复。
- 新增 `tests/client-snapshot-upgrade.test.mjs`：复制构建／测试必要输入到无Git凭据和旧产物的临时目录，复用本机node_modules但不安装；实际把FlClash四平台改成主版本递增的人工变异正式发布，版本、发布日期、包URL均改变，其他记录逐对象不变；随后运行真正的 `pnpm build` 和完整 `pnpm test`。仅从副本中排除递归启动器自身，所有原套件及401／404故障断言都会执行；原生产快照字节不变。
- 回归先红：升级副本完整套件确实出现CLI fallback与“部分直链失效”两项失败，`/tmp/catalog-10/upgrade-red.txt`。修复后转绿：升级副本构建成功、193/193测试通过，0失败／跳过，`upgrade-green.txt`。这不是把生产期望改成新值，也不是只验证schema。
- 回归启动器初次继承Node内部 `NODE_TEST_CONTEXT`，导致子测试未实际执行；通过输出必须含CLI案例和测试摘要的断言发现，移除子进程该内部变量后重新运行并取得上述真正红／绿结果。

本轮只修复测试与相关契约，没有改变已通过浏览器矩阵的页面或生产数据；首轮两轴原始报告由父会话保留并转报，本文记处置与证据，不替代报告原文。

修复后完整门禁：`pnpm build`退出0，其后`pnpm test`为194/194通过、0失败／跳过（其中升级副本另执行193/193通过）；`pnpm lint`退出0且无本次文件警告。日志为`/tmp/catalog-10/round2-{build,test,lint}.txt`。仅改动文件Prettier检查和`git diff --check`通过；本轮补丁包含所有首轮改动和本次回归修复，继续使用同一固定审查基点进行完整双轴重审。

## 第二轮完整独立审查原文

父代理并行取得两份报告，冻结补丁 `/tmp/catalog-10/review-round2.patch`，49051字节，SHA256 `8d4a9d79c1cb74d05849facafff77745dee32fdc6be69c115cb1eb1b096a5adb`。提交前重新生成补丁并逐字节比较一致；审查后仅按父代理授权补录本节和票据验收勾选，不改实现、测试、规范或任务阶段。

### Spec

第二轮完整规格审查完成。冻结补丁 SHA256 与指定值一致，已通读全部12文件变更、研究记录及相关规格、源码和验证日志；未写文件、未执行 git。
(a) 规格缺漏／部分实现：未发现阻塞项。
六小时与手动触发复用既有同步器；成功结果原子落盘，失败保留旧值与核验时间；快照进入网站实际读取路径，再显式触发现有 pages 流程，未绕过 ENABLE_CF_DEPLOY。全量154项320平台、218个自动平台及102个人工平台保留均有对应检查。
(b) 未要求的扩大范围：未发现。
四路并发、共享40分钟预算、安全提交和升级回归均服务于既定验收；未新增栏目、托管安装包、修改人工资料或扩大部署授权。
(c) 看似实现但行为错误：未发现新的确定问题；首轮P1已修复。
tests/client-release-sync.test.mjs 的故障URL现取自固定官方夹具，“部分直链失效”测试也使用同版固定候选，消除了生产快照升级后的版本错配。新增 tests/client-snapshot-upgrade.test.mjs:47–98 实际升级FlClash四平台版本、日期及直链，再构建并执行除自身外的完整测试，非仅校验schema。
已核对红绿日志：原失败被真实复现；修复后升级副本193项通过，最终完整套件194项通过、零失败／跳过，构建与格式检查通过。并发提交拒绝覆盖、正式版筛选、直链回退和凭据边界未见规格回归。
剩余验证边界：线上定时运行、仓库权限／分支保护及实际Cloudflare部署尚未执行；不将其冒充已验证，也不列为已证实代码缺陷。

### Standards

第二轮完整标准审查
已核对 review-round2.patch 的 SHA256 与指定值一致，完整审阅全部12文件及所有 hunk，并读取研究记录和第二轮验证日志。全程只读，未执行 Git、写文件或重跑测试。
硬违规：未发现。已按指定 AGENTS、前端规范及复用指南检查；故障 URL 现绑定独立夹具，升级副本先构建再运行完整测试，符合 .atw/spec/frontend/client-catalog.md §16.6 与 quality-guidelines.md 的行为回归要求。
判断性建议：保留首轮1项：Duplicated Code。
位置：tests/client-release-sync.test.mjs，@@ -396,6 +446,77 @@；tests/client-scheduled-sync.test.mjs，@@ -0,0 +1,197 @@。
Git 子进程封装、隔离环境及裸仓库初始化存在重复，未来调整隔离策略可能漏改一处。
依据：.atw/spec/guides/code-reuse-thinking-guide.md 的“Copy-Paste Functions”和“When to Abstract”。可在继续扩展时提取最小共享夹具；当前为控制范围保留重复可以接受，不标硬违规，也不声称已修复。
完整 smell 基线：已考虑 Mysterious Name、Duplicated Code、Feature Envy、Data Clumps、Primitive Obsession、Repeated Switches、Shotgun Surgery、Divergent Change、Speculative Generality、Message Chains、Middle Man、Refused Bequest。除上述建议外，无新增发现；无继承变更。
证据与局限：日志显示构建成功、194项测试通过且无失败／跳过；格式检查通过，lint 所列警告不在本次修改文件。线上 Actions 权限、调度和部署仍未由这些本地证据证明。
