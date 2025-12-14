export interface IGenerativeAiService {
    generateTextPrompt(prompt: string): Promise<string>;
    getSamplePrompt(file: Buffer): Promise<string>; 
    
}