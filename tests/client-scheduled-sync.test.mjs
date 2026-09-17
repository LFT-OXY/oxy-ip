import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  chmod,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import {
  githubSources,
  officialSources,
} from "../scripts/client-release-sources.mjs";
import { releases, apps } from "../src/views/clients/data.ts";

const script = resolve("scripts/publish-client-releases.sh");
const snapshot = "src/views/clients/releases.json";
const catalog = "src/views/clients/catalog.json";
const env = {
  ...process.env,
  HUSKY: "0",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
};
function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
function publish(cwd) {
  return execFileSync("bash", [script], {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
async function repository(t) {
  const root = await mkdtemp(join(tmpdir(), "catalog-publish-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const remote = join(root, "remote.git");
  const bot = join(root, "bot");
  const human = join(root, "human");
  git(root, "init", "--bare", "--initial-branch=main", remote);
  git(root, "clone", remote, bot);
  git(bot, "config", "user.name", "离线测试");
  git(bot, "config", "user.email", "test@example.invalid");
  await mkdir(join(bot, "src/views/clients"), { recursive: true });
  await writeFile(join(bot, snapshot), "[]\n");
  await writeFile(join(bot, catalog), '[{"name":"人工资料"}]\n');
  git(bot, "add", ".");
  git(bot, "commit", "-m", "初始快照");
  git(bot, "push", "origin", "main");
  git(root, "clone", remote, human);
  git(human, "config", "user.name", "离线测试");
  git(human, "config", "user.email", "test@example.invalid");
  return { root, remote, bot, human };
}

test("全量154项320平台：218个自动来源身份唯一，102个人工平台不被自动源占用", () => {
  const sources = [...githubSources, ...officialSources];
  const keys = sources.flatMap((s) =>
    Object.keys(s.platforms).map((p) => `${s.appId}/${p}`),
  );
  assert.equal(apps.length, 154);
  assert.equal(releases.length, 320);
  assert.equal(githubSources.length, 84);
  assert.equal(officialSources.length, 54);
  assert.equal(keys.length, 218);
  assert.equal(new Set(keys).size, keys.length);
  const rows = new Set(releases.map((r) => `${r.appId}/${r.platform}`));
  for (const key of keys) assert.ok(rows.has(key), key);
  assert.equal(
    releases.filter((r) => !keys.includes(`${r.appId}/${r.platform}`)).length,
    102,
  );
  for (const id of [
    "foxray",
    "clash-mix",
    "pantheon",
    "clash-net",
    "lvory",
    "hey",
  ]) {
    assert.ok(
      apps.some((app) => app.id === id),
      id,
    );
    assert.ok(!sources.some((s) => s.appId === id), id);
  }
});

test("发布脚本真实提交快照，重复触发无额外提交且人工资料不变", async (t) => {
  const { remote, bot } = await repository(t);
  const initial = git(bot, "rev-parse", "HEAD");
  assert.match(publish(bot), /未变化/);
  assert.equal(git(bot, "rev-parse", "HEAD"), initial);
  const manual = await readFile(join(bot, catalog), "utf8");
  await writeFile(join(bot, snapshot), '[{"version":"1.0"}]\n');
  publish(bot);
  const after = git(bot, "rev-parse", "HEAD");
  assert.notEqual(after, initial);
  assert.equal(git(remote, "rev-parse", "main"), after);
  assert.equal(
    git(bot, "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"),
    snapshot,
  );
  assert.equal(await readFile(join(bot, catalog), "utf8"), manual);
  publish(bot);
  assert.equal(git(bot, "rev-parse", "HEAD"), after);
});

test("拒绝混入人工资料（包括已暂存改动），不推送任何结果", async (t) => {
  const { remote, bot } = await repository(t);
  const before = git(remote, "rev-parse", "main");
  await writeFile(join(bot, snapshot), '[{"version":"1.0"}]\n');
  await writeFile(join(bot, catalog), '[{"name":"人工编辑"}]\n');
  git(bot, "add", catalog);
  assert.throws(() => publish(bot), /拒绝提交非发布数据/);
  assert.equal(git(remote, "rev-parse", "main"), before);
});

for (const race of [false, true]) {
  test(`并发人工修改${race ? "发生在 fetch 之后" : "发生在同步期间"}时拒绝覆盖`, async (t) => {
    const { remote, bot, human } = await repository(t);
    await writeFile(join(bot, snapshot), '[{"version":"自动结果"}]\n');
    await writeFile(join(human, snapshot), '[{"version":"人工修订"}]\n');
    git(human, "add", snapshot);
    git(human, "commit", "-m", "人工维护版本");
    const expected = git(human, "rev-parse", "HEAD");
    if (race) {
      const hook = join(bot, ".git/hooks/pre-push");
      await writeFile(
        hook,
        `#!/bin/sh\nunset GIT_DIR GIT_WORK_TREE\ngit -C '${human}' push origin main\n`,
      );
      await chmod(hook, 0o755);
    } else git(human, "push", "origin", "main");
    assert.throws(() => publish(bot), race ? /rejected/ : /main 已变化/);
    assert.equal(git(remote, "rev-parse", "main"), expected);
    assert.equal(
      git(remote, "show", `main:${snapshot}`),
      '[{"version":"人工修订"}]',
    );
  });
}

test("工作流真实 dispatch 命令复用 pages main，传输失败和部分失败报告均非零", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "catalog-dispatch-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workflow = await readFile(
    ".github/workflows/sync-client-releases.yml",
    "utf8",
  );
  const command = workflow.match(/^\s+run: (gh workflow run .+)$/m)?.[1];
  assert.ok(command);
  const gh = join(root, "gh");
  await writeFile(gh, '#!/bin/sh\nprintf "%s\\n" "$@"\nexit "${GH_EXIT:-0}"\n');
  await chmod(gh, 0o755);
  const dispatch = (code) =>
    execFileSync("bash", ["-e", "-c", command], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...env,
        PATH: `${root}:${process.env.PATH}`,
        REPO: "offline/catalog",
        GH_EXIT: String(code),
      },
    });
  assert.equal(
    dispatch(0),
    "workflow\nrun\npages.yml\n--repo\noffline/catalog\n--ref\nmain\n",
  );
  assert.throws(
    () => dispatch(1),
    (error) => error.status === 1,
  );
  const report = workflow.split("      - name: Report partial failure\n")[1];
  assert.ok(report.includes("always() && steps.sync.outcome == 'failure'"));
  const shell = report
    .split("        run: |\n")[1]
    .split("\n")
    .map((line) => line.slice(10))
    .join("\n");
  assert.throws(
    () => execFileSync("bash", ["-e", "-c", shell], { stdio: "pipe" }),
    (error) => error.status === 1,
  );
});
