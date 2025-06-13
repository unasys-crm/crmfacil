import { useState } from 'react'
import { 
  Calendar, 
  Target, 
  CheckSquare, 
  Clock, 
  User, 
  DollarSign,
  Phone,
  Mail,
  Video,
  MapPin,
  Users,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useClientHistory, ActivityRecord } from '../../hooks/useClientHistory'
import { formatDateTime, formatCurrency } from '../../lib/utils'

interface ClientHistoryProps {
  clientId?: string
  companyId?: string
  title?: string
}

const eventTypeIcons = {
  meeting: Users,
  call: Phone,
  video: Video,
  email: Mail,
  task: CheckSquare,
  visit: MapPin,
  other: Calendar
}

const eventTypeColors = {
  meeting: '#3b82f6',
  call: '#10b981',
  video: '#8b5cf6',
  email: '#f59e0b',
  task: '#ef4444',
  visit: '#06b6d4',
  other: '#6b7280'
}

export default function ClientHistory({ clientId, companyId, title }: ClientHistoryProps) {
  const { activities, loading } = useClientHistory(clientId, companyId)
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<'all' | 'event' | 'deal' | 'task'>('all')

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  )

  const getActivityIcon = (activity: ActivityRecord) => {
    switch (activity.type) {
      case 'event':
        const EventIcon = eventTypeIcons[activity.event_type as keyof typeof eventTypeIcons] || Calendar
        return EventIcon
      case 'deal':
        return Target
      case 'task':
        return CheckSquare
      default:
        return Calendar
    }
  }

  const getActivityColor = (activity: ActivityRecord) => {
    switch (activity.type) {
      case 'event':
        return eventTypeColors[activity.event_type as keyof typeof eventTypeColors] || '#6b7280'
      case 'deal':
        return '#3b82f6'
      case 'task':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getActivityTypeLabel = (activity: ActivityRecord) => {
    switch (activity.type) {
      case 'event':
        const eventTypes = {
          meeting: 'Reunião',
          call: 'Ligação',
          video: 'Videoconferência',
          email: 'Email',
          task: 'Tarefa',
          visit: 'Visita',
          other: 'Outro'
        }
        return eventTypes[activity.event_type as keyof typeof eventTypes] || 'Evento'
      case 'deal':
        return 'Negócio'
      case 'task':
        return 'Tarefa'
      default:
        return 'Atividade'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {title || 'Histórico de Atividades'}
        </h3>
        <div className="flex items-center space-x-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="all">Todas</option>
            <option value="event">Eventos</option>
            <option value="deal">Negócios</option>
            <option value="task">Tarefas</option>
          </select>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activities.filter(a => a.type === 'event').length}
          </div>
          <div className="text-sm text-gray-500">Eventos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {activities.filter(a => a.type === 'deal').length}
          </div>
          <div className="text-sm text-gray-500">Negócios</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {activities.filter(a => a.type === 'task').length}
          </div>
          <div className="text-sm text-gray-500">Tarefas</div>
        </div>
      </div>

      {/* Activities List */}
      <div className={`space-y-4 ${!isExpanded ? 'max-h-96 overflow-y-auto' : ''}`}>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma atividade encontrada</p>
            <p className="text-sm">As atividades aparecerão aqui conforme forem criadas</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity)
            const color = getActivityColor(activity)

            return (
              <div key={`${activity.type}-${activity.id}`} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon 
                    className="h-4 w-4"
                    style={{ color }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${color}20`,
                          color: color
                        }}
                      >
                        {getActivityTypeLabel(activity)}
                      </span>
                    </div>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateTime(activity.date)}
                      </div>
                      
                      {activity.responsible_name && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {activity.responsible_name}
                        </div>
                      )}
                      
                      {activity.status && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                          {activity.status}
                        </div>
                      )}
                    </div>
                    
                    {activity.value && (
                      <div className="flex items-center text-xs text-green-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(activity.value)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {!isExpanded && filteredActivities.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Ver todas as atividades ({filteredActivities.length})
          </button>
        </div>
      )}
    </div>
  )
}