import { SupabaseClient } from "@supabase/supabase-js";
import {
  AIUsageLogEntry,
  IAIUsageRepository,
} from "../../domain/repositories/IAIUsageRepository";
import { FastifyBaseLogger } from "fastify";

export class AIUsageRepository implements IAIUsageRepository {
  constructor(
    private supabase: SupabaseClient,
    private logger: FastifyBaseLogger,
  ) {}

  async logUsage(entry: AIUsageLogEntry): Promise<void> {
    const { error } = await this.supabase.from("ai_usage_logs").insert({
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
