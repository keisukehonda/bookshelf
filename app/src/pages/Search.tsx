import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<any[]>([])

  const search = async () => {
    const { data, error } = await supabase
      .from('books')
      .select(`
        isbn,
        title,
        author,
        archive_id,
        archives(label)
      `)
      .ilike('title', `%${keyword}%`)

    if (error) {
      console.error(error)
    } else {
      setResults(data || [])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="タイトルで検索"
          className="border px-3 py-2 flex-1 rounded"
        />
        <button onClick={search} className="bg-blue-600 text-white px-4 py-2 rounded">
          検索
        </button>
      </div>

      <ul>
        {results.map((book) => (
          <li key={book.isbn} className="border p-3 rounded shadow mb-2">
            <h2 className="font-bold text-lg">{book.title}</h2>
            <p className="text-gray-600">{book.author}</p>
            <p className="text-sm text-gray-500">
              保管棚: {book.archives?.label ?? '未設定'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
