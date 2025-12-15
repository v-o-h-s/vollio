export interface IGenerativeAiService {
    generateText(prompt:string): Promise<any>;
    
}