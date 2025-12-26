import { Embedding } from "../../infrastructure/entities/Embedding";
import { Chunk, ChunkMetadata } from "../../shared/utils/chunking";

export interface IEmbeddingRepository {
  storeEmbedding(
    documentId: string,
    embedding: number[][],
    chunks: Chunk[]
  ): Promise<void>;
  searchSimilarEmbeddings(
    queryEmbedding: number[],
    matchThreshold: number,
    matchCount: number
  ): Promise<Embedding[] | null>;
  isDocumentEmbedded(documentId: string): Promise<boolean>;
  getDocumentEmbeddings(documentId: string): Promise<Embedding[]>;
}
