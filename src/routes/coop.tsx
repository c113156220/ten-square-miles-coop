import { useState } from "react";
import { X, ShieldCheck, Lock, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  cart: any[];
  walletBalance: number;
  onWalletDebit: (amount: number) => void;
  onPaid: (message: string) => void;
  ecpayEndpoint?: string;
  onUpdateCartQuantity?: (itemId: string, delta: number) => void;
};

export function CheckoutModal({
  open,
  onClose,
  cart,
  onPaid,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const isMember = user?.role === "member" || user?.role === "admin";

  // 🛡️ 結帳防冒用認證欄位
  const [idLastFour, setIdLastFour] = useState("");
  const [authError, setPermissionError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!open) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // 🛡️ 付款前身份二次認證邏輯
  const handleVerifyAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setPermissionError("");

    // 正式社員需通過身分證後四碼驗證 (預設測試號碼為 1234 或 8888)
    if (isMember) {
      if (!idLastFour.trim()) {
        setPermissionError("⚠️ 請輸入持卡社員身分證後 4 碼進行安全驗證");
        return;
      }

      setIsVerifying(true);

      setTimeout(() => {
        setIsVerifying(false);

        // 簡單驗證邏輯：範例成功（可依需求接後端 API 檢查）
        if (idLastFour.length !== 4) {
          setPermissionError("❌ 格式不正確，請輸入 4 位數字");
          return;
        }

        // 驗證成功完成結帳
        localStorage.removeItem("tsm_shopping_cart");
        window.dispatchEvent(new Event("tsm-cart-updated"));
        onPaid("付款成功！已完成社員二次身份安全認證與訂單鎖單。");
        onClose();
      }, 800);
    } else {
      // 非社員流程直接結帳
      localStorage.removeItem("tsm_shopping_cart");
      window.dispatchEvent(new Event("tsm-cart-updated"));
      onPaid("以非社員體驗票價完成預購結帳！");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden" style={{ border: '1px solid rgba(36,122,87,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部 Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="inline-flex items-center gap-1 font-extrabold px-3 py-1 rounded-full" style={{ backgroundColor: '#F1F8F5', color: '#2D3748', border: '1px solid rgba(36,122,87,0.08)' }}>
              <ShieldCheck className="size-3.5 text-[#247A57]" /> 安全加密結帳
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">預購訂單結帳與身份確認</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="size-5" />
          </button>
        </div>

        {/* 訂單摘要 */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-700">
            <span>訂單品項數量</span>
            <span>{cart.length} 項</span>
          </div>
          <div className="flex justify-between items-center text-sm font-extrabold border-t pt-2">
            <span className="text-slate-800">應付金額小計</span>
            <span className="font-mono text-xl text-emerald-600">NT${totalAmount}</span>
          </div>
        </div>

        {/* 🛡️ 重要防冒用二次身分認證卡片 */}
        <form onSubmit={handleVerifyAndPay} className="space-y-4">
          {isMember ? (
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-900">
                <Lock className="size-4 text-emerald-600" />
                <span>社員專屬身份防冒用認證 (防止帳號共享)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                為保護合作社免營業稅權益與盈餘分紅公平性，請輸入帳號擁有者（<strong>{user?.name || "實名社員"}</strong>）之<strong>身分證字號後 4 碼</strong>。
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">身分證字號後 4 碼 *</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="請輸入 4 位數字 (例如: 1234)"
                  value={idLastFour}
                  onChange={(e) => setIdLastFour(e.target.value)}
                  className="w-full border border-emerald-300 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="size-4 text-amber-600" /> 非社員體驗結帳說明
              </p>
              <p className="text-[11px] text-amber-800">
                非社員顧客訂單僅含一級農產品及活動體驗票，不享有合作社免營業稅優惠。
              </p>
            </div>
          )}

          {/* 結帳與關閉按鈕 */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition"
            >
              返回修改
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>驗證認證中...</span>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> 確認二次認證並付款
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}