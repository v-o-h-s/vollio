import { ServerSuccessResponse } from "./general";

export interface FolderData {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  document_count?: number;
}

export type CreateFolderResponse = ServerSuccessResponse<FolderData>;

export type UpdateFolderResponse = ServerSuccessResponse<FolderData>;

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

export type DeleteFolderResponse = ServerSuccessResponse<null>;
