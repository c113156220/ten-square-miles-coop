import { useEffect, useState } from "react";
import { useAuth, isTrialExpired, trialRemainingDays } from "@/lib/auth";
import { Link, useRouter } from "@tanstack/react-router";

export function LoginModal() {
  const { loginOpen, closeLogin, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loginOpen) {
      setError(null);
      setEmail("");
      setPassword("");
    }
  }, [loginOpen]);

  if (!loginOpen) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = login(email, password);
    if (!r.ok) setError(r.error);
  }

  function quick(e: string, p: string) {
    const r = login(e, p);
    if (!r.ok) setError(r.error);
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Sign in · 登入</h2>
            <p className="text-xs text-muted-foreground">Members, admins & trial accounts</p>
          </div>
          <button onClick={closeLogin} className="rounded-sm px-2 text-xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">Demo accounts · 測試帳號</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => quick("member@coop.tw", "password123")}
              className="rounded-md border border-border bg-white px-3 py-2 text-left transition hover:border-primary"
            >
              👤 <b>Member</b> — member@coop.tw / password123
            </button>
            <button
              onClick={() => quick("admin@coop.tw", "admin123")}
              className="rounded-md border border-border bg-white px-3 py-2 text-left transition hover:border-primary"
            >
              🛡️ <b>Super Admin</b> — admin@coop.tw / admin123
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          {error && <p className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          <button className="w-full rounded-sm bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
            Sign in
          </button>
          <p className="text-center text-xs text-muted-foreground">
            No account?{" "}
            <Link to="/onboarding" onClick={closeLogin} className="font-bold text-primary hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function VerifyEmailModal() {
  const { verifyModal, closeVerify, verifyToken, resendVerification } = useAuth();
  const [cooldown, setCooldown] = useState(60);
  const [verified, setVerified] = useState(false);
  const [currentLink, setCurrentLink] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    setVerified(false);
    setCurrentLink(verifyModal?.link ?? null);
    setCooldown(60);
    setNotice(null);
    setExpiresAt(Date.now() + 5 * 60 * 1000);
  }, [verifyModal]);

  useEffect(() => {
    if (!verifyModal) return;
    const t = setInterval(() => {
      setNow(Date.now());
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [verifyModal]);

  if (!verifyModal) return null;

  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const expired = secondsLeft <= 0;
  const otpLabel = `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}`;
  const token = currentLink ? new URL(currentLink).searchParams.get("token") ?? "" : "";

  function doVerify() {
    if (!token) return;
    if (expired) {
      setNotice("⚠️ Verification link expired. Please resend. / 驗證連結已過期，請重新寄送。");
      return;
    }
    if (verifyToken(token)) setVerified(true);
  }

  function doResend() {
    const r = resendVerification(verifyModal!.userId);
    if (r.ok) {
      setCurrentLink(r.link);
      setCooldown(60);
      setExpiresAt(Date.now() + 5 * 60 * 1000);
      setNotice("New verification email sent (dev inbox updated). / 已重新寄出驗證信。");
    } else {
      setNotice(`Please wait ${r.cooldown}s before resending. / 請稍候 ${r.cooldown} 秒再試。`);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">📧 Verify your email · 驗證信箱</h2>
            <p className="text-xs text-muted-foreground">Sent to <b>{verifyModal.email}</b></p>
          </div>
          <button onClick={closeVerify} className="rounded-sm px-2 text-xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            {expired ? "❌ Link expired / 已過期" : "⏱ Link valid for / 連結有效"}
          </span>
          <span className={`font-mono font-bold ${expired ? "text-red-600" : secondsLeft <= 60 ? "text-accent" : "text-primary"}`}>
            {otpLabel}
          </span>
        </div>

        <div className="mb-3 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-3 text-xs">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-accent">
            Dev Test Inbox · 開發模式測試信箱
          </p>
          <p className="mb-2 text-muted-foreground">
            Mock environment: click the simulated link below to verify. In production this is delivered via Supabase Auth Email / Resend.
          </p>
          <div className={`break-all rounded border border-border bg-white p-2 font-mono text-[11px] ${expired ? "opacity-40 line-through" : ""}`}>
            {currentLink}
          </div>
        </div>

        {verified ? (
          <div className="rounded border border-primary bg-primary/10 p-3 text-sm text-primary">
            ✓ Email verified! You're all set. / 信箱驗證完成！
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={doVerify}
              disabled={expired}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Click verification link / 點擊驗證連結
            </button>
            <button
              onClick={doResend}
              disabled={cooldown > 0}
              className="rounded-sm border border-border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email / 重新發送"}
            </button>
          </div>
        )}
        {notice && <p className="mt-3 text-xs text-muted-foreground">{notice}</p>}
      </div>
    </div>
  );
}

export function ExpiredTrialOverlay() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user || user.role !== "trial") return null;
  if (!isTrialExpired(user)) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 text-center shadow-elevated">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-accent/15 text-3xl">⏱️</div>
        <h2 className="text-2xl font-bold">Your trial has expired</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          您的 {user.trialDays ?? 30} 天體驗已到期！立即升級為正式社員，解鎖永久瀏覽、共同購買價格與年度結餘分紅。
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => {
              router.navigate({ to: "/onboarding" });
            }}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            Upgrade to Member · 升級為正式社員
          </button>
          <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function TrialBadge() {
  const { user } = useAuth();
  if (!user || user.role !== "trial") return null;
  const days = trialRemainingDays(user);
  const warn = days <= 3;
  return (
    <span
      className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest md:inline-flex ${
        warn ? "border-accent/60 bg-accent/10 text-accent" : "border-border bg-white/70 text-muted-foreground"
      }`}
      title="Guest trial countdown"
    >
      ⏱️ Trial: {days}d {warn ? "· expiring" : "left"}
    </span>
  );
}
