export default async (page) => {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const base = "http://127.0.0.1:4173";
  const results = [];
  const coreControl = (lang) =>
    page.getByRole("combobox", {
      name: lang === "en" ? "Proxy core" : "代理内核",
      exact: true,
    });
  const ready = () =>
    page.locator(".client-results-heading [role=status]").waitFor();
  const params = () =>
    page.evaluate(() =>
      Object.fromEntries(new URL(location.href).searchParams),
    );
  for (const width of [390, 768, 1440]) {
    for (const lang of ["zh", "en"]) {
      for (const theme of ["light", "dark"]) {
        const name = `${width}-${lang}-${theme}`;
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/clients/?lang=${lang}&page=2&keep=12`);
        await page.evaluate(
          (value) => localStorage.setItem("theme", value),
          theme,
        );
        await page.reload();
        await ready();
        check(
          (await page
            .locator("html")
            .evaluate((el) => el.classList.contains("dark"))) ===
            (theme === "dark"),
          `${name}: 实际主题`,
        );
        check(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${name}: 列表横向溢出`,
        );
        const core = coreControl(lang);
        await core.focus();
        await page.keyboard.press("Enter");
        await page.getByRole("listbox").waitFor();
        const labels = await page.getByRole("option").allTextContents();
        check(labels.length === 9, `${name}: 九项选项`);
        if (lang === "zh")
          check(
            JSON.stringify(labels) ===
              JSON.stringify([
                "全部",
                "Mihomo",
                "sing-box",
                "自研",
                "Xray",
                "V2Ray",
                "meow-rs",
                "clash-rs",
                "其他",
              ]),
            `${name}: 中文顺序`,
          );
        else
          check(
            labels.every((text) => !/[\u4e00-\u9fff]/.test(text)),
            `${name}: 英文翻译`,
          );
        const box = await page.getByRole("listbox").boundingBox();
        check(
          box.x >= 0 && box.x + box.width <= width + 1,
          `${name}: 弹层边界`,
        );
        await page.waitForTimeout(200);
        await page.screenshot({
          path: `/tmp/catalog-12/${name}-select.png`,
          animations: "disabled",
        });
        await page.keyboard.press("Escape");
        check(
          await core.evaluate((el) => document.activeElement === el),
          `${name}: Escape焦点返回`,
        );
        await page.keyboard.press("Space");
        await page.getByRole("option", { name: "Mihomo", exact: true }).click();
        await page.waitForFunction(
          () => !new URL(location.href).searchParams.has("page"),
        );
        check(
          (await params()).lang === lang && (await params()).keep === "12",
          `${name}: 参数保留`,
        );
        check((await core.innerText()) === "Mihomo", `${name}: 选择反馈`);
        const selectedUrl = page.url();
        await page.reload();
        await ready();
        check(
          (await coreControl(lang).innerText()) === "Mihomo",
          `${name}: 刷新筛选保留`,
        );
        await page.locator(".client-card-link").first().click();
        await page.locator(".client-detail").waitFor();
        check(
          (await page.locator(".client-detail").innerText()).includes("Mihomo"),
          `${name}: 详情内核保留`,
        );
        await page
          .getByRole("link", {
            name: lang === "en" ? "Back to apps" : "返回应用列表",
            exact: true,
          })
          .click();
        await ready();
        check(page.url() === selectedUrl, `${name}: 详情返回参数`);
        await coreControl(lang).focus();
        await page.keyboard.press("Enter");
        await page.getByRole("listbox").waitFor();
        await page.keyboard.press("End");
        await page.waitForFunction(
          () =>
            document.activeElement ===
            Array.from(document.querySelectorAll("[role=option]")).at(-1),
        );
        await page.keyboard.press("Enter");
        await page.waitForFunction(() =>
          document
            .querySelector(".client-filters [role=combobox]")
            ?.textContent?.match(/其他|Other/),
        );
        check((await params()).keep === "12", `${name}: 键盘选择参数`);
        await page.waitForFunction(
          () =>
            document.activeElement ===
            document.querySelector(".client-filters [role=combobox]"),
        );
        await page.keyboard.press("Tab");
        check(
          await page
            .getByRole("combobox", {
              name: lang === "en" ? "Source code" : "代码状态",
              exact: true,
            })
            .evaluate((el) => document.activeElement === el),
          `${name}: Tab焦点`,
        );
        results.push({ name, labels, passed: true });
      }
    }
  }
  return results;
};
