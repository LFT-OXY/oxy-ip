import assert from "node:assert/strict";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  coreGroupLabels,
  filterApps,
  readFilters,
  updateFilter,
  clearFilters,
  paginateApps,
} from "../src/views/clients/model.ts";

const filter = (query, input = apps) =>
  filterApps(
    input,
    releases,
    readFilters(new URLSearchParams(query)),
    (v) => v,
  );
const ids = (query) => filter(query).map((app) => app.id);

test("内核分类固定九项顺序，准确名称不被分类改写", () => {
  assert.deepEqual(Object.entries(coreGroupLabels), [
    ["", "全部"],
    ["group:mihomo", "Mihomo"],
    ["group:sing-box", "sing-box"],
    ["group:self-developed", "自研"],
    ["group:xray", "Xray"],
    ["group:v2ray", "V2Ray"],
    ["group:meow-rs", "meow-rs"],
    ["group:clash-rs", "clash-rs"],
    ["group:other", "其他"],
  ]);
  assert.deepEqual(apps.find((a) => a.id === "clash-nyanpasu").cores, [
    "Clash Premium",
    "Mihomo",
    "Clash Rust",
    "Meow",
  ]);
});

test("独立29项分类期望与未来未知内核保守回退", () => {
  const expected = {
    "group:mihomo": ["Mihomo", "Hako", "CoreX"],
    "group:sing-box": ["sing-box"],
    "group:self-developed": ["VX", "Sudoku"],
    "group:xray": ["Xray"],
    "group:v2ray": ["V2Ray"],
    "group:meow-rs": ["meow-rs", "Meow"],
    "group:clash-rs": ["clash-rs", "Clash Rust"],
    "group:other": [
      "AnyTLS Zig",
      "Clash",
      "Clash Premium",
      "Exclave core",
      "Hysteria",
      "Hysteria 2",
      "Hysteria2",
      "NaiveProxy",
      "Outline SDK",
      "Phantom",
      "ShadowTLS",
      "Shadowsocks",
      "ShadowsocksR",
      "Smart",
      "TUIC",
      "dae",
      "shadowsocks-rust",
    ],
  };
  assert.deepEqual(
    [...new Set(apps.flatMap((a) => a.cores))].sort(),
    Object.values(expected).flat().sort(),
  );
  for (const [group, cores] of Object.entries(expected)) {
    for (const core of cores) {
      const sample = [{ ...apps[0], cores: [core] }];
      for (const candidate of Object.keys(expected)) {
        assert.equal(
          filter(new URLSearchParams({ core: candidate }), sample).length,
          candidate === group ? 1 : 0,
          `${core}/${candidate}`,
        );
      }
    }
  }
  for (const cores of [[], ["Future core"]]) {
    const sample = [{ ...apps[0], cores, code: "closed" }];
    assert.equal(filter("core=group:other", sample).length, 1);
    assert.equal(filter("core=group:self-developed", sample).length, 0);
  }
});

test("别名、多内核、自研与其他应用有独立名单", () => {
  assert.deepEqual(ids("core=group:meow-rs"), [
    "clash-nyanpasu",
    "meow",
    "meow-android",
    "baoliandeng",
    "paws",
  ]);
  assert.deepEqual(ids("core=group:clash-rs"), [
    "clash-nyanpasu",
    "clash-xiaoy",
    "nikki-rs",
  ]);
  assert.deepEqual(ids("core=group:self-developed"), [
    "vproxy",
    "sudodroid",
    "sudoku-desktop",
  ]);
  for (const group of ["mihomo", "clash-rs", "meow-rs", "other"])
    assert.ok(ids(`core=group:${group}`).includes("clash-nyanpasu"));
  assert.ok(ids("core=group:other").includes("shadowrocket"));
  assert.ok(ids("core=group:mihomo").includes("linkclashx"));
  assert.deepEqual(
    ids("core=group:xray&platform=android&code=open&price=free&q=V2rayNG"),
    ["v2rayng"],
  );
  assert.deepEqual(ids("core=group:v2ray&q=V2rayNG"), ["v2rayng"]);
  assert.deepEqual(ids("core=group:sing-box&q=Hiddify"), ["hiddify"]);
  assert.equal(
    paginateApps(filter("core=group:clash-rs&platform=ios"), "9").pageCount,
    0,
  );
});

test("旧URL精确匹配不扩大，非法分类保持空结果", () => {
  assert.deepEqual(ids("core=Meow"), ["clash-nyanpasu"]);
  assert.deepEqual(ids("core=meow-rs"), [
    "meow",
    "meow-android",
    "baoliandeng",
    "paws",
  ]);
  assert.deepEqual(ids("core=clash-rs"), ["nikki-rs"]);
  assert.deepEqual(ids("core=Clash+Rust"), ["clash-nyanpasu", "clash-xiaoy"]);
  assert.ok(!ids("core=Mihomo").includes("linkclashx"));
  assert.ok(ids("core=unknown").includes("shadowrocket"));
  assert.ok(!ids("core=unknown").includes("clash-nyanpasu"));
  assert.deepEqual(ids("core=group:missing"), []);
  assert.deepEqual(ids("core=missing"), []);
});

test("分类切换重置页码，保留详情返回使用的语言及其他参数", () => {
  const old = new URLSearchParams("core=Meow&page=3&lang=en&extra=1");
  const next = updateFilter(old, "core", "group:meow-rs");
  assert.equal(next.get("core"), "group:meow-rs");
  assert.equal(next.has("page"), false);
  assert.equal(next.get("lang"), "en");
  assert.equal(next.get("extra"), "1");
  assert.equal(old.get("page"), "3");
  assert.equal(clearFilters(next).toString(), "lang=en&extra=1");
});

test("分类与精确筛选提示使用真实英文翻译", async () => {
  globalThis.window = {
    location: { href: "https://example.test/clients?lang=en" },
  };
  globalThis.localStorage = { getItem: () => null };
  try {
    const { t } = await import("../src/i18n/index.ts?core-groups");
    assert.equal(t("自研"), "Self-developed");
    assert.equal(t("其他"), "Other");
    assert.equal(t("精确内核：{0}", ["Meow"]), "Exact core: Meow");
    for (const label of Object.values(coreGroupLabels))
      assert.doesNotMatch(t(label), /[\u3400-\u9fff]/);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
