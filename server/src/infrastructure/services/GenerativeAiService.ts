import { Quiz, QuizQuestion } from "../../domain/entities/Quiz";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { quizPromptGenerator } from "../ai/generative-ai/prompts/quizzes";

import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { ChunkMetadata } from "../../shared/utils/chunking";
import { openRouter } from "../ai/generative-ai/client";
export class GenerativeAiService implements IGenerativeAiService {
  async generateText(prompt: string): Promise<any> {
    const completion = await openRouter.chat.send({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "user",
          content: "What is the meaning of life?",
        },
      ],
      stream: false,
    });

    return completion.choices[0].message.content;
  }
  async refineUserPrompt(initialPrompt: string): Promise<string> {
    // base create quiz aobut edges
    return "edges ";
  }
  async generateQuizQuestions(
    data: CreateQuizDTO,
    chunks: { content: string; metadata: ChunkMetadata }[]
  ): Promise<QuizQuestion[]> {
    const { prompt: promptTemplate } = quizPromptGenerator(data);
    const context = chunks.map((c) => c.content).join("\n\n");
    const fullPrompt = promptTemplate.replace("<<CONTENT_GOES_HERE>>", context);

    const completion = await openRouter.chat.send({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content || "{}";

    try {
      // Clean markdown code blocks if present (though prompt says return ONLY JSON, models sometimes add it)
      const contentStr = String(content);
      const cleanContent = contentStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);
      return parsed.questions || [];
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error(
        "Failed to generate valid quiz questions from AI response."
      );
    }
  }
}
