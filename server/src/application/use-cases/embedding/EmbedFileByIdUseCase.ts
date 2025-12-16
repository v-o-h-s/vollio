import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { FileProcessingService } from "../../../infrastructure/services/FileProcessingService";
import { GetFileContentUseCase } from "../files/GetFileContentUseCase";

export class EmbedFileByIdUseCase {
    constructor(
        private embeddingService: IEmbeddingService,
        private embeddingRepository: IEmbeddingRepository,
        private getFileContentUseCase: GetFileContentUseCase,
        private fileProcessingService: FileProcessingService,
        private chunkingService: ChunkingService,
    ) { }
    async execute(fileId: string) {

        const file = await this.getFileContentUseCase.execute(fileId);
        const text = await this.fileProcessingService.getText(
            new Uint8Array(file.content)
        );
        const chunks = await this.chunkingService.chunkText(text);
        const embeddings = await this.embeddingService.generateEmbeddings(chunks);
        await this.embeddingRepository.storeEmbedding(fileId, embeddings, chunks);
    }
}