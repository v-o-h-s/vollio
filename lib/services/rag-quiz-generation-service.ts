import { vectorSearchService } from './vector-search-service';
import { embeddingService } from './embedding-service';
import { chunkManagementService } from './chunk-management-service';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import type {
  Quiz,
  QuizQuestion,
  QuizDifficulty,
  QuizQuestionType,
  RAGQuizMetadata,
  ChunkReference,
  QuestionChunkSource,
  DocumentChunk
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * RAG quiz generation request configuration
 */
export interface RAGQuizGenerationRequest {
  documentIds: string[];
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
  title?: string;
}

/**
 * RAG quiz generation response
 */
export interface RAGQuizGenerationResponse {
  success: boolean;
  quizId: string;
  questions: QuizQuestion[];
  metadata: RAGQuizMetadata;
  sourceChunks: ChunkReference[];
  error?: string;
}

/**
 * Query construction result
 */
interface QueryConstructionResult {
  searchQuery: string;
  enhancedQuery: string;
  queryComponents: {
    baseQuery: string;
    focusAreas: string[];
    learningObjectives: string[];
    contextualHints: string[];
  };
  confidence: number;
}

/**
 * Prompt engineering configuration for different question types
 */
interface PromptConfig {
  systemPrompt: string;
  questionTypePrompt: string;
  difficultyPrompt: string;
  contextPrompt: string;
  formatPrompt: string;
}

/**
 * Question generation result with quality metrics
 */
interface QuestionGenerationResult {
  question: Omit<QuizQuestion, 'id' | 'quizId' | 'createdAt'>;
  qualityScore: number;
  sourceChunks: ChunkReference[];
  generationMetadata: {
    promptTokens: number;
    responseTokens: number;
    processingTime: number;
    retryCount: number;
  };
}

/**
 * Multi-document synthesis configuration
 */
interface MultiDocumentSynthesisConfig {
  maxDocumentsPerQuestion: number;
  documentBalanceWeight: number;
  crossDocumentSimilarityThreshold: number;
  synthesisMethod: 'balanced' | 'best_match' | 'comprehensive';
}

export class RAGQuizGenerationService {
  private static readonly DEFAULT_SIMILARITY_THRESHOLD = 0.75;
  private static readonly DEFAULT_CHUNKS_PER_QUESTION = 3;
  private static readonly MAX_CHUNKS_PER_QUESTION = 5;
  private static readonly MIN_QUALITY_SCORE = 0.6;
  private static readonly DEFAULT_AI_MODEL = 'gpt-4';
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly GENERATION_TIMEOUT = 60000; // 60 seconds

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  /**
   * Generate a RAG-enhanced quiz from processed documents
   */
  async generateRAGQuiz(request: RAGQuizGenerationRequest): Promise<RAGQuizGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Construct search query from user parameters and notes
      const queryResult = await this.constructSearchQuery(request);
      
      // Step 2: Perform semantic search to retrieve relevant chunks
      const searchResult = await vectorSearchService.searchMultipleDocuments(
        queryResult.enhancedQuery,
        request.documentIds,
        {
          limit: request.questionCount * RAGQuizGenerationService.DEFAULT_CHUNKS_PER_QUESTION,
          similarityThreshold: RAGQuizGenerationService.DEFAULT_SIMILARITY_THRESHOLD,
          pageRange: request.pageRange,
          rankingMethod: 'hybrid',
          diversityFactor: 0.4 // Encourage diversity for better question variety
        }
      );

      if (!searchResult.success || searchResult.results.length === 0) {
        return {
          success: false,
          quizId: '',
          questions: [],
          metadata: this.createEmptyMetadata(),
          sourceChunks: [],
          error: 'No relevant content found for quiz generation'
        };
      }

      // Record chunk usage for analytics
      await this.recordChunkUsage(searchResult.results, 'quiz_generation');

      // Step 3: Synthesize content across multiple documents
      const synthesizedChunks = await this.synthesizeMultiDocumentContent(
        searchResult.results,
        request
      );

      // Step 4: Generate questions using context-aware prompts
      const questionResults = await this.generateQuestionsFromChunks(
        synthesizedChunks,
        request,
        queryResult
      );

      // Step 5: Validate and filter questions by quality
      const validatedQuestions = this.validateAndFilterQuestions(
        questionResults,
        request.questionCount
      );

      if (validatedQuestions.length === 0) {
        return {
          success: false,
          quizId: '',
          questions: [],
          metadata: this.createEmptyMetadata(),
          sourceChunks: [],
          error: 'Failed to generate questions meeting quality standards'
        };
      }

      // Step 6: Create quiz and store in database
      const quizId = uuidv4();
      const quiz = await this.createQuizRecord(quizId, request, validatedQuestions);
      
      // Step 7: Store questions and source mappings
      const questions = await this.storeQuestionsWithSources(
        quizId,
        validatedQuestions
      );

      // Step 8: Create metadata
      const metadata = this.createQuizMetadata(
        searchResult,
        validatedQuestions,
        queryResult,
        Date.now() - startTime
      );

      // Step 9: Extract source chunks for response
      const sourceChunks = this.extractSourceChunks(validatedQuestions);

      return {
        success: true,
        quizId,
        questions,
        metadata,
        sourceChunks
      };
    } catch (error) {
      return {
        success: false,
        quizId: '',
        questions: [],
        metadata: this.createEmptyMetadata(),
        sourceChunks: [],
        error: error instanceof Error ? error.message : 'Unknown error during quiz generation'
      };
    }
  }

  /**
   * Construct search query from user parameters and notes
   */
  private async constructSearchQuery(request: RAGQuizGenerationRequest): Promise<QueryConstructionResult> {
    const components = {
      baseQuery: '',
      focusAreas: request.focusAreas || [],
      learningObjectives: request.learningObjectives || [],
      contextualHints: []
    };

    // Build base query from notes and focus areas
    let baseQuery = request.notes || '';
    
    if (request.focusAreas && request.focusAreas.length > 0) {
      baseQuery += ` Focus on: ${request.focusAreas.join(', ')}`;
      components.baseQuery = baseQuery;
    }

    if (request.learningObjectives && request.learningObjectives.length > 0) {
      baseQuery += ` Learning objectives: ${request.learningObjectives.join(', ')}`;
    }

    // Add contextual hints based on question types and difficulty
    const contextualHints = this.generateContextualHints(request);
    components.contextualHints = contextualHints;
    
    // Enhance query with question type and difficulty context
    const enhancedQuery = this.enhanceQueryWithContext(baseQuery, request, contextualHints);

    // Calculate confidence based on query completeness
    const confidence = this.calculateQueryConfidence(components, request);

    return {
      searchQuery: baseQuery,
      enhancedQuery,
      queryComponents: components,
      confidence
    };
  }

  /**
   * Generate contextual hints for better content retrieval
   */
  private generateContextualHints(request: RAGQuizGenerationRequest): string[] {
    const hints: string[] = [];

    // Add hints based on question types
    if (request.questionTypes.includes('mcq')) {
      hints.push('factual information', 'definitions', 'concepts with clear distinctions');
    }
    
    if (request.questionTypes.includes('truefalse')) {
      hints.push('statements that can be verified', 'facts and claims', 'specific details');
    }
    
    if (request.questionTypes.includes('fillblank')) {
      hints.push('key terms', 'important concepts', 'technical vocabulary');
    }

    // Add hints based on difficulty
    switch (request.difficulty) {
      case 'easy':
        hints.push('basic concepts', 'fundamental principles', 'introductory material');
        break;
      case 'medium':
        hints.push('intermediate concepts', 'relationships between ideas', 'applications');
        break;
      case 'hard':
        hints.push('complex concepts', 'advanced applications', 'critical analysis', 'synthesis');
        break;
    }

    return hints;
  }

  /**
   * Enhance query with contextual information
   */
  private enhanceQueryWithContext(
    baseQuery: string,
    request: RAGQuizGenerationRequest,
    hints: string[]
  ): string {
    let enhanced = baseQuery;

    // Add difficulty context
    enhanced += ` Generate ${request.difficulty} level content`;

    // Add question type context
    const typeDescriptions = {
      mcq: 'multiple choice questions with clear answer options',
      truefalse: 'true/false statements based on facts',
      fillblank: 'fill-in-the-blank questions with key terms'
    };

    const typeHints = request.questionTypes
      .map(type => typeDescriptions[type])
      .join(', ');
    
    enhanced += ` suitable for ${typeHints}`;

    // Add contextual hints
    if (hints.length > 0) {
      enhanced += ` focusing on ${hints.slice(0, 5).join(', ')}`;
    }

    return enhanced.trim();
  }

  /**
   * Calculate query confidence based on completeness
   */
  private calculateQueryConfidence(
    components: QueryConstructionResult['queryComponents'],
    request: RAGQuizGenerationRequest
  ): number {
    let score = 0.5; // Base score

    // Boost for user notes
    if (components.baseQuery.trim().length > 10) {
      score += 0.2;
    }

    // Boost for focus areas
    if (components.focusAreas.length > 0) {
      score += 0.15;
    }

    // Boost for learning objectives
    if (components.learningObjectives.length > 0) {
      score += 0.15;
    }

    // Boost for specific page range
    if (request.pageRange) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Synthesize content across multiple documents for comprehensive coverage
   */
  private async synthesizeMultiDocumentContent(
    searchResults: any[],
    request: RAGQuizGenerationRequest
  ): Promise<ChunkReference[]> {
    const config: MultiDocumentSynthesisConfig = {
      maxDocumentsPerQuestion: 2,
      documentBalanceWeight: 0.3,
      crossDocumentSimilarityThreshold: 0.8,
      synthesisMethod: 'balanced'
    };

    // Group chunks by document
    const chunksByDocument = new Map<string, any[]>();
    searchResults.forEach(result => {
      const docId = result.chunk.documentId;
      if (!chunksByDocument.has(docId)) {
        chunksByDocument.set(docId, []);
      }
      chunksByDocument.get(docId)!.push(result);
    });

    // Get document titles for context
    const documentTitles = await this.getDocumentTitles(request.documentIds);

    // Apply synthesis strategy
    const synthesizedChunks: ChunkReference[] = [];
    const targetChunksPerQuestion = Math.min(
      RAGQuizGenerationService.MAX_CHUNKS_PER_QUESTION,
      Math.ceil(searchResults.length / request.questionCount)
    );

    for (let i = 0; i < request.questionCount; i++) {
      const questionChunks = this.selectChunksForQuestion(
        searchResults,
        chunksByDocument,
        documentTitles,
        targetChunksPerQuestion,
        config
      );
      
      synthesizedChunks.push(...questionChunks);
    }

    // Remove duplicates while preserving order
    const uniqueChunks = synthesizedChunks.filter((chunk, index, array) => 
      array.findIndex(c => c.chunkId === chunk.chunkId) === index
    );

    return uniqueChunks;
  }

  /**
   * Select optimal chunks for a single question considering multi-document balance
   */
  private selectChunksForQuestion(
    allResults: any[],
    chunksByDocument: Map<string, any[]>,
    documentTitles: Map<string, string>,
    targetCount: number,
    config: MultiDocumentSynthesisConfig
  ): ChunkReference[] {
    const selectedChunks: ChunkReference[] = [];
    const usedDocuments = new Set<string>();

    // Enhanced multi-document selection with relevance weighting
    const documentIds = Array.from(chunksByDocument.keys());
    const documentRelevanceScores = new Map<string, number>();

    // Calculate document relevance scores
    documentIds.forEach(docId => {
      const docChunks = chunksByDocument.get(docId) || [];
      if (docChunks.length > 0) {
        const avgRelevance = docChunks.reduce((sum: number, chunk: any) => 
          sum + chunk.similarity, 0) / docChunks.length;
        documentRelevanceScores.set(docId, avgRelevance);
      }
    });

    // Sort documents by relevance for balanced selection
    const sortedDocuments = documentIds.sort((a, b) => 
      (documentRelevanceScores.get(b) || 0) - (documentRelevanceScores.get(a) || 0)
    );

    // First pass: ensure representation from top documents
    const maxDocsPerQuestion = Math.min(config.maxDocumentsPerQuestion, documentIds.length);
    for (let i = 0; i < maxDocsPerQuestion && selectedChunks.length < targetCount; i++) {
      const docId = sortedDocuments[i];
      const docChunks = chunksByDocument.get(docId) || [];
      
      if (docChunks.length > 0) {
        // Select best chunk from this document
        const bestChunk = docChunks[0];
        selectedChunks.push(this.convertToChunkReference(bestChunk, documentTitles));
        usedDocuments.add(docId);
      }
    }

    // Second pass: fill remaining slots with best available chunks, maintaining balance
    const remainingSlots = targetCount - selectedChunks.length;
    if (remainingSlots > 0) {
      const unusedResults = allResults.filter(result => 
        !selectedChunks.some(chunk => chunk.chunkId === result.chunk.id)
      );

      // Apply document balancing to remaining selections
      const balancedSelection = this.balanceRemainingChunks(
        unusedResults,
        usedDocuments,
        documentIds.length,
        remainingSlots,
        documentTitles
      );

      selectedChunks.push(...balancedSelection);
    }

    return selectedChunks;
  }

  /**
   * Balance remaining chunk selection across documents
   */
  private balanceRemainingChunks(
    remainingResults: any[],
    usedDocuments: Set<string>,
    totalDocuments: number,
    remainingSlots: number,
    documentTitles: Map<string, string>
  ): ChunkReference[] {
    const balanced: ChunkReference[] = [];
    const documentCounts = new Map<string, number>();

    // Initialize document counts
    usedDocuments.forEach(docId => {
      documentCounts.set(docId, 1); // Already used once
    });

    // Sort remaining results by relevance
    const sortedRemaining = remainingResults.sort((a, b) => b.similarity - a.similarity);

    for (const result of sortedRemaining) {
      if (balanced.length >= remainingSlots) break;

      const docId = result.chunk.documentId;
      const currentCount = documentCounts.get(docId) || 0;
      const avgCount = (balanced.length + usedDocuments.size) / totalDocuments;

      // Prefer chunks from under-represented documents
      if (currentCount <= avgCount + 1) {
        balanced.push(this.convertToChunkReference(result, documentTitles));
        documentCounts.set(docId, currentCount + 1);
      }
    }

    // Fill any remaining slots with best available chunks
    const stillRemaining = remainingSlots - balanced.length;
    if (stillRemaining > 0) {
      const unselected = sortedRemaining.filter(r => 
        !balanced.some(chunk => chunk.chunkId === r.chunk.id)
      );
      
      for (let i = 0; i < Math.min(stillRemaining, unselected.length); i++) {
        balanced.push(this.convertToChunkReference(unselected[i], documentTitles));
      }
    }

    return balanced;
  }

  /**
   * Convert search result to chunk reference
   */
  private convertToChunkReference(
    searchResult: any,
    documentTitles: Map<string, string>
  ): ChunkReference {
    return {
      chunkId: searchResult.chunk.id,
      content: searchResult.chunk.content,
      pageNumber: searchResult.chunk.pageNumber,
      relevanceScore: searchResult.similarity,
      documentTitle: documentTitles.get(searchResult.chunk.documentId) || 'Unknown Document'
    };
  }

  /**
   * Get document titles for the given document IDs
   */
  private async getDocumentTitles(documentIds: string[]): Promise<Map<string, string>> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      const { data, error } = await client
        .from('pdfs')
        .select('id, filename')
        .in('id', documentIds);

      if (error) {
        console.error('Error fetching document titles:', error);
        return new Map();
      }

      return new Map(data?.map(doc => [doc.id, doc.filename]) || []);
    } catch (error) {
      console.error('Error in getDocumentTitles:', error);
      return new Map();
    }
  }

  /**
   * Generate questions from synthesized chunks using context-aware prompts
   */
  private async generateQuestionsFromChunks(
    chunks: ChunkReference[],
    request: RAGQuizGenerationRequest,
    queryResult: QueryConstructionResult
  ): Promise<QuestionGenerationResult[]> {
    const results: QuestionGenerationResult[] = [];
    const chunksPerQuestion = Math.ceil(chunks.length / request.questionCount);

    for (let i = 0; i < request.questionCount; i++) {
      const questionChunks = chunks.slice(
        i * chunksPerQuestion,
        (i + 1) * chunksPerQuestion
      );

      if (questionChunks.length === 0) continue;

      // Select question type for this question
      const questionType = this.selectQuestionType(request.questionTypes, i);
      
      try {
        const questionResult = await this.generateSingleQuestion(
          questionChunks,
          questionType,
          request.difficulty,
          queryResult,
          i
        );

        if (questionResult) {
          results.push(questionResult);
        }
      } catch (error) {
        console.error(`Error generating question ${i + 1}:`, error);
        // Continue with other questions
      }
    }

    return results;
  }

  /**
   * Select question type for a specific question index
   */
  private selectQuestionType(types: QuizQuestionType[], index: number): QuizQuestionType {
    return types[index % types.length];
  }

  /**
   * Generate a single question using AI with context-aware prompting
   */
  private async generateSingleQuestion(
    chunks: ChunkReference[],
    questionType: QuizQuestionType,
    difficulty: QuizDifficulty,
    queryResult: QueryConstructionResult,
    questionIndex: number
  ): Promise<QuestionGenerationResult | null> {
    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount < RAGQuizGenerationService.MAX_RETRY_ATTEMPTS) {
      try {
        // Build context-aware prompt
        const promptConfig = this.buildPromptConfig(
          chunks,
          questionType,
          difficulty,
          queryResult
        );

        // Call AI API
        const response = await this.callAIAPI(promptConfig);
        
        // Parse and validate response
        const parsedQuestion = this.parseQuestionResponse(
          response,
          questionType,
          difficulty,
          questionIndex
        );

        if (parsedQuestion) {
          // Calculate quality score
          const qualityScore = this.calculateQuestionQuality(
            parsedQuestion,
            chunks,
            questionType
          );

          return {
            question: parsedQuestion,
            qualityScore,
            sourceChunks: chunks,
            generationMetadata: {
              promptTokens: response.usage?.prompt_tokens || 0,
              responseTokens: response.usage?.completion_tokens || 0,
              processingTime: Date.now() - startTime,
              retryCount
            }
          };
        }
      } catch (error) {
        console.error(`Question generation attempt ${retryCount + 1} failed:`, error);
      }

      retryCount++;
    }

    return null;
  }

  /**
   * Build context-aware prompt configuration
   */
  private buildPromptConfig(
    chunks: ChunkReference[],
    questionType: QuizQuestionType,
    difficulty: QuizDifficulty,
    queryResult: QueryConstructionResult
  ): PromptConfig {
    const systemPrompt = this.getSystemPrompt();
    const questionTypePrompt = this.getQuestionTypePrompt(questionType);
    const difficultyPrompt = this.getDifficultyPrompt(difficulty);
    const contextPrompt = this.buildContextPrompt(chunks, queryResult);
    const formatPrompt = this.getFormatPrompt(questionType);

    return {
      systemPrompt,
      questionTypePrompt,
      difficultyPrompt,
      contextPrompt,
      formatPrompt
    };
  }

  /**
   * Get system prompt for AI model
   */
  private getSystemPrompt(): string {
    return `You are an expert educational content creator specializing in generating high-quality quiz questions from academic and professional documents. Your questions should be:

1. Accurate and based strictly on the provided content
2. Clear and unambiguous in wording
3. Appropriate for the specified difficulty level
4. Educationally valuable and thought-provoking
5. Include detailed explanations with source references

Always cite the source content and page numbers in your explanations.`;
  }

  /**
   * Get question type specific prompt
   */
  private getQuestionTypePrompt(questionType: QuizQuestionType): string {
    const prompts = {
      mcq: `Generate a multiple choice question with exactly 4 options (A, B, C, D). 
- Only one option should be correct
- Incorrect options should be plausible but clearly wrong
- Avoid "all of the above" or "none of the above" options
- Make sure the question tests understanding, not just memorization`,

      truefalse: `Generate a true/false question based on factual information from the content.
- The statement should be clear and unambiguous
- Base the statement on specific facts, not opinions or interpretations
- Ensure the answer can be definitively determined from the source material`,

      fillblank: `Generate a fill-in-the-blank question with 1-3 blanks.
- Focus on key terms, concepts, or important details
- The blanks should test essential knowledge, not trivial details
- Provide the complete sentence with blanks marked as [BLANK]
- List the correct answers for each blank`
    };

    return prompts[questionType];
  }

  /**
   * Get difficulty-specific prompt
   */
  private getDifficultyPrompt(difficulty: QuizDifficulty): string {
    const prompts = {
      easy: `Create an EASY level question that:
- Tests basic understanding and recall
- Uses straightforward language
- Focuses on fundamental concepts
- Should be answerable by someone with introductory knowledge`,

      medium: `Create a MEDIUM level question that:
- Tests application and analysis
- Requires understanding relationships between concepts
- May involve some inference or reasoning
- Should challenge someone with intermediate knowledge`,

      hard: `Create a HARD level question that:
- Tests synthesis, evaluation, or critical thinking
- Requires deep understanding of complex concepts
- May involve multiple steps of reasoning
- Should challenge someone with advanced knowledge`
    };

    return prompts[difficulty];
  }

  /**
   * Build context prompt from chunks and query
   */
  private buildContextPrompt(
    chunks: ChunkReference[],
    queryResult: QueryConstructionResult
  ): string {
    let prompt = `Based on the following content from academic/professional documents:\n\n`;

    chunks.forEach((chunk, index) => {
      prompt += `--- Source ${index + 1} (${chunk.documentTitle}, Page ${chunk.pageNumber}) ---\n`;
      prompt += `${chunk.content}\n\n`;
    });

    if (queryResult.queryComponents.focusAreas.length > 0) {
      prompt += `Focus Areas: ${queryResult.queryComponents.focusAreas.join(', ')}\n`;
    }

    if (queryResult.queryComponents.learningObjectives.length > 0) {
      prompt += `Learning Objectives: ${queryResult.queryComponents.learningObjectives.join(', ')}\n`;
    }

    return prompt;
  }

  /**
   * Get format prompt for response structure
   */
  private getFormatPrompt(questionType: QuizQuestionType): string {
    const baseFormat = `
Respond with a JSON object in this exact format:
{
  "questionText": "Your question here",
  "correctAnswer": "The correct answer",
  "explanation": "Detailed explanation referencing source content and page numbers"`;

    const typeSpecificFormat = {
      mcq: `,
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]`,
      truefalse: '',
      fillblank: `,
  "blanks": ["answer1", "answer2"]`
    };

    return baseFormat + typeSpecificFormat[questionType] + '\n}';
  }

  /**
   * Call AI API with retry logic and timeout
   */
  private async callAIAPI(promptConfig: PromptConfig): Promise<any> {
    const messages = [
      { role: 'system', content: promptConfig.systemPrompt },
      { 
        role: 'user', 
        content: `${promptConfig.questionTypePrompt}\n\n${promptConfig.difficultyPrompt}\n\n${promptConfig.contextPrompt}\n\n${promptConfig.formatPrompt}`
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: RAGQuizGenerationService.DEFAULT_AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(RAGQuizGenerationService.GENERATION_TIMEOUT)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI API');
    }

    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return {
      ...parsedContent,
      usage: data.usage
    };
  }

  /**
   * Parse and validate AI response
   */
  private parseQuestionResponse(
    response: any,
    questionType: QuizQuestionType,
    difficulty: QuizDifficulty,
    orderIndex: number
  ): Omit<QuizQuestion, 'id' | 'quizId' | 'createdAt'> | null {
    try {
      if (!response.questionText || !response.correctAnswer || !response.explanation) {
        return null;
      }

      const baseQuestion = {
        questionText: response.questionText,
        questionType,
        correctAnswer: response.correctAnswer,
        explanation: response.explanation,
        difficulty,
        orderIndex,
        sourceChunks: [], // Will be filled later
        sourcePages: [], // Will be filled later
        confidenceScore: undefined // Will be calculated later
      };

      // Add type-specific fields
      if (questionType === 'mcq' && response.options && Array.isArray(response.options)) {
        return {
          ...baseQuestion,
          options: response.options
        };
      } else if (questionType === 'truefalse') {
        return baseQuestion;
      } else if (questionType === 'fillblank' && response.blanks) {
        return {
          ...baseQuestion,
          options: Array.isArray(response.blanks) ? response.blanks : [response.blanks]
        };
      }

      return baseQuestion;
    } catch (error) {
      console.error('Error parsing question response:', error);
      return null;
    }
  }

  /**
   * Calculate question quality score
   */
  private calculateQuestionQuality(
    question: Omit<QuizQuestion, 'id' | 'quizId' | 'createdAt'>,
    sourceChunks: ChunkReference[],
    questionType: QuizQuestionType
  ): number {
    let score = 0.5; // Base score

    // Question text quality
    if (question.questionText.length > 20 && question.questionText.length < 200) {
      score += 0.15;
    }

    // Explanation quality
    if (question.explanation.length > 50) {
      score += 0.15;
    }

    // Source reference in explanation
    if (question.explanation.toLowerCase().includes('page')) {
      score += 0.1;
    }

    // Type-specific quality checks
    if (questionType === 'mcq' && question.options && question.options.length === 4) {
      score += 0.1;
    }

    // Source chunk relevance
    const avgRelevance = sourceChunks.reduce((sum, chunk) => sum + chunk.relevanceScore, 0) / sourceChunks.length;
    score += avgRelevance * 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Validate and filter questions by quality
   */
  private validateAndFilterQuestions(
    questionResults: QuestionGenerationResult[],
    targetCount: number
  ): QuestionGenerationResult[] {
    // Filter by minimum quality score
    const qualityFiltered = questionResults.filter(
      result => result.qualityScore >= RAGQuizGenerationService.MIN_QUALITY_SCORE
    );

    // Sort by quality score (descending)
    qualityFiltered.sort((a, b) => b.qualityScore - a.qualityScore);

    // Return top questions up to target count
    return qualityFiltered.slice(0, targetCount);
  }

  /**
   * Create quiz record in database
   */
  private async createQuizRecord(
    quizId: string,
    request: RAGQuizGenerationRequest,
    questionResults: QuestionGenerationResult[]
  ): Promise<Quiz> {
    const client = await getAuthenticatedSupabaseClient();

    const quiz: Omit<Quiz, 'createdAt' | 'updatedAt'> = {
      id: quizId,
      userId: '', // Will be set by RLS
      title: request.title || `Quiz from ${request.documentIds.length} document(s)`,
      sourceDocumentIds: request.documentIds,
      pageRange: request.pageRange,
      questionCount: questionResults.length,
      difficulty: request.difficulty,
      questionTypes: request.questionTypes,
      notes: request.notes,
      focusAreas: request.focusAreas,
      learningObjectives: request.learningObjectives,
      generationMethod: 'rag',
      metadata: this.createEmptyMetadata() // Will be updated later
    };

    const { data, error } = await client
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quiz record: ${error.message}`);
    }

    return data;
  }

  /**
   * Store questions with source mappings
   */
  private async storeQuestionsWithSources(
    quizId: string,
    questionResults: QuestionGenerationResult[]
  ): Promise<QuizQuestion[]> {
    const client = await getAuthenticatedSupabaseClient();
    const questions: QuizQuestion[] = [];

    for (const result of questionResults) {
      const questionId = uuidv4();
      
      // Prepare question data
      const questionData = {
        id: questionId,
        quiz_id: quizId,
        question_text: result.question.questionText,
        question_type: result.question.questionType,
        options: result.question.options || null,
        correct_answer: result.question.correctAnswer,
        explanation: result.question.explanation,
        difficulty: result.question.difficulty,
        order_index: result.question.orderIndex,
        source_chunks: result.sourceChunks.map(chunk => chunk.chunkId),
        source_pages: result.sourceChunks.map(chunk => chunk.pageNumber),
        confidence_score: result.qualityScore
      };

      // Insert question
      const { data: questionData_inserted, error: questionError } = await client
        .from('quiz_questions')
        .insert(questionData)
        .select()
        .single();

      if (questionError) {
        throw new Error(`Failed to insert question: ${questionError.message}`);
      }

      // Insert source mappings
      const sourceMappings = result.sourceChunks.map(chunk => ({
        question_id: questionId,
        chunk_id: chunk.chunkId,
        relevance_score: chunk.relevanceScore,
        usage_type: 'primary' as const
      }));

      const { error: mappingError } = await client
        .from('question_chunk_sources')
        .insert(sourceMappings);

      if (mappingError) {
        console.error('Failed to insert source mappings:', mappingError);
        // Continue without failing the entire operation
      }

      // Convert to QuizQuestion format
      questions.push({
        id: questionId,
        quizId,
        questionText: result.question.questionText,
        questionType: result.question.questionType,
        options: result.question.options,
        correctAnswer: result.question.correctAnswer,
        explanation: result.question.explanation,
        difficulty: result.question.difficulty,
        orderIndex: result.question.orderIndex,
        sourceChunks: result.sourceChunks.map(chunk => chunk.chunkId),
        sourcePages: result.sourceChunks.map(chunk => chunk.pageNumber),
        confidenceScore: result.qualityScore,
        createdAt: new Date().toISOString()
      });
    }

    return questions;
  }

  /**
   * Create quiz metadata
   */
  private createQuizMetadata(
    searchResult: any,
    questionResults: QuestionGenerationResult[],
    queryResult: QueryConstructionResult,
    generationTime: number
  ): RAGQuizMetadata {
    const documentTitles = Array.from(
      new Set(
        questionResults.flatMap(result => 
          result.sourceChunks.map(chunk => chunk.documentTitle)
        )
      )
    );

    const totalChunksSearched = searchResult.results?.length || 0;
    const averageRelevanceScore = questionResults.length > 0
      ? questionResults.reduce((sum, result) => 
          sum + (result.sourceChunks.reduce((chunkSum, chunk) => chunkSum + chunk.relevanceScore, 0) / result.sourceChunks.length)
        , 0) / questionResults.length
      : 0;

    return {
      sourceDocumentTitles: documentTitles,
      totalChunksSearched,
      averageRelevanceScore,
      generationTime,
      aiModel: RAGQuizGenerationService.DEFAULT_AI_MODEL,
      embeddingModel: 'deepseek-chat', // From embedding service
      searchQuery: queryResult.searchQuery,
      retrievalMethod: 'vector_similarity'
    };
  }

  /**
   * Extract source chunks from question results
   */
  private extractSourceChunks(questionResults: QuestionGenerationResult[]): ChunkReference[] {
    const allChunks = questionResults.flatMap(result => result.sourceChunks);
    
    // Remove duplicates
    const uniqueChunks = allChunks.filter((chunk, index, array) => 
      array.findIndex(c => c.chunkId === chunk.chunkId) === index
    );

    return uniqueChunks;
  }

  /**
   * Create empty metadata for error cases
   */
  private createEmptyMetadata(): RAGQuizMetadata {
    return {
      sourceDocumentTitles: [],
      totalChunksSearched: 0,
      averageRelevanceScore: 0,
      generationTime: 0,
      aiModel: RAGQuizGenerationService.DEFAULT_AI_MODEL,
      embeddingModel: 'deepseek-chat',
      searchQuery: '',
      retrievalMethod: 'vector_similarity'
    };
  }
}

// Export singleton instance - lazy initialization to avoid environment variable issues during testing
let _ragQuizGenerationService: RAGQuizGenerationService | null = null;

export const ragQuizGenerationService = {
  getInstance(): RAGQuizGenerationService {
    if (!_ragQuizGenerationService) {
      _ragQuizGenerationService = new RAGQuizGenerationService();
    }
    return _ragQuizGenerationService;
  },
  
  // For testing purposes
  setInstance(instance: RAGQuizGenerationService): void {
    _ragQuizGenerationService = instance;
  }
};