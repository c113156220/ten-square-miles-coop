import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// 從環境變數讀取網址與金鑰
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// 建立並匯出 Supabase 連線物件
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);