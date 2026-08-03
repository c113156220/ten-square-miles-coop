import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { CheckoutModal } from "@/components/CheckoutModal";
import eggsImg from "@/assets/product-eggs.jpg";
import soyImg from "@/assets/product-soysauce.jpg";
import vegImg from "@/assets/product-veggies.jpg";

export const Route = createFileRoute("/coop")({
  head: () => ({
    meta: [
      { title: "共同購買流程 Co-op Buying — 十圓方里" },
      {
        name: "description",
        content:
          "Three-stage rolling co-op purchasing: intent survey, pre-order lock-in, and fulfillment tracking with member vs. regular pricing.",
      },
      { property: "og:title", content: "Co-op Buying — Ten Sq Miles" },
      { property: "og:description", content: "Zero-inventory, member-priced, transparent." },
    ],
  }),
  component: CoopPage,
});

type Stage = 1 | 2 | 3;
type TempType = "cold" | "ambient";
type Campaign = {
  img: string;
  name: { zh: string; en: string };
  vendor: { zh: string; en: string };
  stage: Stage;
  memberPrice: number;
  regularPrice: number;
  taxExempt: boolean;
  tempType: TempType;
  // stage 1
  intentResponses?: number;
  intentTarget?: number;
  // stage 2
  ordered?: number;
  threshold?: number;
  deposit?: number;
  hot?: boolean;
  daysLeft?: number;
  // stage 3
  fulfillStep?: 0 | 1 | 2; // sourced -> arrived -> ready
  pickupDate?: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    img: soyImg,
    name: { zh: "柴燒手工醬油", en: "Wood-Fired Soy Sauce" },
    vendor: { zh: "西螺・老欉黑豆坊", en: "Xiluo Heirloom Black Bean" },
    stage: 1,
    memberPrice: 320,
    regularPrice: 420,
    taxExempt: false,
    tempType: "ambient",
    intentResponses: 68,
    intentTarget: 120,
  },
  {
    img: eggsImg,
    name: { zh: "放牧土雞蛋 (12入)", en: "Pasture Brown Eggs (12ct)" },
    vendor: { zh: "南投高地小農", en: "Nantou Highland Farms" },
    stage: 2,
    memberPrice: 180,
    regularPrice: 240,
    taxExempt: true,
    tempType: "cold",
    ordered: 142,
    threshold: 200,
    deposit: 180,
    hot: true,
    daysLeft: 3,
  },
  {
    img: vegImg,
    name: { zh: "旬味蔬菜箱 (5kg)", en: "Seasonal Veggie Box (5kg)" },
    vendor: { zh: "宜蘭夥伴農場", en: "Yilan Partner Farms" },
    stage: 3,
    memberPrice: 480,
    regularPrice: 620,
    taxExempt: true,
    tempType: "cold",
    fulfillStep: 1,
    pickupDate: "2026.07.31 (Fri)",
  },
];

