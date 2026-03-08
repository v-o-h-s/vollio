import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { IAiQuotaService } from "../../../domain/services/quota/IAiQuotaService";
import { ExplainTextDTO, ExplainTextResponseData } from "../../../shared";
import { explainTextPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/explain";

export class ExplainTextUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService,
    private aiQuotaService: IAiQuotaService,
  ) {}

  async execute(
    data: ExplainTextDTO,
    userId: string,
  ): Promise<ExplainTextResponseData> {
    this.logger.info("Executing ExplainTextUseCase");

    const wordCount = data.text
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    if (wordCount > 1000) {
      throw new Error(
        "Input text is too long. Please provide text with less than 1000 words.",
      );
    }

    const prompt = explainTextPromptGenerator(data.text);

    const result = await this.generativeAiService.generateText(prompt);

    // Track usage
    await this.aiQuotaService.consumeTokens(userId, result.usage, {
      actionType: "other",
      model: result.model,
      metadata: { wordCount },
    });

    const text = result.data;

    // Parse the result
    let parsed;
    try {
      const cleanContent = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleanContent);
    } catch (error) {
      this.logger.error(
        "Failed to parse AI response in ExplainTextUseCase: " + error,
      );
      return {
        title: "Explanation",
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

    // Recursive function to fix unknown node types (like 'list' -> 'bulletList')
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
      title: parsed.title || "Explanation",
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
