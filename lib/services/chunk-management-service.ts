import { DocumentChunk, ChunkMetadata } from "./document-processing";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedSupabaseClient } from "../supabaseClient";

/**
 * Chunk versioning interface
 */
export interface ChunkVersion {
  id: string;
  chunkId: string;
  version: number;
  content: string;
  embedding?: number[];
  tokenCount: number;
  metadata: ChunkMetadata;
  qualityMetrics: ChunkQualityMetrics;
  parentVersion?: string;
  changeReason: string;
  createdAt: string;
}

/**
 * Chunk analytics interface
 */
export interface ChunkAnalytics {
  id: string;
  chunkId: string;
  userId: string;
  documentId: string;
  usageCount: number;
  totalRelevanceScore: number;
  lastUsed?: string;
  usageType: "quiz_generation" | "content_search" | "similarity_search";
  successCount: number;
  userFeedback: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chunk quality metrics interface
 */
export interface ChunkQualityMetrics {
  contentLength: number;
  tokenDensity: number;
  structuralCoherence: number;
  semanticCoherence: number;
  informationDensity: number;
  readability: number;
  duplicateScore: number;
  overallQuality: number;
}

/**
 * Chunk quality scores interface
 */
export interface ChunkQualityScore {
  id: string;
  chunkId: string;
  userId: string;
  contentLength: number;
  tokenDensity: number;
  structuralCoherence: number;
  semanticCoherence: number;
  informationDensity: number;
  readability: number;
  duplicateScore: number;
  overallQuality: number;
  calculatedAt: string;
}

/**
 * Chunk management options
 */
export interface ChunkManagementOptions {
  enableVersioning?: boolean;
  enableAnalytics?: boolean;
  enableQualityScoring?: boolean;
  qualityThreshold?: number;
  deduplicationThreshold?: number;
  maxVersionsPerChunk?: number;
}

/**
 * Chunk update request
 */
export interface ChunkUpdateRequest {
  content?: string;
  embedding?: number[];
  metadata?: Partial<ChunkMetadata>;
  changeReason: string;
}

/**
 * Chunk deduplication result
 */
export interface DeduplicationResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  spaceFreed: number;
  duplicateGroups: Array<{
    representativeChunk: string;
    duplicates: string[];
    similarity: number;
  }>;
}

/**
 * Chunk cleanup result
 */
export interface CleanupResult {
  chunksProcessed: number;
  chunksRemoved: number;
  versionsRemoved: number;
  analyticsUpdated: number;
  spaceFreed: number;
}

/**
 * Chunk performance metrics
 */
export interface ChunkPerformanceMetrics {
  totalChunks: number;
  averageQuality: number;
  highQualityChunks: number;
  lowQualityChunks: number;
  mostUsedChunks: Array<{
    chunkId: string;
    usageCount: number;
    averageRelevance: number;
  }>;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  usageStatistics: {
    totalUsage: number;
    averageUsage: number;
    peakUsage: number;
  };
}

/**
 * Comprehensive chunk management service for efficient operations,
 * versioning, analytics, and quality optimization
 */
export class ChunkManagementService {
  private static readonly DEFAULT_OPTIONS: Required<ChunkManagementOptions> = {
    enableVersioning: true,
    enableAnalytics: true,
    enableQualityScoring: true,
    qualityThreshold: 0.6,
    deduplicationThreshold: 0.95,
    maxVersionsPerChunk: 10,
  };

  private options: Required<ChunkManagementOptions>;

  constructor(options: ChunkManagementOptions = {}) {
    this.options = { ...ChunkManagementService.DEFAULT_OPTIONS, ...options };
  }

