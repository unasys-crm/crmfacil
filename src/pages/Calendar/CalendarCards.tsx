import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable, useDroppable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  Video, 
  MapPin, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import EventModal from './EventModal'
import EventDetailsModal from './EventDetailsModal'

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
  created_at: string
  updated_at: string
  // Related data
  client?: { id: string; name: string; email?: string; phone?: string }
  company?: { id: string; name: string; email?: string; phone?: string }
  deal?: { id: string; title: string; value?: number; stage: string }
  responsible?: { id: string; name: string; email?: string }
}

interface EventCardProps {
  event: CalendarEvent
  onClick: () => void
  isDragging?: boolean
}

function EventCard({ event, onClick, isDragging }: EventCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: event.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const eventType = eventTypes[event.type]
  const Icon = eventType.icon

  // Get responsible person's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', 
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ]
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const responsibleName = event.responsible?.name || 'Usuário'
  const avatarColor = getAvatarColor(responsibleName)

  // Handle click to edit (prevent when dragging)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDragging && !isSortableDragging) {
      onClick()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3 cursor-pointer
        hover:shadow-md transition-all duration-200 group
        ${isDragging || isSortableDragging ? 'rotate-3 scale-105' : ''}
      `}
      onClick={handleClick}
    >
      {/* Header with type and time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-1 rounded"
            style={{ backgroundColor: `${eventType.color}20` }}
          >
            <Icon 
              className="h-3 w-3"
              style={{ color: eventType.color }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {event.allDay ? 'Dia inteiro' : format(event.start, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
        
        {/* Responsible avatar */}
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: avatarColor }}
          title={responsibleName}
        >
          {getInitials(responsibleName)}
        </div>
      </div>

      {/* Event title */}
      <h4 
        className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors"
        {...listeners}
      >
        {event.title}
      </h4>

      {/* Client/Company info */}
      {(event.client || event.company) && (
        <div className="flex items-center space-x-1 mb-2">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600 truncate">
            {event.client?.name || event.company?.name}
          </span>
        </div>
      )}

      {/* Deal info */}
      {event.deal && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 truncate flex-1 mr-2">
            {event.deal.title}
          </span>
          {event.deal.value && (
            <span className="text-green-600 font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(event.deal.value)}
            </span>
          )}
        </div>
      )}

      {/* Location */}
      {event.location && (
        <div className="flex items-center space-x-1 mt-2">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">
            {event.location}
          </span>
        </div>
      )}

      {/* Type indicator bar */}
      <div 
        className="h-1 rounded-full mt-3"
        style={{ backgroundColor: eventType.color }}
      />
    </div>
  )
}

interface DayColumnProps {
  date: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onAddEvent: (date: Date) => void
}

function DayColumn({ date, events, onEventClick, onAddEvent }: DayColumnProps) {
  const { setNodeRef } = useDroppable({
    id: date.toISOString(),
  })

  const isToday = isSameDay(date, new Date())
  const dayEvents = events.filter(event => 
    isSameDay(parseISO(event.start.toISOString()), date)
  )

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      {/* Day header */}
      <div className={`
        p-3 border-b border-gray-200 text-center
        ${isToday ? 'bg-primary-50 border-primary-200' : 'bg-gray-50'}
      `}>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {format(date, 'EEE', { locale: ptBR })}
        </div>
        <div className={`
          text-lg font-semibold mt-1
          ${isToday ? 'text-primary-600' : 'text-gray-900'}
        `}>
          {format(date, 'd')}
        </div>
        {dayEvents.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Events area */}
      <div className="flex-1 p-2 min-h-[400px] bg-gray-25">
        <SortableContext items={dayEvents.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {dayEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </SortableContext>

        {/* Add event button */}
        <button
          onClick={() => onAddEvent(date)}
          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mx-auto mb-1" />
          Adicionar evento
        </button>
      </div>
    </div>
  )
}

export default function CalendarCards() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    types: Object.keys(eventTypes),
    responsible: 'all'
  })

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      return eachDayOfInterval({ start, end })
    } else {
      // Month view - show 4 weeks
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = addDays(start, 27) // 4 weeks
      return eachDayOfInterval({ start, end })
    }
  }

  const dateRange = getDateRange()

  // Load events from database
  useEffect(() => {
    loadEvents()
  }, [user, currentDate, viewMode])

  const loadEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      const startDate = dateRange[0]
      const endDate = dateRange[dateRange.length - 1]

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clients(id, name, email, phone),
          companies(id, name, email, phone),
          deals(id, title, value, stage),
          users!events_responsible_id_fkey(id, name, email)
        `)
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString())
        .order('start_date', { ascending: true })

      if (error) throw error

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
        location: event.location,
        created_at: event.created_at,
        updated_at: event.updated_at,
        client: event.clients,
        company: event.companies,
        deal: event.deals,
        responsible: event.users
      })) || []

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    if (!filters.types.includes(event.type)) return false
    if (filters.responsible !== 'all' && event.responsible_id !== filters.responsible) return false
    return true
  })

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const eventId = active.id as string
    const targetDateString = over.id as string

    // Find the event being moved
    const eventToMove = events.find(e => e.id === eventId)
    if (!eventToMove) return

    // Parse target date - could be a date string or another event ID
    let newDate: Date
    
    // Check if it's a date string (ISO format)
    if (targetDateString.includes('T') || targetDateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      newDate = new Date(targetDateString)
    } else {
      // It might be another event ID, find the event and use its date
      const targetEvent = events.find(e => e.id === targetDateString)
      if (targetEvent) {
        newDate = new Date(targetEvent.start)
        newDate.setHours(0, 0, 0, 0) // Reset to start of day
      } else {
        return // Invalid target
      }
    }
    
    if (isNaN(newDate.getTime())) return

    // Calculate new start and end times
    const originalStart = eventToMove.start
    const originalEnd = eventToMove.end
    const duration = originalEnd.getTime() - originalStart.getTime()

    // If dragging to a different day, preserve the time
    const newStart = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 
                             originalStart.getHours(), originalStart.getMinutes())
    
    const newEnd = new Date(newStart.getTime() + duration)

    try {
      // Update in database
      const { error } = await supabase
        .from('events')
        .update({
          start_date: newStart.toISOString(),
          end_date: newEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error

      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, start: newStart, end: newEnd }
          : e
      ))
      
      // Show success message
      console.log(`Evento "${eventToMove.title}" movido para ${format(newStart, 'dd/MM/yyyy', { locale: ptBR })}`)
    } catch (error) {
      console.error('Error moving event:', error)
      alert('Erro ao mover evento')
    }
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    // Set event for editing instead of just viewing details
    setEditingEvent(event)
    setShowEventModal(true)
  }

  // Handle add event
  const handleAddEvent = (date: Date) => {
    const start = new Date(date)
    start.setHours(9, 0, 0, 0) // Default to 9 AM
    const end = new Date(start)
    end.setHours(10, 0, 0, 0) // 1 hour duration

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

  // Handle save event
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      
      // Get user's tenant_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle()

      let tenantId = userData?.tenant_id

      if (!userData) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            role: 'user',
            tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
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
            location: eventData.location,
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
            location: eventData.location,
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
      alert('Erro ao salvar evento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
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
    }
  }

  // Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : 30
    setCurrentDate(prev => 
      direction === 'next' ? addDays(prev, days) : subDays(prev, days)
    )
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const draggedEvent = activeId ? events.find(e => e.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda - Cards</h1>
          <p className="text-gray-600">Arraste os eventos entre as datas</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1 inline" />
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4 mr-1 inline" />
              Mês
            </button>
          </div>

          <button className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={() => handleAddEvent(new Date())}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
          >
            Hoje
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Calendar Grid */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={`
          grid gap-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
          ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}
        `}>
          {dateRange.map(date => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedEvent ? (
            <div className="bg-white rounded-lg shadow-lg border-2 border-primary-300 p-3 transform rotate-3 scale-105">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="p-1 rounded"
                  style={{ backgroundColor: `${eventTypes[draggedEvent.type].color}20` }}
                >
                  <eventTypes[draggedEvent.type].icon 
                    className="h-3 w-3"
                    style={{ color: eventTypes[draggedEvent.type].color }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {draggedEvent.allDay ? 'Dia inteiro' : format(draggedEvent.start, 'HH:mm', { locale: ptBR })}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {draggedEvent.title}
              </h4>
              {(draggedEvent.client || draggedEvent.company) && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">
                    {draggedEvent.client?.name || draggedEvent.company?.name}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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