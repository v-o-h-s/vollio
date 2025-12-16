import { Chunk } from "../../shared/utils/chunking";

export interface IEmbeddingRepository {
    storeEmbedding(documentId: string, embedding: number[][], chunks: Chunk[]): Promise<void>;
    searchSimilarEmbeddings(queryEmbedding: number[], matchThreshold?: number, matchCount?: number): Promise<any>;

    isFileEmbedded(fileId: string): Promise<boolean>;
}
