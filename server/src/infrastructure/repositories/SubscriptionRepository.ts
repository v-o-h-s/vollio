import { SupabaseClient } from "@supabase/supabase-js";
import { ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";
import { Subscription } from "../../domain/entities/Subscription";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { FastifyBaseLogger } from "fastify";
import { SubscriptionMapper } from "../../shared/mappers/SubscriptionMapper";

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger,
  ) {}

  async createSubscription(subscription: Subscription): Promise<Subscription> {
    this.logger.info(
      {
        userId: subscription.getUserId(),
      },
      "Creating subscription in database",
    );

    const { data, error } = await this.supabaseClient
      .from("subscriptions")
      .insert(SubscriptionMapper.toPersistence(subscription))
      .select()
      .single();

    if (error) {
      this.logger.error(
        { error, userId: subscription.getUserId() },
        "Error creating subscription",
      );
      throw new DatabaseError(error);
    }

    return SubscriptionMapper.fromPersistenceToDomain(data);
  }

  async updateSubscription(subscription: Subscription): Promise<Subscription> {
    this.logger.info(
      { subscriptionId: subscription.getId() },
      "Updating subscription in database",
    );

    const { data, error } = await this.supabaseClient
      .from("subscriptions")
      .update(SubscriptionMapper.toPersistence(subscription))
      .eq("id", subscription.getId())
      .select()
      .single();

    if (error) {
      this.logger.error(
        { error, subscriptionId: subscription.getId() },
        "Error updating subscription",
      );
      throw new DatabaseError(error);
    }

    return SubscriptionMapper.fromPersistenceToDomain(data);
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    const { data, error } = await this.supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError(error);
    }

    return SubscriptionMapper.fromPersistenceToDomain(data);
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error);
    }

    return data ? SubscriptionMapper.fromPersistenceToDomain(data) : null;
  }

  async deleteSubscription(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new DatabaseError(error);
    }
  }
}
