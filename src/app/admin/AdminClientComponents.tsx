'use client'

import { useState } from 'react'
import { simulateDraw } from './actions'
import { Play } from 'lucide-react'

export default function AdminClientComponents() {
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    await simulateDraw()
    setLoading(false)
  }

  return (
    <button 
      onClick={handleSimulate}
      disabled={loading}
      className="btn-primary"
    >
      <Play className="w-4 h-4 inline-block mr-2" />
      {loading ? 'Initializing Engine...' : 'Run New Cycle Simulation'}
    </button>
  )
}
