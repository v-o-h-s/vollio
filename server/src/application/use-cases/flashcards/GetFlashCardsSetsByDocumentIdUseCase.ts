import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FlashCardsSet } from "../../../domain/entities/FlashCardsSet";
import { FastifyBaseLogger } from "fastify";

export class GetFlashCardsSetsByDocumentIdUseCase {
  constructor(
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(documentId: string): Promise<FlashCardsSet[]> {
    this.logger.info(
      { documentId },
      "Executing GetFlashCardsSetsByDocumentIdUseCase"
    );
    const sets = await this.flashCardsSetRepository.findByDocumentId(
      documentId
    );
    this.logger.info(
      { documentId, count: sets.length },
      "GetFlashCardsSetsByDocumentIdUseCase executed successfully"
    );
    return sets;
  }
}
