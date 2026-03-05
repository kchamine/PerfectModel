// ============================================================
// PerfectModel — Shared TypeScript Types
// ============================================================

export type PricingTier = 'free' | 'freemium' | 'paid' | 'api-only' | 'open-source'

export type UseCase =
  | 'coding'
  | 'writing'
  | 'research'
  | 'customer-support'
  | 'analysis'
  | 'marketing'
  | 'legal'
  | 'education'
  | 'other'

export const USE_CASE_LABELS: Record<UseCase, string> = {
  'coding':           '💻 Coding',
  'writing':          '✍️ Writing',
  'research':         '🔍 Research',
  'customer-support': '💬 Customer Support',
  'analysis':         '📊 Analysis',
  'marketing':        '📣 Marketing',
  'legal':            '⚖️ Legal',
  'education':        '🎓 Education',
  'other':            '🔧 Other',
}

export const REVIEW_DIMENSIONS = [
  { key: 'score_output_quality', label: 'Output Quality',        description: 'Is the response accurate and genuinely useful?' },
  { key: 'score_instruction',    label: 'Instruction Following', description: 'Does it do what you asked, the way you asked?' },
  { key: 'score_consistency',    label: 'Consistency',           description: 'Reliable results, or hit-or-miss?' },
  { key: 'score_speed',          label: 'Speed',                 description: 'Perceived latency for your use case' },
  { key: 'score_cost',           label: 'Cost Efficiency',       description: 'Value relative to what you\'re paying' },
  { key: 'score_personality',    label: 'Personality / Tone',    description: 'Does it communicate in a way that works for you?' },
  { key: 'score_use_case_fit',   label: 'Use Case Fit',          description: 'How well does it serve your specific need?' },
] as const

export type DimensionKey = typeof REVIEW_DIMENSIONS[number]['key']

// ── Database Row Types ───────────────────────────────────────

export interface Profile {
  id: string
  username: string
  bio: string | null
  specialty_tags: string[]
  review_count: number
  created_at: string
}

export interface Model {
  id: string
  name: string
  slug: string
  provider: string
  description: string | null
  release_date: string | null
  context_window: number | null
  pricing_tier: PricingTier | null
  pricing_note: string | null
  modalities: string[]
  is_api_available: boolean
  website_url: string | null
  logo_url: string | null
  score_output_quality: number
  score_instruction: number
  score_consistency: number
  score_speed: number
  score_cost: number
  score_personality: number
  score_use_case_fit: number
  score_overall: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface ModelVersion {
  id: string
  model_id: string
  version_tag: string
  released_at: string | null
  notes: string | null
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  model_id: string
  use_case_tag: UseCase
  summary: string
  score_output_quality: number
  score_instruction: number
  score_consistency: number
  score_speed: number
  score_cost: number
  score_personality: number
  score_use_case_fit: number
  note_output_quality: string | null
  note_instruction: string | null
  note_consistency: string | null
  note_speed: string | null
  note_cost: string | null
  note_personality: string | null
  note_use_case_fit: string | null
  helpful_count: number
  created_at: string
  // Joined
  profiles?: Profile
  models?: Model
}

export interface List {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
  list_models?: ListModel[]
}

export interface ListModel {
  id: string
  list_id: string
  model_id: string
  sort_order: number
  note: string | null
  added_at: string
  // Joined
  models?: Model
}

// ── Form Types ───────────────────────────────────────────────

export interface ReviewFormData {
  model_id: string
  use_case_tag: UseCase
  summary: string
  score_output_quality: number
  score_instruction: number
  score_consistency: number
  score_speed: number
  score_cost: number
  score_personality: number
  score_use_case_fit: number
  note_output_quality?: string
  note_instruction?: string
  note_consistency?: string
  note_speed?: string
  note_cost?: string
  note_personality?: string
  note_use_case_fit?: string
}
