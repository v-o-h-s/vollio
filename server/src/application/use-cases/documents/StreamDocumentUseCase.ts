import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { Readable } from "stream";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { FastifyBaseLogger } from "fastify";

interface SignedDocumentTokenPayload {
  documentId: string;
  userId: string;
  purpose: "document-stream";
}
/**
 * Use case to stream a document from Google Drive using a signed URL token
 * check auth and token validity
 *
 */
export class StreamDocumentUseCase {
  constructor(
    private googleDriveService: IGoogleDriveService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private documentRepository: IDocumentRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private logger: FastifyBaseLogger
  ) {}

  async execute(token: string): Promise<Readable> {
    this.logger.info("Executing StreamDocumentUseCase");
    let payload: SignedDocumentTokenPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as SignedDocumentTokenPayload;
    } catch (err) {
      this.logger.warn(
        { err },
        "Invalid or expired token in StreamDocumentUseCase"
      );
      throw new NotFoundError("Invalid or expired token");
    }
    const { documentId, userId, purpose } = payload;
    if (purpose !== "document-stream") {
      this.logger.warn(
        { purpose },
        "Invalid token purpose in StreamDocumentUseCase"
      );
      throw new NotFoundError("Invalid token purpose");
    }

    this.logger.info({ documentId, userId }, "Streaming document from Google Drive");

    // Ensure user has valid tokens (auto-refreshes if expired)
    await this.ensureValidTokenUseCase.execute(userId);

    // Get tokens after ensuring validity
    const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
    if (!tokens) {
      this.logger.error(
        { userId },
        "No Google Classroom tokens found for user in StreamDocumentUseCase"
      );
      throw new NotFoundError("No Google Classroom tokens found for user");
    }
    // Fetch document metadata from repository
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document || !document.getGoogleDocumentId()) {
      this.logger.warn(
        { documentId },
        "Document not found or no Google Drive ID in StreamDocumentUseCase"
      );
      throw new NotFoundError("Document not found");
    }

    // Stream document from Google Drive
    const stream = await this.googleDriveService.streamDocument(
      tokens.access_token,
      document.getGoogleDocumentId()!
    );
    this.logger.info({ documentId }, "StreamDocumentUseCase streaming started");
    return stream;
  }
}
