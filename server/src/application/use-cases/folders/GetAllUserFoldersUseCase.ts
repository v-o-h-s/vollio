import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";
import { FastifyBaseLogger } from "fastify";

interface GetAllUserFoldersInput {
  userId: string;
}

interface FolderWithPdfCount extends Folder {
  documentCount: number;
}

export class GetAllUserFoldersUseCase {
  constructor(
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(
    input: GetAllUserFoldersInput
  ): Promise<Array<FolderWithPdfCount>> {
    this.logger.info(
      { userId: input.userId },
      "Executing GetAllUserFoldersUseCase"
    );
    const folders = await this.folderRepository.getAllUserFolders(input.userId);
    this.logger.info(
      { userId: input.userId, count: folders.length },
      "GetAllUserFoldersUseCase executed successfully"
    );
    return folders;
  }
}
