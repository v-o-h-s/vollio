import { IDocumentQuotaService } from "../../../domain/services/quota/IDocumentQuotaService";
import { IStorageResourcesRepository } from "../../../domain/repositories/IStorageResourcesRepository";
import { FastifyBaseLogger } from "fastify";
import { QuotaExceededError } from "../../../shared/errors/QuotaExceededError";

export class DocumentQuotaService implements IDocumentQuotaService {
  constructor(
    private storageResourcesRepository: IStorageResourcesRepository,
    private logger: FastifyBaseLogger,
  ) {}

  async canCreateDocument(userId: string): Promise<boolean> {
    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return false;

    return resources.getRemainingDocuments() > 0;
  }

  async consumeDocument(userId: string): Promise<void> {
    this.logger.info({ userId }, "Consuming document quota slot");

    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) {
      throw new Error("User resources not found");
    }

    try {
      resources.consumeDocument();
      await this.storageResourcesRepository.upsert(resources);
    } catch (error: any) {
      this.logger.warn(
        { userId, error: error.message },
        "Document quota exceeded",
      );
      throw new QuotaExceededError("document", error.message);
    }
  }

  async releaseDocument(userId: string): Promise<void> {
    this.logger.info({ userId }, "Releasing document quota slot");

    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return;

    resources.releaseDocument();
    await this.storageResourcesRepository.upsert(resources);
  }

  async getRemainingDocuments(userId: string): Promise<number> {
    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return 0;
    return resources.getRemainingDocuments();
  }
}
