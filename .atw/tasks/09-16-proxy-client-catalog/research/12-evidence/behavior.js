export default async (page) => {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const base = "http://127.0.0.1:4173";
  const ready = () =>
    page.locator(".client-results-heading [role=status]").waitFor();
  const ids = async () =>
    (
      await page
        .locator(".client-card-link")
        .evaluateAll((links) =>
          links.map((link) => new URL(link.href).pathname.split("/").at(-1)),
        )
    ).sort();
  const records = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [core, expected] of [
    [
      "group:meow-rs",
      ["clash-nyanpasu", "meow", "meow-android", "baoliandeng", "paws"],
    ],
    ["group:clash-rs", ["clash-nyanpasu", "clash-xiaoy", "nikki-rs"]],
    ["Meow", ["clash-nyanpasu"]],
    ["meow-rs", ["meow", "meow-android", "baoliandeng", "paws"]],
    ["Clash Rust", ["clash-nyanpasu", "clash-xiaoy"]],
    ["clash-rs", ["nikki-rs"]],
    ["__not-a-core__", []],
  ]) {
    await page.goto(
      `${base}/clients/?lang=zh&keep=12&core=${encodeURIComponent(core)}`,
    );
    await ready();
    check(
      JSON.stringify(await ids()) === JSON.stringify([...expected].sort()),
      `${core}: 完整成员`,
    );
    const control = page.getByRole("combobox", {
      name: "代理内核",
      exact: true,
    });
    const text = await control.innerText();
    if (!core.startsWith("group:") && expected.length)
      check(
        text.includes(core) && text.includes("精确"),
        `${core}: 旧值明确标识`,
      );
    await control.click();
    check(
      (await page.getByRole("option").count()) === 9,
      `${core}: 旧URL不添加额外选项`,
    );
    await page.keyboard.press("Escape");
    records.push({ core, expected, trigger: text });
  }
  for (const [core, query, expected] of [
    ["group:mihomo", "FlClash", "flclash"],
    ["group:sing-box", "sing-box", "sing-box"],
    ["group:self-developed", "vproxy", "vproxy"],
    ["group:xray", "v2rayNG", "v2rayng"],
    ["group:v2ray", "v2rayNG", "v2rayng"],
    ["group:other", "Shadowrocket", "shadowrocket"],
  ]) {
    await page.goto(
      `${base}/clients/?lang=en&core=${encodeURIComponent(core)}&q=${encodeURIComponent(query)}`,
    );
    await ready();
    check((await ids()).includes(expected), `${core}: 代表应用 ${expected}`);
    records.push({ core, query, expected });
  }
  await page.goto(
    `${base}/clients/?lang=zh&core=group%3Aclash-rs&q=Clash%20Nyanpasu&platform=windows&price=free&code=open&keep=12&page=7`,
  );
  await ready();
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has("page"),
  );
  check(
    JSON.stringify(await ids()) === JSON.stringify(["clash-nyanpasu"]),
    "多维组合匹配",
  );
  const listUrl = page.url();
  const card = page.locator(".client-card-link");
  check(
    (await card.innerText()).includes("Clash Rust") &&
      (await card.innerText()).includes("Meow"),
    "卡片保留具体别名",
  );
  await card.click();
  await page.locator(".client-detail").waitFor();
  const detailUrl = page.url();
  const detailText = await page.locator(".client-detail").innerText();
  check(
    detailText.includes("Clash Premium / Mihomo / Clash Rust / Meow"),
    "详情保留原四内核",
  );
  await page.screenshot({
    path: "/tmp/catalog-12/alias-detail.png",
    animations: "disabled",
  });
  await page.reload();
  await page.locator(".client-detail").waitFor();
  check(page.url() === detailUrl, "详情刷新URL");
  await page.goBack();
  await ready();
  check(page.url() === listUrl, "浏览器后退保留组合");
  await page.goForward();
  await page.locator(".client-detail").waitFor();
  check(page.url() === detailUrl, "浏览器前进保留详情");
  await page.getByRole("link", { name: "返回应用列表", exact: true }).click();
  await ready();
  check(page.url() === listUrl, "返回入口保留组合");
  await page.locator("#client-search").fill("不存在的应用-12");
  await page.getByText("没有匹配的应用", { exact: true }).waitFor();
  check(
    (await page.locator("[data-slot=pagination]").count()) === 0,
    "空态无分页",
  );
  await page
    .getByRole("button", { name: "清除筛选", exact: true })
    .first()
    .click();
  await page.waitForURL(
    (url) => url.searchParams.toString() === "lang=zh&keep=12",
  );
  await page.getByRole("link", { name: "第 2 页", exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get("page") === "2");
  await page.goBack();
  await page.waitForURL((url) => !url.searchParams.has("page"));
  await page.goForward();
  await page.waitForURL((url) => url.searchParams.get("page") === "2");
  await page.getByRole("combobox", { name: "代理内核", exact: true }).click();
  await page.getByRole("option", { name: "自研", exact: true }).click();
  await page.waitForURL(
    (url) =>
      url.searchParams.get("core") === "group:self-developed" &&
      !url.searchParams.has("page"),
  );
  await page.goto(
    `${base}/clients/?lang=zh&core=group%3Aother&q=Clash%20.NET&keep=12`,
  );
  await ready();
  check(
    JSON.stringify(await ids()) === JSON.stringify(["clash-net"]),
    "未知内核归其他",
  );
  await page.locator(".client-card-link").click();
  await page.locator(".client-detail").waitFor();
  check(
    (await page.locator(".client-downloads a").count()) === 0,
    "历史应用无虚构下载",
  );
  check(
    !(await page.locator(".client-detail").innerText()).includes("自研"),
    "未知详情不变自研",
  );
  await page.screenshot({
    path: "/tmp/catalog-12/unknown-detail.png",
    animations: "disabled",
  });
  return {
    records,
    combined: true,
    aliasDetail: true,
    history: true,
    emptyState: true,
    pageReset: true,
    unknown: true,
  };
};
