import { Readable } from "stream";

export interface IGoogleDriveService {
  getDocumentMetadata(
    accessToken: string,
    documentId: string
  ): Promise<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
  } | null>;
  getDocumentById(accessToken: string, documentId: string): Promise<Buffer>;
  streamDocument(accessToken: string, documentId: string): Promise<Readable>;
}
