import { GetStorageUrlData, GetStorageUrlDto } from "@vollio/shared";
import { generateUploadPath } from "../../../shared/utils/uploads";
import { IStorageService } from "../../../domain/services/IStorageService";
import { IStorageQuotaService } from "../../../domain/services/quota/IStorageQuotaService";
import { FastifyBaseLogger } from "fastify";
import { ServerError } from "../../../shared/errors/ServerError";
import { QuotaExceededError } from "../../../shared/errors/QuotaExceededError";

interface GetStorageUrlInput extends GetStorageUrlDto {
  userId: string;
}
export class GetStorageUrlUseCase {
  constructor(
    private storageService: IStorageService,
    private storageQuotaService: IStorageQuotaService,
    private logger: FastifyBaseLogger,
  ) {}
  async execute(input: GetStorageUrlInput): Promise<GetStorageUrlData> {
    this.logger.info(
      { userId: input.userId, size: input.size, mimeType: input.mimeType },
      "GetStorageUrlUseCase:execute",
    );

    // 1. Initial Mime Type Check
    if (input.mimeType !== "application/pdf") {
      this.logger.warn({ mimeType: input.mimeType }, "Invalid mime type");
      throw new ServerError("Only PDF files are allowed");
    }

    // 2. Preliminary Quota Check (using claimed size)
    const canUpload = await this.storageQuotaService.canUpload(
      input.userId,
      input.size,
    );
    if (!canUpload) {
      this.logger.warn(
        { userId: input.userId, size: input.size },
        "Preliminary storage quota exceeded",
      );
      throw new QuotaExceededError(
        "storage",
        "Not enough storage space available",
      );
    }

    const storagePath = generateUploadPath(input.userId, input.name);
    const storageUrl = await this.storageService.createUploadUrl(storagePath);
    this.logger.info("GetStorageUrlUseCase:executed successfully");
    return { storageUrl, storagePath };
  }
}
