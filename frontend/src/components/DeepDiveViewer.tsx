import React from 'react'

export default function DeepDiveViewer({ deepDive }: { deepDive: any }) {
  return (
    <div style={{ background: '#f9f9f9', padding: '1rem' }}>
      <h4>📈 Investor Deep Dive</h4>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(deepDive, null, 2)}</pre>
    </div>
  )
}
