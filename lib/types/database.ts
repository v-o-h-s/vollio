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
          folder_id: string | null;
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
          folder_id?: string | null;
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
          folder_id?: string | null;
          uploaded_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          parent_id?: string | null;
          created_at?: string;
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
      highlights: {
        Row: {
          id: string;
          user_id: string;
          pdf_id: string;
          note_id: string | null;
          content: string;
          title: string | null;
          color: string;
          opacity: number;
          page_number: number;
          type: "quick" | "comment" | "note";
          textbounds: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pdf_id: string;
          note_id?: string | null;
          content: string;
          title?: string | null;
          color?: string;
          opacity?: number;
          page_number: number;
          type?: "quick" | "comment" | "note";
          textbounds: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
          }>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pdf_id?: string;
          note_id?: string | null;
          content?: string;
          title?: string | null;
          color?: string;
          opacity?: number;
          page_number?: number;
          type?: "quick" | "comment" | "note";
          textbounds?: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
          }>;
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

      document_chunks: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          embedding: number[];
          token_count: number;
          page_number: number;
          section_title: string | null;
          metadata: any; // ChunkMetadata JSON
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          embedding: number[];
          token_count: number;
          page_number: number;
          section_title?: string | null;
          metadata?: any; // ChunkMetadata JSON
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          chunk_index?: number;
          content?: string;
          embedding?: number[];
          token_count?: number;
          page_number?: number;
          section_title?: string | null;
          metadata?: any; // ChunkMetadata JSON
          created_at?: string;
          updated_at?: string;
        };
      };
      document_processing_status: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          status: string;
          total_chunks: number;
          processed_chunks: number;
          extraction_method: string | null;
          error_message: string | null;
          processing_started_at: string | null;
          processing_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          status: string;
          total_chunks?: number;
          processed_chunks?: number;
          extraction_method?: string | null;
          error_message?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          status?: string;
          total_chunks?: number;
          processed_chunks?: number;
          extraction_method?: string | null;
          error_message?: string | null;
          processing_started_at?: string | null;
          processing_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
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

      generation_method: "simple" | "rag";
      processing_status: "pending" | "processing" | "completed" | "failed";
      extraction_method: "pdfjs" | "ocr";
      highlight_type: "quick" | "comment" | "note";
    };
  };
}

// Helper types for easier usage
export type PDFRow = Database["public"]["Tables"]["pdfs"]["Row"];
export type PDFInsert = Database["public"]["Tables"]["pdfs"]["Insert"];
export type PDFUpdate = Database["public"]["Tables"]["pdfs"]["Update"];

export type FolderRow = Database["public"]["Tables"]["folders"]["Row"];
export type FolderInsert = Database["public"]["Tables"]["folders"]["Insert"];
export type FolderUpdate = Database["public"]["Tables"]["folders"]["Update"];

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

export type HighlightRow = Database["public"]["Tables"]["highlights"]["Row"];
export type HighlightInsert =
  Database["public"]["Tables"]["highlights"]["Insert"];
export type HighlightUpdate =
  Database["public"]["Tables"]["highlights"]["Update"];

export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];

export type DocumentChunkRow =
  Database["public"]["Tables"]["document_chunks"]["Row"];
export type DocumentChunkInsert =
  Database["public"]["Tables"]["document_chunks"]["Insert"];
export type DocumentChunkUpdate =
  Database["public"]["Tables"]["document_chunks"]["Update"];

export type DocumentProcessingStatusRow =
  Database["public"]["Tables"]["document_processing_status"]["Row"];
export type DocumentProcessingStatusInsert =
  Database["public"]["Tables"]["document_processing_status"]["Insert"];
export type DocumentProcessingStatusUpdate =
  Database["public"]["Tables"]["document_processing_status"]["Update"];

export type ActivityType = Database["public"]["Enums"]["activity_type"];

export type GenerationMethodEnum =
  Database["public"]["Enums"]["generation_method"];
export type ProcessingStatusEnum =
  Database["public"]["Enums"]["processing_status"];
export type ExtractionMethodEnum =
  Database["public"]["Enums"]["extraction_method"];
export type HighlightTypeEnum = Database["public"]["Enums"]["highlight_type"];
