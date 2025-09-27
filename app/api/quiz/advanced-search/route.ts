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
import { hybridSearchService } from "@/lib/services/hybrid-search-service";
import type { HybridSearchOptions } from "@/lib/services/hybrid-search-service";

interface AdvancedSearchRequest {
  query: string;
  documentIds: string[];
  
  // Search method configuration
  searchMethod?: 'vector' | 'keyword' | 'hybrid';
  vectorWeight?: number;
  keywordWeight?: number;
  
  // Search options
  similarityThreshold?: number;
  enableFuzzyMatch?: boolean;
  stemming?: boolean;
  synonymExpansion?: boolean;
  
  // Filtering options
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  confidenceRange?: { min: number; max: number };
  relevanceRange?: { min: number; max: number };
  pageRange?: { start: number; end: number };
  
  // Result options
  limit?: number;
  includeExplanations?: boolean;
  enableDebugging?: boolean;
  
  // Performance options
  enableCaching?: boolean;
  cacheTimeout?: number;
}

interface AdvancedSearchResponse {
  success: boolean;
  results: Array<{
    id: string;
    content: string;
    metadata: {
      documentTitle: string;
      pageNumber: number;
      sectionTitle?: string;
      contentType: string;
      confidence?: number;
    };
    scoring: {
      vectorScore: number;
      keywordScore: number;
      combinedScore: number;
      rank: number;
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
  // Removed analytics to keep it simple
  searchMethod: string;
  optimizations?: string[];
}

/**
 * Validates advanced search request parameters
 */
function validateAdvancedSearchRequest(request: AdvancedSearchRequest): void {
  if (!request.query || typeof request.query !== 'string' || request.query.trim().length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Query is required and must be a non-empty string'
    );
  }

  if (request.query.length > 1000) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Query must be less than 1000 characters'
    );
  }

  if (!Array.isArray(request.documentIds) || request.documentIds.length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'documentIds is required and must be a non-empty array'
    );
  }

  if (request.documentIds.length > 20) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Maximum 20 documents can be searched at once'
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

  // Validate search method
  if (request.searchMethod && !['vector', 'keyword', 'hybrid'].includes(request.searchMethod)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'searchMethod must be one of: vector, keyword, hybrid'
    );
  }

  // Validate weights
  if (request.vectorWeight !== undefined && (request.vectorWeight < 0 || request.vectorWeight > 1)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'vectorWeight must be between 0 and 1'
    );
  }

  if (request.keywordWeight !== undefined && (request.keywordWeight < 0 || request.keywordWeight > 1)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'keywordWeight must be between 0 and 1'
    );
  }

  // Validate weights sum to 1 for hybrid search
  if (request.searchMethod === 'hybrid' && request.vectorWeight !== undefined && request.keywordWeight !== undefined) {
    const sum = request.vectorWeight + request.keywordWeight;
    if (Math.abs(sum - 1.0) > 0.01) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'vectorWeight and keywordWeight must sum to 1.0 for hybrid search'
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

  // Validate confidence range
  if (request.confidenceRange) {
    const { min, max } = request.confidenceRange;
    if (min < 0 || min > 1 || max < 0 || max > 1 || min > max) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'confidenceRange must have valid min and max values between 0 and 1 (min <= max)'
      );
    }
  }

  // Validate relevance range
  if (request.relevanceRange) {
    const { min, max } = request.relevanceRange;
    if (min < 0 || min > 1 || max < 0 || max > 1 || min > max) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'relevanceRange must have valid min and max values between 0 and 1 (min <= max)'
      );
    }
  }

  // Validate page range
  if (request.pageRange) {
    const { start, end } = request.pageRange;
    if (!start || !end || start < 1 || end < start) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'pageRange must have valid start and end values (start >= 1, end >= start)'
      );
    }
  }

  // Validate content types
  if (request.contentTypes) {
    const validTypes = ['paragraph', 'heading', 'list', 'table', 'caption'];
    for (const type of request.contentTypes) {
      if (!validTypes.includes(type)) {
        throw createServerError(
          ServerErrorType.VALIDATION_ERROR,
          `Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`
        );
      }
    }
  }

  // Validate cache timeout
  if (request.cacheTimeout && (request.cacheTimeout < 60000 || request.cacheTimeout > 3600000)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'cacheTimeout must be between 60000ms (1 minute) and 3600000ms (1 hour)'
    );
  }
}

