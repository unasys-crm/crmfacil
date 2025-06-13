import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { X, Calendar, Clock, Users, MapPin, FileText, Building2, User, Phone, Mail, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import 'react-datepicker/dist/react-datepicker.css'

const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  allDay: z.boolean(),
  client_id: z.string().optional(),
  company_id: z.string().optional(),
  deal_id: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional()
})

type EventFormData = z.infer<typeof eventSchema>

interface EventModalProps {
  event: any
  onSave: (eventData: any) => void
  onClose: () => void
  eventTypes: any
}

export default function EventModal({ event, onSave, onClose, eventTypes }: EventModalProps) {
  const [startDate, setStartDate] = useState(event?.start || new Date())
  const [endDate, setEndDate] = useState(event?.end || new Date(Date.now() + 60 * 60 * 1000))
  const [clients, setClients] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      type: event?.type || 'meeting',
      allDay: event?.allDay || false,
      client_id: event?.client_id || undefined,
      company_id: event?.company_id || undefined,
      deal_id: event?.deal_id || undefined,
      location: event?.location || '',
      attendees: event?.attendees || []
    }
  })

  const watchAllDay = watch('allDay')
  const watchClientId = watch('client_id')
  const watchCompanyId = watch('company_id')

  // Load clients and companies
  useEffect(() => {
    loadClientsAndCompanies()
    loadDeals()
  }, [])

  // Load deals when client/company changes
  useEffect(() => {
    if (watchClientId || watchCompanyId) {
      loadDeals(watchClientId, watchCompanyId)
    }
  }, [watchClientId, watchCompanyId])

  // Set initial selected contact based on existing event
  useEffect(() => {
    if (event?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === event.client_id)
      if (client) {
        setSelectedContact({
          ...client,
          type: 'client',
          display_name: client.name,
          display_info: client.email || client.phone || client.cpf
        })
      }
    } else if (event?.company_id && companies.length > 0) {
      const company = companies.find(c => c.id === event.company_id)
      if (company) {
        setSelectedContact({
          ...company,
          type: 'company',
          display_name: company.name,
          display_info: company.email || company.phone || company.cnpj
        })
      }
    }
  }, [event, clients, companies])

  const loadClientsAndCompanies = async () => {
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id, 
          name, 
          email, 
          phone, 
          cpf,
          city,
          state,
          companies(id, name)
        `)
        .order('name')

      if (clientsError) throw clientsError

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          email, 
          phone, 
          cnpj,
          segment,
          city,
          state
        `)
        .order('name')

      if (companiesError) throw companiesError

      setClients(clientsData || [])
      setCompanies(companiesData || [])
    } catch (error) {
      console.error('Error loading clients and companies:', error)
    }
  }

  const loadDeals = async (clientId?: string, companyId?: string) => {
    try {
      let query = supabase
        .from('deals')
        .select(`
          id, 
          title, 
          value, 
          stage,
          clients(name),
          companies(name)
        `)
        .order('title')

      if (clientId) {
        query = query.eq('client_id', clientId)
      } else if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  // Combine and filter clients and companies for search
  const getFilteredContacts = () => {
    if (!searchTerm.trim()) return []

    const searchLower = searchTerm.toLowerCase()
    const filteredContacts: any[] = []

    // Add matching clients
    clients.forEach(client => {
      if (
        client.name.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchTerm) ||
        client.cpf?.includes(searchTerm)
      ) {
        filteredContacts.push({
          ...client,
          type: 'client',
          display_name: client.name,
          display_info: client.email || client.phone || client.cpf,
          location: client.city && client.state ? `${client.city}, ${client.state}` : ''
        })
      }
    })

    // Add matching companies
    companies.forEach(company => {
      if (
        company.name.toLowerCase().includes(searchLower) ||
        company.email?.toLowerCase().includes(searchLower) ||
        company.phone?.includes(searchTerm) ||
        company.cnpj?.includes(searchTerm) ||
        company.segment?.toLowerCase().includes(searchLower)
      ) {
        filteredContacts.push({
          ...company,
          type: 'company',
          display_name: company.name,
          display_info: company.email || company.phone || company.cnpj,
          location: company.city && company.state ? `${company.city}, ${company.state}` : ''
        })
      }
    })

    return filteredContacts.slice(0, 10) // Limit to 10 results
  }

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact)
    setSearchTerm('')

    if (contact.type === 'client') {
      setValue('client_id', contact.id)
      setValue('company_id', undefined)
      // Auto-select company if client has one
      if (contact.companies?.id) {
        setValue('company_id', contact.companies.id)
      }
    } else {
      setValue('company_id', contact.id)
      setValue('client_id', undefined)
    }

    setValue('deal_id', undefined) // Clear deals when changing contact
  }

  const clearSelectedContact = () => {
    setSelectedContact(null)
    setValue('client_id', undefined)
    setValue('company_id', undefined)
    setValue('deal_id', undefined)
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true)

      const eventData = {
        ...data,
        start: startDate,
        end: endDate,
        id: event?.id
      }

      await onSave(eventData)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  const dealOptions = deals.map(deal => ({
    value: deal.id,
    label: `${deal.title} - ${deal.stage}`,
    value_formatted: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(deal.value || 0),
    client: deal.clients?.name,
    company: deal.companies?.name
  }))

  // Custom option component for deals
  const DealOption = ({ data, ...props }: any) => (
    <div {...props} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">Valor: {data.value_formatted}</span>
          {(data.client || data.company) && (
            <span className="text-xs text-gray-500">
              • {data.client || data.company}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const filteredContacts = getFilteredContacts()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {event?.id ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="form-label">
              <Calendar className="h-4 w-4 inline mr-2" />
              Título *
            </label>
            <input
              {...register('title')}
              className="form-input"
              placeholder="Digite o título do evento"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="form-label">Tipo de Evento *</label>
            <select {...register('type')} className="form-input">
              {Object.entries(eventTypes).map(([key, config]: [string, any]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              {...register('allDay')}
              type="checkbox"
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm text-gray-700">Evento de dia inteiro</label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Clock className="h-4 w-4 inline mr-2" />
                Data/Hora de Início *
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date || new Date())}
                showTimeSelect={!watchAllDay}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={watchAllDay ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm"}
                className="form-input w-full"
                locale="pt-BR"
              />
            </div>

            <div>
              <label className="form-label">
                <Clock className="h-4 w-4 inline mr-2" />
                Data/Hora de Término *
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date || new Date())}
                showTimeSelect={!watchAllDay}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={watchAllDay ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm"}
                className="form-input w-full"
                locale="pt-BR"
                minDate={startDate}
              />
            </div>
          </div>

          {/* Contact Search */}
          <div>
            <label className="form-label">
              <Users className="h-4 w-4 inline mr-2" />
              Cliente/Empresa
            </label>
            
            {/* Selected Contact Display */}
            {selectedContact ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {selectedContact.type === 'client' ? (
                        <User className="h-8 w-8 text-blue-600 bg-blue-100 rounded-full p-1" />
                      ) : (
                        <Building2 className="h-8 w-8 text-green-600 bg-green-100 rounded-full p-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedContact.display_name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedContact.type === 'client' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedContact.type === 'client' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                      </div>
                      {selectedContact.display_info && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedContact.display_info}
                        </p>
                      )}
                      {selectedContact.location && (
                        <p className="text-xs text-gray-500">
                          {selectedContact.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedContact}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Search Input */
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Pesquisar cliente ou empresa por nome, email, telefone..."
                />

                {/* Search Results */}
                {searchTerm.trim() && filteredContacts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <div
                        key={`${contact.type}-${contact.id}`}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {contact.type === 'client' ? (
                              <User className="h-8 w-8 text-blue-600 bg-blue-100 rounded-full p-1" />
                            ) : (
                              <Building2 className="h-8 w-8 text-green-600 bg-green-100 rounded-full p-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.display_name}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                contact.type === 'client' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {contact.type === 'client' ? 'PF' : 'PJ'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              {contact.email && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                            {contact.location && (
                              <p className="text-xs text-gray-500 mt-1">
                                {contact.location}
                              </p>
                            )}
                            {contact.segment && (
                              <p className="text-xs text-gray-500 mt-1">
                                Segmento: {contact.segment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {searchTerm.trim() && filteredContacts.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4 text-center text-gray-500">
                    <p className="text-sm">Nenhum cliente ou empresa encontrado</p>
                    <p className="text-xs mt-1">Tente pesquisar por nome, email ou telefone</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deal */}
          {(watchClientId || watchCompanyId) && deals.length > 0 && (
            <div>
              <label className="form-label">Negócio</label>
              <Select
                options={dealOptions}
                value={dealOptions.find(option => option.value === watch('deal_id')) || null}
                onChange={(option) => setValue('deal_id', option?.value || undefined)}
                placeholder="Selecione um negócio"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                components={{
                  Option: DealOption
                }}
                isSearchable
                noOptionsMessage={() => "Nenhum negócio encontrado"}
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className="form-label">
              <MapPin className="h-4 w-4 inline mr-2" />
              Local
            </label>
            <input
              {...register('location')}
              className="form-input"
              placeholder="Local do evento"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              <FileText className="h-4 w-4 inline mr-2" />
              Descrição
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="form-input"
              placeholder="Descrição do evento"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn-primary"
            >
              {isSubmitting || loading ? 'Salvando...' : 'Salvar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}