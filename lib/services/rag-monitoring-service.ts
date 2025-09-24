import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simple embedding quality tracking
 */
export interface EmbeddingQuality {
  id: string;
  userId: string;
  documentId: string;
  chunkId: string;
  qualityScore: number;
  isValid: boolean;
  timestamp: Date;
}

/**
 * Simple quiz quality tracking
 */
export interface QuizQuality {
  id: string;
  userId: string;
  quizId: string;
  questionId: string;
  qualityScore: number;
  questionType: string;
  difficulty: string;
  timestamp: Date;
}

/**
 * Simple search tracking
 */
export interface SearchTracking {
  id: string;
  userId: string;
  searchQuery: string;
  resultCount: number;
  searchTime: number;
  timestamp: Date;
}

/**
 * Simple user feedback
 */
export interface UserFeedback {
  id: string;
  userId: string;
  feedbackType: 'quiz' | 'search' | 'general';
  targetId: string;
  rating: number; // 1-5
  feedback: string;
  timestamp: Date;
}

/**
 * Simple analytics dashboard
 */
export interface SimpleAnalytics {
  totalEmbeddings: number;
  totalQuizzes: number;
  totalSearches: number;
  averageRating: number;
  recentFeedback: UserFeedback[];
}

export class RAGMonitoringService {
  /**
   * Record embedding quality (simple version)
   */
  async recordEmbeddingQuality(
    documentId: string,
    chunkId: string,
    qualityScore: number,
    isValid: boolean
  ): Promise<void> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      const record: Omit<EmbeddingQuality, 'id'> = {
        userId: await this.getCurrentUserId(),
        documentId,
        chunkId,
        qualityScore,
        isValid,
        timestamp: new Date()
      };

      const { error } = await client
        .from('embedding_quality_simple')
        .insert(record);

      if (error) {
        console.error('Error recording embedding quality:', error);
      }
    } catch (error) {
      console.error('Error in recordEmbeddingQuality:', error);
    }
  }

  /**
   * Record quiz quality (simple version)
   */
  async recordQuizQuality(
    quizId: string,
    questionId: string,
    qualityScore: number,
    questionType: string,
    difficulty: string
  ): Promise<void> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      const record: Omit<QuizQuality, 'id'> = {
        userId: await this.getCurrentUserId(),
        quizId,
        questionId,
        qualityScore,
        questionType,
        difficulty,
        timestamp: new Date()
      };

      const { error } = await client
        .from('quiz_quality_simple')
        .insert(record);

      if (error) {
        console.error('Error recording quiz quality:', error);
      }
    } catch (error) {
      console.error('Error in recordQuizQuality:', error);
    }
  }

  /**
   * Record search activity (simple version)
   */
  async recordSearch(
    searchQuery: string,
    resultCount: number,
    searchTime: number
  ): Promise<void> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      const record: Omit<SearchTracking, 'id'> = {
        userId: await this.getCurrentUserId(),
        searchQuery,
        resultCount,
        searchTime,
        timestamp: new Date()
      };

      const { error } = await client
        .from('search_tracking_simple')
        .insert(record);

      if (error) {
        console.error('Error recording search:', error);
      }
    } catch (error) {
      console.error('Error in recordSearch:', error);
    }
  }

  /**
   * Record user feedback (simple version)
   */
  async recordFeedback(
    feedbackType: 'quiz' | 'search' | 'general',
    targetId: string,
    rating: number,
    feedback: string
  ): Promise<string> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      const record: Omit<UserFeedback, 'id'> = {
        userId: await this.getCurrentUserId(),
        feedbackType,
        targetId,
        rating: Math.max(1, Math.min(5, rating)), // Ensure 1-5 range
        feedback,
        timestamp: new Date()
      };

      const { data, error } = await client
        .from('user_feedback_simple')
        .insert(record)
        .select('id')
        .single();

      if (error) {
        console.error('Error recording feedback:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error in recordFeedback:', error);
      throw error;
    }
  }

  /**
   * Get simple analytics
   */
  async getSimpleAnalytics(): Promise<SimpleAnalytics> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      const userId = await this.getCurrentUserId();

      // Get counts
      const [embeddingCount, quizCount, searchCount] = await Promise.all([
        this.getCount(client, 'embedding_quality_simple', userId),
        this.getCount(client, 'quiz_quality_simple', userId),
        this.getCount(client, 'search_tracking_simple', userId)
      ]);

      // Get average rating
      const { data: feedbackData } = await client
        .from('user_feedback_simple')
        .select('rating')
        .eq('user_id', userId);

      const averageRating = feedbackData && feedbackData.length > 0
        ? feedbackData.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbackData.length
        : 0;

      // Get recent feedback
      const { data: recentFeedbackData } = await client
        .from('user_feedback_simple')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      const recentFeedback = recentFeedbackData?.map((f: any) => ({
        id: f.id,
        userId: f.user_id,
        feedbackType: f.feedback_type,
        targetId: f.target_id,
        rating: f.rating,
        feedback: f.feedback,
        timestamp: new Date(f.timestamp)
      })) || [];

      return {
        totalEmbeddings: embeddingCount,
        totalQuizzes: quizCount,
        totalSearches: searchCount,
        averageRating,
        recentFeedback
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalEmbeddings: 0,
        totalQuizzes: 0,
        totalSearches: 0,
        averageRating: 0,
        recentFeedback: []
      };
    }
  }

  /**
   * Check if embedding quality is good
   */
  isEmbeddingQualityGood(qualityScore: number): boolean {
    return qualityScore >= 0.7;
  }

  /**
   * Check if quiz quality is good
   */
  isQuizQualityGood(qualityScore: number): boolean {
    return qualityScore >= 0.6;
  }

  /**
   * Check if search performance is good
   */
  isSearchPerformanceGood(searchTime: number): boolean {
    return searchTime < 5000; // 5 seconds
  }

  /**
   * Helper method to get count from table
   */
  private async getCount(client: any, table: string, userId: string): Promise<number> {
    const { count } = await client
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  /**
   * Get current user ID (placeholder)
   */
  private async getCurrentUserId(): Promise<string> {
    // This would be implemented based on your auth system
    return 'current-user-id';
  }
}

// Export singleton instance
export const ragMonitoringService = new RAGMonitoringService();