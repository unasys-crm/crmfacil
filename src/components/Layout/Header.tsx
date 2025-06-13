import { Bell, Search, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'
import { useState } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const { currentCompany, companies, switchCompany } = useCompany()
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="max-w-lg w-full lg:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Buscar..."
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Company Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">
                  {currentCompany?.name || 'Selecione uma empresa'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Company Dropdown */}
            {showCompanyDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">
                    Empresas Disponíveis
                  </div>
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        switchCompany(company)
                        setShowCompanyDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                        currentCompany?.id === company.id 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            currentCompany?.id === company.id ? 'bg-primary-500' : 'bg-gray-300'
                          }`}></div>
                          <span>{company.name}</span>
                        </div>
                        {currentCompany?.id === company.id && (
                          <div className="text-xs text-primary-600">Ativo</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-4 mt-1">
                        {company.domain}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 p-2">
                  <div className="text-xs text-gray-500 px-2 py-1">
                    💡 Cada empresa possui seu próprio banco de dados
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* User Menu */}
          <div className="relative flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email}
              </span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}