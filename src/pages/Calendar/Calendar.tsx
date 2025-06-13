import { useState, useEffect } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Mail,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
  Download,
  Settings,
  Grid3X3,
  List
} from 'lucide-react'
import EventModal from './EventModal'
import EventDetailsModal from './EventDetailsModal'
import CalendarFilters from './CalendarFilters'
import CalendarCards from './CalendarCards'
import { useSupabase } from '../../hooks/useSupabase'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'

// Configure moment for Portuguese
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

// Event types with colors
const eventTypes = {
  meeting: { label: 'Reunião', color: '#3b82f6', icon: Users },
  call: { label: 'Ligação', color: '#10b981', icon: Phone },
  video: { label: 'Videoconferência', color: '#8b5cf6', icon: Video },
  email: { label: 'Email', color: '#f59e0b', icon: Mail },
  task: { label: 'Tarefa', color: '#ef4444', icon: Clock },
  visit: { label: 'Visita', color: '#06b6d4', icon: MapPin },
  other: { label: 'Outro', color: '#6b7280', icon: CalendarIcon }
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  type: keyof typeof eventTypes
  client_id?: string
  company_id?: string
  deal_id?: string
  responsible_id: string
  location?: string
  attendees?: string[]
  google_event_id?: string
  outlook_event_id?: string
  created_at: string
  updated_at: string
}

export default function Calendar() {
  const supabase = useSupabase()
  const { user } = useAuth()
  const { currentCompany } = useCompany()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<'calendar' | 'cards'>('calendar')
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    types: Object.keys(eventTypes),
    responsible: 'all',
    client: 'all'
  })

  // Load events from database
  useEffect(() => {
    loadEvents()
  }, [user])

  const loadEvents = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clients(id, name, email, phone),
          companies(id, name, email, phone),
          deals(id, title, value, stage)
        `)
        .order('start_date', { ascending: true })

      if (error) {
        if (error.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Network error loading events. Using empty event list.')
          setEvents([])
          return
        }
        throw error
      }

      const formattedEvents = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        allDay: event.all_day,
        type: event.type,
        client_id: event.client_id,
        company_id: event.company_id,
        deal_id: event.deal_id,
        responsible_id: event.responsible_id,
        google_event_id: event.google_event_id,
        outlook_event_id: event.outlook_event_id,
        created_at: event.created_at,
        updated_at: event.updated_at,
        // Include related data for display
        client: event.clients,
        company: event.companies,
        deal: event.deals
      })) || []

      setEvents(formattedEvents)
    } catch (error) {
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        console.warn('⚠️ Cannot connect to database. Events will not be loaded.')
      } else {
        console.error('Error loading events:', error)
      }
      setEvents([]) // Set empty events array as fallback
    } finally {
      setLoading(false)
    }
  }

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    if (!filters.types.includes(event.type)) return false
    if (filters.responsible !== 'all' && event.responsible_id !== filters.responsible) return false
    if (filters.client !== 'all' && event.client_id !== filters.client && event.company_id !== filters.client) return false
    return true
  })

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = eventTypes[event.type]
    return {
      style: {
        backgroundColor: eventType.color,
        borderColor: eventType.color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 6px'
      }
    }
  }

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  // Handle slot selection (create new event)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setEditingEvent({
      id: '',
      title: '',
      description: '',
      start,
      end,
      allDay: false,
      type: 'meeting',
      responsible_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setShowEventModal(true)
  }

  // Handle event creation/update
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        alert('Sem conexão com a internet. Verifique sua conectividade.')
        return
      }

      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      
      // Get user's tenant_id from the users table, create user record if it doesn't exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle()

      let tenantId = userData?.tenant_id

      // If user record doesn't exist in public.users table, create it
      if (!userData) {
        // Create user record with demo tenant ID (you may want to adjust this logic)
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            role: 'user',
            tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Demo tenant ID
          })

        if (insertError) {
          throw new Error('Erro ao criar registro do usuário: ' + insertError.message)
        }
        
        tenantId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      } else if (userError) {
        throw new Error('Não foi possível obter informações do usuário: ' + userError.message)
      } else if (!tenantId) {
        throw new Error('Tenant ID não encontrado para o usuário')
      }

      if (editingEvent?.id) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: eventData.title,
            description: eventData.description,
            start_date: eventData.start?.toISOString(),
            end_date: eventData.end?.toISOString(),
            all_day: eventData.allDay,
            type: eventData.type,
            client_id: eventData.client_id,
            company_id: eventData.company_id,
            deal_id: eventData.deal_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: eventData.title,
            description: eventData.description,
            start_date: eventData.start?.toISOString(),
            end_date: eventData.end?.toISOString(),
            all_day: eventData.allDay,
            type: eventData.type,
            client_id: eventData.client_id,
            company_id: eventData.company_id,
            deal_id: eventData.deal_id,
            responsible_id: user?.id,
            tenant_id: tenantId
          })

        if (error) throw error
      }

      await loadEvents()
      setShowEventModal(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        alert('Erro de conectividade. Verifique sua conexão com a internet e tente novamente.')
      } else {
        alert('Erro ao salvar evento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
      }
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        alert('Sem conexão com a internet. Verifique sua conectividade.')
        return
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      await loadEvents()
      setShowDetailsModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      
      if (error instanceof Error && error.message?.includes('Failed to fetch')) {
        alert('Erro de conectividade. Verifique sua conexão com a internet e tente novamente.')
      }
    }
  }

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {label}
          </h2>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
        >
          Hoje
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: Views.MONTH, label: 'Mês' },
            { key: Views.WEEK, label: 'Semana' },
            { key: Views.DAY, label: 'Dia' },
            { key: Views.AGENDA, label: 'Agenda' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onView(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const eventType = eventTypes[event.type]
    const Icon = eventType.icon

    return (
      <div className="flex items-center space-x-1 text-xs">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{event.title}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If cards view is selected, render the cards component
  if (calendarView === 'cards') {
    return <CalendarCards />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie seus compromissos e eventos</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarView('calendar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                calendarView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-1 inline" />
              Calendário
            </button>
            <button
              onClick={() => setCalendarView('cards')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                calendarView === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1 inline" />
              Cards
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={() => {
              setEditingEvent({
                id: '',
                title: '',
                description: '',
                start: new Date(),
                end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
                allDay: false,
                type: 'meeting',
                responsible_id: user?.id || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              setShowEventModal(true)
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <CalendarFilters
          filters={filters}
          onFiltersChange={setFilters}
          eventTypes={eventTypes}
        />
      )}

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(eventTypes).map(([type, config]) => {
          const count = filteredEvents.filter(e => e.type === type).length
          const Icon = config.icon
          
          return (
            <div key={type} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div 
                  className="p-2 rounded-lg mr-3"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon 
                    className="h-5 w-5"
                    style={{ color: config.color }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <BigCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
            event: EventComponent
          }}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'Não há eventos neste período',
            showMore: (total) => `+ ${total} mais`
          }}
          formats={{
            monthHeaderFormat: 'MMMM YYYY',
            dayHeaderFormat: 'dddd, DD [de] MMMM',
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
            agendaDateFormat: 'DD/MM/YYYY',
            agendaTimeFormat: 'HH:mm',
            agendaTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
          }}
        />
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventModal(false)
            setEditingEvent(null)
          }}
          eventTypes={eventTypes}
        />
      )}

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onEdit={(event) => {
            setEditingEvent(event)
            setShowDetailsModal(false)
            setShowEventModal(true)
          }}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEvent(null)
          }}
          eventTypes={eventTypes}
        />
      )}
    </div>
  )
}