import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";

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

function OrdersPage() {
  const [walletBalance, setWalletBalance] = useState(1280);
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: "O-2401", name: "放牧土雞蛋 12入", amount: 180, status: "packed", refund: 180, canCancel: true },
    { id: "O-2402", name: "旬味蔬菜箱", amount: 480, status: "ready", refund: 480, canCancel: false },
    { id: "O-2403", name: "柴燒手工醬油", amount: 320, status: "packed", refund: 320, canCancel: true },
  ]);

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
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{order.name}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{order.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${order.status === "cancelled" ? "bg-stone-200 text-muted-foreground" : order.status === "ready" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  {order.status === "cancelled" ? "已取消" : order.status === "ready" ? "可取貨" : "已打包"}
                </span>
                <span className="font-mono text-sm">NT${order.amount.toLocaleString()}</span>
                {order.status !== "cancelled" ? (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={!order.canCancel}
                    className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40"
                  >
                    {order.canCancel ? "取消訂單並退款" : "不可取消"}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-primary">退款已返還</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
