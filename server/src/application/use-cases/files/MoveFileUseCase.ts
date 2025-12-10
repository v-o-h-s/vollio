import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { File } from "../../../domain/entities/File";

export interface MoveFileInput {
  fileId: string;
  folderId: string | null;
  userId: string;
}

export class MoveFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private folderRepository: IFolderRepository
  ) {}

  async execute(input: MoveFileInput): Promise<File> {
    // Validate file exists
    const file = await this.fileRepository.getFileById(input.fileId);
    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(input.folderId, input.userId);
      if (!folder) {
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Move file
    return await this.fileRepository.moveFile(input.fileId, input.folderId);
  }
}
