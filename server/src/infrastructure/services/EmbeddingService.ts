import { IEmbeddingService } from "../../domain/services/IEmbeddingService";
import { Chunk } from "../../shared/utils/chunking";
import { client } from "../embedding/embedding";
export class EmbeddingService implements IEmbeddingService {
    async generateEmbeddings() {
        const embedding = await client.embed({
            input: ["input1", "input2", "input3", "input4"],
            model: "voyage-3.5-lite ",
        });
        return embedding

    }
}