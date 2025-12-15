import { Chunk } from "../../shared/utils/chunking";

export interface IEmbeddingStorageRepository {
    storeEmbedding(documentId: string, embedding: number[][], chunks: Chunk[]): Promise<void>;
    searchSimilarEmbeddings(queryEmbedding: number[], matchThreshold?: number, matchCount?: number): Promise<Array<{
        id: string;
        documentId: string;
        content: string;
        similarity: number;
        chunkIndex: number;
    }>>;
}