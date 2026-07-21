import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "zh" | "en";

type Dict = Record<string, { zh: string; en: string }>;

export const dict = {
  "nav.shop": { zh: "共同購買", en: "Shop" },
  "nav.surveys": { zh: "意象調查", en: "Surveys" },
  "nav.governance": { zh: "社務治理", en: "Governance" },
  "nav.login": { zh: "社員登入", en: "Member Portal" },

  "hero.title.1": { zh: "以社群之力，", en: "Powered by community," },
  "hero.title.2": { zh: "重塑在地供應。", en: "reshaping local supply." },
  "hero.subtitle": { zh: "Sourcing essentials together.", en: "Sourcing essentials together." },
  "hero.body": {
    zh: "我們是一個致力於透明供應與共同決策的合作社。透過零庫存預購機制，減少浪費並將結餘回饋給每一位參與的社員。",
    en: "A member-owned co-op built on transparent sourcing and shared decisions. Our zero-inventory pre-order model cuts waste and returns surplus to every participating member.",
  },
  "hero.cta.browse": { zh: "瀏覽預購清單", en: "Browse Pre-orders" },
  "hero.cta.join": { zh: "加入社員", en: "Join Co-op" },

  "section.active": { zh: "即時預購中", en: "Active Pre-orders" },
  "section.active.sub": { zh: "Active Pre-orders", en: "Live campaigns" },
  "section.active.alert": { zh: "3 items reaching threshold", en: "3 items reaching threshold" },

  "status.surveying": { zh: "意象調查中", en: "Surveying" },
  "status.preordering": { zh: "預購中", en: "Pre-ordering" },
  "status.sourcing": { zh: "廠商進貨中", en: "Sourcing" },
  "status.ready": { zh: "待取貨", en: "Ready" },

  "tax.exempt": { zh: "免稅一級農產品", en: "Tax-Exempt" },
  "tax.standard": { zh: "應稅加工食品", en: "Taxable" },

  "card.threshold": { zh: "進度 Threshold", en: "Threshold" },
  "card.demand": { zh: "成團需求 Demand", en: "Demand Survey" },
  "card.deadline": { zh: "Deadline", en: "Deadline" },
  "card.daysLeft": { zh: "3 天內截止", en: "3 Days Left" },
  "card.deposit": { zh: "訂金 Deposit", en: "Deposit" },
  "card.estPrice": { zh: "預估價 Est. Price", en: "Est. Price" },
  "card.wish": { zh: "我要許願", en: "Submit Interest" },
  "card.pickup": { zh: "預計取貨日", en: "Est. Pickup" },
  "card.cold": { zh: "需冷藏 / Requires Refrigeration", en: "Requires Refrigeration" },

  "product.eggs.name": { zh: "放牧土雞蛋 (12入)", en: "Pasture-Raised Brown Eggs (12ct)" },
  "product.eggs.desc": { zh: "Pasture-Raised Brown Eggs", en: "From highland small farms" },
  "product.soy.name": { zh: "柴燒手工醬油", en: "Wood-Fired Artisanal Soy Sauce" },
  "product.soy.desc": { zh: "Wood-Fired Artisanal Soy Sauce", en: "Traditional black bean, 6-month aged" },
  "product.veg.name": { zh: "旬味蔬菜箱 (5kg)", en: "Seasonal Veggie Box (5kg)" },
  "product.veg.desc": { zh: "Seasonal Veggie Box", en: "Fresh from partner farms" },

  "surplus.title": { zh: "合作社結餘分配", en: "Co-op Surplus Distribution" },
  "surplus.subtitle": { zh: "Surplus Distribution", en: "How returns flow back" },
  "surplus.body": {
    zh: "我們的結餘不分給大股東，而是依據社員的「消費貢獻度」按比例回饋。50% 留作公積金強化營運，50% 直接回饋給社群。",
    en: "Surplus is not paid to major shareholders. It is returned in proportion to each member's purchase contribution — 50% strengthens our reserve fund, 50% flows back to members.",
  },
  "surplus.points": { zh: "My Contribution Points", en: "My Contribution Points" },
  "surplus.reserve": { zh: "公積金 Reserve (50%)", en: "Reserve Fund (50%)" },
  "surplus.returns": { zh: "社員回饋 Returns (50%)", en: "Member Returns (50%)" },
  "surplus.revenue": { zh: "Total Revenue", en: "Total Revenue" },
  "surplus.ready": { zh: "Surplus Ready", en: "Surplus Ready" },

  "footer.about": {
    zh: "民主治理與透明供應的實踐者。致力於連結在地生產者與消費者，共創永續的共購生態。",
    en: "Practitioners of democratic governance and transparent sourcing — connecting local producers and consumers in a sustainable co-purchasing ecosystem.",
  },
  "footer.admin": { zh: "社務系統 Admin", en: "Co-op Admin" },
  "footer.ops": { zh: "業務系統 Ops", en: "Operations" },
  "footer.link.agm": { zh: "社員大會記錄", en: "AGM Records" },
  "footer.link.reserve": { zh: "公積金透明帳目", en: "Transparent Ledger" },
  "footer.link.verify": { zh: "實名認證流程", en: "Verification Flow" },
  "footer.link.nonmember": { zh: "非社員銷售監控", en: "Non-member Sales Monitor" },
  "footer.link.logistics": { zh: "物流配送狀態", en: "Delivery Status" },
  "footer.link.inventory": { zh: "進銷存模組", en: "Inventory Module" },
} satisfies Dict;

export type DictKey = keyof typeof dict;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("locale") : null;
    if (stored === "en" || stored === "zh") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("locale", l);
  };

  const t = (key: DictKey) => dict[key][locale];

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
