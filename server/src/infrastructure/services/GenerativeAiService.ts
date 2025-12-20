import { QuizQuestion } from "../../domain/entities/Quiz";
import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { openRouter } from "../ai/generative-ai/client";
import { FastifyBaseLogger } from "fastify";

export class GenerativeAiService implements IGenerativeAiService {
  constructor(private logger: FastifyBaseLogger) {}
  async generateText(prompt: string): Promise<string> {
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
      return typeof content === "string" ? content : "";
    } catch (error) {
      console.error("GenerativeAiService.generateText failed:", error);
      return "";
    }
  }

  async refineUserPrompt(initialPrompt: string): Promise<string> {
    const prompt = `Refine the following user intent into a single clear instruction for a quiz generator:\nUser intent: "${initialPrompt}"\nResult:`;
    return this.generateText(prompt);
  }

  async generateQuizQuestions(
    prompt: string
  ): Promise<{ questions: QuizQuestion[]; summary?: string }> {
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
}
