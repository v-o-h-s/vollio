export class Document {
  private id: string;
  private name: string;
  private size: number;
  private storagePath: string | null;
  private googleDocumentId: string | null;
  private mimeType: string;
  private folderId: string | null;
  constructor(
    id: string,
    name: string,
    size: number,
    storagePath: string | null,
    googleDocumentId: string | null,
    mimeType: string = "application/pdf",
    folderId: string | null = null
  ) {
    // Validate that at least one of storagePath or googleDocumentId is provided
    if (!storagePath && !googleDocumentId) {
      throw new Error(
        "Either 'storagePath' or 'googleDocumentId' must be provided"
      );
    }

    this.id = id;
    this.name = name;
    this.size = size;
    this.storagePath = storagePath ?? null;
    this.googleDocumentId = googleDocumentId ?? null;
    this.mimeType = mimeType;
    this.folderId = folderId ?? null;
  }
  getGoogleDocumentId() {
    return this.googleDocumentId;
  }
  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getSize(): number {
    return this.size;
  }
  getSource(): {
    storagePath?: string | null;
    googleDocumentId?: string | null;
  } {
    return {
      storagePath: this.storagePath,
      googleDocumentId: this.googleDocumentId,
    };
  }
  getStoragePath(): string | null {
    return this.storagePath;
  }
  getMimeType(): string {
    return this.mimeType;
  }
  getFolderId(): string | null {
    return this.folderId;
  }
  getSizeInMB(): number {
    return this.size / (1024 * 1024);
  }
  getSizeInKB(): number {
    return this.size / 1024;
  }
}
