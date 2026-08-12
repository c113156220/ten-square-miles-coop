export type ProductCategory = "all" | "fresh" | "dairy_eggs" | "processed" | "household";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  categoryName: string;
  tempType: "cold" | "ambient"; // ❄️ 冷鏈 | 🌱 常溫
  image: string;
  unit: string;
  stock: number;
  description: string;
  isPopular?: boolean;
};

export const PRODUCT_CATEGORIES: { id: ProductCategory; name: string; icon: string }[] = [
  { id: "all", name: "全部商品", icon: "🛒" },
  { id: "fresh", name: "生鮮農產", icon: "🥬" },
  { id: "dairy_eggs", name: "蛋品與乳品", icon: "🥚" },
  { id: "processed", name: "合作社加工品", icon: "🫙" },
  { id: "household", name: "生活日用品", icon: "🧼" },
];

export const DEMO_PRODUCTS: Product[] = [
  // 🥬 生鮮農產
  {
    id: "prod-001",
    name: "有機高麗菜 (顆)",
    price: 65,
    category: "fresh",
    categoryName: "生鮮農產",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1598170845058-12ef4a45753b?w=500&auto=format&fit=crop",
    unit: "約 1.2kg",
    stock: 25,
    description: "在地小農契作有機高麗菜，口感清甜脆口。",
    isPopular: true,
  },
  {
    id: "prod-002",
    name: "特級紅心芭樂 (袋)",
    price: 120,
    category: "fresh",
    categoryName: "生鮮農產",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1536511135885-33f7fae44845?w=500&auto=format&fit=crop",
    unit: "1.5kg / 袋",
    stock: 18,
    description: "含豐富維生素C，果肉厚實香甜。",
  },
  {
    id: "prod-003",
    name: "冷凍履歷台灣白蝦",
    price: 280,
    category: "fresh",
    categoryName: "生鮮農產",
    tempType: "cold",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&auto=format&fit=crop",
    unit: "300g / 包",
    stock: 12,
    description: "急凍保鮮，肉質緊實彈牙，無抗生素殘留。",
    isPopular: true,
  },

  // 🥚 蛋品與乳品
  {
    id: "prod-004",
    name: "人道飼養放牧紅殼蛋",
    price: 135,
    category: "dairy_eggs",
    categoryName: "蛋品與乳品",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop",
    unit: "10 顆 / 盒",
    stock: 30,
    description: "自然放牧健康母雞產下，蛋黃濃郁無腥味。",
    isPopular: true,
  },
  {
    id: "prod-005",
    name: "合作社限定 鮮乳坊無調整鮮乳",
    price: 98,
    category: "dairy_eggs",
    categoryName: "蛋品與乳品",
    tempType: "cold",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop",
    unit: "936ml / 瓶",
    stock: 15,
    description: "單一牧場無調整成份，保存最純粹的乳香。",
  },

  // 🫙 合作社加工品
  {
    id: "prod-006",
    name: "古法壓榨純黑芝麻油",
    price: 350,
    category: "processed",
    categoryName: "合作社加工品",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop",
    unit: "500ml / 瓶",
    stock: 8,
    description: "嚴選台灣本土黑芝麻，低溫烘焙冷壓製造。",
    isPopular: true,
  },
  {
    id: "prod-007",
    name: "手工冷壓無添加釀造醬油",
    price: 220,
    category: "processed",
    categoryName: "合作社加工品",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500&auto=format&fit=crop",
    unit: "420ml / 瓶",
    stock: 20,
    description: "非基改黃豆經過 180 天自然發酵釀造。",
  },
  {
    id: "prod-008",
    name: "手工急速冷凍手工水餃 (豬肉高麗菜)",
    price: 180,
    category: "processed",
    categoryName: "合作社加工品",
    tempType: "cold",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop",
    unit: "20 顆 / 包",
    stock: 14,
    description: "使用國產溫體豬肉與契作高麗菜，多汁飽滿。",
  },

  // 🧼 生活日用品
  {
    id: "prod-009",
    name: "天然茶籽環保洗碗精",
    price: 160,
    category: "household",
    categoryName: "生活日用品",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop",
    unit: "1000ml / 補充包",
    stock: 40,
    description: "天然苦茶籽萃取，溫和不傷手、生物可分解。",
  },
  {
    id: "prod-010",
    name: "100% 原生紙漿抽取式衛生紙",
    price: 240,
    category: "household",
    categoryName: "生活日用品",
    tempType: "ambient",
    image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&auto=format&fit=crop",
    unit: "100 抽 x 12 包 / 串",
    stock: 50,
    description: "不含螢光劑，紙質柔韌不易破，永續森林認證。",
  },
];