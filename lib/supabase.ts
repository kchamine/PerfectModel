import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Client-side Supabase client — safe to use in Client Components ('use client')
export const createClient = () =>
  createClientComponentClient<Database>()
