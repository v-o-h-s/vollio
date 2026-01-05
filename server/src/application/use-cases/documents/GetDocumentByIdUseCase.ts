import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { GetDocumentFromGoogleDriveUseCase } from "./GetDocumentFromGoogleDriveUseCase";
import "dotenv/config";
import { FastifyBaseLogger } from "fastify";

export interface GetDocumentByIdResult {
  id: string;
  name: string;
  documentUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}

export class GetDocumentByIdUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageService: IStorageService,
    private getDocumentFromGoogleDriveUseCase: GetDocumentFromGoogleDriveUseCase,
    private logger: FastifyBaseLogger
  ) {}

  async execute(
    documentId: string,
    userId: string
  ): Promise<GetDocumentByIdResult> {
    this.logger.info(
      { documentId, userId },
      "Executing GetDocumentByIdUseCase"
    );

    let document = await this.documentRepository.getDocumentById(documentId);

    if (!document) {
      this.logger.warn({ documentId }, "Document not found");
      throw new NotFoundError("Document not found");
    }

    const isGoogleDriveDocument = !!document.getGoogleDocumentId();

    // If it's a Google Drive document and not yet cached, trigger caching
    // This follows the approach of handling classroom files specifically.
    if (isGoogleDriveDocument && !document.getStoragePath()) {
      this.logger.info(
        { documentId },
        "Document is Google Drive file and not cached, triggering cache flow"
      );
      try {
        const result = await this.getDocumentFromGoogleDriveUseCase.execute(
          documentId,
          userId
        );
        document = result.document;
      } catch (error) {
        this.logger.error(
          { error, documentId },
          "Failed to cache Google Drive document during GetDocumentById"
        );
        // Fallback: return our proxy URL so the client can still try to load/cache it
        const proxyUrl = `${
          process.env.APP_URL || "http://localhost:3000"
        }/api/v1/documents/google-drive/${documentId}`;

        return {
          id: document.getId(),
          name: document.getName(),
          documentUrl: proxyUrl,
          size: document.getSize(),
          mimeType: document.getMimeType(),
          uploadedAt: new Date().toISOString(),
          folderId: document.getFolderId(),
          isGoogleDriveDocument: true,
        };
      }
    }

    const storagePath = document.getStoragePath();
    let documentUrl = "";

    if (storagePath) {
      documentUrl = await this.storageService.getSignedUrl(storagePath);
    } else if (isGoogleDriveDocument) {
      // Should ideally be unreachable due to the logic above, but for safety:
      documentUrl = `${
        process.env.APP_URL || "http://localhost:3000"
      }/api/v1/documents/google-drive/${documentId}`;
    }

    this.logger.info(
      { documentId, hasStoragePath: !!storagePath },
      "GetDocumentByIdUseCase executed successfully"
    );

    return {
      id: document.getId(),
      name: document.getName(),
      documentUrl,
      size: document.getSize(),
      mimeType: document.getMimeType(),
      uploadedAt: new Date().toISOString(),
      folderId: document.getFolderId(),
      isGoogleDriveDocument,
    };
  }
}
