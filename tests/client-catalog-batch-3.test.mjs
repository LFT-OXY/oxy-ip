import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  filterApps,
  readFilters,
  releaseFor,
} from "../src/views/clients/model.ts";

const baseline = JSON.parse(
  readFileSync(
    new URL(
      "./fixtures/client-releases/batch-3/catalog-baseline.json",
      import.meta.url,
    ),
  ),
);
// 独立逐项核对官方平台和内核；不从目录或同步配置生成期望。
const expected = {
  everywhere: [
    ["ios", "macos"],
    ["Xray", "sing-box", "Mihomo"],
  ],
  "connect-now": [["ios", "macos"], ["Mihomo"]],
  incy: [["android", "ios", "windows", "macos", "linux"], ["Xray"]],
  nextin: [["ios", "macos"], ["Mihomo"]],
  "sing-box-for-apple": [["ios", "macos"], ["sing-box"]],
  tunna: [["ios", "macos"], ["Xray"]],
  "loon-lite": [["ios"], []],
  "gui-for-singbox": [["windows", "macos", "linux"], ["sing-box"]],
  clashmac: [["macos"], ["Mihomo"]],
  throne: [
    ["windows", "macos", "linux"],
    ["sing-box", "Xray"],
  ],
  flowz: [["windows", "macos", "linux"], ["sing-box"]],
  polaris: [["windows", "macos", "linux"], ["sing-box"]],
  onebox: [["windows", "macos", "linux"], ["sing-box"]],
  interstellar: [["android"], ["sing-box", "Mihomo", "Xray"]],
  satelite: [
    ["windows", "macos", "linux"],
    ["sing-box", "Xray", "Mihomo"],
  ],
  clashbar: [["macos"], ["Mihomo"]],
  kumoapp: [["macos"], ["Mihomo"]],
  "singboard-for-mac": [["macos"], ["sing-box"]],
  irbox: [
    ["windows", "macos", "linux"],
    ["sing-box", "Xray"],
  ],
  netch: [["windows"], ["V2Ray"]],
  pantheon: [["windows"], []],
  stelliberty: [["windows", "macos", "linux"], ["Mihomo"]],
  carton: [["windows", "linux"], ["sing-box"]],
  "pandora-box": [["windows", "macos", "linux"], ["Mihomo"]],
  clashtui: [
    ["windows", "macos", "linux"],
    ["Mihomo", "sing-box"],
  ],
};

test("第06票独立25项完整收录，累计83项身份、顺序和逐平台快照无重复遗漏", () => {
  const items = baseline.apps.filter((app) => app.ticket === "06");
  assert.equal(items.length, 25);
  assert.deepEqual(
    Object.keys(expected),
    items.map((app) => app.id),
  );
  assert.deepEqual(
    apps.map((app) => app.id),
    baseline.apps.slice(0, 83).map((app) => app.id),
  );
  assert.equal(new Set(apps.map((app) => app.id)).size, 83);
  for (const item of items) {
    const app = apps.find((app) => app.id === item.id);
    assert.equal(app.name, item.name);
    assert.deepEqual(app.platforms, expected[item.id][0]);
    assert.deepEqual(app.cores, expected[item.id][1]);
    assert.ok(existsSync(`public${app.icon}`), `${app.id}: 图标`);
    assert.ok(app.description && app.priceDetails && app.sources.length);
    for (const platform of expected[item.id][0]) {
      const row = releaseFor(releases, app.id, platform);
      assert.ok(row, `${app.id}/${platform}`);
      assert.ok(row.downloads.length);
      assert.ok(!row.source.url.includes("huarun.win"));
      if (row.maintenance === "manual")
        assert.equal(row.lastCheckedAt, undefined);
      else assert.ok(row.lastCheckedAt);
      for (const core of ["", ...expected[item.id][1]]) {
        const matches = filterApps(
          apps,
          releases,
          readFilters(
            new URLSearchParams({
              q: app.name,
              platform,
              core,
              code: app.code,
              price: app.price,
            }),
          ),
          (text) => text,
        );
        assert.ok(
          matches.some((match) => match.id === app.id),
          `${app.id}/${platform}/${core}`,
        );
      }
      for (const download of row.downloads) {
        assert.equal(new URL(download.url).protocol, "https:");
        assert.ok(!download.url.includes("huarun.win"));
        if (download.kind === "direct") {
          assert.ok(download.arch && download.format && row.version);
          assert.ok(
            download.url.includes(
              `/download/${encodeURIComponent(row.version)}/`,
            ),
          );
        }
      }
    }
  }
  assert.equal(
    new Set(releases.map((r) => `${r.appId}/${r.platform}`)).size,
    releases.length,
  );
});

