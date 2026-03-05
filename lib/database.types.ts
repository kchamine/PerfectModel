// Auto-generated Supabase types (simplified for PerfectModel MVP)
// You can regenerate these with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          bio: string | null
          specialty_tags: string[]
          review_count: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          bio?: string | null
          specialty_tags?: string[]
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          bio?: string | null
          specialty_tags?: string[]
          review_count?: number
          created_at?: string
        }
      }
      models: {
        Row: {
          id: string
          name: string
          slug: string
          provider: string
          description: string | null
          release_date: string | null
          context_window: number | null
          pricing_tier: string | null
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
        Insert: {
          id?: string
          name: string
          slug: string
          provider: string
          description?: string | null
          release_date?: string | null
          context_window?: number | null
          pricing_tier?: string | null
          pricing_note?: string | null
          modalities?: string[]
          is_api_available?: boolean
          website_url?: string | null
          logo_url?: string | null
          score_output_quality?: number
          score_instruction?: number
          score_consistency?: number
          score_speed?: number
          score_cost?: number
          score_personality?: number
          score_use_case_fit?: number
          score_overall?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['models']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          model_id: string
          use_case_tag: string
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
        }
        Insert: {
          id?: string
          user_id: string
          model_id: string
          use_case_tag: string
          summary: string
          score_output_quality: number
          score_instruction: number
          score_consistency: number
          score_speed: number
          score_cost: number
          score_personality: number
          score_use_case_fit: number
          note_output_quality?: string | null
          note_instruction?: string | null
          note_consistency?: string | null
          note_speed?: string | null
          note_cost?: string | null
          note_personality?: string | null
          note_use_case_fit?: string | null
          helpful_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      lists: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['lists']['Insert']>
      }
      list_models: {
        Row: {
          id: string
          list_id: string
          model_id: string
          sort_order: number
          note: string | null
          added_at: string
        }
        Insert: {
          id?: string
          list_id: string
          model_id: string
          sort_order?: number
          note?: string | null
          added_at?: string
        }
        Update: Partial<Database['public']['Tables']['list_models']['Insert']>
      }
      review_helpful_votes: {
        Row: {
          user_id: string
          review_id: string
        }
        Insert: {
          user_id: string
          review_id: string
        }
        Update: never
      }
    }
  }
}
