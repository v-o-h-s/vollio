import { GetStorageUrlData, GetStorageUrlDto } from "@vollio/shared";
import { generateUploadPath } from "../../../shared/utils/uploads";
import { IStorageService } from "../../../domain/services/IStorageService";
import { FastifyBaseLogger } from "fastify";

interface GetStorageUrlInput extends GetStorageUrlDto {
  userId: string;
}
export class GetStorageUrlUseCase {
  constructor(
    private storageService: IStorageService,
    private logger: FastifyBaseLogger
  ) {}
  async execute(input: GetStorageUrlInput): Promise<GetStorageUrlData> {
    this.logger.info("GetStorageUrlUseCase:execute");
    const storagePath = generateUploadPath(input.userId, input.name);
    const storageUrl = await this.storageService.createUploadUrl(storagePath);
    this.logger.info("GetStorageUrlUseCase:executed successfully");
    return { storageUrl, storagePath };
  }
}
