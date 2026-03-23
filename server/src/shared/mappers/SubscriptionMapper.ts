import { SubscriptionData } from "../types/SubscriptionData";
import { Subscription } from "../../domain/entities/Subscription";

export class SubscriptionMapper {
  public static fromPersistenceToDomain(row: any): Subscription {
    return new Subscription(
      row.id,
      row.user_id,
      row.status,
      row.plan_id,
      row.price_id,
      row.current_period_end ? new Date(row.current_period_end) : null,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }

  public static toPersistence(subscription: Subscription) {
    return {
      id: subscription.getId(),
      user_id: subscription.getUserId(),
      plan_id: subscription.getPlanId(),
      status: subscription.getStatus(),
      price_id: subscription.getPriceId(),
      current_period_end: subscription.getCurrentPeriodEnd()?.toISOString(),
      created_at: subscription.getCreatedAt().toISOString(),
      updated_at: subscription.getUpdatedAt().toISOString(),
    };
  }

  public static fromDomainToInterface(
    subscription: Subscription,
  ): SubscriptionData {
    return {
      id: subscription.getId(),
      userId: subscription.getUserId(),
      status: subscription.getStatus(),
      planId: subscription.getPlanId(),
      currentPeriodEnd:
        subscription.getCurrentPeriodEnd()?.toISOString() || null,
      createdAt: subscription.getCreatedAt().toISOString(),
      updatedAt: subscription.getUpdatedAt().toISOString(),
    };
  }
}
