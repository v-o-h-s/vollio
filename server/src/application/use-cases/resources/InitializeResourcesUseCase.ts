import { FastifyBaseLogger } from "fastify";
import { Resources } from "../../../domain/entities/Resources";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";
import { IPlanRepository } from "../../../domain/repositories/IPlanRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class InitializeResourcesUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private resourcesRepository: IResourcesRepository,
    private planRepository: IPlanRepository,
  ) {}

  async execute(userId: string, planSlug: string = "free"): Promise<Resources> {
    this.logger.info({ userId, planSlug }, "Initializing resources for user");

    // 1. Check if resources already exist
    const existingResources =
      await this.resourcesRepository.getByUserId(userId);
    if (existingResources) {
      this.logger.info(
        { userId },
        "Resources already exist, skipping initialization",
      );
      return existingResources;
    }

    // 2. Fetch the plan details
    const plan = await this.planRepository.getPlanBySlug(planSlug);
    if (!plan) {
      this.logger.error({ planSlug }, "Plan not found for initialization");
      throw new NotFoundError(`Plan with slug ${planSlug} not found`);
    }

    // 3. Create new resources based on plan limits
    const maxAiTokens = plan.getMaxAiTokens() || 0;
    const maxStorageBytes = plan.getMaxStorageBytes() || 0;
    const maxDocuments = plan.getMaxDocuments() || 0;

    const resources = new Resources(
      userId,
      plan.getId(),
      0, // used_ai_tokens starts at 0
      0, // used_storage_bytes starts at 0
      0, // used_documents starts at 0
      maxAiTokens,
      maxStorageBytes,
      maxDocuments,
    );

    const savedResources = await this.resourcesRepository.upsert(resources);

    this.logger.info(
      { userId, planId: plan.getId() },
      "Resources initialized successfully",
    );

    return savedResources;
  }
}
