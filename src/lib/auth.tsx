import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "admin" | "member" | "trial";

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  password: string; // demo only — plaintext for mock
  role: Role;
  verified: boolean;
  createdAt: number;
  trialStart?: number;
  trialDays?: number; // snapshot of config at signup
  trialBlocked?: boolean; // trial expired, cannot re-trial
  convertedToMember?: boolean;
};

type AdminNote = { ts: number; text: string; adminId: string | null };

type StoreShape = {
  users: AuthUser[];
  currentUserId: string | null;
  trialDays: number;
  pendingVerifications: Record<string, string>; // token -> userId
  lastResend: Record<string, number>; // userId -> ts
  adminNotes: Record<string, AdminNote[]>; // userId -> notes
};

const STORAGE_KEY = "tsm_auth_v2";
const DAY_MS = 24 * 60 * 60 * 1000;

const SEED_USERS: AuthUser[] = [
  {
    id: "u_admin",
    email: "admin@coop.tw",
    phone: "0900000001",
    name: "Super Admin",
    password: "admin123",
    role: "admin",
    verified: true,
    createdAt: Date.now(),
  },
  {
    id: "u_demo_admin",
    email: "demo@tensqmiles.coop",
    phone: "0900000002",
    name: "Demo Admin",
    password: "coop2026",
    role: "admin",
    verified: true,
    createdAt: Date.now(),
  },
  {
    id: "u_member",
    email: "member@coop.tw",
    phone: "0900000003",
    name: "Test Member",
    password: "password123",
    role: "member",
    verified: true,
    createdAt: Date.now(),
  },
];

function emptyStore(): StoreShape {
  return {
    users: SEED_USERS,
    currentUserId: null,
    trialDays: 30,
    pendingVerifications: {},
    lastResend: {},
    adminNotes: {},
  };
}

function loadStore(): StoreShape {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    const merged: StoreShape = { ...emptyStore(), ...parsed, adminNotes: parsed.adminNotes ?? {} };
    for (const s of SEED_USERS) {
      if (!merged.users.find((u) => u.email === s.email)) merged.users.push(s);
    }
    return merged;
  } catch {
    return emptyStore();
  }
}

