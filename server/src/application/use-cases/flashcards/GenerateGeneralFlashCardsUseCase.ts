import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { CreateFlashCardsSetResponse } from "@vollio/shared";
import { CreateFlashCardsDTO } from "../../../shared/validation/flashcardSchemas";
import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { EnsureExistingOfDocumentChunkUseCase } from "../embedding/EnsureExistingOfDocumentChunkUseCase";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { ChunkMetadata } from "../../../shared/utils/chunking";
import { FlashCardsSet } from "../../../domain/entities/FlashCardsSet";
import { FlashCard } from "../../../domain/entities/FlashCard";
import { ServerError } from "../../../shared/errors/ServerError";
import { GENRATIVE_AI_CONFIG } from "../../../infrastructure/ai/generative-ai/client";
import { flashcardPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/flashcards";
import { FastifyBaseLogger } from "fastify";
import crypto from "crypto";

export class GenerateGeneralFlashCardsUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private documentRepository: IDocumentRepository,
    private ensureChunkingUseCase: EnsureExistingOfDocumentChunkUseCase,
    private embeddingRepository: IEmbeddingRepository,
    private generativeAiService: IGenerativeAiService
  ) {}

  async execute(
    data: CreateFlashCardsDTO,
    userId: string
  ): Promise<CreateFlashCardsSetResponse> {
    this.logger.info(
      { documentId: data.documentId },
      "Executing GenerateGeneralFlashCardsUseCase"
    );
    const document = await this.documentRepository.getDocumentById(
      data.documentId
    );
    if (!document) {
      this.logger.warn(
        { documentId: data.documentId },
        "Document not found in GenerateGeneralFlashCardsUseCase"
      );
      throw new NotFoundError("Document not found");
    }

    await this.ensureChunkingUseCase.execute(
      data.documentId,
      userId
    );

    const chunks: { content: string; metadata: ChunkMetadata }[] = (
      await this.embeddingRepository.getDocumentEmbeddings(data.documentId)
    ).map((chunk) => ({
      content: chunk.getContent(),
      metadata: chunk.getMetadata(),
    }));

    // If no chunks, return empty
    if (!chunks.length) {
      this.logger.error(
        { documentId: data.documentId },
        "No chunks found for the document"
      );
      throw new ServerError("No chunks found for the document");
    }

    const flashCardsSet = new FlashCardsSet(
      crypto.randomUUID(),
      data.documentId,
      new Date(),
      data.language,
      []
    );

    const allCards: FlashCard[] = [];
    let previousSummary = "";

    // Create batches
    const batches: { content: string; metadata: ChunkMetadata }[][] = [];
    for (let i = 0; i < chunks.length; i += GENRATIVE_AI_CONFIG.BATCH_SIZE) {
      batches.push(chunks.slice(i, i + GENRATIVE_AI_CONFIG.BATCH_SIZE));
    }

    this.logger.info(
      { documentId: data.documentId, batchCount: batches.length },
      "Starting batch processing for flashcard generation"
    );

    for (let i = 0; i < batches.length; i++) {
      this.logger.info(
        {
          documentId: data.documentId,
          currentBatch: i + 1,
          totalBatches: batches.length,
        },
        "Processing batch for flashcards"
      );
      const batch = batches[i];

      // Clone DTO to adjust card counts per batch
      const batchDTO = { ...data };

      // Distribute specific number of cards if set
      if (typeof data.numberOfCards === "number" && data.numberOfCards > 0) {
        const baseCount = Math.floor(data.numberOfCards / batches.length);
        const remainder = data.numberOfCards % batches.length;
        batchDTO.numberOfCards = baseCount + (i < remainder ? 1 : 0);
      }

      const { prompt: promptTemplate } = flashcardPromptGenerator(batchDTO);

      let context = batch.map((c) => c.content).join("\n\n");

      // Inject previous summary if available
      if (previousSummary) {
        context = `PREVIOUS CONTEXT SUMMARY:\n${previousSummary}\n\nCURRENT CONTENT:\n${context}`;
      }

      const fullPrompt = promptTemplate.replace(
        "<<CONTENT_GOES_HERE>>",
        context
      );

      const {
        flashCards: generatedCards,
        name,
        summary,
      } = await this.generativeAiService.generateFlashCards(fullPrompt);

      if (name && !flashCardsSet.getName()) {
        flashCardsSet.setName(name);
      }

      // Map generated plain objects to FlashCard entities
      const batchEntities = generatedCards.map(
        (c) =>
          new FlashCard(
            c.id || crypto.randomUUID(),
            flashCardsSet.getId(),
            c.front,
            c.back,
            c.hint
          )
      );

      allCards.push(...batchEntities);

      if (summary) {
        previousSummary = summary;
      }
    }

    // Safety check: ensure we didn't exceed requested total
    let finalCards = allCards;
    if (
      typeof data.numberOfCards === "number" &&
      finalCards.length > data.numberOfCards
    ) {
      finalCards = finalCards.slice(0, data.numberOfCards);
    }

    // Ensure all card IDs are valid UUIDs (secondary check)
    const isUUID = (uuid: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        uuid
      );

    finalCards = finalCards.map((c) => {
      if (!isUUID(c.getId())) {
        return new FlashCard(
          isUUID(c.getId()) ? c.getId() : crypto.randomUUID(),
          c.getSetId(),
          c.getFront(),
          c.getBack(),
          c.getHint()
        );
      }
      return c;
    });

    flashCardsSet.setFlashCards(finalCards);

    this.logger.info(
      `Generated ${finalCards.length} flashcards for set: ${
        flashCardsSet.getName() || "Untitled"
      }`
    );

    // Save the flashcard set to the database
    await this.flashCardsSetRepository.save(flashCardsSet);

    this.logger.info(
      { setId: flashCardsSet.getId() },
      "GenerateGeneralFlashCardsUseCase completed successfully"
    );

    // Map to response
    const json = flashCardsSet.toJSON();
    return {
      id: json.id,
      name: json.name || "Untitled Flashcards",
      documentId: json.documentId,
      createdAt: json.createdAt,
      language: json.language,
      flashCards: json.flashCards.map((fc: any) => ({
        id: fc.id,
        front: fc.front,
        back: fc.back,
        hint: fc.hint || "",
      })),
    };
  }
}
