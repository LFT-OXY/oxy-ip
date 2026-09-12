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
      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.label} className="min-w-0">
            <h3 className="mb-2 text-sm font-semibold">{t(group.label)}</h3>
            <ul className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
              {group.sites.map((site) => (
                <li
                  key={site.name}
                  className="min-w-0 rounded-lg border border-border bg-muted/30 p-3 text-sm"
                >
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0">{site.name}</span>
                    <ExternalLink
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{t("在新标签页打开")}</span>
                  </a>
                  <p className="mt-2 text-muted-foreground">
                    {t(site.purpose)}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer rounded-sm py-1 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      {t("查看 {0} 提示", [site.name])}
                    </summary>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {t(site.hint)}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ToolCard>
  );
}
