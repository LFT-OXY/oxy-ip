import assert from "node:assert/strict";
import { test } from "node:test";
import shadowrocket from "./fixtures/client-releases/shadowrocket-store.json" with { type: "json" };
import {
  officialClient,
  parseOfficialRelease,
} from "../scripts/client-official-sync.mjs";
import { officialSources } from "../scripts/client-release-sources.mjs";
import { syncReleases } from "../scripts/client-release-sync.mjs";
import { releases } from "../src/views/clients/data.ts";

const now = "2026-09-16T12:00:00.000Z";
const source = () => officialSources.find((s) => s.appId === "shadowrocket");
const storeClient = (raw) =>
  officialClient({ fetcher: async () => Response.json(raw) });

test("商店真实样本仅更新对应 iOS，Mac 与其他人工快照原样保留", async () => {
  const before = structuredClone(releases);
  const result = await syncReleases(releases, [source()], {
    ...storeClient(shadowrocket),
    parse: parseOfficialRelease,
    now,
  });
  assert.deepEqual(result.errors, []);
  const ios = result.rows.find(
    (r) => r.appId === "shadowrocket" && r.platform === "ios",
  );
  assert.equal(ios.version, "2.2.92");
  assert.equal(ios.publishedAt, "2026-09-07T04:14:10Z");
  assert.equal(ios.lastCheckedAt, now);
  assert.equal(ios.maintenance, "automatic");
  assert.deepEqual(ios.downloads, [
    {
      id: "app-store",
      kind: "store",
      url: "https://apps.apple.com/us/app/shadowrocket/id932747118?uo=4",
    },
  ]);
  assert.deepEqual(
    result.rows.filter((r) => r !== ios),
    before.filter((r) => !(r.appId === "shadowrocket" && r.platform === "ios")),
  );
  assert.deepEqual(releases, before);
});

test("Stash 官方 feed 的较新 Beta 不覆盖正式版，下载只属于 Mac 的 build 487", async () => {
  const { readFile } = await import("node:fs/promises");
  const xml = await readFile(
    new URL("./fixtures/client-releases/stash-appcast.xml", import.meta.url),
    "utf8",
  );
  const source = officialSources.find((s) => s.kind === "stash-macos");
  assert.ok(source, "已接入 Stash Mac 官方订阅源");
  const result = await syncReleases(releases, [source], {
    ...officialClient({ fetcher: async () => new Response(xml) }),
    checkLink: async () => "valid",
    parse: parseOfficialRelease,
    now,
  });
  assert.deepEqual(result.errors, []);
  const mac = result.rows.find(
    (r) => r.appId === "stash" && r.platform === "macos",
  );
  assert.equal(mac.version, "4.2.1");
  assert.equal(mac.publishedAt, "2026-07-15T23:30:50.000Z");
  assert.equal(mac.lastCheckedAt, now);
  assert.equal(mac.source.url, "https://mac-release.stash.ws/appcast.xml");
  assert.deepEqual(mac.downloads, [
    {
      id: "Stash-build-487.zip",
      kind: "direct",
      arch: "universal",
      format: "zip",
      url: "https://releases.stash.ws/Stash-build-487.zip",
    },
  ]);
  assert.deepEqual(
    result.rows.filter((r) => r !== mac),
    releases.filter((r) => !(r.appId === "stash" && r.platform === "macos")),
  );
});

test("商店无结果、错误身份、测试版本或异常入口保留已有值与成功时间", async () => {
  const previous = [
    {
      ...releases.find(
        (r) => r.appId === "shadowrocket" && r.platform === "ios",
      ),
      maintenance: "automatic",
      lastCheckedAt: "2026-09-10T00:00:00Z",
    },
  ];
  const app = shadowrocket.results[0];
  const variants = [
    { resultCount: 0, results: [] },
    { resultCount: 2, results: [app, app] },
    { resultCount: 0, results: [app] },
    ...[
      { trackId: 1596063349 },
      { bundleId: "wrong.app" },
      { kind: "mac-software" },
      { wrapperType: "track" },
      { version: "3.0-beta" },
      { version: "" },
      { trackViewUrl: "https://apps.apple.com/us/app/stash/id1596063349" },
      {
        trackViewUrl:
          "https://apps.apple.com.evil.test/us/app/shadowrocket/id932747118",
      },
      { trackViewUrl: "http://apps.apple.com/us/app/shadowrocket/id932747118" },
      {
        trackViewUrl: "https://apps.apple.com/cn/app/shadowrocket/id932747118",
      },
      { currentVersionReleaseDate: "not-a-date" },
    ].map((change) => ({ resultCount: 1, results: [{ ...app, ...change }] })),
  ];
  for (const raw of variants) {
    const result = await syncReleases(previous, [source()], {
      ...storeClient(raw),
      parse: parseOfficialRelease,
      now,
    });
    assert.deepEqual(result.rows, previous);
    assert.equal(result.errors.length, 1);
  }
});

test("商店新版本缺发布日期时留空，不能沿用旧版本日期或应用首发时间", async () => {
  const raw = structuredClone(shadowrocket);
  raw.results[0].version = "9.0";
  raw.results[0].releaseDate = "2015-04-14T02:09:18Z";
  delete raw.results[0].currentVersionReleaseDate;
  const result = await syncReleases(releases, [source()], {
    ...storeClient(raw),
    parse: parseOfficialRelease,
    now,
  });
  assert.deepEqual(result.errors, []);
  const ios = result.rows.find(
    (r) => r.appId === "shadowrocket" && r.platform === "ios",
  );
  assert.equal(ios.version, "9.0");
  assert.equal(ios.publishedAt, undefined);
  assert.equal(ios.lastCheckedAt, now);
});

