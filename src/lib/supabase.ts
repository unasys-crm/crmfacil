import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Default Supabase client (fallback)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Function to get the current company's Supabase client
export const getSupabaseClient = () => {
  // This will be used by components that need the current company's database
  // The actual client will come from the CompanyContext
  return supabase // Fallback to default client
}

// Helper function to create a new Supabase client for a specific company
export const createSupabaseClient = (url: string, anonKey: string) => {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}