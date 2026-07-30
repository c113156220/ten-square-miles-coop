import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "zh" | "en";

type Entry = { zh: string; en: string };

export const dict = {
  "nav.shop": { zh: "共同購買", en: "Shop" },
  "nav.surveys": { zh: "意象調查", en: "Surveys" },
  "nav.governance": { zh: "社務治理", en: "Governance" },
  "nav.login": { zh: "社員登入", en: "Member Portal" },
  "nav.trial": { zh: "體驗帳號", en: "Trial Pass" },
  "nav.calculator": { zh: "分紅試算", en: "Calculator" },
  "nav.wishlist": { zh: "願望清單", en: "Wishlist" },
  "nav.impact": { zh: "社會影響力", en: "Impact" },
  "nav.admin": { zh: "後台管理", en: "Admin" },

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

  // Trial page
  "trial.title": { zh: "30 天體驗通行證", en: "30-Day Trial Pass" },
  "trial.subtitle": { zh: "Guest onboarding gamification", en: "Guest onboarding gamification" },
  "trial.body": {
    zh: "先試試看合作社的日常。註冊體驗帳號，完成 3 分鐘的「合作社基礎」闖關問答，即可解鎖迎新券與股金折扣。",
    en: "Try co-op life before you commit. Register for a trial account and finish the 3-minute Co-op Basics quiz to unlock your welcome voucher and share-capital discount.",
  },
  "trial.email": { zh: "電子郵件", en: "Email" },
  "trial.name": { zh: "稱呼", en: "Display name" },
  "trial.register": { zh: "領取體驗通行證", en: "Claim trial pass" },
  "trial.quiz.title": { zh: "闖關：合作社基礎", en: "Quest: Co-op Basics" },
  "trial.quiz.progress": { zh: "進度", en: "Progress" },
  "trial.quiz.next": { zh: "下一題", en: "Next" },
  "trial.quiz.finish": { zh: "完成闖關", en: "Finish quest" },
  "trial.quiz.done.title": { zh: "🎉 恭喜完成！", en: "🎉 Quest complete!" },
  "trial.quiz.done.body": {
    zh: "你已解鎖 NT$200 迎新券，並取得股金訂金 10% 折扣。",
    en: "You've unlocked a NT$200 welcome voucher and 10% off your share-capital deposit.",
  },
  "trial.perks": { zh: "體驗期間福利", en: "Trial perks" },
  "trial.perk.1": { zh: "瀏覽全部預購清單", en: "Browse every pre-order" },
  "trial.perk.2": { zh: "3 次非社員試購名額", en: "3 guest purchase slots" },
  "trial.perk.3": { zh: "旁聽 1 次社員大會", en: "Audit 1 general meeting" },

  // Calculator
  "calc.title": { zh: "結餘分紅互動計算器", en: "Surplus & Dividend Calculator" },
  "calc.subtitle": { zh: "Estimate your annual return", en: "Estimate your annual return" },
  "calc.body": {
    zh: "輸入你預估的每月消費金額，看看成為正式社員後每年可回饋多少結餘與稅務優惠。",
    en: "Enter your estimated monthly spend to see the annual surplus return and tax savings you'd receive as a verified member.",
  },
  "calc.monthly": { zh: "每月預估消費 (NT$)", en: "Estimated monthly spend (NT$)" },
  "calc.category": { zh: "主要品項", en: "Primary category" },
  "calc.cat.bento": { zh: "健康餐盒", en: "Healthy bento" },
  "calc.cat.produce": { zh: "生鮮蔬果", en: "Fresh produce" },
  "calc.cat.pantry": { zh: "乾貨雜糧", en: "Pantry staples" },
  "calc.annual": { zh: "年度預估消費", en: "Annual spend" },
  "calc.return": { zh: "預估結餘回饋", en: "Est. surplus return" },
  "calc.tax": { zh: "預估稅務節省", en: "Est. tax savings" },
  "calc.points": { zh: "預估累積積點", en: "Est. reward points" },
  "calc.cta": { zh: "立即加入社員", en: "Become a member" },

  // Wishlist
  "wish.title": { zh: "公開願望清單", en: "Community Wishlist" },
  "wish.subtitle": { zh: "Vote on sourcing proposals", en: "Vote on sourcing proposals" },
  "wish.body": {
    zh: "由社員提出的採購願望。點擊「+1 集氣」讓提案更快達成成團門檻。",
    en: "Sourcing proposals from members. Tap +1 Interested to help proposals reach the group-buy threshold.",
  },
  "wish.plus": { zh: "+1 集氣", en: "+1 Interested" },
  "wish.by": { zh: "提案人", en: "Proposed by" },
  "wish.ready": { zh: "已達門檻！可開團", en: "Threshold reached! Ready to launch" },
  "wish.join": { zh: "加入社員以參與獨家預購折扣", en: "Join as a member for the exclusive pre-order discount" },

  // Impact
  "impact.title": { zh: "社會影響力儀表板", en: "Impact & Sustainability" },
  "impact.subtitle": { zh: "Public good, in numbers", en: "Public good, in numbers" },
  "impact.body": {
    zh: "合作社公積金與運營如何回饋社會。所有數字每季更新，帳目公開透明。",
    en: "How our reserve fund and operations return value to society. Figures update quarterly with a fully transparent ledger.",
  },
  "impact.grants": { zh: "學生助學金", en: "Student grants funded" },
  "impact.farmers": { zh: "支持在地小農", en: "Local farmers supported" },
  "impact.plastic": { zh: "減少塑膠使用", en: "Plastic reduced" },
  "impact.co2": { zh: "減碳量", en: "CO₂ avoided" },
  "impact.donated": { zh: "累積捐贈公益", en: "Donated to public good" },
  "impact.meals": { zh: "共餐配送份數", en: "Community meals delivered" },

  // Admin
  "admin.title": { zh: "後台管理", en: "Admin Portal" },
  "admin.role": { zh: "角色", en: "Role" },
  "admin.role.admin": { zh: "系統管理員 Admin", en: "Admin" },
  "admin.role.board": { zh: "理事 Board Member", en: "Board Member" },
  "admin.role.auditor": { zh: "監事 Auditor", en: "Auditor" },
  "admin.nav.dashboard": { zh: "總覽 Dashboard", en: "Dashboard" },
  "admin.nav.members": { zh: "社員審核", en: "Members & Verification" },
  "admin.nav.preorders": { zh: "預購與供應鏈", en: "Pre-orders & Supply" },
  "admin.nav.finance": { zh: "財務與稅務", en: "Finance & Tax" },
  "admin.nav.voting": { zh: "民主治理", en: "Voting & Meetings" },
  "admin.nav.surplus": { zh: "結餘分紅", en: "Surplus & Dividend" },

  "admin.dash.pendingMembers": { zh: "待審社員", en: "Pending members" },
  "admin.dash.activeCampaigns": { zh: "進行中預購", en: "Active campaigns" },
  "admin.dash.nonmemberRatio": { zh: "非社員銷售比", en: "Non-member sales ratio" },
  "admin.dash.reserve": { zh: "公積金餘額", en: "Reserve fund" },
  "admin.dash.recent": { zh: "近期活動", en: "Recent activity" },

  // Members
  "mem.queue": { zh: "待審核佇列", en: "Pending Verification Queue" },
  "mem.col.name": { zh: "姓名", en: "Name" },
  "mem.col.id": { zh: "身分驗證", en: "ID verification" },
  "mem.col.payment": { zh: "股金繳納", en: "Share payment" },
  "mem.col.edu": { zh: "社務教育", en: "Co-op education" },
  "mem.col.action": { zh: "操作", en: "Action" },
  "mem.approve": { zh: "核准並發放股票", en: "Approve & Issue Share" },
  "mem.approved": { zh: "已核准 ✓", en: "Approved ✓" },
  "mem.directory": { zh: "已驗證社員名錄", en: "Verified Member Directory" },
  "mem.col.mid": { zh: "社員編號", en: "Member ID" },
  "mem.col.shares": { zh: "股數", en: "Shares" },
  "mem.col.points": { zh: "積點", en: "Points" },
  "mem.col.status": { zh: "帳號狀態", en: "Status" },
  "mem.filter": { zh: "搜尋社員…", en: "Search members…" },

  // Pre-orders
  "po.wishlist": { zh: "願望與意象調查", en: "Wishlist & Survey" },
  "po.convert": { zh: "轉為預購活動", en: "Convert to campaign" },
  "po.votes": { zh: "集氣票數", en: "Interest votes" },
  "po.vendor": { zh: "廠商採購單", en: "Vendor Purchase Sheet" },
  "po.generate": { zh: "產生採購單", en: "Generate purchase sheet" },
  "po.fulfill": { zh: "訂單履行追蹤", en: "Order Fulfillment Tracker" },
  "po.status.sourcing": { zh: "廠商進貨中", en: "Sourcing" },
  "po.status.transit": { zh: "運送中", en: "In Transit" },
  "po.status.ready": { zh: "待取貨/配送", en: "Ready for Pickup" },
  "po.advance": { zh: "下一階段", en: "Advance stage" },
  "po.cold": { zh: "冷鏈", en: "Cold Chain" },

  // Finance
  "fin.cap": { zh: "30% 非社員銷售上限監控", en: "30% Non-member Sales Cap" },
  "fin.ratio": { zh: "目前比例", en: "Current ratio" },
  "fin.cap.warn": { zh: "接近上限，請留意排程", en: "Approaching cap — review scheduling" },
  "fin.cap.ok": { zh: "健康範圍", en: "Within healthy range" },
  "fin.ledger": { zh: "稅務台帳與發票", en: "Tax Ledger & Invoices" },
  "fin.exempt": { zh: "免稅（社員／一級農產品）", en: "Tax-Exempt (Member / Raw agri)" },
  "fin.taxable": { zh: "應稅（非社員／加工餐盒）", en: "Taxable (Non-member / Processed)" },
  "fin.invoice": { zh: "發票狀態", en: "Invoice" },
  "fin.issued": { zh: "已開立", en: "Issued" },
  "fin.pending": { zh: "待開立", en: "Pending" },

  // Voting
  "vote.meetings": { zh: "會議排程", en: "Meeting Scheduler" },
  "vote.new": { zh: "建立會議", en: "New meeting" },
  "vote.type.agm": { zh: "社員大會", en: "Annual General Meeting" },
  "vote.type.board": { zh: "社務會議", en: "Board Meeting" },
  "vote.polls": { zh: "投票中議案 (1 社員 1 票)", en: "Active Polls (1 member 1 vote)" },
  "vote.anon": { zh: "匿名投票", en: "Anonymous ballot" },
  "vote.new.poll": { zh: "新增議案", en: "New poll" },
  "vote.close": { zh: "截止", en: "Closes" },

  // Surplus admin
  "sur.ledger": { zh: "年度結餘台帳", en: "Annual Surplus Ledger" },
  "sur.income": { zh: "年度營收 (NT$)", en: "Annual gross income" },
  "sur.cost": { zh: "營運成本 (NT$)", en: "Operating cost" },
  "sur.calc": { zh: "計算結餘", en: "Calculate surplus" },
  "sur.total": { zh: "淨結餘", en: "Net surplus" },
  "sur.reserve50": { zh: "公積金 (50%)", en: "Reserve fund (50%)" },
  "sur.dividend50": { zh: "社員分紅 (50%)", en: "Member dividend (50%)" },
  "sur.allocator": { zh: "分紅分配器 (依貢獻度)", en: "Dividend Allocator (contribution-weighted)" },
  "sur.member": { zh: "社員", en: "Member" },
  "sur.contribution": { zh: "貢獻積點", en: "Contribution pts" },
  "sur.share": { zh: "分配比例", en: "Share %" },
  "sur.payout": { zh: "應發金額", en: "Payout" },

  "admin.nav.forecasting": { zh: "智慧需求預測", en: "Demand Forecasting" },
  "admin.nav.roles": { zh: "帳號與權限", en: "Admins & Roles" },
  "admin.nav.settings": { zh: "體驗與系統設定", en: "System Settings" },
  "admin.nav.users": { zh: "全體使用者總表", en: "All Users Directory" },

  // Trial roster / edit days
  "trial.roster.title": { zh: "體驗社員名單", en: "Guest Trial Roster" },
  "trial.roster.sub": {
    zh: "追蹤前台自助註冊的體驗帳號、剩餘天數與到期日期。",
    en: "Track self-registered trial accounts, remaining days and expiration.",
  },
  "trial.col.account": { zh: "帳號資訊", en: "Account Info" },
  "trial.col.registered": { zh: "註冊日期", en: "Registration Date" },
  "trial.col.remaining": { zh: "剩餘體驗天數", en: "Days Remaining" },
  "trial.col.expiry": { zh: "到期日期", en: "Expiration Date" },
  "trial.col.status": { zh: "帳號狀態", en: "Status" },
  "trial.col.actions": { zh: "操作管理", en: "Actions" },
  "trial.status.active": { zh: "體驗中", en: "Active Trial" },
  "trial.status.expired": { zh: "已過期", en: "Expired" },
  "trial.status.upgraded": { zh: "已轉正式社員", en: "Upgraded" },
  "trial.action.editDays": { zh: "編輯天數", en: "Edit Days" },
  "trial.action.convert": { zh: "轉為正式社員", en: "Convert to Member" },
  "trial.empty": { zh: "尚無體驗帳號註冊。", en: "No trial accounts registered yet." },

  // Edit-days modal
  "edit.title": { zh: "編輯體驗天數", en: "Edit Trial Days" },
  "edit.current": { zh: "目前剩餘天數", en: "Current remaining" },
  "edit.quick": { zh: "快速調整", en: "Quick adjust" },
  "edit.custom": { zh: "自訂增減 (可為負數)", en: "Custom (+/− days)" },
  "edit.setExpiry": { zh: "指定到期日期", en: "Set expiration date" },
  "edit.note": { zh: "調整原因 (內部備註)", en: "Reason for change (internal note)" },
  "edit.notePh": { zh: "例如：因活動延後補償 7 天", en: "e.g. compensated 7 days for event delay" },
  "edit.forceExpire": { zh: "強制過期 (0 天)", en: "Force Expire (0 days)" },
  "edit.save": { zh: "儲存設定", en: "Save" },
  "edit.cancel": { zh: "取消", en: "Cancel" },
  "edit.saved": { zh: "已更新體驗天數", en: "Trial days updated" },

  // Common
  "common.name": { zh: "姓名", en: "Name" },
  "common.email": { zh: "電子郵件", en: "Email" },
  "common.phone": { zh: "手機號碼", en: "Phone" },
  "common.role": { zh: "身份類別", en: "Role" },
  "common.status": { zh: "狀態", en: "Status" },
  "common.actions": { zh: "操作", en: "Actions" },
  "common.days": { zh: "天", en: "days" },
  "common.days.short": { zh: "天", en: "d" },
  "common.close": { zh: "關閉", en: "Close" },
  "common.save": { zh: "儲存", en: "Save" },
  "common.cancel": { zh: "取消", en: "Cancel" },
  "common.verified": { zh: "已驗證", en: "Verified" },
  "common.pending": { zh: "待驗證", en: "Pending" },
  "common.view": { zh: "查看詳情", en: "View" },

  // Roles / user types
  "user.role.admin": { zh: "管理員", en: "Admin" },
  "user.role.member": { zh: "正式社員", en: "Verified Member" },
  "user.role.trial": { zh: "體驗社員", en: "Guest / Trial" },

  // Universal directory
  "users.title": { zh: "全體註冊使用者總表", en: "All Registered Users Directory" },
  "users.sub": {
    zh: "涵蓋體驗、審核中、正式與過期帳號。All accounts across trial, in-review, verified, and expired.",
    en: "Every account across trial, in-review, verified, and expired states.",
  },
  "users.filter.all": { zh: "全部", en: "All" },
  "users.filter.trial": { zh: "體驗", en: "Trial" },
  "users.filter.member": { zh: "社員", en: "Member" },
  "users.filter.admin": { zh: "管理員", en: "Admin" },
  "users.filter.expired": { zh: "已過期", en: "Expired" },
  "users.count": { zh: "共 {n} 筆", en: "{n} total" },
} satisfies Record<string, Entry>;

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
