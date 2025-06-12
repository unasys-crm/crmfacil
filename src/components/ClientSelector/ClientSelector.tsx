import React, { useState } from 'react'
import { Search, Plus, X, User, Building2, Phone, Mail } from 'lucide-react'
import Select from 'react-select'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  cnpj?: string
  client_type: 'person' | 'company'
  city?: string
  state?: string
}

interface SelectedClient extends Client {
  role?: string
  is_primary?: boolean
}

interface ClientSelectorProps {
  selectedClients: SelectedClient[]
  onClientsChange: (clients: SelectedClient[]) => void
}

// Mock data - in real app would come from database
const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-01',
    client_type: 'person',
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 87654-3210',
    cpf: '987.654.321-09',
    client_type: 'person',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  {
    id: '3',
    name: 'Cliente Empresa Ltda',
    email: 'contato@clienteempresa.com',
    phone: '(11) 1234-5678',
    cnpj: '12.345.678/0001-90',
    client_type: 'company',
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '(11) 76543-2109',
    cpf: '456.789.123-45',
    client_type: 'person',
    city: 'Belo Horizonte',
    state: 'MG'
  }
]

const clientRoles = [
  { value: 'decision_maker', label: 'Tomador de Decisão' },
  { value: 'influencer', label: 'Influenciador' },
  { value: 'technical_contact', label: 'Contato Técnico' },
  { value: 'financial_contact', label: 'Contato Financeiro' },
  { value: 'commercial_contact', label: 'Contato Comercial' },
  { value: 'other', label: 'Outro' }
]

