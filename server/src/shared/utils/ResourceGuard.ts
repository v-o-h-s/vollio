import { FastifyReply, FastifyRequest } from "fastify";
import { QuotaExceededError } from "../errors/QuotaExceededError";
import { IAIResourcesRepository } from "../../domain/repositories/IAIResourcesRepository";
import { IStorageResourcesRepository } from "../../domain/repositories/IStorageResourcesRepository";

/**
 * A middleware factory to guard routes based on resource availability.
 * It uses Awilix from the request scope to resolve repositories.
 *
 * @param resourceType - The type of resource to check ('ai' or 'storage')
 */
export function guardResource(resourceType: "ai" | "storage") {
  return  async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.id;
    if (!userId) {
      // This should be caught by auth plugin, but as a safety:
      throw new Error("User ID missing for resource check");
    }
    if (resourceType === "ai") {
      const aiRepo = request.diScope.resolve<IAIResourcesRepository>(
        "aiResourcesRepository",
      );
      const canUse = await aiRepo.canUse(userId);
      if (!canUse) {
        throw new QuotaExceededError(
          "ai",
          "Insufficient AI tokens. Please upgrade your plan.",
        );
      }
    } else {
      const storageRepo = request.diScope.resolve<IStorageResourcesRepository>(
        "storageResourcesRepository",
      );
      const canUse = await storageRepo.canUse(userId);
      if (!canUse) {
        throw new QuotaExceededError(
          "storage",
          "Storage limit reached. Please upgrade your plan.",
        );
      }
    }
  };
}
