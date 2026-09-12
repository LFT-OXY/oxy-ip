import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// 单次真实页面复查：在请求边界隔离外站，不安装浏览器测试框架。
async function checkListLayout(page) {
  const origin = "http://127.0.0.1:4173";
  const failures = [];
  const results = [];
  await page.context().route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(`${origin}/`)) return route.continue();
    if (url.startsWith("https://ip.net.coffee/api/ip/lookup/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ip: "203.0.113.10",
          intelligence: { threats: [] },
          geo_sources: [],
        }),
      });
    }
    return route.abort();
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 1024, 768, 390, 320]) {
    for (const lang of ["zh-CN", "en"]) {
      for (const theme of ["light", "dark"]) {
        for (const path of ["/", "/network/ip/203.0.113.10"]) {
          const label = `${width}/${lang}/${theme}/${path}`;
          await page.setViewportSize({ width, height: 1000 });
          await page.emulateMedia({ colorScheme: theme });
          await page.goto(`${origin}${path}?lang=${lang}`);
          const card = page.locator(".tool-card").filter({
            has: page.locator('a[href="https://cleanip.io/"]'),
          });
          await card.waitFor();
          let closed;
          for (const state of ["closed", "first-open", "all-open"]) {
            // 批量开合只用于布局测量；鼠标、键盘和独立开合另外验证。
            await card.locator("details").evaluateAll((nodes, state) => {
              nodes.forEach((node, i) => {
                node.open =
                  state === "all-open" || (state === "first-open" && i === 0);
              });
            }, state);
            const layout = await card.evaluate((root) => {
              const box = (el) => {
                const { x, y, width, height, right, bottom } =
                  el.getBoundingClientRect();
                return { x, y, width, height, right, bottom };
              };
              const rows = [...root.querySelectorAll("li")];
              const header = root.querySelector('[aria-hidden="true"]');
              return {
                headers: header ? [...header.children].map(box) : [],
                rows: rows.map((row) => ({
                  box: box(row),
                  category:
                    row.firstElementChild?.tagName === "SPAN"
                      ? box(row.firstElementChild)
                      : null,
                  link: box(row.querySelector("a")),
                  purpose: box(row.querySelector("p")),
                  summary: box(row.querySelector("summary")),
                  hint: row.querySelector("details").open
                    ? box(row.querySelector("details p"))
                    : null,
                  bordered:
                    parseFloat(getComputedStyle(row).borderLeftWidth) > 0,
                })),
                overflow: [...root.querySelectorAll("li, p, summary")].filter(
                  (el) => el.scrollWidth > el.clientWidth + 1,
                ).length,
              };
            });
            const check = (ok, reason) => {
              if (!ok) failures.push(`${label}/${state}: ${reason}`);
            };
            check(layout.rows.length === 9, "九站常显");
            check(layout.overflow === 0, "文案横向溢出");
            if (state === "closed") closed = layout;
            for (const [i, row] of layout.rows.entries()) {
              check(!row.bordered, `第${i + 1}站仍是嵌套卡片`);
              if (i)
                check(
                  row.box.y >= layout.rows[i - 1].box.bottom - 1,
                  "站点未逐行堆叠",
                );
              if (width >= 768) {
                check(
                  layout.headers.length === 4 && row.category,
                  "缺少四列表头或类别",
                );
                if (layout.headers.length === 4 && row.category) {
                  const cols = [
                    row.category,
                    row.link,
                    row.purpose,
                    row.summary,
                  ];
                  cols.forEach((col, j) => {
                    const edge = j === 3 ? "right" : "x";
                    check(
                      Math.abs(col[edge] - layout.headers[j][edge]) <= 1,
                      `第${i + 1}站第${j + 1}列不齐`,
                    );
                  });
                  check(
                    row.category.right <= row.link.x + 1 &&
                      row.link.right <= row.purpose.x + 1 &&
                      row.purpose.right <= row.summary.x + 1,
                    "列相互覆盖",
                  );
                }
                check(
                  Math.abs(
                    row.summary.y -
                      row.box.y -
                      (closed.rows[i].summary.y - closed.rows[i].box.y),
                  ) <= 1,
                  "开合移动本行提示入口",
                );
              } else {
                check(
                  row.purpose.y >= row.link.bottom - 1 &&
                    row.summary.y >= row.purpose.bottom - 1,
                  "移动端未自然堆叠",
                );
              }
              if (row.hint) {
                check(
                  Math.abs(row.hint.x - row.box.x) <= 1 &&
                    Math.abs(row.hint.right - row.box.right) <= 1,
                  "展开提示未占满行宽",
                );
                check(
                  row.hint.y >=
                    Math.max(
                      row.link.bottom,
                      row.purpose.bottom,
                      row.summary.bottom,
                    ) -
                      1,
                  "提示未置于对应行下方",
                );
              }
            }
            if (
              path === "/" &&
              ((lang === "zh-CN" && theme === "light" && width === 1440) ||
                (lang === "en" && theme === "dark" && width === 390))
            ) {
              await card.screenshot({
                path: `/tmp/ip-list-${width}-${lang}-${state}.png`,
              });
            }
            results.push({ label, state, layout });
          }
        }
      }
    }
  }
  return {
    passed: failures.length === 0,
    cases: results.length,
    failures,
    results,
  };
}

const cli = (...args) =>
  execFileSync("playwright-cli", ["-s=ip-list-layout", ...args], {
    encoding: "utf8",
    cwd: "/tmp",
    maxBuffer: 8 * 1024 * 1024,
  });
cli("open", "about:blank", "--browser=chrome");
try {
  const raw = cli("--raw", "run-code", checkListLayout.toString());
  writeFileSync("/tmp/ip-list-layout-result.json", raw);
  const result = JSON.parse(raw);
  console.log(
    JSON.stringify(
      {
        passed: result.passed,
        cases: result.cases,
        failureCount: result.failures.length,
        failures: result.failures.slice(0, 12),
      },
      null,
      2,
    ),
  );
  if (!result.passed) process.exitCode = 1;
} finally {
  cli("close");
}
