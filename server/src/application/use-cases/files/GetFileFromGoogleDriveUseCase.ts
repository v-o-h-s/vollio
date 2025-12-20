import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class GetFileFromGoogleDriveUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private googleDriveService: IGoogleDriveService,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(fileId: string) {
    this.logger.info({ fileId }, "Executing GetFileFromGoogleDriveUseCase");
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      this.logger.error(
        "No access token available in GetFileFromGoogleDriveUseCase"
      );
      throw new ServerError("No access token available");
    }
    const file = await this.fileRepository.getFileById(fileId);
    if (!file) {
      this.logger.warn(
        { fileId },
        "File not found in GetFileFromGoogleDriveUseCase (repository)"
      );
      throw new NotFoundError("File not found");
    }
    if (!file.getGoogleFileId()) {
      this.logger.warn(
        { fileId },
        "File has no Google Drive ID in GetFileFromGoogleDriveUseCase"
      );
      throw new NotFoundError("File not found");
    }
    const data: Buffer = await this.googleDriveService.getFileById(
      tokens.access_token,
      file.getGoogleFileId()!
    );

    if (!data) {
      this.logger.warn(
        { googleFileId: file.getGoogleFileId() },
        "File not found in Google Drive during GetFileFromGoogleDriveUseCase"
      );
      throw new NotFoundError("file is not found in google drive");
    }

    this.logger.info(
      { fileId },
      "GetFileFromGoogleDriveUseCase executed successfully"
    );
    return { file, content: data };
  }
}
