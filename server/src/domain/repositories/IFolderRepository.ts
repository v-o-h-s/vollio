import { Folder } from "../entities/Folder";

export interface IFolderRepository {
  /**
   * Get a folder by ID (with basic info)
   */
  getFolderById(
    id: string,
    userId: string
  ): Promise<{ id: string; name: string; parentId: string | null } | null>;

  /**
   * Get a folder as a domain entity
   */
  getFolderEntity(id: string, userId: string): Promise<Folder | null>;

  /**
   * Get all folders for a user with PDF counts
   */
  getAllUserFolders(userId: string): Promise<Array<Folder & { pdfCount: number }>>;

  /**
   * Create a new folder
   */
  createFolder(folder: Folder): Promise<Folder>;

  /**
   * Update an existing folder
   */
  updateFolder(folder: Folder): Promise<Folder>;

  /**
   * Delete a folder
   */
  deleteFolder(id: string, userId: string): Promise<void>;

  /**
   * Check if a folder name exists in the same parent
   */
  folderNameExists(
    name: string,
    parentId: string | null,
    userId: string,
    excludeFolderId?: string
  ): Promise<boolean>;

  /**
   * Check if folder and parent belong to user (for circular reference check)
   */
  getFolderDescendants(folderId: string): Promise<Array<{ id: string }>>;

  /**
   * Move PDFs to another folder
   */
  movePdfsBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void>;

  /**
   * Move subfolders to another folder
   */
  moveSubfoldersBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void>;
}
