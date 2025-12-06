import { IGoogleDriveService } from "../../domain/services/IGoogleDriveService";
import { google } from "googleapis";
import { ServerError } from "../../shared/errors/ServerError";
export class GoogleDriveService implements IGoogleDriveService {
  async getFileMetadata(
    accessToken: string,
    fileId: string
  ): Promise<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
  } | null> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });

    try {
      const res = await drive.files.get({
        fileId,
        fields: "id,name,mimeType,size",
      });

      const data = res.data;
      if (data.id && data.name && data.mimeType && data.size) {
        return {
          id: data.id,
          name: data.name,
          mimeType: data.mimeType,
          size: Number(data.size),
        };
      }
      return null;
    } catch (error: any) {
      console.error("Google Drive API Error:", JSON.stringify(error, null, 2));
      // Check for 404 in various properties as googleapis error structure can vary
      if (error.code === 404 || error.status === 404 || (error.errors && error.errors[0]?.reason === 'notFound')) {
        return null;
      }
      throw new ServerError(
        `Failed to fetch file metadata from Google Drive: ${error.message}`
      );
    }
  }
  downloadFile(
    accessToken: string,
    fileId: string
  ): Promise<NodeJS.ReadableStream> {
    throw new Error("Method not implemented.");
  }
  generateFileViewUrl(fileId: string): string {
    throw new Error("Method not implemented.");
  }
  generateFileDownloadUrl(fileId: string): string {
    throw new Error("Method not implemented.");
  }
}
