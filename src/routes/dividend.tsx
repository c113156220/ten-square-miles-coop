import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dividend")({
  component: DividendPage,
});

type Transaction = {
  id: string;
  amount: number;
  type: "topup" | "purchase" | "refund" | "dividend";
  description: string;
  created_at: string;
};

// 預設 Demo 交易紀錄
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", amount: 2000, type: "topup", description: "線上綠界儲值", created_at: "2026-08-01 10:30" },
  { id: "tx-2", amount: -480, type: "purchase", description: "購買 旬味蔬菜箱 (訂單 O-2402)", created_at: "2026-08-01 14:15" },
  { id: "tx-3", amount: -240, type: "purchase", description: "購買 放牧土雞蛋 (訂單 O-2401)", created_at: "2026-08-02 09:20" },
  { id: "tx-4", amount: 180, type: "dividend", description: "上一年度合作社結餘社員消費分紅", created_at: "2026-08-02 12:00" },
];

function DividendPage() {
  // 分紅試算狀態
  const [monthlySpend, setMonthlySpend] = useState<number>(3000);
  const [category, setCategory] = useState<string>("bento");

  // 儲值金歷史紀錄狀態
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // 動態計算分紅與節省金額
  const annualSpend = monthlySpend * 12;
  const estimatedDividend = Math.round(annualSpend * 0.06); // 預估 6% 回饋
  const estimatedSavings = Math.round(annualSpend * 0.05); // 預估節省 5%
  const rewardPoints = monthlySpend * 1.2;

  // 🔄 從 Supabase 抓取最新儲值金帳單明細
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data, error } = await supabase
          .from("wallet_transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbTxs: Transaction[] = data.map((t) => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type,
            description: t.description || "儲值金變動",
            created_at: new Date(t.created_at).toLocaleString(),
          }));

          setTransactions([...dbTxs, ...MOCK_TRANSACTIONS]);
        }
      } catch (e) {
        console.error("Fetch transactions error:", e);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="MEMBER CALCULATOR & WALLET"
        title="結餘分紅與儲值金帳單"
        subtitle="輸入你預估的每月消費金額，看看成為正式社員後每年可回饋多少結餘與儲值金紀錄"
        body="依據合作社法，合作社年度結餘於提撥公積金後，應依社員消費貢獻度分配消費分紅。"
      />

      <div className="space-y-8">
        {/* 1. 結餘分紅互動計算機 */}
        <section className="grid gap-6 rounded-3xl border border-border bg-white p-6 shadow-sm lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  每月預估消費 (NT$)
                </label>
                <span className="font-mono font-extrabold text-xl text-primary">
                  NT${monthlySpend.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                <span>NT$500</span>
                <span>NT$20,000</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                主要品項選擇
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "bento", label: "健康餐盒" },
                  { id: "vege", label: "生鮮蔬菜" },
                  { id: "grocery", label: "乾貨雜糧" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      category === item.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右側試算面板 */}
          <div className="rounded-2xl bg-emerald-700 p-6 text-white space-y-4 flex flex-col justify-between shadow-md">
            <div className="space-y-3 divide-y divide-emerald-600/60">
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-emerald-100">年度預估消費</span>
                <span className="font-mono text-lg font-bold">NT${annualSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs text-emerald-100 font-bold flex items-center gap-1">
                  <Sparkles className="size-3.5" /> 預估結餘回饋
                </span>
                <span className="font-mono text-2xl font-extrabold text-amber-300">
                  NT${estimatedDividend.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs text-emerald-100">預估稅務節省</span>
                <span className="font-mono text-lg font-bold">NT${estimatedSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs text-emerald-100">預估累積積分</span>
                <span className="font-mono text-lg font-bold">{rewardPoints.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 儲值金變動帳單歷史明細（全新整合區塊） */}
        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              <h2 className="text-lg font-extrabold">儲值金變動帳單明細</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">即時同步 Supabase 資料庫</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 divide-y divide-slate-100">
            {transactions.map((item) => {
              const isPositive = item.amount > 0;
              return (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`grid size-9 place-items-center rounded-2xl ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {isPositive ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.description}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{item.created_at}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-extrabold text-sm ${isPositive ? "text-emerald-600" : "text-slate-800"}`}>
                    {isPositive ? `+NT$${item.amount}` : `-NT$${Math.abs(item.amount)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}