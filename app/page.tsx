import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ModelCard from '@/components/ModelCard'
import type { Model } from '@/lib/types'
import { ArrowRight, Star, Layers, Users } from 'lucide-react'

export default async function HomePage() {
  const supabase = createServerClient()

  // Fetch top-rated models
  const { data: topModels } = await supabase
    .from('models')
    .select('*')
    .order('score_overall', { ascending: false })
    .limit(6)

  // Fetch most-reviewed models
  const { data: mostReviewed } = await supabase
    .from('models')
    .select('*')
    .order('review_count', { ascending: false })
    .limit(3)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Hero */}
      <section className="text-center py-16">
        <div className="inline-flex items-center gap-2 bg-brand-950 text-brand-300 text-sm px-3 py-1 rounded-full mb-6 border border-brand-800">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          Community-verified AI model reviews
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
          Find your{' '}
          <span className="text-brand-400">perfect model</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Community-driven ratings for AI language models. Discover the best model for coding,
          writing, research, and more — with real user reviews across 7 key dimensions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/models" className="btn-primary flex items-center gap-2">
            Browse Models <ArrowRight size={16} />
          </Link>
          <Link href="/auth/signup" className="btn-secondary">
            Join & Review
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-3 gap-4 mb-16">
        {[
          { icon: Layers, label: 'AI Models', value: '50+' },
          { icon: Star,   label: 'Community Reviews', value: '1,000+' },
          { icon: Users,  label: 'Use Case Tags', value: '9' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-6 text-center">
            <Icon className="mx-auto mb-2 text-brand-400" size={24} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </section>

      {/* Top-Rated Models */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Top-Rated Models</h2>
          <Link href="/models" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topModels?.map((model) => (
            <ModelCard key={model.id} model={model as unknown as Model} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card p-10 text-center bg-gradient-to-br from-brand-950 to-[#1a1a24]">
        <h2 className="text-2xl font-bold text-white mb-3">
          Have a model opinion? Share it.
        </h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
          Your reviews help others find the right model for their work. Rate across 7 dimensions
          in under 90 seconds.
        </p>
        <Link href="/reviews/new" className="btn-primary inline-flex items-center gap-2">
          Write a Review <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
