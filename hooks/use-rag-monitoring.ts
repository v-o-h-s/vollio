import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Simple hook for RAG monitoring integration
 */
export function useRAGMonitoring() {
  /**
   * Record embedding quality
   */
  const recordEmbeddingQuality = useCallback(async (
    documentId: string,
    chunkId: string,
    qualityScore: number,
    isValid: boolean
  ) => {
    try {
      await fetch('/api/rag/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'embedding_quality',
          data: {
            documentId,
            chunkId,
            qualityScore,
            isValid
          }
        })
      });
    } catch (error) {
      console.error('Error recording embedding quality:', error);
    }
  }, []);

  /**
   * Record quiz quality
   */
  const recordQuizQuality = useCallback(async (
    quizId: string,
    questionId: string,
    qualityScore: number,
    questionType: string,
    difficulty: string
  ) => {
    try {
      await fetch('/api/rag/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'quiz_quality',
          data: {
            quizId,
            questionId,
            qualityScore,
            questionType,
            difficulty
          }
        })
      });
    } catch (error) {
      console.error('Error recording quiz quality:', error);
    }
  }, []);

  /**
   * Record search activity
   */
  const recordSearch = useCallback(async (
    searchQuery: string,
    resultCount: number,
    searchTime: number
  ) => {
    try {
      await fetch('/api/rag/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'search',
          data: {
            searchQuery,
            resultCount,
            searchTime
          }
        })
      });
    } catch (error) {
      console.error('Error recording search:', error);
    }
  }, []);

  /**
   * Submit user feedback
   */
  const submitFeedback = useCallback(async (
    feedbackType: 'quiz' | 'search' | 'general',
    targetId: string,
    rating: number,
    feedback: string
  ) => {
    try {
      const response = await fetch('/api/rag/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          data: {
            feedbackType,
            targetId,
            rating,
            feedback
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      toast.success('Feedback submitted successfully');
      return data.feedbackId;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
      throw error;
    }
  }, []);

  /**
   * Check if quality is good (simple validation)
   */
  const isQualityGood = useCallback((qualityScore: number, type: 'embedding' | 'quiz') => {
    if (type === 'embedding') {
      return qualityScore >= 0.7;
    } else {
      return qualityScore >= 0.6;
    }
  }, []);

  /**
   * Check if performance is good (simple validation)
   */
  const isPerformanceGood = useCallback((timeMs: number) => {
    return timeMs < 5000; // 5 seconds
  }, []);

  return {
    recordEmbeddingQuality,
    recordQuizQuality,
    recordSearch,
    submitFeedback,
    isQualityGood,
    isPerformanceGood
  };
}