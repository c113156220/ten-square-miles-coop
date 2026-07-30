import { useMemo, useState } from "react";
import { CreditCard, Wallet, Truck, MapPin, X, ShieldCheck } from "lucide-react";
import { ECPayLogisticsModal, type LogisticsStore } from "@/components/ECPayLogisticsModal";
import { useI18n } from "@/lib/i18n";

export type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  tempType: "cold" | "ambient";
  qty?: number;
};

type ShippingType = "NTHU_PICKUP" | "UNIMARTC2C" | "FAMI C2C" | "BLACKCAT";
type PaymentType = "ECPAY" | "WALLET";

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
  NTHU_PICKUP: 0,
  UNIMARTC2C: 60,
  "FAMI C2C": 60,
  BLACKCAT: 100,
};

const SHIPPING_LABELS: Record<ShippingType, { zh: string; en: string }> = {
  NTHU_PICKUP: { zh: "清大站點定點自提 (免費)", en: "NTHU pickup (free)" },
  UNIMARTC2C: { zh: "7-11 超商取貨 (運費 $60)", en: "7-ELEVEN pickup ($60)" },
  "FAMI C2C": { zh: "全家超商取貨 (運費 $60)", en: "FamilyMart pickup ($60)" },
  BLACKCAT: { zh: "黑貓宅配 (運費 $100)", en: "Black Cat delivery ($100)" },
};

const PAYMENT_LABELS: Record<PaymentType, { zh: string; en: string; desc: string }> = {
  ECPAY: { zh: "綠界線上支付 (信用卡/LINE Pay/ATM 虛擬帳號)", en: "ECPay online payment (card/LINE Pay/ATM)", desc: "Sandbox form submission" },
  WALLET: { zh: "社群儲值金/電子錢包 (一鍵扣款)", en: "Wallet / stored value (one-click)", desc: "Instant local debit" },
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
  const [shippingType, setShippingType] = useState<ShippingType>("NTHU_PICKUP");
  const [paymentType, setPaymentType] = useState<PaymentType>("ECPAY");
  const [selectedStore, setSelectedStore] = useState<LogisticsStore | null>(null);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const hasColdItems = cart.some((item) => item.tempType === "cold");
  const disallowPickup = hasColdItems && (shippingType === "UNIMARTC2C" || shippingType === "FAMI C2C");
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0), [cart]);
  const shippingFee = SHIPPING_FEES[shippingType];
  const total = subtotal + shippingFee;

  if (!open) return null;

  async function submit() {
    if (disallowPickup) return;
    setBusy(true);
    try {
      if (paymentType === "WALLET") {
        if (walletBalance < total) {
          onPaid(locale === "zh" ? "儲值金不足，請改用綠界支付。" : "Insufficient wallet balance. Switch to ECPay.");
          return;
        }
        onWalletDebit(total);
        onPaid(locale === "zh" ? "已使用儲值金扣款完成。" : "Wallet payment completed.");
        onClose();
        return;
      }

      const payload = {
        order_id: buildOrderId(),
        amount: total,
        shipping_type: shippingType,
        items: cart.map((item) => ({ name: item.name, qty: item.qty ?? 1, price: item.price })),
        store: selectedStore,
      };
      const response = await fetch(ecpayEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`ECPay checkout failed: ${response.status}`);
      const html = await response.text();
      const popup = window.open("", "_blank", "noopener,noreferrer,width=420,height=720");
      if (!popup) throw new Error("Popup blocked");
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      onPaid(locale === "zh" ? "已開啟綠界測試付款頁面。" : "Opened the ECPay sandbox payment page.");
      onClose();
    } catch (error) {
      onPaid(error instanceof Error ? error.message : locale === "zh" ? "結帳失敗" : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-4 left-1/2 w-[min(96vw,1060px)] -translate-x-1/2 rounded-[2rem] border border-border bg-white shadow-elevated"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Checkout / ECPay</p>
            <h2 className="text-xl font-extrabold">{locale === "zh" ? "金物流結帳" : "Checkout and logistics"}</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "取貨方式" : "Shipping"}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {(Object.keys(SHIPPING_LABELS) as ShippingType[]).map((type) => {
                  const disabled = hasColdItems && (type === "UNIMARTC2C" || type === "FAMI C2C");
                  const active = shippingType === type;
                  return (
                    <button
                      key={type}
                      disabled={disabled}
                      onClick={() => setShippingType(type)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        <p className="font-semibold">{SHIPPING_LABELS[type][locale]}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {type === "NTHU_PICKUP"
                          ? locale === "zh"
                            ? "適合常溫與冷藏彈性取貨"
                            : "Best for flexible pickup"
                          : locale === "zh"
                            ? "需搭配綠界 E-Map 選鋪"
                            : "Requires E-Map store selection"}
                      </p>
                    </button>
                  );
                })}
              </div>
              {disallowPickup && (
                <div className="mt-3 rounded-2xl border border-accent/30 bg-accent/5 p-3 text-sm text-accent">
                  ⚠ {locale === "zh" ? "冷凍生鮮商品僅支援清大定點自提或宅配" : "Frozen items only support NTHU pickup or delivery"}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "付款方式" : "Payment"}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {(Object.keys(PAYMENT_LABELS) as PaymentType[]).map((type) => {
                  const active = paymentType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setPaymentType(type)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {type === "ECPAY" ? <CreditCard className="size-4 text-primary" /> : <Wallet className="size-4 text-primary" />}
                        <p className="font-semibold">{PAYMENT_LABELS[type][locale]}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_LABELS[type].desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {shippingType !== "NTHU_PICKUP" && (
              <div className="rounded-2xl border border-border bg-surface/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold">{locale === "zh" ? "門市 / 取貨地址" : "Store / pickup address"}</p>
                      <p className="text-xs text-muted-foreground">{selectedStore ? selectedStore.CVSStoreName : locale === "zh" ? "尚未選擇門市" : "No store selected"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStorePickerOpen(true)}
                    className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
                  >
                    {locale === "zh" ? "選擇門市" : "Pick store"}
                  </button>
                </div>
                {selectedStore && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedStore.CVSStoreID} · {selectedStore.CVSAddress}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={submit}
              disabled={busy || disallowPickup}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              <ShieldCheck className="size-4" />
              {paymentType === "WALLET"
                ? locale === "zh"
                  ? "確認付款並扣款"
                  : "Confirm wallet payment"
                : locale === "zh"
                  ? "確認付款並前往綠界"
                  : "Confirm payment and open ECPay"}
            </button>
          </section>

          <aside className="space-y-4 rounded-3xl border border-border bg-surface/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{locale === "zh" ? "訂單摘要" : "Order summary"}</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-white px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.tempType === "cold" ? "Cold" : "Ambient"}</p>
                  </div>
                  <span className="font-mono font-bold">NT${item.price}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="flex justify-between text-sm">
                <span>{locale === "zh" ? "小計" : "Subtotal"}</span>
                <span className="font-mono">NT${subtotal}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>{locale === "zh" ? "運費" : "Shipping"}</span>
                <span className="font-mono">NT${shippingFee}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>{locale === "zh" ? "應付總額" : "Total"}</span>
                <span className="font-mono text-primary">NT${total}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              {locale === "zh"
                ? `目前儲值金 NT$${walletBalance.toLocaleString()}`
                : `Wallet balance NT$${walletBalance.toLocaleString()}`}
            </div>
          </aside>
        </div>

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
