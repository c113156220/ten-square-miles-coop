import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check, Sparkles, User, ShieldCheck, Heart } from "lucide-react";

type OnboardingGuideModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectRole: (role: "member" | "guest") => void;
};

export function OnboardingGuideModal({ open, onClose, onSelectRole }: OnboardingGuideModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!open) return null;

  const slides = [
    {
      id: "intro",
      title: "歡迎來到十圓方里共同購買合作社",
      subtitle: "民主決策 · 零庫存預購 · 盈餘回饋社員",
      content: (
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto size-20 grid place-items-center rounded-3xl shadow-inner" style={{ backgroundColor: '#F1F8F5', color: '#247A57' }}>
            <Sparkles className="size-10" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            我們是一個由社員共同擁有的合作社。在這裡，每一位社員都享有共同議價、年度結餘分紅與民主表決權。
          </p>
        </div>
      ),
    },
    {
      id: "comparison",
      title: "社員 vs 非社員 權益對比",
      subtitle: "簡要了解您的消費權益與體驗範圍",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-xs">
          {/* 非社員 */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b pb-2">
              <User className="size-4 text-slate-500" /> 非社員 (一般訪客)
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-start gap-1">
                <Check className="size-3.5 text-slate-400 shrink-0 mt-0.5" /> 僅限購買「一級生鮮農產品」
              </li>
              <li className="flex items-start gap-1">
                <Check className="size-3.5 text-slate-400 shrink-0 mt-0.5" /> 參與社務活動需支付「非社員原價」
              </li>
              <li className="flex items-start gap-1 text-slate-400 line-through">
                ❌ 不享有免營業稅優惠
              </li>
              <li className="flex items-start gap-1 text-slate-400 line-through">
                ❌ 無法參與年度盈餘分配分紅
              </li>
            </ul>
          </div>

          {/* 正式社員 */}
          <div className="rounded-2xl p-4 bg-emerald-50/50 space-y-2" style={{ backgroundColor: 'rgba(241,248,245,0.5)', border: '1px solid rgba(36,122,87,0.12)', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.02)' }} >
            <div className="flex items-center gap-1.5 font-bold pb-2" style={{ color: '#2D3748', borderBottom: '1px solid rgba(45,55,72,0.06)' }}>
              <ShieldCheck className="size-4 text-[#247A57]" /> 正式實名社員
            </div>
            <ul className="space-y-1.5 text-[11px]" style={{ color: '#1F2D25' }}>
              <li className="flex items-start gap-1 font-semibold">
                <Check className="size-3.5 text-[#247A57] shrink-0 mt-0.5" /> 解鎖全站所有合作社商品預購
              </li>
              <li className="flex items-start gap-1 font-semibold">
                <Check className="size-3.5 text-[#247A57] shrink-0 mt-0.5" /> 享有「免營業稅 5%」專屬惠購價
              </li>
              <li className="flex items-start gap-1 font-semibold">
                <Check className="size-3.5 text-[#247A57] shrink-0 mt-0.5" /> 社務活動享有社員專屬折扣
              </li>
              <li className="flex items-start gap-1 font-semibold">
                <Check className="size-3.5 text-[#247A57] shrink-0 mt-0.5" /> 參與年度結餘分紅與 1 人 1 票表決
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "joining",
      title: "加入正式社員的條件與流程",
      subtitle: "一次入股，終身享有合作社自主消費權",
      content: (
        <div className="space-y-3 py-2 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
            <span className="grid size-6 place-items-center rounded-full text-white font-bold text-xs shrink-0" style={{ backgroundColor: '#247A57' }}>1</span>
            <div>
              <p className="font-bold text-slate-800">完成實名身分認證</p>
              <p className="text-[11px] text-slate-500">填寫真實姓名、電話與身分證後四碼，確保合作社社員權益與民主投票正確性。</p>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
            <span className="grid size-6 place-items-center rounded-full text-white font-bold text-xs shrink-0" style={{ backgroundColor: '#247A57' }}>2</span>
            <div>
              <p className="font-bold text-slate-800">認繳一次性股金 (NT$1,000)</p>
              <p className="text-[11px] text-slate-500">股金為社員共同擁有的合作社資產，退社時可全額申請退還。</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        {/* 頂部進度條與關閉按鈕 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? "w-8" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        {/* PPT Slide 標題與簡報內容 */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#247A57' }}>
            SLIDE {currentSlide + 1} OF {slides.length}
          </p>
          <h3 className="text-xl font-extrabold text-slate-800">{slides[currentSlide].title}</h3>
          <p className="text-xs text-slate-500">{slides[currentSlide].subtitle}</p>
        </div>

        <div className="min-h-[220px] flex flex-col justify-center">
          {slides[currentSlide].content}
        </div>

        {/* 底部控制按鈕 */}
        <div className="flex items-center justify-between border-t pt-4">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" /> 上一頁
          </button>

          {currentSlide < slides.length - 1 ? (
            <button
              type="button"
              onClick={nextSlide}
              className="text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1 shadow-sm transition" style={{ backgroundColor: '#247A57' }}
            >
              下一頁 <ChevronRight className="size-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectRole("guest");
                  onClose();
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition"
              >
                先以非社員瀏覽
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectRole("member");
                  onClose();
                }}
                className="text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1 shadow-md transition" style={{ backgroundColor: '#247A57' }}
              >
                <Heart className="size-3.5 fill-white" /> 申請成為正式社員
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}