import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseOfficialRelease } from "../scripts/client-official-sync.mjs";
import {
  githubSources,
  officialSources,
} from "../scripts/client-release-sources.mjs";
import {
  githubClient,
  parseRelease,
  selectStableRelease,
  syncReleases,
} from "../scripts/client-release-sync.mjs";

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(
        `./fixtures/client-releases/batch-2/${name}.json`,
        import.meta.url,
      ),
    ),
  );
const now = "2026-09-16T18:00:00.000Z";
const previous = (id, platform) => ({
  appId: id,
  platform,
  maintenance: "manual",
  source: { label: "官方下载页", url: "https://example.org/" },
  fallback: { kind: "page", url: "https://example.org/" },
  downloads: [{ id: "page", kind: "page", url: "https://example.org/" }],
});
// 人工逐项读取官方资产得出的数量，不从匹配正则生成。
const counts = {
  "clashx-meta": { macos: 1 },
  v2rayu: { macos: 2 },
  surfboard: { android: 5 },
  "xray-gui": { android: 4 },
  "clash-mi": { android: 3, windows: 2, macos: 1, linux: 3 },
  flclashx: { android: 4, windows: 4, macos: 2, linux: 4 },
  "mikubox-for-android": { android: 4 },
  kunbox: { android: 2 },
  "nekobox-by-starifly": { android: 4 },
  "happ-android": { android: 1 },
  "happ-proxy": { windows: 2, macos: 1, linux: 6 },
  "clash-xiaoy": { windows: 2, macos: 2, linux: 3 },
  monadbox: { android: 5 },
  vproxy: { android: 3, windows: 1, linux: 4 },
  flyclash: { windows: 2, macos: 2 },
  sudodroid: { android: 3 },
  "box-for-root": { android: 1 },
  surfing: { android: 1 },
  box4magisk: { android: 1 },
  "box-for-android": { android: 1 },
  akashaproxy: { android: 1 },
};
const sourceFor = (name) =>
  githubSources.find((s) =>
    name === "happ-android"
      ? s.repo === "Happ-proxy/happ-android"
      : s.appId === name && s.repo !== "Happ-proxy/happ-android",
  );

test("第二批21条GitHub配置匹配真实平台资产，错误版本URL拒绝且无遗漏", () => {
  assert.deepEqual(
    githubSources.slice(18, 39).map((s) => s.repo),
    Object.keys(counts).map((name) => sourceFor(name)?.repo),
  );
  const excluded = {
    v2rayu: ["V2rayU-dSYM.zip"],
    "happ-android": ["Happ_beta.apk"],
    vproxy: ["appcast.xml", "VX.dmg"],
    "box-for-root": ["BFR-20250905-1227-release.apk"],
  };
  for (const [name, platforms] of Object.entries(counts)) {
    const source = sourceFor(name),
      raw = fixture(name),
      selected = new Set();
    assert.deepEqual(Object.keys(source.platforms), Object.keys(platforms));
    for (const [platform, count] of Object.entries(platforms)) {
      const old = previous(source.appId, platform);
      const row = parseRelease(raw, source, old, now);
      assert.equal(row.downloads.length, count, `${name}/${platform}`);
      assert.equal(row.version, raw.tag_name);
      assert.equal(row.publishedAt, raw.published_at);
      assert.equal(row.lastCheckedAt, now);
      for (const download of row.downloads) {
        selected.add(download.id);
        assert.ok(
          raw.assets.some(
            (asset) =>
              asset.name === download.id &&
              asset.browser_download_url === download.url,
          ),
        );
        assert.ok(download.arch && download.format);
      }
      const wrong = structuredClone(raw);
      wrong.assets.forEach(
        (asset) =>
          (asset.browser_download_url = asset.browser_download_url.replace(
            `/download/${raw.tag_name}/`,
            "/download/other/",
          )),
      );
      assert.throws(
        () => parseRelease(wrong, source, old, now),
        /来源或版本不匹配/,
      );
    }
    for (const asset of raw.assets) {
      if (asset.name.endsWith(".sha256")) continue;
      assert.ok(
        selected.has(asset.name) || excluded[name]?.includes(asset.name),
        `${name}: 未说明的资产遗漏 ${asset.name}`,
      );
    }
  }
});

