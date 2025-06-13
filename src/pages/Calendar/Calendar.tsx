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
import { showErrorNotification } from '../../utils/errorHandler'

interface Event {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  type: string
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

interface CalendarFilters {
  types: string[]
  responsible: string
  client: string
}

export default function Calendar() {
  const { supabase: supabaseClient, isConnected } = useSupabase()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({
    types: [],
    responsible: 'all',
    client: 'all'
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    if (!supabaseClient) return
    
    // Check connection status
    if (!isConnected) {
      console.warn('⚠️ Tentando carregar eventos sem conexão com o banco de dados')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      
      const { data: eventsData, error } = await supabaseClient
        .from('events')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          companies (
            id,
            name,
            email,
            phone
          ),
          deals (
            id,
            title,
            value,
            stage
          )
        `)
        .order('start_date', { ascending: true })

      if (error) throw error
      
      setEvents(eventsData || [])
    } catch (error) {
      const errorInfo = showErrorNotification(error)
      console.error('Error loading events:', errorInfo)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvent = async (eventData: any) => {
    if (!supabaseClient) return
    
    // Check connection status
    if (!isConnected) {
      alert('Não é possível salvar eventos sem conexão com o banco de dados. Verifique sua conectividade.')
      return
    }
    
    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabaseClient
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabaseClient
          .from('events')
          .insert(eventData)

        if (error) throw error
      }

      setShowEventModal(false)
      setEditingEvent(null)
      loadEvents()
    } catch (error) {
      const errorInfo = showErrorNotification(error)
      alert(`Erro ao salvar evento: ${errorInfo.userMessage}`)
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!supabaseClient) return
    
    // Check connection status
    if (!isConnected) {
      alert('Não é possível excluir eventos sem conexão com o banco de dados. Verifique sua conectividade.')
      return
    }
    
    if (!confirm('Tem certeza que deseja excluir este evento?')) return
    
    try {
      const { error } = await supabaseClient
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      setShowDetailsModal(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      const errorInfo = showErrorNotification(error)
      alert(`Erro ao excluir evento: ${errorInfo.userMessage}`)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendário</h1>
        <button
          onClick={() => setShowEventModal(true)}
          className="btn-primary"
        >
          Novo Evento
        </button>
      </div>

      <div className="mb-6">
        <CalendarFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Sem conexão com o banco de dados. Os eventos podem não estar atualizados. 
            <a href="/login" className="underline ml-1">Teste a conexão aqui</a>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <BigCalendar
            events={events}
            localizer={momentLocalizer(moment)}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={event => {
              setSelectedEvent(event)
              setShowDetailsModal(true)
            }}
          />
        </div>
      </div>

      {showEventModal && (
        <EventModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventModal(false)
            setEditingEvent(null)
          }}
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEvent(null)
          }}
          onEdit={event => {
            setEditingEvent(event)
            setShowDetailsModal(false)
            setShowEventModal(true)
          }}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}