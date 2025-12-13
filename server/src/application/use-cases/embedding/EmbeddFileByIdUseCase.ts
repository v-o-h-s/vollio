import { IEmbeddingService } from "../../../domain/services/IEmbeddingService";
import { ChunkingService } from "../../../infrastructure/services/ChunkingService";
import { ChunkingFileByIdUseCase } from "../chunking/ChunkingFileByIdUseCase";
import { GetFileContentUseCase } from "../files/GetFileContentUseCase";

export class EmbeddFileBYIdUseCase {
    constructor(private chunkingFileByIdUseCase: ChunkingFileByIdUseCase,
        private embeddingService: IEmbeddingService,
    ) { }
    async execute(fileId: string) {
        const chunks = await this.chunkingFileByIdUseCase.execute(fileId);
        const data = await this.embeddingService.generateEmbeddings(["hi guys"]);
        return data;
    }
}