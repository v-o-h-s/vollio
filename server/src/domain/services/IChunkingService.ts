import { ExtractedContent } from "../../shared/utils/chunking";

export interface IChunkingService {
    chunkText(text: ExtractedContent): Promise<number[]>
}