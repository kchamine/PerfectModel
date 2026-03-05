import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import { createServerClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'PerfectModel — Find the right AI model for any job',
  description:
    'Community-driven ratings and reviews for AI language models. Discover the best model for coding, writing, research, and more.',
  openGraph: {
    title: 'PerfectModel',
    description: 'Community-driven ratings and reviews for AI language models.',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" className="dark">
      <body>
        <Navigation session={session} />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-10 mt-20">
          <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
            <p>PerfectModel — Community AI model ratings &amp; reviews</p>
            <p className="mt-1">Built by the community, for the community.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
