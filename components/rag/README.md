# RAG System Components

This directory contains components for the Retrieval-Augmented Generation (RAG) system that powers intelligent quiz generation and content discovery in the Noto application.

## Overview

The RAG system provides advanced AI-powered features for document analysis, quiz generation, and content search. It combines document processing, vector search, and large language models to create intelligent, context-aware functionality.

## Components

### Core RAG Components

#### SimpleFeedbackForm.tsx ✅ IMPLEMENTED
User feedback collection component for RAG system performance monitoring and continuous improvement with real-time analytics.

**Features:**
- Star rating system (1-5 stars) for user experience evaluation with visual feedback
- Text feedback collection for detailed user insights and improvement suggestions
- Support for different feedback types: 'quiz', 'search', 'general' with contextual prompts
- Integration with `/api/rag/monitoring` for feedback storage and analytics processing
- Form validation and error handling with user-friendly messages
- Loading states and success notifications with visual confirmation
- Real-time feedback analytics and performance impact tracking
- Mobile-responsive design with touch-friendly interactions

**Usage:**
```typescript
import { SimpleFeedbackForm } from '@/components/rag/SimpleFeedbackForm';

<SimpleFeedbackForm
  feedbackType="quiz"
  targetId="quiz-123"
  onSubmitted={() => console.log('Feedback submitted')}
/>
```

**Props:**
- `feedbackType`: Type of feedback ('quiz' | 'search' | 'general')
- `targetId`: ID of the target entity (quiz ID, search session ID, etc.)
- `onSubmitted?`: Optional callback when feedback is successfully submitted

#### RAGSearchInterface.tsx 🚧 PLANNED
Advanced search interface for RAG-based content discovery and semantic search.

**Planned Features:**
- Semantic search across document collections
- Advanced filtering options (content type, relevance, confidence)
- Real-time search suggestions and auto-complete
- Search result ranking and relevance scoring
- Integration with vector search backend
- Mobile-responsive design with touch-friendly interactions

#### RAGResultsDisplay.tsx 🚧 PLANNED
Display component for RAG search results with relevance scoring and content previews.

**Planned Features:**
- Search result cards with content previews
- Relevance score visualization
- Source document attribution
- Expandable content sections
- Pagination and infinite scroll
- Export and sharing capabilities

#### RAGMonitoringDashboard.tsx 🚧 PLANNED
Performance monitoring and analytics dashboard for RAG operations.

**Planned Features:**
- Real-time performance metrics
- User feedback analytics
- Search query analysis
- System health monitoring
- Performance optimization recommendations
- Historical trend analysis

## API Integration

### RAG Endpoints

The RAG components integrate with several API endpoints:

#### `/api/quiz/generate-rag` ✅ IMPLEMENTED
- **Method**: POST
- **Purpose**: Generate quizzes using RAG-based content analysis
- **Features**: Multi-document support, difficulty configuration, question type selection
- **Integration**: Used by `MobileQuizGeneratorInterface` and quiz generation components

#### `/api/quiz/advanced-search` ✅ IMPLEMENTED
- **Method**: POST
- **Purpose**: Advanced semantic search across document chunks
- **Features**: Content type filtering, relevance scoring, confidence thresholds
- **Integration**: Backend support for RAG search functionality

#### `/api/rag/monitoring` ✅ IMPLEMENTED
- **Method**: POST
- **Purpose**: Collect user feedback and performance metrics
- **Features**: Feedback storage, performance tracking, analytics data collection
- **Integration**: Used by `SimpleFeedbackForm` for feedback submission

#### `/api/quiz/history` ✅ IMPLEMENTED
- **Method**: GET
- **Purpose**: Retrieve quiz attempt history and performance analytics
- **Features**: Statistical analysis, improvement trends, performance insights
- **Integration**: Supports RAG performance monitoring and user analytics

## State Management

### Redux Integration

RAG components integrate with the Redux store for state management:

```typescript
// RAG-related state slices
interface RAGState {
  searchResults: SearchResult[];
  feedbackSubmissions: FeedbackSubmission[];
  performanceMetrics: PerformanceMetrics;
  isSearching: boolean;
  searchError: string | null;
}
```

### RTK Query Integration

All RAG API calls use RTK Query for consistent caching and state management:

```typescript
// Example RTK Query hooks for RAG operations
const { data: searchResults, isLoading } = useRAGSearchQuery(searchParams);
const [submitFeedback] = useSubmitFeedbackMutation();
const { data: metrics } = useRAGMetricsQuery();
```

## Mobile Optimization

### Responsive Design
- Touch-friendly interfaces for mobile devices
- Adaptive layouts for different screen sizes
- Mobile-specific interaction patterns
- Optimized performance for mobile networks

### Mobile-Specific Features
- Swipe gestures for navigation
- Touch-optimized search interfaces
- Mobile keyboard optimization
- Offline capability planning

## Performance Considerations

### Optimization Strategies
- Debounced search queries to reduce API calls
- Lazy loading of search results and content
- Caching of frequently accessed data
- Progressive loading for large result sets

### Monitoring and Analytics
- Real-time performance tracking
- User interaction analytics
- Search query optimization
- Feedback-driven improvements

## Error Handling

### Error Boundaries
RAG components implement comprehensive error handling:

```typescript
// RAG-specific error boundary
<RAGErrorBoundary>
  <SimpleFeedbackForm />
</RAGErrorBoundary>
```

### Error Recovery
- Graceful degradation for API failures
- Retry mechanisms for transient errors
- User-friendly error messages
- Fallback content and functionality

## Testing Strategy

### Component Testing
- Unit tests for individual RAG components
- Integration tests for API interactions
- Mock implementations for external services
- Accessibility testing for all interfaces

### Performance Testing
- Load testing for search operations
- Response time monitoring
- Memory usage optimization
- Mobile performance validation

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Enhanced performance monitoring and user behavior analysis
2. **Collaborative Features**: Shared search sessions and collaborative quiz creation
3. **AI Model Integration**: Support for multiple AI models and providers
4. **Personalization**: User-specific recommendations and adaptive interfaces
5. **Offline Support**: Cached search results and offline functionality

### Integration Opportunities
- Integration with external knowledge bases
- Support for additional document formats
- Real-time collaboration features
- Advanced AI model fine-tuning

## Development Guidelines

### Code Standards
- Follow established TypeScript patterns
- Use proper error handling and validation
- Implement comprehensive logging
- Maintain consistent naming conventions

### Component Architecture
- Keep components focused and single-responsibility
- Use composition over inheritance
- Implement proper prop interfaces
- Follow established styling patterns

### API Integration
- Always use RTK Query for API calls
- Implement proper error handling
- Use consistent response formats
- Follow authentication patterns

## Contributing

When contributing to RAG components:

1. **Follow Patterns**: Use established component and API patterns
2. **Test Thoroughly**: Include unit and integration tests
3. **Document Changes**: Update documentation for new features
4. **Performance**: Consider mobile and performance implications
5. **Accessibility**: Ensure components are accessible and inclusive

## Related Documentation

- **[Quiz Components](../quiz/README.md)** - Quiz generation system integration
- **[API Documentation](../../docs/API_DOCUMENTATION.md)** - Complete API reference
- **[State Management](../../lib/store/README.md)** - Redux and RTK Query patterns
- **[Testing Strategy](../../test/README.md)** - Testing guidelines and coverage

---

**Last Updated**: January 2025  
**Status**: Core feedback system implemented, advanced features planned  
**Next Phase**: RAG search interface and monitoring dashboard implementation