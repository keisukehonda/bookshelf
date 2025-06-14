import { supabase } from "./supabase"

async function main() {

  const { data: all, error: err1 } = await supabase.from("books").select("isbn")
  const { data, error } = await supabase
    .from('books')
    .select('synced')

  if (error) {
    console.error('❌ エラー:', error.message)
    process.exit(1)
  }

  const counts = {
    success: 0,
    failed: 0,
    null: 0,
    other: 0,
  }

  for (const row of data!) {
    const status = row.synced
    if (status === 'success') counts.success++
    else if (status === 'failed') counts.failed++
    else if (status === null) counts.null++
    else counts.other++
  }

  console.log('📊 登録ステータス')
  console.log(`📚 総レコード数: ${all?.length ?? 0} 件`)
  console.log(`✅ success: ${counts.success} 件`)
  console.log(`⚠️ failed: ${counts.failed} 件`)
  console.log(`⏳ 未処理: ${counts.null} 件`)
  if (counts.other > 0) {
    console.log(`❓ その他: ${counts.other} 件`)
  }
}

main()
