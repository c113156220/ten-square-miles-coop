# 專案

### Project Overview

Create a web-based Co-operative Management & E-commerce System called "十圓方里" (Ten Square Miles Co-op). 

The system operates as a hybrid platform serving three core identities: Member (社員), Customer (顧客), and Shareholder (股東). It must support dual workflows: "Co-op Administration (社務系統)" and "E-commerce & Pre-order Operation (業務系統)".

---

### Language & i18n Support (多國語言支援)

- **Bilingual Interface**: Support full internationalization (i18n) with an instant language switcher in the navbar/header for **Traditional Chinese (繁體中文)** and **English (EN)**.

- All system labels, menu items, status badges, and user workflows must seamlessly render based on the selected language.

---

### Key Roles & Authentication

1. **User Roles**: 

   - Guest / Non-member (非社員)

   - Verified Member (社員)

   - Board / Admin (理監事 / 管理員)

2. **Member Onboarding & Identity**:

   - Real-name verification (實名認證) workflow.

   - Application Form -> Admin Backend Review -> mandatory "Co-op Educational Training (社務教育)" tracking -> Board Approval -> Stock Share issuing & Unique Member ID assignment.

---

### Core Module 1: E-commerce & Supply Chain (零庫存預購與共同購買)

1. **Member Wishlist & Demand Pooling (願望清單與需求預測)**:

   - Members can submit product ideas/wishlists. Successful sourcing awards reward points (積點).

   - "Demand Survey (線上意象調查)" widget before formal order placement to forecast vendor stock.

2. **Pre-order Flow (無庫存預購機制)**:

   - Display real-time pre-order counts and "Hot Items (熱銷商品)".

   - Members must pay a deposit/full amount to lock in order before the deadline. Orders close -> Purchase from vendor.

3. **Product & Tax Matrix (稅務與商品分類引擎)**:

   - **Primary Agricultural Products (一級農產品)**: Tax-exempt (免稅).

   - **Processed Foods / Healthy Bento Boxes (加工食品/健康餐盒)**: Standard Tax Rate (應稅).

   - **Sales Cap Guardian**: Track non-member sales limit (must remain ≤ 30% of total revenue). Auto-apply tax & Third-party Payment Invoice (第三方支付發票串接) for non-member transactions.

4. **Special Inventory & Logistics (特殊商品進銷存與配送)**:

   - Temperature/Handling flags for different SKUs (e.g., Fresh Eggs vs. Soy Sauce).

   - Delivery methods: Self-pickup (現場取貨) or Home Delivery (宅配).

---

### Core Module 2: Co-op Governance & Surplus Distribution (社務與結餘分配)

1. **Governance Dashboard (民主治理與會議管理)**:

   - Annual General Meeting (社員大會) tracker: 1 member = 1 vote voting module.

   - Bi-annual Board Meeting (社務會議) logger.

   - Member Education Center (社務教育學習專區).

2. **Surplus Engine (結餘與回饋計算機)**:

   - Financial ledger dividing total revenue into Costs, Reserve Fund (50% 合作資本/公積金), and Member Returns.

   - Distribute remaining surplus (50%) based on **Member Purchase Contribution Ratio (消費貢獻度/累積點數)** rather than just stock holding.

---

### UI / UX Requirements

- Modern, clean, and friendly design reflecting health, sustainability, and community trust.

- Responsive layout with clear single entry point (單一入口) switching between Member Portal and Administrative Control Panel.

- Interactive status tags for orders in both Chinese and English: 

  - [Surveying / 意象調查中] -> [Pre-ordering / 預購中] -> [Sourcing / 廠商進貨中] -> [Ready for Pickup/Delivery / 待取貨].

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ten-square-miles-coop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4e24424d-47a8-4738-b338-9e2b261e0592).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
