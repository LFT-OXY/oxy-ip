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
  return next;
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
      (!filters.core ||
        (filters.core === "unknown"
          ? app.cores.length === 0
          : app.cores.includes(filters.core))) &&
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
