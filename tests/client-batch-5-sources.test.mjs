import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseOfficialRelease } from "../scripts/client-official-sync.mjs";
import {
  githubSources,
  officialSources,
} from "../scripts/client-release-sources.mjs";
import { parseRelease, syncReleases } from "../scripts/client-release-sync.mjs";

const fixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(
        `./fixtures/client-releases/batch-5/${name}.json`,
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
// 逐个平台冻结真实官方完整包与架构；不从生产正则或输出计数派生。
const packages = {
  "open-box": {
    openwrt: [
      ["open-box-v0.1.201-linux-arm64.tar.gz", "arm64"],
      ["open-box-v0.1.201-linux-x64.tar.gz", "x64"],
    ],
  },
  "shadowsocksr-plus": {
    openwrt: [
      ["luci-app-ssr-plus-196-r9.apk", "noarch"],
      ["luci-app-ssr-plus_196-r9_all.ipk", "noarch"],
    ],
  },
  outline: { windows: [["Outline-Client.exe", "x86"]] },
  "meow-android": { android: [["meow-v1.0.8-universal.apk", "universal"]] },
  paws: {
    harmonyos: [
      ["Paws-1.1.0-arm64-v8a-unsigned.hap", "arm64-v8a"],
      ["Paws-1.1.0-armeabi-v7a-unsigned.hap", "armeabi-v7a"],
      ["Paws-1.1.0-x86_64-unsigned.hap", "x86_64"],
    ],
  },
};
function assertPackages(row, expected) {
  assert.deepEqual(
    row.downloads.map((d) => [d.id, d.arch]),
    expected,
  );
}
test("第5批五条GitHub来源只匹配官方完整包，不混入组件或其他平台", () => {
  assert.deepEqual(
    githubSources.slice(74, 79).map((s) => s.appId),
    Object.keys(packages),
  );
  for (const [id, platforms] of Object.entries(packages)) {
    const raw = fixture(id),
      source = githubSources.find((s) => s.appId === id);
    assert.deepEqual(Object.keys(source.platforms), Object.keys(platforms));
    for (const [platform, expected] of Object.entries(platforms)) {
      const old = previous(id, platform),
        row = parseRelease(raw, source, old, now);
      assertPackages(row, expected);
      assert.equal(row.version, raw.tag_name);
      assert.equal(row.publishedAt, raw.published_at);
      assert.equal(row.lastCheckedAt, now);
      for (const d of row.downloads)
        assert.equal(
          d.url,
          raw.assets.find((a) => a.name === d.id).browser_download_url,
        );
      const bad = structuredClone(raw);
      bad.assets.forEach(
        (a) =>
          (a.browser_download_url = a.browser_download_url.replace(
            `/download/${raw.tag_name}/`,
            "/download/wrong/",
          )),
      );
      assert.throws(
        () => parseRelease(bad, source, old, now),
        /来源或版本不匹配/,
      );
      for (const flag of ["draft", "prerelease"])
        assert.throws(() =>
          parseRelease({ ...raw, [flag]: true }, source, old, now),
        );
      assert.throws(() =>
        parseRelease({ ...raw, name: "Nightly" }, source, old, now),
      );
      if (source.architectures)
        assert.throws(() =>
          parseRelease(raw, { ...source, architectures: undefined }, old, now),
        );
      const beta = structuredClone(raw);
      beta.assets.forEach((a) => (a.name = "beta-" + a.name));
      assert.throws(() => parseRelease(beta, source, old, now), /没有可确认/);
    }
  }
});
test("等量组件错换和跨平台错归都不能靠包计数蒙混", () => {
  const raw = fixture("open-box"),
    source = githubSources.find((s) => s.appId === "open-box");
  const row = parseRelease(raw, source, previous("open-box", "openwrt"), now);
  assertPackages(row, packages["open-box"].openwrt);
  const wrong = structuredClone(row);
  wrong.downloads[0].id = "open-box-v0.1.201-linux-arm64-kernel.tar.gz";
  assert.throws(() => assertPackages(wrong, packages["open-box"].openwrt));
  const outline = parseRelease(
    fixture("outline"),
    githubSources.find((s) => s.appId === "outline"),
    previous("outline", "windows"),
    now,
  );
  outline.downloads[0].id = "Outline-Client.AppImage";
  assert.throws(() => assertPackages(outline, packages.outline.windows));
});
const stores = {
  "orbit-x": [6762544103, "com.TKPUGQFAD8.orbitx"],
  v2box: [6446814690, "hossin.asaadi.V2Box"],
  outline: [1356177741, "org.outline.ios.client"],
  potatso: [1239860606, "com.touchingapp.potatsolite"],
  onlynet: [6502987522, "com.gala.speedgoup"],
  jamjams: [6477182037, "net.fiberlogic.jamjams"],
  rabbithole: [6683309629, "com.rabbithole.RabbitHole"],
  shadowclash: [6760091330, "com.fuzzypn.hinet"],
  "bamboo-dragonfly": [6473621095, "com.flhcc.BambooDragonfly"],
  "oneok-vpn": [6761477404, "com.OneOk.Connect"],
  xtunnel: [6741881458, "com.haolin.shadowx"],
  v2rage: [6761075402, "ac.rage.v2"],
  openvxs: [6757167153, "com.openvxs.vpn"],
  "dash-vpn": [6758860923, "com.dashvpn.mac"],
  ship: [6736895153, "com.yellow.clash"],
  voxiproxytun: [6768408266, "com.voxiproxy.VoxiProxyTun"],
  vpsus: [6761466149, "com.vpsus.vpsus"],
  "clash-lite": [6761357475, "com.Hood.ClashLite"],
  linkclashx: [6757075299, "com.mielink.nexuslink"],
  meow: [6778303404, "com.tangzixiang.meow"],
};
test("二十条iOS来源冻结身份；Mac软件与兼容Mac均不自动混用", () => {
  const selected = officialSources.filter((s) =>
    Object.hasOwn(stores, s.appId),
  );
  assert.deepEqual(
    selected.map((s) => s.appId),
    Object.keys(stores),
  );
  assert.equal(
    officialSources.some((s) => s.appId === "baoliandeng"),
    false,
  );
  for (const [id, [trackId, bundleId]] of Object.entries(stores)) {
    const s = selected.find((s) => s.appId === id),
      raw = fixture(id + "-store"),
      old = previous(id, "ios");
    assert.deepEqual(s.platforms, { ios: true });
    assert.equal(s.trackId, trackId);
    assert.equal(s.bundleId, bundleId);
    const row = parseOfficialRelease(raw, s, old, now);
    assert.equal(row.version, raw.results[0].version);
    assert.equal(row.publishedAt, raw.results[0].currentVersionReleaseDate);
    assert.equal(row.downloads[0].kind, "store");
    assert.equal(row.downloads[0].url, raw.results[0].trackViewUrl);
    assert.throws(
      () => parseOfficialRelease(raw, s, previous(id, "macos"), now),
      /不支持的商店平台/,
    );
    for (const changes of [
      { trackId: 1 },
      { bundleId: "wrong" },
      { kind: "mac-software" },
      { version: "1.0-beta" },
    ]) {
      assert.throws(() =>
        parseOfficialRelease(
          { ...raw, results: [{ ...raw.results[0], ...changes }] },
          s,
          old,
          now,
        ),
      );
    }
  }
});
test("来源失败保留旧值和时间，其他来源继续，iOS更新不覆盖Mac", async () => {
  const sources = githubSources.filter((s) =>
    ["open-box", "paws"].includes(s.appId),
  );
  const rows = [previous("open-box", "openwrt"), previous("paws", "harmonyos")];
  const first = await syncReleases(rows, sources, {
    now,
    loadRelease: async (s) => fixture(s.appId),
    checkLink: async () => "valid",
  });
  assert.deepEqual(first.errors, []);
  const next = await syncReleases(first.rows, sources, {
    now: "2026-09-17T00:00:00Z",
    loadRelease: async (s) => {
      if (s.appId === "open-box") throw Error("rate limit");
      return fixture(s.appId);
    },
    checkLink: async () => "valid",
  });
  assert.deepEqual(next.rows[0], first.rows[0]);
  assert.equal(next.rows[1].lastCheckedAt, "2026-09-17T00:00:00Z");
  assert.equal(next.errors.length, 1);
  const s = officialSources.find((s) => s.appId === "v2box");
  const old = [previous("v2box", "ios"), previous("v2box", "macos")];
  const ok = await syncReleases(old, [s], {
    now,
    parse: parseOfficialRelease,
    loadRelease: async () => fixture("v2box-store"),
    checkLink: async () => "valid",
  });
  assert.equal(ok.rows[0].lastCheckedAt, now);
  assert.deepEqual(ok.rows[1], old[1]);
  const failed = await syncReleases(ok.rows, [s], {
    parse: parseOfficialRelease,
    loadRelease: async () => ({ resultCount: 0, results: [] }),
    checkLink: async () => "valid",
  });
  assert.deepEqual(failed.rows, ok.rows);
  assert.equal(failed.errors.length, 1);
});

test("Outline Windows人工正式快照保留已核实直链，分页超限不清空或冒充自动成功", async () => {
  const production = JSON.parse(
    readFileSync(
      new URL("../src/views/clients/releases.json", import.meta.url),
    ),
  );
  const row = production.find(
    (r) => r.appId === "outline" && r.platform === "windows",
  );
  const base = "https://github.com/OutlineFoundation/outline-apps/releases";
  assert.equal(row.maintenance, "manual");
  assert.equal(row.version, "v1.10.1");
  assert.equal(row.publishedAt, "2023-03-20T21:16:19Z");
  assert.equal(row.lastCheckedAt, undefined);
  assert.deepEqual(row.source, {
    label: "GitHub Release",
    url: `${base}/tag/v1.10.1`,
  });
  assert.deepEqual(row.fallback, { kind: "page", url: `${base}/tag/v1.10.1` });
  assert.deepEqual(row.downloads, [
    {
      id: "Outline-Client.exe",
      kind: "direct",
      url: `${base}/download/v1.10.1/Outline-Client.exe`,
      arch: "x86",
      format: "exe",
    },
  ]);
  const source = githubSources.find((s) => s.appId === "outline");
  for (const status of ["valid", "temporary"]) {
    const result = await syncReleases([row], [source], {
      now,
      loadRelease: async () => {
        throw Error("GitHub 分页超过安全上限，保留旧快照");
      },
      checkLink: async () => status,
    });
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0].message, /分页超过安全上限/);
    assert.deepEqual(result.rows, [row]);
  }
});
