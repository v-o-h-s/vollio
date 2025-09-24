import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chunkManagementService } from '@/lib/services/chunk-management-service';
import { withErrorHandling } from '@/lib/utils/server-error-handling';

/**
 * GET /api/chunks/management - Get chunk performance metrics
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentIds = searchParams.get('documentIds')?.split(',').filter(Boolean);
    const action = searchParams.get('action');

    switch (action) {
      case 'metrics': {
        const metrics = await chunkManagementService.getPerformanceMetrics(
          userId,
          documentIds
        );

        return NextResponse.json({
          success: true,
          data: metrics
        });
      }

      case 'filter': {
        const minQuality = parseFloat(searchParams.get('minQuality') || '0.6');
        const chunks = await chunkManagementService.filterChunksByQuality(
          userId,
          minQuality,
          documentIds
        );

        return NextResponse.json({
          success: true,
          data: { chunks, count: chunks.length }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: metrics, filter' },
          { status: 400 }
        );
    }
  });
}

/**
 * POST /api/chunks/management - Perform chunk management operations
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'deduplicate': {
        const { documentIds } = params;
        const result = await chunkManagementService.deduplicateChunks(
          userId,
          documentIds
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: `Removed ${result.duplicatesRemoved} duplicate chunks, freed ${result.spaceFreed} bytes`
        });
      }

      case 'cleanup': {
        const {
          removeOrphanedChunks = true,
          removeOldVersions = true,
          updateQualityScores = true,
          removeUnusedChunks = false,
          maxAge = 30
        } = params;

        const result = await chunkManagementService.performCleanup(userId, {
          removeOrphanedChunks,
          removeOldVersions,
          updateQualityScores,
          removeUnusedChunks,
          maxAge
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: `Processed ${result.chunksProcessed} chunks, removed ${result.chunksRemoved} chunks, freed ${result.spaceFreed} bytes`
        });
      }

      case 'recordUsage': {
        const { chunkId, usageType, relevanceScore, success = true } = params;

        if (!chunkId || !usageType || relevanceScore === undefined) {
          return NextResponse.json(
            { error: 'Missing required parameters: chunkId, usageType, relevanceScore' },
            { status: 400 }
          );
        }

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
      }

      case 'updateChunk': {
        const { chunkId, content, embedding, metadata, changeReason } = params;

        if (!chunkId || !changeReason) {
          return NextResponse.json(
            { error: 'Missing required parameters: chunkId, changeReason' },
            { status: 400 }
          );
        }

        const updatedChunk = await chunkManagementService.updateChunk(chunkId, {
          content,
          embedding,
          metadata,
          changeReason
        });

        return NextResponse.json({
          success: true,
          data: updatedChunk,
          message: 'Chunk updated successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: deduplicate, cleanup, recordUsage, updateChunk' },
          { status: 400 }
        );
    }
  });
}

/**
 * PUT /api/chunks/management - Bulk chunk operations
 */
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, chunkIds, ...params } = body;

    if (!chunkIds || !Array.isArray(chunkIds) || chunkIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid chunkIds array' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'bulkRecordUsage': {
        const { usageType, relevanceScores, success = true } = params;

        if (!usageType || !relevanceScores || relevanceScores.length !== chunkIds.length) {
          return NextResponse.json(
            { error: 'Invalid parameters for bulk usage recording' },
            { status: 400 }
          );
        }

        const results = await Promise.allSettled(
          chunkIds.map((chunkId: string, index: number) =>
            chunkManagementService.recordUsage(
              chunkId,
              usageType,
              relevanceScores[index],
              success
            )
          )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - successful;

        return NextResponse.json({
          success: true,
          data: {
            total: chunkIds.length,
            successful,
            failed
          },
          message: `Recorded usage for ${successful} chunks, ${failed} failed`
        });
      }

      case 'bulkQualityUpdate': {
        const results = [];

        for (const chunkId of chunkIds) {
          try {
            const chunkData = await chunkManagementService.getChunkWithVersions(chunkId);
            const qualityMetrics = await chunkManagementService.calculateQualityMetrics(
              chunkData.chunk.content,
              chunkData.chunk.metadata
            );

            await chunkManagementService.updateChunk(chunkId, {
              changeReason: 'Bulk quality score update'
            });

            results.push({ chunkId, success: true, quality: qualityMetrics.overallQuality });
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
            summary: {
              total: chunkIds.length,
              successful,
              failed
            }
          },
          message: `Updated quality scores for ${successful} chunks, ${failed} failed`
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: bulkRecordUsage, bulkQualityUpdate' },
          { status: 400 }
        );
    }
  });
}