import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { Readable } from "stream";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { FastifyBaseLogger } from "fastify";

interface SignedPdfTokenPayload {
  fileId: string;
  userId: string;
  purpose: "pdf-stream";
}
/**
 * Use case to stream a file from Google Drive using a signed URL token
 * check auth and token validity
 *
 */
export class StreamFileUseCase {
  constructor(
    private googleDriveService: IGoogleDriveService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private fileRepository: IFileRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private logger: FastifyBaseLogger
  ) {}

  async execute(token: string): Promise<Readable> {
    this.logger.info("Executing StreamFileUseCase");
    let payload: SignedPdfTokenPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as SignedPdfTokenPayload;
    } catch (err) {
      this.logger.warn(
        { err },
        "Invalid or expired token in StreamFileUseCase"
      );
      throw new NotFoundError("Invalid or expired token");
    }
    const { fileId, userId, purpose } = payload;
    if (purpose !== "pdf-stream") {
      this.logger.warn(
        { purpose },
        "Invalid token purpose in StreamFileUseCase"
      );
      throw new NotFoundError("Invalid token purpose");
    }

    this.logger.info({ fileId, userId }, "Streaming file from Google Drive");

    // Ensure user has valid tokens (auto-refreshes if expired)
    await this.ensureValidTokenUseCase.execute(userId);

    // Get tokens after ensuring validity
    const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
    if (!tokens) {
      this.logger.error(
        { userId },
        "No Google Classroom tokens found for user in StreamFileUseCase"
      );
      throw new NotFoundError("No Google Classroom tokens found for user");
    }
    // Fetch file metadata from repository
    const file = await this.fileRepository.getFileById(fileId);
    if (!file || !file.getGoogleFileId()) {
      this.logger.warn(
        { fileId },
        "File not found or no Google Drive ID in StreamFileUseCase"
      );
      throw new NotFoundError("File not found");
    }

    // Stream file from Google Drive
    const stream = await this.googleDriveService.streamFile(
      tokens.access_token,
      file.getGoogleFileId()!
    );
    this.logger.info({ fileId }, "StreamFileUseCase streaming started");
    return stream;
  }
}
