/**
 * Integration tests for quiz management API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' }))
}));

vi.mock('@/lib/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'quizzes') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'test-quiz-id',
                  user_id: 'test-user-id',
                  title: 'Test Quiz',
                  source_document_ids: ['doc-1'],
                  question_count: 5,
                  difficulty: 'medium',
                  question_types: ['mcq', 'truefalse'],
                  notes: 'Test notes',
                  focus_areas: ['area1'],
                  learning_objectives: ['objective1'],
                  generation_method: 'rag',
                  metadata: {},
                  created_at: '2023-01-01T00:00:00Z',
                  updated_at: '2023-01-01T00:00:00Z'
                },
                error: null
              }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: {
                    id: 'test-quiz-id',
                    user_id: 'test-user-id',
                    title: 'Updated Quiz',
                    source_document_ids: ['doc-1'],
                    question_count: 5,
                    difficulty: 'hard',
                    question_types: ['mcq'],
                    notes: 'Updated notes',
                    focus_areas: ['area2'],
                    learning_objectives: ['objective2'],
                    generation_method: 'rag',
                    metadata: {},
                    created_at: '2023-01-01T00:00:00Z',
                    updated_at: '2023-01-01T01:00:00Z'
                  },
                  error: null
                }))
              }))
            }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null }))
          }))
        };
      }
      if (table === 'quiz_questions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [
                  {
                    id: 'question-1',
                    quiz_id: 'test-quiz-id',
                    question_text: 'Test question?',
                    question_type: 'mcq',
                    options: ['A', 'B', 'C', 'D'],
                    correct_answer: 'A',
                    explanation: 'Test explanation',
                    difficulty: 'medium',
                    order_index: 0,
                    source_chunks: [],
                    source_pages: [1],
                    confidence_score: 0.9,
                    created_at: '2023-01-01T00:00:00Z'
                  }
                ],
                error: null
              }))
            }))
          }))
        };
      }
      if (table === 'quiz_attempts') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [
                  {
                    id: 'attempt-1',
                    quiz_id: 'test-quiz-id',
                    user_id: 'test-user-id',
                    answers: { 'question-1': 'A' },
                    score: 100,
                    total_questions: 1,
                    time_taken: 60,
                    completed_at: '2023-01-01T00:00:00Z'
                  }
                ],
                error: null
              }))
            }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: 'new-attempt-id' },
                error: null
              }))
            }))
          }))
        };
      }
      return {};
    }))
  }))
}));

vi.mock('@/lib/services/quiz-scoring-service', () => ({
  quizScoringService: {
    calculateResults: vi.fn(() => ({
      totalScore: 100,
      totalPoints: 1,
      maxPoints: 1,
      correctAnswers: 1,
      totalQuestions: 1,
      questionResults: [
        {
          questionId: 'question-1',
          questionText: 'Test question?',
          questionType: 'mcq',
          userAnswer: 'A',
          correctAnswer: 'A',
          isCorrect: true,
          explanation: 'Test explanation',
          points: 1,
          maxPoints: 1,
          difficulty: 'medium',
          sourcePages: [1]
        }
      ],
      analytics: {
        difficultyBreakdown: { medium: { correct: 1, total: 1 } },
        questionTypeBreakdown: { mcq: { correct: 1, total: 1 }, truefalse: { correct: 0, total: 0 }, fillblank: { correct: 0, total: 0 } },
        averageTimePerQuestion: 60,
        strongAreas: ['medium'],
        weakAreas: []
      }
    })),
    validateAttempt: vi.fn(() => ({ valid: true, errors: [] })),
    createAttemptRecord: vi.fn(() => ({
      quizId: 'test-quiz-id',
      userId: 'test-user-id',
      answers: { 'question-1': 'A' },
      score: 100,
      totalQuestions: 1,
      timeTaken: 60
    }))
  }
}));

describe('Quiz Management API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/quiz/[id]', () => {
    it('should return quiz details with questions and attempts', async () => {
      const { GET } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/test-quiz-id');
      const response = await GET(request, { params: { id: 'test-quiz-id' } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.quiz.id).toBe('test-quiz-id');
      expect(data.data.questions).toHaveLength(1);
      expect(data.data.attempts).toHaveLength(1);
      expect(data.data.statistics.totalAttempts).toBe(1);
    });

    it('should validate quiz ID format', async () => {
      const { GET } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/quiz/[id]', () => {
    it('should update quiz successfully', async () => {
      const { PUT } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/test-quiz-id', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Quiz',
          difficulty: 'hard',
          questionTypes: ['mcq'],
          notes: 'Updated notes',
          focusAreas: ['area2'],
          learningObjectives: ['objective2']
        })
      });

      const response = await PUT(request, { params: { id: 'test-quiz-id' } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Quiz');
      expect(data.data.difficulty).toBe('hard');
    });

    it('should validate update request parameters', async () => {
      const { PUT } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/test-quiz-id', {
        method: 'PUT',
        body: JSON.stringify({
          difficulty: 'invalid-difficulty'
        })
      });

      const response = await PUT(request, { params: { id: 'test-quiz-id' } });
      
      expect(response.status).toBe(400);
    });

    it('should validate quiz ID format', async () => {
      const { PUT } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/invalid-id', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' })
      });

      const response = await PUT(request, { params: { id: 'invalid-id' } });
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/quiz/[id]', () => {
    it('should delete quiz successfully', async () => {
      const { DELETE } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/test-quiz-id', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'test-quiz-id' } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should validate quiz ID format', async () => {
      const { DELETE } = await import('@/app/api/quiz/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/invalid-id', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'invalid-id' } });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/quiz/attempts', () => {
    it('should submit quiz attempt successfully', async () => {
      const { POST } = await import('@/app/api/quiz/attempts/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/attempts', {
        method: 'POST',
        body: JSON.stringify({
          quizId: 'test-quiz-id',
          answers: { 'question-1': 'A' },
          timeTaken: 60
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.attemptId).toBe('new-attempt-id');
      expect(data.data.results.totalScore).toBe(100);
    });

    it('should validate quiz attempt request', async () => {
      const { POST } = await import('@/app/api/quiz/attempts/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/attempts', {
        method: 'POST',
        body: JSON.stringify({
          quizId: 'invalid-id',
          answers: {}
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });
});

describe('Validation Functions', () => {
  it('should validate UUID format', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUID = 'not-a-uuid';
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test(invalidUUID)).toBe(false);
  });

  it('should validate difficulty levels', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const invalidDifficulty = 'impossible';
    
    expect(validDifficulties.includes('medium')).toBe(true);
    expect(validDifficulties.includes(invalidDifficulty as any)).toBe(false);
  });

  it('should validate question types', () => {
    const validTypes = ['mcq', 'truefalse', 'fillblank'];
    const invalidType = 'invalid';
    
    expect(validTypes.includes('mcq')).toBe(true);
    expect(validTypes.includes(invalidType as any)).toBe(false);
  });
});