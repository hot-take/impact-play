import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SignupForm from './SignupForm'

export const dynamic = 'force-dynamic'

export default async function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  // Await searchParams in Next.js 15
  const awaitedParams = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--background)]">
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-black/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-brand)] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)] rounded-full blur-[120px] opacity-20" />
      
      <SignupForm error={awaitedParams.error} />
    </div>
  )
}
