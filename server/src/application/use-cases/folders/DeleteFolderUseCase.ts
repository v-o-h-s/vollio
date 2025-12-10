import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";

interface DeleteFolderInput {
  userId: string;
  folderId: string;
  moveContentsTo?: string | null;
}

export class DeleteFolderUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(input: DeleteFolderInput): Promise<void> {
    // Validate folder exists and belongs to user
    const existingFolder = await this.folderRepository.getFolderById(
      input.folderId,
      input.userId
    );

    if (!existingFolder) {
      throw new Error("Folder not found or access denied");
    }

    // If moveContentsTo is specified, validate the target folder
    if (input.moveContentsTo) {
      const targetFolder = await this.folderRepository.getFolderById(
        input.moveContentsTo,
        input.userId
      );

      if (!targetFolder) {
        throw new Error("Target folder not found or access denied");
      }
    }

    // Move PDFs to target folder or root
    await this.folderRepository.movePdfsBetweenFolders(
      input.folderId,
      input.moveContentsTo || null,
      input.userId
    );

    // Move subfolders to target folder or root
    await this.folderRepository.moveSubfoldersBetweenFolders(
      input.folderId,
      input.moveContentsTo || null,
      input.userId
    );

    // Delete the folder
    await this.folderRepository.deleteFolder(input.folderId, input.userId);
  }
}
