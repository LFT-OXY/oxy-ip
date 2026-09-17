import {
  useEffect,
  useId,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Facts, ToolCard } from "@/components/toolkit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
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
  paginateApps,
  pageParams,
  updateFilter,
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
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  const id = useId();
  const selected = options.find(([key]) => key === value)?.[1];
  return (
    <div className="client-select-field">
      <Label htmlFor={id} className="shrink-0 text-xs text-muted-foreground">
        {label}
      </Label>
      <Select
        value={value || "__all"}
        onValueChange={(next) => onChange(next === "__all" ? "" : next)}
      >
        <SelectTrigger
          id={id}
          className="w-full min-w-0 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate"
          title={selected}
        >
          <SelectValue>{selected ?? t("无匹配选项")}</SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="max-w-[calc(100vw-2rem)]"
        >
          <SelectGroup>
            {options.map(([key, text]) => (
              <SelectItem
                key={key}
                value={key || "__all"}
                className="whitespace-normal wrap-anywhere"
              >
                {text}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
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
      ? `${t(apps.find((app) => app.id === appId)?.name ?? "应用不存在")} · ${t("代理客户端")}`
      : t("代理客户端");
  }, [appId]);
  return appId ? <ClientDetail key={appId} appId={appId} /> : <ClientList />;
}
function ClientList() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const matches = filterApps(apps, releases, filters, t);
  const pagination = paginateApps(matches, params.get("page"));
  const canonicalParams = pageParams(params, pagination.page);
  const canonicalSearch = canonicalParams.toString();
  useEffect(() => {
    if (params.toString() !== canonicalSearch) {
      setParams(canonicalSearch, { replace: true });
    }
  }, [params, canonicalSearch, setParams]);
  const cores = [...new Set(apps.flatMap((app) => app.cores))];
  function update(key: keyof typeof filters, value: string) {
    setParams(updateFilter(params, key, value), { replace: true });
  }
  function pageLink(page: number, disabled = false) {
    const next = pageParams(params, page);
    return {
      href: disabled ? undefined : `?${next.toString()}`,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : undefined,
      className: disabled ? "pointer-events-none opacity-50" : undefined,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        if (disabled) event.preventDefault();
        else if (
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          setParams(next);
        }
      },
    };
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
            <Button
              key={id}
              variant={filters.platform === id ? "default" : "ghost"}
              className="h-auto min-h-9 justify-between gap-2 whitespace-normal text-left text-xs"
              type="button"
              aria-pressed={filters.platform === id}
              onClick={() => update("platform", id)}
            >
              <span>{label}</span>
              <Badge variant="secondary">
                {
                  apps.filter(
                    (app) =>
                      !id || app.platforms.some((platform) => platform === id),
                  ).length
                }
              </Badge>
            </Button>
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
        <div className="client-search">
          <Search size={18} aria-hidden="true" />
          <Label htmlFor="client-search" className="sr-only">
            {t("搜索应用")}
          </Label>
          <Input
            id="client-search"
            type="search"
            value={filters.q}
            onChange={(event) => update("q", event.target.value)}
            placeholder={t("搜索名称、别名或简介")}
          />
        </div>
        <div className="client-filters">
          <SelectField
            label={t("代理内核")}
            value={filters.core}
            onChange={(value) => update("core", value)}
            options={[
              ["", t("全部内核")],
              ...cores.map((core): [string, string] => [core, core]),
              ["unknown", t("待核实")],
            ]}
          />
          <SelectField
            label={t("代码状态")}
            value={filters.code}
            onChange={(value) => update("code", value)}
            options={[
              ["", t("全部代码状态")],
              ...Object.entries(codeLabels).map(
                ([id, label]): [string, string] => [id, t(label)],
              ),
            ]}
          />
          <SelectField
            label={t("价格")}
            value={filters.price}
            onChange={(value) => update("price", value)}
            options={[
              ["", t("全部价格")],
              ...Object.entries(priceLabels).map(
                ([id, label]): [string, string] => [id, t(label)],
              ),
            ]}
          />
        </div>
        <div className="client-results-heading">
          <p role="status">
            {t("{0} 个应用", [pagination.total])}
            {pagination.total > 0 && (
              <span className="ml-2 text-muted-foreground">
                {t("显示 {0}–{1} 项", [pagination.start, pagination.end])}
              </span>
            )}
          </p>
          <SelectField
            label={t("排序")}
            value={filters.sort === "updated" ? "updated" : ""}
            onChange={(value) => update("sort", value)}
            options={[
              ["", t("默认顺序")],
              ["updated", t("最近更新")],
            ]}
          />
          <Button
            variant="ghost"
            onClick={() => setParams(clearFilters(params), { replace: true })}
          >
            {t("清除筛选")}
          </Button>
        </div>
        {matches.length ? (
          <div className="client-grid">
            {pagination.items.map((app) => (
              <Link
                key={app.id}
                className="client-card-link min-w-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                to={{
                  pathname: `/clients/${app.id}`,
                  search: canonicalSearch,
                }}
              >
                <Card className="client-card h-full gap-0 px-4">
                  <div className="client-card-heading">
                    <AppIcon app={app} />
                    <div>
                      <h2>{t(app.name)}</h2>
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
                      <Badge variant="secondary" key={core}>
                        {core}
                      </Badge>
                    ))}
                    <Badge variant="outline">{t(codeLabels[app.code])}</Badge>
                    <Badge variant="outline">{t(priceLabels[app.price])}</Badge>
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
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="client-empty items-center">
            <p>{t("没有匹配的应用")}</p>
            <Button
              variant="outline"
              onClick={() => setParams(clearFilters(params), { replace: true })}
            >
              {t("清除筛选")}
            </Button>
          </Card>
        )}
        {pagination.pageCount > 1 && (
          <Pagination className="mt-6" aria-label={t("应用列表分页")}>
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious
                  {...pageLink(pagination.page - 1, pagination.page === 1)}
                />
              </PaginationItem>
              {Array.from(
                { length: pagination.pageCount },
                (_, index) => index + 1,
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    {...pageLink(page)}
                    isActive={page === pagination.page}
                    aria-label={t("第 {0} 页", [page])}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  {...pageLink(
                    pagination.page + 1,
                    pagination.page === pagination.pageCount,
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Link to={back}>
                <ArrowLeft size={16} aria-hidden="true" />
                {t("返回应用列表")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t(app.name)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ToolCard
        title={
          <div className="client-detail-heading">
            <AppIcon app={app} />
            <div>
              <h1>{t(app.name)}</h1>
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
            options={app.platforms.map((value) => [value, t(platforms[value])])}
          />
          {download &&
            release &&
            (download.kind === "direct" || release.downloads.length > 1) && (
              <SelectField
                label={t("安装包类型")}
                value={download.id}
                onChange={setDownloadId}
                options={release.downloads.map((item) => [
                  item.id,
                  item.kind === "direct"
                    ? `${t(platforms[platform])} · ${item.arch} · ${item.format}${release.downloads.some((other) => other.id !== item.id && other.kind === "direct" && other.arch === item.arch && other.format === item.format) ? ` · ${item.id}` : ""}`
                    : item.kind === "store"
                      ? t("官方应用商店")
                      : t("官方下载页"),
                ])}
              />
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
          <Alert role="note" className="mb-5">
            <AlertDescription>{t(release.note)}</AlertDescription>
          </Alert>
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
