import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import ReviewCard from '@/components/ReviewCard'
import type { Review, Profile } from '@/lib/types'
import { Star, List, User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, models(name, slug, provider)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const p = profile as unknown as Profile
  const r = (reviews ?? []) as unknown as Review[]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="card p-8 mb-8 flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-brand-800 flex items-center justify-center shrink-0">
          <User size={28} className="text-brand-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">@{p?.username}</h1>
          {p?.bio && <p className="text-slate-400 mt-1">{p.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              {p?.review_count ?? 0} reviews
            </span>
            <span className="flex items-center gap-1">
              <List size={14} className="text-brand-400" />
              {lists?.length ?? 0} lists
            </span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Your Reviews</h2>
        {r.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            You haven&apos;t written any reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {r.map((review) => (
              <ReviewCard key={review.id} review={review} showModel={true} userId={session.user.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
