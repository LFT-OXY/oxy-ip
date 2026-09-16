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
        `./fixtures/client-releases/batch-3/${name}.json`,
        import.meta.url,
      ),
    ),
  );
const now = "2026-09-16T18:00:00.000Z";
const previous = (appId, platform) => ({
  appId,
  platform,
  maintenance: "manual",
  source: { label: "官方下载页", url: "https://example.org/" },
  fallback: { kind: "page", url: "https://example.org/" },
  downloads: [{ id: "page", kind: "page", url: "https://example.org/" }],
});
// 按官方附件人工逐个计数；更新包、校验文件和测试平台的排除另有显式清单。
const counts = {
  "sing-box-for-apple": { ios: 1 },
  "gui-for-singbox": { windows: 3, macos: 2, linux: 2 },
  clashmac: { macos: 2 },
  throne: { windows: 5, macos: 3, linux: 6 },
  flowz: { windows: 2, macos: 2, linux: 2 },
  polaris: { windows: 2, macos: 2, linux: 2 },
  onebox: { windows: 2, macos: 2, linux: 1 },
  interstellar: { android: 5 },
  satelite: { windows: 2, macos: 2, linux: 1 },
  clashbar: { macos: 4 },
  kumoapp: { macos: 2 },
  "singboard-for-mac": { macos: 2 },
  irbox: { windows: 4, macos: 2, linux: 3 },
  netch: { windows: 1 },
  stelliberty: { windows: 4, macos: 4, linux: 10 },
  carton: { windows: 4, linux: 4 },
  "pandora-box": { windows: 4, macos: 2, linux: 4 },
  clashtui: { windows: 2, macos: 2, linux: 2 },
};
const sourceFor = (id) => githubSources.find((s) => s.appId === id);

test("第三批18条GitHub来源覆盖独立平台资产计数及正式版绑定", () => {
  assert.deepEqual(
    githubSources.slice(39).map((s) => s.appId),
    Object.keys(counts),
  );
  const excluded = {
    polaris: ["SHA256SUMS"],
    onebox: [
      "latest.json",
      "OneBox-1.4.39-1.x86_64.rpm",
      "OneBox_aarch64.app.tar.gz",
      "OneBox_x64.app.tar.gz",
    ],
    satelite: ["Satelite_aarch64.app.tar.gz", "Satelite_x64.app.tar.gz"],
    kumoapp: ["latest-amd64.yml", "latest-arm64.yml", "latest.yml"],
    carton: [
      "carton-0.6.2-linux-arm64-release-full.nupkg",
      "carton-0.6.2-linux-x64-release-full.nupkg",
      "releases.linux-arm64-release.json",
      "releases.linux-x64-release.json",
    ],
  };
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
      const wrong = structuredClone(raw);
      wrong.assets.forEach((a) => {
        a.browser_download_url = a.browser_download_url.replace(
          `/download/${raw.tag_name}/`,
          "/download/wrong/",
        );
      });
      assert.throws(
        () => parseRelease(wrong, source, old, now),
        /来源或版本不匹配/,
      );
      for (const mutate of [
        (r) => {
          r.prerelease = true;
        },
        (r) => {
          r.draft = true;
        },
        (r) => {
          r.name = "Nightly";
        },
      ]) {
        const bad = structuredClone(raw);
        mutate(bad);
        assert.throws(() => parseRelease(bad, source, old, now), /没有正式版/);
      }
    }
    for (const a of raw.assets) {
      if (a.name.endsWith(".sig") || a.name.endsWith(".sha256")) continue;
      assert.ok(
        selected.has(a.name) || excluded[id]?.includes(a.name),
        `${id}: 未说明的资产遗漏 ${a.name}`,
      );
    }
  }
});

test("Mac独立build渠道与Netch旧正式代际不被其他渠道覆盖", async () => {
  const source = sourceFor("singboard-for-mac"),
    raw = fixture("singboard-for-mac"),
    windows = fixture("singboard-for-mac-0");
  windows.published_at = "2026-09-17T00:00:00Z";
  assert.equal(selectStableRelease([windows, raw], source.releaseTag), raw);
  assert.throws(
    () => parseRelease(windows, source, previous(source.appId, "macos"), now),
    /渠道不匹配/,
  );
  const paths = [];
  const client = githubClient({
    token: "",
    fetcher: async (url) => {
      paths.push(url);
      return Response.json(
        url.includes("/assets?") ? raw.assets : [windows, raw],
      );
    },
  });
  assert.equal((await client.loadRelease(source)).tag_name, raw.tag_name);
  assert.ok(paths[1].includes(`/releases/${raw.id}/assets?`));
  const legacy = fixture("netch"),
    netch = sourceFor("netch");
  assert.equal(
    selectStableRelease(
      [{ ...legacy, tag_name: "2.0.0" }, legacy],
      netch.releaseTag,
    ),
    legacy,
  );
});

