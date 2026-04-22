'use client'

import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Charity = { id: string; name: string; featured: boolean }

interface ChangeCharityModalProps {
  currentCharityId: string | null
  currentPct: number
}

export default function ChangeCharityModal({ currentCharityId, currentPct }: ChangeCharityModalProps) {
  const [open, setOpen] = useState(false)
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedId, setSelectedId] = useState(currentCharityId || '')
  const [pct, setPct] = useState(currentPct || 10)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open && charities.length === 0) {
      fetch('/api/charities')
        .then(r => r.json())
        .then(d => setCharities(d.charities || []))
    }
  }, [open, charities.length])

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/profile/charity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charity_id: selectedId, contribution_pct: pct })
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setMessage('Saved! Refreshing...')
      setTimeout(() => { setOpen(false); window.location.reload() }, 1000)
    } else {
      setMessage(data.error || 'Something went wrong.')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-medium text-[var(--color-brand-light)] hover:underline"
      >
        Change Charity
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass rounded-2xl p-6 w-full max-w-md border border-[var(--border)] relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand)]/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--color-brand-light)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Change Your Charity</h2>
                  <p className="text-sm opacity-60">Your contribution supports this cause every month.</p>
                </div>
              </div>

              {charities.length === 0 ? (
                <div className="text-sm opacity-50 animate-pulse py-4 text-center">Loading charities...</div>
              ) : (
                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
                  {charities.map(c => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                        selectedId === c.id
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10'
                          : 'border-[var(--border)] hover:border-white/30 bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="charity"
                        value={c.id}
                        checked={selectedId === c.id}
                        onChange={() => setSelectedId(c.id)}
                        className="accent-[var(--color-brand)]"
                      />
                      <span className="font-medium text-sm">{c.name}</span>
                      {c.featured && (
                        <span className="ml-auto text-xs text-[var(--color-accent)] font-bold uppercase">Featured</span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 opacity-80">
                  Contribution — <span className="text-[var(--color-brand-light)] font-bold">{pct}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={pct}
                  onChange={e => setPct(Number(e.target.value))}
                  className="w-full accent-[var(--color-brand)] cursor-pointer"
                />
                <div className="flex justify-between text-xs opacity-40 mt-1">
                  <span>10% (Min)</span><span>50%</span>
                </div>
              </div>

              {message && (
                <p className={`text-sm mb-3 text-center font-medium ${message.includes('Saved') ? 'text-green-400' : 'text-[var(--color-accent)]'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !selectedId}
                className="btn-primary w-full py-3"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
