import { useEffect, useState, type ReactNode } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Facts, ToolCard } from "@/components/toolkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { locale, t } from "@/i18n";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Grid2X2,
  Search,
} from "lucide-react";
import { apps, releases } from "./data";
import {
  clearFilters,
  codeLabels,
  filterApps,
  latestPublishedAt,
  platforms,
  priceLabels,
  readFilters,
  releaseFor,
  selectedDownload,
  type ClientApp,
} from "./model";
import "./styles.css";

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="client-select-label">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}
function AppIcon({ app }: { app: ClientApp }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="client-icon client-icon-fallback" aria-hidden="true">
      {app.name.slice(0, 1)}
    </span>
  ) : (
    <img
      className="client-icon"
      src={app.icon}
      alt=""
      width="56"
      height="56"
      onError={() => setFailed(true)}
    />
  );
}
function DateLabel({ value }: { value?: string }) {
  return value ? (
    <time dateTime={value}>
      {new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))}
    </time>
  ) : (
    <span>—</span>
  );
}
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="client-source"
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export default function ClientCatalog() {
  const { appId } = useParams();
  useEffect(() => {
    document.title = appId
      ? `${apps.find((app) => app.id === appId)?.name ?? t("应用不存在")} · ${t("代理客户端")}`
      : t("代理客户端");
  }, [appId]);
  return appId ? <ClientDetail key={appId} appId={appId} /> : <ClientList />;
}
function ClientList() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const matches = filterApps(apps, releases, filters, t);
  const cores = [...new Set(apps.flatMap((app) => app.cores))];
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <section className="client-catalog">
      <aside className="client-sidebar" aria-label={t("平台分类")}>
        <p className="client-sidebar-title">{t("浏览应用")}</p>
        <div className="client-platforms">
          {[
            ["", t("全部应用")],
            ...Object.entries(platforms).map(([id, label]) => [id, t(label)]),
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filters.platform === id}
              onClick={() => update("platform", id)}
            >
              <span>{label}</span>
              <span className="client-count">
                {
                  apps.filter(
                    (app) =>
                      !id || app.platforms.some((platform) => platform === id),
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <p className="client-sidebar-note">
          {t("仅提供官方获取入口，不托管安装包。")}
        </p>
      </aside>
      <div className="client-main">
        <header className="client-list-heading">
          <div>
            <h1>
              <Grid2X2 size={24} aria-hidden="true" />
              {t("代理客户端")}
            </h1>
            <p>{t("按平台查找应用，前往官方渠道获取。")}</p>
          </div>
        </header>
        <label className="client-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{t("搜索应用")}</span>
          <Input
            type="search"
            value={filters.q}
            onChange={(event) => update("q", event.target.value)}
            placeholder={t("搜索名称、别名或简介")}
          />
        </label>
        <div className="client-filters">
          <SelectField
            label={t("代理内核")}
            value={filters.core}
            onChange={(value) => update("core", value)}
          >
            <option value="">{t("全部内核")}</option>
            {cores.map((core) => (
              <option key={core}>{core}</option>
            ))}
            <option value="unknown">{t("待核实")}</option>
          </SelectField>
          <SelectField
            label={t("代码状态")}
            value={filters.code}
            onChange={(value) => update("code", value)}
          >
            <option value="">{t("全部代码状态")}</option>
            {Object.entries(codeLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {t(label)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t("价格")}
            value={filters.price}
            onChange={(value) => update("price", value)}
          >
            <option value="">{t("全部价格")}</option>
            {Object.entries(priceLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {t(label)}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="client-results-heading">
          <p role="status">{t("{0} 个应用", [matches.length])}</p>
          <SelectField
            label={t("排序")}
            value={filters.sort === "updated" ? "updated" : ""}
            onChange={(value) => update("sort", value)}
          >
            <option value="">{t("默认顺序")}</option>
            <option value="updated">{t("最近更新")}</option>
          </SelectField>
          <Button
            variant="ghost"
            onClick={() => setParams(clearFilters(params), { replace: true })}
          >
            {t("清除筛选")}
          </Button>
        </div>
        {matches.length ? (
          <div className="client-grid">
            {matches.map((app) => (
              <Link
                key={app.id}
                className="client-card"
                to={{
                  pathname: `/clients/${app.id}`,
                  search: params.toString(),
                }}
              >
                <div className="client-card-heading">
                  <AppIcon app={app} />
                  <div>
                    <h2>{app.name}</h2>
                    {app.aliases.length > 0 && (
                      <p className="client-alias">
                        {app.aliases.map((alias) => t(alias)).join(" / ")}
                      </p>
                    )}
                  </div>
                </div>
                <p className="client-description">{t(app.description)}</p>
                <div className="client-badges">
                  {app.cores.map((core) => (
                    <span key={core}>{core}</span>
                  ))}
                  <span>{t(codeLabels[app.code])}</span>
                  <span>{t(priceLabels[app.price])}</span>
                </div>
                <p className="client-platform-summary">
                  {app.platforms
                    .map((platform) => t(platforms[platform]))
                    .join(" · ")}
                </p>
                <div className="client-card-footer">
                  <span>
                    <DateLabel
                      value={latestPublishedAt(
                        releases,
                        app.id,
                        filters.platform,
                      )}
                    />
                  </span>
                  <span>
                    {t("查看详情")}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="client-empty">
            <p>{t("没有匹配的应用")}</p>
            <Button
              variant="outline"
              onClick={() => setParams(clearFilters(params), { replace: true })}
            >
              {t("清除筛选")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
function ClientDetail({ appId }: { appId: string }) {
  const { search } = useLocation();
  const [params, setParams] = useSearchParams();
  const app = apps.find((item) => item.id === appId);
  const [downloadId, setDownloadId] = useState("");
  const returnParams = new URLSearchParams(search);
  returnParams.delete("target");
  const back = { pathname: "/clients/", search: returnParams.toString() };
  if (!app)
    return (
      <section className="client-detail">
        <h1>{t("应用不存在")}</h1>
        <Button asChild variant="outline">
          <Link to={back}>{t("返回应用列表")}</Link>
        </Button>
      </section>
    );
  const requested = params.get("target") ?? params.get("platform");
  const platform =
    app.platforms.find((value) => value === requested) ?? app.platforms[0];
  const release = releaseFor(releases, app.id, platform);
  const download = selectedDownload(release, downloadId);
  const entryLabel =
    download?.kind === "direct"
      ? t("下载官方安装包")
      : download?.kind === "store"
        ? t("前往官方应用商店")
        : t("前往官方下载页");
  return (
    <article className="client-detail">
      <nav className="client-breadcrumb" aria-label={t("面包屑")}>
        <Link to={back}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t("返回应用列表")}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{app.name}</span>
      </nav>
      <ToolCard
        title={
          <div className="client-detail-heading">
            <AppIcon app={app} />
            <div>
              <h1>{app.name}</h1>
              {app.aliases.length > 0 && (
                <p className="client-alias">
                  {app.aliases.map((alias) => t(alias)).join(" / ")}
                </p>
              )}
            </div>
          </div>
        }
        className="client-detail-card"
      >
        <p className="client-detail-description">{t(app.description)}</p>
        <div className="client-downloads">
          <SelectField
            label={t("下载平台")}
            value={platform}
            onChange={(value) => {
              const next = new URLSearchParams(params);
              next.set("target", value);
              setParams(next, { replace: true });
              setDownloadId("");
            }}
          >
            {app.platforms.map((value) => (
              <option key={value} value={value}>
                {t(platforms[value])}
              </option>
            ))}
          </SelectField>
          {download &&
            release &&
            (download.kind === "direct" || release.downloads.length > 1) && (
              <SelectField
                label={t("安装包类型")}
                value={download.id}
                onChange={setDownloadId}
              >
                {release.downloads.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.kind === "direct"
                      ? `${t(platforms[platform])} · ${item.arch} · ${item.format}${release.downloads.some((other) => other.id !== item.id && other.kind === "direct" && other.arch === item.arch && other.format === item.format) ? ` · ${item.id}` : ""}`
                      : item.kind === "store"
                        ? t("官方应用商店")
                        : t("官方下载页")}
                  </option>
                ))}
              </SelectField>
            )}
          {download && (
            <Button asChild>
              <a href={download.url} target="_blank" rel="noopener noreferrer">
                <Download size={16} aria-hidden="true" />
                {entryLabel}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
        {release?.note && (
          <p className="client-download-note">{t(release.note)}</p>
        )}
        <Facts
          rows={[
            [
              t("适用平台"),
              app.platforms.map((value) => t(platforms[value])).join(" · "),
            ],
            [t("代码状态"), t(codeLabels[app.code])],
            [t("完整功能费用"), t(app.priceDetails)],
            [t("代理内核"), app.cores.join(" / ") || "—"],
            [t("主导开发"), app.developers.join(" / ") || "—"],
          ]}
        />
        <div className="client-release-row">
          <div>
            <span>{t("版本号")}</span>
            <strong>{release?.version ?? "—"}</strong>
          </div>
          <div>
            <span>{t("最后更新时间")}</span>
            <DateLabel value={release?.publishedAt} />
          </div>
          <div>
            <span>{t("数据来源")}</span>
            {release && (
              <ExternalLink href={release.source.url}>
                {t(release.source.label)}
              </ExternalLink>
            )}
            <small>
              {release?.maintenance === "automatic"
                ? t("自动更新")
                : t("人工维护")}
            </small>
            <small>
              {t("最后成功核验时间")}：
              <DateLabel value={release?.lastCheckedAt} />
            </small>
          </div>
        </div>
      </ToolCard>
    </article>
  );
}
