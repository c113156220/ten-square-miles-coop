import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupportPage,
});

interface Ticket {
  id: string;
  user: string;
  email: string;
  lastMessage: string;
  status: "pending" | "resolved";
  role: string;
  updatedAt: string;
}

const MOCK_TICKETS: Ticket[] = [
  { id: "1", user: "Super Admin", email: "admin@coop.tw", lastMessage: "請問如何退款？", status: "pending", role: "AI 客服", updatedAt: "10分鐘前" },
  { id: "2", user: "Test Member", email: "member@coop.tw", lastMessage: "這週有什麼推薦好物？", status: "resolved", role: "BOT", updatedAt: "1小時前" },
  { id: "3", user: "John Doe", email: "john@coop.tw", lastMessage: "超商取貨如何選擇門市？", status: "pending", role: "真人幹部", updatedAt: "2小時前" },
];

function AdminSupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(MOCK_TICKETS[0]);
  const [replyText, setReplyText] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filteredTickets = MOCK_TICKETS.filter(
    (t) => t.user.toLowerCase().includes(search.toLowerCase()) || t.lastMessage.includes(search)
  );

  return (
    <div className="p-2 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">💬 社員客服與工單管理</h2>
        <p className="text-xs text-slate-500 mt-1">獨立客服管理面板：點擊左側對話即可在右側檢視歷史對話並進行幹部回覆。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左側列表 */}
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
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket.id === ticket.id;
              const isPending = ticket.status === "pending";

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={
                    isSelected
                      ? "p-3 rounded-xl border cursor-pointer transition-all border-emerald-600 bg-emerald-50/50"
                      : "p-3 rounded-xl border cursor-pointer transition-all border-slate-200 bg-white hover:bg-slate-50"
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-800">{ticket.user}</span>
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
                  <p className="text-xs text-slate-500 truncate">{ticket.lastMessage}</p>
                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5">{ticket.role}</span>
                    <span>{ticket.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側對話區 */}
        <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white p-5 flex flex-col justify-between min-h-[500px] shadow-sm">
          <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{selectedTicket.user}</h3>
              <p className="text-[11px] text-slate-400">{selectedTicket.email}</p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition text-slate-700"
            >
              ✓ 標示為已結案
            </button>
          </div>

          <div className="flex-1 bg-slate-50 rounded-2xl p-4 space-y-3 overflow-y-auto max-h-[400px] mb-4 border border-slate-100">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs max-w-[80%] shadow-sm space-y-1">
              <p className="font-bold text-emerald-700 text-[10px]">{selectedTicket.user}</p>
              <p className="text-slate-800">{selectedTicket.lastMessage}</p>
            </div>

            <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl border border-emerald-200 text-xs max-w-[80%] ml-auto shadow-sm space-y-1">
              <p className="font-bold text-emerald-700 text-[10px]">AI 客服助手</p>
              <p>您可以至「訂單紀錄」查看詳情，或是直接在此留言由幹部為您服務。</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="輸入幹部回覆訊息..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
            />
            <button
              type="button"
              className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition"
            >
              傳送回覆
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}