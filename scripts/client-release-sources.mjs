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
  {
    appId: "clashx-meta",
    repo: "MetaCubeX/ClashX.Meta",
    architectures: { macos: "universal" },
    platforms: { macos: /^ClashX\.Meta()\.(zip)$/ },
  },
  {
    appId: "v2rayu",
    repo: "yanue/V2rayU",
    // v5.2.0 构建脚本将同一通用应用打包为两个历史文件名。
    architectureAliases: { 64: "universal", arm64: "universal" },
    platforms: { macos: /^V2rayU-(64|arm64)\.(dmg)$/ },
  },
  {
    appId: "surfboard",
    repo: "getsurfboard/surfboard",
    releaseTag: /^mobile-\d+(?:\.\d+)+$/,
    platforms: {
      android:
        /^mobile-(arm64-v8a|armeabi-v7a|universal|x86|x86_64)-release\.(apk)$/,
    },
  },
  {
    appId: "xray-gui",
    repo: "SaeedDev94/Xray",
    // 官方 README：versionCode 的末位 1–4 分别对应四种 CPU 架构。
    architectureAliases: {
      1: "armeabi-v7a",
      2: "arm64-v8a",
      3: "x86",
      4: "x86_64",
    },
    platforms: { android: /^Xray-v{version}-\d+([1-4])\.(apk)$/ },
  },
  {
    appId: "clash-mi",
    repo: "KaringX/clashmi",
    platforms: {
      android: /^clashmi_{version}_android_(arm|arm64-v8a|armeabi-v7a)\.(apk)$/,
      windows: /^clashmi_{version}_windows_(x64)\.(exe|zip)$/,
      macos: /^clashmi_{version}_macos_(universal)\.(dmg)$/,
      linux: /^clashmi_{version}_linux_(amd64)\.(AppImage|deb|rpm)$/,
    },
  },
  {
    appId: "flclashx",
    repo: "pluralplay/FlClashX",
    platforms: {
      android:
        /^FlClashX-android-(arm64-v8a|armeabi-v7a|universal|x86_64)\.(apk)$/,
      windows: /^FlClashX-windows-(amd64|arm64)(?:-setup)?\.(exe|zip)$/,
      macos: /^FlClashX-macos-(amd64|arm64)\.(dmg)$/,
      linux: /^FlClashX-linux-(amd64|arm64)\.(AppImage|deb|rpm)$/,
    },
  },
  {
    appId: "mikubox-for-android",
    repo: "HatsuneMikuUwU/MikuBoxForAndroid",
    releaseTag: /^1\.4\.3-UwU-2$/,
    platforms: {
      android:
        /^MikuBox-1\.4\.3-UwU-(arm64-v8a|armeabi-v7a|x86|x86_64)\.(apk)$/,
    },
  },
  {
    appId: "kunbox",
    repo: "roseforljh/KunBox",
    platforms: { android: /^app-(arm64-v8a|armeabi-v7a)-release\.(apk)$/ },
  },
  {
    appId: "nekobox-by-starifly",
    repo: "starifly/NekoBoxForAndroid",
    platforms: {
      android: /^NekoBoxF-{version}-(arm64-v8a|armeabi-v7a|x86|x86_64)\.(apk)$/,
    },
  },
  {
    appId: "happ-proxy",
    repo: "Happ-proxy/happ-android",
    architectures: { android: "universal" },
    platforms: { android: /^Happ()\.(apk)$/ },
  },
  {
    appId: "happ-proxy",
    repo: "Happ-proxy/happ-desktop",
    platforms: {
      windows: /^setup-Happ\.(arm64|x64)\.(exe)$/,
      macos: /^Happ\.macOS\.(universal)\.(dmg)$/,
      linux: /^Happ\.linux\.(arm64|x64)\.(deb|rpm|pkg\.tar\.zst)$/,
    },
  },
  {
    appId: "clash-xiaoy",
    repo: "aimy1/clash-xiaoy",
    platforms: {
      windows:
        /^clash-xiaoy_{version}_(x64|x86_64)(?:-setup|_portable)\.(exe|zip)$/,
      macos: /^clash-xiaoy_{version}_(aarch64|x64)\.(dmg)$/,
      linux:
        /^clash-xiaoy[-_]{version}(?=(?:_|-1\.)(amd64|x86_64)\.)(?:_amd64|-1\.x86_64)\.(deb|AppImage|rpm)$/,
    },
  },
  {
    appId: "monadbox",
    repo: "MonadBoxLab/MonadBox",
    releaseTag: /^meta-v\d+(?:\.\d+)+-[a-f0-9]+$/,
    platforms: {
      android:
        /^monadbox-meta-MonadBox-(arm64-v8a|armeabi-v7a|universal|x86|x86_64)-release\.(apk)$/,
    },
  },
  {
    appId: "vproxy",
    repo: "5VNetwork/VX",
    architectures: { windows: "x64" },
    platforms: {
      android: /^vx-(arm64-v8a|universal)\.(apk|apk\.zip)$/,
      windows: /^VXInstaller()\.(exe)$/,
      linux: /^vx-(arm64|x64)\.(deb|rpm)$/,
    },
  },
  {
    appId: "flyclash",
    repo: "GtxFury/FlyClash",
    platforms: {
      windows: /^FlyClash-{version}-(x64)-setup\.(exe|7z)$/,
      macos: /^FlyClash-{version}-(arm64|x64)\.(dmg)$/,
    },
  },
  {
    appId: "sudodroid",
    repo: "SUDOKU-ASCII/sudoku-android",
    platforms: {
      android:
        /^sudodroid-v{version}-(arm64-v8a|armeabi-v7a|universal)\.(apk)$/,
    },
  },
  {
    appId: "box-for-root",
    repo: "taamarin/box_for_magisk",
    architectures: { android: "noarch" },
    platforms: { android: /^box_for_root-v{version}()\.(zip)$/ },
  },
  {
    appId: "surfing",
    repo: "GitMetaio/Surfing",
    architectures: { android: "arm64-v8a" },
    platforms: { android: /^Surfing_v{version}_release()\.(zip)$/ },
  },
  {
    appId: "box4magisk",
    repo: "CHIZI-0618/box4magisk",
    architectures: { android: "noarch" },
    platforms: { android: /^box4_v{version}()\.(zip)$/ },
  },
  {
    appId: "box-for-android",
    repo: "boxproxy/box",
    architectures: { android: "noarch" },
    platforms: { android: /^box-{version}()\.(zip)$/ },
  },
  {
    appId: "akashaproxy",
    repo: "akashaProxy/akashaProxy",
    releaseTag: /^\d{8}-[a-f0-9]{7}$/,
    architectures: { android: "arm64-v8a" },
    platforms: { android: /^akashaProxy-{version}()\.(zip)$/ },
  },
  {
    appId: "sing-box-for-apple",
    repo: "Elziy/sing-box-for-apple",
    architectures: { ios: "arm64" },
    platforms: { ios: /^sing-box()\.(tipa)$/ },
  },
  {
    appId: "gui-for-singbox",
    repo: "GUI-for-Cores/GUI.for.SingBox",
    platforms: {
      windows: /^GUI\.for\.SingBox-windows-(386|amd64|arm64)\.(zip)$/,
      macos: /^GUI\.for\.SingBox-darwin-(amd64|arm64)\.(zip)$/,
      linux: /^GUI\.for\.SingBox-linux-(amd64|arm64)\.(zip)$/,
    },
  },
  {
    appId: "clashmac",
    repo: "666OS/ClashMac",
    architectures: { macos: "universal" },
    platforms: { macos: /^ClashMac-{version}()\.(dmg|zip)$/ },
  },
  {
    appId: "throne",
    repo: "throneproj/Throne",
    architectureAliases: {
      32: "x86",
      64: "x64",
      arm64: "arm64",
      universal: "universal",
      amd64: "amd64",
    },
    platforms: {
      windows:
        /^Throne-{version}-windows(?:legacy)?-?(32|64|arm64|universal)(?:-installer)?\.(zip|exe)$/,
      macos: /^Throne-{version}-macos(?:legacy)?-(amd64|arm64)\.(zip)$/,
      linux:
        /^Throne-{version}-(?:debian|linux)-(amd64|arm64)(?:-system-qt)?\.(deb|zip)$/,
    },
  },
  {
    appId: "flowz",
    repo: "dododook/FlowZ",
    platforms: {
      windows: /^FlowZ-{version}-win-(x64)-(?:portable|setup)\.(exe)$/,
      macos: /^FlowZ-{version}-mac-(arm64|x64)\.(dmg)$/,
      linux: /^FlowZ-{version}-linux-(amd64|x86_64)\.(deb|AppImage)$/,
    },
  },
  {
    appId: "polaris",
    repo: "polaris-arch/Polaris",
    // v1.0.0 打包工作流的 Windows 便携版与安装器均来自 x86_64 构建。
    architectures: { windows: "x64" },
    platforms: {
      windows:
        /^(?=Polaris_.*_x64-win-setup\.exe$|polaris-portable-v.*\.zip$)(?:Polaris_|polaris-portable-v){version}(?:_(x64)-win-setup)?\.(exe|zip)$/,
      macos: /^Polaris_{version}_(aarch64|x64)-mac-(?:arm64|x64)\.(dmg)$/,
      linux: /^Polaris_{version}_(amd64)\.(AppImage|deb)$/,
    },
  },
  {
    appId: "onebox",
    repo: "OneOhCloud/OneBox",
    platforms: {
      windows: /^OneBox_{version}_(x64)(?:-setup|_en-US)\.(exe|msi)$/,
      macos: /^OneBox_{version}_(aarch64|x64)\.(dmg)$/,
      // 官方只声明 Ubuntu 稳定；其他 Linux 为 beta 质量，排除 RPM。
      linux: /^OneBox_{version}_(amd64)\.(deb)$/,
    },
  },
  {
    appId: "interstellar",
    repo: "zn0wii/interstellar-proxy",
    platforms: {
      android:
        /^interstellar-(arm64-v8a|armeabi-v7a|universal|x86|x86_64)-v{version}\.(apk)$/,
    },
  },
  {
    appId: "satelite",
    repo: "zn0wii/satelite-proxy",
    platforms: {
      windows: /^Satelite_{version}_(x64)(?:-setup|_portable)\.(exe|zip)$/,
      macos: /^Satelite_{version}_(aarch64|x64)\.(dmg)$/,
      linux: /^Satelite_{version}_(amd64)\.(AppImage)$/,
    },
  },
  {
    appId: "clashbar",
    repo: "Sitoi/ClashBar",
    architectureAliases: { "apple-silicon": "arm64", intel: "x64" },
    platforms: {
      macos: /^ClashBar-{version}-(apple-silicon|intel)(?:-no-core)?\.(dmg)$/,
    },
  },
  {
    appId: "kumoapp",
    repo: "ProjectKumo/KumoApp",
    platforms: { macos: /^Kumo-macos-{version}-(amd64|arm64)\.(dmg)$/ },
  },
  {
    appId: "singboard-for-mac",
    repo: "okunvei/singboard_for_mac",
    releaseTag: /^build-\d{8}-\d{6}-[a-f0-9]{7}$/,
    platforms: {
      macos:
        /^Singboard-macos-(arm64|x86_64)-build-[a-f0-9]{7}-\d{8}-\d{6}\.(zip)$/,
    },
  },
  {
    appId: "irbox",
    repo: "frank-vpl/IRBox",
    platforms: {
      windows: /^IRBox_{version}_(arm64|x64)(?:-setup|_en-US)\.(exe|msi)$/,
      macos: /^IRBox_{version}_(aarch64|x64)\.(dmg)$/,
      linux:
        /^IRBox[-_]{version}(?=(?:_|-1\.)(amd64|x86_64)\.)(?:_amd64|-1\.x86_64)\.(deb|AppImage|rpm)$/,
    },
  },
  {
    appId: "netch",
    repo: "netchx/netch",
    // 当前主分支正准备 2.0；1.x 的核心与架构依据不得套用未来代际。
    releaseTag: /^1\.9\.7$/,
    architectures: { windows: "x64" },
    platforms: { windows: /^Netch()\.(7z)$/ },
  },
  {
    appId: "stelliberty",
    repo: "Kindness-Kismet/stelliberty",
    platforms: {
      windows: /^stelliberty-v{version}-win-(arm64|x64)(?:-setup)?\.(exe|zip)$/,
      macos: /^stelliberty-v{version}-macos-(arm64|x64)\.(dmg|pkg)$/,
      linux:
        /^stelliberty-v{version}-linux-(arm64|x64)\.(AppImage|deb|pkg\.tar\.zst|rpm|zip)$/,
    },
  },
  {
    appId: "carton",
    repo: "821869798/carton",
    platforms: {
      windows:
        /^carton-{version}-win-(arm64|x64)-(?:portable|Setup)\.(zip|exe)$/,
      linux:
        /^carton-{version}-linux-(arm64|x64)(?:-portable)?\.(tar\.gz|AppImage)$/,
    },
  },
  {
    appId: "pandora-box",
    repo: "snakem982/Pandora-Box",
    platforms: {
      windows:
        /^Pandora-Box-v{version}-windows-(amd64|arm64)(?:-app)?\.(zip|msi)$/,
      macos: /^Pandora-Box-v{version}-macos-(amd64|arm64)\.(dmg)$/,
      linux: /^Pandora-Box-v{version}-linux-(amd64|arm64)\.(deb|rpm)$/,
    },
  },
  {
    appId: "clashtui",
    repo: "JohanChane/clashtui",
    platforms: {
      windows: /^clashtui-windows-(amd64|arm64)-v{version}\.(zip)$/,
      macos: /^clashtui-darwin-(amd64|arm64)-v{version}\.(gz)$/,
      linux: /^clashtui-linux-(amd64|arm64)-v{version}\.(gz)$/,
    },
  },
  {
    appId: "sing-box-windows",
    repo: "xinggaoya/sing-box-windows",
    architectures: { windows: "x64" },
    platforms: {
      windows:
        /^sing-box-windows(?=(?:_\d+\.\d+\.\d+_|-)(arm64|x64)|-portable\.zip$)(?:_{version}_(?:arm64|x64)(?:-setup|_en-US)|(?:-arm64)?-portable)\.(exe|msi|zip)$/,
      macos:
        /^sing-box-windows_{version}_(aarch64|x64)-macos-(?:arm64|intel)\.(dmg)$/,
      linux:
        /^sing-box-windows[-_]{version}(?=(?:_|-1\.)(amd64|x86_64)\.)(?:_amd64|-1\.x86_64)\.(deb|AppImage|rpm)$/,
    },
  },
  {
    appId: "nekobox-for-pc",
    repo: "qr243vbi/nekobox",
    architectureAliases: {
      32: "x86",
      64: "x64",
      arm64: "arm64",
      amd64: "amd64",
      386: "386",
      arm: "arm",
      aarch64: "aarch64",
      x86_64: "x86_64",
      i686: "i686",
      armhf: "armhf",
    },
    platforms: {
      windows:
        /^nekobox-{version}-windows-?(32|64|arm64)(?:-installer)?\.(exe|zip)$/,
      linux:
        /^nekobox-{version}-(?:linux-)?(arm64|amd64|386|arm|aarch64|x86_64|i686|armhf)(?:-linux)?\.(tar\.gz|AppImage)$/,
    },
  },
  {
    appId: "xrayui",
    repo: "PhoenixNil/XrayUI-dev",
    platforms: { windows: /^XrayUI-win-(arm64|x64)(?:-wasdk)?\.(zip)$/ },
  },
  {
    appId: "swell-proxy",
    repo: "yaog6700-bit/Swell-Proxy",
    platforms: { windows: /^Swell-win-(arm64|x64)\.(zip)$/ },
  },
  {
    appId: "nekoray",
    repo: "MatsuriDayo/nekoray",
    releaseTag: /^4\.0\.1$/,
    architectureAliases: { 64: "x64", x64: "x64" },
    platforms: {
      windows: /^nekoray-{version}-\d{4}-\d{2}-\d{2}-windows(64)\.(zip)$/,
      linux:
        /^nekoray-{version}-\d{4}-\d{2}-\d{2}-(?:debian-|linux-?)(x64|64)\.(deb|AppImage|zip)$/,
    },
  },
  {
    appId: "sudoku-desktop",
    repo: "SUDOKU-ASCII/sudoku-desktop",
    platforms: {
      windows: /^sudoku4x4_v{version}_windows-(amd64)\.(exe)$/,
      macos: /^sudoku4x4_v{version}_darwin-(amd64|arm64)\.(dmg)$/,
      linux: /^sudoku4x4_v{version}_linux-(amd64|arm64)\.(tar\.gz)$/,
    },
  },
  {
    appId: "v2raya",
    repo: "v2rayA/v2rayA",
    platforms: {
      windows: /^installer_windows_inno_(arm64|x64)_{version}\.(exe)$/,
      linux:
        /^installer_(?:archlinux|debian|redhat)_(arm64|armv7|loongarch64|riscv64|x64|x86|mips32le|mips32|mips64le|mips64)_{version}\.(pkg\.tar\.zst|deb|rpm)$/,
    },
  },
  {
    appId: "dae",
    repo: "daeuniverse/dae",
    platforms: {
      linux:
        /^dae-linux-(arm64|armv5|armv6|armv7|loongarch64|mips32|mips32le|mips64|mips64le|powerpc64|powerpc64le|riscv64|s390x|x86_32|x86_64|x86_64_v2_sse|x86_64_v3_avx2)\.(deb|pkg\.tar\.zst|rpm|tar\.xz|zip)$/,
    },
  },
  {
    appId: "daed",
    repo: "daeuniverse/daed",
    releaseTag: /^v\d+\.\d+\.\d+$/,
    platforms: {
      linux:
        /^(?:installer-)?daed-linux-(arm64|mips32|mips32le|mips64|mips64le|riscv64|x86_32|x86_64|x86_64_v2_sse|x86_64_v3_avx2)\.(zip|deb|pkg\.tar\.zst|rpm)$/,
    },
  },
  {
    appId: "nekobox-for-harmony",
    repo: "xiaoli8571/NekoBox4Harmony",
    architectures: { harmonyos: "arm64-v8a" },
    platforms: { harmonyos: /^NekoBox-{version}-unsigned()\.(hap)$/ },
  },
  {
    appId: "ownbox",
    repo: "Own716/OwnBoxForAndroid",
    platforms: {
      android:
        /^OwnBox-{version}-(arm64-v8a|armeabi-v7a|x86|x86_64)-release\.(apk)$/,
    },
  },
  {
    appId: "openclash",
    repo: "vernesong/OpenClash",
    architectures: { openwrt: "noarch" },
    platforms: {
      openwrt: /^luci-app-openclash[-_]{version}(?:_all)?()\.(apk|ipk)$/,
    },
  },
  {
    appId: "passwall",
    repo: "Openwrt-Passwall/openwrt-passwall",
    architectures: { openwrt: "noarch" },
    platforms: {
      openwrt:
        /^(?:22\.03-|23\.05-24\.10|25\.12\+)_luci-app-passwall[-_]\d+\.\d+\.\d+(?:-r\d+)?(?:_all)?()\.(apk|ipk)$/,
    },
  },
  {
    appId: "passwall2",
    repo: "Openwrt-Passwall/openwrt-passwall2",
    architectures: { openwrt: "noarch" },
    platforms: {
      openwrt:
        /^luci-app-passwall2[-_]\d+\.\d+\.\d+-r\d+(?:_all)?()\.(apk|ipk)$/,
    },
  },
  {
    appId: "momo",
    repo: "nikkinikki-org/OpenWrt-momo",
    platforms: {
      openwrt:
        /^momo_(aarch64_cortex-a53|aarch64_cortex-a72|aarch64_cortex-a76|aarch64_generic|arm_cortex-a15_neon-vfpv4|arm_cortex-a5_vfpv4|arm_cortex-a7_neon-vfpv4|arm_cortex-a8_vfpv3|arm_cortex-a9|arm_cortex-a9_neon|arm_cortex-a9_vfpv3-d16|i386_pentium4|loongarch64_generic|mips64_octeonplus|mipsel_24kc|mipsel_24kc_24kf|mipsel_74kc|mipsel_mips32|mips_24kc|mips_mips32|riscv64_generic|riscv64_riscv64|x86_64)-openwrt-(?:24\.10|25\.12)\.(tar\.gz)$/,
    },
  },
  {
    appId: "clashbox",
    repo: "xiaobaigroup/ClashBox",
    releaseTag: /^1\.7\.4$/,
    architectures: { harmonyos: "arm64-v8a" },
    platforms: { harmonyos: /^ClashBox_LTS_V1_unsigned()\.(hap)$/ },
  },
  {
    appId: "shellcrash",
    repo: "juewuy/ShellCrash",
    architectures: { linux: "noarch", openwrt: "noarch", asus: "noarch" },
    platforms: {
      linux: /^ShellCrash()\.(tar\.gz)$/,
      openwrt: /^ShellCrash()\.(tar\.gz)$/,
      asus: /^ShellCrash()\.(tar\.gz)$/,
    },
  },
  {
    appId: "open-box",
    repo: "liandu2024/Open-Box",
    platforms: {
      openwrt: /^open-box-v{version}-linux-(arm64|x64)\.(tar\.gz)$/,
    },
  },
  {
    appId: "shadowsocksr-plus",
    repo: "fw876/helloworld",
    releaseTag: /^v196\.9$/,
    architectures: { openwrt: "noarch" },
    platforms: {
      openwrt: /^luci-app-ssr-plus(?:-196-r9|_196-r9_all)()\.(apk|ipk)$/,
    },
  },
  {
    appId: "outline",
    repo: "OutlineFoundation/outline-apps",
    releaseTag: /^v1\.10\.1$/,
    architectures: { windows: "x86" },
    platforms: { windows: /^Outline-Client()\.(exe)$/ },
  },
  {
    appId: "meow-android",
    repo: "meow-rs/meow-android",
    platforms: { android: /^meow-v{version}-(universal)\.(apk)$/ },
  },
  {
    appId: "paws",
    repo: "richerfu/Paws",
    platforms: {
      harmonyos:
        /^Paws-{version}-(arm64-v8a|armeabi-v7a|x86_64)-unsigned\.(hap)$/,
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
  {
    appId: "clash-mi",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6744321968,
    bundleId: "com.nebula.clashmi",
    country: "us",
  },
  {
    appId: "happ-proxy",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6504287215,
    bundleId: "su.ffg.happ",
    country: "us",
  },
  {
    appId: "vproxy",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6744701950,
    bundleId: "com.5vnetwork.x",
    country: "us",
  },
  {
    appId: "anywhere",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6758235178,
    bundleId: "com.argsment.Anywhere",
    country: "us",
  },
  {
    appId: "everywhere",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6766003090,
    bundleId: "com.argsment.Everywhere",
    country: "us",
  },
  {
    appId: "connect-now",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6749354119,
    bundleId: "pro.pasu.app.ConnectPro",
    country: "us",
  },
  {
    appId: "incy",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6756943388,
    bundleId: "llc.itdev.incy",
    country: "us",
  },
  {
    appId: "nextin",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6754002454,
    bundleId: "com.Tommy.Nextin",
    country: "us",
  },
  {
    appId: "tunna",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6471652937,
    bundleId: "com.onetwodev.tunna",
    country: "us",
  },
  {
    appId: "loon-lite",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6444029612,
    bundleId: "com.loon.LoonLite",
    country: "us",
  },
  {
    appId: "orbit-x",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6762544103,
    bundleId: "com.TKPUGQFAD8.orbitx",
    country: "us",
  },
  {
    appId: "v2box",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6446814690,
    bundleId: "hossin.asaadi.V2Box",
    country: "us",
  },
  {
    appId: "outline",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1356177741,
    bundleId: "org.outline.ios.client",
    country: "us",
  },
  {
    appId: "potatso",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 1239860606,
    bundleId: "com.touchingapp.potatsolite",
    country: "us",
  },
  {
    appId: "onlynet",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6502987522,
    bundleId: "com.gala.speedgoup",
    country: "us",
  },
  {
    appId: "jamjams",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6477182037,
    bundleId: "net.fiberlogic.jamjams",
    country: "us",
  },
  {
    appId: "rabbithole",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6683309629,
    bundleId: "com.rabbithole.RabbitHole",
    country: "us",
  },
  {
    appId: "shadowclash",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6760091330,
    bundleId: "com.fuzzypn.hinet",
    country: "us",
  },
  {
    appId: "bamboo-dragonfly",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6473621095,
    bundleId: "com.flhcc.BambooDragonfly",
    country: "us",
  },
  {
    appId: "oneok-vpn",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6761477404,
    bundleId: "com.OneOk.Connect",
    country: "us",
  },
  {
    appId: "xtunnel",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6741881458,
    bundleId: "com.haolin.shadowx",
    country: "us",
  },
  {
    appId: "v2rage",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6761075402,
    bundleId: "ac.rage.v2",
    country: "us",
  },
  {
    appId: "openvxs",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6757167153,
    bundleId: "com.openvxs.vpn",
    country: "us",
  },
  {
    appId: "dash-vpn",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6758860923,
    bundleId: "com.dashvpn.mac",
    country: "us",
  },
  {
    appId: "ship",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6736895153,
    bundleId: "com.yellow.clash",
    country: "us",
  },
  {
    appId: "voxiproxytun",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6768408266,
    bundleId: "com.voxiproxy.VoxiProxyTun",
    country: "us",
  },
  {
    appId: "vpsus",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6761466149,
    bundleId: "com.vpsus.vpsus",
    country: "us",
  },
  {
    appId: "clash-lite",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6761357475,
    bundleId: "com.Hood.ClashLite",
    country: "us",
  },
  {
    appId: "linkclashx",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6757075299,
    bundleId: "com.mielink.nexuslink",
    country: "us",
  },
  {
    appId: "meow",
    kind: "app-store",
    platforms: { ios: true },
    trackId: 6778303404,
    bundleId: "com.tangzixiang.meow",
    country: "us",
  },
];
