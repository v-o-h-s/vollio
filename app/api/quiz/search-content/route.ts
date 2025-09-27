import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/server-error-handling";
import {
  checkEnhancedRateLimit,
} from "@/lib/utils/security-validation";
import {
  requireAuthentication,
} from "@/lib/utils/auth-validation";
import { vectorSearchService } from "@/lib/services/vector-search-service";
import { hybridSearchService } from "@/lib/services/hybrid-search-service";
// Removed search analytics service to keep it simple

interface ContentSearchRequest {
  query: string;
  documentIds: string[];
  pageRange?: { start: number; end: number };
  limit?: number;
  similarityThreshold?: number;
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  minConfidence?: number;
  rankingMethod?: 'similarity' | 'hybrid' | 'rerank';
  diversityFactor?: number;
  
  // Advanced search options
  searchMethod?: 'vector' | 'keyword' | 'hybrid';
  vectorWeight?: number;
  keywordWeight?: number;
  enableFuzzyMatch?: boolean;
  stemming?: boolean;
  synonymExpansion?: boolean;
  confidenceRange?: { min: number; max: number };
  relevanceRange?: { min: number; max: number };
  includeExplanations?: boolean;
  enableDebugging?: boolean;
  enableCaching?: boolean;
}

interface ContentSearchResponse {
  success: boolean;
  chunks: Array<{
    id: string;
    content: string;
    metadata: {
      documentTitle: string;
      pageNumber: number;
      sectionTitle?: string;
      contentType: string;
      confidence?: number;
    };
    similarity: number;
    relevanceScore: number;
    rank: number;
    scoring?: {
      vectorScore: number;
      keywordScore: number;
      combinedScore: number;
    };
    explanation?: {
      vectorMatches: string[];
      keywordMatches: string[];
      scoringBreakdown: {
        vectorContribution: number;
        keywordContribution: number;
        boosts: Array<{ type: string; value: number; reason: string }>;
        penalties: Array<{ type: string; value: number; reason: string }>;
      };
      relevanceFactors: string[];
    };
    debugInfo?: {
      originalQuery: string;
      processedQuery: string;
      vectorEmbeddingTime: number;
      keywordProcessingTime: number;
      filteringTime: number;
      rankingTime: number;
      cacheHit: boolean;
      indexesUsed: string[];
    };
  }>;
  totalResults: number;
  searchTime: number;
  queryEmbeddingTime: number;
  retrievalTime: number;
  rankingTime: number;
  cacheHit: boolean;
  searchMethod: string;
  // Removed analytics to keep it simple
  documentBreakdown?: Record<string, {
    documentId: string;
    documentTitle: string;
    resultCount: number;
    averageSimilarity: number;
  }>;
}

/**
 * Validates search request parameters
 */
function validateSearchRequest(request: ContentSearchRequest): void {
  if (!request.query || typeof request.query !== 'string' || request.query.trim().length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Query is required and must be a non-empty string'
    );
  }

  if (!Array.isArray(request.documentIds) || request.documentIds.length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'documentIds is required and must be a non-empty array'
    );
  }

  if (request.documentIds.length > 10) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Maximum 10 documents can be searched at once'
    );
  }

  // Validate document IDs format (should be UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const docId of request.documentIds) {
    if (!uuidRegex.test(docId)) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        `Invalid document ID format: ${docId}`
      );
    }
  }

  if (request.limit && (request.limit < 1 || request.limit > 100)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'limit must be between 1 and 100'
    );
  }

  if (request.similarityThreshold && (request.similarityThreshold < 0 || request.similarityThreshold > 1)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'similarityThreshold must be between 0 and 1'
    );
  }

  if (request.pageRange) {
    if (!request.pageRange.start || !request.pageRange.end || 
        request.pageRange.start < 1 || request.pageRange.end < request.pageRange.start) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'pageRange must have valid start and end values (start >= 1, end >= start)'
      );
    }
  }

  if (request.diversityFactor && (request.diversityFactor < 0 || request.diversityFactor > 1)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'diversityFactor must be between 0 and 1'
    );
  }
}

