import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { FastifyBaseLogger } from "fastify";

interface DeleteFolderInput {
  userId: string;
  folderId: string;
  moveContentsTo?: string | null;
}

export class DeleteFolderUseCase {
  constructor(
    private folderRepository: IFolderRepository,
    private documentRepository: IDocumentRepository, // Inject DocumentRepository to delete documents
    private logger: FastifyBaseLogger,
  ) {}

  async execute(input: DeleteFolderInput): Promise<void> {
    this.logger.info(
      {
        folderId: input.folderId,
        userId: input.userId,
        moveContentsTo: input.moveContentsTo,
      },
      "Executing DeleteFolderUseCase",
    );
    // Validate folder exists and belongs to user
    const existingFolder = await this.folderRepository.getFolderById(
      input.folderId,
      input.userId,
    );

    if (!existingFolder) {
      this.logger.warn(
        { folderId: input.folderId, userId: input.userId },
        "Folder not found in DeleteFolderUseCase",
      );
      throw new Error("Folder not found or access denied");
    }

    // If moveContentsTo is specified, validate the target folder
    // Otherwise, we perform a CASCADE delete (delete contents)
    if (input.moveContentsTo) {
      const targetFolder = await this.folderRepository.getFolderById(
        input.moveContentsTo,
        input.userId,
      );

      if (!targetFolder) {
        this.logger.warn(
          { targetFolderId: input.moveContentsTo, userId: input.userId },
          "Target folder not found in DeleteFolderUseCase",
        );
        throw new Error("Target folder not found or access denied");
      }

      // Move Documents to target folder or root
      this.logger.info(
        { folderId: input.folderId, targetFolderId: input.moveContentsTo },
        "Moving Documents out of folder being deleted",
      );
      await this.folderRepository.movePdfsBetweenFolders(
        input.folderId,
        input.moveContentsTo || null,
        input.userId,
      );

      // Move subfolders to target folder
      this.logger.info(
        { folderId: input.folderId, targetFolderId: input.moveContentsTo },
        "Moving subfolders out of folder being deleted",
      );
      await this.folderRepository.moveSubfoldersBetweenFolders(
        input.folderId,
        input.moveContentsTo || null,
        input.userId,
      );
    } else {
      // Cascade DELETE: Delete all subfolders and documents recursively
      // NOTE: The current requirement is "when folder is deleted its children must also be deleted"
      // The implementation here relies on the repository to handle cascade or we do it manually.
      // Assuming database FKs might not have ON DELETE CASCADE or we need application level logic.

      // However, a simple implementation for now is to let the database handle it if configured,
      // OR manually delete contents.
      // Since I don't have direct DB schema access to verify ON DELETE CASCADE,
      // I will implement a manual cascade strategy here or use a repository method if available.
      // Since no 'deleteWithCascade' exists on repo, I will use recursive calls or rely on DB.
      // Given the prompt "do this in backend as well", I'll implementation recursion logic here.

      await this.deleteFolderContentsRecursively(input.folderId, input.userId);
    }

    // Delete the folder itself
    await this.folderRepository.deleteFolder(input.folderId, input.userId);
    this.logger.info(
      { folderId: input.folderId },
      "DeleteFolderUseCase executed successfully",
    );
  }

  private async deleteFolderContentsRecursively(
    folderId: string,
    userId: string,
  ) {
    // 1. Delete all documents in this folder
    // We fetch all user docs and filter by folderId since we lack a specific deleteByFolderId method.

    // Actually, safest app-level cascade is:
    // 1. Delete all documents in this folder
    // 2. Get all child folders
    // 3. Recurse for each child folder

    // But we don't have a "get direct children" readily available in IFolderRepository other than getAllUserFolders and filtering.
    // Modifying IFolderRepository is risky without seeing all files.
    // Let's rely on `deleteFolder` potentially failing if children exist, necessitating this logic.

    // Alternative: Use `deleteFolder` which currently just deletes the row.
    // If Supabase has FK constraints, this fails. If ON DELETE CASCADE, it works.
    // PROMPT says: "when folder is deleted its children must also be deleted pls do this in backend"
    // This implies explicit logic.

    // I will implement a best-effort approach using available methods:

    // Delete documents in the current folder
    // We need a method in DocumentRepository to delete by FolderId?
    // IDocumentRepository has `getAllDocumentsByUserId`. We can filter? Inefficient.
    // Let's assume we need to extend capabilities or just delete the folder and hope DB cascades?
    // No, explicit request.

    // I'll add a method to IDocumentRepository to deleteByFolderId if I could, but I can't easily refactor everything.
    // I will fetch all user docs, filter by folderId, and delete them. (Inefficient but works for now).
    const allDocs =
      await this.documentRepository.getAllDocumentsByUserId(userId);
    const docsInFolder = allDocs.filter((d) => d.getFolderId() === folderId);

    for (const doc of docsInFolder) {
      await this.documentRepository.deleteDocument(doc.getId());
    }

    // Recursively delete subfolders
    // Since I can't easily get direct children, I'll rely on `getAllUserFolders` and filter.
    // Also inefficient, but safe.
    const allFolders = await this.folderRepository.getAllUserFolders(userId);
    const childFolders = allFolders.filter((f) => f.getParentId() === folderId);

    for (const child of childFolders) {
      await this.deleteFolderContentsRecursively(child.getId(), userId);
      await this.folderRepository.deleteFolder(child.getId(), userId);
    }
  }
}
