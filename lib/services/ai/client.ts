import OpenAI from "openai";
import { AIError } from "@/lib/utils/error-handling/AIError";
import { PromptTemplates } from "./lib/promptTemplates";
import { AiPromptType } from "./lib/types";
class AiService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  async generateText(promptType: AiPromptType, userInput: string) {
    const { system, messagePrefix } = PromptTemplates[promptType];
    const prompt: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      { role: "user", content: messagePrefix + userInput },
    ];
    try {
      const response = await this.client.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: prompt,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw AIError.fromError({
          message: "No content returned from AI service",
          status: 500,
          name: "EmptyResponseError",
        });
      }
      return content;
    } catch (error) {
      throw AIError.fromError(error);
    }
  }

  // STREAMING completion
  async *generateTextStream(promptType: AiPromptType, userInput: string) {
    try {
      const { system, messagePrefix } = PromptTemplates[promptType];
      const prompt: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: system },
        { role: "user", content: messagePrefix + userInput },
      ];
      const stream = await this.client.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        stream: true,
        messages: prompt,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      }
    } catch (error) {
      throw AIError.fromError(error);
    }
  }
}

export default new AiService(process.env.OPENROUTER_API_KEY!);