// POST handler for content search
async function handlePOST(request: NextRequest): Promise<NextResponse<ContentSearchResponse>> {
  const context = extractRequestContext(request, '/api/quiz/search-content');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  // Rate limiting for search operations
  checkEnhancedRateLimit(userId, 'CONTENT_SEARCH', { 
    ...context, 
    userId,
    limit: 100, // 100 searches per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse and validate request body
  let requestData: ContentSearchRequest;
  try {
    requestData = await request.json();
  } catch (error) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Invalid JSON in request body',
      { ...context, userId }
    );
  }

  // Validate request parameters
  validateSearchRequest(requestData);

  const {
    query,
    documentIds,
    pageRange,
    limit = 20,
    similarityThreshold = 0.7,
    contentTypes,
    minConfidence,
    rankingMethod = 'hybrid',
    diversityFactor = 0.3,
    
    // Advanced search options
    searchMethod = 'hybrid',
    vectorWeight = 0.7,
    keywordWeight = 0.3,
    enableFuzzyMatch = true,
    stemming = true,
    synonymExpansion = false,
    confidenceRange,
    relevanceRange,
    includeExplanations = false,
    enableDebugging = false,
    enableCaching = true
  } = requestData;

  try {
    let searchResult;
    let actualSearchMethod = searchMethod;

    // Use advanced hybrid search if requested or if advanced options are specified
    const useAdvancedSearch = searchMethod !== 'vector' || 
                             includeExplanations || 
                             enableDebugging || 
                             confidenceRange || 
                             relevanceRange ||
                             enableFuzzyMatch ||
                             stemming ||
                             synonymExpansion;

    if (useAdvancedSearch) {
      // Use hybrid search service
      const hybridResult = await hybridSearchService.hybridSearch(query, {
        vectorWeight: searchMethod === 'vector' ? 1.0 : vectorWeight,
        keywordWeight: searchMethod === 'keyword' ? 1.0 : keywordWeight,
        similarityThreshold,
        enableFuzzyMatch,
        stemming,
        synonymExpansion,
        contentTypes,
        confidenceRange,
        relevanceRange,
        pageRange,
        documentIds,
        limit,
        includeExplanations,
        enableDebugging,
        enableCaching
      });

      if (!hybridResult.success) {
        throw createServerError(
          ServerErrorType.PROCESSING_ERROR,
          hybridResult.error || 'Advanced search operation failed',
          { ...context, userId, query, documentIds, searchMethod }
        );
      }

      // Get document titles for metadata
      const { getAuthenticatedSupabaseClient } = await import('@/lib/supabaseClient');
      const client = await getAuthenticatedSupabaseClient();
      const { data: documents } = await client
        .from('pdfs')
        .select('id, filename')
        .in('id', documentIds);

      const documentMap = new Map(
        documents?.map(doc => [doc.id, doc.filename]) || []
      );

      // Transform hybrid results
      const chunks = hybridResult.results.map(result => ({
        id: result.chunk.id,
        content: result.chunk.content,
        metadata: {
          documentTitle: documentMap.get(result.chunk.documentId) || 'Unknown Document',
          pageNumber: result.chunk.pageNumber,
          sectionTitle: result.chunk.sectionTitle,
          contentType: result.chunk.metadata.contentType || 'paragraph',
          confidence: result.chunk.metadata.confidence
        },
        similarity: result.vectorScore, // For backward compatibility
        relevanceScore: result.combinedScore,
        rank: result.rank,
        scoring: {
          vectorScore: result.vectorScore,
          keywordScore: result.keywordScore,
          combinedScore: result.combinedScore
        },
        explanation: result.explanation,
        debugInfo: result.debugInfo
      }));

      searchResult = {
        success: true,
        results: chunks,
        totalResults: hybridResult.totalResults,
        searchTime: hybridResult.searchTime,
        // Removed analytics to keep it simple
        documentBreakdown: {} // Would need to calculate from hybrid results
      };
    } else {
      // Use traditional vector search
      const vectorResult = await vectorSearchService.searchMultipleDocuments(
        query,
        documentIds,
        {
          limit,
          similarityThreshold,
          pageRange,
          contentTypes,
          minConfidence,
          rankingMethod,
          diversityFactor,
          includeMetadata: true,
          boostRecent: true
        }
      );

      if (!vectorResult.success) {
        throw createServerError(
          ServerErrorType.PROCESSING_ERROR,
          vectorResult.error || 'Vector search operation failed',
          { ...context, userId, query, documentIds }
        );
      }

      // Transform vector results
      const chunks = vectorResult.results.map(result => ({
        id: result.chunk.id,
        content: result.chunk.content,
        metadata: {
          documentTitle: vectorResult.documentBreakdown[result.chunk.documentId]?.documentTitle || 'Unknown Document',
          pageNumber: result.chunk.pageNumber,
          sectionTitle: result.chunk.sectionTitle,
          contentType: result.chunk.metadata.contentType || 'paragraph',
          confidence: result.chunk.metadata.confidence
        },
        similarity: result.similarity,
        relevanceScore: result.relevanceScore,
        rank: result.rank,
        scoring: {
          vectorScore: result.similarity,
          keywordScore: 0,
          combinedScore: result.similarity
        }
      }));

      searchResult = {
        success: true,
        results: chunks,
        totalResults: vectorResult.totalResults,
        searchTime: vectorResult.searchTime,
        documentBreakdown: vectorResult.documentBreakdown
      };
      actualSearchMethod = 'vector';
    }

    // Removed analytics logging to keep it simple

    const response: ContentSearchResponse = {
      success: true,
      chunks: searchResult.results,
      totalResults: searchResult.totalResults,
      searchTime: searchResult.searchTime,
      queryEmbeddingTime: 0, // Not available from current implementations
      retrievalTime: 0, // Not available from current implementations
      rankingTime: 0, // Not available from current implementations
      cacheHit: false, // Simplified - no cache analytics
      searchMethod: actualSearchMethod,
      // Removed analytics to keep it simple
      documentBreakdown: searchResult.documentBreakdown
    };

    console.log(`🔍 Content search completed for user ${userId}:`);
    console.log(`   - Query: "${query}"`);
    console.log(`   - Method: ${actualSearchMethod}`);
    console.log(`   - Documents: ${documentIds.length}`);
    console.log(`   - Results: ${searchResult.results.length}`);
    console.log(`   - Search time: ${searchResult.searchTime}ms`);
    // Removed analytics logging to keep it simple

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Content search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, query, documentIds },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/search-content', method: 'POST' }
);