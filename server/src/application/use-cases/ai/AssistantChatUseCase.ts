import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import {
  AssistantDTO,
  AssistantResponseData,
  AssistantChatMessage,
} from "@vollio/shared";
import { assistantChatPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/assistant";

export class AssistantChatUseCase {
  constructor(
    private generativeAiService: IGenerativeAiService,
    private logger: FastifyBaseLogger
  ) {}

  async execute(data: AssistantDTO): Promise<AssistantResponseData> {
    const prompt = assistantChatPromptGenerator(
      data.message,
      data.history || [],
      (data as any).model,
      (data as any).tone
    );

    const { data: result } = await this.generativeAiService.generateText(
      prompt,
      (data as any).model
    );

    try {
      const cleanContent = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return { content: JSON.parse(cleanContent) };
    } catch (error) {
      this.logger.error(
        "Failed to parse AI response in AssistantChatUseCase: " + error
      );
      return {
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: result }],
            },
          ],
        },
      };
    }
  }
}
