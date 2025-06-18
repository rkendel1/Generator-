import React, { useState } from 'react'
import RepoList from './components/RepoList'
import IdeaList from './components/IdeaList'

export default function App() {
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', padding: '1rem' }}>
      <div style={{ width: '40%', paddingRight: '1rem' }}>
        <h2>📦 Trending Repos</h2>
        <RepoList onSelect={(id) => setSelectedRepoId(id)} />
      </div>
      <div style={{ width: '60%' }}>
        {selectedRepoId ? (
          <IdeaList repoId={selectedRepoId} />
        ) : (
          <p>Select a repo to see ideas</p>
        )}
      </div>
    </div>
  )
}
