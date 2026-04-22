import { createClient } from '@/utils/supabase/server'
import CharityList from './CharityList'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CharitiesPage() {
  const supabase = await createClient()
  
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/" 
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-8 hover:scale-110 transition-transform shadow-xl shadow-black/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <h1 className="text-4xl font-bold mb-4">Our Partner Charities</h1>
        <p className="opacity-70 mb-10 max-w-2xl">
          We believe in giving back. A portion of every subscription goes directly to the causes you care about most. Explore our partners below.
        </p>
        
        <CharityList initialCharities={charities || []} />
      </div>
    </div>
  )
}
