import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  filterApps,
  readFilters,
  releaseFor,
} from "../src/views/clients/model.ts";

const baseline = JSON.parse(
  readFileSync(
    new URL(
      "./fixtures/client-releases/batch-6/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
// 冻结名单独立于生产；平台和内核依据官方商店、官网、README及构建。
const expected = {
  "clash-plus": [
    ["android", "ios", "harmonyos", "windows", "macos"],
    ["Mihomo"],
  ],
  panvell: [["ios", "macos"], ["Mihomo"]],
  "flclash-patched": [
    ["android", "ios", "windows", "macos", "linux"],
    ["Mihomo"],
  ],
  oneboxm: [["android", "ios"], ["sing-box"]],
  "xray-connect": [["ios", "macos"], ["Xray"]],
  vpn: [["ios", "macos"], ["Xray"]],
  vpnet: [["android", "ios", "macos"], ["Xray"]],
  "susi-connect": [["ios", "macos"], ["Xray"]],
  bclient: [
    ["ios", "macos"],
    ["V2Ray", "Xray"],
  ],
  wisp: [["ios", "macos"], ["Xray"]],
  xrayclient: [["ios"], []],
  "pixel-proxy": [["ios", "macos"], []],
  tomoon: [["steam-deck"], ["Mihomo"]],
  deckyclash: [["steam-deck"], ["Mihomo"]],
  fancyss: [
    ["asus"],
    [
      "Xray",
      "V2Ray",
      "Shadowsocks",
      "ShadowsocksR",
      "NaiveProxy",
      "TUIC",
      "Hysteria2",
      "AnyTLS Zig",
    ],
  ],
  "merlin-xrayui": [["asus"], ["Xray"]],
  "fullcombo-shark": [["openwrt"], ["Mihomo"]],
  "nekobox-for-openwrt": [["openwrt"], ["Mihomo", "sing-box"]],
  "neko-for-openwrt": [["openwrt"], ["Mihomo", "sing-box"]],
  "magic-catling2": [["asus"], ["Mihomo"]],
  "aerobox-for-android": [["android"], ["sing-box"]],
};
test("第09票21项及累计154项身份、顺序和唯一性", () => {
  assert.equal(baseline.apps.filter((a) => a.ticket === "09").length, 21);
  assert.deepEqual(
    apps.map((a) => a.id),
    baseline.apps.map((a) => a.id),
  );
  assert.equal(new Set(apps.map((a) => a.id)).size, 154);
});
test("第09票全部独立平台与内核可筛选且快照覆盖一致", () => {
  for (const [id, [platforms, cores]] of Object.entries(expected)) {
    const a = apps.find((a) => a.id === id);
    assert.ok(a, id);
    assert.equal(a.name, baseline.apps.find((a) => a.id === id).name);
    assert.deepEqual(a.platforms, platforms, id);
    assert.deepEqual(a.cores, cores, id);
    assert.deepEqual(
      releases.filter((r) => r.appId === id).map((r) => r.platform),
      platforms,
      id,
    );
    for (const platform of platforms)
      for (const core of ["", ...cores]) {
        assert.ok(
          filterApps(
            apps,
            releases,
            readFilters(
              new URLSearchParams({
                q: a.name,
                platform,
                core,
                code: a.code,
                price: a.price,
              }),
            ),
            (x) => x,
          ).some((a) => a.id === id),
        );
        const r = releaseFor(releases, id, platform);
        assert.ok(r.downloads.length && r.fallback);
        assert.equal(r.unavailable, undefined);
        if (r.maintenance === "manual")
          assert.equal(r.lastCheckedAt, undefined);
      }
  }
});
test("本批21款必须有官方图标，不沿用前批占位授权", () => {
  for (const id of Object.keys(expected)) {
    const a = apps.find((a) => a.id === id);
    assert.ok(a, id);
    assert.match(a.icon, /\.webp$/);
    assert.ok(existsSync(`public${a.icon}`), id);
  }
});
test("独立桌面与移动版本、未签名IPA、RC与Beta边界", () => {
  for (const id of [
    "panvell",
    "xray-connect",
    "vpn",
    "vpnet",
    "susi-connect",
    "bclient",
    "wisp",
    "pixel-proxy",
  ]) {
    const r = releaseFor(releases, id, "macos");
    assert.ok(r, id);
    for (const key of ["version", "publishedAt", "lastCheckedAt"])
      assert.equal(r[key], undefined, id);
  }
  assert.equal(releaseFor(releases, "clash-plus", "windows").version, "1.2.7");
  assert.equal(releaseFor(releases, "clash-plus", "macos").version, "1.2.7");
  assert.equal(releaseFor(releases, "oneboxm", "macos"), undefined);
  const ipa = releaseFor(releases, "flclash-patched", "ios");
  assert.match(ipa.note, /签名/);
  assert.ok(ipa.downloads.some((d) => d.format === "ipa"));
  const neko = releaseFor(releases, "neko-for-openwrt", "openwrt");
  assert.equal(neko.version, undefined);
  assert.ok(neko.downloads.every((d) => d.kind === "page"));
  assert.match(neko.note, /Beta/);
  const box = releaseFor(releases, "nekobox-for-openwrt", "openwrt");
  assert.equal(box.version, "2.0.8");
  assert.equal(box.downloads[0].id, "luci-app-nekobox_2.0.8-cn_all.ipk");
  const moon = releaseFor(releases, "tomoon", "steam-deck");
  assert.equal(moon.version, undefined);
  assert.ok(moon.downloads.every((d) => d.kind === "page"));
  assert.match(moon.note, /Alpha/);
  assert.equal(apps.find((a) => a.id === "merlin-xrayui").code, "available");
});
test("官网与软件源人工正式直链固定到独立版本，不伪造成功时间", () => {
  const clash = {
    android: [["ClashPlus-1.2.7-14-arm64-v8a.apk", "arm64-v8a", "apk"]],
    harmonyos: [["ClashPlus-1.2.7-14-arm64-v8a.apk", "arm64-v8a", "apk"]],
    windows: [["ClashPlus-1.2.7-x64-setup.exe", "x64", "exe"]],
    macos: [
      ["ClashPlus-1.2.7-arm64.dmg", "arm64", "dmg"],
      ["ClashPlus-1.2.7-x64.dmg", "x64", "dmg"],
    ],
  };
  for (const [p, expected] of Object.entries(clash)) {
    const r = releaseFor(releases, "clash-plus", p);
    assert.equal(r.version, "1.2.7");
    assert.equal(r.maintenance, "manual");
    assert.equal(r.lastCheckedAt, undefined);
    assert.equal(r.publishedAt, undefined);
    assert.deepEqual(
      r.downloads.map((d) => [d.id, d.arch, d.format]),
      expected,
    );
    for (const d of r.downloads)
      assert.equal(d.url, `https://clashplus.io/${d.id}`);
  }
  assert.match(
    releaseFor(releases, "clash-plus", "harmonyos").note,
    /不是原生 HarmonyOS NEXT/,
  );
  const fancy = releaseFor(releases, "fancyss", "asus");
  assert.equal(fancy.version, "3.5.30");
  assert.equal(fancy.maintenance, "manual");
  assert.equal(fancy.lastCheckedAt, undefined);
  const files = [];
  for (const [p, arch] of [
    ["arm", "armv7"],
    ["hnd", "armv7"],
    ["hnd_v8", "armv8"],
    ["qca", "armv7"],
    ["mtk", "armv8"],
    ["ipq32", "armv7"],
    ["ipq64", "armv8"],
  ])
    for (const variant of ["full", "lite"])
      files.push([`fancyss_${p}_${variant}.tar.gz`, arch]);
  assert.deepEqual(
    fancy.downloads.map((d) => [d.id, d.arch]),
    files,
  );
  for (const d of fancy.downloads)
    assert.equal(
      d.url,
      `https://raw.githubusercontent.com/hq450/fancyss/b19e82cb6a05e08990a96905353921819d44d134/packages/${d.id}`,
    );
  const shark = releaseFor(releases, "fullcombo-shark", "openwrt");
  assert.equal(shark.version, "26.259.56423~80383b9");
  assert.equal(shark.lastCheckedAt, undefined);
  assert.deepEqual(shark.downloads, [
    {
      id: "luci-app-fchomo-26.259.56423~80383b9.apk",
      kind: "direct",
      url: "https://fantastic-packages.github.io/releases/25.12/packages/x86_64/luci/luci-app-fchomo-26.259.56423~80383b9.apk",
      arch: "noarch",
      format: "apk",
    },
  ]);
  const magic = releaseFor(releases, "magic-catling2", "asus");
  assert.equal(magic.version, "v1.2.2");
  assert.equal(magic.publishedAt, undefined);
  assert.equal(magic.lastCheckedAt, undefined);
  assert.equal(magic.downloads[0].url, "https://t.me/merlinclashcat/827");
});

test("XRay Connect按官方版本历史归入Xray，名称与两平台组合筛选均可找到", () => {
  for (const platform of ["ios", "macos"]) {
    const result = filterApps(
      apps,
      releases,
      readFilters(
        new URLSearchParams({ q: "XRay Connect", core: "Xray", platform }),
      ),
      (x) => x,
    );
    assert.deepEqual(
      result.map((a) => a.id),
      ["xray-connect"],
    );
  }
});
