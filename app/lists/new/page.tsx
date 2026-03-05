'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Model } from '@/lib/types'
import Link from 'next/link'
import { X, Plus } from 'lucide-react'

export default function NewListPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string } | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selected, setSelected] = useState<Model[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('models').select('*').order('name')
      setModels((data as unknown as Model[]) ?? [])
    }
    init()
  }, [])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Sign in to create lists</h2>
        <Link href="/auth/signup" className="btn-primary">Create Free Account</Link>
      </div>
    )
  }

  function addModel(model: Model) {
    if (!selected.find((m) => m.id === model.id)) {
      setSelected((s) => [...s, model])
    }
    setSearch('')
  }

  function removeModel(id: string) {
    setSelected((s) => s.filter((m) => m.id !== id))
  }

  const filtered = models.filter(
    (m) =>
      !selected.find((s) => s.id === m.id) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const { data: list, error: listErr } = await supabase
      .from('lists')
      .insert({ user_id: user!.id, title, description, is_public: isPublic })
      .select()
      .single()

    if (listErr || !list) {
      setError(listErr?.message ?? 'Failed to create list')
      setLoading(false)
      return
    }

    if (selected.length > 0) {
      await supabase.from('list_models').insert(
        selected.map((m, i) => ({ list_id: list.id, model_id: m.id, sort_order: i }))
      )
    }

    router.push(`/lists/${list.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Create a List</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">List Title</label>
          <input
            className="input"
            placeholder="e.g. Best models for solo founders"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="What's the purpose of this list?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Add Models */}
        <div>
          <label className="label">Add Models</label>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map((m) => (
                <div key={m.id} className="flex items-center gap-1 badge bg-brand-900 text-brand-200">
                  {m.name}
                  <button type="button" onClick={() => removeModel(m.id)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <input
              className="input"
              placeholder="Search and add models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && filtered.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 card border-slate-700 max-h-48 overflow-y-auto">
                {filtered.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => addModel(m)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Plus size={14} className="text-brand-400" />
                    <span className="text-slate-300">{m.provider}</span>
                    <span className="text-white font-medium">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-3">
          <input
            id="public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="public" className="text-sm text-slate-300">
            Make this list public
          </label>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3" disabled={loading || !title}>
          {loading ? 'Creating…' : 'Create List'}
        </button>
      </form>
    </div>
  )
}
