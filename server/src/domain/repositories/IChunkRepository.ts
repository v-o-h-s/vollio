import { ChunkEntity } from "../../infrastructure/entities/Chunk";
import { Chunk } from "../../shared/utils/chunking";

export interface IChunkRepository {
  storeChunks(documentId: string, chunks: Chunk[]): Promise<void>;
  searchSimilarChunks(
    queryVector: number[],
    matchThreshold: number,
    matchCount: number,
  ): Promise<ChunkEntity[] | null>;
  isDocumentChunked(documentId: string): Promise<boolean>;
  getDocumentChunks(documentId: string): Promise<ChunkEntity[]>;
}
