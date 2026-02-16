import { Plan } from "../../domain/entities/Plan";

export class PlanMapper {
  public static fromPersistenceToDomain(row: any): Plan {
    return new Plan(
      row.id,
      row.name,
      row.slug,
      row.price_cents,
      row.currency,
      row.billing_interval,
      row.paddle_price_id,
      row.is_active,
      row.max_ai_tokens,
      row.max_storage_bytes ? Number(row.max_storage_bytes) : null,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }

  public static toPersistence(plan: Plan) {
    return {
      id: plan.getId(),
      name: plan.getName(),
      slug: plan.getSlug(),
      price_cents: plan.getPriceCents(),
      currency: plan.getCurrency(),
      billing_interval: plan.getBillingInterval(),
      paddle_price_id: plan.getPaddlePriceId(),
      is_active: plan.getIsActive(),
      max_ai_tokens: plan.getMaxAiTokens(),
      max_storage_bytes: plan.getMaxStorageBytes(),
      created_at: plan.getCreatedAt().toISOString(),
      updated_at: plan.getUpdatedAt().toISOString(),
    };
  }
}
