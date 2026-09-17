async (page) => {
  const check = (condition, text) => {
    if (!condition) throw Error(text);
  };
  const results = [];
  const base = "http://127.0.0.1:4173";
  for (const width of [390, 768, 1440])
    for (const lang of ["zh", "en"])
      for (const theme of ["light", "dark"]) {
        const name = `${width}-${lang}-${theme}`;
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/clients/?lang=${lang}&page=2`);
        await page.evaluate(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        );
        await page.reload();
        await page.locator(".client-card-link").first().waitFor();
        check(
          (await page.locator(".client-card-link").count()) === 24,
          name + " page size",
        );
        check(
          (await page
            .locator("html")
            .evaluate((el) => el.classList.contains("dark"))) ===
            (theme === "dark"),
          name + " actual theme",
        );
        check(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          name + " list overflow",
        );
        check(
          (await page.locator("select:visible").count()) === 0,
          name + " native select",
        );
        await page.screenshot({
          animations: "disabled",
          path: `/tmp/catalog-11/${name}-list.png`,
        });
        const core = page.getByRole("combobox", {
          name: lang === "en" ? "Proxy core" : "代理内核",
          exact: true,
        });
        await core.focus();
        await page.keyboard.press("Enter");
        await page.getByRole("listbox").waitFor();
        await page.waitForTimeout(150);
        await page.screenshot({
          animations: "disabled",
          path: `/tmp/catalog-11/${name}-select.png`,
        });
        await page.keyboard.press("Escape");
        check(
          await core.evaluate((el) => document.activeElement === el),
          name + " escape focus",
        );
        await core.press("Space");
        await page.getByRole("option", { name: "Mihomo", exact: true }).click();
        await page.waitForURL(
          (url) =>
            url.searchParams.get("core") === "Mihomo" &&
            !url.searchParams.has("page"),
        );
        const sort = page.getByRole("combobox", {
          name: lang === "en" ? "Sort" : "排序",
          exact: true,
        });
        await sort.click();
        await page.getByRole("listbox").waitFor();
        await page.waitForTimeout(150);
        await page.keyboard.press("End");
        await page.waitForFunction(() =>
          document.activeElement?.textContent?.match(
            /最近更新|Recently updated/,
          ),
        );
        await page.keyboard.press("Enter");
        await page.waitForURL(
          (url) => url.searchParams.get("sort") === "updated",
        );
        await page
          .getByRole("button", {
            name: lang === "en" ? "Clear filters" : "清除筛选",
            exact: true,
          })
          .first()
          .click();
        await page.waitForURL(
          (url) => url.searchParams.toString() === `lang=${lang}`,
        );
        const pager = page.locator("[data-slot=pagination]");
        await pager
          .getByRole("link", {
            name: lang === "en" ? "Page 7" : "第 7 页",
            exact: true,
          })
          .click();
        await page.waitForURL((url) => url.searchParams.get("page") === "7");
        await page.waitForFunction(
          () => document.querySelectorAll(".client-card-link").length === 10,
        );
        check(
          (await page.locator(".client-card-link").count()) === 10,
          name + " last page count",
        );
        check(
          await page
            .locator(".client-results-heading [role=status]")
            .innerText()
            .then((t) => t.includes("154") && t.includes("145–154")),
          name + " range",
        );
        await pager.scrollIntoViewIfNeeded();
        await page.screenshot({
          animations: "disabled",
          path: `/tmp/catalog-11/${name}-pagination.png`,
        });
        check(
          (await pager.locator("a[aria-disabled=true]").count()) === 1,
          name + " disabled next",
        );
        await page.goto(
          `${base}/clients/yumebox?lang=${lang}&page=2&platform=android`,
        );
        const pkg = page.getByRole("combobox", {
          name: lang === "en" ? "Package type" : "安装包类型",
          exact: true,
        });
        await pkg.waitFor();
        const builtinUrl = await page
          .locator(".client-downloads a")
          .getAttribute("href");
        check(
          builtinUrl.includes("YumeBox-builtin-"),
          name + " initial package",
        );
        const externalUrl = builtinUrl.replace(
          "YumeBox-builtin-",
          "YumeBox-external-",
        );
        await pkg.click();
        await page.getByRole("listbox").waitFor();
        await page.waitForTimeout(150);
        check(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          name + " long package overflow",
        );
        const box = await page.getByRole("listbox").boundingBox();
        check(
          box.x >= 0 && box.x + box.width <= width + 1,
          name + " popup bounds",
        );
        await page.screenshot({
          animations: "disabled",
          path: `/tmp/catalog-11/${name}-package.png`,
        });
        const targetOption = page.getByRole("option").last();
        const targetText = await targetOption.innerText();
        check(
          targetText.includes("YumeBox-external-"),
          name + " target package",
        );
        await page.keyboard.press("End");
        await page.waitForFunction(
          () =>
            document.activeElement ===
            Array.from(document.querySelectorAll("[role=option]")).at(-1),
        );
        await page.keyboard.press("Enter");
        await page.waitForFunction(
          (url) => document.querySelector(".client-downloads a")?.href === url,
          externalUrl,
        );
        check(
          (await pkg.innerText()) === targetText,
          name + " selected package label",
        );
        check(
          await pkg.evaluate((el) => document.activeElement === el),
          name + " selected focus",
        );
        await page.keyboard.press("Tab");
        check(
          await page.evaluate(() => document.activeElement?.tagName === "A"),
          name + " download tab",
        );
        await page.screenshot({
          animations: "disabled",
          path: `/tmp/catalog-11/${name}-detail.png`,
        });
        await page
          .getByRole("link", {
            name: lang === "en" ? "Back to apps" : "返回应用列表",
            exact: true,
          })
          .click();
        await page.waitForURL(
          (url) =>
            url.pathname === "/clients/" &&
            url.searchParams.get("page") === "2",
        );
        check(
          (await page.evaluate(() =>
            new URL(location.href).searchParams.get("platform"),
          )) === "android",
          name + " return platform",
        );
        results.push({ name, passed: true });
      }
  return results;
};
