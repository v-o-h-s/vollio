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
