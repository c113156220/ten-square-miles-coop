// src/lib/logistics-utils.ts

export type TempLayer = "normal" | "frozen"; // 常溫 | 冷凍
export type DeliveryMethod = "self_pickup" | "711" | "family" | "black_cat";

export interface CartItem {
  id: string;
  name: string;
  tempLayer: TempLayer;
}

/**
 * 1. 溫層限制自動檢查
 * 如果購物車內含有冷凍商品，則自動禁止「超商取貨（7-11/全家）」
 */
export function getAvailableDeliveryMethods(cartItems: CartItem[]): {
  allowedMethods: DeliveryMethod[];
  hasFrozen: boolean;
} {
  const hasFrozen = cartItems.some((item) => item.tempLayer === "frozen");

  if (hasFrozen) {
    // 含有冷凍商品：僅開放「門市/宿舍自提」與「黑貓冷凍宅配」
    return {
      allowedMethods: ["self_pickup", "black_cat"],
      hasFrozen: true,
    };
  }

  // 純常溫商品：開放所有配送管道
  return {
    allowedMethods: ["self_pickup", "711", "family", "black_cat"],
    hasFrozen: false,
  };
}

/**
 * 2. 產生格式化的自提 QR Code / 取貨碼字串
 * 格式：COOP-PICKUP:[訂單ID]:[時間戳記]
 */
export function generatePickupQRCodeValue(orderId: string): string {
  return `COOP-PICKUP:${orderId}:${Date.now()}`;
}