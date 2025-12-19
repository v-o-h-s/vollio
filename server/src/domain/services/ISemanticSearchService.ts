import { Chunk, ChunkMetadata } from "../../shared/utils/chunking";

export interface ISemanticSearchService {
    findRelevantChunks(prompt: string): Promise<{ content: string, metadata: ChunkMetadata }[]>
}