import Link from 'next/link'
import { signout } from '@/app/(auth)/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="pt-6 px-4 max-w-7xl mx-auto">
        <nav className="glass rounded-2xl p-4 flex justify-between items-center relative z-50">
          <div className="flex items-center gap-4 md:gap-8">
            <h1 className="font-bold text-lg md:text-xl tracking-tighter text-black">
              <span className="hidden sm:inline">ImpactPlay Admin</span>
              <span className="sm:hidden">Admin</span>
            </h1>
            <div className="flex gap-4 md:gap-6">
              <Link href="/admin" className="text-[10px] md:text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">Overview</Link>
              <Link href="/admin/users" className="text-[10px] md:text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">Users</Link>
              <Link href="/admin/charities" className="hidden md:block text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">Charities</Link>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            <div className="hidden xs:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Live</span>
            </div>
            <form action={signout}>
              <button className="text-xs md:text-sm font-bold text-red-500/80 hover:text-red-500 transition-colors">Exit</button>
            </form>
          </div>
        </nav>
      </div>
      {children}
    </div>
  )
}