function StageBar({ stage, locale }: { stage: Stage; locale: "zh" | "en" }) {
  const steps = [
    { zh: "意象調查", en: "Intent Survey" },
    { zh: "預購鎖單", en: "Pre-order" },
    { zh: "採購與配送", en: "Fulfillment" },
  ];
  return (
    <ol className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest">
      {steps.map((s, i) => {
        const n = (i + 1) as Stage;
        const done = n < stage;
        const active = n === stage;
        return (
          <li key={i} className="flex items-center gap-1">
            <span
              className={`grid size-5 place-items-center rounded-full text-[10px] ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-accent text-accent-foreground"
                    : "bg-stone-200 text-muted-foreground"
              }`}
            >
              {n}
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>
              {s[locale]}
            </span>
            {i < 2 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function DualPrice({ member, regular, exempt, locale }: {
  member: number; regular: number; exempt: boolean; locale: "zh" | "en";
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded border border-black/5 bg-stone-50 p-2 text-xs">
      <div>
        <div className="flex items-center gap-1 text-[10px] text-primary">
          <span className="rounded-sm bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {locale === "zh" ? "社員" : "MEMBER"}
          </span>
          {exempt && <span className="text-[9px] text-muted-foreground">{locale === "zh" ? "免稅" : "TAX-FREE"}</span>}
        </div>
        <p className="mt-1 font-mono text-lg font-bold text-primary">${member}</p>
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground">
          {locale === "zh" ? "一般價" : "REGULAR"}
        </div>
        <p className="mt-1 font-mono text-lg text-muted-foreground line-through">${regular}</p>
      </div>
    </div>
  );
}

function CampaignCard({ c, onAddToCart }: { c: Campaign; onAddToCart: (campaign: Campaign) => void }) {
  const { locale } = useI18n();
  const tempLabel = c.tempType === "cold" ? (locale === "zh" ? "冷鏈" : "Cold chain") : locale === "zh" ? "常溫" : "Ambient";

  return (
    <article 
  id={c.name.en.includes("Eggs") ? "product-eggs" : `product-${c.name.en.toLowerCase().replace(/\s+/g, '-')}`}
  className="flex flex-col gap-4 rounded-md border border-border bg-white p-4 shadow-sm transition-all duration-500"
>
      <div className="relative overflow-hidden rounded">
        <img src={c.img} alt={c.name[locale]} className="aspect-[4/3] w-full object-cover" />
        {c.hot && (
          <span className="absolute right-2 top-2 rounded-sm bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
            {locale === "zh" ? "熱銷" : "Hot Item"}
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {locale === "zh" ? "零庫存預購" : "Zero-Inventory"}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold">{c.name[locale]}</h3>
        <p className="text-xs text-muted-foreground">{c.vendor[locale]}</p>
      </div>
      <StageBar stage={c.stage} locale={locale} />
      <div className="flex items-center justify-between rounded border border-black/5 bg-stone-50 px-3 py-2 text-xs">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {locale === "zh" ? "配送層級" : "Handling"}
        </span>
        <span className={`rounded-full px-2 py-0.5 font-bold ${c.tempType === "cold" ? "bg-primary/10 text-primary" : "bg-stone-200 text-muted-foreground"}`}>
          {tempLabel}
        </span>
      </div>
      <DualPrice member={c.memberPrice} regular={c.regularPrice} exempt={c.taxExempt} locale={locale} />

      {c.stage === 1 && (
        <div className="space-y-2 rounded border border-accent/30 bg-accent/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {locale === "zh" ? "意象調查中" : "Intent Survey"}
          </p>
          <p className="text-xs text-muted-foreground">
            {locale === "zh"
              ? "填寫預估需求量，協助我們向廠商爭取更好的合約條件。"
              : "Share your needed quantity so we can negotiate better vendor terms."}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono">
              {c.intentResponses}/{c.intentTarget} {locale === "zh" ? "份意見" : "responses"}
            </span>
            <IntentInput />
          </div>
        </div>
      )}

      {c.stage === 2 && (
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-xs">
            <span>{locale === "zh" ? "已預購" : "Ordered"}</span>
            <span>
              {c.ordered}/{c.threshold} ({locale === "zh" ? "還剩" : ""} {c.daysLeft}
              {locale === "zh" ? " 天" : "d left"})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((c.ordered ?? 0) / (c.threshold ?? 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-end justify-between pt-1">
            <div className="text-xs text-muted-foreground">
              {locale === "zh" ? "訂金" : "Deposit"}{" "}
              <span className="font-mono font-bold text-foreground">${c.deposit}</span>
            </div>
            <button className="rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110">
              {locale === "zh" ? "立即預購" : "Pre-order"}
            </button>
          </div>
        </div>
      )}

      {c.stage === 3 && (
        <div className="rounded border border-black/5 bg-stone-100 p-3">
          <ol className="mb-2 flex justify-between text-[10px] font-mono uppercase tracking-wider">
            {[
              { zh: "廠商出貨", en: "Sourced" },
              { zh: "抵達合作社", en: "Arrived" },
              { zh: "可取貨", en: "Ready" },
            ].map((s, i) => {
              const done = (c.fulfillStep ?? 0) >= i;
              return (
                <li key={i} className={done ? "text-primary" : "text-muted-foreground"}>
                  ● {s[locale]}
                </li>
              );
            })}
          </ol>
          <p className="font-mono text-sm">{c.pickupDate}</p>
        </div>
      )}

      <button
        onClick={() => onAddToCart(c)}
        className="rounded-sm bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
      >
        {locale === "zh" ? "加入購物車" : "Add to cart"}
      </button>
    </article>
  );
}

function IntentInput() {
  const { locale } = useI18n();
  const [qty, setQty] = useState(2);
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <span className="text-[11px] font-bold text-primary">
        ✓ {locale === "zh" ? "已登記" : "Logged"}
      </span>
    );
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-14 rounded-sm border border-border px-1 py-0.5 text-xs"
      />
      <button
        onClick={() => setSent(true)}
        className="rounded-sm border border-accent bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent hover:bg-accent hover:text-accent-foreground"
      >
        {locale === "zh" ? "登記" : "Submit"}
      </button>
    </div>
  );
}

function WishlistPromo() {
  const { locale } = useI18n();
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [thanks, setThanks] = useState(false);
  return (
    <section className="mb-16 rounded-md border border-accent/30 bg-accent/5 p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">
            {locale === "zh" ? "願望清單" : "Wishlist"} · {locale === "zh" ? "集氣許願" : "Crowdsourced Sourcing"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "推薦商品成團後，提案人自動獲得積點，直接提高年度結餘分紅。"
              : "When your proposal becomes a campaign, you earn reward points that increase your share of the annual surplus."}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
          +1 = {locale === "zh" ? "集氣" : "Interested"}
        </span>
      </div>
      {thanks ? (
        <p className="rounded border border-accent bg-white p-4 text-sm font-bold text-accent">
          ✓ {locale === "zh" ? "已收到您的許願，成團後將發送 50 積點。" : "Proposal received. You'll earn 50 pts once it becomes a campaign."}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) setThanks(true);
          }}
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            placeholder={locale === "zh" ? "商品名稱" : "Product name"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-sm border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder={locale === "zh" ? "廠商 / 產地連結 (選填)" : "Vendor / source URL (optional)"}
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="rounded-sm border border-border bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-sm bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:brightness-110">
            {locale === "zh" ? "提交許願" : "Submit"}
          </button>
        </form>
      )}
    </section>
  );
}

function EcoCheckoutStrip() {
  const { locale } = useI18n();
  const [eco, setEco] = useState(true);
  return (
    <section className="mb-16 rounded-md border border-primary/30 bg-primary/5 p-6">
      <h2 className="text-xl font-extrabold">
        {locale === "zh" ? "負責任消費選項 · 綠色積點" : "Responsible Consumption · Green Points"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {locale === "zh"
          ? "結帳時勾選裸裝／自備容器，我們額外贈送綠色積點，並回饋給循環包裝夥伴。"
          : "Opt for minimal packaging / bring-your-own container at checkout for bonus Green Points and a rebate to our reusables partner."}
      </p>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded border border-black/5 bg-white p-3 text-sm">
        <input
          type="checkbox"
          checked={eco}
          onChange={(e) => setEco(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          <span className="font-bold">
            {locale === "zh" ? "裸裝 / 自備容器" : "Minimal packaging / BYO container"}
          </span>
          <span className="ml-2 rounded bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
            +30 {locale === "zh" ? "綠色積點" : "Green pts"}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            {eco
              ? locale === "zh"
                ? "此訂單將啟用減塑取貨。"
                : "This order will use zero-plastic pickup."
              : locale === "zh"
                ? "此訂單將使用標準包裝。"
                : "This order will ship in standard packaging."}
          </p>
        </span>
      </label>
    </section>
  );
}

function NonMemberNudge() {
  const { locale } = useI18n();
  return (
    <div className="mb-10 flex flex-col justify-between gap-3 rounded-md border border-accent bg-accent/10 p-4 text-sm md:flex-row md:items-center">
      <span>
        {locale === "zh"
          ? "🎯 加入社員即可解鎖共同購買價，並享有年度結餘分紅回饋。"
          : "🎯 Become a member today to unlock co-op pricing and earn annual surplus rebates."}
      </span>
      <a
        href="/onboarding"
        className="self-start rounded-sm bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:brightness-110"
      >
        {locale === "zh" ? "入社申請" : "Apply now"}
      </a>
    </div>
  );
}

type CartItem = { id: string; name: string; price: number; tempType: TempType };

function CartCheckoutPanel({
  cart,
  checkoutMessage,
  onOpenCheckout,
  onClear,
}: {
  cart: CartItem[];
  checkoutMessage: string | null;
  onOpenCheckout: () => void;
  onClear: () => void;
}) {
  const { locale } = useI18n();
  const mixed = cart.some((item) => item.tempType === "cold") && cart.some((item) => item.tempType === "ambient");
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="mb-16 rounded-md border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">{locale === "zh" ? "結帳示範" : "Checkout demo"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh"
              ? "加入購物車後，若混合冷鏈與常溫商品，系統會提示你分開安排取貨。"
              : "If cold-chain and ambient items are combined, the demo warns you to separate pickup handling."}
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-bold text-muted-foreground">
          {cart.length} {locale === "zh" ? "項" : "items"}
        </div>
      </div>

      {cart.length === 0 ? (
        <p className="mt-5 rounded border border-dashed border-border p-4 text-sm text-muted-foreground">
          {locale === "zh" ? "先加入一個商品，看看結帳警示。" : "Add an item to see the checkout warning."}
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-border bg-stone-50 px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{item.tempType === "cold" ? "Cold chain" : "Ambient"}</p>
              </div>
              <span className="font-mono font-bold">${item.price}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded border border-primary/20 bg-primary/5 px-3 py-3 text-sm">
            <span>{locale === "zh" ? "小計" : "Subtotal"}</span>
            <span className="font-mono font-extrabold">${total}</span>
          </div>
        </div>
      )}

      {mixed && (
        <div className="mt-4 rounded border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          ⚠️ {locale === "zh" ? "偵測到混溫訂單，將分成冷鏈與常溫兩段取貨。" : "Mixed-temperature order detected. Pickup will be split into cold-chain and ambient handling."}
        </div>
      )}

      {checkoutMessage && (
        <div className="mt-4 rounded border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          ✓ {checkoutMessage}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onOpenCheckout}
          disabled={cart.length === 0}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:brightness-110 disabled:opacity-40"
        >
          {locale === "zh" ? "前往結帳" : "Proceed to Checkout"}
        </button>
        <button
          onClick={onClear}
          className="rounded-sm border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-stone-100"
        >
          {locale === "zh" ? "清空購物車" : "Clear cart"}
        </button>
      </div>
    </section>
  );
}

function CoopPage() {
  const { locale } = useI18n();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1280);
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          // 1. 自動平滑捲動至畫面中央
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

          // 2. 加上綠色高亮與脈衝閃爍動畫
          targetElement.classList.add("ring-4", "ring-primary", "animate-pulse");

          // 3. 2.5 秒後自動停止閃爍並恢復原狀
          setTimeout(() => {
            targetElement.classList.remove("ring-4", "ring-primary", "animate-pulse");
          }, 2500);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);


  function addToCart(campaign: Campaign) {
    setCart((prev) => [
      ...prev,
      {
        id: `${campaign.name.en}-${Date.now()}`,
        name: campaign.name[locale],
        price: campaign.memberPrice,
        tempType: campaign.tempType,
      },
    ]);
    setCheckoutMessage(null);
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Co-op Purchasing"
        title={locale === "zh" ? "共同購買・三階段滾動流程" : "Co-op Buying · 3-Stage Rolling Flow"}
        subtitle={locale === "zh" ? "Intent · Lock-in · Fulfillment" : "Intent · Lock-in · Fulfillment"}
        body={
          locale === "zh"
            ? "每檔商品都會經過意象調查、預購鎖單、採購配送三個階段。所有訂單皆為零庫存預購，降低浪費、將議價空間回到社員。"
            : "Every campaign flows through Intent Survey, Pre-order Lock-in, and Fulfillment. Zero inventory, less waste, better vendor terms returned to members."
        }
      />

      <NonMemberNudge />

      <section className="mb-16 grid gap-6 md:grid-cols-3">
        {CAMPAIGNS.map((c) => (
          <CampaignCard key={c.name.en} c={c} onAddToCart={addToCart} />
        ))}
      </section>

      <CartCheckoutPanel
        cart={cart}
        checkoutMessage={checkoutMessage}
        onOpenCheckout={() => setCheckoutOpen(true)}
        onClear={() => {
          setCart([]);
          setCheckoutMessage(null);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        walletBalance={walletBalance}
        onWalletDebit={(amount) => setWalletBalance((balance) => Math.max(0, balance - amount))}
        onPaid={(message) => setCheckoutMessage(message)}
        ecpayEndpoint={import.meta.env.VITE_ECPAY_CHECKOUT_URL ?? "http://localhost:54321/functions/v1/ecpay-checkout"}
      />

      <WishlistPromo />
      <EcoCheckoutStrip />
    </SiteShell>
  );
}
