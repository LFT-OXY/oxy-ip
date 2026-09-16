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
  {
    appId: "karing",
    repo: "KaringX/karing",
    platforms: {
      android: /^karing_{version}_android_(arm|arm64-v8a|armeabi-v7a)\.(apk)$/,
      windows: /^karing_{version}_windows_(x64)\.(exe|zip)$/,
      macos: /^karing_{version}_macos_(universal)\.(dmg|pkg)$/,
      linux: /^karing_{version}_linux_(amd64)\.(AppImage|deb|rpm)$/,
    },
  },
  {
    appId: "hiddify",
    repo: "hiddify/hiddify-app",
    architectures: { macos: "universal" },
    platforms: {
      android: /^Hiddify-Android-(arm64|arm7|universal|x86_64)\.(apk)$/,
      windows: /^Hiddify-Windows-(?:Portable-|Setup-)?(x64)\.(zip|exe|msix)$/,
      macos: /^Hiddify-MacOS(?:-Installer)?()\.(dmg|pkg)$/,
      linux:
        /^Hiddify-(?:Debian|Linux)-(x64)(?:-AppImage)?\.(deb|AppImage|tar\.gz)$/,
    },
  },
  {
    appId: "exclave",
    repo: "ExclaveNetwork/Exclave",
    platforms: {
      android:
        /^Exclave-{version}-(?:legacy-)?(arm64-v8a|armeabi-v7a|x86|x86_64)\.(apk)$/,
    },
  },
  {
    appId: "nekobox-for-android",
    repo: "MatsuriDayo/NekoBoxForAndroid",
    platforms: {
      android: /^NekoBox-{version}-(arm64-v8a|armeabi-v7a|x86|x86_64)\.(apk)$/,
    },
  },
  {
    appId: "husi",
    repo: "xchacha20-poly1305/husi",
    platforms: {
      android: /^husi-{version}-(arm64-v8a|armeabi-v7a|x86|x86_64)\.(apk)$/,
      windows:
        /^fr\.husi-{version}-windows-(amd64)(?:-jbr)?(?:-installer)?\.(exe|zip)$/,
      macos: /^fr\.husi-{version}-(arm64)\.(dmg)$/,
      linux:
        /^fr\.husi[-_]{version}(?=[-_.](?:linux-|1[-.])?(aarch64|x86_64|amd64|arm64)\.)(?:-linux-(?:aarch64|x86_64|amd64|arm64)|_(?:amd64|arm64)|-1[.-](?:aarch64|x86_64))\.(AppImage|tar\.zst|deb|rpm|pkg\.tar\.zst)$/,
    },
  },
  {
    appId: "yumebox",
    repo: "YumeYucca/YumeBox",
    architectures: { android: "arm64-v8a" },
    platforms: {
      android: /^YumeBox-(?:builtin|external)-{version}()\.(apk)$/,
    },
  },
  {
    appId: "shadowsocks-android",
    repo: "shadowsocks/shadowsocks-android",
    platforms: {
      android: /^shadowsocks-(?:tv)?-(universal)-{version}\.(apk)$/,
    },
  },
  {
    appId: "onexray",
    repo: "OneXray/OneXray",
    platforms: {
      android: /^OneXray-android-(universal)\.(apk)$/,
      windows: /^OneXray-windows-(amd64|arm64)\.(exe|zip)$/,
      macos: /^OneXray-macos-(universal)\.(zip)$/,
      linux: /^OneXray-linux-(x86_64|aarch64)\.(deb|zip)$/,
    },
  },
  {
    appId: "ssrvpn",
    repo: "Elegying/SSRVPN",
    architectures: { android: "arm64-v8a", windows: "x64", macos: "arm64" },
    platforms: {
      android: /^SSRVPN()\.(apk)$/,
      windows: /^SSRVPN_Setup()\.(exe)$/,
      macos: /^SSRVPN()\.(dmg)$/,
    },
  },
  {
    appId: "singcast",
    repo: "mapleafgo/singcast",
    platforms: {
      android: /^singcast-{version}-android-(arm64|x64)\.(apk)$/,
      windows:
        /^singcast-{version}-windows-(amd64|arm64)(?:-portable)?\.(exe|zip)$/,
      macos: /^singcast-{version}-macos-(amd64|arm64)\.(dmg)$/,
      linux:
        /^singcast-{version}-linux-(amd64|arm64)(?:-portable)?\.(AppImage|deb|rpm|zip)$/,
    },
  },
  {
    appId: "clash-nyanpasu",
    repo: "libnyanpasu/clash-nyanpasu",
    platforms: {
      windows:
        /^Clash\.Nyanpasu_{version}_(x64)(?:-setup|_portable)\.(exe|zip)$/,
      macos: /^Clash\.Nyanpasu_{version}_(aarch64|x64)\.(dmg)$/,
      linux:
        /^clash-nyanpasu[-_]{version}(?=(?:_|-1\.)(amd64|x86_64)\.)(?:_amd64|-1\.x86_64)\.(deb|AppImage|rpm)$/,
    },
  },
  {
    appId: "clash-party",
    repo: "mihomo-party-org/clash-party",
    platforms: {
      windows:
        /^clash-party-(?:windows|win7)-{version}-(arm64|ia32|x64)-(?:portable|setup)\.(7z|exe)$/,
      macos: /^clash-party-(?:macos|catalina)-{version}-(arm64|x64)\.(pkg)$/,
      linux:
        /^clash-party-linux-{version}-(aarch64|amd64|arm64|x64|x86_64)\.(pkg\.tar\.zst|rpm|deb)$/,
    },
  },
  {
    appId: "gui-for-clash",
    repo: "GUI-for-Cores/GUI.for.Clash",
    platforms: {
      windows: /^GUI\.for\.Clash-windows-(386|amd64|arm64)\.(zip)$/,
      macos: /^GUI\.for\.Clash-darwin-(amd64|arm64)\.(zip)$/,
      linux: /^GUI\.for\.Clash-linux-(amd64|arm64)\.(zip)$/,
    },
  },
  {
    appId: "sparkle",
    repo: "xishang0128/sparkle",
    platforms: {
      windows:
        /^sparkle-windows-{version}-(arm64|x64)-(?:portable|setup)\.(7z|exe)$/,
      macos: /^sparkle-macos-{version}-(arm64|x64)\.(pkg)$/,
      linux:
        /^sparkle-linux-{version}-(aarch64|amd64|arm64|loong64|loongarch64|x64|x86_64)\.(pkg\.tar\.zst|rpm|deb)$/,
    },
  },
  {
    appId: "v2rayn",
    repo: "2dust/v2rayN",
    platforms: {
      windows: /^v2rayN-windows-(64|86|arm64)(?:-desktop)?\.(zip)$/,
      macos: /^v2rayN-macos-(64|arm64)\.(dmg|zip)$/,
      linux:
        /^v2rayN-linux-(?:rhel-)?(64|arm64|loong64|riscv64)\.(deb|rpm|zip)$/,
    },
  },
  {
    appId: "anyportal",
    repo: "AnyPortal/AnyPortal",
    architectures: { windows: "x64", macos: "universal", linux: "x64" },
    platforms: {
      android:
        /^anyportal-android-(?:api28|apilatest)-(arm64-v8a|armeabi-v7a|x86_64)\.(apk)$/,
      windows: /^anyportal-windows(?:-setup)?()\.(exe|zip)$/,
      macos: /^anyportal-macos()\.(dmg)$/,
      linux: /^anyportal-linux()\.(zip)$/,
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
  {
    appId: "surge",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1442620678,
    bundleId: "com.nssurge.inc.surge-ios",
    country: "us",
  },
  {
    appId: "quantumult-x",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1443988620,
    bundleId: "com.crossutility.quantumult-x",
    country: "us",
  },
  {
    appId: "loon",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1373567447,
    bundleId: "com.ruikq.decar",
    country: "us",
  },
  {
    appId: "clash-by-hako",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6794257189,
    bundleId: "com.hako.network",
    country: "us",
  },
  {
    appId: "karing",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6472431552,
    bundleId: "com.nebula.karing",
    country: "us",
  },
  {
    appId: "pharos-pro",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1456610173,
    bundleId: "com.pharospro.kuaizhu",
    country: "us",
  },
  {
    appId: "hiddify",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6596777532,
    bundleId: "apple.hiddify.com",
    country: "us",
  },
  {
    appId: "egern",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1616105820,
    bundleId: "com.bytecrossing.Egern",
    country: "us",
  },
  {
    appId: "onexray",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6745748773,
    bundleId: "net.yuandev.onexray",
    country: "us",
  },
  {
    appId: "streisand",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6450534064,
    bundleId: "com.effect.streisand",
    country: "us",
  },
];
