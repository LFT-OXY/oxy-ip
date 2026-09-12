import { ToolCard } from "@/components/toolkit";
import { t } from "@/i18n";
import { ExternalLink } from "lucide-react";
import groups from "./third-party-ip-check.json";

export function ThirdPartyIpCheck() {
  return (
    <ToolCard
      title={t("第三方 IP 交叉核验")}
      className="my-3 min-w-0 break-words"
    >
      <div
        aria-hidden="true"
        className="hidden grid-cols-[7rem_10rem_minmax(0,1fr)_5.5rem] gap-x-4 border-b border-border/60 pb-2 text-xs text-muted-foreground md:grid"
      >
        <span>{t("类别")}</span>
        <span>{t("网站")}</span>
        <span>{t("用途")}</span>
        <span className="text-right">{t("查看提示")}</span>
      </div>
      <ul className="m-0 list-none divide-y divide-border/50 p-0">
        {groups.flatMap((group) =>
          group.sites.map((site) => (
            <li
              key={site.name}
              className="relative grid min-w-0 grid-cols-1 items-start gap-x-4 gap-y-1.5 py-3 text-xs md:grid-cols-[7rem_10rem_minmax(0,1fr)_5.5rem] md:py-2.5"
            >
              <span className="min-w-0 text-muted-foreground">
                {t(group.label)}
              </span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit min-w-0 items-center gap-1.5 rounded-sm text-[13px] text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="min-w-0">{site.name}</span>
                <ExternalLink
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">{t("在新标签页打开")}</span>
              </a>
              <p className="min-w-0 leading-relaxed text-muted-foreground">
                {t(site.purpose)}
              </p>
              <details className="col-span-full min-w-0">
                {/* 桌面预留末列给入口，提示仍在正常文档流中占满下一行。 */}
                <summary
                  aria-label={t("查看 {0} 提示", [site.name])}
                  className="w-fit cursor-pointer rounded-sm py-1 text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:absolute md:top-2.5 md:right-0 md:max-w-22 md:py-0"
                >
                  {t("查看提示")}
                </summary>
                <p className="mt-1.5 min-w-0 border-l-2 border-primary/25 pl-3 leading-relaxed text-muted-foreground md:mt-0">
                  {t(site.hint)}
                </p>
              </details>
            </li>
          )),
        )}
      </ul>
    </ToolCard>
  );
}
