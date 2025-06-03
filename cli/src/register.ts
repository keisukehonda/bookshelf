import { supabase } from "./supabase"

export async function register(isbn: string) {
  const { error } = await supabase.from("books").insert({ isbn })
  if (error) {
    console.error("❌ Error:", error.message)
  } else {
    console.log(`✅ Registered ISBN: ${isbn}`)
  }
}
