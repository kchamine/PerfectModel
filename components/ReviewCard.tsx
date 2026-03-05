'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Review } from '@/lib/types'
import { REVIEW_DIMENSIONS, USE_CASE_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Star, ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react'

interface Props {
  review: Review
  showModel?: boolean
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= value ? 'text-yellow-400' : 'text-slate-700'}
          fill={s <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({ review, showModel = true }: Props) {
  const [expanded, setExpanded] = useState(false)

  const hasNotes = REVIEW_DIMENSIONS.some(
    (d) => review[`note_${d.key.replace('score_', '')}` as keyof Review]
  )

  const useCaseLabel = USE_CASE_LABELS[review.use_case_tag] ?? review.use_case_tag

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">
              @{review.profiles?.username ?? 'anonymous'}
            </span>
            <span className="badge bg-slate-800 text-slate-300 text-xs">{useCaseLabel}</span>
            {showModel && review.models && (
              <Link href={`/models/${review.models.slug}`} className="text-brand-400 text-xs hover:underline">
                {review.models.name}
              </Link>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <ThumbsUp size={12} />
          {review.helpful_count}
        </div>
      </div>

      {/* One-line Summary */}
      <p className="text-slate-200 mb-4">{review.summary}</p>

      {/* Compact Star Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {REVIEW_DIMENSIONS.map((dim) => {
          const score = review[dim.key as keyof Review] as number
          return (
            <div key={dim.key} className="flex items-center justify-between gap-2">
              <span className="text-slate-400 truncate">{dim.label}</span>
              <StarDisplay value={score} />
            </div>
          )
        })}
      </div>

      {/* Expandable Notes */}
      {hasNotes && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded((x) => !x)}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide notes' : 'Show dimension notes'}
          </button>
          {expanded && (
            <div className="mt-3 space-y-2">
              {REVIEW_DIMENSIONS.map((dim) => {
                const noteKey = `note_${dim.key.replace('score_', '')}` as keyof Review
                const note = review[noteKey] as string | null
                if (!note) return null
                return (
                  <div key={dim.key} className="text-xs">
                    <span className="text-slate-400 font-medium">{dim.label}: </span>
                    <span className="text-slate-300">{note}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
