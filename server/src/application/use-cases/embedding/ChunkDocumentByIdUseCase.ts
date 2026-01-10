import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { DocumentProcessingService } from "../../../infrastructure/services/DocumentProcessingService";
import { GetDocumentContentUseCase } from "../documents/GetDocumentContentUseCase";

export class ChunkDocumentByIdUseCase {
  constructor(
    private embeddingRepository: IEmbeddingRepository,
    private getDocumentContentUseCase: GetDocumentContentUseCase,
    private documentProcessingService: DocumentProcessingService,
    private chunkingService: ChunkingService
  ) {}

  async execute(documentId: string, userId: string) {
    const document = await this.getDocumentContentUseCase.execute(
      documentId,
      userId
    );
    const text = await this.documentProcessingService.getText(
      new Uint8Array(document.content)
    );
    const chunks = await this.chunkingService.chunkText(text);
    
    // We store chunks with empty embeddings since we only need the text for now
    // We'll use an array of empty arrays for embeddings
    const emptyEmbeddings = chunks.map(() => []);
    
    await this.embeddingRepository.storeEmbedding(
      documentId,
      emptyEmbeddings,
      chunks
    );
  }
}
