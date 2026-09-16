# 首票官方来源核验

核验日期：2026-09-16。本票只交付 8 项；`catalog-baseline.json` 的 154 项身份、顺序和票据归属保持冻结，不从生产目录反向生成。

## 来源与取舍

参考站 8 个 `/apps/<id>` 详情通过 Jina Reader 读取，与下列官方来源逐项对照。浏览器读取参考站首页并查看截图，确认平台侧栏、应用网格、图标和属性标签布局。未复制其日志、人物、统计或内核历史区块。

| 应用                   | 官方依据                                                                                                                                                                                                                                       | 本次维护                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shadowrocket           | [App Store](https://apps.apple.com/us/app/shadowrocket/id932747118)、[Apple lookup](https://itunes.apple.com/lookup?id=932747118&country=us)                                                                                                   | iOS 2.2.92，2026-09-07T04:14:10Z；商店也明确支持 Mac，但不把 iOS lookup 版本套给 Mac。费用 US$2.99，开发商 Shadow Launch Technology Limited。未知内核留空。                                                        |
| FlClash                | [README](https://github.com/chen08209/FlClash)、[正式发布](https://github.com/chen08209/FlClash/releases/tag/v0.8.98)                                                                                                                          | Android / Windows / Mac / Linux；Mihomo、免费开源；v0.8.98，2026-09-14T03:20:30Z。                                                                                                                                 |
| sing-box               | [仓库](https://github.com/SagerNet/sing-box)、[Apple 官方说明](https://sing-box.sagernet.org/clients/apple/)、[正式发布](https://github.com/SagerNet/sing-box/releases/tag/v1.14.1)                                                            | 六类平台；v1.14.1，2026-09-15T00:06:50Z。Android 选 SFA、桌面选 SFW/SFM/SFL；OpenWrt 选专用 apk/ipk，不能按后缀误归 Android。iOS 仅列正式 SFI deb，并注明 rootless 越狱条件；App Store 更新暂停，不列 TestFlight。 |
| Clash Verge Rev        | [README](https://github.com/clash-verge-rev/clash-verge-rev)、[正式发布](https://github.com/clash-verge-rev/clash-verge-rev/releases/tag/v2.5.2)                                                                                               | Windows / Mac / Linux；Mihomo；v2.5.2，2026-07-19T17:00:26Z。安装包列表取发布资产，不按旧 README 猜架构。开发归属使用维护组织，不把贡献次数推测为个人主导。                                                        |
| v2rayNG                | [README](https://github.com/2dust/v2rayNG)、[正式发布](https://github.com/2dust/v2rayNG/releases/tag/2.2.6)                                                                                                                                    | Android；README 明确 Xray 与 v2fly；2.2.6，2026-07-05T10:17:21Z。收录普通发行 APK，不收签名文件。                                                                                                                  |
| Clash Meta for Android | [README](https://github.com/MetaCubeX/ClashMetaForAndroid)、[正式发布](https://github.com/MetaCubeX/ClashMetaForAndroid/releases/tag/v2.11.34)                                                                                                 | Android / Mihomo；v2.11.34，2026-09-14T13:24:09Z。开发归属 MetaCubeX。                                                                                                                                             |
| Stash                  | [官方下载](https://stash.ws/download)、[Mac 价格](https://stash.ws/zh/macos/pricing)、[App Store](https://apps.apple.com/us/app/stash-rule-based-proxy/id1596063349)、[Apple lookup](https://itunes.apple.com/lookup?id=1596063349&country=us) | iOS 3.4.1，2026-07-16T17:06:42Z，US$5.99；Mac 官方获取页及完整 £12/年、£18/年、£48 买断方案。Android / Windows 官方明确 early access/build，仅给官方说明入口并标明早期状态，不录测试版本或包。未知内核留空。       |
| Bettbox                | [README](https://github.com/appshubcc/Bettbox)、[正式发布](https://github.com/appshubcc/Bettbox/releases/tag/v1.19.1)                                                                                                                          | Android / Windows / Mac / Linux；Mihomo；v1.19.1，2026-09-09T15:56:57Z。保留 compatible 安装包原始架构限定。鸿蒙说明依赖卓易通，不冒充原生 HarmonyOS 安装包。                                                      |

GitHub 使用 `gh api repos/<owner>/<repo>/readme` 与 `releases/latest` 读取原文，六个发布均检查 `draft=false`、`prerelease=false`。直链逐项来自返回的 `assets[].browser_download_url`，没有拼造地址；版本与发布时间均来自同一 release。Apple 商店页面与 lookup 核对版本、卖方、价格；Mac 资料不以 iOS 时间填充。

图标为参考站详情中的应用图标快照，保存于 `public/client-icons/`，不在浏览时请求参考站。来源均为 `https://huarun.win/app-icons/<id>.webp`，FlClash 例外为 `flclash-20260912-v1.webp`。图标用于识别第三方应用，不代表本站拥有商标或成为其官方下载站。

## 本票数据边界

- `catalog.json`：人工维护名称、别名、简介、图标、平台、内核、代码状态、费用、开发者及依据。
- `releases.json`：25 条应用／平台快照，142 个获取选项。所有条目标记 `maintenance=manual`，未填 `lastCheckedAt`；本票的人工收录不是已实现的自动同步。
- 原始读取中无法可靠确认的版本／发布时间不填。所有动态来源为官方；参考站不进入下载链路。
- PRD 的平台分类限定九种，Apple TV / Vision 等商店兼容设备不另建新分类；现有 iPhone / iPad、Mac 分类保留各自真实获取方式。
- 02、03 票接入官方自动更新；10 票才调度和发布。当前没有新增 Worker、代理下载、定时任务或生产部署。
