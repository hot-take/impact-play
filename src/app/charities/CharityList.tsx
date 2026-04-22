'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Search } from 'lucide-react'

type Charity = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  featured: boolean
}

export default function CharityList({ initialCharities }: { initialCharities: Charity[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured'>('all')

  const filtered = initialCharities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'featured' && c.featured)
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
        {/* Search Container */}
        <div className="relative w-full md:flex-1 group">
          <div className="absolute inset-0 bg-[var(--color-brand)]/5 rounded-2xl blur-xl group-focus-within:bg-[var(--color-brand)]/10 transition-all duration-500" />
          <div className="relative glass rounded-2xl flex items-center px-5 py-2 border border-black/5">
            <Search className="w-5 h-5 opacity-30 group-focus-within:opacity-100 transition-opacity duration-300" />
            <input 
              type="text" 
              placeholder="Search by name or cause..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg placeholder:opacity-40"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-black/5 p-1.5 rounded-2xl border border-black/5 backdrop-blur-sm self-stretch md:self-auto w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              filter === 'all' 
              ? 'bg-black text-white shadow-lg shadow-black/20' 
              : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            All Charities
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              filter === 'featured' 
              ? 'bg-black text-white shadow-lg shadow-black/20' 
              : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            Featured
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((charity, i) => (
          <motion.div 
            key={charity.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6 flex flex-col h-full hover:border-[var(--color-brand)]/50 transition-colors"
          >
            <div className="w-full h-40 bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              {charity.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
              ) : (
                <Heart className="w-10 h-10 opacity-20" />
              )}
            </div>
            {charity.featured && (
              <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2">
                Featured Partner
              </span>
            )}
            <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
            <p className="opacity-70 flex-1 text-sm mb-6">
              {charity.description || "A wonderful charity organization making a real impact in the world."}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-[var(--border)] hover:bg-white/5 rounded-lg transition-colors font-medium text-sm">
                Learn More
              </button>
              <form className="flex-1" action={async () => { 
                // In reality, this would redirect to Stripe Checkout with a generic donation price
                // redirect('/api/stripe/donate?charity_id=' + charity.id) 
              }}>
                <button type="button" onClick={() => alert('Redirecting to Stripe Donation Checkout...')} className="w-full btn-primary py-2 text-sm">
                  Donate
                </button>
              </form>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center opacity-50">
            No charities found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
