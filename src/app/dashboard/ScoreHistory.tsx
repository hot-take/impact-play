'use client'

import { motion } from 'framer-motion'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { deleteScore, editScore } from './actions'

type Score = {
  id: string
  score: number
  play_date: string
  created_at: string
}

export default function ScoreHistory({ scores }: { scores: Score[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  if (scores.length === 0) {
    return (
      <div className="py-12 text-center opacity-30 border-2 border-dashed border-black/5 rounded-[32px]">
        <p className="text-sm font-bold">No scores logged yet.</p>
      </div>
    )
  }

  const handleSave = async (id: string) => {
    setLoading(true)
    await editScore(id, editVal)
    setEditingId(null)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {scores.map((s, i) => (
        <motion.div 
          key={s.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-6 bg-black/[0.02] border border-black/[0.03] rounded-[24px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group"
        >
          {editingId === s.id ? (
            <div className="flex items-center gap-6 w-full">
              <div className="flex-1">
                <input 
                  type="number" 
                  min="1" 
                  max="45" 
                  value={editVal} 
                  onChange={(e) => setEditVal(Number(e.target.value))}
                  className="input-base w-32"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSave(s.id)} disabled={loading} className="p-3 bg-black text-white rounded-xl hover:scale-105 transition-transform">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-3 bg-black/5 text-black rounded-xl hover:scale-105 transition-transform">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-8">
                <div className="text-4xl font-black tracking-tighter">{s.score}</div>
                <div className="h-8 w-px bg-black/10" />
                <div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-30 mb-1">Date Played</div>
                  <div className="text-sm font-bold">{new Date(s.play_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingId(s.id); setEditVal(s.score) }}
                  className="p-3 hover:bg-black/5 rounded-xl transition-all"
                  title="Edit Score"
                >
                  <Edit2 className="w-4 h-4 opacity-40" />
                </button>
                <button 
                  onClick={() => deleteScore(s.id)}
                  className="p-3 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Score"
                >
                  <Trash2 className="w-4 h-4 text-red-500/60" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  )
}
