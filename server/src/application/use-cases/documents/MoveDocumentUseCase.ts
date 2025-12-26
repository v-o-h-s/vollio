import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IFolderRepository } from "../../../domain/repositories/IFolderRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { Document } from "../../../domain/entities/Document";
import { FastifyBaseLogger } from "fastify";

export interface MoveDocumentInput {
  documentId: string;
  folderId: string | null;
  userId: string;
}

export class MoveDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private folderRepository: IFolderRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: MoveDocumentInput): Promise<Document> {
    this.logger.info(
      {
        documentId: input.documentId,
        targetFolderId: input.folderId,
        userId: input.userId,
      },
      "Executing MoveDocumentUseCase"
    );
    // Validate document exists
    const document = await this.documentRepository.getDocumentById(input.documentId);
    if (!document) {
      this.logger.warn(
        { documentId: input.documentId },
        "Document not found in MoveDocumentUseCase"
      );
      throw new NotFoundError("Document not found");
    }

    // Validate folder if provided
    if (input.folderId) {
      const folder = await this.folderRepository.getFolderById(
        input.folderId,
        input.userId
      );
      if (!folder) {
        this.logger.warn(
          { folderId: input.folderId, userId: input.userId },
          "Target folder not found in MoveDocumentUseCase"
        );
        throw new NotFoundError("Folder not found or does not belong to user");
      }
    }

    // Move document
    const result = await this.documentRepository.moveDocument(
      input.documentId,
      input.folderId
    );
    this.logger.info(
      { documentId: input.documentId, targetFolderId: input.folderId },
      "MoveDocumentUseCase executed successfully"
    );
    return result;
  }
}
