import { Chunk } from "../../shared/utils/chunking";

export interface IEmbeddingService {
    generateEmbeddings(chunks: Chunk[]): Promise<number[][]>;

}