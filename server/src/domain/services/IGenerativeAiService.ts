import { ChunkMetadata } from "../../shared/utils/chunking";
import { Quiz, QuizQuestion } from "../entities/Quiz";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";

/**
 * Service interface for generative AI operations.
 * This service is responsible for generating and refining text prompts
 * using generative AI models.
 */
export interface IGenerativeAiService {
  generateText(prompt: string): Promise<any>;
  refineUserPrompt(initialPrompt: string): Promise<string>;
  generateQuizQuestions(
    prompt: string
  ): Promise<{ questions: QuizQuestion[]; title?: string; summary?: string }>;
}
