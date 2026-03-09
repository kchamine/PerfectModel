'use client'

import Link from 'next/link'
import type { Model } from '@/lib/types'
import { formatScore, getPricingBadgeColor, formatContextWindow, scoreToColor, getProviderLogoUrl } from '@/lib/utils'
import { Star, MessageSquare } from 'lucide-react'

function ProviderLogo({ provider, size }: { provider: string; size: number }) {
  const logoUrl = getProviderLogoUrl(provider)
  const initials = provider.slice(0, 2).toUpperCase()
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={provider}
        width={size}
        height={size}
        className="rounded object-contain flex-shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="rounded bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

interface Props {
  model: Model
}

export default function ModelCard({ model }: Props) {
  const hasReviews = model.review_count > 0

  return (
    <Link href={`/models/${model.slug}`}>
      <div className="card p-5 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-brand-950/50 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2.5">
            <ProviderLogo provider={model.provider} size={28} />
            <div>
              <div className="text-xs text-slate-500 mb-0.5">{model.provider}</div>
              <h3 className="font-semibold text-white">{model.name}</h3>
            </div>
          </div>
          {hasReviews ? (
            <div className={`text-xl font-bold ${scoreToColor(model.score_overall)}`}>
              {formatScore(model.score_overall)}
            </div>
          ) : (
            <div className="text-slate-600 text-sm">No reviews</div>
          )}
        </div>

        {/* Description */}
        {model.description && (
          <p className="text-slate-400 text-sm line-clamp-2 mb-3 flex-1">{model.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {model.is_active === false && (
            <span className="badge bg-slate-700 text-slate-400">Legacy</span>
          )}
          {model.pricing_tier && (
            <span className={`badge ${getPricingBadgeColor(model.pricing_tier)}`}>
              {model.pricing_tier}
            </span>
          )}
          {model.context_window && (
            <span className="badge bg-slate-800 text-slate-300">
              {formatContextWindow(model.context_window)}
            </span>
          )}
          {model.modalities?.slice(0, 2).map((mod) => (
            <span key={mod} className="badge bg-slate-800 text-slate-400">{mod}</span>
          ))}
        </div>

        {/* Review Count */}
        {hasReviews && (
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
            <MessageSquare size={12} />
            {model.review_count} {model.review_count === 1 ? 'review' : 'reviews'}
          </div>
        )}
      </div>
    </Link>
  )
}
