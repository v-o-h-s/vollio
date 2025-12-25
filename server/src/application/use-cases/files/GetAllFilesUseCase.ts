import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { PdfDetails } from '@vollio/shared';
import { FastifyBaseLogger } from "fastify";

export class GetAllFilesUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId: string): Promise<PdfDetails[]> {
    this.logger.info({ userId }, "Executing GetAllFilesUseCase");
    const files = await this.fileRepository.getAllFilesByUserId(userId);

    const result = files.map((file) => {
      const source = file.getSource();
      const isGoogleDriveFile = !!source.googleFileId;

      return {
        id: file.getId(),
        filename: file.getFileName(),
        fileSize: file.getFileSize(),
        mimeType: file.getMimeType(),
        folderId: file.getFolderId() || null,
        isGoogleDriveFile: file.getSource().googleFileId ? true : false,
        uploadedAt: new Date().toISOString(), // This should come from the entity if needed
      };
    });

    this.logger.info(
      { userId, count: result.length },
      "GetAllFilesUseCase executed successfully"
    );
    return result;
  }
}
