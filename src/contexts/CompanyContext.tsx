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
      
      // Test the connection
      testConnection(client, company.name)
      
    } catch (error) {
      console.error('Error creating Supabase client:', error)
      // Fallback to default client
      const client = createClient<Database>(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      setSupabaseClient(client)
    }
  }

  const testConnection = async (client: SupabaseClient, companyName: string) => {
    try {
      const { data, error } = await client
        .from('clients')
        .select('count')
        .limit(1)
      
      if (error) {
        console.warn(`⚠️ Database connection test failed for ${companyName}:`, error.message)
      } else {
        console.log(`✅ Successfully connected to ${companyName} database`)
      }
    } catch (error) {
      console.warn(`⚠️ Database connection test failed for ${companyName}:`, error)
    }
  }

  const switchCompany = (company: Company) => {
    console.log(`🏢 Switching to company: ${company.name}`)
    setCurrentCompany(company)
    
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
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}