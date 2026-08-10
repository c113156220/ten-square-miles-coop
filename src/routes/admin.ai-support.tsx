import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/ai-support")({
  component: AdminAiSupportCenterPage,
});

type Notice = {
  id: string;
  title: string;
  body: string;
  type: "customer" | "system";
  createdAt: string;
};

const MOCK_NOTICES: Notice[] = [
  { id: "q1", title: "顧客提問：如何改選 7-11 門市？", body: "我下單後才發現門市選錯，可以重新選擇嗎？", type: "customer", createdAt: "10 分鐘前" },
  { id: "q2", title: "顧客提問：何時會收到取貨通知？", body: "訂單顯示已備貨，請問大概何時到店？", type: "customer", createdAt: "35 分鐘前" },
  { id: "s1", title: "系統通知：今日待回覆工單 5 筆", body: "建議優先處理運費與付款方式相關提問。", type: "system", createdAt: "1 小時前" },
];

function AdminAiSupportCenterPage() {
  const [selectedId, setSelectedId] = useState(MOCK_NOTICES[0].id);
  const [suggestedReply, setSuggestedReply] = useState("");
  const selected = useMemo(
    () => MOCK_NOTICES.find((notice) => notice.id === selectedId) ?? MOCK_NOTICES[0],
    [selectedId],
  );

  function generateReplyTemplate() {
    setSuggestedReply(
      `您好，感謝您的訊息。\n\n針對「${selected.title}」，我們建議先確認訂單編號與收件門市資訊。若訂單尚未出貨，我們可協助調整；若已出貨，將協助提供後續處理方式。\n\n如需加速處理，請再提供您的會員 ID 與訂單編號，謝謝您！`,
    );
  }

  return (
    <div className="space-y-4 p-2">
      <div>
        <h2 className="text-xl font-bold">AI 客服通知中心</h2>
        <p className="mt-1 text-xs text-muted-foreground">左側查看顧客提問 / 系統通知，右側可一鍵產生 AI 建議回覆範本。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">通知與提問列表</h3>
          <div className="space-y-2">
            {MOCK_NOTICES.map((notice) => {
              const active = notice.id === selectedId;
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => setSelectedId(notice.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold">{notice.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notice.body}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{notice.createdAt}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">AI 建議回覆</h3>
          <div className="rounded-xl border border-border bg-slate-50 p-3 text-xs text-muted-foreground">
            目前選取：{selected.title}
          </div>
          <button
            type="button"
            onClick={generateReplyTemplate}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110"
          >
            <Sparkles className="size-3.5" />
            一鍵生成回覆範本
          </button>
          <textarea
            value={suggestedReply}
            onChange={(e) => setSuggestedReply(e.target.value)}
            placeholder="點擊上方按鈕後，這裡會出現 AI 建議回覆。"
            className="mt-3 min-h-[260px] w-full rounded-xl border border-border bg-white p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </section>
      </div>
    </div>
  );
}
