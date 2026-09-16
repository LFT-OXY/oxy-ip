# 首票验证记录

日期：2026-09-16；范围：`01-initial-catalog`，不是全量任务验收。

## 命令

- 先写 `tests/client-catalog.test.mjs`：首次执行因尚无 `data.ts` 失败，随后实现。
- `pnpm exec tsc -b`：通过。
- `node --import ./tests/register-paths.mjs --test tests/client-catalog.test.mjs tests/i18n.test.mjs`：11/11 通过。
- `pnpm lint`：退出 0；现有旧模块／ATW 扩展警告，未报告本票新模块警告。
- `pnpm build` → `pnpm test`：105/105 通过。Worker 命令仅为 dry-run 本地打包，未部署。

## 浏览器

使用 `playwright-cli` 与 `pnpm preview --host 127.0.0.1` 的构建产物（4173 端口）。Vite dev 单独启动会因项目既有 HMR 指向 8787 出现 WebSocket 错误，所以正式验收改在 preview 运行；不修改无关 HMR 配置。

- 375 / 768 / 1440px × zh-CN / en × light / dark，共 12 组。
- 每组验证 8 张卡片、本地图标加载、列表无横向溢出、进入详情、从 Android 切 Windows、包选项仅属于目标平台、选择第二个包后按钮 URL 正确、详情无溢出、版本信息行确为最后内容。
- 深浅主题读取现有 `theme` 存储键，并实际断言 HTML 的 `dark` 类；检查桌面列表、英文桌面详情及英文深色窄屏截图。
- 搜索、平台、内核、代码状态、价格、排序组合；详情更换下载平台后返回保留列表 URL 全部筛选。
- 通过现有语言菜单切中文再切英文，条件保持。
- 卡片聚焦 Enter 进入详情；Tab 按平台顺序移动；Enter 选择平台；空结果页面聚焦按钮 Space 清除筛选且保留语言。
- Shadowrocket 商店入口、Stash Windows 官网入口及未知版本、未知应用 ID 的返回入口。
- 额外在 320px 英文深色下逐一直接打开全部 25 个应用／平台详情：所选平台、显示版本、首个获取 URL 与数据一致，均无横向溢出。
- preview 页面未产生未捕获的 `pageerror`。

截图与原始日志留于本次会话 `/tmp/oxy-catalog-*`；验证覆盖交互和布局，不替代用户最终视觉验收。未点击实际下载安装包，也未安装客户端。

## 来源和独立审查

- 冻结来源清单的 154 个 ID 无重复，生产首批 8 个 ID、名称和顺序与 `ticket=01` 逐项一致。
- 每个应用取一个代表性官方获取链接执行 `curl -I -L`，8/8 最终 HTTP 200；未下载包体。其余包的地址取自官方发布 API，未逐个发起 HEAD。
- 独立规格轴：0 项问题；独立标准轴：硬违反 0 项、判断建议 0 项。两轴只读审查同一冻结补丁，没有独立重跑构建或浏览器验证。
- `task.py validate` 通过。既有完整基线 38,481 字节超过上下文自动注入 32,768 字节上限；工具检查时读取完整文件，不把截断注入当作全量清单。
