
/**
 * Service interface for generative AI operations.
 * This service is responsible for generating and refining text prompts
 * using generative AI models.
 */
export interface IGenerativeAiService {
    generateText(prompt: string): Promise<any>;
    refineUserPrompt(initialPrompt: string): Promise<string>;

}