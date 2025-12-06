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

  downloadFile(
    accessToken: string,
    fileId: string
  ): Promise<NodeJS.ReadableStream>;

  generateFileViewUrl(fileId: string): string;

  generateFileDownloadUrl(fileId: string): string;
}
