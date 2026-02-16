import { FastifyBaseLogger } from "fastify";
import { Resources } from "../../../domain/entities/Resources";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class GetResourcesUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private resourcesRepository: IResourcesRepository,
  ) {}

  async execute(userId: string): Promise<Resources> {
    this.logger.info({ userId }, "Getting resources for user");

    const resources = await this.resourcesRepository.getByUserId(userId);

    if (!resources) {
      this.logger.warn({ userId }, "Resources not found for user");
      throw new NotFoundError("Resources not found");
    }

    return resources;
  }
}
