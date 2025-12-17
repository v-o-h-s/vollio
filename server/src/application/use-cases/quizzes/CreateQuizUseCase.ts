import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { CreateQuizResponse } from "../../../shared/types/responses/quizRoutes";
import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { Quiz } from "../../../domain/entities/Quiz";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../embedding/EnsureExistingOfDocumentEmbeddingUseCase";
import crypto from "crypto";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { ISemanticSearchService } from "../../../domain/services/ISemanticSearchService";
import { FastifyBaseLogger } from "fastify";
import { GetFileByIdUseCase } from "../files/GetFileByIdUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
export class CreateQuizUseCase {
    constructor(
        private logger: FastifyBaseLogger,
        private generativeAiService: IGenerativeAiService,
        private ensureExistingOfDocumentEmbeddingUseCase: EnsureExistingOfDocumentEmbeddingUseCase,
        private semanticSearchService: ISemanticSearchService,
        private getFileByIdUseCase: GetFileByIdUseCase
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
        if (!(await this.getFileByIdUseCase.execute(data.documentId))) {
            throw new NotFoundError("File not found");
        }
        await this.ensureExistingOfDocumentEmbeddingUseCase.execute(data.documentId);
        let refinedPrompt = "Generate a quiz based on the content provided.";
        if (data.userPrompt) {
            refinedPrompt = await this.generativeAiService.refineUserPrompt(data.userPrompt);
        }
        const chunks = await this.semanticSearchService.findRelevantChunks(refinedPrompt);
        this.logger.info(`Found ${chunks.length} relevant chunks for the prompt.`);

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
        this.logger.info(`Generated ${quizQuestions.length} questions for the quiz.`);
        quiz.setQuestions(quizQuestions);

        // mapping the quiz entity to response interface
        return QuizMapper.fromDomainToInterface(quiz);
    }
}