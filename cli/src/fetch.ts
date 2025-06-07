// src/fetch.ts
import { supabase } from "./supabase"
import fetch from "node-fetch"
import { parseStringPromise } from "xml2js"

async function fetchFromNDL() {
  const { data: rows, error } = await supabase
    .from("books")
    .select("isbn")
    .eq("synced", false)
    .limit(10)

  if (error || !rows) {
    console.error("❌ Supabase取得失敗:", error)
    return
  }

  for (const { isbn } of rows) {
    try {
      const url = `https://iss.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn=${isbn}&recordSchema=dc`
      const res = await fetch(url)
      const xml = await res.text()

      const result = await parseStringPromise(xml, {
        explicitArray: false,
        ignoreAttrs: true,
        tagNameProcessors: [name => name.replace(/^.*:/, "")],
      })

      const recordDataRaw = result?.searchRetrieveResponse?.records?.record?.recordData

      if (!recordDataRaw) {
        console.warn(`⚠️ ${isbn}: 書誌情報なし（recordDataなし）`)
        continue
      }

      // recordData が escape された文字列として渡されているので再パース
      const innerXml = recordDataRaw
      const innerParsed = await parseStringPromise(innerXml, {
        explicitArray: false,
        ignoreAttrs: true,
        tagNameProcessors: [name => name.replace(/^.*:/, "")],
      })

      const metadata = innerParsed?.dc
      const title = metadata?.title ?? null
      const author = metadata?.creator ?? null

      if (title || author) {
        await supabase
          .from("books")
          .update({ title, author, synced: true })
          .eq("isbn", isbn)
        console.log(`✅ ${isbn}: ${title} / ${author}`)
      } else {
        console.warn(`⚠️ ${isbn}: 書誌情報なし（metadataなし）`)
      }

    } catch (e) {
      console.error(`❌ ${isbn}: エラー`, e)
    }
  }
}

fetchFromNDL()
