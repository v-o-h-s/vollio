export interface IGoogleDriveService {
  getFileMetadata(
    accessToken: string,
    fileId: string
  ): Promise<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
  } | null>;
  getFileById(accessToken: string, fileId: string): Promise<Buffer>;
}
