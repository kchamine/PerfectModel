/**
 * sync-models.ts
 *
 * Fetches the full model list from OpenRouter and upserts it into Supabase.
 * Safe to re-run: never overwrites existing review scores.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/sync-models.ts
 *
 * Or with a .env.local file:
 *   npx tsx --env-file=.env.local scripts/sync-models.ts
 */

import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models'

// Maps OpenRouter provider slugs to display names
const PROVIDER_NAMES: Record<string, string> = {
  'openai':         'OpenAI',
  'anthropic':      'Anthropic',
  'google':         'Google',
  'meta-llama':     'Meta',
  'mistralai':      'Mistral AI',
  'xai':            'xAI',
  'x-ai':           'xAI',
  'cohere':         'Cohere',
  'deepseek':       'DeepSeek',
  'microsoft':      'Microsoft',
  'amazon':         'Amazon',
  'nvidia':         'NVIDIA',
  'perplexity':     'Perplexity',
  'together':       'Together AI',
  'databricks':     'Databricks',
  'inflection':     'Inflection',
  'ai21':           'AI21 Labs',
  'writer':         'Writer',
  'nousresearch':   'Nous Research',
  'teknium':        'Teknium',
  'qwen':           'Alibaba (Qwen)',
  'bytedance':      'ByteDance',
  'tencent':        'Tencent',
  'baidu':          'Baidu',
}

interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  hugging_face_id?: string | null
  expiration_date?: string | null
  architecture?: {
    input_modalities?: string[]
  }
  pricing?: {
    prompt?: string
    completion?: string
  }
}

function providerFromId(id: string): string {
  const slug = id.split('/')[0] ?? id
  return PROVIDER_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

function slugFromId(id: string): string {
  return id.replace('/', '-').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
}

function pricingTierFromModel(model: OpenRouterModel): string {
  const promptCost = model.pricing?.prompt ?? '0'
  if (promptCost === '0') return 'free'
  if (model.hugging_face_id) return 'open-source'
  return 'api-only'
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.')
    console.error('Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/sync-models.ts')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  console.log('Fetching models from OpenRouter…')
  const res = await fetch(OPENROUTER_API)
  if (!res.ok) {
    console.error(`OpenRouter API error: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const { data: models }: { data: OpenRouterModel[] } = await res.json()
  console.log(`Received ${models.length} models from OpenRouter.`)

  const rows = models.map((m) => ({
    openrouter_id:   m.id,
    name:            m.name,
    slug:            slugFromId(m.id),
    provider:        providerFromId(m.id),
    description:     m.description ?? null,
    context_window:  m.context_length ?? null,
    modalities:      m.architecture?.input_modalities ?? ['text'],
    pricing_tier:    pricingTierFromModel(m),
    is_active:       !m.expiration_date,
    expiration_date: m.expiration_date ?? null,
    // website_url, logo_url, pricing_note left as-is (not overwritten if already set)
  }))

  console.log(`Upserting ${rows.length} models into Supabase…`)

  // Upsert in batches of 100
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('models')
      .upsert(batch, {
        onConflict: 'openrouter_id',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error(`Batch ${i}–${i + BATCH} error:`, error.message)
    } else {
      inserted += batch.length
    }
  }

  console.log(`Done. ${inserted} models synced.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
