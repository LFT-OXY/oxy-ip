import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseOfficialRelease } from "../scripts/client-official-sync.mjs";
import {
  githubSources,
  officialSources,
} from "../scripts/client-release-sources.mjs";
import {
  parseRelease,
  selectStableRelease,
  syncReleases,
} from "../scripts/client-release-sync.mjs";
import { releases } from "../src/views/clients/data.ts";

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(
        `./fixtures/client-releases/batch-1/${name}.json`,
        import.meta.url,
      ),
    ),
  );
const now = "2026-09-16T12:00:00.000Z";
// 数量来自逐个读取官方发布资产，不从来源正则或生产快照反向生成。
const counts = {
  karing: { android: 3, windows: 2, macos: 2, linux: 3 },
  hiddify: { android: 4, windows: 3, macos: 2, linux: 3 },
  exclave: { android: 8 },
  "nekobox-for-android": { android: 4 },
  husi: { android: 4, windows: 4, macos: 1, linux: 10 },
  yumebox: { android: 2 },
  "shadowsocks-android": { android: 2 },
  onexray: { android: 1, windows: 4, macos: 1, linux: 4 },
  ssrvpn: { android: 1, windows: 1, macos: 1 },
  singcast: { android: 2, windows: 4, macos: 2, linux: 8 },
  "clash-nyanpasu": { windows: 2, macos: 2, linux: 3 },
  "clash-party": { windows: 10, macos: 4, linux: 6 },
  "gui-for-clash": { windows: 3, macos: 2, linux: 2 },
  sparkle: { windows: 4, macos: 2, linux: 9 },
  v2rayn: { windows: 6, macos: 4, linux: 9 },
  anyportal: { android: 6, windows: 2, macos: 1, linux: 1 },
};
const previous = (id, platform) =>
  releases.find((row) => row.appId === id && row.platform === platform);

test("本批16个 GitHub 来源的真实资产按平台隔离，固定名称也绑定发布标签", () => {
  assert.deepEqual(
    githubSources.slice(2, 18).map((source) => source.appId),
    Object.keys(counts),
  );
  for (const [id, platforms] of Object.entries(counts)) {
    const source = githubSources.find((source) => source.appId === id);
    const raw = fixture(id);
    assert.deepEqual(Object.keys(source.platforms), Object.keys(platforms));
    for (const [platform, count] of Object.entries(platforms)) {
      const row = parseRelease(raw, source, previous(id, platform), now);
      assert.equal(row.downloads.length, count, `${id}/${platform}`);
      assert.equal(row.version, raw.tag_name);
      assert.equal(row.publishedAt, raw.published_at);
      assert.equal(row.lastCheckedAt, now);
      for (const download of row.downloads) {
        assert.ok(download.arch && download.format);
        assert.ok(
          raw.assets.some(
            (asset) =>
              asset.name === download.id &&
              asset.browser_download_url === download.url,
          ),
        );
        assert.ok(
          download.url.includes(
            `/download/${encodeURIComponent(raw.tag_name)}/`,
          ),
        );
        assert.doesNotMatch(download.id, /\.(?:sig|sha256|zsync)$/);
      }
      const wrongVersion = structuredClone(raw);
      wrongVersion.assets = wrongVersion.assets.map((asset) => ({
        ...asset,
        browser_download_url: asset.browser_download_url.replace(
          `/download/${encodeURIComponent(raw.tag_name)}/`,
          "/download/other-version/",
        ),
      }));
      assert.throws(
        () => parseRelease(wrongVersion, source, previous(id, platform), now),
        /来源或版本不匹配/,
      );
    }
  }
});

test("固定包名架构只取官方逐平台映射，未配置时拒绝，不能用格式猜测", () => {
  for (const [id, expected] of Object.entries({
    hiddify: { macos: "universal" },
    yumebox: { android: "arm64-v8a" },
    ssrvpn: { android: "arm64-v8a", windows: "x64", macos: "arm64" },
    anyportal: { windows: "x64", macos: "universal", linux: "x64" },
  })) {
    const source = githubSources.find((source) => source.appId === id);
    for (const [platform, arch] of Object.entries(expected)) {
      const raw = fixture(id);
      const row = parseRelease(raw, source, previous(id, platform), now);
      assert.ok(row.downloads.every((download) => download.arch === arch));
      assert.throws(() =>
        parseRelease(
          raw,
          { ...source, architectures: undefined },
          previous(id, platform),
          now,
        ),
      );
    }
  }
});

test("真实 Nightly 不能因 prerelease=false 混入，ClashFest alpha 资产不作正式包", () => {
  const stable = fixture("shadowsocks-android");
  const nightly = fixture("shadowsocks-nightly");
  assert.equal(nightly.prerelease, false);
  assert.equal(selectStableRelease([nightly, stable]), stable);
  const raw = fixture("clashfest");
  assert.throws(
    () =>
      parseRelease(
        raw,
        {
          appId: "clashfest",
          repo: "Nemu-x/ClashFest",
          platforms: {
            android:
              /^clashfest-alpha-(arm64-v8a|armeabi-v7a|universal|x86|x86_64)\.(apk)$/,
          },
        },
        previous("clashfest", "android"),
        now,
      ),
    /没有可确认的平台安装包/,
  );
});

