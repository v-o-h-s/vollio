import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { EmbedDocumentByIdUseCase } from "./EmbedDocumentByIdUseCase";

export class EnsureExistingOfDocumentEmbeddingUseCase {
  constructor(
    private embeddingRepository: IEmbeddingRepository,
    private embedDocumentByIdUseCase: EmbedDocumentByIdUseCase
  ) {}

  async execute(documentId: string, userId: string): Promise<void> {
    const isEmbedded = await this.embeddingRepository.isDocumentEmbedded(
      documentId
    );
    if (!isEmbedded) {
      await this.embedDocumentByIdUseCase.execute(documentId, userId);
    }
  }
}
