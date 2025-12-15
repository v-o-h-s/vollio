import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { IGenerativeAiService } from "../../../domain/services/IGenerativeAiService";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { FileProcessingService } from "../../../infrastructure/services/FileProcessingService";
import { GetFileContentUseCase } from "../files/GetFileContentUseCase";

export class EmbeddFileBYIdUseCase {
    constructor(
        private embeddingService: IEmbeddingService,
        private getFileContentUseCase: GetFileContentUseCase,
        private fileProcessingService: FileProcessingService,
        private chunkingService: ChunkingService,
        private generativeAiService: IGenerativeAiService
    ) { }
    async execute(fileId: string) {

        //     const file = await this.getFileContentUseCase.execute(fileId);
        //     const text = await this.fileProcessingService.getText(
        //         new Uint8Array(file.content)
        //     );
        //     const chunks = await this.chunkingService.chunkText(text);
        //    const embeddings = await this.embeddingService.generateEmbeddings();
        const response = await this.generativeAiService.generateText("")
        return response;
    }
}