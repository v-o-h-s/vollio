import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class DeleteFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(fileId: string): Promise<void> {
    this.logger.info({ fileId }, "Executing DeleteFileUseCase");
    // Get file to retrieve storage path
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      this.logger.warn({ fileId }, "File not found in DeleteFileUseCase");
      throw new NotFoundError("File not found");
    }

    // Delete from database first (RLS enforced)
    await this.fileRepository.deleteFile(fileId);

    // Delete from storage (only if it has a storage path)
    const source = file.getSource();
    if (source.storagePath) {
      this.logger.info(
        { fileId, storagePath: source.storagePath },
        "Deleting file from storage"
      );
      await this.storageService.deleteFile(source.storagePath);
    }

    this.logger.info({ fileId }, "DeleteFileUseCase executed successfully");
  }
}
