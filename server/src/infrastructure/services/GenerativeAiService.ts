import { JSONContent } from "@vollio/shared";
import { QuizQuestion } from "../../domain/entities/Quiz";
import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { openRouter } from "../ai/generative-ai/client";
import { FastifyBaseLogger } from "fastify";
import {
  GenerativeAiResult,
  createEmptyResult,
  extractTokenUsage,
  EMPTY_TOKEN_USAGE,
} from "../../shared/types/generativeAi";

export class GenerativeAiService implements IGenerativeAiService {
  constructor(private logger: FastifyBaseLogger) {}

  async generateText(
    prompt: string,
    model?: string,
  ): Promise<GenerativeAiResult<string>> {
    try {
      const completion = await openRouter.chat.send({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const content = completion.choices[0].message.content;
      const usage = extractTokenUsage(completion);

      return {
        data: typeof content === "string" ? content : "",
        usage,
        model: "google/gemini-2.0-flash-001",
      };
    } catch (error) {
      this.logger.error({ error }, "GenerativeAiService.generateText failed");
      return createEmptyResult("", "google/gemini-2.0-flash-001");
    }
  }

  async refineUserPrompt(
    initialPrompt: string,
  ): Promise<GenerativeAiResult<string>> {
    const prompt = `Refine the following user intent into a single clear instruction for a quiz generator:\nUser intent: "${initialPrompt}"\nResult:`;
    return this.generateText(prompt);
  }

  async generateQuizQuestions(prompt: string): Promise<
    GenerativeAiResult<{
      questions: QuizQuestion[];
      title?: string;
      summary?: string;
    }>
  > {
    const modelId = "google/gemini-2.0-flash-001";

    try {
      const completion = await openRouter.chat.send({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const content = completion.choices?.[0]?.message?.content || "{}";
      const usage = extractTokenUsage(completion);

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        data: {
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          title: typeof parsed.title === "string" ? parsed.title : undefined,
          summary:
            typeof parsed.summary === "string" ? parsed.summary : undefined,
        },
        usage,
        model: modelId,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateQuizQuestions failed: " + error,
      );
      return createEmptyResult({ questions: [] }, modelId);
    }
  }

  async generateFlashCards(
    prompt: string,
  ): Promise<
    GenerativeAiResult<{ flashCards: any[]; name?: string; summary?: string }>
  > {
    const modelId = "google/gemini-2.0-flash-001";

    try {
      const completion = await openRouter.chat.send({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const content = completion.choices?.[0]?.message?.content || "{}";
      const usage = extractTokenUsage(completion);

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        data: {
          flashCards: Array.isArray(parsed.flashCards) ? parsed.flashCards : [],
          name: typeof parsed.name === "string" ? parsed.name : undefined,
          summary:
            typeof parsed.summary === "string" ? parsed.summary : undefined,
        },
        usage,
        model: modelId,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateFlashCards failed: " + error,
      );
      return createEmptyResult({ flashCards: [] }, modelId);
    }
  }

  async generateSummary(
    prompt: string,
  ): Promise<GenerativeAiResult<JSONContent>> {
    const modelId = "google/gemini-2.0-flash-001";

    try {
      const completion = await openRouter.chat.send({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const content = completion.choices?.[0]?.message?.content || "{}";
      const usage = extractTokenUsage(completion);

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        data: parsed,
        usage,
        model: modelId,
      };
    } catch (error) {
      this.logger.error("GenerativeAiService.generateSummary failed: " + error);
      return createEmptyResult({ type: "doc", content: [] }, modelId);
    }
  }
}
