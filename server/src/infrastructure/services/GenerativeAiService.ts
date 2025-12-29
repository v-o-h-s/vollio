import { QuizQuestion } from "../../domain/entities/Quiz";
import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { openRouter } from "../ai/generative-ai/client";
import { FastifyBaseLogger } from "fastify";

export class GenerativeAiService implements IGenerativeAiService {
  constructor(private logger: FastifyBaseLogger) {}

  private getModelId(model?: string): string {
    switch (model) {
      case "fast":
        return "google/gemini-2.0-flash-exp:free";
      case "smart":
        return "google/gemini-2.0-flash-001";
      case "creative":
        return "anthropic/claude-3.5-sonnet";
      default:
        return "google/gemini-2.0-flash-001";
    }
  }

  async generateText(prompt: string, model?: string): Promise<string> {
    try {
      const completion = await openRouter.chat.send({
        model: this.getModelId(model),
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const content = completion.choices[0].message.content;
      return typeof content === "string" ? content : "";
    } catch (error) {
      this.logger.error({ error }, "GenerativeAiService.generateText failed");
      return "";
    }
  }

  async refineUserPrompt(initialPrompt: string): Promise<string> {
    const prompt = `Refine the following user intent into a single clear instruction for a quiz generator:\nUser intent: "${initialPrompt}"\nResult:`;
    return this.generateText(prompt);
  }

  async generateQuizQuestions(
    prompt: string
  ): Promise<{ questions: QuizQuestion[]; title?: string; summary?: string }> {
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

      const content = completion.choices?.[0]?.message?.content || "{}";

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        title: typeof parsed.title === "string" ? parsed.title : undefined,
        summary:
          typeof parsed.summary === "string" ? parsed.summary : undefined,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateQuizQuestions failed: " + error
      );
      return { questions: [] };
    }
  }

  async generateFlashCards(
    prompt: string
  ): Promise<{ flashCards: any[]; name?: string; summary?: string }> {
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

      const content = completion.choices?.[0]?.message?.content || "{}";

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        flashCards: Array.isArray(parsed.flashCards) ? parsed.flashCards : [],
        name: typeof parsed.name === "string" ? parsed.name : undefined,
        summary:
          typeof parsed.summary === "string" ? parsed.summary : undefined,
      };
    } catch (error) {
      this.logger.error(
        "GenerativeAiService.generateFlashCards failed: " + error
      );
      return { flashCards: [] };
    }
  }

  async generateSummary(prompt: string): Promise<{ summary: string }> {
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

      const content = completion.choices?.[0]?.message?.content || "{}";

      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
      };
    } catch (error) {
      this.logger.error("GenerativeAiService.generateSummary failed: " + error);
      return { summary: "" };
    }
  }
}
