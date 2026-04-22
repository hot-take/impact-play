'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Trophy, Globe, ArrowRight, Sparkles } from 'lucide-react'

type Charity = { id: string; name: string; description: string | null; image_url: string | null }

export default function HomeClient({ featuredCharities }: { featuredCharities: Charity[] }) {
  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden text-[var(--foreground)]">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-brand)] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 w-full p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-lg md:text-xl flex items-center gap-2">
          <Heart className="text-[var(--color-accent)] w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          <span>ImpactPlay</span>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <Link href="/charities" className="hidden sm:block px-3 py-2 hover:text-[var(--color-brand-light)] transition-colors text-sm font-medium">
            Charities
          </Link>
          <Link href="/login" className="px-3 py-2 font-medium text-sm">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary py-2 px-4 md:px-6 shadow-none text-xs md:text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium mb-6 text-[var(--color-brand-light)]">
            Play for a purpose. Win for yourself.
          </div>
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] font-[var(--font-serif)]">
            Impact <span className="text-[var(--color-accent)] italic">Play.</span>
          </h1>
          <p className="text-lg md:text-xl opacity-50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-[0.2em] text-[10px]">
            Performance fuels human progress. Track your game, support global causes, and win for life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary">
              Start Making Impact
            </Link>
            <Link href="/charities" className="btn-secondary">
              Explore Charities
            </Link>
          </div>
        </motion.div>
        
        {/* Impact Visual Section - Split Layout */}
        <section className="mt-40 grid md:grid-cols-2 gap-20 items-center w-full max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
                alt="Global Impact" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            </div>
            {/* Floating Stat Card */}
            <div className="absolute -bottom-10 -right-10 glass p-10 rounded-[2.5rem] shadow-luxury border border-white/40 max-w-[240px] z-20">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">Audited Impact</p>
              <p className="text-5xl font-bold font-[var(--font-serif)]">$1.2M+</p>
              <p className="text-[10px] mt-3 opacity-40 leading-relaxed font-medium">Distributed to frontline humanitarian efforts globally.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-10"
          >
            <div className="inline-flex items-center gap-4">
              <span className="w-16 h-px bg-black/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">The Foundation</p>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold font-[var(--font-serif)] leading-[1.05] tracking-tighter">
              Where High Play <br />
              <span className="italic text-[var(--color-accent)]">Meets High Purpose.</span>
            </h2>
            <p className="text-xl opacity-50 leading-relaxed font-light max-w-lg">
              ImpactPlay is the world&apos;s first performance-driven lottery. We turn elite performance into sustainable change, allowing you to fund global missions through the game you love.
            </p>
            <div className="pt-6">
              <Link href="/signup" className="btn-primary">
                Join the Elite 
              </Link>
            </div>
          </motion.div>
        </section>
        
        {/* Bento Box Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-48 w-full text-left max-w-7xl mx-auto px-4">
          {/* Main Feature - Large */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-2 glass p-12 rounded-[3.5rem] flex flex-col justify-between min-h-[450px] relative overflow-hidden group shadow-luxury"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-10">
                <Trophy className="text-[var(--color-accent)] w-7 h-7" />
              </div>
              <h3 className="font-bold text-5xl mb-6 font-[var(--font-serif)] tracking-tight">The Standard<br />of Excellence.</h3>
              <p className="opacity-40 max-w-md text-lg leading-relaxed font-light">Your best 5 scores from the last 30 days are automatically entered into our monthly verified draw. Play your game, earn your entry.</p>
            </div>
            <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 grayscale group-hover:grayscale-0 transition-all duration-1000">
              <img src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop" alt="Golf" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 flex gap-3 mt-12">
              {[38, 41, 39, 44, 40].map((s, i) => (
                <div key={i} className="w-12 h-12 rounded-full border border-black/5 bg-white/60 flex items-center justify-center text-xs font-bold shadow-sm">
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Secondary Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass p-12 rounded-[3.5rem] flex flex-col justify-between shadow-luxury"
          >
            <div>
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-10">
                <Globe className="text-emerald-600 w-7 h-7" />
              </div>
              <h3 className="font-bold text-3xl mb-6 font-[var(--font-serif)] tracking-tight">Global<br />Custodians.</h3>
              <p className="opacity-40 text-sm leading-relaxed font-light">Select from our curated list of 50+ world-class charities. 10% of every subscription goes directly to the frontlines.</p>
            </div>
          </motion.div>

          {/* Secondary Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass p-12 rounded-[3.5rem] flex flex-col justify-between shadow-luxury"
          >
            <div>
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-10">
                <Sparkles className="text-amber-600 w-7 h-7" />
              </div>
              <h3 className="font-bold text-3xl mb-6 font-[var(--font-serif)] tracking-tight">Life-Changing<br />Rewards.</h3>
              <p className="opacity-40 text-sm leading-relaxed font-light">Transparent, verified monthly draws with massive jackpots. Win for yourself, while you win for the world.</p>
            </div>
          </motion.div>

          {/* Impact Stat - Large (Fixed Duplicate) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="md:col-span-2 glass-dark p-12 rounded-[3.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-6">Network Reach</p>
              <h3 className="text-6xl md:text-8xl font-bold text-white font-[var(--font-serif)] tracking-tighter">84+ <span className="text-2xl font-light opacity-30">Nations</span></h3>
              <p className="text-white/40 mt-6 max-w-sm uppercase tracking-widest text-[9px] leading-loose">Spanning 6 continents, our community-driven funds provide relief to over 84 nations in critical need.</p>
            </div>
            <div className="hidden md:block absolute right-0 top-0 w-1/3 h-full opacity-20 group-hover:opacity-40 transition-opacity">
               <img src="https://images.unsplash.com/photo-1521295121330-bf2a4482aa30?q=80&w=2070&auto=format&fit=crop" alt="World" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent" />
          </motion.div>
        </div>
      </main>

      {/* Featured Charity Spotlight */}
      {featuredCharities.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-[var(--color-accent)]">
              <Sparkles className="w-3 h-3" />
              Featured Causes
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-[var(--font-serif)] tracking-tight">Make an Impact Today</h2>
            <p className="opacity-50 max-w-2xl mx-auto font-light text-lg">
              These charities are making a real difference. When you subscribe, a portion of every payment goes to your chosen cause.
            </p>
          </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredCharities.map((charity, i) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {charity.image_url ? (
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                        <Heart className="w-12 h-12 opacity-10 text-black" fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="text-[8px] font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm border border-black/5">
                        ⭐ Featured
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 font-[var(--font-serif)] tracking-tight">{charity.name}</h3>
                  <p className="text-sm opacity-40 mb-6 font-light leading-relaxed line-clamp-2">
                    {charity.description || 'A mission dedicated to creating lasting global change.'}
                  </p>
                  <Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)] hover:opacity-70 transition-opacity flex items-center gap-2">
                    Support Cause
                    <span className="w-4 h-px bg-[var(--color-accent)]" />
                  </Link>
                </motion.div>
              ))}
            </div>

          <div className="text-center mt-10">
            <Link href="/charities" className="glass px-8 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--color-brand)]/50 transition-colors font-medium">
              View All Charities →
            </Link>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-12 border border-[var(--color-brand)]/30"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Play for Good?</h2>
          <p className="opacity-70 mb-8 max-w-xl mx-auto">Join thousands of golfers turning their passion into purpose. Subscribe today and start making an impact.</p>
          <Link href="/signup" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group rounded-2xl">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