function saveStore(s: StoreShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function trialRemainingDays(u: AuthUser): number {
  if (u.role !== "trial" || !u.trialStart) return 0;
  const days = u.trialDays ?? 30;
  const elapsed = (Date.now() - u.trialStart) / DAY_MS;
  return Math.max(0, Math.ceil(days - elapsed));
}

export function trialExpiryDate(u: AuthUser): Date | null {
  if (u.role !== "trial" || !u.trialStart) return null;
  const days = u.trialDays ?? 30;
  return new Date(u.trialStart + days * DAY_MS);
}

export function isTrialExpired(u: AuthUser | null): boolean {
  if (!u || u.role !== "trial") return false;
  return trialRemainingDays(u) <= 0;
}

type AuthCtx = {
  user: AuthUser | null;
  users: AuthUser[];
  trialDays: number;
  isAdmin: boolean;
  loginOpen: boolean;
  verifyModal: { email: string; link: string; userId: string } | null;
  openLogin: () => void;
  closeLogin: () => void;
  showVerify: (v: { email: string; link: string; userId: string }) => void;
  closeVerify: () => void;
  login: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; error: string };
  logout: () => void;
  registerTrial: (input: { name: string; email: string; phone: string; password: string }) =>
    | { ok: true; user: AuthUser; verifyLink: string }
    | { ok: false; error: string; upgradeEmail?: string };
  registerMember: (input: { name: string; email: string; phone: string; password?: string }) =>
    | { ok: true; user: AuthUser; verifyLink: string }
    | { ok: false; error: string };
  verifyToken: (token: string) => boolean;
  resendVerification: (userId: string) => { ok: true; link: string; cooldown: 0 } | { ok: false; cooldown: number };
  setTrialDays: (n: number) => void;
  extendTrial: (userId: string, days?: number) => void;
  setTrialExpiryDays: (userId: string, totalDays: number, note?: string) => void;
  setTrialExpiryDate: (userId: string, date: Date, note?: string) => void;
  adjustTrialDays: (userId: string, delta: number, note?: string) => void;
  forceExpireTrial: (userId: string, note?: string) => void;
  forceConvert: (userId: string) => void;
  adminNotes: Record<string, { ts: number; text: string; adminId: string | null }[]>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreShape>(() => emptyStore());
  const [loginOpen, setLoginOpen] = useState(false);
  const [verifyModal, setVerifyModal] = useState<AuthCtx["verifyModal"]>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const user = useMemo(
    () => store.users.find((u) => u.id === store.currentUserId) ?? null,
    [store.users, store.currentUserId],
  );

  function mkToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function mkLink(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/verify?token=${token}`;
  }

  const ctx: AuthCtx = {
    user,
    users: store.users,
    trialDays: store.trialDays,
    isAdmin: user?.role === "admin",
    loginOpen,
    verifyModal,
    openLogin: () => setLoginOpen(true),
    closeLogin: () => setLoginOpen(false),
    showVerify: (v) => setVerifyModal(v),
    closeVerify: () => setVerifyModal(null),
    login: (email, password) => {
      const found = store.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (!found) return { ok: false, error: "Invalid email or password / 帳號或密碼錯誤" };
      setStore((s) => ({ ...s, currentUserId: found.id }));
      setLoginOpen(false);
      return { ok: true, user: found };
    },
    logout: () => setStore((s) => ({ ...s, currentUserId: null })),
    registerTrial: (input) => {
      const emailLc = input.email.toLowerCase();
      const existing = store.users.find(
        (u) => u.email.toLowerCase() === emailLc || u.phone === input.phone,
      );
      if (existing) {
        if (existing.role === "trial" && (existing.trialBlocked || isTrialExpired(existing))) {
          return {
            ok: false,
            error:
              "This email/phone already used a trial that expired. Please upgrade to full member. / 此帳號的體驗已到期，請升級為正式社員。",
            upgradeEmail: existing.email,
          };
        }
        return {
          ok: false,
          error:
            "This email/phone is already registered. Please log in or upgrade your account. / 此 Email 或手機已註冊，請登入或升級帳號。",
        };
      }
      const id = "u_" + mkToken();
      const token = mkToken();
      const newUser: AuthUser = {
        id,
        email: input.email,
        phone: input.phone,
        name: input.name,
        password: input.password,
        role: "trial",
        verified: false,
        createdAt: Date.now(),
        trialStart: Date.now(),
        trialDays: store.trialDays,
      };
      const link = mkLink(token);
      setStore((s) => ({
        ...s,
        users: [...s.users, newUser],
        currentUserId: id,
        pendingVerifications: { ...s.pendingVerifications, [token]: id },
        lastResend: { ...s.lastResend, [id]: Date.now() },
      }));
      return { ok: true, user: newUser, verifyLink: link };
    },
    registerMember: (input) => {
      const emailLc = input.email.toLowerCase();
      const existing = store.users.find(
        (u) => u.email.toLowerCase() === emailLc || u.phone === input.phone,
      );
      if (existing) {
        return {
          ok: false,
          error:
            "This email/phone is already registered. Please log in. / 此 Email 或手機已註冊，請直接登入。",
        };
      }
      const id = "u_" + mkToken();
      const token = mkToken();
      const newUser: AuthUser = {
        id,
        email: input.email,
        phone: input.phone,
        name: input.name,
        password: input.password || "changeme",
        role: "member",
        verified: false,
        createdAt: Date.now(),
      };
      const link = mkLink(token);
      setStore((s) => ({
        ...s,
        users: [...s.users, newUser],
        currentUserId: id,
        pendingVerifications: { ...s.pendingVerifications, [token]: id },
        lastResend: { ...s.lastResend, [id]: Date.now() },
      }));
      return { ok: true, user: newUser, verifyLink: link };
    },
    verifyToken: (token) => {
      const userId = store.pendingVerifications[token];
      if (!userId) return false;
      setStore((s) => {
        const rest = { ...s.pendingVerifications };
        delete rest[token];
        return {
          ...s,
          users: s.users.map((u) => (u.id === userId ? { ...u, verified: true } : u)),
          pendingVerifications: rest,
        };
      });
      return true;
    },
    resendVerification: (userId) => {
      const last = store.lastResend[userId] ?? 0;
      const elapsed = (Date.now() - last) / 1000;
      if (elapsed < 60) return { ok: false, cooldown: Math.ceil(60 - elapsed) };
      const token = mkToken();
      const link = mkLink(token);
      setStore((s) => ({
        ...s,
        pendingVerifications: { ...s.pendingVerifications, [token]: userId },
        lastResend: { ...s.lastResend, [userId]: Date.now() },
      }));
      return { ok: true, link, cooldown: 0 };
    },
    setTrialDays: (n) => setStore((s) => ({ ...s, trialDays: Math.max(1, Math.round(n)) })),
    extendTrial: (userId, days = 7) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId && u.role === "trial"
            ? { ...u, trialDays: (u.trialDays ?? 30) + days, trialBlocked: false }
            : u,
        ),
      })),
    setTrialExpiryDays: (userId, totalDays, note) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId && u.role === "trial"
            ? {
                ...u,
                trialStart: u.trialStart ?? Date.now(),
                trialDays: Math.max(0, Math.round(totalDays)),
                trialBlocked: totalDays <= 0,
              }
            : u,
        ),
        adminNotes: note
          ? {
              ...s.adminNotes,
              [userId]: [
                ...(s.adminNotes[userId] ?? []),
                { ts: Date.now(), text: note, adminId: s.currentUserId },
              ],
            }
          : s.adminNotes,
      })),
    setTrialExpiryDate: (userId, date, note) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) => {
          if (u.id !== userId || u.role !== "trial") return u;
          const start = u.trialStart ?? Date.now();
          const daysFromStart = Math.max(0, Math.round((date.getTime() - start) / DAY_MS));
          return { ...u, trialDays: daysFromStart, trialBlocked: date.getTime() <= Date.now() };
        }),
        adminNotes: note
          ? {
              ...s.adminNotes,
              [userId]: [
                ...(s.adminNotes[userId] ?? []),
                { ts: Date.now(), text: note, adminId: s.currentUserId },
              ],
            }
          : s.adminNotes,
      })),
    adjustTrialDays: (userId, delta, note) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId && u.role === "trial"
            ? {
                ...u,
                trialDays: Math.max(0, (u.trialDays ?? 30) + delta),
                trialBlocked: (u.trialDays ?? 30) + delta <= 0,
              }
            : u,
        ),
        adminNotes: note
          ? {
              ...s.adminNotes,
              [userId]: [
                ...(s.adminNotes[userId] ?? []),
                { ts: Date.now(), text: note, adminId: s.currentUserId },
              ],
            }
          : s.adminNotes,
      })),
    forceExpireTrial: (userId, note) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId && u.role === "trial"
            ? { ...u, trialDays: 0, trialBlocked: true }
            : u,
        ),
        adminNotes: note
          ? {
              ...s.adminNotes,
              [userId]: [
                ...(s.adminNotes[userId] ?? []),
                { ts: Date.now(), text: note, adminId: s.currentUserId },
              ],
            }
          : s.adminNotes,
      })),
    adminNotes: store.adminNotes,
    forceConvert: (userId) =>
      setStore((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId
            ? { ...u, role: "member", convertedToMember: true, verified: true, trialBlocked: false }
            : u,
        ),
      })),
  };

  // Block-out: when trial expires, mark trialBlocked so re-signup redirects to upgrade
  useEffect(() => {
    if (!user || user.role !== "trial") return;
    if (isTrialExpired(user) && !user.trialBlocked) {
      setStore((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === user.id ? { ...u, trialBlocked: true } : u)),
      }));
    }
  }, [user]);

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
