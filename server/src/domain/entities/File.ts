export class File {
   
    private id: string;
    private fileName: string;
    private fileSize: number;
    private storagePath?: string;
    private googleFileId?: string;
    private mimeType: string;
    private folderId?: string;
    constructor(
        id: string,
        fileName: string,
        fileSize: number,
        storagePath?: string,
        googleFileId?: string,
        mimeType: string = "application/pdf",
        folderId?: string
    ) {
        // Validate that at least one of storagePath or googleFileId is provided
        if (!storagePath && !googleFileId) {
            throw new Error("Either 'storagePath' or 'googleFileId' must be provided");
        }

        this.id = id;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.storagePath = storagePath;
        this.googleFileId = googleFileId;
        this.mimeType = mimeType;
        this.folderId = folderId;
    }
     getGoogleFileId() {
      return this.googleFileId;
    }
    getId(): string {
        return this.id;
    }
    getFileName(): string {
        return this.fileName;
    }
    getFileSize(): number {
        return this.fileSize;
    }
    getSource(): { storagePath?: string; googleFileId?: string } {
        return {
            storagePath: this.storagePath,
            googleFileId: this.googleFileId,
        };
    }
    getMimeType(): string {
        return this.mimeType;
    }
    getFolderId(): string | undefined {
        return this.folderId;
    }
    getSizeInMB(): number {
        return this.fileSize / (1024 * 1024);
    }
    getSizeInKB(): number {
        return this.fileSize / 1024;
    }
}
