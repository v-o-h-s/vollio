import { IEmbeddingRepository } from "../../../domain/repositories/IEmbeddingRepository";
import { EmbedFileByIdUseCase } from "./EmbedFileByIdUseCase";

export class EnsureExistingOfDocumentEmbeddingUseCase {
    constructor(private embeddingRepository: IEmbeddingRepository,
        private embedFileByIdUseCase: EmbedFileByIdUseCase) {
    }

    async execute(documentId: string): Promise<void> {
        const isEmbedded = await this.embeddingRepository.isFileEmbedded(documentId);
        if (!isEmbedded) {
            await this.embedFileByIdUseCase.execute(documentId);
        }
    }
}