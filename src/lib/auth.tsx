import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "member" | "trial" | "board" | "auditor";

export type AuthUser = {
  id: string;
  memberId?: string;
  email: string;
  phone: string;
  name: string;
  password?: string;
  role: Role;
  verified: boolean;
  createdAt: number;
  walletBalance?: number;
  trialStart?: number;
  trialDays?: number;
  trialBlocked?: boolean;
  convertedToMember?: boolean;
};

type AdminNote = { ts: number; text: string; adminId: string | null };

const DAY_MS = 24 * 60 * 60 * 1000;

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
  openLoginModal: boolean;
  setOpenLoginModal: (open: boolean) => void;
  verifyModal: { email: string; link: string; userId: string } | null;
  openLogin: () => void;
  closeLogin: () => void;
  showVerify: (v: { email: string; link: string; userId: string }) => void;
  closeVerify: () => void;
  login: (email: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  registerTrial: (input: { name: string; email: string; phone: string; password: string }) => Promise<
    | { ok: true; user: AuthUser; verifyLink: string }
    | { ok: false; error: string; upgradeEmail?: string }
  >;
  registerMember: (input: { name: string; email: string; phone: string; password?: string }) => Promise<
    | { ok: true; user: AuthUser; verifyLink: string }
    | { ok: false; error: string }
  >;
  signUpWithSupabase: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  verifyToken: (token: string) => boolean;
  resendVerification: (userId: string) => { ok: true; link: string; cooldown: 0 } | { ok: false; cooldown: number };
  setTrialDays: (n: number) => void;
  extendTrial: (userId: string, days?: number) => void;
  setTrialExpiryDays: (userId: string, totalDays: number, note?: string) => void;
  setTrialExpiryDate: (userId: string, date: Date, note?: string) => void;
  adjustTrialDays: (userId: string, delta: number, note?: string) => void;
  forceExpireTrial: (userId: string, note?: string) => void;
  topupWallet: (userId: string, amount: number, note?: string) => Promise<void>;
  forceConvert: (userId: string) => Promise<void>;
  adminNotes: Record<string, AdminNote[]>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [trialDays, setTrialDaysState] = useState(30);
  const [loginOpen, setLoginOpen] = useState(false);
  const [verifyModal, setVerifyModal] = useState<AuthCtx["verifyModal"]>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, AdminNote[]>>({});

  // 1. 從 Supabase 載入 User 與 Profile
  async function fetchProfile(userId: string, emailStr?: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data && !error) {
        const u: AuthUser = {
          id: data.id,
          memberId: data.member_id || "F0001",
          name: data.name || "合作社社員",
          email: data.email || emailStr || "",
          phone: data.phone || "",
          role: (data.role as Role) || "member",
          verified: true,
          createdAt: new Date(data.created_at).getTime(),
          walletBalance: Number(data.wallet_balance || 0),
        };
        setCurrentUser(u);
        setUsersList((prev) => {
          const filtered = prev.filter((item) => item.id !== u.id);
          return [...filtered, u];
        });
      } else {
        // 若尚未產生 Profile，提供降級 Mock 資料
        const fallback: AuthUser = {
          id: userId,
          memberId: "A0001",
          name: "Super Admin",
          email: emailStr || "admin@coop.tw",
          phone: "0900000000",
          role: "admin",
          verified: true,
          createdAt: Date.now(),
          walletBalance: 1280,
        };
        setCurrentUser(fallback);
      }
    } catch (e) {
      console.error("Fetch Supabase profile error:", e);
    }
  }

  // 2. 初始化與監聽 Auth 狀態
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        // 預設提供管理員存取身份（維持開發測試便利）
        const defaultAdmin: AuthUser = {
          id: "u_admin",
          memberId: "A0001",
          email: "admin@coop.tw",
          phone: "0900000001",
          name: "Super Admin",
          role: "admin",
          verified: true,
          createdAt: Date.now(),
          walletBalance: 1280,
        };
        setCurrentUser(defaultAdmin);
        setUsersList([defaultAdmin]);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Supabase 帳密登入邏輯
  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 本地測試帳號比對備案
      if (email.toLowerCase() === "admin@coop.tw" && password === "admin123") {
        const adminUser: AuthUser = {
          id: "u_admin",
          memberId: "A0001",
          email: "admin@coop.tw",
          phone: "0900000001",
          name: "Super Admin",
          role: "admin",
          verified: true,
          createdAt: Date.now(),
          walletBalance: 1280,
        };
        setCurrentUser(adminUser);
        setLoginOpen(false);
        return { ok: true as const, user: adminUser };
      }
      return { ok: false as const, error: "Invalid email or password / 帳號或密碼錯誤" };
    }

    if (data.user) {
      await fetchProfile(data.user.id, data.user.email);
      setLoginOpen(false);
      return { ok: true as const, user: currentUser! };
    }

    return { ok: false as const, error: "登入失敗" };
  }

  // Supabase Auth 方法適配
  async function loginWithSupabase(email: string, pass: string) {
    const res = await login(email, pass);
    if (!res.ok) return { error: res.error };
    return {};
  }

  async function signUpWithSupabase(email: string, pass: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user) await fetchProfile(data.user.id, data.user.email);
    return {};
  }

  // 4. 註冊體驗社員
  async function registerTrial(input: { name: string; email: string; phone: string; password: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, phone: input.phone },
      },
    });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    const userId = data.user?.id || "u_" + Date.now();
    const newUser: AuthUser = {
      id: userId,
      memberId: "E" + Math.floor(1000 + Math.random() * 9000),
      email: input.email,
      phone: input.phone,
      name: input.name,
      role: "trial",
      verified: true,
      createdAt: Date.now(),
      walletBalance: 0,
      trialStart: Date.now(),
      trialDays,
    };

    setCurrentUser(newUser);
    setUsersList((prev) => [...prev, newUser]);
    return { ok: true as const, user: newUser, verifyLink: `${window.location.origin}/verify?token=demo` };
  }

  // 5. 註冊正式社員
  async function registerMember(input: { name: string; email: string; phone: string; password?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password || "changeme123",
      options: {
        data: { name: input.name, phone: input.phone },
      },
    });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    const userId = data.user?.id || "u_" + Date.now();
    const newUser: AuthUser = {
      id: userId,
      memberId: "F" + Math.floor(1000 + Math.random() * 9000),
      email: input.email,
      phone: input.phone,
      name: input.name,
      role: "member",
      verified: true,
      createdAt: Date.now(),
      walletBalance: 0,
    };

    setCurrentUser(newUser);
    setUsersList((prev) => [...prev, newUser]);
    return { ok: true as const, user: newUser, verifyLink: `${window.location.origin}/verify?token=demo` };
  }

  // 6. 儲值金加值 (同步寫入 Supabase profiles)
  async function topupWallet(userId: string, amount: number, note?: string) {
    const target = usersList.find((u) => u.id === userId) || currentUser;
    if (!target) return;

    const newBalance = Math.max(0, (target.walletBalance ?? 0) + Math.max(0, amount));

    // 更新 Supabase
    try {
      await (supabase as any)
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);
    } catch (e) {
      console.warn("Update wallet in Supabase failed:", e);
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, walletBalance: newBalance } : u))
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, walletBalance: newBalance } : null));
    }

    if (note) {
      setAdminNotes((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] ?? []), { ts: Date.now(), text: note, adminId: currentUser?.id ?? null }],
      }));
    }
  }

  // 7. 強制轉換身份為正式社員
  async function forceConvert(userId: string) {
    try {
      await (supabase as any)
        .from("profiles")
        .update({ role: "member" })
        .eq("id", userId);
    } catch (e) {
      console.warn("Convert role in Supabase failed:", e);
    }

    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: "member", convertedToMember: true, verified: true, trialBlocked: false }
          : u
      )
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: "member" } : null));
    }
  }

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "board";

  const ctxValue: AuthCtx = {
    user: currentUser,
    users: usersList,
    trialDays,
    isAdmin,
    loginOpen,
    openLoginModal: loginOpen,
    setOpenLoginModal: setLoginOpen,
    verifyModal,
    openLogin: () => setLoginOpen(true),
    closeLogin: () => setLoginOpen(false),
    showVerify: (v) => setVerifyModal(v),
    closeVerify: () => setVerifyModal(null),
    login,
    loginWithSupabase,
    logout: async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
    },
    registerTrial,
    registerMember,
    signUpWithSupabase,
    verifyToken: () => true,
    resendVerification: (userId) => ({ ok: true, link: `${window.location.origin}/verify`, cooldown: 0 }),
    setTrialDays: (n) => setTrialDaysState(Math.max(1, Math.round(n))),
    extendTrial: (userId, days = 7) => {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, trialDays: (u.trialDays ?? 30) + days } : u))
      );
    },
    setTrialExpiryDays: (userId, totalDays, note) => {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, trialDays: Math.max(0, Math.round(totalDays)) } : u))
      );
    },
    setTrialExpiryDate: (userId, date, note) => {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, trialDays: Math.max(0, Math.round((date.getTime() - Date.now()) / DAY_MS)) } : u))
      );
    },
    adjustTrialDays: (userId, delta, note) => {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, trialDays: Math.max(0, (u.trialDays ?? 30) + delta) } : u))
      );
    },
    forceExpireTrial: (userId, note) => {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, trialDays: 0, trialBlocked: true } : u))
      );
    },
    topupWallet,
    forceConvert,
    adminNotes,
  };

  return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}