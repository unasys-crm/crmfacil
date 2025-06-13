import { useCompany } from '../contexts/CompanyContext'
import { supabase as defaultSupabase } from '../lib/supabase'

export function useSupabase() {
  const { supabaseClient, connectionStatus } = useCompany()
  
  // Return the company-specific client if available, otherwise fallback to default
  const client = supabaseClient || defaultSupabase
  
  return {
    supabase: client,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isDisconnected: connectionStatus === 'disconnected',
    isTesting: connectionStatus === 'testing'
  }
}