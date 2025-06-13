import { useCompany } from '../contexts/CompanyContext'
import { supabase as defaultSupabase } from '../lib/supabase'

export function useSupabase() {
  const { supabaseClient } = useCompany()
  
  // Return the company-specific client if available, otherwise fall back to default
  // Add error handling wrapper to catch network issues
  const client = supabaseClient || defaultSupabase
  
  // Wrap client methods with error handling
  const wrappedClient = {
    ...client,
    from: (table: string) => {
      const query = client.from(table)
      
      // Wrap query methods to handle network errors gracefully
      const originalSelect = query.select.bind(query)
      const originalInsert = query.insert.bind(query)
      const originalUpdate = query.update.bind(query)
      const originalDelete = query.delete.bind(query)
      
      return {
        ...query,
        select: (...args: any[]) => {
          const result = originalSelect(...args)
          
          // Override the then method directly on the result object to preserve chaining
          const originalThen = result.then.bind(result)
          result.then = (onResolve: any, onReject?: any) => {
            return originalThen(
              (data: any) => onResolve(data),
              (error: any) => {
                if (error?.message?.includes('Failed to fetch')) {
                  console.warn(`⚠️ Network error accessing table '${table}'. Using fallback data.`)
                  // Return empty result instead of throwing
                  return onResolve({ data: [], error: null, count: 0 })
                }
                return onReject ? onReject(error) : Promise.reject(error)
              }
            )
          }
          
          return result
        },
        insert: (...args: any[]) => {
          const result = originalInsert(...args)
          
          // Override the then method directly on the result object to preserve chaining
          const originalThen = result.then.bind(result)
          result.then = (onResolve: any, onReject?: any) => {
            return originalThen(
              (data: any) => onResolve(data),
              (error: any) => {
                if (error?.message?.includes('Failed to fetch')) {
                  console.warn(`⚠️ Network error inserting into table '${table}'. Operation failed.`)
                  return onReject ? onReject(error) : Promise.reject(error)
                }
                return onReject ? onReject(error) : Promise.reject(error)
              }
            )
          }
          
          return result
        },
        update: (...args: any[]) => {
          const result = originalUpdate(...args)
          
          // Override the then method directly on the result object to preserve chaining
          const originalThen = result.then.bind(result)
          result.then = (onResolve: any, onReject?: any) => {
            return originalThen(
              (data: any) => onResolve(data),
              (error: any) => {
                if (error?.message?.includes('Failed to fetch')) {
                  console.warn(`⚠️ Network error updating table '${table}'. Operation failed.`)
                  return onReject ? onReject(error) : Promise.reject(error)
                }
                return onReject ? onReject(error) : Promise.reject(error)
              }
            )
          }
          
          return result
        },
        delete: (...args: any[]) => {
          const result = originalDelete(...args)
          
          // Override the then method directly on the result object to preserve chaining
          const originalThen = result.then.bind(result)
          result.then = (onResolve: any, onReject?: any) => {
            return originalThen(
              (data: any) => onResolve(data),
              (error: any) => {
                if (error?.message?.includes('Failed to fetch')) {
                  console.warn(`⚠️ Network error deleting from table '${table}'. Operation failed.`)
                  return onReject ? onReject(error) : Promise.reject(error)
                }
                return onReject ? onReject(error) : Promise.reject(error)
              }
            )
          }
          
          return result
        }
      }
    }
  }
  
  return wrappedClient
}