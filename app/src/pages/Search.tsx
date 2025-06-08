import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<any[]>([])

  const search = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .ilike('title', `%${keyword}%`)

    if (error) {
      console.error(error)
    } else {
      setResults(data || [])
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="書名を入力"
        style={{ padding: '0.5rem', width: '60%' }}
      />
      <button onClick={search} style={{ marginLeft: '1rem' }}>検索</button>

      <ul>
        {results.map((book) => (
          <li key={book.isbn}>
            <strong>{book.title}</strong><br />
            {book.author}
          </li>
        ))}
      </ul>
    </div>
  )
}
