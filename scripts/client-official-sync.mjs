import { XMLParser, XMLValidator } from "fast-xml-parser";
import { z } from "zod";
import { testChannel } from "./client-release-sync.mjs";
import { releaseSchema } from "../src/views/clients/model.ts";

const storeSchema = z.object({
  resultCount: z.number().int().nonnegative(),
  results: z.array(
    z.object({
      trackId: z.number().int().positive(),
      bundleId: z.string().min(1),
      wrapperType: z.literal("software"),
      kind: z.literal("software"),
      trackViewUrl: z.url(),
      version: z.string().regex(/^\d+(?:\.\d+)*$/),
      currentVersionReleaseDate: z.iso.datetime().optional(),
    }),
  ),
});

export function parseOfficialRelease(raw, source, previous, now) {
  if (source.kind === "stash-macos")
    return parseStashRelease(raw, source, previous, now);
  if (source.kind !== "app-store" || previous.platform !== "ios")
    throw new Error("不支持的商店平台");
  const data = storeSchema.parse(raw);
  if (data.resultCount !== 1 || data.results.length !== 1)
    throw new Error("商店无唯一结果");
  const app = data.results[0];
  const url = new URL(app.trackViewUrl);
  if (
    app.trackId !== source.trackId ||
    app.bundleId !== source.bundleId ||
    url.origin !== "https://apps.apple.com" ||
    !new RegExp(`^/${source.country}/app/(?:[^/]+/)?id${source.trackId}$`).test(
      url.pathname,
    )
  )
    throw new Error("商店应用身份或入口不匹配");
  return releaseSchema.parse({
    ...previous,
    version: app.version,
    publishedAt: app.currentVersionReleaseDate,
    lastCheckedAt: now,
    maintenance: "automatic",
    source: { label: "App Store（美国区）", url: app.trackViewUrl },
    fallback: { kind: "store", url: app.trackViewUrl },
    downloads: [{ id: "app-store", kind: "store", url: app.trackViewUrl }],
  });
}

export function officialClient({ fetcher = fetch, timeoutMs = 15000 } = {}) {
  return {
    async loadRelease(source) {
      let url;
      if (source.kind === "app-store") {
        url = new URL("https://itunes.apple.com/lookup");
        url.search = new URLSearchParams({
          id: String(source.trackId),
          country: source.country,
          entity: "software",
        }).toString();
      } else if (source.kind === "stash-macos") url = new URL(source.url);
      else throw new Error("不支持的官方来源");
      const response = await fetcher(url.href, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`官方来源 HTTP ${response.status}`);
      return source.kind === "app-store" ? response.json() : response.text();
    },
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  processEntities: false,
  isArray: (_, path) => path === "rss.channel.item",
});
const stashItemSchema = z.object({
  title: z.string(),
  pubDate: z.string().refine((value) => Number.isFinite(Date.parse(value))),
  "sparkle:version": z.string().regex(/^\d+$/),
  "sparkle:shortVersionString": z.string().regex(/^\d+(?:\.\d+)*$/),
  "sparkle:hardwareRequirements": z.never().optional(),
  enclosure: z.object({
    "@_url": z.url(),
    "@_sparkle:os": z.literal("macos").optional(),
  }),
});

function parseStashRelease(xml, source, previous, now) {
  if (previous.appId !== "stash" || previous.platform !== "macos")
    throw new Error("Stash 订阅源只适用于 Mac");
  if (
    typeof xml !== "string" ||
    xml.length > 1_000_000 ||
    /<!DOCTYPE/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("官方订阅 XML 格式错误");
  const feed = parser.parse(xml);
  if (
    feed.rss?.["@_xmlns:sparkle"] !==
      "http://www.andymatuschak.org/xml-namespaces/sparkle" ||
    feed.rss?.channel?.title !== "Stash"
  )
    throw new Error("官方订阅身份不匹配");
  const items = feed.rss.channel.item ?? [];
  // Sparkle 默认渠道才是正式版；未知自定义渠道也不当作正式发布。
  const stable = items
    .filter(
      (item) =>
        !Object.hasOwn(item, "sparkle:channel") &&
        !testChannel.test(
          `${item.title} ${item["sparkle:shortVersionString"]} ${item["sparkle:version"]}`,
        ),
    )
    .map((item) => stashItemSchema.parse(item))
    .sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
  const item = stable[0];
  if (!item) throw new Error("没有正式版");
  const filename = `Stash-build-${item["sparkle:version"]}.zip`;
  const url = item.enclosure["@_url"];
  if (url !== `https://releases.stash.ws/${filename}`)
    throw new Error("安装包来源或版本不匹配");
  return releaseSchema.parse({
    ...previous,
    version: item["sparkle:shortVersionString"],
    publishedAt: new Date(item.pubDate).toISOString(),
    lastCheckedAt: now,
    maintenance: "automatic",
    source: { label: "Stash 官方更新源", url: source.url },
    fallback: { kind: "page", url: source.fallback },
    downloads: [
      { id: filename, kind: "direct", url, arch: "universal", format: "zip" },
    ],
  });
}
