export interface FileIdParams {
  id: string;
}

export interface MoveFileDTO {
  folderId?: string | null;
}

export interface RenameFileDTO {
  filename: string;
}

export interface QuerySchema {
  token: string;
}
