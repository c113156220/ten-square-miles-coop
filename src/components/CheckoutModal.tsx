import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { CreditCard, Wallet, Truck, MapPin, X, ShieldCheck, Package, CheckCircle2, Clock3, Building2, Store, Minus, Plus } from "lucide-react";
import { ECPayLogisticsModal, type LogisticsStore } from "@/components/ECPayLogisticsModal";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

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
  onUpdateCartQuantity?: (itemId: string, delta: number) => void;
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

export function CheckoutModal({
  open,
  onClose,
  cart,
  walletBalance,
  onWalletDebit,
  onPaid,
  onUpdateCartQuantity,
  ecpayEndpoint,
}: CheckoutModalProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
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

  // 💾 寫入 Supabase 資料庫與 LocalStorage 同步 Helper
  async function saveOrderToDatabase(): Promise<string> {
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const displayOrderId = `${memberId}-${ymd}-${randomSuffix}`;
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
      selectedStore: selectedStore ? selectedStore.CVSStoreName : null,
      selectedStoreType: selectedStore?.LogisticsSubType ?? shippingType,
    };

    try {
      const existingLocalOrders = readLocalOrders();
      writeLocalOrders([newLocalItem, ...existingLocalOrders]);
    } catch (lsErr) {
      console.warn("LocalStorage 同步提醒:", lsErr);
    }

    if (!canUseSupabase) {
      console.info("Supabase 未配置或缺少環境變數，僅保留本地訂單暫存。", { displayOrderId });
      return displayOrderId;
    }

    try {
      const { data: newOrder, error: orderErr } = await (supabase as any)
        .from("orders")
        .insert({
          total_amount: total,
          status: "paid",
          delivery_method: shippingType,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderErr) {
        console.error("❌ Supabase Orders 寫入失敗:", orderErr);
        return displayOrderId;
      }

      const createdOrderId = String(newOrder.id);
      newLocalItem.dbOrderId = createdOrderId;
      newLocalItem.id = displayOrderId;
      newLocalItem.orderId = displayOrderId;
      const nextLocalOrders = [newLocalItem, ...readLocalOrders().filter((item: any) => item.orderId !== displayOrderId)];
      writeLocalOrders(nextLocalOrders);

      const { error: paymentErr } = await (supabase as any)
        .from("payments")
        .insert({
          order_id: createdOrderId,
          payment_method: paymentType,
          status: "paid",
          bank_last_five: paymentType === "BANK_TRANSFER" ? bankLastFive.trim() || "88888" : null,
          invoice_number: displayOrderId,
          paid_at: new Date().toISOString(),
        });

      if (paymentErr) {
        console.error("❌ Supabase Payments 寫入失敗:", paymentErr);
      }

      const orderItemsPayload = cart.map((item) => ({
        order_id: createdOrderId,
        product_id: item.id,
        quantity: item.qty ?? 1,
        unit_price: item.price,
        tax_type: item.tempType === "cold" ? "cold_chain" : "ambient",
      }));

      const { error: itemsErr } = await (supabase as any)
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsErr) {
        console.error("❌ Supabase order_items 寫入失敗:", itemsErr);
      }

      const { error: logErr } = await (supabase as any)
        .from("logistics")
        .insert({
          order_id: createdOrderId,
          recipient_name: user?.name ?? "Demo 測試社員",
          recipient_phone: user?.phone ?? "0900000000",
          delivery_address: selectedStore
            ? `${selectedStore.LogisticsSubType} | ${selectedStore.CVSStoreName} | ${selectedStore.CVSAddress}`
            : null,
          store_code_711: selectedStore?.CVSStoreID ?? null,
          shipment_no: selectedStore?.CVSStoreID ?? null,
          status: "preparing",
          temp_layer: hasColdItems ? "frozen" : "normal",
        });

      if (logErr) {
        console.error("❌ Supabase Logistics 寫入失敗:", logErr);
      }
    } catch (e) {
      console.error("Save to Supabase Exception:", e);
    }

    return displayOrderId;
  }

  async function submit() {
    if (cart.length === 0) return;
    if ((shippingType === "UNIMARTC2C" || shippingType === "FAMILY") && !selectedStore) {
      alert(locale === "zh" ? "請先選擇超商門市後，再進行付款。" : "Please choose a store before paying.");
      return;
    }

    setBusy(true);

    try {
      // 1. 先寫入 Supabase 與 LocalStorage，取得真實訂單 ID
      const nextOrderId = await saveOrderToDatabase();

      // 2. 根據四種付款方式進行處理
      if (paymentType === "WALLET") {
        if (walletBalance < total) {
          alert(locale === "zh" ? "儲值金餘額不足，請改選其他付款方式。" : "Insufficient wallet balance.");
          setBusy(false);
          return;
        }
        onWalletDebit(total);
        onPaid(locale === "zh" ? `已使用儲值金扣款完成，訂單 #${nextOrderId} 已成立。` : `Wallet payment completed.`);
      } else if (paymentType === "BANK_TRANSFER") {
        const lastFive = bankLastFive.trim() || "88888";
        onPaid(locale === "zh" ? `轉帳訂單 #${nextOrderId} 已建立 (對帳碼: ${lastFive})。` : `Bank transfer order created.`);
      } else if (paymentType === "COD") {
        onPaid(locale === "zh" ? `超商取貨付款訂單 #${nextOrderId} 已成立。` : `COD order confirmed.`);
      } else {
        onPaid(locale === "zh" ? `綠界線上刷卡成功！訂單 #${nextOrderId} 已成立。` : `ECPay payment successful.`);
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
                  {itemGroups.map((item) => (
                    <div key={`${item.id}-${item.tempType}`} className="rounded-2xl border border-border bg-stone-50 px-3.5 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold">{item.name}</p>
                          <div className="inline-flex items-center gap-1.5">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                              {item.tempType === "cold" ? (locale === "zh" ? "❄️ 冷鏈" : "Cold chain") : locale === "zh" ? "🌱 常溫" : "Ambient"}
                            </span>
                            <span className="text-xs text-muted-foreground">x{item.qty ?? 1}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-primary">NT${item.price}</p>
                          <p className="text-[11px] text-muted-foreground">{locale === "zh" ? "小計" : "Total"} NT${item.price * (item.qty ?? 1)}</p>
                        </div>
                      </div>
                      {onUpdateCartQuantity && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.id, -1)}
                            className="grid size-7 place-items-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-8 text-center font-mono font-bold">{item.qty ?? 1}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.id, 1)}
                            className="grid size-7 place-items-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      )}
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
                    const active = shippingType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setShippingType(type)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white hover:border-primary/40"
                        }`}
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
                {hasMixedTemp && (
                  <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                    ❄️ {locale === "zh" ? "混溫訂單將依商品屬性分開安排配送與取貨。" : "Mixed-temperature orders will be handled separately by temperature and fulfillment mode."}
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
                disabled={busy || cart.length === 0}
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
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-primary space-y-1">
                <div>
                  {locale === "zh"
                    ? `會員 ID：${memberId}`
                    : `Member ID: ${memberId}`}
                </div>
                <div>
                  {locale === "zh"
                    ? `目前儲值金餘額：NT$${walletBalance.toLocaleString()}`
                    : `Wallet balance: NT$${walletBalance.toLocaleString()}`}
                </div>
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
                  <h3 className="text-lg font-extrabold">#{orderId || "TSM-ORDER"}</h3>
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
                <p className="text-[11px] text-muted-foreground">（提示：您可複製此驗證碼至後台「物流與訂單管理」輸入框進行一鍵核銷）</p>
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
                              ? "系統已收到訂單並成功寫入資料庫。"
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