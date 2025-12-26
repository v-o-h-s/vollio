export interface IStorageService {
  uploadDocument(buffer: Buffer, name: string, userId: string): Promise<string>;
  deleteDocument(storagePath: string): Promise<void>;
  getSignedUrl(storagePath: string, expiresIn?: number): Promise<string>;
  downloadDocument(storagePath: string): Promise<Buffer>;
}
