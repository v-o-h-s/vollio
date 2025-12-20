import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { File } from "../../../domain/entities/File";
import { FastifyBaseLogger } from "fastify";

export interface MoveFileInput {
  fileId: string;
  folderId: string | null;
  userId: string;
}

export class MoveFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: MoveFileInput): Promise<File> {
    this.logger.info(
      {
        fileId: input.fileId,
        targetFolderId: input.folderId,
        userId: input.userId,
      },
      "Executing MoveFileUseCase"
    );
    // Validate file exists
    const file = await this.fileRepository.getFileById(input.fileId);
    if (!file) {
      this.logger.warn(
        { fileId: input.fileId },
        "File not found in MoveFileUseCase"
      );
      throw new NotFoundError("File not found");
    }

    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(
        input.folderId,
        input.userId
      );
      if (!folder) {
        this.logger.warn(
          { folderId: input.folderId, userId: input.userId },
          "Target folder not found in MoveFileUseCase"
        );
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Move file
    const result = await this.fileRepository.moveFile(
      input.fileId,
      input.folderId
    );
    this.logger.info(
      { fileId: input.fileId, targetFolderId: input.folderId },
      "MoveFileUseCase executed successfully"
    );
    return result;
  }
}
