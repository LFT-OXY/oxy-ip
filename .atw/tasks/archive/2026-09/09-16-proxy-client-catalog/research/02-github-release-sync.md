# 第 02 票：GitHub 正式发布同步核验

核验日期：2026-09-16。仅配置首票已有的 FlClash（Android / Windows / Mac / Linux）和 v2rayNG（Android），不扩充应用目录。其余应用仍由原人工快照维护，不代表其同步已经实现。

## 官方依据与真实样本

按 agent-reach 的 GitHub 路由，通过 `gh api` 只读获取：

- FlClash 官方 README：`https://github.com/chen08209/FlClash`，API `repos/chen08209/FlClash/readme`。README 明确四平台，并将下载链接指向该仓库 Releases。
- FlClash 发布列表：`https://api.github.com/repos/chen08209/FlClash/releases?per_page=10`。正式版 `v0.8.98`（release ID `388129466`），发布时间 `2026-09-14T03:20:30Z`；详情 `https://github.com/chen08209/FlClash/releases/tag/v0.8.98`。
- v2rayNG 官方 README：`https://github.com/2dust/v2rayNG`，API `repos/2dust/v2rayNG/readme`。明确 Android 客户端及本仓库下载入口，桌面客户端是另一个项目，不能串用。
- v2rayNG 发布列表：`https://api.github.com/repos/2dust/v2rayNG/releases?per_page=10`。列表最前面的 `2.3.8`、`2.3.7`、`2.3.6` 均为 `prerelease=true`，不能取首项充当正式版。
- v2rayNG 正式发布：`https://api.github.com/repos/2dust/v2rayNG/releases/latest` 返回 `2.2.6`，详情 `https://github.com/2dust/v2rayNG/releases/tag/2.2.6`，发布时间 `2026-07-05T10:17:21Z`。

真实样本位于 `tests/fixtures/client-releases/flclash.json` 和 `v2rayng.json`。它们是上述 API 返回的字段裁剪：保留 release 的 `id/tag_name/name/html_url/published_at/draft/prerelease`，以及资产的 `id/name/browser_download_url/state`；不修改字段值。测试中草稿、rc、beta、异常 URL、超时、分页等情况是显式人工变异或传输模拟，不宣称这些异常是当日官方实际返回。

FlClash 样本包含 3 个 Android APK、4 个 Windows EXE/ZIP、2 个 Mac DMG、6 个 Linux AppImage/DEB/RPM，以及不收录的校验文件。v2rayNG 正式样本提供四种 Android 架构。匹配规则绑定项目、版本、平台、架构和格式；未知命名不猜测，不把 `.apk` 一概认定为 Android。URL 必须与同一官方仓库、release 标签和资产名称对应。

## 数据边界与失败语义

- `scripts/client-release-sources.mjs`：经过核验的官方仓库及命名规则。
- `scripts/client-release-sync.mjs`：读取官方 release 与独立资产分页接口，筛除草稿/预发布/测试渠道，按正式发布时间选最新；解析及最终输出复用 `model.ts` 的 `releaseSchema`。
- `scripts/sync-client-releases.mjs`：默认仅更新页面 `data.ts` 实际导入的 `src/views/clients/releases.json`，使用同目录临时文件后原子替换；不读取或生成基础目录资料。
- 只有配置匹配的已有应用/平台会更新。单平台缺包、格式变化、JSON 错误、API 失败或包的临时访问失败均保留该平台旧版本、旧包和成功核验时间；其他平台与来源继续。
- HEAD 请求不带 GitHub API token、不读取安装包体。连续两次明确 404/410 才确认失效；403、429、5xx、超时及其他不确定状态不删链接。确认失效的项移除并补官方 fallback，其他可用包保留。API 失败时允许独立核验旧直链，但不会刷新成功时间。
- 最多扫描 10 页，每页 100 项；到上限不假装已取得完整结果，而是报告失败并保留旧快照。该上限同样适用于资产列表。
- 本票没有新增定时 CI、Worker、安装包代理或 UI 结构。

## 手动运行

```bash
# 写入实际页面快照（部分失败仍保存其他来源成功结果，退出码为 1）
pnpm clients:sync

# 安全检查：只输出 JSON，不写快照
node scripts/sync-client-releases.mjs --dry-run > /tmp/client-releases-preview.json

# 安全检查：仅写指定临时文件
pnpm clients:sync --output /tmp/client-releases-verified.json
```

Node >=24。可通过进程环境传入 `GITHUB_TOKEN` 提高 API 限额；不写入仓库或前端变量。`--output` 与 `--dry-run` 互斥，显式拒绝将 output 指向人工 `catalog.json`。

## 真实联网结果

实际运行 `pnpm clients:sync --output /tmp/client-releases-verified.json`，检查开始时间 `2026-09-16T09:08:18.543Z`：

- FlClash Android、Mac 以及 v2rayNG Android 成功核验，版本仍分别为 `v0.8.98`、`2.2.6`；共 9 个真实安装包。
- FlClash Windows 和 Linux 安装包出现临时访问失败。本次未进一步断言其具体 HTTP 原因；日志只报告“安装包临时访问失败”。两平台完整保留人工旧快照，未刷新时间。
- 命令产生有效的部分成功 JSON，并以 1 退出，符合失败可见性约定；不能将此真实联网运行描述为全部源成功。
- 使用共享 schema 校验临时输出，并逐条确认只有上述 3 个成功平台变化、其他 22 条快照深比较不变后，将结果写入页面实际读取的 `releases.json`。未把任何失败项转成空值或 fallback。

