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
  constructor(
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: CreateFolderInput): Promise<Folder> {
    this.logger.info(
      {
        userId: input.userId,
        folderName: input.name,
        parentId: input.parentId,
      },
      "Executing CreateFolderUseCase"
    );
    // Validate folder name
    if (!input.name || input.name.trim().length === 0) {
      this.logger.warn(
        { userId: input.userId },
        "Folder name validation failed in CreateFolderUseCase: empty name"
      );
      throw new Error("Folder name is required");
    }

    const folderName = input.name.trim();
    if (folderName.length > 255) {
      this.logger.warn(
        { userId: input.userId, folderName },
        "Folder name validation failed in CreateFolderUseCase: name too long"
      );
      throw new Error("Folder name cannot exceed 255 characters");
    }

    // Check for duplicate folder names in the same parent
    const nameExists = await this.folderRepository.folderNameExists(
      folderName,
      input.parentId || null,
      input.userId
    );

    if (nameExists) {
      this.logger.warn(
        { userId: input.userId, folderName, parentId: input.parentId },
        "Folder already exists in CreateFolderUseCase"
      );
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
        this.logger.warn(
          { userId: input.userId, parentId: input.parentId },
          "Parent folder not found in CreateFolderUseCase"
        );
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
    const result = await this.folderRepository.createFolder(folder);
    this.logger.info(
      { folderId: result.getId() },
      "CreateFolderUseCase executed successfully"
    );
    return result;
  }
}