test("本批10个 App Store 真实身份不串配，iOS 不更新 Mac", async () => {
  const expected = [
    "surge",
    "quantumult-x",
    "loon",
    "clash-by-hako",
    "karing",
    "pharos-pro",
    "hiddify",
    "egern",
    "onexray",
    "streisand",
  ];
  assert.deepEqual(
    officialSources.slice(3, 13).map((source) => source.appId),
    expected,
  );
  for (const id of expected) {
    const source = officialSources.find((source) => source.appId === id);
    const raw = fixture(`${id}-store`);
    const rows = releases.filter((row) => row.appId === id);
    const result = await syncReleases(rows, [source], {
      loadRelease: async () => raw,
      parse: parseOfficialRelease,
      now,
    });
    assert.deepEqual(result.errors, []);
    const ios = result.rows.find((row) => row.platform === "ios");
    assert.equal(ios.version, raw.results[0].version);
    assert.equal(ios.lastCheckedAt, now);
    assert.equal(ios.downloads[0].kind, "store");
    assert.deepEqual(
      result.rows.filter((row) => row.platform !== "ios"),
      rows.filter((row) => row.platform !== "ios"),
    );
    const bad = structuredClone(raw);
    bad.results[0].bundleId = "wrong.app";
    assert.throws(
      () => parseOfficialRelease(bad, source, ios, now),
      /身份或入口不匹配/,
    );
  }
});

test("新增固定名来源失败保留成功快照与时间，其他平台继续更新", async () => {
  const source = githubSources.find((source) => source.appId === "ssrvpn");
  const rows = releases.filter((row) => row.appId === "ssrvpn");
  const result = await syncReleases(rows, [source], {
    loadRelease: async () => fixture("ssrvpn"),
    checkLink: async (url) => (url.endsWith(".dmg") ? "temporary" : "valid"),
    now,
  });
  assert.deepEqual(
    result.rows.find((row) => row.platform === "macos"),
    rows.find((row) => row.platform === "macos"),
  );
  assert.equal(
    result.rows.find((row) => row.platform === "android").lastCheckedAt,
    now,
  );
  assert.equal(result.errors.length, 1);
});

test("Linux 正式发行包的架构、格式与独立完整清单一致", () => {
  const expected = {
    husi: [
      ["fr.husi-2.1.4-1-aarch64.pkg.tar.zst", "aarch64", "pkg.tar.zst"],
      ["fr.husi-2.1.4-1-x86_64.pkg.tar.zst", "x86_64", "pkg.tar.zst"],
      ["fr.husi-2.1.4-1.aarch64.rpm", "aarch64", "rpm"],
      ["fr.husi-2.1.4-1.x86_64.rpm", "x86_64", "rpm"],
      ["fr.husi-2.1.4-linux-aarch64.AppImage", "aarch64", "AppImage"],
      ["fr.husi-2.1.4-linux-amd64.tar.zst", "amd64", "tar.zst"],
      ["fr.husi-2.1.4-linux-arm64.tar.zst", "arm64", "tar.zst"],
      ["fr.husi-2.1.4-linux-x86_64.AppImage", "x86_64", "AppImage"],
      ["fr.husi_2.1.4_amd64.deb", "amd64", "deb"],
      ["fr.husi_2.1.4_arm64.deb", "arm64", "deb"],
    ],
    "clash-nyanpasu": [
      ["clash-nyanpasu_1.6.1_amd64.deb", "amd64", "deb"],
      ["clash-nyanpasu-1.6.1-1.x86_64.rpm", "x86_64", "rpm"],
      ["clash-nyanpasu_1.6.1_amd64.AppImage", "amd64", "AppImage"],
    ],
  };
  for (const [id, packages] of Object.entries(expected)) {
    const source = githubSources.find((source) => source.appId === id);
    const raw = fixture(id);
    const row = parseRelease(raw, source, previous(id, "linux"), now);
    assert.deepEqual(
      row.downloads.map((item) => [item.id, item.arch, item.format]),
      packages,
    );
    const invalid = structuredClone(raw);
    invalid.assets = raw.assets.filter(
      (asset) => !packages.some(([name]) => name === asset.name),
    );
    assert.throws(
      () => parseRelease(invalid, source, previous(id, "linux"), now),
      /没有可确认的平台安装包/,
    );
  }
});

test("本批真实资产完整分类，未展示项必须有明确排除理由", () => {
  const excluded = {
    husi: new Set(["mapping-v2.1.4.zip"]),
    onexray: new Set(["OneXray-ios.ipa"]),
    ssrvpn: new Set(["SSRVPN-release-provenance.json"]),
    singcast: new Set(["singcast-1.2.2-ios.ipa"]),
    "clash-nyanpasu": new Set([
      "Clash.Nyanpasu.aarch64.app.tar.gz",
      "Clash.Nyanpasu_x64.app.tar.gz",
      "clash-nyanpasu_1.6.1_amd64.AppImage.tar.gz",
      "Clash.Nyanpasu_1.6.1_x64-setup.nsis.zip",
      "latest.json",
    ]),
    "clash-party": new Set(["latest.yml"]),
    sparkle: new Set(["latest.yml"]),
    v2rayn: new Set(["v2rayN-public-key.asc"]),
  };
  for (const id of Object.keys(counts)) {
    const raw = fixture(id);
    const source = githubSources.find((source) => source.appId === id);
    const selected = new Set(
      Object.keys(counts[id]).flatMap((platform) =>
        parseRelease(raw, source, previous(id, platform), now).downloads.map(
          (download) => download.id,
        ),
      ),
    );
    for (const asset of raw.assets) {
      if (/\.(?:sig|sha256|zsync)$/.test(asset.name)) continue;
      // Clash Party 同一发布附带的旧品牌别名包，不重复展示。
      if (id === "clash-party" && asset.name.startsWith("mihomo-party-")) {
        assert.ok(
          selected.has(asset.name.replace(/^mihomo-party-/, "clash-party-")),
        );
        continue;
      }
      assert.ok(
        selected.has(asset.name) || excluded[id]?.has(asset.name),
        `${id}: 未说明的遗漏 ${asset.name}`,
      );
    }
  }
});
