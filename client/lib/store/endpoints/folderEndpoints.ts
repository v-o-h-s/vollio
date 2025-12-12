import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFoldersResponse } from "../../../../server/src/shared/types/responses/folderRoutes";
import { ServerErrorResponse } from "../../../../server/src/shared/types/responses/general";
import { Server } from "http";

interface TransformedFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  pdfCount?: number;
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
        userId: folder.user_id,
        name: folder.name,
        parentId: folder.parent_id,
        createdAt: folder.created_at,
        updatedAt: folder.updated_at,
        pdfCount: folder.pdf_count,
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
});
