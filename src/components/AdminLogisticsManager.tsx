import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  listSupportThreads, 
  addAdminReply, 
  resolveSupportThread, 
  type SupportThread 
} from "@/lib/support-chat";
import { Bell, CheckCheck, MessageSquare, Package, QrCode } from "lucide-react";

type NotificationItem = {
  id: string;
  type: "support" | "order";
  title: string;
  body: string;
  threadId: string;
  createdAt: number;
  read: boolean;
};

export function AdminLogisticsManager() {
  const [activeTab, setActiveTab] = useState<"orders" | "support">("orders");

  // --- 通知中心狀態 ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // --- QR Code 核銷輸入框狀態 ---
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // --- 1. 訂單與物流狀態 ---
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
      
      // 狀態文字對照
      const statusTextMap: Record<string, string> = {
        preparing: "📦 備貨中",
        shipped: "🚚 廠商已出貨",
        arrived: "🏪 已達門市/待自取",
        completed: "✅ 已完成取貨",
        cancelled: "已取消",
      };

      const displayText = statusTextMap[newStatus] || newStatus;

      // 🟢 同步寫入通知至 Supabase
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

      // 比對找到該筆訂單與物流 ID
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

  // --- 2. 客服工單與真人回覆狀態 ---
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 核心：同步更新對話清單並檢查新訊息生成通知
  const syncThreadsAndNotifications = () => {
    try {
      const latestThreads = listSupportThreads() || [];
      setThreads(latestThreads);

      // 掃描最新訊息，產生未讀通知
      const newNotifs: NotificationItem[] = [];
      latestThreads.forEach((t) => {
        if (!t?.messages || t.messages.length === 0) return;
        const lastMsg = t.messages[t.messages.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          const notifId = `${t.id}_${lastMsg.createdAt}`;
          newNotifs.push({
            id: notifId,
            type: "support",
            title: `💬 新客服訊息 (${t.userName || "社員"})`,
            body: lastMsg.text || "",
            threadId: t.id,
            createdAt: lastMsg.createdAt,
            read: false,
          });
        }
      });

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const filteredNew = newNotifs.filter((n) => !existingIds.has(n.id));
        return [...filteredNew, ...prev];
      });
    } catch (e) {
      console.error("Sync threads error:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    syncThreadsAndNotifications();

    const handleCustomEvent = () => syncThreadsAndNotifications();
    window.addEventListener("tsm-support-chat-updated", handleCustomEvent);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "tsm_support_threads_v1" || e.key === "tsm_support_chat_signal") {
        syncThreadsAndNotifications();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("tsm-support-chat-updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSendReply = () => {
    if (!selectedThreadId || !replyText.trim()) return;
    addAdminReply(selectedThreadId, replyText);
    setReplyText("");
    syncThreadsAndNotifications();
  };

  const handleResolve = (threadId: string) => {
    resolveSupportThread(threadId);
    syncThreadsAndNotifications();
  };

  const handleNotifClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setActiveTab("support");
    setSelectedThreadId(notif.threadId);
    setShowNotifMenu(false);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const openTicketCount = threads.filter((t) => t.status === "open").length;
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
      {/* 頂部頁籤與通知中心列 */}
      <div className="flex items-center justify-between border-b border-border bg-white rounded-t-xl px-4 pt-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-4" />
            物流與訂單管理
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-2.5 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === "support"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4" />
            客服工單管理
            {openTicketCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {openTicketCount}
              </span>
            )}
          </button>
        </div>

        {/* 🔔 通知中心按鈕區 */}
        <div className="relative pb-2">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-full border border-border bg-slate-50 hover:bg-slate-100 transition-all"
            title="通知中心"
          >
            <Bell className="size-5 text-foreground" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* 下拉通知選單 */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-white shadow-elevated z-50 overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
                <span className="font-bold text-sm">🔔 後端即時通知中心</span>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="size-3" /> 全部已讀
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">目前尚無新通知。</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`p-3 cursor-pointer text-xs transition-all hover:bg-slate-50 ${
                        !n.read ? "bg-amber-50/60 font-semibold border-l-4 border-amber-500" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-foreground font-bold">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1：訂單與物流管理 */}
      {activeTab === "orders" && (
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
      )}

      {/* TAB 2：客服對話與真人回覆 */}
      {activeTab === "support" && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-bold">🌱 社員客服中心（真人幹部接手）</h3>
            <span className="text-xs text-muted-foreground">可與前台「阿方」客服對話連線</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 左側：對話清單 */}
            <div className="border-r border-border pr-4 space-y-2 max-h-[500px] overflow-y-auto">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                對話總表 ({threads.length})
              </h4>
              {threads.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center border border-dashed rounded-lg">
                  尚無客服對話紀錄
                </p>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      selectedThreadId === thread.id
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "border-border hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{thread.userName || "社員"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        thread.status === "open" ? "bg-amber-100 text-amber-700 font-bold" : "bg-slate-100 text-slate-500"
                      }`}>
                        {thread.status === "open" ? "待處理" : "已結案"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {thread.messages?.[thread.messages.length - 1]?.text || ""}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* 右側：詳細對話與幹部回覆 */}
            <div className="md:col-span-2 flex flex-col justify-between min-h-[420px] bg-slate-50/50 p-4 rounded-xl border border-border">
              {selectedThread ? (
                <>
                  <div>
                    <div className="flex justify-between items-center border-b border-border pb-3 mb-4 bg-white p-3 rounded-lg border shadow-sm">
                      <div>
                        <h4 className="font-bold text-base">{selectedThread.userName || "社員"}</h4>
                        <p className="text-xs text-muted-foreground">{selectedThread.userEmail} · 模式：{selectedThread.mode?.toUpperCase()}</p>
                      </div>
                      {selectedThread.status === "open" && (
                        <button
                          onClick={() => handleResolve(selectedThread.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-all"
                        >
                          ✓ 標示為已結案
                        </button>
                      )}
                    </div>

                    {/* 對話紀錄歷史 */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {(selectedThread.messages || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.role === "user" ? "items-start" : "items-end"
                          }`}
                        >
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">
                            {msg.role === "user" ? selectedThread.userName || "社員" : msg.role === "admin" ? "👨‍💼 真人幹部" : "🤖 AI 阿方"}
                          </span>
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                              msg.role === "user"
                                ? "bg-white border border-border text-foreground"
                                : msg.role === "admin"
                                ? "bg-emerald-600 text-white font-medium"
                                : "bg-primary/10 text-primary border border-primary/20"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 幹部輸入框 */}
                  <div className="pt-3 border-t border-border mt-4 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                      placeholder="輸入幹部回覆訊息（發送後前台顧客會同步收到）..."
                      className="flex-1 border rounded-full px-4 py-2.5 text-sm outline-none bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <button
                      onClick={handleSendReply}
                      className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-110 shadow-sm transition-all"
                    >
                      傳送回覆
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid place-items-center h-full text-muted-foreground text-xs py-12">
                  👈 請從左側點選對話以進行查看與真人回覆
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}