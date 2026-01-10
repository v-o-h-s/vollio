import { ChunkMetadata } from "../../shared/utils/chunking";

export class Embedding {
    private id: string;
    private documentId: string;
    private content: string;
    private embedding: number[] | null;
    private tokenCount: number;
    private metadata: ChunkMetadata;
    constructor(
        id: string,
        documentId: string,
        content: string,
        embedding: number[] | null,
        tokenCount: number,
        metadata: ChunkMetadata,
    ) {


        this.id = id;
        this.documentId = documentId;
        this.content = content;
        this.embedding = embedding;
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

    public getEmbedding(): number[] | null {
        return this.embedding;
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
            tokenCount: this.tokenCount,
            metadata: this.metadata,
        };
    }
}
