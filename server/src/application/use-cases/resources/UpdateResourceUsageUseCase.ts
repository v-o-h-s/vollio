import { FastifyBaseLogger } from "fastify";
import { Resources } from "../../../domain/entities/Resources";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export interface UpdateResourceUsageRequest {
  userId: string;
  usedAiTokens?: number;
  usedStorageBytes?: number;
}

export class UpdateResourceUsageUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private resourcesRepository: IResourcesRepository,
  ) {}

  async execute(request: UpdateResourceUsageRequest): Promise<Resources> {
    const { userId, usedAiTokens = 0, usedStorageBytes = 0 } = request;

    this.logger.info(
      { userId, usedAiTokens, usedStorageBytes },
      "Updating resource usage for user",
    );

    // 1. Fetch current resources
    const resources = await this.resourcesRepository.getByUserId(userId);

    if (!resources) {
      this.logger.warn(
        { userId },
        "Resources not found for user while updating usage",
      );
      throw new NotFoundError("Resources not found");
    }

    // 2. Consume AI tokens if provided
    if (usedAiTokens > 0) {
      resources.consumeAiTokens(usedAiTokens);
    }

    // 3. Consume storage space if provided
    if (usedStorageBytes > 0) {
      resources.consumeStorage(usedStorageBytes);
    } else if (usedStorageBytes < 0) {
      // If usedStorageBytes is negative, it means we are releasing space (e.g. after a file deletion)
      resources.releaseStorage(Math.abs(usedStorageBytes));
    }

    // 4. Persist updated resources
    const updatedResources = await this.resourcesRepository.upsert(resources);

    this.logger.info({ userId }, "Resource usage updated successfully");

    return updatedResources;
  }
}
