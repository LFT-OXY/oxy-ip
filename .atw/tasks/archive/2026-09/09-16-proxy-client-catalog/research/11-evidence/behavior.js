async (page) => {
  const check = (ok, msg) => {
    if (!ok) throw Error(msg);
  };
  const base = "http://127.0.0.1:4173";
  const go = async (path) => {
    await page.goto(base + path);
    await page.locator(".client-main, .client-detail").waitFor();
  };
  const query = () =>
    page.evaluate(() =>
      Object.fromEntries(new URLSearchParams(location.search)),
    );
  const pageReady = async (n) => {
    await page.waitForFunction(
      (n) =>
        document.querySelector("[data-slot=pagination-link][aria-current=page]")
          ?.textContent === String(n),
      n,
    );
  };
  const choose = async (label, value) => {
    await page.getByRole("combobox", { name: label, exact: true }).click();
    await page.getByRole("option", { name: value, exact: true }).click();
    const id = await page
      .getByRole("combobox", { name: label, exact: true })
      .getAttribute("id");
    await page.waitForFunction(
      ({ id, value }) => document.getElementById(id)?.textContent === value,
      { id, value },
    );
  };
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("/clients/?lang=en");
  const ids = [];
  for (let n = 1; n <= 7; n++) {
    if (n > 1)
      await page.getByRole("link", { name: "Next", exact: true }).click();
    await pageReady(n);
    ids.push(
      ...(await page
        .locator(".client-card-link")
        .evaluateAll((links) => links.map((l) => l.pathname.split("/").pop()))),
    );
  }
  check(ids.length === 154 && new Set(ids).size === 154, "逐页154唯一身份");
  await page.getByRole("link", { name: "Previous", exact: true }).focus();
  await page.keyboard.press("Enter");
  await pageReady(6);
  await page.goBack();
  await pageReady(7);
  await page.goForward();
  await pageReady(6);
  await page.reload();
  await pageReady(6);
  const before = await query();
  await page.locator(".client-card-link").first().click();
  await page.locator(".client-detail").waitFor();
  await page.reload();
  await page.getByRole("link", { name: "Back to apps", exact: true }).click();
  await pageReady(6);
  check(
    JSON.stringify(await query()) === JSON.stringify(before),
    "详情刷新返回状态",
  );
  for (const [label, option, key] of [
    ["Source code", "Open source", "code"],
    ["Price", "Free", "price"],
    ["Proxy core", "Mihomo", "core"],
    ["Sort", "Recently updated", "sort"],
  ]) {
    await go("/clients/?lang=en&page=2&extra=1");
    await choose(label, option);
    await page.waitForFunction(
      (key) => new URLSearchParams(location.search).has(key),
      key,
    );
    const p = await query();
    check(!p.page && p.lang === "en" && p.extra === "1", "筛选重置 " + key);
  }
  await go("/clients/?lang=en&page=3");
  await page.getByRole("button", { name: "Android 49", exact: true }).click();
  await page.waitForFunction(
    () => new URLSearchParams(location.search).get("platform") === "android",
  );
  check(!(await query()).page, "分类回首页");
  await go("/clients/?lang=en&page=3&extra=1");
  await page
    .getByRole("searchbox", { name: "Search apps" })
    .fill("no-such-app-98765");
  await page.locator(".client-empty").waitFor();
  check(
    (await page.locator("[data-slot=pagination]").count()) === 0,
    "无结果无分页",
  );
  check(!(await query()).page, "搜索回首页");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .last()
    .click();
  await pageReady(1);
  check((await query()).extra === "1", "清空保留其他状态");
  for (const [raw, expected] of [
    ["bad", 1],
    ["-1", 1],
    ["1.5", 1],
    ["0", 1],
    ["999", 7],
  ]) {
    await go("/clients/?lang=en&page=" + raw);
    await pageReady(expected);
    await page.waitForFunction(
      (expected) =>
        new URLSearchParams(location.search).get("page") ===
        (expected === 1 ? null : String(expected)),
      expected,
    );
  }
  await go("/clients/?lang=en&core=not-a-core&page=7");
  await page.locator(".client-empty").waitFor();
  check(
    (await page
      .getByRole("combobox", { name: "Proxy core", exact: true })
      .innerText()) === "No matching option",
    "无效筛选不伪装全部",
  );
  await go("/clients/flclash?lang=en&platform=android&page=2");
  const href = () => page.locator(".client-downloads a").getAttribute("href");
  const android = await href();
  check(android.includes(".apk"), "Android包");
  await choose("Download platform", "Windows");
  await page.waitForFunction(() =>
    document.querySelector(".client-downloads a")?.href.endsWith(".exe"),
  );
  check(
    (await query()).platform === "android" &&
      (await query()).page === "2" &&
      (await query()).target === "windows",
    "详情平台不改列表",
  );
  await page
    .getByRole("combobox", { name: "Package type", exact: true })
    .click();
  const options = await page.getByRole("option").allTextContents();
  check(
    options.every((s) => s.startsWith("Windows")),
    "Windows包隔离",
  );
  await page.keyboard.press("Escape");
  await choose("Download platform", "Android");
  check((await href()) === android, "切回Android首包");
  await page.getByRole("link", { name: "Back to apps", exact: true }).click();
  await pageReady(2);
  check(!(await query()).target, "返回只去target");
  await go("/clients/stash?lang=en");
  check(
    (await page
      .getByRole("link", { name: "Open official app store" })
      .count()) === 1,
    "store标签",
  );
  await choose("Download platform", "Windows");
  check(
    (await page
      .getByRole("link", { name: "Open official download page" })
      .count()) === 1,
    "page标签",
  );
  const mixedResults = [];
  for (const width of [390, 1440])
    for (const lang of ["zh", "en"])
      for (const theme of ["light", "dark"]) {
        const name = `${width}-${lang}-${theme}`;
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        );
        await go(`/clients/dae?lang=${lang}&target=openwrt`);
        check(
          (await page
            .locator("html")
            .evaluate((el) => el.classList.contains("dark"))) ===
            (theme === "dark"),
          name + " mixed actual theme",
        );
        const direct = await href();
        check(direct.endsWith(".ipk"), name + " 混合入口初始直链");
        const label = lang === "en" ? "Package type" : "安装包类型";
        await choose(
          label,
          lang === "en" ? "Official download page" : "官方下载页",
        );
        check((await href()) !== direct, name + " 混合入口选择官方页");
        const pkg = page.getByRole("combobox", { name: label, exact: true });
        check(await pkg.isVisible(), name + " 保留选择器");
        await pkg.press("Space");
        await page.getByRole("listbox").waitFor();
        const targetOption = page.getByRole("option").first();
        const targetText = await targetOption.innerText();
        check(targetText.includes("ipk"), name + " target direct option");
        await page.keyboard.press("Home");
        await page.waitForFunction(
          () =>
            document.activeElement ===
            Array.from(document.querySelectorAll("[role=option]")).at(0),
        );
        await page.screenshot({
          path: `/tmp/catalog-11/mixed-${name}.png`,
          animations: "disabled",
        });
        await page.keyboard.press("Enter");
        await page.waitForFunction(
          (url) => document.querySelector(".client-downloads a")?.href === url,
          direct,
        );
        check(
          (await href()) === direct && (await pkg.innerText()) === targetText,
          name + " 键盘切回直链",
        );
        await go(`/clients/clash-net?lang=${lang}`);
        check(
          (await page.locator(".client-downloads a").count()) === 0,
          name + " 历史无下载",
        );
        check(
          (await page.locator(".client-release-row").count()) === 1,
          name + " 精简结束信息保留",
        );
        await page.screenshot({
          path: `/tmp/catalog-11/history-${name}.png`,
          animations: "disabled",
        });
        mixedResults.push({ name, passed: true });
      }
  return {
    passed: true,
    mixedResults,
    ids,
    checks:
      "逐页、刷新、返回、前进后退、六种筛选重置、URL边界、平台包隔离、store/page/direct、混合入口键盘切回、历史无按钮",
  };
};
