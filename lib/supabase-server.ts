import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Server-side Supabase client — only use in Server Components and Route Handlers
// Never import this in files marked 'use client'
export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })
