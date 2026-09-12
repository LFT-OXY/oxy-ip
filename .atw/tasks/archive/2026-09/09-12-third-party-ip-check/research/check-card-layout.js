import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

async function checkCardLayout(page) {
  const origin = "http://127.0.0.1:4173";
  const results = [];
  const failures = [];
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
  for (const width of [1440, 1024, 390]) {
    for (const lang of ["zh-CN", "en"]) {
      for (const theme of ["light", "dark"]) {
        for (const path of ["/", "/network/ip/203.0.113.10"]) {
          const label = `${width}/${lang}/${theme}/${path}`;
          await page.setViewportSize({ width, height: 1000 });
          await page.emulateMedia({ colorScheme: theme });
          await page.goto(`${origin}${path}?lang=${lang}`);
          const card = page
            .locator(".tool-card")
            .filter({ has: page.locator('a[href="https://cleanip.io/"]') });
          await card.waitFor();
          if ((await card.count()) !== 1)
            throw new Error(`${label}: 目录不唯一`);
          for (const state of ["closed", "first-open", "all-open"]) {
            if (state === "first-open")
              await card.locator("summary").first().click();
            if (state === "all-open") {
              const closed = card.locator("details:not([open]) > summary");
              while (await closed.count()) await closed.first().click();
            }
            const groups = await card
              .locator("section")
              .evaluateAll((sections) =>
                sections.map((section) => {
                  const list = section.querySelector("ul");
                  const cards = [...list.children];
                  const box = (el) => {
                    const { x, y, width, height } = el.getBoundingClientRect();
                    return { x, y, width, height };
                  };
                  const spread = (values) =>
                    Math.max(...values) - Math.min(...values);
                  const boxes = cards.map(box);
                  const links = cards.map((el) => box(el.querySelector("a")));
                  const summaries = cards.map((el) =>
                    box(el.querySelector("summary")),
                  );
                  const purpose = box(cards[0].querySelector("p"));
                  return {
                    count: cards.length,
                    heightDelta: spread(boxes.map((b) => b.height)),
                    topDelta: spread(boxes.map((b) => b.y)),
                    titleDelta: spread(links.map((b) => b.y)),
                    summaryDelta: spread(summaries.map((b) => b.y)),
                    fillDelta: Math.abs(
                      boxes.at(-1).x +
                        boxes.at(-1).width -
                        (box(list).x + box(list).width),
                    ),
                    horizontal:
                      links[0].x + links[0].width <= purpose.x + 1 &&
                      purpose.x + purpose.width <= summaries[0].x + 1 &&
                      Math.max(links[0].y, purpose.y, summaries[0].y) <
                        Math.min(
                          links[0].y + links[0].height,
                          purpose.y + purpose.height,
                          summaries[0].y + summaries[0].height,
                        ),
                    stacked: boxes.every(
                      (b, i) =>
                        i === 0 || b.y >= boxes[i - 1].y + boxes[i - 1].height,
                    ),
                    overflow: [
                      ...section.querySelectorAll("li, p, summary"),
                    ].filter((el) => el.scrollWidth > el.clientWidth + 1)
                      .length,
                  };
                }),
              );
            const check = (ok, reason) => {
              if (!ok) failures.push(`${label}/${state}: ${reason}`);
            };
            check(
              JSON.stringify(groups.map((g) => g.count)) === "[3,2,3,1]",
              "分组数量",
            );
            for (const [index, group] of groups.entries()) {
              check(group.overflow === 0, `组${index + 1}文字溢出`);
              check(
                group.fillDelta <= 1,
                `组${index + 1}末尾空缺 ${group.fillDelta.toFixed(1)}px`,
              );
              if (width >= 1024 && group.count > 1) {
                check(
                  group.topDelta <= 1,
                  `组${index + 1}未按站点数量排为一行`,
                );
                check(
                  group.heightDelta <= 1,
                  `组${index + 1}高度差 ${group.heightDelta.toFixed(1)}px`,
                );
                check(group.titleDelta <= 1, `组${index + 1}标题不齐`);
                check(
                  group.summaryDelta <= 1,
                  `组${index + 1}提示入口差 ${group.summaryDelta.toFixed(1)}px`,
                );
              }
              if (width < 1024)
                check(group.stacked, `组${index + 1}移动端未堆叠`);
            }
            if (width >= 1024 && state === "closed")
              check(groups[3].horizontal, "单站未横向排列");
            if (
              path === "/" &&
              lang === "zh-CN" &&
              theme === "light" &&
              width !== 1024
            ) {
              await card.screenshot({
                path: `/tmp/ip-card-layout-${width}-${state}.png`,
              });
            }
            results.push({ label, state, groups });
          }
        }
      }
    }
  }
  return {
    passed: failures.length === 0,
    cases: results.length,
    failures,
    maxDesktopHeightDelta: Math.max(
      ...results
        .filter((r) => !r.label.startsWith("390/"))
        .flatMap((r) => r.groups.map((g) => g.heightDelta)),
    ),
    results,
  };
}

// 单次浏览器复查脚本：依赖已有 playwright-cli，不安装浏览器测试框架。
const cli = (...args) =>
  execFileSync("playwright-cli", ["-s=ip-card-layout", ...args], {
    encoding: "utf8",
    cwd: "/tmp",
  });
cli("open", "about:blank", "--browser=chrome");
try {
  const raw = cli("--raw", "run-code", checkCardLayout.toString());
  writeFileSync("/tmp/ip-card-layout-result.json", raw);
  const result = JSON.parse(raw);
  console.log(
    JSON.stringify(
      {
        passed: result.passed,
        cases: result.cases,
        maxDesktopHeightDelta: result.maxDesktopHeightDelta,
        failureCount: result.failures.length,
        failures: result.failures.slice(0, 12),
      },
      null,
      2,
    ),
  );
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.error(error.stdout || error.message);
  process.exitCode = 1;
} finally {
  cli("close");
}
