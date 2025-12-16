import { IEmbeddingRepository } from "../../domain/repositories/IEmbeddingRepository";
import { IEmbeddingService } from "../../domain/services/IEmbeddingService";
import { ISemanticSearchService } from "../../domain/services/ISemanticSearchService";
import { Chunk, ChunkMetadata } from "../../shared/utils/chunking";

export class SemanticSearchService implements ISemanticSearchService {
    constructor(private embeddingService: IEmbeddingService,
        private embeddingRepository: IEmbeddingRepository,
        ) { }
    async findRelevantChunks(prompt: string): Promise<{ content: string, metadata: ChunkMetadata }[]> {
        const promptEmbedding = await this.embeddingService.generateEmbeddingForText(prompt);
        const relevantEmbeddings = await this.embeddingRepository.searchSimilarEmbeddings(
            promptEmbedding,
            0.67,
            5
        );
        if (relevantEmbeddings === null || relevantEmbeddings.length === 0) {
            throw new Error("No relevant content found to generate the quiz.");
        }
        return relevantEmbeddings.map(e => ({ content: e.getContent(), metadata: e.getMetadata() }));
    }
}