test("第06票未知Mac版本、实验桌面和失效项目不伪造正式包与核验时间", () => {
  for (const [id, platform] of [
    ["everywhere", "macos"],
    ["connect-now", "macos"],
    ["nextin", "macos"],
    ["incy", "windows"],
    ["incy", "linux"],
    ["incy", "macos"],
    ["tunna", "macos"],
    ["sing-box-for-apple", "macos"],
    ["pantheon", "windows"],
  ]) {
    const row = releaseFor(releases, id, platform);
    assert.ok(row, id);
    for (const field of ["version", "publishedAt", "lastCheckedAt"])
      assert.equal(row[field], undefined, `${id}/${field}`);
    assert.equal(row.maintenance, "manual");
    assert.ok(row.note);
    assert.ok(row.downloads.every((d) => d.kind !== "direct"));
  }
  for (const platform of ["windows", "linux"])
    assert.match(releaseFor(releases, "incy", platform).note, /pre-alpha/);
  assert.match(
    releaseFor(releases, "pantheon", "windows").note,
    /当前无法获取/,
  );
  for (const id of ["pantheon", "clashtui"])
    assert.match(
      readFileSync(`public${apps.find((app) => app.id === id).icon}`, "utf8"),
      /占位/,
    );
});

test("独立身份、非商业许可证、渠道、TrollStore与核心依赖限制明确", () => {
  assert.equal(apps.find((a) => a.id === "stelliberty").code, "available");
  assert.match(apps.find((a) => a.id === "stelliberty").priceDetails, /非商业/);
  assert.equal(apps.find((a) => a.id === "clashmac").code, "closed");
  assert.equal(apps.find((a) => a.id === "loon-lite").price, "paid");
  assert.equal(apps.find((a) => a.id === "nextin").price, "unknown");
  assert.match(apps.find((a) => a.id === "nextin").priceDetails, /内购/);
  assert.match(releaseFor(releases, "onebox", "linux").note, /Ubuntu.*测试/);
  assert.ok(
    releaseFor(releases, "onebox", "linux").downloads.every(
      (d) => d.format !== "rpm",
    ),
  );
  assert.match(
    releaseFor(releases, "singboard-for-mac", "macos").note,
    /自行.*sing-box/,
  );
  assert.match(
    releaseFor(releases, "sing-box-for-apple", "ios").note,
    /TrollStore/,
  );
  assert.match(
    releaseFor(releases, "netch", "windows").note,
    /SagerNet.*V2Ray/,
  );
});

test("OneBox桌面身份不引用OneBoxM商店，也不残留未核实Mac的说明", () => {
  const app = apps.find((app) => app.id === "onebox");
  assert.deepEqual(app.sources, ["https://github.com/OneOhCloud/OneBox"]);
  const mac = releaseFor(releases, "onebox", "macos");
  assert.equal(mac.source.label, "GitHub Release");
  assert.ok(
    mac.source.url.startsWith(
      "https://github.com/OneOhCloud/OneBox/releases/tag/",
    ),
  );
  assert.ok(mac.version && mac.publishedAt && mac.lastCheckedAt);
  assert.equal(mac.note, undefined);
  assert.ok(
    mac.downloads.every((d) => d.kind === "direct" && d.format === "dmg"),
  );
});
