'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ModelCard from '@/components/ModelCard'
import type { Model, UseCase } from '@/lib/types'
import { USE_CASE_LABELS } from '@/lib/types'
import { Search, SlidersHorizontal } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'score_overall',  label: 'Top Rated' },
  { value: 'review_count',   label: 'Most Reviewed' },
  { value: 'release_date',   label: 'Newest' },
  { value: 'name',           label: 'A–Z' },
]

const PRICING_OPTIONS = [
  { value: '', label: 'All Pricing' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open-source', label: 'Open Source' },
  { value: 'api-only', label: 'API Only' },
]

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score_overall')
  const [filterPricing, setFilterPricing] = useState('')
  const [filterUseCase, setFilterUseCase] = useState('')

  const supabase = createClient()

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? ''
  const pricingLabel = PRICING_OPTIONS.find(o => o.value === filterPricing)?.label ?? 'All Pricing'
  const useCaseLabel = filterUseCase ? (USE_CASE_LABELS[filterUseCase as UseCase] ?? filterUseCase) : 'All Use Cases'

  useEffect(() => {
    async function fetchModels() {
      setLoading(true)
      let query = supabase
        .from('models')
        .select('*')
        .order(sortBy, { ascending: sortBy === 'name' })

      if (filterPricing) query = query.eq('pricing_tier', filterPricing)
      if (search) query = query.ilike('name', `%${search}%`)

      if (filterUseCase) {
        const { data: rows } = await supabase
          .from('reviews').select('model_id').eq('use_case_tag', filterUseCase)
        const ids = (rows ?? []).map((r: any) => r.model_id)
        if (ids.length === 0) { setModels([]); setLoading(false); return }
        query = query.in('id', ids)
      }

      const { data } = await query
      setModels((data as unknown as Model[]) ?? [])
      setLoading(false)
    }
    fetchModels()
  }, [sortBy, filterPricing, search, filterUseCase])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Models</h1>
        <p className="text-slate-400">Community-rated language models, ranked by real user reviews.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            className="input pl-9"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <select
          className="input w-auto"
          style={{ width: `${sortLabel.length + 5}ch` }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Pricing filter */}
        <select
          className="input w-auto"
          style={{ width: `${pricingLabel.length + 5}ch` }}
          value={filterPricing}
          onChange={(e) => setFilterPricing(e.target.value)}
        >
          {PRICING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Use-case filter */}
        <select
          className="input w-auto"
          style={{ width: `${useCaseLabel.length + 5}ch` }}
          value={filterUseCase}
          onChange={(e) => setFilterUseCase(e.target.value)}
        >
          <option value="">All Use Cases</option>
          {Object.entries(USE_CASE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Model Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No models found. Try adjusting your filters.
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
