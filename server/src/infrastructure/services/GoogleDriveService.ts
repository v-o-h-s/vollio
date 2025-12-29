import { IGoogleDriveService } from "../../domain/services/IGoogleDriveService";
import { google } from "googleapis";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ServerError } from "../../shared/errors/ServerError";
export class GoogleDriveService implements IGoogleDriveService {
  async getDocumentMetadata(
    accessToken: string,
    documentId: string
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
      fileId: documentId,
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
    throw new NotFoundError("Document not found");
  }
  async getDocumentById(
    accessToken: string,
    documentId: string
  ): Promise<Buffer> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${documentId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      throw new ServerError("failed to get the document");
    }
    const arrayBuf = await res.arrayBuffer();

    return Buffer.from(arrayBuf);
  }
  async streamDocument(accessToken: string, documentId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });
    const driveRes = await drive.files.get(
      { fileId: documentId, alt: "media" },
      { responseType: "stream" }
    );
    return driveRes.data;
    /*
    No access_token is sent to the client
     No Drive link is exposed
     No auth leak
     Private Google Drive stays private
     Client simply gets bytes
     Document.js / react-highlighter-extended loads it just fine
    */
  }
}
