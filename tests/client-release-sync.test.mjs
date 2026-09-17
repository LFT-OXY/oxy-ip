import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  readdir,
  writeFile,
  rm,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import flclash from "./fixtures/client-releases/flclash.json" with { type: "json" };
import shadowrocket from "./fixtures/client-releases/shadowrocket-store.json" with { type: "json" };
import stash from "./fixtures/client-releases/stash-store.json" with { type: "json" };
import v2rayng from "./fixtures/client-releases/v2rayng.json" with { type: "json" };
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
import { releases } from "../src/views/clients/data.ts";

const now = "2026-09-16T12:00:00.000Z";
const old = releases.filter((r) => ["flclash", "v2rayng"].includes(r.appId));
const source = githubSources[0];
const loadRelease = async (s) => (s.appId === "flclash" ? flclash : v2rayng);
const checkLink = async () => "valid";

test("真实官方样本匹配四平台架构格式，签名和校验文件不作为包", () => {
  const expected = { android: 3, windows: 4, macos: 2, linux: 6 };
  for (const [platform, count] of Object.entries(expected)) {
    const row = parseRelease(
      flclash,
      source,
      old.find((r) => r.platform === platform),
      now,
    );
    assert.equal(row.downloads.length, count);
    assert.equal(row.version, "v0.8.98");
    assert.equal(row.publishedAt, flclash.published_at);
    assert.equal(row.lastCheckedAt, now);
    assert.ok(row.downloads.every((d) => d.url.includes(`/v0.8.98/${d.id}`)));
  }
  const row = parseRelease(v2rayng, githubSources[1], old.at(-1), now);
  assert.deepEqual(
    row.downloads.map((d) => d.arch),
    ["arm64-v8a", "armeabi-v7a", "x86", "x86_64"],
  );
});

test("人工变异样本：排除草稿、预发布、测试标签/名称，按发布时间选择", () => {
  const invalid = [
    { draft: true, published_at: null },
    { prerelease: true },
    { tag_name: "v9.0.0-beta1" },
    { tag_name: "v9.0.0rc1" },
    { name: "Nightly Build" },
    { name: "Preview" },
  ].map((change) => ({ ...flclash, ...change }));
  assert.equal(selectStableRelease(invalid), undefined);
  assert.equal(selectStableRelease([...invalid, flclash]), flclash);
  assert.equal(
    selectStableRelease([
      { ...flclash, published_at: "2020-01-01T00:00:00Z" },
      flclash,
    ]),
    flclash,
  );
});

test("人工变异样本：不同版本、未知架构、测试包、非官方 URL 不得混入", () => {
  const asset = flclash.assets[0];
  for (const change of [
    { name: "FlClash-0.8.97-android-arm64-v8a.apk" },
    { name: "FlClash-0.8.98-android-mips.apk" },
    { name: "FlClash-0.8.98-android-arm64-v8a-beta.apk" },
    { browser_download_url: "https://example.com/file.apk" },
    {
      browser_download_url: asset.browser_download_url.replace(
        "v0.8.98/",
        "v0.8.97/",
      ),
    },
  ]) {
    assert.throws(() =>
      parseRelease(
        { ...flclash, assets: [{ ...asset, ...change }] },
        source,
        old[0],
        now,
      ),
    );
  }
});

test("单来源失败/无正式版保留旧值和核验时间，其他来源继续且不修改输入", async () => {
  const before = structuredClone(old);
  for (const failure of [undefined, new Error("HTTP 429")]) {
    const result = await syncReleases(old, githubSources, {
      now,
      checkLink,
      loadRelease: async (s) => {
        if (s.appId === "flclash") {
          if (failure) throw failure;
          return undefined;
        }
        return v2rayng;
      },
    });
    assert.deepEqual(result.rows.slice(0, 4), old.slice(0, 4));
    assert.equal(result.rows.at(-1).lastCheckedAt, now);
    assert.equal(result.errors.length, 4);
  }
  assert.deepEqual(old, before);
});

test("单平台缺包/临时访问失败保留全平台旧快照，不阻止其他平台", async () => {
  for (const mode of ["missing", "temporary"]) {
    const result = await syncReleases(old, githubSources, {
      now,
      loadRelease: async (s) => {
        const release = await loadRelease(s);
        return mode === "missing" && s.appId === "flclash"
          ? {
              ...release,
              assets: release.assets.filter((a) => !a.name.includes("android")),
            }
          : release;
      },
      checkLink: async (url) =>
        mode === "temporary" && url.includes("android") ? "temporary" : "valid",
    });
    assert.deepEqual(result.rows[0], old[0]);
    assert.equal(result.rows[1].lastCheckedAt, now);
  }
});

