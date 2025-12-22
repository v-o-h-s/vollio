export interface CreateFolderDTO {
  name: string;
  parentId?: string | null;
}

export interface UpdateFolderDTO {
  name?: string;
  parentId?: string | null;
}

export interface FolderIdParams {
  id: string;
}

export interface DeleteFolderQuery {
  moveContentsTo?: string | null;
}
