import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FlashCardsSet } from "../../../domain/entities/FlashCardsSet";
import { FastifyBaseLogger } from "fastify";

export class GetAllFlashCardsSetsUseCase {
  constructor(
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(): Promise<FlashCardsSet[]> {
    this.logger.info("Executing GetAllFlashCardsSetsUseCase");
    const sets = await this.flashCardsSetRepository.findAll();
    this.logger.info(
      { count: sets.length },
      "GetAllFlashCardsSetsUseCase executed successfully"
    );
    return sets;
  }
}
