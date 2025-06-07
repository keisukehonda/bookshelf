// src/register.ts
import { supabase } from "./supabase"
import * as fs from "fs"
import * as path from "path"

const filepath = process.argv[2]

if (!filepath) {
  console.error("Usage: tsx src/register.ts <isbn-file.txt>")
  process.exit(1)
}

async function main() {
  const filePathResolved = path.resolve(filepath)
  const lines = fs.readFileSync(filePathResolved, "utf-8")
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^\d{10,13}$/.test(l))

  // ✅ 重複排除（Setで一意化）
  const uniqueIsbns = Array.from(new Set(lines))

  const rows = uniqueIsbns.map(isbn => ({ isbn }))

  console.log(`📚 登録予定 ISBN 数: ${rows.length}`)

  const { error } = await supabase.from("books").upsert(rows)
  if (error) {
    console.error("❌ 登録エラー:", error.message)
  } else {
    console.log("✅ 登録完了")
  }
}

main()
