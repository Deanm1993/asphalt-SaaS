export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [_ in never]: never
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
  app: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          abn: string
          acn: string | null
          gst_registered: boolean
          address_line1: string
          address_line2: string | null
          suburb: string
          state: string
          postcode: string
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          primary_color: string | null
          active: boolean
          subscription_tier: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          abn: string
          acn?: string | null
          gst_registered?: boolean
          address_line1: string
          address_line2?: string | null
          suburb: string
          state: string
          postcode: string
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          primary_color?: string | null
          active?: boolean
          subscription_tier?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          abn?: string
          acn?: string | null
          gst_registered?: boolean
          address_line1?: string
          address_line2?: string | null
          suburb?: string
          state?: string
          postcode?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          primary_color?: string | null
          active?: boolean
          subscription_tier?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: Database['app']['Enums']['user_role']
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: Database['app']['Enums']['user_role']
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: Database['app']['Enums']['user_role']
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          business_name: string
          trading_name: string | null
          abn: string | null
          acn: string | null
          website: string | null
          industry: string | null
          address_line1: string | null
          address_line2: string | null
          suburb: string | null
          state: string | null
          postcode: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          business_name: string
          trading_name?: string | null
          abn?: string | null
          acn?: string | null
          website?: string | null
          industry?: string | null
          address_line1?: string | null
          address_line2?: string | null
          suburb?: string | null
          state?: string | null
          postcode?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          business_name?: string
          trading_name?: string | null
          abn?: string | null
          acn?: string | null
          website?: string | null
          industry?: string | null
          address_line1?: string | null
          address_line2?: string | null
          suburb?: string | null
          state?: string | null
          postcode?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_contacts: {
        Row: {
          id: string
          customer_id: string
          tenant_id: string
          first_name: string
          last_name: string
          position: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          is_primary: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          tenant_id: string
          first_name: string
          last_name: string
          position?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string
          position?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_sites: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string | null
          name: string
          address_line1: string
          address_line2: string | null
          suburb: string
          state: string
          postcode: string
          latitude: number | null
          longitude: number | null
          site_contact_name: string | null
          site_contact_phone: string | null
          access_notes: string | null
          hazard_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          customer_id?: string | null
          name: string
          address_line1: string
          address_line2?: string | null
          suburb: string
          state: string
          postcode: string
          latitude?: number | null
          longitude?: number | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          access_notes?: string | null
          hazard_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          customer_id?: string | null
          name?: string
          address_line1?: string
          address_line2?: string | null
          suburb?: string
          state?: string
          postcode?: string
          latitude?: number | null
          longitude?: number | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          access_notes?: string | null
          hazard_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_sites_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_sites_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          id: string
          tenant_id: string
          job_number: string
          customer_id: string | null
          site_id: string | null
          job_type: Database['app']['Enums']['job_type']
          job_status: Database['app']['Enums']['job_status']
          title: string
          description: string | null
          site_area_sqm: number | null
          total_tonnage: number | null
          waste_factor: number | null
          purchase_order_number: string | null
          quote_number: string | null
          quote_date: string | null
          quote_expiry_date: string | null
          quote_total_ex_gst: number | null
          quote_gst_amount: number | null
          quote_total_inc_gst: number | null
          estimated_duration_hours: number | null
          is_night_shift: boolean | null
          truck_access: Database['app']['Enums']['truck_type'] | null
          min_temperature_c: number | null
          quoted_by: string | null
          approved_by_customer_name: string | null
          approved_date: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          job_number: string
          customer_id?: string | null
          site_id?: string | null
          job_type: Database['app']['Enums']['job_type']
          job_status?: Database['app']['Enums']['job_status']
          title: string
          description?: string | null
          site_area_sqm?: number | null
          total_tonnage?: number | null
          waste_factor?: number | null
          purchase_order_number?: string | null
          quote_number?: string | null
          quote_date?: string | null
          quote_expiry_date?: string | null
          quote_total_ex_gst?: number | null
          quote_gst_amount?: number | null
          quote_total_inc_gst?: number | null
          estimated_duration_hours?: number | null
          is_night_shift?: boolean | null
          truck_access?: Database['app']['Enums']['truck_type'] | null
          min_temperature_c?: number | null
          quoted_by?: string | null
          approved_by_customer_name?: string | null
          approved_date?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          job_number?: string
          customer_id?: string | null
          site_id?: string | null
          job_type?: Database['app']['Enums']['job_type']
          job_status?: Database['app']['Enums']['job_status']
          title?: string
          description?: string | null
          site_area_sqm?: number | null
          total_tonnage?: number | null
          waste_factor?: number | null
          purchase_order_number?: string | null
          quote_number?: string | null
          quote_date?: string | null
          quote_expiry_date?: string | null
          quote_total_ex_gst?: number | null
          quote_gst_amount?: number | null
          quote_total_inc_gst?: number | null
          estimated_duration_hours?: number | null
          is_night_shift?: boolean | null
          truck_access?: Database['app']['Enums']['truck_type'] | null
          min_temperature_c?: number | null
          quoted_by?: string | null
          approved_by_customer_name?: string | null
          approved_date?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_quoted_by_fkey"
            columns: ["quoted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_items: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          name: string
          area_sqm: number
          depth_mm: number
          asphalt_mix_type: Database['app']['Enums']['asphalt_mix_type']
          specification: Database['app']['Enums']['specification_standard'] | null
          custom_specification: string | null
          tonnage: number | null
          unit_price_per_tonne: number | null
          total_price_ex_gst: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          name: string
          area_sqm: number
          depth_mm: number
          asphalt_mix_type: Database['app']['Enums']['asphalt_mix_type']
          specification?: Database['app']['Enums']['specification_standard'] | null
          custom_specification?: string | null
          tonnage?: number | null
          unit_price_per_tonne?: number | null
          total_price_ex_gst?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          name?: string
          area_sqm?: number
          depth_mm?: number
          asphalt_mix_type?: Database['app']['Enums']['asphalt_mix_type']
          specification?: Database['app']['Enums']['specification_standard'] | null
          custom_specification?: string | null
          tonnage?: number | null
          unit_price_per_tonne?: number | null
          total_price_ex_gst?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_items_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_items_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_hazards: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          has_overhead_powerlines: boolean | null
          has_underground_services: boolean | null
          has_confined_spaces: boolean | null
          has_traffic_management: boolean | null
          has_pedestrian_management: boolean | null
          has_noise_restrictions: boolean | null
          has_environmental_concerns: boolean | null
          has_contaminated_materials: boolean | null
          has_tight_access: boolean | null
          has_structural_issues: boolean | null
          other_hazards: string | null
          mitigation_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          has_overhead_powerlines?: boolean | null
          has_underground_services?: boolean | null
          has_confined_spaces?: boolean | null
          has_traffic_management?: boolean | null
          has_pedestrian_management?: boolean | null
          has_noise_restrictions?: boolean | null
          has_environmental_concerns?: boolean | null
          has_contaminated_materials?: boolean | null
          has_tight_access?: boolean | null
          has_structural_issues?: boolean | null
          other_hazards?: string | null
          mitigation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          has_overhead_powerlines?: boolean | null
          has_underground_services?: boolean | null
          has_confined_spaces?: boolean | null
          has_traffic_management?: boolean | null
          has_pedestrian_management?: boolean | null
          has_noise_restrictions?: boolean | null
          has_environmental_concerns?: boolean | null
          has_contaminated_materials?: boolean | null
          has_tight_access?: boolean | null
          has_structural_issues?: boolean | null
          other_hazards?: string | null
          mitigation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_hazards_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_hazards_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_equipment: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          needs_paver: boolean | null
          needs_roller_steel: boolean | null
          needs_roller_pneumatic: boolean | null
          needs_bobcat: boolean | null
          needs_excavator: boolean | null
          needs_milling_machine: boolean | null
          needs_sweeper: boolean | null
          needs_water_cart: boolean | null
          needs_trucks: number | null
          needs_traffic_control: boolean | null
          needs_line_marking: boolean | null
          other_equipment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          needs_paver?: boolean | null
          needs_roller_steel?: boolean | null
          needs_roller_pneumatic?: boolean | null
          needs_bobcat?: boolean | null
          needs_excavator?: boolean | null
          needs_milling_machine?: boolean | null
          needs_sweeper?: boolean | null
          needs_water_cart?: boolean | null
          needs_trucks?: number | null
          needs_traffic_control?: boolean | null
          needs_line_marking?: boolean | null
          other_equipment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          needs_paver?: boolean | null
          needs_roller_steel?: boolean | null
          needs_roller_pneumatic?: boolean | null
          needs_bobcat?: boolean | null
          needs_excavator?: boolean | null
          needs_milling_machine?: boolean | null
          needs_sweeper?: boolean | null
          needs_water_cart?: boolean | null
          needs_trucks?: number | null
          needs_traffic_control?: boolean | null
          needs_line_marking?: boolean | null
          other_equipment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_equipment_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_equipment_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_materials: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          asphalt_supplier: string | null
          asphalt_plant_location: string | null
          distance_to_site_km: number | null
          tip_site_name: string | null
          tip_site_location: string | null
          distance_to_tip_km: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          asphalt_supplier?: string | null
          asphalt_plant_location?: string | null
          distance_to_site_km?: number | null
          tip_site_name?: string | null
          tip_site_location?: string | null
          distance_to_tip_km?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          asphalt_supplier?: string | null
          asphalt_plant_location?: string | null
          distance_to_site_km?: number | null
          tip_site_name?: string | null
          tip_site_location?: string | null
          distance_to_tip_km?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_materials_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      job_attachments: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          description: string | null
          is_before_photo: boolean | null
          is_after_photo: boolean | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          description?: string | null
          is_before_photo?: boolean | null
          is_after_photo?: boolean | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_path?: string
          description?: string | null
          is_before_photo?: boolean | null
          is_after_photo?: boolean | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      job_geometry: {
        Row: {
          id: string
          job_id: string
          tenant_id: string
          geom: unknown
          area_calculated_sqm: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tenant_id: string
          geom: unknown
          area_calculated_sqm?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          tenant_id?: string
          geom?: unknown
          area_calculated_sqm?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_geometry_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_geometry_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      crews: {
        Row: {
          id: string
          tenant_id: string
          name: string
          supervisor_id: string | null
          color: string | null
          max_daily_tonnage: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          supervisor_id?: string | null
          color?: string | null
          max_daily_tonnage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          supervisor_id?: string | null
          color?: string | null
          max_daily_tonnage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crews_supervisor_id_fkey"
            columns: ["supervisor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      crew_members: {
        Row: {
          id: string
          crew_id: string
          tenant_id: string
          user_id: string
          is_supervisor: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          crew_id: string
          tenant_id: string
          user_id: string
          is_supervisor?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          crew_id?: string
          tenant_id?: string
          user_id?: string
          is_supervisor?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      schedules: {
        Row: {
          id: string
          tenant_id: string
          job_id: string
          crew_id: string | null
          title: string
          start_time: string
          end_time: string
          is_all_day: boolean | null
          status: string | null
          notes: string | null
          color: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          job_id: string
          crew_id?: string | null
          title: string
          start_time: string
          end_time: string
          is_all_day?: boolean | null
          status?: string | null
          notes?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          job_id?: string
          crew_id?: string | null
          title?: string
          start_time?: string
          end_time?: string
          is_all_day?: boolean | null
          status?: string | null
          notes?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_crew_id_fkey"
            columns: ["crew_id"]
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      weather_forecasts: {
        Row: {
          id: string
          tenant_id: string
          site_id: string | null
          forecast_date: string
          min_temp_c: number | null
          max_temp_c: number | null
          chance_of_rain: number | null
          rainfall_mm: number | null
          weather_condition: string | null
          wind_speed_kmh: number | null
          wind_direction: string | null
          is_suitable_for_paving: boolean | null
          forecast_retrieved_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          site_id?: string | null
          forecast_date: string
          min_temp_c?: number | null
          max_temp_c?: number | null
          chance_of_rain?: number | null
          rainfall_mm?: number | null
          weather_condition?: string | null
          wind_speed_kmh?: number | null
          wind_direction?: string | null
          is_suitable_for_paving?: boolean | null
          forecast_retrieved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          site_id?: string | null
          forecast_date?: string
          min_temp_c?: number | null
          max_temp_c?: number | null
          chance_of_rain?: number | null
          rainfall_mm?: number | null
          weather_condition?: string | null
          wind_speed_kmh?: number | null
          wind_direction?: string | null
          is_suitable_for_paving?: boolean | null
          forecast_retrieved_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weather_forecasts_site_id_fkey"
            columns: ["site_id"]
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_forecasts_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      safety_documents: {
        Row: {
          id: string
          tenant_id: string
          job_id: string | null
          document_type: string
          title: string
          file_path: string
          version: string
          approved_by: string | null
          approved_at: string | null
          expiry_date: string | null
          is_template: boolean | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          job_id?: string | null
          document_type: string
          title: string
          file_path: string
          version: string
          approved_by?: string | null
          approved_at?: string | null
          expiry_date?: string | null
          is_template?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          job_id?: string | null
          document_type?: string
          title?: string
          file_path?: string
          version?: string
          approved_by?: string | null
          approved_at?: string | null
          expiry_date?: string | null
          is_template?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_documents_approved_by_fkey"
            columns: ["approved_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_documents_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_documents_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      quality_records: {
        Row: {
          id: string
          tenant_id: string
          job_id: string
          test_type: string
          location_description: string | null
          test_result: string | null
          is_compliant: boolean | null
          notes: string | null
          tested_by: string | null
          test_date: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          job_id: string
          test_type: string
          location_description?: string | null
          test_result?: string | null
          is_compliant?: boolean | null
          notes?: string | null
          tested_by?: string | null
          test_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          job_id?: string
          test_type?: string
          location_description?: string | null
          test_result?: string | null
          is_compliant?: boolean | null
          notes?: string | null
          tested_by?: string | null
          test_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_records_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_records_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_records_tested_by_fkey"
            columns: ["tested_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cor_records: {
        Row: {
          id: string
          tenant_id: string
          job_id: string
          driver_name: string
          vehicle_registration: string
          load_weight_tonnes: number
          departure_time: string
          arrival_time: string | null
          is_overloaded: boolean | null
          is_fatigue_compliant: boolean | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          job_id: string
          driver_name: string
          vehicle_registration: string
          load_weight_tonnes: number
          departure_time: string
          arrival_time?: string | null
          is_overloaded?: boolean | null
          is_fatigue_compliant?: boolean | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          job_id?: string
          driver_name?: string
          vehicle_registration?: string
          load_weight_tonnes?: number
          departure_time?: string
          arrival_time?: string | null
          is_overloaded?: boolean | null
          is_fatigue_compliant?: boolean | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cor_records_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cor_records_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cor_records_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_tonnage: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_job_quote_totals: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_job_total_tonnage: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      job_type: "mill_and_fill" | "resheet" | "overlay" | "patching" | "full_reconstruction"
      job_status: "draft" | "quoted" | "approved" | "scheduled" | "in_progress" | "completed" | "invoiced" | "cancelled"
      asphalt_mix_type: "ac10" | "ac14" | "ac20" | "sma" | "open_graded" | "warm_mix" | "cold_mix" | "recycled" | "custom"
      specification_standard: "rms_r116" | "rms_r117" | "rms_r118" | "vicroads_section_407" | "vicroads_section_408" | "mrwa_specification_504" | "tmr_mrts30" | "dpti_part_228" | "local_council" | "custom"
      truck_type: "truck_and_dog" | "semi_trailer" | "rigid_truck" | "body_truck" | "any"
      user_role: "owner" | "admin" | "estimator" | "supervisor" | "operator" | "crew" | "readonly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['app']['Tables']> = Database['app']['Tables'][T]['Row']
export type Enums<T extends keyof Database['app']['Enums']> = Database['app']['Enums'][T]
export type TablesInsert<T extends keyof Database['app']['Tables']> = Database['app']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['app']['Tables']> = Database['app']['Tables'][T]['Update']

// Helper types for Supabase functions
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = { error: { message: string; details: string; hint: string; code: string } }
