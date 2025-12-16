import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { GenerativeAiService } from "../../../infrastructure/services/GenerativeAiService";
import { CreateQuizResponse } from "../../../shared/types/responses/quizRoutes";
import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { Quiz } from "../../../domain/entities/Quiz";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../embedding/EnsureExistingOfDocumentEmbeddingUseCase";
import crypto from "crypto";
import { language } from "googleapis/build/src/apis/language";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { ChunkMetadata } from "../../../shared/utils/chunking";
export class CreateQuizUseCase {
    constructor(
        private generativeAiService: IGenerativeAiService,
        private embeddingRepository: IEmbeddingRepository,
        private embeddingService: IEmbeddingService,
        private ensureExistingOfDocumentEmbeddingUseCase: EnsureExistingOfDocumentEmbeddingUseCase,
    ) {
    }

    async execute(data: CreateQuizDTO): Promise<CreateQuizResponse> {
        /**
         *  business logic to create a quiz so far
         *  1 - refine user prompt using generative ai service (if user prompt is provided) else use default prompt []
         *  2 - check the embedding of the file exists in the embedding storage repository if not create one 
         *  3 - fetch all chunks relevant to the prompt using the embedding service
         *  4 - pass the chunks and other quiz parameters to the generative ai service to generate the quiz
         *  5 - return the quiz
         */
        // getting chunks relevant to the prompt
        let refinedPrompt = "Generate a quiz based on the content provided.";
        if (data.userPrompt) {
            refinedPrompt = await this.generativeAiService.refineUserPrompt(data.userPrompt);
        }
        const promptEmbedding = await this.embeddingService.generateEmbeddingForText(refinedPrompt);
        await this.ensureExistingOfDocumentEmbeddingUseCase.execute(data.documentId);
        const relevantEmbeddings = await this.embeddingRepository.searchSimilarEmbeddings(
            promptEmbedding,
            0.67,
            5
        );
        if (relevantEmbeddings === null || relevantEmbeddings.length === 0) {
            throw new Error("No relevant content found to generate the quiz.");
        }
        const chunks: { content: string, metadata: ChunkMetadata }[] = relevantEmbeddings.map(e => ({ content: e.getContent(), metadata: e.getMetadata() }));

        // creating the quiz entity
        const quiz = new Quiz(
            crypto.randomUUID(),
            data.documentId,
            data.difficultyLevel,
            data.language,
            data.explanationLevel,
            data.numberOfQuestions,
            data.timeLimitMinutes,
        )
        // generating questions using generative ai service
        const quizQuestions = await this.generativeAiService.generateQuizQuestions(
            quiz,
            chunks,

        );
        quiz.setQuestions(quizQuestions);

        // mapping the quiz entity to response interface
        return QuizMapper.fromDomainToInterface(quiz);
    }
}