import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const ProducerMapLeaflet = lazy(() => import("@/components/producer-map"));
import producerFarmImg from "@/assets/producer-farm.jpg";
import producerVendorImg from "@/assets/producer-vendor.jpg";
import producerGrantImg from "@/assets/producer-grant.jpg";
import eventFarmImg from "@/assets/event-farm-tour.jpg";
import eventTastingImg from "@/assets/event-tasting.jpg";
import eventSeminarImg from "@/assets/event-seminar.jpg";
import {
  Vote,
  Award,
  FileText,
  MapPin,
  CalendarDays,
  Download,
  Sparkles,
  Leaf,
  Recycle,
  GraduationCap,
  X,
} from "lucide-react";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "社務大廳 Governance Hall — 十圓方里" },
      {
        name: "description",
        content:
          "民主投票牆、公開會議紀錄、在地小農地圖與社員工作坊。Democratic voting wall, transparent meeting archive, local producer map, and member workshops.",
      },
      { property: "og:title", content: "Governance Hall — Ten Sq Miles" },
      { property: "og:description", content: "One member, one vote. Transparent boardroom." },
    ],
  }),
  component: GovernancePage,
});

type Poll = {
  id: string;
  title: { zh: string; en: string };
  desc: { zh: string; en: string };
  options: { id: string; label: { zh: string; en: string }; votes: number }[];
  closesInDays: number;
  multi?: boolean;
};

const POLLS: Poll[] = [
  {
    id: "p1",
    title: { zh: "選出下個月的健康餐盒主菜", en: "Select Next Month's Bento Recipe" },
    desc: { zh: "由 3 位合作廚師提案，得票最高將於下月上架。", en: "Three chef proposals — top vote launches next month." },
    closesInDays: 4,
    options: [
      { id: "a", label: { zh: "紅藜藜麥雞肉盒", en: "Quinoa & Herb Chicken" }, votes: 138 },
      { id: "b", label: { zh: "味噌鯖魚糙米盒", en: "Miso Mackerel Brown Rice" }, votes: 96 },
      { id: "c", label: { zh: "南瓜豆腐咖哩盒", en: "Pumpkin Tofu Curry" }, votes: 74 },
    ],
  },
  {
    id: "p2",
    title: { zh: "年度公益金受助對象", en: "Approve Annual Community Grant Recipient" },
    desc: { zh: "50% 公積金將撥出部分用於學童助學金與小農支持。", en: "Portion of reserve fund allocated to student grants and farmer aid." },
    closesInDays: 11,
    options: [
      { id: "a", label: { zh: "偏鄉學童早餐計畫", en: "Rural Student Breakfast Program" }, votes: 212 },
      { id: "b", label: { zh: "青年返鄉小農基金", en: "Young Returning Farmer Fund" }, votes: 187 },
      { id: "c", label: { zh: "食物銀行網絡", en: "Food Bank Network" }, votes: 133 },
    ],
  },
  {
    id: "p3",
    title: { zh: "章程修正案：擴大線上表決", en: "Charter Amendment: Expand Online Voting" },
    desc: { zh: "是否允許重大議案於線上完成投票？(章程 §12)", en: "Allow major resolutions to be decided fully online (Charter §12)." },
    closesInDays: 20,
    options: [
      { id: "y", label: { zh: "贊成 Agree", en: "Agree" }, votes: 302 },
      { id: "n", label: { zh: "反對 Disagree", en: "Disagree" }, votes: 88 },
    ],
  },
];

