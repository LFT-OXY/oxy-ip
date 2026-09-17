async (page) => {
  const results = [];
  const origin = "http://127.0.0.1:4177";
  const names = [
    ["clash-net", "Clash .NET"],
    ["lvory", "lvory"],
  ];
  for (const width of [390, 768, 1440])
    for (const lang of ["zh", "en"])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(
          `${origin}/clients/?lang=${lang}&platform=windows&code=unknown&price=unknown&core=unknown`,
        );
        await page.evaluate(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        );
        await page.reload();
        await page.locator(".client-card").first().waitFor();
        if (
          (await page
            .locator("html")
            .evaluate((el) => el.classList.contains("dark"))) !==
          (theme === "dark")
        )
          throw Error("实际主题错误");
        if ((await page.locator(".client-card").count()) !== 2)
          throw Error("历史未知条件组合筛选错误");
        for (const [id, name] of names) {
          const card = page
            .locator(".client-card")
            .filter({ has: page.getByRole("heading", { name, exact: true }) });
          await card.focus();
          await page.keyboard.press("Enter");
          await page.locator(".client-detail h1").waitFor();
          if (await page.locator(".client-downloads a").count())
            throw Error("历史条目出现下载按钮");
          if (
            !(
              await page.locator(".client-download-note").textContent()
            ).includes(lang === "zh" ? "当前无法获取" : "Currently unavailable")
          )
            throw Error("缺不可获取说明");
          if (
            !(await page.locator(".client-source").textContent()).includes(
              lang === "zh" ? "非官方" : "unofficial",
            )
          )
            throw Error("历史来源冒作官方");
          if (await page.locator(".client-release-row time").count())
            throw Error("历史记录伪造时间");
          await page.waitForFunction(() =>
            [...document.querySelectorAll(".client-icon")].every(
              (img) =>
                img instanceof HTMLImageElement &&
                img.complete &&
                img.naturalWidth > 0,
            ),
          );
          if (
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            )
          )
            throw Error("历史详情溢出");
          if (
            width === 390 &&
            lang === "zh" &&
            theme === "dark" &&
            id === "clash-net"
          )
            await page.screenshot({
              path: "/tmp/07-history-mobile.png",
              fullPage: true,
            });
          if (
            width === 1440 &&
            lang === "en" &&
            theme === "light" &&
            id === "lvory"
          )
            await page.screenshot({
              path: "/tmp/07-history-desktop.png",
              fullPage: true,
            });
          await page.locator(".client-breadcrumb a").focus();
          await page.keyboard.press("Enter");
          await page.locator(".client-card").first().waitFor();
          if ((await page.locator(".client-card").count()) !== 2)
            throw Error("返回丢失筛选");
        }
        for (const id of [
          "shellcrash",
          "passwall",
          "passwall2",
          "nikki",
          "nikki-rs",
          "momo",
          "homeproxy",
          "hey",
        ]) {
          await page.goto(`${origin}/clients/${id}?lang=${lang}`);
          await page.locator(".client-detail h1").waitFor();
          await page.waitForFunction(() =>
            [...document.querySelectorAll(".client-icon")].every(
              (img) =>
                img instanceof HTMLImageElement &&
                img.complete &&
                img.naturalWidth > 0,
            ),
          );
          if ((await page.locator(".client-downloads a").count()) !== 1)
            throw Error(`${id}获取入口丢失`);
          if (id === "hey") {
            if (
              (await page
                .locator(".client-downloads a")
                .getAttribute("href")) !== "https://github.com/popsiclelmlm/Hey"
            )
              throw Error("Hey非官方源码");
            if (
              !(
                await page.locator(".client-download-note").textContent()
              ).includes(lang === "zh" ? "仅发布源码" : "source")
            )
              throw Error("Hey缺源码限定");
            if (await page.locator(".client-release-row time").count())
              throw Error("Hey伪造时间");
          }
          if (
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            )
          )
            throw Error(`${id}详情溢出`);
        }
        results.push({
          width,
          lang,
          theme,
          historicalNoDownload: true,
          unknownFilterAndKeyboardReturn: true,
          allPlaceholdersLoaded: true,
          heySourceOnly: true,
          overflow: false,
        });
      }
  return results;
};
