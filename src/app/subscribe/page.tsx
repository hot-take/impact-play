'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ShieldCheck } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async (priceId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      const data = await res.json()
      if (data.sessionId) {
        // Redirect to Stripe checkout
        // Note: You need to implement loadStripe from @stripe/stripe-js here
        alert('Stripe integration pending real keys. Redirecting to checkout with ID: ' + data.sessionId)
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-20 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Choose Your Impact Plan</h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Gain full access to performance tracking, monthly draws, and make a real difference with every billing cycle.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-10 bg-white/5 p-1 rounded-full border border-[var(--border)]">
        <button 
          onClick={() => setBilling('monthly')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${billing === 'monthly' ? 'bg-[var(--color-brand)] text-white' : 'opacity-70'}`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setBilling('yearly')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${billing === 'yearly' ? 'bg-[var(--color-brand)] text-white' : 'opacity-70'}`}
        >
          Yearly (Save 20%)
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-lg w-full rounded-3xl p-8 border-2 border-[var(--color-brand)]/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-[var(--color-brand)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Pro Member</h2>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-extrabold">{billing === 'monthly' ? '$15' : '$144'}</span>
          <span className="opacity-70">/ {billing === 'monthly' ? 'month' : 'year'}</span>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            'Log unlimited scores (rolling 5)',
            'Auto-entry into monthly reward draws',
            'Minimum 10% goes directly to your chosen charity',
            'Premium analytics and tracking',
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="text-[var(--color-brand-light)] w-5 h-5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button 
          onClick={() => handleSubscribe('price_dummy')}
          disabled={loading}
          className="btn-primary w-full py-4 text-lg"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 opacity-50 text-sm">
          <ShieldCheck className="w-4 h-4" />
          Secure checkout powered by Stripe
        </div>
      </motion.div>
    </div>
  )
}
