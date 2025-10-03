# Quiz RTK Query Integration

This document describes the enhanced RTK Query integration for quiz data management, implementing comprehensive cache invalidation strategies, optimistic updates, and typed hooks for better developer experience.

## Implementation Overview

### Enhanced API Slice

The `apiSlice.ts` has been updated with comprehensive quiz endpoints:

#### Document Processing
- `processDocument` - Process PDFs for RAG quiz generation
- `getProcessingStatus` - Track processing status with automatic polling
- `searchContent` - Vector search for content retrieval

#### Quiz Management
- `generateQuiz` - RAG-enhanced quiz generation with optimistic updates
- `getQuizzes` - List quizzes with pagination, filtering, and statistics
- `getQuiz` - Get single quiz with questions and attempts
- `updateQuiz` - Update quiz metadata with optimistic updates
- `deleteQuiz` - Delete quiz with optimistic updates

#### Quiz Attempts
- `submitQuizAttempt` - Submit quiz attempt with detailed results
- ~~`getQuizHistory`~~ - [Removed] Quiz history functionality removed

#### Status Tracking
- `getQuizGenerationStatus` - Track quiz generation progress with polling

### Typed Hooks (`quizHooks.ts`)

Enhanced hooks providing better developer experience:

#### Generation Hooks
- `useQuizGeneration()` - Quiz generation with progress tracking
- `useDocumentProcessing()` - Document processing with status tracking
- `useContentSearch()` - Content search with caching

#### Management Hooks
- `useQuizList(options)` - Quiz list with filtering and computed statistics
- `useQuizDetails(quizId)` - Quiz details with metadata
- `useQuizOperations()` - Quiz operations with optimistic updates

#### Attempt Hooks
- `useQuizAttempts()` - Quiz attempts with detailed results
- ~~`useQuizHistory(options)`~~ - [Removed] Analytics functionality removed

#### Status Hooks
- `useProcessingStatus(statusId)` - Processing status with automatic polling
- `useQuizGenerationStatus(generationId)` - Generation status with polling

#### Utility Hooks
- `useQuizUtils()` - Quiz validation and scoring utilities
- `useQuizAnalytics(quizzes, attempts)` - Basic quiz utilities

## Key Features

### Cache Invalidation Strategies

Comprehensive tag-based cache invalidation:

```typescript
// Quiz generation invalidates list and statistics
invalidatesTags: [
  { type: "Quiz", id: "LIST" },
  { type: "Quiz", id: "STATISTICS" }
]

// Quiz updates invalidate specific quiz and list
invalidatesTags: (result, error, { id }) => [
  { type: "Quiz", id },
  { type: "Quiz", id: "LIST" },
]
```

### Optimistic Updates

Better user experience with optimistic updates:

```typescript
// Quiz generation optimistically adds to list
async onQueryStarted(quizData, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;
    
    dispatch(
      apiSlice.util.updateQueryData('getQuizzes', undefined, (draft) => {
        if (draft?.quizzes) {
          const newQuiz = { /* optimistic quiz data */ };
          draft.quizzes.unshift(newQuiz);
          draft.totalCount += 1;
        }
      })
    );
  } catch (error) {
    // Optimistic update reverted automatically
  }
}
```

### Automatic Polling

Status tracking with intelligent polling:

```typescript
// Poll every 2 seconds for active processing
pollingInterval: (result) => {
  if (result?.status === "processing" || result?.status === "pending") {
    return 2000;
  }
  return 0; // Stop polling when completed
},
```

### Enhanced Error Handling

Comprehensive error handling with user-friendly messages:

```typescript
transformErrorResponse: (response: any) => {
  const context = { component: "QuizGenerator", action: "generate" };

  if (response.status === 429) {
    return createAppError(
      ErrorType.RATE_LIMIT_ERROR,
      "Rate limit exceeded. Please try again later.",
      context
    );
  }

  return mapErrorToAppError(response, context);
}
```

## Usage Examples

### Basic Quiz Generation

```typescript
import { useQuizGeneration } from '@/lib/store/hooks';

function QuizGenerator() {
  const { generateQuiz, isGenerating, generationError } = useQuizGeneration();

  const handleGenerate = async () => {
    const result = await generateQuiz({
      documentIds: ['doc-1'],
      questionCount: 10,
      difficulty: 'medium',
      questionTypes: ['mcq', 'truefalse'],
      notes: 'Focus on key concepts',
    });

    if (result.success) {
      console.log('Quiz generated:', result.quizId);
    } else {
      console.error('Generation failed:', result.error);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate Quiz'}
    </button>
  );
}
```

