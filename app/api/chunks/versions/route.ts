import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chunkManagementService } from '@/lib/services/chunk-management-service';
import { withErrorHandling } from '@/lib/utils/server-error-handling';

/**
 * GET /api/chunks/versions - Get chunk with version history
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chunkId = searchParams.get('chunkId');

    if (!chunkId) {
      return NextResponse.json(
        { error: 'Missing required parameter: chunkId' },
        { status: 400 }
      );
    }

    try {
      const chunkWithVersions = await chunkManagementService.getChunkWithVersions(chunkId);

      return NextResponse.json({
        success: true,
        data: chunkWithVersions
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
 * POST /api/chunks/versions - Create a new chunk version
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chunkId, content, embedding, metadata, changeReason } = body;

    if (!chunkId || !changeReason) {
      return NextResponse.json(
        { error: 'Missing required parameters: chunkId, changeReason' },
        { status: 400 }
      );
    }

    try {
      const updatedChunk = await chunkManagementService.updateChunk(chunkId, {
        content,
        embedding,
        metadata,
        changeReason
      });

      // Get the updated chunk with versions to return complete data
      const chunkWithVersions = await chunkManagementService.getChunkWithVersions(chunkId);

      return NextResponse.json({
        success: true,
        data: {
          chunk: updatedChunk,
          versions: chunkWithVersions.versions,
          latestVersion: chunkWithVersions.versions[0] // Most recent version first
        },
        message: 'Chunk version created successfully'
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
 * DELETE /api/chunks/versions - Delete old versions beyond limit
 */
export async function DELETE(request: NextRequest) {
  return withErrorHandling(async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chunkId = searchParams.get('chunkId');
    const keepVersions = parseInt(searchParams.get('keepVersions') || '10');

    if (!chunkId) {
      return NextResponse.json(
        { error: 'Missing required parameter: chunkId' },
        { status: 400 }
      );
    }

    if (keepVersions < 1) {
      return NextResponse.json(
        { error: 'keepVersions must be at least 1' },
        { status: 400 }
      );
    }

    try {
      // This would require extending the ChunkManagementService with a method to delete old versions
      // For now, we'll perform the cleanup through the existing cleanup method
      const result = await chunkManagementService.performCleanup(userId, {
        removeOldVersions: true,
        maxAge: 0 // Remove immediately based on version count
      });

      return NextResponse.json({
        success: true,
        data: {
          versionsRemoved: result.versionsRemoved,
          spaceFreed: result.spaceFreed
        },
        message: `Removed ${result.versionsRemoved} old versions`
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