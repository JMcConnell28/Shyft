export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  billing_private: {
    Tables: {
      billing_account_administrators: {
        Row: {
          billing_account_id: string
          created_at: string
          created_by_user_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          billing_account_id: string
          created_at?: string
          created_by_user_id?: string | null
          role?: string
          user_id: string
        }
        Update: {
          billing_account_id?: string
          created_at?: string
          created_by_user_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_subscription_items: {
        Row: {
          billing_subscription_id: string
          created_at: string
          id: string
          is_metered: boolean
          item_type: string
          quantity: number | null
          stripe_price_id: string
          stripe_subscription_item_id: string
          updated_at: string
        }
        Insert: {
          billing_subscription_id: string
          created_at?: string
          id?: string
          is_metered?: boolean
          item_type: string
          quantity?: number | null
          stripe_price_id: string
          stripe_subscription_item_id: string
          updated_at?: string
        }
        Update: {
          billing_subscription_id?: string
          created_at?: string
          id?: string
          is_metered?: boolean
          item_type?: string
          quantity?: number | null
          stripe_price_id?: string
          stripe_subscription_item_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_transfers: {
        Row: {
          completed_at: string | null
          created_at: string
          effective_at: string
          failure_reason: string | null
          id: string
          location_id: string
          requested_by_user_id: string | null
          source_billing_account_id: string
          status: string
          target_billing_account_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          effective_at: string
          failure_reason?: string | null
          id?: string
          location_id: string
          requested_by_user_id?: string | null
          source_billing_account_id: string
          status?: string
          target_billing_account_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          effective_at?: string
          failure_reason?: string | null
          id?: string
          location_id?: string
          requested_by_user_id?: string | null
          source_billing_account_id?: string
          status?: string
          target_billing_account_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_addons: {
        Row: {
          activated_at: string | null
          addon_type: string
          billing_starts_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          legacy_opt_in_deadline: string | null
          location_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          addon_type: string
          billing_starts_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          legacy_opt_in_deadline?: string | null
          location_id: string
          status: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          addon_type?: string
          billing_starts_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          legacy_opt_in_deadline?: string | null
          location_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_billing_periods: {
        Row: {
          billing_account_id: string
          created_at: string
          finalized_at: string | null
          finalized_employee_count: number | null
          finalized_overage_count: number | null
          high_water_employee_count: number
          id: string
          included_employee_count: number
          last_meter_value: number
          last_observed_at: string | null
          location_id: string
          period_end: string
          period_start: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          created_at?: string
          finalized_at?: string | null
          finalized_employee_count?: number | null
          finalized_overage_count?: number | null
          high_water_employee_count?: number
          id?: string
          included_employee_count?: number
          last_meter_value?: number
          last_observed_at?: string | null
          location_id: string
          period_end: string
          period_start: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          created_at?: string
          finalized_at?: string | null
          finalized_employee_count?: number | null
          finalized_overage_count?: number | null
          high_water_employee_count?: number
          id?: string
          included_employee_count?: number
          last_meter_value?: number
          last_observed_at?: string | null
          location_id?: string
          period_end?: string
          period_start?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      location_billing_usage_snapshots: {
        Row: {
          created_at: string
          high_water_employee_count: number
          id: number
          location_billing_period_id: string
          observed_at: string
          observed_employee_count: number
          source: string
        }
        Insert: {
          created_at?: string
          high_water_employee_count: number
          id?: never
          location_billing_period_id: string
          observed_at?: string
          observed_employee_count: number
          source: string
        }
        Update: {
          created_at?: string
          high_water_employee_count?: number
          id?: never
          location_billing_period_id?: string
          observed_at?: string
          observed_employee_count?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_billing_usage_snapshot_location_billing_period_id_fkey"
            columns: ["location_billing_period_id"]
            isOneToOne: false
            referencedRelation: "location_billing_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      location_entitlements: {
        Row: {
          created_at: string
          location_id: string
          recovery_started_at: string | null
          trial_consumed_at: string
          trial_ends_at: string
          trial_started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          location_id: string
          recovery_started_at?: string | null
          trial_consumed_at: string
          trial_ends_at: string
          trial_started_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          location_id?: string
          recovery_started_at?: string | null
          trial_consumed_at?: string
          trial_ends_at?: string
          trial_started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_hardware_entitlements: {
        Row: {
          addon_type: string
          claimed_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_city: string | null
          delivery_country: string | null
          delivery_county: string | null
          delivery_line1: string | null
          delivery_line2: string | null
          delivery_name: string | null
          delivery_postcode: string | null
          entitlement_status: string
          fulfillment_reference: string | null
          fulfillment_status: string
          location_id: string
          shipped_at: string | null
          stripe_payment_method_required: boolean
          updated_at: string
        }
        Insert: {
          addon_type?: string
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_county?: string | null
          delivery_line1?: string | null
          delivery_line2?: string | null
          delivery_name?: string | null
          delivery_postcode?: string | null
          entitlement_status?: string
          fulfillment_reference?: string | null
          fulfillment_status?: string
          location_id: string
          shipped_at?: string | null
          stripe_payment_method_required?: boolean
          updated_at?: string
        }
        Update: {
          addon_type?: string
          claimed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_county?: string | null
          delivery_line1?: string | null
          delivery_line2?: string | null
          delivery_name?: string | null
          delivery_postcode?: string | null
          entitlement_status?: string
          fulfillment_reference?: string | null
          fulfillment_status?: string
          location_id?: string
          shipped_at?: string | null
          stripe_payment_method_required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_location_usage: {
        Args: {
          observed_at?: string
          target_location_id: string
          usage_source: string
        }
        Returns: undefined
      }
      qualifying_employee_count: {
        Args: {
          target_location_id: string
          target_period_end: string
          target_period_start: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_locations: {
        Row: {
          announcement_id: string
          location_id: string
        }
        Insert: {
          announcement_id: string
          location_id: string
        }
        Update: {
          announcement_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_locations_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          archived_at: string | null
          author_user_id: string
          body: string
          created_at: string
          id: string
          organization_id: string
          published_at: string
          status: string
          target_scope: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          organization_id: string
          published_at?: string
          status?: string
          target_scope: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
          published_at?: string
          status?: string
          target_scope?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_accounts: {
        Row: {
          billing_address_country: string | null
          created_at: string
          id: string
          location_id: string | null
          organization_id: string | null
          owner_user_id: string | null
          payment_method_saved_at: string | null
          scope: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          stripe_tax_exempt: string | null
          stripe_tax_id_count: number
          updated_at: string
        }
        Insert: {
          billing_address_country?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          owner_user_id?: string | null
          payment_method_saved_at?: string | null
          scope: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_tax_exempt?: string | null
          stripe_tax_id_count?: number
          updated_at?: string
        }
        Update: {
          billing_address_country?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          owner_user_id?: string | null
          payment_method_saved_at?: string | null
          scope?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_tax_exempt?: string | null
          stripe_tax_id_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_accounts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_reconciliation_runs: {
        Row: {
          checked_account_count: number
          created_at: string
          error_message: string | null
          failed_account_count: number
          finished_at: string | null
          id: string
          started_at: string
          status: string
          synced_quantity_count: number
          synced_subscription_count: number
          updated_at: string
        }
        Insert: {
          checked_account_count?: number
          created_at?: string
          error_message?: string | null
          failed_account_count?: number
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
          synced_quantity_count?: number
          synced_subscription_count?: number
          updated_at?: string
        }
        Update: {
          checked_account_count?: number
          created_at?: string
          error_message?: string | null
          failed_account_count?: number
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
          synced_quantity_count?: number
          synced_subscription_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          billing_account_id: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          past_due_started_at: string | null
          quantity: number
          status: string
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          past_due_started_at?: string | null
          quantity?: number
          status: string
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          past_due_started_at?: string | null
          quantity?: number
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_attempts: {
        Row: {
          action: string | null
          clock_tag_id: string | null
          created_at: string
          employee_id: string | null
          failure_reason: string | null
          gps_accuracy_meters: number | null
          gps_distance_meters: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          ip_hash: string | null
          location_id: string | null
          organization_id: string | null
          performed_by_user_id: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          action?: string | null
          clock_tag_id?: string | null
          created_at?: string
          employee_id?: string | null
          failure_reason?: string | null
          gps_accuracy_meters?: number | null
          gps_distance_meters?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          ip_hash?: string | null
          location_id?: string | null
          organization_id?: string | null
          performed_by_user_id?: string | null
          success: boolean
          user_agent?: string | null
        }
        Update: {
          action?: string | null
          clock_tag_id?: string | null
          created_at?: string
          employee_id?: string | null
          failure_reason?: string | null
          gps_accuracy_meters?: number | null
          gps_distance_meters?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          ip_hash?: string | null
          location_id?: string | null
          organization_id?: string | null
          performed_by_user_id?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_attempts_clock_tag_id_fkey"
            columns: ["clock_tag_id"]
            isOneToOne: false
            referencedRelation: "clock_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_attempts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_attempts_performed_by_user_id_fkey"
            columns: ["performed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_events: {
        Row: {
          created_at: string
          employee_id: string
          event_at: string
          event_type: string
          id: string
          location_id: string
          metadata: Json
          organization_id: string | null
          performed_by_user_id: string | null
          reason: string | null
          time_entry_id: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          event_at?: string
          event_type: string
          id?: string
          location_id: string
          metadata?: Json
          organization_id?: string | null
          performed_by_user_id?: string | null
          reason?: string | null
          time_entry_id?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          event_at?: string
          event_type?: string
          id?: string
          location_id?: string
          metadata?: Json
          organization_id?: string | null
          performed_by_user_id?: string | null
          reason?: string | null
          time_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_events_performed_by_user_id_fkey"
            columns: ["performed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_events_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_tags: {
        Row: {
          created_at: string
          created_by: string | null
          disabled_at: string | null
          id: string
          is_active: boolean
          label: string
          location_id: string
          ntag_aes_key_hex: string | null
          ntag_last_seen_counter: number
          ntag_public_id: string | null
          organization_id: string | null
          rotated_by: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          id?: string
          is_active?: boolean
          label: string
          location_id: string
          ntag_aes_key_hex?: string | null
          ntag_last_seen_counter?: number
          ntag_public_id?: string | null
          organization_id?: string | null
          rotated_by?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          id?: string
          is_active?: boolean
          label?: string
          location_id?: string
          ntag_aes_key_hex?: string | null
          ntag_last_seen_counter?: number
          ntag_public_id?: string | null
          organization_id?: string | null
          rotated_by?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tags_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tags_rotated_by_fkey"
            columns: ["rotated_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_tag_counter_claims: {
        Row: {
          clock_tag_id: string
          cmac_hex: string
          created_at: string
          encrypted_picc_hex: string
          id: string
          picc_counter: number
        }
        Insert: {
          clock_tag_id: string
          cmac_hex: string
          created_at?: string
          encrypted_picc_hex: string
          id?: string
          picc_counter: number
        }
        Update: {
          clock_tag_id?: string
          cmac_hex?: string
          created_at?: string
          encrypted_picc_hex?: string
          id?: string
          picc_counter?: number
        }
        Relationships: [
          {
            foreignKeyName: "clock_tag_counter_claims_clock_tag_id_fkey"
            columns: ["clock_tag_id"]
            isOneToOne: false
            referencedRelation: "clock_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_scan_sessions: {
        Row: {
          action: string
          clock_tag_id: string
          cmac_hex: string
          consumed_at: string | null
          created_at: string
          employee_id: string
          encrypted_picc_hex: string
          expires_at: string
          id: string
          location_id: string
          organization_id: string | null
          picc_counter: number
          user_id: string
        }
        Insert: {
          action: string
          clock_tag_id: string
          cmac_hex: string
          consumed_at?: string | null
          created_at?: string
          employee_id: string
          encrypted_picc_hex: string
          expires_at: string
          id?: string
          location_id: string
          organization_id?: string | null
          picc_counter: number
          user_id: string
        }
        Update: {
          action?: string
          clock_tag_id?: string
          cmac_hex?: string
          consumed_at?: string | null
          created_at?: string
          employee_id?: string
          encrypted_picc_hex?: string
          expires_at?: string
          id?: string
          location_id?: string
          organization_id?: string | null
          picc_counter?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_scan_sessions_clock_tag_id_fkey"
            columns: ["clock_tag_id"]
            isOneToOne: false
            referencedRelation: "clock_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_scan_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_scan_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_scan_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_scan_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_compensation: {
        Row: {
          created_at: string
          employee_id: string
          hourly_rate_pence: number | null
          location_id: string | null
          organization_id: string | null
          pay_type: string
          updated_at: string
          weekly_salary_pence: number | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          hourly_rate_pence?: number | null
          location_id?: string | null
          organization_id?: string | null
          pay_type?: string
          updated_at?: string
          weekly_salary_pence?: number | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          hourly_rate_pence?: number | null
          location_id?: string | null
          organization_id?: string | null
          pay_type?: string
          updated_at?: string
          weekly_salary_pence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_compensation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_compensation_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_compensation_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "employee_location_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_location_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_location_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_rota_notes: {
        Row: {
          archived_at: string | null
          body: string
          category: string
          created_at: string
          created_by_user_id: string | null
          employee_id: string
          id: string
          is_pinned: boolean
          location_id: string | null
          metadata: Json
          organization_id: string
          priority: string
          status: string
          title: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          archived_at?: string | null
          body: string
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          employee_id: string
          id?: string
          is_pinned?: boolean
          location_id?: string | null
          metadata?: Json
          organization_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          archived_at?: string | null
          body?: string
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          employee_id?: string
          id?: string
          is_pinned?: boolean
          location_id?: string | null
          metadata?: Json
          organization_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_rota_notes_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_rota_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_rota_notes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_rota_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_rota_notes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          location_id: string | null
          organization_id: string | null
          payroll_id: string | null
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
          location_id?: string | null
          organization_id?: string | null
          payroll_id?: string | null
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
          location_id?: string | null
          organization_id?: string | null
          payroll_id?: string | null
          staff_group_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_staff_group_id_fkey"
            columns: ["staff_group_id"]
            isOneToOne: false
            referencedRelation: "staff_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "invitation_inviterId_fkey"
            columns: ["inviterId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      location_clock_settings: {
        Row: {
          created_at: string
          early_clock_in_grace_minutes: number
          early_start_review_minutes: number
          forgotten_clock_out_alert_minutes: number
          hard_review_after_minutes: number
          is_enabled: boolean
          late_clock_in_grace_minutes: number
          late_clock_out_grace_minutes: number
          late_finish_review_minutes: number
          late_start_review_minutes: number
          latitude: number | null
          location_id: string
          longitude: number | null
          max_accuracy_meters: number
          organization_id: string | null
          radius_meters: number
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          early_clock_in_grace_minutes?: number
          early_start_review_minutes?: number
          forgotten_clock_out_alert_minutes?: number
          hard_review_after_minutes?: number
          is_enabled?: boolean
          late_clock_in_grace_minutes?: number
          late_clock_out_grace_minutes?: number
          late_finish_review_minutes?: number
          late_start_review_minutes?: number
          latitude?: number | null
          location_id: string
          longitude?: number | null
          max_accuracy_meters?: number
          organization_id?: string | null
          radius_meters?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          early_clock_in_grace_minutes?: number
          early_start_review_minutes?: number
          forgotten_clock_out_alert_minutes?: number
          hard_review_after_minutes?: number
          is_enabled?: boolean
          late_clock_in_grace_minutes?: number
          late_clock_out_grace_minutes?: number
          late_finish_review_minutes?: number
          late_start_review_minutes?: number
          latitude?: number | null
          location_id?: string
          longitude?: number | null
          max_accuracy_meters?: number
          organization_id?: string | null
          radius_meters?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_clock_settings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_clock_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      location_memberships: {
        Row: {
          created_at: string
          id: string
          location_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_memberships_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      location_operating_hours: {
        Row: {
          close_time: string
          close_time_next_day: boolean
          created_at: string
          id: string
          location_id: string
          organization_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          close_time: string
          close_time_next_day?: boolean
          created_at?: string
          id?: string
          location_id: string
          organization_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          close_time?: string
          close_time_next_day?: boolean
          created_at?: string
          id?: string
          location_id?: string
          organization_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_operating_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_operating_hours_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          billing_account_id: string
          business_type: string
          created_at: string
          estimated_closing_time: string
          estimated_closing_time_next_day: boolean
          id: string
          name: string
          organization_id: string
          planning_mode: string
          slug: string
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          business_type?: string
          created_at?: string
          estimated_closing_time?: string
          estimated_closing_time_next_day?: boolean
          id?: string
          name: string
          organization_id: string
          planning_mode?: string
          slug: string
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          business_type?: string
          created_at?: string
          estimated_closing_time?: string
          estimated_closing_time_next_day?: boolean
          id?: string
          name?: string
          organization_id?: string
          planning_mode?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "member_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          createdAt: string
          estimatedClosingTime: string
          id: string
          logo: string | null
          merged_at: string | null
          merged_into_organization_id: string | null
          metadata: string | null
          name: string
          slug: string
          status: string
          stripeCustomerId: string | null
        }
        Insert: {
          createdAt: string
          estimatedClosingTime?: string
          id: string
          logo?: string | null
          merged_at?: string | null
          merged_into_organization_id?: string | null
          metadata?: string | null
          name: string
          slug: string
          status?: string
          stripeCustomerId?: string | null
        }
        Update: {
          createdAt?: string
          estimatedClosingTime?: string
          id?: string
          logo?: string | null
          merged_at?: string | null
          merged_into_organization_id?: string | null
          metadata?: string | null
          name?: string
          slug?: string
          status?: string
          stripeCustomerId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_merged_into_organization_id_fkey"
            columns: ["merged_into_organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey: {
        Row: {
          aaguid: string | null
          backedUp: boolean
          counter: number
          createdAt: string | null
          credentialID: string
          deviceType: string
          id: string
          name: string | null
          publicKey: string
          transports: string | null
          userId: string
        }
        Insert: {
          aaguid?: string | null
          backedUp: boolean
          counter: number
          createdAt?: string | null
          credentialID: string
          deviceType: string
          id: string
          name?: string | null
          publicKey: string
          transports?: string | null
          userId: string
        }
        Update: {
          aaguid?: string | null
          backedUp?: boolean
          counter?: number
          createdAt?: string | null
          credentialID?: string
          deviceType?: string
          id?: string
          name?: string | null
          publicKey?: string
          transports?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "passkey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_budgets: {
        Row: {
          budget_pence: number
          created_at: string
          location_id: string
          organization_id: string | null
          rota_id: string
          updated_at: string
        }
        Insert: {
          budget_pence: number
          created_at?: string
          location_id: string
          organization_id?: string | null
          rota_id: string
          updated_at?: string
        }
        Update: {
          budget_pence?: number
          created_at?: string
          location_id?: string
          organization_id?: string | null
          rota_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_budgets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_budgets_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: true
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_published_shift_assignments: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          rota_published_shift_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          rota_published_shift_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          rota_published_shift_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_published_shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_published_shift_assignments_rota_published_shift_id_fkey"
            columns: ["rota_published_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_published_shifts: {
        Row: {
          created_at: string
          day_date: string
          end_kind: string | null
          end_time: string | null
          id: string
          organization_id: string | null
          rota_id: string
          shift_type: string
          split_second_end_time: string | null
          split_second_start_time: string | null
          start_time: string
          updated_at: string
          working_shift_id: string | null
          zone_id: string | null
          zone_name_snapshot: string
        }
        Insert: {
          created_at?: string
          day_date: string
          end_kind?: string | null
          end_time?: string | null
          id?: string
          organization_id?: string | null
          rota_id: string
          shift_type: string
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time: string
          updated_at?: string
          working_shift_id?: string | null
          zone_id?: string | null
          zone_name_snapshot: string
        }
        Update: {
          created_at?: string
          day_date?: string
          end_kind?: string | null
          end_time?: string | null
          id?: string
          organization_id?: string | null
          rota_id?: string
          shift_type?: string
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time?: string
          updated_at?: string
          working_shift_id?: string | null
          zone_id?: string | null
          zone_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_published_shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_published_shifts_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_published_shifts_working_shift_id_fkey"
            columns: ["working_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_published_shifts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "rota_reads_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_shift_assignments: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          rota_shift_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          rota_shift_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          rota_shift_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_shift_assignments_rota_shift_id_fkey"
            columns: ["rota_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_shifts: {
        Row: {
          created_at: string
          day_date: string
          end_kind: string | null
          end_time: string | null
          id: string
          organization_id: string | null
          rota_id: string
          shift_type: string
          split_second_end_time: string | null
          split_second_start_time: string | null
          start_time: string
          updated_at: string
          zone_id: string | null
          zone_name_snapshot: string
        }
        Insert: {
          created_at?: string
          day_date: string
          end_kind?: string | null
          end_time?: string | null
          id?: string
          organization_id?: string | null
          rota_id: string
          shift_type: string
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time: string
          updated_at?: string
          zone_id?: string | null
          zone_name_snapshot: string
        }
        Update: {
          created_at?: string
          day_date?: string
          end_kind?: string | null
          end_time?: string | null
          id?: string
          organization_id?: string | null
          rota_id?: string
          shift_type?: string
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time?: string
          updated_at?: string
          zone_id?: string | null
          zone_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_shifts_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_shifts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_template_shifts: {
        Row: {
          created_at: string
          day_offset: number
          end_kind: string | null
          end_time: string | null
          id: string
          shift_type: string
          sort_order: number
          split_second_end_time: string | null
          split_second_start_time: string | null
          start_time: string
          template_id: string
          zone_id: string | null
          zone_name_snapshot: string
        }
        Insert: {
          created_at?: string
          day_offset: number
          end_kind?: string | null
          end_time?: string | null
          id?: string
          shift_type: string
          sort_order?: number
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time: string
          template_id: string
          zone_id?: string | null
          zone_name_snapshot: string
        }
        Update: {
          created_at?: string
          day_offset?: number
          end_kind?: string | null
          end_time?: string | null
          id?: string
          shift_type?: string
          sort_order?: number
          split_second_end_time?: string | null
          split_second_start_time?: string | null
          start_time?: string
          template_id?: string
          zone_id?: string | null
          zone_name_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_template_shifts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "rota_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_template_shifts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "rota_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_templates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas: {
        Row: {
          created_at: string
          created_by: string
          has_unpublished_changes: boolean
          id: string
          location_id: string
          note: string | null
          organization_id: string
          published_at: string | null
          published_by_user_id: string | null
          published_snapshot_version: number
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
          has_unpublished_changes?: boolean
          id?: string
          location_id: string
          note?: string | null
          organization_id: string
          published_at?: string | null
          published_by_user_id?: string | null
          published_snapshot_version?: number
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
          has_unpublished_changes?: boolean
          id?: string
          location_id?: string
          note?: string | null
          organization_id?: string
          published_at?: string | null
          published_by_user_id?: string | null
          published_snapshot_version?: number
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
        Relationships: [
          {
            foreignKeyName: "rotas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_published_by_user_id_fkey"
            columns: ["published_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_source_rota_id_fkey"
            columns: ["source_rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "rota_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          activeOrganizationId: string | null
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          activeOrganizationId?: string | null
          createdAt?: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          activeOrganizationId?: string | null
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swap_requests: {
        Row: {
          accepted_response_id: string | null
          approved_at: string | null
          cancelled_at: string | null
          created_at: string
          cutoff_at: string
          denied_at: string | null
          id: string
          location_id: string
          manager_note: string | null
          manager_user_id: string | null
          request_type: string
          requester_employee_id: string
          requester_user_id: string
          rota_id: string
          source_assignment_id: string
          source_published_shift_id: string
          source_working_shift_id: string | null
          status: string
          target_assignment_id: string | null
          target_employee_id: string | null
          target_published_shift_id: string | null
          target_working_shift_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_response_id?: string | null
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          cutoff_at: string
          denied_at?: string | null
          id?: string
          location_id: string
          manager_note?: string | null
          manager_user_id?: string | null
          request_type: string
          requester_employee_id: string
          requester_user_id: string
          rota_id: string
          source_assignment_id: string
          source_published_shift_id: string
          source_working_shift_id?: string | null
          status: string
          target_assignment_id?: string | null
          target_employee_id?: string | null
          target_published_shift_id?: string | null
          target_working_shift_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_response_id?: string | null
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          cutoff_at?: string
          denied_at?: string | null
          id?: string
          location_id?: string
          manager_note?: string | null
          manager_user_id?: string | null
          request_type?: string
          requester_employee_id?: string
          requester_user_id?: string
          rota_id?: string
          source_assignment_id?: string
          source_published_shift_id?: string
          source_working_shift_id?: string | null
          status?: string
          target_assignment_id?: string | null
          target_employee_id?: string | null
          target_published_shift_id?: string | null
          target_working_shift_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_swap_requests_accepted_response_id_fkey"
            columns: ["accepted_response_id"]
            isOneToOne: false
            referencedRelation: "shift_swap_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_requester_employee_id_fkey"
            columns: ["requester_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_source_assignment_id_fkey"
            columns: ["source_assignment_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_source_published_shift_id_fkey"
            columns: ["source_published_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_source_working_shift_id_fkey"
            columns: ["source_working_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_assignment_id_fkey"
            columns: ["target_assignment_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_employee_id_fkey"
            columns: ["target_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_published_shift_id_fkey"
            columns: ["target_published_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_working_shift_id_fkey"
            columns: ["target_working_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swap_responses: {
        Row: {
          created_at: string
          id: string
          manager_handled_at: string | null
          request_id: string
          responded_at: string | null
          responder_assignment_id: string | null
          responder_employee_id: string
          responder_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_handled_at?: string | null
          request_id: string
          responded_at?: string | null
          responder_assignment_id?: string | null
          responder_employee_id: string
          responder_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_handled_at?: string | null
          request_id?: string
          responded_at?: string | null
          responder_assignment_id?: string | null
          responder_employee_id?: string
          responder_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_swap_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shift_swap_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_responses_responder_assignment_id_fkey"
            columns: ["responder_assignment_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_responses_responder_employee_id_fkey"
            columns: ["responder_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_responses_responder_user_id_fkey"
            columns: ["responder_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_groups: {
        Row: {
          color: string
          created_at: string
          id: string
          is_default: boolean
          location_id: string | null
          name: string
          organization_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          location_id?: string | null
          name: string
          organization_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          location_id?: string | null
          name?: string
          organization_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_groups_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "staff_invite_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invite_links_default_staff_group_id_fkey"
            columns: ["default_staff_group_id"]
            isOneToOne: false
            referencedRelation: "staff_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invite_links_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invite_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          api_version: string | null
          billing_account_id: string | null
          error_message: string | null
          event_type: string
          livemode: boolean
          processed_at: string | null
          processing_status: string
          received_at: string
          stripe_customer_id: string | null
          stripe_event_id: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          api_version?: string | null
          billing_account_id?: string | null
          error_message?: string | null
          event_type: string
          livemode?: boolean
          processed_at?: string | null
          processing_status?: string
          received_at?: string
          stripe_customer_id?: string | null
          stripe_event_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          api_version?: string | null
          billing_account_id?: string | null
          error_message?: string | null
          event_type?: string
          livemode?: boolean
          processed_at?: string | null
          processing_status?: string
          received_at?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription: {
        Row: {
          cancelAt: string | null
          cancelAtPeriodEnd: boolean | null
          canceledAt: string | null
          endedAt: string | null
          id: string
          periodEnd: string | null
          periodStart: string | null
          plan: string
          referenceId: string
          seats: number | null
          status: string
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          trialEnd: string | null
          trialStart: string | null
        }
        Insert: {
          cancelAt?: string | null
          cancelAtPeriodEnd?: boolean | null
          canceledAt?: string | null
          endedAt?: string | null
          id: string
          periodEnd?: string | null
          periodStart?: string | null
          plan: string
          referenceId: string
          seats?: number | null
          status?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          trialEnd?: string | null
          trialStart?: string | null
        }
        Update: {
          cancelAt?: string | null
          cancelAtPeriodEnd?: boolean | null
          canceledAt?: string | null
          endedAt?: string | null
          id?: string
          periodEnd?: string | null
          periodStart?: string | null
          plan?: string
          referenceId?: string
          seats?: number | null
          status?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          trialEnd?: string | null
          trialStart?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          clocked_in_at: string
          clocked_out_at: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          location_id: string
          notes: string | null
          organization_id: string | null
          payable_end_at: string | null
          payable_start_at: string | null
          rota_published_shift_id: string | null
          scheduled_end_at: string | null
          scheduled_start_at: string | null
          shift_segment: string
          source: string
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          clocked_in_at?: string
          clocked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          location_id: string
          notes?: string | null
          organization_id?: string | null
          payable_end_at?: string | null
          payable_start_at?: string | null
          rota_published_shift_id?: string | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          shift_segment?: string
          source: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          clocked_in_at?: string
          clocked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          location_id?: string
          notes?: string | null
          organization_id?: string | null
          payable_end_at?: string | null
          payable_start_at?: string | null
          rota_published_shift_id?: string | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          shift_segment?: string
          source?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_rota_published_shift_id_fkey"
            columns: ["rota_published_shift_id"]
            isOneToOne: false
            referencedRelation: "rota_published_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          dateOfBirth: string | null
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          stripeCustomerId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          dateOfBirth?: string | null
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          stripeCustomerId?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          dateOfBirth?: string | null
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          stripeCustomerId?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      user_onboarding_preferences: {
        Row: {
          created_at: string
          intent: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          intent?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          intent?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      verification: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string
          value: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string
          value: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string
          value?: string
        }
        Relationships: []
      }
      worksites: {
        Row: {
          created_at: string
          id: string
          location_id: string
          name: string
          organization_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          name: string
          organization_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          name?: string
          organization_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worksites_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worksites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_connection_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: string
          location_id: string
          metadata: Json
          source_billing_account_id: string | null
          source_organization_id: string | null
          target_billing_account_id: string | null
          target_organization_id: string | null
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          location_id: string
          metadata?: Json
          source_billing_account_id?: string | null
          source_organization_id?: string | null
          target_billing_account_id?: string | null
          target_organization_id?: string | null
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          location_id?: string
          metadata?: Json
          source_billing_account_id?: string | null
          source_organization_id?: string | null
          target_billing_account_id?: string | null
          target_organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_connection_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_connection_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_connection_events_source_billing_account_id_fkey"
            columns: ["source_billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_connection_events_source_organization_id_fkey"
            columns: ["source_organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_connection_events_target_billing_account_id_fkey"
            columns: ["target_billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_connection_events_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_trials: {
        Row: {
          created_at: string
          id: string
          location_id: string | null
          organization_id: string | null
          scope: string
          status: string
          trial_ends_at: string
          trial_started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          scope: string
          status?: string
          trial_ends_at: string
          trial_started_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          scope?: string
          status?: string
          trial_ends_at?: string
          trial_started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_trials_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_trials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_welcome_dismissals: {
        Row: {
          dismissed_at: string
          id: string
          location_id: string | null
          organization_id: string | null
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          user_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_welcome_dismissals_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_welcome_dismissals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_welcome_dismissals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          location_id: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          location_id: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          location_id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_location_rota: {
        Args: { rota_status: string; target_location_id: string }
        Returns: boolean
      }
      can_read_org_rota: {
        Args: { rota_status: string; target_organization_id: string }
        Returns: boolean
      }
      approve_time_entry_as_recorded: {
        Args: { p_entry_id: string; p_user_id: string }
        Returns: Json
      }
      claim_clock_scan_session: {
        Args: {
          p_cmac_hex: string
          p_encrypted_picc_hex: string
          p_picc_counter: number
          p_tag_public_id: string
          p_user_id: string
        }
        Returns: Json
      }
      current_better_auth_email: { Args: never; Returns: string }
      current_better_auth_session_token: { Args: never; Returns: string }
      current_better_auth_user_id: { Args: never; Returns: string }
      has_location_role: {
        Args: { allowed_roles: string[]; target_location_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: { allowed_roles: string[]; target_organization_id: string }
        Returns: boolean
      }
      is_location_member: {
        Args: { target_location_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      record_employee_clock_from_scan: {
        Args: {
          p_action: string
          p_clocked_in_at: string | null
          p_clocked_out_at: string | null
          p_gps_accuracy_meters: number | null
          p_gps_distance_meters: number | null
          p_gps_latitude: number | null
          p_gps_longitude: number | null
          p_ip_hash: string | null
          p_notes: string | null
          p_payable_end_at: string | null
          p_payable_start_at: string | null
          p_rota_published_shift_id: string | null
          p_scan_session_id: string
          p_scheduled_end_at: string | null
          p_scheduled_start_at: string | null
          p_shift_segment: string
          p_status: string
          p_user_agent: string | null
          p_user_id: string
        }
        Returns: Json
      }
      request_cookie: { Args: { cookie_name: string }; Returns: string }
      request_header: { Args: { header_name: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  billing_private: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
