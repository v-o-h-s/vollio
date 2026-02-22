import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FastifyBaseLogger } from "fastify";

import { IAiQuotaService } from "../../../domain/services/quota/IAiQuotaService";

export class DeleteFlashCardsSetUseCase {
  constructor(
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private logger: FastifyBaseLogger,
    private aiQuotaService: IAiQuotaService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    this.logger.info({ setId: id }, "Executing DeleteFlashCardsSetUseCase");

    // We fetch it first to make sure it actually existed and got deleted
    const set = await this.flashCardsSetRepository.findById(id);
    await this.flashCardsSetRepository.delete(id);

    if (set) {
      await this.aiQuotaService.releaseFlashcards(userId);
    }

    this.logger.info(
      { setId: id },
      "DeleteFlashCardsSetUseCase executed successfully",
    );
  }
}
