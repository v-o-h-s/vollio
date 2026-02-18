export interface IPlanService {
  /**
   * Resets a user's resources to match the 'Free' plan limits.
   * Typically called when a subscription transitions to 'past_due' or 'canceled'.
   *
   * @param userId - ID of the user to downgrade
   */
  downgradeUserToFreePlan(userId: string): Promise<void>;
}
