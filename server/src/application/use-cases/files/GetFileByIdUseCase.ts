// this case is only for the files stored in our storage, not Google Drive files
// for the google drive files , we use streaming from google api directly
import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import "dotenv/config";
import { CreateSignedUrlUseCase } from "./CreateSignedUrlUseCase";
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
    private createSignedUrlUseCase: CreateSignedUrlUseCase,
    private logger: FastifyBaseLogger
  ) { }

  async execute(fileId: string, userId: string): Promise<GetFileByIdResult> {
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      throw new NotFoundError("File not found");
    }
    const storagePath = file.getSource().storagePath;
    if (!storagePath) {
      const fileUrl = await this.createSignedUrlUseCase.execute(file.getId(), userId);
      this.logger.debug(`Generated signed URL for Google Drive file ${file.getId()}: ${fileUrl}`);
      return {
        id: file.getId(),
        filename: file.getFileName(),
        fileUrl,
        fileSize: file.getFileSize(),
        mimeType: file.getMimeType(),
        uploadedAt: new Date().toISOString(), // This should come from the entity if needed
        folderId: file.getFolderId(),
        isGoogleDriveFile: true,
      };
    }



    const fileUrl = await this.storageService.getSignedUrl(storagePath);

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
