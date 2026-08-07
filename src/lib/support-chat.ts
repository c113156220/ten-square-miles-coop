export type SupportMode = "ai" | "bot";
export type SupportRole = "user" | "assistant" | "admin";

export type SupportMessage = {
  id: string;
  role: SupportRole;
  text: string;
  createdAt: number;
};

export type SupportThread = {
  id: string;
  mode: SupportMode;
  userId: string;
  userName: string;
  userEmail: string;
  status: "open" | "resolved";
  createdAt: number;
  updatedAt: number;
  messages: SupportMessage[];
};

const STORAGE_KEY = "tsm_support_threads_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readThreads(): SupportThread[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SupportThread[];
  } catch {
    return [];
  }
}

function writeThreads(threads: SupportThread[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("tsm-support-chat-updated"));
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function clean(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function reply(mode: SupportMode, input: string) {
  const text = clean(input);
  const lower = text.toLowerCase();

  if (mode === "ai") {
    if (/[退費退款]/.test(text) || lower.includes("refund")) {
      return "我可以幫你確認退款流程。若是訂單取消，款項會先回到儲值金，若是信用卡付款則依支付管道退回。";
    }
    if (/[運費物流門市]/.test(text) || lower.includes("shipping") || lower.includes("store")) {
      return "物流可先選清大自提、7-11、全家或黑貓宅配。若有冷凍商品，超商取貨會被自動禁止。";
    }
    if (/[入社註冊體驗]/.test(text) || lower.includes("member")) {
      return "入社流程分成體驗社員與正式社員兩條路徑。你可以先完成驗證，再進行教育與審核。";
    }
    return "收到，我已經把你的問題記錄下來。若你願意，我可以繼續幫你整理成可送出的提案內容。";
  }

  if (/[退款退費]/.test(text) || lower.includes("refund")) return "請先到訂單頁取消可取消的訂單，退款會回到儲值金。";
  if (/[宅配超商門市]/.test(text) || lower.includes("shipping")) return "可選清大自提、7-11、全家與黑貓宅配。冷凍品只能自提或宅配。";
  if (/[登入註冊會員]/.test(text) || lower.includes("member")) return "請點右上角社員登入，或前往入社流程完成驗證。";
  return "已收到你的訊息，請稍等，我們會盡快回覆。";
}

export function listSupportThreads() {
  return readThreads().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function addSupportExchange(input: {
  mode: SupportMode;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
}) {
  const threads = readThreads();
  const now = Date.now();
  const id = `${input.userId}:${input.mode}`;
  const message: SupportMessage = {
    id: mkId("msg"),
    role: "user",
    text: clean(input.text),
    createdAt: now,
  };
  const assistant: SupportMessage = {
    id: mkId("msg"),
    role: "assistant",
    text: reply(input.mode, input.text),
    createdAt: now + 300,
  };

  const existing = threads.find((thread) => thread.id === id);
  if (existing) {
    existing.userName = input.userName;
    existing.userEmail = input.userEmail;
    existing.messages = [...existing.messages, message, assistant];
    existing.updatedAt = assistant.createdAt;
    existing.status = "open";
  } else {
    threads.push({
      id,
      mode: input.mode,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      status: "open",
      createdAt: now,
      updatedAt: assistant.createdAt,
      messages: [message, assistant],
    });
  }

  writeThreads(threads);
  return threads.find((thread) => thread.id === id) as SupportThread;
}

export function addAdminReply(threadId: string, text: string) {
  const threads = readThreads();
  const target = threads.find((thread) => thread.id === threadId);
  if (!target) return null;

  const reply: SupportMessage = {
    id: mkId("msg"),
    role: "admin",
    text: clean(text),
    createdAt: Date.now(),
  };

  target.messages = [...target.messages, reply];
  target.updatedAt = reply.createdAt;
  target.status = "open";

  writeThreads(threads);
  return target;
}

export function resolveSupportThread(threadId: string) {
  const threads = readThreads();
  const target = threads.find((thread) => thread.id === threadId);
  if (!target) return null;

  target.status = "resolved";
  target.updatedAt = Date.now();
  writeThreads(threads);
  return target;
}

export function clearSupportThreads() {
  writeThreads([]);
}

