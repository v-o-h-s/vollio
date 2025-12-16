import { IGenerativeAiService } from "../../domain/services/IGenerativeAiService";
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
}