# 專案
#### 🌐 多國語言支援 (Language & i18n Support) [cite: 1]
*   **雙語介面**：支援完整的國際化（i18n），在導覽列/頁首（Navbar/Header）提供 **繁體中文 (Traditional Chinese)** 與 **英文 (English)** 的即時語言切換功能 [cite: 1]。
*   系統內的所有標籤、選單項目、狀態徽章以及使用者工作流程，都必須根據所選擇的語言無縫渲染 [cite: 1]。

---

#### 🔑 關鍵角色與身分驗證 (Key Roles & Authentication) [cite: 2]
1.  **使用者角色** [cite: 2]：
    *   訪客 / 非社員 (Guest / Non-member) [cite: 2]
    *   已驗證社員 (Verified Member) [cite: 2]
    *   理監事 / 管理員 (Board / Admin) [cite: 2]
2.  **社員入社與身分驗證** [cite: 2]：
    *   實名認證工作流 [cite: 2]。
    *   申請表單 ➡️ 管理員後台審核 ➡️ 強制性「合作社社務教育訓練」進度追蹤 ➡️ 理監事會核准 ➡️ 發放股金與分配唯一社員 ID [cite: 2]。

---

#### 📦 核心模組一：電子商務與供應鏈（零庫存預購與共同購買） [cite: 3]
1.  **願望清單與需求彙整 (Member Wishlist & Demand Pooling)** [cite: 3]：
    *   社員可以提交商品想法或願望清單，成功採購將獲得獎勵點數（積點） [cite: 3]。
    *   在正式下單前提供「線上意向調查」小工具，以預測廠商庫存 [cite: 3]。
2.  **無庫存預購機制 (Pre-order Flow)** [cite: 3]：
    *   即時顯示預購數量與「熱銷商品」 [cite: 3]。
    *   社員必須在截止日期前支付訂金或全額以鎖定訂單。訂單截止後 ➡️ 向廠商採購 [cite: 3]。
3.  **商品與稅務矩陣 (Product & Tax Matrix)** [cite: 3]：
    *   **一級農產品**：免稅 [cite: 3]。
    *   **加工食品 / 健康餐盒**：標準稅率（應稅） [cite: 3]。
    *   **非社員銷售限額守護者**：追蹤非社員銷售額限制（必須維持在總營收的 30% 以下） [cite: 3]。針對非社員交易，系統會自動計稅並串接第三方支付發票 [cite: 3]。
4.  **特殊庫存與物流 (Special Inventory & Logistics)** [cite: 3]：
    *   針對不同的 SKU（例如鮮蛋與醬油）設定溫控或特殊處理標記 [cite: 3]。
    *   配送方式：現場自取或宅配 [cite: 3]。

---

#### ⚖️ 核心模組二：合作社治理與結餘分配（社務與結餘分配） [cite: 4]
1.  **民主治理儀表板 (Governance Dashboard)** [cite: 4]：
    *   年度社員大會追蹤器：實作「一人一票」投票模組 [cite: 4]。
    *   每半年召開的社務會議記錄器 [cite: 4]。
    *   社員教育學習專區 [cite: 4]。
2.  **結餘與回饋計算機 (Surplus Engine)** [cite: 4]：
    *   財務分類帳，將總營收扣除成本後，劃分為公積金（50% 合作資本/公積金）與社員分配金 [cite: 4]。
    *   將剩餘結餘（50%）依據**社員消費貢獻度（累積點數）**而非僅依持股比例進行分配 [cite: 4]。

---

#### 🎨 UI / UX 設計要求 [cite: 5]
*   現代、乾淨且友善的設計，反映健康、永續與社群信任 [cite: 5]。
*   響應式版面配置，具備單一入口，可在社員門戶與行政管理控制台之間無縫切換 [cite: 5]。
*   中文與英文的訂單狀態互動標籤 [cite: 5]：
    *   `[Surveying / 意象調查中]` ➡️ `[Pre-ordering / 預購中]` ➡️ `[Sourcing / 廠商進貨中]` ➡️ `[Ready for Pickup/Delivery / 待取貨]` [cite: 5]

本專案是由 [Lovable](https://lovable.dev) 所構建 [cite: 5]。

---

#### 🔗 線上展示與本地開發 [cite: 6]
*   **線上展示**：https://ten-square-miles-coop.lovable.app [cite: 6]
*   **使用 Lovable 繼續開發**：您可以在 [Lovable 編輯器](https://lovable.dev/projects/4e24424d-47a8-4738-b338-9e2b261e0592) 中繼續開發此專案 [cite: 6]。
*   **本地開發**：若您更傾向於在本機端工作，您需要安裝 Node.js 與 npm [cite: 6]。
🚀 如何把這個修改後的檔案上傳更新到 GitHub？
貼上並存檔（Ctrl + S）後，該檔案在側邊欄會變成黃色的 「M」（Modified） [cite: 15]。請在 Codespaces 或 VS Code 終端機（按 Ctrl + ~ 開啟）輸入這三行指令來推送到雲端：
git add README.md
git commit -m "docs: 翻譯最新專案說明書為中文版"
git push
打完這三行後，你就可以去 GitHub 專案網頁按下重新整理，親眼看著精美的中文規格書漂亮地呈現在首頁囉！