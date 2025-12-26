import { Document } from "../../domain/entities/Document";

export interface IDocumentRepository {
    addDocument(document: Document): Promise<void>;
    getDocumentById(id: string): Promise<Document | null>;
    getAllDocumentsByUserId(userId: string): Promise<Document[]>;
    deleteDocument(id: string): Promise<void>;
    updateDocumentName(id: string, documentName: string): Promise<Document>;
    moveDocument(id: string, folderId: string | null): Promise<Document>;
}