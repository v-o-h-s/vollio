import { QuizQuestion } from "../entities/Quiz";
import { JSONContent } from "@vollio/shared";
import {
  GenerativeAiResult,
  TokenUsage,
} from "../../shared/types/generativeAi";

/**
 * Service interface for generative AI operations.
 * This service is responsible for generating and refining text prompts
 * using generative AI models.
 *
 * All methods return GenerativeAiResult which includes token usage for rate limiting.
 */
export interface IGenerativeAiService {
  generateText(
    prompt: string,
    model?: string
  ): Promise<GenerativeAiResult<string>>;
  refineUserPrompt(initialPrompt: string): Promise<GenerativeAiResult<string>>;
  generateQuizQuestions(
    prompt: string
  ): Promise<
    GenerativeAiResult<{
      questions: QuizQuestion[];
      title?: string;
      summary?: string;
    }>
  >;
  generateFlashCards(
    prompt: string
  ): Promise<
    GenerativeAiResult<{ flashCards: any[]; name?: string; summary?: string }>
  >;
  generateSummary(prompt: string): Promise<GenerativeAiResult<JSONContent>>;
}
