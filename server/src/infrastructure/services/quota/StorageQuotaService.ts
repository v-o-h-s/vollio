import { IStorageQuotaService } from "../../../domain/services/quota/IStorageQuotaService";
import { IStorageResourcesRepository } from "../../../domain/repositories/IStorageResourcesRepository";
import { FastifyBaseLogger } from "fastify";
import { QuotaExceededError } from "../../../shared/errors/QuotaExceededError";

export class StorageQuotaService implements IStorageQuotaService {
  constructor(
    private storageResourcesRepository: IStorageResourcesRepository,
    private logger: FastifyBaseLogger,
  ) {}

  async canUpload(userId: string, sizeInBytes: number): Promise<boolean> {
    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return false;

    return resources.getRemainingStorageBytes() >= sizeInBytes;
  }

  async consumeStorage(userId: string, sizeInBytes: number): Promise<void> {
    this.logger.info({ userId, sizeInBytes }, "Consuming storage space");

    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) {
      throw new Error("User resources not found");
    }

    try {
      resources.consumeStorage(sizeInBytes);
      await this.storageResourcesRepository.upsert(resources);

      // Log usage for history
      this.storageResourcesRepository
        .logUsage({
          userId,
          actionType: "upload",
          sizeBytes: sizeInBytes,
        })
        .catch((err) =>
          this.logger.error({ err }, "Failed to log storage usage"),
        );
    } catch (error: any) {
      this.logger.warn(
        { userId, error: error.message },
        "Storage quota exceeded",
      );
      throw new QuotaExceededError("storage", error.message);
    }
  }

  async releaseStorage(userId: string, sizeInBytes: number): Promise<void> {
    this.logger.info({ userId, sizeInBytes }, "Releasing storage space");

    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return;

    resources.releaseStorage(sizeInBytes);
    await this.storageResourcesRepository.upsert(resources);

    this.storageResourcesRepository
      .logUsage({
        userId,
        actionType: "delete",
        sizeBytes: -sizeInBytes,
      })
      .catch((err) =>
        this.logger.error({ err }, "Failed to log storage release"),
      );
  }

  async getRemainingBytes(userId: string): Promise<number> {
    const resources = await this.storageResourcesRepository.getByUserId(userId);
    if (!resources) return 0;
    return resources.getRemainingStorageBytes();
  }
}
