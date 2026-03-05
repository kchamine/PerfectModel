import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ModelCard from '@/components/ModelCard'
import type { List, Model } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default async function ListDetailPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: list } = await supabase
    .from('lists')
    .select('*, profiles(username, review_count)')
    .eq('id', params.id)
    .single()

  if (!list) notFound()

  const { data: listModels } = await supabase
    .from('list_models')
    .select('*, models(*)')
    .eq('list_id', params.id)
    .order('sort_order')

  const l = list as unknown as List
  const models = listModels?.map((lm: any) => lm.models as Model) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/lists" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-8">
        <ArrowLeft size={14} /> All Lists
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">{l.title}</h1>
        {l.description && (
          <p className="text-slate-400 mb-4">{l.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>by @{l.profiles?.username}</span>
          <span>{models.length} {models.length === 1 ? 'model' : 'models'}</span>
          <span>Created {formatDate(l.created_at)}</span>
        </div>
      </div>

      {/* Models */}
      {models.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          This list doesn&apos;t have any models yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  )
}
