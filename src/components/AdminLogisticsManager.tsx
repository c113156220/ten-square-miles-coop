import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, MapPin, User, Phone } from "lucide-react";

export function AdminLogisticsManager() {
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  async function sendNotification(orderId: string, statusText: string) {
    try {
      await (supabase as any)
        .from("notifications")
        .insert({
          title: `訂單 #${orderId} 狀態更新`,
          message: `您的訂單狀態已更新為：【${statusText}】，請隨時確認！`,
        });
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const localOrdersRaw = localStorage.getItem("tsm_orders_v1");
      const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
      const fallbackOrders = localOrders.map((item: any) => ({
        id: item.dbOrderId || item.orderId || item.id,
        member_id: item.memberId || "F0001",
        member_name: item.memberName || "張社員",
        member_phone: item.memberPhone || "0900000000",
        total_amount: item.amount || 0,
        delivery_method: item.deliveryMethod || "合作社門市自取",
        created_at: item.createdAt || new Date().toISOString(),
        logistics: [{
          id: item.pickupCode || `COOP-PICKUP:${item.orderId || item.id}:${Date.now()}`,
          status: item.status === "已取消" ? "cancelled" : item.status === "可取貨 / 已完成" ? "completed" : "preparing",
          recipient_name: item.recipientName || item.memberId || "Demo 測試社員",
          recipient_phone: item.recipientPhone || "0900000000",
          delivery_address: item.deliveryAddress || "合作社門市自取",
        }],
        payments: [{
          invoice_number: item.orderId || item.id,
          payment_method: item.paymentMethod || "ECPAY",
          status: "paid",
        }],
      }));

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, member_id, total_amount, delivery_method, created_at,
          logistics ( id, status, recipient_name, recipient_phone, delivery_address ),
          payments ( invoice_number, payment_method, status )
        `)
        .order("created_at", { ascending: false });

      if (error || !data) {
        setOrders(fallbackOrders);
        return;
      }

      setOrders([...fallbackOrders, ...data]);
    } catch (e) {
      console.error("Fetch orders error:", e);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function updateStatus(logisticsId: string, newStatus: string, orderId?: string) {
    if (!logisticsId) return;
    try {
      await supabase.from("logistics").update({ status: newStatus }).eq("id", logisticsId);
      
      const statusTextMap: Record<string, string> = {
        preparing: "📦 備貨中",
        shipped: "🚚 廠商已出貨 / 宅配寄出",
        arrived: "🏪 已達門市/待自取",
        completed: "✅ 已完成取貨/簽收",
        cancelled: "已取消",
      };

      const displayText = statusTextMap[newStatus] || newStatus;

      if (orderId) {
        await sendNotification(orderId, displayText);
      }

      fetchOrders();
    } catch (e) {
      console.error("Update status error:", e);
    }
  }

  const handleQRCodeVerify = async () => {
    const raw = pickupCodeInput.trim();
    if (!raw) return;

    if (raw.startsWith("COOP-PICKUP:")) {
      const parts = raw.split(":");
      const targetOrderId = parts[1];

      const targetOrder = orders.find((o) => String(o.id) === String(targetOrderId));
      if (targetOrder?.logistics?.[0]?.id) {
        await updateStatus(targetOrder.logistics[0].id, "completed", String(targetOrderId));
        alert(`✅ 核銷成功！訂單 #${targetOrderId} 狀態已更新為「已完成取貨」。`);
      } else {
        fetchOrders();
      }
      setPickupCodeInput("");
    } else {
      alert("❌ 無效的取貨條碼格式！");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return [
      String(o.id),
      String(o.member_id ?? ""),
      String(o.payments?.[0]?.invoice_number ?? ""),
      String(o.logistics?.[0]?.recipient_name ?? ""),
      String(o.logistics?.[0]?.recipient_phone ?? ""),
      String(o.delivery_method ?? ""),
      String(o.logistics?.[0]?.delivery_address ?? "")
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
        {/* QR Code 自提核銷面板 */}
        <div className="p-4 border rounded-2xl bg-emerald-50/60 border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="size-4 text-emerald-700" />
              <h4 className="font-bold text-sm text-emerald-900">現場幹部 QR Code 自提核銷面板</h4>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
              現場自提專用
            </span>
          </div>
          <div className="flex gap-2">
            <input
              value={pickupCodeInput}
              onChange={(e) => setPickupCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQRCodeVerify()}
              placeholder="請掃描顧客手機的 QR Code 或貼上取貨碼 (例如：COOP-PICKUP:12345:1690000000)..."
              className="flex-1 text-xs border border-emerald-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <button
              type="button"
              onClick={handleQRCodeVerify}
              className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
            >
              完成核銷
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b pb-3 pt-2 gap-3">
          <h3 className="text-lg font-bold">🛠️ 顧客訂單與出貨狀況控制面板</h3>
          <div className="flex items-center gap-2">
            <input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="搜尋訂單 / 會員 ID / 收件人 / 地址"
              className="w-72 rounded border border-border px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={fetchOrders}
              className="rounded border px-3 py-1 text-xs font-semibold hover:bg-stone-100 transition-all"
            >
              {loadingOrders ? "載入中..." : "重新整理"}
            </button>
          </div>
        </div>

{/* 訂單與收件人詳細清單 */}
        <div className="divide-y border rounded-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground text-center">目前尚無符合搜尋條件的訂單資料。</p>
          ) : (
            filteredOrders.map((o) => (
              <div key={o.id} className="p-4 text-xs space-y-2 hover:bg-slate-50/80 transition-all">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary text-sm">
                      訂單編號 #{o.payments?.[0]?.invoice_number || o.id}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">
                      {o.delivery_method}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="font-mono font-extrabold text-sm text-slate-800">NT${o.total_amount}</span>
                    <select
                      value={o.logistics?.[0]?.status || "preparing"}
                      onChange={(e) => updateStatus(o.logistics?.[0]?.id, e.target.value, String(o.id))}
                      className="rounded border border-border px-2.5 py-1.5 bg-stone-50 font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="preparing">{"📦 備貨中"}</option>
                      <option value="shipped">{"🚚 廠商已出貨 / 宅配寄出"}</option>
                      <option value="arrived">{"🏪 已達門市/待自取"}</option>
                      <option value="completed">{"✅ 已完成取貨/簽收"}</option>
                    </select>
                  </div>
                </div>

                {/* 📋 下單會員資料 vs 📦 收件者資料對照 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-slate-600">
                  {/* 下單會員資料 */}
                  <div className="bg-slate-100/70 p-3 rounded-xl space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="size-3.5 text-primary" /> 下單會員資料
                    </p>
                    <p>會員編號：<span className="font-mono font-bold text-slate-700">{o.member_id || "F0001"}</span></p>
                    <p>會員姓名：<span className="font-bold text-slate-700">{o.member_name || "張社員"}</span></p>
                    <p>會員電話：<span className="font-mono text-slate-700">{o.member_phone || "0900000000"}</span></p>
                  </div>

                  {/* 收件者資料 */}
                  <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <MapPin className="size-3.5 text-emerald-700" /> 收件者物流資料 ({o.delivery_method})
                    </p>
                    <p>收件人姓名：<span className="font-bold text-emerald-950">{o.logistics?.[0]?.recipient_name || "Demo 測試社員"}</span></p>
                    <p>收件人電話：<span className="font-mono text-emerald-950">{o.logistics?.[0]?.recipient_phone || "0900000000"}</span></p>
                    <p>配送住址：<span className="font-semibold text-emerald-950">{o.logistics?.[0]?.delivery_address || "合作社門市自取"}</span></p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}