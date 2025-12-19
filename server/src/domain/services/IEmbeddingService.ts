import { Chunk } from "../../shared/utils/chunking";
/**
 * Service interface for generating embeddings.
 * This service is responsible for creating vector representations of text chunks
 * in other way this interface defines the contract for any embedding generation service.
 */
export interface IEmbeddingService {
    generateEmbeddings(chunks: Chunk[]): Promise<number[][]>;
    generateEmbeddingForText(text: string): Promise<number[]>;
}