import { IFileRepository } from "../../../domain/repositories/IFileRepository";

export interface FileData {
  id: string;
  filename: string;
  fileSize: number;
  storagePath: string | null;
  googleFileId: string | null;
  mimeType: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export class GetAllFilesUseCase {
  constructor(private fileRepository: IFileRepository) {}

  async execute(userId: string): Promise<FileData[]> {
    const files = await this.fileRepository.getAllFilesByUserId(userId);

    return files.map((file) => {
      const source = file.getSource();
      const isGoogleDriveFile = !!source.googleFileId;

      return {
        id: file.getId(),
        filename: file.getFileName(),
        fileSize: file.getFileSize(),
        storagePath: source.storagePath || null,
        googleFileId: source.googleFileId || null,
        mimeType: file.getMimeType(),
        folderId: file.getFolderId() || null,
        isGoogleDriveFile,
      };
    });
  }
}