  /**
   * Create a new chunk with optional versioning and quality scoring
   */
  async createChunk(
    userId: string,
    documentId: string,
    chunkData: {
      content: string;
      embedding?: number[];
      tokenCount: number;
      pageNumber: number;
      chunkIndex: number;
      sectionTitle?: string;
      metadata: ChunkMetadata;
    }
  ): Promise<DocumentChunk> {
    const { client } = await getAuthenticatedSupabaseClient();

    const chunkId = uuidv4();
    const now = new Date().toISOString();

    // Calculate quality score if enabled
    let qualityScore: number | null = null;
    if (this.options.enableQualityScoring) {
      const qualityMetrics = await this.calculateQualityMetrics(
        chunkData.content,
        chunkData.metadata
      );
      qualityScore = qualityMetrics.overallQuality;

      // Store quality score
      await this.storeQualityScore(userId, chunkId, qualityMetrics);
    }

    // Create the chunk
    const { data: chunk, error } = await client
      .from("document_chunks")
      .insert({
        id: chunkId,
        user_id: userId,
        document_id: documentId,
        chunk_index: chunkData.chunkIndex,
        content: chunkData.content,
        embedding: chunkData.embedding,
        token_count: chunkData.tokenCount,
        page_number: chunkData.pageNumber,
        section_title: chunkData.sectionTitle,
        metadata: chunkData.metadata,
        quality_score: qualityScore,
        last_quality_check: qualityScore ? now : null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chunk: ${error.message}`);
    }

    // Create initial version if versioning is enabled
    if (this.options.enableVersioning) {
      await this.createVersion(chunkId, {
        content: chunkData.content,
        embedding: chunkData.embedding,
        tokenCount: chunkData.tokenCount,
        metadata: chunkData.metadata,
        qualityMetrics: qualityScore
          ? await this.getQualityMetrics(chunkId)
          : ({} as ChunkQualityMetrics),
        changeReason: "Initial creation",
      });
    }

    // Initialize analytics if enabled
    if (this.options.enableAnalytics) {
      await this.initializeAnalytics(userId, chunkId, documentId);
    }

    return this.mapChunkFromDatabase(chunk);
  }

  /**
   * Update an existing chunk with versioning support
   */
  async updateChunk(
    chunkId: string,
    updateData: ChunkUpdateRequest
  ): Promise<DocumentChunk> {
    const { client } = await getAuthenticatedSupabaseClient();

    // Get current chunk
    const { data: currentChunk, error: fetchError } = await client
      .from("document_chunks")
      .select("*")
      .eq("id", chunkId)
      .single();

    if (fetchError || !currentChunk) {
      throw new Error(
        `Failed to fetch chunk: ${fetchError?.message || "Chunk not found"}`
      );
    }

    const now = new Date().toISOString();
    const updateFields: any = { updated_at: now };

    // Update content if provided
    if (updateData.content !== undefined) {
      updateFields.content = updateData.content;
      updateFields.token_count = this.estimateTokenCount(updateData.content);
    }

    // Update embedding if provided
    if (updateData.embedding !== undefined) {
      updateFields.embedding = updateData.embedding;
    }

    // Update metadata if provided
    if (updateData.metadata !== undefined) {
      updateFields.metadata = {
        ...currentChunk.metadata,
        ...updateData.metadata,
      };
    }

    // Recalculate quality score if content changed
    if (updateData.content && this.options.enableQualityScoring) {
      const qualityMetrics = await this.calculateQualityMetrics(
        updateData.content,
        updateFields.metadata || currentChunk.metadata
      );
      updateFields.quality_score = qualityMetrics.overallQuality;
      updateFields.last_quality_check = now;

      // Update quality score record
      await this.storeQualityScore(
        currentChunk.user_id,
        chunkId,
        qualityMetrics
      );
    }

    // Update the chunk
    const { data: updatedChunk, error: updateError } = await client
      .from("document_chunks")
      .update(updateFields)
      .eq("id", chunkId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update chunk: ${updateError.message}`);
    }

    // Create new version if versioning is enabled
    if (this.options.enableVersioning) {
      await this.createVersion(chunkId, {
        content: updateData.content || currentChunk.content,
        embedding: updateData.embedding || currentChunk.embedding,
        tokenCount: updateFields.token_count || currentChunk.token_count,
        metadata: updateFields.metadata || currentChunk.metadata,
        qualityMetrics: updateFields.quality_score
          ? await this.getQualityMetrics(chunkId)
          : ({} as ChunkQualityMetrics),
        changeReason: updateData.changeReason,
      });
    }

    return this.mapChunkFromDatabase(updatedChunk);
  }

