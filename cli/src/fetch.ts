import { supabase } from "./supabase"
import fetch from "node-fetch"
import { parseStringPromise } from "xml2js"

const LIMIT = 20

async function fetchFromNDL() {
  let offset = 0
  while (true) {
    const { data: rows, error } = await supabase
      .from("books")
      .select("isbn")
      .is("synced", null)
      .range(offset, offset + LIMIT - 1)

    if (error) {
      console.error("❌ Supabase取得失敗:", error)
      break
    }

    if (!rows || rows.length === 0) {
      console.log("✅ 全件処理完了")
      break
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

        const recordData = result?.searchRetrieveResponse?.records?.record?.recordData
        if (!recordData) {
          console.warn(`⚠️ ${isbn}: 書誌情報なし（recordDataなし）`)
          await markAsFailed(isbn)
          continue
        }

        // recordData は HTMLエンコードされたXML文字列になっているので再パース
        const innerXml = decodeXmlEntities(recordData)
        const parsedInner = await parseStringPromise(innerXml, {
          explicitArray: false,
          ignoreAttrs: true,
          tagNameProcessors: [name => name.replace(/^.*:/, "")],
        })

        const metadata = parsedInner?.dc
        const title = metadata?.title ?? null
        const author = metadata?.creator ?? null

        if (title || author) {
          await supabase
            .from("books")
            .update({ title, author, synced: "success" })
            .eq("isbn", isbn)
          console.log(`✅ ${isbn}: ${title} / ${author}`)
        } else {
          console.warn(`⚠️ ${isbn}: 書誌情報なし（metadataなし）`)
          await markAsFailed(isbn)
        }

      } catch (e) {
        console.error(`❌ ${isbn}: エラー`, e)
        await markAsFailed(isbn)
      }
    }

    offset += LIMIT
  }
}

function decodeXmlEntities(encoded: string): string {
  return encoded
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
}

async function markAsFailed(isbn: string) {
  await supabase
    .from("books")
    .update({ synced: "failed" })
    .eq("isbn", isbn)
}

fetchFromNDL()
