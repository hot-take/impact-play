import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { charity_id, contribution_pct } = body

  if (!charity_id) {
    return NextResponse.json({ error: 'charity_id is required' }, { status: 400 })
  }

  const pct = Math.max(10, Math.min(100, parseInt(contribution_pct, 10) || 10))

  const { error } = await supabase
    .from('profiles')
    .update({
      selected_charity_id: charity_id,
      charity_contribution_pct: pct
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update charity: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
