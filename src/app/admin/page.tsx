import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminClientComponents from './AdminClientComponents'
import { publishDraw } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch analytics using admin client to bypass RLS
  const { count: usersCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeSubs } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
  const { data: draws } = await adminSupabase.from('draws').select('*').order('created_at', { ascending: false })
  const { data: charities } = await adminSupabase.from('charities').select('id, name, featured')
  const { data: drawEntries } = await adminSupabase.from('draw_entries').select('prize_amount, status, match_count')

  // Compute stats
  const poolPerUser = 6.00
  const totalPool = (activeSubs || 0) * poolPerUser
  const charityImpact = (activeSubs || 0) * 1.50 // 10% of $15

  const totalPaidOut = drawEntries?.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.prize_amount), 0) || 0
  const pendingVerification = drawEntries?.filter(e => e.status === 'pending_proof').length || 0
  const publishedDraws = draws?.filter(d => d.status === 'published').length || 0

  // Tier breakdown across all draws
  const tier1Count = drawEntries?.filter(e => e.match_count === 5).length || 0
  const tier2Count = drawEntries?.filter(e => e.match_count === 4).length || 0
  const tier3Count = drawEntries?.filter(e => e.match_count === 3).length || 0

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Analytics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-2xl border border-[var(--border)]">
          <p className="opacity-70 text-sm font-medium mb-1">Total Users</p>
          <p className="text-3xl font-bold">{usersCount || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-[var(--border)]">
          <p className="opacity-70 text-sm font-medium mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold">{activeSubs || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-[var(--border)]">
          <p className="opacity-70 text-sm font-medium mb-1">Current Prize Pool</p>
          <p className="text-3xl font-bold text-green-500">${totalPool.toFixed(2)}</p>
          <p className="text-xs opacity-50 mt-1">($6.00 per active subscriber)</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-[var(--border)]">
          <p className="opacity-70 text-sm font-medium mb-1">Charity Impact</p>
          <p className="text-3xl font-bold text-[var(--color-brand-light)]">${charityImpact.toFixed(2)}</p>
          <p className="text-xs opacity-50 mt-1">(Min 10% of $15 base)</p>
        </div>
      </div>

      {/* Draw Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-xl border border-[var(--border)]">
          <p className="opacity-60 text-xs font-medium mb-1 uppercase tracking-wider">Published Draws</p>
          <p className="text-2xl font-bold">{publishedDraws}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-yellow-500/30">
          <p className="opacity-60 text-xs font-medium mb-1 uppercase tracking-wider">Jackpot (5×) Winners</p>
          <p className="text-2xl font-bold text-yellow-400">{tier1Count}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-[var(--color-brand)]/30">
          <p className="opacity-60 text-xs font-medium mb-1 uppercase tracking-wider">4× Winners</p>
          <p className="text-2xl font-bold text-[var(--color-brand-light)]">{tier2Count}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-[var(--border)]">
          <p className="opacity-60 text-xs font-medium mb-1 uppercase tracking-wider">3× Winners</p>
          <p className="text-2xl font-bold">{tier3Count}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="glass p-5 rounded-xl border border-[var(--border)] hover:border-[var(--color-brand)]/50 transition-colors group">
          <p className="font-bold mb-1 group-hover:text-[var(--color-brand-light)] transition-colors">👥 Manage Users</p>
          <p className="text-sm opacity-60">View profiles, toggle subscriptions, edit scores</p>
        </Link>
        <Link href="/admin/charities" className="glass p-5 rounded-xl border border-[var(--border)] hover:border-[var(--color-brand)]/50 transition-colors group">
          <p className="font-bold mb-1 group-hover:text-[var(--color-brand-light)] transition-colors">❤️ Manage Charities</p>
          <p className="text-sm opacity-60">{charities?.length || 0} charities · {charities?.filter(c => c.featured).length || 0} featured</p>
        </Link>
        <Link href="/admin/winners" className="glass p-5 rounded-xl border border-[var(--border)] hover:border-[var(--color-brand)]/50 transition-colors group">
          <p className="font-bold mb-1 group-hover:text-[var(--color-brand-light)] transition-colors">🏆 Verify Winners</p>
          <p className="text-sm opacity-60">{pendingVerification} pending · ${totalPaidOut.toFixed(2)} paid out</p>
        </Link>
      </div>

      {/* Draw Management */}
      <div className="glass p-6 rounded-2xl border border-[var(--border)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Draw Management</h2>
            <p className="text-sm opacity-60 mt-1">Simulate a draw first, review the numbers, then publish to award prizes.</p>
          </div>
          <AdminClientComponents />
        </div>
        
        {(!draws || draws.length === 0) ? (
          <p className="opacity-50 text-center py-8">No draws run yet. Click "Simulate Draw" to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-3 px-4 font-medium opacity-70">Month</th>
                  <th className="py-3 px-4 font-medium opacity-70">Status</th>
                  <th className="py-3 px-4 font-medium opacity-70">Winning Numbers</th>
                  <th className="py-3 px-4 font-medium opacity-70">Rollover Jackpot</th>
                  <th className="py-3 px-4 font-medium opacity-70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {draws.map(draw => (
                  <tr key={draw.id} className="border-b border-[var(--border)]/50 hover:bg-white/5">
                    <td className="py-3 px-4">{new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${draw.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {draw.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold tracking-widest text-sm">
                      {draw.winning_numbers?.length > 0
                        ? draw.winning_numbers.join(' · ')
                        : <span className="opacity-30">Not yet drawn</span>}
                    </td>
                    <td className="py-3 px-4">
                      {Number(draw.jackpot_rollover) > 0
                        ? <span className="text-yellow-400 font-bold">${Number(draw.jackpot_rollover).toFixed(2)}</span>
                        : <span className="opacity-30">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      {draw.status === 'simulated' && draw.winning_numbers?.length > 0 && (
                        <form action={publishDraw.bind(null, draw.id)}>
                          <button className="text-sm font-medium text-[var(--color-brand-light)] hover:underline bg-[var(--color-brand)]/10 px-3 py-1 rounded">
                            Publish & Award
                          </button>
                        </form>
                      )}
                      {draw.status === 'published' && (
                        <span className="text-xs text-green-400 opacity-70">✓ Published</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
