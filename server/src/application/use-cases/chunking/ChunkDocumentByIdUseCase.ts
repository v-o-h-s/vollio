import { IChunkRepository } from "../../../domain/repositories/IChunkRepository";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { DocumentProcessingService } from "../../../infrastructure/services/DocumentProcessingService";
import { GetDocumentContentUseCase } from "../documents/GetDocumentContentUseCase";

export class ChunkDocumentByIdUseCase {
  constructor(
    private chunkRepository: IChunkRepository,
    private getDocumentContentUseCase: GetDocumentContentUseCase,
    private documentProcessingService: DocumentProcessingService,
    private chunkingService: ChunkingService,
  ) {}

  async execute(documentId: string, userId: string) {
    const document = await this.getDocumentContentUseCase.execute(
      documentId,
      userId,
    );
    const text = await this.documentProcessingService.getText(
      new Uint8Array(document.content),
    );
    const chunks = await this.chunkingService.chunkText(text);

    await this.chunkRepository.storeChunks(documentId, chunks);
  }
}
