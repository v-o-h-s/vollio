import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFilesResponse } from "../../../../server/src/shared/types/responses/fileRoutes";
import { ServerErrorResponse } from "../../../../server/src/shared/types/responses/general";

interface TransformedFile {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export const fileEndpoints = (builder: ApiBuilder) => ({
  getAllFiles: builder.query<TransformedFile[], void>({
    query: () => ({
      url: "files/",
      method: "GET",
    }),
    transformResponse: (response: GetAllFilesResponse) => {
      if (!response.data) return [];

      return response.data.pdfs.map(pdf => ({
        id: pdf.id,
        filename: pdf.filename,
        fileSize: pdf.file_size,
        mimeType: pdf.mime_type,
        folderId: pdf.folder_id,
        isGoogleDriveFile: pdf.isGoogleDriveFile,
      }));
    },
    transformErrorResponse: (baseQueryReturnValue) => {
      const errorData = baseQueryReturnValue?.data as ServerErrorResponse;
      const errorMessage = errorData?.message || 'An error occurred';
      
      // In development, include full error object for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('File endpoint error:', {
          message: errorMessage,
          error: errorData?.error,
        });
      }
      
      return errorMessage;
    },
    providesTags: ["File"],
  }),
});
