import { ServerSuccessResponse } from "./general";

export interface HighlightData {
  id: string;
  userId: string;
  documentId: string;
  type: "text" | "area";
  content?: {
    text?: string;
    image?: string;
  } | null;
  position: {
    boundingRect: {
      height: number;
      pageNumber: number;
      width: number;
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    };
    rects: Array<{
      height: number;
      pageNumber: number;
      width: number;
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    }>;
    usePdfCoordinates?: boolean;
  };
  color?: string | null;
  hasNote: boolean;
  noteId?: string | null;
  noteContent?: string | null;
  tags?: string[] | null;
  style?: "highlight" | "tagged" | "insight" | "note" | "vdoc" | "vnote" | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateHighlightResponse = ServerSuccessResponse<HighlightData>;
export type UpdateHighlightResponse = ServerSuccessResponse<HighlightData>;

export type GetHighlightsResponse = ServerSuccessResponse<HighlightData[]>;

export type GetHighlightByIdResponse = ServerSuccessResponse<HighlightData[]>;

export type DeleteHighlightResponse = ServerSuccessResponse<null>;
