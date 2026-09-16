// 规则仅覆盖已核验的官方命名；新命名不猜测平台或架构。
export const githubSources = [
  {
    appId: "flclash",
    repo: "chen08209/FlClash",
    platforms: {
      android:
        /^FlClash-{version}-android-(arm64-v8a|armeabi-v7a|x86_64)\.(apk)$/,
      windows:
        /^FlClash-{version}-windows-(amd64|arm64)(?:-setup)?\.(exe|zip)$/,
      macos: /^FlClash-{version}-macos-(amd64|arm64)\.(dmg)$/,
      linux: /^FlClash-{version}-linux-(amd64|arm64)\.(AppImage|deb|rpm)$/,
    },
  },
  {
    appId: "v2rayng",
    repo: "2dust/v2rayNG",
    platforms: {
      android:
        /^v2rayNG_{version}_(arm64-v8a|armeabi-v7a|x86|x86_64|universal)\.(apk)$/,
    },
  },
];

// 每个来源只核验明确的平台；iOS lookup 不代表 Mac 版本。
export const officialSources = [
  {
    appId: "shadowrocket",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 932747118,
    bundleId: "com.liguangming.Shadowrocket",
    country: "us",
  },
  {
    appId: "stash",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1596063349,
    bundleId: "ws.stash.app",
    country: "us",
  },
  {
    appId: "stash",
    kind: "stash-macos",
    platforms: { macos: true },
    url: "https://mac-release.stash.ws/appcast.xml",
    fallback: "https://stash.ws/download",
  },
];