export default function ClientSelector({ selectedClients, onClientsChange }: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showClientList, setShowClientList] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    client_type: 'person'
  })

  const filteredClients = mockClients.filter(client => {
    const isAlreadySelected = selectedClients.some(sc => sc.id === client.id)
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone?.includes(searchTerm)
    
    return !isAlreadySelected && matchesSearch
  })

  const addClient = (client: Client, role: string = 'other') => {
    const newSelectedClient: SelectedClient = {
      ...client,
      role,
      is_primary: selectedClients.length === 0 // First client is primary by default
    }
    
    onClientsChange([...selectedClients, newSelectedClient])
    setSearchTerm('')
    setShowClientList(false)
  }

  const removeClient = (clientId: string) => {
    const updatedClients = selectedClients.filter(c => c.id !== clientId)
    
    // If we removed the primary client, make the first remaining client primary
    if (updatedClients.length > 0 && !updatedClients.some(c => c.is_primary)) {
      updatedClients[0].is_primary = true
    }
    
    onClientsChange(updatedClients)
  }

  const updateClientRole = (clientId: string, role: string) => {
    const updatedClients = selectedClients.map(client =>
      client.id === clientId ? { ...client, role } : client
    )
    onClientsChange(updatedClients)
  }

  const setPrimaryClient = (clientId: string) => {
    const updatedClients = selectedClients.map(client => ({
      ...client,
      is_primary: client.id === clientId
    }))
    onClientsChange(updatedClients)
  }

  const createNewClient = () => {
    if (!newClient.name?.trim()) return

    const client: Client = {
      id: `new_${Date.now()}`,
      name: newClient.name.trim(),
      email: newClient.email || '',
      phone: newClient.phone || '',
      client_type: newClient.client_type || 'person',
      cpf: newClient.client_type === 'person' ? newClient.cpf : undefined,
      cnpj: newClient.client_type === 'company' ? newClient.cnpj : undefined
    }

    addClient(client)
    setNewClient({
      name: '',
      email: '',
      phone: '',
      client_type: 'person'
    })
    setShowNewClientForm(false)
  }

  return (
    <div className="space-y-4">
      {/* Search and Add Client */}
      <div>
        <label className="form-label">Contatos da Empresa</label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowClientList(e.target.value.length > 0)
                }}
                onFocus={() => setShowClientList(searchTerm.length > 0)}
                className="form-input pl-10 rounded-r-none"
                placeholder="Buscar cliente por nome, email ou telefone..."
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-primary-50 hover:bg-primary-100 text-primary-600"
              title="Cadastrar novo cliente"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Client Search Results */}
          {showClientList && filteredClients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => addClient(client)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {client.client_type === 'person' ? (
                        <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          client.client_type === 'person' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {client.client_type === 'person' ? 'PF' : 'PJ'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        {client.email && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                      {client.city && client.state && (
                        <p className="text-xs text-gray-500 mt-1">
                          {client.city}, {client.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showClientList && searchTerm && filteredClients.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4 text-center text-gray-500">
              <p className="text-sm">Nenhum cliente encontrado</p>
              <p className="text-xs mt-1">Use o botão + para cadastrar um novo cliente</p>
            </div>
          )}
        </div>
      </div>

      {/* New Client Form */}
      {showNewClientForm && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Cadastro Rápido de Cliente
          </h4>
          
          <div className="space-y-3">
            {/* Client Type */}
            <div>
              <label className="form-label text-sm">Tipo de Cliente</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newClient.client_type === 'person'}
                    onChange={() => setNewClient({ ...newClient, client_type: 'person' })}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Pessoa Física</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newClient.client_type === 'company'}
                    onChange={() => setNewClient({ ...newClient, client_type: 'company' })}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Pessoa Jurídica</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-sm">
                  {newClient.client_type === 'company' ? 'Nome da Empresa' : 'Nome Completo'} *
                </label>
                <input
                  type="text"
                  value={newClient.name || ''}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="form-input text-sm"
                  placeholder={newClient.client_type === 'company' ? 'Nome da empresa' : 'Nome completo'}
                />
              </div>

              <div>
                <label className="form-label text-sm">
                  {newClient.client_type === 'company' ? 'CNPJ' : 'CPF'}
                </label>
                <input
                  type="text"
                  value={newClient.client_type === 'company' ? (newClient.cnpj || '') : (newClient.cpf || '')}
                  onChange={(e) => {
                    if (newClient.client_type === 'company') {
                      setNewClient({ ...newClient, cnpj: e.target.value })
                    } else {
                      setNewClient({ ...newClient, cpf: e.target.value })
                    }
                  }}
                  className="form-input text-sm"
                  placeholder={newClient.client_type === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
              </div>

              <div>
                <label className="form-label text-sm">Email</label>
                <input
                  type="email"
                  value={newClient.email || ''}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="form-input text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="form-label text-sm">Telefone</label>
                <input
                  type="text"
                  value={newClient.phone || ''}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="form-input text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewClientForm(false)
                  setNewClient({
                    name: '',
                    email: '',
                    phone: '',
                    client_type: 'person'
                  })
                }}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createNewClient}
                disabled={!newClient.name?.trim()}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Clients */}
      {selectedClients.length > 0 && (
        <div>
          <label className="form-label">Clientes Associados ({selectedClients.length})</label>
          <div className="space-y-3">
            {selectedClients.map((client) => (
              <div key={client.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {client.client_type === 'person' ? (
                        <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      ) : (
                        <Building2 className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {client.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          client.client_type === 'person' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {client.client_type === 'person' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                        {client.is_primary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Contato Principal
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Contact Info */}
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="h-3 w-3 mr-2" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="h-3 w-3 mr-2" />
                              {client.phone}
                            </div>
                          )}
                          {client.cpf && (
                            <div className="text-xs text-gray-600">
                              CPF: {client.cpf}
                            </div>
                          )}
                          {client.cnpj && (
                            <div className="text-xs text-gray-600">
                              CNPJ: {client.cnpj}
                            </div>
                          )}
                        </div>

                        {/* Role Selection */}
                        <div>
                          <label className="form-label text-xs">Função na Empresa</label>
                          <Select
                            options={clientRoles}
                            value={clientRoles.find(role => role.value === client.role) || null}
                            onChange={(option) => updateClientRole(client.id, option?.value || 'other')}
                            placeholder="Selecione a função"
                            className="react-select-container text-xs"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '32px',
                                fontSize: '12px'
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3 mt-3">
                        {!client.is_primary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryClient(client.id)}
                            className="text-xs text-yellow-600 hover:text-yellow-800"
                          >
                            Definir como Principal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeClient(client.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Associe clientes (pessoas físicas ou jurídicas) a esta empresa</p>
        <p>• Um cliente pode estar associado a várias empresas</p>
        <p>• Defina funções específicas para cada contato na empresa</p>
        <p>• O contato principal será usado como referência principal da empresa</p>
      </div>
    </div>
  )
}