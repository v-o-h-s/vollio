import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class DeleteFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService
  ) { }

  async execute(fileId: string): Promise<void> {
    // Get file to retrieve storage path
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Delete from database first (RLS enforced)
    await this.fileRepository.deleteFile(fileId);

    // Delete from storage (only if it has a storage path)
    const source = file.getSource();
    if (source.storagePath) {

      await this.storageService.deleteFile(source.storagePath);

    }
  }
}
