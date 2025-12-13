import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { PdfDetails } from "../../../shared/types/responses/fileRoutes";

export class GetAllFilesUseCase {
  constructor(private fileRepository: IFileRepository) { }

  async execute(userId: string): Promise<PdfDetails[]> {
    const files = await this.fileRepository.getAllFilesByUserId(userId);

    return files.map((file) => {
      const source = file.getSource();
      const isGoogleDriveFile = !!source.googleFileId;

      return {
        id: file.getId(),
        filename: file.getFileName(),
        fileSize: file.getFileSize(),
        mimeType: file.getMimeType(),
        folderId: file.getFolderId() || null,
        isGoogleDriveFile: file.getSource().googleFileId ? true : false,
        uploadedAt: new Date().toISOString(), // This should come from the entity if needed

      };
    });
  }
}
