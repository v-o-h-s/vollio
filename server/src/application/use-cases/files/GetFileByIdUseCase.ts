// this case is only for the files stored in our storage, not Google Drive files
// for the google drive files , we use streaming from google api directly
import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import "dotenv/config";
import { FastifyBaseLogger } from "fastify";
export interface GetFileByIdResult {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export class GetFileByIdUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(fileId: string): Promise<GetFileByIdResult> {
    this.logger.info({ fileId }, "Executing GetFileByIdUseCase");
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      this.logger.warn({ fileId }, "File not found in GetFileByIdUseCase");
      throw new NotFoundError("File not found");
    }
    const storagePath = file.getSource().storagePath!;

    const fileUrl = await this.storageService.getSignedUrl(storagePath);

    this.logger.info({ fileId }, "GetFileByIdUseCase executed successfully");
    return {
      id: file.getId(),
      filename: file.getFileName(),
      fileUrl,
      fileSize: file.getFileSize(),
      mimeType: file.getMimeType(),
      uploadedAt: new Date().toISOString(), // This should come from the entity if needed
      folderId: file.getFolderId(),
      isGoogleDriveFile: false,
    };
  }
}