test("商店 HTTP、JSON 及超时失败均不推进快照，其他商店正常更新", async () => {
  const { default: stash } = await import(
    "./fixtures/client-releases/stash-store.json",
    { with: { type: "json" } }
  );
  for (const failure of [403, 404, 429, 503, "timeout", "json", "empty"]) {
    const result = await syncReleases(
      releases,
      officialSources.filter(
        (s) =>
          ["shadowrocket", "stash"].includes(s.appId) && s.kind === "app-store",
      ),
      {
        ...officialClient({
          fetcher: async (url, init) => {
            const parsed = new URL(url);
            assert.equal(parsed.origin, "https://itunes.apple.com");
            assert.equal(parsed.pathname, "/lookup");
            assert.equal(parsed.searchParams.get("entity"), "software");
            assert.equal(parsed.searchParams.get("country"), "us");
            assert.ok(init.signal instanceof AbortSignal);
            assert.equal(
              init.headers,
              undefined,
              "商店请求不得携带 GitHub token",
            );
            if (parsed.searchParams.get("id") === "1596063349")
              return Response.json(stash);
            if (failure === "timeout") throw new Error("timeout");
            if (failure === "json") return new Response("<html>blocked</html>");
            if (failure === "empty")
              return Response.json({ resultCount: 0, results: [] });
            return new Response(null, { status: failure });
          },
        }),
        parse: parseOfficialRelease,
        now,
      },
    );
    const rocket = result.rows.filter((r) => r.appId === "shadowrocket");
    assert.deepEqual(
      rocket,
      releases.filter((r) => r.appId === "shadowrocket"),
    );
    const updated = result.rows.find(
      (r) => r.appId === "stash" && r.platform === "ios",
    );
    assert.equal(updated.version, "3.4.1");
    assert.equal(updated.lastCheckedAt, now);
    assert.equal(result.errors.length, 1);
  }
});

test("官网订阅空列表、全测试渠道、坏 XML、错版本包与错误平台均保留旧快照", async () => {
  const { readFile } = await import("node:fs/promises");
  const xml = await readFile(
    new URL("./fixtures/client-releases/stash-appcast.xml", import.meta.url),
    "utf8",
  );
  const source = officialSources.find((s) => s.kind === "stash-macos");
  const previous = [
    {
      ...releases.find((r) => r.appId === "stash" && r.platform === "macos"),
      lastCheckedAt: "2026-09-01T00:00:00Z",
      version: "4.1",
    },
  ];
  const variants = [
    "not xml",
    xml.replace("</rss>", ""),
    '<!DOCTYPE rss SYSTEM "https://example.com/entity">' + xml,
    xml.replace(/<item>[\s\S]*?<\/item>/g, ""),
    xml.replace("<title>4.2.1</title>", "<title>4.2.1 beta</title>"),
    xml.replace(
      "<title>4.2.1</title>",
      "<title>4.2.1</title><sparkle:channel>nightly</sparkle:channel>",
    ),
    xml.replace(
      "<title>4.2.1</title>",
      "<title>4.2.1</title><sparkle:channel>unknown</sparkle:channel>",
    ),
    xml.replace("Stash-build-487.zip", "Stash-build-497.zip"),
    xml.replace("Stash-build-487.zip", "Stash-latest.zip"),
    xml.replace(
      "https://releases.stash.ws/Stash-build-487.zip",
      "https://example.com/Stash-build-487.zip",
    ),
    xml.replace("<title>Stash</title>", "<title>Another app</title>"),
    xml.replace("Wed, 15 Jul 2026 16:30:50 -0700", "unknown"),
    xml.replace("<enclosure", '<enclosure sparkle:os="windows"'),
    xml.replace(
      "<title>4.2.1</title>",
      "<title>4.2.1</title><sparkle:hardwareRequirements>arm64</sparkle:hardwareRequirements>",
    ),
  ];
  for (const raw of variants) {
    const result = await syncReleases(previous, [source], {
      ...officialClient({ fetcher: async () => new Response(raw) }),
      checkLink: async () => "valid",
      parse: parseOfficialRelease,
      now,
    });
    assert.deepEqual(result.rows, previous);
    assert.equal(result.errors.length, 1);
  }
});

test("官网直链临时不可达保留旧版，确认失效才回退官网，人工 page 不冒充自动核验", async () => {
  const { readFile } = await import("node:fs/promises");
  const xml = await readFile(
    new URL("./fixtures/client-releases/stash-appcast.xml", import.meta.url),
    "utf8",
  );
  const source = officialSources.find((s) => s.kind === "stash-macos");
  for (const status of ["temporary", "missing", "valid"]) {
    const result = await syncReleases(releases, [source], {
      ...officialClient({ fetcher: async () => new Response(xml) }),
      checkLink: async () => status,
      parse: parseOfficialRelease,
      now,
    });
    const mac = result.rows.find(
      (r) => r.appId === "stash" && r.platform === "macos",
    );
    if (status === "temporary")
      assert.deepEqual(
        mac,
        releases.find((r) => r.appId === "stash" && r.platform === "macos"),
      );
    else if (status === "missing")
      assert.deepEqual(mac.downloads, [
        { id: "fallback", kind: "page", url: "https://stash.ws/download" },
      ]);
    else assert.equal(mac.downloads[0].kind, "direct");
    for (const platform of ["android", "windows"]) {
      const row = result.rows.find(
        (r) => r.appId === "stash" && r.platform === platform,
      );
      assert.equal(row.maintenance, "manual");
      assert.equal(row.version, undefined);
      assert.equal(row.lastCheckedAt, undefined);
      assert.deepEqual(row.downloads, [
        { id: "official-page", kind: "page", url: "https://stash.ws/download" },
      ]);
    }
  }
});