test("确认失效才回退官方页，保留可用包；失败路径也不刷新核验时间", async () => {
  const result = await syncReleases(old, githubSources, {
    now,
    loadRelease,
    checkLink: async (url) => (url.includes("android") ? "missing" : "valid"),
  });
  assert.deepEqual(result.rows[0].downloads, [
    { id: "fallback", ...result.rows[0].fallback },
  ]);
  const failed = await syncReleases(old, githubSources, {
    now,
    loadRelease: async () => {
      throw new Error("超时");
    },
    checkLink: async () => "missing",
  });
  assert.equal(failed.rows[0].lastCheckedAt, old[0].lastCheckedAt);
  assert.equal(failed.rows[0].version, old[0].version);
  assert.equal(failed.rows[0].downloads[0].kind, "page");
});

test("HTTP 403/429/5xx、超时不确认失效，404/410 必须连续确认且不传 token", async () => {
  for (const status of [401, 403, 429, 500, 502, 503, 405]) {
    const client = githubClient({
      token: "secret",
      fetcher: async (_, init) => {
        assert.equal(init.method, "HEAD");
        assert.equal(init.headers, undefined);
        return new Response(null, { status });
      },
    });
    assert.equal(
      await client.checkLink("https://github.com/example/file"),
      "temporary",
    );
  }
  for (const statuses of [
    [404, 404],
    [410, 410],
    [404, 403],
    [404, 200],
  ]) {
    let count = 0;
    const client = githubClient({
      fetcher: async () => new Response(null, { status: statuses[count++] }),
    });
    assert.equal(
      await client.checkLink("https://github.com/example/file"),
      statuses[1] === 403
        ? "temporary"
        : statuses[1] === 200
          ? "valid"
          : "missing",
    );
    assert.equal(count, 2);
  }
  const previous = [{ ...old[0], lastCheckedAt: "2025-01-01T00:00:00Z" }];
  const client = githubClient({
    fetcher: async () => {
      throw new Error("超时");
    },
  });
  const result = await syncReleases(previous, [source], {
    now,
    loadRelease,
    checkLink: client.checkLink,
  });
  assert.deepEqual(result.rows, previous);
});

test("真实样本的传输模拟：发布分页、预发布跳过、独立资产接口与 API 失败", async () => {
  const calls = [];
  const client = githubClient({
    token: "secret",
    fetcher: async (url, init) => {
      calls.push(url);
      assert.equal(init.headers.Authorization, "Bearer secret");
      assert.ok(init.signal instanceof AbortSignal);
      const data = url.includes("/assets?")
        ? flclash.assets
        : url.endsWith("page=1")
          ? Array.from({ length: 100 }, (_, i) => ({
              ...flclash,
              id: i + 1,
              prerelease: true,
            }))
          : [flclash];
      return Response.json(data);
    },
  });
  assert.deepEqual(await client.loadRelease(source), flclash);
  assert.equal(calls.length, 3);
  for (const status of [403, 404, 429, 500]) {
    const failing = githubClient({
      fetcher: async () => new Response(null, { status }),
    });
    await assert.rejects(
      () => failing.loadRelease(source),
      new RegExp(`${status}`),
    );
  }
});

test("未配置来源的人工快照原样保留，版本推进时绝不拼接旧包", async () => {
  const before = structuredClone(releases);
  const previous = releases.map((r) =>
    r.appId === "flclash"
      ? {
          ...r,
          version: "v0.0.1",
          downloads: [{ ...r.downloads[0], id: "old-package" }],
        }
      : r,
  );
  const result = await syncReleases(previous, githubSources, {
    now,
    loadRelease,
    checkLink,
  });
  assert.deepEqual(releases, before);
  assert.deepEqual(
    result.rows.filter((r) => !["flclash", "v2rayng"].includes(r.appId)),
    before.filter((r) => !["flclash", "v2rayng"].includes(r.appId)),
  );
  const updated = result.rows.find((r) => r.appId === "flclash");
  assert.equal(updated.version, "v0.8.98");
  assert.ok(updated.downloads.every((d) => d.id !== "old-package"));
});

