import { createAdminClient } from '@/utils/supabase/server'
import { verifyWinnerProof } from '../actions'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function markPaid(entryId: string) {
  'use server'
  const db = await createAdminClient()
  await db.from('draw_entries').update({ status: 'paid' }).eq('id', entryId)
  revalidatePath('/admin/winners')
}

async function rejectProof(entryId: string) {
  'use server'
  const db = await createAdminClient()
  await db.from('draw_entries').update({ status: 'rejected' }).eq('id', entryId)
  revalidatePath('/admin/winners')
}

export default async function AdminWinnersPage() {
  const adminSupabase = await createAdminClient()

  const { data: entries } = await adminSupabase
    .from('draw_entries')
    .select('*, draws(draw_month), profiles!draw_entries_user_id_fkey(stripe_customer_id)')
    .order('created_at', { ascending: false })

  const statusCounts = {
    pending: entries?.filter(e => e.status === 'pending_proof').length || 0,
    verified: entries?.filter(e => e.status === 'verified').length || 0,
    paid: entries?.filter(e => e.status === 'paid').length || 0,
    rejected: entries?.filter(e => e.status === 'rejected').length || 0,
  }

  const totalPaid = entries?.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.prize_amount), 0) || 0

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <Link 
        href="/admin" 
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform shadow-xl shadow-black/20"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <h2 className="text-2xl font-bold">Verify Winners</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl border border-yellow-500/30">
          <p className="text-xs opacity-60 font-medium mb-1">Pending Proof</p>
          <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-green-500/30">
          <p className="text-xs opacity-60 font-medium mb-1">Verified</p>
          <p className="text-2xl font-bold text-green-400">{statusCounts.verified}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-blue-500/30">
          <p className="text-xs opacity-60 font-medium mb-1">Paid Out</p>
          <p className="text-2xl font-bold text-blue-400">{statusCounts.paid}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-[var(--border)]">
          <p className="text-xs opacity-60 font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-400">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-[var(--border)]">
        {(!entries || entries.length === 0) ? (
          <p className="opacity-50 text-center py-8">No winning entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-3 px-4 font-medium opacity-70">Draw Month</th>
                  <th className="py-3 px-4 font-medium opacity-70">User ID</th>
                  <th className="py-3 px-4 font-medium opacity-70">Match</th>
                  <th className="py-3 px-4 font-medium opacity-70">Prize</th>
                  <th className="py-3 px-4 font-medium opacity-70">Status</th>
                  <th className="py-3 px-4 font-medium opacity-70">Proof</th>
                  <th className="py-3 px-4 font-medium opacity-70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-[var(--border)]/50 hover:bg-white/5">
                    <td className="py-3 px-4">{entry.draws?.draw_month ? new Date(entry.draws.draw_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</td>
                    <td className="py-3 px-4 text-[10px] font-bold opacity-30 tracking-widest">{entry.user_id.substring(0, 12)}...</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-sm ${
                        entry.match_count === 5 ? 'text-yellow-400 bg-yellow-400/10'
                        : entry.match_count === 4 ? 'text-[var(--color-brand-light)] bg-[var(--color-brand)]/10'
                        : 'text-white/80 bg-white/5'
                      }`}>
                        {entry.match_count}×
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-green-400">${Number(entry.prize_amount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.status === 'paid' ? 'bg-blue-500/20 text-blue-400'
                        : entry.status === 'verified' ? 'bg-green-500/20 text-green-400'
                        : entry.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {entry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {entry.proof_image_url ? (
                        <a href={entry.proof_image_url} target="_blank" rel="noreferrer" className="text-[var(--color-brand-light)] hover:underline text-sm">View Proof</a>
                      ) : (
                        <span className="opacity-40 text-sm">Pending Upload</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        {entry.status === 'pending_proof' && (
                          <>
                            <form action={async () => { 'use server'; await verifyWinnerProof(entry.id, 'approve') }}>
                              <button className="text-xs font-medium text-green-400 hover:underline bg-green-400/10 px-2 py-1 rounded">Approve</button>
                            </form>
                            <form action={async () => { 'use server'; await rejectProof(entry.id) }}>
                              <button className="text-xs font-medium text-red-400 hover:underline bg-red-400/10 px-2 py-1 rounded">Reject</button>
                            </form>
                          </>
                        )}
                        {entry.status === 'verified' && (
                          <form action={async () => { 'use server'; await markPaid(entry.id) }}>
                            <button className="text-xs font-medium text-blue-400 hover:underline bg-blue-400/10 px-2 py-1 rounded">Mark Paid</button>
                          </form>
                        )}
                        {entry.status === 'rejected' && (
                          <form action={async () => { 'use server'; await verifyWinnerProof(entry.id, 'approve') }}>
                            <button className="text-xs font-medium text-yellow-400 hover:underline bg-yellow-400/10 px-2 py-1 rounded">Re-Approve</button>
                          </form>
                        )}
                      </div>
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
