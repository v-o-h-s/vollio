import { JSONContent } from "@vollio/shared";
import { QuizQuestion } from "../../domain/entities/Quiz";
import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { GENRATIVE_AI_CONFIG, openRouter } from "../ai/generative-ai/client";
import { FastifyBaseLogger } from "fastify";
import {
  GenerativeAiResult,
  createEmptyResult,
  extractTokenUsage,
} from "../../shared/types/generativeAi";

export class GenerativeAiService implements IGenerativeAiService {
  constructor(private logger: FastifyBaseLogger) {}

  async generateText(
    prompt: string,
    model?: string,
  ): Promise<GenerativeAiResult<string>> {
    try {
      const completion = await openRouter.chat.send({
        model: GENRATIVE_AI_CONFIG.MODEL,
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
        model: GENRATIVE_AI_CONFIG.MODEL,
      };
    } catch (error) {
      this.logger.error({ error }, "GenerativeAiService.generateText failed");
      return createEmptyResult("", GENRATIVE_AI_CONFIG.MODEL);
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
    try {
      const completion = await openRouter.chat.send({
        model: GENRATIVE_AI_CONFIG.MODEL,
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
        model: GENRATIVE_AI_CONFIG.MODEL,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateQuizQuestions failed: " + error,
      );
      return createEmptyResult({ questions: [] }, GENRATIVE_AI_CONFIG.MODEL);
    }
  }

  async generateFlashCards(
    prompt: string,
  ): Promise<
    GenerativeAiResult<{ flashCards: any[]; name?: string; summary?: string }>
  > {
    try {
      const completion = await openRouter.chat.send({
        model: GENRATIVE_AI_CONFIG.MODEL,
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
        model: GENRATIVE_AI_CONFIG.MODEL,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateFlashCards failed: " + error,
      );
      return createEmptyResult({ flashCards: [] }, GENRATIVE_AI_CONFIG.MODEL);
    }
  }

  async generateSummary(
    prompt: string,
  ): Promise<GenerativeAiResult<JSONContent>> {
    try {
      const completion = await openRouter.chat.send({
        model: GENRATIVE_AI_CONFIG.MODEL,
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
        model: GENRATIVE_AI_CONFIG.MODEL,
      };
    } catch (error) {
      this.logger.error("GenerativeAiService.generateSummary failed: " + error);
      return createEmptyResult(
        { type: "doc", content: [] },
        GENRATIVE_AI_CONFIG.MODEL,
      );
    }
  }
}
