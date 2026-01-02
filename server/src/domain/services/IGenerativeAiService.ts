import { ChunkMetadata } from "../../shared/utils/chunking";
import { Quiz, QuizQuestion } from "../entities/Quiz";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { JSONContent } from "@vollio/shared";

/**
 * Service interface for generative AI operations.
 * This service is responsible for generating and refining text prompts
 * using generative AI models.
 */
export interface IGenerativeAiService {
  generateText(prompt: string, model?: string): Promise<any>;
  refineUserPrompt(initialPrompt: string): Promise<string>;
  generateQuizQuestions(
    prompt: string
  ): Promise<{ questions: QuizQuestion[]; title?: string; summary?: string }>;
  generateFlashCards(
    prompt: string
  ): Promise<{ flashCards: any[]; name?: string; summary?: string }>;
  generateSummary(prompt: string): Promise<JSONContent>;
}
