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
      data.history || []
    );

    this.logger.info({ prompt }, "Executing AssistantChatUseCase");

    const result = await this.generativeAiService.generateText(prompt);

    this.logger.info({ result }, "AssistantChatUseCase result");

    let parsed;
    if (typeof result === "string") {
      try {
        const cleanContent = result
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleanContent);
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
    } else {
      parsed = result;
    }

    // Fix node types if necessary (consistent with ExplainTextUseCase)
    const fixNodeTypes = (node: any) => {
      if (!node) return;
      if (node.type === "list") node.type = "bulletList";
      if (Array.isArray(node.content)) {
        node.content.forEach(fixNodeTypes);
      }
    };

    if (parsed.content) {
      fixNodeTypes(parsed.content);
    }

    return {
      content: parsed.content || {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Failed to generate structured content." },
            ],
          },
        ],
      },
    };
  }
}
