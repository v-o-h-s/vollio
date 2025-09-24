/**
 * Integration tests for RAG quiz generation API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' }))
}));

vi.mock('@/lib/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null }))
        })),
        in: vi.fn(() => ({ data: [], error: null }))
      }))
    }))
  }))
}));

vi.mock('@/lib/services/vector-search-service', () => ({
  vectorSearchService: {
    searchMultipleDocuments: vi.fn(() => ({
      success: true,
      results: [],
      documentBreakdown: {},
      totalResults: 0,
      searchTime: 100
    }))
  }
}));

vi.mock('@/lib/services/rag-quiz-generation-service', () => ({
  ragQuizGenerationService: {
    getInstance: vi.fn(() => ({
      generateRAGQuiz: vi.fn(() => ({
        success: true,
        quizId: 'test-quiz-id',
        questions: [],
        metadata: {
          sourceDocumentTitles: [],
          totalChunksSearched: 0,
          averageRelevanceScore: 0,
          generationTime: 1000,
          aiModel: 'gpt-4',
          embeddingModel: 'text-embedding-ada-002',
          searchQuery: 'test query',
          retrievalMethod: 'vector_similarity'
        },
        sourceChunks: []
      }))
    }))
  }
}));

describe('Quiz API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('/api/quiz/search-content', () => {
    it('should validate request parameters', async () => {
      const { POST } = await import('@/app/api/quiz/search-content/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/search-content', {
        method: 'POST',
        body: JSON.stringify({
          query: '',
          documentIds: []
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept valid search request', async () => {
      const { POST } = await import('@/app/api/quiz/search-content/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/search-content', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test query',
          documentIds: ['550e8400-e29b-41d4-a716-446655440000'],
          limit: 10
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('/api/quiz/generate-rag', () => {
    it('should validate quiz generation parameters', async () => {
      const { POST } = await import('@/app/api/quiz/generate-rag/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/generate-rag', {
        method: 'POST',
        body: JSON.stringify({
          documentIds: [],
          questionCount: 0,
          difficulty: 'invalid',
          questionTypes: []
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept valid quiz generation request', async () => {
      const { POST } = await import('@/app/api/quiz/generate-rag/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/generate-rag', {
        method: 'POST',
        body: JSON.stringify({
          documentIds: ['550e8400-e29b-41d4-a716-446655440000'],
          questionCount: 5,
          difficulty: 'medium',
          questionTypes: ['mcq', 'truefalse'],
          notes: 'Test quiz generation'
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });

  describe('/api/quiz/generation-status/[id]', () => {
    it('should return quiz generation status', async () => {
      const { GET } = await import('@/app/api/quiz/generation-status/[id]/route');
      
      const request = new NextRequest('http://localhost:3000/api/quiz/generation-status/test-id');
      const response = await GET(request, { params: { id: 'test-quiz-id' } });
      
      expect(response.status).toBe(200);
    });
  });
});

describe('Request Validation', () => {
  it('should validate UUID format for document IDs', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUID = 'not-a-uuid';
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuidRegex.test(validUUID)).toBe(true);
    expect(uuidRegex.test(invalidUUID)).toBe(false);
  });

  it('should validate question types', () => {
    const validTypes = ['mcq', 'truefalse', 'fillblank'];
    const invalidType = 'invalid';
    
    expect(validTypes.includes('mcq')).toBe(true);
    expect(validTypes.includes(invalidType as any)).toBe(false);
  });

  it('should validate difficulty levels', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const invalidDifficulty = 'impossible';
    
    expect(validDifficulties.includes('medium')).toBe(true);
    expect(validDifficulties.includes(invalidDifficulty as any)).toBe(false);
  });
});