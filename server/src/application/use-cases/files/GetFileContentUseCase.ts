import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { FastifyBaseLogger } from "fastify";

export interface GetFileContentResult {
  fileId: string;
  filename: string;
  mimeType: string;
  content: Buffer;
  isGoogleDriveFile: boolean;
}

/**
 * Use case to retrieve file content from either Google Drive or Supabase Storage
 * based on the file's source type
 */
export class GetFileContentUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private storageService: IStorageService,
    private googleDriveService: IGoogleDriveService,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(fileId: string): Promise<GetFileContentResult> {
    this.logger.info({ fileId }, "Executing GetFileContentUseCase");
    // Get file metadata from repository
    // Note: RLS in FileRepository ensures user can only access their own files
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      this.logger.warn({ fileId }, "File not found in GetFileContentUseCase");
      throw new NotFoundError("File not found or access denied");
    }

    const storagePath = file.getSource().storagePath;
    const googleDriveId = file.getGoogleFileId();

    // If file is from Google Drive
    if (!storagePath && googleDriveId) {
      this.logger.info(
        { fileId, googleDriveId },
        "Fetching file from Google Drive"
      );

      // Ensure valid Google OAuth tokens
      await this.ensureValidTokenUseCase.execute();

      const tokens = await this.userGoogleClassroomRepository.getTokens();
      if (!tokens || !tokens.access_token) {
        this.logger.error("No access token available in GetFileContentUseCase");
        throw new ServerError("No access token available");
      }

      // Fetch file content from Google Drive
      const content = await this.googleDriveService.getFileById(
        tokens.access_token,
        googleDriveId
      );

      if (!content) {
        this.logger.warn(
          { googleDriveId },
          "File not found in Google Drive during GetFileContentUseCase"
        );
        throw new NotFoundError("File not found in Google Drive");
      }

      this.logger.info(
        { fileId },
        "GetFileContentUseCase executed successfully (Google Drive)"
      );
      return {
        fileId: file.getId(),
        filename: file.getFileName(),
        mimeType: file.getMimeType(),
        content,
        isGoogleDriveFile: true,
      };
    }

    // If file is from Supabase Storage
    if (storagePath) {
      this.logger.info({ fileId, storagePath }, "Fetching file from storage");

      // Download file from storage
      const content = await this.storageService.downloadFile(storagePath);

      if (!content) {
        this.logger.warn(
          { storagePath },
          "File not found in storage during GetFileContentUseCase"
        );
        throw new NotFoundError("File not found in storage");
      }

      this.logger.info(
        { fileId },
        "GetFileContentUseCase executed successfully (Storage)"
      );
      return {
        fileId: file.getId(),
        filename: file.getFileName(),
        mimeType: file.getMimeType(),
        content,
        isGoogleDriveFile: false,
      };
    }

    // No valid source found
    this.logger.error(
      { fileId },
      "File has no valid source in GetFileContentUseCase"
    );
    throw new ServerError(
      "File has no valid source (neither storage path nor Google Drive ID)"
    );
  }
}
