import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { apps, releases } from "../src/views/clients/data.ts";
import {
  paginateApps,
  pageParams,
  updateFilter,
  clearFilters,
  filterApps,
  readFilters,
} from "../src/views/clients/model.ts";

const filter = (query) =>
  filterApps(apps, releases, readFilters(new URLSearchParams(query)), (v) => v);

test("全量按24项分7页，末页10项，身份与独立基线一致", () => {
  const baseline = JSON.parse(
    readFileSync(
      new URL(
        "./fixtures/client-releases/batch-6/catalog-baseline.json",
        import.meta.url,
      ),
    ),
  );
  // 基线具体结构与旧批次测试一致，避免从生产数据制造名单期望。
  const expected = baseline.apps.map((app) => app.id);
  const ids = [];
  for (let page = 1; page <= 7; page++) {
    const result = paginateApps(filter(""), String(page));
    assert.equal(result.total, 154);
    assert.equal(result.pageCount, 7);
    assert.equal(result.page, page);
    assert.equal(result.items.length, page === 7 ? 10 : 24);
    assert.equal(result.start, (page - 1) * 24 + 1);
    assert.equal(result.end, Math.min(page * 24, 154));
    ids.push(...result.items.map((app) => app.id));
  }
  assert.equal(new Set(ids).size, 154);
  assert.deepEqual(ids, expected);
});

test("分页在筛选与稳定排序之后执行，不改变匹配总数或顺序", () => {
  const matches = filter("platform=android&code=open&sort=updated");
  assert.ok(matches.length > 24);
  const result = paginateApps(matches, "2");
  assert.equal(result.total, matches.length);
  assert.deepEqual(result.items, matches.slice(24, 48));
  assert.equal(result.start, 25);
});

test("非法页码回1、越界归末页、空结果没有无效范围", () => {
  for (const raw of [
    null,
    "",
    "0",
    "-1",
    "1.5",
    "abc",
    "NaN",
    "Infinity",
    "1e2",
    " 2",
    "2x",
    "9007199254740992",
  ]) {
    assert.equal(paginateApps(apps, raw).page, 1, String(raw));
  }
  assert.equal(paginateApps(apps, "999").page, 7);
  assert.equal(paginateApps(apps, "02").page, 2);
  assert.deepEqual(paginateApps([], "8"), {
    items: [],
    total: 0,
    page: 1,
    pageCount: 0,
    start: 0,
    end: 0,
  });
  assert.equal(paginateApps(apps.slice(0, 24), "2").page, 1);
});

test("翻页保留筛选语言与无关参数，所有筛选变化和清空重置页码", () => {
  const params = new URLSearchParams(
    "q=clash&platform=android&core=Mihomo&code=open&price=free&sort=updated&page=3&lang=en&extra=1",
  );
  assert.equal(pageParams(params, 2).get("page"), "2");
  assert.equal(pageParams(params, 2).get("q"), "clash");
  assert.equal(params.get("page"), "3", "不得修改原参数");
  for (const key of ["q", "platform", "core", "code", "price", "sort"]) {
    const next = updateFilter(params, key, "new");
    assert.equal(next.has("page"), false);
    assert.equal(next.get(key), "new");
    assert.equal(next.get("lang"), "en");
    assert.equal(next.get("extra"), "1");
  }
  assert.equal(updateFilter(params, "q", "").has("q"), false);
  assert.equal(pageParams(params, 1).has("page"), false);
  assert.equal(clearFilters(params).toString(), "lang=en&extra=1");
  const detail = pageParams(params, 4);
  detail.set("target", "windows");
  detail.delete("target");
  assert.equal(detail.get("page"), "4");
  assert.equal(detail.get("platform"), "android");
});
