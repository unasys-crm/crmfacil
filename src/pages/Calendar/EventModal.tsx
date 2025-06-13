import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { X, Calendar, Clock, Users, MapPin, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import 'react-datepicker/dist/react-datepicker.css'

const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  allDay: z.boolean(),
  client_id: z.string().optional(),
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
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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
      deal_id: event?.deal_id || undefined,
      location: event?.location || '',
      attendees: event?.attendees || []
    }
  })

  const watchAllDay = watch('allDay')
  const watchClientId = watch('client_id')

  // Load clients and deals
  useEffect(() => {
    loadClients()
    loadDeals()
  }, [])

  // Load deals when client changes
  useEffect(() => {
    if (watchClientId) {
      loadDeals(watchClientId)
    }
  }, [watchClientId])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadDeals = async (clientId?: string) => {
    try {
      let query = supabase
        .from('deals')
        .select('id, title, value, stage')
        .order('title')

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query

      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    }
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

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name
  }))

  const dealOptions = deals.map(deal => ({
    value: deal.id,
    label: `${deal.title} - ${deal.stage}`
  }))

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

          {/* Client */}
          <div>
            <label className="form-label">
              <Users className="h-4 w-4 inline mr-2" />
              Cliente
            </label>
            <Select
              options={clientOptions}
              value={clientOptions.find(option => option.value === watchClientId) || null}
              onChange={(option) => setValue('client_id', option?.value || undefined)}
              placeholder="Selecione um cliente"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Deal */}
          {watchClientId && (
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