### Quiz List with Filtering

```typescript
import { useQuizList } from '@/lib/store/hooks';

function QuizList() {
  const { 
    quizzes, 
    totalCount, 
    statistics, 
    isLoading 
  } = useQuizList({
    difficulty: 'medium',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Quizzes ({totalCount})</h2>
      <p>Average Score: {statistics?.averageScoreFormatted}</p>
      {quizzes.map(quiz => (
        <div key={quiz.id}>{quiz.title}</div>
      ))}
    </div>
  );
}
```

### Quiz Details with Metadata

```typescript
import { useQuizDetails } from '@/lib/store/hooks';

function QuizDetails({ quizId }: { quizId: string }) {
  const { 
    quiz, 
    questions, 
    attempts, 
    isLoading 
  } = useQuizDetails(quizId);

  if (isLoading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>Questions: {questions.length}</p>
      <p>Attempts: {attempts.length}</p>
      <p>Difficulty: {quiz.difficulty}</p>
      <p>Question Types: {quiz.questionTypes.join(', ')}</p>
    </div>
  );
}
```

### Quiz Operations

```typescript
import { useQuizOperations } from '@/lib/store/hooks';

function QuizActions({ quizId }: { quizId: string }) {
  const { 
    updateQuiz, 
    deleteQuiz, 
    isUpdating, 
    isDeleting 
  } = useQuizOperations();

  const handleUpdate = async () => {
    const result = await updateQuiz(quizId, {
      title: 'Updated Quiz Title',
      notes: 'Updated notes',
    });

    if (result.success) {
      console.log('Quiz updated');
    }
  };

  const handleDelete = async () => {
    const result = await deleteQuiz(quizId);
    
    if (result.success) {
      console.log('Quiz deleted');
    }
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update Quiz'}
      </button>
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Quiz'}
      </button>
    </div>
  );
}
```

### Quiz Attempts

```typescript
import { useQuizAttempts } from '@/lib/store/hooks';

function QuizPlayer({ quizId, questions }: { quizId: string, questions: QuizQuestion[] }) {
  const { submitQuizAttempt, isSubmitting } = useQuizAttempts();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const result = await submitQuizAttempt(quizId, answers, 120); // 2 minutes

    if (result.success) {
      console.log('Score:', result.score);
      console.log('Results:', result.results);
    }
  };

  return (
    <div>
      {/* Quiz questions UI */}
      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
```

### Status Tracking

```typescript
import { useProcessingStatus, useQuizGenerationStatus } from '@/lib/store/hooks';

function ProcessingTracker({ statusId }: { statusId: string }) {
  const { 
    isProcessing, 
    isCompleted, 
    progressPercentage 
  } = useProcessingStatus(statusId);

  if (isCompleted) return <div>Processing complete!</div>;
  if (isProcessing) return <div>Progress: {progressPercentage}%</div>;
  
  return <div>Waiting...</div>;
}

function GenerationTracker({ generationId }: { generationId: string }) {
  const { 
    isGenerating, 
    currentStep, 
    estimatedTimeRemaining 
  } = useQuizGenerationStatus(generationId);

  if (isGenerating) {
    return (
      <div>
        <p>Step: {currentStep}</p>
        <p>ETA: {estimatedTimeRemaining}s</p>
      </div>
    );
  }

  return <div>Generation complete!</div>;
}
```

## Benefits

1. **Type Safety** - Full TypeScript support with proper interfaces
2. **Better UX** - Optimistic updates and intelligent polling
3. **Cache Management** - Automatic cache invalidation and synchronization
4. **Error Handling** - Comprehensive error handling with user-friendly messages
5. **Performance** - Efficient data fetching and caching strategies
6. **Developer Experience** - Enhanced hooks with computed values and utilities

## Requirements Satisfied

- ✅ **1.1** - Quiz generation interface with document selection
- ✅ **6.1** - Quiz result persistence and retrieval
- ✅ **6.2** - Quiz system modularization (analytics removed)

The implementation provides a complete RTK Query integration for quiz data management with enhanced developer experience, better performance, and comprehensive error handling.