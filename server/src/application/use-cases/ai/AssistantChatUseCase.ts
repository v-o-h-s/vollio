import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IAiQuotaService } from "../../../domain/services/quota/IAiQuotaService";
import {
  AssistantDTO,
  AssistantResponseData,
  AssistantChatMessage,
} from "@vollio/shared";
import { assistantChatPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/assistant";

export class AssistantChatUseCase {
  constructor(
    private generativeAiService: IGenerativeAiService,
    private logger: FastifyBaseLogger,
    private aiQuotaService: IAiQuotaService,
  ) {}

  async execute(
    data: AssistantDTO,
    userId: string,
  ): Promise<AssistantResponseData> {
    const prompt = assistantChatPromptGenerator(
      data.message,
      data.history || [],
      (data as any).model,
      (data as any).tone,
    );

    const result = await this.generativeAiService.generateText(
      prompt,
      (data as any).model,
    );
    // this is will be setted using event driven architecture with rabbitMQ/supabase/redis
    // Track usage
    // Track usage
    await this.aiQuotaService.consumeTokens(userId, result.usage, {
      actionType: "chat",
      model: result.model,
      metadata: { tone: (data as any).tone },
    });

    const text = result.data;
    try {
      const cleanContent = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return { content: JSON.parse(cleanContent) };
    } catch (error) {
      this.logger.error(
        "Failed to parse AI response in AssistantChatUseCase: " + error,
      );
      return {
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: text }],
            },
          ],
        },
      };
    }
  }
}
