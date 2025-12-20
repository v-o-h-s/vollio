import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import crypto from "crypto";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { File } from "../../../domain/entities/File";
import { FastifyBaseLogger } from "fastify";

export class AddFileFromGoogleDriveUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private googleDriveService: IGoogleDriveService,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private logger: FastifyBaseLogger
  ) {}

  async execute(fileGoogleDriveId: string): Promise<void> {
    this.logger.info(
      { fileGoogleDriveId },
      "Executing AddFileFromGoogleDriveUseCase"
    );
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      this.logger.error(
        "No access token available in AddFileFromGoogleDriveUseCase"
      );
      throw new ServerError("No access token available");
    }
    const data = await this.googleDriveService.getFileMetadata(
      tokens.access_token,
      fileGoogleDriveId
    );
    if (!data) {
      this.logger.warn({ fileGoogleDriveId }, "File not found in Google Drive");
      throw new NotFoundError("file is not found");
    }
    const fileId = crypto.randomUUID();

    const file = new File(
      fileId,
      data.name,
      data.size,
      null,
      data.id,
      data.mimeType,
      null
    );

    await this.fileRepository.addFile(file);
    this.logger.info(
      { fileId, fileGoogleDriveId },
      "AddFileFromGoogleDriveUseCase executed successfully"
    );
  }
}
