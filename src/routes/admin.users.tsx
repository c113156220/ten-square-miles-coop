import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  listSupportThreads, 
  addAdminReply, 
  resolveSupportThread, 
  type SupportThread 
} from "@/lib/support-chat";
import { Bell, CheckCheck, MessageSquare, Users } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

export function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "support">("users");

  // --- 客服對話與通知 State ---
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    threadId: string;
    createdAt: number;
    read: boolean;
  }>>([]);

  // 同步對話與建立通知
  const syncData = () => {
    try {
      const latestThreads = listSupportThreads() || [];
      setThreads(latestThreads);

      // 掃描最新訊息產生通知
      const newNotifs: typeof notifications = [];
      latestThreads.forEach((t) => {
        if (!t?.messages || t.messages.length === 0) return;
        const lastMsg = t.messages[t.messages.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          newNotifs.push({
            id: `${t.id}_${lastMsg.createdAt}`,
            title: `💬 新客服訊息 (${t.userName || "社員"})`,
            body: lastMsg.text || "",
            threadId: t.id,
            createdAt: lastMsg.createdAt,
            read: false,
          });
        }
      });

      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        return [...newNotifs.filter((n) => !existing.has(n.id)), ...prev];
      });
    } catch (e) {
      console.error("Sync data error:", e);
    }
  };

  useEffect(() => {
    syncData();
    window.addEventListener("tsm-support-chat-updated", syncData);
    window.addEventListener("storage", syncData);
    return () => {
      window.removeEventListener("tsm-support-chat-updated", syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSendReply = () => {
    if (!selectedThreadId || !replyText.trim()) return;
    addAdminReply(selectedThreadId, replyText);
    setReplyText("");
    syncData();
  };

  const handleNotifClick = (notif: typeof notifications[0]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setActiveTab("support");
    setSelectedThreadId(notif.threadId);
    setShowNotifMenu(false);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const openTicketCount = threads.filter((t) => t.status === "open").length;

  return (
    <div className="p-6 space-y-6">
      {/* 頂部頁籤與 🔔 通知中心列 */}
      <div className="flex items-center justify-between border-b border-border bg-white rounded-t-2xl px-6 pt-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" /> 全體使用者總表
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === "support"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4" /> 客服工單管理
            {openTicketCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {openTicketCount}
              </span>
            )}
          </button>
        </div>

        {/* 🔔 通知中心選單 */}
        <div className="relative pb-2">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 rounded-full border border-border bg-slate-50 hover:bg-slate-100 transition-all shadow-sm"
            title="通知中心"
          >
            <Bell className="size-5 text-foreground" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-white shadow-elevated z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
                <span className="font-bold text-sm">🔔 後端即時通知中心</span>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
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
                      className={`p-3.5 cursor-pointer text-xs transition-all hover:bg-slate-50 ${
                        !n.read ? "bg-amber-50/70 font-semibold border-l-4 border-amber-500" : ""
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

      {/* TAB 1：全體使用者總表 */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threads.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed rounded-2xl bg-white">
                尚無使用者紀錄
              </div>
            ) : (
              threads.map((thread) => (
                <div key={thread.id} className="p-4 rounded-2xl border border-border bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <h4 className="font-bold text-base">{thread.userName || "社員"}</h4>
                      <p className="text-xs text-muted-foreground">{thread.userEmail}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase">
                      {thread.mode}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(thread.messages || []).map((m) => (
                      <div key={m.id} className={`p-2.5 rounded-xl text-xs ${m.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-900 border border-emerald-200"}`}>
                        <span className="font-bold uppercase text-[9px] opacity-70 block mb-0.5">{m.role}</span>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2：真人幹部接手對話視窗 */}
      {activeTab === "support" && (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-r border-border pr-4 space-y-2 max-h-[500px] overflow-y-auto">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">對話總表 ({threads.length})</h4>
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedThreadId === thread.id ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20" : "border-border hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{thread.userName || "社員"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${thread.status === "open" ? "bg-amber-100 text-amber-700 font-bold" : "bg-slate-100 text-slate-500"}`}>
                      {thread.status === "open" ? "待處理" : "已結案"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {thread.messages?.[thread.messages.length - 1]?.text || ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 flex flex-col justify-between min-h-[420px] bg-slate-50/50 p-4 rounded-xl border border-border">
              {selectedThread ? (
                <>
                  <div>
                    <div className="flex justify-between items-center border-b pb-3 mb-4 bg-white p-3 rounded-lg border">
                      <div>
                        <h4 className="font-bold text-base">{selectedThread.userName || "社員"}</h4>
                        <p className="text-xs text-muted-foreground">{selectedThread.userEmail}</p>
                      </div>
                      {selectedThread.status === "open" && (
                        <button 
                          onClick={() => {
                            resolveSupportThread(selectedThread.id);
                            syncData();
                          }} 
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all"
                        >
                          ✓ 標示為已結案
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {(selectedThread.messages || []).map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}>
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">
                            {msg.role === "user" ? selectedThread.userName || "社員" : msg.role === "admin" ? "👨‍💼 真人幹部" : "🤖 AI 阿方"}
                          </span>
                          <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm leading-relaxed ${
                            msg.role === "user" ? "bg-white border text-foreground" : msg.role === "admin" ? "bg-emerald-600 text-white font-medium" : "bg-primary/10 text-primary border border-primary/20"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border mt-4 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                      placeholder="輸入幹部回覆訊息..."
                      className="flex-1 border rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <button onClick={handleSendReply} className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition-all">
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