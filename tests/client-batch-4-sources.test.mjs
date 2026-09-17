import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { githubSources } from "../scripts/client-release-sources.mjs";
import {
  parseRelease,
  selectStableRelease,
  syncReleases,
} from "../scripts/client-release-sync.mjs";

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(
        `./fixtures/client-releases/batch-4/${name}.json`,
        import.meta.url,
      ),
    ),
  );
const now = "2026-09-16T20:00:00.000Z";
const previous = (appId, platform) => ({
  appId,
  platform,
  maintenance: "manual",
  source: { label: "官方下载页", url: "https://example.org/" },
  fallback: { kind: "page", url: "https://example.org/" },
  downloads: [{ id: "page", kind: "page", url: "https://example.org/" }],
});
const sourceFor = (id) => githubSources.find((s) => s.appId === id);
// 逐个阅读官方资产后计数；不从生产配置或解析结果生成期望。
const counts = {
  "sing-box-windows": { windows: 6, macos: 2, linux: 3 },
  "nekobox-for-pc": { windows: 6, linux: 6 },
  xrayui: { windows: 4 },
  "swell-proxy": { windows: 2 },
  nekoray: { windows: 1, linux: 3 },
  "sudoku-desktop": { windows: 1, macos: 2, linux: 2 },
  v2raya: { windows: 2, linux: 26 },
  dae: { linux: 73 },
  daed: { linux: 28 },
  "nekobox-for-harmony": { harmonyos: 1 },
  ownbox: { android: 4 },
  openclash: { openwrt: 2 },
  passwall: { openwrt: 3 },
  passwall2: { openwrt: 2 },
  momo: { openwrt: 43 },
  clashbox: { harmonyos: 1 },
  shellcrash: { linux: 1, openwrt: 1, asus: 1 },
};

test("第4批17条GitHub来源完整匹配平台包计数且拒绝跨版和测试包", () => {
  assert.deepEqual(
    githubSources.slice(57, 74).map((s) => s.appId),
    Object.keys(counts),
  );
  for (const [id, platforms] of Object.entries(counts)) {
    const source = sourceFor(id),
      raw = fixture(id),
      selected = new Set();
    assert.deepEqual(Object.keys(source.platforms), Object.keys(platforms));
    for (const [platform, count] of Object.entries(platforms)) {
      const old = previous(id, platform),
        row = parseRelease(raw, source, old, now);
      assert.equal(row.downloads.length, count, `${id}/${platform}`);
      assert.equal(row.version, raw.tag_name);
      assert.equal(row.publishedAt, raw.published_at);
      assert.equal(row.lastCheckedAt, now);
      for (const d of row.downloads) {
        selected.add(d.id);
        assert.ok(
          raw.assets.some(
            (a) => a.name === d.id && a.browser_download_url === d.url,
          ),
        );
        assert.ok(d.arch && d.format);
      }
      const bad = structuredClone(raw);
      bad.assets.forEach((a) => {
        a.browser_download_url = a.browser_download_url.replace(
          `/download/${raw.tag_name}/`,
          "/download/wrong/",
        );
      });
      assert.throws(
        () => parseRelease(bad, source, old, now),
        /来源或版本不匹配/,
      );
      for (const flag of ["prerelease", "draft"])
        assert.throws(
          () => parseRelease({ ...raw, [flag]: true }, source, old, now),
          /没有正式版/,
        );
      assert.throws(
        () => parseRelease({ ...raw, name: "Nightly" }, source, old, now),
        /没有正式版/,
      );
    }
    assertAssetSelection(raw, selected, id);
  }
});

test("Windows便携架构不误标，Harmony HAP与OpenWrt APK不混入Android", () => {
  const s = sourceFor("sing-box-windows");
  const d = parseRelease(
    fixture(s.appId),
    s,
    previous(s.appId, "windows"),
    now,
  ).downloads;
  assert.deepEqual(
    d.map((a) => a.arch),
    ["arm64", "x64", "arm64", "arm64", "x64", "x64"],
  );
  for (const [id, platform, arch] of [
    ["clashbox", "harmonyos", "arm64-v8a"],
    ["nekobox-for-harmony", "harmonyos", "arm64-v8a"],
    ["openclash", "openwrt", "noarch"],
    ["passwall", "openwrt", "noarch"],
    ["passwall2", "openwrt", "noarch"],
    ["shellcrash", "linux", "noarch"],
  ]) {
    const source = sourceFor(id),
      old = previous(id, platform);
    assert.ok(
      parseRelease(fixture(id), source, old, now).downloads.every(
        (d) => d.arch === arch,
      ),
    );
    assert.throws(() =>
      parseRelease(
        fixture(id),
        { ...source, architectures: undefined },
        old,
        now,
      ),
    );
  }
  const xray = parseRelease(
    fixture("xrayui"),
    sourceFor("xrayui"),
    previous("xrayui", "windows"),
    now,
  );
  assert.equal(xray.downloads.filter((d) => d.id.includes("wasdk")).length, 2);
});

