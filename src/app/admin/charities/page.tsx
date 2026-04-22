import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Trash2, Pencil, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminCharitiesPage() {
  const supabase = await createAdminClient()

  const { data: charities } = await supabase.from('charities').select('*').order('name')

  async function addCharity(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string || null
    const featured = formData.get('featured') === 'on'
    
    const db = await createAdminClient()
    await db.from('charities').insert({ name, description, image_url, featured })
    revalidatePath('/admin/charities')
  }

  async function updateCharity(id: string, formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string || null
    const featured = formData.get('featured') === 'on'

    const db = await createAdminClient()
    await db.from('charities').update({ name, description, image_url, featured }).eq('id', id)
    revalidatePath('/admin/charities')
  }

  async function deleteCharity(id: string) {
    'use server'
    const db = await createAdminClient()
    await db.from('charities').delete().eq('id', id)
    revalidatePath('/admin/charities')
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <Link 
        href="/admin" 
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform shadow-xl shadow-black/20"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <h2 className="text-2xl font-bold">Manage Charities</h2>

      {/* Add New Charity */}
      <div className="glass p-6 rounded-2xl border border-[var(--border)] max-w-2xl">
        <h3 className="font-bold mb-4 text-lg">Add New Charity</h3>
        <form action={addCharity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Name *</label>
              <input name="name" type="text" required className="input-base" placeholder="Charity name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Image URL</label>
              <input name="image_url" type="url" className="input-base" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Description</label>
            <textarea name="description" className="input-base" rows={3} placeholder="Brief description of the charity..."></textarea>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="featured" id="featured" className="accent-[var(--color-brand)]" />
            <label htmlFor="featured" className="font-medium">Featured Partner (shown prominently on homepage)</label>
          </div>
          <button type="submit" className="btn-primary">Add Charity</button>
        </form>
      </div>

      {/* Charities List */}
      <div className="glass p-6 rounded-2xl border border-[var(--border)]">
        <h3 className="font-bold mb-4 text-lg">All Charities ({charities?.length || 0})</h3>
        {(!charities || charities.length === 0) ? (
          <p className="opacity-50 text-center py-8">No charities yet. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {charities.map(charity => (
              <details key={charity.id} className="group border border-[var(--border)] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 list-none">
                  <div className="flex items-center gap-3">
                    {charity.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={charity.image_url} alt={charity.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-bold">{charity.name}</p>
                      <p className="text-xs opacity-60">{charity.description?.substring(0, 60)}...</p>
                    </div>
                    {charity.featured && (
                      <span className="text-xs bg-[var(--color-brand)]/20 text-[var(--color-brand-light)] px-2 py-0.5 rounded font-bold">Featured</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Pencil className="w-4 h-4 opacity-40 group-open:opacity-100 transition-opacity" />
                    <form action={deleteCharity.bind(null, charity.id)}>
                      <button type="submit" className="text-red-400 hover:bg-red-400/10 p-1.5 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </summary>

                {/* Edit Form — expands when <details> is opened */}
                <div className="p-4 border-t border-[var(--border)] bg-white/5">
                  <p className="text-sm font-bold mb-3 opacity-70 uppercase tracking-wider">Edit Charity</p>
                  <form action={updateCharity.bind(null, charity.id)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 opacity-60">Name</label>
                        <input name="name" type="text" required defaultValue={charity.name} className="input-base text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 opacity-60">Image URL</label>
                        <input name="image_url" type="url" defaultValue={charity.image_url || ''} className="input-base text-sm" placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 opacity-60">Description</label>
                      <textarea name="description" rows={2} defaultValue={charity.description || ''} className="input-base text-sm"></textarea>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="featured" defaultChecked={charity.featured} className="accent-[var(--color-brand)]" />
                        Featured Partner
                      </label>
                      <button type="submit" className="btn-primary py-1.5 px-4 text-sm">Save Changes</button>
                    </div>
                  </form>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