## 验证

先写测试后实现：首轮因同步模块不存在而失败；实现后新增 10 项同步测试通过，覆盖真实样本匹配、正式版选择、版本隔离、来源/平台失败保留、确认失效回退、HTTP 分类、分页、未配置来源保留和离线 CLI 写入/dry-run。CLI 测试模拟 fetch，不访问外网，并断言生产快照与人工基础文件不变。

最终 `pnpm exec tsc -b`、`pnpm lint`、`pnpm build`、随后 `pnpm test` 均以 0 退出；完整测试 115/115 通过。Lint 仍报告既有 React 与 `.pi/extensions/atw/` 警告，本票文件无 lint 警告。`git diff --check` 通过，`catalog.json` 无差异。UI 布局未变化，不宣称重新做过浏览器视觉验收。

## 双轴审查后的 P2 修复与回归

2026-09-16，标准轴无问题，规格轴两项 P2 均已复现并修复：

1. `testChannel` 增加有字母边界的 `test/testing/dev/development`（允许数字后缀及分隔符），同时用于发布标签、名称与资产过滤。新增测试先确认 `v0.8.99-test` 被旧实现接受，再验证六种渠道变体不能选中或写入；`latest`、`Latest release`、`Developer tools`、`Contest`、`Stable` 不误杀。
2. `index.tsx` 原先仅在当前选项为 direct 时展示选择器。混合 direct+fallback 选到 fallback 后选择器消失，真实浏览器修复前返回 `selectorCount=0, fallbackVisible=true`。现在单个 direct 或多个获取选项均保留选择器；单商店／单官方下载页维持原行为。不改布局、样式或其他交互。

补充同步测试明确覆盖“第一条直链已失效、其他直链有效”：成功更新和 API 503 两条路径都逐项断言剩余包不变、仅补一个 fallback；API 失败时最后成功时间不刷新。此前测试主要覆盖全部包失效，现在不再仅用测试名称宣称部分失效覆盖。

### 真实浏览器矩阵

使用 `playwright-cli` 驱动本机 HeadlessChrome 152，浏览构建后的 `vite preview`（127.0.0.1:4178），非源码字符串断言。临时 Vite 插件仅在构建加载 `releases.json` 时，将 FlClash Android 的第一条包从内存数组移除并追加 fallback，得到“两条直链 + 官方页面”的混合样本。产物输出 `/tmp/client-p2-dist`，从未将这个人工失效场景写入生产 JSON。

| 宽度 | 主题 | 语言 | fallback 后选择器可见并切回直链 | 实际主题类匹配 | 横向溢出 |
| ---- | ---- | ---- | ------------------------------- | -------------- | -------- |
| 390  | 浅色 | 中文 | 通过                            | 通过           | 无       |
| 390  | 浅色 | 英文 | 通过                            | 通过           | 无       |
| 390  | 深色 | 中文 | 通过                            | 通过           | 无       |
| 390  | 深色 | 英文 | 通过                            | 通过           | 无       |
| 1440 | 浅色 | 中文 | 通过                            | 通过           | 无       |
| 1440 | 浅色 | 英文 | 通过                            | 通过           | 无       |
| 1440 | 深色 | 中文 | 通过                            | 通过           | 无       |
| 1440 | 深色 | 英文 | 通过                            | 通过           | 无       |

每组均读取实际 `<html>` 的 `dark` 类，验证三个 option、选中值、控件可见性、获取按钮文案和 href，并检查 Tab 焦点。通过 Tab 从平台选择器到包选择器；用原生 select 首字匹配选择官方页（英文 `o`；中文通过 CDP `Input.dispatchKeyEvent` 发出“官”的字符按键），等待 1100ms 让原生搜索缓冲结束，再按 `a` 切回 Android 安装包，Tab 到获取按钮。中文字符按键走浏览器输入协议，没有修改 DOM 的 value 或合成 change。此环境 HeadlessChrome 的 End/方向键未改变原生下拉值，因此不宣称这些按键已通过；以实际有效的原生首字匹配完成键盘回归。未触发真实安装包下载。

每组保存 fallback 与直链状态截图共 16 张，抽查 390 深色英文 fallback 与 1440 浅色中文直链截图，选择器、按钮、焦点及详情结构正常。移动端是 390px 窄屏浏览器视口，不宣称真实手机触控设备测试。

本轮可复核的临时证据（本机 `/tmp`，未提交）：

- `/tmp/build-client-fallback.mjs`：仅内存注入混合样本的构建脚本。
- `/tmp/client-fallback-browser.js`：八组合真实交互断言脚本，通过 `playwright-cli -s=client-p2 run-code --filename=/tmp/client-fallback-browser.js` 执行。
- `/tmp/client-p2-browser-results.log`：八组结构化结果及实际执行的完整脚本。
- `/tmp/client-p2-{390,1440}-{light,dark}-{zh,en}-{fallback,direct}.png`：16 张截图。
- `/tmp/client-p2-red.log`：新增渠道测试修复前失败证据。

修复后 `pnpm exec tsc -b`、`pnpm lint`、`pnpm build`、随后 `pnpm test` 均退出 0；完整测试 **117/117** 通过。Lint 本次修改文件无警告，保留既有仓库警告。未提交、未启动其他票。