  /**
   * Get chunk with version history
   */
  async getChunkWithVersions(chunkId: string): Promise<{
    chunk: DocumentChunk;
    versions: ChunkVersion[];
    analytics?: ChunkAnalytics;
    qualityScore?: ChunkQualityScore;
  }> {
    const { client } = await getAuthenticatedSupabaseClient();

    // Get chunk
    const { data: chunk, error: chunkError } = await client
      .from("document_chunks")
      .select("*")
      .eq("id", chunkId)
      .single();

    if (chunkError || !chunk) {
      throw new Error(
        `Failed to fetch chunk: ${chunkError?.message || "Chunk not found"}`
      );
    }

    const result: any = {
      chunk: this.mapChunkFromDatabase(chunk),
    };

    // Get versions if versioning is enabled
    if (this.options.enableVersioning) {
      const { data: versions } = await client
        .from("chunk_versions")
        .select("*")
        .eq("chunk_id", chunkId)
        .order("version", { ascending: false });

      result.versions = versions?.map(this.mapVersionFromDatabase) || [];
    } else {
      result.versions = [];
    }

    // Get analytics if enabled
    if (this.options.enableAnalytics) {
      const { data: analytics } = await client
        .from("chunk_analytics")
        .select("*")
        .eq("chunk_id", chunkId)
        .single();

      if (analytics) {
        result.analytics = this.mapAnalyticsFromDatabase(analytics);
      }
    }

    // Get quality score if enabled
    if (this.options.enableQualityScoring) {
      const { data: qualityScore } = await client
        .from("chunk_quality_scores")
        .select("*")
        .eq("chunk_id", chunkId)
        .single();

      if (qualityScore) {
        result.qualityScore = this.mapQualityScoreFromDatabase(qualityScore);
      }
    }

    return result;
  }

