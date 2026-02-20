export interface IStorageService {
  deleteDocument(storagePath: string): Promise<void>;
  getSignedUrl(storagePath: string, expiresIn?: number): Promise<string>;
  downloadDocument(storagePath: string): Promise<Buffer>;
  createUploadUrl(storagePath: string): Promise<string>;
  uploadDocument(storagePath: string, file: Buffer): Promise<void>;
  getFileMetadata(
    storagePath: string,
  ): Promise<{ size: number; mimeType: string }>;
}
