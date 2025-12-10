// this case is only for the files stored in our storage, not Google Drive files
// for the google drive files , we use streaming from google api directly
import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export interface GetFileByIdResult {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export class GetFileByIdUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService
  ) { }

  async execute(fileId: string): Promise<GetFileByIdResult> {
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      throw new NotFoundError("File not found");
    }
    const storagePath = file.getSource().storagePath;
    if (!storagePath) {
      throw new NotFoundError("File not found in storage");
    }



    const fileUrl = await this.storageService.getSignedUrl(storagePath);

    return {
      id: file.getId(),
      filename: file.getFileName(),
      fileUrl,
      fileSize: file.getFileSize(),
      mimeType: file.getMimeType(),
      uploadedAt: new Date().toISOString(), // This should come from the entity if needed
    };
  }
}