  /**
   * Record chunk usage for analytics
   */
  async recordUsage(
    chunkId: string,
    usageType: "quiz_generation" | "content_search" | "similarity_search",
    relevanceScore: number,
    success: boolean = true
  ): Promise<void> {
    if (!this.options.enableAnalytics) return;

    const { client } = await getAuthenticatedSupabaseClient();
    const now = new Date().toISOString();

    // Update or create analytics record
    const { error } = await client.from("chunk_analytics").upsert(
      {
        chunk_id: chunkId,
        usage_count: 1,
        total_relevance_score: relevanceScore,
        last_used: now,
        usage_type: usageType,
        success_count: success ? 1 : 0,
        updated_at: now,
      },
      {
        onConflict: "chunk_id,user_id",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error("Failed to record chunk usage:", error);
    }
  }

  /**
   * Calculate and store quality metrics for a chunk
   */
  async calculateQualityMetrics(
    content: string,
    metadata: ChunkMetadata
  ): Promise<ChunkQualityMetrics> {
    const contentLength = content.length;
    const tokenCount = this.estimateTokenCount(content);

    // Calculate various quality metrics
    const tokenDensity = tokenCount / Math.max(contentLength, 1);
    const structuralCoherence = this.calculateStructuralCoherence(
      content,
      metadata
    );
    const semanticCoherence = this.calculateSemanticCoherence(content);
    const informationDensity = this.calculateInformationDensity(content);
    const readability = this.calculateReadability(content);
    const duplicateScore = 0; // Will be calculated during deduplication

    // Calculate overall quality as weighted average
    const overallQuality =
      structuralCoherence * 0.2 +
      semanticCoherence * 0.25 +
      informationDensity * 0.2 +
      readability * 0.15 +
      (1 - duplicateScore) * 0.2; // Lower duplicate score = higher quality

    return {
      contentLength,
      tokenDensity,
      structuralCoherence,
      semanticCoherence,
      informationDensity,
      readability,
      duplicateScore,
      overallQuality: Math.max(0, Math.min(1, overallQuality)),
    };
  }

  /**
   * Perform chunk deduplication across documents
   */
  async deduplicateChunks(
    userId: string,
    documentIds?: string[]
  ): Promise<DeduplicationResult> {
    const { client } = await getAuthenticatedSupabaseClient();

    // Build query for chunks to deduplicate
    let query = client
      .from("document_chunks")
      .select("id, content, document_id, embedding")
      .eq("user_id", userId);

    if (documentIds && documentIds.length > 0) {
      query = query.in("document_id", documentIds);
    }

    const { data: chunks, error } = await query;

    if (error || !chunks) {
      throw new Error(
        `Failed to fetch chunks for deduplication: ${error?.message}`
      );
    }

    const duplicateGroups: Array<{
      representativeChunk: string;
      duplicates: string[];
      similarity: number;
    }> = [];

    const processedChunks = new Set<string>();
    let duplicatesRemoved = 0;
    let spaceFreed = 0;

    // Compare chunks for similarity
    for (let i = 0; i < chunks.length; i++) {
      if (processedChunks.has(chunks[i].id)) continue;

      const currentChunk = chunks[i];
      const duplicates: string[] = [];

      for (let j = i + 1; j < chunks.length; j++) {
        if (processedChunks.has(chunks[j].id)) continue;

        const compareChunk = chunks[j];
        const similarity = this.calculateContentSimilarity(
          currentChunk.content,
          compareChunk.content
        );

        if (similarity >= this.options.deduplicationThreshold) {
          duplicates.push(compareChunk.id);
          processedChunks.add(compareChunk.id);
          spaceFreed += compareChunk.content.length;
        }
      }

      if (duplicates.length > 0) {
        duplicateGroups.push({
          representativeChunk: currentChunk.id,
          duplicates,
          similarity: this.options.deduplicationThreshold,
        });

        // Remove duplicate chunks
        const { error: deleteError } = await client
          .from("document_chunks")
          .delete()
          .in("id", duplicates);

        if (!deleteError) {
          duplicatesRemoved += duplicates.length;
        }
      }

      processedChunks.add(currentChunk.id);
    }

    return {
      duplicatesFound: duplicateGroups.reduce(
        (sum, group) => sum + group.duplicates.length,
        0
      ),
      duplicatesRemoved,
      spaceFreed,
      duplicateGroups,
    };
  }

  /**
   * Perform chunk cleanup and maintenance
   */
  async performCleanup(
    userId: string,
    options: {
      removeOrphanedChunks?: boolean;
      removeOldVersions?: boolean;
      updateQualityScores?: boolean;
      removeUnusedChunks?: boolean;
      maxAge?: number; // in days
    } = {}
  ): Promise<CleanupResult> {
    const { client } = await getAuthenticatedSupabaseClient();

    let chunksProcessed = 0;
    let chunksRemoved = 0;
    let versionsRemoved = 0;
    let analyticsUpdated = 0;
    let spaceFreed = 0;

    // Remove orphaned chunks (chunks without valid document references)
    if (options.removeOrphanedChunks) {
      const { data: orphanedChunks } = await client
        .from("document_chunks")
        .select("id, content")
        .eq("user_id", userId)
        .not(
          "document_id",
          "in",
          `(SELECT id FROM pdfs WHERE user_id = '${userId}')`
        );

      if (orphanedChunks && orphanedChunks.length > 0) {
        const orphanedIds = orphanedChunks.map((c) => c.id);
        spaceFreed += orphanedChunks.reduce(
          (sum, c) => sum + c.content.length,
          0
        );

        const { error } = await client
          .from("document_chunks")
          .delete()
          .in("id", orphanedIds);

        if (!error) {
          chunksRemoved += orphanedChunks.length;
        }
      }
    }

    // Remove old versions beyond the limit
    if (options.removeOldVersions && this.options.enableVersioning) {
      const { data: chunks } = await client
        .from("document_chunks")
        .select("id")
        .eq("user_id", userId);

      if (chunks) {
        for (const chunk of chunks) {
          const { data: versions } = await client
            .from("chunk_versions")
            .select("id")
            .eq("chunk_id", chunk.id)
            .order("version", { ascending: false })
            .range(this.options.maxVersionsPerChunk, 1000);

          if (versions && versions.length > 0) {
            const { error } = await client
              .from("chunk_versions")
              .delete()
              .in(
                "id",
                versions.map((v) => v.id)
              );

            if (!error) {
              versionsRemoved += versions.length;
            }
          }
        }
      }
    }

    // Update quality scores for chunks that haven't been checked recently
    if (options.updateQualityScores && this.options.enableQualityScoring) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (options.maxAge || 30));

      const { data: chunksToUpdate } = await client
        .from("document_chunks")
        .select("id, content, metadata")
        .eq("user_id", userId)
        .or(
          `last_quality_check.is.null,last_quality_check.lt.${cutoffDate.toISOString()}`
        );

      if (chunksToUpdate) {
        for (const chunk of chunksToUpdate) {
          try {
            const qualityMetrics = await this.calculateQualityMetrics(
              chunk.content,
              chunk.metadata
            );

            await client
              .from("document_chunks")
              .update({
                quality_score: qualityMetrics.overallQuality,
                last_quality_check: new Date().toISOString(),
              })
              .eq("id", chunk.id);

            await this.storeQualityScore(userId, chunk.id, qualityMetrics);
            analyticsUpdated++;
          } catch (error) {
            console.error(
              `Failed to update quality score for chunk ${chunk.id}:`,
              error
            );
          }
        }
      }
    }

