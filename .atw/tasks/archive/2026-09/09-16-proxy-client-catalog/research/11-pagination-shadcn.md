# 第 11 票：分页与 shadcn/ui 统一

## 边界与来源

固定基点 `7e56c22`。仅客户端列表、详情、其分页模型和测试，新增三份共享 UI 组件；不修改 catalog/releases、同步器、部署链或其他页面。

`components.json` 为 `radix-nova`；通过项目已有 `pnpm exec shadcn view select pagination breadcrumb` 读取官方注册表源码（临时原件 `/tmp/oxy-client-shadcn.json`），替换 IconPlaceholder 为已有 lucide 图标和本地 import，按既有 t() 机制翻译可见默认文案。未安装依赖、未改变现有共享组件默认值。Select 组合同时核对 Context7 官方 Radix 文档 `apps/v4/content/docs/components/radix/select.mdx`。

## 实现与回归

- model 增加固定24项分页及页码／筛选参数变换；UI 在筛选排序后切片，越界 URL 用 replace 规范化，翻页 push。详情返回仍仅删除 target。
- 六处选择器通过同一个 SelectField 组合 Select/Label；全部值使用内部非空标记，非法筛选显示无匹配。卡片、状态／计数标签、平台按钮、空态、提示和面包屑改用现有或新增 shadcn/ui 组件。删除原生 select 和对应自制控件 CSS。
- 分页测试先红：新增 API 尚不存在时导入失败；实现后4项通过。
- 首次完整测试暴露新测试读取 `.atw/tasks` 基线，在发布升级副本缺失；改用已存在的 `tests/fixtures/client-releases/batch-6/catalog-baseline.json`，没有修改升级启动器或降低断言。

## 验证结果

- `pnpm build` 后 `pnpm test`：198/198 通过、无失败／跳过，包含原目录／同步与隔离升级副本完整套件。日志 `/tmp/catalog-11/{build,test}.log`。
- `pnpm lint` 退出0；已有其他文件警告，本次文件没有新增警告。日志 `/tmp/catalog-11/lint.log`。
- `11-evidence/matrix.js`：实际 Chromium + 构建预览，390/768/1440 × zh/en × light/dark 全12组；断言 HTML 实际 dark 类、24项、末页10项、154总数和145–154范围、无可见原生select、视口无横溢出、弹层边界、Enter/Space打开、Escape焦点返回、选项选择、End键排序／包选择和Tab到下载入口、详情返回保留页码及平台。
- `11-evidence/behavior.js`：逐页收集154唯一身份并另与独立基线完整顺序对比；上一页键盘Enter、后退／前进／刷新、详情刷新返回；搜索／平台／内核／代码／价格／排序重置；非法、越界与空态；FlClash平台和下载URL隔离、Stash store/page入口；390/1440实际深浅主题下 dae 混合直链/官方页键盘切回、Clash .NET历史无按钮。
- 原始矩阵截图共60张，位于 `/tmp/catalog-11/`；已查看各场景拼图及代表原图。最初截图捕获100ms动画中间帧，随后等待展开稳定并禁用截图动画重拍，未把瞬时半透明判为最终主题。保留7张代表性 WebP 至 `11-evidence/`，覆盖列表、分页、展开态、长包名和历史详情。
- 浏览器脚本最初因Radix异步焦点／React提交时序出现抢跑断言，已改为等待实际焦点／页码内容，最终全部通过；未修改产品逻辑掩盖断言。

浏览器证据是本地构建预览，不代表生产部署或人工最终验收；未执行线上同步或发布。

## 第一轮审查处置与补充验证

冻结补丁 `/tmp/catalog-11/review.patch`，SHA256 `7ca3493605ffcb8c53d81555125201534258f11e3f32c52aa158c91a89b9a8b2`。规格轴未发现问题；规范轴报告两项验证硬缺口，均接受并修复，原文已转报用户：

1. 安装包 End／混合入口 Home 仍有固定100ms等待，未按17.6节等待具体目标焦点；YumeBox场景未断言切包结果。改为等待 `document.activeElement` 与首／末 `role=option` 元素身份相同，再 Enter，核对触发器完整标签和确切下载 URL（builtin → external；fallback → 初始直链）。Radix option 本身不必带 id，因此不用空 id 作为焦点证明。
2. 混合入口仅有英文，缺8.6节要求的中文。补齐390/1440 × zh/en × light/dark共8组，逐组断言 HTML 实际 dark 类，保留长包与混合入口展开态截图。

修订后实际重新运行：矩阵12组、混合场景8组全部通过，结果更新在 `11-evidence/*-result.json`，运行日志 `/tmp/catalog-11/{matrix,behavior}-r2.log`。此次只补测试证据，没有修改产品代码或放宽规范。

重放浏览器脚本（先运行构建预览及 `playwright-cli -s=catalog11 open http://127.0.0.1:4173/clients/`）：

```bash
# run-code 接收函数表达式；去掉 Prettier 在 JS 文件末尾补的语句分号。
sed '$s/;$//' .atw/tasks/09-16-proxy-client-catalog/research/11-evidence/matrix.js > /tmp/catalog-11/matrix-run.js
playwright-cli -s=catalog11 run-code --filename=/tmp/catalog-11/matrix-run.js
# behavior.js 同样处理后执行。
```

补齐验证后的最终门禁：再次先 `pnpm build` 后 `pnpm test`，198/198通过；lint退出0，改动文件格式与diff空白检查通过。日志 `/tmp/catalog-11/{build,test,lint}-r2.log`。新增三张中英文混合入口及中文历史详情截图已实际读取核对。
