# RAG Quiz Generation Service

The RAG (Retrieval-Augmented Generation) Quiz Generation Service is an advanced AI-powered system that creates intelligent, contextual quiz questions from processed PDF documents using semantic search and vector embeddings.

## Overview

This service transforms PDF documents into interactive quizzes by:

1. **Query Construction**: Building search queries from user parameters, notes, and learning objectives
2. **Semantic Search**: Using vector similarity to find the most relevant content chunks
3. **Multi-Document Synthesis**: Coordinating content across multiple documents for comprehensive coverage
4. **Context-Aware Generation**: Creating questions using AI with document-specific context
5. **Quality Validation**: Ensuring generated questions meet educational standards
6. **Source Attribution**: Tracking which document chunks were used for each question

## Key Features

### Advanced Query Construction
- Combines user notes, focus areas, and learning objectives
- Adds contextual hints based on question types and difficulty levels
- Calculates confidence scores for query completeness

### Intelligent Content Retrieval
- Uses vector similarity search to find relevant content
- Balances results across multiple documents
- Filters by page ranges and content types
- Applies hybrid ranking algorithms

### Context-Aware Prompt Engineering
- Different prompts for MCQ, True/False, and Fill-in-the-Blank questions
- Difficulty-specific prompt adjustments
- Source attribution in explanations
- Structured JSON response format

### Quality Assurance
- Validates question structure and content
- Calculates quality scores based on multiple factors
- Filters questions below minimum quality threshold
- Tracks AI confidence scores

### Multi-Document Support
- Synthesizes content across multiple documents
- Ensures balanced representation from each source
- Handles cross-document content coordination
- Maintains document attribution

## Usage

### Basic Quiz Generation

```typescript
import { ragQuizGenerationService } from '@/lib/services/rag-quiz-generation-service';

const request = {
  documentIds: ['doc1-uuid', 'doc2-uuid'],
  questionCount: 10,
  difficulty: 'medium',
  questionTypes: ['mcq', 'truefalse'],
  notes: 'Focus on key concepts and definitions',
  focusAreas: ['introduction', 'main principles'],
  learningObjectives: ['understand basics', 'apply concepts']
};

const result = await ragQuizGenerationService.getInstance().generateRAGQuiz(request);

if (result.success) {
  console.log(`Generated ${result.questions.length} questions`);
  console.log(`Quiz ID: ${result.quizId}`);
  console.log(`Source chunks used: ${result.sourceChunks.length}`);
} else {
  console.error('Quiz generation failed:', result.error);
}
```

### Advanced Configuration

```typescript
const advancedRequest = {
  documentIds: ['doc1', 'doc2', 'doc3'],
  pageRange: { start: 10, end: 25 }, // Specific page range
  questionCount: 15,
  difficulty: 'hard',
  questionTypes: ['mcq', 'truefalse', 'fillblank'],
  title: 'Advanced Concepts Quiz',
  notes: 'Focus on complex relationships and applications',
  focusAreas: [
    'advanced algorithms',
    'performance optimization',
    'system design'
  ],
  learningObjectives: [
    'analyze complex systems',
    'evaluate trade-offs',
    'synthesize solutions'
  ]
};
```

## Request Parameters

### Required Parameters

- `documentIds: string[]` - Array of processed document IDs
- `questionCount: number` - Number of questions to generate (1-50)
- `difficulty: 'easy' | 'medium' | 'hard'` - Question difficulty level
- `questionTypes: ('mcq' | 'truefalse' | 'fillblank')[]` - Types of questions to generate

### Optional Parameters

- `pageRange?: { start: number; end: number }` - Limit content to specific pages
- `title?: string` - Custom quiz title
- `notes?: string` - Additional context and instructions
- `focusAreas?: string[]` - Specific topics to emphasize
- `learningObjectives?: string[]` - Educational goals for the quiz

## Response Format

### Successful Response

```typescript
interface RAGQuizGenerationResponse {
  success: true;
  quizId: string;
  questions: QuizQuestion[];
  metadata: RAGQuizMetadata;
  sourceChunks: ChunkReference[];
}
```

### Error Response

