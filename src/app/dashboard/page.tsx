import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ScoreEntryForm from './ScoreEntryForm'
import ScoreHistory from './ScoreHistory'
import { signout } from '@/app/(auth)/actions'
import { submitProof } from './actions'
import ChangeCharityModal from './ChangeCharityModal'
import { Heart, Calendar, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with charity name
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charities(id, name)')
    .eq('id', user.id)
    .single()

  // Fetch user scores
  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('play_date', { ascending: false })

  // Fetch winning entries
  const { data: winnings } = await supabase
    .from('draw_entries')
    .select('*, draws(draw_month, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch upcoming / most recent draws for participation summary
  const { data: allDraws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })
    .limit(5)

  const totalDrawsEntered = winnings?.length || 0
  const nextDraw = allDraws?.find(d => d.status === 'simulated')
  const latestPublishedDraw = allDraws?.find(d => d.status === 'published')
  const winningNumbers = new Set(latestPublishedDraw?.winning_numbers || [])

  const totalWon = winnings?.filter(w => w.status === 'paid').reduce((acc, curr) => acc + Number(curr.prize_amount), 0) || 0
  const totalPending = winnings?.filter(w => w.status !== 'paid').reduce((acc, curr) => acc + Number(curr.prize_amount), 0) || 0

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="pt-6 px-4 max-w-6xl mx-auto">
        <nav className="glass rounded-2xl p-4 flex justify-between items-center relative z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="text-[var(--color-accent)] w-5 h-5" fill="currentColor" />
              <h1 className="font-bold text-lg md:text-xl tracking-tight">
                <span className="hidden sm:inline">ImpactPlay Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </h1>
            </div>
            
            {profile?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-[var(--color-brand)]/5 text-[var(--color-brand-light)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-black/5 hover:bg-black/10 transition-all"
              >
                Admin
              </Link>
            )}
          </div>
          <form action={signout}>
            <button className="text-sm font-medium opacity-70 hover:opacity-100 hover:text-[var(--color-brand-light)] transition-opacity">Sign Out</button>
          </form>
        </nav>
      </div>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
          
          {/* 1. Subscription Status (Square) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-1 shadow-luxury flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6">Status</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${profile?.subscription_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-2xl font-bold font-[var(--font-serif)]">{profile?.subscription_status === 'active' ? 'Premium Active' : 'Inactive'}</span>
              </div>
            </div>
            {profile?.subscription_status !== 'active' && (
              <form action={async () => { 'use server'; redirect('/subscribe') }}>
                <button className="btn-primary w-full py-4">Activate Now</button>
              </form>
            )}
          </div>

          {/* 2. Monthly Draw Ticket (Wide) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-2 shadow-luxury bg-gradient-to-br from-white/10 to-transparent relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-xl font-bold font-[var(--font-serif)]">Current Draw Ticket</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Active Entry</span>
            </div>
            
            <div className="flex gap-4 justify-center relative z-10 mb-8">
              {(scores?.slice(0, 5) || []).concat(Array(Math.max(0, 5 - (scores?.length || 0))).fill(null)).map((s, idx) => {
                const val = s?.score
                const isMatch = val && winningNumbers.has(val)
                return (
                  <div 
                    key={idx} 
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-700 shadow-xl ${
                      isMatch 
                      ? 'bg-green-500 text-white scale-110 shadow-green-500/20' 
                      : val 
                        ? 'bg-black text-white' 
                        : 'border-2 border-dashed border-black/10 text-black/10'
                    }`}
                  >
                    {val || '?'}
                  </div>
                )
              })}
            </div>
            <p className="text-center text-sm opacity-40 font-light max-w-sm mx-auto relative z-10">
              {scores && scores.length >= 5 
                ? "Your entry is locked for the next draw. Good luck!"
                : `Log ${5 - (scores?.length || 0)} more scores to qualify.`}
            </p>
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-[var(--color-accent)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-accent)]/10 transition-colors" />
          </div>

          {/* 3. Participation Stats (Square) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-1 shadow-luxury flex flex-col justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6">Participation</h2>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-bold font-[var(--font-serif)]">{totalDrawsEntered}</p>
                <p className="text-xs opacity-50 uppercase tracking-widest">Draws Entered</p>
              </div>
              <div>
                <p className="text-4xl font-bold font-[var(--font-serif)]">{scores?.length || 0}/5</p>
                <p className="text-xs opacity-50 uppercase tracking-widest">Scores Logged</p>
              </div>
            </div>
          </div>

          {/* 4. Log a New Score (Wide) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-2 shadow-luxury">
            <h2 className="text-xl font-bold mb-6 font-[var(--font-serif)]">Log Performance</h2>
            {profile?.subscription_status === 'active' ? (
              <ScoreEntryForm />
            ) : (
              <div className="p-6 bg-black/5 rounded-2xl text-center opacity-40 italic">
                Active subscription required to log data.
              </div>
            )}
          </div>

          {/* 5. Draw Winnings (Square) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-1 shadow-luxury flex flex-col justify-between bg-black text-white border-none">
            <div>
              <Trophy className="w-8 h-8 text-yellow-400 mb-6" />
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Total Winnings</h2>
              <p className="text-5xl font-bold font-[var(--font-serif)]">${totalWon.toFixed(2)}</p>
            </div>
            <p className="text-xs opacity-40 mt-4">Verified & Paid</p>
          </div>

          {/* 6. Your Impact Mission (Square) */}
          <div className="glass p-8 rounded-[2.5rem] md:col-span-1 shadow-luxury flex flex-col justify-between border-emerald-900/10">
            <div>
              <Heart className="w-8 h-8 text-[var(--color-accent)] mb-6" fill="currentColor" />
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-2">Impact Mission</h2>
              <p className="text-xl font-bold font-[var(--font-serif)] leading-tight">{profile?.charities?.name || 'No Mission Set'}</p>
            </div>
            <ChangeCharityModal
              currentCharityId={profile?.selected_charity_id || null}
              currentPct={profile?.charity_contribution_pct || 10}
            />
          </div>

          {/* 7. Score History (Full Width) */}
          <div className="glass p-8 rounded-[3rem] md:col-span-4 shadow-luxury">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold font-[var(--font-serif)]">Performance History</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Archive</span>
            </div>
            <ScoreHistory scores={scores || []} />
          </div>

        </div>
      </main>
    </div>
  )
}