test("离线 CLI 输出临时快照及 dry-run，生产发布与人工基础文件不变", async () => {
  const directory = await mkdtemp(join(tmpdir(), "client-sync-test-"));
  const snapshot = "src/views/clients/releases.json";
  const catalog = "src/views/clients/catalog.json";
  const before = await Promise.all([
    readFile(snapshot, "utf8"),
    readFile(catalog, "utf8"),
  ]);
  const loader = join(directory, "fetch.mjs");
  const output = join(directory, "releases.json");
  const batch = [];
  for (const directory of [
    "batch-1",
    "batch-2",
    "batch-3",
    "batch-4",
    "batch-5",
    "batch-6",
  ]) {
    const batchDirectory = new URL(
      `./fixtures/client-releases/${directory}/`,
      import.meta.url,
    );
    for (const name of await readdir(batchDirectory)) {
      // 未上传完成的资产在单源失败回归中单独验证，不混入成功场景。
      if (!name.endsWith(".json") || name.endsWith("-incomplete.json"))
        continue;
      const raw = JSON.parse(
        await readFile(new URL(name, batchDirectory), "utf8"),
      );
      batch.push(...(Array.isArray(raw) ? raw : [raw]));
    }
  }
  const fixtures = [flclash, v2rayng, ...batch.filter((raw) => raw.tag_name)];
  const stores = [
    shadowrocket,
    stash,
    ...batch.filter((raw) => raw.resultCount === 1),
  ];
  const faultUrl = flclash.assets.find(
    (asset) => asset.name === "FlClash-0.8.98-android-arm64-v8a.apk",
  ).browser_download_url;
  const appcast = await readFile(
    new URL("./fixtures/client-releases/stash-appcast.xml", import.meta.url),
    "utf8",
  );
  await writeFile(
    loader,
    `const releases = ${JSON.stringify(fixtures)};
    const stores = ${JSON.stringify(stores)};
    const appcast = ${JSON.stringify(appcast)};
    const nativeTimeout = AbortSignal.timeout;
    if (process.env.BUDGET_EXPIRED) AbortSignal.timeout = ms =>
      ms === 40 * 60 * 1000 ? AbortSignal.abort(new Error('总预算耗尽')) : nativeTimeout(ms);
    globalThis.fetch = async (url, init) => {
      init.signal.throwIfAborted();
      if (!url.startsWith('https://api.github.com/') && init.headers?.Authorization)
        throw new Error('token 泄漏到非 API 请求');
      if (init.method === 'HEAD') return new Response(null, {
        status: process.env.LINK_STATUS && url === ${JSON.stringify(faultUrl)} ? Number(process.env.LINK_STATUS) : 200
      });
      if (url.startsWith('https://itunes.apple.com/')) {
        if (process.env.STORE_FAILURE && url.includes('932747118')) return new Response(null, {status: 429});
        const store = stores.find(s => String(s.results[0].trackId) === new URL(url).searchParams.get('id'));
        if (!store) throw new Error('Missing store fixture: ' + url);
        return Response.json(store);
      }
      if (url === 'https://mac-release.stash.ws/appcast.xml') return new Response(appcast);
      const repo = new URL(url).pathname.split('/').slice(2,4).join('/');
      const matches = releases.filter(r => r.html_url.startsWith('https://github.com/' + repo + '/releases/'));
      if (!matches.length) throw new Error('Missing release fixture: ' + url);
      const params = new URL(url).searchParams;
      const page = Number(params.get('page') || 1), size = Number(params.get('per_page') || 100);
      const paginate = items => items.slice((page - 1) * size, page * size);
      if (!url.includes('/assets?')) return Response.json(paginate(matches));
      const releaseId = Number(new URL(url).pathname.split('/').at(-2));
      const release = matches.find(r => r.id === releaseId);
      if (!release) throw new Error('Missing asset fixture: ' + url);
      return Response.json(paginate(release.assets));
    };`,
  );
  let storeFailure = false;
  let budgetExpired = false;
  let linkStatus = "";
  const run = (...args) =>
    execFileSync(
      process.execPath,
      [
        "--import",
        pathToFileURL(loader).href,
        resolve("scripts/sync-client-releases.mjs"),
        ...args,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          STORE_FAILURE: storeFailure ? "1" : "",
          BUDGET_EXPIRED: budgetExpired ? "1" : "",
          LINK_STATUS: linkStatus,
          GITHUB_TOKEN: "offline-secret-must-not-leak",
        },
      },
    );
  try {
    run("--output", output);
    const result = JSON.parse(await readFile(output, "utf8"));
    const configured = new Set(
      [...githubSources, ...officialSources].flatMap((s) =>
        Object.keys(s.platforms).map((p) => `${s.appId}/${p}`),
      ),
    );
    for (let i = 0; i < releases.length; i++) {
      const row = releases[i];
      if (!configured.has(`${row.appId}/${row.platform}`))
        assert.deepEqual(result[i], row);
      else
        assert.equal(
          result[i].maintenance,
          "automatic",
          `${row.appId}/${row.platform}`,
        );
    }
    assert.ok(
      !(await readFile(output, "utf8")).includes(
        "offline-secret-must-not-leak",
      ),
    );
    assert.equal(
      result.find((r) => r.appId === "flclash" && r.platform === "windows")
        .maintenance,
      "automatic",
    );
    assert.equal(
      result.find((r) => r.appId === "shadowrocket" && r.platform === "ios")
        .maintenance,
      "automatic",
    );
    assert.equal(
      result.find((r) => r.appId === "stash" && r.platform === "macos").version,
      "4.2.1",
    );
    assert.equal(JSON.parse(run("--dry-run")).length, releases.length);
    assert.throws(() => run("--output", catalog), /不可写入人工基础目录/);
    assert.throws(() => run("--output", output, "--dry-run"), /不能同时使用/);
    storeFailure = true;
    assert.throws(
      () => run("--output", output),
      (error) => {
        assert.equal(error.status, 1);
        assert.match(error.stderr, /shadowrocket\/ios: 官方来源 HTTP 429/);
        return true;
      },
    );
    const partial = JSON.parse(await readFile(output, "utf8"));
    assert.deepEqual(
      partial.find((r) => r.appId === "shadowrocket" && r.platform === "ios"),
      releases.find((r) => r.appId === "shadowrocket" && r.platform === "ios"),
    );
    assert.equal(
      partial.find((r) => r.appId === "stash" && r.platform === "ios")
        .maintenance,
      "automatic",
    );
    assert.equal(
      partial.find((r) => r.appId === "stash" && r.platform === "macos")
        .version,
      "4.2.1",
    );
    assert.equal(
      partial.find((r) => r.appId === "v2rayng").maintenance,
      "automatic",
    );
    // 将真正部分失败 CLI 结果提交到本地裸仓库，验证不是孤立输出文件。
    const bare = join(directory, "remote.git");
    const checkout = join(directory, "checkout");
    const git = (cwd, ...args) =>
      execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          HUSKY: "0",
          GIT_CONFIG_GLOBAL: "/dev/null",
          GIT_CONFIG_NOSYSTEM: "1",
        },
      }).trim();
    git(directory, "init", "--bare", "--initial-branch=main", bare);
    git(directory, "clone", bare, checkout);
    await mkdir(join(checkout, "src/views/clients"), { recursive: true });
    await writeFile(join(checkout, snapshot), before[0]);
    await writeFile(join(checkout, catalog), before[1]);
    git(checkout, "add", ".");
    git(
      checkout,
      "-c",
      "user.name=离线测试",
      "-c",
      "user.email=test@example.invalid",
      "commit",
      "-m",
      "同步前",
    );
    git(checkout, "push", "origin", "main");
    await writeFile(join(checkout, snapshot), await readFile(output));
    execFileSync("bash", [resolve("scripts/publish-client-releases.sh")], {
      cwd: checkout,
      env: { ...process.env, HUSKY: "0" },
      stdio: "pipe",
    });
    assert.deepEqual(
      JSON.parse(git(bare, "show", `main:${snapshot}`)),
      partial,
    );
    assert.equal(git(bare, "show", `main:${catalog}`), before[1].trim());
    storeFailure = false;
    linkStatus = "404";
    run("--output", output);
    const missing = JSON.parse(await readFile(output, "utf8")).find(
      (r) => r.appId === "flclash" && r.platform === "android",
    );
    assert.ok(!missing.downloads.some((d) => d.url === faultUrl));
    assert.ok(missing.downloads.some((d) => d.id === "fallback"));
    linkStatus = "401";
    assert.throws(
      () => run("--output", output),
      (error) => error.status === 1,
    );
    const temporary = JSON.parse(await readFile(output, "utf8")).find(
      (r) => r.appId === "flclash" && r.platform === "android",
    );
    assert.deepEqual(temporary, old[0]);
    linkStatus = "";
    budgetExpired = true;
    assert.throws(
      () => run("--output", output),
      (error) => {
        assert.equal(error.status, 1);
        assert.match(error.stderr, /总预算耗尽/);
        return true;
      },
    );
    assert.deepEqual(JSON.parse(await readFile(output, "utf8")), releases);
    assert.deepEqual(
      await Promise.all([
        readFile(snapshot, "utf8"),
        readFile(catalog, "utf8"),
      ]),
      before,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("test/testing/dev/development 渠道不更新快照，边界不误伤 latest", async () => {
  for (const channel of [
    "test",
    "testing",
    "dev",
    "development",
    "test1",
    "DEV.2",
  ]) {
    const raw = JSON.parse(
      JSON.stringify(flclash).replaceAll("0.8.98", `0.8.99-${channel}`),
    );
    assert.equal(selectStableRelease([raw]), undefined, channel);
    assert.throws(() => parseRelease(raw, source, old[0], now), /没有正式版/);
    const result = await syncReleases([old[0]], [source], {
      now,
      loadRelease: async () => raw,
      checkLink,
    });
    assert.deepEqual(result.rows, [old[0]], channel);
    assert.equal(
      selectStableRelease([{ ...flclash, name: `FlClash ${channel}` }]),
      undefined,
    );
  }
  for (const name of [
    "latest",
    "Latest release",
    "Developer tools",
    "Contest",
    "Stable",
  ])
    assert.equal(selectStableRelease([{ ...flclash, name }]).name, name);
});

test("部分直链失效只移除失效项并补唯一 fallback，保留其他包", async () => {
  const previous = parseRelease(
    flclash,
    source,
    old[0],
    "2020-01-01T00:00:00Z",
  );
  for (const apiFails of [false, true]) {
    const result = await syncReleases([previous], [source], {
      now,
      loadRelease: async () => {
        if (apiFails) throw new Error("HTTP 503");
        return flclash;
      },
      checkLink: async (url) =>
        url === previous.downloads[0].url ? "missing" : "valid",
    });
    const row = result.rows[0];
    assert.deepEqual(row.downloads.slice(0, -1), previous.downloads.slice(1));
    assert.deepEqual(row.downloads.at(-1), { id: "fallback", ...row.fallback });
    assert.equal(row.downloads.length, previous.downloads.length);
    assert.equal(row.lastCheckedAt, apiFails ? previous.lastCheckedAt : now);
  }
});

test("同步以最多四个来源并发执行，输出顺序和失败隔离保持稳定", async () => {
  const sources = Array.from({ length: 9 }, (_, i) => ({
    appId: `parallel-${i}`,
    platforms: { android: true },
  }));
  const previous = sources.map((s) => ({ ...old[0], appId: s.appId }));
  let active = 0;
  let peak = 0;
  const result = await syncReleases(previous, sources, {
    now,
    loadRelease: async (s) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      if (s.appId === "parallel-1") throw new Error("模拟限流");
      return true;
    },
    parse: (_raw, _source, row) => ({ ...row, lastCheckedAt: now }),
    checkLink,
  });
  assert.equal(peak, 4);
  assert.deepEqual(
    result.rows.map((r) => r.appId),
    previous.map((r) => r.appId),
  );
  assert.deepEqual(result.rows[1], previous[1]);
  assert.equal(result.rows[8].lastCheckedAt, now);
  assert.deepEqual(
    result.errors.map((e) => e.appId),
    ["parallel-1"],
  );
});

test("单平台大量包以四路检查，保留包顺序并只回退确认失效项", async () => {
  const previous = {
    ...old[0],
    downloads: Array.from({ length: 9 }, (_, i) => ({
      ...old[0].downloads[0],
      id: `package-${i}`,
      url: `https://example.org/package-${i}`,
    })),
  };
  let active = 0;
  let peak = 0;
  const result = await syncReleases([previous], [source], {
    loadRelease: async () => true,
    parse: () => previous,
    checkLink: async (url) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return url.endsWith("-2") ? "missing" : "valid";
    },
  });
  assert.equal(peak, 4);
  assert.deepEqual(
    result.rows[0].downloads.slice(0, -1),
    previous.downloads.filter((d) => d.id !== "package-2"),
  );
  assert.equal(result.rows[0].downloads.at(-1).id, "fallback");
});
