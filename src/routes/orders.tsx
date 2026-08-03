import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { generatePickupQRCodeValue } from "@/lib/logistics-utils";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, X } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

type OrderStatus = "packed" | "ready" | "cancelled";

type OrderItem = {
  id: string;
  name: string;
  amount: number;
  status: OrderStatus;
  refund: number;
  canCancel: boolean;
};

// 預設 Demo 假資料
const MOCK_ORDERS: OrderItem[] = [
  { id: "O-2401", name: "放牧土雞蛋 12入", amount: 180, status: "packed", refund: 180, canCancel: true },
  { id: "O-2402", name: "旬味蔬菜箱", amount: 480, status: "ready", refund: 480, canCancel: false },
  { id: "O-2403", name: "柴燒手工醬油", amount: 320, status: "packed", refund: 320, canCancel: true },
];

function OrdersPage() {
  const [walletBalance, setWalletBalance] = useState(1280);
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);

  // 控制 QR Code Modal 的狀態
  const [activeQrCode, setActiveQrCode] = useState<{ orderId: string; codeValue: string } | null>(null);

  // 🔄 進入頁面時從 Supabase 抓取最新訂單
  useEffect(() => {
    async function fetchDatabaseOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id, total_amount, delivery_method, created_at,
            logistics ( status )
          `)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbOrders: OrderItem[] = data.map((item) => {
            const currentStatus = item.logistics?.[0]?.status;
            let orderStatus: OrderStatus = "packed";

            if (currentStatus === "completed") {
              orderStatus = "ready";
            } else if (currentStatus === "cancelled") {
              orderStatus = "cancelled";
            }

            return {
              id: item.id,
              name: `社員購物訂單 (${item.delivery_method || "門市自提"})`,
              amount: item.total_amount || 0,
              status: orderStatus,
              refund: item.total_amount || 0,
              canCancel: currentStatus !== "completed" && currentStatus !== "cancelled",
            };
          });

          setOrders([...dbOrders, ...MOCK_ORDERS]);
        }
      } catch (e) {
        console.error("Fetch DB orders error:", e);
      }
    }

    fetchDatabaseOrders();
  }, []);

  function cancelOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !order.canCancel) return order;
        return { ...order, status: "cancelled", canCancel: false };
      }),
    );

    setWalletBalance((prev) => prev + (orders.find((item) => item.id === orderId)?.refund ?? 0));
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Orders"
        title="訂單紀錄・取消與退款"
        subtitle="點一下取消，退款會直接回到會員儲值金"
        body="這個流程把實務上的退貨／取消流程以可互動的 demo 呈現，方便講解退款機制。"
      />

      <section className="mb-8 rounded-md border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Wallet balance</p>
            <h2 className="mt-1 text-2xl font-extrabold">可用儲值金</h2>
          </div>
          <p className="font-mono text-3xl font-extrabold text-primary">NT${walletBalance.toLocaleString()}</p>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-extrabold">近期訂單</h2>
        </div>
        <div className="divide-y divide-border">
          {orders.map((order) => {
            const qrValue = generatePickupQRCodeValue(order.id);
            return (
              <div key={order.id} className="p-5 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{order.name}</p>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">{order.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      order.status === "cancelled" 
                        ? "bg-stone-200 text-muted-foreground" 
                        : order.status === "ready" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-accent/10 text-accent"
                    }`}>
                      {order.status === "cancelled" ? "已取消" : order.status === "ready" ? "可取貨 / 已完成" : "已打包"}
                    </span>
                    <span className="font-mono text-sm font-bold">NT${order.amount.toLocaleString()}</span>
                    {order.status !== "cancelled" ? (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={!order.canCancel}
                        className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 transition-all"
                      >
                        {order.canCancel ? "取消訂單並退款" : "不可取消"}
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-primary">退款已返還</span>
                    )}
                  </div>
                </div>

                {/* 📱 點擊後跳出 QR Code 圖片的顯示框 */}
                {order.status !== "cancelled" && (
                  <div className="p-2.5 bg-slate-50/80 border rounded-xl flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">📱 現場自提取貨驗證碼：</span>
                    <button
                      type="button"
                      onClick={() => setActiveQrCode({ orderId: order.id, codeValue: qrValue })}
                      className="group flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <QrCode className="size-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
                      <span>{qrValue}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1 font-sans font-normal">
                        點擊顯示 QR Code
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 🔍 QR Code 大圖彈窗 Modal */}
      {activeQrCode && (
        <div 
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setActiveQrCode(null)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="text-left">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Pickup QR Code</p>
                <h3 className="text-base font-extrabold text-foreground">訂單 {activeQrCode.orderId} 取貨碼</h3>
              </div>
              <button 
                onClick={() => setActiveQrCode(null)}
                className="rounded-full border p-1.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* QR Code 圖片 (自動繪製) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <img
                src={`https://quickchart.io/qr?text=${encodeURIComponent(activeQrCode.codeValue)}&size=240&margin=1`}
                alt="取貨 QR Code"
                className="w-56 h-56 object-contain rounded-xl bg-white p-2 shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200/60 select-all">
                {activeQrCode.codeValue}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">請向現場合作社幹部出示此 QR Code 或字串進行核銷</p>
            </div>

            <button
              onClick={() => setActiveQrCode(null)}
              className="w-full py-2.5 rounded-full bg-foreground text-background font-bold text-xs hover:brightness-125 transition-all"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </SiteShell>
  );
}