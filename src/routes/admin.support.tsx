import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Send, Check } from "lucide-react";
import {
  listSupportThreads,
  addAdminReply,
  resolveSupportThread,
  type SupportThread,
} from "@/lib/support-chat";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupportPage,
});

function AdminSupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // 🔄 同步讀取全站客服資料
  const syncThreads = () => {
    try {
      const data = listSupportThreads() || [];
      setThreads([...data]);
      if (data.length > 0 && !selectedThreadId) {
        setSelectedThreadId(data[0].id);
      }
    } catch (e) {
      console.error("Sync threads error:", e);
    }
  };

  useEffect(() => {
    syncThreads();

    const handleUpdate = () => syncThreads();
    window.addEventListener("tsm-support-chat-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("tsm-support-chat-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const filteredThreads = threads.filter(
    (t) =>
      (t.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.messages || []).some((m) => (m.text || "").toLowerCase().includes(search.toLowerCase()))
  );

  // 🟢 1. 正式標示為已結案（寫入 LocalStorage 並廣播事件）
  const handleResolve = (threadId: string) => {
    if (!threadId) return;
    resolveSupportThread(threadId);

    // 全局通知，讓左側 Sidebar 的橘色徽章數字瞬間同步扣減！
    window.dispatchEvent(new Event("tsm-support-chat-updated"));
    syncThreads();
  };

  // 🟢 2. 正式傳送幹部回覆
  const handleSendReply = () => {
    if (!selectedThreadId || !replyText.trim()) return;
    addAdminReply(selectedThreadId, replyText.trim());
    setReplyText("");

    window.dispatchEvent(new Event("tsm-support-chat-updated"));
    syncThreads();
  };

  return (
    <div className="p-2 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">💬 社員客服與工單管理</h2>
        <p className="text-xs text-slate-500 mt-1">獨立客服管理面板：點擊左側對話即可在右側檢視歷史對話並進行幹部回覆。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左側對話列表 */}
        <div className="border border-slate-200 rounded-2xl bg-white p-4 space-y-3 shadow-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋對話或使用者..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">尚無客服對話紀錄</p>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                const isPending = thread.status === "open";
                const lastMsg = thread.messages?.[thread.messages.length - 1]?.text || "尚無訊息";

                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={
                      isSelected
                        ? "p-3 rounded-xl border cursor-pointer transition-all border-emerald-600 bg-emerald-50/50"
                        : "p-3 rounded-xl border cursor-pointer transition-all border-slate-200 bg-white hover:bg-slate-50"
                    }
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800">{thread.userName || "社員"}</span>
                      <span
                        className={
                          isPending
                            ? "text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"
                            : "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                        }
                      >
                        {isPending ? "待處理" : "已結案"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{lastMsg}</p>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5">{thread.mode?.toUpperCase() || "CHAT"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右側對話面板 */}
        <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white p-5 flex flex-col justify-between min-h-[500px] shadow-sm">
          {selectedThread ? (
            <>
              <div>
                <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{selectedThread.userName || "社員"}</h3>
                    <p className="text-[11px] text-slate-400">{selectedThread.userEmail}</p>
                  </div>

                  {/* 🟢 結案按鈕：點擊後會即時同步左側選單徽章數字！ */}
                  {selectedThread.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => handleResolve(selectedThread.id)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition shadow-sm cursor-pointer active:scale-95"
                    >
                      ✓ 標示為已結案
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 已結案
                    </span>
                  )}
                </div>

                {/* 對話訊息歷史 */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 overflow-y-auto max-h-[380px] mb-4 border border-slate-100">
                  {(selectedThread.messages || []).map((msg) => {
                    const isAdmin = msg.role === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl border text-xs max-w-[80%] shadow-sm space-y-1 ${
                          isAdmin
                            ? "ml-auto bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <p className={`font-bold text-[10px] ${isAdmin ? "text-emerald-100" : "text-emerald-700"}`}>
                          {isAdmin ? "👨‍💼 真人幹部" : msg.role === "assistant" ? "🤖 AI 阿方助手" : selectedThread.userName || "社員"}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 回覆輸入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  placeholder="輸入幹部回覆訊息..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> 傳送回覆
                </button>
              </div>
            </>
          ) : (
            <div className="grid place-items-center h-full text-slate-400 text-xs py-12">
              👈 請點選左側對話進行檢視與回覆
            </div>
          )}
        </div>
      </div>
    </div>
  );
}