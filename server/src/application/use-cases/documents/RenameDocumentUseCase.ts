import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { Document } from "../../../domain/entities/Document";
import { FastifyBaseLogger } from "fastify";

export interface RenameDocumentInput {
  documentId: string;
  name: string;
}

export class RenameDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: RenameDocumentInput): Promise<Document> {
    this.logger.info(
      { documentId: input.documentId, newName: input.name },
      "Executing RenameDocumentUseCase"
    );
    // Validate name
    this.validateName(input.name);

    // Check document exists
    const document = await this.documentRepository.getDocumentById(
      input.documentId
    );
    if (!document) {
      this.logger.warn(
        { documentId: input.documentId },
        "Document not found in RenameDocumentUseCase"
      );
      throw new NotFoundError("Document not found");
    }

    // Update name
    const result = await this.documentRepository.updateDocumentName(
      input.documentId,
      input.name
    );
    this.logger.info(
      { documentId: input.documentId },
      "RenameDocumentUseCase executed successfully"
    );
    return result;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      this.logger.warn({ name }, "Name validation failed: empty name");
      throw new ServerError("Name cannot be empty");
    }

    if (name.length > 255) {
      this.logger.warn({ name }, "Name validation failed: name too long");
      throw new ServerError("Name exceeds maximum length of 255 characters");
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      this.logger.warn({ name }, "Name validation failed: invalid characters");
      throw new ServerError("Name contains invalid characters");
    }
  }
}
