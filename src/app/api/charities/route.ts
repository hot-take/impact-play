import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: charities, error } = await supabase
    .from('charities')
    .select('id, name, featured')
    .order('featured', { ascending: false })
    .order('name')

  if (error) {
    console.error('Charities API Error:', error)
    return NextResponse.json({ charities: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ charities })
}
