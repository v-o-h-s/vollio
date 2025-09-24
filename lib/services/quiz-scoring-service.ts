/**
 * Quiz Scoring Service
 * 
 * Handles answer validation, score calculation, and results processing
 * for quiz attempts with comprehensive scoring algorithms.
 */

import { QuizQuestion, QuizAttempt, QuizQuestionType } from "@/lib/types";

/**
 * Individual question result with detailed feedback
 */
export interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: QuizQuestionType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  points: number;
  maxPoints: number;
  difficulty: string;
  sourcePages?: number[];
}

/**
 * Comprehensive quiz results with analytics
 */
export interface QuizResults {
  attemptId?: string;
  quizId: string;
  userId: string;
  totalScore: number; // Percentage (0-100)
  totalPoints: number;
  maxPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken?: number; // in seconds
  completedAt: string;
  questionResults: QuestionResult[];
  analytics: {
    difficultyBreakdown: Record<string, { correct: number; total: number }>;
    questionTypeBreakdown: Record<QuizQuestionType, { correct: number; total: number }>;
    averageTimePerQuestion?: number;
    strongAreas: string[];
    weakAreas: string[];
  };
}

/**
 * Scoring configuration options
 */
export interface ScoringOptions {
  penalizeIncorrect?: boolean; // Deduct points for wrong answers
  partialCredit?: boolean; // Allow partial credit for close answers
  difficultyWeighting?: boolean; // Weight scores by question difficulty
  timeBonus?: boolean; // Bonus points for quick answers
  caseSensitive?: boolean; // Case-sensitive matching for fill-in-blank
}

/**
 * Quiz Scoring Service class
 */
export class QuizScoringService {
  private readonly defaultOptions: ScoringOptions = {
    penalizeIncorrect: false,
    partialCredit: true,
    difficultyWeighting: true,
    timeBonus: false,
    caseSensitive: false,
  };

  /**
   * Calculate quiz results from user answers
   */
  public calculateResults(
    questions: QuizQuestion[],
    userAnswers: Record<string, string>,
    timeTaken?: number,
    options: Partial<ScoringOptions> = {}
  ): Omit<QuizResults, 'attemptId' | 'quizId' | 'userId' | 'completedAt'> {
    const scoringOptions = { ...this.defaultOptions, ...options };
    const questionResults: QuestionResult[] = [];
    
    let totalPoints = 0;
    let maxPoints = 0;
    let correctAnswers = 0;

    // Process each question
    for (const question of questions) {
      const userAnswer = userAnswers[question.id] || '';
      const result = this.scoreQuestion(question, userAnswer, scoringOptions);
      
      questionResults.push(result);
      totalPoints += result.points;
      maxPoints += result.maxPoints;
      
      if (result.isCorrect) {
        correctAnswers++;
      }
    }

    // Calculate percentage score
    const totalScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    // Generate analytics
    const analytics = this.generateAnalytics(questionResults, timeTaken);

    return {
      totalScore,
      totalPoints,
      maxPoints,
      correctAnswers,
      totalQuestions: questions.length,
      timeTaken,
      questionResults,
      analytics,
    };
  }

  /**
   * Score an individual question
   */
  private scoreQuestion(
    question: QuizQuestion,
    userAnswer: string,
    options: ScoringOptions
  ): QuestionResult {
    const basePoints = this.getBasePoints(question.difficulty, options.difficultyWeighting);
    let points = 0;
    let isCorrect = false;

    // Validate answer based on question type
    switch (question.questionType) {
      case 'mcq':
      case 'truefalse':
        isCorrect = this.validateExactMatch(question.correctAnswer, userAnswer, options.caseSensitive);
        points = isCorrect ? basePoints : (options.penalizeIncorrect ? -basePoints * 0.25 : 0);
        break;

      case 'fillblank':
        const fillResult = this.validateFillInBlank(question.correctAnswer, userAnswer, options);
        isCorrect = fillResult.isCorrect;
        points = fillResult.points * basePoints;
        break;

      default:
        console.warn(`Unknown question type: ${question.questionType}`);
        break;
    }

    // Ensure points don't go below 0
    points = Math.max(0, points);

    return {
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      userAnswer: userAnswer.trim(),
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      points,
      maxPoints: basePoints,
      difficulty: question.difficulty,
      sourcePages: question.sourcePages,
    };
  }

  /**
   * Validate exact match for MCQ and True/False questions
   */
  private validateExactMatch(correctAnswer: string, userAnswer: string, caseSensitive = false): boolean {
    if (!caseSensitive) {
      return correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    }
    return correctAnswer.trim() === userAnswer.trim();
  }

