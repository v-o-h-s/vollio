import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { GetFileContentUseCase } from "../files/GetFileContentUseCase";

export class ChunkingFileByIdUseCase {
    constructor(
        private getFileContentUseCase: GetFileContentUseCase,
        private chunkingService: ChunkingService
    ) { }

    async execute(fileId: string) {
        const fileContentResult = await this.getFileContentUseCase.execute(fileId);
        // Convert Buffer to Uint8Array for pdf.js
        const uint8Array = new Uint8Array(fileContentResult.content);
        const chunks = await this.chunkingService.chunkFile(uint8Array, fileContentResult.mimeType, fileContentResult.filename, fileId);
        return chunks;
    }
}