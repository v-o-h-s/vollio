import { FastifyBaseLogger } from "fastify";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";

export class DeleteResourcesUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private resourcesRepository: IResourcesRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    this.logger.info({ userId }, "Deleting resources for user");

    await this.resourcesRepository.delete(userId);

    this.logger.info({ userId }, "Resources deleted successfully");
  }
}
