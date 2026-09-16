import { z } from "zod";
import { releaseSchema } from "../src/views/clients/model.ts";

export const testChannel =
  /(?:alpha|beta|nightly|preview|canary|snapshot|unstable|(?:^|[^a-z])(?:rc|test|testing|dev|development)\d*(?:$|[^a-z]))/i;
const metadataSchema = z.object({
  id: z.number().int().positive(),
  tag_name: z.string().min(1),
  name: z.string().nullable(),
  html_url: z.url(),
  published_at: z.iso.datetime(),
  draft: z.boolean(),
  prerelease: z.boolean(),
});
const assetSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  browser_download_url: z.url(),
  state: z.literal("uploaded"),
});

export function selectStableRelease(raw) {
  if (!Array.isArray(raw)) throw new Error("GitHub 列表格式错误");
  return raw
    .filter((item) => {
      const flags = z
        .object({ draft: z.boolean(), prerelease: z.boolean() })
        .parse(item);
      if (flags.draft || flags.prerelease) return false;
      const r = metadataSchema.parse(item);
      return !testChannel.test(`${r.tag_name} ${r.name ?? ""}`);
    })
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0];
}

export function parseRelease(raw, source, previous, now) {
  const release = metadataSchema.parse(raw);
  if (!selectStableRelease([release])) throw new Error("没有正式版");
  const base = `https://github.com/${source.repo}/releases`;
  if (
    release.html_url !== `${base}/tag/${encodeURIComponent(release.tag_name)}`
  )
    throw new Error("发布来源不匹配");
  const version = release.tag_name
    .replace(/^v/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = new RegExp(
    source.platforms[previous.platform].source.replace("{version}", version),
  );
  const downloads = [];
  for (const asset of z.array(assetSchema).parse(raw.assets)) {
    if (testChannel.test(asset.name)) continue;
    const match = rule.exec(asset.name);
    if (!match) continue;
    const expected = `${base}/download/${encodeURIComponent(release.tag_name)}/${encodeURIComponent(asset.name)}`;
    if (asset.browser_download_url !== expected)
      throw new Error("安装包来源或版本不匹配");
    downloads.push({
      id: asset.name,
      kind: "direct",
      url: asset.browser_download_url,
      arch: match[1],
      format: match[2],
    });
  }
  if (!downloads.length) throw new Error("没有可确认的平台安装包");
  if (new Set(downloads.map((d) => d.id)).size !== downloads.length)
    throw new Error("安装包标识重复");
  return releaseSchema.parse({
    ...previous,
    version: release.tag_name,
    publishedAt: release.published_at,
    lastCheckedAt: now,
    maintenance: "automatic",
    source: { label: "GitHub Release", url: release.html_url },
    fallback: { kind: "page", url: base },
    downloads,
  });
}

async function inspectDownloads(row, checkLink) {
  const downloads = [];
  let temporary = false;
  let missing = false;
  for (const download of row.downloads) {
    if (download.kind !== "direct") {
      downloads.push(download);
      continue;
    }
    let status;
    try {
      status = await checkLink(download.url);
    } catch {
      status = "temporary";
    }
    if (status === "missing") missing = true;
    else {
      downloads.push(download);
      if (status !== "valid") temporary = true;
    }
  }
  if (missing && !downloads.some((d) => d.url === row.fallback.url))
    downloads.push({ id: "fallback", ...row.fallback });
  return {
    row: missing ? releaseSchema.parse({ ...row, downloads }) : row,
    temporary,
  };
}

export async function syncReleases(
  previous,
  sources,
  {
    loadRelease,
    checkLink,
    parse = parseRelease,
    now = new Date().toISOString(),
  },
) {
  z.array(releaseSchema).parse(previous);
  const rows = structuredClone(previous);
  const errors = [];
  for (const source of sources) {
    let raw;
    let failure;
    try {
      raw = await loadRelease(source);
    } catch (error) {
      failure = error;
    }
    for (let i = 0; i < rows.length; i++) {
      const old = previous[i];
      if (
        old.appId !== source.appId ||
        !Object.hasOwn(source.platforms, old.platform)
      )
        continue;
      try {
        if (failure) throw failure;
        if (!raw) throw new Error("没有正式版");
        const candidate = parse(raw, source, old, now);
        const inspected = await inspectDownloads(candidate, checkLink);
        if (inspected.temporary) throw new Error("安装包临时访问失败");
        rows[i] = inspected.row;
      } catch (error) {
        // 失败不推进版本或成功时间；旧直链只有独立确认失效才移除。
        rows[i] = (await inspectDownloads(old, checkLink)).row;
        errors.push({
          appId: old.appId,
          platform: old.platform,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  z.array(releaseSchema).parse(rows);
  return { rows, errors };
}

export function githubClient({
  fetcher = fetch,
  token = process.env.GITHUB_TOKEN,
  timeoutMs = 15000,
} = {}) {
  async function api(path) {
    const response = await fetcher(`https://api.github.com/repos/${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
    return response.json();
  }
  async function pages(path) {
    const values = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await api(`${path}?per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error("GitHub 列表格式错误");
      values.push(...batch);
      if (batch.length < 100) return values;
    }
    throw new Error("GitHub 分页超过安全上限，保留旧快照");
  }
  return {
    async loadRelease(source) {
      const release = selectStableRelease(
        await pages(`${source.repo}/releases`),
      );
      if (!release) return undefined;
      return {
        ...release,
        assets: await pages(`${source.repo}/releases/${release.id}/assets`),
      };
    },
    async checkLink(url) {
      // 不携带 API token、不读取包体；连续两次明确 404/410 才视为失效。
      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await fetcher(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (response.ok) return "valid";
        if (![404, 410].includes(response.status)) return "temporary";
      }
      return "missing";
    },
  };
}
