import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FlashCardsSet } from "../../../domain/entities/FlashCardsSet";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class GetFlashCardsSetByIdUseCase {
  constructor(
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(id: string): Promise<FlashCardsSet> {
    this.logger.info({ setId: id }, "Executing GetFlashCardsSetByIdUseCase");
    const set = await this.flashCardsSetRepository.findById(id);
    if (!set) {
      this.logger.warn(
        { setId: id },
        "Flashcard set not found in GetFlashCardsSetByIdUseCase"
      );
      throw new NotFoundError("Flashcard set not found");
    }
    this.logger.info(
      { setId: id },
      "GetFlashCardsSetByIdUseCase executed successfully"
    );
    return set;
  }
}
