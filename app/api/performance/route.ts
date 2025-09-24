import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/utils/supabase-helpers';
import { databaseOptimizationService } from '@/lib/services/database-optimization';
import { textExtractionCache } from '@/lib/services/text-extraction-cache';
import { lazyLoadingService } from '@/lib/services/lazy-loading-service';
import { embeddingService } from '@/lib/services/embedding-service';

/**
 * GET /api/performance - Get performance metrics and optimization suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const metric = url.searchParams.get('metric');

    // Get specific metric if requested
    if (metric) {
      switch (metric) {
        case 'database':
          return NextResponse.json(await getDatabaseMetrics());
        case 'cache':
          return NextResponse.json(await getCacheMetrics());
        case 'embedding':
          return NextResponse.json(await getEmbeddingMetrics());
        case 'lazy-loading':
          return NextResponse.json(await getLazyLoadingMetrics());
        default:
          return NextResponse.json(
            { error: 'Invalid metric type' },
            { status: 400 }
          );
      }
    }

    // Get all performance metrics
    const [
      databaseMetrics,
      cacheMetrics,
      embeddingMetrics,
      lazyLoadingMetrics
    ] = await Promise.all([
      getDatabaseMetrics(),
      getCacheMetrics(),
      getEmbeddingMetrics(),
      getLazyLoadingMetrics()
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        database: databaseMetrics,
        cache: cacheMetrics,
        embedding: embeddingMetrics,
        lazyLoading: lazyLoadingMetrics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/performance - Clear caches and reset metrics
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, target } = body;

    if (action === 'clear-cache') {
      switch (target) {
        case 'text-extraction':
          await textExtractionCache.clearCache();
          break;
        case 'lazy-loading':
          lazyLoadingService.clearCache();
          break;
        case 'embedding':
          embeddingService.clearCache();
          break;
        case 'database':
          databaseOptimizationService.clearAll();
          break;
        case 'all':
          await Promise.all([
            textExtractionCache.clearCache(),
            lazyLoadingService.clearCache(),
            embeddingService.clearCache(),
            databaseOptimizationService.clearAll()
          ]);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid cache target' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: `${target} cache cleared successfully`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Performance action error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform performance action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get database performance metrics
 */
async function getDatabaseMetrics() {
  try {
    const analysis = databaseOptimizationService.analyzeQueryPerformance();
    
    return {
      queryPerformance: analysis.performanceMetrics,
      slowQueries: analysis.slowQueries.slice(0, 10), // Top 10 slow queries
      indexSuggestions: analysis.indexSuggestions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database metrics error:', error);
    return {
      error: 'Failed to get database metrics',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get cache performance metrics
 */
async function getCacheMetrics() {
  try {
    const textCacheStats = textExtractionCache.getCacheStats();
    const lazyLoadingStats = lazyLoadingService.getCacheStats();

    return {
      textExtraction: {
        totalEntries: textCacheStats.totalEntries,
        totalSize: textCacheStats.totalSize,
        hitRate: textCacheStats.hitRate,
        averageAge: textCacheStats.averageAge,
        oldestEntry: textCacheStats.oldestEntry,
        newestEntry: textCacheStats.newestEntry
      },
      lazyLoading: {
        totalEntries: lazyLoadingStats.totalEntries,
        loadingStates: lazyLoadingStats.loadingStates,
        hitRate: lazyLoadingStats.hitRate,
        averageAge: lazyLoadingStats.averageAge
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Cache metrics error:', error);
    return {
      error: 'Failed to get cache metrics',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get embedding service metrics
 */
async function getEmbeddingMetrics() {
  try {
    const embeddingStats = embeddingService.getCacheStats();

    return {
      cacheSize: embeddingStats.size,
      hitRate: embeddingStats.hitRate,
      totalAccesses: embeddingStats.totalAccesses,
      averageAge: embeddingStats.averageAge,
      activeModels: embeddingService.getActiveModels(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Embedding metrics error:', error);
    return {
      error: 'Failed to get embedding metrics',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get lazy loading metrics
 */
async function getLazyLoadingMetrics() {
  try {
    const stats = lazyLoadingService.getCacheStats();

    return {
      totalEntries: stats.totalEntries,
      loadingStates: stats.loadingStates,
      hitRate: stats.hitRate,
      averageAge: stats.averageAge,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Lazy loading metrics error:', error);
    return {
      error: 'Failed to get lazy loading metrics',
      timestamp: new Date().toISOString()
    };
  }
}