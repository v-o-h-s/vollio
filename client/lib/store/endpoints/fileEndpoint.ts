import { ApiBuilder } from "./types";
import {
  AddFileResponse,
  GetFileResponse,
  AddFileFromGoogleDriveRequest,
} from "@/lib/types/server-respones/fileRouteResponses";

export const fileEndpoints = (builder: ApiBuilder) => ({
  // 1. Add File from Google Drive
  addFileFromGoogleDrive: builder.mutation<AddFileResponse, AddFileFromGoogleDriveRequest>({
    query: (body) => ({
      url: "v1/files",
      method: "POST",
      body,
    }),
  }),

  // 2. Get File from Google Drive (returns Blob for PDF viewing)
  getFileFromGoogleDrive: builder.query<Blob, string>({
    queryFn: async (fileId, _queryApi, _extraOptions, baseQuery) => {
      try {
        const response = await fetch(`/api/v1/files/classroom/${fileId}`, {
          method: "GET",
        });
        
        if (!response.ok) {
          return { error: { status: response.status, data: `Failed to fetch file: ${response.statusText}` } };
        }
        
        const blob = await response.blob();
        return { data: blob };
      } catch (error) {
        return { 
          error: { 
            status: 500, 
            data: error instanceof Error ? error.message : "Unknown error fetching file" 
          } 
        };
      }
    },
  }),
});
