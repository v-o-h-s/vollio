import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { FastifyBaseLogger } from "fastify";

interface DeleteFolderInput {
  userId: string;
  folderId: string;
  moveContentsTo?: string | null;
}

export class DeleteFolderUseCase {
  constructor(
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: DeleteFolderInput): Promise<void> {
    this.logger.info(
      {
        folderId: input.folderId,
        userId: input.userId,
        moveContentsTo: input.moveContentsTo,
      },
      "Executing DeleteFolderUseCase"
    );
    // Validate folder exists and belongs to user
    const existingFolder = await this.folderRepository.getFolderById(
      input.folderId,
      input.userId
    );

    if (!existingFolder) {
      this.logger.warn(
        { folderId: input.folderId, userId: input.userId },
        "Folder not found in DeleteFolderUseCase"
      );
      throw new Error("Folder not found or access denied");
    }

    // If moveContentsTo is specified, validate the target folder
    if (input.moveContentsTo) {
      const targetFolder = await this.folderRepository.getFolderById(
        input.moveContentsTo,
        input.userId
      );

      if (!targetFolder) {
        this.logger.warn(
          { targetFolderId: input.moveContentsTo, userId: input.userId },
          "Target folder not found in DeleteFolderUseCase"
        );
        throw new Error("Target folder not found or access denied");
      }
    }

    // Move Documents to target folder or root
    this.logger.info(
      { folderId: input.folderId, targetFolderId: input.moveContentsTo },
      "Moving Documents out of folder being deleted"
    );
    await this.folderRepository.movePdfsBetweenFolders(
      input.folderId,
      input.moveContentsTo || null,
      input.userId
    );

    // Move subfolders to target folder or root
    this.logger.info(
      { folderId: input.folderId, targetFolderId: input.moveContentsTo },
      "Moving subfolders out of folder being deleted"
    );
    await this.folderRepository.moveSubfoldersBetweenFolders(
      input.folderId,
      input.moveContentsTo || null,
      input.userId
    );

    // Delete the folder
    await this.folderRepository.deleteFolder(input.folderId, input.userId);
    this.logger.info(
      { folderId: input.folderId },
      "DeleteFolderUseCase executed successfully"
    );
  }
}