test("daed客户端与LSP组件渠道隔离，Nekoray不恢复旧Xray代际", () => {
  const source = sourceFor("daed"),
    raw = fixture("daed"),
    component = fixture("daed-component");
  assert.equal(selectStableRelease([component, raw], source.releaseTag), raw);
  assert.throws(
    () => parseRelease(component, source, previous("daed", "linux"), now),
    /渠道不匹配/,
  );
  const neko = sourceFor("nekoray"),
    legacy = { ...fixture("nekoray"), tag_name: "3.26" };
  assert.equal(selectStableRelease([legacy], neko.releaseTag), undefined);
});

test("真实starter资产使单源保守失败；临时HEAD失败不冒作自动成功", async () => {
  const source = sourceFor("nekobox-for-pc"),
    rows = [previous(source.appId, "windows"), previous(source.appId, "linux")];
  const result = await syncReleases(rows, [source], {
    now,
    loadRelease: async () => fixture("nekobox-for-pc-incomplete"),
    checkLink: async () => "valid",
  });
  assert.equal(result.errors.length, 2);
  assert.deepEqual(result.rows, rows);
  const other = sourceFor("sing-box-windows"),
    initial = Object.keys(other.platforms).map((p) => previous(other.appId, p));
  const first = await syncReleases(initial, [other], {
    now,
    loadRelease: async () => fixture(other.appId),
    checkLink: async () => "valid",
  });
  const next = await syncReleases(first.rows, [other], {
    now: "2026-09-17T00:00:00Z",
    loadRelease: async () => fixture(other.appId),
    checkLink: async (url) => (url.endsWith(".dmg") ? "temporary" : "valid"),
  });
  assert.deepEqual(next.rows[1], first.rows[1]);
  assert.equal(next.rows[0].lastCheckedAt, "2026-09-17T00:00:00Z");
  assert.equal(next.errors.length, 1);
});

// 独立按官方附件用途排除；不读取生产匹配规则，也不依赖已选择的结果。
const excludedAsset =
  /\.dgst$|\.sha256(?:sum|\.txt)?$|^SHA256SUMS|^cosign\.pub$|^nekobox-unified-source-|\.nupkg$|^dae-full-src|^daed-full-src|^web\.(zip|tar\.gz)$|^v2raya(?:_core)?_(darwin|freebsd|linux|openbsd|windows)_|luci-i18n-|SNAPSHOT/;
function assertAssetSelection(raw, selected, id) {
  const excluded = new Set(
    raw.assets.filter((a) => excludedAsset.test(a.name)).map((a) => a.name),
  );
  const expected = new Set(
    raw.assets.filter((a) => !excludedAsset.test(a.name)).map((a) => a.name),
  );
  assert.deepEqual(
    [...selected].filter((name) => excluded.has(name)),
    [],
    `${id}: 排除包不可被选入`,
  );
  assert.deepEqual(
    [...selected].sort(),
    [...expected].sort(),
    `${id}: 安装包实际集合不符`,
  );
}

test("资产等量错换也会失败，不能用源码包替代安装包", () => {
  const raw = fixture("daed");
  const selected = new Set(
    raw.assets.filter((a) => !excludedAsset.test(a.name)).map((a) => a.name),
  );
  assertAssetSelection(raw, selected, "daed");
  selected.delete("daed-linux-arm64.zip");
  selected.add("daed-full-src.zip");
  assert.throws(
    () => assertAssetSelection(raw, selected, "daed"),
    /排除包不可被选入/,
  );
});

test("NekoBox失败后成功不残留本轮失败文案，永久平台条件仍保留", async () => {
  const note =
    "TUN 模式需要管理员授权；此条目为 qr243vbi 维护的 Windows / Linux 分支。";
  const production = JSON.parse(
    readFileSync(
      new URL("../src/views/clients/releases.json", import.meta.url),
    ),
  );
  for (const platform of ["windows", "linux"])
    assert.equal(
      production.find(
        (r) => r.appId === "nekobox-for-pc" && r.platform === platform,
      ).note,
      note,
    );
  const source = sourceFor("nekobox-for-pc"),
    rows = ["windows", "linux"].map((p) => ({
      ...previous(source.appId, p),
      note,
    }));
  const failed = await syncReleases(rows, [source], {
    now,
    loadRelease: async () => fixture("nekobox-for-pc-incomplete"),
    checkLink: async () => "valid",
  });
  assert.equal(failed.errors.length, 2);
  assert.deepEqual(failed.rows, rows);
  const recovered = await syncReleases(failed.rows, [source], {
    now,
    loadRelease: async () => fixture("nekobox-for-pc"),
    checkLink: async () => "valid",
  });
  assert.deepEqual(recovered.errors, []);
  for (const row of recovered.rows) {
    assert.equal(row.maintenance, "automatic");
    assert.equal(row.lastCheckedAt, now);
    assert.equal(row.note, note);
    assert.doesNotMatch(row.note, /失败|保留官方页面/);
  }
});
