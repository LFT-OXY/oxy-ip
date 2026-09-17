import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cp,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { test } from "node:test";
import flclash from "./fixtures/client-releases/flclash.json" with { type: "json" };
import { githubSources } from "../scripts/client-release-sources.mjs";
import { parseRelease } from "../scripts/client-release-sync.mjs";

test("生产快照合法升级版本及URL后，构建与完整测试仍通过且故障注入有效", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "catalog-upgrade-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = "src/views/clients/releases.json";
  const original = await readFile(path, "utf8");
  // 只复制构建／测试输入，不复制Git凭据、环境秘密和旧产物；排除自身防递归。
  for (const entry of [
    "src",
    "public",
    "scripts",
    "tests",
    "vendor",
    ".github",
    ".gitignore",
    "package.json",
    "pnpm-lock.yaml",
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "wrangler.toml",
  ])
    await cp(entry, join(root, entry), {
      recursive: true,
      filter: (source) =>
        basename(source) !== "client-snapshot-upgrade.test.mjs",
    });
  await symlink(resolve("node_modules"), join(root, "node_modules"), "dir");
  const rows = JSON.parse(original);
  const previous = rows.find((row) => row.appId === "flclash");
  const version = `${Number(previous.version.replace(/^v/, "").split(".")[0]) + 1}.0.0`;
  const raw = JSON.parse(JSON.stringify(flclash).replaceAll("0.8.98", version));
  raw.id += 1;
  raw.published_at = new Date(
    Date.parse(previous.publishedAt) + 1000,
  ).toISOString();
  const checkedAt = new Date().toISOString();
  const source = githubSources.find((source) => source.appId === "flclash");
  const upgraded = rows.map((row) =>
    row.appId === "flclash" ? parseRelease(raw, source, row, checkedAt) : row,
  );
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].appId !== "flclash") assert.deepEqual(upgraded[i], rows[i]);
    else {
      assert.equal(upgraded[i].version, `v${version}`);
      assert.notEqual(upgraded[i].version, rows[i].version);
      assert.ok(
        upgraded[i].downloads.every(
          (download) =>
            download.url.includes(`/v${version}/`) &&
            !rows[i].downloads.some((old) => old.url === download.url),
        ),
      );
    }
  }
  await writeFile(join(root, path), `${JSON.stringify(upgraded, null, 2)}\n`);
  const env = { ...process.env, HUSKY: "0", WRANGLER_SEND_METRICS: "false" };
  // 子进程是独立完整测试运行，不继承父runner的内部worker模式。
  delete env.NODE_TEST_CONTEXT;
  const run = (...args) =>
    execFileSync("pnpm", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
      maxBuffer: 16 * 1024 * 1024,
      env,
    });
  run("build");
  // 完整套件包含CLI的404/401断言，而不只是对升级快照做schema检查。
  const report = run("test");
  assert.match(report, /离线 CLI 输出临时快照及 dry-run/);
  assert.match(report, /fail 0/);
  assert.match(report, /skip(?:ped)? 0/);
  t.diagnostic(
    `升级副本：${report
      .split("\n")
      .filter((line) => /(?:tests|pass|fail|skip(?:ped)?) \d+$/.test(line))
      .join("；")}`,
  );
  assert.equal(await readFile(path, "utf8"), original);
});
