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
      "./fixtures/client-releases/batch-5/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
test("第08票固定25项及累计133项身份、顺序与唯一性", () => {
  assert.equal(baseline.apps.filter((a) => a.ticket === "08").length, 25);
  assert.deepEqual(
    apps.map((a) => a.id),
    baseline.apps.slice(0, 133).map((a) => a.id),
  );
  assert.equal(new Set(apps.map((a) => a.id)).size, 133);
});

// 独立读取官方商店兼容性、README及构建；协议兼容不推定实现内核。
const expected = {
  "open-box": [["openwrt"], ["sing-box"]],
  "shadowsocksr-plus": [
    ["openwrt"],
    [
      "Xray",
      "Mihomo",
      "Shadowsocks",
      "ShadowsocksR",
      "NaiveProxy",
      "ShadowTLS",
    ],
  ],
  "orbit-x": [["ios", "macos"], []],
  v2box: [
    ["android", "ios", "macos"],
    ["V2Ray", "Xray"],
  ],
  outline: [["android", "ios", "windows", "macos", "linux"], ["Outline SDK"]],
  potatso: [["ios"], []],
  onlynet: [["ios", "macos"], []],
  jamjams: [["ios", "windows", "macos"], ["Xray"]],
  rabbithole: [["ios", "macos"], []],
  shadowclash: [["ios", "macos"], []],
  "bamboo-dragonfly": [["ios"], []],
  "oneok-vpn": [["ios", "macos"], []],
  xtunnel: [["ios", "macos"], []],
  v2rage: [["ios", "macos"], []],
  openvxs: [["ios"], []],
  "dash-vpn": [["ios", "macos"], []],
  ship: [["ios", "macos"], []],
  voxiproxytun: [["ios", "macos"], []],
  vpsus: [["ios", "macos"], []],
  "clash-lite": [["ios", "macos"], ["Mihomo"]],
  linkclashx: [["ios", "macos"], ["CoreX"]],
  meow: [["ios", "macos"], ["meow-rs"]],
  "meow-android": [["android"], ["meow-rs"]],
  baoliandeng: [["macos"], ["meow-rs"]],
  paws: [["harmonyos"], ["meow-rs"]],
};
test("第08票独立平台、内核与组合筛选逐项匹配", () => {
  for (const [id, [platforms, cores]] of Object.entries(expected)) {
    const app = apps.find((a) => a.id === id);
    assert.ok(app, id);
    assert.equal(app.name, baseline.apps.find((a) => a.id === id).name);
    assert.deepEqual(app.platforms, platforms, id);
    assert.deepEqual(app.cores, cores, id);
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
                q: app.name,
                platform,
                core,
                code: app.code,
                price: app.price,
              }),
            ),
            (x) => x,
          ).some((a) => a.id === id),
        );
        const row = releaseFor(releases, id, platform);
        assert.ok(row.downloads.length && row.fallback);
        assert.equal(row.unavailable, undefined);
        assert.ok(
          row.downloads.every((d) => !/testflight|beta|nightly/i.test(d.url)),
        );
      }
  }
});
test("本批图标全部存在，仅SSR Plus+使用获准文字占位", () => {
  for (const id of Object.keys(expected)) {
    const app = apps.find((a) => a.id === id);
    assert.ok(app && existsSync(`public${app.icon}`), id);
    if (id === "shadowsocksr-plus") {
      assert.equal(app.icon, "/client-icons/shadowsocksr-plus.svg");
      const svg = readFileSync(`public${app.icon}`, "utf8");
      assert.match(svg, /ShadowSocksR Plus\+ 文字占位图（非官方图标）/);
      assert.match(svg, />SSR\+<\/text>/);
    } else {
      assert.match(app.icon, /\.webp$/, id);
    }
  }
});
test("兼容Mac不复制iOS版本，独立Mac与Windows来源保留其版本", () => {
  for (const id of [
    "orbit-x",
    "v2box",
    "onlynet",
    "rabbithole",
    "shadowclash",
    "oneok-vpn",
    "xtunnel",
    "v2rage",
    "dash-vpn",
    "ship",
    "voxiproxytun",
    "vpsus",
    "clash-lite",
    "linkclashx",
    "meow",
  ]) {
    const row = releaseFor(releases, id, "macos");
    assert.ok(row, id);
    assert.equal(row.maintenance, "manual");
    for (const field of ["version", "publishedAt", "lastCheckedAt"])
      assert.equal(row[field], undefined, `${id}/${field}`);
  }
  assert.equal(releaseFor(releases, "jamjams", "windows").version, "0.2.1");
  const mac = releaseFor(releases, "jamjams", "macos");
  assert.equal(mac.version, "2.4.4");
  assert.equal(mac.downloads[0].arch, "universal");
  assert.equal(releaseFor(releases, "baoliandeng", "ios"), undefined);
  assert.equal(releaseFor(releases, "baoliandeng", "macos").version, "6.0");
});
