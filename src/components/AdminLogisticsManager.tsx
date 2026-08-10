import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode } from "lucide-react";

export function AdminLogisticsManager() {
  // --- QR Code 核銷輸入框狀態 ---
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // --- 訂單與物流狀態 ---
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 🔔 寫入 Supabase 通知表 Helper 函式
  async function sendNotification(orderId: string, statusText: string) {
    try {
      await (supabase as any)
        .from("notifications")
        .insert({
          title: `訂單 #${orderId} 狀態更新`,
          message: `您的訂單狀態已更新為：【${statusText}】，請隨時確認！`,
        });
      console.log(`Notification sent for order #${orderId}`);
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
        total_amount: item.amount || 0,
        delivery_method: item.deliveryMethod || "合作社門市自取",
        created_at: item.createdAt || new Date().toISOString(),
        logistics: [{
          id: item.pickupCode || `COOP-PICKUP:${item.orderId || item.id}:${Date.now()}`,
          status: item.status === "已取消" ? "cancelled" : item.status === "可取貨 / 已完成" ? "completed" : "preparing",
          recipient_name: item.memberId || "Demo 測試社員",
          temp_layer: item.items?.some((line: any) => line.tempType === "cold") ? "frozen" : "normal",
          delivery_address: item.selectedStore ? `${item.selectedStoreType || "門市"} | ${item.selectedStore}` : null,
          store_code_711: item.selectedStore || null,
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
          logistics ( id, status, recipient_name, temp_layer, delivery_address, store_code_711 ),
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
      const localOrdersRaw = localStorage.getItem("tsm_orders_v1");
      const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
      setOrders(localOrders.map((item: any) => ({
        id: item.dbOrderId || item.orderId || item.id,
        member_id: item.memberId || "F0001",
        total_amount: item.amount || 0,
        delivery_method: item.deliveryMethod || "合作社門市自取",
        created_at: item.createdAt || new Date().toISOString(),
        logistics: [{
          id: item.pickupCode || `COOP-PICKUP:${item.orderId || item.id}:${Date.now()}`,
          status: item.status === "已取消" ? "cancelled" : item.status === "可取貨 / 已完成" ? "completed" : "preparing",
          recipient_name: item.memberId || "Demo 測試社員",
          temp_layer: item.items?.some((line: any) => line.tempType === "cold") ? "frozen" : "normal",
          delivery_address: item.selectedStore ? `${item.selectedStoreType || "門市"} | ${item.selectedStore}` : null,
          store_code_711: item.selectedStore || null,
        }],
        payments: [{
          invoice_number: item.orderId || item.id,
          payment_method: item.paymentMethod || "ECPAY",
          status: "paid",
        }],
      })));
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
        shipped: "🚚 廠商已出貨",
        arrived: "🏪 已達門市/待自取",
        completed: "✅ 已完成取貨",
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

  // 📷 現場幹部 QR Code 核銷處理
  const handleQRCodeVerify = async () => {
    const raw = pickupCodeInput.trim();
    if (!raw) return;

    if (raw.startsWith("COOP-PICKUP:")) {
      const parts = raw.split(":");
      const targetOrderId = parts[1];

      const targetOrder = orders.find((o) => String(o.id) === String(targetOrderId));
      if (targetOrder?.logistics?.[0]?.id) {
        await updateStatus(targetOrder.logistics[0].id, "completed", String(targetOrderId));
        alert(`✅ 核銷成功！訂單 #${targetOrderId} 狀態已更新為「已完成取貨」，並已向顧客推播通知。`);
      } else {
        alert(`⚠️ 已解析訂單編號 #${targetOrderId}，已重新載入最新列表中。`);
        fetchOrders();
      }
      setPickupCodeInput("");
    } else {
      alert("❌ 無效的取貨條碼格式！請確認格式是否為 COOP-PICKUP:訂單編號:時間戳");
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
      String(o.logistics?.[0]?.store_code_711 ?? ""),
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
        {/* 📷 現場幹部一鍵 QR Code 核銷面板 */}
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
              placeholder="搜尋訂單 / 會員 ID / 顧客姓名"
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

        <div className="divide-y border rounded-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground text-center">目前尚無符合搜尋條件的訂單資料。</p>
          ) : (
            filteredOrders.map((o) => (
              <div key={o.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 text-xs gap-2">
                <div>
                  <p className="font-mono font-bold text-primary">訂單編號 #{o.payments?.[0]?.invoice_number || o.id}</p>
                  <p className="text-muted-foreground mt-0.5">
                    會員 ID：{o.member_id || "F0001"} | 物流：{o.delivery_method} | 門市：{o.logistics?.[0]?.store_code_711 || "未選擇"} | 收件人：{o.logistics?.[0]?.recipient_name || "張社員"}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="font-mono font-extrabold text-sm">NT${o.total_amount}</span>
                  <select
                    value={o.logistics?.[0]?.status || "preparing"}
                    onChange={(e) => updateStatus(o.logistics?.[0]?.id, e.target.value, String(o.id))}
                    className="rounded border border-border px-2.5 py-1.5 bg-stone-50 font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="preparing">📦 備貨中</option>
                    <option value="shipped">🚚 廠商已出貨</option>
                    <option value="arrived">🏪 已達門市/待自取</option>
                    <option value="completed">✅ 已完成取貨</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}