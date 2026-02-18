import { Resources } from "../../domain/entities/Resources";
import {
  StorageResourceLogEntry,
  IStorageResourcesRepository,
} from "../../domain/repositories/IStorageResourcesRepository";
import { IResourcesRepository } from "../../domain/repositories/IResourcesRepository";
import { ResourcesRepository } from "./ResourcesRepository";

export class StorageResourcesRepository
  extends ResourcesRepository
  implements IStorageResourcesRepository
{
  async getByUserId(userId: string): Promise<Resources | null> {
    this.logger.debug({ userId }, "Fetching storage resources for user");
    return super.getByUserId(userId);
  }

  async upsert(resources: Resources): Promise<Resources> {
    this.logger.debug(
      { userId: resources.getUserId() },
      "Upserting storage resources for user",
    );
    return super.upsert(resources);
  }

  async delete(userId: string): Promise<void> {
    this.logger.debug({ userId }, "Deleting storage resources for user");
    return super.delete(userId);
  }

  async logUsage(entry: StorageResourceLogEntry): Promise<void> {
    const { error } = await this.supabaseClient
      .from("storage_usage_logs")
      .insert({
        user_id: entry.userId,
        action_type: entry.actionType,
        size_bytes: entry.sizeBytes,
        resource_id: entry.resourceId,
        metadata: entry.metadata || {},
      });

    if (error) {
      this.logger.error(
        { error, entry },
        "Failed to log storage usage to database",
      );
    }
  }

  async canUse(userId: string): Promise<boolean> {
    const resources = await this.getByUserId(userId);
    if (!resources) {
      return false;
    }
    return resources.getUsedStorageBytes() < resources.getMaxStorageBytes();
  }
}
