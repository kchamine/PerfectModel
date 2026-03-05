'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { Cpu, PenLine, List, LogOut, User } from 'lucide-react'

export default function Navigation({ session }: { session: Session | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-slate-800 bg-[#0f0f14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Cpu size={20} className="text-brand-400" />
          <span>PerfectModel</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <Link href="/models" className="hover:text-white transition-colors">Models</Link>
          <Link href="/lists" className="hover:text-white transition-colors">Lists</Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/reviews/new" className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
                <PenLine size={14} /> Review
              </Link>
              <Link href="/profile" className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
                <User size={14} /> Profile
              </Link>
              <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-white" title="Sign out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm py-1.5">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-1.5">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
