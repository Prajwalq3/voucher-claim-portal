 export type Json =
   | string
   | number
   | boolean
   | null
   | { [key: string]: Json | undefined }
   | Json[]
 
 export type Database = {
   public: {
     Tables: {
       teachers: {
         Row: {
           id: string
           user_id: string | null
           sic_number: string
           faculty_email: string
           name: string
           phone_number: string
           visit_order: number | null
           created_at: string
         }
         Insert: {
           id?: string
           user_id?: string | null
           sic_number: string
           faculty_email: string
           name: string
           phone_number: string
           visit_order?: number | null
           created_at?: string
         }
         Update: {
           id?: string
           user_id?: string | null
           sic_number?: string
           faculty_email?: string
           name?: string
           phone_number?: string
           visit_order?: number | null
           created_at?: string
         }
       }
       events: {
         Row: {
           id: string
           name: string
           description: string | null
           event_date: string
           total_seats: number
           created_at: string
         }
         Insert: {
           id?: string
           name: string
           description?: string | null
           event_date: string
           total_seats?: number
           created_at?: string
         }
         Update: {
           id?: string
           name?: string
           description?: string | null
           event_date?: string
           total_seats?: number
           created_at?: string
         }
       }
       seat_bookings: {
         Row: {
           id: string
           teacher_id: string
           event_id: string
           seat_number: number
           booked_at: string
         }
         Insert: {
           id?: string
           teacher_id: string
           event_id: string
           seat_number: number
           booked_at?: string
         }
         Update: {
           id?: string
           teacher_id?: string
           event_id?: string
           seat_number?: number
           booked_at?: string
         }
       }
       voucher_claims: {
         Row: {
           id: string
           teacher_id: string
           voucher_type: string
           claimed_at: string
         }
         Insert: {
           id?: string
           teacher_id: string
           voucher_type: string
           claimed_at?: string
         }
         Update: {
           id?: string
           teacher_id?: string
           voucher_type?: string
           claimed_at?: string
         }
       }
     }
     Views: {
       [_ in never]: never
     }
     Functions: {
       get_teacher_id: {
         Args: Record<PropertyKey, never>
         Returns: string
       }
     }
     Enums: {
       [_ in never]: never
     }
   }
 }