// POST handler for advanced search
async function handlePOST(request: NextRequest): Promise<NextResponse<AdvancedSearchResponse>> {
  const context = extractRequestContext(request, '/api/quiz/advanced-search');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  // Rate limiting for advanced search operations (more restrictive)
  checkEnhancedRateLimit(userId, 'ADVANCED_SEARCH', { 
    ...context, 
    userId,
    limit: 50, // 50 advanced searches per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse and validate request body
  let requestData: AdvancedSearchRequest;
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
  validateAdvancedSearchRequest(requestData);

  const {
    query,
    documentIds,
    searchMethod = 'hybrid',
    vectorWeight = 0.7,
    keywordWeight = 0.3,
    similarityThreshold = 0.6,
    enableFuzzyMatch = true,
    stemming = true,
    synonymExpansion = false,
    contentTypes,
    confidenceRange,
    relevanceRange,
    pageRange,
    limit = 20,
    includeExplanations = false,
    enableDebugging = false,
    enableCaching = true,
    cacheTimeout = 600000 // 10 minutes
  } = requestData;

  try {
    let searchResult;
    let actualSearchMethod = searchMethod;

    // Configure search options
    const searchOptions: HybridSearchOptions = {
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
      enableCaching,
      cacheTimeout
    };

    // Perform search based on method
    if (searchMethod === 'vector') {
      // Use pure vector search
      const { vectorSearchService } = await import('@/lib/services/vector-search-service');
      const vectorResult = await vectorSearchService.searchMultipleDocuments(
        query,
        documentIds,
        {
          similarityThreshold,
          limit,
          pageRange,
          contentTypes,
          includeMetadata: true,
          rankingMethod: 'similarity'
        }
      );

      if (!vectorResult.success) {
        throw createServerError(
          ServerErrorType.PROCESSING_ERROR,
          vectorResult.error || 'Vector search failed',
          { ...context, userId, query, documentIds }
        );
      }

      // Convert to hybrid search format
      searchResult = {
        success: true,
        results: vectorResult.results.map(result => ({
          chunk: result.chunk,
          vectorScore: result.similarity,
          keywordScore: 0,
          combinedScore: result.similarity,
          rank: result.rank,
          explanation: undefined,
          debugInfo: undefined
        })),
        totalResults: vectorResult.totalResults,
        searchTime: vectorResult.searchTime,
        // Removed analytics to keep it simple
      };
    } else if (searchMethod === 'keyword') {
      // Use pure keyword search (implemented in hybrid service)
      searchOptions.vectorWeight = 0;
      searchOptions.keywordWeight = 1;
      searchResult = await hybridSearchService.hybridSearch(query, searchOptions);
      actualSearchMethod = 'keyword';
    } else {
      // Use hybrid search
      searchResult = await hybridSearchService.hybridSearch(query, searchOptions);
      actualSearchMethod = 'hybrid';
    }

    if (!searchResult.success) {
      throw createServerError(
        ServerErrorType.PROCESSING_ERROR,
        searchResult.error || 'Advanced search operation failed',
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

    // Transform results for API response
    const results = searchResult.results.map(result => ({
      id: result.chunk.id,
      content: result.chunk.content,
      metadata: {
        documentTitle: documentMap.get(result.chunk.documentId) || 'Unknown Document',
        pageNumber: result.chunk.pageNumber,
        sectionTitle: result.chunk.sectionTitle,
        contentType: result.chunk.metadata.contentType || 'paragraph',
        confidence: result.chunk.metadata.confidence
      },
      scoring: {
        vectorScore: result.vectorScore,
        keywordScore: result.keywordScore,
        combinedScore: result.combinedScore,
        rank: result.rank
      },
      explanation: result.explanation,
      debugInfo: result.debugInfo
    }));

    const response: AdvancedSearchResponse = {
      success: true,
      results,
      totalResults: searchResult.totalResults,
      searchTime: searchResult.searchTime,
      // Removed analytics to keep it simple
      searchMethod: actualSearchMethod,
      optimizations: [] // Could be populated from query optimization
    };

    console.log(`🔍 Advanced search completed for user ${userId}:`);
    console.log(`   - Query: "${query}"`);
    console.log(`   - Method: ${actualSearchMethod}`);
    console.log(`   - Documents: ${documentIds.length}`);
    console.log(`   - Results: ${results.length}`);
    console.log(`   - Search time: ${searchResult.searchTime}ms`);
    // Removed analytics logging to keep it simple

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Advanced search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, query, documentIds, searchMethod },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/advanced-search', method: 'POST' }
);