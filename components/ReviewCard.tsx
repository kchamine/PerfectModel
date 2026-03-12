'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Review } from '@/lib/types'
import { REVIEW_DIMENSIONS, USE_CASE_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { Star, ChevronDown, ChevronUp, ThumbsUp, Pencil, Trash2 } from 'lucide-react'

interface Props {
  review: Review
  showModel?: boolean
  userId?: string | null
  userHasVoted?: boolean
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

export default function ReviewCard({ review, showModel = true, userId, userHasVoted = false }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [expanded, setExpanded] = useState(false)
  const [voted, setVoted] = useState(userHasVoted)
  const [count, setCount] = useState(review.helpful_count ?? 0)

  const hasNotes = REVIEW_DIMENSIONS.some(
    (d) => review[`note_${d.key.replace('score_', '')}` as keyof Review]
  )

  const useCaseLabel = USE_CASE_LABELS[review.use_case_tag] ?? review.use_case_tag
  const isAuthor = !!userId && userId === review.user_id
  const canVote = !!userId && !isAuthor

  async function handleVote() {
    if (!canVote) return
    const nextVoted = !voted
    setVoted(nextVoted)
    setCount((c) => c + (nextVoted ? 1 : -1))

    if (nextVoted) {
      await supabase.from('review_helpful_votes').insert({ user_id: userId, review_id: review.id })
    } else {
      await supabase.from('review_helpful_votes').delete()
        .eq('user_id', userId!).eq('review_id', review.id)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this review? This cannot be undone.')) return
    await supabase.from('reviews').delete().eq('id', review.id)
    router.refresh()
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {review.profiles?.username ? (
              <Link href={`/users/${review.profiles.username}`} className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                <div className="w-5 h-5 rounded-full bg-brand-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {(review.profiles as any).avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(review.profiles as any).avatar_url} alt={review.profiles.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-brand-200 font-semibold" style={{ fontSize: 9 }}>
                      {review.profiles.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-medium text-white text-sm">@{review.profiles.username}</span>
              </Link>
            ) : (
              <span className="font-medium text-white text-sm">anonymous</span>
            )}
            <span className="badge bg-slate-800 text-slate-300 text-xs">{useCaseLabel}</span>
            {showModel && review.models && (
              <Link href={`/models/${review.models.slug}`} className="text-brand-400 text-xs hover:underline">
                {review.models.name}
              </Link>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(review.created_at)}</p>
        </div>

        {/* Actions: helpful vote + author edit/delete */}
        <div className="flex items-center gap-2">
          {isAuthor && (
            <>
              <button
                onClick={() => router.push(`/reviews/new?edit=${review.id}`)}
                className="text-slate-500 hover:text-brand-400 transition-colors"
                title="Edit review"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Delete review"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            onClick={handleVote}
            disabled={!canVote}
            className={`flex items-center gap-1 text-xs transition-colors ${
              voted ? 'text-brand-400' : 'text-slate-500'
            } ${canVote ? 'hover:text-brand-300 cursor-pointer' : 'cursor-default'}`}
            title={!userId ? 'Sign in to vote' : isAuthor ? "Can't vote your own review" : voted ? 'Remove helpful vote' : 'Mark as helpful'}
          >
            <ThumbsUp size={12} fill={voted ? 'currentColor' : 'none'} />
            {count}
          </button>
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
