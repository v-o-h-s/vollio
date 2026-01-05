import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { GetDocumentFromGoogleDriveUseCase } from "./GetDocumentFromGoogleDriveUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
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
 * based on the document's source type.
 * If fetching from Google Drive, it will now trigger the caching flow.
 */
export class GetDocumentContentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageService: IStorageService,
    private getDocumentFromGoogleDriveUseCase: GetDocumentFromGoogleDriveUseCase,
    private logger: FastifyBaseLogger
  ) {}

  async execute(
    documentId: string,
    userId: string
  ): Promise<GetDocumentContentResult> {
    this.logger.info(
      { documentId, userId },
      "Executing GetDocumentContentUseCase"
    );

    const document = await this.documentRepository.getDocumentById(documentId);

    if (!document) {
      this.logger.warn({ documentId }, "Document not found or access denied");
      throw new NotFoundError("Document not found or access denied");
    }

    const isGoogleDriveDocument = !!document.getGoogleDocumentId();

    if (isGoogleDriveDocument) {
      this.logger.info(
        { documentId },
        "Document is Google Drive file, ensuring cache and content"
      );
      const { content } = await this.getDocumentFromGoogleDriveUseCase.execute(
        documentId,
        userId
      );

      return {
        documentId: document.getId(),
        name: document.getName(),
        mimeType: document.getMimeType(),
        content,
        isGoogleDriveDocument: true,
      };
    }

    const storagePath = document.getStoragePath();
    if (!storagePath) {
      this.logger.error(
        { documentId },
        "Document has no storage path and is not a Google Drive file"
      );
      throw new Error("Document content not found");
    }

    const content = await this.storageService.downloadDocument(storagePath);
    if (!content) {
      this.logger.warn(
        { storagePath },
        "Document found in DB but not in storage"
      );
      throw new NotFoundError("Document content not found in storage");
    }

    return {
      documentId: document.getId(),
      name: document.getName(),
      mimeType: document.getMimeType(),
      content,
      isGoogleDriveDocument: false,
    };
  }
}
