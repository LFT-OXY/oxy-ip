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

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(
        `./fixtures/client-releases/batch-6/${name}.json`,
        import.meta.url,
      ),
    ),
  );
const now = "2026-09-17T04:00:00.000Z";
const old = (appId, platform) => ({
  appId,
  platform,
  maintenance: "manual",
  source: { label: "官方下载页", url: "https://example.org/" },
  fallback: { kind: "page", url: "https://example.org/" },
  downloads: [{ id: "page", kind: "page", url: "https://example.org/" }],
});
// 依据实际官方附件列表冻结完整集合，不从生产正则、生产快照或其计数推导。
const packages = {
  "flclash-patched": {
    android: [
      ["FlClash-0.8.123-android-arm64-v8a.apk", "arm64-v8a"],
      ["FlClash-0.8.123-android-armeabi-v7a.apk", "armeabi-v7a"],
      ["FlClash-0.8.123-android-x86_64.apk", "x86_64"],
    ],
    ios: [["FlClash-0.8.123-ios-arm64-unsigned.ipa", "arm64"]],
    windows: [
      ["FlClash-0.8.123-windows-amd64-setup.exe", "amd64"],
      ["FlClash-0.8.123-windows-amd64.zip", "amd64"],
      ["FlClash-0.8.123-windows-arm64-setup.exe", "arm64"],
      ["FlClash-0.8.123-windows-arm64.zip", "arm64"],
    ],
    macos: [
      ["FlClash-0.8.123-macos-amd64.dmg", "amd64"],
      ["FlClash-0.8.123-macos-arm64.dmg", "arm64"],
    ],
    linux: [
      ["FlClash-0.8.123-linux-amd64.AppImage", "amd64"],
      ["FlClash-0.8.123-linux-amd64.deb", "amd64"],
      ["FlClash-0.8.123-linux-amd64.rpm", "amd64"],
      ["FlClash-0.8.123-linux-amd64.tar.zst", "amd64"],
      ["FlClash-0.8.123-linux-amd64.zip", "amd64"],
      ["FlClash-0.8.123-linux-arm64.AppImage", "arm64"],
      ["FlClash-0.8.123-linux-arm64.deb", "arm64"],
      ["FlClash-0.8.123-linux-arm64.rpm", "arm64"],
      ["FlClash-0.8.123-linux-arm64.tar.zst", "arm64"],
      ["FlClash-0.8.123-linux-arm64.zip", "arm64"],
    ],
  },
  deckyclash: {
    "steam-deck": [
      ["DeckyClash-full.zip", "x86_64"],
      ["DeckyClash.zip", "x86_64"],
      ["Installer-DeckyClash.sh", "x86_64"],
    ],
  },
  "merlin-xrayui": { asus: [["asuswrt-merlin-xrayui.tar.gz", "noarch"]] },
  "nekobox-for-openwrt": {
    openwrt: [["luci-app-nekobox_2.0.8-cn_all.ipk", "noarch"]],
  },
  "aerobox-for-android": {
    android: [
      ["AeroBox-1.2.1-arm64-v8a.apk", "arm64-v8a"],
      ["AeroBox-1.2.1-armeabi-v7a.apk", "armeabi-v7a"],
      ["AeroBox-1.2.1-x86.apk", "x86"],
      ["AeroBox-1.2.1-x86_64.apk", "x86_64"],
    ],
  },
};
function assertPackages(row, expected) {
  assert.deepEqual(
    row.downloads.map((d) => [d.id, d.arch]),
    expected,
  );
}
test("第6批五条GitHub源逐平台完整附件与架构、版本隔离", () => {
  assert.deepEqual(
    githubSources.slice(79).map((s) => s.appId),
    Object.keys(packages),
  );
  for (const [id, platforms] of Object.entries(packages)) {
    const s = githubSources.find((s) => s.appId === id),
      raw = selectStableRelease(fixture(id), s.releaseTag);
    assert.deepEqual(Object.keys(s.platforms), Object.keys(platforms));
    for (const [p, expected] of Object.entries(platforms)) {
      const previous = old(id, p),
        row = parseRelease(raw, s, previous, now);
      assertPackages(row, expected);
      assert.equal(row.version, raw.tag_name);
      assert.equal(row.publishedAt, raw.published_at);
      assert.equal(row.lastCheckedAt, now);
      for (const d of row.downloads)
        assert.equal(
          d.url,
          raw.assets.find((a) => a.name === d.id).browser_download_url,
        );
      for (const flag of ["draft", "prerelease"])
        assert.throws(() =>
          parseRelease({ ...raw, [flag]: true }, s, previous, now),
        );
      assert.throws(() =>
        parseRelease({ ...raw, name: "Nightly" }, s, previous, now),
      );
      const wrong = structuredClone(raw);
      wrong.assets.forEach(
        (a) =>
          (a.browser_download_url = a.browser_download_url.replace(
            `/download/${raw.tag_name}/`,
            "/download/wrong/",
          )),
      );
      assert.throws(
        () => parseRelease(wrong, s, previous, now),
        /来源或版本不匹配/,
      );
      const beta = structuredClone(raw);
      beta.assets.forEach((a) => (a.name = "beta-" + a.name));
      assert.throws(() => parseRelease(beta, s, previous, now), /没有可确认/);
      if (s.architectures)
        assert.throws(() =>
          parseRelease(raw, { ...s, architectures: undefined }, previous, now),
        );
    }
  }
});
test("RC应用、内核组件、Nightly与Beta不冒充正式应用，等量错换也能发现", () => {
  const s = githubSources.find((s) => s.appId === "nekobox-for-openwrt");
  assert.equal(
    selectStableRelease(fixture("nekobox-for-openwrt"), s.releaseTag).tag_name,
    "2.0.8",
  );
  assert.throws(() =>
    parseRelease(
      fixture("nekobox-for-openwrt")[0],
      s,
      old(s.appId, "openwrt"),
      now,
    ),
  );
  assert.equal(
    selectStableRelease(fixture("neko-for-openwrt"), /^luci-app-neko_/),
    undefined,
  );
  const ms = githubSources.find((s) => s.appId === "merlin-xrayui");
  const row = parseRelease(
    fixture(ms.appId)[0],
    ms,
    old(ms.appId, "asus"),
    now,
  );
  assert.ok(!row.downloads.some((d) => d.id === "xrayui-datbuilder.tar.gz"));
  row.downloads[0].id = "xrayui-datbuilder.tar.gz";
  assert.throws(() => assertPackages(row, packages[ms.appId].asus));
  const fs = githubSources.find((s) => s.appId === "flclash-patched");
  const win = parseRelease(
    fixture(fs.appId)[0],
    fs,
    old(fs.appId, "windows"),
    now,
  );
  win.downloads[0].id = "FlClash-0.8.123-linux-amd64.zip";
  assert.throws(() => assertPackages(win, packages[fs.appId].windows));
  assert.equal(
    githubSources.some(
      (s) => s.appId === "tomoon" || s.appId === "neko-for-openwrt",
    ),
    false,
  );
});
const stores = {
  "clash-plus": [6774378761, "com.fluxflux.fluxflux"],
  panvell: [6780153714, "com.pandavs.clash"],
  oneboxm: [6759716475, "cloud.oneoh.networktools"],
  "xray-connect": [6746749546, "com.xrayConnect.xrayInstance"],
  vpn: [6746414734, "yvn.easydev.access"],
  vpnet: [6756558545, "com.gmm.proxyclient"],
  "susi-connect": [6759531907, "com.susinetwork.connect"],
  bclient: [6760386281, "com.bhub.client"],
  wisp: [6767654269, "mtrx.top.app"],
  xrayclient: [6738344532, "com.llp.app.making.MangoXray"],
  "pixel-proxy": [6754511751, "com.khrabryi.pixel.proxy"],
};
test("十一条iOS来源独立身份、Mac隔离及错误身份拒绝", () => {
  const selected = officialSources.filter((s) =>
    Object.hasOwn(stores, s.appId),
  );
  assert.deepEqual(
    selected.map((s) => s.appId),
    Object.keys(stores),
  );
  for (const [id, [trackId, bundleId]] of Object.entries(stores)) {
    const s = selected.find((s) => s.appId === id),
      raw = fixture(id + "-store");
    assert.equal(s.trackId, trackId);
    assert.equal(s.bundleId, bundleId);
    assert.deepEqual(s.platforms, { ios: true });
    const r = parseOfficialRelease(raw, s, old(id, "ios"), now);
    assert.equal(r.version, raw.results[0].version);
    assert.equal(r.publishedAt, raw.results[0].currentVersionReleaseDate);
    assert.equal(r.downloads[0].url, raw.results[0].trackViewUrl);
    assert.throws(() => parseOfficialRelease(raw, s, old(id, "macos"), now));
    for (const changes of [
      { trackId: 1 },
      { bundleId: "wrong" },
      { kind: "mac-software" },
      { version: "1.0-beta" },
    ])
      assert.throws(() =>
        parseOfficialRelease(
          { ...raw, results: [{ ...raw.results[0], ...changes }] },
          s,
          old(id, "ios"),
          now,
        ),
      );
  }
});
test("单源失败保留快照、其他来源继续，移动更新不覆盖Mac", async () => {
  const sources = githubSources.filter((s) =>
    ["deckyclash", "aerobox-for-android"].includes(s.appId),
  );
  const rows = [
    old("deckyclash", "steam-deck"),
    old("aerobox-for-android", "android"),
  ];
  const first = await syncReleases(rows, sources, {
    now,
    loadRelease: async (s) => selectStableRelease(fixture(s.appId)),
    checkLink: async () => "valid",
  });
  assert.deepEqual(first.errors, []);
  const next = await syncReleases(first.rows, sources, {
    now: "2026-09-18T00:00:00Z",
    loadRelease: async (s) => {
      if (s.appId === "deckyclash") throw Error("limited");
      return selectStableRelease(fixture(s.appId));
    },
    checkLink: async () => "valid",
  });
  assert.deepEqual(next.rows[0], first.rows[0]);
  assert.equal(next.rows[1].lastCheckedAt, "2026-09-18T00:00:00Z");
  assert.equal(next.errors.length, 1);
  const s = officialSources.find((s) => s.appId === "panvell"),
    prev = [old("panvell", "ios"), old("panvell", "macos")];
  const ok = await syncReleases(prev, [s], {
    now,
    parse: parseOfficialRelease,
    loadRelease: async () => fixture("panvell-store"),
    checkLink: async () => "valid",
  });
  assert.deepEqual(ok.rows[1], prev[1]);
  const fail = await syncReleases(ok.rows, [s], {
    parse: parseOfficialRelease,
    loadRelease: async () => ({ resultCount: 0, results: [] }),
    checkLink: async () => "valid",
  });
  assert.deepEqual(fail.rows, ok.rows);
  assert.equal(fail.errors.length, 1);
});
