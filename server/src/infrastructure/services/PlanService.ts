import { FastifyBaseLogger } from "fastify";
import { IPlanService } from "../../domain/services/IPlanService";
import { IPlanRepository } from "../../domain/repositories/IPlanRepository";
import { IResourcesRepository } from "../../domain/repositories/IResourcesRepository";

export class PlanService implements IPlanService {
  constructor(
    private logger: FastifyBaseLogger,
    private planRepository: IPlanRepository,
    private resourcesRepository: IResourcesRepository,
  ) {}

  /**
   * Resets a user's resources to match the 'Free' plan limits.
   * Typically called when a subscription transitions to 'past_due' or 'canceled'.
   */
  async downgradeUserToFreePlan(userId: string): Promise<void> {
    try {
      this.logger.info(
        { userId },
        "Attempting to downgrade user resources to Free plan",
      );

      // 1. Fetch the Free plan details
      const freePlan = await this.planRepository.getPlanBySlug("free");
      if (!freePlan) {
        this.logger.error(
          "Critical: Free plan definition not found in database during downgrade",
        );
        return;
      }

      // 2. Get user's current resources
      const resources = await this.resourcesRepository.getByUserId(userId);
      if (!resources) {
        this.logger.warn(
          { userId },
          "No resources found for user during downgrade attempt",
        );
        return;
      }

      // 3. Update resources from Free plan and save
      resources.updateFromPlan(freePlan);
      await this.resourcesRepository.upsert(resources);

      this.logger.info(
        { userId, planId: freePlan.getId() },
        "Successfully downgraded user resources to Free plan",
      );
    } catch (error) {
      this.logger.error(
        { userId, error },
        "Failed to downgrade user resources",
      );
      throw error; // Rethrow so the use case knows it failed
    }
  }
}
