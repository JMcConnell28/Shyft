export type Database = {
  public: {
    Tables: {
      employee_location_assignments: {
        Row: {
          created_at: string
          disabled_at: string | null
          employee_id: string
          id: string
          is_enabled: boolean
          location_id: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          disabled_at?: string | null
          employee_id: string
          id?: string
          is_enabled?: boolean
          location_id: string
          organization_id: string
        }
        Update: {
          created_at?: string
          disabled_at?: string | null
          employee_id?: string
          id?: string
          is_enabled?: boolean
          location_id?: string
          organization_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          organization_id: string
          staff_group_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          organization_id: string
          staff_group_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          organization_id?: string
          staff_group_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invitation: {
        Row: {
          createdAt: string
          email: string
          expiresAt: string
          id: string
          inviterId: string
          organizationId: string
          role: string | null
          status: string
        }
        Insert: {
          createdAt?: string
          email: string
          expiresAt: string
          id: string
          inviterId: string
          organizationId: string
          role?: string | null
          status: string
        }
        Update: {
          createdAt?: string
          email?: string
          expiresAt?: string
          id?: string
          inviterId?: string
          organizationId?: string
          role?: string | null
          status?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      member: {
        Row: {
          createdAt: string
          id: string
          organizationId: string
          role: string
          userId: string
        }
        Insert: {
          createdAt: string
          id: string
          organizationId: string
          role: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          organizationId?: string
          role?: string
          userId?: string
        }
        Relationships: []
      }
      organization: {
        Row: {
          createdAt: string
          id: string
          logo: string | null
          metadata: string | null
          name: string
          slug: string
        }
        Insert: {
          createdAt: string
          id: string
          logo?: string | null
          metadata?: string | null
          name: string
          slug: string
        }
        Update: {
          createdAt?: string
          id?: string
          logo?: string | null
          metadata?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      organization_onboarding_states: {
        Row: {
          completed_at: string | null
          created_at: string
          last_step: string
          organization_id: string
          trial_ends_at: string
          trial_started_at: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          last_step?: string
          organization_id: string
          trial_ends_at: string
          trial_started_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          last_step?: string
          organization_id?: string
          trial_ends_at?: string
          trial_started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rota_reads: {
        Row: {
          created_at: string
          id: string
          rota_id: string
          seen_at: string | null
          seen_published_version: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rota_id: string
          seen_at?: string | null
          seen_published_version?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rota_id?: string
          seen_at?: string | null
          seen_published_version?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rota_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          location_id: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location_id?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location_id?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rotas: {
        Row: {
          created_at: string
          created_by: string
          id: string
          location_id: string
          note: string | null
          organization_id: string
          published_at: string | null
          published_by_user_id: string | null
          published_version: number
          scheduled_hours: number
          scheduled_staff_count: number
          shift_count: number
          source_rota_id: string | null
          source_type: string
          status: string
          template_id: string | null
          updated_at: string
          week_start: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          location_id: string
          note?: string | null
          organization_id: string
          published_at?: string | null
          published_by_user_id?: string | null
          published_version?: number
          scheduled_hours?: number
          scheduled_staff_count?: number
          shift_count?: number
          source_rota_id?: string | null
          source_type?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          week_start: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          location_id?: string
          note?: string | null
          organization_id?: string
          published_at?: string | null
          published_by_user_id?: string | null
          published_version?: number
          scheduled_hours?: number
          scheduled_staff_count?: number
          shift_count?: number
          source_rota_id?: string | null
          source_type?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          week_start?: string
        }
        Relationships: []
      }
      staff_groups: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          organization_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          organization_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_invite_links: {
        Row: {
          created_at: string
          created_by: string
          default_role: string
          default_staff_group_id: string
          disabled_at: string | null
          expires_at: string | null
          id: string
          location_id: string
          organization_id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          default_role?: string
          default_staff_group_id: string
          disabled_at?: string | null
          expires_at?: string | null
          id?: string
          location_id: string
          organization_id: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string
          default_role?: string
          default_staff_group_id?: string
          disabled_at?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string
          organization_id?: string
          token?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          created_at: string
          id: string
          location_id: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicTableName = keyof Database["public"]["Tables"]

type TableRow<TableName extends PublicTableName> =
  Database["public"]["Tables"][TableName]["Row"]

type TableInsert<TableName extends PublicTableName> =
  Database["public"]["Tables"][TableName]["Insert"]

type TableUpdate<TableName extends PublicTableName> =
  Database["public"]["Tables"][TableName]["Update"]

export type { PublicTableName, TableInsert, TableRow, TableUpdate }
