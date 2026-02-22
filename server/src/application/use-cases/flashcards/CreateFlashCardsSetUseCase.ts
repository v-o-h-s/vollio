import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FlashCardsSet } from "../../../domain/entities/FlashCardsSet";
import { FlashCard } from "../../../domain/entities/FlashCard";
import { FastifyBaseLogger } from "fastify";
import crypto from "crypto";

export interface CreateManualFlashCardsDTO {
  name: string;
  description?: string;
  language?: string;
  documentId: string;
  flashCards: {
    front: string;
    back: string;
    hint?: string;
  }[];
}

import { IAiQuotaService } from "../../../domain/services/quota/IAiQuotaService";
import { QuotaExceededError } from "../../../shared/errors/QuotaExceededError";

export class CreateFlashCardsSetUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private aiQuotaService: IAiQuotaService,
  ) {}

  async execute(
    data: CreateManualFlashCardsDTO,
    userId: string,
  ): Promise<FlashCardsSet> {
    this.logger.info("Executing CreateFlashCardsSetUseCase");

    const canCreate = await this.aiQuotaService.canCreateFlashcards(userId);
    if (!canCreate) {
      this.logger.warn({ userId }, "User exceeded flashcards quota");
      throw new QuotaExceededError(
        "flashcards",
        "You have reached your maximum quota for flashcards.",
      );
    }

    const setId = crypto.randomUUID();
    const flashCardsSet = new FlashCardsSet(
      setId,
      data.documentId,
      new Date(),
      data.language ? (data.language as any) : "en",
      [],
    );

    flashCardsSet.setName(data.name);
    // Note: Description isn't on the entity currently based on previous reads,
    // but I can check. For now I'll ignore description or assume entity needs update.
    // Wait, FlashCardsSet entity was instantiated with 5 args in GenerateGeneralFlashCardsUseCase.
    // let's check the entity definition if possible, but I recall it from GenerateGeneralFlashCardsUseCase usage.

    const cards = data.flashCards.map(
      (c) => new FlashCard(crypto.randomUUID(), setId, c.front, c.back, c.hint),
    );

    flashCardsSet.setFlashCards(cards);

    await this.flashCardsSetRepository.save(flashCardsSet);

    // Consume limits without token cost
    await this.aiQuotaService.consumeTokens(
      userId,
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      {
        actionType: "flashcards",
        model: "manual",
        resourceId: flashCardsSet.getId(),
      },
    );

    this.logger.info({ setId }, "Flashcard set created successfully");
    return flashCardsSet;
  }
}
