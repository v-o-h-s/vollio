import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";

interface UpdateFolderInput {
  userId: string;
  folderId: string;
  name?: string;
  parentId?: string | null;
}

export class UpdateFolderUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(input: UpdateFolderInput): Promise<Folder> {
    // Validate at least one field is provided
    if (input.name === undefined && input.parentId === undefined) {
      throw new Error(
        "At least one field (name or parentId) must be provided"
      );
    }

    // Get existing folder
    const existingFolder = await this.folderRepository.getFolderEntity(
      input.folderId,
      input.userId
    );

    if (!existingFolder) {
      throw new Error("Folder not found or access denied");
    }

    // Validate parent folder if provided
    if (input.parentId !== undefined && input.parentId !== existingFolder.getParentId()) {
      if (input.parentId) {
        // Check parent exists and belongs to user
        const parentFolder = await this.folderRepository.getFolderById(
          input.parentId,
          input.userId
        );

        if (!parentFolder) {
          throw new Error("Parent folder not found or access denied");
        }

        // Prevent circular references
        if (input.parentId === input.folderId) {
          throw new Error("A folder cannot be its own parent");
        }

        // Check if moving to a descendant (would create circular reference)
        const descendants = await this.folderRepository.getFolderDescendants(
          input.folderId
        );

        if (
          descendants &&
          descendants.some((d) => d.id === input.parentId)
        ) {
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
        throw new Error(
          "A folder with this name already exists in the same location"
        );
      }

      existingFolder.setName(input.name);
    }

    return this.folderRepository.updateFolder(existingFolder);
  }
}
