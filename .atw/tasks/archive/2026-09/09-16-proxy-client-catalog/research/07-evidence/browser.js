async (page) => {
  const results = [];
  const origin = "http://127.0.0.1:4177";
  for (const width of [390, 768, 1440])
    for (const lang of ["zh", "en"])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(
          `${origin}/clients/?lang=${lang}&q=Sing-Box+Windows&platform=windows&core=sing-box&code=open&price=unknown`,
        );
        await page.evaluate(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        );
        await page.reload();
        const card = page.locator(".client-card").filter({
          has: page.getByRole("heading", {
            name: "Sing-Box Windows",
            exact: true,
          }),
        });
        await card.waitFor();
        if ((await page.locator(".client-card").count()) !== 1)
          throw Error("筛选结果");
        if (
          (await page
            .locator("html")
            .evaluate((e) => e.classList.contains("dark"))) !==
          (theme === "dark")
        )
          throw Error("实际主题");
        await card.focus();
        await page.keyboard.press("Enter");
        await page.locator(".client-detail h1").waitFor();
        const selects = page.locator(".client-downloads select");
        await selects.first().selectOption("windows");
        await selects
          .nth(1)
          .selectOption("sing-box-windows-arm64-portable.zip");
        const label = await selects
          .nth(1)
          .locator("option:checked")
          .textContent();
        if (!label.includes("arm64")) throw Error("架构错误");
        if (
          !(
            await page.locator(".client-downloads a").getAttribute("href")
          ).endsWith("/sing-box-windows-arm64-portable.zip")
        )
          throw Error("URL");
        await selects.first().focus();
        await page.keyboard.press("m");
        await page.keyboard.press("Tab");
        await page.waitForFunction(
          () =>
            document.querySelector(".client-downloads select").value ===
            "macos",
        );
        if (
          !(
            await page.locator(".client-downloads a").getAttribute("href")
          ).endsWith(".dmg")
        )
          throw Error("平台包隔离");
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          )
        )
          throw Error("详情溢出");
        if (width === 390 && lang === "zh" && theme === "dark")
          await page.screenshot({
            path: "/tmp/catalog07/mobile-dark.png",
            fullPage: true,
          });
        if (width === 1440 && lang === "en" && theme === "light")
          await page.screenshot({
            path: "/tmp/catalog07/desktop-light.png",
            fullPage: true,
          });
        await page.locator(".client-breadcrumb a").focus();
        await page.keyboard.press("Enter");
        await card.waitFor();
        if (
          (await page.evaluate(() =>
            new URL(location.href).searchParams.get("platform"),
          )) !== "windows"
        )
          throw Error("返回筛选");
        const button = page
          .locator(".client-platforms button")
          .filter({ hasText: /^Linux/ });
        await button.focus();
        await page.keyboard.press("Space");
        await page.waitForFunction(
          () => new URL(location.href).searchParams.get("platform") === "linux",
        );
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          )
        )
          throw Error("列表溢出");
        results.push({
          width,
          lang,
          theme,
          actualTheme: true,
          filter: true,
          keyboardEnterTabSpace: true,
          packageAndPlatform: true,
          returnFilters: true,
          overflow: false,
        });
      }
  return results;
};
