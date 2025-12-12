import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

interface CreateFolderInput {
  userId: string;
  name: string;
  parentId?: string | null;
}

export class CreateFolderUseCase {

  constructor(private folderRepository: IFolderRepository, private logger: FastifyBaseLogger) {}

  async execute(input: CreateFolderInput): Promise<Folder> {
    // Validate folder name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Folder name is required");
    }

    const folderName = input.name.trim();
    if (folderName.length > 255) {
      throw new Error("Folder name cannot exceed 255 characters");
    }

    // Check for duplicate folder names in the same parent
    const nameExists = await this.folderRepository.folderNameExists(
      folderName,
      input.parentId || null,
      input.userId
    );

    if (nameExists) {
      throw new Error(
        `A folder with the name "${folderName}" already exists in this location`
      );
    }

    // If parent_id provided, validate it exists and belongs to user
    if (input.parentId) {
      const parentFolder = await this.folderRepository.getFolderById(
        input.parentId,
        input.userId
      );

      if (!parentFolder) {
        throw new Error("Parent folder not found or access denied");
      }
    }

    // Create the domain entity
    const folder = new Folder(
      randomUUID(),
      input.userId,
      folderName,
      input.parentId || null
    );
   this.logger.info(`Creating folder ${folder}`);
    return this.folderRepository.createFolder(folder);
  }
}
