import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import crypto from "crypto";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { File } from "../../../domain/entities/File";
export class AddFileFromGoogleDriveUseCase {
  private fileRepository: IFileRepository;
  private googleDriveService: IGoogleDriveService;
  private ensureValidTokenUseCase: EnsureValidTokenUseCase;
  private userGoogleClassroomRepository: UserGoogleClassroomRepository;
  constructor(
    fileRepository: IFileRepository,
    googleDriveService: IGoogleDriveService,
    userGoogleClassroomRepository: UserGoogleClassroomRepository,
    ensureValidTokenUseCase: EnsureValidTokenUseCase
  ) {
    this.fileRepository = fileRepository;
    this.googleDriveService = googleDriveService;
    this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    this.ensureValidTokenUseCase = ensureValidTokenUseCase;
  }
  async execute(fileGoogleDriveId: string): Promise<void> {
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new ServerError("No access token available");
    }
    const data = await this.googleDriveService.getFileMetadata(
      tokens.access_token,
      fileGoogleDriveId
    );
    if (!data) {
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
  }
}
