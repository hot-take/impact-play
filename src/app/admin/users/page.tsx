import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const adminSupabase = await createAdminClient()
  const { data: users } = await adminSupabase
    .from('profiles')
    .select('*, charities(name)')
    .order('created_at', { ascending: false })
  const userIds = users?.map(u => u.id) || []
  const { data: allScores } = userIds.length > 0
    ? await adminSupabase
        .from('scores')
        .select('*')
        .in('user_id', userIds)
        .order('play_date', { ascending: false })
    : { data: [] }

  async function toggleSubscription(id: string, currentStatus: string) {
    'use server'
    const db = await createAdminClient()
    await db.from('profiles').update({
      subscription_status: currentStatus === 'active' ? 'inactive' : 'active'
    }).eq('id', id)
    revalidatePath('/admin/users')
  }

  async function adminDeleteScore(scoreId: string) {
    'use server'
    const db = await createAdminClient()
    await db.from('scores').delete().eq('id', scoreId)
    revalidatePath('/admin/users')
  }

  async function adminEditScore(scoreId: string, formData: FormData) {
    'use server'
    const newScore = parseInt(formData.get('score') as string, 10)
    if (newScore < 1 || newScore > 45) return
    const db = await createAdminClient()
    await db.from('scores').update({ score: newScore }).eq('id', scoreId)
    revalidatePath('/admin/users')
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <Link 
        href="/admin" 
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform shadow-xl shadow-black/20"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <h2 className="text-2xl font-bold">Manage Users</h2>

      {(!users || users.length === 0) ? (
        <div className="glass p-8 rounded-2xl text-center opacity-50">No users registered yet.</div>
      ) : (
        <div className="space-y-4">
          {users.map(u => {
            const userScores = allScores?.filter(s => s.user_id === u.id) || []
            return (
              <details key={u.id} className="group glass rounded-2xl border border-[var(--border)] overflow-hidden">
                <summary className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-white/5 list-none">
                  {/* User ID */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold opacity-30 tracking-widest">ID: {u.id.substring(0, 16)}...</p>
                    <p className="font-bold capitalize">{u.role}</p>
                  </div>

                  {/* Subscription */}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.subscription_status || 'inactive'}
                  </span>

                  {/* Charity */}
                  {u.charities?.name && (
                    <span className="text-xs text-[var(--color-brand-light)] bg-[var(--color-brand)]/10 px-2 py-1 rounded">
                      ❤️ {u.charities.name}
                    </span>
                  )}
                  <span className="text-xs opacity-50">{u.charity_contribution_pct || 10}% charity</span>

                  {/* Score count */}
                  <span className="text-xs opacity-50">{userScores.length}/5 scores</span>

                  {/* Toggle Sub */}
                  <form action={toggleSubscription.bind(null, u.id, u.subscription_status)}>
                    <button type="submit" className="text-xs font-medium text-[var(--color-brand-light)] hover:underline bg-[var(--color-brand)]/10 px-2 py-1 rounded">
                      {u.subscription_status === 'active' ? 'Deactivate' : 'Activate'} Sub
                    </button>
                  </form>
                </summary>

                {/* Expanded: Score editor */}
                <div className="p-5 border-t border-[var(--border)] bg-white/5">
                  <p className="text-sm font-bold uppercase tracking-wider opacity-50 mb-3">Score Management (Admin)</p>
                  {userScores.length === 0 ? (
                    <p className="text-sm opacity-40">No scores logged by this user.</p>
                  ) : (
                    <div className="space-y-2">
                      {userScores.map(s => (
                        <div key={s.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                          <span className="text-sm opacity-60 w-24">{new Date(s.play_date).toLocaleDateString()}</span>
                          <form action={adminEditScore.bind(null, s.id)} className="flex items-center gap-2 flex-1">
                            <input
                              name="score"
                              type="number"
                              min={1}
                              max={45}
                              defaultValue={s.score}
                              className="input-base w-20 text-sm py-1"
                            />
                            <button type="submit" className="text-xs bg-[var(--color-brand)]/20 text-[var(--color-brand-light)] hover:bg-[var(--color-brand)]/40 px-2 py-1 rounded font-medium transition-colors">
                              Save
                            </button>
                          </form>
                          <form action={adminDeleteScore.bind(null, s.id)}>
                            <button type="submit" className="text-xs text-red-400 hover:bg-red-400/10 px-2 py-1 rounded font-medium">
                              Delete
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </main>
  )
}
