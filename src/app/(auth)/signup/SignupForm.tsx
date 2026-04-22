'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { signup } from '../actions'
import { useFormStatus } from 'react-dom'

type Charity = { id: string; name: string; featured: boolean }

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className="btn-primary w-full flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-wait"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Creating Account...</span>
        </>
      ) : (
        <>
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  )
}

export default function SignupForm({ error }: { error?: string }) {
  const [charities, setCharities] = useState<Charity[]>([])
  const [contributionPct, setContributionPct] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/charities')
      .then(res => res.json())
      .then(data => {
        setCharities(data.charities || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="glass p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--color-brand)] to-[var(--color-accent)] flex items-center justify-center shadow-lg">
            <Heart className="text-white w-6 h-6" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Join the Movement</h1>
          <p className="text-[var(--foreground)] opacity-70 text-sm">
            Create an account to start your journey of impact and rewards.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form action={signup} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="email">
              Email Address
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="input-base"
              placeholder="you@example.com"
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="password">
              Password
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          {/* Charity Selection */}
          <div>
            <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="charity_id">
              Choose Your Charity <span className="text-[var(--color-accent)]">*</span>
            </label>
            {loading ? (
              <div className="input-base opacity-50 animate-pulse">Loading charities...</div>
            ) : charities.length === 0 ? (
              <div className="input-base opacity-40 text-sm cursor-not-allowed">No charities available yet. Please try again later.</div>
            ) : (
              <select
                id="charity_id"
                name="charity_id"
                required
                className="input-base bg-[var(--card)] text-[var(--foreground)]"
                defaultValue=""
              >
                <option value="" disabled>— Select a charity —</option>
                {charities.filter(c => c.featured).length > 0 && (
                  <optgroup label="⭐ Featured Partners">
                    {charities.filter(c => c.featured).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Charities">
                  {charities.filter(c => !c.featured).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              </select>
            )}
            <p className="text-xs opacity-50 mt-1">A minimum of 10% of your subscription goes to this charity.</p>
          </div>

          {/* Contribution Percentage */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">
              Charity Contribution — <span className="text-[var(--color-brand-light)] font-bold">{contributionPct}%</span>
            </label>
            <input
              type="range"
              name="contribution_pct"
              min={10}
              max={50}
              step={5}
              value={contributionPct}
              onChange={e => setContributionPct(Number(e.target.value))}
              className="w-full accent-[var(--color-brand)] cursor-pointer"
            />
            <div className="flex justify-between text-xs opacity-40 mt-1">
              <span>10% (Min)</span>
              <span>50%</span>
            </div>
          </div>

          <SubmitButton />
        </form>

        <div className="mt-6 text-center text-sm opacity-70">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-brand-light)] font-medium hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
