import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readDirectory = () =>
  JSON.parse(
    readFileSync("src/views/components/third-party-ip-check.json", "utf8"),
  );

// 期望来自 PRD，不从目录数据生成，避免测试自证。
test("第三方目录保留九站固定网址、分组和中文用途", () => {
  const groups = readDirectory();
  assert.deepEqual(
    groups.map(({ label, sites }) => [
      label,
      sites.map(({ name, url, purpose }) => [name, url, purpose]),
    ]),
    [
      [
        "综合查询",
        [
          ["CleanIP", "https://cleanip.io/", "前往 CleanIP 进行 IP 检测。"],
          [
            "IPSuper",
            "https://ipsuper.com/",
            "聚合查看 IP 风险、代理、ASN 与定位信息。",
          ],
          [
            "MeowVPS",
            "https://meowvps.com/tools/ip-check/",
            "查看多源 IP 质量与风险信息。",
          ],
        ],
      ],
      [
        "归属与用途",
        [
          [
            "IP2Location",
            "https://www.ip2location.com/demo",
            "查看 Region、Usage Type、AS Usage Type 与 ASN。",
          ],
          [
            "IPLark",
            "https://iplark.com/",
            "查看 IP 归属、ASN、使用场景与代理线索。",
          ],
        ],
      ],
      [
        "滥用与信誉",
        [
          [
            "IPQS",
            "https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test",
            "查看近期滥用、代理/VPN/Tor 与欺诈风险信号。",
          ],
          [
            "ipdata",
            "https://ipdata.co/",
            "查看 Threats 中的滥用、Tor 和代理标记。",
          ],
          [
            "Scamalytics",
            "https://scamalytics.com/",
            "查看欺诈风险评分与黑名单线索。",
          ],
        ],
      ],
      [
        "流量趋势",
        [
          [
            "Cloudflare Radar",
            "https://radar.cloudflare.com/",
            "查看机器人与人类流量趋势，作为辅助参考。",
          ],
        ],
      ],
    ],
  );
});

