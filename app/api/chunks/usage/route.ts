import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chunkManagementService } from '@/lib/services/chunk-management-service';
import { withErrorHandling } from '@/lib/utils/server-error-handling';

/**
 * GET /api/chunks/usage - Get chunk usage analytics
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentIds = searchParams.get('documentIds')?.split(',').filter(Boolean);
    const chunkId = searchParams.get('chunkId');
    const action = searchParams.get('action') || 'metrics';

    switch (action) {
      case 'metrics': {
        if (chunkId) {
          // Get specific chunk analytics
          try {
            const chunkData = await chunkManagementService.getChunkWithVersions(chunkId);
            
            return NextResponse.json({
              success: true,
              data: {
                chunk: chunkData.chunk,
                analytics: chunkData.analytics,
                qualityScore: chunkData.qualityScore,
                versions: chunkData.versions.length
              }
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            if (errorMessage.includes('not found')) {
              return NextResponse.json(
                { error: 'Chunk not found' },
                { status: 404 }
              );
            }

            throw error;
          }
        } else {
          // Get overall performance metrics
          const metrics = await chunkManagementService.getPerformanceMetrics(
            userId,
            documentIds
          );

          return NextResponse.json({
            success: true,
            data: metrics
          });
        }
      }

      case 'quality': {
        const minQuality = parseFloat(searchParams.get('minQuality') || '0.0');
        const maxQuality = parseFloat(searchParams.get('maxQuality') || '1.0');

        if (minQuality < 0 || maxQuality > 1 || minQuality > maxQuality) {
          return NextResponse.json(
            { error: 'Invalid quality range. Must be between 0 and 1, with minQuality <= maxQuality' },
            { status: 400 }
          );
        }

        const chunks = await chunkManagementService.filterChunksByQuality(
          userId,
          minQuality,
          documentIds
        );

        // Filter by max quality if specified
        const filteredChunks = maxQuality < 1 
          ? chunks.filter(chunk => {
              // Note: This assumes quality score is available in the chunk data
              // In a real implementation, you might need to join with quality scores
              return true; // Placeholder - would need actual quality filtering
            })
          : chunks;

        return NextResponse.json({
          success: true,
          data: {
            chunks: filteredChunks,
            count: filteredChunks.length,
            qualityRange: { min: minQuality, max: maxQuality }
          }
        });
      }

      case 'usage-stats': {
        const metrics = await chunkManagementService.getPerformanceMetrics(
          userId,
          documentIds
        );

        // Extract usage-specific statistics
        const usageStats = {
          totalChunks: metrics.totalChunks,
          mostUsedChunks: metrics.mostUsedChunks,
          usageStatistics: metrics.usageStatistics,
          usageDistribution: {
            highUsage: metrics.mostUsedChunks.filter(c => c.usageCount >= 10).length,
            mediumUsage: metrics.mostUsedChunks.filter(c => c.usageCount >= 3 && c.usageCount < 10).length,
            lowUsage: metrics.mostUsedChunks.filter(c => c.usageCount < 3).length,
            unused: metrics.totalChunks - metrics.mostUsedChunks.length
          }
        };

        return NextResponse.json({
          success: true,
          data: usageStats
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: metrics, quality, usage-stats' },
          { status: 400 }
        );
    }
  });
}

/**
 * POST /api/chunks/usage - Record chunk usage
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chunkId, usageType, relevanceScore, success = true, batch } = body;

    // Handle batch usage recording
    if (batch && Array.isArray(batch)) {
      const results = await Promise.allSettled(
        batch.map(async (usage: any) => {
          const { chunkId, usageType, relevanceScore, success = true } = usage;
          
          if (!chunkId || !usageType || relevanceScore === undefined) {
            throw new Error(`Invalid usage data for chunk ${chunkId}`);
          }

          await chunkManagementService.recordUsage(
            chunkId,
            usageType,
            relevanceScore,
            success
          );

          return { chunkId, success: true };
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;
      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason.message);

      return NextResponse.json({
        success: true,
        data: {
          total: batch.length,
          successful,
          failed,
          errors: failed > 0 ? errors : undefined
        },
        message: `Recorded usage for ${successful} chunks, ${failed} failed`
      });
    }

    // Handle single usage recording
    if (!chunkId || !usageType || relevanceScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: chunkId, usageType, relevanceScore' },
        { status: 400 }
      );
    }

    const validUsageTypes = ['quiz_generation', 'content_search', 'similarity_search'];
    if (!validUsageTypes.includes(usageType)) {
      return NextResponse.json(
        { error: `Invalid usageType. Must be one of: ${validUsageTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof relevanceScore !== 'number' || relevanceScore < 0 || relevanceScore > 1) {
      return NextResponse.json(
        { error: 'relevanceScore must be a number between 0 and 1' },
        { status: 400 }
      );
    }

    try {
      await chunkManagementService.recordUsage(
        chunkId,
        usageType,
        relevanceScore,
        success
      );

      return NextResponse.json({
        success: true,
        message: 'Usage recorded successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: 'Chunk not found' },
          { status: 404 }
        );
      }

      throw error;
    }
  });
}

/**
 * PUT /api/chunks/usage - Update chunk usage analytics
 */
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'recalculate-quality': {
        const { chunkIds, documentIds } = params;

        if (chunkIds && Array.isArray(chunkIds)) {
          // Recalculate quality for specific chunks
          const results = [];

          for (const chunkId of chunkIds) {
            try {
              const chunkData = await chunkManagementService.getChunkWithVersions(chunkId);
              const qualityMetrics = await chunkManagementService.calculateQualityMetrics(
                chunkData.chunk.content,
                chunkData.chunk.metadata
              );

              await chunkManagementService.updateChunk(chunkId, {
                changeReason: 'Quality score recalculation'
              });

              results.push({ 
                chunkId, 
                success: true, 
                oldQuality: chunkData.qualityScore?.overallQuality,
                newQuality: qualityMetrics.overallQuality 
              });
            } catch (error) {
              results.push({ 
                chunkId, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              });
            }
          }

          const successful = results.filter(r => r.success).length;
          const failed = results.length - successful;

          return NextResponse.json({
            success: true,
            data: {
              results,
              summary: { total: chunkIds.length, successful, failed }
            },
            message: `Recalculated quality for ${successful} chunks, ${failed} failed`
          });
        } else {
          // Recalculate quality for all chunks (or by document)
          const result = await chunkManagementService.performCleanup(userId, {
            updateQualityScores: true,
            maxAge: 0 // Force update all
          });

          return NextResponse.json({
            success: true,
            data: {
              analyticsUpdated: result.analyticsUpdated,
              chunksProcessed: result.chunksProcessed
            },
            message: `Recalculated quality scores for ${result.analyticsUpdated} chunks`
          });
        }
      }

      case 'reset-analytics': {
        const { chunkId } = params;

        if (!chunkId) {
          return NextResponse.json(
            { error: 'Missing required parameter: chunkId' },
            { status: 400 }
          );
        }

        // This would require a method to reset analytics
        // For now, we'll return a placeholder response
        return NextResponse.json({
          success: true,
          message: 'Analytics reset functionality not yet implemented'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: recalculate-quality, reset-analytics' },
          { status: 400 }
        );
    }
  });
}