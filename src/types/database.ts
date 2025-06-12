export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          razao_social: string
          cnpj: string
          segment: string
          origin: string
          store_count: number
          address: string
          cep: string
          city: string
          state: string
          email: string
          phone: string
          tags: string[]
          custom_fields: Record<string, any>
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          razao_social?: string
          cnpj?: string
          segment?: string
          origin?: string
          store_count?: number
          address?: string
          cep?: string
          city?: string
          state?: string
          email?: string
          phone?: string
          tags?: string[]
          custom_fields?: Record<string, any>
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          razao_social?: string
          cnpj?: string
          segment?: string
          origin?: string
          store_count?: number
          address?: string
          cep?: string
          city?: string
          state?: string
          email?: string
          phone?: string
          tags?: string[]
          custom_fields?: Record<string, any>
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          cpf: string
          email: string
          phone: string
          address: string
          cep: string
          city: string
          state: string
          company_id: string
          responsible_ids: string[]
          observations: string
          tags: string[]
          custom_fields: Record<string, any>
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          cpf?: string
          email?: string
          phone?: string
          address?: string
          cep?: string
          city?: string
          state?: string
          company_id?: string
          responsible_ids?: string[]
          observations?: string
          tags?: string[]
          custom_fields?: Record<string, any>
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          cpf?: string
          email?: string
          phone?: string
          address?: string
          cep?: string
          city?: string
          state?: string
          company_id?: string
          responsible_ids?: string[]
          observations?: string
          tags?: string[]
          custom_fields?: Record<string, any>
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          title: string
          description: string
          value: number
          stage: string
          probability: number
          expected_close_date: string
          client_id: string
          company_id: string
          responsible_id: string
          pipeline_id: string
          custom_fields: Record<string, any>
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          value?: number
          stage: string
          probability?: number
          expected_close_date?: string
          client_id?: string
          company_id?: string
          responsible_id: string
          pipeline_id: string
          custom_fields?: Record<string, any>
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          value?: number
          stage?: string
          probability?: number
          expected_close_date?: string
          client_id?: string
          company_id?: string
          responsible_id?: string
          pipeline_id?: string
          custom_fields?: Record<string, any>
          updated_at?: string
        }
      }
      pipelines: {
        Row: {
          id: string
          name: string
          stages: Array<{
            id: string
            name: string
            color: string
            order: number
          }>
          is_default: boolean
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          stages: Array<{
            id: string
            name: string
            color: string
            order: number
          }>
          is_default?: boolean
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          stages?: Array<{
            id: string
            name: string
            color: string
            order: number
          }>
          is_default?: boolean
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          permissions: string[]
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          permissions?: string[]
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string
          role?: string
          permissions?: string[]
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          domain: string
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          domain?: string
          settings?: Record<string, any>
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          all_day: boolean
          type: string
          client_id: string
          deal_id: string
          responsible_id: string
          google_event_id: string
          outlook_event_id: string
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          start_date: string
          end_date: string
          all_day?: boolean
          type?: string
          client_id?: string
          deal_id?: string
          responsible_id: string
          google_event_id?: string
          outlook_event_id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          all_day?: boolean
          type?: string
          client_id?: string
          deal_id?: string
          responsible_id?: string
          google_event_id?: string
          outlook_event_id?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}