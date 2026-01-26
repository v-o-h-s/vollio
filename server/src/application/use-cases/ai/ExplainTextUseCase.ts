import { FastifyBaseLogger } from "fastify";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { ExplainTextDTO, ExplainTextResponseData } from "@vollio/shared";
import { explainTextPromptGenerator } from "../../../infrastructure/ai/generative-ai/prompts/explain";

export class ExplainTextUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private generativeAiService: IGenerativeAiService
  ) {}

  async execute(data: ExplainTextDTO): Promise<ExplainTextResponseData> {
    this.logger.info("Executing ExplainTextUseCase");

    const wordCount = data.text
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    if (wordCount > 1000) {
      throw new Error(
        "Input text is too long. Please provide text with less than 1000 words."
      );
    }

    const prompt = explainTextPromptGenerator(data.text);

    const { data: result } = await this.generativeAiService.generateText(prompt);

    // Parse the result (result is now guaranteed to be a string from GenerativeAiResult<string>)
    let parsed;
    try {
      const cleanContent = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleanContent);
    } catch (error) {
      this.logger.error(
        "Failed to parse AI response in ExplainTextUseCase: " + error
      );
      return {
        title: "Explanation",
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
