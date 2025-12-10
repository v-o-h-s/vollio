import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { IFileProcessor } from "../../domain/services/IFileProcessor";

export class testChunks {
    constructor(private fileRepository: IFileRepository, private fileProcessor: IFileProcessor) { }
    async execute(link: string) {
        
        const chunks = await this.fileProcessor.PdfToChunks(link);
        return chunks;
    }
}