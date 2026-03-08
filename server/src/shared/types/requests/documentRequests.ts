export interface DocumentIdParams {
  id: string;
}

export interface MoveDocumentDTO {
  folderId?: string | null;
}

export interface RenameDocumentDTO {
  name: string;
}

export interface QuerySchema {
  token: string;
}

export interface GetStorageUrlDto {
  name: string;
  size: number;
  mimeType: string;
}

export interface CreateDocumentDto {
  name: string;
  size: number;
  folderId?: string | null;
  storagePath: string;
}
