// src/test.ts
import { supabase } from "./supabase"

async function testConnection() {
  const { data, error } = await supabase.from("books").select("*").limit(1)
  if (error) {
    console.error("❌ Supabase接続エラー:", error.message)
  } else {
    console.log("✅ Supabase接続成功:", data)
  }
}

testConnection()
