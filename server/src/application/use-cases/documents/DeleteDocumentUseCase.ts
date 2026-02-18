import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { IStorageQuotaService } from "../../../domain/services/quota/IStorageQuotaService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class DeleteDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageService: IStorageService,
    private storageQuotaService: IStorageQuotaService,
    private logger: FastifyBaseLogger,
  ) {}

  async execute(documentId: string): Promise<void> {
    this.logger.info({ documentId }, "Executing DeleteDocumentUseCase");
    // Get document to retrieve storage path
    const document = await this.documentRepository.getDocumentById(documentId);

    if (!document) {
      this.logger.warn(
        { documentId },
        "Document not found in DeleteDocumentUseCase",
      );
      throw new NotFoundError("Document not found");
    }

    // Delete from database first (RLS enforced)
    await this.documentRepository.deleteDocument(documentId);

    // Delete from storage (only if it has a storage path)
    const source = document.getSource();
    if (source.storagePath) {
      this.logger.info(
        { documentId, storagePath: source.storagePath },
        "Deleting document from storage",
      );
      await this.storageService.deleteDocument(source.storagePath);
    }

    // Release quota
    await this.storageQuotaService
      .releaseStorage(document.getUserId(), document.getSize())
      .catch((err) =>
        this.logger.error({ err }, "Failed to release storage quota"),
      );

    this.logger.info(
      { documentId },
      "DeleteDocumentUseCase executed successfully",
    );
  }
}
