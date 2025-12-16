import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { GenerativeAiService } from "../../../infrastructure/services/GenerativeAiService";
import { CreateQuizResponse } from "../../../shared/types/responses/quizRoutes";
import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { Quiz } from "../../../domain/entities/Quiz";
import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../embedding/EnsureExistingOfDocumentEmbeddingUseCase";
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

        let refinedPrompt = "Generate a quiz based on the content provided.";
        if (data.userPrompt) {
            refinedPrompt = await this.generativeAiService.refineUserPrompt(data.userPrompt);
        }
        const promptEmbedding = await this.embeddingService.generateEmbeddingForText(refinedPrompt);
        await this.ensureExistingOfDocumentEmbeddingUseCase.execute(data.fileId);
        const relevantEmbeddings = await this.embeddingRepository.searchSimilarEmbeddings(
            promptEmbedding,
            0.67,
            5
        );
        const chunks = relevantEmbeddings.map(embedding =>{
            return {content:embedding.content, index: embedding.chunkIndex};
        }).join("\n");

    }
}