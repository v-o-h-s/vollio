import { Plan } from "../entities/Plan";

export interface IPlanRepository {
  /**
   * Get a plan by its internal ID
   */
  getPlanById(id: string): Promise<Plan | null>;

  /**
   * Get all active plans
   */
  getActivePlans(): Promise<Plan[]>;

  /**
   * Get plan by slug
   */
  getPlanBySlug(slug: string): Promise<Plan | null>;
}
