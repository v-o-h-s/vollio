interface Scaled {
  height: number;
  pageNumber: number;
  width: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface ScaledPosition {
  boundingRect: Scaled;
  rects: Scaled[];
  useDocumentCoordinates?: boolean;
}

export interface HighlightContent {
  text?: string;
  image?: string;
}

export interface CreateHighlightDTO {
  id: string;
  documentId: string;
  type?: "text" | "area";
  content?: HighlightContent;
  position: ScaledPosition;
  color?: string;
  hasNote?: boolean;
  noteId?: string | null;
  tags?: string[];
  style?: "highlight" | "tagged";
}

export interface UpdateHighlightDTO {
  color?: string;
  content?: HighlightContent;
  hasNote?: boolean;
  noteId?: string | null;
  position?: ScaledPosition;
  type?: "text" | "area";
  documentId?: string;
  tags?: string[];
  style?: "highlight" | "tagged";
}

export interface HighlightIdParams {
  id: string;
}

export interface GetHighlightsQuery {
  documentId?: string;
}

export interface HighlightDocumentIdParams {
  documentId: string;
}
