export class Summary {
  private id: string;
  private documentId: string;
  private createdAt: string;
  private updatedAt: string;
  private text?: string;
  constructor(
    documentId: string,
    createdAt?: string,
    updatedAt?: string,
    text?: string,
    id?: string
  ) {
    this.id = id ?? crypto.randomUUID();
    this.documentId = documentId;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
    this.text = text;
  }
  public getText(): string | undefined {
    return this.text;
  }
  public setText(text: string): void {
    this.text = text;
  }
  public getId(): string {
    return this.id;
  }

  public getDocumentId(): string {
    return this.documentId;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }
}
