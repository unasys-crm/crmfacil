import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ActivityRecord {
  id: string
  type: 'event' | 'deal' | 'task'
  title: string
  description?: string
  date: string
  status?: string
  value?: number
  responsible_name?: string
  event_type?: string
}

export function useClientHistory(clientId?: string, companyId?: string) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clientId || companyId) {
      loadHistory()
    }
  }, [clientId, companyId])

  const loadHistory = async () => {
    if (!clientId && !companyId) return

    try {
      setLoading(true)
      const activities: ActivityRecord[] = []

      // Load events
      const eventsQuery = supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_date,
          type,
          users(name)
        `)
        .order('start_date', { ascending: false })

      if (clientId) {
        eventsQuery.eq('client_id', clientId)
      } else if (companyId) {
        eventsQuery.eq('company_id', companyId)
      }

      const { data: events } = await eventsQuery

      if (events) {
        activities.push(...events.map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          description: event.description,
          date: event.start_date,
          responsible_name: event.users?.name,
          event_type: event.type
        })))
      }

      // Load deals
      const dealsQuery = supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          value,
          stage,
          created_at,
          users(name)
        `)
        .order('created_at', { ascending: false })

      if (clientId) {
        dealsQuery.eq('client_id', clientId)
      } else if (companyId) {
        dealsQuery.eq('company_id', companyId)
      }

      const { data: deals } = await dealsQuery

      if (deals) {
        activities.push(...deals.map(deal => ({
          id: deal.id,
          type: 'deal' as const,
          title: deal.title,
          description: deal.description,
          date: deal.created_at,
          status: deal.stage,
          value: deal.value,
          responsible_name: deal.users?.name
        })))
      }

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setActivities(activities)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const addActivity = (activity: ActivityRecord) => {
    setActivities(prev => [activity, ...prev])
  }

  return {
    activities,
    loading,
    refresh: loadHistory,
    addActivity
  }
}