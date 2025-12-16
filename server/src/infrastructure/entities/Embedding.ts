import { ChunkMetadata } from "../../shared/utils/chunking";

export class Embedding {
    private id: string;
    private documentId: string;
    private content: string;
    private embedding: number[];
    private chunkIndex: number;
    private tokenCount: number;
    private metadata: ChunkMetadata;
    constructor(
        id: string,
        documentId: string,
        content: string,
        embedding: number[],
        chunkIndex: number,
        tokenCount: number,
        metadata: ChunkMetadata,
    ) {
        if (!id) throw new Error("Embedding id is required");
        if (!documentId) throw new Error("documentId is required");
        if (!Array.isArray(embedding) || embedding.length === 0) throw new Error("embedding vector is required");

        this.id = id;
        this.documentId = documentId;
        this.content = content;
        this.embedding = embedding;
        this.chunkIndex = chunkIndex;
        this.tokenCount = tokenCount;
        this.metadata = metadata;
    }
    
    public getId(): string {
        return this.id;
    }

    public getDocumentId(): string {
        return this.documentId;
    }

    public getContent(): string {
        return this.content;
    }

    public getEmbedding(): number[] {
        return this.embedding;
    }

    public getChunkIndex(): number {
        return this.chunkIndex;
    }

    public getTokenCount(): number {
        return this.tokenCount;
    }

    public getMetadata(): ChunkMetadata {
        return this.metadata;
    }

    public toJSON() {
        return {
            id: this.id,
            documentId: this.documentId,
            content: this.content,
            embedding: this.embedding,
            chunkIndex: this.chunkIndex,
            tokenCount: this.tokenCount,
            metadata: this.metadata,
        };
    }
}
