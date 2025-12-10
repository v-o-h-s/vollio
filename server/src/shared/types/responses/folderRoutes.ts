import { ServerSuccessResponse } from "./general";

export interface FolderData {
    id: string;
    user_id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    pdf_count?: number;
}

export type CreateFolderResponse = ServerSuccessResponse<null>


export type UpdateFolderResponse = ServerSuccessResponse<null>

export interface GetAllFoldersResponse {
    success: boolean;
    message: string;
    data: {
        folders: FolderData[];
        totalCount: number;
    };
    error: null;
}

export interface GetFolderByIdResponse {
    success: boolean;
    message: string;
    data: FolderData;
    error: null;
}

export type DeleteFolderResponse = ServerSuccessResponse<null>

