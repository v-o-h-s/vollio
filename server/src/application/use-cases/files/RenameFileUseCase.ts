import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { File } from "../../../domain/entities/File";

export interface RenameFileInput {
  fileId: string;
  filename: string;
}

export class RenameFileUseCase {
  constructor(private fileRepository: IFileRepository) {}

  async execute(input: RenameFileInput): Promise<File> {
    // Validate filename
    this.validateFilename(input.filename);

    // Check file exists
    const file = await this.fileRepository.getFileById(input.fileId);
    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Update filename
    return await this.fileRepository.updateFileName(input.fileId, input.filename);
  }

  private validateFilename(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      throw new ServerError("Filename cannot be empty");
    }

    if (filename.length > 255) {
      throw new ServerError("Filename exceeds maximum length of 255 characters");
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      throw new ServerError("Filename contains invalid characters");
    }
  }
}
