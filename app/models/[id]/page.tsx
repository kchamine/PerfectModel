import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import DimensionScorecard from '@/components/DimensionScorecard'
import ReviewCard from '@/components/ReviewCard'
import type { Model, Review } from '@/lib/types'
import { formatContextWindow, formatDate, getPricingBadgeColor, formatScore, scoreToColor } from '@/lib/utils'
import { ExternalLink, Star, PenLine } from 'lucide-react'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServerClient()
  const { data: model } = await supabase
    .from('models')
    .select('name, provider, description')
    .eq('slug', params.id)
    .single()

  return {
    title: model ? `${model.name} by ${model.provider} — PerfectModel` : 'Model — PerfectModel',
    description: model?.description ?? undefined,
  }
}

export default async function ModelProfilePage({ params }: Props) {
  const supabase = createServerClient()

  const { data: model } = await supabase
    .from('models')
    .select('*')
    .eq('slug', params.id)
    .single()

  if (!model) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!user_id(username, review_count, specialty_tags)')
    .eq('model_id', model.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: versions } = await supabase
    .from('model_versions')
    .select('*')
    .eq('model_id', model.id)
    .order('released_at', { ascending: false })

  const m = model as unknown as Model
  const r = (reviews ?? []) as unknown as Review[]

  // Fetch current user and their votes for these reviews
  const { data: { user } } = await supabase.auth.getUser()
  const reviewIds = r.map((rev) => rev.id)
  let votedReviewIds = new Set<string>()
  if (user && reviewIds.length > 0) {
    const { data: votes } = await supabase
      .from('review_helpful_votes')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviewIds)
    votedReviewIds = new Set((votes ?? []).map((v: any) => v.review_id))
  }

  // Use-case distribution from reviews
  const useCaseCounts = r.reduce<Record<string, number>>((acc, rev) => {
    acc[rev.use_case_tag] = (acc[rev.use_case_tag] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* ① Hero */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-slate-400">{m.provider}</span>
            {m.pricing_tier && (
              <span className={`badge ${getPricingBadgeColor(m.pricing_tier)}`}>
                {m.pricing_tier}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{m.name}</h1>
          {m.description && (
            <p className="text-slate-400 max-w-xl">{m.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
            {m.release_date && <span>Released: {formatDate(m.release_date)}</span>}
            {m.context_window && <span>Context: {formatContextWindow(m.context_window)}</span>}
            {m.pricing_note && <span>{m.pricing_note}</span>}
          </div>
        </div>

        {/* Overall Score */}
        <div className="card p-6 text-center min-w-[160px] shrink-0">
          <div className={`text-5xl font-bold ${scoreToColor(m.score_overall)}`}>
            {m.review_count > 0 ? formatScore(m.score_overall) : '–'}
          </div>
          <div className="text-slate-400 text-sm mt-1">Overall Score</div>
          <div className="text-slate-500 text-xs mt-2">{m.review_count} reviews</div>
          {m.modalities?.map((mod) => (
            <span key={mod} className="badge bg-slate-800 text-slate-300 mr-1 mt-2">{mod}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-12">
        <Link href={`/reviews/new?model=${m.slug}`} className="btn-primary flex items-center gap-2">
          <PenLine size={16} /> Write a Review
        </Link>
        {m.website_url && (
          <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
            Visit Site <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* ② Dimension Scorecard */}
      {m.review_count > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Dimension Breakdown</h2>
          <DimensionScorecard model={m} />
        </section>
      )}

      {/* ③ Use-Case Distribution */}
      {Object.keys(useCaseCounts).length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Reviewed For</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(useCaseCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([tag, count]) => (
                <span key={tag} className="badge bg-slate-800 text-slate-200">
                  {tag} <span className="ml-1 text-slate-500">{count}</span>
                </span>
              ))}
          </div>
        </section>
      )}

      {/* ④ Reviews */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">
          Reviews{r.length > 0 && <span className="text-slate-500 font-normal ml-2">({r.length})</span>}
        </h2>
        {r.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            No reviews yet.{' '}
            <Link href={`/reviews/new?model=${m.slug}`} className="text-brand-400 hover:underline">
              Be the first to review {m.name}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {r.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showModel={false}
                userId={user?.id}
                userHasVoted={votedReviewIds.has(review.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ⑥ Version History */}
      {versions && versions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Version History</h2>
          <div className="space-y-3">
            {versions.map((v) => (
              <div key={v.id} className="card p-4 flex items-start gap-4">
                <div className="text-xs text-slate-500 whitespace-nowrap pt-0.5 w-28">
                  {v.released_at ? formatDate(v.released_at) : 'Unknown date'}
                </div>
                <div>
                  <div className="font-mono text-sm text-brand-300">{v.version_tag}</div>
                  {v.notes && <div className="text-slate-400 text-sm mt-1">{v.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
