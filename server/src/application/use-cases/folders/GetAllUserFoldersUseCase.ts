import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";
import { randomUUID } from "crypto";

interface GetAllUserFoldersInput {
  userId: string;
}

interface FolderWithPdfCount extends Folder {
  pdfCount: number;
}

export class GetAllUserFoldersUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(
    input: GetAllUserFoldersInput
  ): Promise<Array<FolderWithPdfCount>> {
    const folders = await this.folderRepository.getAllUserFolders(input.userId);
    return folders;
  }
}
