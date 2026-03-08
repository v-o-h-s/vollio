import { Document } from "../../domain/entities/Document";
import { DocumentDetails } from "../../shared";

export class DocumentMapper {
  public static fromPersistenceToDomain(row: any): Document {
    return new Document(
      row.id,
      row.user_id,
      row.name,
      row.size,
      row.storage_path,
      row.google_document_id,
      row.mime_type,
      row.folder_id,
    );
  }

  public static toPersistence(document: Document) {
    return {
      id: document.getId(),
      user_id: document.getUserId(),
      name: document.getName(),
      size: document.getSize(),
      storage_path: document.getSource().storagePath,
      google_document_id: document.getSource().googleDocumentId,
      mime_type: document.getMimeType(),
      folder_id: document.getFolderId(),
    };
  }

  public static fromDomainToInterface(document: Document): DocumentDetails {
    return {
      id: document.getId(),
      name: document.getName(),
      size: document.getSize(),
      mimeType: document.getMimeType(),
      uploadedAt: new Date().toISOString(), // This should ideally come from the entity if we had it
      folderId: document.getFolderId(),
      isGoogleDriveDocument: !!document.getGoogleDocumentId(),
    };
  }
}
