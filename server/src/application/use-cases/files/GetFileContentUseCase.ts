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
    // Get file metadata from repository
    // Note: RLS in FileRepository ensures user can only access their own files
    const file = await this.fileRepository.getFileById(fileId);

    if (!file) {
      throw new NotFoundError("File not found or access denied");
    }

    const storagePath = file.getSource().storagePath;
    const googleDriveId = file.getGoogleFileId();

    // If file is from Google Drive
    if (!storagePath && googleDriveId) {
      this.logger.debug(`Fetching file from Google Drive: ${googleDriveId}`);
      
      // Ensure valid Google OAuth tokens
      await this.ensureValidTokenUseCase.execute();
      
      const tokens = await this.userGoogleClassroomRepository.getTokens();
      if (!tokens || !tokens.access_token) {
        throw new ServerError("No access token available");
      }

      // Fetch file content from Google Drive
      const content = await this.googleDriveService.getFileById(
        tokens.access_token,
        googleDriveId
      );

      if (!content) {
        throw new NotFoundError("File not found in Google Drive");
      }

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
      this.logger.debug(`Fetching file from storage: ${storagePath}`);
      
      // Download file from storage
      const content = await this.storageService.downloadFile(storagePath);

      if (!content) {
        throw new NotFoundError("File not found in storage");
      }

      return {
        fileId: file.getId(),
        filename: file.getFileName(),
        mimeType: file.getMimeType(),
        content,
        isGoogleDriveFile: false,
      };
    }

    // No valid source found
    throw new ServerError("File has no valid source (neither storage path nor Google Drive ID)");
  }
}
