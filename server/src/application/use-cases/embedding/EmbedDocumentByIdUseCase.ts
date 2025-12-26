import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { DocumentProcessingService } from "../../../infrastructure/services/DocumentProcessingService";
import { GetDocumentContentUseCase } from "../documents/GetDocumentContentUseCase";

export class EmbedDocumentByIdUseCase {
    constructor(
        private embeddingService: IEmbeddingService,
        private embeddingRepository: IEmbeddingRepository,
        private getDocumentContentUseCase: GetDocumentContentUseCase,
        private documentProcessingService: DocumentProcessingService,
        private chunkingService: ChunkingService,
    ) { }
    async execute(documentId: string) {

        const document = await this.getDocumentContentUseCase.execute(documentId);
        const text = await this.documentProcessingService.getText(
            new Uint8Array(document.content)
        );
        const chunks = await this.chunkingService.chunkText(text);
        const embeddings = await this.embeddingService.generateEmbeddings(chunks);
        await this.embeddingRepository.storeEmbedding(documentId, embeddings, chunks);
    }
}