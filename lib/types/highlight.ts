/**
 * Highlight Type Definition
 * Matches the database schema for the highlights table
 */

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

// Main Highlight interface
export interface Highlight {
  id: string;
  type?: HighlightType;
  content?: Content;
  position: ScaledPosition;
}
