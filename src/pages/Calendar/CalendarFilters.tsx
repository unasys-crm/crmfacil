import { useState } from 'react'
import { Filter, X, Users, Calendar } from 'lucide-react'

interface CalendarFiltersProps {
  filters: {
    types: string[]
    responsible: string
    client: string
  }
  onFiltersChange: (filters: any) => void
  eventTypes: any
}

export default function CalendarFilters({ filters, onFiltersChange, eventTypes }: CalendarFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleTypeToggle = (type: string) => {
    const newTypes = localFilters.types.includes(type)
      ? localFilters.types.filter(t => t !== type)
      : [...localFilters.types, type]
    
    const newFilters = { ...localFilters, types: newTypes }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters = {
      types: Object.keys(eventTypes),
      responsible: 'all',
      client: 'all'
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Limpar filtros
        </button>
      </div>

      <div className="space-y-6">
        {/* Event Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipos de Evento
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventTypes).map(([type, config]: [string, any]) => {
              const isSelected = localFilters.types.includes(type)
              const Icon = config.icon
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`
                    inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? config.color : undefined
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {config.label}
                  {isSelected && <X className="h-3 w-3 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Responsible Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Responsável
          </label>
          <select
            value={localFilters.responsible}
            onChange={(e) => {
              const newFilters = { ...localFilters, responsible: e.target.value }
              setLocalFilters(newFilters)
              onFiltersChange(newFilters)
            }}
            className="form-input w-full max-w-xs"
          >
            <option value="all">Todos os responsáveis</option>
            <option value="me">Meus eventos</option>
            {/* Add more options based on team members */}
          </select>
        </div>

        {/* Client Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Cliente
          </label>
          <select
            value={localFilters.client}
            onChange={(e) => {
              const newFilters = { ...localFilters, client: e.target.value }
              setLocalFilters(newFilters)
              onFiltersChange(newFilters)
            }}
            className="form-input w-full max-w-xs"
          >
            <option value="all">Todos os clientes</option>
            {/* Add client options dynamically */}
          </select>
        </div>

        {/* Active Filters Summary */}
        {(localFilters.types.length < Object.keys(eventTypes).length || 
          localFilters.responsible !== 'all' || 
          localFilters.client !== 'all') && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Filtros ativos:</p>
            <div className="flex flex-wrap gap-2">
              {localFilters.types.length < Object.keys(eventTypes).length && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {localFilters.types.length} de {Object.keys(eventTypes).length} tipos
                </span>
              )}
              {localFilters.responsible !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Responsável: {localFilters.responsible === 'me' ? 'Eu' : localFilters.responsible}
                </span>
              )}
              {localFilters.client !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Cliente específico
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}