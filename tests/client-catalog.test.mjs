import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  filterApps,
  releaseFor,
  selectedDownload,
  latestPublishedAt,
  releaseSchema,
  readFilters,
  clearFilters,
} from "../src/views/clients/model.ts";

const ids = [
  "shadowrocket",
  "flclash",
  "sing-box",
  "clash-verge-rev",
  "v2rayng",
  "clash-meta-for-android",
  "stash",
  "bettbox",
];

const initialApps = apps.slice(0, 8);

test("首票独立名单、全部平台与人工资料完整且无重复", () => {
  assert.deepEqual(
    initialApps.map((a) => a.id),
    ids,
  );
  const expectedPlatforms = [
    ["ios", "macos"],
    ["android", "windows", "macos", "linux"],
    ["android", "ios", "windows", "macos", "linux", "openwrt"],
    ["windows", "macos", "linux"],
    ["android"],
    ["android"],
    ["ios", "macos", "android", "windows"],
    ["android", "windows", "macos", "linux"],
  ];
  initialApps.forEach((app, i) => {
    assert.deepEqual(app.platforms, expectedPlatforms[i]);
    assert.ok(app.description && app.priceDetails && app.sources.length);
    assert.ok(existsSync(`public${app.icon}`));
    assert.equal(new Set(app.platforms).size, app.platforms.length);
    for (const platform of app.platforms) {
      const release = releaseFor(releases, app.id, platform);
      assert.ok(release, `${app.id}/${platform}`);
      assert.ok(release.source.url.startsWith("https://"));
      if (release.maintenance === "manual") {
        assert.equal(
          release.lastCheckedAt,
          undefined,
          "人工快照不能伪装自动核验",
        );
      } else {
        assert.ok(release.lastCheckedAt, "自动快照必须保留成功核验时间");
      }
      for (const download of release.downloads) {
        assert.equal(new URL(download.url).protocol, "https:");
        assert.ok(!download.url.includes("huarun.win"));
        if (download.kind === "direct") {
          assert.ok(download.arch && download.format && release.version);
          if (app.id === "stash" && platform === "macos") {
            // Stash 以构建号命名；展示版本与构建号的绑定由官方 feed 回归验证。
            assert.match(
              download.url,
              /^https:\/\/releases\.stash\.ws\/Stash-build-\d+\.zip$/,
            );
          } else
            assert.ok(download.url.includes(release.version.replace(/^v/, "")));
        }
      }
    }
  });
  assert.equal(
    new Set(releases.map((r) => `${r.appId}/${r.platform}`)).size,
    releases.length,
  );
  assert.equal(apps[0].cores.length, 0, "未公开源码不等于已确认自研内核");
});

test("搜索名称别名简介，中英文与四维筛选组合，多内核及无结果", () => {
  const filter = (query) =>
    filterApps(
      initialApps,
      releases,
      readFilters(new URLSearchParams(query)),
      (value) => value,
    );
  assert.deepEqual(
    filter("q=cmfa").map((a) => a.id),
    ["clash-meta-for-android"],
  );
  assert.deepEqual(
    filter("q=小火箭").map((a) => a.id),
    ["shadowrocket"],
  );
  assert.ok(filter("q=WebDAV").some((a) => a.id === "flclash"));
  assert.deepEqual(
    filter("platform=android&core=Xray&code=open&price=free").map((a) => a.id),
    ["v2rayng"],
  );
  assert.deepEqual(
    filter("core=V2Ray").map((a) => a.id),
    ["v2rayng"],
  );
  assert.equal(filter("platform=ios&price=free&core=Mihomo").length, 0);
  assert.equal(filter("platform=missing").length, 0);
  assert.deepEqual(
    filter("").map((a) => a.id),
    ids,
  );
});

