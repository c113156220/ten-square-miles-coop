import os

env_file = ".env"

if os.path.exists(env_file):
    print(f"✅ {env_file} 已經存在囉！不需要重複建立。")
else:
    print(f"🔍 找不到 {env_file}，正在幫你自動建立連線設定檔...")
    
    # 讓使用者在終端機直接輸入，貼上免手動點右鍵建立
    url = input("➡️ 1. 請貼上你的 Supabase URL (以 https:// 開頭): ").strip()
    key = input("➡️ 2. 請貼上你的 Supabase Anon Key (那一長串 public 亂碼): ").strip()
    
    with open(env_file, "w", encoding="utf-8") as f:
        f.write(f"VITE_SUPABASE_URL={url}\n")
        f.write(f"VITE_SUPABASE_ANON_KEY={key}\n")
        
    print(f"🎉 成功建立 {env_file} 檔案！現在你可以放心啟動網頁了。")
