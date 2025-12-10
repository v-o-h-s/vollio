import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { PdfDetails } from "../../../shared/types/responses/file.route";

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
        file_size: file.getFileSize(),
        mime_type: file.getMimeType(),
        folder_id: file.getFolderId() || null,
        isGoogleDriveFile,
      };
    });
  }
}
