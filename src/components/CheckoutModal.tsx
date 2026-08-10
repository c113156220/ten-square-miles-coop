import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { CreditCard, Wallet, Truck, X, ShieldCheck, CheckCircle2, Building2, Store, Minus, Plus, Loader2, Lock, MapPin, User, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  tempType: "cold" | "ambient";
  qty?: number;
};

export type ShippingType = "COOP_PICKUP" | "EXPRESS_DELIVERY";
export type PaymentType = "ECPAY" | "WALLET" | "BANK_TRANSFER" | "COD";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CheckoutItem[];
  walletBalance: number;
  onWalletDebit: (amount: number) => void;
  onPaid: (message: string) => void;
  onUpdateCartQuantity?: (itemId: string, delta: number) => void;
  ecpayEndpoint?: string;
};

const SHIPPING_FEES: Record<ShippingType, number> = {
  COOP_PICKUP: 0,
  EXPRESS_DELIVERY: 120,
};

const SHIPPING_LABELS: Record<ShippingType, { zh: string; en: string; desc: string }> = {
  COOP_PICKUP: { zh: "合作社門市自取 (免運費)", en: "Co-op pickup (free)", desc: "合作社現場門市自取，適合冷鏈與常溫。" },
  EXPRESS_DELIVERY: { zh: "物流公司寄出 (黑貓/新竹貨運 $120)", en: "Express Delivery ($120)", desc: "全程冷鏈與常溫溫控宅配到府。" },
};

const PAYMENT_LABELS: Record<PaymentType, { zh: string; en: string; desc: string }> = {
  ECPAY: { zh: "綠界線上刷卡", en: "ECPay credit card", desc: "線上即時信用卡刷卡支付" },
  WALLET: { zh: "合作社儲值金扣款", en: "Stored value wallet", desc: "直接從會員儲值金扣款" },
  BANK_TRANSFER: { zh: "銀行轉帳 / 匯款", en: "Bank Transfer", desc: "轉帳後請提供帳號後五碼核對" },
  COD: { zh: "貨到付款", en: "Cash on Delivery", desc: "包裹宅配送達或到店後現場付款" },
};

