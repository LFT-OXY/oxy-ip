import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  codeLabels,
  filterApps,
  readFilters,
  releaseFor,
} from "../src/views/clients/model.ts";

// 来自冻结基线第 9–33 项；平台依据本票独立官方核验，不从生产目录生成。
const baseline = JSON.parse(
  readFileSync(
    new URL(
      "./fixtures/client-releases/batch-1/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
const expectedPlatforms = {
  surge: ["ios", "macos"],
  "quantumult-x": ["ios", "macos"],
  loon: ["ios", "macos"],
  "clash-by-hako": ["ios", "macos"],
  karing: ["android", "ios", "windows", "macos", "linux"],
  "pharos-pro": ["ios", "macos"],
  hiddify: ["android", "ios", "windows", "macos", "linux"],
  egern: ["ios", "macos"],
  clashfest: ["android"],
  exclave: ["android"],
  "nekobox-for-android": ["android"],
  husi: ["android", "windows", "macos", "linux"],
  yumebox: ["android"],
  "shadowsocks-android": ["android"],
  onexray: ["android", "ios", "windows", "macos", "linux"],
  ssrvpn: ["android", "windows", "macos"],
  singcast: ["android", "windows", "macos", "linux"],
  streisand: ["ios", "macos"],
  foxray: ["ios", "macos"],
  "clash-nyanpasu": ["windows", "macos", "linux"],
  "clash-party": ["windows", "macos", "linux"],
  "gui-for-clash": ["windows", "macos", "linux"],
  sparkle: ["windows", "macos", "linux"],
  v2rayn: ["windows", "macos", "linux"],
  anyportal: ["android", "windows", "macos", "linux"],
};

test("第04票固定25项与首票合计33项，身份、平台、图标、逐平台快照完整", () => {
  const expected = baseline.apps.filter((app) => app.ticket === "04");
  assert.equal(expected.length, 25);
  assert.deepEqual(
    Object.keys(expectedPlatforms),
    expected.map((app) => app.id),
  );
  assert.deepEqual(
    apps.slice(0, 33).map((app) => app.id),
    baseline.apps.slice(0, 33).map((app) => app.id),
  );
  assert.equal(new Set(apps.slice(0, 33).map((app) => app.id)).size, 33);
  for (const item of expected) {
    const app = apps.find((app) => app.id === item.id);
    assert.equal(app.name, item.name);
    assert.deepEqual(app.platforms, expectedPlatforms[item.id]);
    assert.ok(existsSync(`public${app.icon}`), app.id);
    for (const platform of app.platforms) {
      const row = releaseFor(releases, app.id, platform);
      assert.ok(row, `${app.id}/${platform}`);
      assert.ok(row.downloads.length);
      assert.ok(!row.source.url.includes("huarun.win"));
      if (row.maintenance === "manual")
        assert.equal(row.lastCheckedAt, undefined);
      const matches = filterApps(
        apps,
        releases,
        readFilters(
          new URLSearchParams({
            q: app.name,
            platform,
            code: app.code,
            price: app.price,
          }),
        ),
        (text) => text,
      );
      assert.ok(
        matches.some((match) => match.id === app.id),
        `${app.id}/${platform}`,
      );
      for (const core of app.cores)
        assert.ok(
          filterApps(
            apps,
            releases,
            readFilters(new URLSearchParams({ platform, core })),
            (text) => text,
          ).some((match) => match.id === app.id),
        );
    }
  }
  assert.equal(
    new Set(releases.map((row) => `${row.appId}/${row.platform}`)).size,
    releases.length,
  );
});

test("源码可见的新状态使用真实英文翻译且可筛选", async () => {
  globalThis.window = {
    location: { href: "https://example.test/clients?lang=en" },
  };
  globalThis.localStorage = { getItem: () => null };
  try {
    const { t } = await import("../src/i18n/index.ts?batch-english");
    assert.equal(t(codeLabels.available), "Source available");
    assert.deepEqual(
      filterApps(
        apps.slice(0, 33),
        releases,
        readFilters(new URLSearchParams("code=available")),
        t,
      ).map((app) => app.id),
      ["anyportal"],
    );
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});

test("不将测试包、未知发布或兼容 Mac 的 iOS 版本冒充正式 Mac 发布", () => {
  for (const id of ["clashfest", "foxray"]) {
    for (const row of releases.filter((row) => row.appId === id)) {
      assert.equal(row.version, undefined);
      assert.equal(row.lastCheckedAt, undefined);
      assert.ok(row.downloads.every((download) => download.kind !== "direct"));
      assert.ok(row.note);
    }
  }
  for (const id of [
    "quantumult-x",
    "loon",
    "pharos-pro",
    "egern",
    "streisand",
    "clash-by-hako",
  ]) {
    const row = releaseFor(releases, id, "macos");
    assert.equal(row.version, undefined);
    assert.equal(row.maintenance, "manual");
  }
  assert.ok(
    !apps.find((app) => app.id === "anyportal").platforms.includes("ios"),
  );
  assert.equal(
    apps.find((app) => app.id === "anyportal").code,
    "available",
    "保留所有权利的公开源码不冒充开源许可证",
  );
  for (const id of [
    "surge",
    "quantumult-x",
    "loon",
    "pharos-pro",
    "egern",
    "streisand",
  ])
    assert.deepEqual(apps.find((app) => app.id === id).cores, []);
});

test("Surge Mac 使用原生官网入口，不指向 iOS 商店", () => {
  const row = releaseFor(releases, "surge", "macos");
  assert.deepEqual(row.source, {
    label: "官方下载页",
    url: "https://nssurge.com/",
  });
  assert.deepEqual(row.fallback, { kind: "page", url: "https://nssurge.com/" });
  assert.deepEqual(row.downloads, [
    { id: "official-entry", kind: "page", url: "https://nssurge.com/" },
  ]);
  assert.equal(row.maintenance, "manual");
  assert.equal(row.version, undefined);
  assert.equal(row.publishedAt, undefined);
  assert.equal(row.lastCheckedAt, undefined);
  assert.match(row.note, /Mac 使用独立授权/);
});
