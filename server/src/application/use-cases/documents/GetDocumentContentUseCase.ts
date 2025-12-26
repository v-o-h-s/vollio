import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { FastifyBaseLogger } from "fastify";

export interface GetDocumentContentResult {
  documentId: string;
  name: string;
  mimeType: string;
  content: Buffer;
  isGoogleDriveDocument: boolean;
}

/**
 * Use case to retrieve document content from either Google Drive or Supabase Storage
 * based on the document's source type
 */
export class GetDocumentContentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageService: IStorageService,
    private googleDriveService: IGoogleDriveService,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(documentId: string): Promise<GetDocumentContentResult> {
    this.logger.info({ documentId }, "Executing GetDocumentContentUseCase");
    // Get document metadata from repository
    // Note: RLS in DocumentRepository ensures user can only access their own documents
    const document = await this.documentRepository.getDocumentById(documentId);

    if (!document) {
      this.logger.warn(
        { documentId },
        "Document not found in GetDocumentContentUseCase"
      );
      throw new NotFoundError("Document not found or access denied");
    }

    const storagePath = document.getSource().storagePath;
    const googleDriveId = document.getGoogleDocumentId();

    // If document is from Google Drive
    if (!storagePath && googleDriveId) {
      this.logger.info(
        { documentId, googleDriveId },
        "Fetching document from Google Drive"
      );

      // Ensure valid Google OAuth tokens
      await this.ensureValidTokenUseCase.execute();

      const tokens = await this.userGoogleClassroomRepository.getTokens();
      if (!tokens || !tokens.access_token) {
        this.logger.error(
          "No access token available in GetDocumentContentUseCase"
        );
        throw new ServerError("No access token available");
      }

      // Fetch document content from Google Drive
      const content = await this.googleDriveService.getDocumentById(
        tokens.access_token,
        googleDriveId
      );

      if (!content) {
        this.logger.warn(
          { googleDriveId },
          "Document not found in Google Drive during GetDocumentContentUseCase"
        );
        throw new NotFoundError("Document not found in Google Drive");
      }

      this.logger.info(
        { documentId },
        "GetDocumentContentUseCase executed successfully (Google Drive)"
      );
      return {
        documentId: document.getId(),
        name: document.getName(),
        mimeType: document.getMimeType(),
        content,
        isGoogleDriveDocument: true,
      };
    }

    // If document is from Supabase Storage
    if (storagePath) {
      this.logger.info(
        { documentId, storagePath },
        "Fetching document from storage"
      );

      // Download document from storage
      const content = await this.storageService.downloadDocument(storagePath);

      if (!content) {
        this.logger.warn(
          { storagePath },
          "Document not found in storage during GetDocumentContentUseCase"
        );
        throw new NotFoundError("Document not found in storage");
      }

      this.logger.info(
        { documentId },
        "GetDocumentContentUseCase executed successfully (Storage)"
      );
      return {
        documentId: document.getId(),
        name: document.getName(),
        mimeType: document.getMimeType(),
        content,
        isGoogleDriveDocument: false,
      };
    }

    // No valid source found
    this.logger.error(
      { documentId },
      "Document has no valid source in GetDocumentContentUseCase"
    );
    throw new ServerError(
      "Document has no valid source (neither storage path nor Google Drive ID)"
    );
  }
}
