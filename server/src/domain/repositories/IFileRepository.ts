import { File } from "../../domain/entities/File";

export interface IFileRepository {
    addFile(file: File): Promise<void>;
    getFileById(id: string): Promise<File | null>;
    getAllFilesByUserId(userId: string): Promise<File[]>;
    deleteFile(id: string): Promise<void>;
    updateFileName(id: string, fileName: string): Promise<File>;
    moveFile(id: string, folderId: string | null): Promise<File>;
}