// 逐站核对具体限定及否定含义，通用免责声明不能替代这些提示。
const hintContracts = {
  CleanIP: {
    zh: [/交叉参考/, /暂时不可访问.*稍后自行重试/, /不把外部故障.*IP 不安全/],
    en: [
      /cross-reference/i,
      /temporarily unavailable.*retry.*later/i,
      /does not mean.*IP is unsafe/i,
    ],
  },
  IPSuper: {
    zh: [
      /对照多个数据源/,
      /数据库覆盖.*更新时间不同/,
      /结果可能不一致/,
      /不能只凭总分定性/,
    ],
    en: [
      /compare multiple.*sources/i,
      /coverage.*update.*differ/i,
      /results may disagree/i,
      /not.*overall score alone/i,
    ],
  },
  MeowVPS: {
    zh: [/工具内选择或输入.*地址/, /本站不自动预填 IP/, /不承诺.*数据一定完整/],
    en: [
      /select or enter.*address.*tool/i,
      /does not.*prefill.*IP/i,
      /does not guarantee.*data is complete/i,
    ],
  },
  IP2Location: {
    zh: [
      /Region.*地区或州/,
      /Usage Type.*ISP\/company 类型/,
      /AS Usage Type.*AS 注册主体类型/,
      /ASN.*自治系统编号/,
      /不单独证明.*住宅或机房/,
    ],
    en: [
      /Region.*region or state/i,
      /Usage Type.*ISP\/company type/i,
      /AS Usage Type.*AS registrant/i,
      /ASN.*autonomous system number/i,
      /do not.*prove.*residential or datacenter/i,
    ],
  },
  IPLark: {
    zh: [
      /比较不同数据源.*地理位置和使用类型/,
      /未识别代理不等于绝对无代理/,
      /扩展信息可能受.*服务限制/,
    ],
    en: [
      /compare.*geolocation and usage types.*sources/i,
      /no proxy detected does not mean.*proxy-free/i,
      /extended information may be limited.*service/i,
    ],
  },
  IPQS: {
    zh: [
      /关注滥用.*风险信息/,
      /不把低分或未命中滥用视为安全保证/,
      /公开查询页/,
      /不额外增加账号登录入口/,
    ],
    en: [
      /focus on abuse.*risk/i,
      /low score.*no abuse.*not.*guarantee.*safety/i,
      /public lookup page/i,
      /no additional.*login/i,
    ],
  },
  ipdata: {
    zh: [
      /abuse、tor、proxy/,
      /Threats 为 0 仅表示当前未命中.*威胁标记/,
      /不保证安全、住宅属性或目标网站可用性/,
    ],
    en: [
      /abuse, tor.*proxy/i,
      /Threats.*0 only means.*no.*threat flags.*currently/i,
      /does not guarantee safety, residential status or.*website availability/i,
    ],
  },
  Scamalytics: {
    zh: [
      /欺诈分.*垃圾邮件、abuse.*黑名单/,
      /高分需要警惕/,
      /低分不保证安全/,
      /可见 Web 流量.*风险意见/,
      /不是专门的垃圾邮件评分/,
    ],
    en: [
      /fraud score.*spam.*abuse.*blacklist/i,
      /high score.*caution/i,
      /low score does not guarantee safety/i,
      /risk opinion.*Web traffic.*observe/i,
      /not.*dedicated spam score/i,
    ],
  },
  "Cloudflare Radar": {
    zh: [
      /全球、地区或 ASN.*请求聚合统计/,
      /不能直接推断单个 IP 的家宽概率/,
      /不用于判断是否会触发 Cloudflare 验证/,
      /机器人流量本身不等同于恶意流量/,
    ],
    en: [
      /aggregated request statistics.*global, regional or ASN/i,
      /cannot.*probability.*individual IP.*residential/i,
      /not.*predict.*Cloudflare challenge/i,
      /bot traffic.*not inherently malicious/i,
    ],
  },
};

test("中文提示保留各站的具体解释边界", () => {
  for (const site of readDirectory().flatMap((group) => group.sites)) {
    for (const pattern of hintContracts[site.name].zh) {
      assert.match(site.hint, pattern, `${site.name}: ${pattern}`);
    }
  }
});

test("英文运行时覆盖全部目录文案并保留各站限定", async () => {
  const en = JSON.parse(readFileSync("src/i18n/en.json", "utf8"));
  const groups = readDirectory();
  globalThis.window = {
    location: { href: "https://example.test/network/ip?lang=en" },
  };
  try {
    const runtime =
      await import("../src/i18n/index.ts?third-party-english-test");
    assert.equal(runtime.locale, "en");
    const keys = [
      "第三方 IP 交叉核验",
      "查看 {0} 提示",
      "在新标签页打开",
      ...groups.flatMap((group) => [
        group.label,
        ...group.sites.flatMap((site) => [site.purpose, site.hint]),
      ]),
    ];
    for (const key of keys) {
      assert.ok(Object.hasOwn(en, key), `Missing English entry: ${key}`);
      assert.equal(typeof en[key], "string", key);
      assert.ok(en[key].trim(), key);
      assert.doesNotMatch(en[key], /\p{Script=Han}/u, key);
      assert.deepEqual(
        en[key].match(/\{\d+\}/g) ?? [],
        key.match(/\{\d+\}/g) ?? [],
        key,
      );
      assert.equal(runtime.t(key), en[key], key);
    }
    assert.equal(
      runtime.t("查看 {0} 提示", ["CleanIP"]),
      "View CleanIP guidance",
    );
    assert.equal(runtime.t("在新标签页打开"), "Opens in a new tab");
    for (const site of groups.flatMap((group) => group.sites)) {
      for (const pattern of hintContracts[site.name].en) {
        assert.match(runtime.t(site.hint), pattern, `${site.name}: ${pattern}`);
      }
    }
  } finally {
    delete globalThis.window;
  }
});
