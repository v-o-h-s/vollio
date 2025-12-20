import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";
import { FastifyBaseLogger } from "fastify";

interface UpdateFolderInput {
  userId: string;
  folderId: string;
  name?: string;
  parentId?: string | null;
}

export class UpdateFolderUseCase {
  constructor(
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UpdateFolderInput): Promise<Folder> {
    this.logger.info(
      { folderId: input.folderId, userId: input.userId },
      "Executing UpdateFolderUseCase"
    );
    // Validate at least one field is provided
    if (input.name === undefined && input.parentId === undefined) {
      this.logger.warn(
        { folderId: input.folderId },
        "Validation failed in UpdateFolderUseCase: no fields provided"
      );
      throw new Error("At least one field (name or parentId) must be provided");
    }

    // Get existing folder
    const existingFolder = await this.folderRepository.getFolderEntity(
      input.folderId,
      input.userId
    );

    if (!existingFolder) {
      this.logger.warn(
        { folderId: input.folderId, userId: input.userId },
        "Folder not found in UpdateFolderUseCase"
      );
      throw new Error("Folder not found or access denied");
    }

    // Validate parent folder if provided
    if (
      input.parentId !== undefined &&
      input.parentId !== existingFolder.getParentId()
    ) {
      if (input.parentId) {
        // Check parent exists and belongs to user
        const parentFolder = await this.folderRepository.getFolderById(
          input.parentId,
          input.userId
        );

        if (!parentFolder) {
          this.logger.warn(
            { parentId: input.parentId, userId: input.userId },
            "Parent folder not found in UpdateFolderUseCase"
          );
          throw new Error("Parent folder not found or access denied");
        }

        // Prevent circular references
        if (input.parentId === input.folderId) {
          this.logger.warn(
            { folderId: input.folderId },
            "Circular reference check failed in UpdateFolderUseCase: same folder"
          );
          throw new Error("A folder cannot be its own parent");
        }

        // Check if moving to a descendant (would create circular reference)
        const descendants = await this.folderRepository.getFolderDescendants(
          input.folderId
        );

        if (descendants && descendants.some((d) => d.id === input.parentId)) {
          this.logger.warn(
            { folderId: input.folderId, parentId: input.parentId },
            "Circular reference check failed in UpdateFolderUseCase: move to descendant"
          );
          throw new Error("Cannot move folder to one of its descendants");
        }
      }

      existingFolder.setParentId(input.parentId || null);
    }

    // Check for duplicate names if name is being updated
    if (input.name !== undefined && input.name !== existingFolder.getName()) {
      const nameExists = await this.folderRepository.folderNameExists(
        input.name,
        input.parentId !== undefined
          ? input.parentId
          : existingFolder.getParentId(),
        input.userId,
        input.folderId
      );

      if (nameExists) {
        this.logger.warn(
          { name: input.name, folderId: input.folderId },
          "Folder name conflict in UpdateFolderUseCase"
        );
        throw new Error(
          "A folder with this name already exists in the same location"
        );
      }

      existingFolder.setName(input.name);
    }

    const result = await this.folderRepository.updateFolder(existingFolder);
    this.logger.info(
      { folderId: result.getId() },
      "UpdateFolderUseCase executed successfully"
    );
    return result;
  }
}
