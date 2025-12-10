export interface IFolderRepository {
    getFolderById(id: string, userId: string): Promise<{ id: string; name: string; parentId: string | null } | null>;
    createFolder(name: string, userId: string, parentId?: string ): Promise<void>;
    deleteFolder(id: string, userId: string): Promise<void>;
}