  /**
   * Validate fill-in-the-blank answers with partial credit
   */
  private validateFillInBlank(
    correctAnswer: string, 
    userAnswer: string, 
    options: ScoringOptions
  ): { isCorrect: boolean; points: number } {
    if (!userAnswer.trim()) {
      return { isCorrect: false, points: 0 };
    }

    const correct = options.caseSensitive ? correctAnswer : correctAnswer.toLowerCase();
    const user = options.caseSensitive ? userAnswer.trim() : userAnswer.toLowerCase().trim();

    // Exact match gets full points
    if (correct === user) {
      return { isCorrect: true, points: 1 };
    }

    // If partial credit is disabled, return 0
    if (!options.partialCredit) {
      return { isCorrect: false, points: 0 };
    }

    // Calculate similarity for partial credit
    const similarity = this.calculateStringSimilarity(correct, user);
    
    // Award partial credit if similarity is high enough
    if (similarity >= 0.8) {
      return { isCorrect: true, points: similarity };
    } else if (similarity >= 0.6) {
      return { isCorrect: false, points: similarity * 0.5 }; // Partial credit but not considered correct
    }

    return { isCorrect: false, points: 0 };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Get base points for a question based on difficulty
   */
  private getBasePoints(difficulty: string, useWeighting = true): number {
    if (!useWeighting) return 1;

    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 1;
      case 'medium':
        return 1.5;
      case 'hard':
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Generate analytics from question results
   */
  private generateAnalytics(
    questionResults: QuestionResult[],
    timeTaken?: number
  ): QuizResults['analytics'] {
    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};
    const questionTypeBreakdown: Record<QuizQuestionType, { correct: number; total: number }> = {
      mcq: { correct: 0, total: 0 },
      truefalse: { correct: 0, total: 0 },
      fillblank: { correct: 0, total: 0 },
    };

    const difficultyScores: Record<string, number[]> = {};

    // Analyze results
    for (const result of questionResults) {
      // Difficulty breakdown
      if (!difficultyBreakdown[result.difficulty]) {
        difficultyBreakdown[result.difficulty] = { correct: 0, total: 0 };
      }
      difficultyBreakdown[result.difficulty].total++;
      if (result.isCorrect) {
        difficultyBreakdown[result.difficulty].correct++;
      }

      // Question type breakdown
      questionTypeBreakdown[result.questionType].total++;
      if (result.isCorrect) {
        questionTypeBreakdown[result.questionType].correct++;
      }

      // Track scores by difficulty for strong/weak area analysis
      if (!difficultyScores[result.difficulty]) {
        difficultyScores[result.difficulty] = [];
      }
      difficultyScores[result.difficulty].push(result.points / result.maxPoints);
    }

    // Identify strong and weak areas
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    for (const [difficulty, stats] of Object.entries(difficultyBreakdown)) {
      const accuracy = stats.correct / stats.total;
      if (accuracy >= 0.8) {
        strongAreas.push(difficulty);
      } else if (accuracy < 0.5) {
        weakAreas.push(difficulty);
      }
    }

    // Add question type analysis
    for (const [type, stats] of Object.entries(questionTypeBreakdown)) {
      const accuracy = stats.correct / stats.total;
      if (accuracy >= 0.8) {
        strongAreas.push(`${type} questions`);
      } else if (accuracy < 0.5) {
        weakAreas.push(`${type} questions`);
      }
    }

    return {
      difficultyBreakdown,
      questionTypeBreakdown,
      averageTimePerQuestion: timeTaken ? Math.round(timeTaken / questionResults.length) : undefined,
      strongAreas,
      weakAreas,
    };
  }

  /**
   * Validate quiz attempt data
   */
  public validateAttempt(
    questions: QuizQuestion[],
    userAnswers: Record<string, string>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all questions have answers
    for (const question of questions) {
      if (!userAnswers[question.id]) {
        errors.push(`Missing answer for question: ${question.questionText.substring(0, 50)}...`);
      }
    }

    // Check for extra answers (potential tampering)
    const questionIds = new Set(questions.map(q => q.id));
    for (const answerId of Object.keys(userAnswers)) {
      if (!questionIds.has(answerId)) {
        errors.push(`Invalid question ID in answers: ${answerId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a quiz attempt record
   */
  public createAttemptRecord(
    quizId: string,
    userId: string,
    results: Omit<QuizResults, 'attemptId' | 'quizId' | 'userId' | 'completedAt'>
  ): Omit<QuizAttempt, 'id' | 'completedAt'> {
    // Extract just the answers for storage
    const answers: Record<string, string> = {};
    for (const result of results.questionResults) {
      answers[result.questionId] = result.userAnswer;
    }

    return {
      quizId,
      userId,
      answers,
      score: results.totalScore,
      totalQuestions: results.totalQuestions,
      timeTaken: results.timeTaken,
    };
  }
}

// Export singleton instance
export const quizScoringService = new QuizScoringService();