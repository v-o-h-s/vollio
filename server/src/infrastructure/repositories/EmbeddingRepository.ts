import { Chunk } from "../../shared/utils/chunking";
import { type SupabaseClient } from "@supabase/supabase-js";
import { FastifyBaseLogger } from "fastify";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { IEmbeddingRepository } from "../../domain/repositories/IEmbeddingRepository";
import { Embedding } from "../entities/Embedding";

export class EmbeddingRepository implements IEmbeddingRepository {
    private supabaseClient: SupabaseClient;
    private logger?: FastifyBaseLogger;

    constructor(supabaseClient: SupabaseClient, logger?: FastifyBaseLogger) {
        this.supabaseClient = supabaseClient;
        this.logger = logger;
    }

    /**
     * Store embeddings for a document.
     * The `embedding` parameter can be either:
     * - an array of vectors (number[][]) where each vector corresponds to a chunk, or
     * - a single vector (number[]) which will be applied to every chunk (not typical but supported).
     */
    async storeEmbedding(documentId: string, embedding: number[][], chunks: Chunk[]): Promise<void> {

        const vectors: number[][] = embedding;

        if (vectors.length !== chunks.length) {
            throw new DatabaseError({ message: "Embeddings length must match chunks length" });
        }

        const rows = chunks.map((chunk, idx) => ({
            document_id: documentId,
            content: chunk.text,
            embedding: vectors[idx],
            chunk_index: chunk.metadata.chunkIndex ?? idx,
            token_count: chunk.tokenCount,
            metadata: chunk.metadata,
        }));

        const { error } = await this.supabaseClient.from("embeddings").insert(rows);
        if (error) {
            this.logger?.error({ err: error }, "Failed to insert embeddings");
            throw new DatabaseError(error);
        }
    };

    async searchSimilarEmbeddings(queryEmbedding: number[], matchThreshold: number, matchCount: number): Promise<Embedding[]> {
        const { data, error } = await this.supabaseClient.rpc("search_embeddings", {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) {
            this.logger?.error({ err: error }, "Failed to search embeddings");
            throw new DatabaseError(error);
        }
        if (!data || data.length === 0) {
            return [];
        }

        const results = (data).map((row: any) => (new Embedding(
            row.id,
            row.document_id,
            row.content,
            row.embedding,
            row.chunk_index,
            row.token_count,
            row.metadata,
        )));

        return results;
    };
    async isFileEmbedded(fileId: string): Promise<boolean> {
        const { data, error } = await this.supabaseClient
            .from("embeddings")
            .select("id")
            .eq("document_id", fileId)
            .limit(1);

        if (error) {
            this.logger?.error({ err: error }, "Failed to check if file is embedded");
            throw new DatabaseError(error);
        }

        return (data && data.length > 0);
    }
}