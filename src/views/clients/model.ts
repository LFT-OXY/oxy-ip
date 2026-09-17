import { z } from "zod";

export const platforms = {
  android: "Android",
  ios: "iPhone / iPad",
  harmonyos: "HarmonyOS",
  windows: "Windows",
  macos: "Mac",
  linux: "Linux",
  openwrt: "OpenWrt",
  asus: "华硕 / 梅林",
  "steam-deck": "Steam Deck",
} as const;
export const codeLabels = {
  open: "开源",
  partial: "源码不完整",
  available: "源码可见",
  closed: "未公开",
  unknown: "待核实",
} as const;
export const priceLabels = {
  free: "免费",
  paid: "付费",
  unknown: "待核实",
} as const;
export const coreGroupLabels = {
  "": "全部",
  "group:mihomo": "Mihomo",
  "group:sing-box": "sing-box",
  "group:self-developed": "自研",
  "group:xray": "Xray",
  "group:v2ray": "V2Ray",
  "group:meow-rs": "meow-rs",
  "group:clash-rs": "clash-rs",
  "group:other": "其他",
} as const;
type CoreGroup = Exclude<keyof typeof coreGroupLabels, "">;
// 仅收录有来源依据的归并；未知名称不推定为自研。
const coreGroups: ReadonlyMap<string, CoreGroup> = new Map([
  ["Mihomo", "group:mihomo"],
  ["Hako", "group:mihomo"],
  ["CoreX", "group:mihomo"],
  ["sing-box", "group:sing-box"],
  ["VX", "group:self-developed"],
  ["Sudoku", "group:self-developed"],
  ["Xray", "group:xray"],
  ["V2Ray", "group:v2ray"],
  ["Meow", "group:meow-rs"],
  ["meow-rs", "group:meow-rs"],
  ["Clash Rust", "group:clash-rs"],
  ["clash-rs", "group:clash-rs"],
]);
function matchesCore(cores: string[], value: string) {
  if (!value) return true;
  if (value.startsWith("group:")) {
    return cores.length
      ? cores.some((core) => (coreGroups.get(core) ?? "group:other") === value)
      : value === "group:other";
  }
  // 旧链接继续精确匹配，不能静默扩为整类。
  return value === "unknown" ? cores.length === 0 : cores.includes(value);
}
const platformSchema = z.enum(
  Object.keys(platforms) as [
    keyof typeof platforms,
    ...(keyof typeof platforms)[],
  ],
);
const httpsUrl = z
  .url()
  .refine((url) => new URL(url).protocol === "https:", "只允许 HTTPS 官方入口");
const sourceSchema = z.object({ label: z.string().min(1), url: httpsUrl });
export const appSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  aliases: z.array(z.string()),
  description: z.string().min(1),
  icon: z.string().startsWith("/client-icons/"),
  platforms: z.array(platformSchema).min(1),
  cores: z.array(z.string()),
  code: z.enum(["open", "partial", "available", "closed", "unknown"]),
  price: z.enum(["free", "paid", "unknown"]),
  priceDetails: z.string(),
  developers: z.array(z.string()),
  sources: z.array(httpsUrl).min(1),
});
const downloadSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("direct"),
    url: httpsUrl,
    arch: z.string().min(1),
    format: z.string().min(1),
  }),
  z.object({ id: z.string(), kind: z.enum(["store", "page"]), url: httpsUrl }),
]);
export const releaseSchema = z
  .object({
    appId: z.string(),
    platform: platformSchema,
    version: z.string().min(1).optional(),
    publishedAt: z.iso.datetime().optional(),
    lastCheckedAt: z.iso.datetime().optional(),
    maintenance: z.enum(["manual", "automatic"]),
    source: sourceSchema,
    fallback: z
      .object({ kind: z.enum(["store", "page"]), url: httpsUrl })
      .optional(),
    unavailable: z.literal(true).optional(),
    note: z.string().optional(),
    downloads: z.array(downloadSchema),
  })
  .refine(
    (row) =>
      row.unavailable
        ? row.maintenance === "manual" &&
          row.downloads.length === 0 &&
          !row.fallback &&
          !row.version &&
          !row.publishedAt &&
          !row.lastCheckedAt &&
          !!row.note
        : row.downloads.length > 0 && !!row.fallback,
    "不可获取的历史记录只能保留人工说明；其他快照必须有获取选项及官方回退入口",
  )
  .refine(
    (row) => !!row.version || row.downloads.every((d) => d.kind !== "direct"),
    "直链必须属于明确版本",
  );
export type ClientApp = z.infer<typeof appSchema>;
export type ClientRelease = z.infer<typeof releaseSchema>;
export type Platform = keyof typeof platforms;

const filterKeys = ["q", "platform", "core", "code", "price", "sort"] as const;
export function readFilters(params: URLSearchParams) {
  return Object.fromEntries(
    filterKeys.map((key) => [key, params.get(key) ?? ""]),
  ) as Record<(typeof filterKeys)[number], string>;
}
export function clearFilters(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  filterKeys.forEach((key) => next.delete(key));
  next.delete("page");
  return next;
}
export function updateFilter(
  params: URLSearchParams,
  key: (typeof filterKeys)[number],
  value: string,
) {
  const next = pageParams(params, 1);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}
export function pageParams(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  if (page > 1) next.set("page", String(page));
  else next.delete("page");
  return next;
}
export function paginateApps(matches: ClientApp[], rawPage: string | null) {
  const size = 24;
  const total = matches.length;
  const pageCount = Math.ceil(total / size);
  const requested = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const valid =
    Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const page = Math.min(valid, Math.max(1, pageCount));
  const offset = (page - 1) * size;
  return {
    items: matches.slice(offset, offset + size),
    total,
    page,
    pageCount,
    start: total ? offset + 1 : 0,
    end: Math.min(offset + size, total),
  };
}
export function releaseFor(
  rows: ClientRelease[],
  appId: string,
  platform: string,
) {
  return rows.find((row) => row.appId === appId && row.platform === platform);
}
export function selectedDownload(
  release: ClientRelease | undefined,
  id: string,
) {
  return (
    release?.downloads.find((download) => download.id === id) ??
    release?.downloads[0]
  );
}
export function latestPublishedAt(
  rows: ClientRelease[],
  appId: string,
  platform = "",
) {
  return rows
    .filter(
      (row) => row.appId === appId && (!platform || row.platform === platform),
    )
    .map((row) => row.publishedAt)
    .filter((date): date is string => !!date)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}
export function filterApps(
  apps: ClientApp[],
  rows: ClientRelease[],
  filters: ReturnType<typeof readFilters>,
  translate: (text: string) => string,
) {
  const query = filters.q.trim().toLocaleLowerCase();
  const matches = apps.filter((app) => {
    const texts = [app.name, ...app.aliases, app.description];
    return (
      (!query ||
        texts
          .flatMap((text) => [text, translate(text)])
          .join(" ")
          .toLocaleLowerCase()
          .includes(query)) &&
      (!filters.platform ||
        app.platforms.some((platform) => platform === filters.platform)) &&
      matchesCore(app.cores, filters.core) &&
      (!filters.code || app.code === filters.code) &&
      (!filters.price || app.price === filters.price)
    );
  });
  if (filters.sort === "updated") {
    const time = (app: ClientApp) => {
      const date = latestPublishedAt(rows, app.id, filters.platform);
      return date ? Date.parse(date) : 0;
    };
    matches.sort((a, b) => time(b) - time(a));
  }
  return matches;
}
