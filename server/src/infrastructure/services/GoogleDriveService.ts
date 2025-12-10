import { IGoogleDriveService } from "../../domain/services/IGoogleDriveService";
import { google } from "googleapis";
import { NotFoundError } from "../../shared/errors/NotFoundError";
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
    throw new NotFoundError("File not found");
  }
  async getFileById(accessToken: string, fileId: string): Promise<Buffer> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new ServerError("failed to get the file");
    }
    const arrayBuf = await res.arrayBuffer();

    return Buffer.from(arrayBuf);
  }
  async streamFile(accessToken: string, fileId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });
    const driveRes = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );
    return driveRes.data;
    /*
    No access_token is sent to the client
     No Drive link is exposed
     No auth leak
     Private Google Drive stays private
     Client simply gets bytes
     PDF.js / react-highlighter-extended loads it just fine
    */

  }
}