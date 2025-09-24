/**
 * Simple integration examples for RAG monitoring
 * This file shows how to integrate monitoring into existing services
 */

import { ragMonitoringService } from './rag-monitoring-service';

/**
 * Example: Integrate monitoring into embedding service
 */
export async function integrateEmbeddingMonitoring(
  embeddingResult: any,
  documentId: string,
  chunkId: string
) {
  try {
    // Simple quality check
    const qualityScore = embeddingResult.qualityScore || 0.5;
    const isValid = embeddingResult.embedding && embeddingResult.embedding.length > 0;

    // Record the quality
    await ragMonitoringService.recordEmbeddingQuality(
      documentId,
      chunkId,
      qualityScore,
      isValid
    );

    // Simple validation
    if (!ragMonitoringService.isEmbeddingQualityGood(qualityScore)) {
      console.warn(`Low embedding quality: ${qualityScore} for chunk ${chunkId}`);
    }
  } catch (error) {
    console.error('Error in embedding monitoring:', error);
  }
}

/**
 * Example: Integrate monitoring into quiz generation
 */
export async function integrateQuizMonitoring(
  quizId: string,
  questionId: string,
  questionData: any
) {
  try {
    // Simple quality calculation (placeholder)
    const qualityScore = calculateSimpleQuizQuality(questionData);

    // Record the quality
    await ragMonitoringService.recordQuizQuality(
      quizId,
      questionId,
      qualityScore,
      questionData.questionType,
      questionData.difficulty
    );

    // Simple validation
    if (!ragMonitoringService.isQuizQualityGood(qualityScore)) {
      console.warn(`Low quiz quality: ${qualityScore} for question ${questionId}`);
    }
  } catch (error) {
    console.error('Error in quiz monitoring:', error);
  }
}

/**
 * Example: Integrate monitoring into search service
 */
export async function integrateSearchMonitoring(
  searchQuery: string,
  searchResults: any[],
  searchTime: number
) {
  try {
    // Record the search
    await ragMonitoringService.recordSearch(
      searchQuery,
      searchResults.length,
      searchTime
    );

    // Simple performance check
    if (!ragMonitoringService.isSearchPerformanceGood(searchTime)) {
      console.warn(`Slow search performance: ${searchTime}ms for query "${searchQuery}"`);
    }
  } catch (error) {
    console.error('Error in search monitoring:', error);
  }
}

/**
 * Simple quiz quality calculation
 */
function calculateSimpleQuizQuality(questionData: any): number {
  let score = 0.5; // Base score

  // Check if question has text
  if (questionData.questionText && questionData.questionText.length > 10) {
    score += 0.2;
  }

  // Check if question has explanation
  if (questionData.explanation && questionData.explanation.length > 20) {
    score += 0.2;
  }

  // Check if MCQ has 4 options
  if (questionData.questionType === 'mcq' && questionData.options && questionData.options.length === 4) {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

/**
 * Example usage in existing services:
 * 
 * // In embedding service:
 * const result = await generateEmbedding(text);
 * await integrateEmbeddingMonitoring(result, documentId, chunkId);
 * 
 * // In quiz generation service:
 * const question = await generateQuestion(context);
 * await integrateQuizMonitoring(quizId, questionId, question);
 * 
 * // In search service:
 * const startTime = Date.now();
 * const results = await performSearch(query);
 * const searchTime = Date.now() - startTime;
 * await integrateSearchMonitoring(query, results, searchTime);
 */