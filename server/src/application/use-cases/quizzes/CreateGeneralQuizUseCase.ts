import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { CreateQuizResponse } from "@vollio/shared";
import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { Quiz, QuizQuestion } from "../../../domain/entities/Quiz";
import { EnsureExistingOfDocumentChunkUseCase } from "../embedding/EnsureExistingOfDocumentChunkUseCase";
import crypto from "crypto";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { FastifyBaseLogger } from "fastify";
import { GetDocumentByIdUseCase } from "../documents/GetDocumentByIdUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ChunkMetadata } from "../../../shared/utils/chunking";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { GENRATIVE_AI_CONFIG } from "../../../infrastructure/ai/generative-ai/client";
import { ServerError } from "../../../shared/errors/ServerError";
import { quizPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/quizzes";
import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { ITokenRateLimitingService } from "../../../domain/services/ITokenRateLimitingService";

export class CreateGeneralQuizUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService,
    private ensureChunkingUseCase: EnsureExistingOfDocumentChunkUseCase,
    private getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private embeddingRepository: IEmbeddingRepository,
    private quizRepository: IQuizRepository,
    private tokenRateLimitingService: ITokenRateLimitingService
  ) {}

  async execute(
    data: CreateQuizDTO,
    userId: string
  ): Promise<CreateQuizResponse> {
    this.logger.info(
      { documentId: data.documentId, userId },
      "Executing CreateGeneralQuizUseCase"
    );
    // getting chunks relevant to the prompt
    if (!(await this.getDocumentByIdUseCase.execute(data.documentId, userId))) {
      this.logger.warn(
        { documentId: data.documentId },
        "Document not found in CreateGeneralQuizUseCase"
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

    // creating the quiz entity
    const quiz = new Quiz(
      crypto.randomUUID(),
      data.documentId,
      data.difficultyLevel,
      data.language,
      data.explanationLevel,
      data.numberOfQuestions,
      data.timeLimitMinutes
    );

    const allQuestions: QuizQuestion[] = [];
    let previousSummary = "";

    // Track total token usage across batches
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let lastModel = "";

    // If no chunks, return empty
    if (!chunks.length) {
      this.logger.error(
        { documentId: data.documentId },
        "No chunks found for the document"
      );
      throw new ServerError("No chunks found for the document");
    }

    // Create batches
    const batches: { content: string; metadata: ChunkMetadata }[][] = [];
    for (let i = 0; i < chunks.length; i += GENRATIVE_AI_CONFIG.BATCH_SIZE) {
      batches.push(chunks.slice(i, i + GENRATIVE_AI_CONFIG.BATCH_SIZE));
    }

    this.logger.info(
      { documentId: data.documentId, batchCount: batches.length },
      "Starting batch processing for quiz generation"
    );

    for (let i = 0; i < batches.length; i++) {
      this.logger.info(
        {
          documentId: data.documentId,
          currentBatch: i + 1,
          totalBatches: batches.length,
        },
        "Processing batch for quiz"
      );
      const batch = batches[i];

      // Clone DTO to adjust question counts per batch
      const batchDTO = { ...data };

      // Distribute specific number of questions if set
      if (
        typeof data.numberOfQuestions === "number" &&
        data.numberOfQuestions > 0
      ) {
        const baseCount = Math.floor(data.numberOfQuestions / batches.length);
        const remainder = data.numberOfQuestions % batches.length;
        // Add remainder to the first few batches
        batchDTO.numberOfQuestions = baseCount + (i < remainder ? 1 : 0);
      }

      // Distribute distribution counts if set
      if (data.questionsDistribution) {
        const newDist = { ...data.questionsDistribution };
        // We iterate over the keys of the partial record
        for (const key of Object.keys(newDist) as Array<keyof typeof newDist>) {
          const val = newDist[key];
          if (typeof val === "number") {
            const base = Math.floor(val / batches.length);
            const rem = val % batches.length;
            newDist[key] = base + (i < rem ? 1 : 0);
          }
        }
        batchDTO.questionsDistribution = newDist;
      }

      const { prompt: promptTemplate } = quizPromptGenerator(batchDTO);

      let context = batch.map((c) => c.content).join("\n\n");

      // Inject previous summary if available
      if (previousSummary) {
        context = `PREVIOUS CONTEXT SUMMARY:\n${previousSummary}\n\nCURRENT CONTENT:\n${context}`;
      }

      const fullPrompt = promptTemplate.replace(
        "<<CONTENT_GOES_HERE>>",
        context
      );

      const result = await this.generativeAiService.generateQuizQuestions(
        fullPrompt
      );

      // Accumulate token usage
      totalPromptTokens += result.usage.promptTokens;
      totalCompletionTokens += result.usage.completionTokens;
      lastModel = result.model;

      const { questions, title, summary } = result.data;

      if (title && !quiz.getTitle()) {
        quiz.setTitle(title);
      }

      allQuestions.push(...questions);
      if (summary) {
        previousSummary = summary;
      }
    }

    // Record total token usage
    await this.tokenRateLimitingService.recordUsage(userId, {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      model: lastModel,
      endpoint: "create-quiz",
    });

    // Safety check: ensure we didn't exceed requested total if somehow model hallucinated specific counts
    // (Optional, but strict adherence might desire slicing)
    let finalQuestions = allQuestions;
    if (
      typeof data.numberOfQuestions === "number" &&
      finalQuestions.length > data.numberOfQuestions
    ) {
      finalQuestions = finalQuestions.slice(0, data.numberOfQuestions);
    }

    const isUUID = (uuid: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        uuid
      );

    // Ensure all question and option IDs are valid UUIDs
    finalQuestions = finalQuestions.map((q) => {
      const newQ = { ...q };
      if (!isUUID(newQ.id)) {
        newQ.id = crypto.randomUUID();
      }

      if (newQ.type === "mcq") {
        const optionMap = new Map<string, string>();
        newQ.options = newQ.options.map((opt) => {
          const newOpt = { ...opt };
          if (!isUUID(newOpt.id)) {
            const newId = crypto.randomUUID();
            optionMap.set(opt.id, newId);
            newOpt.id = newId;
          }
          return newOpt;
        });

        if (newQ.correctOptionIds) {
          newQ.correctOptionIds = newQ.correctOptionIds.map(
            (id) => optionMap.get(id) || id
          );
        }
      }
      return newQ;
    });

    this.logger.info(
      {
        questionCount: finalQuestions.length,
        totalPromptTokens,
        totalCompletionTokens,
      },
      "Generated quiz questions"
    );
    quiz.setQuestions(finalQuestions);

    // Save the quiz to the database
    await this.quizRepository.save(quiz);

    this.logger.info(
      { quizId: quiz.getId() },
      "CreateGeneralQuizUseCase completed successfully"
    );

    // mapping the quiz entity to response interface
    return QuizMapper.fromDomainToInterface(quiz);
  }
}
