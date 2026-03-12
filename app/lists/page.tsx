import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import type { List } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Plus, List as ListIcon } from 'lucide-react'

export default async function ListsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: lists } = await supabase
    .from('lists')
    .select('*, profiles(username), list_models(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Model Lists</h1>
          <p className="text-slate-400">Curated model collections from the community.</p>
        </div>
        {session && (
          <Link href="/lists/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New List
          </Link>
        )}
      </div>

      {!lists || lists.length === 0 ? (
        <div className="card p-12 text-center">
          <ListIcon size={32} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 mb-4">No lists yet. Be the first to create one!</p>
          {session ? (
            <Link href="/lists/new" className="btn-primary">Create a List</Link>
          ) : (
            <Link href="/auth/signup" className="btn-primary">Join to Create Lists</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const l = list as unknown as List & { list_models: { count: number }[] }
            const modelCount = l.list_models?.[0]?.count ?? 0
            return (
              <Link key={l.id} href={`/lists/${l.id}`}>
                <div className="card p-5 hover:border-slate-600 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-white mb-1">{l.title}</h2>
                      {l.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">{l.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>by @{l.profiles?.username ?? 'anonymous'}</span>
                        <span>{modelCount} {modelCount === 1 ? 'model' : 'models'}</span>
                        <span>{formatDate(l.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
