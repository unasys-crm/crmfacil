import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

interface Company {
  id: string
  name: string
  domain: string
  supabase_url?: string
  supabase_anon_key?: string
}

interface CompanyContextType {
  currentCompany: Company | null
  companies: Company[]
  switchCompany: (company: Company) => void
  loading: boolean
  supabaseClient: SupabaseClient<Database> | null
  connectionStatus: 'connected' | 'disconnected' | 'testing' | 'unknown'
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

// Configuration for different companies/tenants
const COMPANY_CONFIGS: Record<string, { supabase_url: string; supabase_anon_key: string }> = {
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': {
    supabase_url: import.meta.env.VITE_SUPABASE_URL || '',
    supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22': {
    // Example second company - you would configure different Supabase project
    supabase_url: import.meta.env.VITE_SUPABASE_URL_COMPANY2 || import.meta.env.VITE_SUPABASE_URL || '',
    supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY_COMPANY2 || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33': {
    // Example third company
    supabase_url: import.meta.env.VITE_SUPABASE_URL_COMPANY3 || import.meta.env.VITE_SUPABASE_URL || '',
    supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY_COMPANY3 || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | 'unknown'>('unknown')

  useEffect(() => {
    if (user) {
      loadCompanies()
    }
  }, [user])

  // Create Supabase client when company changes
  useEffect(() => {
    if (currentCompany) {
      createSupabaseClient(currentCompany)
    }
  }, [currentCompany])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      
      // Mock companies data - in a real multi-tenant system, this would come from a central database
      // or a configuration service that maps users to their available companies
      const mockCompanies: Company[] = [
        { 
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
          name: 'Empresa Demo', 
          domain: 'demo.crmfacil.com',
          supabase_url: COMPANY_CONFIGS['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']?.supabase_url,
          supabase_anon_key: COMPANY_CONFIGS['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']?.supabase_anon_key
        },
        { 
          id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
          name: 'Minha Empresa', 
          domain: 'minhaempresa.crmfacil.com',
          supabase_url: COMPANY_CONFIGS['b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22']?.supabase_url,
          supabase_anon_key: COMPANY_CONFIGS['b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22']?.supabase_anon_key
        },
        { 
          id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
          name: 'Empresa Teste', 
          domain: 'teste.crmfacil.com',
          supabase_url: COMPANY_CONFIGS['c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33']?.supabase_url,
          supabase_anon_key: COMPANY_CONFIGS['c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33']?.supabase_anon_key
        }
      ]
      
      setCompanies(mockCompanies)
      
      // Try to restore previously selected company from localStorage
      const savedCompanyId = localStorage.getItem('currentCompanyId')
      const savedCompany = mockCompanies.find(c => c.id === savedCompanyId)
      
      if (savedCompany) {
        setCurrentCompany(savedCompany)
      } else {
        // Default to first company
        setCurrentCompany(mockCompanies[0])
      }
      
    } catch (error) {
      console.error('Error loading companies:', error)
      // Fallback to default company
      const defaultCompany = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Empresa Demo',
        domain: 'demo.crmfacil.com',
        supabase_url: import.meta.env.VITE_SUPABASE_URL,
        supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY
      }
      setCompanies([defaultCompany])
      setCurrentCompany(defaultCompany)
    } finally {
      setLoading(false)
    }
  }

  const createSupabaseClient = (company: Company) => {
    try {
      const config = COMPANY_CONFIGS[company.id]
      
      if (!config || !config.supabase_url || !config.supabase_anon_key) {
        console.warn(`No Supabase configuration found for company ${company.name}. Using default configuration.`)
        // Fallback to default configuration
        const client = createClient<Database>(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true
            }
          }
        )
        setSupabaseClient(client)
        setConnectionStatus('unknown')
        return
      }

      console.log(`🔄 Switching to database for company: ${company.name}`)
      console.log(`📊 Database URL: ${config.supabase_url}`)
      
      const client = createClient<Database>(
        config.supabase_url,
        config.supabase_anon_key,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      )
      
      setSupabaseClient(client)
      setConnectionStatus('unknown')
      
      // Test the connection with a delay to ensure client is ready
      setTimeout(() => {
        testConnectionSafely(client, company.name)
      }, 1000)
      
    } catch (error) {
      console.error('Error creating Supabase client:', error)
      setConnectionStatus('disconnected')
      // Fallback to default client
      const client = createClient<Database>(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      setSupabaseClient(client)
    }
  }

  const testConnection = async (client: SupabaseClient, companyName: string) => {
    setConnectionStatus('testing')
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      })

      const connectionPromise = client
        .from('clients')
        .select('count')
        .limit(1)

      const result = await Promise.race([connectionPromise, timeoutPromise]) as any
      const { data, error } = result || { data: null, error: null }
      
      if (error) {
        setConnectionStatus('disconnected')
        
        if (error.message.includes('Failed to fetch')) {
          console.warn(`⚠️ Network connectivity issue for ${companyName}. This might be due to:`)
          console.warn('   • Firewall or proxy blocking the connection')
          console.warn('   • Supabase project is paused or unavailable')
          console.warn('   • Network connectivity issues')
          console.warn('   • Invalid Supabase URL or credentials')
          console.warn('💡 Try using the connection test button on the login page for detailed diagnostics')
        } else {
          console.warn(`⚠️ Database connection test failed for ${companyName}:`, error.message)
        }
      } else {
        setConnectionStatus('connected')
        console.log(`✅ Successfully connected to ${companyName} database`)
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      
      if (error instanceof Error) {
        if (error.message === 'Connection timeout') {
          console.warn(`⚠️ Connection timeout for ${companyName}. The database might be slow to respond.`)
        } else if (error.message.includes('Failed to fetch')) {
          console.warn(`⚠️ Network error for ${companyName}:`, error.message)
          console.warn('💡 Possible solutions:')
          console.warn('   1. Check your internet connection')
          console.warn('   2. Verify Supabase project is not paused')
          console.warn('   3. Check firewall/proxy settings')
          console.warn('   4. Try the connection test on the login page')
        } else {
          console.warn(`⚠️ Unexpected error testing connection for ${companyName}:`, error.message)
        }
      }
      
      // Don't throw the error - let the app continue to work in offline mode
      throw error
    }
  }

  const testConnectionSafely = async (client: SupabaseClient, companyName: string) => {
    try {
      await testConnection(client, companyName)
    } catch (error) {
      // Connection failed, but don't block the app
      console.warn(`⚠️ Connection test failed for ${companyName}, continuing in offline mode...`)
      
      // Show user-friendly notification about connection issues
      if (typeof window !== 'undefined' && window.localStorage) {
        const lastNotification = localStorage.getItem('lastConnectionWarning')
        const now = Date.now()
        
        // Only show notification once every 5 minutes to avoid spam
        if (!lastNotification || (now - parseInt(lastNotification)) > 300000) {
          localStorage.setItem('lastConnectionWarning', now.toString())
          
          // You could show a toast notification here instead of console.warn
          console.warn('🔌 Aviso: Problemas de conectividade detectados. Algumas funcionalidades podem estar limitadas.')
          console.warn('💡 Verifique sua conexão ou use o teste de conectividade na página de login.')
        }
      }
    }
  }

  const switchCompany = (company: Company) => {
    console.log(`🏢 Switching to company: ${company.name}`)
    setCurrentCompany(company)
    setConnectionStatus('unknown')
    
    // Store in localStorage for persistence
    localStorage.setItem('currentCompanyId', company.id)
    localStorage.setItem('currentCompany', JSON.stringify(company))
    
    // Show notification to user
    if (window.confirm(`Trocar para a empresa "${company.name}"? Isso irá recarregar os dados.`)) {
      // Optionally reload the page to ensure clean state
      // window.location.reload()
    }
  }

  const value = {
    currentCompany,
    companies,
    switchCompany,
    loading,
    supabaseClient,
    connectionStatus,
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}