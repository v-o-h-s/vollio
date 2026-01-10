import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { ChunkDocumentByIdUseCase } from "./ChunkDocumentByIdUseCase";

export class EnsureExistingOfDocumentChunkUseCase {
  constructor(
    private embeddingRepository: IEmbeddingRepository,
    private chunkDocumentByIdUseCase: ChunkDocumentByIdUseCase
  ) {}

  async execute(documentId: string, userId: string): Promise<void> {
    const isChunked = await this.embeddingRepository.isDocumentEmbedded(
      documentId
    );
    if (!isChunked) {
      await this.chunkDocumentByIdUseCase.execute(documentId, userId);
    }
  }
}
