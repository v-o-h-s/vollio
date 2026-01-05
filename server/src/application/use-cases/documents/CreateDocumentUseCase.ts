import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Document } from "../../../domain/entities/Document";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";
import { CreateDocumentDto } from "@vollio/shared";
import { IStorageService } from "../../../domain/services/IStorageService";

export interface CreateDocumentInput extends CreateDocumentDto {
  userId: string;
}

export class CreateDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private folderRepository: IFolderRepository,
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: CreateDocumentInput): Promise<{ id: string }> {
    this.logger.info(
      {
        name: input.name,
        userId: input.userId,
        folderId: input.folderId,
      },
      "Executing CreateDocumentUseCase"
    );
    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(
        input.folderId,
        input.userId
      );
      if (!folder) {
        this.logger.warn(
          { folderId: input.folderId, userId: input.userId },
          "Folder not found in CreateDocumentUseCase"
        );
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Validate name
    this.validateName(input.name);

    // SECURITY: Validate storagePath
    // 1. Ensure it doesn't try to go up directory levels (path traversal)
    if (input.storagePath.includes("..") || input.storagePath.includes("./")) {
      this.logger.warn(
        { storagePath: input.storagePath, userId: input.userId },
        "Potential path traversal attempt detected in storagePath"
      );
      throw new ServerError("Invalid storage path provided");
    }

    // 2. Ensure it belongs to the user's specific directory
    // The path format is `${userId}/${timestamp}_${sanitizedName}`
    if (!input.storagePath.startsWith(`${input.userId}/`)) {
      this.logger.warn(
        { storagePath: input.storagePath, userId: input.userId },
        "Unauthorized storage path access attempt: path does not start with userId"
      );
      throw new ServerError("Unauthorized storage path");
    }

    // SECURITY: Validate file size (e.g., 50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (input.size > MAX_SIZE) {
      this.logger.warn(
        { size: input.size, userId: input.userId },
        "Document size exceeds maximum limit"
      );
      throw new ServerError("Document size exceeds maximum limit (50MB)");
    }

    // Create document entity
    const documentId = randomUUID();
    const document = new Document(
      documentId,
      input.name,
      input.size,
      input.storagePath,
      null, // No Google Drive ID
      "application/pdf", // TODO: Detect mime type properly if possible
      input.folderId ?? null
    );

    // Save to database
    try {
      this.logger.info(
        { documentId, storagePath: input.storagePath },
        "Saving document metadata to repository"
      );
      await this.documentRepository.addDocument(document);
    } catch (error) {
      this.logger.error(
        { error, documentId },
        "Error saving document metadata, cleaning up storage"
      );
      // Cleanup: Delete uploaded document from storage if DB save fails
      // Since the client just uploaded it, we should clean it up to avoid orphans
      await this.storageService.deleteDocument(input.storagePath);
      throw error;
    }

    this.logger.info(
      { documentId },
      "CreateDocumentUseCase executed successfully"
    );

    return { id: documentId };
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      this.logger.warn({ name }, "Name validation failed: empty name");
      throw new ServerError("Name cannot be empty");
    }

    if (name.length > 255) {
      this.logger.warn({ name }, "Name validation failed: name too long");
      throw new ServerError("Name exceeds maximum length of 255 characters");
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      this.logger.warn({ name }, "Name validation failed: invalid characters");
      throw new ServerError("Name contains invalid characters");
    }
  }
}
