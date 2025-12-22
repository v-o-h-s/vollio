/**
 * Highlight Type Definition
 * Matches the database schema for the highlights table
 */

import { CreateHighlightDTO } from "@shared/validation/highlightSchemas";

// Allowed highlight types
export type HighlightType = "text" | "area";

// Highlight content stored in JSONB
export interface Content {
  text?: string;
  image?: string;
}

// Rectangle coordinates for positioning
export interface Scaled {
  height: number;
  pageNumber: number;
  width: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

// Scaled position of the highlight stored in JSONB
export interface ScaledPosition {
  boundingRect: Scaled;
  rects: Scaled[];
  usePdfCoordinates?: boolean;
}

// Main Highlight interface (not used in the code , it is from react-pdf-highlighter-extended)
export interface Highlight {
  id: string;
  type?: HighlightType;
  content?: Content;
  position: ScaledPosition;
}
///
// real work start from here
///

// Extend Highlight type to include color
export interface MyHighlight extends Highlight {
  tags?: string[];
  style?: "highlight" | "tagged";
  noteId?: string;
  color?: string;
}

// Main Highlight interface matching database schema
export interface SupabaseHighlightResponse {
  id: string;
  pdf_id: string;
  user_id: string;
  type: HighlightType;
  content: Content;
  position: ScaledPosition;
  color?: string;
  has_note: boolean;
  note_id?: string | null;
  tags?: string[] | null;
  style?: "highlight" | "tagged" | null;
  created_at: string;
  updated_at: string;
}

export interface HighlightwithDetails extends CreateHighlightDTO {
  createdAt: string;
  updatedAt: string;
}

export const mapSupabaseHighlightResponseToHighlight = (
  highlight: SupabaseHighlightResponse
): HighlightwithDetails => {
  return {
    id: highlight.id,
    pdfId: highlight.pdf_id,
    type: highlight.type,
    content: highlight.content,
    position: highlight.position,
    color: highlight.color,
    hasNote: highlight.has_note,
    noteId: highlight.note_id,
    tags: highlight.tags || undefined,
    style: highlight.style || undefined,
    createdAt: highlight.created_at,
    updatedAt: highlight.updated_at,
  };
};

// supabase response
export interface HighlightServerResponse {
  success: boolean;
  status: number;
  data: HighlightwithDetails;
  error: string | null;
}