test("固定文件名、数字架构与多包变体保持真实身份", () => {
  for (const [id, platform, expected] of [
    ["sing-box-for-apple", "ios", "arm64"],
    ["clashmac", "macos", "universal"],
    ["netch", "windows", "x64"],
  ]) {
    const source = sourceFor(id),
      raw = fixture(id),
      old = previous(id, platform);
    assert.ok(
      parseRelease(raw, source, old, now).downloads.every(
        (d) => d.arch === expected,
      ),
    );
    assert.throws(() =>
      parseRelease(raw, { ...source, architectures: undefined }, old, now),
    );
  }
  const p = sourceFor("polaris");
  assert.deepEqual(
    parseRelease(
      fixture("polaris"),
      p,
      previous("polaris", "windows"),
      now,
    ).downloads.map((d) => d.arch),
    ["x64", "x64"],
  );
  assert.throws(() =>
    parseRelease(
      fixture("polaris"),
      { ...p, architectures: {} },
      previous("polaris", "windows"),
      now,
    ),
  );
  const throne = parseRelease(
    fixture("throne"),
    sourceFor("throne"),
    previous("throne", "windows"),
    now,
  );
  assert.deepEqual(
    throne.downloads.map((d) => d.arch),
    ["arm64", "universal", "x86", "x64", "x64"],
  );
  const clashbar = parseRelease(
    fixture("clashbar"),
    sourceFor("clashbar"),
    previous("clashbar", "macos"),
    now,
  );
  assert.deepEqual(
    clashbar.downloads.map((d) => d.arch),
    ["arm64", "arm64", "x64", "x64"],
  );
  assert.equal(
    clashbar.downloads.filter((d) => d.id.includes("no-core")).length,
    2,
  );
});

test("第三批6条Apple来源只更新iOS，错误身份失败而Mac人工信息不变", async () => {
  const ids = [
    "everywhere",
    "connect-now",
    "incy",
    "nextin",
    "tunna",
    "loon-lite",
  ];
  assert.deepEqual(
    officialSources.slice(17).map((s) => s.appId),
    ids,
  );
  for (const id of ids) {
    const source = officialSources.find((s) => s.appId === id),
      raw = fixture(`${id}-store`);
    const rows = [previous(id, "ios"), previous(id, "macos")];
    const result = await syncReleases(rows, [source], {
      now,
      parse: parseOfficialRelease,
      loadRelease: async () => raw,
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.rows[0].version, raw.results[0].version);
    assert.deepEqual(result.rows[1], rows[1]);
    const bad = structuredClone(raw);
    bad.results[0].bundleId = "wrong.id";
    assert.throws(
      () => parseOfficialRelease(bad, source, rows[0], now),
      /身份或入口不匹配/,
    );
  }
});

test("真实较新测试发行被排除；平台临时失败保留旧成功数据而其他平台继续", async () => {
  for (const id of ["throne", "clashtui", "stelliberty", "onebox"]) {
    const raw = fixture(`${id}-0`);
    assert.equal(selectStableRelease([raw]), undefined);
    const mislabeled = { ...raw, prerelease: false };
    assert.equal(selectStableRelease([mislabeled]), undefined);
  }
  const source = sourceFor("throne"),
    raw = fixture("throne");
  const initial = Object.keys(source.platforms).map((p) =>
    previous(source.appId, p),
  );
  const first = await syncReleases(initial, [source], {
    now,
    loadRelease: async () => raw,
    checkLink: async () => "valid",
  });
  const next = await syncReleases(first.rows, [source], {
    now: "2026-09-17T00:00:00Z",
    loadRelease: async () => raw,
    checkLink: async (url) => (url.includes("-macos") ? "temporary" : "valid"),
  });
  assert.deepEqual(next.rows[1], first.rows[1]);
  assert.equal(next.rows[0].lastCheckedAt, "2026-09-17T00:00:00Z");
  assert.equal(next.errors.length, 1);
});
