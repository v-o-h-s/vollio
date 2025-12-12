import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFoldersResponse } from "../../../../server/src/shared/types/responses/folderRoutes";
import { ServerErrorResponse } from "../../../../server/src/shared/types/responses/general";

interface TransformedFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  pdf_count?: number;
}

interface FolderQueryResponse {
  folders: TransformedFolder[];
  count: number;
}

export const folderEndpoints = (builder: ApiBuilder) => ({
  getAllFolders: builder.query<FolderQueryResponse, void>({
    query: () => ({
      url: "folders/",
      method: "GET",
    }),
    transformResponse: (response: GetAllFoldersResponse) => {
      if (!response.data) return { folders: [], count: 0 };

      const count = response.data.totalCount;
      const folders = response.data.folders.map(folder => ({
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        pdf_count: folder.pdf_count,
      }));
      return { folders, count };
    },
    transformErrorResponse: (baseQueryReturnValue) => {
      const errorData = baseQueryReturnValue?.data as ServerErrorResponse;
      const errorMessage = errorData?.message || 'An error occurred';
      
      // In development, include full error object for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Folder endpoint error:', {
          message: errorMessage,
          error: errorData?.error,
        });
      }
      
      return errorMessage;
    },
    providesTags: ["Folder"],
  }),

  getFolderById: builder.query<TransformedFolder, string>({
    query: (id) => ({
      url: `folders/${id}`,
      method: "GET",
    }),
    transformResponse: (response: any) => {
      if (!response.data) throw new Error("Folder not found");
      const folder = response.data;
      return {
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        pdf_count: folder.pdf_count,
      };
    },
    providesTags: (_result, _error, id) => [{ type: "Folder", id }],
  }),

  createFolder: builder.mutation<TransformedFolder, { name: string; parentId?: string | null }>({
    query: (data) => ({
      url: "folders/",
      method: "POST",
      body: data,
    }),
    transformResponse: (response: any) => {
      if (!response.data) throw new Error("Failed to create folder");
      const folder = response.data;
      return {
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
      };
    },
    invalidatesTags: [{ type: "Folder", id: "LIST" }],
  }),

  updateFolder: builder.mutation<TransformedFolder, { id: string; name?: string; parentId?: string | null }>({
    query: ({ id, ...data }) => ({
      url: `folders/${id}`,
      method: "PUT",
      body: data,
    }),
    transformResponse: (response: any) => {
      if (!response.data) throw new Error("Failed to update folder");
      const folder = response.data;
      return {
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
      };
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
    ],
  }),

  deleteFolder: builder.mutation<{ success: boolean }, { id: string; cascade?: boolean }>({
    query: ({ id, cascade }) => ({
      url: `folders/${id}`,
      method: "DELETE",
      params: cascade !== undefined ? { cascade } : undefined,
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
      { type: "File", id: "LIST" },
    ],
  }),
});
