import { useState } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  FileText, 
  Edit, 
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Video
} from 'lucide-react'
import { formatDateTime, formatDate } from '../../lib/utils'

interface EventDetailsModalProps {
  event: any
  onEdit: (event: any) => void
  onDelete: (eventId: string) => void
  onClose: () => void
  eventTypes: any
}

export default function EventDetailsModal({ 
  event, 
  onEdit, 
  onDelete, 
  onClose, 
  eventTypes 
}: EventDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const eventType = eventTypes[event.type]
  const Icon = eventType.icon

  const handleDelete = () => {
    onDelete(event.id)
    setShowDeleteConfirm(false)
  }

  const getEventDuration = () => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`
    }
    return `${diffMinutes}min`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${eventType.color}20` }}
            >
              <Icon 
                className="h-5 w-5"
                style={{ color: eventType.color }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
              <p className="text-sm text-gray-500">{eventType.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {event.allDay ? 'Dia inteiro' : 'Horário'}
              </p>
              {event.allDay ? (
                <p className="text-sm text-gray-600">
                  {formatDate(event.start)}
                  {event.start.toDateString() !== event.end.toDateString() && 
                    ` - ${formatDate(event.end)}`
                  }
                </p>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>{formatDateTime(event.start)} - {formatDateTime(event.end)}</p>
                  <p className="text-xs text-gray-500">Duração: {getEventDuration()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Local</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {/* Client */}
          {event.client_id && (
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cliente</p>
                <p className="text-sm text-gray-600">Cliente associado</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Descrição</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}

          {/* External Calendar Links */}
          {(event.google_event_id || event.outlook_event_id) && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Calendários Externos</p>
              <div className="flex space-x-2">
                {event.google_event_id && (
                  <button className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google Calendar
                  </button>
                )}
                {event.outlook_event_id && (
                  <button className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Outlook
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {event.type === 'call' && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Ações Rápidas</p>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200">
                  <Phone className="h-3 w-3 mr-1" />
                  Ligar
                </button>
                <button className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </button>
              </div>
            </div>
          )}

          {event.type === 'video' && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Videoconferência</p>
              <button className="inline-flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">
                <Video className="h-3 w-3 mr-1" />
                Iniciar Reunião
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Criado em {formatDateTime(event.created_at)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </button>
            <button
              onClick={() => onEdit(event)}
              className="btn-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}