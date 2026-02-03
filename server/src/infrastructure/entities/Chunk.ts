import { ChunkMetadata } from "../../shared/utils/chunking";

export class ChunkEntity {
  private id: string;
  private documentId: string;
  private content: string;
  private tokenCount: number;
  private metadata: ChunkMetadata;
  constructor(
    id: string,
    documentId: string,
    content: string,
    tokenCount: number,
    metadata: ChunkMetadata,
  ) {
    this.id = id;
    this.documentId = documentId;
    this.content = content;
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
      tokenCount: this.tokenCount,
      metadata: this.metadata,
    };
  }
}
