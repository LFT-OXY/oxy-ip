import { readFile, open, rename, unlink } from "node:fs/promises";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  officialClient,
  parseOfficialRelease,
} from "./client-official-sync.mjs";
import { githubSources, officialSources } from "./client-release-sources.mjs";
import { githubClient, syncReleases } from "./client-release-sync.mjs";

const { values } = parseArgs({
  options: { "dry-run": { type: "boolean" }, output: { type: "string" } },
});
if (values["dry-run"] && values.output)
  throw new Error("--dry-run 与 --output 不能同时使用");
const snapshot = fileURLToPath(
  new URL("../src/views/clients/releases.json", import.meta.url),
);
const output = resolve(values.output ?? snapshot);
const catalog = fileURLToPath(
  new URL("../src/views/clients/catalog.json", import.meta.url),
);
if (output === catalog) throw new Error("不可写入人工基础目录");
const previous = JSON.parse(await readFile(snapshot, "utf8"));
const github = githubClient();
const checkedAt = new Date().toISOString();
const githubResult = await syncReleases(previous, githubSources, {
  ...github,
  now: checkedAt,
});
const { rows, errors: officialErrors } = await syncReleases(
  githubResult.rows,
  officialSources,
  {
    ...officialClient(),
    checkLink: github.checkLink,
    parse: parseOfficialRelease,
    now: checkedAt,
  },
);
const errors = [...githubResult.errors, ...officialErrors];
for (const error of errors)
  console.error(`${error.appId}/${error.platform}: ${error.message}`);
if (values["dry-run"]) console.log(JSON.stringify(rows, null, 2));
else {
  const temporary = join(
    dirname(output),
    `.${basename(output)}.${process.pid}.tmp`,
  );
  const handle = await open(temporary, "wx");
  try {
    await handle.writeFile(`${JSON.stringify(rows, null, 2)}\n`);
    await handle.close();
    await rename(temporary, output);
  } finally {
    await handle.close();
    await unlink(temporary).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  console.log(`发布快照已写入 ${output}`);
}
// 部分失败仍保存其他来源的成功结果，同时让手动调用方看到失败状态。
if (errors.length) process.exitCode = 1;
