/**
 * Supabase Database Types
 * Generated from database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          ticket_number: string;
          reporter_id: string;
          category: Database["public"]["Enums"]["report_category"];
          title: string;
          description: string;
          detail_location: string;
          status: Database["public"]["Enums"]["report_status"];
          latitude: number | null;
          longitude: number | null;
          location_accuracy_m: number | null;
          location_captured_at: string | null;
          merged_into_report_id: string | null;
          verification_due_at: string | null;
          handling_due_at: string | null;
          verified_at: string | null;
          client_request_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number?: string;
          reporter_id: string;
          category: Database["public"]["Enums"]["report_category"];
          title: string;
          description: string;
          detail_location: string;
          status?: Database["public"]["Enums"]["report_status"];
          latitude?: number | null;
          longitude?: number | null;
          location_accuracy_m?: number | null;
          location_captured_at?: string | null;
          merged_into_report_id?: string | null;
          verification_due_at?: string | null;
          handling_due_at?: string | null;
          verified_at?: string | null;
          client_request_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          reporter_id?: string;
          category?: Database["public"]["Enums"]["report_category"];
          title?: string;
          description?: string;
          detail_location?: string;
          status?: Database["public"]["Enums"]["report_status"];
          latitude?: number | null;
          longitude?: number | null;
          location_accuracy_m?: number | null;
          location_captured_at?: string | null;
          merged_into_report_id?: string | null;
          verification_due_at?: string | null;
          handling_due_at?: string | null;
          verified_at?: string | null;
          client_request_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_photos: {
        Row: {
          id: string;
          report_id: string;
          storage_path: string;
          mime_type: string;
          file_size_bytes: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          storage_path: string;
          mime_type: string;
          file_size_bytes: number;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          storage_path?: string;
          mime_type?: string;
          file_size_bytes?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      report_status_history: {
        Row: {
          id: string;
          report_id: string;
          status: Database["public"]["Enums"]["report_status"];
          changed_by: string | null;
          note: string | null;
          proof_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          status: Database["public"]["Enums"]["report_status"];
          changed_by?: string | null;
          note?: string | null;
          proof_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          status?: Database["public"]["Enums"]["report_status"];
          changed_by?: string | null;
          note?: string | null;
          proof_image_url?: string | null;
          created_at?: string;
        };
      };
      report_merge_logs: {
        Row: {
          id: string;
          parent_report_id: string;
          duplicate_report_id: string;
          distance_meters: number;
          time_diff_seconds: number;
          rule_version: string;
          decision: string;
          parameters: Json;
          created_at: string;
        };
        sla_policies: {
          Row: {
            id: string;
            name: string;
            verification_hours: number;
            handling_days: number;
            is_active: boolean;
            created_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            verification_hours: number;
            handling_days: number;
            is_active?: boolean;
            created_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            verification_hours?: number;
            handling_days?: number;
            is_active?: boolean;
            created_at?: string;
          };
        };
        report_status_transitions: {
          Row: {
            from_status: Database["public"]["Enums"]["report_status"];
            to_status: Database["public"]["Enums"]["report_status"];
          };
          Insert: {
            from_status: Database["public"]["Enums"]["report_status"];
            to_status: Database["public"]["Enums"]["report_status"];
          };
          Update: {
            from_status?: Database["public"]["Enums"]["report_status"];
            to_status?: Database["public"]["Enums"]["report_status"];
          };
        };
        Insert: {
          id?: string;
          parent_report_id: string;
          duplicate_report_id: string;
          distance_meters: number;
          time_diff_seconds: number;
          rule_version?: string;
          decision?: string;
          parameters?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_report_id?: string;
          duplicate_report_id?: string;
          distance_meters?: number;
          time_diff_seconds?: number;
          rule_version?: string;
          decision?: string;
          parameters?: Json;
          created_at?: string;
        };
      };
    };
    Enums: {
      report_status:
        | "diterima"
        | "diverifikasi"
        | "diproses"
        | "selesai"
        | "ditolak"
        | "digabung";
      report_category:
        | "jalan"
        | "lampu"
        | "drainase"
        | "jembatan"
        | "tanggul"
        | "trotoar"
        | "rambu"
        | "lainnya";
    };
    Functions: {
      admin_transition_report: {
        Args: {
          p_report_id: string;
          p_to_status: Database["public"]["Enums"]["report_status"];
          p_note?: string | null;
          p_merged_into_report_id?: string | null;
          p_proof_image_path?: string | null;
        };
        Returns: {
          report_id: string;
          status: Database["public"]["Enums"]["report_status"];
          changed_at: string;
          verification_due_at: string | null;
          handling_due_at: string | null;
        }[];
      };
    };
  };
}
