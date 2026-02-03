import { IChunkRepository } from "../../../domain/repositories/IChunkRepository";
import { ChunkDocumentByIdUseCase } from "./ChunkDocumentByIdUseCase";

export class EnsureDocumentChunkedUseCase {
  constructor(
    private chunkRepository: IChunkRepository,
    private chunkDocumentByIdUseCase: ChunkDocumentByIdUseCase,
  ) {}

  async execute(documentId: string, userId: string): Promise<void> {
    const isChunked = await this.chunkRepository.isDocumentChunked(documentId);
    if (!isChunked) {
      await this.chunkDocumentByIdUseCase.execute(documentId, userId);
    }
  }
}
