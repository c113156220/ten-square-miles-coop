import React, { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { OnboardingGuideModal } from "@/components/OnboardingGuideModal";
import { MomoCategoryNav, ProductItem } from "@/components/MomoCategoryNav";
import { Sparkles, ShieldCheck, LogOut, LogIn, ShoppingCart, X, MapPin, Tag, ArrowRight } from "lucide-react";

export function SiteNav() {
  const { locale, setLocale } = useI18n();
  const { user, isAdmin, logout, openLogin } = useAuth();
  const navigate = useNavigate();
  const isMember = user?.role === "member" || user?.role === "admin";

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // 監聽購物車數量
  useEffect(() => {
    const updateCartBadge = () => {
      const raw = localStorage.getItem("tsm_shopping_cart");
      if (raw) {
        try {
          const list = JSON.parse(raw);
          const totalQty = list.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
          setCartCount(totalQty);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartBadge();
    window.addEventListener("tsm-cart-updated", updateCartBadge);
    window.addEventListener("storage", updateCartBadge);

    return () => {
      window.removeEventListener("tsm-cart-updated", updateCartBadge);
      window.removeEventListener("storage", updateCartBadge);
    };
  }, []);

  // 加入購物車
  const handleAddToCart = (product: ProductItem) => {
    const rawCart = localStorage.getItem("tsm_shopping_cart");
    const cart = rawCart ? JSON.parse(rawCart) : [];
    
    const itemPrice = isMember ? product.memberPrice : product.price;
    const existingIndex = cart.findIndex((i: any) => i.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: itemPrice,
        icon: product.icon,
        bgGradient: product.bgGradient,
        tempType: product.tempType,
        qty: 1,
      });
    }

    localStorage.setItem("tsm_shopping_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("tsm-cart-updated"));
    alert(`✅ 已將【${product.name}】加入購物車！`);
  };

  const handleDirectCheckout = (product: ProductItem) => {
    handleAddToCart(product);
    setSelectedProduct(null);
    navigate({ to: "/cart" });
  };

  return (
    <>
      <header className="sticky top-0 z-[50] border-b border-border backdrop-blur-md" style={{ backgroundColor: '#F1F8F5' }} >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-3 font-bold hover:opacity-90 transition" style={{ color: '#2D3748' }}>
            <img src="/logo.jpg" alt="十里方圓 logo" className="h-12 w-auto rounded-2xl shadow-sm" />
            <div className="leading-tight" style={{ color: '#2D3748' }}>
              <span className="block text-lg font-extrabold tracking-tight">十里方圓</span>
              <span className="block font-mono text-[9px] text-[#2D3748]/60 uppercase">TEN SQ MILES CO-OP</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold" style={{ color: '#2D3748' }}>
            {/* 🟢 修正：指向首頁 "/" 避免 404 */}
            <Link to="/" className={`hover:text-[#247A57] transition ${pathname === "/" ? "text-[#247A57] font-extrabold" : ""}`}>
              🛒 共同購買
            </Link>
            <Link to="/governance" className={`hover:text-[#247A57] transition ${pathname === "/governance" ? "text-[#247A57] font-extrabold" : ""}`}>
              🏛️ 社務大廳
            </Link>
            {isAdmin && (
              <Link to="/admin" className="px-3 py-1 rounded-full font-bold transition" style={{ color: '#F59E0B', backgroundColor: '#FFF7E0', border: '1px solid rgba(245,158,11,0.15)' }}>
                🛠️ 後台管理
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-full transition" style={{ backgroundColor: 'transparent', color: '#2D3748' }}
              title="檢視購物車"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-mono text-[10px] font-bold size-4 rounded-full grid place-items-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setGuideModalOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-full transition flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-[#247A57]" />
              <span>社員 vs 非社員權益</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ color: '#2D3748', backgroundColor: '#F1F8F5' }}>
                  <ShieldCheck className="size-3.5 text-[#247A57]" /> {user.name || "社員"}
                </span>
                <button onClick={logout} className="p-1.5 rounded-full" title="登出" style={{ color: '#2D3748', backgroundColor: 'transparent' }} >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="bg-[#247A57] hover:bg-[#1f6a48] text-white font-bold text-xs px-4 py-1.5 rounded-full transition shadow-sm flex items-center gap-1"
              >
                <LogIn className="size-3.5" /> 登入 / 註冊
              </button>
            )}

            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="text-xs border rounded-lg px-2 py-1 outline-none font-bold" style={{ backgroundColor: '#F1F8F5', color: '#2D3748' }}
            >
              <option value="zh">繁中</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>

        <MomoCategoryNav onSelectProduct={(prod) => setSelectedProduct(prod)} />
      </header>

      {/* 大尺寸商品 Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[99999] grid place-items-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 max-w-3xl w-full shadow-2xl border animate-scale-in relative overflow-hidden" style={{ borderColor: 'rgba(36,122,87,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 z-10 size-10 rounded-full grid place-items-center transition" style={{ backgroundColor: '#F1F8F5', color: '#2D3748' }}
            >
              <X className="size-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className={`aspect-square rounded-3xl bg-gradient-to-br ${selectedProduct.bgGradient} border border-black/5 shadow-inner grid place-items-center relative overflow-hidden`}>
                <span className="text-9xl drop-shadow-xl transition-transform hover:scale-110 duration-300">
                  {selectedProduct.icon}
                </span>
                <span className={`absolute top-4 left-4 text-xs font-extrabold px-3.5 py-1 rounded-full shadow-sm ${selectedProduct.badgeColor}`}>
                  {selectedProduct.tempType === "cold" ? "❄️ 冷鏈溫控" : "🌱 常溫配送"}
                </span>
              </div>

              <div className="space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-2.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: '#2D3748' }}>{selectedProduct.name}</h3>
                  <div className="flex items-center gap-2 font-extrabold text-xs p-3 rounded-2xl" style={{ color: '#247A57', backgroundColor: '#F1F8F5', border: '1px solid rgba(36,122,87,0.08)' }}>
                    <MapPin className="size-4 text-[#247A57] shrink-0" />
                    <span>產地來源：{selectedProduct.origin}</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
                  <p className="font-bold flex items-center gap-1" style={{ color: '#2D3748' }}>
                    <Tag className="size-3.5 text-[#F59E0B]" /> 特色說明
                  </p>
                  <p className="leading-relaxed pl-4" style={{ color: 'rgba(45,55,72,0.85)' }}>{selectedProduct.features}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 text-white rounded-2xl shadow-sm" style={{ backgroundColor: '#247A57' }}>
                    <span className="block text-[10px] font-extrabold text-white">社員惠購價 (免營業稅)</span>
                    <span className="font-mono text-2xl font-extrabold">NT${selectedProduct.memberPrice}</span>
                  </div>
                  <div className="p-4 bg-amber-50 text-amber-950 rounded-2xl border border-amber-200">
                    <span className="block text-[10px] font-bold text-amber-700">非社員體驗價</span>
                    <span className="font-mono text-2xl font-extrabold text-amber-900">NT${selectedProduct.price}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1 font-bold py-3.5 text-xs transition flex items-center justify-center gap-1.5 rounded-2xl" style={{ backgroundColor: '#F1F8F5', color: '#2D3748' }}
                  >
                    <ShoppingCart className="size-4 text-[#2D3748]" /> 加入購物車
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectCheckout(selectedProduct)}
                    className="flex-1 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5" style={{ backgroundColor: '#247A57' }}
                  >
                    去結帳 <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <OnboardingGuideModal
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onSelectRole={(r) => r === "member" && openLogin()}
      />
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b bg-stone-50/50 py-8 px-4 mb-8">
      <div className="mx-auto max-w-[1400px] space-y-2">
        {eyebrow && <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#247A57' }}>{eyebrow}</p>}
        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#2D3748' }}>{title}</h1>
        {subtitle && <p className="text-sm font-semibold" style={{ color: 'rgba(45,55,72,0.75)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <SiteNav />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 flex-1">{children}</main>
      <footer className="border-t bg-stone-900 text-stone-400 py-8 px-4 text-xs mt-16">
        <div className="mx-auto max-w-[1400px] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 十圓方里共同購買合作社. All rights reserved.</p>
          <p className="font-mono text-[11px]">One Member, One Vote · Zero Inventory</p>
        </div>
      </footer>
    </div>
  );
}