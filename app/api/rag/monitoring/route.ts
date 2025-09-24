import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ragMonitoringService } from '@/lib/services/rag-monitoring-service';
import { withErrorHandling } from '@/lib/utils/server-error-handling';

/**
 * GET /api/rag/monitoring - Get simple analytics
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analytics = await ragMonitoringService.getSimpleAnalytics();
    
    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/rag/monitoring - Record monitoring data
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'embedding_quality':
        await ragMonitoringService.recordEmbeddingQuality(
          data.documentId,
          data.chunkId,
          data.qualityScore,
          data.isValid
        );
        break;

      case 'quiz_quality':
        await ragMonitoringService.recordQuizQuality(
          data.quizId,
          data.questionId,
          data.qualityScore,
          data.questionType,
          data.difficulty
        );
        break;

      case 'search':
        await ragMonitoringService.recordSearch(
          data.searchQuery,
          data.resultCount,
          data.searchTime
        );
        break;

      case 'feedback':
        const feedbackId = await ragMonitoringService.recordFeedback(
          data.feedbackType,
          data.targetId,
          data.rating,
          data.feedback
        );
        return NextResponse.json({
          success: true,
          feedbackId
        });

      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to record monitoring data' },
      { status: 500 }
    );
  }
});