import { IEmbeddingService } from "../../domain/services/IEmbeddingService";
import { Chunk } from "../../shared/utils/chunking";
import { client } from "../ai/embedding/embedding";
import type {
  EmbeddingListResponse,
  EmbeddingItem,
} from "../../shared/types/embedding";

enum EmbeddingConfig {
  BATCH_SIZE = 14,
}
export class EmbeddingService implements IEmbeddingService {
  async generateEmbeddings(chunks: Chunk[]): Promise<any> {
    const results: number[][] = [];

    for (let i = 0; i < chunks.length; i += EmbeddingConfig.BATCH_SIZE) {
      const batch = chunks.slice(i, i + EmbeddingConfig.BATCH_SIZE);
      const inputs = batch.map((c) => c.text);

      const res = (await client.embed({
        input: inputs,
        model: "voyage-3.5-lite",
      })) as EmbeddingListResponse;

      if (!res || !Array.isArray(res.data)) {
        throw new Error(
          `Failed to generate embeddings: unexpected response shape: ${JSON.stringify(
            res
          )}`
        );
      }

      for (const item of res.data as EmbeddingItem[]) {
        if (!Array.isArray(item.embedding))
          throw new Error(
            "Failed to generate embeddings: missing embedding in response item"
          );
        results.push(item.embedding);
      }
    }

    return results;
  }
  async generateEmbeddingForText(text: string): Promise<number[]> {
    const res = (await client.embed({
      input: [text],
      model: "voyage-3.5-lite",
    })) as EmbeddingListResponse;

    if (!res || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(
        `Failed to generate embedding: unexpected response shape: ${JSON.stringify(
          res
        )}`
      );
    }

    const item = res.data[0] as EmbeddingItem;
    if (!Array.isArray(item.embedding))
      throw new Error(
        "Failed to generate embedding: missing embedding in response item"
      );

    return item.embedding;
  }

}
