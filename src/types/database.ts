/**
 * Tipe database — ditulis manual mengikuti supabase/migrations/*.sql.
 * Setelah proyek Supabase aktif, ganti dengan hasil `supabase gen types typescript`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AttendanceStatus = "hadir" | "tidak_hadir";
export type ModerationStatus = "visible" | "hidden";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          max_pax: number;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          display_name: string;
          max_pax?: number;
          phone?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["guests"]["Insert"]>;
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          guest_id: string;
          name: string;
          attendance: AttendanceStatus;
          pax: number | null;
          message: string | null;
          message_raw: string | null;
          is_flagged: boolean;
          status: ModerationStatus;
          ip_hash: string;
          submit_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never; // hanya lewat RPC submit_rsvp
        Update: { status?: ModerationStatus };
        Relationships: [
          { foreignKeyName: "rsvps_guest_id_fkey"; columns: ["guest_id"]; isOneToOne: true; referencedRelation: "guests"; referencedColumns: ["id"] },
        ];
      };
      wishes: {
        Row: { id: string; name: string; attendance: AttendanceStatus; message: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      blocked_words: {
        Row: { word: string; created_at: string };
        Insert: { word: string };
        Update: { word?: string };
        Relationships: [];
      };
    };
    Views: {
      rsvp_summary: {
        Row: {
          total_hadir: number;
          total_tidak_hadir: number;
          total_pax: number;
          total_undangan: number;
          total_tersaring: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      submit_rsvp: {
        Args: {
          p_slug: string;
          p_name: string;
          p_attendance: AttendanceStatus;
          p_pax: number | null;
          p_message: string | null;
          p_ip_hash: string;
          p_limit?: number;
          p_window?: string;
        };
        Returns: { rsvp_id: string; is_update: boolean; is_flagged: boolean }[];
      };
      get_guest: {
        Args: { p_slug: string };
        Returns: {
          slug: string;
          display_name: string;
          max_pax: number;
          rsvp_name: string | null;
          rsvp_attendance: AttendanceStatus | null;
          rsvp_pax: number | null;
          rsvp_message: string | null;
        }[];
      };
    };
    Enums: { attendance_status: AttendanceStatus; moderation_status: ModerationStatus };
    CompositeTypes: Record<string, never>;
  };
};
