import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { CreditCard, Wallet, Truck, MapPin, X, ShieldCheck, Package, CheckCircle2, Clock3, Building2, Store } from "lucide-react";
import { ECPayLogisticsModal, type LogisticsStore } from "@/components/ECPayLogisticsModal";
import { useI18n } from "@/lib/i18n";

export type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  tempType: "cold" | "ambient";
  qty?: number;
};

export type ShippingType = "COOP_PICKUP" | "UNIMARTC2C" | "FAMILY" | "HOME_DELIVERY";
export type PaymentType = "ECPAY" | "WALLET" | "BANK_TRANSFER" | "COD";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CheckoutItem[];
  walletBalance: number;
  onWalletDebit: (amount: number) => void;
  onPaid: (message: string) => void;
  ecpayEndpoint: string;
};

const SHIPPING_FEES: Record<ShippingType, number> = {
  COOP_PICKUP: 0,
  UNIMARTC2C: 60,
  FAMILY: 60,
  HOME_DELIVERY: 120,
};

const SHIPPING_LABELS: Record<ShippingType, { zh: string; en: string; desc: string }> = {
  COOP_PICKUP: { zh: "合作社門市自取 (免費)", en: "Co-op pickup (free)", desc: "合作社門市自取，最適合冷鏈與常溫混配。" },
  UNIMARTC2C: { zh: "7-11 賣貨便 (運費 $60)", en: "7-ELEVEN delivery ($60)", desc: "7-11 賣貨便，需先選擇門市。" },
  FAMILY: { zh: "全家店到店 (運費 $60)", en: "FamilyMart delivery ($60)", desc: "全家便利商店取貨。" },
  HOME_DELIVERY: { zh: "黑貓冷鏈宅配 (運費 $120)", en: "Cold-chain Home Delivery ($120)", desc: "全程冷鏈控溫宅配到府。" },
};

const PAYMENT_LABELS: Record<PaymentType, { zh: string; en: string; desc: string }> = {
  ECPAY: { zh: "綠界信用卡", en: "ECPay credit card", desc: "線上即時刷卡支付" },
  WALLET: { zh: "儲值金扣款", en: "Stored value wallet", desc: "直接從會員儲值金扣款" },
  BANK_TRANSFER: { zh: "銀行轉帳 / 匯款", en: "Bank Transfer", desc: "轉帳後請提供帳號後五碼核對" },
  COD: { zh: "超商取貨付款", en: "Cash on Delivery", desc: "貨到超商門市再付款" },
};

function buildOrderId() {
  return `TSM${Date.now().toString().slice(-10)}`;
}

