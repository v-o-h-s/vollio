import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { vectorSearchService } from '@/lib/services/vector-search-service';
import { withErrorHandling } from '@/lib/utils/server-error-handling';
import type { ContentSearchRequest, ContentSearchResponse } from '@/lib/types';

/**
 * POST /api/quiz/search-content
 * Search for relevant content chunks using vector similarity
 */
async function POST(request: NextRequest): Promise<NextResponse<ContentSearchResponse>> {
  return withErrorHandling(async () => {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let requestData: ContentSearchRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.query || typeof requestData.query !== 'string') {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (!requestData.documentIds || !Array.isArray(requestData.documentIds) || requestData.documentIds.length === 0) {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Document IDs are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (requestData.limit !== undefined && (typeof requestData.limit !== 'number' || requestData.limit < 1 || requestData.limit > 100)) {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Limit must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    if (requestData.similarityThreshold !== undefined && (typeof requestData.similarityThreshold !== 'number' || requestData.similarityThreshold < 0 || requestData.similarityThreshold > 1)) {
      return NextResponse.json(
        { success: false, chunks: [], totalResults: 0, error: 'Similarity threshold must be a number between 0 and 1' },
        { status: 400 }
      );
    }

    if (requestData.pageRange !== undefined) {
      if (typeof requestData.pageRange !== 'object' || 
          typeof requestData.pageRange.start !== 'number' || 
          typeof requestData.pageRange.end !== 'number' ||
          requestData.pageRange.start < 1 ||
          requestData.pageRange.end < requestData.pageRange.start) {
        return NextResponse.json(
          { success: false, chunks: [], totalResults: 0, error: 'Page range must have valid start and end numbers' },
          { status: 400 }
        );
      }
    }

    try {
      // Optimize the query for better search results
      const queryOptimization = await vectorSearchService.optimizeQuery(requestData.query);
      const searchQuery = queryOptimization.optimizedQuery || requestData.query;

      // Perform vector search
      const searchResult = await vectorSearchService.searchSimilarChunks(searchQuery, {
        similarityThreshold: requestData.similarityThreshold || 0.7,
        limit: requestData.limit || 10,
        pageRange: requestData.pageRange,
        documentIds: requestData.documentIds,
        includeMetadata: true,
        rankingMethod: 'hybrid'
      });

      if (!searchResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            chunks: [], 
            totalResults: 0, 
            error: searchResult.error || 'Search failed' 
          },
          { status: 500 }
        );
      }

      // Format results for API response
      const formattedChunks = searchResult.results.map(result => ({
        id: result.chunk.id,
        content: result.chunk.content,
        metadata: {
          documentTitle: result.chunk.metadata.documentTitle,
          extractionMethod: result.chunk.metadata.extractionMethod,
          processingVersion: result.chunk.metadata.processingVersion,
          contentType: result.chunk.metadata.contentType,
          confidence: result.chunk.metadata.confidence,
          pageNumber: result.chunk.pageNumber,
          sectionTitle: result.chunk.sectionTitle,
          tokenCount: result.chunk.tokenCount,
          similarity: result.similarity,
          relevanceScore: result.relevanceScore,
          rank: result.rank
        },
        similarity: result.similarity
      }));

      const response: ContentSearchResponse = {
        success: true,
        chunks: formattedChunks,
        totalResults: searchResult.totalResults
      };

      // Add performance metrics to response headers for debugging
      const headers = new Headers();
      headers.set('X-Search-Time', searchResult.searchTime.toString());
      headers.set('X-Query-Embedding-Time', searchResult.queryEmbeddingTime.toString());
      headers.set('X-Retrieval-Time', searchResult.retrievalTime.toString());
      headers.set('X-Ranking-Time', searchResult.rankingTime.toString());
      headers.set('X-Cache-Hit', searchResult.cacheHit.toString());
      
      if (queryOptimization.optimizations.length > 0) {
        headers.set('X-Query-Optimizations', queryOptimization.optimizations.join(', '));
        headers.set('X-Original-Query', requestData.query);
        headers.set('X-Optimized-Query', searchQuery);
      }

      return NextResponse.json(response, { 
        status: 200,
        headers 
      });

    } catch (error) {
      console.error('Vector search error:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          chunks: [], 
          totalResults: 0, 
          error: 'Internal server error during search' 
        },
        { status: 500 }
      );
    }
  });
}

export { POST };