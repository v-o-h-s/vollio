import { Resources } from "../../domain/entities/Resources";
import {
  AIResourceLogEntry,
  IAIResourcesRepository,
} from "../../domain/repositories/IAIResourcesRepository";
import { IResourcesRepository } from "../../domain/repositories/IResourcesRepository";
import { ResourcesRepository } from "./ResourcesRepository";

export class AIResourcesRepository
  extends ResourcesRepository
  implements IAIResourcesRepository
{
  async getByUserId(userId: string): Promise<Resources | null> {
    this.logger.debug({ userId }, "Fetching AI resources for user");
    return super.getByUserId(userId);
  }

  async upsert(resources: Resources): Promise<Resources> {
    this.logger.debug(
      { userId: resources.getUserId() },
      "Upserting AI resources for user",
    );
    return super.upsert(resources);
  }

  async delete(userId: string): Promise<void> {
    this.logger.debug({ userId }, "Deleting AI resources for user");
    return super.delete(userId);
  }

  async logUsage(entry: AIResourceLogEntry): Promise<void> {
    const { error } = await this.supabaseClient.from("ai_usage_logs").insert({
      user_id: entry.userId,
      action_type: entry.actionType,
      model: entry.model,
      resource_id: entry.resourceId,
      input_tokens: entry.promptTokens,
      output_tokens: entry.completionTokens,
      total_tokens: entry.totalTokens,
      cost_multiplier: entry.costMultiplier,
      metadata: entry.metadata || {},
    });

    if (error) {
      this.logger.error({ error, entry }, "Failed to log AI usage to database");
    }
  }
}
