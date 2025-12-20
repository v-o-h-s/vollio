import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { File } from "../../../domain/entities/File";
import { FastifyBaseLogger } from "fastify";

export interface RenameFileInput {
  fileId: string;
  filename: string;
}

export class RenameFileUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: RenameFileInput): Promise<File> {
    this.logger.info(
      { fileId: input.fileId, newFileName: input.filename },
      "Executing RenameFileUseCase"
    );
    // Validate filename
    this.validateFilename(input.filename);

    // Check file exists
    const file = await this.fileRepository.getFileById(input.fileId);
    if (!file) {
      this.logger.warn(
        { fileId: input.fileId },
        "File not found in RenameFileUseCase"
      );
      throw new NotFoundError("File not found");
    }

    // Update filename
    const result = await this.fileRepository.updateFileName(
      input.fileId,
      input.filename
    );
    this.logger.info(
      { fileId: input.fileId },
      "RenameFileUseCase executed successfully"
    );
    return result;
  }

  private validateFilename(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      this.logger.warn({ filename }, "Filename validation failed: empty name");
      throw new ServerError("Filename cannot be empty");
    }

    if (filename.length > 255) {
      this.logger.warn(
        { filename },
        "Filename validation failed: name too long"
      );
      throw new ServerError(
        "Filename exceeds maximum length of 255 characters"
      );
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      this.logger.warn(
        { filename },
        "Filename validation failed: invalid characters"
      );
      throw new ServerError("Filename contains invalid characters");
    }
  }
}
