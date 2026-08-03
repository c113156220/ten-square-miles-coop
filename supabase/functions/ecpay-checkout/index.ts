import { createClient } from "jsr:@supabase/supabase-js@2";

type CheckoutItem = {
  name: string;
  qty: number;
  price: number;
};

type CheckoutRequest = {
  order_id: string;
  amount: number;
  items: CheckoutItem[];
  shipping_type: string;
  store?: {
    CVSStoreName?: string;
    CVSStoreID?: string;
    CVSAddress?: string;
    LogisticsSubType?: string;
  } | null;
};

const MERCHANT_ID = "3002615";
const HASH_KEY = "pwFAd4pS2nWXGScJ";
const HASH_IV = "v7D1FRh21gahY6BD";
const CHECKOUT_URL = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
const RETURN_URL = `${Deno.env.get("SUPABASE_FUNCTION_BASE_URL") ?? "http://localhost:54321/functions/v1"}/ecpay-checkout?return=1`;
const CLIENT_BACK_URL = Deno.env.get("ECPAY_CLIENT_BACK_URL") ?? "http://localhost:8080/orders";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

function encode(value: string) {
  return encodeURIComponent(value)
    .replace(/\*/g, "%2a")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function sha256Upper(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function checkMacValue(params: Record<string, string>) {
  const sorted = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const raw = `HashKey=${HASH_KEY}&${sorted}&HashIV=${HASH_IV}`;
  const encoded = encode(raw).toLowerCase();
  return sha256Upper(encoded).toUpperCase();
}

function htmlForm(action: string, fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replaceAll("\"", "&quot;")}" />`)
    .join("");
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ECPay Sandbox Checkout</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; background: #eff6f1; color: #184b3a; margin: 0; padding: 24px; }
      .card { max-width: 640px; margin: 0 auto; background: white; border-radius: 24px; padding: 24px; box-shadow: 0 16px 50px rgba(0,0,0,.08); }
      button { background: #1e8e63; color: white; border: 0; border-radius: 999px; padding: 12px 18px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>綠界測試付款頁面</h1>
      <p>系統將自動跳轉至 Sandbox 金流。</p>
      <form id="ecpay-form" method="post" action="${action}">
        ${inputs}
      </form>
      <button type="button" onclick="document.getElementById('ecpay-form').submit()">立即跳轉</button>
    </div>
    <script>document.getElementById('ecpay-form').submit();</script>
  </body>
</html>`;
}

function parseCheckoutItems(items: CheckoutItem[]) {
  return items.map((item) => `${item.name} x${item.qty}`).join("#");
}

async function handleCheckout(request: CheckoutRequest) {
  const orderId = request.order_id;
  const merchantTradeNo = orderId.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
  const tradeDate = formatDate(new Date());
  const itemName = parseCheckoutItems(request.items);

  const baseFields: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(Math.max(1, Math.round(request.amount))),
    TradeDesc: "Ten Sq Miles Co-op order",
    ItemName: itemName,
    ReturnURL: RETURN_URL,
    ClientBackURL: CLIENT_BACK_URL,
    ChoosePayment: "ALL",
    EncryptType: "1",
    CustomField1: request.shipping_type,
    CustomField2: request.store?.CVSStoreID ?? "",
    CustomField3: request.store?.CVSStoreName ?? "",
    CustomField4: request.store?.CVSAddress ?? "",
  };

  const checkMacValueResult = await checkMacValue(baseFields);
  const fields = {
    ...baseFields,
    MerchantID: MERCHANT_ID,
    CheckMacValue: checkMacValueResult,
  };
  return new Response(htmlForm(CHECKOUT_URL, fields), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleReturn(form: FormData) {
  const merchantTradeNo = String(form.get("MerchantTradeNo") ?? "");
  const rtnCode = Number(form.get("RtnCode") ?? 0);
  const paymentType = String(form.get("PaymentType") ?? "");

  if (rtnCode === 1 && supabase && merchantTradeNo) {
    await supabase
      .from("orders")
      .update({ payment_status: "paid", payment_type: paymentType, paid_at: new Date().toISOString() })
      .eq("order_id", merchantTradeNo);
  }

  return new Response("1|OK", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const isReturn = url.pathname.endsWith("/return") || url.searchParams.get("return") === "1";

  if (request.method === "POST" && isReturn) {
    const form = await request.formData();
    return await handleReturn(form);
  }

  if (request.method === "POST") {
    const body = await request.json() as CheckoutRequest;
    return await handleCheckout(body);
  }

  return new Response(JSON.stringify({ ok: true, message: "ECPay checkout function is running" }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
});
