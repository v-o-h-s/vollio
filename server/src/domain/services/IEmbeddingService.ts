import { Chunk } from "../../shared/utils/chunking";

export interface IEmbeddingService {
    generateEmbeddings(

    ): Promise<any>;

}