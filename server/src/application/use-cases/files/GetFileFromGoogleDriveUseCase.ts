import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
export class GetFileFromGoogleDriveUseCase {
  private fileRepository: IFileRepository;
  private googleDriveService: IGoogleDriveService;
  private ensureValidTokenUseCase: EnsureValidTokenUseCase;
  private userGoogleClassroomRepository: UserGoogleClassroomRepository;
  constructor(
    fileRepository: IFileRepository,
    googleDriveService: IGoogleDriveService,
    ensureValidTokenUseCase: EnsureValidTokenUseCase,
    userGoogleClassroomRepository: UserGoogleClassroomRepository
  ) {
    this.fileRepository = fileRepository;
    this.googleDriveService = googleDriveService;
    this.ensureValidTokenUseCase = ensureValidTokenUseCase;
    this.userGoogleClassroomRepository = userGoogleClassroomRepository;
  }

  async execute(fileId: string) {
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new ServerError("No access token available");
    }
    const file = await this.fileRepository.getFileById(fileId);
    if (!file) {
      throw new NotFoundError("File not found");
    }
    if (!file.getGoogleFileId()) {
      throw new NotFoundError("File not found");
    }
    const data: Buffer = await this.googleDriveService.getFileById(
      tokens.access_token,
      file.getGoogleFileId()!
    );

    if (!data) {
      throw new NotFoundError("file is not found in google drive");
    }

    return { file, content: data };
  }
}
