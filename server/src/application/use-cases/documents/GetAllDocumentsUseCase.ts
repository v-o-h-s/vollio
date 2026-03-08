import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { DocumentDetails } from "../../../shared";
import { FastifyBaseLogger } from "fastify";

export class GetAllDocumentsUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId: string): Promise<DocumentDetails[]> {
    this.logger.info({ userId }, "Executing GetAllDocumentsUseCase");
    const documents = await this.documentRepository.getAllDocumentsByUserId(
      userId
    );

    const result = documents.map((document) => {
      const source = document.getSource();
      const isGoogleDriveDocument = !!source.googleDocumentId;

      return {
        id: document.getId(),
        name: document.getName(),
        size: document.getSize(),
        mimeType: document.getMimeType(),
        folderId: document.getFolderId() || null,
        isGoogleDriveDocument: !!document.getSource().googleDocumentId,
        uploadedAt: new Date().toISOString(), // This should come from the entity if needed
      };
    });

    this.logger.info(
      { userId, count: result.length },
      "GetAllDocumentsUseCase executed successfully"
    );
    return result;
  }
}
