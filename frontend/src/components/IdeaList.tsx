import React, { useEffect, useState } from 'react'
import { getIdeas, triggerDeepDive } from '../api'
import DeepDiveViewer from './DeepDiveViewer'

interface Idea {
  id: string
  title: string
  hook: string
  score: number
  mvp_effort: number
  deep_dive_requested: boolean
  deep_dive?: any
}

export default function IdeaList({ repoId }: { repoId: string }) {
  const [ideas, setIdeas] = useState<Idea[]>([])

  useEffect(() => {
    getIdeas(repoId).then((res) => setIdeas(res.data))
  }, [repoId])

  return (
    <div>
      <h2>🧠 Ideas</h2>
      {ideas.map((idea) => (
        <div key={idea.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h3>{idea.title}</h3>
          <p><strong>Hook:</strong> {idea.hook}</p>
          <p><strong>Score:</strong> {idea.score} / 10</p>
          <p><strong>MVP Effort:</strong> {idea.mvp_effort} / 10</p>

          {idea.deep_dive_requested ? (
            <p><em>Deep dive requested…</em></p>
          ) : idea.deep_dive ? (
            <DeepDiveViewer deepDive={idea.deep_dive} />
          ) : (
            <button onClick={() => triggerDeepDive(idea.id)}>🔍 Request Deep Dive</button>
          )}
        </div>
      ))}
    </div>
  )
}
