import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { Folder } from "../../../domain/entities/Folder";

interface GetFolderByIdInput {
  userId: string;
  folderId: string;
}

export class GetFolderByIdUseCase {
  constructor(private folderRepository: IFolderRepository) {}

  async execute(input: GetFolderByIdInput): Promise<Folder> {
    const folder = await this.folderRepository.getFolderEntity(
      input.folderId,
      input.userId
    );

    if (!folder) {
      throw new Error("Folder not found or access denied");
    }

    return folder;
  }
}