test("最近更新仅取所选平台官方发布时间，未知日期末尾且同值顺序稳定", () => {
  const sample = apps.slice(0, 3);
  const rows = [
    {
      appId: sample[0].id,
      platform: "ios",
      publishedAt: "2025-01-01T00:00:00Z",
      lastCheckedAt: "2030-01-01T00:00:00Z",
    },
    {
      appId: sample[1].id,
      platform: "android",
      publishedAt: "2025-02-01T00:00:00Z",
    },
    {
      appId: sample[2].id,
      platform: "android",
      lastCheckedAt: "2031-01-01T00:00:00Z",
    },
  ];
  const result = filterApps(
    sample,
    rows,
    readFilters(new URLSearchParams("sort=updated")),
    (v) => v,
  );
  assert.deepEqual(
    result.map((a) => a.id),
    [sample[1].id, sample[0].id, sample[2].id],
  );
  assert.equal(latestPublishedAt(rows, sample[0].id, "macos"), undefined);
  assert.deepEqual(
    filterApps(
      sample,
      [],
      readFilters(new URLSearchParams("sort=updated")),
      (v) => v,
    ),
    sample,
  );
});

test("平台与安装包选择不串配，旧包标识回退本平台第一项", () => {
  const android = releaseFor(releases, "flclash", "android");
  const windows = releaseFor(releases, "flclash", "windows");
  assert.equal(
    selectedDownload(windows, android.downloads[0].id),
    windows.downloads[0],
  );
  assert.equal(releaseFor(releases, "flclash", "ios"), undefined);
  assert.equal(selectedDownload(undefined, "stale"), undefined);
  assert.equal(releaseFor(releases, "stash", "windows").version, undefined);
  assert.equal(
    releaseFor(releases, "stash", "windows").downloads[0].kind,
    "page",
  );
  assert.equal(
    releaseFor(releases, "shadowrocket", "ios").downloads[0].kind,
    "store",
  );
  const sing = releaseFor(releases, "sing-box", "ios");
  assert.ok(sing.note.includes("越狱"));
  assert.ok(sing.downloads.every((d) => !/testflight/i.test(d.url)));
});

test("清除筛选保留语言及无关 URL 状态", () => {
  const cleared = clearFilters(
    new URLSearchParams(
      "q=test&platform=linux&core=Mihomo&code=open&price=free&sort=updated&lang=en&extra=1",
    ),
  );
  assert.equal(cleared.toString(), "lang=en&extra=1");
});

test("发布数据边界拒绝非 HTTPS、无版本直链和无架构安装包", () => {
  const valid = releaseFor(releases, "flclash", "android");
  assert.throws(() => releaseSchema.parse({ ...valid, version: undefined }));
  assert.throws(() =>
    releaseSchema.parse({
      ...valid,
      downloads: [{ ...valid.downloads[0], url: "javascript:alert(1)" }],
    }),
  );
  assert.throws(() =>
    releaseSchema.parse({
      ...valid,
      downloads: [{ ...valid.downloads[0], arch: undefined }],
    }),
  );
});

test("动态资料使用真实英文翻译，不回退中文或丢失占位", async () => {
  globalThis.window = {
    location: { href: "https://example.test/clients?lang=en" },
  };
  globalThis.localStorage = { getItem: () => null };
  try {
    const { t } = await import("../src/i18n/index.ts?catalog-english");
    const keys = apps.flatMap((a) => [
      a.description,
      a.priceDetails,
      ...a.aliases,
    ]);
    keys.push(
      ...releases.flatMap((r) => [r.note, r.source.label]).filter(Boolean),
    );
    for (const key of keys) {
      const translated = t(key);
      assert.doesNotMatch(translated, /[\u3400-\u9fff]/, key);
      assert.deepEqual(
        translated.match(/\{\d+\}/g) ?? [],
        key.match(/\{\d+\}/g) ?? [],
      );
    }
    assert.ok(
      filterApps(
        apps,
        releases,
        readFilters(new URLSearchParams("q=rule-based")),
        t,
      ).length,
    );
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
