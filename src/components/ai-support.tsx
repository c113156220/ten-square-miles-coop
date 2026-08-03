import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Sparkles, Headphones } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { addSupportExchange, listSupportThreads, type SupportMode, type SupportThread } from "@/lib/support-chat";

// 擴充快選選單：加入在地好物與特色問題
const QUICK_PROMPTS = [
  { zh: "如何退款？", en: "How do refunds work?" },
  { zh: "怎麼加入社員？", en: "How do I join?" },
  { zh: "超商取貨怎麼選？", en: "How do I choose pickup?" },
  { zh: "這週有什麼推薦好物？", en: "What's good this week?" },
  { zh: "合作社有什麼社員福利？", en: "What are member perks?" },
];

function latestThreadFor(userId: string, mode: SupportMode) {
  return listSupportThreads().find((thread) => thread.userId === userId && thread.mode === mode) ?? null;
}

export function AiSupportWidget() {
  const { user, openLogin } = useAuth();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SupportMode>("ai");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setThreads(listSupportThreads());
    const onUpdate = () => setThreads(listSupportThreads());
    window.addEventListener("tsm-support-chat-updated", onUpdate);
    return () => window.removeEventListener("tsm-support-chat-updated", onUpdate);
  }, [open]);

  const currentThread = useMemo(() => {
    if (!user) return null;
    return latestThreadFor(user.id, mode);
  }, [mode, user, threads]);

  // 新增訊息時自動捲動到底部
  useEffect(() => {
    if (open && currentThread) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentThread?.messages.length, open]);

  function submit(value?: string) {
    const message = (value ?? text).trim();
    if (!message || !user) return;
    addSupportExchange({
      mode,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      text: message,
    });
    setThreads(listSupportThreads());
    setText("");
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={() => (user ? setOpen(true) : openLogin())}
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-elevated transition-all hover:-translate-y-0.5"
      >
        <Headphones className="size-4" />
        {locale === "zh" ? "AI 駐店夥伴 阿方" : "AI Helper A-Fang"}
      </button>

      {open && user && (
        <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-20 right-5 w-[min(92vw,420px)] rounded-3xl border border-border bg-white shadow-elevated"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header 人設包裝 */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-lg">🌱</span>
                <div>
                  <h3 className="text-base font-bold">{locale === "zh" ? "十里方圓小幫手 · 阿方" : "Co-op Helper A-Fang"}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-600">● 在線解答中</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-border px-2 py-1 text-xs hover:bg-slate-100">
                ×
              </button>
            </div>

            {/* 模式切換 */}
            <div className="flex gap-2 border-b border-border px-4 py-3">
              <button
                onClick={() => setMode("ai")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                  mode === "ai" ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface text-muted-foreground hover:bg-slate-100"
                }`}
              >
                <Sparkles className="size-3.5" />
                {locale === "zh" ? "親切 AI 夥伴" : "AI Service"}
              </button>
              <button
                onClick={() => setMode("bot")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                  mode === "bot" ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface text-muted-foreground hover:bg-slate-100"
                }`}
              >
                <Bot className="size-3.5" />
                {locale === "zh" ? "快速機器人" : "Chatbot"}
              </button>
            </div>

            {/* 對話區域 */}
            <div className="max-h-[380px] min-h-[280px] space-y-3 overflow-y-auto px-4 py-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                {mode === "ai"
                  ? locale === "zh"
                    ? "👋 嗨！我是阿方，有什麼合作社疑問、退款退貨或是想找好物，儘管問我喔！"
                    : "👋 Hi! I'm A-Fang. Ask me anything about refunds, co-op perks, or featured picks!"
                  : locale === "zh"
                    ? "這裡會記錄你的常見問題，方便幹部進行追蹤喔！"
                    : "Chatbot mode logs your exchanges for staff follow-up."}
              </div>

              {/* 快速提示按鈕 */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.zh}
                    onClick={() => submit(locale === "zh" ? prompt.zh : prompt.en)}
                    className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    {locale === "zh" ? prompt.zh : prompt.en}
                  </button>
                ))}
              </div>

              {/* 訊息清單 */}
              <div className="space-y-3 pt-2">
                {(currentThread?.messages ?? []).map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "border border-border bg-slate-50 text-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {!currentThread && (
                  <p className="rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    {locale === "zh" ? "還沒有聊天紀錄，隨便問我個問題吧！" : "No chat history yet. Say hi!"}
                  </p>
                )}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* 輸入框 */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submit();
                  }}
                  placeholder={locale === "zh" ? "問問阿方（例如：有推薦什麼嗎？）" : "Ask A-Fang…"}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={() => submit()}
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110"
                >
                  {locale === "zh" ? "送出" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}