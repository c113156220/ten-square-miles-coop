import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/member-center")({
  component: MemberCenterPage,
});

type ShareApplication = {
  id: string;
  shares: number;
  status: "review" | "approved";
  note: string;
};

function MemberCenterPage() {
  const { user, openLogin } = useAuth();
  const [applications] = useState<ShareApplication[]>([
    { id: "A-2201", shares: 2, status: "approved", note: "本季社股申購已核定" },
    { id: "A-2204", shares: 3, status: "review", note: "待補齊學生證影本" },
  ]);

  const ownedShares = user?.role === "member" ? 6 : 0;
  const shareLimit = 10;
  const remainingShares = Math.max(0, shareLimit - ownedShares);
  const walletBalance = 1280;

  if (!user) {
    return (
      <SiteShell>
        <PageHeader
          eyebrow="Member Center"
          title="登入後即可檢視社股資產與訂單紀錄"
          body="這個 demo 會把社股申購、訂單取消退款與儲值金流程串成一條完整會員路徑。"
        />
        <div className="rounded-md border border-border bg-white p-6 text-sm text-muted-foreground">
          <p className="mb-4">請先登入，才能看到共享資產與最近訂單。</p>
          <button
            onClick={openLogin}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            立即登入
          </button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Member Center"
        title="會員中心・社股與訂單管理"
        subtitle="掌握你的社股、儲值金與申購流程"
        body="以更貼近實務的方式呈現社員的資產狀態、申購上限與退款入口。"
      />

      <div className="mb-10 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-md border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Share Assets</p>
              <h2 className="mt-1 text-2xl font-extrabold">社股資產</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {ownedShares}/{shareLimit} 股
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded border border-border bg-stone-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">已持有</p>
              <p className="mt-2 font-mono text-2xl font-extrabold">{ownedShares}</p>
            </div>
            <div className="rounded border border-border bg-stone-50 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">可申購</p>
              <p className="mt-2 font-mono text-2xl font-extrabold">{remainingShares}</p>
            </div>
            <div className="rounded border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-primary">年度分紅權重</p>
              <p className="mt-2 font-mono text-2xl font-extrabold text-primary">{Math.round((ownedShares / shareLimit) * 100)}%</p>
            </div>
          </div>
          <div className="mt-6 rounded border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
            <p className="font-semibold">學生身份申購上限：每位社員最多 10 股。</p>
            <p className="mt-1">如有新增申購，系統會在審核通過後自動更新您的社股權重與年度分紅計算。</p>
          </div>
        </section>

        <section className="rounded-md border border-border bg-white p-6 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Wallet</p>
          <h2 className="mt-1 text-2xl font-extrabold">儲值金</h2>
          <p className="mt-4 font-mono text-4xl font-extrabold text-primary">NT${walletBalance.toLocaleString()}</p>
          <p className="mt-3 text-sm text-muted-foreground">取消訂單時，退款會直接回到此儲值金，供下一次共同購買使用。</p>
          <Link
            to="/orders"
            className="mt-5 inline-flex rounded-sm bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            查看訂單與退款
          </Link>
        </section>
      </div>

      <section className="rounded-md border border-border bg-white shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-extrabold">申購紀錄</h2>
          <p className="mt-1 text-sm text-muted-foreground">審核流程與文件狀態會同步顯示，方便你掌握下一步。</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {applications.map((item) => (
            <div key={item.id} className="rounded border border-border bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">申購 #{item.id}</p>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.status === "approved" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  {item.status === "approved" ? "已核准" : "審核中"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.note}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-mono">{item.shares} 股</span>
                <span className="font-mono text-muted-foreground">{item.status === "approved" ? "已加入分紅權重" : "待補件"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
