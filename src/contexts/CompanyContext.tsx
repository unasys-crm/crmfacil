import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Company {
  id: string
  name: string
  domain: string
}

interface CompanyContextType {
  currentCompany: Company | null
  companies: Company[]
  switchCompany: (company: Company) => void
  loading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Simulate loading companies for the user
      // In a real app, this would fetch from the database
      const mockCompanies = [
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Empresa Demo', domain: 'demo.crmfacil.com' },
        { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Minha Empresa', domain: 'minhaempresa.crmfacil.com' },
      ]
      
      setCompanies(mockCompanies)
      setCurrentCompany(mockCompanies[0])
      setLoading(false)
    }
  }, [user])

  const switchCompany = (company: Company) => {
    setCurrentCompany(company)
    // Store in localStorage for persistence
    localStorage.setItem('currentCompany', JSON.stringify(company))
  }

  const value = {
    currentCompany,
    companies,
    switchCompany,
    loading,
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}