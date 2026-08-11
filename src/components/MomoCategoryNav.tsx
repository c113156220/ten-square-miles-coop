import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Menu, X, ChevronRight, Lock, Sparkles, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  memberPrice: number;
  bgGradient: string;
  badgeColor: string;
  icon: string;
  origin: string;
  features: string;
  tempType: "cold" | "ambient";
};

export type CategoryGroup = {
  id: string;
  name: string;
  icon: string;
  isMemberOnly?: boolean;
  subCategories: {
    title: string;
    items: ProductItem[];
  }[];
};

export const MOMO_CATEGORIES: CategoryGroup[] = [
  {
    id: "fresh",
    name: "生鮮農產 (一級農產 - 全員可購)",
    icon: "🥬",
    isMemberOnly: false,
    subCategories: [
      {
        title: "有機時蔬菜",
        items: [
          { id: "cabbage", name: "有機高麗菜 (顆)", price: 65, memberPrice: 62, bgGradient: "from-emerald-100 via-teal-50 to-green-100", badgeColor: "bg-emerald-600 text-white", icon: "🥬", origin: "雲林契作有機農場", features: "低溫契作栽培，清甜脆口無農藥殘留", tempType: "ambient" },
          { id: "veggie-box", name: "契作有機葉菜箱 (5kg)", price: 480, memberPrice: 457, bgGradient: "from-green-100 via-emerald-100 to-lime-100", badgeColor: "bg-green-700 text-white", icon: "🥗", origin: "宜蘭夥伴農場", features: "每週新鮮採收，包含 5 種當季有機綠葉蔬菜", tempType: "cold" },
          { id: "root-veggie", name: "有機當季根莖組合", price: 180, memberPrice: 171, bgGradient: "from-amber-100 via-orange-50 to-yellow-100", badgeColor: "bg-amber-600 text-white", icon: "🥔", origin: "台南官田小農", features: "富含膳食纖維，包含紅蘿蔔、地瓜與馬鈴薯", tempType: "ambient" },
        ],
      },
      {
        title: "在地時令水果",
        items: [
          { id: "guava", name: "特級紅心芭樂 (袋)", price: 120, memberPrice: 114, bgGradient: "from-rose-100 via-pink-50 to-emerald-100", badgeColor: "bg-rose-600 text-white", icon: "🍈", origin: "高雄燕巢農會", features: "果肉厚實果香濃郁，富含高維生素 C", tempType: "ambient" },
          { id: "apple", name: "阿里山高山蜜蘋果", price: 320, memberPrice: 305, bgGradient: "from-red-100 via-rose-50 to-amber-100", badgeColor: "bg-red-600 text-white", icon: "🍎", origin: "嘉義阿里山 1400m 果園", features: "高海拔日夜溫差大，自然結蜜水分飽滿", tempType: "ambient" },
          { id: "watermelon", name: "花蓮玉里沙地西瓜", price: 250, memberPrice: 238, bgGradient: "from-emerald-100 via-green-50 to-red-100", badgeColor: "bg-emerald-700 text-white", icon: "🍉", origin: "花蓮玉里秀姑巒溪畔", features: "秀姑巒溪溪水灌溉，沙質土壤果肉沙甜", tempType: "ambient" },
        ],
      },
      {
        title: "優質米糧",
        items: [
          { id: "rice-9", name: "花蓮台梗九號米 (5kg)", price: 350, memberPrice: 333, bgGradient: "from-amber-100 via-yellow-50 to-orange-100", badgeColor: "bg-amber-700 text-white", icon: "🌾", origin: "花蓮富里契作區", features: "米粒香 Q 彈牙，冷掉後依然保持 Q 度", tempType: "ambient" },
          { id: "black-rice", name: "契作有機黑米 (1kg)", price: 160, memberPrice: 152, bgGradient: "from-purple-100 via-slate-100 to-indigo-100", badgeColor: "bg-purple-700 text-white", icon: "🍚", origin: "彰化二林花青素米", features: "天然花青素，未精拋保留全穀營養", tempType: "ambient" },
          { id: "quinoa", name: "紅藜藜麥雙穀包", price: 220, memberPrice: 210, bgGradient: "from-rose-100 via-orange-50 to-amber-100", badgeColor: "bg-rose-700 text-white", icon: "🥣", origin: "屏東霧台原鄉產區", features: "優質植物性蛋白，適合健康減醣飲食", tempType: "ambient" },
        ],
      },
    ],
  },
  {
    id: "dairy_eggs",
    name: "蛋品與乳品 (社員專屬)",
    icon: "🥚",
    isMemberOnly: true,
    subCategories: [
      {
        title: "人道飼養蛋品",
        items: [
          { id: "eggs-free", name: "放牧紅殼蛋 (10顆)", price: 135, memberPrice: 128, bgGradient: "from-orange-100 via-amber-50 to-yellow-100", badgeColor: "bg-orange-600 text-white", icon: "🥚", origin: "南投埔里高地牧場", features: "自然人道放牧，無抗生素全素飼料", tempType: "cold" },
          { id: "eggs-black", name: "烏骨雞青殼蛋", price: 160, memberPrice: 152, bgGradient: "from-teal-100 via-cyan-50 to-emerald-100", badgeColor: "bg-teal-700 text-white", icon: "🪺", origin: "苗栗卓蘭農場", features: "蛋黃濃郁無腥味，富含卵磷脂", tempType: "cold" },
        ],
      },
      {
        title: "合作社鮮乳",
        items: [
          { id: "milk-fresh", name: "鮮乳坊無調整鮮乳 (936ml)", price: 98, memberPrice: 93, bgGradient: "from-blue-100 via-sky-50 to-cyan-100", badgeColor: "bg-blue-600 text-white", icon: "🥛", origin: "雲林崙背單一牧場", features: "無調整乳成分，保留最純粹濃郁乳香", tempType: "cold" },
          { id: "goat-milk", name: "低溫殺菌小農羊乳", price: 110, memberPrice: 105, bgGradient: "from-indigo-100 via-sky-50 to-blue-100", badgeColor: "bg-indigo-600 text-white", icon: "🐐", origin: "嘉義竹崎羊牧場", features: "低溫巴氏殺菌，溫和好吸收", tempType: "cold" },
        ],
      },
    ],
  },
  {
    id: "processed",
    name: "合作社加工品 (社員專屬)",
    icon: "🫙",
    isMemberOnly: true,
    subCategories: [
      {
        title: "古法油品醬料",
        items: [
          { id: "oil-sesame", name: "柴燒純黑芝麻油 (500ml)", price: 350, memberPrice: 333, bgGradient: "from-stone-200 via-amber-100 to-yellow-100", badgeColor: "bg-stone-800 text-white", icon: "🫙", origin: "雲林北港古法油坊", features: "100% 台灣黑芝麻，低溫烘焙冷壓榨油", tempType: "ambient" },
          { id: "oil-peanut", name: "冷壓初榨純花生油", price: 280, memberPrice: 266, bgGradient: "from-amber-100 via-orange-100 to-yellow-100", badgeColor: "bg-amber-800 text-white", icon: "🥜", origin: "彰化芳苑契作花生", features: "無化學精煉，保留天然濃郁花生香", tempType: "ambient" },
          { id: "soy-sauce", name: "手工釀造黑豆醬油", price: 220, memberPrice: 210, bgGradient: "from-amber-200 via-orange-100 to-stone-200", badgeColor: "bg-amber-900 text-white", icon: "🍶", origin: "雲林西螺老醬園", features: "180 天甕釀古法發酵，無添加防腐劑", tempType: "ambient" },
        ],
      },
      {
        title: "冷凍食品",
        items: [
          { id: "dumplings", name: "手工豬肉高麗菜水餃", price: 180, memberPrice: 171, bgGradient: "from-emerald-100 via-teal-50 to-green-100", badgeColor: "bg-emerald-700 text-white", icon: "🥟", origin: "彰化合作社加工廠", features: "嚴選國產溫體豬肉與契作高麗菜，多汁鮮甜", tempType: "cold" },
          { id: "shrimp", name: "急速冷凍履歷白蝦", price: 280, memberPrice: 266, bgGradient: "from-sky-100 via-blue-100 to-cyan-100", badgeColor: "bg-sky-700 text-white", icon: "🦐", origin: "屏東林邊海水養殖", features: "捕撈後零下 35 度急凍，肉質彈牙飽滿", tempType: "cold" },
        ],
      },
    ],
  },
  {
    id: "events",
    name: "社務活動與講座 (非社員可購體驗票)",
    icon: "🚌",
    isMemberOnly: false,
    subCategories: [
      {
        title: "實地參訪",
        items: [
          { id: "event-farm", name: "阿里山農場一日參訪", price: 480, memberPrice: 457, bgGradient: "from-emerald-100 via-green-100 to-teal-100", badgeColor: "bg-emerald-700 text-white", icon: "🚌", origin: "嘉義阿里山", features: "實地參觀高山放牧場，親體驗採蛋與雞湯品嚐", tempType: "ambient" },
          { id: "event-tasting", name: "大稻埕品油工作坊", price: 350, memberPrice: 333, bgGradient: "from-amber-100 via-orange-100 to-yellow-100", badgeColor: "bg-amber-700 text-white", icon: "✨", origin: "台北大稻埕", features: "職人帶領品評冷壓花生油與芝麻油調味風味", tempType: "ambient" },
        ],
      },
      {
        title: "線上講座",
        items: [
          { id: "event-seminar", name: "健康飲食餐盒設計講座", price: 200, memberPrice: 190, bgGradient: "from-indigo-100 via-purple-50 to-blue-100", badgeColor: "bg-indigo-700 text-white", icon: "🎓", origin: "線上 Zoom 視訊", features: "專業營養師線上示範一週減醣備餐菜單", tempType: "ambient" },
        ],
      },
    ],
  },
];

