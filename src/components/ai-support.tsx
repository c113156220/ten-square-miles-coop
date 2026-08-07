import { useEffect, useMemo, useState } from "react";
import { Bot, MessageCircle, Sparkles, Headphones } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { addSupportExchange, listSupportThreads, type SupportMode, type SupportThread } from "@/lib/support-chat";

const QUICK_PROMPTS = [
  { zh: "如何退款？", en: "How do refunds work?" },
  { zh: "超商取貨怎麼選？", en: "How do I choose pickup?" },
  { zh: "怎麼加入社員？", en: "How do I join?" },
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
        {locale === "zh" ? "AI客服" : "AI Help"}
      </button>

      {open && user && (
        <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-20 right-5 w-[min(92vw,420px)] rounded-3xl border border-border bg-white shadow-elevated"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Support Desk</p>
                <h3 className="text-base font-bold">{locale === "zh" ? "AI人工客服與聊天機器人" : "AI support & chatbot"}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-border px-2 py-1 text-xs">
                ×
              </button>
            </div>

            <div className="flex gap-2 border-b border-border px-4 py-3">
              <button
                onClick={() => setMode("ai")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  mode === "ai" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                }`}
              >
                <Sparkles className="size-3.5" />
                {locale === "zh" ? "AI人工客服" : "AI service"}
              </button>
              <button
                onClick={() => setMode("bot")}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  mode === "bot" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                }`}
              >
                <Bot className="size-3.5" />
                {locale === "zh" ? "聊天機器人" : "Chatbot"}
              </button>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                {mode === "ai"
                  ? locale === "zh"
                    ? "這裡會自動回覆退款、物流與入社問題，並保存完整詢問過程給後台查看。"
                    : "This mode auto-replies to refunds, logistics, and onboarding questions, with full logs for admin review."
                  : locale === "zh"
                    ? "聊天機器人會保留每次對話，方便後台追蹤。"
                    : "The chatbot keeps every exchange for admin audit."}
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.zh}
                    onClick={() => submit(locale === "zh" ? prompt.zh : prompt.en)}
                    className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
                  >
                    {locale === "zh" ? prompt.zh : prompt.en}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {(currentThread?.messages ?? []).map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "border border-border bg-surface text-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {!currentThread && (
                  <p className="rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                    {locale === "zh" ? "還沒有詢問紀錄。" : "No chat history yet."}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submit();
                  }}
                  placeholder={locale === "zh" ? "輸入你的問題…" : "Type your question…"}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => submit()}
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  {locale === "zh" ? "送出" : "Send"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {locale === "zh" ? "後台可在使用者總表查看對話紀錄。" : "Admins can review the conversation history in the user directory."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
