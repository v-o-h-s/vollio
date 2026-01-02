import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { DocumentIdParams, JSONContent, NoteData } from "@vollio/shared";
import { summarizeDocumentPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/summarize";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../embedding/EnsureExistingOfDocumentEmbeddingUseCase";
import { ChunkMetadata } from "../../../shared/utils/chunking";
import { GENRATIVE_AI_CONFIG } from "../../../infrastructure/ai/generative-ai/client";
import { ServerError } from "../../../shared/errors/ServerError";
import { Note } from "../../../domain/entities/Note";
import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { NoteMapper } from "../../../shared/mappers/NoteMapper";

/**
 * Use case for summarizing a document
 * @input documentId
 * @output id, documentId, text
 */

export class GenerateSummaryUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService,
    private embeddingRepository: IEmbeddingRepository,
    private noteRepository: INoteRepository,
    private ensureExistingOfDocumentEmbeddingUseCase: EnsureExistingOfDocumentEmbeddingUseCase
  ) {}

  async execute(data: DocumentIdParams): Promise<NoteData> {
    this.logger.info(
      { documentId: data.id },
      "Executing SummarizeDocumentUseCase"
    );

    // 1. Ensure document is processed
    await this.ensureExistingOfDocumentEmbeddingUseCase.execute(data.id);

    // 2. Get document chunks to get the text
    const chunks: { content: string; metadata: ChunkMetadata }[] = (
      await this.embeddingRepository.getDocumentEmbeddings(data.id)
    ).map((chunk) => ({
      content: chunk.getContent(),
      metadata: chunk.getMetadata(),
    }));

    if (!chunks.length) {
      this.logger.error(
        { documentId: data.id },
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
      { documentId: data.id, batchCount: batches.length },
      "Starting batch processing for summary generation"
    );

    let currentSummary: JSONContent = {
      type: "doc",
      content: [
        /* blocks go here */
      ],
    };

    // 4. Process batches
    for (let i = 0; i < batches.length; i++) {
      this.logger.info(
        {
          documentId: data.id,
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
    const note = new Note(
      crypto.randomUUID(),
      "document summary",
      currentSummary,
      data.id
    );
    note.setNoteIsSummary(true);

    const createdNote = await this.noteRepository.createNote(note);
    this.logger.info(
      { documentId: data.id },
      "SummarizeDocumentUseCase completed successfully"
    );

    return NoteMapper.fromDomainToInterface(note);
  }
}
