import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";
import { IStorageService } from "../../../domain/services/IStorageService";
import { generateUploadPath } from "../../../shared/utils/uploads";

export class GetDocumentFromGoogleDriveUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private googleDriveService: IGoogleDriveService,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private logger: FastifyBaseLogger,
    private storageService: IStorageService
  ) {}

  async execute(documentId: string, userId: string) {
    this.logger.info(
      { documentId, userId },
      "Executing GetDocumentFromGoogleDriveUseCase"
    );

    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      this.logger.warn({ documentId }, "Document not found in repository");
      throw new NotFoundError("Document not found");
    }

    // 1. Check if the document is already cached in Supabase Storage
    const storagePath = document.getStoragePath();
    if (storagePath) {
      try {
        this.logger.info(
          { documentId, storagePath },
          "Fetching from Supabase Storage"
        );
        const data = await this.storageService.downloadDocument(storagePath);
        return { document, content: data };
      } catch (error) {
        this.logger.warn(
          { documentId, storagePath, error },
          "Failed to fetch from storage, falling back to Google Drive"
        );
      }
    }

    // 2. Fetch from Google Drive if not in storage or storage fetch failed
    const googleId = document.getGoogleDocumentId();
    if (!googleId) {
      this.logger.error({ documentId }, "Document has no Google Drive ID");
      throw new ServerError("Document has no valid source");
    }

    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      this.logger.error("No access token available for Google Drive");
      throw new ServerError("No access token available");
    }

    const data = await this.googleDriveService.getDocumentById(
      tokens.access_token,
      googleId
    );

    if (!data) {
      this.logger.warn({ googleId }, "Document not found in Google Drive");
      throw new NotFoundError("Document not found in Google Drive");
    }

    // 3. Cache the document in Supabase Storage for future use
    const newStoragePath = generateUploadPath(userId, document.getName());
    try {
      this.logger.info(
        { documentId, newStoragePath },
        "Caching document in Supabase Storage"
      );
      await this.storageService.uploadDocument(newStoragePath, data);
      const updatedDocument =
        await this.documentRepository.updateDocumentStoragePath(
          documentId,
          newStoragePath
        );
      this.logger.info(
        { documentId },
        "GetDocumentFromGoogleDriveUseCase executed successfully (cached)"
      );
      return { document: updatedDocument, content: data };
    } catch (error) {
      this.logger.error(
        { error, documentId },
        "Failed to cache document in Supabase Storage"
      );
      // We still return the data we got from Google Drive
    }

    this.logger.info(
      { documentId },
      "GetDocumentFromGoogleDriveUseCase executed successfully"
    );
    return { document, content: data };
  }
}
