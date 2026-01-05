import { SupabaseClient } from "@supabase/supabase-js";
import { IDocumentRepository } from "../../domain/repositories/IDocumentRepository";
import { Document } from "../../domain/entities/Document";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class DocumentRepository implements IDocumentRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async addDocument(document: Document): Promise<void> {
    this.logger.info(
      { documentId: document.getId(), name: document.getName() },
      "Adding document to repository"
    );
    const { error } = await this.supabaseClient.from("documents").insert({
      id: document.getId(),
      name: document.getName(),
      size: document.getSize(),
      storage_path: document.getSource().storagePath,
      google_document_id: document.getSource().googleDocumentId,
      mime_type: document.getMimeType(),
      folder_id: document.getFolderId(),
    });

    if (error) {
      this.logger.error(
        { error, documentId: document.getId() },
        "Error adding document to repository"
      );
      throw new DatabaseError(error);
    }
    this.logger.info(
      { documentId: document.getId() },
      "Document added successfully to repository"
    );
  }

  async getDocumentById(id: string): Promise<Document | null> {
    this.logger.info({ documentId: id }, "Getting document by ID");
    const { data, error } = await this.supabaseClient
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ documentId: id }, "Document not found");
        return null;
      }
      this.logger.error(
        { error, documentId: id },
        "Error getting document by ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ documentId: id }, "Document not found (no data)");
      return null;
    }

    this.logger.info({ documentId: id }, "Document found");
    return new Document(
      data.id,
      data.name,
      data.size,
      data.storage_path,
      data.google_document_id,
      data.mime_type,
      data.folder_id
    );
  }

  async getAllDocumentsByUserId(userId: string): Promise<Document[]> {
    this.logger.info({ userId }, "Getting all documents by user ID");
    const { data, error } = await this.supabaseClient
      .from("documents")
      .select(
        `
        *,
        folders(id, name, parent_id)
      `
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ userId }, "No documents found for user");
        return [];
      }
      this.logger.error(
        { error, userId },
        "Error getting all documents by user ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ userId }, "No documents found (no data)");
      return [];
    }

    this.logger.info(
      { userId, count: data.length },
      "Documents retrieved successfully for user"
    );
    return data.map(
      (row) =>
        new Document(
          row.id,
          row.name,
          row.size,
          row.storage_path,
          row.google_document_id,
          row.mime_type,
          row.folder_id
        )
    );
  }

  async deleteDocument(id: string): Promise<void> {
    this.logger.info({ documentId: id }, "Deleting document");
    const { error } = await this.supabaseClient
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn({ documentId: id }, "Document not found for deletion");
        throw new NotFoundError("Document not found");
      }
      this.logger.error({ error, documentId: id }, "Error deleting document");
      throw new DatabaseError(error);
    }
    this.logger.info({ documentId: id }, "Document deleted successfully");
  }

  async updateDocumentName(id: string, name: string): Promise<Document> {
    this.logger.info(
      { documentId: id, newName: name },
      "Updating document name"
    );
    const { data, error } = await this.supabaseClient
      .from("documents")
      .update({
        name: name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn(
          { documentId: id },
          "Document not found for name update"
        );
        throw new NotFoundError("Document not found");
      }
      this.logger.error(
        { error, documentId: id },
        "Error updating document name"
      );
      throw new DatabaseError(error);
    }

    this.logger.info({ documentId: id }, "Document name updated successfully");
    return new Document(
      data.id,
      data.name,
      data.size,
      data.storage_path,
      data.google_document_id,
      data.mime_type,
      data.folder_id
    );
  }

  async moveDocument(id: string, folderId: string | null): Promise<Document> {
    this.logger.info(
      { documentId: id, targetFolderId: folderId },
      "Moving document to folder"
    );
    const { data, error } = await this.supabaseClient
      .from("documents")
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn({ documentId: id }, "Document not found for move");
        throw new NotFoundError("Document not found");
      }
      this.logger.error({ error, documentId: id }, "Error moving document");
      throw new DatabaseError(error);
    }

    this.logger.info({ documentId: id }, "Document moved successfully");
    return new Document(
      data.id,
      data.name,
      data.size,
      data.storage_path,
      data.google_document_id,
      data.mime_type,
      data.folder_id
    );
  }

  async updateDocumentStoragePath(
    id: string,
    storagePath: string
  ): Promise<Document> {
    this.logger.info(
      { documentId: id, storagePath },
      "Updating document storage path"
    );
    const { data, error } = await this.supabaseClient
      .from("documents")
      .update({
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      this.logger.error(
        { error, documentId: id },
        "Error updating document storage path"
      );
      throw new DatabaseError(error);
    }

    this.logger.info(
      { documentId: id },
      "Document storage path updated successfully"
    );
    return new Document(
      data.id,
      data.name,
      data.size,
      data.storage_path,
      data.google_document_id,
      data.mime_type,
      data.folder_id
    );
  }
}
