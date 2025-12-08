import { File } from "../../domain/entities/File";
export interface IFileRepository {
    addFile(file: File): Promise<void>;
    getFileById(id: string): Promise<File | null>;
    deleteFile(id: string): Promise<void>;
    uploadFile(file: Buffer): Promise<void>;
    // will be deleted later 
    loadFileFromUrl(url: string,): Promise<Buffer | null>;
}