export function MomoCategoryNav({
  onSelectProduct,
}: {
  onSelectProduct?: (product: ProductItem) => void;
}) {
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const isMember = user?.role === "member" || user?.role === "admin";

  const [activeTab, setActiveTab] = useState<string>("fresh");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [permissionNoticeOpen, setPermissionNoticeOpen] = useState(false);
  const [selectedLockedCategory, setSelectedLockedCategory] = useState("");

  const currentCategory = MOMO_CATEGORIES.find((c) => c.id === activeTab) || MOMO_CATEGORIES[0];

  const handleCategoryHover = (cat: CategoryGroup) => {
    if (!isMember && cat.isMemberOnly) {
      setSelectedLockedCategory(cat.name);
      return;
    }
    setActiveTab(cat.id);
    setIsMegaMenuOpen(true);
  };

  const handleCategoryClick = (cat: CategoryGroup) => {
    if (!isMember && cat.isMemberOnly) {
      setSelectedLockedCategory(cat.name);
      setPermissionNoticeOpen(true);
    } else {
      setIsMegaMenuOpen(false);
      // 🟢 修正：點擊分類跳轉到首頁 "/"
      navigate({ to: "/" });
    }
  };

  const handleProductClick = (product: ProductItem) => {
    setIsMegaMenuOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div className="relative border-b bg-white">
      <div className="mx-auto max-w-[1400px] px-4 flex items-center justify-between h-13">
        {/* 手機漢堡 */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-2 text-sm font-bold text-emerald-900 border border-emerald-200"
        >
          <Menu className="size-5 text-emerald-700" />
          <span>全站分類導覽</span>
        </button>

        {/* 💻 桌機版 Mega Menu 主列 */}
        <div
          className="hidden lg:flex items-center gap-2 h-full relative"
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          {MOMO_CATEGORIES.map((cat) => {
            const isLocked = !isMember && cat.isMemberOnly;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => handleCategoryHover(cat)}
                onClick={() => handleCategoryClick(cat)}
                className={`h-full px-5 flex items-center gap-2 text-sm font-extrabold cursor-pointer transition-all border-b-2 ${
                  activeTab === cat.id && isMegaMenuOpen
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-900"
                    : isLocked
                    ? "border-transparent text-slate-400 bg-slate-50/50 hover:bg-slate-100"
                    : "border-transparent text-slate-700 hover:text-emerald-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
                {isLocked && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-amber-200">
                    <Lock className="size-3" /> 社員專屬
                  </span>
                )}
              </div>
            );
          })}

          {/* 大型下拉選單 */}
          {isMegaMenuOpen && (!currentCategory.isMemberOnly || isMember) && (
            <div className="absolute top-full left-0 w-[980px] bg-white border border-slate-200 shadow-2xl rounded-b-3xl p-7 z-[100] grid grid-cols-3 gap-8 animate-fade-in">
              {currentCategory.subCategories.map((sub, idx) => (
                <div key={idx} className="space-y-3 border-r last:border-r-0 pr-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMegaMenuOpen(false);
                      // 🟢 修正：點擊標題跳轉到首頁 "/"
                      navigate({ to: "/" });
                    }}
                    className="font-extrabold text-base text-emerald-900 border-b border-emerald-100 pb-2 flex items-center gap-1.5 hover:text-emerald-600 w-full text-left"
                  >
                    <ChevronRight className="size-4 text-emerald-600 shrink-0" /> {sub.title}
                  </button>
                  
                  <ul className="space-y-3">
                    {sub.items.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleProductClick(item)}
                        className="group/item flex items-center gap-3 p-2 rounded-2xl hover:bg-emerald-50/80 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
                      >
                        <div className={`size-12 rounded-xl bg-gradient-to-br ${item.bgGradient} grid place-items-center text-2xl shadow-sm border border-black/5 shrink-0 group-hover/item:scale-105 transition-transform`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover/item:text-emerald-700">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                            <span className="text-emerald-700 font-extrabold">NT${item.memberPrice} <span className="text-[10px] font-normal text-emerald-800">(社員價)</span></span>
                            <span className="text-slate-400 line-through text-[11px]">NT${item.price}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔒 非社員權限提醒 Modal */}
      {permissionNoticeOpen && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 backdrop-blur-md p-4" onClick={() => setPermissionNoticeOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto size-14 grid place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800">【{selectedLockedCategory}】為社員專屬分類</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                依據合作社法規，非社員僅可購買「一級農產品」與參與「社務活動體驗」。如需解鎖加工品、蛋品與鮮乳等完整預購權益，歡迎加入正式社員！
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPermissionNoticeOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                繼續瀏覽一級農產
              </button>
              <button
                type="button"
                onClick={() => {
                  setPermissionNoticeOpen(false);
                  openLogin();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1"
              >
                <Sparkles className="size-3.5" /> 立即申請入社
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 手機端抽屜 */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileDrawerOpen(false)}>
          <div className="w-[320px] h-full bg-white p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Menu className="size-5 text-emerald-600" /> 全站商品與活動分類
              </h3>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
              {MOMO_CATEGORIES.map((cat) => {
                const isLocked = !isMember && cat.isMemberOnly;

                return (
                  <div key={cat.id} className="space-y-2.5 border-b pb-4">
                    <div
                      onClick={() => handleCategoryClick(cat)}
                      className={`font-extrabold text-sm flex items-center justify-between p-2.5 rounded-xl cursor-pointer ${
                        isLocked ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      {isLocked && <Lock className="size-4 text-amber-600" />}
                    </div>

                    {!isLocked && (
                      <div className="pl-3 space-y-3">
                        {cat.subCategories.map((sub, idx) => (
                          <div key={idx} className="space-y-2">
                            <p className="text-xs font-extrabold text-emerald-800">{sub.title}</p>
                            <div className="grid grid-cols-1 gap-2">
                              {sub.items.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleProductClick(item)}
                                  className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl cursor-pointer active:bg-emerald-100 border border-stone-200/60"
                                >
                                  <div className={`size-10 rounded-lg bg-gradient-to-br ${item.bgGradient} grid place-items-center text-xl shrink-0`}>
                                    {item.icon}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] text-emerald-700 font-mono font-bold">NT${item.memberPrice}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}