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
import { searchAnalyticsService } from "@/lib/services/search-analytics-service";

interface SearchAnalyticsRequest {
  timeRange?: {
    start: string; // ISO date string
    end: string;   // ISO date string
  };
  includeRecommendations?: boolean;
  includeMonitoring?: boolean;
  includePopularQueries?: boolean;
  popularQueriesLimit?: number;
}

interface SearchAnalyticsResponse {
  success: boolean;
  metrics: {
    totalSearches: number;
    averageSearchTime: number;
    averageResultCount: number;
    cacheHitRate: number;
    searchMethodDistribution: Record<string, number>;
    queryComplexityDistribution: Record<string, number>;
    popularFilters: Array<{
      filterType: string;
      usage: number;
      averageImpact: number;
    }>;
    performanceTrends: Array<{
      date: string;
      averageSearchTime: number;
      searchCount: number;
      cacheHitRate: number;
    }>;
    slowQueries: Array<{
      query: string;
      searchTime: number;
      resultCount: number;
      timestamp: string;
    }>;
  };
  recommendations?: {
    queryOptimizations: Array<{
      type: string;
      description: string;
      expectedImprovement: number;
      confidence: number;
    }>;
    indexOptimizations: Array<{
      type: string;
      description: string;
      expectedSpeedup: number;
      estimatedCost: string;
    }>;
    cacheOptimizations: Array<{
      type: string;
      description: string;
      expectedHitRateImprovement: number;
    }>;
    filterOptimizations: Array<{
      filterType: string;
      description: string;
      usageFrequency: number;
      performanceImpact: number;
    }>;
  };
  monitoring?: {
    activeSearches: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    indexHealth: {
      vectorIndex: string;
      textIndex: string;
      lastOptimized: string;
    };
    resourceUsage: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
    };
    alerts: Array<{
      type: string;
      severity: string;
      message: string;
      timestamp: string;
    }>;
  };
  popularQueries?: Array<{
    query: string;
    count: number;
    averageSearchTime: number;
    averageResultCount: number;
    lastUsed: string;
  }>;
}

/**
 * Validates search analytics request parameters
 */
function validateAnalyticsRequest(request: SearchAnalyticsRequest): void {
  if (request.timeRange) {
    const { start, end } = request.timeRange;
    
    if (!start || !end) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'timeRange must include both start and end dates'
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'timeRange dates must be valid ISO date strings'
      );
    }

    if (startDate >= endDate) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'timeRange start date must be before end date'
      );
    }

    // Limit time range to prevent excessive data retrieval
    const maxRangeDays = 365; // 1 year
    const rangeDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (rangeDays > maxRangeDays) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        `timeRange cannot exceed ${maxRangeDays} days`
      );
    }
  }

  if (request.popularQueriesLimit && (request.popularQueriesLimit < 1 || request.popularQueriesLimit > 100)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'popularQueriesLimit must be between 1 and 100'
    );
  }
}

