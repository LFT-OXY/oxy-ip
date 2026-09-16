import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  filterApps,
  readFilters,
  releaseFor,
} from "../src/views/clients/model.ts";

// 冻结来源第34–58项；平台期望来自逐项官方核验，与生产数据独立。
const baseline = JSON.parse(
  readFileSync(
    new URL(
      "./fixtures/client-releases/batch-2/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
const expectedPlatforms = {
  "clashx-meta": ["macos"],
  v2rayu: ["macos"],
  surfboard: ["android"],
  insightbox: ["android"],
  "xray-gui": ["android"],
  "clash-mi": ["android", "ios", "windows", "macos", "linux"],
  flclashx: ["android", "windows", "macos", "linux"],
  "mikubox-for-android": ["android"],
  kunbox: ["android"],
  "nekobox-by-starifly": ["android"],
  "happ-proxy": ["android", "ios", "windows", "macos", "linux"],
  "clash-xiaoy": ["windows", "macos", "linux"],
  monadbox: ["android"],
  mconnect: ["android", "harmonyos", "windows", "macos", "linux"],
  vproxy: ["android", "ios", "windows", "macos", "linux"],
  flyclash: ["windows", "macos", "linux"],
  "flyclash-android": ["android"],
  sudodroid: ["android"],
  "box-for-root": ["android"],
  surfing: ["android"],
  box4magisk: ["android"],
  "box-for-android": ["android"],
  akashaproxy: ["android"],
  "clash-mix": ["android"],
  anywhere: ["ios", "macos"],
};

test("第05票固定25项加入后总计58项，身份顺序及逐平台获取入口完整", () => {
  const expected = baseline.apps.filter((app) => app.ticket === "05");
  assert.equal(expected.length, 25);
  assert.deepEqual(
    Object.keys(expectedPlatforms),
    expected.map((app) => app.id),
  );
  assert.deepEqual(
    apps.slice(0, 58).map((app) => app.id),
    baseline.apps.slice(0, 58).map((app) => app.id),
  );
  assert.equal(new Set(apps.slice(0, 58).map((app) => app.id)).size, 58);
  for (const item of expected) {
    const app = apps.find((app) => app.id === item.id);
    assert.equal(app.name, item.name);
    assert.deepEqual(app.platforms, expectedPlatforms[item.id]);
    assert.ok(existsSync(`public${app.icon}`), `${app.id}: 图标未完成`);
    assert.ok(app.description && app.priceDetails && app.sources.length);
    for (const platform of app.platforms) {
      const row = releaseFor(releases, app.id, platform);
      assert.ok(row, `${app.id}/${platform}`);
      assert.ok(row.downloads.length);
      assert.ok(!row.source.url.includes("huarun.win"));
      if (row.maintenance === "manual")
        assert.equal(row.lastCheckedAt, undefined);
      else assert.ok(row.lastCheckedAt);
      const query = { q: app.name, platform, code: app.code, price: app.price };
      for (const core of ["", ...app.cores]) {
        const matches = filterApps(
          apps,
          releases,
          readFilters(new URLSearchParams({ ...query, core })),
          (text) => text,
        );
        assert.ok(
          matches.some((match) => match.id === app.id),
          `${app.id}/${platform}/${core}`,
        );
      }
      for (const download of row.downloads) {
        assert.equal(new URL(download.url).protocol, "https:");
        assert.ok(!download.url.includes("huarun.win"));
        if (download.kind === "direct") {
          assert.ok(download.arch && download.format && row.version);
          assert.ok(
            download.url.includes(
              `/download/${encodeURIComponent(row.version)}/`,
            ),
          );
        }
      }
    }
  }
  assert.equal(
    new Set(releases.map((row) => `${row.appId}/${row.platform}`)).size,
    releases.length,
  );
});

test("测试渠道、仅源码和兼容Mac不伪造正式发布信息", () => {
  for (const [id, platform] of [
    ["flyclash-android", "android"],
    ["flyclash", "linux"],
    ["clash-mix", "android"],
    ["anywhere", "macos"],
  ]) {
    const row = releaseFor(releases, id, platform);
    assert.ok(row, id);
    assert.equal(row.version, undefined);
    assert.equal(row.publishedAt, undefined);
    assert.equal(row.lastCheckedAt, undefined);
    assert.equal(row.maintenance, "manual");
    assert.ok(row.note);
    assert.ok(row.downloads.every((download) => download.kind !== "direct"));
  }
  const mix = releaseFor(releases, "clash-mix", "android");
  assert.equal(mix.downloads[0].url, "https://github.com/AXEVO/Clash-MIX");
  assert.match(mix.note, /源码.*未确认.*正式包/);
  assert.equal(apps.find((app) => app.id === "clash-mix").code, "available");
  assert.ok(
    !apps.find((app) => app.id === "mconnect").platforms.includes("ios"),
  );
});

test("Root模块、旧正式内核、费用和品牌别名保持真实限定", () => {
  for (const id of [
    "box-for-root",
    "surfing",
    "box4magisk",
    "box-for-android",
    "akashaproxy",
    "clash-mix",
  ]) {
    assert.match(apps.find((app) => app.id === id).description, /Root/);
    assert.match(releaseFor(releases, id, "android").note, /Root/);
  }
  assert.deepEqual(apps.find((app) => app.id === "mikubox-for-android").cores, [
    "sing-box",
  ]);
  assert.match(
    releaseFor(releases, "mikubox-for-android", "android").note,
    /停止维护.*Mihomo/,
  );
  assert.ok(apps.find((app) => app.id === "vproxy").aliases.includes("VX"));
  for (const id of ["vproxy", "anywhere"])
    assert.equal(apps.find((app) => app.id === id).price, "paid");
  for (const id of [
    "insightbox",
    "box-for-android",
    "akashaproxy",
    "clash-mix",
    "box4magisk",
  ]) {
    const icon = apps.find((app) => app.id === id).icon;
    assert.match(readFileSync(`public${icon}`, "utf8"), /占位/);
  }
});

// v1.10.2 的 customize.sh 与 box/scripts/box.tool 均提供 Mihomo 选项，
// 不能只遍历目录中已有的 cores，否则漏填内核也会让测试通过。
test("Box for Root 的独立六内核清单均可筛选，包含 Mihomo", () => {
  const expected = ["Clash", "Mihomo", "sing-box", "V2Ray", "Hysteria", "Xray"];
  assert.deepEqual(
    apps.find((app) => app.id === "box-for-root").cores,
    expected,
  );
  for (const core of expected) {
    const matches = filterApps(
      apps,
      releases,
      readFilters(new URLSearchParams({ platform: "android", core })),
      (text) => text,
    );
    assert.ok(
      matches.some((app) => app.id === "box-for-root"),
      core,
    );
  }
});
