// this case is only for the documents stored in our storage, not Google Drive documents
// for the google drive documents , we use streaming from google api directly
import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
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
    private logger: FastifyBaseLogger
  ) {}

  async execute(documentId: string): Promise<GetDocumentByIdResult> {
    this.logger.info({ documentId }, "Executing GetDocumentByIdUseCase");
    const document = await this.documentRepository.getDocumentById(documentId);

    if (!document) {
      this.logger.warn(
        { documentId },
        "Document not found in GetDocumentByIdUseCase"
      );
      throw new NotFoundError("Document not found");
    }
    const storagePath = document.getSource().storagePath!;

    const documentUrl = await this.storageService.getSignedUrl(storagePath);

    this.logger.info(
      { documentId },
      "GetDocumentByIdUseCase executed successfully"
    );
    return {
      id: document.getId(),
      name: document.getName(),
      documentUrl,
      size: document.getSize(),
      mimeType: document.getMimeType(),
      uploadedAt: new Date().toISOString(), // This should come from the entity if needed
      folderId: document.getFolderId(),
      isGoogleDriveDocument: false,
    };
  }
}
