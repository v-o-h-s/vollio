import { Resources } from "../entities/Resources";

export interface IResourcesRepository {
  /**
   * Get resources for a specific user
   */
  getByUserId(userId: string): Promise<Resources | null>;

  /**
   * Create or update resources
   */
  upsert(resources: Resources): Promise<Resources>;

  /**
   * Delete resources (e.g. account deletion)
   */
  delete(userId: string): Promise<void>;
}
