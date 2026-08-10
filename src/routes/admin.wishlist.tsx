import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingBag, Calendar, ThumbsUp, CheckCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/wishlist")({
  component: AdminWishlistPage,
});

export type WishlistItem = {
  id: string;
  type: "product" | "event"; // 1. 商品 | 2. 活動
  title: string;
  category: string;
  proposerName: string;
  proposerMemberId: string;
  vendorOrLink?: string;
  votesCount: number;
  status: "gathering" | "approved" | "completed"; // 集氣中 | 籌備開單中 | 已成團上架
  createdAt: string;
};

// 預設許願清單示範資料
const INITIAL_WISHLIST: WishlistItem[] = [
  // 1. 商品許願範例
  {
    id: "wish-001",
    type: "product",
    title: "有機台梗九號米 (5kg)",
    category: "米糧麵食",
    proposerName: "許愷軒",
    proposerMemberId: "F0001",
    vendorOrLink: "花蓮契作小農",
    votesCount: 38,
    status: "gathering",
    createdAt: "2026-08-08",
  },
  {
    id: "wish-002",
    type: "product",
    title: "冷壓初榨純花生油 (500ml)",
    category: "油品醬料",
    proposerName: "張社員",
    proposerMemberId: "F0023",
    vendorOrLink: "雲林古法油坊",
    votesCount: 52,
    status: "approved",
    createdAt: "2026-08-05",
  },
  {
    id: "wish-003",
    type: "product",
    title: "人道放牧低溫殺菌鮮乳",
    category: "蛋品乳品",
    proposerName: "李社員",
    proposerMemberId: "F0012",
    vendorOrLink: "https://example.com/milk",
    votesCount: 65,
    status: "completed",
    createdAt: "2026-07-28",
  },

  // 2. 社務活動許願範例
  {
    id: "wish-101",
    type: "event",
    title: "花蓮契作小農農場一日參訪與採摘體驗",
    category: "社務活動/講座",
    proposerName: "許愷軒",
    proposerMemberId: "F0001",
    vendorOrLink: "花蓮光復農場",
    votesCount: 41,
    status: "gathering",
    createdAt: "2026-08-09",
  },
  {
    id: "wish-102",
    type: "event",
    title: "手作黑豆醬油釀造體驗工作坊",
    category: "社務活動/講座",
    proposerName: "黃俞心",
    proposerMemberId: "F0008",
    vendorOrLink: "大稻埕文化手作館",
    votesCount: 29,
    status: "approved",
    createdAt: "2026-08-02",
  },
];

function AdminWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [activeTab, setActiveTab] = useState<"product" | "event">("product"); // 1. 商品 | 2. 活動
  const [search, setSearch] = useState("");

  const handleUpdateStatus = (id: string, nextStatus: WishlistItem["status"]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  const filteredItems = items.filter((item) => {
    const isTabMatch = item.type === activeTab;
    const isSearchMatch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.proposerName.toLowerCase().includes(search.toLowerCase()) ||
      item.proposerMemberId.toLowerCase().includes(search.toLowerCase());
    return isTabMatch && isSearchMatch;
  });

  const productCount = items.filter((i) => i.type === "product").length;
  const eventCount = items.filter((i) => i.type === "event").length;

  return (
    <div className="p-4 space-y-6">
      {/* 頁面頂部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-800">
            <Heart className="size-5 text-rose-500 fill-rose-500" /> 社員願望清單管理控制面板
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            檢視社員集氣許願的商品與社務活動提案，成團後可一鍵開單發放獎勵點數。
          </p>
        </div>

        <input
          type="text"
          placeholder="搜尋願望名稱 / 分類 / 提案社員..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-emerald-600 bg-white"
        />
      </div>

      {/* 🟢 視窗分頁 (1. 商品 | 2. 活動) */}
      <div className="flex items-center gap-3 border-b pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("product")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "product"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ShoppingBag className="size-4" />
          <span>1. 商品許願</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "product" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
            {productCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("event")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "event"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Calendar className="size-4" />
          <span>2. 社務活動許願</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "event" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
            {eventCount}
          </span>
        </button>
      </div>

      {/* 願望卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <p className="col-span-full text-center py-12 text-xs text-slate-400 bg-white rounded-2xl border border-dashed p-8">
            目前此分頁尚無許願項目資料。
          </p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    {item.category}
                  </span>
                  
                  {item.status === "gathering" && (
                    <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Clock className="size-3" /> 集氣中
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                      <ThumbsUp className="size-3" /> 籌備開單中
                    </span>
                  )}
                  {item.status === "completed" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="size-3" /> 已成團上架
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 leading-snug">{item.title}</h3>
                
                {item.vendorOrLink && (
                  <p className="text-[11px] text-slate-500 truncate">
                    🔗 推薦來源: <span className="font-semibold text-slate-700">{item.vendorOrLink}</span>
                  </p>
                )}
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-[11px] text-slate-400">
                    提案社員: <span className="font-bold text-slate-700">{item.proposerName}</span> ({item.proposerMemberId})
                  </span>
                  <span className="font-mono text-xs font-extrabold text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    <Heart className="size-3 fill-rose-500 text-rose-500" /> +{item.votesCount} 人集氣
                  </span>
                </div>

                <div className="flex gap-2 text-[11px]">
                  {item.status === "gathering" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item.id, "approved")}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition"
                    >
                      核准並發放 50 點獎勵
                    </button>
                  )}
                  {item.status === "approved" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item.id, "completed")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition"
                    >
                      標示為已成團開單
                    </button>
                  )}
                  {item.status === "completed" && (
                    <div className="w-full text-center text-emerald-700 font-bold py-1 bg-emerald-50 rounded-xl">
                      已成團並開單販售
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}