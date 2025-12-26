import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { Document } from "../../../domain/entities/Document";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

export interface UploadDocumentInput {
  documentBuffer: Buffer;
  name: string;
  size: number;
  userId: string;
  folderId?: string | null;
}

export class UploadDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private folderRepository: IFolderRepository,
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UploadDocumentInput): Promise<void> {
    this.logger.info(
      {
        name: input.name,
        userId: input.userId,
        folderId: input.folderId,
      },
      "Executing UploadDocumentUseCase"
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
          "Folder not found in UploadDocumentUseCase"
        );
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Validate name
    this.validateName(input.name);

    // Upload document to storage
    let storagePath: string;
    try {
      this.logger.info(
        { userId: input.userId, name: input.name },
        "Uploading document to storage"
      );
      storagePath = await this.storageService.uploadDocument(
        input.documentBuffer,
        input.name,
        input.userId
      );
    } catch (error) {
      this.logger.error(
        { error, name: input.name },
        "Failed to upload document to storage"
      );
      throw new ServerError(
        `Failed to upload document: ${(error as Error).message}`
      );
    }

    // Create document entity
    const documentId = randomUUID();
    const document = new Document(
      documentId,
      input.name,
      input.size,
      storagePath,
      null, // No Google Drive ID
      "application/pdf",
      input.folderId ?? null
    );

    // Save to database (cleanup storage if this fails)
    try {
      this.logger.info(
        { documentId, storagePath },
        "Saving document metadata to repository"
      );
      await this.documentRepository.addDocument(document);
    } catch (error) {
      this.logger.error(
        { error, documentId },
        "Error saving document metadata, cleaning up storage"
      );
      // Cleanup: Delete uploaded document from storage
      await this.storageService.deleteDocument(storagePath);
      throw error; // Re-throw to inform caller
    }

    this.logger.info(
      { documentId },
      "UploadDocumentUseCase executed successfully"
    );
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
