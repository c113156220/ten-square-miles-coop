import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "入社教育訓練 · Member Onboarding — 十圓方里" },
      {
        name: "description",
        content: "四步驟入社教育訓練：實名驗證、合作社十講、隨機理念快問快答，通關後開通 30 天體驗帳號。",
      },
      { property: "og:title", content: "Co-op Member Onboarding — Ten Sq Miles" },
      { property: "og:description", content: "Verify identity, read the 5 co-op lectures, pass the random quiz, activate your 30-day trial pass." },
    ],
  }),
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return <OnboardingFlowWithPassword />;
}

// 包含「密碼欄位」的完整實名驗證流程元件
function OnboardingFlowWithPassword() {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    email: "",
    password: "", // 🔑 新增密碼欄位狀態
    verificationCode: "",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-[900px] mx-auto space-y-8">
        {/* 頂部標題 */}
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-800">體驗帳號</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            實名驗證 ➔ 合作社十講 ➔ 隨機小考 ➔ 30 天通行證 + NT$100 迎新券
          </p>
        </div>

        {/* 步驟選單 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl p-4 text-center font-bold text-xs shadow-sm">
            1. 身份驗證
          </div>
          <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl p-4 text-center font-bold text-xs opacity-60">
            2. 合作社十講
          </div>
          <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl p-4 text-center font-bold text-xs opacity-60">
            3. 理念快問快答
          </div>
          <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl p-4 text-center font-bold text-xs opacity-60">
            4. 解鎖體驗
          </div>
        </div>

        {/* 主要表單卡片 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左側：基本資料填寫 */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                🛡️ 防弊身份驗證 STEP 1
              </div>
              <p className="text-xs text-slate-500">
                請填寫姓名、身份證字號/學號與電子信箱，系統會模擬寄出 6 位數驗證碼，完成後即可進入合作社十講。
              </p>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">姓名</label>
                  <input
                    type="text"
                    placeholder="王小明"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">身份證字號 / 學號</label>
                  <input
                    type="text"
                    placeholder="A123456789"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">電子信箱</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {/* 🔑 新增的密碼輸入框 */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">設定登入密碼</label>
                  <input
                    type="password"
                    placeholder="請輸入密碼"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <button
                  type="button"
                  className="w-full mt-2 bg-emerald-600 text-white font-bold py-3 rounded-full text-xs hover:bg-emerald-700 transition shadow-sm"
                >
                  發送驗證碼 ➔
                </button>
              </div>
            </div>

            {/* 右側：驗證碼輸入提示區 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-700">模擬驗證流程</p>
                  <span className="p-2 bg-emerald-600 text-white rounded-xl text-xs">🔒</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">Enter 6-digit verification code</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  這裡會模擬寄出一組 6 位數驗證碼。你可以直接輸入 123456，或輸入畫面上記錄的模擬碼完成驗證。
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                先完成左側資料填寫，再點擊發送驗證碼。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}