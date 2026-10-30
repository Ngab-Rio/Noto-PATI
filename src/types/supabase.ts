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
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          status: Database["public"]["Enums"]["report_status"];
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          status?: Database["public"]["Enums"]["report_status"];
          changed_by?: string | null;
          note?: string | null;
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
        | "ditolak";
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
  };
}
