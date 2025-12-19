import { Quiz, QuizQuestion } from "../../domain/entities/Quiz";
import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
import { ChunkMetadata } from "../../shared/utils/chunking";
import { openRouter } from "../ai/generative-ai/client";
export class GenerativeAiService implements IGenerativeAiService {
    async generateText(prompt: string): Promise<any> {
        const completion = await openRouter.chat.send({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'user',
                    content: 'What is the meaning of life?',
                },
            ],
            stream: false,
        });


        return completion.choices[0].message.content;
    }
    async refineUserPrompt(initialPrompt: string): Promise<string> {
        // base create quiz aobut edges 
        return "edges "
    }
     async generateQuizQuestions(quiz: Quiz, chunks: { content: string, metadata: ChunkMetadata }[],): Promise<QuizQuestion[]>{
        throw new Error("Method not implemented.");
     };
}