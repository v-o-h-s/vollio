import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Document } from "../../../domain/entities/Document";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";
import { CreateDocumentDto } from "@vollio/shared";
import { IStorageService } from "../../../domain/services/IStorageService";
import { IStorageQuotaService } from "../../../domain/services/quota/IStorageQuotaService";
import { IDocumentQuotaService } from "../../../domain/services/quota/IDocumentQuotaService";

export interface CreateDocumentInput extends CreateDocumentDto {
  userId: string;
}

export class CreateDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private folderRepository: IFolderRepository,
    private storageService: IStorageService,
    private storageQuotaService: IStorageQuotaService,
    private documentQuotaService: IDocumentQuotaService,
    private logger: FastifyBaseLogger,
  ) {}

  async execute(input: CreateDocumentInput): Promise<{ id: string }> {
    this.logger.info(
      {
        name: input.name,
        userId: input.userId,
        folderId: input.folderId,
      },
      "Executing CreateDocumentUseCase",
    );
    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(
        input.folderId,
        input.userId,
      );
      if (!folder) {
        this.logger.warn(
          { folderId: input.folderId, userId: input.userId },
          "Folder not found in CreateDocumentUseCase",
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
        "Potential path traversal attempt detected in storagePath",
      );
      throw new ServerError("Invalid storage path provided");
    }

    // 2. Ensure it belongs to the user's specific directory
    // The path format is `${userId}/${timestamp}_${sanitizedName}`
    if (!input.storagePath.startsWith(`${input.userId}/`)) {
      this.logger.warn(
        { storagePath: input.storagePath, userId: input.userId },
        "Unauthorized storage path access attempt: path does not start with userId",
      );
      throw new ServerError("Unauthorized storage path");
    }

    // 3. TRUTH CHECK — Fetch actual metadata from storage before consuming quota
    this.logger.info(
      { storagePath: input.storagePath },
      "Fetching actual file metadata for truth check",
    );
    const { size: actualSize, mimeType: actualMimeType } =
      await this.storageService.getFileMetadata(input.storagePath);

    this.logger.info(
      { actualSize, actualMimeType },
      "Actual metadata retrieved",
    );

    // Re-validate size and mime type using the truth
    if (actualMimeType !== "application/pdf") {
      this.logger.warn(
        { actualMimeType },
        "Invalid mime type detected after upload",
      );
      await this.storageService.deleteDocument(input.storagePath);
      throw new ServerError("Only PDF files are allowed");
    }

    // SECURITY: Validate file size (e.g., 25MB limit)
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (actualSize > MAX_SIZE) {
      this.logger.warn(
        { actualSize, userId: input.userId },
        "Document size exceeds maximum limit",
      );
      await this.storageService.deleteDocument(input.storagePath);
      throw new ServerError("Document size exceeds maximum limit (25MB)");
    }

    // 4. QUOTA CONSUMPTION — storage bytes + document count (throws QuotaExceededError if exceeded)
    await this.documentQuotaService.consumeDocument(input.userId);
    await this.storageQuotaService.consumeStorage(input.userId, actualSize);

    // Create document entity
    const documentId = randomUUID();
    const document = new Document(
      documentId,
      input.userId,
      input.name,
      actualSize, // Use truth
      input.storagePath,
      null, // No Google Drive ID
      actualMimeType, // Use truth
      input.folderId ?? null,
    );

    // Save to database
    try {
      this.logger.info(
        { documentId, storagePath: input.storagePath },
        "Saving document metadata to repository",
      );
      await this.documentRepository.addDocument(document);
    } catch (error) {
      this.logger.error(
        { error, documentId },
        "Error saving document metadata, cleaning up storage and quota",
      );
      // Cleanup: Delete uploaded document from storage if DB save fails
      await this.storageService.deleteDocument(input.storagePath);
      // Release both quotas
      await this.storageQuotaService
        .releaseStorage(input.userId, input.size)
        .catch((e) =>
          this.logger.error({ e }, "Failed to release storage quota"),
        );
      await this.documentQuotaService
        .releaseDocument(input.userId)
        .catch((e) =>
          this.logger.error({ e }, "Failed to release document quota"),
        );
      throw error;
    }

    this.logger.info(
      { documentId },
      "CreateDocumentUseCase executed successfully",
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
