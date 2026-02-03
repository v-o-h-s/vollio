import { Chunk } from "../../shared/utils/chunking";
import { type SupabaseClient } from "@supabase/supabase-js";
import { FastifyBaseLogger } from "fastify";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { IChunkRepository } from "../../domain/repositories/IChunkRepository";
import { ChunkEntity } from "../entities/Chunk";

export class ChunkRepository implements IChunkRepository {
  private supabaseClient: SupabaseClient;
  private logger?: FastifyBaseLogger;

  constructor(supabaseClient: SupabaseClient, logger?: FastifyBaseLogger) {
    this.supabaseClient = supabaseClient;
    this.logger = logger;
  }

  /**
   * Store chunks for a document.
   */
  async storeChunks(documentId: string, chunks: Chunk[]): Promise<void> {
    const rows = chunks.map((chunk) => ({
      document_id: documentId,
      content: chunk.text,
      token_count: chunk.tokenCount,
      metadata: chunk.metadata,
    }));

    const { error } = await this.supabaseClient.from("chunks").insert(rows);
    if (error) {
      this.logger?.error({ err: error }, "Failed to insert chunks");
      throw new DatabaseError(error);
    }
  }

  async searchSimilarChunks(
    queryVector: number[],
    matchThreshold: number,
    matchCount: number,
  ): Promise<ChunkEntity[]> {
    const { data, error } = await this.supabaseClient.rpc("search_chunks", {
      query_vector: queryVector,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      this.logger?.error({ err: error }, "Failed to search chunks");
      throw new DatabaseError(error);
    }
    if (!data || data.length === 0) {
      return [];
    }

    const results = data.map(
      (row: any) =>
        new ChunkEntity(
          row.id,
          row.document_id,
          row.content,
          row.token_count,
          row.metadata,
        ),
    );

    return results;
  }

  async isDocumentChunked(documentId: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient
      .from("chunks")
      .select("id")
      .eq("document_id", documentId)
      .limit(1);

    if (error) {
      this.logger?.error(
        { err: error },
        "Failed to check if document is chunked",
      );
      throw new DatabaseError(error);
    }

    return data && data.length > 0;
  }

  async getDocumentChunks(documentId: string): Promise<ChunkEntity[]> {
    const { data, error } = await this.supabaseClient
      .from("chunks")
      .select("*")
      .eq("document_id", documentId);

    if (error) {
      this.logger?.error({ err: error }, "Failed to get document chunks");
      throw new DatabaseError(error);
    }

    return data.map(
      (row) =>
        new ChunkEntity(
          row.id,
          row.document_id,
          row.content,
          row.token_count,
          row.metadata,
        ),
    );
  }
}