export function CheckoutModal({
  open,
  onClose,
  cart,
  walletBalance,
  onWalletDebit,
  onPaid,
  ecpayEndpoint,
}: CheckoutModalProps) {
  const { locale } = useI18n();
  const [shippingType, setShippingType] = useState<ShippingType>("COOP_PICKUP");
  const [paymentType, setPaymentType] = useState<PaymentType>("ECPAY");
  const [bankLastFive, setBankLastFive] = useState("");
  const [selectedStore, setSelectedStore] = useState<LogisticsStore | null>(null);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [orderId, setOrderId] = useState<string>("");

  const hasColdItems = cart.some((item) => item.tempType === "cold");
  const hasAmbientItems = cart.some((item) => item.tempType === "ambient");
  const hasMixedTemp = hasColdItems && hasAmbientItems;
  const disallowPickup = hasColdItems && (shippingType === "UNIMARTC2C" || shippingType === "FAMILY");

  // 金額計算
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0), [cart]);
  const shippingFee = SHIPPING_FEES[shippingType];
  const total = subtotal + shippingFee;

  if (!open) return null;

  function resetState() {
    setStep(1);
    setBusy(false);
    setOrderId("");
    setSelectedStore(null);
    setBankLastFive("");
  }

  function closeModal() {
    resetState();
    onClose();
  }

  // 💾 寫入 Supabase 資料庫 Helper
  async function saveOrderToDatabase(newOrderId: string) {
    try {
      const { error: orderErr } = await supabase.from("orders").insert({
        id: newOrderId,
        total_amount: total,
        delivery_method: SHIPPING_LABELS[shippingType].zh,
        created_at: new Date().toISOString(),
      });

      if (orderErr) console.warn("寫入 orders 提示:", orderErr);

      const { error: logErr } = await supabase.from("logistics").insert({
        order_id: newOrderId,
        recipient_name: "Demo 測試社員",
        status: "preparing",
        temp_layer: hasColdItems ? "frozen" : "normal",
      });

      if (logErr) console.warn("寫入 logistics 提示:", logErr);
    } catch (e) {
      console.error("Save to Supabase error:", e);
    }
  }

  async function submit() {
    if (cart.length === 0 || disallowPickup) return;

    setBusy(true);
    const nextOrderId = buildOrderId();

    try {
      // 1. 先把訂單寫入 Supabase
      await saveOrderToDatabase(nextOrderId);

      // 2. 根據四種付款方式進行 Demo 處理
      if (paymentType === "WALLET") {
        if (walletBalance < total) {
          alert(locale === "zh" ? "儲值金餘額不足，請改選其他付款方式。" : "Insufficient wallet balance.");
          setBusy(false);
          return;
        }
        onWalletDebit(total);
        onPaid(locale === "zh" ? `已使用儲值金扣款完成，訂單 ${nextOrderId} 已成立。` : `Wallet payment completed.`);
      } else if (paymentType === "BANK_TRANSFER") {
        const lastFive = bankLastFive.trim() || "88888";
        onPaid(locale === "zh" ? `轉帳訂單 ${nextOrderId} 已建立 (對帳碼: ${lastFive})。` : `Bank transfer order created.`);
      } else if (paymentType === "COD") {
        onPaid(locale === "zh" ? `超商取貨付款訂單 ${nextOrderId} 已成立。` : `COD order confirmed.`);
      } else {
        // ECPAY 綠界信用卡 Demo
        onPaid(locale === "zh" ? `綠界線上刷卡成功！訂單 ${nextOrderId} 已成立。` : `ECPay payment successful.`);
      }

      setOrderId(nextOrderId);
      setStep(2);
    } catch (error) {
      onPaid(error instanceof Error ? error.message : locale === "zh" ? "結帳失敗" : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  const timelineSteps = [
    { zh: "訂單已建立", en: "Order created" },
    { zh: "廠商集貨與品檢", en: "Vendor pick-up & QC" },
    { zh: "抵達門市 / 出貨", en: "Arrived at store / shipment" },
  ];

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeModal}>
      <div
        className="w-full max-w-[1000px] max-h-[88vh] overflow-y-auto rounded-[2rem] border border-border bg-white shadow-elevated transition-all"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 頂部標題 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-6 py-4 backdrop-blur-md">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Checkout / Fulfillment</p>
            <h2 className="text-xl font-extrabold">
              {step === 1
                ? locale === "zh"
                  ? "確認訂單與付款"
                  : "Confirm order and payment"
                : locale === "zh"
                  ? "物流出貨追蹤"
                  : "Shipment tracking"}
            </h2>
          </div>
          <button onClick={closeModal} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {step === 1 ? (
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              {/* 1. 購物車明細 */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {locale === "zh" ? "購物車明細" : "Cart details"}
                </h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-stone-50 px-3.5 py-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-semibold">{item.name}</p>
                        <div className="inline-flex items-center gap-1.5">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                            {item.tempType === "cold" ? (locale === "zh" ? "❄️ 冷鏈" : "Cold chain") : locale === "zh" ? "🌱 常溫" : "Ambient"}
                          </span>
                          <span className="text-xs text-muted-foreground">x{item.qty ?? 1}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold">NT${item.price * (item.qty ?? 1)}</span>
                    </div>
                  ))}
                </div>
                {hasMixedTemp && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    ⚠️ {locale === "zh" ? "偵測到混溫訂單，將以冷鏈與常溫分開安排取貨。" : "Mixed-temperature order detected."}
                  </div>
                )}
              </div>

              {/* 2. 取貨方式 */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {locale === "zh" ? "取貨方式" : "Pickup method"}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {(Object.keys(SHIPPING_LABELS) as ShippingType[]).map((type) => {
                    const disabled = hasColdItems && (type === "UNIMARTC2C" || type === "FAMILY");
                    const active = shippingType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        disabled={disabled}
                        onClick={() => setShippingType(type)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white hover:border-primary/40"
                        } ${disabled ? "cursor-not-allowed opacity-50 bg-slate-50" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="size-4 text-primary" />
                          <p className="font-semibold text-sm">{SHIPPING_LABELS[type][locale]}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{SHIPPING_LABELS[type].desc}</p>
                      </button>
                    );
                  })}
                </div>
                {disallowPickup && (
                  <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                    ❄️ {locale === "zh" ? "冷鏈商品目前僅支援合作社門市自取或黑貓冷鏈宅配。" : "Cold-chain items current support co-op pickup."}
                  </div>
                )}
              </div>

              {/* 3. 付款方式 */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {locale === "zh" ? "付款方式" : "Payment"}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {(Object.keys(PAYMENT_LABELS) as PaymentType[]).map((type) => {
                    const active = paymentType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPaymentType(type)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {type === "ECPAY" && <CreditCard className="size-4 text-primary" />}
                          {type === "WALLET" && <Wallet className="size-4 text-primary" />}
                          {type === "BANK_TRANSFER" && <Building2 className="size-4 text-primary" />}
                          {type === "COD" && <Store className="size-4 text-primary" />}
                          <p className="font-semibold text-sm">{PAYMENT_LABELS[type][locale]}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_LABELS[type].desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* 銀行轉帳備註 */}
                {paymentType === "BANK_TRANSFER" && (
                  <div className="mt-3 rounded-2xl border border-border bg-stone-50 p-4 text-xs space-y-2 animate-fade-in">
                    <p className="font-bold text-foreground">匯款帳號：(808) 0012-9876-54321 (玉山銀行)</p>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="請輸入轉帳帳號後 5 碼 (選填，Demo 預設 88888)"
                      value={bankLastFive}
                      onChange={(e) => setBankLastFive(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* 超商門市選擇 */}
              {(shippingType === "UNIMARTC2C" || shippingType === "FAMILY") && (
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      <div>
                        <p className="text-sm font-bold">{locale === "zh" ? "選擇門市" : "Choose store"}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedStore ? selectedStore.CVSStoreName : locale === "zh" ? "尚未選擇門市" : "No store selected"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStorePickerOpen(true)}
                      className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background hover:brightness-110"
                    >
                      {locale === "zh" ? "選擇門市" : "Pick store"}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={busy || cart.length === 0 || disallowPickup}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50 hover:brightness-110 transition-all shadow-md"
              >
                <ShieldCheck className="size-4" />
                {busy
                  ? locale === "zh"
                    ? "處理中..."
                    : "Processing..."
                  : locale === "zh"
                    ? "確認付款"
                    : "Confirm payment"}
              </button>
            </section>

            {/* 右側摘要 */}
            <aside className="space-y-4 rounded-3xl border border-border bg-slate-50/50 p-5 h-fit">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "訂單摘要" : "Order summary"}
              </h3>
              <div className="rounded-2xl border border-border bg-white p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{locale === "zh" ? "小計" : "Subtotal"}</span>
                  <span className="font-mono">NT${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{locale === "zh" ? "運費" : "Shipping"}</span>
                  <span className="font-mono">NT${shippingFee}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
                  <span>{locale === "zh" ? "應付總額" : "Total"}</span>
                  <span className="font-mono text-primary text-lg">NT${total}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-primary">
                {locale === "zh"
                  ? `目前儲值金餘額：NT$${walletBalance.toLocaleString()}`
                  : `Wallet balance: NT$${walletBalance.toLocaleString()}`}
              </div>
            </aside>
          </div>
        ) : (
          /* 第二階段：出貨狀態追蹤與自提驗證碼 */
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
            <section className="space-y-5 rounded-3xl border border-border bg-slate-50/50 p-5">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    {locale === "zh" ? "訂單成立" : "Order confirmed"}
                  </p>
                  <h3 className="text-lg font-extrabold">{orderId || "TSM-ORDER"}</h3>
                </div>
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  {locale === "zh" ? "處理中" : "Processing"}
                </span>
              </div>

              {/* 📱 顯示現場自提驗證碼 */}
              <div className="p-4 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/50 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-900">📱 現場自提取貨驗證碼</p>
                <div className="p-3 bg-white rounded-xl border font-mono text-xs font-extrabold text-emerald-700 select-all">
                  COOP-PICKUP:{orderId}:{Date.now()}
                </div>
                <p className="text-[11px] text-muted-foreground">（提示：您可以複製此碼至後台「物流管理」進行一鍵核銷）</p>
              </div>

              <div className="space-y-4">
                {timelineSteps.map((item, idx) => {
                  const isDone = idx < 1;
                  return (
                    <div key={item.zh} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`grid size-8 place-items-center rounded-full ${isDone ? "bg-primary text-primary-foreground" : "bg-stone-200 text-muted-foreground"}`}>
                          {isDone ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
                        </div>
                        {idx < timelineSteps.length - 1 && <div className="mt-1 h-10 w-px bg-border" />}
                      </div>
                      <div className="rounded-2xl border border-border bg-white px-4 py-3 flex-1">
                        <p className="text-sm font-bold text-foreground">{item[locale]}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {idx === 0
                            ? locale === "zh"
                              ? "系統已收到訂單並寫入資料庫。"
                              : "Order created successfully."
                            : idx === 1
                              ? locale === "zh"
                                ? "廠商會依照商品屬性進行集貨與品檢。"
                                : "Vendor is packing and quality checking."
                              : locale === "zh"
                                ? "抵達門市或寄出後將通知會員取貨。"
                                : "Pickup notification will be sent once shipped."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-4 rounded-3xl border border-border bg-slate-50/50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "物流資訊" : "Shipment details"}
              </h3>
              <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="size-4 text-primary" />
                  <span>{locale === "zh" ? "取貨方式" : "Pickup"}: {SHIPPING_LABELS[shippingType][locale]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="size-4 text-primary" />
                  <span>{locale === "zh" ? "付款方式" : "Payment"}: {PAYMENT_LABELS[paymentType][locale]}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-bold text-background hover:brightness-110"
              >
                {locale === "zh" ? "關閉視窗" : "Close window"}
              </button>
            </aside>
          </div>
        )}

        <ECPayLogisticsModal
          open={storePickerOpen}
          onClose={() => setStorePickerOpen(false)}
          onSelect={(store) => {
            setSelectedStore(store);
            setStorePickerOpen(false);
          }}
        />
      </div>
    </div>
  );
}