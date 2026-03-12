import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ReviewCard from '@/components/ReviewCard'
import type { Profile, Review, List } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Star, List as ListIcon, User } from 'lucide-react'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `@${params.username} — PerfectModel` }
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const p = profile as unknown as Profile

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, models(name, slug, provider), profiles!user_id(username, avatar_url)')
    .eq('user_id', p.id)
    .order('created_at', { ascending: false })

  const { data: lists } = await supabase
    .from('lists')
    .select('*, list_models(count)')
    .eq('user_id', p.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const r = (reviews ?? []) as unknown as Review[]
  const publicLists = (lists ?? []) as unknown as (List & { list_models: { count: number }[] })[]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="card p-8 mb-8 flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-brand-800 flex items-center justify-center shrink-0 overflow-hidden">
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
          ) : (
            <User size={28} className="text-brand-200" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">@{p.username}</h1>
          {p.bio && <p className="text-slate-400 mt-1">{p.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              {r.length} {r.length === 1 ? 'review' : 'reviews'}
            </span>
            <span className="flex items-center gap-1">
              <ListIcon size={14} className="text-brand-400" />
              {publicLists.length} {publicLists.length === 1 ? 'list' : 'lists'}
            </span>
          </div>
        </div>
      </div>

      {/* Public Lists */}
      {publicLists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Lists</h2>
          <div className="space-y-3">
            {publicLists.map((l) => {
              const modelCount = l.list_models?.[0]?.count ?? 0
              return (
                <Link key={l.id} href={`/lists/${l.id}`}>
                  <div className="card p-5 hover:border-slate-600 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-white mb-1">{l.title}</h3>
                    {l.description && (
                      <p className="text-slate-400 text-sm line-clamp-2">{l.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                      <span>{modelCount} {modelCount === 1 ? 'model' : 'models'}</span>
                      <span>{formatDate(l.created_at)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
        {r.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            No reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {r.map((review) => (
              <ReviewCard key={review.id} review={review} showModel={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
