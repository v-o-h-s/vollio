import { ExtractedContent } from "../../shared/utils/chunking";

/**
 * Service interface for chunking text.
 * This service is responsible for breaking down large text content into smaller, manageable chunks
 * for further processing such as embedding generation or analysis.
 */
export interface IChunkingService {
    chunkText(text: ExtractedContent): Promise<number[]>
}