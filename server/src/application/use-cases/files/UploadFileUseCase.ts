import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { File } from "../../../domain/entities/File";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

export interface UploadFileInput {
  fileBuffer: Buffer;
  filename: string;
  fileSize: number;
  userId: string;
  folderId?: string | null;
}

export class UploadFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private folderRepository: IFolderRepository,
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UploadFileInput): Promise<void> {
    this.logger.info(
      {
        filename: input.filename,
        userId: input.userId,
        folderId: input.folderId,
      },
      "Executing UploadFileUseCase"
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
          "Folder not found in UploadFileUseCase"
        );
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Validate filename
    this.validateFilename(input.filename);

    // Upload file to storage
    let storagePath: string;
    try {
      this.logger.info(
        { userId: input.userId, filename: input.filename },
        "Uploading file to storage"
      );
      storagePath = await this.storageService.uploadFile(
        input.fileBuffer,
        input.filename,
        input.userId
      );
    } catch (error) {
      this.logger.error(
        { error, filename: input.filename },
        "Failed to upload file to storage"
      );
      throw new ServerError(
        `Failed to upload file: ${(error as Error).message}`
      );
    }

    // Create file entity
    const fileId = randomUUID();
    const file = new File(
      fileId,
      input.filename,
      input.fileSize,
      storagePath,
      null, // No Google Drive ID
      "application/pdf",
      input.folderId ?? null
    );

    // Save to database (cleanup storage if this fails)
    try {
      this.logger.info(
        { fileId, storagePath },
        "Saving file metadata to repository"
      );
      await this.fileRepository.addFile(file);
    } catch (error) {
      this.logger.error(
        { error, fileId },
        "Error saving file metadata, cleaning up storage"
      );
      // Cleanup: Delete uploaded file from storage
      await this.storageService.deleteFile(storagePath);
      throw error; // Re-throw to inform caller
    }

    this.logger.info({ fileId }, "UploadFileUseCase executed successfully");
  }

  private validateFilename(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      this.logger.warn({ filename }, "Filename validation failed: empty name");
      throw new ServerError("Filename cannot be empty");
    }

    if (filename.length > 255) {
      this.logger.warn(
        { filename },
        "Filename validation failed: name too long"
      );
      throw new ServerError(
        "Filename exceeds maximum length of 255 characters"
      );
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      this.logger.warn(
        { filename },
        "Filename validation failed: invalid characters"
      );
      throw new ServerError("Filename contains invalid characters");
    }
  }
}
