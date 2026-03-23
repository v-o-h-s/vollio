import { Subscription } from "../entities/Subscription";

export interface ISubscriptionRepository {
  /**
   * Create a new subscription
   */
  createSubscription(subscription: Subscription): Promise<Subscription>;

  /**
   * Update an existing subscription
   */
  updateSubscription(subscription: Subscription): Promise<Subscription>;

  /**
   * Get a subscription by its internal ID
   */
  getSubscriptionById(id: string): Promise<Subscription | null>;

  /**
   * Get a subscription by user ID
   */
  getSubscriptionByUserId(userId: string): Promise<Subscription | null>;

  /**
   * Delete a subscription record
   */
  deleteSubscription(id: string): Promise<void>;
}