export function CheckoutModal({
  open,
  onClose,
  cart,
  walletBalance,
  onWalletDebit,
  onPaid,
  onUpdateCartQuantity,
}: CheckoutModalProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const [shippingType, setShippingType] = useState<ShippingType>("COOP_PICKUP");
  const [paymentType, setPaymentType] = useState<PaymentType>("ECPAY");
  const [bankLastFive, setBankLastFive] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [orderId, setOrderId] = useState<string>("");

  // 📦 宅配收件人資訊狀態 (當選擇宅配時使用)
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [recipientAddress, setRecipientAddress] = useState("");

  const [cardNumber, setCardNumber] = useState("4311 9522 2222 2222");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("222");
  const [otpCode, setOtpCode] = useState("1234");
  const [processingEcpay, setProcessingEcpay] = useState(false);

  const hasColdItems = cart.some((item) => item.tempType === "cold");
  const memberId = user?.memberId ?? "F0001";

  const itemGroups = useMemo(() => {
    const groups = new Map<string, CheckoutItem>();
    cart.forEach((item) => {
      const key = `${item.id}-${item.tempType}`;
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, { ...item, qty: item.qty ?? 1 });
      } else {
        groups.set(key, { ...existing, qty: (existing.qty ?? 1) + (item.qty ?? 1) });
      }
    });
    return Array.from(groups.values());
  }, [cart]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0), [cart]);
  const shippingFee = SHIPPING_FEES[shippingType];
  const total = subtotal + shippingFee;

  if (!open) return null;

  function closeModal() {
    setStep(1);
    setBusy(false);
    setOrderId("");
    setBankLastFive("");
    onClose();
  }

  function readLocalOrders(): any[] {
    try {
      return JSON.parse(localStorage.getItem("tsm_orders_v1") || "[]");
    } catch {
      return [];
    }
  }

  function writeLocalOrders(nextOrders: any[]) {
    localStorage.setItem("tsm_orders_v1", JSON.stringify(nextOrders));
    window.dispatchEvent(new Event("storage"));
  }

  const canUseSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  async function saveOrderToDatabase(): Promise<string> {
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const displayOrderId = `${memberId}-${ymd}-${randomSuffix}`;

    const targetRecipientName = shippingType === "EXPRESS_DELIVERY" ? recipientName : (user?.name || "Demo 測試社員");
    const targetRecipientPhone = shippingType === "EXPRESS_DELIVERY" ? recipientPhone : (user?.phone || "0900000000");
    const targetAddress = shippingType === "EXPRESS_DELIVERY" ? recipientAddress : "合作社現場門市自取";

    const newLocalItem = {
      id: displayOrderId,
      dbOrderId: null,
      orderId: displayOrderId,
      items: cart.map((c) => ({ name: c.name, qty: c.qty ?? 1, price: c.price, tempType: c.tempType })),
      amount: total,
      status: "已打包",
      paymentMethod: paymentType,
      deliveryMethod: SHIPPING_LABELS[shippingType].zh,
      pickupCode: `COOP-PICKUP:${displayOrderId}:${Date.now()}`,
      createdAt: new Date().toISOString(),
      memberId,
      memberName: user?.name || "合作社社員",
      memberPhone: user?.phone || "0900000000",
      recipientName: targetRecipientName,
      recipientPhone: targetRecipientPhone,
      deliveryAddress: targetAddress,
    };

    try {
      writeLocalOrders([newLocalItem, ...readLocalOrders()]);
    } catch (lsErr) {
      console.warn("LocalStorage 同步提醒:", lsErr);
    }

    if (!canUseSupabase) return displayOrderId;

    try {
      const { data: newOrder, error: orderErr } = await (supabase as any)
        .from("orders")
        .insert({
          total_amount: total,
          member_id: memberId,
          status: paymentType === "ECPAY" ? "pending" : "paid",
          delivery_method: SHIPPING_LABELS[shippingType].zh,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderErr) return displayOrderId;

      const createdOrderId = String(newOrder.id);
      newLocalItem.dbOrderId = createdOrderId;
      newLocalItem.id = displayOrderId;
      newLocalItem.orderId = displayOrderId;
      writeLocalOrders([newLocalItem, ...readLocalOrders().filter((item: any) => item.orderId !== displayOrderId)]);

      await (supabase as any).from("payments").insert({
        order_id: createdOrderId,
        payment_method: paymentType,
        status: paymentType === "ECPAY" ? "pending" : "paid",
        bank_last_five: paymentType === "BANK_TRANSFER" ? bankLastFive.trim() || "88888" : null,
        invoice_number: displayOrderId,
        paid_at: paymentType === "ECPAY" ? null : new Date().toISOString(),
      });

      await (supabase as any).from("order_items").insert(
        cart.map((item) => ({
          order_id: createdOrderId,
          product_id: item.id,
          quantity: item.qty ?? 1,
          unit_price: item.price,
          tax_type: item.tempType === "cold" ? "cold_chain" : "ambient",
        }))
      );

      // 寫入物流表 (完整包含收件人、電話與地址)
      await (supabase as any).from("logistics").insert({
        order_id: createdOrderId,
        recipient_name: targetRecipientName,
        recipient_phone: targetRecipientPhone,
        delivery_address: targetAddress,
        status: "preparing",
        temp_layer: hasColdItems ? "frozen" : "normal",
      });
    } catch (e) {
      console.error("Save to Supabase Exception:", e);
    }

    return displayOrderId;
  }

  async function submit() {
    if (cart.length === 0) return;

    // 宅配基本資料校驗
    if (shippingType === "EXPRESS_DELIVERY") {
      if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
        alert("請完整填寫宅配收件人姓名、電話與配送住址！");
        return;
      }
    }

    setBusy(true);

    try {
      const nextOrderId = await saveOrderToDatabase();
      setOrderId(nextOrderId);

      if (paymentType === "WALLET") {
        if (walletBalance < total) {
          alert("儲值金餘額不足，請改選其他付款方式。");
          setBusy(false);
          return;
        }
        onWalletDebit(total);
        onPaid(`已使用儲值金扣款完成，訂單 #${nextOrderId} 已成立。`);
        setStep(4);
      } else if (paymentType === "BANK_TRANSFER") {
        const lastFive = bankLastFive.trim() || "88888";
        onPaid(`轉帳訂單 #${nextOrderId} 已建立 (對帳碼: ${lastFive})。`);
        setStep(4);
      } else if (paymentType === "COD") {
        onPaid(`貨到付款訂單 #${nextOrderId} 已成立。`);
        setStep(4);
      } else if (paymentType === "ECPAY") {
        setStep(2);
        setTimeout(() => {
          setStep(3);
          setBusy(false);
        }, 2000);
      }
    } catch (error) {
      onPaid(error instanceof Error ? error.message : "結帳失敗");
      setBusy(false);
    }
  }

  const handleECPayPayNow = () => {
    setProcessingEcpay(true);
    setTimeout(() => {
      setProcessingEcpay(false);
      onPaid(`綠界線上刷卡成功！訂單 #${orderId} 已完成付款。`);
      setStep(4);
    }, 1500);
  };

  const timelineSteps = [
    { zh: "訂單已建立", en: "Order created" },
    { zh: "廠商集貨與品檢", en: "Vendor pick-up & QC" },
    { zh: "抵達門市 / 出貨", en: "Arrived at store / shipment" },
  ];

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm" onClick={closeModal}>
      <div
        className="w-full max-w-[1000px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-[2rem] border border-border bg-white shadow-elevated transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-md">
          <div>
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">Checkout / Fulfillment</p>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-800">
              {step === 1 && "確認訂單與付款"}
              {step === 2 && "正在跳轉至綠界 ECPay 金流..."}
              {step === 3 && "綠界 ECPay 官方線上收銀台"}
              {step === 4 && "物流出貨與取貨追蹤"}
            </h2>
          </div>
          <button onClick={closeModal} className="rounded-full border border-border p-1.5 sm:p-2 text-muted-foreground hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-5 sm:space-y-6">
              <div>
                <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">購物車明細</h3>
                <div className="space-y-2 max-h-[180px] sm:max-h-[220px] overflow-y-auto pr-1">
                  {itemGroups.map((item) => (
                    <div key={`${item.id}-${item.tempType}`} className="rounded-xl sm:rounded-2xl border border-border bg-stone-50 p-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <div className="inline-flex items-center gap-1.5">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase text-primary">
                              {item.tempType === "cold" ? "❄️ 冷鏈" : "🌱 常溫"}
                            </span>
                            <span className="text-xs text-muted-foreground">x{item.qty ?? 1}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-primary text-sm sm:text-base">NT${item.price}</p>
                        </div>
                      </div>
                      {onUpdateCartQuantity && (
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.id, -1)}
                            className="grid size-6 sm:size-7 place-items-center rounded-full border border-border bg-white"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-6 text-center font-mono font-bold text-xs sm:text-sm">{item.qty ?? 1}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.id, 1)}
                            className="grid size-6 sm:size-7 place-items-center rounded-full border border-border bg-white"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 取貨方式 */}
              <div>
                <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">取貨方式</h3>
                <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  {(Object.keys(SHIPPING_LABELS) as ShippingType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setShippingType(type)}
                      className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-left transition ${
                        shippingType === type ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary shrink-0" />
                        <p className="font-semibold text-xs sm:text-sm">{SHIPPING_LABELS[type].zh}</p>
                      </div>
                      <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{SHIPPING_LABELS[type].desc}</p>
                    </button>
                  ))}
                </div>

                {/* 🏠 選取宅配時，展開地址、姓名與電話輸入框 */}
                {shippingType === "EXPRESS_DELIVERY" && (
                  <div className="mt-3 p-4 border rounded-2xl bg-slate-50 space-y-3 animate-fade-in border-primary/30">
                    <p className="font-bold text-xs text-primary flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> 請填寫宅配收件人詳細資料
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-muted-foreground font-bold mb-1">收件人姓名</label>
                        <input
                          type="text"
                          placeholder="例如：王小明"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full text-xs border rounded-xl px-3 py-2 bg-white outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground font-bold mb-1">收件人電話</label>
                        <input
                          type="text"
                          placeholder="例如：0912345678"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full text-xs border rounded-xl px-3 py-2 bg-white outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground font-bold mb-1">完整配送住址</label>
                      <input
                        type="text"
                        placeholder="請輸入縣市、鄉鎮市區、路街號與樓層..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full text-xs border rounded-xl px-3 py-2 bg-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">付款方式</h3>
                <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  {(Object.keys(PAYMENT_LABELS) as PaymentType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPaymentType(type)}
                      className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-left transition ${
                        paymentType === type ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {type === "ECPAY" && <CreditCard className="size-4 text-primary shrink-0" />}
                        {type === "WALLET" && <Wallet className="size-4 text-primary shrink-0" />}
                        {type === "BANK_TRANSFER" && <Building2 className="size-4 text-primary shrink-0" />}
                        {type === "COD" && <Store className="size-4 text-primary shrink-0" />}
                        <p className="font-semibold text-xs sm:text-sm">{PAYMENT_LABELS[type].zh}</p>
                      </div>
                      <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{PAYMENT_LABELS[type].desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={busy || cart.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-primary-foreground disabled:opacity-50 hover:brightness-110 shadow-md transition-all"
              >
                <ShieldCheck className="size-4" />
                {busy ? "系統處理中..." : "確認付款 / 前往綠界刷卡"}
              </button>
            </section>

            <aside className="space-y-4 rounded-2xl sm:rounded-3xl border border-border bg-slate-50/50 p-4 sm:p-5 h-fit">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">訂單摘要</h3>
              <div className="rounded-xl sm:rounded-2xl border border-border bg-white p-3.5 sm:p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between"><span>小計</span><span className="font-mono">NT${subtotal}</span></div>
                <div className="flex justify-between"><span>運費</span><span className="font-mono">NT${shippingFee}</span></div>
                <div className="mt-2.5 flex justify-between border-t border-border pt-2.5 text-sm sm:text-base font-bold">
                  <span>應付總額</span><span className="font-mono text-primary text-base sm:text-lg">NT${total}</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 sm:p-16 text-center space-y-4 sm:space-y-6 animate-fade-in">
            <div className="relative mx-auto size-16 sm:size-20 grid place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Loader2 className="size-8 sm:size-10 animate-spin" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">安全連線中，即將跳轉至綠界 ECPay 金流頁面...</h3>
              <p className="text-xs text-muted-foreground">正在加密傳輸訂單金額 NT${total} 與交易參數</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/60 min-h-[480px]">
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-80">ECPay Payment Gateway</p>
                <h3 className="text-base sm:text-lg font-extrabold">綠界科技金流服務 · 線上刷卡收銀台</h3>
              </div>
              <span className="bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold">特約商店：十圓方里合作社</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2 border-b pb-2.5">
                  <CreditCard className="size-4 text-emerald-600" /> 請輸入信用卡資料
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">信用卡卡號 (Credit Card Number)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 font-mono text-xs sm:text-sm outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">有效年月 (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 font-mono text-xs sm:text-sm outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">末三碼 (CVV)</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 font-mono text-xs sm:text-sm outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleECPayPayNow}
                    disabled={processingEcpay}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    {processingEcpay ? "授權驗證中..." : `立即刷卡支付 NT$ ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs h-fit">
                <h4 className="font-bold text-slate-700 border-b pb-2">綠界交易訂單明細</h4>
                <div className="flex justify-between">
                  <span className="text-slate-400">合作社訂單號</span>
                  <span className="font-mono text-slate-700 truncate max-w-[140px]">{orderId}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center text-xs sm:text-sm font-bold">
                  <span>刷卡授權總額</span>
                  <span className="text-emerald-700 font-mono text-sm sm:text-base">NT$ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_0.9fr]">
            <section className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-border bg-slate-50/50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-primary">Order confirmed</p>
                  <h3 className="text-sm sm:text-lg font-extrabold truncate max-w-[180px] sm:max-w-none">#{orderId || "TSM-ORDER"}</h3>
                </div>
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-white shrink-0">
                  訂單已成立
                </span>
              </div>

              <div className="p-3.5 border border-dashed border-emerald-300 rounded-xl sm:rounded-2xl bg-emerald-50/50 text-center space-y-1.5">
                <p className="text-xs font-bold text-emerald-900">📱 物流狀態</p>
                <div className="p-2.5 bg-white rounded-lg border font-mono text-xs font-extrabold text-emerald-700 select-all truncate">
                  {shippingType === "EXPRESS_DELIVERY" ? `宅配到府：${recipientAddress}` : `合作社現場門市自取`}
                </div>
              </div>

              <div className="space-y-3">
                {timelineSteps.map((item, idx) => (
                  <div key={item.zh} className="flex gap-3">
                    <div className="grid size-7 sm:size-8 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      ✓
                    </div>
                    <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 flex-1 text-xs">
                      <p className="font-bold text-slate-800">{item.zh}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-4 rounded-2xl sm:rounded-3xl border border-border bg-slate-50/50 p-4 sm:p-5">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-full bg-foreground px-4 py-3 text-xs sm:text-sm font-bold text-background hover:brightness-110"
              >
                關閉視窗
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}