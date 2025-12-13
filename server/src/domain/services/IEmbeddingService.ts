export interface IEmbeddingService {
    generateEmbeddings(
        texts: string[],
        model?: string
    ): Promise<any>;
}