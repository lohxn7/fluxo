import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fica desligado até você criar o projeto no supabase.com e preencher o .env.local
// (veja .env.example). Enquanto isso o Fluxo continua funcionando 100% local, como hoje.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null
