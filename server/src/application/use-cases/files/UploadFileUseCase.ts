import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { File } from "../../../domain/entities/File";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { randomUUID } from "crypto";

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
    private storageService: IStorageService
  ) { }

  async execute(input: UploadFileInput): Promise<void> {
    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(input.folderId, input.userId);
      if (!folder) {
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Validate filename
    this.validateFilename(input.filename);

    // Upload file to storage
    let storagePath: string;
    try {
      storagePath = await this.storageService.uploadFile(
        input.fileBuffer,
        input.filename,
        input.userId
      );
    } catch (error) {
      throw new ServerError(`Failed to upload file: ${(error as Error).message}`);
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
      await this.fileRepository.addFile(file);
    } catch (error) {
      // Cleanup: Delete uploaded file from storage
      await this.storageService.deleteFile(storagePath);
    }

    // Generate signed URL
    const fileUrl = await this.storageService.getSignedUrl(storagePath);

  
  }

  private validateFilename(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      throw new ServerError("Filename cannot be empty");
    }

    if (filename.length > 255) {
      throw new ServerError("Filename exceeds maximum length of 255 characters");
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      throw new ServerError("Filename contains invalid characters");
    }
  }
}