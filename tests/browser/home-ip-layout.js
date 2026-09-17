// 先启动 pnpm dev，再执行：playwright-cli run-code --filename=tests/browser/home-ip-layout.js
// 使用保留地址和拦截响应，不访问真实 IP 数据源；需先 playwright-cli open。
// 入口由 Playwright CLI 注入 page 后调用。
// eslint-disable-next-line no-unused-vars
async function verifyHomeIpLayout(page) {
  const origin = "http://127.0.0.1:5137";
  const domestic = "192.0.2.1";
  const external = "198.51.100.2";
  let scenario;
  let geoRequests = 0;
  await page.unrouteAll({ behavior: "ignoreErrors" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-expose-headers": "cdn-user-ip",
    };
    if (url.startsWith("https://necaptcha.nosdn.127.net/")) {
      return route.fulfill({
        status: 200,
        headers: { ...headers, "cdn-user-ip": domestic },
        body: "",
      });
    }
    if (url.startsWith("https://api4.ipify.org")) {
      return route.fulfill({
        status: 200,
        headers,
        json: { ip: scenario.single ? domestic : external },
      });
    }
    if (url.startsWith("https://ip.net.coffee/api/ip/lookup/")) {
      const ip = decodeURIComponent(url.split("/").pop());
      return route.fulfill({
        status: 200,
        headers,
        json: {
          ip,
          ...(scenario.score === null
            ? {}
            : { trust_score: scenario.score ?? (ip === domestic ? 98 : 100) }),
          company_type: "isp",
          isResidential: true,
        },
      });
    }
    if (url.startsWith("https://api.ip.sb/geoip/")) {
      geoRequests++;
      if (scenario.geo) {
        return route.fulfill({
          status: 200,
          headers,
          json: {
            ip: decodeURIComponent(url.split("/").pop()),
            country: "测试国家 / Test country",
            city: "测试城市 / Test city",
            isp: "Test ISP",
            asn: 64500,
          },
        });
      }
    }
    if (url.startsWith(`${origin}/`) && !url.startsWith(`${origin}/api/`)) {
      return route.continue();
    }
    return route.fulfill({ status: 503, headers, body: "{}" });
  });
  const results = [];
  try {
    for (const state of [
      { name: "归属失败且有评分" },
      { name: "归属成功且有评分", geo: true },
      { name: "零分", score: 0 },
      { name: "无评分", score: null },
      { name: "出口相同仅一张卡片", single: true },
    ]) {
      scenario = state;
      for (const lang of ["zh-CN", "en"]) {
        await page.goto(`${origin}/?lang=${lang}`);
        const cards = page.locator(".home-primary-card");
        const lastCard = cards.nth(state.single ? 0 : 1);
        await lastCard.locator("[data-slot=badge]").first().waitFor();
        await lastCard
          .locator(state.geo ? ".primary-ip-meta p" : ".primary-ip-meta button")
          .first()
          .waitFor();
        await page.evaluate(() => document.fonts.ready);
        const count = await cards.count();
        if (count !== (state.single ? 1 : 2)) throw new Error("卡片数量错误");
        const scores = await cards
          .locator(".ip-reputation-badge strong")
          .allTextContents();
        const expected =
          state.score === null
            ? []
            : state.score === 0
              ? ["0", "0"]
              : state.single
                ? ["98"]
                : ["98", "100"];
        if (JSON.stringify(scores) !== JSON.stringify(expected))
          throw new Error("评分展示错误");
        for (const width of [1440, 1024, 768, 375, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const theme of ["light", "dark"]) {
            await page.evaluate(
              (value) =>
                document.documentElement.classList.toggle(
                  "dark",
                  value === "dark",
                ),
              theme,
            );
            const failures = await cards.evaluateAll((elements) => {
              const errors = [];
              for (const card of elements) {
                const box = card.getBoundingClientRect();
                for (const selector of [
                  ".ip-value",
                  ".primary-ip-meta",
                  ".ip-reputation-badge",
                  ".ip-reputation-badge > span",
                  ".ip-reputation-badge strong",
                ]) {
                  const element = card.querySelector(selector);
                  if (!element) continue;
                  const rect = element.getBoundingClientRect();
                  if (
                    rect.left < box.left - 1 ||
                    rect.right > box.right + 1 ||
                    rect.bottom > box.bottom + 1
                  )
                    errors.push(`${selector} 超出卡片边界`);
                }
                const score = card.querySelector(".ip-reputation-badge");
                if (score) {
                  const right = score.getBoundingClientRect();
                  for (const selector of [".ip-value", ".primary-ip-meta"]) {
                    const left = card
                      .querySelector(selector)
                      .getBoundingClientRect();
                    if (
                      Math.min(left.right, right.right) >
                        Math.max(left.left, right.left) + 1 &&
                      Math.min(left.bottom, right.bottom) >
                        Math.max(left.top, right.top) + 1
                    )
                      errors.push(`${selector} 与评分重叠`);
                  }
                }
                const retry = card.querySelector(".primary-ip-meta button");
                if (retry) {
                  const button = retry.getBoundingClientRect();
                  const message =
                    retry.previousElementSibling.getBoundingClientRect();
                  const sameLine = Math.abs(button.top - message.top) < 1;
                  const nextLine =
                    button.top >= message.bottom - 1 &&
                    button.top - message.bottom <= 12 &&
                    Math.abs(button.left - message.left) < 1;
                  if (
                    !(
                      sameLine &&
                      button.left - message.right >= 0 &&
                      button.left - message.right <= 12
                    ) &&
                    !nextLine
                  )
                    errors.push("重试按钮未紧跟错误文字");
                }
              }
              return errors;
            });
            if (failures.length)
              throw new Error(
                `${state.name} / ${lang} / ${width}px / ${theme}: ${failures.join("；")}`,
              );
            results.push(`${state.name}/${lang}/${width}/${theme}`);
          }
        }
        if (!state.geo) {
          const retry = cards.first().locator(".primary-ip-meta button");
          await cards.first().locator(":scope > a").focus();
          // 地址提示本身是既有的键盘停靠点，再下一步才是重试。
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          if (
            !(await retry.evaluate(
              (element) => document.activeElement === element,
            ))
          )
            throw new Error("Tab 未从卡片链接进入重试按钮");
          for (const action of ["click", "Enter", "Space"]) {
            const before = geoRequests;
            const response = page.waitForResponse((result) =>
              result.url().startsWith("https://ipwho.is/"),
            );
            if (action === "click") await retry.click();
            else {
              await retry.focus();
              await retry.press(action);
            }
            await response;
            await retry.waitFor();
            if (geoRequests <= before || !page.url().startsWith(`${origin}/?`))
              throw new Error("重试没有重新请求或错误触发了卡片跳转");
          }
        }
      }
    }
    return { passed: results.length, scenarios: results };
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  }
}
