import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IChunkRepository } from "../../../domain/repositories/IChunkRepository";
import { DocumentIdParams, JSONContent, NoteData } from "@vollio/shared";
import { summarizeDocumentPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/summarize";
import { EnsureDocumentChunkedUseCase } from "../chunking/EnsureExistingOfDocumentChunkUseCase";
import { ChunkMetadata } from "../../../shared/utils/chunking";
import { GENRATIVE_AI_CONFIG } from "../../../infrastructure/ai/generative-ai/client";
import { ServerError } from "../../../shared/errors/ServerError";
import { Note } from "../../../domain/entities/Note";
import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { NoteMapper } from "../../../shared/mappers/NoteMapper";
import { ITokenRateLimitingService } from "../../../domain/services/ITokenRateLimitingService";
import { TokenUsage } from "../../../shared/types/generativeAi";

/**
 * Use case for summarizing a document
 * @input documentId
 * @output id, documentId, text
 */

export interface GenerateSummaryResult {
  note: NoteData;
  tokenUsage: TokenUsage;
}

export class GenerateSummaryUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService,
    private chunkRepository: IChunkRepository,
    private noteRepository: INoteRepository,
    private ensureChunkingUseCase: EnsureDocumentChunkedUseCase,
    private tokenRateLimitingService: ITokenRateLimitingService,
  ) {}

  async execute(
    data: DocumentIdParams,
    userId: string,
  ): Promise<GenerateSummaryResult> {
    this.logger.info(
      { documentId: data.id, userId },
      "Executing SummarizeDocumentUseCase",
    );

    // 1. Ensure document is processed
    await this.ensureChunkingUseCase.execute(data.id, userId);

    // 2. Get document chunks to get the text
    const chunks: { content: string; metadata: ChunkMetadata }[] = (
      await this.chunkRepository.getDocumentChunks(data.id)
    ).map((chunk) => ({
      content: chunk.getContent(),
      metadata: chunk.getMetadata(),
    }));

    if (!chunks.length) {
      this.logger.error(
        { documentId: data.id },
        "No chunks found for the document",
      );
      throw new ServerError("No chunks found for the document");
    }

    // 3. Create batches
    const batches: { content: string; metadata: ChunkMetadata }[][] = [];
    for (let i = 0; i < chunks.length; i += GENRATIVE_AI_CONFIG.BATCH_SIZE) {
      batches.push(chunks.slice(i, i + GENRATIVE_AI_CONFIG.BATCH_SIZE));
    }

    this.logger.info(
      { documentId: data.id, batchCount: batches.length },
      "Starting batch processing for summary generation",
    );

    let currentSummary: JSONContent = {
      type: "doc",
      content: [
        /* blocks go here */
      ],
    };

    // Track total token usage across batches
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let lastModel = "";

    // 4. Process batches
    for (let i = 0; i < batches.length; i++) {
      this.logger.info(
        {
          documentId: data.id,
          currentBatch: i + 1,
          totalBatches: batches.length,
        },
        "Processing batch for summary",
      );

      const batchContext = batches[i].map((c) => c.content).join("\n\n");
      const prompt = summarizeDocumentPromptGenerator(
        batchContext,
        currentSummary,
      );

      const result = await this.generativeAiService.generateSummary(prompt);

      // Accumulate token usage
      totalPromptTokens += result.usage.promptTokens;
      totalCompletionTokens += result.usage.completionTokens;
      lastModel = result.model;

      // Access data from the new structure
      if (result.data && result.data.type === "doc") {
        currentSummary = result.data;
      }
    }

    // Record total token usage
    await this.tokenRateLimitingService.recordUsage(userId, {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      model: lastModel,
      endpoint: "generate-summary",
    });

    // 5. Save summary
    const note = new Note(
      crypto.randomUUID(),
      "document summary",
      currentSummary,
      data.id,
    );
    note.setNoteIsSummary(true);

    const createdNote = await this.noteRepository.createNote(note);
    this.logger.info(
      { documentId: data.id, totalPromptTokens, totalCompletionTokens },
      "SummarizeDocumentUseCase completed successfully",
    );

    return {
      note: NoteMapper.fromDomainToInterface(note),
      tokenUsage: {
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens: totalPromptTokens + totalCompletionTokens,
      },
    };
  }
}
