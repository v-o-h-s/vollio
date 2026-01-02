import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import {
  GenerateSummaryDTO,
  GenerateSummaryResponseData,
} from "@vollio/shared";
import { summarizeDocumentPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/summarize";
import { Summary } from "../../../domain/entities/Summary";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../embedding/EnsureExistingOfDocumentEmbeddingUseCase";
import { ChunkMetadata } from "../../../shared/utils/chunking";
import { GENRATIVE_AI_CONFIG } from "../../../infrastructure/ai/generative-ai/client";
import { ServerError } from "../../../shared/errors/ServerError";

/**
 * Use case for summarizing a document
 * @input documentId
 * @output id, documentId, text
 */

export class SummarizeDocumentUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService,
    private embeddingRepository: IEmbeddingRepository,
    private summaryRepository: ISummaryRepository,
    private ensureExistingOfDocumentEmbeddingUseCase: EnsureExistingOfDocumentEmbeddingUseCase
  ) {}

  async execute(
    data: GenerateSummaryDTO
  ): Promise<GenerateSummaryResponseData> {
    this.logger.info(
      { documentId: data.documentId },
      "Executing SummarizeDocumentUseCase"
    );

    // 1. Ensure document is processed
    await this.ensureExistingOfDocumentEmbeddingUseCase.execute(
      data.documentId
    );

    // 2. Get document chunks to get the text
    const chunks: { content: string; metadata: ChunkMetadata }[] = (
      await this.embeddingRepository.getDocumentEmbeddings(data.documentId)
    ).map((chunk) => ({
      content: chunk.getContent(),
      metadata: chunk.getMetadata(),
    }));

    if (!chunks.length) {
      this.logger.error(
        { documentId: data.documentId },
        "No chunks found for the document"
      );
      throw new ServerError("No chunks found for the document");
    }

    // 3. Create batches
    const batches: { content: string; metadata: ChunkMetadata }[][] = [];
    for (let i = 0; i < chunks.length; i += GENRATIVE_AI_CONFIG.BATCH_SIZE) {
      batches.push(chunks.slice(i, i + GENRATIVE_AI_CONFIG.BATCH_SIZE));
    }

    this.logger.info(
      { documentId: data.documentId, batchCount: batches.length },
      "Starting batch processing for summary generation"
    );

    let currentSummary = "";

    // 4. Process batches
    for (let i = 0; i < batches.length; i++) {
      this.logger.info(
        {
          documentId: data.documentId,
          currentBatch: i + 1,
          totalBatches: batches.length,
        },
        "Processing batch for summary"
      );

      const batchContext = batches[i].map((c) => c.content).join("\n\n");
      const prompt = summarizeDocumentPromptGenerator(
        batchContext,
        currentSummary
      );

      const result = await this.generativeAiService.generateSummary(prompt);
      if (result.summary) {
        currentSummary = result.summary;
      }
    }

    // 5. Save summary
    const summary = new Summary(data.documentId);
    summary.setText(currentSummary);

    const createdSummary = await this.summaryRepository.createSummary(summary);

    this.logger.info(
      { documentId: data.documentId, summaryId: createdSummary.getId() },
      "SummarizeDocumentUseCase completed successfully"
    );
    this.logger.debug({ summary }, "Summary generated");

    return {
      id: createdSummary.getId(),
      documentId: createdSummary.getDocumentId(),
      text: createdSummary.getText() || "",
    };
  }
}
