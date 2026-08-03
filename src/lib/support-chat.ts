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
  window.localStorage.setItem("tsm_support_chat_signal", Date.now().toString());
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
    if (/[退費退款取消]/.test(text) || lower.includes("refund") || lower.includes("cancel")) {
      return "別擔心！這部分我來幫你看看～包在我身上！如果是取消預購訂單，款項會第一時間退回到你的『合作社儲值金』，隨時可以用來買其他好品項；如果是信用卡支付，系統也會自動退回原卡片喔！有需要幫你聯繫幹部處理嗎？😊";
    }
    if (/[運費物流門市取貨超商自提]/.test(text) || lower.includes("shipping") || lower.includes("store") || lower.includes("pickup")) {
      return "取貨超簡單！結帳時可以在『配送方式』選擇距離你最近的超商或合作社據點/宿舍自提點 📦。貨到時會發送簡訊通知你，到時候憑手機號碼跟身分證就能取貨囉！（小提醒：如果有買冷凍好物，超商物流會自動限制，只能選自提或宅配喔～）";
    }
    if (/[入社註冊體驗]/.test(text) || lower.includes("member") || lower.includes("join")) {
      return "太讚了吧！歡迎加入十里方圓大家庭！🎉 只要點擊『加入社員』完成 3 分鐘的防弊驗證跟十講小闖關，就能馬上解鎖 30 天體驗帳號！快去試試看吧！";
    }
    if (/[福利好康權益優惠免稅分紅]/.test(text) || lower.includes("perk") || lower.includes("benefit")) {
      return "加入合作社好康超多！🎁 正式社員購買加工食品（像是柴燒醬油、便當等）享有免 5% 營業稅的專屬優惠！此外，每年合作社的營運結餘，還會根據你的『消費貢獻度』按比例分紅回饋給你喔！";
    }
    if (/[推薦好物買什麼熱銷雞蛋醬油好吃]/.test(text) || lower.includes("recommend") || lower.includes("food")) {
      return "問我就對了！🍳 這週最熱銷的就是在地小農的『放牧土雞蛋』和『柴燒手工醬油』這對黃金組合！都是零庫存預購、產地直直送過來的，拿來做溏心蛋簡直一絕！要不要順便去預購頁面逛逛看？";
    }
    if (/[合作社投票理念民主]/.test(text) || lower.includes("coop") || lower.includes("vote")) {
      return "我們合作社跟一般商店不一樣喔！我們堅持『一人一票、營業不營利』🤝。無論出資多少，每位社員在社員大會都有平等的表決權，我們都是合作社的主人！";
    }
    if (/[你好嗨哈囉謝謝辛苦累]/.test(text) || lower.includes("hello") || lower.includes("hi") || lower.includes("thanks")) {
      return "嗨嗨～我是十里方圓的 AI 駐店夥伴『阿方』！✨ 今天忙了一天辛苦囉～不論是想問預購進度、合作社好康，還是找人聊聊，隨時跟我說喔！";
    }
    return "這個問題很有意思！阿方我先筆記下來囉 📝～因為我還在努力學習更多合作社的大小事，如果你現在急著處理，我可以幫你把這個訊息同步留給我們的實體幹部，或者你可以先去『預購好物區』逛逛看！😉";
  }

  if (/[福利好康權益優惠免稅分紅]/.test(text) || lower.includes("perk") || lower.includes("benefit")) {
    return "🎁 社員專屬福利：1. 購買加工食品（如醬油、便當）享免 5% 營業稅優惠。 2. 年底依『消費貢獻度』享有合作社結餘分紅回饋！";
  }
  if (/[推薦好物買什麼熱銷雞蛋醬油好吃]/.test(text) || lower.includes("recommend")) {
    return "🍳 本週熱銷推薦：在地小農『放牧土雞蛋』與『柴燒手工醬油』！採用零庫存預購，新鮮產地直送，歡迎至預購區選購！";
  }
  if (/[退款退費取消]/.test(text) || lower.includes("refund")) {
    return "💳 退款說明：請至訂單頁取消可取消的預購單。取消後款項將退回您的『合作社儲值金』；若為信用卡支付，將自動退回原卡片。";
  }
  if (/[宅配超商門市取貨自提運費]/.test(text) || lower.includes("shipping")) {
    return "📦 配送說明：支援據點/宿舍自提、7-11、全家與黑貓宅配。小提醒：冷凍商品因規範限制，僅提供自提與宅配服務。";
  }
  if (/[登入註冊會員入社驗證]/.test(text) || lower.includes("member") || lower.includes("join")) {
    return "🔑 入社指引：請點擊右上角『加入社員』，完成 3 分鐘防弊驗證與十講闖關，即可免費開通 30 天體驗通行證！";
  }

  return "阿方收到！這筆對話已即時同步給後台幹部。若有緊急事項，幹部會盡快在後台回覆您喔！👍";
}

// ⚠️ 注意看！這裡有 export listSupportThreads
export function listSupportThreads(): SupportThread[] {
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

export function addAdminReply(threadId: string, replyText: string) {
  const threads = readThreads();
  const target = threads.find((thread) => thread.id === threadId);
  if (!target) return null;

  const now = Date.now();
  const adminMessage: SupportMessage = {
    id: mkId("msg"),
    role: "admin",
    text: clean(replyText),
    createdAt: now,
  };

  target.messages.push(adminMessage);
  target.updatedAt = now;
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