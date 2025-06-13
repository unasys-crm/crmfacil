import { useCompany } from '../contexts/CompanyContext'
import { supabase as defaultSupabase } from '../lib/supabase'

// Custom hook to get the current company's Supabase client
export function useSupabase() {
  const { supabaseClient } = useCompany()
  
  // Return the company-specific client or fallback to default
  return supabaseClient || defaultSupabase
}