import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";
import { FastifyBaseLogger } from "fastify";

interface GetFolderByIdInput {
  userId: string;
  folderId: string;
}

export class GetFolderByIdUseCase {
  constructor(
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: GetFolderByIdInput): Promise<Folder> {
    this.logger.info(
      { folderId: input.folderId, userId: input.userId },
      "Executing GetFolderByIdUseCase"
    );
    const folder = await this.folderRepository.getFolderEntity(
      input.folderId,
      input.userId
    );

    if (!folder) {
      this.logger.warn(
        { folderId: input.folderId, userId: input.userId },
        "Folder not found in GetFolderByIdUseCase"
      );
      throw new Error("Folder not found or access denied");
    }

    this.logger.info(
      { folderId: input.folderId },
      "GetFolderByIdUseCase executed successfully"
    );
    return folder;
  }
}