function VotingWall() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const [nudge, setNudge] = useState(false);
  const [voted, setVoted] = useState<Record<string, string>>({});
  const isMember = user?.role === "member" || user?.role === "admin";

  return (
    <section id="voting-wall" className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">01 · Voting Wall</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            {locale === "zh" ? "民主提案與投票牆" : "Democratic Town Hall"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "一社員一票 · 即時透明結果" : "One member, one vote · Live transparent results"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {POLLS.map((p) => {
          const total = p.options.reduce((s, o) => s + o.votes, 0);
          const chosen = voted[p.id];
          return (
            <article
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white/70 p-6 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                  <Vote className="size-3" /> 1M · 1V
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {locale === "zh" ? `${p.closesInDays} 天後截止` : `Closes in ${p.closesInDays}d`}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight">{p.title[locale]}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.desc[locale]}</p>

              <ul className="mt-5 space-y-3">
                {p.options.map((o) => {
                  const pct = total ? Math.round((o.votes / total) * 100) : 0;
                  const isChosen = chosen === o.id;
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => {
                          if (!isMember) {
                            setNudge(true);
                            return;
                          }
                          setVoted((v) => ({ ...v, [p.id]: o.id }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                          isChosen
                            ? "border-primary bg-primary/10"
                            : "border-border bg-white/60 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{o.label[locale]}</span>
                          <span className="font-mono text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {o.votes} {locale === "zh" ? "票" : "votes"}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-mono">
                  {locale === "zh" ? "累計投票數" : "Total votes"} · {total}
                </span>
                {chosen && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-primary">
                    {locale === "zh" ? "✓ 已投票" : "✓ Voted"}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {nudge && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setNudge(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setNudge(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-border hover:bg-surface"
            >
              <X className="size-4" />
            </button>
            <div className="mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Vote className="size-6" />
            </div>
            <h3 className="text-lg font-bold">
              {locale === "zh" ? "你的聲音很重要！" : "Your voice matters!"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "zh"
                ? "加入實名認證社員，即可參與 1 人 1 票投票，共同決定合作社走向。"
                : "Join as a verified member to cast your vote and influence our co-op's decisions."}
            </p>
            <a
              href="/onboarding"
              className="mt-5 block rounded-full bg-foreground py-2.5 text-center text-sm font-semibold text-background hover:shadow-elevated"
            >
              {locale === "zh" ? "立即註冊入社" : "Register as member"}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

type Badge = {
  id: string;
  emoji: string;
  name: { zh: string; en: string };
  desc: { zh: string; en: string };
  earned: boolean;
  boost: number; // % dividend multiplier
};

const BADGES: Badge[] = [
  {
    id: "pioneer",
    emoji: "🌱",
    name: { zh: "合作社先鋒", en: "Co-op Pioneer" },
    desc: { zh: "完成入門治理教育", en: "Completed introductory governance education" },
    earned: true,
    boost: 3,
  },
  {
    id: "democracy",
    emoji: "🗳️",
    name: { zh: "民主守護者", en: "Democracy Champion" },
    desc: { zh: "連續參與 3 次投票", en: "Participated in 3 consecutive polls" },
    earned: true,
    boost: 5,
  },
  {
    id: "zerowaste",
    emoji: "♻️",
    name: { zh: "零廢棄倡議者", en: "Zero-Waste Advocate" },
    desc: { zh: "10 次以上選擇極簡包裝", en: "Opted for minimal packaging 10+ times" },
    earned: false,
    boost: 4,
  },
  {
    id: "harvest",
    emoji: "🌾",
    name: { zh: "在地共購夥伴", en: "Local Harvest Partner" },
    desc: { zh: "累積 20 次在地小農預購", en: "20+ pre-orders from local farms" },
    earned: false,
    boost: 6,
  },
];

function BadgeSystem() {
  const { locale } = useI18n();
  const totalBoost = BADGES.filter((b) => b.earned).reduce((s, b) => s + b.boost, 0);
  return (
    <section id="badges" className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">02 · Achievements</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {locale === "zh" ? "社務成就與徽章系統" : "Gamified Badges & Impact"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "zh"
            ? "徽章直接提升你的「年度結餘分紅權重」"
            : "Badges boost your Annual Surplus Dividend Multiplier"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {BADGES.map((b) => (
            <article
              key={b.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                b.earned
                  ? "border-primary/30 bg-white shadow-soft"
                  : "border-dashed border-border bg-white/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-2xl">
                    {b.emoji}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{b.name[locale]}</h4>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{b.desc[locale]}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                    b.earned ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                  }`}
                >
                  {b.earned ? (locale === "zh" ? "已解鎖" : "Unlocked") : locale === "zh" ? "未解鎖" : "Locked"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-surface/70 px-3 py-2 font-mono text-[10px]">
                <span className="uppercase tracking-widest text-muted-foreground">
                  {locale === "zh" ? "分紅權重加成" : "Dividend boost"}
                </span>
                <span className="font-bold text-primary">+{b.boost}%</span>
              </div>
            </article>
          ))}
        </div>

        <aside className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-6 shadow-soft">
          <Sparkles className="absolute right-4 top-4 size-8 text-primary/30" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {locale === "zh" ? "我的成就摘要" : "My Impact"}
          </p>
          <p className="mt-2 font-mono text-5xl font-extrabold text-gradient">+{totalBoost}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh" ? "今年度結餘分紅權重加成" : "Total dividend multiplier this year"}
          </p>
          <div className="mt-5 space-y-2 text-xs">
            <div className="flex items-center gap-2"><Award className="size-3.5 text-primary" /> {BADGES.filter((x) => x.earned).length}/{BADGES.length} {locale === "zh" ? "徽章已解鎖" : "badges unlocked"}</div>
            <div className="flex items-center gap-2"><Leaf className="size-3.5 text-primary" /> {locale === "zh" ? "永續行動 · 12 次" : "Sustainable actions · 12"}</div>
            <div className="flex items-center gap-2"><Vote className="size-3.5 text-primary" /> {locale === "zh" ? "參與投票 · 5 次" : "Votes cast · 5"}</div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type Meeting = {
  id: string;
  type: "agm" | "board";
  date: string;
  title: { zh: string; en: string };
  bullets: { zh: string; en: string }[];
  metric: { label: { zh: string; en: string }; value: string };
};

const MEETINGS: Meeting[] = [
  {
    id: "m1",
    type: "agm",
    date: "2026-06-14",
    title: { zh: "2026 年社員大會", en: "2026 Annual General Meeting" },
    bullets: [
      { zh: "通過 2025 年結餘分配案 (公積金 50%)", en: "Approved 2025 surplus allocation (Reserve 50%)" },
      { zh: "改選第 3 屆理監事共 7 席", en: "Elected 7 board & supervisory seats" },
      { zh: "章程 §12 線上表決修正案付委", en: "Charter §12 online-voting amendment referred" },
    ],
    metric: { label: { zh: "出席率", en: "Attendance" }, value: "87%" },
  },
  {
    id: "m2",
    type: "board",
    date: "2026-04-22",
    title: { zh: "第 3 屆第 2 次社務會議", en: "3rd Board · 2nd Session" },
    bullets: [
      { zh: "核定新增 6 位在地小農合作夥伴", en: "Approved 6 new local farmer partners" },
      { zh: "非社員銷售比 22% 低於上限", en: "Non-member sales at 22%, under 30% cap" },
      { zh: "通過本年度學童助學金 NT$180,000", en: "Approved NT$180,000 student grants this year" },
    ],
    metric: { label: { zh: "決議案", en: "Resolutions" }, value: "8" },
  },
  {
    id: "m3",
    type: "board",
    date: "2026-02-10",
    title: { zh: "第 3 屆第 1 次社務會議", en: "3rd Board · 1st Session" },
    bullets: [
      { zh: "年度預算 NT$18M 通過", en: "Annual budget NT$18M approved" },
      { zh: "啟動 AI 需求預測模組", en: "Launched AI demand forecasting module" },
      { zh: "公積金投資利率調整為 1.8%", en: "Reserve fund yield adjusted to 1.8%" },
    ],
    metric: { label: { zh: "決議案", en: "Resolutions" }, value: "12" },
  },
];

function MeetingHub() {
  const { locale } = useI18n();
  return (
    <section id="meetings" className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">03 · Transparent Boardroom</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {locale === "zh" ? "公開會議紀錄與透明決策" : "Transparent Boardroom & Meeting Hub"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "所有會議摘要與會議紀錄開放下載" : "Every summary and minute file open to the public"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MEETINGS.map((m) => (
          <article
            key={m.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white/70 p-6 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
                  m.type === "agm"
                    ? "border border-accent/40 bg-accent/10 text-accent"
                    : "border border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                <CalendarDays className="size-3" />
                {m.type === "agm"
                  ? locale === "zh" ? "社員大會" : "AGM"
                  : locale === "zh" ? "社務會議" : "Board"}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{m.date}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">{m.title[locale]}</h3>
            <ul className="mt-4 space-y-2 text-xs">
              {m.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{b[locale]}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-surface/70 px-3 py-2 font-mono text-[10px]">
              <span className="uppercase tracking-widest text-muted-foreground">{m.metric.label[locale]}</span>
              <span className="text-base font-bold text-foreground">{m.metric.value}</span>
            </div>
            <button
              onClick={() => alert(locale === "zh" ? "下載會議紀錄 PDF (示範)" : "Download minutes PDF (demo)")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white/60 py-2 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5"
            >
              <Download className="size-3.5" />
              {locale === "zh" ? "下載會議紀錄 PDF" : "Download minutes PDF"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

type Producer = {
  id: string;
  name: { zh: string; en: string };
  region: { zh: string; en: string };
  category: "farm" | "vendor" | "grant";
  since: string;
  impact: { zh: string; en: string };
  co2: string;
  support: string;
  blurb: { zh: string; en: string };
  img: string;
  lat: number;
  lng: number;
};

const PRODUCERS: Producer[] = [
  { id: "n1", name: { zh: "阿里山高山雞農場", en: "Alishan Highland Chicken Farm" }, region: { zh: "嘉義 阿里山", en: "Chiayi · Alishan" }, category: "farm", since: "2022", impact: { zh: "月供 3,200 顆放牧蛋", en: "3,200 pasture eggs / month" }, co2: "-1.8t CO₂/yr", support: "NT$ 480K", blurb: { zh: "海拔 1,400m 放牧養雞，飼料無抗生素，社員月月直送。", en: "1,400m free-range flock, antibiotic-free feed, monthly member delivery." }, img: producerFarmImg, lat: 23.5083, lng: 120.8025 },
  { id: "n2", name: { zh: "花蓮青農米作坊", en: "Hualien Young Farmer Rice" }, region: { zh: "花蓮 玉里", en: "Hualien · Yuli" }, category: "farm", since: "2023", impact: { zh: "有機米 1.2 噸／季", en: "1.2t organic rice / season" }, co2: "-3.2t CO₂/yr", support: "NT$ 720K", blurb: { zh: "青農返鄉三年，玉里花東縱谷全稻田通過有機認證。", en: "Third-year returnee farmer, fully organic paddies in the Yuli valley." }, img: producerFarmImg, lat: 23.3352, lng: 121.3097 },
  { id: "n3", name: { zh: "西螺柴燒醬園", en: "Xiluo Wood-Fired Soy" }, region: { zh: "雲林 西螺", en: "Yunlin · Xiluo" }, category: "vendor", since: "2021", impact: { zh: "傳統工法 · 零添加", en: "Traditional · zero-additive" }, co2: "-0.8t CO₂/yr", support: "NT$ 260K", blurb: { zh: "180 天日曬柴燒黑豆醬油，非基改，無防腐劑。", en: "180-day sun-fermented black bean soy, non-GMO, no preservatives." }, img: producerVendorImg, lat: 23.7970, lng: 120.4650 },
  { id: "n4", name: { zh: "南投小農蔬菜聯盟", en: "Nantou Small-Farm Veggie Union" }, region: { zh: "南投 埔里", en: "Nantou · Puli" }, category: "farm", since: "2022", impact: { zh: "12 家農戶 · 週配", en: "12 farms · weekly" }, co2: "-2.1t CO₂/yr", support: "NT$ 540K", blurb: { zh: "埔里 12 家小農聯盟，每週配送當季葉菜到取貨點。", en: "12-farm Puli alliance, weekly seasonal greens to pickup points." }, img: producerFarmImg, lat: 23.9650, lng: 120.9670 },
  { id: "n5", name: { zh: "東港鮮魚共漁隊", en: "Donggang Fresh Fish Co-op" }, region: { zh: "屏東 東港", en: "Pingtung · Donggang" }, category: "vendor", since: "2024", impact: { zh: "當日直送冷鏈", en: "Same-day cold chain" }, co2: "-1.4t CO₂/yr", support: "NT$ 380K", blurb: { zh: "港邊直送 8 小時內到門，公平船價、拒絕過捕。", en: "8-hour dock-to-door, fair boat pricing, no overfishing." }, img: producerVendorImg, lat: 22.4667, lng: 120.4500 },
  { id: "n6", name: { zh: "偏鄉學童早餐計畫", en: "Rural Student Breakfast" }, region: { zh: "台東 卑南", en: "Taitung · Beinan" }, category: "grant", since: "2023", impact: { zh: "受助 128 名學童", en: "128 students supported" }, co2: "", support: "NT$ 320K", blurb: { zh: "每週 5 天為卑南國小 128 名學童供應合作社早餐。", en: "5 mornings/week co-op breakfast for 128 Beinan Elementary students." }, img: producerGrantImg, lat: 22.7838, lng: 121.0870 },
  { id: "n7", name: { zh: "青年返鄉學農計畫", en: "Youth Farming Fellowship" }, region: { zh: "宜蘭 三星", en: "Yilan · Sanxing" }, category: "grant", since: "2024", impact: { zh: "6 位青農入駐", en: "6 young farmers onboard" }, co2: "", support: "NT$ 450K", blurb: { zh: "6 位 30 歲以下青農入駐三星蔥田，兩年培育計畫。", en: "6 sub-30 fellows join Sanxing scallion fields for a 2-year program." }, img: producerGrantImg, lat: 24.6702, lng: 121.6600 },
];

function ProducerMap() {
  const { locale } = useI18n();
  const [active, setActive] = useState<string>("n1");
  const activeP = PRODUCERS.find((p) => p.id === active) ?? PRODUCERS[0];

  const color = (c: Producer["category"]) =>
    c === "farm" ? "bg-primary" : c === "vendor" ? "bg-accent" : "bg-fuchsia-500";

  const mapProducers = useMemo(
    () => PRODUCERS.map((p) => ({ id: p.id, name: p.name[locale], region: p.region[locale], category: p.category, lat: p.lat, lng: p.lng })),
    [locale],
  );

  return (
    <section id="producers" className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">04 · Local Producer Map</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {locale === "zh" ? "在地永續小農足跡地圖" : "Interactive Taiwan Producer Map"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "由 50% 公積金／公益金支持的合作網絡" : "Supported by our 50% Reserve & Public Good Fund"}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <ClientOnly
            fallback={
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/5 to-accent/5">
                <p className="font-mono text-xs text-muted-foreground">
                  {locale === "zh" ? "地圖載入中…" : "Loading map…"}
                </p>
              </div>
            }
          >
            <Suspense fallback={<div className="h-full w-full bg-surface" />}>
              <ProducerMapLeaflet producers={mapProducers} activeId={active} onSelect={setActive} />
            </Suspense>
          </ClientOnly>

          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-lg border border-border bg-white/90 p-2 font-mono text-[10px] backdrop-blur">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" />{locale === "zh" ? "農場" : "Farm"}</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-accent" />{locale === "zh" ? "職人" : "Vendor"}</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-fuchsia-500" />{locale === "zh" ? "公益" : "Grant"}</span>
          </div>
          <span className="pointer-events-none absolute right-3 top-3 z-[500] rounded-full border border-border bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur">
            🇹🇼 Taiwan
          </span>
        </div>

        <div className="space-y-4">
          {activeP && (
            <article className="overflow-hidden rounded-2xl border border-border bg-white/80 shadow-soft backdrop-blur">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={activeP.img}
                  alt={activeP.name[locale]}
                  loading="lazy"
                  width={512}
                  height={288}
                  className="size-full object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur">
                  {activeP.category === "grant" ? (locale === "zh" ? "公益計畫" : "Grant") : activeP.category === "vendor" ? (locale === "zh" ? "在地職人" : "Vendor") : (locale === "zh" ? "契作農場" : "Farm")}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <MapPin className={`size-4 ${activeP.category === "grant" ? "text-fuchsia-500" : activeP.category === "vendor" ? "text-accent" : "text-primary"}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {activeP.region[locale]} · Since {activeP.since}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold">{activeP.name[locale]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{activeP.blurb[locale]}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div className="rounded-lg border border-border bg-surface/50 p-2 text-center">
                    <p className="uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "支持" : "Support"}</p>
                    <p className="mt-0.5 text-sm font-bold">{activeP.support}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface/50 p-2 text-center">
                    <p className="uppercase tracking-widest text-muted-foreground">CO₂</p>
                    <p className="mt-0.5 text-sm font-bold">{activeP.co2 || "—"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface/50 p-2 text-center">
                    <p className="uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "產能" : "Impact"}</p>
                    <p className="mt-0.5 text-[10px] font-bold leading-tight">{activeP.impact[locale]}</p>
                  </div>
                </div>
              </div>
            </article>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Recycle, label: locale === "zh" ? "減塑" : "Plastic saved", value: "428kg" },
              { icon: Leaf, label: locale === "zh" ? "支持小農" : "Farmers", value: "34" },
              { icon: GraduationCap, label: locale === "zh" ? "助學金" : "Grants", value: "128" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-white/70 p-3 text-center shadow-soft">
                <s.icon className="mx-auto size-4 text-primary" />
                <p className="mt-2 font-mono text-lg font-extrabold">{s.value}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-1.5">
            {PRODUCERS.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setActive(p.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    active === p.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:border-border hover:bg-white/60"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${color(p.category)}`} />
                    <span className="font-semibold">{p.name[locale]}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.region[locale]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

type Event = {
  id: string;
  title: { zh: string; en: string };
  date: string;
  venue: { zh: string; en: string };
  seats: number;
  taken: number;
  memberPrice: number;
  guestPrice: number;
  tag: { zh: string; en: string };
  img: string;
  status: "open" | "hot" | "soon";
};

const EVENTS: Event[] = [
  {
    id: "e1",
    title: { zh: "阿里山雞農場參訪＋現場品嚐", en: "Alishan Farm Tour + Tasting" },
    date: "2026-08-17",
    venue: { zh: "嘉義 · 阿里山", en: "Chiayi · Alishan" },
    seats: 30,
    taken: 22,
    memberPrice: 0,
    guestPrice: 480,
    tag: { zh: "🚌 農場參訪", en: "🚌 Farm Tour" },
    img: eventFarmImg,
    status: "hot",
  },
  {
    id: "e2",
    title: { zh: "柴燒醬油品飲工作坊", en: "Wood-Fired Soy Tasting Workshop" },
    date: "2026-08-24",
    venue: { zh: "台北 · 大稻埕", en: "Taipei · Dadaocheng" },
    seats: 24,
    taken: 18,
    memberPrice: 0,
    guestPrice: 350,
    tag: { zh: "🍶 品味工作坊", en: "🍶 Tasting" },
    img: eventTastingImg,
    status: "open",
  },
  {
    id: "e3",
    title: { zh: "健康飲食＆餐盒設計講座", en: "Healthy Eating & Bento Design" },
    date: "2026-09-05",
    venue: { zh: "線上 · Zoom", en: "Online · Zoom" },
    seats: 200,
    taken: 87,
    memberPrice: 0,
    guestPrice: 200,
    tag: { zh: "🎓 線上講座", en: "🎓 Seminar" },
    img: eventSeminarImg,
    status: "soon",
  },
];

function EventsBoard() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const isMember = user?.role === "member" || user?.role === "admin";

  const statusBadge = (s: Event["status"]) => {
    if (s === "hot") return { label: locale === "zh" ? "🔥 熱門" : "🔥 Hot", cls: "bg-red-500/95 text-white" };
    if (s === "soon") return { label: locale === "zh" ? "⏳ 即將額滿" : "⏳ Filling", cls: "bg-accent/95 text-white" };
    return { label: locale === "zh" ? "✨ 開放報名" : "✨ Open", cls: "bg-primary/95 text-primary-foreground" };
  };

  return (
    <section id="events" className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">05 · Workshops & Events</p>
        <h2 className="mt-1 whitespace-nowrap text-2xl font-bold tracking-tight md:text-3xl">
          {locale === "zh" ? "社員專屬社務活動" : "Co-op Events & Tasting Workshops"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "實名社員免費入場，非社員可購票體驗" : "Free for verified members · Paid pass for non-members"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {EVENTS.map((e) => {
          const pct = Math.round((e.taken / e.seats) * 100);
          const badge = statusBadge(e.status);
          return (
            <article
              key={e.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white/70 shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={e.img}
                  alt={e.title[locale]}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur">
                  {e.tag[locale]}
                </span>
                <span className={`absolute right-4 top-4 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur ${badge.cls}`}>
                  {badge.label}
                </span>
                {isMember && e.memberPrice === 0 && (
                  <span className="absolute bottom-3 left-4 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground shadow-glow">
                    {locale === "zh" ? "社員免費" : "Free for members"}
                  </span>
                )}
                <span className="absolute bottom-3 right-4 rounded-full bg-foreground/85 px-2.5 py-1 font-mono text-[10px] font-bold text-background backdrop-blur">
                  {e.date}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold leading-tight">{e.title[locale]}</h3>
                <p className="mt-1 text-xs text-muted-foreground">📍 {e.venue[locale]}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{locale === "zh" ? "報名進度" : "Seats booked"}</span>
                    <span>{e.taken}/{e.seats}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-surface/60 p-2 text-center font-mono text-[10px]">
                  <div>
                    <p className="uppercase tracking-widest text-primary">{locale === "zh" ? "社員" : "Member"}</p>
                    <p className="mt-0.5 text-sm font-bold text-primary">
                      {e.memberPrice === 0 ? (locale === "zh" ? "免費" : "Free") : `NT$${e.memberPrice}`}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "非社員" : "Guest"}</p>
                    <p className="mt-0.5 text-sm font-bold">NT${e.guestPrice}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(
                      isMember
                        ? locale === "zh" ? "✅ 已為你保留席次！" : "✅ Seat reserved!"
                        : locale === "zh" ? "已加入預訂，將以來賓票結帳" : "Reserved as guest ticket",
                    )
                  }
                  className={`mt-4 rounded-full py-2 text-xs font-semibold transition-all ${
                    isMember
                      ? "bg-foreground text-background hover:shadow-elevated"
                      : "border border-border bg-white/60 hover:border-primary/40"
                  }`}
                >
                  {isMember
                    ? locale === "zh" ? "免費保留席次" : "Reserve free seat"
                    : locale === "zh" ? "以來賓票預訂" : "Book guest ticket"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function GovernancePage() {
  const { locale } = useI18n();
  const sections = useMemo(
    () => [
      { id: "voting-wall", icon: Vote, label: { zh: "投票牆", en: "Voting Wall" } },
      { id: "badges", icon: Award, label: { zh: "徽章系統", en: "Badges" } },
      { id: "meetings", icon: FileText, label: { zh: "會議紀錄", en: "Meetings" } },
      { id: "producers", icon: MapPin, label: { zh: "小農地圖", en: "Producer Map" } },
      { id: "events", icon: CalendarDays, label: { zh: "社務活動", en: "Events" } },
      { id: "wishes", icon: Sparkles, label: { zh: "社員許願", en: "Member Wishes" } },
    ],
    [],
  );

  return (
    <SiteShell>
      <PageHeader
        eyebrow={locale === "zh" ? "🏛️ 社務大廳 Governance" : "🏛️ Governance Hall"}
        title={locale === "zh" ? "由每一位社員共同決策的合作社" : "A co-op decided by every member"}
        subtitle={locale === "zh" ? "One member · One vote · Full transparency" : "One member · One vote · Full transparency"}
        body={
          locale === "zh"
            ? "投票、會議、在地夥伴、社務活動與成就徽章——所有治理環節公開、可追溯、可參與。"
            : "Votes, meetings, local partners, workshops and achievements — every governance surface is public, traceable, and open."
        }
      />

      <nav className="sticky top-16 z-30 -mx-4 mb-10 border-y border-border bg-background/80 px-4 backdrop-blur-xl">
        <div className="scrollbar-none flex gap-2 overflow-x-auto py-3">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              <s.icon className="size-3.5" />
              {s.label[locale]}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-24">
        <VotingWall />
        <BadgeSystem />
        <MeetingHub />
        <ProducerMap />
        <EventsBoard />
        <MemberWishBoard />
      </div>
    </SiteShell>
  );
}

function MemberWishBoard() {
  const { locale } = useI18n();
  const { user, openLogin } = useAuth();
  const isMember = user?.role === "member" || user?.role === "admin";
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wishes = [
    { title: { zh: "低醣餐盒", en: "Low-carb bento" }, votes: 148, state: { zh: "提案中", en: "In review" } },
    { title: { zh: "冷泡茶組合", en: "Cold brew tea set" }, votes: 96, state: { zh: "蒐集需求", en: "Gathering interest" } },
    { title: { zh: "在地水果箱", en: "Seasonal fruit box" }, votes: 84, state: { zh: "待上架", en: "Queued" } },
  ];

  return (
    <section id="wishes" className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">06 · Member Wishes</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {locale === "zh" ? "社員許願提案區" : "Member wish submission"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "比照許願清單，社員可直接提出希望導入的商品或活動。" : "Members can submit products or events they want the co-op to source."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-border bg-white/80 p-5 shadow-soft backdrop-blur">
          {isMember ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!title.trim() || !detail.trim()) return;
                setSubmitted(true);
              }}
            >
              <div>
                <h3 className="text-lg font-bold">{locale === "zh" ? "提出新許願" : "Submit a wish"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === "zh" ? "把你想要的商品、活動或合作提案寫下來，會進入共購評估流程。" : "Write the item, event, or collaboration you want to see next."}
                </p>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{locale === "zh" ? "願望標題" : "Wish title"}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder={locale === "zh" ? "例如：小農鮮奶優格" : "e.g. Local yogurt"}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">{locale === "zh" ? "說明" : "Detail"}</span>
                <textarea
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder={locale === "zh" ? "說明想要的規格、預估數量或希望開團的時間" : "Add specs, quantity, or preferred campaign timing"}
                />
              </label>

              {submitted ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                  ✓ {locale === "zh" ? "許願已送出，將進入提案池。" : "Wish submitted and added to the proposal pool."}
                </div>
              ) : null}

              <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110">
                {locale === "zh" ? "送出許願" : "Send wish"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{locale === "zh" ? "登入後可許願" : "Login to submit wishes"}</h3>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "只有正式社員與管理員可以送出提案。" : "Only verified members and admins can submit proposals."}
              </p>
              <button onClick={openLogin} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background">
                {locale === "zh" ? "社員登入" : "Member login"}
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{locale === "zh" ? "許願清單預覽" : "Wish list preview"}</h3>
            <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-[10px] font-bold uppercase text-accent">
              {wishes.length} items
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {wishes.map((wish) => (
              <article key={wish.title.zh} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">{wish.title[locale]}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-primary">
                    {wish.votes} votes
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{locale === "zh" ? wish.state.zh : wish.state.en}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