    // Remove unused chunks (chunks with very low usage and quality)
    if (options.removeUnusedChunks && this.options.enableAnalytics) {
      const { data: unusedChunks } = await client
        .from("document_chunks")
        .select("id, content, chunk_analytics(usage_count)")
        .eq("user_id", userId)
        .lt("quality_score", 0.3)
        .filter("chunk_analytics.usage_count", "lt", 2);

      if (unusedChunks && unusedChunks.length > 0) {
        const unusedIds = unusedChunks.map((c) => c.id);
        spaceFreed += unusedChunks.reduce(
          (sum, c) => sum + c.content.length,
          0
        );

        const { error } = await client
          .from("document_chunks")
          .delete()
          .in("id", unusedIds);

        if (!error) {
          chunksRemoved += unusedChunks.length;
        }
      }
    }

    chunksProcessed = chunksRemoved + analyticsUpdated;

    return {
      chunksProcessed,
      chunksRemoved,
      versionsRemoved,
      analyticsUpdated,
      spaceFreed,
    };
  }

  /**
   * Get performance metrics for chunks
   */
  async getPerformanceMetrics(
    userId: string,
    documentIds?: string[]
  ): Promise<ChunkPerformanceMetrics> {
    const { client } = await getAuthenticatedSupabaseClient();

    // Build base query
    let chunkQuery = client
      .from("document_chunks")
      .select(
        "id, quality_score, chunk_analytics(usage_count, total_relevance_score)"
      )
      .eq("user_id", userId);

    if (documentIds && documentIds.length > 0) {
      chunkQuery = chunkQuery.in("document_id", documentIds);
    }

    const { data: chunks, error } = await chunkQuery;

    if (error || !chunks) {
      throw new Error(`Failed to fetch performance metrics: ${error?.message}`);
    }

    const totalChunks = chunks.length;
    const qualityScores = chunks
      .map((c) => c.quality_score)
      .filter((score) => score !== null) as number[];

    const averageQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length
        : 0;

    const highQualityChunks = qualityScores.filter(
      (score) => score >= 0.8
    ).length;
    const lowQualityChunks = qualityScores.filter(
      (score) => score < 0.4
    ).length;

    // Get most used chunks
    const chunksWithAnalytics = chunks
      .filter((c) => c.chunk_analytics && c.chunk_analytics.length > 0)
      .map((c) => ({
        chunkId: c.id,
        usageCount: c.chunk_analytics[0].usage_count,
        averageRelevance:
          c.chunk_analytics[0].total_relevance_score /
          Math.max(c.chunk_analytics[0].usage_count, 1),
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    // Quality distribution
    const qualityDistribution = {
      excellent: qualityScores.filter((score) => score >= 0.9).length,
      good: qualityScores.filter((score) => score >= 0.7 && score < 0.9).length,
      fair: qualityScores.filter((score) => score >= 0.5 && score < 0.7).length,
      poor: qualityScores.filter((score) => score < 0.5).length,
    };

    // Usage statistics
    const usageCounts = chunksWithAnalytics.map((c) => c.usageCount);
    const totalUsage = usageCounts.reduce((sum, count) => sum + count, 0);
    const averageUsage =
      usageCounts.length > 0 ? totalUsage / usageCounts.length : 0;
    const peakUsage = usageCounts.length > 0 ? Math.max(...usageCounts) : 0;

    return {
      totalChunks,
      averageQuality,
      highQualityChunks,
      lowQualityChunks,
      mostUsedChunks: chunksWithAnalytics,
      qualityDistribution,
      usageStatistics: {
        totalUsage,
        averageUsage,
        peakUsage,
      },
    };
  }

  /**
   * Filter chunks by quality threshold
   */
  async filterChunksByQuality(
    userId: string,
    minQuality: number,
    documentIds?: string[]
  ): Promise<DocumentChunk[]> {
    const { client } = await getAuthenticatedSupabaseClient();

    let query = client
      .from("document_chunks")
      .select("*")
      .eq("user_id", userId)
      .gte("quality_score", minQuality);

    if (documentIds && documentIds.length > 0) {
      query = query.in("document_id", documentIds);
    }

    const { data: chunks, error } = await query.order("quality_score", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to filter chunks by quality: ${error.message}`);
    }

    return chunks?.map(this.mapChunkFromDatabase) || [];
  }

  // Private helper methods

  private async createVersion(
    chunkId: string,
    versionData: {
      content: string;
      embedding?: number[];
      tokenCount: number;
      metadata: ChunkMetadata;
      qualityMetrics: ChunkQualityMetrics;
      changeReason: string;
    }
  ): Promise<void> {
    const { client } = await getAuthenticatedSupabaseClient();

    // Get current version number
    const { data: latestVersion } = await client
      .from("chunk_versions")
      .select("version")
      .eq("chunk_id", chunkId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    const { error } = await client.from("chunk_versions").insert({
      chunk_id: chunkId,
      version: nextVersion,
      content: versionData.content,
      embedding: versionData.embedding,
      token_count: versionData.tokenCount,
      metadata: versionData.metadata,
      quality_metrics: versionData.qualityMetrics,
      change_reason: versionData.changeReason,
    });

    if (error) {
      console.error("Failed to create chunk version:", error);
    }
  }

  private async initializeAnalytics(
    userId: string,
    chunkId: string,
    documentId: string
  ): Promise<void> {
    const { client } = await getAuthenticatedSupabaseClient();

    const { error } = await client.from("chunk_analytics").insert({
      chunk_id: chunkId,
      user_id: userId,
      document_id: documentId,
      usage_count: 0,
      total_relevance_score: 0,
      success_count: 0,
      user_feedback: 0,
    });

    if (error) {
      console.error("Failed to initialize chunk analytics:", error);
    }
  }

  private async storeQualityScore(
    userId: string,
    chunkId: string,
    qualityMetrics: ChunkQualityMetrics
  ): Promise<void> {
    const { client } = await getAuthenticatedSupabaseClient();

    const { error } = await client.from("chunk_quality_scores").upsert(
      {
        chunk_id: chunkId,
        user_id: userId,
        content_length: qualityMetrics.contentLength,
        token_density: qualityMetrics.tokenDensity,
        structural_coherence: qualityMetrics.structuralCoherence,
        semantic_coherence: qualityMetrics.semanticCoherence,
        information_density: qualityMetrics.informationDensity,
        readability: qualityMetrics.readability,
        duplicate_score: qualityMetrics.duplicateScore,
        overall_quality: qualityMetrics.overallQuality,
        calculated_at: new Date().toISOString(),
      },
      {
        onConflict: "chunk_id,user_id",
      }
    );

    if (error) {
      console.error("Failed to store quality score:", error);
    }
  }

  private async getQualityMetrics(
    chunkId: string
  ): Promise<ChunkQualityMetrics> {
    const { client } = await getAuthenticatedSupabaseClient();

    const { data: qualityScore } = await client
      .from("chunk_quality_scores")
      .select("*")
      .eq("chunk_id", chunkId)
      .single();

    if (qualityScore) {
      return {
        contentLength: qualityScore.content_length,
        tokenDensity: qualityScore.token_density,
        structuralCoherence: qualityScore.structural_coherence,
        semanticCoherence: qualityScore.semantic_coherence,
        informationDensity: qualityScore.information_density,
        readability: qualityScore.readability,
        duplicateScore: qualityScore.duplicate_score,
        overallQuality: qualityScore.overall_quality,
      };
    }

    return {} as ChunkQualityMetrics;
  }

  private calculateStructuralCoherence(
    content: string,
    metadata: ChunkMetadata
  ): number {
    // Score based on content type and structure
    let score = 0.5; // Base score

    // Bonus for structured content types
    switch (metadata.contentType) {
      case "heading":
        score += 0.3;
        break;
      case "table":
        score += 0.2;
        break;
      case "list":
        score += 0.15;
        break;
      case "caption":
        score += 0.1;
        break;
    }

    // Check for structural elements
    const hasNumbers = /\d+/.test(content);
    const hasBullets = /[•\-\*]/.test(content);
    const hasFormatting = /[A-Z]{2,}|[a-z]+:/.test(content);

    if (hasNumbers) score += 0.1;
    if (hasBullets) score += 0.1;
    if (hasFormatting) score += 0.1;

    return Math.min(1, score);
  }

  private calculateSemanticCoherence(content: string): number {
    // Simple semantic coherence based on sentence structure and vocabulary
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    let coherenceScore = 0.5; // Base score

    // Check average sentence length (optimal range: 15-25 words)
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) /
      sentences.length;
    if (avgSentenceLength >= 10 && avgSentenceLength <= 30) {
      coherenceScore += 0.2;
    }

    // Check for transition words and connectors
    const transitionWords =
      /\b(however|therefore|furthermore|moreover|additionally|consequently|meanwhile|nevertheless)\b/gi;
    const transitionCount = (content.match(transitionWords) || []).length;
    coherenceScore += Math.min(0.2, transitionCount * 0.05);

    // Check for repeated key terms (indicates topic consistency)
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const wordFreq = new Map<string, number>();
    words.forEach((word) => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));

    const repeatedWords = Array.from(wordFreq.values()).filter(
      (count) => count > 1
    ).length;
    coherenceScore += Math.min(0.1, repeatedWords * 0.02);

    return Math.min(1, coherenceScore);
  }

  private calculateInformationDensity(content: string): number {
    // Measure information density based on unique concepts and technical terms
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const uniqueWords = new Set(words);

    // Basic density ratio
    const uniqueRatio = uniqueWords.size / Math.max(words.length, 1);

    // Bonus for technical terms and proper nouns
    const technicalTerms =
      content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    const numbers = content.match(/\d+(?:\.\d+)?/g) || [];
    const acronyms = content.match(/\b[A-Z]{2,}\b/g) || [];

    let density = uniqueRatio * 0.6;
    density += Math.min(0.2, technicalTerms.length * 0.02);
    density += Math.min(0.1, numbers.length * 0.01);
    density += Math.min(0.1, acronyms.length * 0.02);

    return Math.min(1, density);
  }

  private calculateReadability(content: string): number {
    // Simple readability score based on sentence and word complexity
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const words = content.split(/\s+/).filter((w) => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Optimal ranges for readability
    let readabilityScore = 0.5;

    // Sentence length (optimal: 15-20 words)
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
      readabilityScore += 0.25;
    } else if (avgWordsPerSentence > 25) {
      readabilityScore -= 0.1;
    }

    // Word length (optimal: 4-6 characters)
    if (avgCharsPerWord >= 4 && avgCharsPerWord <= 7) {
      readabilityScore += 0.25;
    } else if (avgCharsPerWord > 8) {
      readabilityScore -= 0.1;
    }

    return Math.max(0, Math.min(1, readabilityScore));
  }

  private calculateContentSimilarity(
    content1: string,
    content2: string
  ): number {
    // Simple Jaccard similarity for content comparison
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));

    const intersection = new Set(
      [...words1].filter((word) => words2.has(word))
    );
    const union = new Set([...words1, ...words2]);

    return intersection.size / Math.max(union.size, 1);
  }

  private estimateTokenCount(text: string): number {
    // Rough token estimation
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const punctuation = (text.match(/[.,!?;:()[\]{}'"]/g) || []).length;
    return Math.ceil(words.length * 1.3 + punctuation * 0.5);
  }

  private mapChunkFromDatabase(chunk: any): DocumentChunk {
    return {
      id: chunk.id,
      userId: chunk.user_id,
      documentId: chunk.document_id,
      chunkIndex: chunk.chunk_index,
      content: chunk.content,
      embedding: chunk.embedding,
      tokenCount: chunk.token_count,
      pageNumber: chunk.page_number,
      sectionTitle: chunk.section_title,
      metadata: chunk.metadata,
      createdAt: chunk.created_at,
      updatedAt: chunk.updated_at,
    };
  }

  private mapVersionFromDatabase(version: any): ChunkVersion {
    return {
      id: version.id,
      chunkId: version.chunk_id,
      version: version.version,
      content: version.content,
      embedding: version.embedding,
      tokenCount: version.token_count,
      metadata: version.metadata,
      qualityMetrics: version.quality_metrics,
      parentVersion: version.parent_version,
      changeReason: version.change_reason,
      createdAt: version.created_at,
    };
  }

  private mapAnalyticsFromDatabase(analytics: any): ChunkAnalytics {
    return {
      id: analytics.id,
      chunkId: analytics.chunk_id,
      userId: analytics.user_id,
      documentId: analytics.document_id,
      usageCount: analytics.usage_count,
      totalRelevanceScore: analytics.total_relevance_score,
      lastUsed: analytics.last_used,
      usageType: analytics.usage_type,
      successCount: analytics.success_count,
      userFeedback: analytics.user_feedback,
      createdAt: analytics.created_at,
      updatedAt: analytics.updated_at,
    };
  }

  private mapQualityScoreFromDatabase(qualityScore: any): ChunkQualityScore {
    return {
      id: qualityScore.id,
      chunkId: qualityScore.chunk_id,
      userId: qualityScore.user_id,
      contentLength: qualityScore.content_length,
      tokenDensity: qualityScore.token_density,
      structuralCoherence: qualityScore.structural_coherence,
      semanticCoherence: qualityScore.semantic_coherence,
      informationDensity: qualityScore.information_density,
      readability: qualityScore.readability,
      duplicateScore: qualityScore.duplicate_score,
      overallQuality: qualityScore.overall_quality,
      calculatedAt: qualityScore.calculated_at,
    };
  }
}

// Export singleton instance
export const chunkManagementService = new ChunkManagementService();
