export interface IStorageService {
    uploadFile(file: Buffer, filename: string, userId: string): Promise<string>;
    deleteFile(storagePath: string): Promise<void>;
    getSignedUrl(storagePath: string, expiresIn?: number): Promise<string>;
    downloadFile(storagePath: string): Promise<Buffer>;
}
