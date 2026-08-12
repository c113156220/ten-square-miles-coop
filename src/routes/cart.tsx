import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Plus, Minus, ShoppingBag } from "lucide-react";
import { CheckoutModal } from "@/components/CheckoutModal";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "購物車與結帳 — 十圓方里" }],
  }),
  component: CartPage,
});

export function CartPage() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMember = user?.role === "member" || user?.role === "admin";

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [walletBalance] = useState(1280);

  // 讀取購物車狀態
  useEffect(() => {
    const rawCart = localStorage.getItem("tsm_shopping_cart");
    if (rawCart) {
      try {
        setCartItems(JSON.parse(rawCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (nextCart: any[]) => {
    setCartItems(nextCart);
    localStorage.setItem("tsm_shopping_cart", JSON.stringify(nextCart));
    window.dispatchEvent(new Event("tsm-cart-updated"));
  };

  const updateQty = (id: string, delta: number) => {
    const next = cartItems
      .map((item) => {
        if (item.id === id) {
          const qty = Math.max(0, item.qty + delta);
          return { ...item, qty };
        }
        return item;
      })
      .filter((item) => item.qty > 0);
    saveCart(next);
  };

  const removeItem = (id: string) => {
    const next = cartItems.filter((item) => item.id !== id);
    saveCart(next);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="SHOPPING CART"
        title={locale === "zh" ? "我的購物車" : "Your Shopping Cart"}
        subtitle={isMember ? "已套用社員專屬免營業稅惠購價" : "非社員結帳：一級農產品及體驗票券"}
      />

      <div className="space-y-6 min-h-[450px]">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
            <div className="size-16 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto">
              <ShoppingBag className="size-8" />
            </div>
            <p className="text-slate-500 font-bold text-sm">購物車目前是空的，快去選購高品質的合作社農特產品吧！</p>
            {/* 🟢 修正：跳轉路徑改為 to="/" 避免 404 */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-full text-xs transition shadow-sm"
            >
              前往共同購買專區 <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側購物車商品清單 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="size-5 text-emerald-600" /> 已選購商品 ({cartItems.length} 項)
                </h3>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <Trash2 className="size-3.5" /> 清空購物車
                </button>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-14 rounded-xl bg-gradient-to-br ${item.bgGradient || "from-emerald-100 to-teal-50"} grid place-items-center text-2xl border shrink-0`}>
                        {item.icon || "📦"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.tempType === "cold" ? "❄️ 冷鏈溫控" : "🌱 常溫配送"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 border rounded-xl p-1 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="size-6 grid place-items-center rounded-lg bg-white border hover:bg-slate-100 font-bold"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-6 text-center font-mono font-bold text-xs">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="size-6 grid place-items-center rounded-lg bg-white border hover:bg-slate-100 font-bold"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-mono text-base font-extrabold text-emerald-700">NT${item.price * item.qty}</p>
                        <p className="text-[10px] text-slate-400">NT${item.price} / 單價</p>
                      </div>

                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500 p-1">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右側結帳明細 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
              <h3 className="font-extrabold text-base text-slate-800 border-b pb-3">訂單小計與結帳</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>商品總額</span>
                  <span className="font-mono font-bold text-slate-800">NT${subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>運費 (宅配可選)</span>
                  <span className="font-mono font-bold text-slate-800">視取貨方式計算</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-sm font-bold">
                  <span>應付小計</span>
                  <span className="font-mono text-xl font-extrabold text-emerald-600">NT${subtotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="size-4" /> 前往結帳確認
              </button>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cartItems}
        walletBalance={walletBalance}
        onWalletDebit={() => {}}
        onPaid={() => {
          clearCart();
          navigate({ to: "/" });
        }}
      />
    </SiteShell>
  );
}