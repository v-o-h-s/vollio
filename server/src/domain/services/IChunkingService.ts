export interface IChunkingService {
    chunkText(text: string): Promise<number[]>
}