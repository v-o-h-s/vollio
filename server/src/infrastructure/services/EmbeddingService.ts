import { IEmbeddingService } from "../../domain/services/IEmbeddingService";
import fetch from "node-fetch";
export class EmbeddingService implements IEmbeddingService {
    async generateEmbeddings(texts: string[], model?: string) {
        const response = await fetch("https://noto.lightning.ai/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts }) // must match FastAPI
        });
        const data = await response.json();
        return (data as any).embeddings; // access embeddings directly
    }
}