// GET handler for search analytics
async function handleGET(request: NextRequest): Promise<NextResponse<SearchAnalyticsResponse>> {
  const context = extractRequestContext(request, '/api/quiz/search-analytics');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  // Rate limiting for analytics requests
  checkEnhancedRateLimit(userId, 'SEARCH_ANALYTICS', { 
    ...context, 
    userId,
    limit: 20, // 20 analytics requests per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse query parameters
  const url = new URL(request.url);
  const requestData: SearchAnalyticsRequest = {
    timeRange: url.searchParams.get('startDate') && url.searchParams.get('endDate') ? {
      start: url.searchParams.get('startDate')!,
      end: url.searchParams.get('endDate')!
    } : undefined,
    includeRecommendations: url.searchParams.get('includeRecommendations') === 'true',
    includeMonitoring: url.searchParams.get('includeMonitoring') === 'true',
    includePopularQueries: url.searchParams.get('includePopularQueries') === 'true',
    popularQueriesLimit: url.searchParams.get('popularQueriesLimit') ? 
      parseInt(url.searchParams.get('popularQueriesLimit')!) : 10
  };

  // Validate request parameters
  validateAnalyticsRequest(requestData);

  try {
    const timeRange = requestData.timeRange ? {
      start: new Date(requestData.timeRange.start),
      end: new Date(requestData.timeRange.end)
    } : undefined;

    // Get performance metrics
    const metrics = await searchAnalyticsService.getPerformanceMetrics(userId, timeRange);

    // Prepare response
    const response: SearchAnalyticsResponse = {
      success: true,
      metrics: {
        ...metrics,
        slowQueries: metrics.slowQueries.map(query => ({
          ...query,
          timestamp: query.timestamp.toISOString()
        }))
      }
    };

    // Add recommendations if requested
    if (requestData.includeRecommendations) {
      response.recommendations = await searchAnalyticsService.getOptimizationRecommendations(userId);
    }

    // Add monitoring data if requested
    if (requestData.includeMonitoring) {
      const monitoring = await searchAnalyticsService.getMonitoringData();
      response.monitoring = {
        ...monitoring,
        indexHealth: {
          ...monitoring.indexHealth,
          lastOptimized: monitoring.indexHealth.lastOptimized.toISOString()
        },
        alerts: monitoring.alerts.map(alert => ({
          ...alert,
          timestamp: alert.timestamp.toISOString()
        }))
      };
    }

    // Add popular queries if requested
    if (requestData.includePopularQueries) {
      const popularQueries = await searchAnalyticsService.getPopularQueries(
        userId,
        requestData.popularQueriesLimit,
        timeRange
      );
      response.popularQueries = popularQueries.map(query => ({
        ...query,
        lastUsed: query.lastUsed.toISOString()
      }));
    }

    console.log(`📊 Search analytics retrieved for user ${userId}:`);
    console.log(`   - Total searches: ${metrics.totalSearches}`);
    console.log(`   - Average search time: ${metrics.averageSearchTime.toFixed(2)}ms`);
    console.log(`   - Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    if (requestData.timeRange) {
      console.log(`   - Time range: ${requestData.timeRange.start} to ${requestData.timeRange.end}`);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Search analytics retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId },
      error instanceof Error ? error : undefined
    );
  }
}

// POST handler for logging search queries
async function handlePOST(request: NextRequest): Promise<NextResponse<{ success: boolean; message: string }>> {
  const context = extractRequestContext(request, '/api/quiz/search-analytics');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Rate limiting for search logging (more permissive)
  checkEnhancedRateLimit(userId, 'SEARCH_LOGGING', { 
    ...context, 
    userId,
    limit: 1000, // 1000 log entries per hour
    windowMs: 60 * 60 * 1000 
  });

  // Parse and validate request body
  let logEntry: any;
  try {
    logEntry = await request.json();
  } catch (error) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Invalid JSON in request body',
      { ...context, userId }
    );
  }

  // Validate required fields
  if (!logEntry.query || typeof logEntry.query !== 'string') {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'query is required and must be a string'
    );
  }

  if (!logEntry.searchMethod || !['vector', 'keyword', 'hybrid'].includes(logEntry.searchMethod)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'searchMethod is required and must be one of: vector, keyword, hybrid'
    );
  }

  if (!Array.isArray(logEntry.documentIds)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'documentIds is required and must be an array'
    );
  }

  if (typeof logEntry.resultCount !== 'number' || logEntry.resultCount < 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'resultCount is required and must be a non-negative number'
    );
  }

  if (typeof logEntry.searchTime !== 'number' || logEntry.searchTime < 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'searchTime is required and must be a non-negative number'
    );
  }

  try {
    // Log the search query
    await searchAnalyticsService.logSearchQuery({
      userId,
      query: logEntry.query,
      searchMethod: logEntry.searchMethod,
      documentIds: logEntry.documentIds,
      resultCount: logEntry.resultCount,
      searchTime: logEntry.searchTime,
      queryComplexity: logEntry.queryComplexity || 'simple',
      cacheHit: logEntry.cacheHit || false,
      filters: logEntry.filters || {},
      performance: logEntry.performance || {}
    });

    console.log(`📝 Search query logged for user ${userId}:`);
    console.log(`   - Query: "${logEntry.query}"`);
    console.log(`   - Method: ${logEntry.searchMethod}`);
    console.log(`   - Results: ${logEntry.resultCount}`);
    console.log(`   - Time: ${logEntry.searchTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Search query logged successfully'
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Search query logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handlers
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/quiz/search-analytics', method: 'GET' }
);

export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/search-analytics', method: 'POST' }
);