import { IResourcesRepository } from "./IResourcesRepository";

export interface StorageResourceLogEntry {
  userId: string;
  actionType: "upload" | "delete" | "other";
  sizeBytes: number;
  resourceId?: string;
  metadata?: any;
}

export interface IStorageResourcesRepository extends IResourcesRepository {
  /**
   * Log a storage usage event
   */
  logUsage(entry: StorageResourceLogEntry): Promise<void>;

  /**
   * check if user can use more storage
   * @param userId
   */
  canUse(userId: string): Promise<boolean>;
}
