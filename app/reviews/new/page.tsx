'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StarRating from '@/components/StarRating'
import { REVIEW_DIMENSIONS, USE_CASE_LABELS } from '@/lib/types'
import type { Model, ReviewFormData, UseCase } from '@/lib/types'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function NewReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const editId = searchParams.get('edit')

  const [models, setModels] = useState<Model[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const [form, setForm] = useState<ReviewFormData>({
    model_id: '',
    use_case_tag: 'coding',
    summary: '',
    score_output_quality: 0,
    score_instruction: 0,
    score_consistency: 0,
    score_speed: 0,
    score_cost: 0,
    score_personality: 0,
    score_use_case_fit: 0,
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: modelsData } = await supabase
        .from('models')
        .select('id, name, slug, provider')
        .order('name')
      setModels((modelsData as unknown as Model[]) ?? [])

      // Edit mode: pre-populate form with existing review
      if (editId) {
        const { data: existing } = await supabase
          .from('reviews').select('*').eq('id', editId).single()
        if (existing) {
          const r = existing as any
          setForm({
            model_id: r.model_id,
            use_case_tag: r.use_case_tag,
            summary: r.summary,
            score_output_quality: r.score_output_quality,
            score_instruction: r.score_instruction,
            score_consistency: r.score_consistency,
            score_speed: r.score_speed,
            score_cost: r.score_cost,
            score_personality: r.score_personality,
            score_use_case_fit: r.score_use_case_fit,
            note_output_quality: r.note_output_quality ?? undefined,
            note_instruction: r.note_instruction ?? undefined,
            note_consistency: r.note_consistency ?? undefined,
            note_speed: r.note_speed ?? undefined,
            note_cost: r.note_cost ?? undefined,
            note_personality: r.note_personality ?? undefined,
            note_use_case_fit: r.note_use_case_fit ?? undefined,
          })
        }
        return
      }

      // Pre-select model from query param (create mode only)
      const modelSlug = searchParams.get('model')
      if (modelSlug && modelsData) {
        const found = modelsData.find((m: any) => m.slug === modelSlug)
        if (found) setForm((f) => ({ ...f, model_id: (found as any).id }))
      }
    }
    init()
  }, [])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Sign in to write a review</h2>
        <p className="text-slate-400 mb-6">You need an account to submit reviews.</p>
        <Link href="/auth/signup" className="btn-primary">Create Free Account</Link>
      </div>
    )
  }

  function setScore(key: string, val: number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function setNote(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function toggleNote(key: string) {
    setExpandedNotes((e) => ({ ...e, [key]: !e[key] }))
  }

  const allScoresFilled = REVIEW_DIMENSIONS.every(
    (d) => (form[d.key as keyof ReviewFormData] as number) > 0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allScoresFilled) {
      setError('Please rate all 7 dimensions before submitting.')
      return
    }
    setLoading(true)
    setError(null)

    const db = supabase as any
    const payload = { user_id: user!.id, ...form }
    const { error: insertError } = editId
      ? await db.from('reviews').update(form).eq('id', editId)
      : await db.from('reviews').insert(payload)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Navigate to model page on success
    const model = models.find((m) => m.id === form.model_id)
    router.push(model ? `/models/${model.slug}` : '/models')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">{editId ? 'Edit Review' : 'Write a Review'}</h1>
      <p className="text-slate-400 mb-8 text-sm">
        {editId ? 'Update your ratings and notes below.' : 'Rate the model across 7 dimensions. Takes under 90 seconds.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Model Select */}
        <div>
          <label className="label">Model</label>
          <select
            className="input"
            value={form.model_id}
            onChange={(e) => setForm((f) => ({ ...f, model_id: e.target.value }))}
            required
          >
            <option value="">Select a model…</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.provider} — {m.name}</option>
            ))}
          </select>
        </div>

        {/* Use Case */}
        <div>
          <label className="label">What were you using it for?</label>
          <select
            className="input"
            value={form.use_case_tag}
            onChange={(e) => setForm((f) => ({ ...f, use_case_tag: e.target.value as UseCase }))}
            required
          >
            {Object.entries(USE_CASE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div>
          <label className="label">One-line Summary</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Best model I've tried for debugging Python code."
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value.slice(0, 140) }))}
            maxLength={140}
            required
          />
          <p className="text-xs text-slate-500 mt-1">{form.summary.length}/140 characters</p>
        </div>

        {/* 7 Dimensions */}
        <div className="card p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Rate Each Dimension
          </h2>
          {REVIEW_DIMENSIONS.map((dim) => {
            const scoreKey = dim.key as keyof ReviewFormData
            const noteKey = `note_${dim.key.replace('score_', '')}` as keyof ReviewFormData
            const showNote = expandedNotes[dim.key]

            return (
              <div key={dim.key} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{dim.label}</div>
                    <div className="text-xs text-slate-500">{dim.description}</div>
                  </div>
                  <StarRating
                    value={form[scoreKey] as number}
                    onChange={(v) => setScore(scoreKey, v)}
                    size={22}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleNote(dim.key)}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mt-2"
                >
                  {showNote ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showNote ? 'Hide note' : '+ Add note (optional)'}
                </button>

                {showNote && (
                  <textarea
                    className="input mt-2 text-sm resize-none"
                    rows={2}
                    placeholder="Add a brief note about this dimension…"
                    value={(form[noteKey] as string) ?? ''}
                    onChange={(e) => setNote(noteKey, e.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base"
          disabled={loading || !form.model_id || !form.summary}
        >
          {loading ? (editId ? 'Saving…' : 'Submitting…') : (editId ? 'Save Changes' : 'Submit Review')}
        </button>
      </form>
    </div>
  )
}
