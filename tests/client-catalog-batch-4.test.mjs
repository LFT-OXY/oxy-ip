import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  filterApps,
  readFilters,
  releaseFor,
  releaseSchema,
  selectedDownload,
} from "../src/views/clients/model.ts";

const baseline = JSON.parse(
  readFileSync(
    new URL(
      "./fixtures/client-releases/batch-4/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
test("第07票固定25项与累计108项身份、顺序没有重复遗漏", () => {
  assert.equal(baseline.apps.filter((app) => app.ticket === "07").length, 25);
  assert.deepEqual(
    apps.slice(0, 108).map((app) => app.id),
    baseline.apps.slice(0, 108).map((app) => app.id),
  );
  assert.equal(new Set(apps.slice(0, 108).map((app) => app.id)).size, 108);
});

// 官方 README、同标签构建与软件源分别核对；两项失效身份不猜测属性。
const expected = {
  "sing-box-windows": [["windows", "macos", "linux"], ["sing-box"]],
  "nekobox-for-pc": [["windows", "linux"], ["sing-box"]],
  xrayui: [["windows"], ["Xray"]],
  "swell-proxy": [["windows"], ["sing-box"]],
  nekoray: [["windows", "linux"], ["sing-box"]],
  "sudoku-desktop": [["windows", "macos", "linux"], ["Sudoku"]],
  "clash-net": [["windows"], []],
  clashn: [["windows"], ["Mihomo"]],
  lvory: [["windows"], []],
  v2raya: [
    ["windows", "macos", "linux", "openwrt"],
    ["Xray", "V2Ray"],
  ],
  dae: [["macos", "linux", "openwrt"], ["dae"]],
  daed: [["linux", "openwrt"], ["dae"]],
  shellcrash: [
    ["linux", "openwrt", "asus"],
    ["Mihomo", "sing-box"],
  ],
  clashbox: [["harmonyos"], ["Mihomo"]],
  "nekobox-for-harmony": [["harmonyos"], ["sing-box"]],
  "karing-harmony-hap": [["harmonyos"], ["sing-box"]],
  hey: [["harmonyos"], ["Xray", "sing-box"]],
  ownbox: [["android"], ["sing-box"]],
  openclash: [["openwrt"], ["Mihomo"]],
  passwall: [
    ["openwrt"],
    [
      "Xray",
      "sing-box",
      "Hysteria",
      "NaiveProxy",
      "Shadowsocks",
      "ShadowsocksR",
      "ShadowTLS",
    ],
  ],
  passwall2: [["openwrt"], ["Xray", "sing-box", "Shadowsocks", "ShadowsocksR"]],
  nikki: [["openwrt"], ["Mihomo"]],
  "nikki-rs": [["openwrt"], ["clash-rs"]],
  momo: [["openwrt"], ["sing-box"]],
  homeproxy: [["openwrt"], ["sing-box"]],
};

test("第07票已核实资料具有独立平台内核期望且组合筛选可达", () => {
  for (const [id, [platforms, cores]] of Object.entries(expected)) {
    const app = apps.find((a) => a.id === id);
    assert.ok(app, id);
    assert.equal(app.name, baseline.apps.find((a) => a.id === id).name);
    assert.deepEqual(app.platforms, platforms, id);
    assert.deepEqual(app.cores, cores, id);
    for (const platform of platforms) {
      assert.equal(
        releases.filter((r) => r.appId === id && r.platform === platform)
          .length,
        1,
      );
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
      }
    }
  }
});

const placeholders = [
  "clash-net",
  "lvory",
  "shellcrash",
  "passwall",
  "passwall2",
  "nikki",
  "nikki-rs",
  "momo",
  "homeproxy",
];

test("第07票图标全部存在且文字占位只限已确认的九项", () => {
  const missing = baseline.apps
    .filter((a) => a.ticket === "07")
    .filter((item) => {
      const app = apps.find((a) => a.id === item.id);
      return !app || !existsSync(`public${app.icon}`);
    })
    .map((a) => a.id);
  assert.deepEqual(missing, []);
  for (const item of baseline.apps.filter((a) => a.ticket === "07")) {
    const app = apps.find((a) => a.id === item.id);
    if (placeholders.includes(item.id)) {
      assert.match(app.icon, /\.svg$/);
      assert.match(
        readFileSync(`public${app.icon}`, "utf8"),
        /文字占位图（非官方图标）/,
      );
    } else assert.match(app.icon, /\.webp$/);
  }
});

test("历史例外不伪造官方入口、代码状态、内核、开发者或成功时间", () => {
  for (const id of ["clash-net", "lvory"]) {
    const app = apps.find((a) => a.id === id);
    assert.ok(app, id);
    assert.equal(app.code, "unknown");
    assert.equal(app.price, "unknown");
    assert.deepEqual(app.cores, []);
    assert.deepEqual(app.developers, []);
    assert.match(app.description, /历史.*当前无法获取/);
    const row = releaseFor(releases, id, "windows");
    assert.equal(row.unavailable, true);
    assert.equal(row.maintenance, "manual");
    assert.equal(row.fallback, undefined);
    assert.deepEqual(row.downloads, []);
    assert.equal(selectedDownload(row, "old-package"), undefined);
    for (const field of ["version", "publishedAt", "lastCheckedAt"])
      assert.equal(row[field], undefined);
    assert.match(row.source.label, /历史.*非官方/);
    assert.match(row.note, /当前无法获取/);
    assert.ok(releaseSchema.safeParse(row).success);
    for (const changes of [
      { unavailable: undefined },
      { maintenance: "automatic" },
      { version: "1.0.0" },
      { publishedAt: "2026-01-01T00:00:00Z" },
      { lastCheckedAt: "2026-01-01T00:00:00Z" },
      { fallback: { kind: "page", url: "https://example.com" } },
      { downloads: [{ id: "fake", kind: "page", url: "https://example.com" }] },
    ])
      assert.equal(
        releaseSchema.safeParse({ ...row, ...changes }).success,
        false,
      );
  }
  const normal = releaseFor(releases, "ownbox", "android");
  assert.equal(
    releaseSchema.safeParse({ ...normal, downloads: [] }).success,
    false,
  );
  assert.equal(
    releaseSchema.safeParse({ ...normal, fallback: undefined }).success,
    false,
  );
});

test("代码公开不等于开源，测试渠道、源码安装及不同平台代际保持限定", () => {
  assert.equal(apps.find((a) => a.id === "swell-proxy").code, "available");
  assert.equal(apps.find((a) => a.id === "clashbox").code, "partial");
  assert.equal(apps.find((a) => a.id === "karing-harmony-hap").code, "closed");
  for (const id of ["karing-harmony-hap", "hey", "nikki-rs"]) {
    const row = releases.find((r) => r.appId === id);
    assert.equal(row.maintenance, "manual");
    for (const field of ["version", "publishedAt", "lastCheckedAt"])
      assert.equal(row[field], undefined);
    assert.ok(row.downloads.every((d) => d.kind === "page"));
  }
  assert.match(
    releases.find((r) => r.appId === "karing-harmony-hap").note,
    /非 Karing 官方.*GPL/,
  );
  assert.match(releases.find((r) => r.appId === "hey").note, /仅发布源码/);
  assert.match(releases.find((r) => r.appId === "nikki-rs").note, /Alpha/);
  assert.match(
    releaseFor(releases, "v2raya", "openwrt").note,
    /Xray 或 V2Ray.*不套用桌面版本/,
  );
  assert.equal(releaseFor(releases, "v2raya", "openwrt").version, undefined);
  assert.match(releaseFor(releases, "dae", "macos").note, /虚拟机.*并非原生/);
  assert.equal(releaseFor(releases, "dae", "macos").version, undefined);
  for (const id of ["openclash", "passwall", "passwall2"]) {
    assert.deepEqual(apps.find((a) => a.id === id).platforms, ["openwrt"]);
    assert.match(releaseFor(releases, id, "openwrt").note, /不是 Android/);
  }
});

test("ImmortalWrt正式软件源独立版本、包架构及依赖限定不冒用Linux快照", () => {
  for (const [id, version, arch, group, filename] of [
    [
      "dae",
      "1.0.0-r1",
      "aarch64_generic",
      "packages",
      "dae_1.0.0-r1_aarch64_generic.ipk",
    ],
    [
      "daed",
      "1.24.0-r1",
      "aarch64_generic",
      "packages",
      "daed_1.24.0-r1_aarch64_generic.ipk",
    ],
    [
      "homeproxy",
      "26.187.07809~9bce398",
      "noarch",
      "luci",
      "luci-app-homeproxy_26.187.07809~9bce398_all.ipk",
    ],
  ]) {
    const row = releaseFor(releases, id, "openwrt"),
      base = `https://downloads.immortalwrt.org/releases/24.10.4/packages/aarch64_generic/${group}/`;
    assert.equal(row.version, version);
    assert.equal(row.maintenance, "manual");
    assert.equal(row.publishedAt, undefined);
    assert.equal(row.lastCheckedAt, undefined);
    assert.deepEqual(row.downloads, [
      {
        id: filename,
        kind: "direct",
        url: base + filename,
        arch,
        format: "ipk",
      },
      { id: "official-feed", kind: "page", url: base },
    ]);
    assert.equal(row.source.url, base + "Packages.gz");
    assert.equal(row.fallback.url, base);
    assert.match(row.note, /ImmortalWrt 24.10.4/);
    if (id !== "homeproxy") {
      assert.notEqual(row.version, releaseFor(releases, id, "linux").version);
      assert.match(row.note, /eBPF\/BTF/);
    } else assert.match(row.note, /ARM64\/AMD64.*sing-box.*firewall4.*noarch/);
  }
});
