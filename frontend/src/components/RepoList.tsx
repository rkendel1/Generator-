import React, { useEffect, useState } from 'react'
import { getRepos } from '../api'

interface Repo {
  id: string
  name: string
  language: string
  url: string
}

export default function RepoList({ onSelect }: { onSelect: (id: string) => void }) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [lang, setLang] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getRepos(lang, search).then((res) => setRepos(res.data))
  }, [lang, search])

  return (
    <>
      <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="">All</option>
        <option value="Python">Python</option>
        <option value="TypeScript">TypeScript</option>
        <option value="JavaScript">JavaScript</option>
      </select>
      <ul>
        {repos.map((r) => (
          <li key={r.id}>
            <button onClick={() => onSelect(r.id)}>{r.name}</button>
          </li>
        ))}
      </ul>
    </>
  )
}
