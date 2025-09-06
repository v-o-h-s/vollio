/**
 * Supabase Database Types
 * Generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      pdfs: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_size: number;
          storage_path: string;
          mime_type: string;
          uploaded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_size: number;
          storage_path: string;
          mime_type?: string;
          uploaded_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_size?: number;
          storage_path?: string;
          mime_type?: string;
          uploaded_at?: string;
          updated_at?: string;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          pdf_id: string;
          activity_type: string;
          accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pdf_id: string;
          activity_type?: string;
          accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pdf_id?: string;
          activity_type?: string;
          accessed_at?: string;
        };
      };
      annotations: {
        Row: {
          id: string;
          user_id: string;
          pdf_id: string;
          note_id: string;
          page_number: number;
          selected_text: string;
          content: string;
          coordinates: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pdf_id: string;
          note_id: string;
          page_number: number;
          selected_text: string;
          content: string;
          coordinates: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pdf_id?: string;
          note_id?: string;
          page_number?: number;
          selected_text?: string;
          content?: string;
          coordinates?: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: any; // TipTap JSONContent
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          content?: any; // TipTap JSONContent
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: any; // TipTap JSONContent
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      activity_type: "view" | "upload" | "delete";
    };
  };
}

// Helper types for easier usage
export type PDFRow = Database["public"]["Tables"]["pdfs"]["Row"];
export type PDFInsert = Database["public"]["Tables"]["pdfs"]["Insert"];
export type PDFUpdate = Database["public"]["Tables"]["pdfs"]["Update"];

export type UserActivityRow =
  Database["public"]["Tables"]["user_activity"]["Row"];
export type UserActivityInsert =
  Database["public"]["Tables"]["user_activity"]["Insert"];
export type UserActivityUpdate =
  Database["public"]["Tables"]["user_activity"]["Update"];

export type AnnotationRow = Database["public"]["Tables"]["annotations"]["Row"];
export type AnnotationInsert =
  Database["public"]["Tables"]["annotations"]["Insert"];
export type AnnotationUpdate =
  Database["public"]["Tables"]["annotations"]["Update"];

export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];

export type ActivityType = Database["public"]["Enums"]["activity_type"];
