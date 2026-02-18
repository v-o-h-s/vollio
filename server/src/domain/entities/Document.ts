export class Document {
  private id: string;
  private userId: string;
  private name: string;
  private size: number;
  private storagePath: string | null;
  private googleDocumentId: string | null;
  private mimeType: string;
  private folderId: string | null;

  constructor(
    id: string,
    userId: string,
    name: string,
    size: number,
    storagePath: string | null,
    googleDocumentId: string | null,
    mimeType: string = "application/pdf",
    folderId: string | null = null,
  ) {
    // Validate that at least one of storagePath or googleDocumentId is provided
    if (!storagePath && !googleDocumentId) {
      throw new Error(
        "Either 'storagePath' or 'googleDocumentId' must be provided",
      );
    }

    this.id = id;
    this.userId = userId;
    this.name = name;
    this.size = size;
    this.storagePath = storagePath ?? null;
    this.googleDocumentId = googleDocumentId ?? null;
    this.mimeType = mimeType;
    this.folderId = folderId ?? null;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getGoogleDocumentId() {
    return this.googleDocumentId;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getSize(): number {
    return this.size;
  }

  public getSource(): {
    storagePath?: string | null;
    googleDocumentId?: string | null;
  } {
    return {
      storagePath: this.storagePath,
      googleDocumentId: this.googleDocumentId,
    };
  }

  public getStoragePath(): string | null {
    return this.storagePath;
  }

  public getMimeType(): string {
    return this.mimeType;
  }

  public getFolderId(): string | null {
    return this.folderId;
  }

  public getSizeInMB(): number {
    return this.size / (1024 * 1024);
  }

  public getSizeInKB(): number {
    return this.size / 1024;
  }
}
