async (page) => {
  const results = [];
  for (const width of [390, 768, 1440])
    for (const lang of ["zh", "en"])
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(
          `http://127.0.0.1:4177/clients/?lang=${lang}&platform=openwrt&q=daed`,
        );
        await page.evaluate((t) => localStorage.setItem("theme", t), theme);
        await page.reload();
        const card = page
          .locator(".client-card")
          .filter({
            has: page.getByRole("heading", { name: "daed", exact: true }),
          });
        await card.waitFor();
        if (
          (await page
            .locator("html")
            .evaluate((e) => e.classList.contains("dark"))) !==
          (theme === "dark")
        )
          throw Error("主题");
        await card.focus();
        await page.keyboard.press("Enter");
        await page.locator(".client-detail h1").waitFor();
        for (const [id, version, file] of [
          ["daed", "1.24.0-r1", "daed_1.24.0-r1_aarch64_generic.ipk"],
          ["dae", "1.0.0-r1", "dae_1.0.0-r1_aarch64_generic.ipk"],
          [
            "homeproxy",
            "26.187.07809~9bce398",
            "luci-app-homeproxy_26.187.07809~9bce398_all.ipk",
          ],
        ]) {
          if (id !== "daed")
            await page.goto(
              `http://127.0.0.1:4177/clients/${id}?lang=${lang}&target=openwrt`,
            );
          await page.locator(".client-detail h1").waitFor();
          if (
            (await page.locator(".client-release-row strong").textContent()) !==
            version
          )
            throw Error("版本 " + id);
          const platform = page.locator(".client-downloads select").first(),
            packages = page.locator(".client-downloads select").nth(1);
          if ((await platform.inputValue()) !== "openwrt") throw Error("平台");
          await packages.selectOption(file);
          if (
            !(
              await page.locator(".client-downloads a").getAttribute("href")
            ).endsWith(file)
          )
            throw Error("IPK");
          await packages.selectOption("official-feed");
          const url = await page
            .locator(".client-downloads a")
            .getAttribute("href");
          if (!url.endsWith(id === "homeproxy" ? "/luci/" : "/packages/"))
            throw Error("官方目录");
          await packages.focus();
          await page.keyboard.press("o");
          await page.keyboard.press("Tab");
          if (
            !(
              await page.locator(".client-downloads a").getAttribute("href")
            ).endsWith(file)
          )
            throw Error("键盘切回");
          const note = await page
            .locator(".client-download-note")
            .textContent();
          if (lang === "en" && /[\u4e00-\u9fff]/.test(note))
            throw Error("英文");
          if (!note.includes("ImmortalWrt 24.10.4")) throw Error("系统条件");
          if (
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            )
          )
            throw Error("溢出");
          if (
            id === "daed" &&
            width === 390 &&
            lang === "zh" &&
            theme === "dark"
          )
            await page.screenshot({
              path: "/tmp/catalog07/review/daed-mobile.png",
              fullPage: true,
            });
          if (
            id === "homeproxy" &&
            width === 1440 &&
            lang === "en" &&
            theme === "light"
          )
            await page.screenshot({
              path: "/tmp/catalog07/review/homeproxy-desktop.png",
              fullPage: true,
            });
          if (id === "daed") {
            await platform.selectOption("linux");
            await page.waitForFunction(
              () =>
                document.querySelector(".client-release-row strong")
                  .textContent === "v1.27.0",
            );
            if (
              (await page
                .locator(".client-release-row strong")
                .textContent()) !== "v1.27.0"
            )
              throw Error("Linux隔离");
            await platform.selectOption("openwrt");
          }
        }
        results.push({
          width,
          lang,
          theme,
          daedOpenWrtFilter: true,
          threeIndependentVersions: true,
          packagePageKeyboard: true,
          translatedNotes: true,
          noOverflow: true,
        });
      }
  return results;
};