test("Surfboard独立手机渠道贯穿API选择与解析，TV更新不能覆盖手机", async () => {
  const source = sourceFor("surfboard"),
    mobile = fixture("surfboard"),
    tv = fixture("surfboard-tv");
  tv.published_at = "2026-09-17T00:00:00Z";
  assert.equal(selectStableRelease([tv, mobile], source.releaseTag), mobile);
  assert.throws(
    () => parseRelease(tv, source, previous("surfboard", "android"), now),
    /渠道不匹配/,
  );
  const paths = [];
  const client = githubClient({
    token: "",
    fetcher: async (url) => {
      paths.push(url);
      return Response.json(
        url.includes("/assets?") ? mobile.assets : [tv, mobile],
      );
    },
  });
  const raw = await client.loadRelease(source);
  assert.equal(raw.tag_name, mobile.tag_name);
  assert.ok(paths[1].includes(`/releases/${mobile.id}/assets?`));
  assert.equal(selectStableRelease([tv], source.releaseTag), undefined);
});

test("数字架构须经来源映射，通用包与Root脚本包不从扩展名猜CPU", () => {
  const source = sourceFor("xray-gui"),
    raw = fixture("xray-gui"),
    old = previous("xray-gui", "android");
  assert.deepEqual(
    parseRelease(raw, source, old, now).downloads.map((d) => d.arch),
    ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"],
  );
  assert.throws(() =>
    parseRelease(raw, { ...source, architectureAliases: {} }, old, now),
  );
  const v = sourceFor("v2rayu");
  assert.deepEqual(
    parseRelease(
      fixture("v2rayu"),
      v,
      previous("v2rayu", "macos"),
      now,
    ).downloads.map((d) => d.arch),
    ["universal", "universal"],
  );
  for (const [id, arch] of [
    ["box-for-root", "noarch"],
    ["box4magisk", "noarch"],
    ["box-for-android", "noarch"],
    ["surfing", "arm64-v8a"],
    ["akashaproxy", "arm64-v8a"],
  ]) {
    const s = sourceFor(id),
      p = previous(id, "android");
    assert.equal(parseRelease(fixture(id), s, p, now).downloads[0].arch, arch);
    assert.throws(() =>
      parseRelease(fixture(id), { ...s, architectures: undefined }, p, now),
    );
  }
});

test("预发布标记为false的FlyClash Alpha仍拒绝，Miku旧正式代际不随新主分支漂移", () => {
  const alpha = fixture("flyclash-android-alpha");
  assert.equal(alpha.prerelease, false);
  assert.equal(selectStableRelease([alpha]), undefined);
  const source = sourceFor("mikubox-for-android"),
    raw = fixture("mikubox-for-android");
  assert.equal(selectStableRelease([raw], source.releaseTag), raw);
  assert.equal(
    selectStableRelease([{ ...raw, tag_name: "2.0.0" }], source.releaseTag),
    undefined,
  );
});

test("第二批4个商店源身份独立，人工Mac与其他平台不被iOS覆盖", async () => {
  const ids = ["clash-mi", "happ-proxy", "vproxy", "anywhere"];
  assert.deepEqual(
    officialSources.slice(13, 17).map((s) => s.appId),
    ids,
  );
  for (const id of ids) {
    const source = officialSources.find((s) => s.appId === id),
      raw = fixture(`${id}-store`);
    const rows = [previous(id, "ios"), previous(id, "macos")];
    const result = await syncReleases(rows, [source], {
      loadRelease: async () => raw,
      parse: parseOfficialRelease,
      now,
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.rows[0].version, raw.results[0].version);
    assert.deepEqual(result.rows[1], rows[1]);
    const bad = structuredClone(raw);
    bad.results[0].bundleId = "other.app";
    assert.throws(
      () => parseOfficialRelease(bad, source, rows[0], now),
      /身份或入口不匹配/,
    );
  }
});

test("新来源临时失败保留快照，其他平台继续成功", async () => {
  const source = sourceFor("clash-mi"),
    raw = fixture("clash-mi");
  const rows = Object.keys(source.platforms).map((platform) =>
    previous(source.appId, platform),
  );
  const first = await syncReleases(rows, [source], {
    loadRelease: async () => raw,
    checkLink: async () => "valid",
    now,
  });
  const result = await syncReleases(first.rows, [source], {
    loadRelease: async () => raw,
    checkLink: async (url) => (url.endsWith(".dmg") ? "temporary" : "valid"),
    now: "2026-09-17T00:00:00Z",
  });
  assert.deepEqual(
    result.rows.find((r) => r.platform === "macos"),
    first.rows.find((r) => r.platform === "macos"),
  );
  assert.equal(result.rows[0].lastCheckedAt, "2026-09-17T00:00:00Z");
  assert.equal(result.errors.length, 1);
});
