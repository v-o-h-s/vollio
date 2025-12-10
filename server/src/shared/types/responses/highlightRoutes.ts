import { ServerSuccessResponse } from "./general";

export interface HighlightData {
    id: string;
    user_id: string;
    pdf_id: string;
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
    has_note: boolean;
    note_id?: string | null;
    tags?: string[] | null;
    style?: "highlight" | "tagged" | null;
    created_at: string;
    updated_at: string;
}

export type CreateHighlightResponse = ServerSuccessResponse<null>

export type UpdateHighlightResponse = ServerSuccessResponse<null>

export type GetHighlightsResponse = ServerSuccessResponse<HighlightData[]>;

export type GetHighlightByIdResponse = ServerSuccessResponse<HighlightData[]>;

export type DeleteHighlightResponse = ServerSuccessResponse<null>;

