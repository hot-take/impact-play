'use client'

import { useState } from 'react'
import { addScore } from './actions'
import { Plus } from 'lucide-react'

export default function ScoreEntryForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await addScore(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      // Reset form on success
      const form = document.getElementById('score-form') as HTMLFormElement
      form.reset()
    }
    setLoading(false)
  }

  return (
    <form id="score-form" action={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-30">Play Date</label>
          <input 
            type="date" 
            name="play_date" 
            required 
            max={new Date().toISOString().split('T')[0]}
            className="input-base" 
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-30">Stableford Points</label>
          <input 
            type="number" 
            name="score" 
            min="1" 
            max="45" 
            placeholder="1-45"
            required 
            className="input-base" 
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {error ? (
          <div className="text-sm font-bold text-red-500">
            {error}
          </div>
        ) : (
          <div className="text-[10px] font-black uppercase tracking-widest opacity-20">
            Valid entries are 1 to 45 points.
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? 'Processing...' : 'Log Performance Data'}
        </button>
      </div>
    </form>
  )
}