```typescript
interface RAGQuizGenerationResponse {
  success: false;
  quizId: '';
  questions: [];
  metadata: RAGQuizMetadata;
  sourceChunks: [];
  error: string;
}
```

## Question Types

### Multiple Choice Questions (MCQ)
- 4 answer options (A, B, C, D)
- Exactly one correct answer
- Plausible but incorrect distractors
- Detailed explanations with source references

### True/False Questions
- Clear, unambiguous statements
- Based on factual information from source content
- Verifiable from the provided material

### Fill-in-the-Blank Questions
- 1-3 blanks per question
- Focus on key terms and concepts
- Essential knowledge, not trivial details

## Quality Metrics

The service calculates quality scores based on:

- **Question Text Quality**: Length and clarity (15% weight)
- **Explanation Quality**: Detailed explanations (15% weight)
- **Source References**: Page number citations (10% weight)
- **Type-Specific Validation**: Format compliance (10% weight)
- **Source Relevance**: Average chunk relevance scores (10% weight)

Minimum quality threshold: 0.6 (60%)

## Metadata Tracking

Each generated quiz includes comprehensive metadata:

```typescript
interface RAGQuizMetadata {
  sourceDocumentTitles: string[];
  totalChunksSearched: number;
  averageRelevanceScore: number;
  generationTime: number;
  aiModel: string;
  embeddingModel: string;
  searchQuery: string;
  retrievalMethod: 'vector_similarity' | 'hybrid';
}
```

## Error Handling

The service handles various error conditions:

- **No Relevant Content**: When vector search returns no results
- **API Failures**: OpenAI API errors with retry logic
- **Quality Issues**: When generated questions don't meet standards
- **Database Errors**: Supabase connection and storage issues

## Performance Considerations

### Optimization Features
- Vector search caching
- Batch processing for multiple questions
- Timeout management (60 seconds per generation)
- Retry logic with exponential backoff

### Scalability
- Supports multiple documents simultaneously
- Efficient chunk selection algorithms
- Memory-conscious processing
- Background processing capability

## Dependencies

### Required Services
- **Vector Search Service**: For semantic content retrieval
- **Embedding Service**: For query vectorization
- **Supabase Client**: For database operations
- **OpenAI API**: For question generation

### Environment Variables
- `OPENAI_API_KEY`: Required for AI question generation

## Testing

The service includes comprehensive tests covering:

- Constructor validation
- Query construction logic
- Question type selection
- Quality validation
- Error handling scenarios

Run tests with:
```bash
npm test -- lib/services/__tests__/rag-quiz-generation-service.test.ts
```

## Configuration

### Default Settings
- Similarity threshold: 0.75
- Chunks per question: 3-5
- Minimum quality score: 0.6
- AI model: GPT-4
- Generation timeout: 60 seconds
- Max retry attempts: 3

### Customization
The service can be customized by modifying the class constants or providing configuration through the constructor.

## Integration

### With Quiz API Endpoints
```typescript
// In API route
import { ragQuizGenerationService } from '@/lib/services/rag-quiz-generation-service';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await ragQuizGenerationService.getInstance().generateRAGQuiz(body);
  return NextResponse.json(result);
}
```

### With Frontend Components
```typescript
// In React component
const [generateQuiz] = useGenerateRAGQuizMutation();

const handleGenerate = async () => {
  try {
    const result = await generateQuiz(quizConfig).unwrap();
    // Handle successful generation
  } catch (error) {
    // Handle error
  }
};
```

## Future Enhancements

Planned improvements include:

- Support for additional question types (short answer, essay)
- Advanced difficulty calibration
- Multi-language support
- Custom prompt templates
- Question bank management
- Performance analytics
- A/B testing for prompt optimization

## Troubleshooting

### Common Issues

1. **"No relevant content found"**
   - Check if documents are properly processed
   - Verify page ranges are valid
   - Ensure search query has sufficient context

2. **"Failed to generate questions meeting quality standards"**
   - Lower the minimum quality threshold
   - Provide more specific notes and focus areas
   - Check source document content quality

3. **API timeout errors**
   - Reduce question count
   - Simplify focus areas
   - Check OpenAI API status

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG_RAG_QUIZ=true
```

This will log query construction, search results, and generation attempts for troubleshooting.